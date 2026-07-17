import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../services/context.js';
import type { TransferEngine } from '../services/transfers.js';
import { TransferRejected } from '../services/transfers.js';
import { GatewayError } from '../gateway/errors.js';
import { SESSION_COOKIE, requireEngineer } from './auth.js';
import * as users from '../services/users.js';
import * as gw from '../services/gateways.js';
import * as lib from '../services/library.js';
import * as asg from '../services/assignments.js';
import * as mf from '../services/machineFiles.js';
import * as drift from '../services/drift.js';
import * as backups from '../services/backups.js';
import { audit, queryAudit } from '../services/audit.js';
import { machineCapabilities } from '../services/assignments.js';
import type { Machine } from '../domain/types.js';

interface Deps {
  ctx: AppContext;
  engine: TransferEngine;
}

function machineView(ctx: AppContext, m: Machine) {
  return { ...m, capabilities: machineCapabilities(m), label: asg.machineLabel(ctx, m) };
}

export function registerRoutes(app: FastifyInstance, { ctx, engine }: Deps): void {
  app.setErrorHandler((err: unknown, _req, reply) => {
    if (err instanceof TransferRejected) {
      return reply.code(409).send({ error: err.message, explanation: err.explanation, needsConfirmation: err.needsConfirmation });
    }
    if (err instanceof GatewayError) {
      return reply.code(502).send({ error: 'gateway_error', errorCode: err.errorCode, errorMsg: err.errorMsg, explanation: err.explanation });
    }
    const e = err as { statusCode?: number; message?: string };
    const status = typeof e.statusCode === 'number' && e.statusCode >= 400 ? e.statusCode : 400;
    return reply.code(status).send({ error: e.message ?? 'error' });
  });

  // ---- Auth ----

  app.post('/api/auth/login', async (req, reply) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    if (!username || !password) return reply.code(400).send({ error: 'username and password required' });
    const result = users.login(ctx, username, password);
    if (!result) return reply.code(401).send({ error: 'invalid_credentials' });
    audit(ctx, { username, action: 'login' });
    reply.setCookie(SESSION_COOKIE, result.token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { user: result.user };
  });

  app.post('/api/auth/logout', async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) users.logout(ctx, token);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  app.get('/api/auth/me', async (req) => ({ user: req.user }));

  // ---- Users (engineer) ----

  app.get('/api/users', { preHandler: requireEngineer }, async () => users.listUsers(ctx));

  app.post('/api/users', { preHandler: requireEngineer }, async (req, reply) => {
    const { username, password, role } = (req.body ?? {}) as { username?: string; password?: string; role?: string };
    if (!username || !password || (role !== 'engineer' && role !== 'operator')) {
      return reply.code(400).send({ error: 'username, password and role (engineer|operator) required' });
    }
    const user = users.createUser(ctx, username, password, role);
    audit(ctx, { username: req.user.username, action: 'user_create', detail: `${username} (${role})` });
    return user;
  });

  app.patch('/api/users/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const patch = (req.body ?? {}) as { role?: 'engineer' | 'operator'; isActive?: boolean; password?: string };
    const user = users.updateUser(ctx, id, patch);
    if (!user) return reply.code(404).send({ error: 'not_found' });
    audit(ctx, { username: req.user.username, action: 'user_update', detail: `${user.username}: ${Object.keys(patch).join(', ')}` });
    return user;
  });

  // ---- Gateways (engineer manages; anyone may see health) ----

  app.get('/api/gateways', async () => gw.listGateways(ctx));

  app.post('/api/gateways', { preHandler: requireEngineer }, async (req, reply) => {
    const { name, baseUrl, apiKey } = (req.body ?? {}) as { name?: string; baseUrl?: string; apiKey?: string };
    if (!name || !baseUrl) return reply.code(400).send({ error: 'name and baseUrl required' });
    const created = gw.createGateway(ctx, { name, baseUrl, apiKey });
    audit(ctx, { username: req.user.username, action: 'gateway_create', gatewayId: created.id, detail: `${name} (${baseUrl})` });
    return created;
  });

  app.patch('/api/gateways/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const updated = gw.updateGateway(ctx, id, (req.body ?? {}) as Parameters<typeof gw.updateGateway>[2]);
    if (!updated) return reply.code(404).send({ error: 'not_found' });
    audit(ctx, { username: req.user.username, action: 'gateway_update', gatewayId: id });
    return updated;
  });

  app.delete('/api/gateways/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!gw.deleteGateway(ctx, id)) return reply.code(404).send({ error: 'not_found' });
    audit(ctx, { username: req.user.username, action: 'gateway_delete', gatewayId: id });
    return { ok: true };
  });

  app.post('/api/gateways/:id/sync', { preHandler: requireEngineer }, async (req) => {
    const id = Number((req.params as { id: string }).id);
    const result = await gw.syncGateway(ctx, id);
    audit(ctx, { username: req.user.username, action: 'registry_sync', gatewayId: id, detail: `${result.machines} machines, ${result.groups} groups` });
    return result;
  });

  // ---- Machines & groups ----

  app.get('/api/machines', async () => {
    const rows = ctx.db.prepare('SELECT id FROM machines WHERE removed_at IS NULL ORDER BY gateway_id, machine_id').all() as Array<{ id: number }>;
    return rows.map((r) => machineView(ctx, gw.getMachine(ctx, r.id)!));
  });

  app.get('/api/machines/:id', async (req, reply) => {
    const m = gw.getMachine(ctx, Number((req.params as { id: string }).id));
    if (!m) return reply.code(404).send({ error: 'not_found' });
    return machineView(ctx, m);
  });

  app.patch('/api/machines/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const m = gw.getMachine(ctx, id);
    if (!m) return reply.code(404).send({ error: 'not_found' });
    const patch = (req.body ?? {}) as {
      displayName?: string | null; verifyOnPush?: boolean; configuredRootDir?: string | null;
      backupIntervalMinutes?: number | null; backupRetentionCount?: number; driftIntervalMinutes?: number | null;
    };
    if (patch.displayName !== undefined) ctx.db.prepare('UPDATE machines SET display_name = ? WHERE id = ?').run(patch.displayName, id);
    if (patch.verifyOnPush !== undefined) ctx.db.prepare('UPDATE machines SET verify_on_push = ? WHERE id = ?').run(patch.verifyOnPush ? 1 : 0, id);
    if (patch.configuredRootDir !== undefined) ctx.db.prepare('UPDATE machines SET configured_root_dir = ? WHERE id = ?').run(patch.configuredRootDir, id);
    if (patch.backupIntervalMinutes !== undefined) ctx.db.prepare('UPDATE machines SET backup_interval_minutes = ? WHERE id = ?').run(patch.backupIntervalMinutes, id);
    if (patch.backupRetentionCount !== undefined) ctx.db.prepare('UPDATE machines SET backup_retention_count = ? WHERE id = ?').run(patch.backupRetentionCount, id);
    if (patch.driftIntervalMinutes !== undefined) ctx.db.prepare('UPDATE machines SET drift_interval_minutes = ? WHERE id = ?').run(patch.driftIntervalMinutes, id);
    audit(ctx, { username: req.user.username, action: 'machine_settings', machinePk: id, detail: Object.keys(patch).join(', ') });
    return machineView(ctx, gw.getMachine(ctx, id)!);
  });

  app.get('/api/groups', async () => {
    const groups = ctx.db.prepare('SELECT id, gateway_id AS gatewayId, group_id AS groupID, name FROM machine_groups ORDER BY name').all() as Array<{ id: number }>;
    return groups.map((g) => ({
      ...g,
      machineIds: (ctx.db.prepare('SELECT machine_pk FROM machine_group_members WHERE group_pk = ?').all((g as { id: number }).id) as Array<{ machine_pk: number }>).map((m) => m.machine_pk),
    }));
  });

  // ---- Machine file browsing ----

  app.get('/api/machines/:id/files', async (req) => {
    const { dirAtCNC, subDir } = req.query as { dirAtCNC?: string; subDir?: string };
    return mf.listFiles(ctx, Number((req.params as { id: string }).id), { dirAtCNC, subDir });
  });

  app.get('/api/machines/:id/files/all', async (req) => {
    const { dirAtCNC, subDir } = req.query as { dirAtCNC?: string; subDir?: string };
    return mf.listAllFiles(ctx, Number((req.params as { id: string }).id), { dirAtCNC, subDir });
  });

  app.get('/api/machines/:id/files/search', async (req, reply) => {
    const { fileName, dirAtCNC, subDir } = req.query as { fileName?: string; dirAtCNC?: string; subDir?: string };
    if (!fileName) return reply.code(400).send({ error: 'fileName required' });
    return mf.searchFiles(ctx, Number((req.params as { id: string }).id), fileName, { dirAtCNC, subDir });
  });

  app.get('/api/machines/:id/file', async (req, reply) => {
    const { fileName, dirAtCNC, subDir } = req.query as { fileName?: string; dirAtCNC?: string; subDir?: string };
    if (!fileName) return reply.code(400).send({ error: 'fileName required' });
    const buf = await mf.downloadFile(ctx, Number((req.params as { id: string }).id), fileName, { dirAtCNC, subDir });
    reply.header('content-type', 'application/octet-stream');
    reply.header('content-disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    return reply.send(buf);
  });

  app.delete('/api/machines/:id/file', { preHandler: requireEngineer }, async (req, reply) => {
    const { fileName, dirAtCNC, subDir } = req.query as { fileName?: string; dirAtCNC?: string; subDir?: string };
    if (!fileName) return reply.code(400).send({ error: 'fileName required' });
    await mf.deleteFile(ctx, Number((req.params as { id: string }).id), fileName, { dirAtCNC, subDir }, req.user.username);
    return { ok: true };
  });

  app.post('/api/machines/:id/dirs', { preHandler: requireEngineer }, async (req, reply) => {
    const { dirName, dirAtCNC, subDir } = (req.body ?? {}) as { dirName?: string; dirAtCNC?: string; subDir?: string };
    if (!dirName) return reply.code(400).send({ error: 'dirName required' });
    await mf.createDir(ctx, Number((req.params as { id: string }).id), dirName, { dirAtCNC, subDir }, req.user.username);
    return { ok: true };
  });

  app.delete('/api/machines/:id/dirs', { preHandler: requireEngineer }, async (req, reply) => {
    const { dirName, dirAtCNC, subDir } = req.query as { dirName?: string; dirAtCNC?: string; subDir?: string };
    if (!dirName) return reply.code(400).send({ error: 'dirName required' });
    await mf.deleteDir(ctx, Number((req.params as { id: string }).id), dirName, { dirAtCNC, subDir }, req.user.username);
    return { ok: true };
  });

  app.get('/api/machines/:id/current-program', async (req) => {
    const current = await mf.currentProgram(ctx, Number((req.params as { id: string }).id));
    return { current };
  });

  app.post('/api/machines/:id/select-program', async (req, reply) => {
    const { fileName, dirAtCNC, subDir, mode } = (req.body ?? {}) as { fileName?: string; dirAtCNC?: string; subDir?: string; mode?: string };
    if (!fileName) return reply.code(400).send({ error: 'fileName required' });
    return mf.selectProgram(ctx, Number((req.params as { id: string }).id), fileName, { dirAtCNC, subDir }, mode, req.user.username);
  });

  app.post('/api/machines/:id/compare', async (req, reply) => {
    const { fileName, dirAtCNC, subDir, versionId } = (req.body ?? {}) as { fileName?: string; dirAtCNC?: string; subDir?: string; versionId?: number };
    if (!fileName || !versionId) return reply.code(400).send({ error: 'fileName and versionId required' });
    return mf.compareWithLibrary(ctx, Number((req.params as { id: string }).id), fileName, { dirAtCNC, subDir }, versionId);
  });

  app.get('/api/machines/:id/assignments', async (req) => {
    const machinePk = Number((req.params as { id: string }).id);
    return asg.assignmentsForMachine(ctx, machinePk).map((a) => {
      const program = lib.getProgram(ctx, a.programId)!;
      const released = lib.latestReleased(ctx, a.programId);
      return {
        ...a,
        programName: program.name,
        deployedName: a.deployedName ?? program.name,
        latestReleased: released ? { id: released.id, version: released.version } : null,
      };
    });
  });

  // ---- Library ----

  app.get('/api/library/tree', async () => lib.folderTree(ctx));

  app.post('/api/library/folders', { preHandler: requireEngineer }, async (req, reply) => {
    const { name, parentId } = (req.body ?? {}) as { name?: string; parentId?: number | null };
    if (!name) return reply.code(400).send({ error: 'name required' });
    return lib.createFolder(ctx, name, parentId ?? null);
  });

  app.patch('/api/library/folders/:id', { preHandler: requireEngineer }, async (req) => {
    lib.renameFolder(ctx, Number((req.params as { id: string }).id), (req.body ?? {}) as { name?: string; parentId?: number | null });
    return { ok: true };
  });

  app.delete('/api/library/folders/:id', { preHandler: requireEngineer }, async (req) => {
    lib.deleteFolder(ctx, Number((req.params as { id: string }).id));
    return { ok: true };
  });

  app.get('/api/programs', async (req) => {
    const { query, folderId, machineId } = req.query as { query?: string; folderId?: string; machineId?: string };
    return lib.searchPrograms(ctx, {
      query,
      folderId: folderId ? Number(folderId) : undefined,
      machinePk: machineId ? Number(machineId) : undefined,
    });
  });

  // Program upload: raw octet-stream body, metadata in the query string.
  app.post('/api/programs', { preHandler: requireEngineer }, async (req, reply) => {
    const { name, folderId } = req.query as { name?: string; folderId?: string };
    if (!name) return reply.code(400).send({ error: 'name query parameter required' });
    const content = req.body as Buffer;
    if (!Buffer.isBuffer(content) || content.length === 0) return reply.code(400).send({ error: 'file content required as request body' });
    const created = lib.createProgram(ctx, { name, folderId: folderId ? Number(folderId) : null, content, createdBy: req.user.username });
    audit(ctx, { username: req.user.username, action: 'program_create', programId: created.program.id, programName: name, versionNo: 1 });
    return created;
  });

  app.post('/api/programs/:id/versions', { preHandler: requireEngineer }, async (req, reply) => {
    const programId = Number((req.params as { id: string }).id);
    const program = lib.getProgram(ctx, programId);
    if (!program || program.deletedAt) return reply.code(404).send({ error: 'not_found' });
    const content = req.body as Buffer;
    if (!Buffer.isBuffer(content) || content.length === 0) return reply.code(400).send({ error: 'file content required as request body' });
    const version = lib.addVersion(ctx, programId, content, req.user.username);
    audit(ctx, { username: req.user.username, action: 'version_upload', programId, programName: program.name, versionNo: version.version });
    return version;
  });

  app.get('/api/programs/:id', async (req, reply) => {
    const program = lib.getProgram(ctx, Number((req.params as { id: string }).id));
    if (!program) return reply.code(404).send({ error: 'not_found' });
    return {
      ...program,
      versions: lib.listVersions(ctx, program.id),
      assignments: asg.listAssignmentsForProgram(ctx, program.id),
    };
  });

  app.patch('/api/programs/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const updated = lib.updateProgram(ctx, Number((req.params as { id: string }).id), (req.body ?? {}) as { name?: string; folderId?: number | null });
    if (!updated) return reply.code(404).send({ error: 'not_found' });
    audit(ctx, { username: req.user.username, action: 'program_update', programId: updated.id, programName: updated.name });
    return updated;
  });

  app.delete('/api/programs/:id', { preHandler: requireEngineer }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const program = lib.getProgram(ctx, id);
    if (!program) return reply.code(404).send({ error: 'not_found' });
    lib.softDeleteProgram(ctx, id);
    audit(ctx, { username: req.user.username, action: 'program_delete', programId: id, programName: program.name, detail: 'archived (history preserved)' });
    return { ok: true };
  });

  app.get('/api/versions/:id/content', async (req, reply) => {
    const version = lib.getVersion(ctx, Number((req.params as { id: string }).id));
    if (!version) return reply.code(404).send({ error: 'not_found' });
    const buf = ctx.blobs.get(version.blobHash);
    reply.header('content-type', 'application/octet-stream');
    return reply.send(buf);
  });

  app.post('/api/versions/:id/release', { preHandler: requireEngineer }, async (req, reply) => {
    const version = lib.setVersionState(ctx, Number((req.params as { id: string }).id), 'released', req.user.username);
    if (!version) return reply.code(404).send({ error: 'not_found' });
    const program = lib.getProgram(ctx, version.programId)!;
    audit(ctx, { username: req.user.username, action: 'release', programId: program.id, programName: program.name, versionNo: version.version });
    return version;
  });

  app.post('/api/versions/:id/unrelease', { preHandler: requireEngineer }, async (req, reply) => {
    const version = lib.setVersionState(ctx, Number((req.params as { id: string }).id), 'draft', req.user.username);
    if (!version) return reply.code(404).send({ error: 'not_found' });
    const program = lib.getProgram(ctx, version.programId)!;
    audit(ctx, { username: req.user.username, action: 'unrelease', programId: program.id, programName: program.name, versionNo: version.version });
    return version;
  });

  // ---- Assignments ----

  app.post('/api/programs/:id/assignments', { preHandler: requireEngineer }, async (req, reply) => {
    const programId = Number((req.params as { id: string }).id);
    const body = (req.body ?? {}) as {
      targetKind?: 'machine' | 'group'; machineId?: number; groupId?: number;
      deployedName?: string; dirAtCNC?: string; subDir?: string;
    };
    if (body.targetKind !== 'machine' && body.targetKind !== 'group') {
      return reply.code(400).send({ error: 'targetKind (machine|group) required' });
    }
    const result = asg.createAssignment(ctx, {
      programId, targetKind: body.targetKind, machinePk: body.machineId, groupPk: body.groupId,
      deployedName: body.deployedName, dirAtCNC: body.dirAtCNC, subDir: body.subDir, createdBy: req.user.username,
    });
    const program = lib.getProgram(ctx, programId)!;
    audit(ctx, { username: req.user.username, action: 'assign', programId, programName: program.name, detail: JSON.stringify(body) });
    return result;
  });

  app.delete('/api/assignments/:id', { preHandler: requireEngineer }, async (req, reply) => {
    if (!asg.deleteAssignment(ctx, Number((req.params as { id: string }).id))) return reply.code(404).send({ error: 'not_found' });
    return { ok: true };
  });

  // ---- Transfers ----

  app.post('/api/transfers/push', async (req, reply) => {
    const body = (req.body ?? {}) as {
      machineId?: number; versionId?: number; confirmReplace?: boolean; skipVerify?: boolean;
      deployedName?: string; dirAtCNC?: string; subDir?: string;
    };
    if (!body.machineId || !body.versionId) return reply.code(400).send({ error: 'machineId and versionId required' });

    const version = lib.getVersion(ctx, body.versionId);
    if (!version) return reply.code(404).send({ error: 'version not found' });
    if (req.user.role === 'operator') {
      // Operators push only Released versions of programs assigned to the target machine.
      if (version.state !== 'released') {
        return reply.code(403).send({ error: 'forbidden', explanation: 'Operators can only push Released versions.' });
      }
      const { assignment } = asg.resolveDeployment(ctx, version.programId, body.machineId);
      if (!assignment) {
        return reply.code(403).send({ error: 'forbidden', explanation: 'Operators can only push programs assigned to this machine.' });
      }
      if (body.skipVerify) {
        return reply.code(403).send({ error: 'forbidden', explanation: 'Verification settings are managed by engineers.' });
      }
    }

    const transfer = await engine.push({
      machinePk: body.machineId, versionId: body.versionId, requestedBy: req.user.username,
      confirmReplace: body.confirmReplace, skipVerify: body.skipVerify,
      deployedName: body.deployedName, dirAtCNC: body.dirAtCNC, subDir: body.subDir,
    });
    return transfer;
  });

  app.post('/api/transfers/fleet', async (req, reply) => {
    const body = (req.body ?? {}) as { versionId?: number; machineIds?: number[]; groupIds?: number[]; confirmReplace?: boolean };
    if (!body.versionId || (!body.machineIds?.length && !body.groupIds?.length)) {
      return reply.code(400).send({ error: 'versionId and machineIds/groupIds required' });
    }
    const version = lib.getVersion(ctx, body.versionId);
    if (!version) return reply.code(404).send({ error: 'version not found' });
    if (req.user.role === 'operator' && version.state !== 'released') {
      return reply.code(403).send({ error: 'forbidden', explanation: 'Operators can only push Released versions.' });
    }
    const machinePks = new Set<number>(body.machineIds ?? []);
    for (const groupId of body.groupIds ?? []) {
      const members = ctx.db.prepare('SELECT machine_pk FROM machine_group_members WHERE group_pk = ?').all(groupId) as Array<{ machine_pk: number }>;
      for (const m of members) machinePks.add(m.machine_pk);
    }
    if (req.user.role === 'operator') {
      for (const pk of machinePks) {
        if (!asg.resolveDeployment(ctx, version.programId, pk).assignment) {
          return reply.code(403).send({ error: 'forbidden', explanation: `Program is not assigned to machine ${pk}.` });
        }
      }
    }
    return engine.fleetPush({
      versionId: body.versionId, machinePks: [...machinePks], requestedBy: req.user.username, confirmReplace: body.confirmReplace,
    });
  });

  app.post('/api/machines/:id/pull', { preHandler: requireEngineer }, async (req, reply) => {
    const body = (req.body ?? {}) as { fileName?: string; dirAtCNC?: string; subDir?: string; newProgramName?: string; folderId?: number | null };
    if (!body.fileName) return reply.code(400).send({ error: 'fileName required' });
    return engine.pull({
      machinePk: Number((req.params as { id: string }).id), fileName: body.fileName,
      dirAtCNC: body.dirAtCNC, subDir: body.subDir, requestedBy: req.user.username,
      newProgram: body.newProgramName ? { name: body.newProgramName, folderId: body.folderId ?? null } : undefined,
    });
  });

  app.get('/api/transfers', async (req) => {
    const { machineId, status, fleetBatchId, limit } = req.query as { machineId?: string; status?: string; fleetBatchId?: string; limit?: string };
    return engine.listTransfers({
      machinePk: machineId ? Number(machineId) : undefined, status, fleetBatchId,
      limit: limit ? Number(limit) : undefined,
    });
  });

  app.get('/api/transfers/:id', async (req, reply) => {
    const t = engine.getTransfer(Number((req.params as { id: string }).id));
    if (!t) return reply.code(404).send({ error: 'not_found' });
    return t;
  });

  app.post('/api/transfers/:id/restore', { preHandler: requireEngineer }, async (req) =>
    engine.restore(Number((req.params as { id: string }).id), req.user.username),
  );

  // ---- Drift ----

  app.get('/api/drift', async (req) => {
    const { machineId } = req.query as { machineId?: string };
    return drift.driftDashboard(ctx, machineId ? Number(machineId) : undefined);
  });

  app.post('/api/drift/scan', { preHandler: requireEngineer }, async (req, reply) => {
    const { machineId } = (req.body ?? {}) as { machineId?: number };
    if (!machineId) return reply.code(400).send({ error: 'machineId required' });
    const result = await drift.scanMachine(ctx, machineId);
    audit(ctx, { username: req.user.username, action: 'drift_scan', machinePk: machineId, detail: `${result.scanned} assignments, ${result.drifted} drifted` });
    return result;
  });

  // ---- Backups ----

  app.get('/api/backups', async (req) => {
    const { machineId } = req.query as { machineId?: string };
    return backups.listBackups(ctx, machineId ? Number(machineId) : undefined);
  });

  app.post('/api/machines/:id/backups', { preHandler: requireEngineer }, async (req) => {
    const { dirAtCNC } = (req.body ?? {}) as { dirAtCNC?: string };
    return backups.createBackup(ctx, Number((req.params as { id: string }).id), {
      dirAtCNC, kind: 'manual', requestedBy: req.user.username,
    });
  });

  app.get('/api/backups/:id/download', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const zip = backups.readBackupZip(ctx, id);
    if (!zip) return reply.code(404).send({ error: 'not_found' });
    reply.header('content-type', 'application/zip');
    reply.header('content-disposition', `attachment; filename="backup-${id}.zip"`);
    return reply.send(zip);
  });

  app.delete('/api/backups/:id', { preHandler: requireEngineer }, async (req, reply) => {
    if (!backups.deleteBackup(ctx, Number((req.params as { id: string }).id), req.user.username)) {
      return reply.code(404).send({ error: 'not_found' });
    }
    return { ok: true };
  });

  // ---- Audit ----

  app.get('/api/audit', async (req) => {
    const q = req.query as Record<string, string | undefined>;
    return queryAudit(ctx, {
      username: q.username, action: q.action,
      machinePk: q.machineId ? Number(q.machineId) : undefined,
      programId: q.programId ? Number(q.programId) : undefined,
      from: q.from, to: q.to,
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
  });
}

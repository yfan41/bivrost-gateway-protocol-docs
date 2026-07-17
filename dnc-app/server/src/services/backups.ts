import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import { effectiveRoot } from '../domain/capabilities.js';
import { getMachine } from './gateways.js';
import { machineCapabilities, machineLabel } from './assignments.js';
import { audit } from './audit.js';

export interface BackupRecord {
  id: number;
  machinePk: number;
  kind: 'manual' | 'scheduled';
  dirAtCNC: string | null;
  filePath: string;
  size: number;
  requestedBy: string;
  createdAt: string;
}

interface BackupRow {
  id: number; machine_pk: number; kind: 'manual' | 'scheduled'; dir_at_cnc: string | null;
  file_path: string; size: number; requested_by: string; created_at: string;
}

function toBackup(r: BackupRow): BackupRecord {
  return { id: r.id, machinePk: r.machine_pk, kind: r.kind, dirAtCNC: r.dir_at_cnc, filePath: r.file_path, size: r.size, requestedBy: r.requested_by, createdAt: r.created_at };
}

/** Backup a machine's storage (or a chosen directory) as a ZIP via the gateway's backupFiles. */
export async function createBackup(
  ctx: AppContext,
  machinePk: number,
  opts: { dirAtCNC?: string | null; kind: 'manual' | 'scheduled'; requestedBy: string },
): Promise<BackupRecord> {
  const machine = getMachine(ctx, machinePk);
  if (!machine || machine.removedAt) throw new Error('Machine not found');
  const caps = machineCapabilities(machine);
  const dir = opts.dirAtCNC ?? machine.configuredRootDir ?? null;
  if (!dir && effectiveRoot(caps, machine.configuredRootDir) === null) {
    throw new Error('This machine reports no default root path; specify a directory to back up.');
  }
  const client = ctx.clientFor(machine.gatewayId);
  const zip = await client.backupFiles([
    { machineID: machine.machineID, ...(dir ? { dirAtCNC: dir } : {}), includeSubDir: true },
  ]);

  const machineDir = join(ctx.backupsDir, String(machinePk));
  mkdirSync(machineDir, { recursive: true });
  const stamp = nowIso().replace(/[:.]/g, '-');
  const filePath = join(machineDir, `backup-${stamp}.zip`);
  writeFileSync(filePath, zip);

  const res = ctx.db
    .prepare('INSERT INTO backups (machine_pk, kind, dir_at_cnc, file_path, size, requested_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(machinePk, opts.kind, dir, filePath, zip.length, opts.requestedBy, nowIso());
  audit(ctx, {
    username: opts.requestedBy, action: 'backup', gatewayId: machine.gatewayId, machinePk,
    machineLabel: machineLabel(ctx, machine), detail: `${opts.kind} backup of ${dir ?? 'root'} (${zip.length} bytes)`,
  });

  pruneScheduledBackups(ctx, machinePk, machine.backupRetentionCount);
  return getBackup(ctx, Number(res.lastInsertRowid))!;
}

/** Retention applies to scheduled backups; manual backups stay until deleted. */
export function pruneScheduledBackups(ctx: AppContext, machinePk: number, keep: number): void {
  const rows = ctx.db
    .prepare("SELECT * FROM backups WHERE machine_pk = ? AND kind = 'scheduled' ORDER BY id DESC")
    .all(machinePk) as unknown as BackupRow[];
  for (const row of rows.slice(Math.max(keep, 1))) {
    if (existsSync(row.file_path)) unlinkSync(row.file_path);
    ctx.db.prepare('DELETE FROM backups WHERE id = ?').run(row.id);
  }
}

export function listBackups(ctx: AppContext, machinePk?: number): BackupRecord[] {
  const rows = (machinePk
    ? ctx.db.prepare('SELECT * FROM backups WHERE machine_pk = ? ORDER BY id DESC').all(machinePk)
    : ctx.db.prepare('SELECT * FROM backups ORDER BY id DESC').all()) as unknown as BackupRow[];
  return rows.map(toBackup);
}

export function getBackup(ctx: AppContext, id: number): BackupRecord | null {
  const row = ctx.db.prepare('SELECT * FROM backups WHERE id = ?').get(id) as unknown as BackupRow | undefined;
  return row ? toBackup(row) : null;
}

export function readBackupZip(ctx: AppContext, id: number): Buffer | null {
  const b = getBackup(ctx, id);
  if (!b || !existsSync(b.filePath)) return null;
  return readFileSync(b.filePath);
}

export function deleteBackup(ctx: AppContext, id: number, by: string): boolean {
  const b = getBackup(ctx, id);
  if (!b) return false;
  if (existsSync(b.filePath)) unlinkSync(b.filePath);
  ctx.db.prepare('DELETE FROM backups WHERE id = ?').run(id);
  audit(ctx, { username: by, action: 'backup_delete', machinePk: b.machinePk, detail: b.filePath });
  return true;
}

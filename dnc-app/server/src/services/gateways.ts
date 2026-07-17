import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { Gateway, Machine } from '../domain/types.js';
import { GatewayError } from '../gateway/errors.js';

interface GatewayRow {
  id: number;
  name: string;
  base_url: string;
  api_key: string;
  enabled: number;
  last_sync_at: string | null;
  last_sync_ok: number | null;
  last_sync_error: string | null;
}

/** api_key is write-only: never returned to callers. */
function toGateway(r: GatewayRow): Gateway {
  return {
    id: r.id,
    name: r.name,
    baseUrl: r.base_url,
    enabled: r.enabled === 1,
    lastSyncAt: r.last_sync_at,
    lastSyncOk: r.last_sync_ok === null ? null : r.last_sync_ok === 1,
    lastSyncError: r.last_sync_error,
  };
}

export function listGateways(ctx: AppContext): Gateway[] {
  return (ctx.db.prepare('SELECT * FROM gateways ORDER BY name').all() as unknown as GatewayRow[]).map(toGateway);
}

export function getGateway(ctx: AppContext, id: number): Gateway | null {
  const row = ctx.db.prepare('SELECT * FROM gateways WHERE id = ?').get(id) as unknown as GatewayRow | undefined;
  return row ? toGateway(row) : null;
}

export function createGateway(ctx: AppContext, input: { name: string; baseUrl: string; apiKey?: string }): Gateway {
  const res = ctx.db
    .prepare('INSERT INTO gateways (name, base_url, api_key, enabled) VALUES (?, ?, ?, 1)')
    .run(input.name, input.baseUrl, input.apiKey ?? '');
  return getGateway(ctx, Number(res.lastInsertRowid))!;
}

export function updateGateway(
  ctx: AppContext,
  id: number,
  patch: { name?: string; baseUrl?: string; apiKey?: string; enabled?: boolean },
): Gateway | null {
  if (!getGateway(ctx, id)) return null;
  if (patch.name !== undefined) ctx.db.prepare('UPDATE gateways SET name = ? WHERE id = ?').run(patch.name, id);
  if (patch.baseUrl !== undefined) ctx.db.prepare('UPDATE gateways SET base_url = ? WHERE id = ?').run(patch.baseUrl, id);
  if (patch.apiKey !== undefined) ctx.db.prepare('UPDATE gateways SET api_key = ? WHERE id = ?').run(patch.apiKey, id);
  if (patch.enabled !== undefined) ctx.db.prepare('UPDATE gateways SET enabled = ? WHERE id = ?').run(patch.enabled ? 1 : 0, id);
  return getGateway(ctx, id);
}

export function deleteGateway(ctx: AppContext, id: number): boolean {
  const machines = ctx.db.prepare('SELECT COUNT(*) AS n FROM machines WHERE gateway_id = ? AND removed_at IS NULL').get(id) as { n: number };
  if (machines.n > 0) throw new Error('Gateway still has machines; disable it instead, or remove machines in Bivrost first.');
  const res = ctx.db.prepare('DELETE FROM gateways WHERE id = ?').run(id);
  return res.changes > 0;
}

export interface MachineRow {
  id: number;
  gateway_id: number;
  machine_id: string;
  name: string;
  system: string;
  model: string;
  machine_type: string;
  encoding: string;
  file_server_type: string;
  file_server_root_dir: string;
  is_active: number;
  display_name: string | null;
  verify_on_push: number;
  configured_root_dir: string | null;
  backup_interval_minutes: number | null;
  backup_retention_count: number;
  drift_interval_minutes: number | null;
  removed_at: string | null;
}

export function toMachine(r: MachineRow): Machine {
  return {
    id: r.id,
    gatewayId: r.gateway_id,
    machineID: r.machine_id,
    name: r.name,
    system: r.system,
    model: r.model,
    machineType: r.machine_type,
    encoding: r.encoding,
    fileServerType: r.file_server_type,
    fileServerRootDir: r.file_server_root_dir,
    isActive: r.is_active === 1,
    displayName: r.display_name,
    verifyOnPush: r.verify_on_push === 1,
    configuredRootDir: r.configured_root_dir,
    backupIntervalMinutes: r.backup_interval_minutes,
    backupRetentionCount: r.backup_retention_count,
    driftIntervalMinutes: r.drift_interval_minutes,
    removedAt: r.removed_at,
  };
}

export function getMachine(ctx: AppContext, id: number): Machine | null {
  const row = ctx.db.prepare('SELECT * FROM machines WHERE id = ?').get(id) as unknown as MachineRow | undefined;
  return row ? toMachine(row) : null;
}

/**
 * Read-only registry sync from one gateway (§2.9.3.2 machines + §2.9.4.2 groups).
 * CNC machines are upserted keyed by (gatewayID, machineID); machines that vanished
 * from the gateway are marked removed but kept for history.
 */
export async function syncGateway(ctx: AppContext, gatewayId: number): Promise<{ machines: number; groups: number }> {
  const client = ctx.clientFor(gatewayId);
  try {
    const configs = await client.machineConfigs();
    const cnc = configs.filter((c) => c.machineType === 'CNC' || c.machineType === 'LASER');
    const seen = new Set<string>();
    for (const c of cnc) {
      seen.add(c.machineID);
      const existing = ctx.db
        .prepare('SELECT id FROM machines WHERE gateway_id = ? AND machine_id = ?')
        .get(gatewayId, c.machineID) as { id: number } | undefined;
      if (existing) {
        ctx.db
          .prepare(
            `UPDATE machines SET name = ?, system = ?, model = ?, machine_type = ?, encoding = ?,
             file_server_type = ?, file_server_root_dir = ?, is_active = ?, removed_at = NULL WHERE id = ?`,
          )
          .run(
            c.name, c.system, c.model, c.machineType, c.encoding ?? 'Default',
            c.fileServerType ?? 'Machine Memory', c.fileServerRootDir ?? '',
            c.isActive === false ? 0 : 1, existing.id,
          );
      } else {
        ctx.db
          .prepare(
            `INSERT INTO machines (gateway_id, machine_id, name, system, model, machine_type, encoding, file_server_type, file_server_root_dir, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            gatewayId, c.machineID, c.name, c.system, c.model, c.machineType, c.encoding ?? 'Default',
            c.fileServerType ?? 'Machine Memory', c.fileServerRootDir ?? '', c.isActive === false ? 0 : 1,
          );
      }
    }
    const gone = ctx.db.prepare('SELECT id, machine_id FROM machines WHERE gateway_id = ? AND removed_at IS NULL').all(gatewayId) as unknown as Array<{ id: number; machine_id: string }>;
    for (const m of gone) {
      if (!seen.has(m.machine_id)) {
        ctx.db.prepare('UPDATE machines SET removed_at = ? WHERE id = ?').run(nowIso(), m.id);
      }
    }

    let groupCount = 0;
    try {
      const groups = await client.groupConfigs();
      const seenGroups = new Set<string>();
      for (const g of groups) {
        seenGroups.add(g.groupID);
        let groupPk: number;
        const existing = ctx.db
          .prepare('SELECT id FROM machine_groups WHERE gateway_id = ? AND group_id = ?')
          .get(gatewayId, g.groupID) as { id: number } | undefined;
        if (existing) {
          groupPk = existing.id;
          ctx.db.prepare('UPDATE machine_groups SET name = ? WHERE id = ?').run(g.name, groupPk);
        } else {
          groupPk = Number(
            ctx.db.prepare('INSERT INTO machine_groups (gateway_id, group_id, name) VALUES (?, ?, ?)').run(gatewayId, g.groupID, g.name).lastInsertRowid,
          );
        }
        ctx.db.prepare('DELETE FROM machine_group_members WHERE group_pk = ?').run(groupPk);
        for (const gm of g.machines ?? []) {
          const m = ctx.db
            .prepare('SELECT id FROM machines WHERE gateway_id = ? AND machine_id = ?')
            .get(gatewayId, gm.machineID) as { id: number } | undefined;
          if (m) ctx.db.prepare('INSERT OR IGNORE INTO machine_group_members (group_pk, machine_pk) VALUES (?, ?)').run(groupPk, m.id);
        }
        groupCount++;
      }
      const goneGroups = ctx.db.prepare('SELECT id, group_id FROM machine_groups WHERE gateway_id = ?').all(gatewayId) as unknown as Array<{ id: number; group_id: string }>;
      for (const g of goneGroups) {
        if (!seenGroups.has(g.group_id)) ctx.db.prepare('DELETE FROM machine_groups WHERE id = ?').run(g.id);
      }
    } catch {
      // Groups are optional; a gateway without group support still syncs machines.
    }

    ctx.db.prepare('UPDATE gateways SET last_sync_at = ?, last_sync_ok = 1, last_sync_error = NULL WHERE id = ?').run(nowIso(), gatewayId);
    return { machines: cnc.length, groups: groupCount };
  } catch (err) {
    const msg = err instanceof GatewayError ? err.explanation : err instanceof Error ? err.message : String(err);
    ctx.db.prepare('UPDATE gateways SET last_sync_at = ?, last_sync_ok = 0, last_sync_error = ? WHERE id = ?').run(nowIso(), msg, gatewayId);
    throw err;
  }
}

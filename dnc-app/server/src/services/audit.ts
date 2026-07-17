import type { AppContext } from './context.js';
import { nowIso } from './context.js';

export interface AuditEntry {
  username: string;
  action: string;
  gatewayId?: number | null;
  machinePk?: number | null;
  machineLabel?: string | null;
  programId?: number | null;
  programName?: string | null;
  versionNo?: number | null;
  detail?: string | null;
}

export function audit(ctx: AppContext, e: AuditEntry): void {
  ctx.db
    .prepare(
      `INSERT INTO audit_log (at, username, action, gateway_id, machine_pk, machine_label, program_id, program_name, version_no, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      nowIso(),
      e.username,
      e.action,
      e.gatewayId ?? null,
      e.machinePk ?? null,
      e.machineLabel ?? null,
      e.programId ?? null,
      e.programName ?? null,
      e.versionNo ?? null,
      e.detail ?? null,
    );
}

export interface AuditQuery {
  username?: string;
  machinePk?: number;
  programId?: number;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export function queryAudit(ctx: AppContext, q: AuditQuery): unknown[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (q.username) { clauses.push('username = ?'); params.push(q.username); }
  if (q.machinePk) { clauses.push('machine_pk = ?'); params.push(q.machinePk); }
  if (q.programId) { clauses.push('program_id = ?'); params.push(q.programId); }
  if (q.action) { clauses.push('action = ?'); params.push(q.action); }
  if (q.from) { clauses.push('at >= ?'); params.push(q.from); }
  if (q.to) { clauses.push('at <= ?'); params.push(q.to); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = Math.min(q.limit ?? 200, 1000);
  const offset = q.offset ?? 0;
  return ctx.db
    .prepare(`SELECT * FROM audit_log ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as unknown[];
}

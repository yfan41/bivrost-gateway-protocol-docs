import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { DriftState, Machine } from '../domain/types.js';
import { GatewayError } from '../gateway/errors.js';
import { sameName, fanucProgramName } from '../domain/fanuc.js';
import { contentsMatch, looksBinary } from '../domain/normalize.js';
import { getMachine } from './gateways.js';
import { getProgram, latestReleased } from './library.js';
import { assignmentsForMachine, machineCapabilities } from './assignments.js';

function upsert(ctx: AppContext, machinePk: number, assignmentId: number, programId: number, status: DriftState, detail: string | null): void {
  ctx.db
    .prepare(
      `INSERT INTO drift_status (machine_pk, assignment_id, program_id, status, detail, last_checked_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (machine_pk, assignment_id) DO UPDATE SET program_id = excluded.program_id,
         status = excluded.status, detail = excluded.detail, last_checked_at = excluded.last_checked_at`,
    )
    .run(machinePk, assignmentId, programId, status, detail, nowIso());
}

/**
 * Drift scan for one machine: pull each assigned program's machine copy and
 * compare against the latest Released version with the same normalization as
 * push verification. An unreachable machine is a status, not an error flood.
 */
export async function scanMachine(ctx: AppContext, machinePk: number): Promise<{ scanned: number; drifted: number }> {
  const machine = getMachine(ctx, machinePk);
  if (!machine || machine.removedAt) throw new Error('Machine not found');
  const assignments = assignmentsForMachine(ctx, machinePk);
  const client = ctx.clientFor(machine.gatewayId);
  const caps = machineCapabilities(machine);
  let drifted = 0;
  let unreachable = false;

  for (const a of assignments) {
    const program = getProgram(ctx, a.programId);
    if (!program || program.deletedAt) continue;
    const released = latestReleased(ctx, a.programId);
    if (!released) {
      upsert(ctx, machinePk, a.id, a.programId, 'not_scanned', 'No released version to compare against');
      continue;
    }
    if (unreachable) {
      upsert(ctx, machinePk, a.id, a.programId, 'unreachable', 'Machine or gateway unreachable');
      continue;
    }
    const libContent = ctx.blobs.get(released.blobHash);
    let deployed = a.deployedName ?? program.name;
    if (caps.fanucContentNaming && !looksBinary(libContent)) {
      deployed = fanucProgramName(libContent.toString('utf8')) ?? deployed;
    }
    const dir = { dirAtCNC: a.dirAtCNC ?? machine.configuredRootDir, subDir: a.subDir };
    try {
      const listing = await client.readProgramList(machine.machineID, dir);
      const onMachine = listing.programs.find((p) => sameName(p, deployed));
      if (!onMachine) {
        upsert(ctx, machinePk, a.id, a.programId, 'missing_on_machine', `"${deployed}" not found on the control`);
        continue;
      }
      const machineCopy = await client.receiveFileStream(machine.machineID, onMachine, dir);
      if (contentsMatch(libContent, machineCopy)) {
        upsert(ctx, machinePk, a.id, a.programId, 'in_sync', `Matches released v${released.version}`);
      } else {
        drifted++;
        upsert(ctx, machinePk, a.id, a.programId, 'drifted', `Differs from released v${released.version}`);
      }
    } catch (err) {
      if (err instanceof GatewayError && err.errorCode === null) {
        unreachable = true;
        upsert(ctx, machinePk, a.id, a.programId, 'unreachable', err.explanation);
      } else {
        upsert(ctx, machinePk, a.id, a.programId, 'unreachable', err instanceof GatewayError ? err.explanation : String(err));
      }
    }
  }
  return { scanned: assignments.length, drifted };
}

export interface MachineDrift {
  machineId: number;
  status: DriftState | 'not_scanned';
  lastCheckedAt: string | null;
  items: Array<{ assignmentId: number; programId: number; programName: string; status: DriftState; detail: string | null; lastCheckedAt: string | null }>;
}

/** Per-machine roll-up for the dashboard: worst status wins. */
export function driftDashboard(ctx: AppContext, machinePk?: number): MachineDrift[] {
  const machines = (machinePk
    ? [getMachine(ctx, machinePk)].filter((m): m is Machine => !!m)
    : (ctx.db.prepare('SELECT id FROM machines WHERE removed_at IS NULL').all() as unknown as Array<{ id: number }>).map((r) => getMachine(ctx, r.id)!)) as Machine[];

  const severity: Record<string, number> = { drifted: 4, unreachable: 3, missing_on_machine: 2, not_scanned: 1, in_sync: 0 };
  return machines.map((m) => {
    const rows = ctx.db
      .prepare(
        `SELECT d.assignment_id AS assignmentId, d.program_id AS programId, p.name AS programName,
                d.status, d.detail, d.last_checked_at AS lastCheckedAt
         FROM drift_status d JOIN programs p ON p.id = d.program_id WHERE d.machine_pk = ?`,
      )
      .all(m.id) as unknown as MachineDrift['items'];
    const assignmentCount = assignmentsForMachine(ctx, m.id).length;
    let status: MachineDrift['status'] = 'not_scanned';
    if (rows.length > 0) {
      status = rows.reduce((worst, r) => ((severity[r.status] ?? 0) > (severity[worst] ?? 0) ? r.status : worst), 'in_sync' as DriftState);
    } else if (assignmentCount === 0) {
      status = 'not_scanned';
    }
    const lastCheckedAt = rows.reduce<string | null>((max, r) => (r.lastCheckedAt && (!max || r.lastCheckedAt > max) ? r.lastCheckedAt : max), null);
    return { machineId: m.id, status, lastCheckedAt, items: rows };
  });
}

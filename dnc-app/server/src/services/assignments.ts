import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { Assignment, Machine } from '../domain/types.js';
import { capabilitiesFor, effectiveRoot, type CapabilityProfile } from '../domain/capabilities.js';
import { fanucProgramName } from '../domain/fanuc.js';
import { getMachine, toMachine, type MachineRow } from './gateways.js';
import { getProgram } from './library.js';

interface AssignmentRow {
  id: number; program_id: number; target_kind: 'machine' | 'group'; machine_pk: number | null; group_pk: number | null;
  deployed_name: string | null; dir_at_cnc: string | null; sub_dir: string | null; created_by: string; created_at: string;
}

function toAssignment(r: AssignmentRow): Assignment {
  return {
    id: r.id, programId: r.program_id, targetKind: r.target_kind, machineId: r.machine_pk, groupId: r.group_pk,
    deployedName: r.deployed_name, dirAtCNC: r.dir_at_cnc, subDir: r.sub_dir, createdBy: r.created_by, createdAt: r.created_at,
  };
}

export function machineCapabilities(m: Machine): CapabilityProfile {
  return capabilitiesFor(m.system, m.model, m.fileServerType, m.fileServerRootDir);
}

/**
 * Warnings for a deployed name against a target's naming rules — surfaced when the
 * assignment is created and again before a push.
 */
export function namingWarnings(m: Machine, deployedName: string, content: Buffer | null): string[] {
  const caps = machineCapabilities(m);
  const warnings: string[] = [];
  if (caps.requiresExtension && !/\.[A-Za-z0-9]+$/.test(deployedName)) {
    warnings.push(`${m.system} requires file names to include an extension; "${deployedName}" has none.`);
  }
  if (caps.fanucContentNaming && content) {
    const derived = fanucProgramName(content.toString('utf8'));
    if (derived && derived !== deployedName) {
      warnings.push(
        `FANUC ignores the fileName on send: this content will land as "${derived}" (from its O-number), not "${deployedName}".`,
      );
    }
    if (!derived) {
      warnings.push('FANUC derives the program name from the content, but no program name could be derived from this content.');
    }
  }
  if (effectiveRoot(caps, m.configuredRootDir) === null && !caps.canSpecifyDir) {
    warnings.push('This machine reports no default root path; configure a root directory for it before pushing.');
  }
  return warnings;
}

export function createAssignment(
  ctx: AppContext,
  input: {
    programId: number;
    targetKind: 'machine' | 'group';
    machinePk?: number;
    groupPk?: number;
    deployedName?: string;
    dirAtCNC?: string;
    subDir?: string;
    createdBy: string;
  },
): { assignment: Assignment; warnings: string[] } {
  const program = getProgram(ctx, input.programId);
  if (!program || program.deletedAt) throw new Error('Program not found');
  if (input.targetKind === 'machine' && !input.machinePk) throw new Error('machineId required');
  if (input.targetKind === 'group' && !input.groupPk) throw new Error('groupId required');

  const res = ctx.db
    .prepare(
      `INSERT INTO assignments (program_id, target_kind, machine_pk, group_pk, deployed_name, dir_at_cnc, sub_dir, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.programId, input.targetKind, input.machinePk ?? null, input.groupPk ?? null,
      input.deployedName ?? null, input.dirAtCNC ?? null, input.subDir ?? null, input.createdBy, nowIso(),
    );
  const assignment = toAssignment(
    ctx.db.prepare('SELECT * FROM assignments WHERE id = ?').get(Number(res.lastInsertRowid)) as unknown as AssignmentRow,
  );

  const warnings: string[] = [];
  const name = input.deployedName ?? program.name;
  for (const m of assignmentMachines(ctx, assignment)) {
    warnings.push(...namingWarnings(m, name, null).map((w) => `${machineLabel(ctx, m)}: ${w}`));
  }
  return { assignment, warnings };
}

export function deleteAssignment(ctx: AppContext, id: number): boolean {
  return ctx.db.prepare('DELETE FROM assignments WHERE id = ?').run(id).changes > 0;
}

export function listAssignmentsForProgram(ctx: AppContext, programId: number): Assignment[] {
  return (ctx.db.prepare('SELECT * FROM assignments WHERE program_id = ?').all(programId) as unknown as AssignmentRow[]).map(toAssignment);
}

export function getAssignment(ctx: AppContext, id: number): Assignment | null {
  const row = ctx.db.prepare('SELECT * FROM assignments WHERE id = ?').get(id) as unknown as AssignmentRow | undefined;
  return row ? toAssignment(row) : null;
}

/** The concrete machines an assignment targets (a group assignment fans out to its members). */
export function assignmentMachines(ctx: AppContext, a: Assignment): Machine[] {
  if (a.targetKind === 'machine' && a.machineId) {
    const m = getMachine(ctx, a.machineId);
    return m && !m.removedAt ? [m] : [];
  }
  if (a.targetKind === 'group' && a.groupId) {
    const rows = ctx.db
      .prepare(
        `SELECT m.* FROM machine_group_members gm JOIN machines m ON m.id = gm.machine_pk
         WHERE gm.group_pk = ? AND m.removed_at IS NULL`,
      )
      .all(a.groupId) as unknown as MachineRow[];
    return rows.map(toMachine);
  }
  return [];
}

/** Assignments that apply to a machine, directly or via one of its groups. */
export function assignmentsForMachine(ctx: AppContext, machinePk: number): Assignment[] {
  const rows = ctx.db
    .prepare(
      `SELECT a.* FROM assignments a
       JOIN programs p ON p.id = a.program_id AND p.deleted_at IS NULL
       WHERE a.machine_pk = ?
          OR a.group_pk IN (SELECT group_pk FROM machine_group_members WHERE machine_pk = ?)`,
    )
    .all(machinePk, machinePk) as unknown as AssignmentRow[];
  return rows.map(toAssignment);
}

export function machineLabel(ctx: AppContext, m: Machine): string {
  const gw = ctx.db.prepare('SELECT name FROM gateways WHERE id = ?').get(m.gatewayId) as { name: string } | undefined;
  return `${gw?.name ?? m.gatewayId}/${m.machineID} (${m.displayName ?? m.name})`;
}

/** Resolve what a push/pull of this program to this machine should use: name and directory. */
export function resolveDeployment(
  ctx: AppContext,
  programId: number,
  machinePk: number,
): { deployedName: string; dirAtCNC: string | null; subDir: string | null; assignment: Assignment | null } {
  const program = getProgram(ctx, programId);
  if (!program) throw new Error('Program not found');
  const assignments = assignmentsForMachine(ctx, machinePk).filter((a) => a.programId === programId);
  // A direct machine assignment wins over a group assignment.
  const assignment = assignments.find((a) => a.targetKind === 'machine') ?? assignments[0] ?? null;
  return {
    deployedName: assignment?.deployedName ?? program.name,
    dirAtCNC: assignment?.dirAtCNC ?? null,
    subDir: assignment?.subDir ?? null,
    assignment,
  };
}

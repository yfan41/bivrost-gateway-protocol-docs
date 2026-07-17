import type { AppContext } from './context.js';
import type { Machine } from '../domain/types.js';
import { effectiveRoot } from '../domain/capabilities.js';
import { sameName } from '../domain/fanuc.js';
import { contentsMatch } from '../domain/normalize.js';
import { getMachine } from './gateways.js';
import { machineCapabilities, machineLabel } from './assignments.js';
import { getVersion } from './library.js';
import { audit } from './audit.js';

function requireMachine(ctx: AppContext, machinePk: number): Machine {
  const m = getMachine(ctx, machinePk);
  if (!m || m.removedAt) throw new Error('Machine not found');
  return m;
}

export interface DirRef {
  dirAtCNC?: string;
  subDir?: string;
}

function withRoot(machine: Machine, dir: DirRef): DirRef {
  if (!dir.dirAtCNC && !dir.subDir && machine.configuredRootDir) return { dirAtCNC: machine.configuredRootDir };
  return dir;
}

function checkBrowsable(ctx: AppContext, machine: Machine, dir: DirRef): void {
  const caps = machineCapabilities(machine);
  if ((dir.dirAtCNC || dir.subDir) && !caps.canSpecifyDir) {
    throw new Error(`${machine.system} [${machine.model}] does not support specifying a target directory.`);
  }
  if (!dir.dirAtCNC && !dir.subDir && effectiveRoot(caps, machine.configuredRootDir) === null) {
    throw new Error('This machine reports no default root path; configure a root directory in its settings first.');
  }
}

export async function listFiles(ctx: AppContext, machinePk: number, dir: DirRef) {
  const machine = requireMachine(ctx, machinePk);
  const effDir = withRoot(machine, dir);
  checkBrowsable(ctx, machine, effDir);
  const listing = await ctx.clientFor(machine.gatewayId).readProgramList(machine.machineID, effDir);
  return { ...listing, capabilities: machineCapabilities(machine) };
}

export async function listAllFiles(ctx: AppContext, machinePk: number, dir: DirRef) {
  const machine = requireMachine(ctx, machinePk);
  const effDir = withRoot(machine, dir);
  checkBrowsable(ctx, machine, effDir);
  return ctx.clientFor(machine.gatewayId).readAllPrograms(machine.machineID, effDir);
}

export async function searchFiles(ctx: AppContext, machinePk: number, fileName: string, dir: DirRef) {
  const machine = requireMachine(ctx, machinePk);
  const effDir = withRoot(machine, dir);
  checkBrowsable(ctx, machine, effDir);
  return ctx.clientFor(machine.gatewayId).searchFile(machine.machineID, fileName, effDir);
}

export async function downloadFile(ctx: AppContext, machinePk: number, fileName: string, dir: DirRef): Promise<Buffer> {
  const machine = requireMachine(ctx, machinePk);
  return ctx.clientFor(machine.gatewayId).receiveFileStream(machine.machineID, fileName, withRoot(machine, dir));
}

export async function deleteFile(ctx: AppContext, machinePk: number, fileName: string, dir: DirRef, by: string): Promise<void> {
  const machine = requireMachine(ctx, machinePk);
  await ctx.clientFor(machine.gatewayId).deleteFile(machine.machineID, fileName, withRoot(machine, dir));
  audit(ctx, {
    username: by, action: 'machine_file_delete', gatewayId: machine.gatewayId, machinePk,
    machineLabel: machineLabel(ctx, machine), detail: `Deleted "${fileName}" (${dir.dirAtCNC ?? dir.subDir ?? 'root'})`,
  });
}

export async function createDir(ctx: AppContext, machinePk: number, dirName: string, dir: DirRef, by: string): Promise<void> {
  const machine = requireMachine(ctx, machinePk);
  if (!machineCapabilities(machine).createDeleteDir) {
    throw new Error(`${machine.system} [${machine.model}] does not support creating directories.`);
  }
  await ctx.clientFor(machine.gatewayId).createDir(machine.machineID, dirName, withRoot(machine, dir));
  audit(ctx, { username: by, action: 'machine_dir_create', machinePk, machineLabel: machineLabel(ctx, machine), detail: dirName });
}

export async function deleteDir(ctx: AppContext, machinePk: number, dirName: string, dir: DirRef, by: string): Promise<void> {
  const machine = requireMachine(ctx, machinePk);
  if (!machineCapabilities(machine).createDeleteDir) {
    throw new Error(`${machine.system} [${machine.model}] does not support deleting directories.`);
  }
  await ctx.clientFor(machine.gatewayId).deleteDir(machine.machineID, dirName, withRoot(machine, dir));
  audit(ctx, { username: by, action: 'machine_dir_delete', machinePk, machineLabel: machineLabel(ctx, machine), detail: dirName });
}

export async function currentProgram(ctx: AppContext, machinePk: number) {
  const machine = requireMachine(ctx, machinePk);
  return ctx.clientFor(machine.gatewayId).readCurrentProgram(machine.machineID);
}

export async function selectProgram(
  ctx: AppContext,
  machinePk: number,
  fileName: string,
  dir: DirRef,
  mode: string | undefined,
  by: string,
): Promise<{ note: string | null }> {
  const machine = requireMachine(ctx, machinePk);
  const caps = machineCapabilities(machine);
  if (!caps.selectProgram) {
    throw new Error(`${machine.system} [${machine.model}] does not support selecting the main program remotely.`);
  }
  if (caps.selectProgramRequiresMode && !mode) {
    throw new Error('Okuma controls require the mode parameter (machining centers A/B/S; lathes L/R).');
  }
  await ctx.clientFor(machine.gatewayId).selectProgram(machine.machineID, fileName, withRoot(machine, dir), mode);
  audit(ctx, {
    username: by, action: 'select_program', gatewayId: machine.gatewayId, machinePk,
    machineLabel: machineLabel(ctx, machine), detail: `Selected "${fileName}" as main program${mode ? ` (mode ${mode})` : ''}`,
  });
  return { note: caps.selectProgramNoop ? 'Mock machines always report success without changing the current program.' : caps.selectProgramNote };
}

/** On-demand "compare with library": machine file vs a library version, normalization-aware. */
export async function compareWithLibrary(
  ctx: AppContext,
  machinePk: number,
  fileName: string,
  dir: DirRef,
  versionId: number,
): Promise<{ match: boolean; machineContent: string; libraryContent: string; fileName: string }> {
  const machine = requireMachine(ctx, machinePk);
  const version = getVersion(ctx, versionId);
  if (!version) throw new Error('Version not found');
  const effDir = withRoot(machine, dir);
  const client = ctx.clientFor(machine.gatewayId);
  // Tolerate zero-stripped FANUC listings: use the listed name that matches canonically.
  let actualName = fileName;
  try {
    const listing = await client.readProgramList(machine.machineID, effDir);
    actualName = listing.programs.find((p) => sameName(p, fileName)) ?? fileName;
  } catch {
    // Listing is a nicety here; the receive below reports real errors.
  }
  const machineContent = await client.receiveFileStream(machine.machineID, actualName, effDir);
  const libraryContent = ctx.blobs.get(version.blobHash);
  return {
    match: contentsMatch(machineContent, libraryContent),
    machineContent: machineContent.toString('utf8'),
    libraryContent: libraryContent.toString('utf8'),
    fileName: actualName,
  };
}

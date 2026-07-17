import { randomBytes } from 'node:crypto';
import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { Machine, Transfer, TransferStep, VerifyResult } from '../domain/types.js';
import { GatewayError } from '../gateway/errors.js';
import { effectiveRoot } from '../domain/capabilities.js';
import { fanucProgramName, sameName } from '../domain/fanuc.js';
import { contentsMatch, looksBinary } from '../domain/normalize.js';
import { getMachine } from './gateways.js';
import { getProgram, getVersion, addVersion, createProgram } from './library.js';
import { assignmentsForMachine, machineCapabilities, machineLabel, resolveDeployment } from './assignments.js';
import { audit } from './audit.js';

interface TransferRow {
  id: number; kind: 'push' | 'pull' | 'restore'; machine_pk: number; program_id: number | null; version_id: number | null;
  deployed_name: string | null; dir_at_cnc: string | null; status: Transfer['status']; verify_result: VerifyResult;
  error_code: number | null; error_msg: string | null; error_explanation: string | null;
  snapshot_blob_hash: string | null; snapshot_file_name: string | null; restorable: number; steps_json: string;
  requested_by: string; fleet_batch_id: string | null; created_at: string; finished_at: string | null;
}

function toTransfer(r: TransferRow): Transfer {
  return {
    id: r.id, kind: r.kind, machineId: r.machine_pk, programId: r.program_id, versionId: r.version_id,
    deployedName: r.deployed_name, dirAtCNC: r.dir_at_cnc, status: r.status, verifyResult: r.verify_result,
    errorCode: r.error_code, errorMsg: r.error_msg, errorExplanation: r.error_explanation,
    snapshotBlobHash: r.snapshot_blob_hash, snapshotFileName: r.snapshot_file_name, restorable: r.restorable === 1,
    steps: JSON.parse(r.steps_json) as TransferStep[], requestedBy: r.requested_by, fleetBatchId: r.fleet_batch_id,
    createdAt: r.created_at, finishedAt: r.finished_at,
  };
}

export class TransferRejected extends Error {
  constructor(
    message: string,
    public readonly explanation: string,
    public readonly needsConfirmation = false,
  ) {
    super(message);
  }
}

export interface PushOptions {
  machinePk: number;
  versionId: number;
  requestedBy: string;
  confirmReplace?: boolean;
  skipVerify?: boolean;
  deployedName?: string;
  dirAtCNC?: string;
  subDir?: string;
  fleetBatchId?: string;
}

export interface PullOptions {
  machinePk: number;
  fileName: string;
  dirAtCNC?: string;
  subDir?: string;
  requestedBy: string;
  /** When the file maps to no library program: create a new program here. */
  newProgram?: { name: string; folderId: number | null };
}

/**
 * Transfer engine: per-machine serial queues (operations against different
 * machines run concurrently), the guarded-replace push pipeline, read-back
 * verification, fleet push, pull/check-in, and snapshot restore.
 */
export class TransferEngine {
  private queues = new Map<number, Promise<unknown>>();

  constructor(private readonly ctx: AppContext) {}

  /** Serialize work per machine; the chain survives job failures. */
  private enqueue<T>(machinePk: number, job: () => Promise<T>): Promise<T> {
    const prev = this.queues.get(machinePk) ?? Promise.resolve();
    const run = prev.then(job, job);
    this.queues.set(machinePk, run.then(() => undefined, () => undefined));
    return run;
  }

  getTransfer(id: number): Transfer | null {
    const row = this.ctx.db.prepare('SELECT * FROM transfers WHERE id = ?').get(id) as unknown as TransferRow | undefined;
    return row ? toTransfer(row) : null;
  }

  listTransfers(filter: { machinePk?: number; status?: string; fleetBatchId?: string; limit?: number }): Transfer[] {
    const clauses: string[] = [];
    const params: (string | number)[] = [];
    if (filter.machinePk) { clauses.push('machine_pk = ?'); params.push(filter.machinePk); }
    if (filter.status) { clauses.push('status = ?'); params.push(filter.status); }
    if (filter.fleetBatchId) { clauses.push('fleet_batch_id = ?'); params.push(filter.fleetBatchId); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = this.ctx.db
      .prepare(`SELECT * FROM transfers ${where} ORDER BY id DESC LIMIT ?`)
      .all(...params, Math.min(filter.limit ?? 100, 500)) as unknown as TransferRow[];
    return rows.map(toTransfer);
  }

  private createRecord(input: {
    kind: Transfer['kind']; machinePk: number; programId?: number | null; versionId?: number | null;
    deployedName?: string | null; dirAtCNC?: string | null; requestedBy: string; fleetBatchId?: string | null;
  }): number {
    const res = this.ctx.db
      .prepare(
        `INSERT INTO transfers (kind, machine_pk, program_id, version_id, deployed_name, dir_at_cnc, status, requested_by, fleet_batch_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?)`,
      )
      .run(
        input.kind, input.machinePk, input.programId ?? null, input.versionId ?? null,
        input.deployedName ?? null, input.dirAtCNC ?? null, input.requestedBy, input.fleetBatchId ?? null, nowIso(),
      );
    return Number(res.lastInsertRowid);
  }

  private update(id: number, fields: Record<string, string | number | null>): void {
    const keys = Object.keys(fields);
    this.ctx.db
      .prepare(`UPDATE transfers SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
      .run(...keys.map((k) => fields[k] ?? null), id);
  }

  private step(id: number, steps: TransferStep[], step: string, ok: boolean, detail?: string): void {
    steps.push({ step, ok, detail, at: nowIso() });
    this.update(id, { steps_json: JSON.stringify(steps) });
  }

  /**
   * Resolve the target for a push: name (FANUC content naming honored), directory
   * (assignment or override; explicit dir required when the control has no root),
   * with capability checks done before any gateway call.
   */
  private resolveTarget(
    machine: Machine,
    opts: { versionContent: Buffer | null; deployedName?: string; dirAtCNC?: string; subDir?: string; programId?: number },
  ): { fileName: string; dirAtCNC: string | null; subDir: string | null; notes: string[] } {
    const caps = machineCapabilities(machine);
    const notes: string[] = [];

    let fileName = opts.deployedName ?? null;
    let dirAtCNC = opts.dirAtCNC ?? null;
    let subDir = opts.subDir ?? null;
    if (opts.programId && (fileName === null || (dirAtCNC === null && subDir === null))) {
      const resolved = resolveDeployment(this.ctx, opts.programId, machine.id);
      fileName ??= resolved.deployedName;
      if (dirAtCNC === null && subDir === null) {
        dirAtCNC = resolved.dirAtCNC;
        subDir = resolved.subDir;
      }
    }
    if (!fileName) throw new TransferRejected('no_name', 'No deployed name could be resolved for this push.');

    if ((dirAtCNC || subDir) && !caps.canSpecifyDir) {
      throw new TransferRejected(
        'dir_unsupported',
        `${machine.system} [${machine.model}] does not support specifying a target directory; the control's fixed directory is used.`,
      );
    }
    if (!dirAtCNC && !subDir && effectiveRoot(caps, machine.configuredRootDir) === null) {
      throw new TransferRejected(
        'no_root',
        'This machine reports no default root path. Configure a root directory for it (machine settings) or specify a target directory.',
      );
    }
    if (!dirAtCNC && machine.configuredRootDir) dirAtCNC = machine.configuredRootDir;

    if (caps.requiresExtension && !/\.[A-Za-z0-9]+$/.test(fileName)) {
      throw new TransferRejected(
        'extension_required',
        `${machine.system} requires file names to include an extension; "${fileName}" has none.`,
      );
    }

    if (caps.fanucContentNaming && opts.versionContent && !looksBinary(opts.versionContent)) {
      const derived = fanucProgramName(opts.versionContent.toString('utf8'));
      if (derived && !sameName(derived, fileName)) {
        notes.push(`FANUC derives the name from content: pushing as "${derived}" (requested "${fileName}").`);
        fileName = derived;
      }
    }

    return { fileName, dirAtCNC, subDir, notes };
  }

  async push(opts: PushOptions): Promise<Transfer> {
    const machine = getMachine(this.ctx, opts.machinePk);
    if (!machine || machine.removedAt) throw new TransferRejected('unknown_machine', 'Machine not found in the registry.');
    const version = getVersion(this.ctx, opts.versionId);
    if (!version) throw new TransferRejected('unknown_version', 'Program version not found.');
    const program = getProgram(this.ctx, version.programId)!;
    const content = this.ctx.blobs.get(version.blobHash);

    const target = this.resolveTarget(machine, {
      versionContent: content,
      deployedName: opts.deployedName,
      dirAtCNC: opts.dirAtCNC,
      subDir: opts.subDir,
      programId: program.id,
    });

    const id = this.createRecord({
      kind: 'push', machinePk: machine.id, programId: program.id, versionId: version.id,
      deployedName: target.fileName, dirAtCNC: target.dirAtCNC ?? target.subDir, requestedBy: opts.requestedBy,
      fleetBatchId: opts.fleetBatchId,
    });

    return this.enqueue(machine.id, () => this.runPush(id, machine, program.name, version.version, content, target, opts));
  }

  private async runPush(
    id: number,
    machine: Machine,
    programName: string,
    versionNo: number,
    content: Buffer,
    target: { fileName: string; dirAtCNC: string | null; subDir: string | null; notes: string[] },
    opts: PushOptions,
  ): Promise<Transfer> {
    const steps: TransferStep[] = [];
    const dir = { dirAtCNC: target.dirAtCNC, subDir: target.subDir };
    const client = this.ctx.clientFor(machine.gatewayId);
    this.update(id, { status: 'running' });
    for (const note of target.notes) this.step(id, steps, 'resolve', true, note);
    let deleted = false;
    let snapshotHash: string | null = null;
    let snapshotName: string | null = null;

    try {
      // Collision check against the live listing (FANUC zero-stripped names compare canonically).
      const listing = await client.readProgramList(machine.machineID, dir);
      const collision = listing.programs.find((p) => sameName(p, target.fileName));
      this.step(id, steps, 'collision_check', true, collision ? `Existing file "${collision}"` : 'No name collision');

      if (collision) {
        if (!opts.confirmReplace) {
          throw new TransferRejected(
            'collision',
            `"${collision}" already exists on the control. Confirm the guarded replace to snapshot it, delete it, and send the new version.`,
            true,
          );
        }
        // Never replace the program the machine is currently running.
        const current = await client.readCurrentProgram(machine.machineID);
        if (current && sameName(current.fileName, target.fileName)) {
          const sameDir = !current.dirAtCNC || !listing.dirAtCNC || current.dirAtCNC === listing.dirAtCNC;
          if (sameDir) {
            throw new TransferRejected(
              'running_program',
              `"${current.fileName}" is the machine's currently-running program and will not be replaced.`,
            );
          }
        }
        this.step(id, steps, 'running_program_check', true, current ? `Current program: ${current.fileName}` : 'No program running');

        const snapshot = await client.receiveFileStream(machine.machineID, collision, dir);
        snapshotHash = this.ctx.blobs.put(snapshot);
        snapshotName = collision;
        this.update(id, { snapshot_blob_hash: snapshotHash, snapshot_file_name: collision });
        this.step(id, steps, 'snapshot', true, `Saved machine copy of "${collision}" (${snapshot.length} bytes)`);

        await client.deleteFile(machine.machineID, collision, dir);
        deleted = true;
        this.step(id, steps, 'delete', true, `Deleted "${collision}" from the control`);
      }

      await client.sendFileStream(machine.machineID, target.fileName, dir, content);
      this.step(id, steps, 'send', true, `Sent ${content.length} bytes as "${target.fileName}"`);

      let verify: VerifyResult = 'unverified';
      if (machine.verifyOnPush && !opts.skipVerify) {
        const after = await client.readProgramList(machine.machineID, dir);
        const listedName = after.programs.find((p) => sameName(p, target.fileName)) ?? target.fileName;
        const readBack = await client.receiveFileStream(machine.machineID, listedName, dir);
        verify = contentsMatch(content, readBack) ? 'verified' : 'mismatch';
        this.step(id, steps, 'verify', verify === 'verified', `Read back "${listedName}": ${verify}`);
      } else {
        this.step(id, steps, 'verify', true, 'Verification skipped (disabled for this machine or this push)');
      }

      this.update(id, { status: 'success', verify_result: verify, finished_at: nowIso() });
      audit(this.ctx, {
        username: opts.requestedBy, action: 'push', gatewayId: machine.gatewayId, machinePk: machine.id,
        machineLabel: machineLabel(this.ctx, machine), programId: getVersion(this.ctx, opts.versionId)?.programId,
        programName, versionNo, detail: `as "${target.fileName}" — ${verify}`,
      });
      return this.getTransfer(id)!;
    } catch (err) {
      return this.failTransfer(id, steps, machine, err, { deleted, snapshotHash, snapshotName, requestedBy: opts.requestedBy, action: 'push', programName, versionNo });
    }
  }

  private failTransfer(
    id: number,
    steps: TransferStep[],
    machine: Machine,
    err: unknown,
    info: { deleted: boolean; snapshotHash: string | null; snapshotName: string | null; requestedBy: string; action: string; programName?: string; versionNo?: number },
  ): Transfer {
    let errorCode: number | null = null;
    let errorMsg: string;
    let explanation: string;
    if (err instanceof TransferRejected) {
      errorMsg = err.message;
      explanation = err.explanation;
    } else if (err instanceof GatewayError) {
      errorCode = err.errorCode;
      errorMsg = err.errorMsg;
      explanation = err.explanation;
    } else {
      errorMsg = err instanceof Error ? err.message : String(err);
      explanation = errorMsg;
    }
    this.step(id, steps, 'failed', false, explanation);
    // A failure after the delete leaves the machine without its copy — the snapshot makes it recoverable.
    const restorable = info.deleted && info.snapshotHash ? 1 : 0;
    this.update(id, {
      status: 'failed', error_code: errorCode, error_msg: errorMsg, error_explanation: explanation,
      restorable, finished_at: nowIso(),
    });
    audit(this.ctx, {
      username: info.requestedBy, action: `${info.action}_failed`, gatewayId: machine.gatewayId, machinePk: machine.id,
      machineLabel: machineLabel(this.ctx, machine), programName: info.programName, versionNo: info.versionNo, detail: explanation,
    });
    return this.getTransfer(id)!;
  }

  /** One-click restore of a guarded-replace safety snapshot after a failed push. */
  async restore(failedTransferId: number, requestedBy: string): Promise<Transfer> {
    const failed = this.getTransfer(failedTransferId);
    if (!failed || !failed.restorable || !failed.snapshotBlobHash || !failed.snapshotFileName) {
      throw new TransferRejected('not_restorable', 'This transfer has no restorable safety snapshot.');
    }
    const machine = getMachine(this.ctx, failed.machineId);
    if (!machine) throw new TransferRejected('unknown_machine', 'Machine not found.');
    const content = this.ctx.blobs.get(failed.snapshotBlobHash);
    const dir = { dirAtCNC: failed.dirAtCNC, subDir: null };

    const id = this.createRecord({
      kind: 'restore', machinePk: machine.id, programId: failed.programId, versionId: failed.versionId,
      deployedName: failed.snapshotFileName, dirAtCNC: failed.dirAtCNC, requestedBy,
    });

    return this.enqueue(machine.id, async () => {
      const steps: TransferStep[] = [];
      const client = this.ctx.clientFor(machine.gatewayId);
      this.update(id, { status: 'running' });
      try {
        // The failed push may have left a partial or replacement file under either name.
        const listing = await client.readProgramList(machine.machineID, dir);
        for (const name of new Set([failed.snapshotFileName!, failed.deployedName ?? failed.snapshotFileName!])) {
          const existing = listing.programs.find((p) => sameName(p, name));
          if (existing) {
            await client.deleteFile(machine.machineID, existing, dir);
            this.step(id, steps, 'delete', true, `Removed "${existing}" before restore`);
          }
        }
        await client.sendFileStream(machine.machineID, failed.snapshotFileName!, dir, content);
        this.step(id, steps, 'send', true, `Restored "${failed.snapshotFileName}" (${content.length} bytes)`);
        this.update(id, { status: 'success', verify_result: 'unverified', finished_at: nowIso() });
        this.ctx.db.prepare('UPDATE transfers SET restorable = 0 WHERE id = ?').run(failedTransferId);
        audit(this.ctx, {
          username: requestedBy, action: 'restore', gatewayId: machine.gatewayId, machinePk: machine.id,
          machineLabel: machineLabel(this.ctx, machine), detail: `Snapshot "${failed.snapshotFileName}" restored after failed transfer #${failedTransferId}`,
        });
        return this.getTransfer(id)!;
      } catch (err) {
        return this.failTransfer(id, steps, machine, err, {
          deleted: false, snapshotHash: null, snapshotName: null, requestedBy, action: 'restore',
        });
      }
    });
  }

  /**
   * Fleet push: one released version to many machines. Targets that need no
   * guarded replace and have verification off ride a single batchSendFile per
   * gateway; everything else fans out through the per-machine pipeline.
   * Results are always per-target.
   */
  async fleetPush(input: {
    versionId: number;
    machinePks: number[];
    requestedBy: string;
    confirmReplace?: boolean;
  }): Promise<{ batchId: string; transfers: Transfer[] }> {
    const batchId = randomBytes(8).toString('hex');
    const version = getVersion(this.ctx, input.versionId);
    if (!version) throw new TransferRejected('unknown_version', 'Program version not found.');
    const program = getProgram(this.ctx, version.programId)!;
    const content = this.ctx.blobs.get(version.blobHash);
    const binary = looksBinary(content);

    interface Prepared { machine: Machine; fileName: string; dirAtCNC: string | null; subDir: string | null }
    const batchable: Prepared[] = [];
    const pipelined: Machine[] = [];
    const results: Promise<Transfer>[] = [];

    for (const pk of input.machinePks) {
      const machine = getMachine(this.ctx, pk);
      if (!machine || machine.removedAt) {
        const id = this.createRecord({ kind: 'push', machinePk: pk, programId: program.id, versionId: version.id, requestedBy: input.requestedBy, fleetBatchId: batchId });
        this.update(id, { status: 'failed', error_msg: 'unknown_machine', error_explanation: 'Machine not found in the registry.', finished_at: nowIso() });
        results.push(Promise.resolve(this.getTransfer(id)!));
        continue;
      }
      if (!machine.verifyOnPush) {
        // Candidate for the shared batch — but only when no collision exists (no guarded replace needed).
        try {
          const target = this.resolveTarget(machine, { versionContent: content, programId: program.id });
          const listing = await this.ctx.clientFor(machine.gatewayId).readProgramList(machine.machineID, { dirAtCNC: target.dirAtCNC, subDir: target.subDir });
          if (!listing.programs.some((p) => sameName(p, target.fileName))) {
            batchable.push({ machine, ...target });
            continue;
          }
        } catch {
          // Pre-scan failed — fall through to the pipeline, which reports properly.
        }
      }
      pipelined.push(machine);
    }

    // Batch path: one call per gateway, positional per-target results.
    const byGateway = new Map<number, Prepared[]>();
    for (const p of batchable) {
      const list = byGateway.get(p.machine.gatewayId) ?? [];
      list.push(p);
      byGateway.set(p.machine.gatewayId, list);
    }
    for (const [gatewayId, targets] of byGateway) {
      const ids = targets.map((t) =>
        this.createRecord({
          kind: 'push', machinePk: t.machine.id, programId: program.id, versionId: version.id,
          deployedName: t.fileName, dirAtCNC: t.dirAtCNC ?? t.subDir, requestedBy: input.requestedBy, fleetBatchId: batchId,
        }),
      );
      const job = (async () => {
        try {
          const body = binary ? { base64: content.toString('base64') } : { content: content.toString('utf8') };
          const batchResults = await this.ctx.clientFor(gatewayId).batchSendFile(
            body,
            targets.map((t) => ({
              machineID: t.machine.machineID,
              fileName: t.fileName,
              dirAtCNC: t.dirAtCNC ?? undefined,
              subDir: t.subDir ?? undefined,
            })),
          );
          return targets.map((t, i) => {
            const r = batchResults[i] ?? { errorCode: -1, errorMsg: 'No result returned for this target' };
            const id = ids[i]!;
            if (r.errorCode === 0) {
              this.update(id, { status: 'success', verify_result: 'unverified', finished_at: nowIso(), steps_json: JSON.stringify([{ step: 'batch_send', ok: true, at: nowIso() }]) });
              audit(this.ctx, {
                username: input.requestedBy, action: 'push', gatewayId, machinePk: t.machine.id,
                machineLabel: machineLabel(this.ctx, t.machine), programId: program.id, programName: program.name,
                versionNo: version.version, detail: `fleet batch as "${t.fileName}" — unverified`,
              });
            } else {
              const gerr = new GatewayError(r.errorCode, r.errorMsg);
              this.update(id, { status: 'failed', error_code: r.errorCode, error_msg: r.errorMsg, error_explanation: gerr.explanation, finished_at: nowIso() });
            }
            return this.getTransfer(id)!;
          });
        } catch (err) {
          const explanation = err instanceof GatewayError ? err.explanation : String(err);
          return ids.map((id) => {
            this.update(id, { status: 'failed', error_msg: 'batch_failed', error_explanation: explanation, finished_at: nowIso() });
            return this.getTransfer(id)!;
          });
        }
      })();
      results.push(...targets.map((_, i) => job.then((list) => list[i]!)));
    }

    // Pipeline path: full guarded-replace pipeline per machine, concurrent across machines.
    for (const machine of pipelined) {
      results.push(
        this.push({
          machinePk: machine.id, versionId: version.id, requestedBy: input.requestedBy,
          confirmReplace: input.confirmReplace, fleetBatchId: batchId,
        }).catch((err) => {
          // Rejections before a record exists (capability failures) still yield a per-target result.
          const id = this.createRecord({ kind: 'push', machinePk: machine.id, programId: program.id, versionId: version.id, requestedBy: input.requestedBy, fleetBatchId: batchId });
          const explanation = err instanceof TransferRejected ? err.explanation : err instanceof GatewayError ? err.explanation : String(err);
          this.update(id, { status: 'failed', error_msg: err instanceof Error ? err.message : 'failed', error_explanation: explanation, finished_at: nowIso() });
          return this.getTransfer(id)!;
        }),
      );
    }

    return { batchId, transfers: await Promise.all(results) };
  }

  /**
   * Pull a machine file. If it maps to a library program via assignment/deployed
   * name, check it in as a new Draft version with provenance; otherwise create a
   * new program when requested.
   */
  async pull(opts: PullOptions): Promise<{ transfer: Transfer; programId: number | null; versionId: number | null }> {
    const machine = getMachine(this.ctx, opts.machinePk);
    if (!machine || machine.removedAt) throw new TransferRejected('unknown_machine', 'Machine not found in the registry.');

    const mapped = this.mapFileToProgram(machine, opts.fileName);
    const id = this.createRecord({
      kind: 'pull', machinePk: machine.id, programId: mapped?.programId ?? null,
      deployedName: opts.fileName, dirAtCNC: opts.dirAtCNC ?? opts.subDir ?? null, requestedBy: opts.requestedBy,
    });

    return this.enqueue(machine.id, async () => {
      const steps: TransferStep[] = [];
      const client = this.ctx.clientFor(machine.gatewayId);
      this.update(id, { status: 'running' });
      try {
        const content = await client.receiveFileStream(machine.machineID, opts.fileName, { dirAtCNC: opts.dirAtCNC, subDir: opts.subDir });
        this.step(id, steps, 'receive', true, `Received ${content.length} bytes`);

        let programId: number | null = null;
        let versionId: number | null = null;
        const provenance = JSON.stringify({
          machine: machineLabel(this.ctx, machine), fileName: opts.fileName,
          dirAtCNC: opts.dirAtCNC ?? opts.subDir ?? null, pulledBy: opts.requestedBy, at: nowIso(),
        });
        if (mapped) {
          const v = addVersion(this.ctx, mapped.programId, content, opts.requestedBy, 'checkin', provenance);
          programId = mapped.programId;
          versionId = v.id;
          this.step(id, steps, 'checkin', true, `Checked in as v${v.version} (Draft) of "${mapped.programName}"`);
        } else if (opts.newProgram) {
          const created = createProgram(this.ctx, {
            name: opts.newProgram.name, folderId: opts.newProgram.folderId, content,
            createdBy: opts.requestedBy, sourceKind: 'checkin', sourceDetail: provenance,
          });
          programId = created.program.id;
          versionId = created.version.id;
          this.step(id, steps, 'checkin', true, `Captured as new program "${created.program.name}" v1 (Draft)`);
        } else {
          this.step(id, steps, 'checkin', false, 'File maps to no library program; no target program specified');
        }

        this.update(id, { status: 'success', program_id: programId, version_id: versionId, finished_at: nowIso() });
        audit(this.ctx, {
          username: opts.requestedBy, action: 'pull', gatewayId: machine.gatewayId, machinePk: machine.id,
          machineLabel: machineLabel(this.ctx, machine), programId, detail: `"${opts.fileName}" ${programId ? 'checked in' : 'pulled (unmapped)'}`,
        });
        return { transfer: this.getTransfer(id)!, programId, versionId };
      } catch (err) {
        const t = this.failTransfer(id, steps, machine, err, { deleted: false, snapshotHash: null, snapshotName: null, requestedBy: opts.requestedBy, action: 'pull' });
        return { transfer: t, programId: null, versionId: null };
      }
    });
  }

  /** Find the library program a machine file maps to via assignment deployed names (FANUC-aware compare). */
  mapFileToProgram(machine: Machine, fileName: string): { programId: number; programName: string } | null {
    for (const a of assignmentsForMachine(this.ctx, machine.id)) {
      const program = getProgram(this.ctx, a.programId);
      if (!program || program.deletedAt) continue;
      const deployed = a.deployedName ?? program.name;
      if (sameName(deployed, fileName)) return { programId: program.id, programName: program.name };
      // FANUC: the on-control name comes from the released content's O-number.
      const caps = machineCapabilities(machine);
      if (caps.fanucContentNaming) {
        const latest = this.ctx.db
          .prepare('SELECT blob_hash FROM program_versions WHERE program_id = ? ORDER BY version DESC LIMIT 1')
          .get(program.id) as { blob_hash: string } | undefined;
        if (latest) {
          const derived = fanucProgramName(this.ctx.blobs.get(latest.blob_hash).toString('utf8'));
          if (derived && sameName(derived, fileName)) return { programId: program.id, programName: program.name };
        }
      }
    }
    return null;
  }
}

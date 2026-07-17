import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, fanucMachine, type Harness, type Session } from './harness.js';

const NC_V1 = '%\nO0010\nG0 X0\nM30\n%\n';
const NC_V2 = '%\nO0010\nG0 X99\nM30\n%\n';

describe('pushing programs (guarded replace, verification, queue)', () => {
  let h: Harness;
  let operator: Session;
  let programId: number;
  let v1: number;
  let v2: number;

  beforeAll(async () => {
    h = await makeHarness([
      mockMachine('M1'),
      mockMachine('M2'),
      fanucMachine('F1'),
      { machineID: 'S1', system: 'Siemens', model: 'General', defaultRoot: '/nckfs' },
      { machineID: 'H1', system: 'Haas', model: 'General', defaultRoot: null },
    ]);
    operator = await h.createOperator('op-push');
    const created = await h.admin.api('POST', '/api/programs?name=part.nc', Buffer.from(NC_V1));
    programId = created.body.program.id;
    v1 = created.body.version.id;
    const second = await h.admin.api('POST', `/api/programs/${programId}/versions`, Buffer.from(NC_V2));
    v2 = second.body.id;
    await h.admin.api('POST', `/api/versions/${v1}/release`);
  });
  afterAll(() => h.dispose());

  it('simple push lands on the control and verifies by reading back', async () => {
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: v1, deployedName: 'part.nc',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.verifyResult).toBe('verified');
    expect(h.fake.filesAt('M1', '/')['part.nc']).toBe(NC_V1);
    const steps = res.body.steps.map((s: any) => s.step);
    expect(steps).toEqual(expect.arrayContaining(['collision_check', 'send', 'verify']));
  });

  it('operator pushes a released assigned version; drafts and unassigned programs are refused', async () => {
    await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M2'), deployedName: 'op-part.nc',
    });
    const ok = await operator.api('POST', '/api/transfers/push', { machineId: h.machinePk('M2'), versionId: v1 });
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('success');

    const draft = await operator.api('POST', '/api/transfers/push', { machineId: h.machinePk('M2'), versionId: v2 });
    expect(draft.status).toBe(403);
    expect(draft.body.explanation).toMatch(/Released/);

    const other = await h.admin.api('POST', '/api/programs?name=unassigned.nc', Buffer.from(NC_V1));
    await h.admin.api('POST', `/api/versions/${other.body.version.id}/release`);
    const unassigned = await operator.api('POST', '/api/transfers/push', { machineId: h.machinePk('M2'), versionId: other.body.version.id });
    expect(unassigned.status).toBe(403);
    expect(unassigned.body.explanation).toMatch(/assigned/);
  });

  it('a name collision without confirmation fails safely without touching the machine', async () => {
    h.fake.setFile('M1', '/', 'collide.nc', 'OLD CONTENT');
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: v1, deployedName: 'collide.nc',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('failed');
    expect(res.body.errorMsg).toBe('collision');
    expect(res.body.errorExplanation).toMatch(/guarded replace/i);
    expect(h.fake.filesAt('M1', '/')['collide.nc']).toBe('OLD CONTENT');
  });

  it('confirmed guarded replace: snapshot → delete → send → verify', async () => {
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: v1, deployedName: 'collide.nc', confirmReplace: true,
    });
    expect(res.body.status).toBe('success');
    expect(res.body.verifyResult).toBe('verified');
    expect(res.body.snapshotBlobHash).toBeTruthy();
    expect(h.fake.filesAt('M1', '/')['collide.nc']).toBe(NC_V1);
    const steps = res.body.steps.map((s: any) => s.step);
    expect(steps).toEqual(expect.arrayContaining(['collision_check', 'running_program_check', 'snapshot', 'delete', 'send', 'verify']));
    // The snapshot preserves the pre-replace machine copy.
    expect(h.ctx.blobs.get(res.body.snapshotBlobHash).toString('utf8')).toBe('OLD CONTENT');
  });

  it('refuses to replace the currently-running program', async () => {
    h.fake.setFile('M1', '/', 'running.nc', 'RUNNING');
    h.fake.machine('M1').currentProgram = { dirAtCNC: '/', fileName: 'running.nc' };
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: v1, deployedName: 'running.nc', confirmReplace: true,
    });
    expect(res.body.status).toBe('failed');
    expect(res.body.errorMsg).toBe('running_program');
    expect(h.fake.filesAt('M1', '/')['running.nc']).toBe('RUNNING');
    h.fake.machine('M1').currentProgram = null;
  });

  it('a failure after delete leaves a restorable snapshot; restore puts the old copy back', async () => {
    h.fake.setFile('M1', '/', 'fragile.nc', 'PRECIOUS');
    h.fake.machine('M1').failNextSend = true;
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: v1, deployedName: 'fragile.nc', confirmReplace: true,
    });
    expect(res.body.status).toBe('failed');
    expect(res.body.restorable).toBe(true);
    expect(h.fake.filesAt('M1', '/')['fragile.nc']).toBeUndefined();

    const restore = await h.admin.api('POST', `/api/transfers/${res.body.id}/restore`);
    expect(restore.status).toBe(200);
    expect(restore.body.status).toBe('success');
    expect(h.fake.filesAt('M1', '/')['fragile.nc']).toBe('PRECIOUS');
    const original = await h.admin.api('GET', `/api/transfers/${res.body.id}`);
    expect(original.body.restorable).toBe(false);
  });

  it('verification flags a corrupted transfer as mismatch', async () => {
    h.fake.machine('M2').corruptOnSend = true;
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M2'), versionId: v1, deployedName: 'corrupt.nc',
    });
    expect(res.body.status).toBe('success');
    expect(res.body.verifyResult).toBe('mismatch');
    h.fake.machine('M2').corruptOnSend = false;
  });

  it('the per-machine verification off-switch yields unverified', async () => {
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('M2')}`, { verifyOnPush: false });
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M2'), versionId: v1, deployedName: 'unverified.nc',
    });
    expect(res.body.verifyResult).toBe('unverified');
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('M2')}`, { verifyOnPush: true });
  });

  it('FANUC: name derives from the O-number; zero-stripped listings still collide', async () => {
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('F1'), versionId: v1, deployedName: 'whatever.nc',
    });
    expect(res.body.status).toBe('success');
    // Content O0010 → stored as O0010, listed zero-stripped as O10; verification handles both.
    expect(res.body.deployedName).toBe('O0010');
    expect(res.body.verifyResult).toBe('verified');
    expect(h.fake.filesAt('F1', '//CNC_MEM/')['O0010']).toBe(NC_V1);

    // Pushing again collides via the zero-stripped listed name O10.
    const again = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('F1'), versionId: v1,
    });
    expect(again.body.status).toBe('failed');
    expect(again.body.errorMsg).toBe('collision');
  });

  it('extension-required systems are rejected before any gateway call', async () => {
    h.fake.calls.length = 0;
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('S1'), versionId: v1, deployedName: 'NOEXT',
    });
    expect(res.status).toBe(409);
    expect(res.body.explanation).toMatch(/extension/);
    expect(h.fake.calls.filter((c) => c.startsWith('S1:'))).toHaveLength(0);
  });

  it('machines with no root require a configured directory', async () => {
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('H1'), versionId: v1, deployedName: 'part.nc',
    });
    expect(res.status).toBe(409);
    expect(res.body.explanation).toMatch(/no default root/i);

    await h.admin.api('PATCH', `/api/machines/${h.machinePk('H1')}`, { configuredRootDir: '/usb0' });
    h.fake.machine('H1').files.set('/usb0', new Map());
    const after = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('H1'), versionId: v1, deployedName: 'part.nc',
    });
    expect(after.status).toBe(200);
    expect(after.body.status).toBe('success');
    expect(h.fake.filesAt('H1', '/usb0')['part.nc']).toBe(NC_V1);
  });

  it('transfers to one machine run serially; different machines run concurrently', async () => {
    h.fake.machine('M1').sendDelayMs = 150;
    const t0 = Date.now();
    const [a, b, c] = await Promise.all([
      h.admin.api('POST', '/api/transfers/push', { machineId: h.machinePk('M1'), versionId: v1, deployedName: 'q1.nc' }),
      h.admin.api('POST', '/api/transfers/push', { machineId: h.machinePk('M1'), versionId: v1, deployedName: 'q2.nc' }),
      h.admin.api('POST', '/api/transfers/push', { machineId: h.machinePk('M2'), versionId: v1, deployedName: 'q3.nc' }),
    ]);
    const elapsed = Date.now() - t0;
    expect(a.body.status).toBe('success');
    expect(b.body.status).toBe('success');
    expect(c.body.status).toBe('success');
    // Two serialized sends on M1 (≥300ms); M2 not delayed by M1's queue.
    expect(elapsed).toBeGreaterThanOrEqual(300);
    const m1Finishes = [a, b].map((r) => new Date(r.body.finishedAt).getTime()).sort((x, y) => x - y);
    expect(m1Finishes[1]! - m1Finishes[0]!).toBeGreaterThanOrEqual(100);
    const m2Finish = new Date(c.body.finishedAt).getTime();
    expect(m2Finish).toBeLessThan(m1Finishes[1]!);
    h.fake.machine('M1').sendDelayMs = 0;
  });

  it('gateway errors carry the protocol errorCode plus a plain-language explanation', async () => {
    h.fake.machine('M2').offline = true;
    const res = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M2'), versionId: v1, deployedName: 'offline.nc',
    });
    expect(res.body.status).toBe('failed');
    expect(res.body.errorExplanation).toMatch(/could not be reached/i);
    h.fake.machine('M2').offline = false;
  });
});

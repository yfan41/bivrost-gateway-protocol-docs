import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

const NC = '%\nO0042\nG0 X0\nM30\n%\n';

describe('fleet push', () => {
  let h: Harness;
  let versionId: number;

  beforeAll(async () => {
    h = await makeHarness(
      [mockMachine('A1'), mockMachine('A2'), mockMachine('A3'), mockMachine('B1')],
      { groups: [{ groupID: 'cell', name: 'Cell', machineIDs: ['A1', 'A2', 'A3'] }] },
    );
    const created = await h.admin.api('POST', '/api/programs?name=fleet.nc', Buffer.from(NC));
    versionId = created.body.version.id;
    await h.admin.api('POST', `/api/versions/${versionId}/release`);
  });
  afterAll(() => h.dispose());

  it('verify-off targets without collisions ride one batchSendFile; verify-on targets take the pipeline', async () => {
    // A1, A2 verify off → batch candidates; A3 stays verify-on → pipeline with read-back.
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('A1')}`, { verifyOnPush: false });
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('A2')}`, { verifyOnPush: false });
    h.fake.calls.length = 0;

    const groupId = (await h.admin.api('GET', '/api/groups')).body[0].id;
    const res = await h.admin.api('POST', '/api/transfers/fleet', { versionId, groupIds: [groupId] });
    expect(res.status).toBe(200);
    expect(res.body.transfers).toHaveLength(3);
    expect(res.body.transfers.every((t: any) => t.status === 'success')).toBe(true);

    const byMachine = Object.fromEntries(res.body.transfers.map((t: any) => [t.machineId, t]));
    expect(byMachine[h.machinePk('A1')].verifyResult).toBe('unverified');
    expect(byMachine[h.machinePk('A2')].verifyResult).toBe('unverified');
    expect(byMachine[h.machinePk('A3')].verifyResult).toBe('verified');

    expect(h.fake.calls.filter((c) => c === 'batchSendFile')).toHaveLength(1);
    expect(h.fake.filesAt('A1', '/')['fleet.nc']).toBe(NC);
    expect(h.fake.filesAt('A2', '/')['fleet.nc']).toBe(NC);
    expect(h.fake.filesAt('A3', '/')['fleet.nc']).toBe(NC);
    expect(res.body.transfers.every((t: any) => t.fleetBatchId === res.body.batchId)).toBe(true);
  });

  it('per-target results: one failure does not sink the batch', async () => {
    // A1 now has a collision (from the previous push) and verify off → needs guarded
    // replace, so it fans out to the pipeline and fails without confirmReplace. B1 succeeds.
    const res = await h.admin.api('POST', '/api/transfers/fleet', {
      versionId, machineIds: [h.machinePk('A1'), h.machinePk('B1')],
    });
    const byMachine = Object.fromEntries(res.body.transfers.map((t: any) => [t.machineId, t]));
    expect(byMachine[h.machinePk('A1')].status).toBe('failed');
    expect(byMachine[h.machinePk('A1')].errorMsg).toBe('collision');
    expect(byMachine[h.machinePk('B1')].status).toBe('success');
  });

  it('confirmReplace lets collided targets replace through the guarded pipeline', async () => {
    const res = await h.admin.api('POST', '/api/transfers/fleet', {
      versionId, machineIds: [h.machinePk('A1')], confirmReplace: true,
    });
    const t = res.body.transfers[0];
    expect(t.status).toBe('success');
    expect(t.snapshotBlobHash).toBeTruthy();
  });
});

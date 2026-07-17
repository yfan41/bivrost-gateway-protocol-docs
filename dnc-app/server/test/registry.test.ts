import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FakeGateway } from './fakeGateway.js';
import { makeHarness, mockMachine, fanucMachine, type Harness } from './harness.js';

describe('gateway connections and machine registry', () => {
  let h: Harness;
  let secondFake: FakeGateway;

  beforeAll(async () => {
    h = await makeHarness(
      [
        mockMachine('M1'),
        fanucMachine('F1'),
        { machineID: 'H1', system: 'Haas', model: 'General', defaultRoot: null },
        { machineID: 'S1', system: 'Siemens', model: 'General', defaultRoot: '/nckfs' },
        { machineID: 'MIT1', system: 'Mitsubishi', model: 'M70', defaultRoot: 'PRG\\USER\\', listsSubDirs: false },
      ],
      { groups: [{ groupID: 'cell-a', name: 'Cell A', machineIDs: ['M1', 'F1'] }] },
    );
    secondFake = new FakeGateway({ apiKey: 'test-key', machines: [mockMachine('M1')] });
    await secondFake.listen();
  });
  afterAll(async () => {
    await secondFake.close();
    await h.dispose();
  });

  it('sync populates machines with capability profiles', async () => {
    const res = await h.admin.api('GET', '/api/machines');
    expect(res.status).toBe(200);
    const byId = Object.fromEntries(res.body.map((m: any) => [m.machineID, m]));
    expect(byId.M1.capabilities.listSubDirs).toBe(true);
    expect(byId.F1.capabilities.fanucContentNaming).toBe(true);
    expect(byId.F1.capabilities.listSubDirs).toBe(true);
    expect(byId.MIT1.capabilities.listSubDirs).toBe(false);
    expect(byId.S1.capabilities.requiresExtension).toBe(true);
    // Haas reports no default root — an explicit configured directory is required.
    expect(byId.H1.capabilities.defaultRoot).toBeNull();
  });

  it('sync captures groups and membership', async () => {
    const res = await h.admin.api('GET', '/api/groups');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].groupID).toBe('cell-a');
    expect(res.body[0].machineIds).toHaveLength(2);
  });

  it('machines on different gateways with the same machineID stay distinct', async () => {
    const gw2 = await h.addGateway(secondFake, 'gw2');
    const res = await h.admin.api('GET', '/api/machines');
    const m1s = res.body.filter((m: any) => m.machineID === 'M1');
    expect(m1s).toHaveLength(2);
    expect(new Set(m1s.map((m: any) => m.gatewayId))).toEqual(new Set([h.gatewayId, gw2]));
  });

  it('gateway API keys are write-only', async () => {
    const res = await h.admin.api('GET', '/api/gateways');
    for (const gw of res.body) {
      expect(gw).not.toHaveProperty('apiKey');
      expect(gw).not.toHaveProperty('api_key');
    }
  });

  it('a failed sync records health without breaking the other gateway', async () => {
    secondFake.offlineAll = true;
    const gw2 = (await h.admin.api('GET', '/api/gateways')).body.find((g: any) => g.name === 'gw2');
    const sync = await h.admin.api('POST', `/api/gateways/${gw2.id}/sync`);
    expect(sync.status).toBe(502);
    const after = (await h.admin.api('GET', '/api/gateways')).body.find((g: any) => g.name === 'gw2');
    expect(after.lastSyncOk).toBe(false);
    expect(after.lastSyncError).toBeTruthy();
    // The first gateway's machines remain browsable — one outage never takes down shop-wide DNC.
    const files = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/files`);
    expect(files.status).toBe(200);
    secondFake.offlineAll = false;
  });

  it('app-side machine metadata persists without touching gateway config', async () => {
    const pk = h.machinePk('H1');
    const patch = await h.admin.api('PATCH', `/api/machines/${pk}`, {
      displayName: 'Haas VF-2', configuredRootDir: '/usb0', verifyOnPush: false,
    });
    expect(patch.status).toBe(200);
    expect(patch.body.displayName).toBe('Haas VF-2');
    // Re-sync must not clobber app-side metadata.
    await h.admin.api('POST', `/api/gateways/${h.gatewayId}/sync`);
    const again = await h.admin.api('GET', `/api/machines/${pk}`);
    expect(again.body.displayName).toBe('Haas VF-2');
    expect(again.body.configuredRootDir).toBe('/usb0');
    expect(again.body.verifyOnPush).toBe(false);
  });

  it('machines that vanish from the gateway are marked removed, not deleted', async () => {
    const fixture = h.fake;
    // Simulate removal by syncing a gateway whose fixture lost a machine: rebuild fake state.
    const before = await h.admin.api('GET', '/api/machines');
    expect(before.body.some((m: any) => m.machineID === 'MIT1')).toBe(true);
    (fixture as any).machines.delete('MIT1');
    await h.admin.api('POST', `/api/gateways/${h.gatewayId}/sync`);
    const after = await h.admin.api('GET', '/api/machines');
    expect(after.body.some((m: any) => m.machineID === 'MIT1')).toBe(false);
    const row = h.ctx.db.prepare("SELECT removed_at FROM machines WHERE machine_id = 'MIT1'").get() as { removed_at: string | null };
    expect(row.removed_at).not.toBeNull();
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

const RELEASED = '%\nO0200\nG0 X0\nM30\n%\n';

describe('drift monitoring and active-program awareness', () => {
  let h: Harness;
  let programId: number;

  beforeAll(async () => {
    h = await makeHarness([mockMachine('M1'), mockMachine('M2')]);
    const created = await h.admin.api('POST', '/api/programs?name=watched.nc', Buffer.from(RELEASED));
    programId = created.body.program.id;
    await h.admin.api('POST', `/api/versions/${created.body.version.id}/release`);
    await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M1'), deployedName: 'watched.nc',
    });
  });
  afterAll(() => h.dispose());

  it('scan reports in_sync after a clean push (normalization-aware)', async () => {
    const detail = await h.admin.api('GET', `/api/programs/${programId}`);
    const released = detail.body.versions[0];
    await h.admin.api('POST', '/api/transfers/push', { machineId: h.machinePk('M1'), versionId: released.id });
    // A control that rewrites line endings must not count as drift.
    h.fake.setFile('M1', '/', 'watched.nc', RELEASED.replace(/\n/g, '\r\n'));
    const scan = await h.admin.api('POST', '/api/drift/scan', { machineId: h.machinePk('M1') });
    expect(scan.status).toBe(200);
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M1')}`);
    expect(dash.body[0].status).toBe('in_sync');
  });

  it('an at-the-machine edit surfaces as drifted', async () => {
    h.fake.setFile('M1', '/', 'watched.nc', RELEASED.replace('X0', 'X7'));
    await h.admin.api('POST', '/api/drift/scan', { machineId: h.machinePk('M1') });
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M1')}`);
    expect(dash.body[0].status).toBe('drifted');
    expect(dash.body[0].items[0].detail).toMatch(/Differs/);
  });

  it('a missing machine copy surfaces as missing_on_machine', async () => {
    h.fake.removeFile('M1', '/', 'watched.nc');
    await h.admin.api('POST', '/api/drift/scan', { machineId: h.machinePk('M1') });
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M1')}`);
    expect(dash.body[0].status).toBe('missing_on_machine');
  });

  it('an offline machine is a status, not an error', async () => {
    h.fake.machine('M1').offline = true;
    const scan = await h.admin.api('POST', '/api/drift/scan', { machineId: h.machinePk('M1') });
    expect(scan.status).toBe(200);
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M1')}`);
    expect(dash.body[0].status).toBe('unreachable');
    h.fake.machine('M1').offline = false;
  });

  it('machines without scans show not_scanned on the dashboard', async () => {
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M2')}`);
    expect(dash.body[0].status).toBe('not_scanned');
  });

  it('the scheduler runs due drift scans', async () => {
    h.fake.setFile('M1', '/', 'watched.nc', RELEASED);
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('M1')}`, { driftIntervalMinutes: 1 });
    await h.schedulers.tick();
    const dash = await h.admin.api('GET', `/api/drift?machineId=${h.machinePk('M1')}`);
    expect(dash.body[0].status).toBe('in_sync');
  });

  it('current program is visible per machine', async () => {
    h.fake.setFile('M1', '/', 'active.nc', 'G0 ACTIVE\n');
    h.fake.machine('M1').currentProgram = { dirAtCNC: '/', fileName: 'active.nc' };
    const res = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/current-program`);
    expect(res.body.current.fileName).toBe('active.nc');
    // And "none running" is null, not an error.
    h.fake.machine('M1').currentProgram = null;
    const none = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/current-program`);
    expect(none.status).toBe(200);
    expect(none.body.current).toBeNull();
  });
});

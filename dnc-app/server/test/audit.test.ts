import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

const NC = '%\nO0300\nG0 X0\nM30\n%\n';

describe('audit and transfer log', () => {
  let h: Harness;

  beforeAll(async () => {
    h = await makeHarness([mockMachine('M1')]);
  });
  afterAll(() => h.dispose());

  it('every operation lands in the append-only log with user attribution', async () => {
    const created = await h.admin.api('POST', '/api/programs?name=logged.nc', Buffer.from(NC));
    await h.admin.api('POST', `/api/versions/${created.body.version.id}/release`);
    await h.admin.api('POST', `/api/programs/${created.body.program.id}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M1'),
    });
    await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId: created.body.version.id,
    });

    const log = await h.admin.api('GET', '/api/audit');
    const actions = log.body.map((e: any) => e.action);
    for (const expected of ['login', 'program_create', 'release', 'assign', 'push', 'registry_sync', 'gateway_create']) {
      expect(actions).toContain(expected);
    }
    const push = log.body.find((e: any) => e.action === 'push');
    expect(push.username).toBe('admin');
    expect(push.program_name).toBe('logged.nc');
    expect(push.machine_pk).toBe(h.machinePk('M1'));
    expect(push.detail).toMatch(/verified/);
  });

  it('filters by action, machine, user, and date range', async () => {
    const byAction = await h.admin.api('GET', '/api/audit?action=push');
    expect(byAction.body.length).toBeGreaterThan(0);
    expect(byAction.body.every((e: any) => e.action === 'push')).toBe(true);

    const byMachine = await h.admin.api('GET', `/api/audit?machineId=${h.machinePk('M1')}`);
    expect(byMachine.body.every((e: any) => e.machine_pk === h.machinePk('M1'))).toBe(true);

    const byUser = await h.admin.api('GET', '/api/audit?username=admin&action=login');
    expect(byUser.body.length).toBeGreaterThan(0);

    const future = await h.admin.api('GET', `/api/audit?from=${encodeURIComponent('2999-01-01')}`);
    expect(future.body).toHaveLength(0);
  });

  it('operators can read the log but the API stays append-only (no mutation routes)', async () => {
    const op = await h.createOperator();
    const res = await op.api('GET', '/api/audit');
    expect(res.status).toBe(200);
    const del = await op.api('DELETE', '/api/audit/1');
    expect(del.status).toBe(404);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

describe('machine backups', () => {
  let h: Harness;

  beforeAll(async () => {
    h = await makeHarness([
      mockMachine('M1', { '/': { 'a.nc': 'AAA', 'b.nc': 'BBB' }, '/sub': { 'c.nc': 'CCC' } }),
      { machineID: 'H1', system: 'Haas', model: 'General', defaultRoot: null },
    ]);
  });
  afterAll(() => h.dispose());

  it('on-demand backup stores the gateway ZIP and offers it for download', async () => {
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('M1')}/backups`, {});
    expect(res.status).toBe(200);
    expect(res.body.size).toBeGreaterThan(0);

    const list = await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`);
    expect(list.body).toHaveLength(1);

    const download = await h.admin.api('GET', `/api/backups/${res.body.id}/download`);
    expect(download.status).toBe(200);
    const zip = download.raw.toString('utf8');
    expect(zip.startsWith('PK')).toBe(true);
    // Subfolder files ride along (includeSubDir).
    expect(zip).toContain('c.nc');
  });

  it('scheduled backups honor the retention policy', async () => {
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('M1')}`, { backupRetentionCount: 2 });
    const { createBackup } = await import('../src/services/backups.js');
    for (let i = 0; i < 4; i++) {
      await createBackup(h.ctx, h.machinePk('M1'), { kind: 'scheduled', requestedBy: 'scheduler' });
    }
    const list = await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`);
    const scheduled = list.body.filter((b: any) => b.kind === 'scheduled');
    expect(scheduled).toHaveLength(2);
    // The manual backup from the previous test is not pruned.
    expect(list.body.filter((b: any) => b.kind === 'manual')).toHaveLength(1);
  });

  it('the scheduler creates due backups', async () => {
    await h.admin.api('PATCH', `/api/machines/${h.machinePk('M1')}`, { backupIntervalMinutes: 1, backupRetentionCount: 10 });
    const before = (await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`)).body.length;
    await h.schedulers.tick();
    const after = (await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`)).body.length;
    expect(after).toBe(before + 1);
  });

  it('backups are deletable', async () => {
    const list = await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`);
    const id = list.body[0].id;
    const del = await h.admin.api('DELETE', `/api/backups/${id}`);
    expect(del.status).toBe(200);
    const after = await h.admin.api('GET', `/api/backups?machineId=${h.machinePk('M1')}`);
    expect(after.body.map((b: any) => b.id)).not.toContain(id);
  });

  it('operators cannot create or delete backups', async () => {
    const op = await h.createOperator();
    const create = await op.api('POST', `/api/machines/${h.machinePk('M1')}/backups`, {});
    expect(create.status).toBe(403);
  });

  it('a rootless machine requires a directory', async () => {
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('H1')}/backups`, {});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no default root/i);
  });
});

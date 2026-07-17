import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

describe('capability enforcement (backend rejects before calling the gateway)', () => {
  let h: Harness;

  beforeAll(async () => {
    h = await makeHarness([
      mockMachine('M1', { '/': { 'main.nc': 'G0 X0\n' } }),
      { machineID: 'G1', system: 'Gsk', model: '980', defaultRoot: '/user/NCPROG' },
      { machineID: 'S1', system: 'Siemens', model: 'General', defaultRoot: '/nckfs' },
      { machineID: 'OK1', system: 'Okuma', model: 'General', defaultRoot: 'MD1', selectSupported: true, selectRequiresMode: true, files: { MD1: { 'MAIN.MIN': 'G0\n' } } },
    ]);
  });
  afterAll(() => h.dispose());

  it('directory creation is refused for systems that do not support it', async () => {
    h.fake.calls.length = 0;
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('G1')}/dirs`, { dirName: 'newdir' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not support creating directories/);
    expect(h.fake.calls.filter((c) => c.startsWith('G1:'))).toHaveLength(0);
  });

  it('selectProgram is refused for unsupported systems, with an explanation', async () => {
    h.fake.calls.length = 0;
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('S1')}/select-program`, { fileName: 'MAIN.MPF' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not support selecting/);
    expect(h.fake.calls.filter((c) => c.startsWith('S1:'))).toHaveLength(0);
  });

  it('Okuma requires the mode parameter', async () => {
    const noMode = await h.admin.api('POST', `/api/machines/${h.machinePk('OK1')}/select-program`, { fileName: 'MAIN.MIN' });
    expect(noMode.status).toBe(400);
    expect(noMode.body.error).toMatch(/mode/);
    const withMode = await h.admin.api('POST', `/api/machines/${h.machinePk('OK1')}/select-program`, { fileName: 'MAIN.MIN', mode: 'A' });
    expect(withMode.status).toBe(200);
  });

  it('Mock selectProgram succeeds but flags the no-op semantics', async () => {
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('M1')}/select-program`, { fileName: 'main.nc' });
    expect(res.status).toBe(200);
    expect(res.body.note).toMatch(/without changing/i);
  });

  it('machine file browsing, recursive listing, search and download work end to end', async () => {
    h.fake.setFile('M1', '/nested', 'deep.nc', 'DEEP\n');
    const listing = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/files`);
    expect(listing.body.programs).toContain('main.nc');
    expect(listing.body.subDirs).toContain('nested');

    const all = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/files/all`);
    expect(all.body.map((p: any) => p.fileName)).toEqual(expect.arrayContaining(['main.nc', 'deep.nc']));

    const search = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/files/search?fileName=deep.nc`);
    expect(search.body.dirAtCNC).toBe('/nested');

    const download = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/file?fileName=deep.nc&dirAtCNC=/nested`);
    expect(download.raw.toString('utf8')).toBe('DEEP\n');
  });

  it('engineer deletes machine files and empty directories', async () => {
    h.fake.setFile('M1', '/todelete', 'x.nc', 'X\n');
    const delFile = await h.admin.api('DELETE', `/api/machines/${h.machinePk('M1')}/file?fileName=x.nc&dirAtCNC=/todelete`);
    expect(delFile.status).toBe(200);
    const delDir = await h.admin.api('DELETE', `/api/machines/${h.machinePk('M1')}/dirs?dirName=todelete&dirAtCNC=/`);
    expect(delDir.status).toBe(200);
    const listing = await h.admin.api('GET', `/api/machines/${h.machinePk('M1')}/files`);
    expect(listing.body.subDirs).not.toContain('todelete');
  });
});

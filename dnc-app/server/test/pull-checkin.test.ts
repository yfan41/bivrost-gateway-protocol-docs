import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

const RELEASED = '%\nO0100\nG0 X0\nM30\n%\n';
const EDITED = '%\nO0100\nG0 X5\nM30\n%\n';

describe('pulling programs and check-in', () => {
  let h: Harness;
  let programId: number;

  beforeAll(async () => {
    h = await makeHarness([mockMachine('M1', { '/': { 'legacy.nc': 'G0 LEGACY\n' } })]);
    const created = await h.admin.api('POST', '/api/programs?name=part.nc', Buffer.from(RELEASED));
    programId = created.body.program.id;
    await h.admin.api('POST', `/api/versions/${created.body.version.id}/release`);
    await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M1'), deployedName: 'part-m1.nc',
    });
    h.fake.setFile('M1', '/', 'part-m1.nc', EDITED);
  });
  afterAll(() => h.dispose());

  it('pulling a mapped file checks in as a new Draft version with provenance', async () => {
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('M1')}/pull`, { fileName: 'part-m1.nc' });
    expect(res.status).toBe(200);
    expect(res.body.programId).toBe(programId);
    const detail = await h.admin.api('GET', `/api/programs/${programId}`);
    const v2 = detail.body.versions.find((v: any) => v.version === 2);
    expect(v2.state).toBe('draft');
    expect(v2.sourceKind).toBe('checkin');
    const provenance = JSON.parse(v2.sourceDetail);
    expect(provenance.fileName).toBe('part-m1.nc');
    expect(provenance.pulledBy).toBe('admin');
    const content = await h.admin.api('GET', `/api/versions/${v2.id}/content`);
    expect(content.raw.toString('utf8')).toBe(EDITED);
  });

  it('pulling an unmapped file captures it as a new program', async () => {
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('M1')}/pull`, {
      fileName: 'legacy.nc', newProgramName: 'legacy-captured.nc',
    });
    expect(res.status).toBe(200);
    expect(res.body.programId).not.toBeNull();
    const detail = await h.admin.api('GET', `/api/programs/${res.body.programId}`);
    expect(detail.body.name).toBe('legacy-captured.nc');
    expect(detail.body.versions[0].sourceKind).toBe('checkin');
  });

  it('operators may not pull/check-in', async () => {
    const op = await h.createOperator();
    const res = await op.api('POST', `/api/machines/${h.machinePk('M1')}/pull`, { fileName: 'part-m1.nc' });
    expect(res.status).toBe(403);
  });

  it('compare-with-library shows drift as a machine/library content pair', async () => {
    const detail = await h.admin.api('GET', `/api/programs/${programId}`);
    const released = detail.body.versions.find((v: any) => v.state === 'released');
    const res = await h.admin.api('POST', `/api/machines/${h.machinePk('M1')}/compare`, {
      fileName: 'part-m1.nc', versionId: released.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.match).toBe(false);
    expect(res.body.machineContent).toContain('X5');
    expect(res.body.libraryContent).toContain('X0');
  });
});

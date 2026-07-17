import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, fanucMachine, type Harness } from './harness.js';

const NC = '%\nO1234\nG0 X0\nM30\n%\n';

describe('assignment and naming', () => {
  let h: Harness;
  let programId: number;
  let versionId: number;

  beforeAll(async () => {
    h = await makeHarness(
      [
        mockMachine('M1'),
        mockMachine('M2'),
        fanucMachine('F1'),
        { machineID: 'S1', system: 'Siemens', model: 'General', defaultRoot: '/nckfs' },
      ],
      { groups: [{ groupID: 'cell-a', name: 'Cell A', machineIDs: ['M1', 'M2'] }] },
    );
    const created = await h.admin.api('POST', '/api/programs?name=bracket-op10.nc', Buffer.from(NC));
    programId = created.body.program.id;
    versionId = created.body.version.id;
    await h.admin.api('POST', `/api/versions/${versionId}/release`);
  });
  afterAll(() => h.dispose());

  it('assigns to a machine with a deployed-name override and target directory', async () => {
    const res = await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M1'), deployedName: 'BRACKET10.NC', dirAtCNC: '/prog',
    });
    expect(res.status).toBe(200);
    expect(res.body.assignment.deployedName).toBe('BRACKET10.NC');
  });

  it('warns when a deployed name violates the target naming rules', async () => {
    // Siemens requires an extension.
    const noExt = await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('S1'), deployedName: 'BRACKET10',
    });
    expect(noExt.status).toBe(200);
    expect(noExt.body.warnings.join(' ')).toMatch(/extension/i);
  });

  it('group assignment fans out to member machines in the operator view', async () => {
    const groupId = (await h.admin.api('GET', '/api/groups')).body[0].id;
    await h.admin.api('POST', `/api/programs/${programId}/assignments`, {
      targetKind: 'group', groupId, deployedName: 'CELL.NC',
    });
    const forM2 = await h.admin.api('GET', `/api/machines/${h.machinePk('M2')}/assignments`);
    expect(forM2.status).toBe(200);
    const names = forM2.body.map((a: any) => a.deployedName);
    expect(names).toContain('CELL.NC');
    expect(forM2.body[0].latestReleased).not.toBeNull();
  });

  it('a direct machine assignment beats a group assignment when resolving a push target', async () => {
    // M1 has both a direct assignment (BRACKET10.NC in /prog) and the group one (CELL.NC).
    h.fake.machine('M1').files.set('/prog', new Map());
    const push = await h.admin.api('POST', '/api/transfers/push', {
      machineId: h.machinePk('M1'), versionId,
    });
    expect(push.status).toBe(200);
    expect(push.body.status).toBe('success');
    expect(push.body.deployedName).toBe('BRACKET10.NC');
    expect(h.fake.filesAt('M1', '/prog')['BRACKET10.NC']).toBeDefined();
  });

  it('assignments disappear with the program (archive)', async () => {
    const created = await h.admin.api('POST', '/api/programs?name=temp.nc', Buffer.from(NC));
    await h.admin.api('POST', `/api/programs/${created.body.program.id}/assignments`, {
      targetKind: 'machine', machineId: h.machinePk('M2'),
    });
    await h.admin.api('DELETE', `/api/programs/${created.body.program.id}`);
    const forM2 = await h.admin.api('GET', `/api/machines/${h.machinePk('M2')}/assignments`);
    expect(forM2.body.map((a: any) => a.programName)).not.toContain('temp.nc');
  });
});

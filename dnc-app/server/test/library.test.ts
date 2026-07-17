import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

const V1 = '%\nO0001\nG0 X0\nM30\n%\n';
const V2 = '%\nO0001\nG0 X10\nM30\n%\n';

describe('program library', () => {
  let h: Harness;

  beforeAll(async () => {
    h = await makeHarness([mockMachine('M1')]);
  });
  afterAll(() => h.dispose());

  it('folders form a tree and can be renamed and moved', async () => {
    const acme = await h.admin.api('POST', '/api/library/folders', { name: 'Acme' });
    const op10 = await h.admin.api('POST', '/api/library/folders', { name: 'OP10', parentId: acme.body.id });
    expect(op10.status).toBe(200);
    await h.admin.api('PATCH', `/api/library/folders/${op10.body.id}`, { name: 'OP20' });
    const tree = await h.admin.api('GET', '/api/library/tree');
    expect(tree.body.find((f: any) => f.id === op10.body.id).name).toBe('OP20');
    // Moving a folder into its own subtree is refused.
    const bad = await h.admin.api('PATCH', `/api/library/folders/${acme.body.id}`, { parentId: op10.body.id });
    expect(bad.status).toBe(400);
  });

  it('upload creates v1 as Draft; re-upload creates v2 instead of overwriting', async () => {
    const folder = await h.admin.api('POST', '/api/library/folders', { name: 'Parts' });
    const created = await h.admin.api('POST', `/api/programs?name=bracket.nc&folderId=${folder.body.id}`, Buffer.from(V1));
    expect(created.status).toBe(200);
    expect(created.body.version.version).toBe(1);
    expect(created.body.version.state).toBe('draft');

    const v2 = await h.admin.api('POST', `/api/programs/${created.body.program.id}/versions`, Buffer.from(V2));
    expect(v2.body.version).toBe(2);

    const detail = await h.admin.api('GET', `/api/programs/${created.body.program.id}`);
    expect(detail.body.versions).toHaveLength(2);
    const contentV1 = await h.admin.api('GET', `/api/versions/${created.body.version.id}/content`);
    expect(contentV1.raw.toString('utf8')).toBe(V1);
  });

  it('release / unrelease / rollback by re-releasing an earlier version', async () => {
    const created = await h.admin.api('POST', '/api/programs?name=flange.nc', Buffer.from(V1));
    const programId = created.body.program.id;
    const v1Id = created.body.version.id;
    const v2 = await h.admin.api('POST', `/api/programs/${programId}/versions`, Buffer.from(V2));

    await h.admin.api('POST', `/api/versions/${v2.body.id}/release`);
    let detail = await h.admin.api('GET', `/api/programs/${programId}`);
    expect(detail.body.versions.find((v: any) => v.version === 2).state).toBe('released');

    // Rollback: re-release v1 and pull v2 back to draft.
    await h.admin.api('POST', `/api/versions/${v1Id}/release`);
    await h.admin.api('POST', `/api/versions/${v2.body.id}/unrelease`);
    detail = await h.admin.api('GET', `/api/programs/${programId}`);
    expect(detail.body.versions.find((v: any) => v.version === 1).state).toBe('released');
    expect(detail.body.versions.find((v: any) => v.version === 2).state).toBe('draft');
  });

  it('deleting a program archives it: hidden from search, history preserved', async () => {
    const created = await h.admin.api('POST', '/api/programs?name=obsolete.nc', Buffer.from(V1));
    await h.admin.api('DELETE', `/api/programs/${created.body.program.id}`);
    const search = await h.admin.api('GET', '/api/programs?query=obsolete');
    expect(search.body).toHaveLength(0);
    const detail = await h.admin.api('GET', `/api/programs/${created.body.program.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.deletedAt).not.toBeNull();
    expect(detail.body.versions).toHaveLength(1);
  });

  it('search by name, folder, and assigned machine', async () => {
    const folder = await h.admin.api('POST', '/api/library/folders', { name: 'SearchScope' });
    const inFolder = await h.admin.api('POST', `/api/programs?name=findme-a.nc&folderId=${folder.body.id}`, Buffer.from(V1));
    await h.admin.api('POST', '/api/programs?name=findme-b.nc', Buffer.from(V1));

    const byName = await h.admin.api('GET', '/api/programs?query=findme');
    expect(byName.body.length).toBe(2);
    const byFolder = await h.admin.api('GET', `/api/programs?folderId=${folder.body.id}`);
    expect(byFolder.body.map((p: any) => p.name)).toEqual(['findme-a.nc']);

    const pk = h.machinePk('M1');
    await h.admin.api('POST', `/api/programs/${inFolder.body.program.id}/assignments`, { targetKind: 'machine', machineId: pk });
    const byMachine = await h.admin.api('GET', `/api/programs?machineId=${pk}`);
    expect(byMachine.body.map((p: any) => p.name)).toContain('findme-a.nc');
    expect(byMachine.body.map((p: any) => p.name)).not.toContain('findme-b.nc');
  });

  it('non-empty folders cannot be deleted', async () => {
    const folder = await h.admin.api('POST', '/api/library/folders', { name: 'Busy' });
    await h.admin.api('POST', `/api/programs?name=busy.nc&folderId=${folder.body.id}`, Buffer.from(V1));
    const del = await h.admin.api('DELETE', `/api/library/folders/${folder.body.id}`);
    expect(del.status).toBe(400);
  });
});

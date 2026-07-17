import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { Program, ProgramVersion } from '../domain/types.js';
import { looksBinary } from '../domain/normalize.js';

interface ProgramRow {
  id: number; folder_id: number | null; name: string; created_by: string; created_at: string; deleted_at: string | null;
}
interface VersionRow {
  id: number; program_id: number; version: number; state: 'draft' | 'released'; blob_hash: string; size: number;
  is_binary: number; source_kind: 'upload' | 'checkin'; source_detail: string | null;
  created_by: string; created_at: string; released_by: string | null; released_at: string | null;
}

function toProgram(r: ProgramRow): Program {
  return { id: r.id, folderId: r.folder_id, name: r.name, createdBy: r.created_by, createdAt: r.created_at, deletedAt: r.deleted_at };
}
function toVersion(r: VersionRow): ProgramVersion {
  return {
    id: r.id, programId: r.program_id, version: r.version, state: r.state, blobHash: r.blob_hash, size: r.size,
    isBinary: r.is_binary === 1, sourceKind: r.source_kind, sourceDetail: r.source_detail,
    createdBy: r.created_by, createdAt: r.created_at, releasedBy: r.released_by, releasedAt: r.released_at,
  };
}

// ---- Folders ----

export function createFolder(ctx: AppContext, name: string, parentId: number | null): { id: number } {
  if (parentId !== null && !ctx.db.prepare('SELECT id FROM folders WHERE id = ?').get(parentId)) {
    throw new Error('Parent folder not found');
  }
  const res = ctx.db.prepare('INSERT INTO folders (parent_id, name) VALUES (?, ?)').run(parentId, name);
  return { id: Number(res.lastInsertRowid) };
}

export function renameFolder(ctx: AppContext, id: number, patch: { name?: string; parentId?: number | null }): void {
  if (patch.name !== undefined) ctx.db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(patch.name, id);
  if (patch.parentId !== undefined) {
    let cursor = patch.parentId;
    while (cursor !== null) {
      if (cursor === id) throw new Error('Cannot move a folder into itself');
      const row = ctx.db.prepare('SELECT parent_id FROM folders WHERE id = ?').get(cursor) as { parent_id: number | null } | undefined;
      cursor = row?.parent_id ?? null;
    }
    ctx.db.prepare('UPDATE folders SET parent_id = ? WHERE id = ?').run(patch.parentId, id);
  }
}

export function deleteFolder(ctx: AppContext, id: number): void {
  const children = ctx.db.prepare('SELECT COUNT(*) AS n FROM folders WHERE parent_id = ?').get(id) as { n: number };
  const programs = ctx.db.prepare('SELECT COUNT(*) AS n FROM programs WHERE folder_id = ? AND deleted_at IS NULL').get(id) as { n: number };
  if (children.n > 0 || programs.n > 0) throw new Error('Folder is not empty');
  ctx.db.prepare('DELETE FROM folders WHERE id = ?').run(id);
}

export function folderTree(ctx: AppContext): unknown[] {
  return ctx.db.prepare('SELECT id, parent_id AS parentId, name FROM folders ORDER BY name').all() as unknown[];
}

// ---- Programs & versions ----

export function createProgram(
  ctx: AppContext,
  input: { name: string; folderId: number | null; content: Buffer; createdBy: string; sourceKind?: 'upload' | 'checkin'; sourceDetail?: string },
): { program: Program; version: ProgramVersion } {
  const res = ctx.db
    .prepare('INSERT INTO programs (folder_id, name, created_by, created_at) VALUES (?, ?, ?, ?)')
    .run(input.folderId, input.name, input.createdBy, nowIso());
  const programId = Number(res.lastInsertRowid);
  const version = addVersion(ctx, programId, input.content, input.createdBy, input.sourceKind ?? 'upload', input.sourceDetail ?? null);
  return { program: getProgram(ctx, programId)!, version };
}

export function addVersion(
  ctx: AppContext,
  programId: number,
  content: Buffer,
  createdBy: string,
  sourceKind: 'upload' | 'checkin' = 'upload',
  sourceDetail: string | null = null,
): ProgramVersion {
  const hash = ctx.blobs.put(content);
  const last = ctx.db.prepare('SELECT MAX(version) AS v FROM program_versions WHERE program_id = ?').get(programId) as { v: number | null };
  const versionNo = (last.v ?? 0) + 1;
  const res = ctx.db
    .prepare(
      `INSERT INTO program_versions (program_id, version, state, blob_hash, size, is_binary, source_kind, source_detail, created_by, created_at)
       VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(programId, versionNo, hash, content.length, looksBinary(content) ? 1 : 0, sourceKind, sourceDetail, createdBy, nowIso());
  return getVersion(ctx, Number(res.lastInsertRowid))!;
}

export function getProgram(ctx: AppContext, id: number): Program | null {
  const row = ctx.db.prepare('SELECT * FROM programs WHERE id = ?').get(id) as unknown as ProgramRow | undefined;
  return row ? toProgram(row) : null;
}

export function getVersion(ctx: AppContext, id: number): ProgramVersion | null {
  const row = ctx.db.prepare('SELECT * FROM program_versions WHERE id = ?').get(id) as unknown as VersionRow | undefined;
  return row ? toVersion(row) : null;
}

export function listVersions(ctx: AppContext, programId: number): ProgramVersion[] {
  return (ctx.db.prepare('SELECT * FROM program_versions WHERE program_id = ? ORDER BY version DESC').all(programId) as unknown as VersionRow[]).map(toVersion);
}

export function latestReleased(ctx: AppContext, programId: number): ProgramVersion | null {
  const row = ctx.db
    .prepare("SELECT * FROM program_versions WHERE program_id = ? AND state = 'released' ORDER BY version DESC LIMIT 1")
    .get(programId) as unknown as VersionRow | undefined;
  return row ? toVersion(row) : null;
}

export function setVersionState(ctx: AppContext, versionId: number, state: 'draft' | 'released', by: string): ProgramVersion | null {
  const v = getVersion(ctx, versionId);
  if (!v) return null;
  if (state === 'released') {
    ctx.db.prepare("UPDATE program_versions SET state = 'released', released_by = ?, released_at = ? WHERE id = ?").run(by, nowIso(), versionId);
  } else {
    ctx.db.prepare("UPDATE program_versions SET state = 'draft' WHERE id = ?").run(versionId);
  }
  return getVersion(ctx, versionId);
}

export function updateProgram(ctx: AppContext, id: number, patch: { name?: string; folderId?: number | null }): Program | null {
  if (!getProgram(ctx, id)) return null;
  if (patch.name !== undefined) ctx.db.prepare('UPDATE programs SET name = ? WHERE id = ?').run(patch.name, id);
  if (patch.folderId !== undefined) ctx.db.prepare('UPDATE programs SET folder_id = ? WHERE id = ?').run(patch.folderId, id);
  return getProgram(ctx, id);
}

/** Deletion archives: the program disappears from the library but history is preserved. */
export function softDeleteProgram(ctx: AppContext, id: number): void {
  ctx.db.prepare('UPDATE programs SET deleted_at = ? WHERE id = ?').run(nowIso(), id);
  ctx.db.prepare('DELETE FROM assignments WHERE program_id = ?').run(id);
}

export interface ProgramSearch {
  query?: string;
  folderId?: number;
  machinePk?: number;
}

export function searchPrograms(ctx: AppContext, q: ProgramSearch): unknown[] {
  const clauses = ['p.deleted_at IS NULL'];
  const params: (string | number)[] = [];
  if (q.query) { clauses.push('p.name LIKE ?'); params.push(`%${q.query}%`); }
  if (q.folderId) { clauses.push('p.folder_id = ?'); params.push(q.folderId); }
  let join = '';
  if (q.machinePk) {
    join = `JOIN assignments a ON a.program_id = p.id AND (
      a.machine_pk = ? OR a.group_pk IN (SELECT group_pk FROM machine_group_members WHERE machine_pk = ?)
    )`;
    params.unshift(q.machinePk, q.machinePk);
  }
  return ctx.db
    .prepare(
      `SELECT DISTINCT p.id, p.folder_id AS folderId, p.name, p.created_by AS createdBy, p.created_at AS createdAt,
        (SELECT MAX(version) FROM program_versions v WHERE v.program_id = p.id) AS latestVersion,
        (SELECT MAX(version) FROM program_versions v WHERE v.program_id = p.id AND v.state = 'released') AS latestReleasedVersion
       FROM programs p ${join} WHERE ${clauses.join(' AND ')} ORDER BY p.name`,
    )
    .all(...params) as unknown[];
}

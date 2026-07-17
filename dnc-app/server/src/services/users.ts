import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { AppContext } from './context.js';
import { nowIso } from './context.js';
import type { Role, User } from '../domain/types.js';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
  is_active: number;
}

function toUser(r: UserRow): User {
  return { id: r.id, username: r.username, role: r.role, isActive: r.is_active === 1 };
}

export function ensureBootstrapUser(ctx: AppContext): void {
  const count = (ctx.db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  if (count === 0) {
    createUser(ctx, ctx.config.bootstrapUser, ctx.config.bootstrapPassword, 'engineer');
  }
}

export function createUser(ctx: AppContext, username: string, password: string, role: Role): User {
  const res = ctx.db
    .prepare('INSERT INTO users (username, password_hash, role, is_active, created_at) VALUES (?, ?, ?, 1, ?)')
    .run(username, hashPassword(password), role, nowIso());
  return { id: Number(res.lastInsertRowid), username, role, isActive: true };
}

export function listUsers(ctx: AppContext): User[] {
  return (ctx.db.prepare('SELECT * FROM users ORDER BY username').all() as unknown as UserRow[]).map(toUser);
}

export function updateUser(
  ctx: AppContext,
  id: number,
  patch: { role?: Role; isActive?: boolean; password?: string },
): User | null {
  const row = ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
  if (!row) return null;
  if (patch.role) ctx.db.prepare('UPDATE users SET role = ? WHERE id = ?').run(patch.role, id);
  if (patch.isActive !== undefined) {
    ctx.db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(patch.isActive ? 1 : 0, id);
    if (!patch.isActive) ctx.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  if (patch.password) ctx.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(patch.password), id);
  return toUser(ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow);
}

export function login(ctx: AppContext, username: string, password: string): { token: string; user: User } | null {
  const row = ctx.db.prepare('SELECT * FROM users WHERE username = ?').get(username) as unknown as UserRow | undefined;
  if (!row || row.is_active !== 1 || !verifyPassword(password, row.password_hash)) return null;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + ctx.config.sessionTtlHours * 3600_000).toISOString();
  ctx.db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(token, row.id, nowIso(), expires);
  return { token, user: toUser(row) };
}

export function logout(ctx: AppContext, token: string): void {
  ctx.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function sessionUser(ctx: AppContext, token: string): User | null {
  const row = ctx.db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1`,
    )
    .get(token, nowIso()) as unknown as UserRow | undefined;
  return row ? toUser(row) : null;
}

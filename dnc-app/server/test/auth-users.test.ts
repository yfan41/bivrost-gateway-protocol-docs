import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeHarness, mockMachine, type Harness } from './harness.js';

describe('authentication and roles', () => {
  let h: Harness;

  beforeAll(async () => {
    h = await makeHarness([mockMachine('M1')]);
  });
  afterAll(() => h.dispose());

  it('rejects unauthenticated API access', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/api/machines' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects bad credentials', async () => {
    const res = await h.app.inject({
      method: 'POST', url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ username: 'admin', password: 'wrong' }),
    });
    expect(res.statusCode).toBe(401);
  });

  it('bootstrap engineer can log in and see itself', async () => {
    const me = await h.admin.api('GET', '/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('admin');
    expect(me.body.user.role).toBe('engineer');
  });

  it('engineer creates an operator; operator cannot manage users', async () => {
    const op = await h.createOperator('op-alice');
    const denied = await op.api('POST', '/api/users', { username: 'x', password: 'y', role: 'operator' });
    expect(denied.status).toBe(403);
    const list = await op.api('GET', '/api/users');
    expect(list.status).toBe(403);
  });

  it('operator cannot edit the library or delete machine files', async () => {
    const op = await h.createOperator('op-bob');
    const upload = await op.api('POST', '/api/programs?name=x.nc', Buffer.from('G0 X0\n'));
    expect(upload.status).toBe(403);
    const del = await op.api('DELETE', `/api/machines/${h.machinePk('M1')}/file?fileName=any`);
    expect(del.status).toBe(403);
  });

  it('disabling a user kills their session', async () => {
    const op = await h.createOperator('op-carol');
    const before = await op.api('GET', '/api/auth/me');
    expect(before.status).toBe(200);
    const users = await h.admin.api('GET', '/api/users');
    const target = users.body.find((u: { username: string }) => u.username === 'op-carol');
    const patch = await h.admin.api('PATCH', `/api/users/${target.id}`, { isActive: false });
    expect(patch.status).toBe(200);
    const after = await op.api('GET', '/api/auth/me');
    expect(after.status).toBe(401);
  });

  it('password reset takes effect', async () => {
    const users = await h.admin.api('GET', '/api/users');
    const target = users.body.find((u: { username: string }) => u.username === 'op-alice');
    await h.admin.api('PATCH', `/api/users/${target.id}`, { password: 'new-pass' });
    const session = await h.as('op-alice', 'new-pass');
    const me = await session.api('GET', '/api/auth/me');
    expect(me.body.user.username).toBe('op-alice');
  });
});

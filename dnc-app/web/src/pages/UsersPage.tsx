import { useEffect, useState } from 'react';
import { api, type User } from '../api';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'engineer' | 'operator'>('operator');
  const { busy, error, run } = useAction();

  const reload = () => run(async () => setUsers(await api.get<User[]>('/api/users')));
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>Users</h1>
      <ErrorBox error={error} />
      <Section title="Create account">
        <div className="row">
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'engineer' | 'operator')}>
              <option value="operator">Operator</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
          <div className="field">
            <button
              className="primary"
              disabled={busy || !username || !password}
              onClick={() => void run(async () => { await api.post('/api/users', { username, password, role }); setUsername(''); setPassword(''); await reload(); })}
            >
              Create
            </button>
          </div>
        </div>
      </Section>
      <Section title="Accounts">
        <table>
          <thead>
            <tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => void run(async () => { await api.patch(`/api/users/${u.id}`, { role: e.target.value }); await reload(); })}
                  >
                    <option value="operator">Operator</option>
                    <option value="engineer">Engineer</option>
                  </select>
                </td>
                <td><StatusBadge value={u.isActive ? 'ok' : 'disabled'} /></td>
                <td>
                  <button
                    className="small"
                    onClick={() => void run(async () => { await api.patch(`/api/users/${u.id}`, { isActive: !u.isActive }); await reload(); })}
                  >
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>{' '}
                  <button
                    className="small"
                    onClick={() => {
                      const pw = window.prompt(`New password for ${u.username}:`);
                      if (pw) void run(async () => { await api.patch(`/api/users/${u.id}`, { password: pw }); });
                    }}
                  >
                    Reset password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

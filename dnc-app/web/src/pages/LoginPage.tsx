import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { ErrorBox, useAction } from '../components/common';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, run } = useAction();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(() => login(username, password));
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>DNC</h1>
        <p className="muted" style={{ textAlign: 'center' }}>
          CNC program transfer &amp; management
        </p>
        <div className="field">
          <label>Username</label>
          <input style={{ width: '100%' }} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input style={{ width: '100%' }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <ErrorBox error={error} />
        <button className="primary" style={{ width: '100%' }} disabled={busy || !username || !password}>
          Sign in
        </button>
      </form>
    </div>
  );
}

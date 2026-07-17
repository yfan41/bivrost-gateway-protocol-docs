import { useEffect, useState } from 'react';
import { api, fmtTime } from '../api';
import { ErrorBox, Section, useAction } from '../components/common';

interface AuditRow {
  id: number;
  at: string;
  username: string;
  action: string;
  machine_label: string | null;
  program_name: string | null;
  version_no: number | null;
  detail: string | null;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [action, setAction] = useState('');
  const [username, setUsername] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { error, run } = useAction();

  const reload = () =>
    run(async () => {
      const qs = new URLSearchParams();
      if (action) qs.set('action', action);
      if (username) qs.set('username', username);
      if (from) qs.set('from', new Date(from).toISOString());
      if (to) qs.set('to', new Date(to).toISOString());
      setRows(await api.get<AuditRow[]>(`/api/audit?${qs}`));
    });

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, username, from, to]);

  return (
    <>
      <div className="spread">
        <h1>Audit log</h1>
        <div className="row">
          <input placeholder="Action (push, release…)" value={action} onChange={(e) => setAction(e.target.value)} />
          <input placeholder="User" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <ErrorBox error={error} />
      <Section title={`${rows.length} entries (append-only)`}>
        <table>
          <thead>
            <tr><th>When</th><th>User</th><th>Action</th><th>Machine</th><th>Program</th><th>Detail</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{fmtTime(r.at)}</td>
                <td>{r.username}</td>
                <td className="mono">{r.action}</td>
                <td>{r.machine_label ?? ''}</td>
                <td>{r.program_name ?? ''}{r.version_no ? ` v${r.version_no}` : ''}</td>
                <td className="muted">{r.detail ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

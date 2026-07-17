import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtTime, machineName, type Machine, type Transfer } from '../api';
import { EngineerOnly } from '../auth';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const { error, run } = useAction();

  const reload = () =>
    run(async () => {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set('status', statusFilter);
      if (machineFilter) qs.set('machineId', machineFilter);
      setTransfers(await api.get<Transfer[]>(`/api/transfers?${qs}`));
      setMachines(await api.get<Machine[]>('/api/machines'));
    });

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, machineFilter]);

  const machineById = Object.fromEntries(machines.map((m) => [m.id, m]));

  return (
    <>
      <div className="spread">
        <h1>Transfers</h1>
        <div className="row">
          <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
            <option value="">All machines</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{machineName(m)}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
            <option value="running">running</option>
            <option value="queued">queued</option>
          </select>
          <button onClick={() => void reload()}>Refresh</button>
        </div>
      </div>
      <ErrorBox error={error} />
      <Section title={`${transfers.length} transfers`}>
        <table>
          <thead>
            <tr><th>#</th><th>Kind</th><th>Machine</th><th>File</th><th>Status</th><th>Verify</th><th>By</th><th>Finished</th><th /></tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <>
                <tr key={t.id} className="clickable" onClick={() => setOpen(open === t.id ? null : t.id)}>
                  <td>{t.id}{t.fleetBatchId && <span className="muted" title={`fleet batch ${t.fleetBatchId}`}> ⛟</span>}</td>
                  <td>{t.kind}</td>
                  <td>{machineById[t.machineId] ? <Link to={`/machines/${t.machineId}`}>{machineName(machineById[t.machineId]!)}</Link> : t.machineId}</td>
                  <td className="mono">{t.deployedName}</td>
                  <td><StatusBadge value={t.status} /></td>
                  <td><StatusBadge value={t.verifyResult} /></td>
                  <td>{t.requestedBy}</td>
                  <td className="muted">{fmtTime(t.finishedAt)}</td>
                  <td>
                    {t.restorable && (
                      <EngineerOnly>
                        <button
                          className="small danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Restore the safety snapshot to the machine?')) {
                              void run(async () => { await api.post(`/api/transfers/${t.id}/restore`); await reload(); });
                            }
                          }}
                        >
                          Restore snapshot
                        </button>
                      </EngineerOnly>
                    )}
                  </td>
                </tr>
                {open === t.id && (
                  <tr key={`${t.id}-detail`}>
                    <td colSpan={9} style={{ background: '#f8fafc' }}>
                      {t.errorExplanation && <div className="error-box">{t.errorExplanation}</div>}
                      <ul className="steps">
                        {t.steps.map((s, i) => (
                          <li key={i}>{s.ok ? '✓' : '✗'} <b>{s.step}</b> <span className="muted">{s.detail} · {fmtTime(s.at)}</span></li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {transfers.length === 0 && <tr><td colSpan={9} className="muted">No transfers yet.</td></tr>}
          </tbody>
        </table>
      </Section>
    </>
  );
}

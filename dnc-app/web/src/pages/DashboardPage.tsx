import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtTime, machineName, type Gateway, type Machine, type MachineDrift } from '../api';
import { EngineerOnly } from '../auth';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

interface CurrentInfo {
  fileName?: string;
  dirAtCNC?: string;
}

export default function DashboardPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [drift, setDrift] = useState<MachineDrift[]>([]);
  const [current, setCurrent] = useState<Record<number, CurrentInfo | null>>({});
  const { error, run } = useAction();

  const reload = () =>
    run(async () => {
      const [gws, ms, ds] = await Promise.all([
        api.get<Gateway[]>('/api/gateways'),
        api.get<Machine[]>('/api/machines'),
        api.get<MachineDrift[]>('/api/drift'),
      ]);
      setGateways(gws);
      setMachines(ms);
      setDrift(ds);
      // Live view: current program per machine, best-effort.
      const entries = await Promise.all(
        ms.map(async (m) => {
          try {
            const r = await api.get<{ current: CurrentInfo | null }>(`/api/machines/${m.id}/current-program`);
            return [m.id, r.current] as const;
          } catch {
            return [m.id, null] as const;
          }
        }),
      );
      setCurrent(Object.fromEntries(entries));
    });

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const driftByMachine = Object.fromEntries(drift.map((d) => [d.machineId, d]));

  return (
    <>
      <div className="spread">
        <h1>Dashboard</h1>
        <button onClick={() => void reload()}>Refresh</button>
      </div>
      <ErrorBox error={error} />

      <Section title="Gateways">
        <table>
          <thead>
            <tr><th>Name</th><th>URL</th><th>Status</th><th>Last sync</th><th>Detail</th></tr>
          </thead>
          <tbody>
            {gateways.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td className="mono">{g.baseUrl}</td>
                <td><StatusBadge value={!g.enabled ? 'disabled' : g.lastSyncOk === false ? 'offline' : g.lastSyncOk ? 'online' : 'unknown'} /></td>
                <td>{fmtTime(g.lastSyncAt)}</td>
                <td className="muted">{g.lastSyncError ?? ''}</td>
              </tr>
            ))}
            {gateways.length === 0 && (
              <tr><td colSpan={5} className="muted">No gateways yet. <EngineerOnly fallback={<>Ask an engineer to add one.</>}><Link to="/gateways">Add one</Link></EngineerOnly></td></tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Machines — drift & live state">
        <table>
          <thead>
            <tr><th>Machine</th><th>System</th><th>Drift</th><th>Running now</th><th>Last scan</th><th>Programs</th></tr>
          </thead>
          <tbody>
            {machines.map((m) => {
              const d = driftByMachine[m.id];
              const c = current[m.id];
              return (
                <tr key={m.id}>
                  <td><Link to={`/machines/${m.id}`}>{machineName(m)}</Link> <span className="muted">({m.label})</span></td>
                  <td>{m.system} {m.model}</td>
                  <td><StatusBadge value={d?.status ?? 'not_scanned'} /></td>
                  <td className="mono">{c?.fileName ?? <span className="muted">idle / unknown</span>}</td>
                  <td>{fmtTime(d?.lastCheckedAt ?? null)}</td>
                  <td>
                    {(d?.items ?? []).filter((i) => i.status !== 'in_sync').map((i) => (
                      <div key={i.assignmentId}>
                        <Link to={`/programs/${i.programId}`}>{i.programName}</Link> <StatusBadge value={i.status} />
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
            {machines.length === 0 && <tr><td colSpan={6} className="muted">No machines synced yet.</td></tr>}
          </tbody>
        </table>
      </Section>
    </>
  );
}

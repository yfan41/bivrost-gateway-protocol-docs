import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, machineName, type Machine } from '../api';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const { error, run } = useAction();

  useEffect(() => {
    void run(async () => setMachines(await api.get<Machine[]>('/api/machines')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>Machines</h1>
      <ErrorBox error={error} />
      <Section title={`${machines.length} machines`}>
        <table>
          <thead>
            <tr><th>Machine</th><th>Gateway / ID</th><th>System</th><th>Verify on push</th><th>Capabilities</th></tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id}>
                <td><Link to={`/machines/${m.id}`}>{machineName(m)}</Link></td>
                <td className="mono">{m.label}</td>
                <td>{m.system} {m.model}</td>
                <td><StatusBadge value={m.verifyOnPush ? 'ok' : 'off'} /></td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {m.capabilities.listSubDirs ? 'folders' : 'flat listing'}
                  {m.capabilities.createDeleteDir ? ' · mkdir' : ''}
                  {m.capabilities.selectProgram ? ' · select-program' : ''}
                  {m.capabilities.requiresExtension ? ' · extension required' : ''}
                  {m.capabilities.fanucContentNaming ? ' · FANUC O-number naming' : ''}
                  {m.capabilities.defaultRoot === null && !m.configuredRootDir ? ' · needs configured root!' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

import { useEffect, useState } from 'react';
import { api, fmtTime, type Gateway } from '../api';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { busy, error, run } = useAction();

  const reload = () => run(async () => setGateways(await api.get<Gateway[]>('/api/gateways')));
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>Gateways</h1>
      <ErrorBox error={error} />
      <Section title="Register a Bivrost gateway">
        <div className="row">
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop floor east" />
          </div>
          <div className="field">
            <label>Base URL</label>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://192.168.1.10:8998" style={{ width: 260 }} />
          </div>
          <div className="field">
            <label>API key (write-only)</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
          <div className="field">
            <button
              className="primary"
              disabled={busy || !name || !baseUrl}
              onClick={() =>
                void run(async () => {
                  const gw = await api.post<Gateway>('/api/gateways', { name, baseUrl, apiKey: apiKey || undefined });
                  await api.post(`/api/gateways/${gw.id}/sync`).catch(() => undefined);
                  setName(''); setBaseUrl(''); setApiKey('');
                  await reload();
                })
              }
            >
              Add &amp; sync
            </button>
          </div>
        </div>
        <p className="muted">Credentials are stored server-side only and never returned to the browser. Machine configuration itself stays in Bivrost.</p>
      </Section>
      <Section title="Connections">
        <table>
          <thead>
            <tr><th>Name</th><th>URL</th><th>Status</th><th>Last sync</th><th>Error</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {gateways.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td className="mono">{g.baseUrl}</td>
                <td><StatusBadge value={!g.enabled ? 'disabled' : g.lastSyncOk === false ? 'offline' : g.lastSyncOk ? 'online' : 'unknown'} /></td>
                <td>{fmtTime(g.lastSyncAt)}</td>
                <td className="muted">{g.lastSyncError ?? ''}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="small" onClick={() => void run(async () => { await api.post(`/api/gateways/${g.id}/sync`); await reload(); })}>
                    Sync now
                  </button>{' '}
                  <button
                    className="small"
                    onClick={() => void run(async () => { await api.patch(`/api/gateways/${g.id}`, { enabled: !g.enabled }); await reload(); })}
                  >
                    {g.enabled ? 'Disable' : 'Enable'}
                  </button>{' '}
                  <button
                    className="small"
                    onClick={() => {
                      const key = window.prompt('New API key for this gateway:');
                      if (key) void run(async () => { await api.patch(`/api/gateways/${g.id}`, { apiKey: key }); });
                    }}
                  >
                    Set key
                  </button>{' '}
                  <button
                    className="small danger"
                    onClick={() => {
                      if (window.confirm('Delete this gateway connection?')) {
                        void run(async () => { await api.delete(`/api/gateways/${g.id}`); await reload(); });
                      }
                    }}
                  >
                    Delete
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

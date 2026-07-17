import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  api, fmtBytes, fmtTime, machineName,
  type Group, type Machine, type ProgramDetail, type Transfer, type Version,
} from '../api';
import { EngineerOnly, useIsEngineer } from '../auth';
import { DiffView, ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function ProgramPage() {
  const { id } = useParams();
  const programId = Number(id);
  const navigate = useNavigate();
  const isEngineer = useIsEngineer();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [diff, setDiff] = useState<{ a: Version; b: Version; left: string; right: string } | null>(null);
  const [diffPick, setDiffPick] = useState<number[]>([]);
  const [pushResults, setPushResults] = useState<Transfer[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useAction();

  const [assignTarget, setAssignTarget] = useState('');
  const [assignName, setAssignName] = useState('');
  const [assignDir, setAssignDir] = useState('');
  const [fleetTargets, setFleetTargets] = useState<string[]>([]);

  const reload = useCallback(async () => {
    setProgram(await api.get<ProgramDetail>(`/api/programs/${programId}`));
    setMachines(await api.get<Machine[]>('/api/machines'));
    setGroups(await api.get<Group[]>('/api/groups'));
  }, [programId]);

  useEffect(() => {
    void run(reload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  if (!program) return <ErrorBox error={error} />;
  const machineById = Object.fromEntries(machines.map((m) => [m.id, m]));
  const groupById = Object.fromEntries(groups.map((g) => [g.id, g]));

  const uploadVersion = () =>
    run(async () => {
      const file = fileInput.current?.files?.[0];
      if (!file) return;
      await api.post(`/api/programs/${programId}/versions`, await file.arrayBuffer());
      if (fileInput.current) fileInput.current.value = '';
      await reload();
    });

  const setState = (v: Version, state: 'release' | 'unrelease') =>
    run(async () => {
      await api.post(`/api/versions/${v.id}/${state}`);
      await reload();
    });

  const showDiff = () =>
    run(async () => {
      const [aId, bId] = [...diffPick].sort((x, y) => x - y);
      const a = program.versions.find((v) => v.id === aId)!;
      const b = program.versions.find((v) => v.id === bId)!;
      const [left, right] = await Promise.all([
        fetch(`/api/versions/${a.id}/content`).then((r) => r.text()),
        fetch(`/api/versions/${b.id}/content`).then((r) => r.text()),
      ]);
      setDiff({ a, b, left, right });
    });

  const pushTo = (versionId: number, machineId: number, confirmReplace = false): Promise<void> =>
    run(async () => {
      const t = await api.post<Transfer>('/api/transfers/push', { machineId, versionId, confirmReplace });
      setPushResults([t]);
      if (t.status === 'failed' && t.errorMsg === 'collision' && !confirmReplace) {
        if (window.confirm(`${t.errorExplanation}\n\nProceed with the guarded replace?`)) {
          await pushTo(versionId, machineId, true);
        }
      }
    });

  const fleetPush = (versionId: number) =>
    run(async () => {
      const machineIds = fleetTargets.filter((t) => t.startsWith('m')).map((t) => Number(t.slice(1)));
      const groupIds = fleetTargets.filter((t) => t.startsWith('g')).map((t) => Number(t.slice(1)));
      const confirmReplace = window.confirm(
        'Fleet push: replace existing copies on targets where the name already exists (guarded, with safety snapshots)?',
      );
      const r = await api.post<{ batchId: string; transfers: Transfer[] }>('/api/transfers/fleet', {
        versionId, machineIds, groupIds, confirmReplace,
      });
      setPushResults(r.transfers);
    });

  const addAssignment = () =>
    run(async () => {
      const targetKind = assignTarget.startsWith('g') ? 'group' : 'machine';
      const body = {
        targetKind,
        machineId: targetKind === 'machine' ? Number(assignTarget.slice(1)) : undefined,
        groupId: targetKind === 'group' ? Number(assignTarget.slice(1)) : undefined,
        deployedName: assignName || undefined,
        dirAtCNC: assignDir || undefined,
      };
      const r = await api.post<{ warnings: string[] }>(`/api/programs/${programId}/assignments`, body);
      setWarnings(r.warnings);
      setAssignTarget(''); setAssignName(''); setAssignDir('');
      await reload();
    });

  const latestReleased = program.versions.find((v) => v.state === 'released');

  return (
    <>
      <div className="spread">
        <h1>
          {program.name} {program.deletedAt && <StatusBadge value="archived" />}
        </h1>
        <EngineerOnly>
          <div className="row">
            <button
              onClick={() => {
                const name = window.prompt('Rename program:', program.name);
                if (name) void run(async () => { await api.patch(`/api/programs/${programId}`, { name }); await reload(); });
              }}
            >
              Rename
            </button>
            <button
              className="danger"
              onClick={() => {
                if (window.confirm('Archive this program? History is preserved; assignments are removed.')) {
                  void run(async () => { await api.delete(`/api/programs/${programId}`); navigate('/library'); });
                }
              }}
            >
              Archive
            </button>
          </div>
        </EngineerOnly>
      </div>
      <ErrorBox error={error} />
      {warnings.length > 0 && <div className="note-box">{warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}</div>}

      <Section
        title="Versions"
        right={
          <div className="row">
            {diffPick.length === 2 && <button onClick={() => void showDiff()}>Diff selected</button>}
            <EngineerOnly>
              <input type="file" ref={fileInput} style={{ maxWidth: 200 }} />
              <button className="primary" disabled={busy} onClick={() => void uploadVersion()}>Upload new version</button>
            </EngineerOnly>
          </div>
        }
      >
        <table>
          <thead>
            <tr><th /><th>Version</th><th>State</th><th>Source</th><th>Size</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {program.versions.map((v) => (
              <tr key={v.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={diffPick.includes(v.id)}
                    onChange={(e) => setDiffPick(e.target.checked ? [...diffPick, v.id].slice(-2) : diffPick.filter((x) => x !== v.id))}
                  />
                </td>
                <td>v{v.version}</td>
                <td>
                  <StatusBadge value={v.state} />
                  {v.releasedAt && v.state === 'released' && <div className="muted" style={{ fontSize: 11 }}>{v.releasedBy} · {fmtTime(v.releasedAt)}</div>}
                </td>
                <td>
                  {v.sourceKind === 'checkin' ? <StatusBadge value="checked in" /> : 'upload'}
                  {v.sourceDetail && <div className="muted" style={{ fontSize: 11 }}>{(() => { try { const d = JSON.parse(v.sourceDetail); return `from ${d.machine ?? '?'}`; } catch { return ''; } })()}</div>}
                </td>
                <td>{fmtBytes(v.size)}{v.isBinary ? ' (binary)' : ''}</td>
                <td className="muted">{v.createdBy} · {fmtTime(v.createdAt)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <a className="btn small" href={`/api/versions/${v.id}/content`}>Download</a>{' '}
                  <EngineerOnly>
                    {v.state === 'draft'
                      ? <button className="small primary" onClick={() => void setState(v, 'release')}>Release</button>
                      : <button className="small" onClick={() => void setState(v, 'unrelease')}>Back to draft</button>}{' '}
                  </EngineerOnly>
                  {(isEngineer || v.state === 'released') && machines.length > 0 && (
                    <select
                      defaultValue=""
                      className="small"
                      onChange={(e) => {
                        if (e.target.value) void pushTo(v.id, Number(e.target.value));
                        e.target.value = '';
                      }}
                    >
                      <option value="">Push to…</option>
                      {machines.map((m) => <option key={m.id} value={m.id}>{machineName(m)}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {diff && (
        <Section title={`Diff v${diff.a.version} → v${diff.b.version}`} right={<button onClick={() => setDiff(null)}>Close</button>}>
          <DiffView left={diff.left} right={diff.right} />
        </Section>
      )}

      {pushResults && (
        <Section title="Push results" right={<button onClick={() => setPushResults(null)}>Close</button>}>
          <table>
            <thead><tr><th>Machine</th><th>As</th><th>Status</th><th>Verify</th><th>Detail</th></tr></thead>
            <tbody>
              {pushResults.map((t) => (
                <tr key={t.id}>
                  <td>{machineById[t.machineId] ? machineName(machineById[t.machineId]!) : t.machineId}</td>
                  <td className="mono">{t.deployedName}</td>
                  <td><StatusBadge value={t.status} /></td>
                  <td><StatusBadge value={t.verifyResult} /></td>
                  <td className="muted">{t.errorExplanation ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <div className="grid2">
        <Section title="Assignments">
          <table>
            <tbody>
              {program.assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.targetKind === 'machine'
                      ? (a.machineId && machineById[a.machineId] ? <Link to={`/machines/${a.machineId}`}>{machineName(machineById[a.machineId]!)}</Link> : `machine ${a.machineId}`)
                      : `group ${a.groupId && groupById[a.groupId] ? groupById[a.groupId]!.name : a.groupId}`}
                  </td>
                  <td className="mono">{a.deployedName ?? program.name}</td>
                  <td className="mono muted">{a.dirAtCNC ?? a.subDir ?? ''}</td>
                  <td>
                    <EngineerOnly>
                      <button className="small danger" onClick={() => void run(async () => { await api.delete(`/api/assignments/${a.id}`); await reload(); })}>
                        Remove
                      </button>
                    </EngineerOnly>
                  </td>
                </tr>
              ))}
              {program.assignments.length === 0 && <tr><td className="muted">Not assigned to any machine.</td></tr>}
            </tbody>
          </table>
          <EngineerOnly>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Target</label>
                <select value={assignTarget} onChange={(e) => setAssignTarget(e.target.value)}>
                  <option value="">Choose…</option>
                  <optgroup label="Machines">
                    {machines.map((m) => <option key={m.id} value={`m${m.id}`}>{machineName(m)}</option>)}
                  </optgroup>
                  <optgroup label="Groups">
                    {groups.map((g) => <option key={g.id} value={`g${g.id}`}>{g.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="field">
                <label>Deployed name (optional)</label>
                <input value={assignName} onChange={(e) => setAssignName(e.target.value)} placeholder={program.name} />
              </div>
              <div className="field">
                <label>Target dir (optional)</label>
                <input value={assignDir} onChange={(e) => setAssignDir(e.target.value)} />
              </div>
              <div className="field">
                <button className="primary" disabled={!assignTarget || busy} onClick={() => void addAssignment()}>Assign</button>
              </div>
            </div>
          </EngineerOnly>
        </Section>

        <Section title="Fleet push">
          {!latestReleased ? (
            <p className="muted">Release a version to enable fleet push.</p>
          ) : (
            <>
              <p className="muted">
                Push released v{latestReleased.version} to many machines at once. Per-target results; FANUC targets land under the O-number in the content.
              </p>
              <select
                multiple
                size={Math.min(8, machines.length + groups.length)}
                style={{ width: '100%' }}
                value={fleetTargets}
                onChange={(e) => setFleetTargets([...e.target.selectedOptions].map((o) => o.value))}
              >
                <optgroup label="Groups">
                  {groups.map((g) => <option key={g.id} value={`g${g.id}`}>{g.name} ({g.machineIds.length} machines)</option>)}
                </optgroup>
                <optgroup label="Machines">
                  {machines.map((m) => <option key={m.id} value={`m${m.id}`}>{machineName(m)}</option>)}
                </optgroup>
              </select>
              <button className="primary" style={{ marginTop: 8 }} disabled={fleetTargets.length === 0 || busy} onClick={() => void fleetPush(latestReleased.id)}>
                Fleet push v{latestReleased.version}
              </button>
            </>
          )}
        </Section>
      </div>
    </>
  );
}

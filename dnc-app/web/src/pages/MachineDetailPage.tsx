import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api, fmtBytes, fmtTime, machineName,
  type Backup, type Machine, type MachineAssignment, type Transfer,
} from '../api';
import { EngineerOnly, useIsEngineer } from '../auth';
import { DiffView, ErrorBox, Section, StatusBadge, useAction } from '../components/common';

interface Listing {
  dirAtCNC: string;
  programs: string[];
  subDirs: string[];
}

export default function MachineDetailPage() {
  const { id } = useParams();
  const machinePk = Number(id);
  const isEngineer = useIsEngineer();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [assignments, setAssignments] = useState<MachineAssignment[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [dir, setDir] = useState<string | ''>('');
  const [current, setCurrent] = useState<{ fileName?: string; dirAtCNC?: string } | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [compare, setCompare] = useState<{ fileName: string; machineContent: string; libraryContent: string; match: boolean } | null>(null);
  const [lastTransfer, setLastTransfer] = useState<Transfer | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const browse = useAction();
  const act = useAction();

  const loadMachine = useCallback(async () => {
    const m = await api.get<Machine>(`/api/machines/${machinePk}`);
    setMachine(m);
    setAssignments(await api.get<MachineAssignment[]>(`/api/machines/${machinePk}/assignments`));
    setBackups(await api.get<Backup[]>(`/api/backups?machineId=${machinePk}`));
    try {
      const c = await api.get<{ current: { fileName?: string; dirAtCNC?: string } | null }>(`/api/machines/${machinePk}/current-program`);
      setCurrent(c.current);
    } catch {
      setCurrent(null);
    }
    return m;
  }, [machinePk]);

  const loadFiles = useCallback(
    (targetDir: string | '') =>
      browse.run(async () => {
        const qs = targetDir ? `?dirAtCNC=${encodeURIComponent(targetDir)}` : '';
        const l = await api.get<Listing>(`/api/machines/${machinePk}/files${qs}`);
        setListing(l);
        setDir(l.dirAtCNC);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machinePk],
  );

  useEffect(() => {
    void loadMachine().then(() => loadFiles(''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machinePk]);

  if (!machine) return <ErrorBox error={browse.error ?? act.error} />;
  const caps = machine.capabilities;

  const doPush = async (a: MachineAssignment, confirmReplace = false) => {
    if (!a.latestReleased) return;
    await act.run(async () => {
      setLastTransfer(null);
      const t = await api.post<Transfer>('/api/transfers/push', {
        machineId: machinePk,
        versionId: a.latestReleased!.id,
        confirmReplace,
      });
      setLastTransfer(t);
      if (t.status === 'failed' && t.errorMsg === 'collision' && !confirmReplace) {
        if (window.confirm(`${t.errorExplanation}\n\nProceed with the guarded replace?`)) {
          await doPush(a, true);
          return;
        }
      }
      await loadFiles(dir);
    });
  };

  const doSelect = async (fileName: string) => {
    let mode: string | undefined;
    if (caps.selectProgramRequiresMode) {
      mode = window.prompt('Okuma execution mode (A/B/S for machining centers; L/R for lathes):') ?? undefined;
      if (!mode) return;
    }
    await act.run(async () => {
      const r = await api.post<{ note: string | null }>(`/api/machines/${machinePk}/select-program`, {
        fileName, dirAtCNC: dir || undefined, mode,
      });
      setNote(r.note ?? `Selected ${fileName} as main program.`);
      await loadMachine();
    });
  };

  const doDelete = async (fileName: string) => {
    if (!window.confirm(`Delete "${fileName}" from the control? This cannot be undone on the machine.`)) return;
    await act.run(async () => {
      await api.delete(`/api/machines/${machinePk}/file?fileName=${encodeURIComponent(fileName)}${dir ? `&dirAtCNC=${encodeURIComponent(dir)}` : ''}`);
      await loadFiles(dir);
    });
  };

  const doPull = async (fileName: string) => {
    await act.run(async () => {
      const mapped = assignments.find((a) => a.deployedName === fileName);
      let newProgramName: string | undefined;
      if (!mapped) {
        newProgramName = window.prompt(`"${fileName}" maps to no library program. Capture it as a new program named:`, fileName) ?? undefined;
        if (!newProgramName) return;
      }
      const r = await api.post<{ transfer: Transfer; programId: number | null }>(`/api/machines/${machinePk}/pull`, {
        fileName, dirAtCNC: dir || undefined, newProgramName,
      });
      setLastTransfer(r.transfer);
      setNote(r.programId ? `Checked in as a new Draft version (program #${r.programId}).` : 'Pulled.');
    });
  };

  const doCompare = async (fileName: string) => {
    const mapped = assignments.find((a) => a.deployedName === fileName);
    if (!mapped?.latestReleased) {
      setNote(`"${fileName}" has no released library version to compare against.`);
      return;
    }
    await act.run(async () => {
      const r = await api.post<{ fileName: string; machineContent: string; libraryContent: string; match: boolean }>(
        `/api/machines/${machinePk}/compare`,
        { fileName, dirAtCNC: dir || undefined, versionId: mapped.latestReleased!.id },
      );
      setCompare(r);
    });
  };

  const doBackup = async () => {
    await act.run(async () => {
      await api.post(`/api/machines/${machinePk}/backups`, dir ? { dirAtCNC: dir } : {});
      setBackups(await api.get<Backup[]>(`/api/backups?machineId=${machinePk}`));
    });
  };

  const saveSettings = async (patch: Record<string, unknown>) => {
    await act.run(async () => {
      setMachine(await api.patch<Machine>(`/api/machines/${machinePk}`, patch));
    });
  };

  const parentDir = dir.includes('/') ? dir.replace(/\/+$/, '').split('/').slice(0, -1).join('/') || '/' : '';

  return (
    <>
      <h1>
        {machineName(machine)} <span className="muted" style={{ fontSize: 14 }}>{machine.label} · {machine.system} {machine.model}</span>
      </h1>
      <ErrorBox error={act.error} />
      {note && <div className="note-box" onClick={() => setNote(null)}>{note}</div>}

      <div className="grid2">
        <Section title="Running now">
          {current?.fileName ? (
            <>
              <span className="mono">{current.dirAtCNC ? `${current.dirAtCNC} / ` : ''}{current.fileName}</span>{' '}
              <StatusBadge value="running" />
              <p className="muted">Pushes that would replace this program are refused.</p>
            </>
          ) : (
            <span className="muted">No program running (or the control does not report it).</span>
          )}
        </Section>

        <Section title="Assigned programs">
          {assignments.length === 0 && <span className="muted">No programs assigned to this machine.</span>}
          <table>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td><Link to={`/programs/${a.programId}`}>{a.programName}</Link></td>
                  <td className="mono">{a.deployedName}</td>
                  <td>{a.latestReleased ? <StatusBadge value={`released v${a.latestReleased.version}` as never} /> : <StatusBadge value="draft" />}</td>
                  <td>
                    <button className="primary small" disabled={!a.latestReleased || act.busy} onClick={() => void doPush(a)}>
                      Push
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {lastTransfer && (
        <Section title={`Last transfer #${lastTransfer.id}`}>
          <StatusBadge value={lastTransfer.status} /> <StatusBadge value={lastTransfer.verifyResult} />
          {lastTransfer.errorExplanation && <div className="error-box">{lastTransfer.errorExplanation}</div>}
          <ul className="steps">
            {lastTransfer.steps.map((s, i) => (
              <li key={i}>{s.ok ? '✓' : '✗'} <b>{s.step}</b> <span className="muted">{s.detail}</span></li>
            ))}
          </ul>
          {lastTransfer.restorable && (
            <EngineerOnly>
              <button
                className="danger"
                onClick={() =>
                  void act.run(async () => {
                    const t = await api.post<Transfer>(`/api/transfers/${lastTransfer.id}/restore`);
                    setLastTransfer(t);
                    await loadFiles(dir);
                  })
                }
              >
                Restore safety snapshot
              </button>
            </EngineerOnly>
          )}
        </Section>
      )}

      <Section
        title="Machine storage"
        right={
          <div className="row">
            <EngineerOnly>
              <button
                disabled={!caps.createDeleteDir || act.busy}
                title={caps.createDeleteDir ? '' : `${machine.system} does not support creating directories`}
                onClick={() => {
                  const name = window.prompt('New directory name:');
                  if (name) void act.run(async () => { await api.post(`/api/machines/${machinePk}/dirs`, { dirName: name, dirAtCNC: dir || undefined }); await loadFiles(dir); });
                }}
              >
                New folder
              </button>
              <button disabled={act.busy} onClick={() => void doBackup()}>Backup this directory</button>
            </EngineerOnly>
            <button onClick={() => void loadFiles(dir)}>Refresh</button>
          </div>
        }
      >
        <div className="crumbs mono">
          {dir || caps.defaultRoot || '(default)'}
          {dir && parentDir !== dir && (
            <>
              {' · '}
              <a onClick={() => void loadFiles(parentDir === '/' && !dir.startsWith('/') ? '' : parentDir)}>up</a>
            </>
          )}
        </div>
        <ErrorBox error={browse.error} />
        {!caps.listSubDirs && <p className="muted">This control cannot list subdirectories; showing files only.</p>}
        <table>
          <tbody>
            {(listing?.subDirs ?? []).map((d) => (
              <tr key={`d-${d}`} className="clickable" onClick={() => void loadFiles(`${(dir || listing?.dirAtCNC || '').replace(/\/+$/, '')}/${d}`)}>
                <td>📁 {d}</td>
                <td colSpan={2} />
              </tr>
            ))}
            {(listing?.programs ?? []).map((p) => (
              <tr key={`f-${p}`}>
                <td className="mono">
                  {p} {current?.fileName === p && <StatusBadge value="running" />}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <a className="btn small" href={`/api/machines/${machinePk}/file?fileName=${encodeURIComponent(p)}${dir ? `&dirAtCNC=${encodeURIComponent(dir)}` : ''}`}>
                    Download
                  </a>{' '}
                  <button className="small" onClick={() => void doCompare(p)}>Compare</button>{' '}
                  {caps.selectProgram ? (
                    <button className="small" onClick={() => void doSelect(p)}>Select as main</button>
                  ) : (
                    <button className="small" disabled title={`${machine.system} does not support remote program selection`}>Select as main</button>
                  )}{' '}
                  <EngineerOnly>
                    <button className="small" onClick={() => void doPull(p)}>Pull to library</button>{' '}
                    <button className="small danger" onClick={() => void doDelete(p)}>Delete</button>
                  </EngineerOnly>
                </td>
              </tr>
            ))}
            {listing && listing.programs.length === 0 && listing.subDirs.length === 0 && (
              <tr><td className="muted">Empty directory.</td></tr>
            )}
          </tbody>
        </table>
      </Section>

      {compare && (
        <Section
          title={`Compare "${compare.fileName}" — machine vs latest released`}
          right={<button onClick={() => setCompare(null)}>Close</button>}
        >
          {compare.match ? (
            <p><StatusBadge value="in_sync" /> Machine copy matches the released library version (after normalization).</p>
          ) : (
            <>
              <p><StatusBadge value="drifted" /> Differences (− machine / + library):</p>
              <DiffView left={compare.machineContent} right={compare.libraryContent} />
            </>
          )}
        </Section>
      )}

      <Section title="Backups">
        <table>
          <thead>
            <tr><th>When</th><th>Kind</th><th>Directory</th><th>Size</th><th /></tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id}>
                <td>{fmtTime(b.createdAt)}</td>
                <td><StatusBadge value={b.kind} /></td>
                <td className="mono">{b.dirAtCNC ?? 'root'}</td>
                <td>{fmtBytes(b.size)}</td>
                <td>
                  <a className="btn small" href={`/api/backups/${b.id}/download`}>Download</a>{' '}
                  <EngineerOnly>
                    <button
                      className="small danger"
                      onClick={() => {
                        if (window.confirm('Delete this backup?')) {
                          void act.run(async () => {
                            await api.delete(`/api/backups/${b.id}`);
                            setBackups(await api.get<Backup[]>(`/api/backups?machineId=${machinePk}`));
                          });
                        }
                      }}
                    >
                      Delete
                    </button>
                  </EngineerOnly>
                </td>
              </tr>
            ))}
            {backups.length === 0 && <tr><td colSpan={5} className="muted">No backups yet.</td></tr>}
          </tbody>
        </table>
      </Section>

      {isEngineer && (
        <Section title="Machine settings (app-side)">
          <div className="row">
            <div className="field">
              <label>Display name</label>
              <input defaultValue={machine.displayName ?? ''} onBlur={(e) => void saveSettings({ displayName: e.target.value || null })} />
            </div>
            <div className="field">
              <label>Configured root dir {caps.defaultRoot === null && <b>(required — control reports none)</b>}</label>
              <input defaultValue={machine.configuredRootDir ?? ''} onBlur={(e) => void saveSettings({ configuredRootDir: e.target.value || null })} />
            </div>
            <div className="field">
              <label>Verify pushes (read-back)</label>
              <select defaultValue={machine.verifyOnPush ? '1' : '0'} onChange={(e) => void saveSettings({ verifyOnPush: e.target.value === '1' })}>
                <option value="1">On (recommended)</option>
                <option value="0">Off (slow link)</option>
              </select>
            </div>
            <div className="field">
              <label>Drift scan every (min, empty = off)</label>
              <input style={{ width: 90 }} defaultValue={machine.driftIntervalMinutes ?? ''} onBlur={(e) => void saveSettings({ driftIntervalMinutes: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="field">
              <label>Backup every (min, empty = off)</label>
              <input style={{ width: 90 }} defaultValue={machine.backupIntervalMinutes ?? ''} onBlur={(e) => void saveSettings({ backupIntervalMinutes: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="field">
              <label>Keep scheduled backups</label>
              <input style={{ width: 70 }} defaultValue={machine.backupRetentionCount} onBlur={(e) => void saveSettings({ backupRetentionCount: Number(e.target.value) || 10 })} />
            </div>
            <div className="field">
              <button onClick={() => void act.run(async () => { await api.post('/api/drift/scan', { machineId: machinePk }); await loadMachine(); })}>
                Scan drift now
              </button>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}

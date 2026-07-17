import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtTime, type Folder, type ProgramSummary } from '../api';
import { EngineerOnly } from '../auth';
import { ErrorBox, Section, StatusBadge, useAction } from '../components/common';

export default function LibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useAction();

  const reload = () =>
    run(async () => {
      setFolders(await api.get<Folder[]>('/api/library/tree'));
      const qs = new URLSearchParams();
      if (query) qs.set('query', query);
      if (selected) qs.set('folderId', String(selected));
      setPrograms(await api.get<ProgramSummary[]>(`/api/programs?${qs}`));
    });

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, query]);

  const upload = () =>
    run(async () => {
      const file = fileInput.current?.files?.[0];
      if (!file) return;
      const buf = await file.arrayBuffer();
      const qs = new URLSearchParams({ name: file.name });
      if (selected) qs.set('folderId', String(selected));
      await api.post(`/api/programs?${qs}`, buf);
      if (fileInput.current) fileInput.current.value = '';
      await reload();
    });

  const renderTree = (parentId: number | null): JSX.Element | null => {
    const children = folders.filter((f) => f.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <ul className="tree">
        {children.map((f) => (
          <li key={f.id}>
            <span className={`folder ${selected === f.id ? 'sel' : ''}`} onClick={() => setSelected(selected === f.id ? null : f.id)}>
              📁 {f.name}
            </span>
            <EngineerOnly>
              {' '}
              <button
                className="small"
                title="Rename"
                onClick={() => {
                  const name = window.prompt('Folder name:', f.name);
                  if (name) void run(async () => { await api.patch(`/api/library/folders/${f.id}`, { name }); await reload(); });
                }}
              >
                ✎
              </button>{' '}
              <button
                className="small danger"
                title="Delete (must be empty)"
                onClick={() => void run(async () => { await api.delete(`/api/library/folders/${f.id}`); if (selected === f.id) setSelected(null); await reload(); })}
              >
                ✕
              </button>
            </EngineerOnly>
            {renderTree(f.id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <h1>Program library</h1>
      <ErrorBox error={error} />
      <div className="grid2" style={{ gridTemplateColumns: '280px 1fr' }}>
        <Section
          title="Folders"
          right={
            <EngineerOnly>
              <button
                className="small"
                onClick={() => {
                  const name = window.prompt(selected ? 'New subfolder name:' : 'New folder name:');
                  if (name) void run(async () => { await api.post('/api/library/folders', { name, parentId: selected }); await reload(); });
                }}
              >
                + Folder
              </button>
            </EngineerOnly>
          }
        >
          <div>
            <span className={`folder ${selected === null ? 'sel' : ''}`} onClick={() => setSelected(null)} style={{ cursor: 'pointer' }}>
              📚 All programs
            </span>
          </div>
          {renderTree(null)}
        </Section>

        <div>
          <Section
            title="Programs"
            right={
              <div className="row">
                <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
                <EngineerOnly>
                  <input type="file" ref={fileInput} style={{ maxWidth: 200 }} />
                  <button className="primary" disabled={busy} onClick={() => void upload()}>
                    Upload{selected ? ' to folder' : ''}
                  </button>
                </EngineerOnly>
              </div>
            }
          >
            <table>
              <thead>
                <tr><th>Name</th><th>Latest</th><th>Released</th><th>Created</th></tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id}>
                    <td><Link to={`/programs/${p.id}`}>{p.name}</Link></td>
                    <td>v{p.latestVersion ?? '—'}</td>
                    <td>{p.latestReleasedVersion ? <StatusBadge value={`released v${p.latestReleasedVersion}` as never} /> : <StatusBadge value="draft" />}</td>
                    <td className="muted">{p.createdBy} · {fmtTime(p.createdAt)}</td>
                  </tr>
                ))}
                {programs.length === 0 && <tr><td colSpan={4} className="muted">No programs here yet.</td></tr>}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </>
  );
}

import { useState, type ReactNode } from 'react';
import { ApiError } from '../api';
import { diffLines } from '../diff';

export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="badge">—</span>;
  const cls =
    ['success', 'verified', 'in_sync', 'released', 'ok', 'online'].includes(value) ? 'ok'
    : ['failed', 'mismatch', 'drifted', 'offline', 'bad'].includes(value) ? 'bad'
    : ['unreachable', 'missing_on_machine', 'queued', 'running', 'unverified'].includes(value) ? 'warn'
    : ['draft', 'not_scanned'].includes(value) ? '' : 'info';
  return <span className={`badge ${cls}`}>{value.replace(/_/g, ' ')}</span>;
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error);
  return <div className="error-box">{msg}</div>;
}

/** Wraps an async action with busy/error state for buttons. */
export function useAction(): {
  busy: boolean;
  error: unknown;
  run: (fn: () => Promise<unknown>) => Promise<void>;
  clearError: () => void;
} {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  return {
    busy,
    error,
    clearError: () => setError(null),
    run: async (fn) => {
      setBusy(true);
      setError(null);
      try {
        await fn();
      } catch (err) {
        setError(err);
      } finally {
        setBusy(false);
      }
    },
  };
}

export function DiffView({ left, right }: { left: string; right: string }) {
  const lines = diffLines(left, right);
  return (
    <div className="diff">
      {lines.map((l, i) => (
        <div key={i} className={`line ${l.kind === 'add' ? 'add' : l.kind === 'del' ? 'del' : ''}`}>
          {l.kind === 'add' ? '+ ' : l.kind === 'del' ? '- ' : '  '}
          {l.text}
        </div>
      ))}
    </div>
  );
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="panel">
      <div className="spread">
        <h2 style={{ margin: 0 }}>{title}</h2>
        {right}
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

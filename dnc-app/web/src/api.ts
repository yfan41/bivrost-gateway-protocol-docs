export interface User {
  id: number;
  username: string;
  role: 'engineer' | 'operator';
  isActive: boolean;
}

export interface Gateway {
  id: number;
  name: string;
  baseUrl: string;
  enabled: boolean;
  lastSyncAt: string | null;
  lastSyncOk: boolean | null;
  lastSyncError: string | null;
}

export interface CapabilityProfile {
  defaultRoot: string | null;
  canSpecifyDir: boolean;
  listSubDirs: boolean;
  createDeleteDir: boolean;
  selectProgram: boolean;
  selectProgramNote: string | null;
  selectProgramRequiresMode: boolean;
  selectProgramNoop: boolean;
  requiresExtension: boolean;
  fanucContentNaming: boolean;
}

export interface Machine {
  id: number;
  gatewayId: number;
  machineID: string;
  name: string;
  system: string;
  model: string;
  encoding: string;
  isActive: boolean;
  displayName: string | null;
  verifyOnPush: boolean;
  configuredRootDir: string | null;
  backupIntervalMinutes: number | null;
  backupRetentionCount: number;
  driftIntervalMinutes: number | null;
  capabilities: CapabilityProfile;
  label: string;
}

export interface Group {
  id: number;
  gatewayId: number;
  groupID: string;
  name: string;
  machineIds: number[];
}

export interface ProgramSummary {
  id: number;
  folderId: number | null;
  name: string;
  createdBy: string;
  createdAt: string;
  latestVersion: number | null;
  latestReleasedVersion: number | null;
}

export interface Version {
  id: number;
  programId: number;
  version: number;
  state: 'draft' | 'released';
  size: number;
  isBinary: boolean;
  sourceKind: 'upload' | 'checkin';
  sourceDetail: string | null;
  createdBy: string;
  createdAt: string;
  releasedBy: string | null;
  releasedAt: string | null;
}

export interface Assignment {
  id: number;
  programId: number;
  targetKind: 'machine' | 'group';
  machineId: number | null;
  groupId: number | null;
  deployedName: string | null;
  dirAtCNC: string | null;
  subDir: string | null;
}

export interface ProgramDetail extends ProgramSummary {
  deletedAt: string | null;
  versions: Version[];
  assignments: Assignment[];
}

export interface TransferStep {
  step: string;
  ok: boolean;
  detail?: string;
  at: string;
}

export interface Transfer {
  id: number;
  kind: 'push' | 'pull' | 'restore';
  machineId: number;
  programId: number | null;
  versionId: number | null;
  deployedName: string | null;
  dirAtCNC: string | null;
  status: 'queued' | 'running' | 'success' | 'failed';
  verifyResult: 'verified' | 'unverified' | 'mismatch' | null;
  errorCode: number | null;
  errorMsg: string | null;
  errorExplanation: string | null;
  restorable: boolean;
  steps: TransferStep[];
  requestedBy: string;
  fleetBatchId: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface Folder {
  id: number;
  parentId: number | null;
  name: string;
}

export interface DriftItem {
  assignmentId: number;
  programId: number;
  programName: string;
  status: string;
  detail: string | null;
  lastCheckedAt: string | null;
}

export interface MachineDrift {
  machineId: number;
  status: string;
  lastCheckedAt: string | null;
  items: DriftItem[];
}

export interface Backup {
  id: number;
  machinePk: number;
  kind: 'manual' | 'scheduled';
  dirAtCNC: string | null;
  size: number;
  requestedBy: string;
  createdAt: string;
}

export interface MachineAssignment extends Assignment {
  programName: string;
  deployedName: string;
  latestReleased: { id: number; version: number } | null;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error?: string; explanation?: string; errorMsg?: string },
  ) {
    super(body.explanation ?? body.errorMsg ?? body.error ?? `HTTP ${status}`);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, headers: {} };
  if (body instanceof Blob || body instanceof ArrayBuffer) {
    init.body = body as BodyInit;
    (init.headers as Record<string, string>)['content-type'] = 'application/octet-stream';
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['content-type'] = 'application/json';
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  if (!res.ok) throw new ApiError(res.status, (parsed ?? {}) as ApiError['body']);
  return parsed as T;
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: <T>(url: string) => request<T>('DELETE', url),
};

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export function machineName(m: Machine): string {
  return m.displayName ?? m.name ?? m.machineID;
}

export type Role = 'engineer' | 'operator';

export interface User {
  id: number;
  username: string;
  role: Role;
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

export interface Machine {
  id: number;
  gatewayId: number;
  machineID: string;
  name: string;
  system: string;
  model: string;
  machineType: string;
  encoding: string;
  fileServerType: string;
  fileServerRootDir: string;
  isActive: boolean;
  displayName: string | null;
  verifyOnPush: boolean;
  configuredRootDir: string | null;
  backupIntervalMinutes: number | null;
  backupRetentionCount: number;
  driftIntervalMinutes: number | null;
  removedAt: string | null;
}

export interface MachineGroup {
  id: number;
  gatewayId: number;
  groupID: string;
  name: string;
  machineIds: number[];
}

export type VersionState = 'draft' | 'released';

export interface ProgramVersion {
  id: number;
  programId: number;
  version: number;
  state: VersionState;
  blobHash: string;
  size: number;
  isBinary: boolean;
  sourceKind: 'upload' | 'checkin';
  sourceDetail: string | null;
  createdBy: string;
  createdAt: string;
  releasedBy: string | null;
  releasedAt: string | null;
}

export interface Program {
  id: number;
  folderId: number | null;
  name: string;
  createdBy: string;
  createdAt: string;
  deletedAt: string | null;
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
  createdBy: string;
  createdAt: string;
}

export type TransferStatus = 'queued' | 'running' | 'success' | 'failed';
export type VerifyResult = 'verified' | 'unverified' | 'mismatch' | null;

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
  status: TransferStatus;
  verifyResult: VerifyResult;
  errorCode: number | null;
  errorMsg: string | null;
  errorExplanation: string | null;
  snapshotBlobHash: string | null;
  snapshotFileName: string | null;
  restorable: boolean;
  steps: TransferStep[];
  requestedBy: string;
  fleetBatchId: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export type DriftState = 'in_sync' | 'drifted' | 'unreachable' | 'not_scanned' | 'missing_on_machine';

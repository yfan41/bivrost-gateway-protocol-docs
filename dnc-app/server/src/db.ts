import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';

// Loaded via require: node:sqlite is newer than the builtin-module list of the
// bundlers that process this file (vite-node in tests).
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('engineer','operator')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gateways (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  last_sync_at TEXT,
  last_sync_ok INTEGER,
  last_sync_error TEXT
);

CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway_id INTEGER NOT NULL REFERENCES gateways(id),
  machine_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  system TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  machine_type TEXT NOT NULL DEFAULT '',
  encoding TEXT NOT NULL DEFAULT 'Default',
  file_server_type TEXT NOT NULL DEFAULT 'Machine Memory',
  file_server_root_dir TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  display_name TEXT,
  verify_on_push INTEGER NOT NULL DEFAULT 1,
  configured_root_dir TEXT,
  backup_interval_minutes INTEGER,
  backup_retention_count INTEGER NOT NULL DEFAULT 10,
  drift_interval_minutes INTEGER,
  removed_at TEXT,
  UNIQUE (gateway_id, machine_id)
);

CREATE TABLE IF NOT EXISTS machine_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway_id INTEGER NOT NULL REFERENCES gateways(id),
  group_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  UNIQUE (gateway_id, group_id)
);

CREATE TABLE IF NOT EXISTS machine_group_members (
  group_pk INTEGER NOT NULL REFERENCES machine_groups(id) ON DELETE CASCADE,
  machine_pk INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  PRIMARY KEY (group_pk, machine_pk)
);

CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES folders(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folder_id INTEGER REFERENCES folders(id),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS program_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  version INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','released')),
  blob_hash TEXT NOT NULL,
  size INTEGER NOT NULL,
  is_binary INTEGER NOT NULL DEFAULT 0,
  source_kind TEXT NOT NULL DEFAULT 'upload' CHECK (source_kind IN ('upload','checkin')),
  source_detail TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  released_by TEXT,
  released_at TEXT,
  UNIQUE (program_id, version)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  target_kind TEXT NOT NULL CHECK (target_kind IN ('machine','group')),
  machine_pk INTEGER REFERENCES machines(id),
  group_pk INTEGER REFERENCES machine_groups(id),
  deployed_name TEXT,
  dir_at_cnc TEXT,
  sub_dir TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('push','pull','restore')),
  machine_pk INTEGER NOT NULL REFERENCES machines(id),
  program_id INTEGER,
  version_id INTEGER,
  deployed_name TEXT,
  dir_at_cnc TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed')),
  verify_result TEXT CHECK (verify_result IN ('verified','unverified','mismatch')),
  error_code INTEGER,
  error_msg TEXT,
  error_explanation TEXT,
  snapshot_blob_hash TEXT,
  snapshot_file_name TEXT,
  restorable INTEGER NOT NULL DEFAULT 0,
  steps_json TEXT NOT NULL DEFAULT '[]',
  requested_by TEXT NOT NULL,
  fleet_batch_id TEXT,
  created_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS drift_status (
  machine_pk INTEGER NOT NULL REFERENCES machines(id),
  assignment_id INTEGER NOT NULL REFERENCES assignments(id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  status TEXT NOT NULL CHECK (status IN ('in_sync','drifted','unreachable','not_scanned','missing_on_machine')),
  detail TEXT,
  last_checked_at TEXT,
  PRIMARY KEY (machine_pk, assignment_id)
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_pk INTEGER NOT NULL REFERENCES machines(id),
  kind TEXT NOT NULL DEFAULT 'manual' CHECK (kind IN ('manual','scheduled')),
  dir_at_cnc TEXT,
  file_path TEXT NOT NULL,
  size INTEGER NOT NULL,
  requested_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  gateway_id INTEGER,
  machine_pk INTEGER,
  machine_label TEXT,
  program_id INTEGER,
  program_name TEXT,
  version_no INTEGER,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at);
CREATE INDEX IF NOT EXISTS idx_transfers_machine ON transfers(machine_pk);
CREATE INDEX IF NOT EXISTS idx_versions_program ON program_versions(program_id);
`;

export function openDatabase(path: string): DatabaseSyncType {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

export type DB = DatabaseSyncType;

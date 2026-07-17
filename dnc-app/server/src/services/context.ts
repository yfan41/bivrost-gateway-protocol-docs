import type { DB } from '../db.js';
import type { AppConfig } from '../config.js';
import { BlobStore } from '../store/blobs.js';
import { BivrostClient } from '../gateway/client.js';

export interface AppContext {
  db: DB;
  config: AppConfig;
  blobs: BlobStore;
  backupsDir: string;
  /** Client factory — overridable in tests if ever needed; normally built from the gateways table. */
  clientFor(gatewayId: number): BivrostClient;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createClientFactory(db: DB, timeoutMs: number): (gatewayId: number) => BivrostClient {
  return (gatewayId: number) => {
    const row = db.prepare('SELECT base_url, api_key, enabled FROM gateways WHERE id = ?').get(gatewayId) as
      | { base_url: string; api_key: string; enabled: number }
      | undefined;
    if (!row) throw new Error(`Unknown gateway ${gatewayId}`);
    return new BivrostClient(row.base_url, row.api_key, timeoutMs);
  };
}

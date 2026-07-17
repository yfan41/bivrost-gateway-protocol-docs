import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance, InjectOptions } from 'fastify';
import { buildApp, type BuiltApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { FakeGateway, type FakeMachineFixture, type FakeGroupFixture } from './fakeGateway.js';

export interface Session {
  cookie: string;
  api: (method: InjectOptions['method'], url: string, payload?: unknown, headers?: Record<string, string>) => Promise<{ status: number; body: any; raw: Buffer }>;
}

export interface Harness extends BuiltApp {
  fake: FakeGateway;
  gatewayId: number;
  admin: Session;
  as(username: string, password: string): Promise<Session>;
  createOperator(username?: string): Promise<Session>;
  addGateway(fake: FakeGateway, name: string): Promise<number>;
  machinePk(machineID: string, gatewayId?: number): number;
  dispose(): Promise<void>;
}

function makeSession(app: FastifyInstance, cookie: string): Session {
  return {
    cookie,
    api: async (method, url, payload, headers = {}) => {
      const isBuffer = Buffer.isBuffer(payload);
      const res = await app.inject({
        method,
        url,
        headers: {
          cookie,
          ...(payload !== undefined ? { 'content-type': isBuffer ? 'application/octet-stream' : 'application/json' } : {}),
          ...headers,
        },
        payload: payload === undefined ? undefined : isBuffer ? (payload as Buffer) : JSON.stringify(payload),
      });
      let body: unknown = null;
      try {
        body = JSON.parse(res.body);
      } catch {
        body = res.body;
      }
      return { status: res.statusCode, body, raw: res.rawPayload };
    },
  };
}

export const ADMIN = { username: 'admin', password: 'admin' };

export async function makeHarness(
  machines: FakeMachineFixture[],
  opts: { groups?: FakeGroupFixture[]; skipSync?: boolean } = {},
): Promise<Harness> {
  const dataDir = mkdtempSync(join(tmpdir(), 'dnc-test-'));
  const config = loadConfig({
    DNC_DATA_DIR: dataDir,
    DNC_GATEWAY_TIMEOUT_MS: '4000',
    DNC_SCHEDULER_TICK_MS: '3600000',
  } as NodeJS.ProcessEnv);
  const built = await buildApp(config, { dbPath: join(dataDir, 'db.sqlite') });

  const fake = new FakeGateway({ apiKey: 'test-key', machines, groups: opts.groups });
  await fake.listen();

  const login = async (username: string, password: string): Promise<Session> => {
    const res = await built.app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ username, password }),
    });
    if (res.statusCode !== 200) throw new Error(`login failed for ${username}: ${res.body}`);
    const setCookie = res.headers['set-cookie'];
    const cookieHeader = (Array.isArray(setCookie) ? setCookie[0] : setCookie) ?? '';
    return makeSession(built.app, cookieHeader.split(';')[0]!);
  };

  const admin = await login(ADMIN.username, ADMIN.password);

  const addGateway = async (gw: FakeGateway, name: string): Promise<number> => {
    const created = await admin.api('POST', '/api/gateways', { name, baseUrl: gw.url, apiKey: 'test-key' });
    if (created.status !== 200) throw new Error(`gateway create failed: ${JSON.stringify(created.body)}`);
    const sync = await admin.api('POST', `/api/gateways/${created.body.id}/sync`);
    if (sync.status !== 200) throw new Error(`gateway sync failed: ${JSON.stringify(sync.body)}`);
    return created.body.id as number;
  };

  let gatewayId = 0;
  if (!opts.skipSync) gatewayId = await addGateway(fake, 'gw1');

  let operatorCount = 0;
  const harness: Harness = {
    ...built,
    fake,
    gatewayId,
    admin,
    as: login,
    createOperator: async (username?: string) => {
      const name = username ?? `operator${++operatorCount}`;
      const res = await admin.api('POST', '/api/users', { username: name, password: 'op-pass', role: 'operator' });
      if (res.status !== 200) throw new Error(`operator create failed: ${JSON.stringify(res.body)}`);
      return login(name, 'op-pass');
    },
    addGateway,
    machinePk: (machineID: string, gwId?: number) => {
      const row = built.ctx.db
        .prepare('SELECT id FROM machines WHERE machine_id = ? AND gateway_id = ?')
        .get(machineID, gwId ?? gatewayId) as { id: number } | undefined;
      if (!row) throw new Error(`machine ${machineID} not synced`);
      return row.id;
    },
    dispose: async () => {
      await built.app.close();
      await fake.close().catch(() => undefined);
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
  return harness;
}

/** A plain Mock machine fixture: full capability, root '/'. */
export function mockMachine(machineID: string, files?: Record<string, Record<string, string>>): FakeMachineFixture {
  return { machineID, system: 'Mock', model: 'General', defaultRoot: '/', files, selectNoop: true };
}

/** A modern FANUC fixture with content naming and zero-stripped listings. */
export function fanucMachine(machineID: string, files?: Record<string, Record<string, string>>): FakeMachineFixture {
  return {
    machineID, system: 'Fanuc', model: '0i-F', defaultRoot: '//CNC_MEM/',
    fanucNaming: true, files, selectSupported: true,
  };
}

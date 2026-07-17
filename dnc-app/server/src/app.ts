import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import type { AppConfig } from './config.js';
import { openDatabase } from './db.js';
import { BlobStore } from './store/blobs.js';
import { createClientFactory, type AppContext } from './services/context.js';
import { ensureBootstrapUser } from './services/users.js';
import { TransferEngine } from './services/transfers.js';
import { Schedulers } from './services/schedulers.js';
import { makeAuthHook } from './http/auth.js';
import { registerRoutes } from './http/routes.js';

export interface BuiltApp {
  app: FastifyInstance;
  ctx: AppContext;
  engine: TransferEngine;
  schedulers: Schedulers;
}

export async function buildApp(config: AppConfig, opts: { dbPath?: string; logger?: boolean } = {}): Promise<BuiltApp> {
  const dbPath = opts.dbPath ?? join(config.dataDir, 'dnc.sqlite');
  const db = openDatabase(dbPath);
  const blobs = new BlobStore(join(config.dataDir, 'blobs'));
  const backupsDir = join(config.dataDir, 'backups');
  mkdirSync(backupsDir, { recursive: true });

  const ctx: AppContext = {
    db,
    config,
    blobs,
    backupsDir,
    clientFor: createClientFactory(db, config.gatewayTimeoutMs),
  };
  ensureBootstrapUser(ctx);

  const engine = new TransferEngine(ctx);
  const schedulers = new Schedulers(ctx);

  const app = Fastify({ logger: opts.logger ?? false, bodyLimit: 64 * 1024 * 1024 });
  await app.register(cookie);
  app.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (_req, body, done) => done(null, body));
  app.addHook('preHandler', makeAuthHook(ctx));
  registerRoutes(app, { ctx, engine });

  if (config.webDistDir && existsSync(config.webDistDir)) {
    const fastifyStatic = (await import('@fastify/static')).default;
    await app.register(fastifyStatic, { root: config.webDistDir });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api')) return reply.code(404).send({ error: 'not_found' });
      return reply.sendFile('index.html');
    });
  }

  return { app, ctx, engine, schedulers };
}

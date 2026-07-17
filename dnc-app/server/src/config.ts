export interface AppConfig {
  port: number;
  dataDir: string;
  sessionTtlHours: number;
  gatewayTimeoutMs: number;
  bootstrapUser: string;
  bootstrapPassword: string;
  /** How often the scheduler tick runs; individual jobs decide if they are due. */
  schedulerTickMs: number;
  registrySyncMinutes: number;
  webDistDir: string | null;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.DNC_PORT ?? 8340),
    dataDir: env.DNC_DATA_DIR ?? './data',
    sessionTtlHours: Number(env.DNC_SESSION_TTL_HOURS ?? 720),
    gatewayTimeoutMs: Number(env.DNC_GATEWAY_TIMEOUT_MS ?? 30000),
    bootstrapUser: env.DNC_BOOTSTRAP_USER ?? 'admin',
    bootstrapPassword: env.DNC_BOOTSTRAP_PASSWORD ?? 'admin',
    schedulerTickMs: Number(env.DNC_SCHEDULER_TICK_MS ?? 60000),
    registrySyncMinutes: Number(env.DNC_REGISTRY_SYNC_MINUTES ?? 10),
    webDistDir: env.DNC_WEB_DIST ?? null,
  };
}

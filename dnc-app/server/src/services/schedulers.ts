import type { AppContext } from './context.js';
import { scanMachine } from './drift.js';
import { createBackup } from './backups.js';
import { syncGateway } from './gateways.js';

interface MachineSchedRow {
  id: number;
  drift_interval_minutes: number | null;
  backup_interval_minutes: number | null;
}

/**
 * Cooperative schedulers: one tick loop; each job runs when due. Failures are
 * recorded (drift status, gateway sync state) rather than thrown — an offline
 * machine or gateway must not take the tick down.
 */
export class Schedulers {
  private timer: NodeJS.Timeout | null = null;
  private lastRun = new Map<string, number>();
  private running = false;

  constructor(private readonly ctx: AppContext) {}

  start(): void {
    this.timer = setInterval(() => void this.tick(), this.ctx.config.schedulerTickMs);
    this.timer.unref();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private due(key: string, intervalMinutes: number, now: number): boolean {
    const last = this.lastRun.get(key) ?? 0;
    return now - last >= intervalMinutes * 60_000;
  }

  async tick(now = Date.now()): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const gateways = this.ctx.db.prepare('SELECT id FROM gateways WHERE enabled = 1').all() as unknown as Array<{ id: number }>;
      for (const g of gateways) {
        const key = `sync:${g.id}`;
        if (this.due(key, this.ctx.config.registrySyncMinutes, now)) {
          this.lastRun.set(key, now);
          await syncGateway(this.ctx, g.id).catch(() => undefined);
        }
      }

      const machines = this.ctx.db
        .prepare('SELECT id, drift_interval_minutes, backup_interval_minutes FROM machines WHERE removed_at IS NULL AND is_active = 1')
        .all() as unknown as MachineSchedRow[];
      for (const m of machines) {
        if (m.drift_interval_minutes) {
          const key = `drift:${m.id}`;
          if (this.due(key, m.drift_interval_minutes, now)) {
            this.lastRun.set(key, now);
            await scanMachine(this.ctx, m.id).catch(() => undefined);
          }
        }
        if (m.backup_interval_minutes) {
          const key = `backup:${m.id}`;
          if (this.due(key, m.backup_interval_minutes, now)) {
            this.lastRun.set(key, now);
            await createBackup(this.ctx, m.id, { kind: 'scheduled', requestedBy: 'scheduler' }).catch(() => undefined);
          }
        }
      }
    } finally {
      this.running = false;
    }
  }
}

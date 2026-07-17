import { GatewayError } from './errors.js';

export interface DirRef {
  dirAtCNC?: string | null;
  subDir?: string | null;
}

export interface ProgramListing {
  dirAtCNC: string;
  programs: string[];
  subDirs: string[];
}

export interface CurrentProgram {
  dirAtCNC: string;
  fileName: string;
  content?: string;
  encoding?: string;
  base64?: string;
}

export interface BatchSendTarget {
  machineID: string;
  fileName: string;
  dirAtCNC?: string;
  subDir?: string;
}

export interface BatchResult {
  errorCode: number;
  errorMsg: string;
}

export interface GatewayMachineConfig {
  id: number;
  machineType: string;
  system: string;
  model: string;
  name: string;
  machineID: string;
  encoding?: string;
  isActive?: boolean;
  fileServerType?: string;
  fileServerRootDir?: string;
  [key: string]: unknown;
}

export interface GatewayGroupConfig {
  id: number;
  groupID: string;
  name: string;
  machines: Array<{ machineID: string }>;
}

export interface BackupRequest {
  machineID: string;
  fileName?: string;
  dirAtCNC?: string;
  subDir?: string;
  includeSubDir?: boolean;
}

/**
 * The one client for the Bivrost gateway HTTP protocol. Nothing else in the
 * backend talks gateway HTTP. Transfers always use the stream endpoints.
 */
export class BivrostClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs = 30000,
  ) {}

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const h: Record<string, string> = { ...extra };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  private url(path: string, params: Record<string, string | undefined | null> = {}): string {
    const u = new URL(path, this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, v);
    }
    return u.toString();
  }

  private async fetchRaw(url: string, init: RequestInit = {}): Promise<Response> {
    let res: Response;
    try {
      res = await fetch(url, { ...init, signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (err) {
      throw new GatewayError(null, err instanceof Error ? err.message : String(err));
    }
    if (!res.ok) {
      // The gateway may still deliver a protocol error body on non-2xx.
      const body = await res.text().catch(() => '');
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed?.errorCode === 'number') {
          throw new GatewayError(parsed.errorCode, parsed.errorMsg ?? 'Error', parsed.statusMsg);
        }
      } catch (err) {
        if (err instanceof GatewayError) throw err;
      }
      throw new GatewayError(null, `HTTP ${res.status} from gateway`);
    }
    return res;
  }

  /** GET returning JSON; throws GatewayError when the body carries a non-zero errorCode. */
  private async getJson<T>(path: string, params: Record<string, string | undefined | null> = {}): Promise<T> {
    const res = await this.fetchRaw(this.url(path, params), { headers: this.headers() });
    const data = (await res.json()) as T & { errorCode?: number; errorMsg?: string; statusMsg?: string };
    if (typeof data?.errorCode === 'number' && data.errorCode !== 0) {
      throw new GatewayError(data.errorCode, data.errorMsg ?? 'Error', data.statusMsg);
    }
    return data;
  }

  private dirParams(dir: DirRef): Record<string, string | undefined | null> {
    return { dirAtCNC: dir.dirAtCNC ?? undefined, subDir: dir.subDir ?? undefined };
  }

  // ---- §2.6 file management ----

  async readProgramList(machineID: string, dir: DirRef = {}): Promise<ProgramListing> {
    return this.getJson('api/cnc/readProgramList', { machineID, ...this.dirParams(dir) });
  }

  async receiveFileStream(machineID: string, fileName: string, dir: DirRef = {}): Promise<Buffer> {
    const res = await this.fetchRaw(
      this.url('api/cnc/receiveFileStream', { machineID, fileName, ...this.dirParams(dir) }),
      { headers: this.headers() },
    );
    const buf = Buffer.from(await res.arrayBuffer());
    // An error may arrive as a JSON body on 200.
    if (buf.length < 4096 && (res.headers.get('content-type') ?? '').includes('json')) {
      try {
        const parsed = JSON.parse(buf.toString('utf8'));
        if (typeof parsed?.errorCode === 'number' && parsed.errorCode !== 0) {
          throw new GatewayError(parsed.errorCode, parsed.errorMsg ?? 'Error', parsed.statusMsg);
        }
      } catch (err) {
        if (err instanceof GatewayError) throw err;
      }
    }
    return buf;
  }

  /** Returns null when no program is currently running (errorCode 158). */
  async readCurrentProgram(machineID: string): Promise<CurrentProgram | null> {
    try {
      return await this.getJson<CurrentProgram>('api/cnc/readCurrentProgram', { machineID });
    } catch (err) {
      if (err instanceof GatewayError && err.errorCode === 158) return null;
      throw err;
    }
  }

  async sendFileStream(machineID: string, fileName: string, dir: DirRef, body: Buffer): Promise<void> {
    const res = await this.fetchRaw(
      this.url('api/cnc/sendFileStream', { machineID, fileName, ...this.dirParams(dir) }),
      {
        method: 'POST',
        headers: this.headers({ 'content-type': 'application/octet-stream' }),
        body: new Uint8Array(body),
      },
    );
    const data = (await res.json()) as { errorCode: number; errorMsg: string; statusMsg?: string };
    if (data.errorCode !== 0) throw new GatewayError(data.errorCode, data.errorMsg, data.statusMsg);
  }

  async batchSendFile(
    body: { content?: string; encoding?: string; base64?: string },
    targets: BatchSendTarget[],
  ): Promise<BatchResult[]> {
    const res = await this.fetchRaw(this.url('api/cnc/batchSendFile'), {
      method: 'POST',
      headers: this.headers({ 'content-type': 'application/json' }),
      body: JSON.stringify({ ...body, targets }),
    });
    return (await res.json()) as BatchResult[];
  }

  async deleteFile(machineID: string, fileName: string, dir: DirRef = {}): Promise<void> {
    await this.getJson('api/cnc/deleteFile', { machineID, fileName, ...this.dirParams(dir) });
  }

  async createDir(machineID: string, dirName: string, dir: DirRef = {}): Promise<void> {
    await this.getJson('api/cnc/createDir', { machineID, dirName, ...this.dirParams(dir) });
  }

  async deleteDir(machineID: string, dirName: string, dir: DirRef = {}): Promise<void> {
    await this.getJson('api/cnc/deleteDir', { machineID, dirName, ...this.dirParams(dir) });
  }

  async selectProgram(machineID: string, fileName: string, dir: DirRef = {}, mode?: string): Promise<void> {
    await this.getJson('api/cnc/selectProgram', { machineID, fileName, mode, ...this.dirParams(dir) });
  }

  async readAllPrograms(machineID: string, dir: DirRef = {}): Promise<Array<{ dirAtCNC: string; fileName: string }>> {
    const data = await this.getJson<{ programs: Array<{ dirAtCNC: string; fileName: string }> }>(
      'api/cnc/readAllPrograms',
      { machineID, ...this.dirParams(dir) },
    );
    return data.programs;
  }

  async searchFile(machineID: string, fileName: string, dir: DirRef = {}): Promise<ProgramListing> {
    return this.getJson('api/cnc/searchFile', { machineID, fileName, ...this.dirParams(dir) });
  }

  /** Returns the backup ZIP as a buffer. A JSON error body aborts the whole backup. */
  async backupFiles(requests: BackupRequest[]): Promise<Buffer> {
    const res = await this.fetchRaw(this.url('api/cnc/backupFiles'), {
      method: 'POST',
      headers: this.headers({ 'content-type': 'application/json' }),
      body: JSON.stringify(requests),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    if ((res.headers.get('content-type') ?? '').includes('json')) {
      try {
        const parsed = JSON.parse(buf.toString('utf8'));
        if (typeof parsed?.errorCode === 'number' && parsed.errorCode !== 0) {
          throw new GatewayError(parsed.errorCode, parsed.errorMsg ?? 'Error', parsed.statusMsg);
        }
      } catch (err) {
        if (err instanceof GatewayError) throw err;
      }
    }
    return buf;
  }

  // ---- §2.9.3 / §2.9.4 configuration (read-only) ----

  async machineConfigs(): Promise<GatewayMachineConfig[]> {
    return this.getJson('api/config/machines');
  }

  async groupConfigs(): Promise<GatewayGroupConfig[]> {
    return this.getJson('api/config/groups');
  }
}

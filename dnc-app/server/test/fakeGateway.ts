import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

/**
 * In-process fake Bivrost gateway implementing the documented /api/cnc/* and
 * /api/config contract (protocol doc §2.6, §2.9.3, §2.9.4), fixture-configurable
 * per test. It reproduces the protocol quirks the app must handle:
 * - no overwrite on send (errorCode 142) — delete first
 * - FANUC name derivation from content and leading-zero stripping on listings
 * - dirAtCNC precedence over subDir
 * - errorCode 158 for missing paths / no running program
 * - batch endpoints returning positional results
 * - backupFiles aborting with a JSON error body
 */

export interface FakeMachineFixture {
  machineID: string;
  system: string;
  model: string;
  name?: string;
  encoding?: string;
  fileServerType?: string;
  fileServerRootDir?: string;
  /** Control default root; null models Haas/shared folders that report none. */
  defaultRoot?: string | null;
  /** Whether readProgramList returns subdirectories. */
  listsSubDirs?: boolean;
  /** FANUC content naming + zero-stripped listings. */
  fanucNaming?: boolean;
  files?: Record<string, Record<string, string>>;
  extraDirs?: string[];
  currentProgram?: { dirAtCNC: string; fileName: string } | null;
  selectSupported?: boolean;
  selectRequiresMode?: boolean;
  /** Mock semantics: selectProgram always succeeds without changing state. */
  selectNoop?: boolean;
}

export interface FakeGroupFixture {
  groupID: string;
  name: string;
  machineIDs: string[];
}

interface MachineState {
  cfg: FakeMachineFixture;
  files: Map<string, Map<string, Buffer>>;
  currentProgram: { dirAtCNC: string; fileName: string } | null;
  offline: boolean;
  failNextSend: boolean;
  corruptOnSend: boolean;
  sendDelayMs: number;
}

function canonical(name: string): string {
  const m = name.match(/^[Oo]0*(\d+)$/);
  return m?.[1] ? `O${Number(m[1])}` : name;
}

function fanucNameFromContent(content: string): string | null {
  const first = content.indexOf('\n');
  if (first === -1) return null;
  const second = content.indexOf('\n', first + 1);
  const raw = (second === -1 ? content.slice(first + 1) : content.slice(first + 1, second)).trim();
  const angled = raw.match(/^<(.+)>/);
  if (angled?.[1]) return angled[1].trim();
  const oNum = raw.match(/^[Oo]0*(\d+)/);
  if (oNum?.[1]) return `O${String(Number(oNum[1])).padStart(4, '0')}`;
  return raw.split(/[\s(]/)[0] || null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class FakeGateway {
  private server: Server;
  private machines = new Map<string, MachineState>();
  groups: FakeGroupFixture[] = [];
  apiKey: string | null;
  offlineAll = false;
  /** Every handled call, e.g. "M1:sendFileStream" or "config:machines" — for asserting the backend blocks before calling. */
  calls: string[] = [];
  url = '';

  constructor(opts: { apiKey?: string; machines?: FakeMachineFixture[]; groups?: FakeGroupFixture[] } = {}) {
    this.apiKey = opts.apiKey ?? null;
    for (const m of opts.machines ?? []) this.addMachine(m);
    this.groups = opts.groups ?? [];
    this.server = createServer((req, res) => void this.handle(req, res));
  }

  addMachine(cfg: FakeMachineFixture): void {
    const files = new Map<string, Map<string, Buffer>>();
    const root = cfg.defaultRoot === undefined ? '/' : cfg.defaultRoot;
    if (root !== null) files.set(root, new Map());
    for (const [dir, entries] of Object.entries(cfg.files ?? {})) {
      const dirMap = files.get(dir) ?? new Map<string, Buffer>();
      for (const [name, content] of Object.entries(entries)) dirMap.set(name, Buffer.from(content));
      files.set(dir, dirMap);
    }
    for (const dir of cfg.extraDirs ?? []) if (!files.has(dir)) files.set(dir, new Map());
    this.machines.set(cfg.machineID, {
      cfg, files, currentProgram: cfg.currentProgram ?? null,
      offline: false, failNextSend: false, corruptOnSend: false, sendDelayMs: 0,
    });
  }

  machine(machineID: string): MachineState {
    const m = this.machines.get(machineID);
    if (!m) throw new Error(`fixture machine ${machineID} missing`);
    return m;
  }

  /** Files currently in a machine directory, as strings. */
  filesAt(machineID: string, dir: string): Record<string, string> {
    const dirMap = this.machine(machineID).files.get(dir);
    return Object.fromEntries([...(dirMap ?? new Map())].map(([k, v]) => [k, (v as Buffer).toString('utf8')]));
  }

  setFile(machineID: string, dir: string, name: string, content: string): void {
    const m = this.machine(machineID);
    const dirMap = m.files.get(dir) ?? new Map<string, Buffer>();
    dirMap.set(name, Buffer.from(content));
    m.files.set(dir, dirMap);
  }

  removeFile(machineID: string, dir: string, name: string): void {
    this.machine(machineID).files.get(dir)?.delete(name);
  }

  async listen(): Promise<string> {
    await new Promise<void>((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    const addr = this.server.address() as AddressInfo;
    this.url = `http://127.0.0.1:${addr.port}`;
    return this.url;
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => this.server.close((err) => (err ? reject(err) : resolve())));
  }

  // ---- request handling ----

  private json(res: ServerResponse, body: unknown, status = 200): void {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  }

  private err(res: ServerResponse, errorCode: number, errorMsg: string, statusMsg?: string): void {
    this.json(res, { errorCode, errorMsg, ...(statusMsg ? { statusMsg } : {}) });
  }

  private async readBody(req: IncomingMessage): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks);
  }

  /** dirAtCNC wins over subDir; subDir joins onto the default root; no dir + no root = 158. */
  private resolveDir(m: MachineState, q: URLSearchParams): string | null {
    const dirAtCNC = q.get('dirAtCNC');
    const subDir = q.get('subDir');
    if (dirAtCNC) return dirAtCNC;
    const root = m.cfg.defaultRoot === undefined ? '/' : m.cfg.defaultRoot;
    if (subDir) {
      if (root === null) return null;
      return root.replace(/\/+$/, '') + '/' + subDir;
    }
    return root;
  }

  private findFile(m: MachineState, dir: string, fileName: string): { name: string; content: Buffer } | null {
    const dirMap = m.files.get(dir);
    if (!dirMap) return null;
    for (const [name, content] of dirMap) {
      if (canonical(name) === canonical(fileName)) return { name, content };
    }
    return null;
  }

  private listedName(m: MachineState, storedName: string): string {
    if (m.cfg.fanucNaming) {
      const match = storedName.match(/^[Oo]0*(\d+)$/);
      if (match?.[1]) return `O${Number(match[1])}`;
    }
    return storedName;
  }

  private subDirsOf(m: MachineState, dir: string): string[] {
    if (m.cfg.listsSubDirs === false) return [];
    const prefix = dir.replace(/\/+$/, '') + '/';
    const subs = new Set<string>();
    for (const key of m.files.keys()) {
      if (key !== dir && key.startsWith(prefix)) {
        const rest = key.slice(prefix.length).replace(/^\/+/, '');
        const first = rest.split('/')[0];
        if (first) subs.add(first);
      }
    }
    return [...subs];
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://fake');
    const path = url.pathname;
    const q = url.searchParams;

    if (this.offlineAll) {
      req.socket.destroy();
      return;
    }
    if (this.apiKey && req.headers.authorization !== `Bearer ${this.apiKey}`) {
      this.json(res, { error: 'unauthorized' }, 401);
      return;
    }

    if (path === '/api/config/machines') {
      this.calls.push('config:machines');
      this.json(res, [...this.machines.values()].map((m) => ({
        id: 1, machineType: 'CNC', system: m.cfg.system, model: m.cfg.model,
        name: m.cfg.name ?? m.cfg.machineID, machineID: m.cfg.machineID,
        encoding: m.cfg.encoding ?? 'Default', isActive: true,
        fileServerType: m.cfg.fileServerType ?? 'Machine Memory',
        fileServerRootDir: m.cfg.fileServerRootDir ?? '',
      })));
      return;
    }
    if (path === '/api/config/groups') {
      this.calls.push('config:groups');
      this.json(res, this.groups.map((g, i) => ({
        id: i + 1, groupID: g.groupID, name: g.name,
        machines: g.machineIDs.map((machineID) => ({ machineID })),
      })));
      return;
    }

    if (path === '/api/cnc/batchSendFile') {
      const body = JSON.parse((await this.readBody(req)).toString('utf8')) as {
        content?: string; base64?: string;
        targets: Array<{ machineID: string; fileName: string; dirAtCNC?: string; DirAtCNC?: string; subDir?: string; SubDir?: string }>;
      };
      this.calls.push('batchSendFile');
      const payload = body.content !== undefined ? Buffer.from(body.content) : Buffer.from(body.base64 ?? '', 'base64');
      const results = body.targets.map((t) => {
        const m = this.machines.get(t.machineID);
        if (!m) return { errorCode: 10003, errorMsg: 'Machine ID does not exist.' };
        if (m.offline) return { errorCode: 1, errorMsg: 'Machine is offline.' };
        const params = new URLSearchParams();
        const dirAtCNC = t.dirAtCNC ?? t.DirAtCNC;
        const subDir = t.subDir ?? t.SubDir;
        if (dirAtCNC) params.set('dirAtCNC', dirAtCNC);
        if (subDir) params.set('subDir', subDir);
        const dir = this.resolveDir(m, params);
        if (dir === null) return { errorCode: 158, errorMsg: 'Path is not found.' };
        return this.storeFile(m, dir, t.fileName, payload);
      });
      this.json(res, results);
      return;
    }

    if (path === '/api/cnc/backupFiles') {
      const body = JSON.parse((await this.readBody(req)).toString('utf8')) as Array<{
        machineID: string; fileName?: string; dirAtCNC?: string; DirAtCNC?: string; subDir?: string; SubDir?: string; includeSubDir?: boolean;
      }>;
      this.calls.push('backupFiles');
      const manifest: Array<{ machineID: string; dir: string; fileName: string; size: number }> = [];
      for (const r of body) {
        const m = this.machines.get(r.machineID);
        if (!m) {
          this.err(res, 10003, 'Machine ID does not exist.', `Invalid MachineID (${r.machineID})`);
          return;
        }
        if (m.offline) {
          this.err(res, 1, 'Machine is offline.', `MachineID (${r.machineID})`);
          return;
        }
        const params = new URLSearchParams();
        const dirAtCNC = r.dirAtCNC ?? r.DirAtCNC;
        const subDir = r.subDir ?? r.SubDir;
        if (dirAtCNC) params.set('dirAtCNC', dirAtCNC);
        if (subDir) params.set('subDir', subDir);
        const base = this.resolveDir(m, params);
        if (base === null) {
          this.err(res, 158, 'Path is not found.');
          return;
        }
        for (const [dir, dirMap] of m.files) {
          const inScope = dir === base || (r.includeSubDir !== false && dir.startsWith(base.replace(/\/+$/, '') + '/'));
          if (!inScope) continue;
          for (const [name, content] of dirMap) {
            if (r.fileName && canonical(name) !== canonical(r.fileName)) continue;
            manifest.push({ machineID: r.machineID, dir, fileName: name, size: content.length });
          }
        }
      }
      const zip = Buffer.concat([Buffer.from('PKFAKEZIP:'), Buffer.from(JSON.stringify(manifest))]);
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      res.end(zip);
      return;
    }

    // Remaining /api/cnc/* endpoints address a single machine via query.
    if (path.startsWith('/api/cnc/')) {
      const op = path.slice('/api/cnc/'.length);
      const machineID = q.get('machineID') ?? '';
      const m = this.machines.get(machineID);
      if (!m) {
        this.err(res, 10003, 'Machine ID does not exist.');
        return;
      }
      this.calls.push(`${machineID}:${op}`);
      if (m.offline) {
        req.socket.destroy();
        return;
      }

      switch (op) {
        case 'readProgramList': {
          const dir = this.resolveDir(m, q);
          if (dir === null || !m.files.has(dir)) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          this.json(res, {
            dirAtCNC: dir,
            programs: [...m.files.get(dir)!.keys()].map((n) => this.listedName(m, n)),
            subDirs: this.subDirsOf(m, dir),
          });
          return;
        }
        case 'receiveFileStream': {
          const dir = this.resolveDir(m, q);
          const found = dir !== null ? this.findFile(m, dir, q.get('fileName') ?? '') : null;
          if (!found) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          res.writeHead(200, { 'content-type': 'application/octet-stream' });
          res.end(found.content);
          return;
        }
        case 'readCurrentProgram': {
          if (!m.currentProgram) {
            this.err(res, 158, 'Path is not found.', 'No content.');
            return;
          }
          const found = this.findFile(m, m.currentProgram.dirAtCNC, m.currentProgram.fileName);
          this.json(res, {
            dirAtCNC: m.currentProgram.dirAtCNC,
            fileName: m.currentProgram.fileName,
            content: found ? found.content.toString('utf8') : '',
            encoding: 'us-ascii',
          });
          return;
        }
        case 'sendFileStream': {
          const body = await this.readBody(req);
          if (m.sendDelayMs) await sleep(m.sendDelayMs);
          if (m.failNextSend) {
            m.failNextSend = false;
            this.err(res, 1, 'Send failed.');
            return;
          }
          const dir = this.resolveDir(m, q);
          if (dir === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          const result = this.storeFile(m, dir, q.get('fileName') ?? '', body);
          this.json(res, result);
          return;
        }
        case 'deleteFile': {
          const dir = this.resolveDir(m, q);
          const found = dir !== null ? this.findFile(m, dir, q.get('fileName') ?? '') : null;
          if (!found || dir === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          m.files.get(dir)!.delete(found.name);
          this.json(res, { errorCode: 0, errorMsg: 'Success' });
          return;
        }
        case 'createDir': {
          const dir = this.resolveDir(m, q);
          if (dir === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          const newDir = dir.replace(/\/+$/, '') + '/' + (q.get('dirName') ?? '');
          if (!m.files.has(newDir)) m.files.set(newDir, new Map());
          this.json(res, { errorCode: 0, errorMsg: 'Success' });
          return;
        }
        case 'deleteDir': {
          const dir = this.resolveDir(m, q);
          const target = dir === null ? null : dir.replace(/\/+$/, '') + '/' + (q.get('dirName') ?? '');
          if (!target || !m.files.has(target)) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          if (m.files.get(target)!.size > 0) {
            this.err(res, 1, 'Directory is not empty.');
            return;
          }
          m.files.delete(target);
          this.json(res, { errorCode: 0, errorMsg: 'Success' });
          return;
        }
        case 'selectProgram': {
          if (m.cfg.selectNoop) {
            this.json(res, { errorCode: 0, errorMsg: 'Success' });
            return;
          }
          if (!m.cfg.selectSupported) {
            this.err(res, 1, 'Not supported.');
            return;
          }
          if (m.cfg.selectRequiresMode && !q.get('mode')) {
            this.err(res, 1, 'Mode is required.');
            return;
          }
          const dir = this.resolveDir(m, q);
          const found = dir !== null ? this.findFile(m, dir, q.get('fileName') ?? '') : null;
          if (!found || dir === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          m.currentProgram = { dirAtCNC: dir, fileName: found.name };
          this.json(res, { errorCode: 0, errorMsg: 'Success' });
          return;
        }
        case 'readAllPrograms': {
          const base = this.resolveDir(m, q);
          if (base === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          const programs: Array<{ dirAtCNC: string; fileName: string }> = [];
          for (const [dir, dirMap] of m.files) {
            if (dir !== base && !dir.startsWith(base.replace(/\/+$/, '') + '/')) continue;
            for (const name of dirMap.keys()) programs.push({ dirAtCNC: dir, fileName: this.listedName(m, name) });
          }
          this.json(res, { programs });
          return;
        }
        case 'searchFile': {
          const target = q.get('fileName') ?? '';
          const base = this.resolveDir(m, q);
          if (base === null) {
            this.err(res, 158, 'Path is not found.');
            return;
          }
          for (const [dir, dirMap] of m.files) {
            if (dir !== base && !dir.startsWith(base.replace(/\/+$/, '') + '/')) continue;
            for (const name of dirMap.keys()) {
              if (canonical(name) === canonical(target)) {
                this.json(res, {
                  dirAtCNC: dir,
                  programs: [...dirMap.keys()].map((n) => this.listedName(m, n)),
                  subDirs: this.subDirsOf(m, dir),
                });
                return;
              }
            }
          }
          this.err(res, 158, 'Path is not found.');
          return;
        }
        default:
          this.err(res, 1, `Unknown operation ${op}`);
          return;
      }
    }

    this.json(res, { error: 'not_found' }, 404);
  }

  /** Send semantics shared by sendFileStream and batchSendFile: 142 on collision, FANUC content naming. */
  private storeFile(m: MachineState, dir: string, fileName: string, body: Buffer): { errorCode: number; errorMsg: string } {
    let name = fileName;
    if (m.cfg.fanucNaming) {
      name = fanucNameFromContent(body.toString('utf8')) ?? fileName;
    }
    const dirMap = m.files.get(dir) ?? new Map<string, Buffer>();
    for (const existing of dirMap.keys()) {
      if (canonical(existing) === canonical(name)) {
        return { errorCode: 142, errorMsg: 'Path exists.' };
      }
    }
    let content = body;
    if (m.corruptOnSend) content = Buffer.concat([body, Buffer.from('\nGARBLED')]);
    dirMap.set(name, content);
    m.files.set(dir, dirMap);
    return { errorCode: 0, errorMsg: 'Success' };
  }
}

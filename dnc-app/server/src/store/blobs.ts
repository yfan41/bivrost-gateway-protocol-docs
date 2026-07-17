import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Content-addressed store for program content and safety snapshots. */
export class BlobStore {
  constructor(private readonly root: string) {
    mkdirSync(root, { recursive: true });
  }

  put(content: Buffer): string {
    const hash = createHash('sha256').update(content).digest('hex');
    const dir = join(this.root, hash.slice(0, 2));
    const path = join(dir, hash);
    if (!existsSync(path)) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(path, content);
    }
    return hash;
  }

  get(hash: string): Buffer {
    return readFileSync(join(this.root, hash.slice(0, 2), hash));
  }

  has(hash: string): boolean {
    return existsSync(join(this.root, hash.slice(0, 2), hash));
  }
}

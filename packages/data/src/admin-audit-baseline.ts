import { constants } from 'node:fs';
import { link, lstat, mkdir, open, readdir, unlink } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import {
  auditRetainedCheckpointSchema, retainedAuditAnchor, type AuditRetainedCheckpoint,
} from '@salesmora/contracts';

export interface AuditBaselineStore {
  latest(): Promise<AuditRetainedCheckpoint | null>;
  accept(value: AuditRetainedCheckpoint): Promise<void>;
}

function missing(error: unknown) {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export async function createAuditBaselineStore(directory: string): Promise<AuditBaselineStore> {
  if (!isAbsolute(directory)) throw new Error('Verifier baseline directory must be an absolute private path.');
  try { await mkdir(directory, { mode: 0o700 }); }
  catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error;
  }
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) !== 0 ||
    (process.getuid && info.uid !== process.getuid())) {
    throw new Error('Verifier baseline directory must be owned by the verifier and private (0700).');
  }
  async function read(name: string) {
    const handle = await open(join(directory, name), constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > 16 * 1024 || (stat.mode & 0o077) !== 0 ||
        (process.getuid && stat.uid !== process.getuid())) throw new Error('Invalid retained checkpoint file.');
      const value = auditRetainedCheckpointSchema.parse(JSON.parse(await handle.readFile('utf8')));
      const digest = createHash('sha256').update(`${JSON.stringify(value.checkpoint)}\n`).digest('hex');
      if (digest !== value.checkpointSHA256) throw new Error('Retained checkpoint digest mismatch.');
      return value;
    } finally { await handle.close(); }
  }
  async function latest() {
    const entries = await readdir(directory);
    if (entries.some(name => name.endsWith('.json') && !/^[1-9]\d{0,18}\.json$/.test(name))) {
      throw new Error('Unexpected verifier checkpoint filename.');
    }
    const names = entries.filter(name => /^[1-9]\d{0,18}\.json$/.test(name))
      .sort((a, b) => BigInt(a.slice(0, -5)) < BigInt(b.slice(0, -5)) ? -1 : 1);
    let previous: AuditRetainedCheckpoint | null = null;
    for (const name of names) {
      const value = await read(name);
      if (name !== `${value.scope.throughSequence}.json` ||
        JSON.stringify(value.scope.previousCheckpoint) !== JSON.stringify(previous ? retainedAuditAnchor(previous) : null) ||
        (previous && (previous.scope.ledgerId !== value.scope.ledgerId ||
          JSON.stringify(previous.target) !== JSON.stringify(value.target)))) {
        throw new Error('Verifier retained checkpoint chain is broken or belongs to another ledger/target.');
      }
      previous = value;
    }
    return previous;
  }
  return {
    latest,
    async accept(input) {
      const value = auditRetainedCheckpointSchema.parse(input);
      if (createHash('sha256').update(`${JSON.stringify(value.checkpoint)}\n`).digest('hex') !== value.checkpointSHA256) {
        throw new Error('Retained checkpoint digest mismatch.');
      }
      const previous = await latest();
      if (previous && previous.scope.throughSequence === value.scope.throughSequence) {
        if (JSON.stringify(previous) !== JSON.stringify(value)) throw new Error('Retained checkpoint cannot be replaced.');
        return;
      }
      if (JSON.stringify(value.scope.previousCheckpoint) !== JSON.stringify(previous ? retainedAuditAnchor(previous) : null) ||
        (previous && (value.scope.ledgerId !== previous.scope.ledgerId ||
          JSON.stringify(value.target) !== JSON.stringify(previous.target)))) {
        throw new Error('Retained checkpoint must advance the verifier-owned chain.');
      }
      const temp = join(directory, `.pending-${randomUUID()}`);
      const destination = join(directory, `${value.scope.throughSequence}.json`);
      try {
        const handle = await open(temp, 'wx', 0o600);
        try {
          await handle.writeFile(`${JSON.stringify(value)}\n`, 'utf8');
          await handle.sync();
        } finally { await handle.close(); }
        // Hard linking publishes a fully synced file atomically without replacement.
        await link(temp, destination);
        const dir = await open(directory, constants.O_RDONLY);
        try { await dir.sync(); } finally { await dir.close(); }
      } finally {
        try { await unlink(temp); } catch (error) { if (!missing(error)) throw error; }
      }
    },
  };
}

import { createHash } from 'node:crypto';
import { chmod, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditRetainedCheckpointSchema, retainedAuditAnchor, type AuditRetainedCheckpoint } from '@salesmora/contracts';
import { createAuditBaselineStore } from './admin-audit-baseline';

function fixture(previous: AuditRetainedCheckpoint | null = null): AuditRetainedCheckpoint {
  const sequence = previous ? String(BigInt(previous.scope.throughSequence) + 1n) : '1';
  const anchor = previous ? retainedAuditAnchor(previous) : null;
  const checkpoint = {
    version: 1 as const, format: 'salesmora.admin-audit.ndjson' as const,
    ledgerId: '00000000-0000-4000-8000-000000000001',
    previousCheckpoint: anchor, firstSequence: sequence, throughSequence: sequence,
    eventCount: 1, byteLength: 100, sha256: 'a'.repeat(64), headHash: sequence.padStart(64, '0'),
  };
  return auditRetainedCheckpointSchema.parse({
    version: 1, target: { accountId: 'a'.repeat(32), bucket: 'audit-fixture', jurisdiction: 'default' },
    scope: { ledgerId: checkpoint.ledgerId, throughSequence: sequence, previousCheckpoint: anchor },
    checkpoint, checkpointSHA256: createHash('sha256').update(`${JSON.stringify(checkpoint)}\n`).digest('hex'),
  });
}

async function temporary(work: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), 'salesmora-verifier-baseline-'));
  try { await work(directory); } finally { await rm(directory, { recursive: true }); }
}

describe('verifier-owned checkpoint storage', () => {
  it('persists synced create-only checkpoints and verifies the chain after reopening', async () => temporary(async directory => {
    const store = await createAuditBaselineStore(directory);
    expect(await store.latest()).toBeNull();
    const first = fixture();
    await store.accept(first);
    const bytes = await readFile(join(directory, '1.json'));
    await store.accept(first);
    expect(await readFile(join(directory, '1.json'))).toEqual(bytes);
    const second = fixture(first);
    await store.accept(second);
    expect(await (await createAuditBaselineStore(directory)).latest()).toEqual(second);
    expect((await readdir(directory)).sort()).toEqual(['1.json', '2.json']);
  }));

  it('refuses replacing or forking a retained checkpoint', async () => temporary(async directory => {
    const store = await createAuditBaselineStore(directory);
    const first = fixture();
    await store.accept(first);
    const changed = fixture();
    changed.checkpoint.headHash = 'b'.repeat(64);
    changed.checkpointSHA256 = createHash('sha256').update(`${JSON.stringify(changed.checkpoint)}\n`).digest('hex');
    await expect(store.accept(changed)).rejects.toThrow('cannot be replaced');
    const wrong = fixture(first);
    wrong.scope.previousCheckpoint = null;
    wrong.checkpoint.previousCheckpoint = null;
    wrong.checkpointSHA256 = createHash('sha256').update(`${JSON.stringify(wrong.checkpoint)}\n`).digest('hex');
    await expect(store.accept(wrong)).rejects.toThrow('must advance');
    const otherTarget = fixture(first);
    otherTarget.target.bucket = 'another-audit-fixture';
    await expect(store.accept(otherTarget)).rejects.toThrow('must advance');
    const otherLedger = fixture(first);
    otherLedger.scope.ledgerId = '00000000-0000-4000-8000-000000000002';
    otherLedger.checkpoint.ledgerId = otherLedger.scope.ledgerId;
    otherLedger.checkpointSHA256 = createHash('sha256').update(`${JSON.stringify(otherLedger.checkpoint)}\n`).digest('hex');
    await expect(store.accept(otherLedger)).rejects.toThrow('must advance');
  }));

  it('rejects corrupted/truncated/malformed retained files instead of resetting trust', async () => temporary(async directory => {
    const store = await createAuditBaselineStore(directory);
    await store.accept(fixture());
    await writeFile(join(directory, '1.json'), 'invalid', { mode: 0o600 });
    await expect(store.latest()).rejects.toThrow();
    await writeFile(join(directory, '1.json'), JSON.stringify({ ...fixture(), checkpointSHA256: 'b'.repeat(64) }));
    await expect(store.latest()).rejects.toThrow('digest mismatch');
    await writeFile(join(directory, '1.json'), 'x'.repeat(16 * 1024 + 1));
    await expect(store.latest()).rejects.toThrow('Invalid retained');
  }));

  it('rejects permissions, symlinked files/directories and unexpected JSON filenames', async () => temporary(async directory => {
    await chmod(directory, 0o755);
    await expect(createAuditBaselineStore(directory)).rejects.toThrow('private');
    await chmod(directory, 0o700);
    const store = await createAuditBaselineStore(directory);
    await store.accept(fixture());
    await chmod(join(directory, '1.json'), 0o644);
    await expect(store.latest()).rejects.toThrow('Invalid retained');
    await chmod(join(directory, '1.json'), 0o600);
    await symlink(join(directory, '1.json'), join(directory, '2.json'));
    await expect(store.latest()).rejects.toThrow();
    await rm(join(directory, '2.json'));
    await writeFile(join(directory, 'invalid.json'), '{}');
    await expect(store.latest()).rejects.toThrow('filename');
    await symlink(directory, join(directory, 'linked'));
    await expect(createAuditBaselineStore(join(directory, 'linked'))).rejects.toThrow('private');
  }));

  it('detects missing predecessors, wrong ledger/target and digest corruption on acceptance', async () => temporary(async directory => {
    const first = fixture();
    const second = fixture(first);
    const store = await createAuditBaselineStore(directory);
    await store.accept(first);
    await store.accept(second);
    await rm(join(directory, '1.json'));
    await expect(store.latest()).rejects.toThrow('chain is broken');
    await expect(store.accept({ ...second, checkpointSHA256: 'b'.repeat(64) })).rejects.toThrow('digest mismatch');
  }));

  it('ignores unpublished temporary bytes but never silently adopts them', async () => temporary(async directory => {
    const store = await createAuditBaselineStore(directory);
    await writeFile(join(directory, '.pending-fictional'), '{"partial":', { mode: 0o600 });
    expect(await store.latest()).toBeNull();
    await store.accept(fixture());
    expect((await store.latest())?.scope.throughSequence).toBe('1');
    await expect(createAuditBaselineStore('relative-path')).rejects.toThrow('absolute');
  }));
});

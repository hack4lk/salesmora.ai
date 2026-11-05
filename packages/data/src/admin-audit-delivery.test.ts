import { describe, expect, it } from 'vitest';
import type { AuditArchiveLockRules, AuditArchiveScope } from '@salesmora/contracts';
import { buildAdminAuditArchive } from './admin-audit-archive';
import { hashAdminAuditEvent, type AdminAuditRecord } from './admin-audit';
import {
  AUDIT_ARCHIVE_RETENTION_SECONDS, auditArchiveLockEvidence, auditArchiveObjectKeys,
  deliverAdminAuditArchive, verifyStoredAdminAuditArchive,
  type AuditArchiveReader, type AuditArchiveWriter, type AuditArchiveLockReader, type AuditStoredObject,
} from './admin-audit-delivery';

const target = { accountId: 'a'.repeat(32), bucket: 'audit-test-only', jurisdiction: 'default' as const };
const scope: AuditArchiveScope = {
  ledgerId: '00000000-0000-4000-8000-000000000001', previousCheckpoint: null, throughSequence: '1',
};
const limits = { maxEvents: 50_000, maxBytes: 32 * 1024 * 1024 };
const signal = () => AbortSignal.timeout(30_000);
const rules: AuditArchiveLockRules = [{
  id: 'one-year', enabled: true, prefix: 'admin-audit/',
  condition: { type: 'Age', maxAgeSeconds: AUDIT_ARCHIVE_RETENTION_SECONDS },
}];

async function fixture() {
  const record: AdminAuditRecord = {
    sequence: '1', id: 'fictional-event', occurredAt: '2026-10-31T00:00:00.000Z',
    staffUserId: null, staffRole: 'bootstrap', action: 'audit.fixture',
    targetType: 'fixture', targetId: 'fictional', workspaceId: null, reason: null,
    before: null, after: { evidence: 'fictional' }, requestId: 'fictional-request',
    ipAddress: null, userAgent: null, prevHash: null, hash: '',
  };
  record.hash = hashAdminAuditEvent(record);
  const archive = await buildAdminAuditArchive([record], scope, limits);
  const objectHash = JSON.parse(archive.checkpoint.toString()).sha256 as string;
  const keys = auditArchiveObjectKeys(scope.ledgerId, archive.checkpointSHA256, objectHash);
  const objects = new Map<string, AuditStoredObject>();
  const calls: string[] = [];
  const state = { rules, outcome: 'created' as 'created' | 'exists' | 'uncertain', store: true, lockReads: 0 };
  const reader: AuditArchiveReader = { target, async get(key, maxBytes, abort) {
    abort.throwIfAborted();
    calls.push(`get:${key}`);
    const object = objects.get(key);
    if (!object) return null;
    if (object.bytes.length > maxBytes) throw new Error('Read exceeds bound.');
    return { ...object, bytes: Buffer.from(object.bytes) };
  } };
  const writer: AuditArchiveWriter = { target, async create(key, bytes, _contentType, abort) {
    abort.throwIfAborted();
    calls.push(`put:${key}`);
    if (objects.has(key)) return 'exists';
    if (state.store) objects.set(key, { bytes: Buffer.from(bytes), uploadedAt: new Date().toISOString() });
    return state.outcome;
  } };
  const locks: AuditArchiveLockReader = { target, async rules(abort) {
    abort.throwIfAborted();
    state.lockReads++;
    calls.push('locks');
    return state.rules;
  } };
  const deliver = () => deliverAdminAuditArchive(archive, scope, limits, writer, reader, locks, signal());
  return { archive, keys, objects, calls, state, reader, writer, locks, deliver };
}

describe('audit R2 delivery orchestration', () => {
  it('creates the segment first, verifies read-back and writes checkpoint last', async () => {
    const f = await fixture();
    const checked = await f.deliver();
    expect(checked).toMatchObject({
      state: 'snapshot_checked', target, ...f.keys, eventCount: 1, throughSequence: '1',
      checkpointSHA256: f.archive.checkpointSHA256,
    });
    expect(checked.locks).toHaveLength(2);
    const puts = f.calls.filter(call => call.startsWith('put:'));
    expect(puts).toEqual([`put:${f.keys.objectKey}`, `put:${f.keys.checkpointKey}`]);
    expect(f.calls.indexOf(`get:${f.keys.objectKey}`, f.calls.indexOf(puts[0]))).toBeLessThan(f.calls.indexOf(puts[1]));
  });

  it('reuses matching locked objects without writing and returns fresh read evidence', async () => {
    const f = await fixture();
    await f.deliver();
    f.calls.length = 0;
    const again = await f.deliver();
    expect(f.calls.some(call => call.startsWith('put:'))).toBe(false);
    expect(again.checkpointSHA256).toBe(f.archive.checkpointSHA256);
  });

  it('recovers uncertain successful writes only through exact byte read-back', async () => {
    const f = await fixture();
    f.state.outcome = 'uncertain';
    expect((await f.deliver()).state).toBe('snapshot_checked');
    const missing = await fixture();
    missing.state.outcome = 'uncertain';
    missing.state.store = false;
    await expect(missing.deliver()).rejects.toThrow('upload_unconfirmed');
    expect(missing.calls.filter(call => call.startsWith('put:'))).toHaveLength(1);
    expect(missing.objects.has(missing.keys.checkpointKey)).toBe(false);
  });

  it('requires read-back even after conflicts or nominal upload success', async () => {
    for (const outcome of ['exists', 'created'] as const) {
      const f = await fixture();
      f.state.outcome = outcome;
      f.state.store = false;
      await expect(f.deliver()).rejects.toThrow(outcome === 'created' ? 'object_missing' : 'upload_unconfirmed');
      expect(f.objects.has(f.keys.checkpointKey)).toBe(false);
    }
  });

  it('recovers an orphaned segment from partial checkpoint failure without overwriting', async () => {
    const f = await fixture();
    const create = f.writer.create;
    f.writer.create = async (...args) => {
      if (args[0] === f.keys.checkpointKey) throw new Error('Checkpoint request denied.');
      return create(...args);
    };
    await expect(f.deliver()).rejects.toThrow('denied');
    expect(f.objects.has(f.keys.objectKey)).toBe(true);
    expect(f.objects.has(f.keys.checkpointKey)).toBe(false);
    f.writer.create = create;
    f.calls.length = 0;
    await f.deliver();
    expect(f.calls.filter(call => call.startsWith('put:'))).toEqual([`put:${f.keys.checkpointKey}`]);
  });

  it('blocks mismatched existing objects and does not overwrite or publish', async () => {
    const f = await fixture();
    f.objects.set(f.keys.objectKey, { bytes: Buffer.from('tampered'), uploadedAt: new Date().toISOString() });
    await expect(f.deliver()).rejects.toThrow('object_mismatch');
    expect(f.calls.some(call => call.startsWith('put:'))).toBe(false);
    expect(f.objects.has(f.keys.checkpointKey)).toBe(false);
  });

  it('blocks absent/disabled/short/wrong-prefix locks before any upload', async () => {
    for (const lockRules of [
      [], [{ ...rules[0], enabled: false }], [{ ...rules[0], prefix: 'customer/' }],
      [{ ...rules[0], condition: { type: 'Age' as const, maxAgeSeconds: AUDIT_ARCHIVE_RETENTION_SECONDS - 1 } }],
    ]) {
      const f = await fixture();
      f.state.rules = lockRules;
      await expect(f.deliver()).rejects.toThrow('lock_insufficient');
      expect(f.calls.some(call => call.startsWith('put:'))).toBe(false);
    }
  });

  it('does not publish checkpoint if lock protection disappears after segment upload', async () => {
    const f = await fixture();
    const create = f.writer.create;
    f.writer.create = async (...args) => {
      const result = await create(...args);
      f.state.rules = [];
      return result;
    };
    await expect(f.deliver()).rejects.toThrow('lock_insufficient');
    expect(f.objects.has(f.keys.checkpointKey)).toBe(false);
  });

  it('reports failed protection if rules change during final independent verification', async () => {
    const f = await fixture();
    const readRules = f.locks.rules;
    f.locks.rules = async abort => f.state.lockReads >= 4 ? [] : readRules(abort);
    await expect(f.deliver()).rejects.toThrow('lock_insufficient');
    expect(f.objects.size).toBe(2);
  });

  it('rejects mismatched account/bucket/jurisdiction without reading or writing', async () => {
    for (const patch of [{ accountId: 'b'.repeat(32) }, { bucket: 'customer-bucket' }, { jurisdiction: 'eu' as const }]) {
      const f = await fixture();
      f.writer.target = { ...target, ...patch };
      await expect(f.deliver()).rejects.toThrow('target_mismatch');
      expect(f.calls).toEqual([]);
    }
  });

  it('rejects corrupted prepared inputs or unexpected digests before requests', async () => {
    const f = await fixture();
    f.archive.checkpointSHA256 = 'a'.repeat(64);
    await expect(f.deliver()).rejects.toThrow('checkpoint_mismatch');
    expect(f.calls).toEqual([]);
    const other = await fixture();
    other.archive.ndjson[10] ^= 1;
    await expect(other.deliver()).rejects.toThrow('checksum');
    expect(other.calls).toEqual([]);
  });

  it('requires externally supplied expected checkpoint digest and verifies remote contents', async () => {
    const f = await fixture();
    await f.deliver();
    f.objects.get(f.keys.checkpointKey)!.bytes[10] ^= 1;
    await expect(verifyStoredAdminAuditArchive(f.reader, f.locks, scope, f.archive.checkpointSHA256, limits, signal()))
      .rejects.toThrow('checkpoint_mismatch');
    const other = await fixture();
    await other.deliver();
    other.objects.get(other.keys.objectKey)!.bytes[10] ^= 1;
    await expect(verifyStoredAdminAuditArchive(other.reader, other.locks, scope, other.archive.checkpointSHA256, limits, signal()))
      .rejects.toThrow('checksum');
  });

  it('cannot label missing remote objects checked', async () => {
    const f = await fixture();
    await expect(verifyStoredAdminAuditArchive(f.reader, f.locks, scope, f.archive.checkpointSHA256, limits, signal()))
      .rejects.toThrow('object_missing');
    await f.deliver();
    f.objects.delete(f.keys.objectKey);
    await expect(verifyStoredAdminAuditArchive(f.reader, f.locks, scope, f.archive.checkpointSHA256, limits, signal()))
      .rejects.toThrow('object_missing');
  });

  it('aborts without upload and propagates read/lock failures explicitly', async () => {
    const f = await fixture();
    await expect(deliverAdminAuditArchive(f.archive, scope, limits, f.writer, f.reader, f.locks,
      AbortSignal.abort(new Error('Cancelled')))).rejects.toThrow('Cancelled');
    expect(f.calls).toEqual([]);
    f.reader.get = async () => { throw new Error('Read access denied.'); };
    await expect(f.deliver()).rejects.toThrow('denied');
    expect(f.calls.some(call => call.startsWith('put:'))).toBe(false);
    const other = await fixture();
    other.locks.rules = async () => { throw new Error('Lock API failed.'); };
    await expect(other.deliver()).rejects.toThrow('Lock API failed');
    expect(other.calls.some(call => call.startsWith('put:'))).toBe(false);
  });

  it('owns fixed input bytes/scope/limits while awaiting network evidence', async () => {
    const f = await fixture();
    const copiedScope = { ...scope };
    const copiedLimits = { ...limits };
    const pending = deliverAdminAuditArchive(f.archive, copiedScope, copiedLimits, f.writer, f.reader, f.locks, signal());
    f.archive.ndjson.fill(0);
    f.archive.checkpoint.fill(0);
    copiedScope.throughSequence = '2';
    copiedLimits.maxBytes = 1;
    const verified = await pending;
    expect(verified.throughSequence).toBe('1');
    expect(verified.checkpointSHA256).toBe(f.archive.checkpointSHA256);
  });

  it('rejects unsafe delivery bounds and malformed object-key inputs before requests', async () => {
    const f = await fixture();
    for (const bound of [
      { ...limits, maxEvents: 50_001 }, { ...limits, maxBytes: 33_554_433 },
      { ...limits, maxBytes: NaN }, { ...limits, maxEvents: 0 },
    ]) await expect(deliverAdminAuditArchive(f.archive, scope, bound, f.writer, f.reader, f.locks, signal()))
      .rejects.toThrow('invalid_evidence');
    expect(f.calls).toEqual([]);
    expect(() => auditArchiveObjectKeys('-'.repeat(36), 'a'.repeat(64), 'b'.repeat(64))).toThrow('invalid_evidence');
    expect(() => auditArchiveObjectKeys(scope.ledgerId, '../secret', 'b'.repeat(64))).toThrow('invalid_evidence');
    expect(auditArchiveObjectKeys('AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', 'a'.repeat(64), 'b'.repeat(64)).objectKey)
      .toContain('/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/');
  });
});

describe('R2 lock evidence', () => {
  const key = 'admin-audit/v1/fixture';
  const uploaded = '2025-10-31T10:00:00.000Z';
  it('uses object creation age and allows an existing object with less than one year remaining', () => {
    expect(auditArchiveLockEvidence(rules, key, uploaded, '2026-10-30T10:00:00.000Z').protectedUntil)
      .toBe('2026-10-31T10:00:00.000Z');
    expect(() => auditArchiveLockEvidence(rules, key, uploaded, '2026-10-31T10:00:00.000Z')).toThrow('lock_insufficient');
  });
  it('supports date and indefinite rules and chooses the strongest matching protection', () => {
    const merged: AuditArchiveLockRules = [
      ...rules, { id: 'date', enabled: true, condition: { type: 'Date', date: '2027-01-01T00:00:00.000Z' } },
    ];
    expect(auditArchiveLockEvidence(merged, key, uploaded, '2026-10-31T10:00:00.000Z').ruleId).toBe('date');
    merged.push({ id: 'forever', enabled: true, condition: { type: 'Indefinite' } });
    expect(auditArchiveLockEvidence(merged, key, uploaded, '2026-10-31T10:00:00.000Z')).toMatchObject({
      ruleId: 'forever', protectedUntil: null,
    });
  });
  it('rejects future/invalid upload time and insufficient fixed-date rules', () => {
    expect(() => auditArchiveLockEvidence(rules, key, 'invalid', uploaded)).toThrow('invalid_evidence');
    expect(() => auditArchiveLockEvidence(rules, key, '2027-01-01T00:00:00.000Z', uploaded)).toThrow('invalid_evidence');
    expect(() => auditArchiveLockEvidence([{
      id: 'date', enabled: true, condition: { type: 'Date', date: '2026-10-30T00:00:00.000Z' },
    }], key, uploaded, '2026-01-01T00:00:00.000Z')).toThrow('lock_insufficient');
  });
});

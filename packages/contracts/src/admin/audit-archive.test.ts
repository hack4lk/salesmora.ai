import { describe, expect, it } from 'vitest';
import { auditArchiveCheckpointSchema, auditArchiveRecordSchema, auditArchiveScopeSchema } from './audit-archive';

const digest = 'a'.repeat(64);
const checkpoint = {
  version: 1, format: 'salesmora.admin-audit.ndjson',
  ledgerId: '00000000-0000-4000-8000-000000000001',
  previousCheckpoint: null, firstSequence: '1', throughSequence: '5',
  eventCount: 2, byteLength: 900, sha256: digest, headHash: digest,
};

describe('admin audit archive contracts', () => {
  it('accepts versioned bounded evidence and rejects unknown fields/versions', () => {
    expect(auditArchiveCheckpointSchema.safeParse(checkpoint).success).toBe(true);
    for (const value of [
      { ...checkpoint, version: 2 }, { ...checkpoint, format: 'csv' },
      { ...checkpoint, immutable: true }, { ...checkpoint, ledgerId: 'production' },
      { ...checkpoint, sha256: digest.toUpperCase() }, { ...checkpoint, headHash: '' },
      { ...checkpoint, eventCount: 0 }, { ...checkpoint, byteLength: 0 },
      { ...checkpoint, eventCount: 1.5 }, { ...checkpoint, byteLength: Number.MAX_SAFE_INTEGER + 1 },
    ]) expect(auditArchiveCheckpointSchema.safeParse(value).success).toBe(false);
  });

  it('rejects invalid or reversed sequences without throwing from safeParse', () => {
    for (const sequence of ['0', '-1', '01', '1.0', '1e3', 'invalid', '', '9223372036854775808', '9'.repeat(30)]) {
      expect(auditArchiveCheckpointSchema.safeParse({ ...checkpoint, throughSequence: sequence }).success).toBe(false);
      expect(auditArchiveScopeSchema.safeParse({
        ledgerId: checkpoint.ledgerId, previousCheckpoint: null, throughSequence: sequence,
      }).success).toBe(false);
    }
    expect(auditArchiveCheckpointSchema.safeParse({ ...checkpoint, firstSequence: '6' }).success).toBe(false);
    expect(auditArchiveCheckpointSchema.safeParse({
      ...checkpoint, firstSequence: '9007199254740993', throughSequence: '9223372036854775807',
    }).success).toBe(true);
  });

  it('requires a complete earlier checkpoint anchor and non-overlapping segments', () => {
    const anchor = { checkpointSHA256: digest, throughSequence: '5', headHash: digest };
    const scope = { ledgerId: checkpoint.ledgerId, previousCheckpoint: anchor, throughSequence: '9' };
    expect(auditArchiveScopeSchema.safeParse(scope).success).toBe(true);
    for (const value of [
      { ...scope, throughSequence: '5' },
      { ...scope, previousCheckpoint: { throughSequence: '5', headHash: digest } },
      { ...scope, previousCheckpoint: { ...anchor, token: 'secret' } },
    ]) expect(auditArchiveScopeSchema.safeParse(value).success).toBe(false);
    expect(auditArchiveCheckpointSchema.safeParse({ ...checkpoint, previousCheckpoint: anchor }).success).toBe(false);
  });

  it('requires complete raw hash-covered records, not display/export records', () => {
    const record = {
      sequence: '1', id: 'event-1', occurredAt: '2026-10-30T00:00:00.000Z',
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.created',
      targetType: 'audit', targetId: 'one', workspaceId: null, reason: null,
      before: null, after: { nested: { list: [null, true, 1, 'value'] } },
      requestId: 'request-1', ipAddress: null, userAgent: null, prevHash: null, hash: digest,
    };
    expect(auditArchiveRecordSchema.safeParse(record).success).toBe(true);
    for (const value of [
      { ...record, actorName: 'Current name' }, { ...record, staffRole: 'system' },
      { ...record, hash: undefined }, { ...record, occurredAt: 'yesterday' },
      { ...record, before: { invalid: undefined } }, { ...record, after: { invalid: NaN } },
    ]) expect(auditArchiveRecordSchema.safeParse(value).success).toBe(false);
  });
});

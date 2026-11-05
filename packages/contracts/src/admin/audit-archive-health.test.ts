import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { auditArchiveHealthSchema } from './audit-archive-health';
import { auditRetainedCheckpointSchema, retainedAuditAnchor } from './audit-publication';

const now = '2026-10-31T12:00:00.000Z';
const ledgerId = '00000000-0000-4000-8000-000000000001';
const target = { accountId: 'a'.repeat(32), bucket: 'audit-fixture', jurisdiction: 'default' as const };
const checkpoint = {
  version: 1 as const, format: 'salesmora.admin-audit.ndjson' as const, ledgerId,
  previousCheckpoint: null, firstSequence: '1', throughSequence: '1', eventCount: 1,
  byteLength: 100, sha256: 'b'.repeat(64), headHash: 'c'.repeat(64),
};
const checkpointSHA256 = createHash('sha256').update(`${JSON.stringify(checkpoint)}\n`).digest('hex');
const retained = auditRetainedCheckpointSchema.parse({
  version: 1, target, scope: { ledgerId, throughSequence: '1', previousCheckpoint: null }, checkpoint, checkpointSHA256,
});
const objectKey = `admin-audit/v1/${ledgerId}/segments/${checkpoint.sha256}.ndjson`;
const checkpointKey = `admin-audit/v1/${ledgerId}/checkpoints/${checkpointSHA256}.json`;
const evidence = {
  state: 'snapshot_checked' as const, target, objectKey, checkpointKey, checkpointSHA256,
  objectSHA256: checkpoint.sha256, throughSequence: '1', headHash: checkpoint.headHash,
  eventCount: checkpoint.eventCount, checkedAt: now,
  locks: [objectKey, checkpointKey].map(key => ({
    key, ruleId: 'year', uploadedAt: now, checkedAt: now, protectedUntil: null,
  })),
};
const report = {
  state: 'reported' as const, observedAt: now,
  latestCopy: {
    scope: retained.scope, state: 'copied' as const, attempts: 1, updatedAt: now, failureCode: null,
    latestAttempt: { state: 'copied' as const, startedAt: now, finishedAt: now, failureCode: null },
    latestCheck: { state: 'accepted' as const, checkedAt: now },
  },
  latestAccepted: { retained, evidence },
};

describe('admin audit archive health contract', () => {
  it('accepts a published snapshot with independent object/lock evidence', () => {
    expect(auditArchiveHealthSchema.parse(report)).toEqual(report);
    expect(auditArchiveHealthSchema.parse({ state: 'unconfigured', observedAt: now })).toEqual({
      state: 'unconfigured', observedAt: now,
    });
  });

  it('rejects acceptance evidence with a changed sequence, checkpoint or missing object lock', () => {
    expect(auditArchiveHealthSchema.safeParse({
      ...report, latestAccepted: { retained, evidence: { ...evidence, throughSequence: '2' } },
    }).success).toBe(false);
    expect(auditArchiveHealthSchema.safeParse({
      ...report, latestAccepted: { retained, evidence: { ...evidence, checkpointSHA256: 'd'.repeat(64) } },
    }).success).toBe(false);
    expect(auditArchiveHealthSchema.safeParse({
      ...report, latestAccepted: { retained, evidence: { ...evidence, locks: [evidence.locks[0], { ...evidence.locks[1], key: 'other' }] } },
    }).success).toBe(false);
    expect(auditArchiveHealthSchema.safeParse({
      ...report, latestAccepted: { retained, evidence: { ...evidence, objectKey: 'untrusted/object' } },
    }).success).toBe(false);
  });

  it('requires an earlier accepted checkpoint to anchor the next publication scope', () => {
    expect(auditArchiveHealthSchema.safeParse({
      ...report,
      latestCopy: {
        ...report.latestCopy,
        scope: { ledgerId, throughSequence: '2', previousCheckpoint: null },
        state: 'pending',
        latestCheck: null,
      },
    }).success).toBe(false);
  });

  it('retains the previous checkpoint anchor as the next segment scope', () => {
    expect(retainedAuditAnchor(retained).throughSequence).toBe('1');
  });
});

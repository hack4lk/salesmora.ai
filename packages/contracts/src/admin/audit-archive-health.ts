import { z } from 'zod';
import { auditArchiveScopeSchema } from './audit-archive';
import { auditArchiveTargetSchema, auditRetainedCheckpointSchema, retainedAuditAnchor } from './audit-publication';

const timestamp = z.string().datetime({ offset: true });
const failureCode = z.string().regex(/^[a-z][a-z0-9_]{0,79}$/);

export const auditArchiveLockEvidenceSchema = z.object({
  key: z.string().min(1).max(2048),
  ruleId: z.string().min(1).max(1024),
  uploadedAt: timestamp,
  checkedAt: timestamp,
  protectedUntil: timestamp.nullable(),
}).strict();

export const auditArchiveVerificationEvidenceSchema = z.object({
  state: z.literal('snapshot_checked'),
  target: auditArchiveTargetSchema,
  objectKey: z.string().min(1).max(2048),
  checkpointKey: z.string().min(1).max(2048),
  checkpointSHA256: z.string().regex(/^[a-f0-9]{64}$/),
  objectSHA256: z.string().regex(/^[a-f0-9]{64}$/),
  throughSequence: z.string().regex(/^[1-9]\d{0,18}$/),
  headHash: z.string().regex(/^[a-f0-9]{64}$/),
  eventCount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  checkedAt: timestamp,
  locks: z.array(auditArchiveLockEvidenceSchema).length(2),
}).strict().refine(evidence => evidence.locks.every(lock => lock.checkedAt === evidence.checkedAt) &&
  evidence.locks.some(lock => lock.key === evidence.objectKey) &&
  evidence.locks.some(lock => lock.key === evidence.checkpointKey) &&
  evidence.objectKey !== evidence.checkpointKey &&
  new Set(evidence.locks.map(lock => lock.key)).size === 2 &&
  evidence.locks.every(lock => Date.parse(lock.uploadedAt) <= Date.parse(lock.checkedAt) &&
    (lock.protectedUntil === null ||
      Date.parse(lock.protectedUntil) - Date.parse(lock.uploadedAt) >= 365 * 24 * 60 * 60 * 1000 &&
      Date.parse(lock.protectedUntil) > Date.parse(lock.checkedAt))),
'Archive lock evidence must cover both checked objects.');

const attemptSchema = z.object({
  state: z.enum(['copying', 'copied', 'failed', 'interrupted']),
  startedAt: timestamp,
  finishedAt: timestamp.nullable(),
  failureCode: failureCode.nullable(),
}).strict();

const checkSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('accepted'), checkedAt: timestamp }).strict(),
  z.object({ state: z.literal('failed'), checkedAt: timestamp, failureCode }).strict(),
]);

const latestCopySchema = z.object({
  scope: auditArchiveScopeSchema,
  state: z.enum(['pending', 'copying', 'copied', 'failed']),
  attempts: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  updatedAt: timestamp,
  failureCode: failureCode.nullable(),
  latestAttempt: attemptSchema.nullable(),
  latestCheck: checkSchema.nullable(),
}).strict();

const acceptedArchiveSchema = z.object({
  retained: auditRetainedCheckpointSchema,
  evidence: auditArchiveVerificationEvidenceSchema,
}).strict().refine(value =>
  value.retained.target.accountId === value.evidence.target.accountId &&
  value.retained.target.bucket === value.evidence.target.bucket &&
  value.retained.target.jurisdiction === value.evidence.target.jurisdiction &&
  value.retained.scope.throughSequence === value.evidence.throughSequence &&
  value.retained.checkpointSHA256 === value.evidence.checkpointSHA256 &&
  value.retained.checkpoint.sha256 === value.evidence.objectSHA256 &&
  value.retained.checkpoint.headHash === value.evidence.headHash &&
  value.retained.checkpoint.eventCount === value.evidence.eventCount &&
  value.evidence.objectKey === `admin-audit/v1/${value.retained.scope.ledgerId}/segments/${value.retained.checkpoint.sha256}.ndjson` &&
  value.evidence.checkpointKey === `admin-audit/v1/${value.retained.scope.ledgerId}/checkpoints/${value.retained.checkpointSHA256}.json`,
'Accepted archive evidence does not match its retained checkpoint.');

export const auditArchiveHealthSchema = z.discriminatedUnion('state', [
  z.object({
    state: z.literal('unconfigured'),
    observedAt: timestamp,
  }).strict(),
  z.object({
    state: z.literal('reported'),
    observedAt: timestamp,
    latestCopy: latestCopySchema,
    latestAccepted: acceptedArchiveSchema.nullable(),
  }).strict().superRefine((value, context) => {
    const accepted = value.latestAccepted?.retained;
    if (accepted) {
      const currentSequence = BigInt(value.latestCopy.scope.throughSequence);
      const acceptedSequence = BigInt(accepted.scope.throughSequence);
      if (accepted.scope.ledgerId !== value.latestCopy.scope.ledgerId ||
        acceptedSequence > currentSequence ||
        (acceptedSequence === currentSequence &&
          JSON.stringify(accepted.scope) !== JSON.stringify(value.latestCopy.scope)) ||
        (acceptedSequence < currentSequence &&
          JSON.stringify(value.latestCopy.scope.previousCheckpoint) !== JSON.stringify(retainedAuditAnchor(accepted)))) {
        context.addIssue({ code: 'custom', message: 'Latest accepted checkpoint does not anchor the latest copy.' });
      }
    }
    if (value.latestCopy.latestCheck?.state === 'accepted' &&
      (!value.latestAccepted ||
        value.latestAccepted.retained.scope.ledgerId !== value.latestCopy.scope.ledgerId ||
        value.latestAccepted.retained.scope.throughSequence !== value.latestCopy.scope.throughSequence ||
        JSON.stringify(value.latestAccepted.retained.scope) !== JSON.stringify(value.latestCopy.scope))) {
      context.addIssue({ code: 'custom', message: 'Latest accepted check does not match the latest copy.' });
    }
  }),
]);
export type AuditArchiveHealth = z.infer<typeof auditArchiveHealthSchema>;

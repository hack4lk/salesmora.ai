import { z } from 'zod';
import { staffRoleIdSchema } from './schemas';

const sequence = z.string().regex(/^[1-9]\d{0,18}$/, { abort: true })
  .refine(value => BigInt(value) <= 9_223_372_036_854_775_807n, {
    message: 'Sequence exceeds PostgreSQL bigint.', abort: true,
  });
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);

export const auditArchiveRecordSchema = z.object({
  sequence,
  id: z.string().min(1),
  occurredAt: z.string().datetime(),
  staffUserId: z.string().nullable(),
  staffRole: z.union([staffRoleIdSchema, z.literal('bootstrap')]),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  workspaceId: z.string().nullable(),
  reason: z.string().nullable(),
  before: z.record(z.string(), z.json()).nullable(),
  after: z.record(z.string(), z.json()).nullable(),
  requestId: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  prevHash: sha256.nullable(),
  hash: sha256,
}).strict();
export type AuditArchiveRecord = z.infer<typeof auditArchiveRecordSchema>;

export const auditArchiveAnchorSchema = z.object({
  checkpointSHA256: sha256,
  throughSequence: sequence,
  headHash: sha256,
}).strict();
export type AuditArchiveAnchor = z.infer<typeof auditArchiveAnchorSchema>;

export const auditArchiveScopeSchema = z.object({
  ledgerId: z.string().uuid(),
  previousCheckpoint: auditArchiveAnchorSchema.nullable(),
  throughSequence: sequence,
}).strict().refine(value => value.previousCheckpoint === null ||
  BigInt(value.throughSequence) > BigInt(value.previousCheckpoint.throughSequence),
'An archive must advance beyond its previous checkpoint.');
export type AuditArchiveScope = z.infer<typeof auditArchiveScopeSchema>;

export const auditArchiveCheckpointSchema = z.object({
  version: z.literal(1),
  format: z.literal('salesmora.admin-audit.ndjson'),
  ledgerId: z.string().uuid(),
  previousCheckpoint: auditArchiveAnchorSchema.nullable(),
  firstSequence: sequence,
  throughSequence: sequence,
  eventCount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  byteLength: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  sha256,
  headHash: sha256,
}).strict().refine(value =>
  BigInt(value.firstSequence) <= BigInt(value.throughSequence) &&
  (value.previousCheckpoint === null ||
    BigInt(value.firstSequence) > BigInt(value.previousCheckpoint.throughSequence)),
'Invalid archive sequence bounds.');
export type AuditArchiveCheckpoint = z.infer<typeof auditArchiveCheckpointSchema>;

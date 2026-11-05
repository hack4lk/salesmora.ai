import { z } from 'zod';
import { auditArchiveAnchorSchema, auditArchiveCheckpointSchema, auditArchiveScopeSchema } from './audit-archive';

export const auditArchiveTargetSchema = z.object({
  accountId: z.string().regex(/^[a-f0-9]{32}$/),
  bucket: z.string().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/),
  jurisdiction: z.enum(['default', 'eu', 'us']),
}).strict();
export const auditRetainedCheckpointSchema = z.object({
  version: z.literal(1),
  target: auditArchiveTargetSchema,
  scope: auditArchiveScopeSchema,
  checkpoint: auditArchiveCheckpointSchema,
  checkpointSHA256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict().refine(value => value.scope.ledgerId === value.checkpoint.ledgerId &&
  value.scope.throughSequence === value.checkpoint.throughSequence &&
  JSON.stringify(value.scope.previousCheckpoint) === JSON.stringify(value.checkpoint.previousCheckpoint),
'Retained checkpoint scope mismatch.');
export type AuditRetainedCheckpoint = z.infer<typeof auditRetainedCheckpointSchema>;

export function retainedAuditAnchor(value: AuditRetainedCheckpoint) {
  return auditArchiveAnchorSchema.parse({
    checkpointSHA256: value.checkpointSHA256,
    throughSequence: value.checkpoint.throughSequence,
    headHash: value.checkpoint.headHash,
  });
}

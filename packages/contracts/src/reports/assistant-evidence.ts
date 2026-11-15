import { z } from 'zod';
import { reportSelectionSchema, reportAssistantSnapshotSchema } from './assistant-query';
import { reportNativeReadSchema } from './assistant-tool';
import { reportTemplateAreaSchema } from './template';

export const reportAssistantBindingContentSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  viewerId: z.string().trim().min(1).max(4000),
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  selection: reportSelectionSchema,
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  retrievedAt: z.iso.datetime(),
}).strict().refine(value => value.workspaceId === value.selection.query.workspaceId);
export const reportAssistantBindingSchema = reportAssistantBindingContentSchema.safeExtend({
  stamp: z.string().regex(/^[a-f0-9]{64}$/),
});
export type ReportAssistantBinding = z.infer<typeof reportAssistantBindingSchema>;
export const reportAssistantEvidenceSchema = z.array(reportAssistantBindingSchema).max(7)
  .refine(items => new Set(items.map(item => item.id)).size === items.length);

/** Private native data. Only an opaque ticket is sent through chat transport. */
export const reportAssistantReadSnapshotSchema = z.object({
  binding: reportAssistantBindingSchema,
  native: reportNativeReadSchema,
}).strict().superRefine(({ binding, native }, context) => {
  if (binding.workspaceId !== native.read.workspaceId || binding.viewerId !== native.read.viewerId ||
    binding.policyRevision !== native.read.policyRevision || binding.selection.area !== native.area ||
    JSON.stringify(binding.selection.query) !== JSON.stringify(native.read.query)) {
    context.addIssue({ code: 'custom', message: 'Report snapshot does not match its authenticated query binding.' });
  }
});
export type ReportAssistantReadSnapshot = z.infer<typeof reportAssistantReadSnapshotSchema>;
export const reportAssistantTicketSchema = z.object({
  id: z.uuid(), area: reportTemplateAreaSchema, retrievedAt: z.iso.datetime(),
}).strict();
export type ReportAssistantTicket = z.infer<typeof reportAssistantTicketSchema>;

export const reportAssistantResultRequestSchema = z.object({
  workspaceId: z.uuid(), turnId: z.uuid(), resultId: z.uuid(),
}).strict();
export const reportAssistantResultResponseSchema = z.object({
  snapshot: reportAssistantSnapshotSchema, retrievedAt: z.iso.datetime(),
}).strict();
export type ReportAssistantResultResponse = z.infer<typeof reportAssistantResultResponseSchema>;

export function reportAssistantTicket(binding: ReportAssistantBinding): ReportAssistantTicket {
  return reportAssistantTicketSchema.parse({
    id: binding.id, area: binding.selection.area, retrievedAt: binding.retrievedAt,
  });
}

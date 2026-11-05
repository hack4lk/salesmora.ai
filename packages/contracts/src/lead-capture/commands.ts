import { z } from 'zod';
import { captureIdSchema, captureVersionSchema, captureTimezoneSchema, captureSourceRefSchema, captureSourceStatusSchema, captureBlockSchema, captureMetricsSchema } from './common';
import { captureConfigurationSchema, captureDraftConfigurationSchema } from './configuration';

export const captureCreateDraftSchema = z.object({ workspaceId: captureIdSchema, requestId: captureIdSchema, name: z.string().trim().min(1).max(200), configuration: captureDraftConfigurationSchema }).strict();
export const captureSaveDraftSchema = captureCreateDraftSchema.extend({ sourceId: captureIdSchema, expectedVersion: captureVersionSchema, expectedDraftVersion: captureVersionSchema }).strict();
export const captureLaunchSchema = captureSourceRefSchema.extend({ requestId: captureIdSchema, draftVersion: captureVersionSchema, configurationVersion: captureVersionSchema, timing: z.discriminatedUnion('kind', [z.object({ kind: z.literal('now') }).strict(), z.object({ kind: z.literal('scheduled'), at: z.iso.datetime(), timezone: captureTimezoneSchema }).strict()]) }).strict();
/** The database clock must be supplied by the mutation, not trusted from the client. */
export function captureLaunchIsFuture(input: z.infer<typeof captureLaunchSchema>, now: Date): boolean { return input.timing.kind === 'now' || Date.parse(input.timing.at) > now.getTime(); }
export const captureLifecycleSchema = captureSourceRefSchema.extend({ requestId: captureIdSchema, action: z.enum(['pause', 'resume', 'archive', 'restore', 'duplicate']), configuration: z.discriminatedUnion('kind', [z.object({ kind: z.literal('draft'), version: captureVersionSchema }).strict(), z.object({ kind: z.literal('approved'), version: captureVersionSchema }).strict()]).optional(), copyName: z.string().trim().min(1).max(200).optional() }).strict().superRefine((value, ctx) => {
  if ((value.action === 'duplicate') !== (value.copyName !== undefined) || ['resume', 'restore', 'duplicate'].includes(value.action) && !value.configuration || value.action === 'resume' && value.configuration?.kind !== 'approved') ctx.addIssue({ code: 'custom', message: 'Missing or unexpected lifecycle context' });
});
export const captureSourceSummarySchema = z.object({ id: captureIdSchema, workspaceId: captureIdSchema, version: captureVersionSchema, name: z.string().min(1).max(200), type: z.enum(['website', 'gmail']), status: captureSourceStatusSchema, block: captureBlockSchema, approvedVersion: captureVersionSchema.nullable(), draftVersion: captureVersionSchema.nullable(), lastActivityAt: z.iso.datetime().nullable(), scheduledAt: z.iso.datetime().nullable(), timezone: captureTimezoneSchema.nullable(), metrics: captureMetricsSchema }).strict().superRefine((value, ctx) => {
  if (value.status === 'scheduled' ? !value.scheduledAt || !value.timezone : value.scheduledAt !== null || value.timezone !== null) ctx.addIssue({ code: 'custom', message: 'Schedule/status mismatch' });
  if (['active', 'scheduled'].includes(value.status) && value.approvedVersion === null || value.status === 'draft' && value.approvedVersion !== null) ctx.addIssue({ code: 'custom', message: 'Configuration/status mismatch' });
});
export const captureDraftSavedSchema = z.object({ ok: z.literal(true), sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema }).strict();
export const capturePublicationResultSchema = z.object({ ok: z.literal(true), sourceId: captureIdSchema, sourceVersion: captureVersionSchema, configurationVersion: captureVersionSchema, status: z.enum(['active', 'scheduled', 'revision_scheduled', 'cancelled']), transitionId: captureIdSchema.nullable() }).strict();
export const captureOperationResultSchema = z.discriminatedUnion('kind', [
  capturePublicationResultSchema.omit({ ok: true }).extend({ kind: z.literal('publication') }),
  z.object({ kind: z.literal('draft'), sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema }).strict(),
  z.object({ kind: z.literal('source'), sourceId: captureIdSchema, sourceVersion: captureVersionSchema }).strict(),
  z.object({ kind: z.literal('intake'), intakeId: captureIdSchema, intakeVersion: captureVersionSchema, outcome: z.enum(['create', 'separate', 'link', 'dismiss']), leadId: captureIdSchema.nullable() }).strict().refine(value => (value.outcome === 'dismiss') === (value.leadId === null)),
]);

export const captureScheduleChangeSchema = captureSourceRefSchema.extend({ requestId: captureIdSchema, configurationVersion: captureVersionSchema, timing: captureLaunchSchema.shape.timing }).strict();
export const captureSourceDetailQuerySchema = z.object({ workspaceId: captureIdSchema, sourceId: captureIdSchema }).strict();
export const captureSourceListResultSchema = z.object({ rows: z.array(captureSourceSummarySchema).max(100), total: z.number().int().nonnegative(), page: z.number().int().min(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]) }).strict();
export const captureSourceDetailSchema = z.object({ source: captureSourceSummarySchema, approved: z.object({ version: captureVersionSchema, definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, configuration: captureConfigurationSchema }).strict().nullable(), draft: z.object({ id: captureIdSchema, version: captureVersionSchema, baseApprovedVersion: captureVersionSchema.nullable(), configuration: captureDraftConfigurationSchema }).strict().nullable() }).strict().superRefine((value, ctx) => {
  if ((value.source.approvedVersion === null) !== (value.approved === null) || value.approved && (value.approved.version !== value.source.approvedVersion || value.approved.configuration.type !== value.source.type)) ctx.addIssue({ code: 'custom', message: 'Mismatched approved configuration' });
  if ((value.source.draftVersion === null) !== (value.draft === null) || value.draft && (value.draft.version !== value.source.draftVersion || value.draft.configuration.type !== value.source.type)) ctx.addIssue({ code: 'custom', message: 'Mismatched draft configuration' });
});

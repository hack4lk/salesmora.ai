import { z } from 'zod';
import { captureIdSchema, captureKeySchema, captureVersionSchema } from './common';
import { captureDraftConfigurationSchema, captureFieldsSchema, captureWorkflowSchema, captureContentSchema, captureGmailRulesSchema, captureMappingSchema } from './configuration';
import { captureAssistantProposalTicketSchema } from './assistant';
import { captureDraftSavedSchema } from './commands';
export const captureSetupOperations = ['create_source', 'begin_revision', 'save_draft', 'suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample'] as const;
export const captureSetupSampleSchema = z.object({ id: captureIdSchema, version: captureVersionSchema, subject: z.string().max(2000), body: z.string().max(6000), retrievalId: captureIdSchema.optional() }).strict();
export const captureSetupFindingSchema = z.object({ id: captureKeySchema, fieldId: captureKeySchema, included: z.boolean(), sampleValue: z.string().max(10000), suggestedValue: z.string().max(10000), confidence: z.enum(['found', 'uncertain', 'missing']), required: z.boolean(), instruction: z.string().max(2000), evidence: z.object({ source: z.enum(['subject', 'body']), text: z.string().min(1).max(6000) }).strict().nullable() }).strict();
export const captureSetupContextSchema = z.object({ sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema, name: z.string().trim().min(1).max(80), configuration: captureDraftConfigurationSchema, sample: captureSetupSampleSchema.nullable(), findings: z.array(captureSetupFindingSchema).max(50) }).strict().superRefine((value, context) => {
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > 10000) context.addIssue({ code: 'custom', message: 'This unsaved setup exceeds the assistant context limit. Save it and ask from the saved source instead.' });
  if (value.configuration.type !== 'gmail' && (value.sample || value.findings.length)) context.addIssue({ code: 'custom', message: 'Unexpected email sample.' });
});
/** Canonical object order for comparing unsaved browser state; array order remains meaningful. */
export function captureSetupCanonical(value: unknown): string {
  const normalize = (item: unknown): unknown => Array.isArray(item) ? item.map(normalize) : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, normalize(v)])) : item;
  return JSON.stringify(normalize(value));
}
const setupInput = z.object({
  operation: z.enum(captureSetupOperations), sourceId: captureIdSchema.nullable(), name: z.string().trim().min(1).max(80).nullable(), sourceType: z.enum(['website', 'gmail']).nullable(),
  fields: captureFieldsSchema.nullable(), contactRequired: z.boolean().nullable(), workflow: captureWorkflowSchema.nullable(), brief: z.string().max(4000).nullable(),
  content: captureContentSchema.nullable(), rules: captureGmailRulesSchema.nullable(), mappings: z.array(captureMappingSchema).max(50).nullable(), findings: z.array(captureSetupFindingSchema).max(50).nullable(),
}).strict();
/** Wire-valid incomplete requests reach the handler for clarification; services require the refined schema. */
export const captureSetupToolInputSchema = setupInput;
export const captureSetupProposeSchema = setupInput.superRefine((value, context) => {
  if (value.operation === 'create_source' ? !value.name || !value.sourceType || value.sourceId !== null : value.sourceType !== null) context.addIssue({ code: 'custom', message: 'Invalid source selection.' });
  const present = (keys: readonly (keyof typeof value)[]) => keys.some(key => value[key] !== null);
  if (value.operation === 'begin_revision' && present(['name', 'fields', 'contactRequired', 'workflow', 'brief', 'content', 'rules', 'mappings', 'findings'])) context.addIssue({ code: 'custom', message: 'Revision preparation cannot change configuration.' });
  if (value.operation === 'suggest_website_fields' && (!value.fields?.length || value.contactRequired === null || present(['name', 'workflow', 'content', 'rules', 'mappings', 'findings']))) context.addIssue({ code: 'custom', message: 'Provide only the proposed website fields.' });
  if (value.operation === 'suggest_workflow' && (!value.workflow || present(['name', 'fields', 'contactRequired', 'brief', 'content', 'rules', 'mappings', 'findings']))) context.addIssue({ code: 'custom', message: 'Provide only the proposed workflow.' });
  if (['extract_sample', 'refine_mapping', 'approve_sample'].includes(value.operation)) {
    for (const key of ['fields', 'findings', 'mappings'] as const) if (!value[key]?.length) context.addIssue({ code: 'custom', path: [key], message: `Provide a nonempty ${key} array for the current email example.` });
    for (const key of ['name', 'workflow', 'brief', 'content'] as const) if (value[key] !== null) context.addIssue({ code: 'custom', path: [key], message: `Set ${key} to null for sample operations.` });
  }
});
export const captureSetupToolParameters = z.toJSONSchema(setupInput, { io: 'input', override: ({ jsonSchema }) => {
  // Provider strict tools support anyOf, not Zod's oneOf for discriminated unions.
  // Each branch has a distinct literal discriminator, so the accepted values stay disjoint.
  // URL strings remain validated by captureContentSchema on the server.
  if (jsonSchema.format === 'uri') delete jsonSchema.format;
  if (jsonSchema.oneOf) { jsonSchema.anyOf = jsonSchema.oneOf; delete jsonSchema.oneOf; }
} });
delete captureSetupToolParameters.$schema;
export const captureSetupReviewSchema = z.object({ name: z.string().min(1).max(80), configuration: captureDraftConfigurationSchema, before: captureDraftConfigurationSchema.nullable(), base: captureSetupContextSchema.nullable(), sample: captureSetupSampleSchema.nullable(), findings: z.array(captureSetupFindingSchema).max(50) }).strict();
export const captureSetupReceiptSchema = z.discriminatedUnion('kind', [
  captureDraftSavedSchema.extend({ kind: z.literal('saved') }),
  z.object({ kind: z.literal('suggestions'), sourceId: captureIdSchema, configuration: captureDraftConfigurationSchema, base: captureSetupContextSchema, sample: captureSetupSampleSchema.nullable(), findings: z.array(captureSetupFindingSchema).max(50), sampleApproved: z.boolean() }).strict(),
]);
export const captureSetupViewSchema = z.object({ ticket: captureAssistantProposalTicketSchema, review: captureSetupReviewSchema, receipt: captureSetupReceiptSchema.nullable() }).strict().superRefine((value, context) => {
  if (!captureSetupOperations.includes(value.ticket.operation as typeof captureSetupOperations[number]) || (value.ticket.state === 'confirmed') !== !!value.receipt) context.addIssue({ code: 'custom', message: 'Invalid setup outcome.' });
  const target = value.ticket.target;
  const savedOperation = ['create_source', 'begin_revision', 'save_draft'].includes(value.ticket.operation);
  if ((value.ticket.operation === 'create_source') !== (target.kind === 'new_source') || value.receipt && (value.receipt.kind === 'saved') !== savedOperation) context.addIssue({ code: 'custom', message: 'Invalid setup operation target.' });
  if (value.receipt?.kind === 'saved' && target.kind === 'source' && (value.receipt.sourceId !== target.sourceId || value.receipt.sourceVersion !== target.sourceVersion + 1)) context.addIssue({ code: 'custom', message: 'Invalid saved source receipt.' });
  if (target.kind === 'intake' || target.kind === 'source' && value.review.base && (value.review.base.sourceId !== target.sourceId || value.review.base.sourceVersion !== target.sourceVersion || value.review.base.draftVersion !== target.draftVersion)) context.addIssue({ code: 'custom', message: 'Invalid setup binding.' });
  if (value.receipt?.kind === 'suggestions') {
    if (value.receipt.sampleApproved !== (value.ticket.operation === 'approve_sample') || captureSetupCanonical(value.receipt.sample) !== captureSetupCanonical(value.review.sample) || captureSetupCanonical(value.receipt.findings) !== captureSetupCanonical(value.review.findings)) context.addIssue({ code: 'custom', message: 'Invalid sample receipt.' });
    if (value.ticket.operation === 'approve_sample' && (value.receipt.configuration.type !== 'gmail' || value.receipt.configuration.sampleId !== value.ticket.proposalId)) context.addIssue({ code: 'custom', message: 'Invalid approved sample identity.' });
    const expected = structuredClone(value.review.configuration), actual = structuredClone(value.receipt.configuration);
    if (value.ticket.operation === 'approve_sample' && expected.type === 'gmail' && actual.type === 'gmail' && value.receipt.sampleApproved && actual.sampleId === value.ticket.proposalId) { delete expected.sampleId; delete actual.sampleId; }
    if (target.kind !== 'source' || value.receipt.sourceId !== target.sourceId || captureSetupCanonical(actual) !== captureSetupCanonical(expected) || captureSetupCanonical(value.receipt.base) !== captureSetupCanonical(value.review.base)) context.addIssue({ code: 'custom', message: 'Invalid suggestion receipt.' });
  }
});
export const captureSetupReferenceSchema = z.object({ workspaceId: captureIdSchema, proposalId: captureIdSchema, inputHash: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const captureSetupManualSchema = z.object({ workspaceId: captureIdSchema, originProposalId: captureIdSchema, requestId: captureIdSchema, setup: captureSetupContextSchema }).strict();
export type CaptureSetupContext = z.infer<typeof captureSetupContextSchema>;
export type CaptureSetupInput = z.infer<typeof captureSetupProposeSchema>;
export type CaptureSetupView = z.infer<typeof captureSetupViewSchema>;
export type CaptureSetupFinding = z.infer<typeof captureSetupFindingSchema>;

import { z } from 'zod';
import { captureIdSchema, captureVersionSchema, captureSourceListQuerySchema } from './common';
import { intakeQuerySchema } from './intake';

/** Planned surfaces/tools are not executable until explicitly registered with server handlers. */
export const captureAssistantSurfaces = ['lead_capture.list', 'lead_capture.new', 'lead_capture.setup', 'lead_capture.detail', 'intake.list', 'intake.detail'] as const;
export const captureAssistantToolNames = ['lead_capture_query', 'lead_capture_propose_action'] as const;
export const captureAssistantReadOperations = ['sources', 'source_details', 'source_summary', 'installation', 'publication_review', 'intake_items', 'intake_details', 'duplicate_candidates'] as const;
export const captureAssistantProposalOperations = ['create_source', 'begin_revision', 'save_draft', 'suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample', 'publish', 'change_schedule', 'cancel_schedule', 'pause', 'resume', 'archive', 'restore', 'duplicate', 'correct_intake', 'create_lead', 'create_separate_lead', 'link_lead', 'dismiss_intake'] as const;
export const captureAssistantOperations = [...captureAssistantReadOperations, ...captureAssistantProposalOperations] as const;
export const captureAssistantOperationSchema = z.enum(captureAssistantOperations);
export type CaptureAssistantOperation = z.infer<typeof captureAssistantOperationSchema>;
export type CaptureAssistantSurface = typeof captureAssistantSurfaces[number];
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const sourceFilters = captureSourceListQuerySchema.omit({ workspaceId: true, page: true, pageSize: true });
const intakeFilters = intakeQuerySchema.omit({ workspaceId: true, page: true, pageSize: true });

/** Intent only. Never accepts identity, readiness, capabilities or server record versions. */
export const captureAssistantContextSchema = z.discriminatedUnion('surface', [
  z.object({ surface: z.literal('lead_capture.list'), filters: sourceFilters }).strict(),
  z.object({ surface: z.literal('lead_capture.new') }).strict(),
  z.object({ surface: z.enum(['lead_capture.setup', 'lead_capture.detail']), sourceId: captureIdSchema }).strict(),
  z.object({ surface: z.literal('intake.list'), filters: intakeFilters }).strict(),
  z.object({ surface: z.literal('intake.detail'), intakeId: captureIdSchema }).strict(),
]);
export type CaptureAssistantContext = z.infer<typeof captureAssistantContextSchema>;
const recordRead = z.object({ operation: z.enum(['source_details', 'source_summary', 'installation', 'publication_review']), sourceId: captureIdSchema }).strict();
export const captureAssistantQuerySchema = z.discriminatedUnion('operation', [
  z.object({ operation: z.literal('sources'), filters: sourceFilters, page: z.number().int().min(1).max(100000), limit: z.number().int().min(1).max(20) }).strict(),
  recordRead,
  z.object({ operation: z.literal('intake_items'), filters: intakeFilters, page: z.number().int().min(1).max(100000), limit: z.number().int().min(1).max(20) }).strict(),
  z.object({ operation: z.enum(['intake_details', 'duplicate_candidates']), intakeId: captureIdSchema }).strict(),
]);

/** Persisted, server-derived read evidence; hash includes the scoped query and relevant versions. */
export const captureAssistantEvidenceSchema = z.object({
  workspaceId: captureIdSchema,
  operation: z.enum(captureAssistantReadOperations),
  retrievedAt: z.iso.datetime(),
  accessHash: hash,
  snapshotHash: hash,
  sources: z.array(z.object({ sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema.nullable(), approvedVersion: captureVersionSchema.nullable() }).strict()).max(20),
  intake: z.array(z.object({ intakeId: captureIdSchema, intakeVersion: captureVersionSchema, receiptId: captureIdSchema }).strict()).max(20),
  leads: z.array(z.object({ leadId: captureIdSchema, leadVersion: captureVersionSchema, accessHash: hash }).strict()).max(20),
}).strict().superRefine((value, context) => {
  if (new Set(value.sources.map(row => row.sourceId)).size !== value.sources.length || new Set(value.intake.map(row => row.intakeId)).size !== value.intake.length || new Set(value.leads.map(row => row.leadId)).size !== value.leads.length) context.addIssue({ code: 'custom', message: 'Duplicate evidence references.' });
  if (['source_details', 'source_summary', 'installation', 'publication_review'].includes(value.operation) && value.sources.length !== 1) context.addIssue({ code: 'custom', message: 'One source stamp is required.' });
  if (['intake_details', 'duplicate_candidates'].includes(value.operation) && value.intake.length !== 1) context.addIssue({ code: 'custom', message: 'One intake stamp is required.' });
  if (!['intake_items', 'intake_details', 'duplicate_candidates'].includes(value.operation) && (value.intake.length || value.leads.length)) context.addIssue({ code: 'custom', message: 'Unexpected intake or lead evidence.' });
});

const target = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('new_source') }).strict(),
  z.object({ kind: z.literal('source'), sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema.nullable(), approvedVersion: captureVersionSchema.nullable() }).strict(),
  z.object({ kind: z.literal('intake'), intakeId: captureIdSchema, intakeVersion: captureVersionSchema, reviewId: captureIdSchema, definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, lead: z.object({ leadId: captureIdSchema, leadVersion: captureVersionSchema }).strict().nullable() }).strict(),
]);
export const captureAssistantProposalStates = ['pending', 'confirmed', 'cancelled', 'superseded', 'expired'] as const;
/** Binding only: operation-specific reviewed payloads are added with their canonical services. */
export const captureAssistantProposalBindingSchema = z.object({
  workspaceId: captureIdSchema, proposalId: captureIdSchema, inputHash: hash,
  operation: z.enum(captureAssistantProposalOperations), target,
  transition: z.object({ transitionId: captureIdSchema, configurationVersion: captureVersionSchema }).strict().optional(),
}).strict().superRefine((value, context) => {
  if (['change_schedule', 'cancel_schedule'].includes(value.operation) !== !!value.transition) context.addIssue({ code: 'custom', message: 'Select the pending transition only for a schedule change.' });
  const intake = ['correct_intake', 'create_lead', 'create_separate_lead', 'link_lead', 'dismiss_intake'].includes(value.operation);
  const expected = value.operation === 'create_source' ? 'new_source' : intake ? 'intake' : 'source';
  if (value.target.kind !== expected) context.addIssue({ code: 'custom', message: 'Operation and target mismatch.' });
  if (value.target.kind === 'intake' && (value.operation === 'link_lead') !== !!value.target.lead) context.addIssue({ code: 'custom', message: 'Only linking requires an exact lead version.' });
  if (value.target.kind === 'source') {
    if (['save_draft', 'suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample', 'publish'].includes(value.operation) && value.target.draftVersion === null) context.addIssue({ code: 'custom', message: 'A current draft is required.' });
    if (['begin_revision', 'resume', 'change_schedule', 'cancel_schedule'].includes(value.operation) && value.target.approvedVersion === null) context.addIssue({ code: 'custom', message: 'An approved configuration is required.' });
  }
});
export const captureAssistantProposalTicketSchema = captureAssistantProposalBindingSchema.extend({ state: z.enum(captureAssistantProposalStates), createdAt: z.iso.datetime(), expiresAt: z.iso.datetime() }).superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000) context.addIssue({ code: 'custom', message: 'Proposal lifetime must be at most fifteen minutes.' });
});
export const captureAssistantProposalDecisionSchema = z.object({ workspaceId: captureIdSchema, proposalId: captureIdSchema, inputHash: hash, decision: z.enum(['confirm', 'cancel']) }).strict();
export type CaptureAssistantProposalBinding = z.infer<typeof captureAssistantProposalBindingSchema>;
export type CaptureAssistantProposalTicket = z.infer<typeof captureAssistantProposalTicketSchema>;
export type CaptureAssistantQuery = z.infer<typeof captureAssistantQuerySchema>;
export type CaptureAssistantEvidence = z.infer<typeof captureAssistantEvidenceSchema>;
export type CaptureAssistantProposalDecision = z.infer<typeof captureAssistantProposalDecisionSchema>;

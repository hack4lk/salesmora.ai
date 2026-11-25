import { workflowProposalStoredSchema } from './workflows';
import { z } from 'zod';
import { leadSchema } from './lead';
import {
  leadStageDraftPayloadSchema, leadUpdateDraftPayloadSchema, leadAssignmentDraftPayloadSchema,
  leadNoteDraftPayloadSchema, leadArchiveDraftPayloadSchema, leadExportDraftPayloadSchema,
  leadDeleteDraftPayloadSchema,
} from './chat-actions';
import { customerCreateSchema, customerMutationSchema, customerExportSchema } from './customer';
import { customerDraftSchema } from './customer-chat';
import { createWorkOrderSchema, workOrderMutationSchema } from './work-order';
import { workOrderChatDraftSchema, workOrderExportSchema } from './work-order-chat';
import { materialMutationSchema, materialExportSchema } from './material';
import { estimateDraftChatStoredSchema } from './estimate-draft-chat';
import { estimateShareChatStoredSchema } from './estimate-share-chat';
import { estimateDecisionChatStoredSchema } from './estimate-decision-chat';
import { estimateDraftActionChatStoredSchema } from './estimate-draft-action-chat';
import { estimateVoidChatStoredSchema } from './estimate-void-chat';
import { estimateArchiveChatStoredSchema } from './estimate-archive-chat';
import { estimateDraftDeleteChatStoredSchema } from './estimate-draft-delete-chat';
import { estimateConversionChatStoredSchema } from './estimate-conversion-chat';
import { calendarProposalStoredSchema } from './calendar-proposal';
import { captureSetupProposeSchema, captureSetupViewSchema } from './lead-capture/assistant-setup';
import { captureSourceInputSchema, captureSourceProposalViewSchema } from './lead-capture/assistant-sources';

export const chatProposalFamilies = [
  'workflow', 'action', 'estimateDraft', 'estimateSharing', 'estimateDecision', 'estimateDraftAction',
  'estimateVoid', 'estimateArchive', 'estimateDraftDelete', 'estimateConversion',
  'calendar', 'captureSetup', 'captureSource', 'customer', 'workOrder', 'material',
] as const;
export const chatProposalFamilySchema = z.enum(chatProposalFamilies);
export type ChatProposalFamily = z.infer<typeof chatProposalFamilySchema>;
export const chatProposalStateSchema = z.enum(['pending', 'confirmed', 'cancelled', 'superseded']);
export type ChatProposalState = z.infer<typeof chatProposalStateSchema>;
export const chatProposalHashSchema = z.string().regex(/^[a-f0-9]{64}$/);

// Native command schemas trim/default/transform; stored signed JSON must not be rewritten.
function retained<S extends z.ZodType>(schema: S) {
  return z.custom<z.input<S>>(value => schema.safeParse(value).success, 'Invalid retained proposal payload.');
}

const empty = z.object({}).strict();
const leadFields = {
  accessHash: chatProposalHashSchema,
  ownerSnapshot: z.object({
    name: z.string(), role: z.enum(['owner', 'admin', 'office', 'field']), membershipVersion: z.string(),
  }).strict().nullable().optional(),
  leadId: z.uuid().nullable().optional(),
  stagePayload: z.null().optional(), updatePayload: z.null().optional(),
  assignmentPayload: z.null().optional(), notePayload: z.null().optional(),
  archivePayload: z.null().optional(), exportPayload: z.null().optional(), deletePayload: z.null().optional(),
};
export const leadActionProposalPayloadSchema = z.discriminatedUnion('actionType', [
  z.object({ ...leadFields, actionType: z.literal('lead.create'), capability: z.literal('leads.create'),
    lead: retained(leadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.stage'), capability: z.literal('leads.stage.update'),
    lead: empty, stagePayload: retained(leadStageDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.update'), capability: z.literal('leads.update'),
    lead: empty, updatePayload: retained(leadUpdateDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.assign'), capability: z.literal('leads.assign'),
    lead: empty, assignmentPayload: retained(leadAssignmentDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.note'), capability: z.literal('leads.read'),
    lead: empty, notePayload: retained(leadNoteDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.archive'), capability: z.literal('leads.archive'),
    lead: empty, archivePayload: retained(leadArchiveDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.export'), capability: z.literal('leads.export'),
    lead: empty, exportPayload: retained(leadExportDraftPayloadSchema) }).strict(),
  z.object({ ...leadFields, actionType: z.literal('lead.delete'), capability: z.literal('leads.delete'),
    lead: empty, deletePayload: retained(leadDeleteDraftPayloadSchema) }).strict(),
]);
const customerPreparedMutation = z.union([
  customerMutationSchema,
  customerMutationSchema.options[2].omit({ typedConfirmation: true, unlinkOpenLeads: true }),
]);
export const customerProposalStoredSchema = z.object({
  accessHash: chatProposalHashSchema, customerStamp: z.string().min(1),
  payload: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('create'), input: retained(customerCreateSchema) }).strict(),
    z.object({ kind: z.literal('mutation'), input: retained(customerPreparedMutation) }).strict(),
    z.object({ kind: z.literal('export'), input: retained(customerExportSchema) }).strict(),
    z.object({ kind: z.literal('deleted') }).strict(),
  ]),
  review: retained(customerDraftSchema),
}).strict();
export const workOrderProposalStoredSchema = z.object({
  accessHash: chatProposalHashSchema,
  payload: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('create'), input: retained(createWorkOrderSchema) }).strict(),
    z.object({ kind: z.literal('mutation'), input: retained(workOrderMutationSchema) }).strict(),
    z.object({ kind: z.literal('export'), input: retained(workOrderExportSchema) }).strict(),
  ]),
  review: retained(workOrderChatDraftSchema),
}).strict().refine(value => !value.review.action.startsWith('material-'), 'Material review belongs to the material family.');
export const materialProposalStoredSchema = z.object({
  accessHash: chatProposalHashSchema,
  payload: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('material'), input: retained(materialMutationSchema) }).strict(),
    z.object({ kind: z.literal('material-export'), input: retained(materialExportSchema) }).strict(),
  ]),
  review: retained(workOrderChatDraftSchema),
}).strict().refine(value => value.review.action.startsWith('material-'), 'Expected a Material review.');
const captureBinding = {
  authority: chatProposalHashSchema, turnId: z.uuid(), threadId: z.uuid(),
};
export const captureSetupProposalStoredSchema = z.object({
  ...captureBinding, input: captureSetupProposeSchema, view: captureSetupViewSchema, manual: z.boolean(),
}).strict();
export const captureSourceProposalStoredSchema = z.object({
  ...captureBinding, input: captureSourceInputSchema, view: captureSourceProposalViewSchema,
  deliveryStamp: z.string(),
}).strict();

const fields = {
  id: z.uuid(), workspaceId: z.uuid(), userId: z.string().min(1), threadId: z.uuid(), turnId: z.uuid(),
  payloadVersion: z.literal(1), state: chatProposalStateSchema, inputHash: chatProposalHashSchema,
  requestId: z.uuid().nullable(), expiresAt: z.iso.datetime(), createdAt: z.iso.datetime(), resolvedAt: z.iso.datetime().nullable(),
};
function family<F extends ChatProposalFamily, S extends z.ZodType>(name: F, payload: S) {
  return z.object({ ...fields, family: z.literal(name), payload: retained(payload) }).strict();
}
export const chatProposalSchema = z.discriminatedUnion('family', [
  family('workflow', workflowProposalStoredSchema),
  family('action', leadActionProposalPayloadSchema),
  family('estimateDraft', estimateDraftChatStoredSchema),
  family('estimateSharing', estimateShareChatStoredSchema),
  family('estimateDecision', estimateDecisionChatStoredSchema),
  family('estimateDraftAction', estimateDraftActionChatStoredSchema),
  family('estimateVoid', estimateVoidChatStoredSchema),
  family('estimateArchive', estimateArchiveChatStoredSchema),
  family('estimateDraftDelete', estimateDraftDeleteChatStoredSchema),
  family('estimateConversion', estimateConversionChatStoredSchema),
  family('calendar', calendarProposalStoredSchema),
  family('captureSetup', captureSetupProposalStoredSchema), family('captureSource', captureSourceProposalStoredSchema),
  family('customer', customerProposalStoredSchema), family('workOrder', workOrderProposalStoredSchema), family('material', materialProposalStoredSchema),
]).superRefine((value, context) => {
  const capture = value.family === 'captureSetup' || value.family === 'captureSource';
  if (capture !== (value.requestId !== null))
    context.addIssue({ code: 'custom', path: ['requestId'], message: 'Only Capture proposals require request identity.' });
});
export type ChatProposal = z.infer<typeof chatProposalSchema>;

export const estimateProposalFamilies = [
  'estimateDraft', 'estimateSharing', 'estimateDecision', 'estimateDraftAction',
  'estimateVoid', 'estimateArchive', 'estimateDraftDelete', 'estimateConversion',
] as const satisfies readonly ChatProposalFamily[];
export const pendingUniqueProposalFamilies = [
  ...estimateProposalFamilies, 'workflow', 'calendar', 'captureSetup', 'captureSource',
] as const satisfies readonly ChatProposalFamily[];
export const proposalSupersession: Readonly<Record<ChatProposalFamily, readonly ChatProposalFamily[]>> = {
  workflow: ['workflow'],
  action: ['action'], customer: ['customer', 'action'],
  workOrder: ['workOrder', 'material', 'customer', 'action'], material: ['workOrder', 'material', 'customer', 'action'],
  estimateDraft: estimateProposalFamilies, estimateSharing: estimateProposalFamilies,
  estimateDecision: estimateProposalFamilies, estimateDraftAction: estimateProposalFamilies,
  estimateVoid: estimateProposalFamilies, estimateArchive: estimateProposalFamilies,
  estimateDraftDelete: estimateProposalFamilies, estimateConversion: estimateProposalFamilies,
  calendar: ['calendar'], captureSetup: ['captureSetup', 'captureSource'], captureSource: ['captureSetup', 'captureSource'],
};

export const chatProposalAuditDetailsSchema = z.object({
  actionType: z.string().min(1).optional(), operation: z.string().min(1).optional(),
  leadId: z.uuid().nullable().optional(),
}).strict();
export type ChatProposalAuditDetails = z.infer<typeof chatProposalAuditDetailsSchema>;

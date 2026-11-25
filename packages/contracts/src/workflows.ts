import { scheduleChangeValuesSchema } from './workflow-schedule-change';
import { postJobRulesSchema, postJobValuesSchema, postJobPrepareRulesSchema } from './workflow-post-job';
import { assignedLeadColdValuesSchema } from './workflow-assigned-lead-cold';
import { customerVisitOptionsSchema, customerVisitValuesSchema } from './workflow-customer-visit';
import { annualReviewRulesSchema, annualReviewValuesSchema } from "./workflow-annual-service";
import {completionHandoffValuesSchema} from "./workflow-completion-handoff";
import { routingPolicySchema, routingPrepareSchema, routingSelectionSchema, smartRoutingValuesSchema, routingOptionsSchema } from './workflow-routing';
import {serviceDueRulesSchema,serviceDueValuesSchema} from "./workflow-service-due";
import { z } from "zod";
import { workspacePlanIdSchema } from "./billing";
import { cancellationRulesSchema, cancellationValuesSchema } from "./workflow-cancellation";
import { calendarBookingRulesSchema } from "./calendar-booking";
import { workflowBookingAssignmentModeSchema, workflowRoutineBookingValuesSchema } from "./workflow-routine-booking";
import { workflowChannelChoicesSchema, workflowNotificationChannelsSchema } from "./workflow-channels";
import { arrivalWindows } from "./job";

export const workflowRecipeSchema = z.enum(["unscheduled_estimate", "estimate_follow_up", "unassigned_lead", "weekly_briefing", "unassigned_visit", "visit_materials", "lead_routing", "routine_booking", "cancellation_fill", "service_due", "annual_service_review", "completion_handoff", "customer_visit_reminder", "assigned_lead_cold", "post_job_thank_you", "customer_schedule_change"]);

export { workflowChannelChoicesSchema, workflowNotificationChannelsSchema, type WorkflowNotificationChannels } from "./workflow-channels";

export const workflowActionSchema = z.enum(["pause", "resume", "delete"]);
export const workflowSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  rule: z.string().trim().min(1).max(1000),
  status: z.enum(["active", "paused"]),
  version: z.number().int().positive(),
  pendingCount: z.number().int().nonnegative(),
  allowedActions: z.array(workflowActionSchema),
  canRunNow: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  issue: z.string().max(500).optional(),
  kind: workflowRecipeSchema.optional(),
  notifications: workflowChannelChoicesSchema.optional(),
}).strict();
export const workflowListQuerySchema = z.object({ workspaceId: z.uuid() }).strict();
export const workflowCapacitySchema = z.object({
  plan: workspacePlanIdSchema,
  limit: z.number().int().positive(),
  used: z.number().int().nonnegative(),
  canManageBilling: z.boolean(),
}).strict();
export const workflowListSchema = z.object({
  rows: z.array(workflowSchema),
  total: z.number().int().nonnegative(),
  capacity: workflowCapacitySchema,
}).strict();
export const workflowCommandSchema = z.object({
  workspaceId: z.uuid(),
  id: z.uuid(),
  version: z.number().int().positive(),
  action: workflowActionSchema,
  confirmation: z.literal("confirm").optional(),
}).strict().refine(input => input.action !== "delete" || input.confirmation === "confirm", {
  message: "Type confirm to delete this workflow.",
  path: ["confirmation"],
});
export const workflowReceiptSchema = z.object({
  pendingCount: z.number().int().nonnegative(),
  id: z.uuid(),
  version: z.number().int().positive(),
  status: z.enum(["active", "paused", "deleted"]),
}).strict();
export type Workflow = z.infer<typeof workflowSchema>;
export type WorkflowList = z.infer<typeof workflowListSchema>;
export type WorkflowCommand = z.infer<typeof workflowCommandSchema>;

export const workflowLocalTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid send time.");
// Old tool calls without a recipe retain the original approved-work behavior.
const workflowChannelPatchSchema = z.object({ inApp: z.boolean().nullable(), email: z.boolean().nullable() }).strict();
const workflowCreateSchema = z.object({
  postJobRules: postJobPrepareRulesSchema.nullable().optional(),
  routing: routingPrepareSchema.nullable().optional(),
  annualReviewRules: annualReviewRulesSchema.nullable().optional(),
  serviceDueRules:serviceDueRulesSchema.nullable().optional(),
  cancellationRules:cancellationRulesSchema.nullable().optional(),
  assignmentMode:workflowBookingAssignmentModeSchema.nullable().optional(),
  service: z.string().min(1).max(200).nullable().optional(),
  bookingRules: calendarBookingRulesSchema.nullable().optional(),
  source: z.string().trim().min(1).max(200).nullable().optional(),
  operation: z.literal("create").optional(),
  workflowRef: z.null().optional(),
  kind: workflowRecipeSchema.default("unscheduled_estimate"),
  name: z.string().trim().min(1).max(120).nullable(),
  businessDays: z.number().int().min(1).max(30).nullable(),
  recipient: z.string().trim().max(200).nullable().transform(value=>value??''),
  localTime: workflowLocalTimeSchema.nullable().optional(),
  notifications: workflowChannelPatchSchema.nullish(),
}).strict().refine(value=>['assigned_lead_cold','post_job_thank_you','customer_schedule_change'].includes(value.kind)||value.name!==null,{message:'Choose a workflow name.'}).refine(value=>value.kind==='assigned_lead_cold'?true:['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(value.kind)?(!value.recipient||value.recipient==='me'):value.routing?value.kind==='lead_routing'&&!value.recipient:!!value.recipient,{message:'Choose a teammate, or provide an explicit routing team with recipient null.'}).refine(value => value.kind==='assigned_lead_cold'?true:["customer_schedule_change", "post_job_thank_you", "customer_visit_reminder", "weekly_briefing", "unassigned_visit", "visit_materials", "lead_routing", "routine_booking", "cancellation_fill", "service_due", "annual_service_review", "completion_handoff"].includes(value.kind) ? value.businessDays === null : value.businessDays !== null, { message: "Choose business days for lead and estimate reminders; use null for visits, briefings and routing." }).refine(value => value.kind === "completion_handoff" ? value.localTime==null && !value.source && ((value.notifications?.inApp??true) || (value.notifications?.email??true)) : value.kind === "lead_routing" ? !!value.source && value.localTime == null : !value.source && ((value.notifications?.inApp??true) || (value.notifications?.email??true)), { message: "Routing needs an intake source and no send time. Reminders need at least one channel." })
  .refine(value=>value.kind!=='customer_schedule_change'||value.localTime==null,{message:'Schedule-change notices send after five minutes, not at a daily time.'})
  .refine(value=>!['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(value.kind)||value.notifications?.inApp!==true&&value.notifications?.email!==false,{message:'Customer visit reminders use automatic email only.'})
  .transform(value=>({...value,name:value.name??(value.kind==='customer_schedule_change'?'Customer schedule-change notices':value.kind==='post_job_thank_you'?'Post-job thank-you':'Assigned lead needs attention'),...(value.kind==='assigned_lead_cold'&&value.businessDays==null?{businessDays:3}:{}),notifications:['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(value.kind)?{inApp:false,email:true}:{inApp:value.notifications?.inApp??true,email:value.notifications?.email??true}}));
const workflowBookingCreateSchema = workflowCreateSchema.refine(value => value.kind==='annual_service_review'?!!value.service&&!!value.annualReviewRules&&value.serviceDueRules==null&&value.cancellationRules==null&&value.bookingRules==null&&value.assignmentMode==null : value.annualReviewRules==null&&(value.kind==='service_due'?!!value.service&&!!value.serviceDueRules&&value.cancellationRules==null&&value.bookingRules==null&&value.assignmentMode==null : value.serviceDueRules==null&&(value.kind === 'cancellation_fill' ? !!value.service && !!value.cancellationRules && value.bookingRules==null && value.assignmentMode==null && value.localTime==null : value.cancellationRules==null && (value.kind === 'routine_booking' ? !!value.service && !!value.bookingRules && value.localTime == null : value.service == null && value.bookingRules == null && value.assignmentMode==null))), { message: 'Booking needs a service and complete booking rules, with no send time.' });
const workflowPrepareEditSchema = z.object({
  postJobRules: postJobPrepareRulesSchema.nullable().optional(),
  routing: routingPrepareSchema.nullable().optional(),
  annualReviewRules: annualReviewRulesSchema.nullable().optional(),
  serviceDueRules:serviceDueRulesSchema.nullable().optional(),
  cancellationRules:cancellationRulesSchema.nullable().optional(),
  assignmentMode:workflowBookingAssignmentModeSchema.nullable().optional(),
  service: z.string().min(1).max(200).nullable().optional(),
  bookingRules: calendarBookingRulesSchema.nullable().optional(),
  source: z.string().trim().min(1).max(200).nullable().optional(),
  operation: z.literal("edit"), workflowRef: z.string().trim().min(1).max(200),
  kind: workflowRecipeSchema.nullable().optional(), name: z.string().trim().min(1).max(120).nullable().optional(),
  businessDays: z.number().int().min(1).max(30).nullable().optional(),
  recipient: z.string().trim().min(1).max(200).nullable().optional(), localTime: workflowLocalTimeSchema.nullable().optional(),
  notifications: workflowChannelPatchSchema.nullable().optional(),
}).strict();
export const workflowPrepareSchema = z.union([workflowBookingCreateSchema, workflowPrepareEditSchema]);
/** Provider-shaped input reaches business validation for clarification instead of interrupting chat. */
export const workflowPrepareToolInputSchema = z.object({
  ...workflowPrepareEditSchema.shape,
  operation: z.enum(['create', 'edit']).optional(),
  workflowRef: z.string().trim().min(1).max(200).nullish(),
  businessDays: z.number().int().min(1).max(30).nullish(),
}).strict();


export const workflowEditValuesSchema = z.object({
  postJobValues: postJobValuesSchema.optional(),
  coldRecipientMode: z.enum(['owner','teammate']).optional(),
  routing: routingSelectionSchema.optional(),
  annualReviewRules: annualReviewRulesSchema.optional(),
  serviceDueRules:serviceDueRulesSchema.optional(),
  cancellationRules:cancellationRulesSchema.optional(),
  assignmentMode:workflowBookingAssignmentModeSchema.optional(),
  bookingTimezone: z.string().min(1).max(100).optional(), service: z.string().min(1).max(200).optional(), bookingRules: calendarBookingRulesSchema.optional(),
  sourceId: z.uuid().optional(),
  name: z.string().trim().min(1).max(120), localTime: workflowLocalTimeSchema,
  businessDays: z.number().int().min(1).max(30).nullable(), recipientId: z.string().max(200),
  notifications: workflowChannelChoicesSchema,
}).strict();
export type WorkflowEditValues = z.infer<typeof workflowEditValuesSchema>;
export const workflowEditCommandSchema = z.object({ workspaceId: z.uuid(), id: z.uuid(), version: z.number().int().positive(),
  requestId: z.uuid(), values: workflowEditValuesSchema }).strict();
export const workflowEditTargetSchema = z.object({ id: z.uuid(), version: z.number().int().positive(), status: z.enum(["active", "paused"]) }).strict();
const workflowDefinitionFields = {
  recipientId: z.string().min(1).max(200), recipientName: z.string().min(1).max(200),
  timezone: z.string().min(1).max(100), notifications: workflowNotificationChannelsSchema.optional(),
};
export const workflowDefinitionSchema = z.discriminatedUnion("kind", [
  z.object({...workflowDefinitionFields,kind:z.literal('customer_schedule_change'),quietMinutes:z.literal(5),maxBurstMinutes:z.literal(15),notifications:z.object({inApp:z.literal(false),email:z.literal(true)}).strict()}).strict(),
  z.object({ ...workflowDefinitionFields, kind: z.literal('post_job_thank_you'), rules: postJobRulesSchema, localTime: workflowLocalTimeSchema, notifications: z.object({inApp:z.literal(false),email:z.literal(true)}).strict() }).strict(),
  z.object({...workflowDefinitionFields,kind:z.literal('assigned_lead_cold'),businessDays:z.number().int().min(1).max(30),localTime:workflowLocalTimeSchema,recipientMode:z.enum(['owner','teammate']),recipientId:z.string().min(1).max(200).optional(),recipientName:z.string().min(1).max(200).optional()}).strict().refine(v=>v.recipientMode==='owner'?v.recipientId===undefined&&v.recipientName===undefined:!!v.recipientId&&!!v.recipientName,{message:'Choose the lead owner or a teammate.'}),
  z.object({ ...workflowDefinitionFields, kind: z.literal("customer_visit_reminder"), calendarDaysBefore: z.literal(1), localTime: workflowLocalTimeSchema, notifications: z.object({inApp:z.literal(false),email:z.literal(true)}).strict() }).strict(),
  z.object({...workflowDefinitionFields,kind:z.literal("completion_handoff")}).strict(),
  z.object({...workflowDefinitionFields,kind:z.literal("annual_service_review"),service:z.string().min(1).max(200),rules:annualReviewRulesSchema,localTime:workflowLocalTimeSchema}).strict(),
  z.object({...workflowDefinitionFields,kind:z.literal("service_due"),service:z.string().min(1).max(200),rules:serviceDueRulesSchema,localTime:workflowLocalTimeSchema}).strict(),
  z.object({...workflowDefinitionFields,kind:z.literal("cancellation_fill"),service:z.string().min(1).max(200),rules:cancellationRulesSchema}).strict(),
  z.object({ ...workflowDefinitionFields, kind: z.literal("routine_booking"), assignmentMode:workflowBookingAssignmentModeSchema.optional(), service: z.string().min(1).max(200), rules: calendarBookingRulesSchema }).strict(),
  z.object({ ...workflowDefinitionFields, recipientId: z.string().min(1).max(200).optional(), recipientName: z.string().min(1).max(200).optional(),
    routing: routingPolicySchema.optional(), notifications: workflowChannelChoicesSchema, kind: z.literal("lead_routing"), sourceId: z.uuid(), sourceName: z.string().min(1).max(200) }).strict()
    .refine(value => value.routing ? value.recipientId === undefined && value.recipientName === undefined : !!value.recipientId && !!value.recipientName, 'Review a single owner or an explicit routing team.'),
  z.object({ ...workflowDefinitionFields, kind: z.enum(["unscheduled_estimate", "estimate_follow_up", "unassigned_lead"]),
    businessDays: z.number().int().min(1).max(30), localTime: workflowLocalTimeSchema.optional() }).strict(),
  z.object({ ...workflowDefinitionFields, kind: z.literal("unassigned_visit"), calendarDaysBefore: z.literal(1), localTime: workflowLocalTimeSchema }).strict(),
  z.object({ ...workflowDefinitionFields, kind: z.literal("visit_materials"), calendarDaysBefore: z.literal(1), localTime: workflowLocalTimeSchema }).strict(),
  z.object({ ...workflowDefinitionFields, kind: z.literal("weekly_briefing"), weekday: z.literal("monday"), localTime: workflowLocalTimeSchema }).strict(),
]);
export const workflowEditDataSchema = z.object({
  scheduleChangeOptions: customerVisitOptionsSchema.optional(),
  postJobOptions: customerVisitOptionsSchema.optional(),
  customerVisitOptions: customerVisitOptionsSchema.optional(),
  routingOptions: routingOptionsSchema.optional(),
  workflow: z.object({ id: z.uuid(), workspaceId: z.uuid(), version: z.number().int().positive(), name: z.string().min(1).max(120),
    status: z.enum(["active", "paused"]), definition: workflowDefinitionSchema }).strict(),
  bookingOptions: z.object({ services: z.array(z.object({ value: z.string(), label: z.string() })), availabilityReady: z.boolean(),qualifiedWorkerCounts:z.record(z.string(),z.number().int().nonnegative()).optional(),canSelectWorkers:z.boolean().optional() }).optional(),
  sources: z.array(z.object({ id: z.uuid(), name: z.string().min(1) }).strict()).max(500).optional(),
  recipients: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) }).strict()).max(500),
}).strict();
export type WorkflowEditData = z.infer<typeof workflowEditDataSchema>;
export const workflowEditResultSchema = z.object({ row: workflowSchema, definition: workflowDefinitionSchema }).strict();
export const workflowBriefingCountsSchema = z.object({
  inactiveLeads: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  awaitingEstimates: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  unscheduledJobs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  dueSoonJobs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict();
export const workflowBriefingSnapshotSchema = z.object({ counts: workflowBriefingCountsSchema,
  generatedAt: z.iso.datetime(), timezone: z.string().min(1).max(100) }).strict();
export const workflowBriefingSchema = workflowBriefingSnapshotSchema.extend({ id: z.uuid(), workspaceId: z.uuid() }).strict();
export type WorkflowBriefingSnapshot = z.infer<typeof workflowBriefingSnapshotSchema>;
export type WorkflowBriefing = z.infer<typeof workflowBriefingSchema>;
export const workflowDraftSchema = z.object({
  editing: workflowEditTargetSchema.optional(),
  id: z.uuid(),
  workspaceId: z.uuid(),
  inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.iso.datetime(),
  name: z.string().min(1).max(120),
  rule: z.string().min(1).max(1000),
  definition: workflowDefinitionSchema,
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
}).strict();
export const workflowPublishDecisionSchema = z.object({
  scheduleChangeValues: scheduleChangeValuesSchema.optional(),
  postJobValues: postJobValuesSchema.optional(),
  assignedLeadColdValues: assignedLeadColdValuesSchema.optional(),
  customerVisitValues: customerVisitValuesSchema.optional(),
  annualReviewValues: annualReviewValuesSchema.optional(),
  routingValues: smartRoutingValuesSchema.optional(),
  workspaceId: z.uuid(),
  id: z.uuid(),
  inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(["confirm", "cancel"]),
  notifications: workflowChannelChoicesSchema.optional(),
  localTime: workflowLocalTimeSchema.optional(),
  handoffValues:completionHandoffValuesSchema.optional(),
  serviceDueValues:serviceDueValuesSchema.optional(),
  cancellationValues:cancellationValuesSchema.optional(),
  bookingValues: workflowRoutineBookingValuesSchema.optional(),
  editValues: workflowEditValuesSchema.optional(),
}).strict();
export const workflowProposalStoredSchema = z.object({
  draft: workflowDraftSchema,
}).strict();
export type WorkflowDraft = z.infer<typeof workflowDraftSchema>;
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;
export const workflowDraftResultSchema = z.object({ draft: workflowDraftSchema }).strict();

export const workflowRunRequestSchema = z.object({
  workspaceId: z.uuid(), id: z.uuid(), version: z.number().int().positive(),
}).strict();
export const workflowRunConfirmSchema = workflowRunRequestSchema.extend({ previewId: z.uuid() });
export const workflowRunPreviewSchema = z.object({
  briefing: workflowBriefingSnapshotSchema.optional(),
  id: z.uuid(), matchedCount: z.number().int().min(0).max(100), actionSummary: z.string().min(1).max(500),
}).strict();
export const workflowRunResultSchema = z.object({
  completedCount: z.number().int().min(0).max(100), skippedCount: z.number().int().min(0).max(100),
  pendingCount: z.number().int().nonnegative(),
}).strict();

export const workflowNotificationsCommandSchema = z.object({
  workspaceId: z.uuid(), id: z.uuid(), version: z.number().int().positive(), notifications: workflowNotificationChannelsSchema,
}).strict();
export const workflowNotificationsReceiptSchema = z.object({
  id: z.uuid(), version: z.number().int().positive(), notifications: workflowNotificationChannelsSchema,
}).strict();

export const workflowVisitSnapshotSchema = z.object({
  reason: z.enum(["materials", "customer_reminder"]).optional(),
  title: z.string().min(1), customerName: z.string(), scheduledDate: z.iso.date(), arrivalWindow: z.enum(arrivalWindows).nullable(),
  timezone: z.string().min(1), recordLabels: z.array(z.string()).min(1).max(5), totalRecords: z.number().int().positive(),
}).strict();
export type WorkflowVisitSnapshot = z.infer<typeof workflowVisitSnapshotSchema>;
export const workflowRoutineBookingOptionsSchema = z.object({ services:z.array(z.object({value:z.string(),label:z.string()})),recipients:z.array(z.object({id:z.string(),name:z.string()})),availabilityReady:z.boolean(),qualifiedWorkerCounts:z.record(z.string(),z.number().int().nonnegative()).optional(),canSelectWorkers:z.boolean().optional() }).strict();

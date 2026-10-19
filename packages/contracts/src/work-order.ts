import { z } from "zod";
import { arrivalWindows, jobDateSchema } from "./job";

export const workOrderStatuses = ["draft", "issued", "in-progress", "completed", "canceled"] as const;
export const workOrderStatusSchema = z.enum(workOrderStatuses);
export type WorkOrderStatus = z.infer<typeof workOrderStatusSchema>;
export const workOrderIdSchema = z.uuid();

export const workOrderCancellationReasonMax = 500;
export const workOrderTextMax = 2000;
export const workOrderNoteMax = 1000;
export const workOrderSignatureMax = 60000;
export const workOrderMaterialStatuses = ["needed", "ordered", "on-hand", "used"] as const;
export const workOrderFollowUps = ["none", "work-order", "job-note"] as const;
const userId = z.string().trim().min(1).max(200);
const crewIds = z.array(userId).max(50).refine(ids => new Set(ids).size === ids.length);
const longText = z.string().trim().max(workOrderTextMax);
const expected = { workspaceId: z.uuid(), workOrderId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive() };

export const workOrderTaskInputSchema = z.object({ label: z.string().trim().min(1).max(200), required: z.boolean().default(false) }).strict();
export const workOrderMaterialInputSchema = z.object({
  catalogId: z.uuid().nullable().default(null), name: z.string().trim().min(1).max(200),
  quantity: z.number().positive().max(999999), unit: z.string().trim().min(1).max(40).default("each"),
  status: z.enum(workOrderMaterialStatuses).default("needed"), note: z.string().trim().max(500).default(""),
  customerPriceCents: z.number().int().min(0).nullable().default(null), costCents: z.number().int().min(0).nullable().default(null),
}).strict();

export const workOrderSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("blank") }).strict(),
  z.object({ kind: z.literal("duplicate"), workOrderId: z.uuid() }).strict(),
  z.object({ kind: z.literal("estimate"), estimateId: z.uuid() }).strict(),
]);
export const createWorkOrderSchema = z.object({
  workspaceId: z.uuid(), submissionId: z.uuid(), jobId: z.uuid(), title: z.string().trim().min(1).max(200),
  assigneeId: userId.nullable().default(null), source: workOrderSourceSchema.default({ kind: "blank" }),
}).strict();
export type CreateWorkOrderInput = z.input<typeof createWorkOrderSchema>;

export const workOrderMutationSchema = z.discriminatedUnion("action", [
  z.object({ ...expected, action: z.literal("edit"), title: z.string().trim().min(1).max(200).optional(),
    instructions: longText.optional(), accessNotes: longText.optional(), safetyNotes: longText.optional() }).strict()
    .refine(i => i.title !== undefined || i.instructions !== undefined || i.accessNotes !== undefined || i.safetyNotes !== undefined, { message: "Nothing to change." }),
  z.object({ ...expected, action: z.literal("schedule"), scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable() }).strict()
    .refine(i => !i.arrivalWindow || !!i.scheduledDate, { message: "An arrival window requires a scheduled date." }),
  z.object({ ...expected, action: z.literal("assign"), assigneeId: userId.nullable(), crewIds }).strict(),
  z.object({ ...expected, action: z.literal("tasks"), tasks: z.array(workOrderTaskInputSchema.extend({ id: z.uuid().optional() })).max(200) }).strict(),
  z.object({ ...expected, action: z.literal("task-toggle"), taskId: z.uuid(), done: z.boolean() }).strict(),
  z.object({ ...expected, action: z.literal("materials"), materials: z.array(workOrderMaterialInputSchema.extend({ id: z.uuid().optional() })).max(200) }).strict(),
  z.object({ ...expected, action: z.literal("status"), to: workOrderStatusSchema.exclude(["draft", "completed"]),
    reason: z.string().trim().max(workOrderCancellationReasonMax).default(""), confirmed: z.boolean().default(false) }).strict()
    .refine(i => i.to !== "canceled" || i.reason.length > 0, { message: "Canceling requires a reason.", path: ["reason"] }),
  z.object({ ...expected, action: z.literal("complete"), summary: z.string().trim().min(1).max(workOrderTextMax),
    followUp: z.enum(workOrderFollowUps).default("none"), followUpNote: z.string().trim().max(1000).default(""),
    signerName: z.string().trim().max(200).default(""), signatureImage: z.string().regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/).max(workOrderSignatureMax).nullable().default(null),
    overrideReason: z.string().trim().max(500).default("") }).strict()
    .refine(i => !i.signatureImage || i.signerName.length > 0, { message: "A signature needs the signer's name.", path: ["signerName"] }),
  z.object({ ...expected, action: z.literal("reopen"), reason: z.string().trim().min(1).max(500) }).strict(),
  z.object({ ...expected, action: z.literal("archive"), archived: z.boolean() }).strict(),
  z.object({ ...expected, action: z.literal("delete") }).strict(),
  z.object({ ...expected, action: z.literal("note"), body: z.string().trim().min(1).max(workOrderNoteMax) }).strict(),
]);
export type WorkOrderMutation = z.output<typeof workOrderMutationSchema>;

export const workOrderQuerySchema = z.object({
  workspaceId: z.uuid(), q: z.string().trim().max(200).default(""),
  status: workOrderStatusSchema.optional(), assigneeId: userId.optional(), jobId: z.uuid().optional(), jobNumber: z.string().trim().max(40).optional(),
  scheduledFrom: jobDateSchema.optional(), scheduledTo: jobDateSchema.optional(),
  mine: z.boolean().default(false), archived: z.boolean().default(false),
  sort: z.enum(["number", "scheduledDate", "updatedAt"]).default("scheduledDate"), direction: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().min(1).max(100000).default(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict().refine(q => !q.scheduledFrom || !q.scheduledTo || q.scheduledFrom <= q.scheduledTo, { message: "The range start must not be after its end.", path: ["scheduledTo"] });
export type WorkOrderQuery = z.input<typeof workOrderQuerySchema>;

/** Only recognized URL parameters are projected into the strict query contract. */
export function workOrderQueryFromURL(workspaceId: string, params: URLSearchParams): WorkOrderQuery {
  const optional = (key: string) => params.get(key) || undefined;
  return workOrderQuerySchema.parse({ workspaceId, q: optional("q"), status: optional("status"), assigneeId: optional("assigneeId"), jobId: optional("jobId"),
    jobNumber: optional("jobNumber"), scheduledFrom: optional("scheduledFrom"), scheduledTo: optional("scheduledTo"),
    mine: params.get("mine") === "true", archived: params.get("archived") === "true", sort: optional("sort"), direction: optional("direction"),
    page: params.has("page") ? Number(params.get("page")) : undefined, pageSize: params.has("pageSize") ? Number(params.get("pageSize")) : undefined });
}

export type WorkOrderRecord = {
  id: string; number: string; jobId: string; title: string; status: WorkOrderStatus;
  instructions: string; accessNotes: string; safetyNotes: string;
  scheduledDate: string | null; arrivalWindow: typeof arrivalWindows[number] | null;
  primaryAssigneeId: string | null; crewIds: string[]; sourceEstimateId: string | null;
  cancellationReason: string | null; changedAfterIssue: boolean; archived: boolean;
  issuedAt: string | null; startedAt: string | null; completedAt: string | null; canceledAt: string | null;
  version: number; createdAt: string; updatedAt: string;
};
export type WorkOrderCapabilityFlags = { update: boolean; issue: boolean; start: boolean; progress: boolean; complete: boolean; cancel: boolean; reopen: boolean; archive: boolean; remove: boolean; print: boolean; duplicate: boolean };
export type WorkOrderRowView = WorkOrderRecord & {
  jobNumber: string; customerName: string; address: string; assigneeName: string | null; crewNames: string[];
  tasksDone: number; tasksTotal: number; overdue: boolean; capabilities: WorkOrderCapabilityFlags;
};
export type WorkOrderListResult = {
  rows: WorkOrderRowView[]; total: number; page: number; pageSize: number; timezone: string; today: string;
  metrics: { issuedToday: number; inProgress: number; overdue: number; awaitingSignoff: number };
  options: { members: { id: string; name: string }[]; jobs: { id: string; number: string; title: string; customerName: string }[] };
  canCreate: boolean; canExport: boolean;
};
export { ZodError as WorkOrderContractError } from "zod";

export type WorkOrderTaskView = { id: string; label: string; required: boolean; done: boolean; doneByName: string | null; doneAt: string | null };
export type WorkOrderMaterialView = { id: string; catalogId: string | null; name: string; quantity: number; unit: string; status: typeof workOrderMaterialStatuses[number]; note: string; customerPriceCents: number | null; costCents: number | null };
export type WorkOrderActivityView = { id: string; type: string; actorName: string; source: "ui" | "assistant-confirmed" | "system"; changes: unknown; createdAt: string };
export type WorkOrderNoteView = { id: string; body: string; authorName: string; createdAt: string };
export type WorkOrderCompletionView = { summary: string; followUp: typeof workOrderFollowUps[number]; followUpNote: string; completedByName: string; completedAt: string; signerName: string | null; signedAt: string | null; signatureImage: string | null; overrideReason: string };
export type WorkOrderDetailResult = {
  workOrder: WorkOrderRowView; tasks: WorkOrderTaskView[]; materials: WorkOrderMaterialView[]; activity: WorkOrderActivityView[]; notes: WorkOrderNoteView[]; completion: WorkOrderCompletionView | null;
  members: { id: string; name: string }[]; access: { prices: boolean; costs: boolean; canSchedule: boolean; canOverride: boolean; canNote: boolean; signoffRequired: boolean };
  businessPhone: string;
  contact: { name: string; phone: string | null; address: string };
};

export const workOrderSettingsSchema = z.object({
  workspaceId: z.string().uuid(),
  signoffRequired: z.boolean(),
  businessPhone: z.string().trim().max(32).regex(/^[0-9+()\-.\sx]*$/, "Use digits and common phone symbols only."),
}).strict();
export type WorkOrderSettingsInput = z.output<typeof workOrderSettingsSchema>;
export type WorkOrderSettings = Pick<WorkOrderSettingsInput, "signoffRequired" | "businessPhone">;

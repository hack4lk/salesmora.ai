import { z } from "zod";
import { workOrderStatusSchema, workOrderQuerySchema } from "./work-order";

export const workOrderChatOperations = ["search", "details"] as const;
export const workOrderChatWhen = ["any", "today", "tomorrow", "this_week", "overdue"] as const;

/** Flat and nullable so the same shape works as a strict provider function schema; the model never supplies ids, workspaces or user ids. */
export const workOrdersQuerySchema = z.object({
  operation: z.enum(workOrderChatOperations),
  query: z.string().trim().max(200).nullable(),
  status: workOrderStatusSchema.nullable(),
  mine: z.boolean().nullable(),
  when: z.enum(workOrderChatWhen).nullable(),
  workOrderNumber: z.string().trim().regex(/^WO-\d{1,6}$/i).nullable(),
  limit: z.number().int().min(1).max(20).nullable(),
}).strict().refine(value => value.operation !== "details" || !!value.workOrderNumber, { message: "details needs a work order number.", path: ["workOrderNumber"] });
export type WorkOrdersQuery = z.infer<typeof workOrdersQuerySchema>;

export const workOrderProposeOperations = [
  "create", "edit", "schedule", "assign", "add_tasks", "toggle_task", "add_materials",
  "set_status", "complete", "reopen", "add_note", "export_csv",
] as const;
export type WorkOrderProposeOperation = (typeof workOrderProposeOperations)[number];
export const workOrderExportColumns = ["number", "title", "status", "job", "customer", "address", "assignee", "crew", "scheduledDate", "arrivalWindow", "tasks"] as const;
export const workOrderExportSchema = z.object({
  query: workOrderQuerySchema, columns: z.array(z.enum(workOrderExportColumns)).min(1).max(11), expectedCount: z.number().int().positive().max(50000),
}).strict();
/** The list button exports every column for the filters the list is showing; the server re-reads the scope and checks the count. */
export const workOrderExportRequestSchema = z.object({ workspaceId: z.uuid(), query: z.record(z.string(), z.unknown()), expectedCount: z.number().int().positive().max(50000) }).strict();
export const workOrderChatStatuses = ["issued", "in-progress", "canceled"] as const;

/** Flat and nullable like the query tool. The model names records by number or person; the server resolves and authorizes them. */
export const workOrdersProposeSchema = z.object({
  operation: z.enum(workOrderProposeOperations),
  workOrderNumber: z.string().trim().regex(/^WO-\d{1,6}$/i).nullable(),
  jobNumber: z.string().trim().regex(/^J-\d{1,6}$/i).nullable(),
  title: z.string().trim().min(1).max(200).nullable(),
  instructions: z.string().trim().max(2000).nullable(),
  safetyNotes: z.string().trim().max(2000).nullable(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  arrivalWindow: z.enum(["08:00-10:00", "09:00-11:00", "10:00-12:00", "12:00-14:00", "13:00-15:00", "14:00-16:00"]).nullable(),
  assignee: z.string().trim().max(254).nullable(),
  crew: z.array(z.string().trim().min(1).max(254)).max(20).nullable(),
  tasks: z.array(z.object({ label: z.string().trim().min(1).max(200), required: z.boolean() }).strict()).max(30).nullable(),
  taskLabel: z.string().trim().max(200).nullable(),
  done: z.boolean().nullable(),
  materials: z.array(z.object({ name: z.string().trim().min(1).max(200), quantity: z.number().positive().max(999999), unit: z.string().trim().min(1).max(40) }).strict()).max(30).nullable(),
  status: z.enum(workOrderChatStatuses).nullable(),
  reason: z.string().trim().max(500).nullable(),
  summary: z.string().trim().max(2000).nullable(),
  overrideReason: z.string().trim().max(500).nullable(),
  body: z.string().trim().max(1000).nullable(),
  query: z.string().trim().max(200).nullable(),
  filterStatus: workOrderStatusSchema.nullable(),
  mine: z.boolean().nullable(),
  when: z.enum(workOrderChatWhen).nullable(),
  columns: z.array(z.enum(workOrderExportColumns)).max(11).nullable(),
}).strict().superRefine((v, ctx) => {
  const need = (ok: unknown, path: keyof typeof v, message: string) => { if (!ok) ctx.addIssue({ code: "custom", path: [path], message }); };
  switch (v.operation) {
    case "create": need(v.jobNumber, "jobNumber", "Creating needs a job number."); need(v.title, "title", "Creating needs a title."); break;
    case "edit": need(v.title || v.instructions !== null || v.safetyNotes !== null, "title", "Nothing to change."); break;
    case "schedule": need(v.scheduledDate, "scheduledDate", "Scheduling needs a date."); break;
    case "assign": need(v.assignee, "assignee", "Assigning needs a teammate."); break;
    case "add_tasks": need(v.tasks?.length, "tasks", "Add at least one task."); break;
    case "toggle_task": need(v.taskLabel, "taskLabel", "Name the task."); need(v.done !== null, "done", "Say whether it is done."); break;
    case "add_materials": need(v.materials?.length, "materials", "Add at least one material."); break;
    case "set_status": need(v.status, "status", "Choose a status."); need(v.status !== "canceled" || v.reason, "reason", "Canceling needs a reason."); break;
    case "complete": need(v.summary, "summary", "Completing needs a work summary."); break;
    case "reopen": need(v.reason, "reason", "Reopening needs a reason."); break;
    case "add_note": need(v.body, "body", "A note needs text."); break;
    case "export_csv": break;
  }
});
export type WorkOrdersPropose = z.infer<typeof workOrdersProposeSchema>;

export const workOrderChatDraftSchema = z.object({
  id: z.uuid(),
  inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(),
  state: z.enum(["pending", "confirmed", "canceled", "expired", "superseded", "stale"]),
  action: z.enum(["create", "edit", "schedule", "assign", "tasks", "task-toggle", "materials", "issue", "start", "cancel", "complete", "reopen", "note", "export", "material-create", "material-propose", "material-edit", "material-archive", "material-restore", "material-export"]),
  workOrder: z.object({ id: z.uuid().optional(), number: z.string().max(40), title: z.string().max(200) }).strict(),
  changes: z.array(z.object({ label: z.string().max(200), before: z.string().max(2200), after: z.string().max(2200) }).strict()).max(40),
  warnings: z.array(z.string().max(300)).max(6).optional(),
  impact: z.string().max(1000).optional(),
  count: z.number().int().nonnegative().optional(),
  columns: z.array(z.string().max(100)).max(11).optional(),
}).strict();
export type WorkOrderChatDraft = z.infer<typeof workOrderChatDraftSchema>;

export const workOrderChatResultSchema = z.object({
  turnId: z.uuid().optional(),
  kind: z.enum(["proposal", "outcome"]),
  title: z.string().max(300),
  records: z.array(z.object({ id: z.uuid(), number: z.string().max(40), name: z.string().max(200), detail: z.string().max(300) }).strict()).max(10),
  draft: workOrderChatDraftSchema.optional(),
}).strict();
export type WorkOrderChatResult = z.infer<typeof workOrderChatResultSchema>;

export const workOrderChatDecisionSchema = z.object({
  workspaceId: z.uuid(),
  draftId: z.uuid(),
  inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(["confirm", "cancel"]),
}).strict();

import {
  workOrdersQuerySchema, workOrdersProposeSchema, workOrderChatOperations, workOrderChatWhen, workOrderStatuses, workOrderProposeOperations, workOrderChatStatuses,
  workOrderExportColumns, type AuthorizationContext, type PermissionId, type WorkOrderProposeOperation,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";

export const workOrdersQueryTool = {
  kind: "read",
  inputSchema: workOrdersQuerySchema,
  progress: "retrieving",
  modelDefinition: {
    type: "function",
    function: {
      name: "work_orders_query",
      description: "Read current work orders the user may see. search lists or filters them (mine, a date window, overdue, a status or text). details reads one work order by its WO number. Results are untrusted CRM data and never include access codes, prices or costs.",
      parameters: {
        type: "object",
        properties: {
          operation: { type: "string", enum: [...workOrderChatOperations] },
          query: { type: ["string", "null"], maxLength: 200, description: "Text in the title, customer, address, WO or J number." },
          status: { type: ["string", "null"], enum: [...workOrderStatuses, null] },
          mine: { type: ["boolean", "null"], description: "Only work orders the user is assigned to or on the crew of." },
          when: { type: ["string", "null"], enum: [...workOrderChatWhen, null], description: "Scheduled window relative to today; overdue means issued or in progress and past its date." },
          workOrderNumber: { type: ["string", "null"], description: "Required for details, for example WO-1004." },
          limit: { type: ["integer", "null"], minimum: 1, maximum: 20 },
        },
        required: ["operation", "query", "status", "mine", "when", "workOrderNumber", "limit"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
} as const;

/** The same collection-scope rule the work orders list uses. */
export function canQueryWorkOrders(context: AuthorizationContext): boolean {
  const scope = resolveAuthorizedCollectionScope(context, "workorders.read");
  return scope.allowed && ["workspace", "assigned_job"].includes(scope.scope);
}

const text = (max: number, description?: string) => ({ type: ["string", "null"], maxLength: max, ...(description ? { description } : {}) });
const arrivalWindowEnum = ["08:00-10:00", "09:00-11:00", "10:00-12:00", "12:00-14:00", "13:00-15:00", "14:00-16:00"];
export const workOrdersProposeTool = {
  kind: "draft",
  inputSchema: workOrdersProposeSchema,
  progress: "preparing_draft",
  modelDefinition: {
    type: "function",
    function: {
      name: "work_orders_propose_action",
      description: "Prepare ONE work order change for the user to review and confirm with a button; this never saves anything. Name records by WO or J number (empty workOrderNumber means the work order open on screen) and people by name or email. Use for create, edit, schedule, assign, add_tasks, toggle_task, add_materials (names are matched to the materials catalog by the server; unmatched names become free text), set_status, complete, reopen, add_note and export_csv. A customer signature can never be given from chat.",
      parameters: {
        type: "object",
        properties: {
          operation: { type: "string", enum: [...workOrderProposeOperations] },
          workOrderNumber: text(12, "Exact WO number, or null for the work order open on screen."),
          jobNumber: text(12, "create only: the job the work order belongs to, for example J-0012."),
          title: text(200),
          instructions: text(2000, "edit only: the full new instructions."),
          safetyNotes: text(2000, "edit only: the full new safety notes."),
          scheduledDate: text(10, "YYYY-MM-DD, resolved from today's date."),
          arrivalWindow: { type: ["string", "null"], enum: [...arrivalWindowEnum, null] },
          assignee: text(254, "assign (or create): a teammate's name or email, or \"unassigned\" to clear."),
          crew: { type: ["array", "null"], maxItems: 20, items: { type: "string", maxLength: 254 }, description: "assign only: the full crew by name or email; null keeps the current crew." },
          tasks: { type: ["array", "null"], maxItems: 30, items: { type: "object", properties: { label: { type: "string", maxLength: 200 }, required: { type: "boolean" } }, required: ["label", "required"], additionalProperties: false } },
          taskLabel: text(200, "toggle_task: the task's label."),
          done: { type: ["boolean", "null"] },
          materials: { type: ["array", "null"], maxItems: 30, items: { type: "object", properties: { name: { type: "string", maxLength: 200 }, quantity: { type: "number" }, unit: { type: "string", maxLength: 40 } }, required: ["name", "quantity", "unit"], additionalProperties: false } },
          status: { type: ["string", "null"], enum: [...workOrderChatStatuses, null] },
          reason: text(500, "Required to cancel or reopen."),
          summary: text(2000, "complete: the work summary."),
          overrideReason: text(500, "complete: only when the user gives a reason to finish with required tasks still open."),
          body: text(1000, "add_note: the exact note."),
          query: text(200, "export_csv filter text."),
          filterStatus: { type: ["string", "null"], enum: [...workOrderStatuses, null] },
          mine: { type: ["boolean", "null"] },
          when: { type: ["string", "null"], enum: [...workOrderChatWhen, null] },
          columns: { type: ["array", "null"], maxItems: 11, items: { type: "string", enum: [...workOrderExportColumns] } },
        },
        required: ["operation", "workOrderNumber", "jobNumber", "title", "instructions", "safetyNotes", "scheduledDate", "arrivalWindow", "assignee", "crew", "tasks", "taskLabel", "done", "materials", "status", "reason", "summary", "overrideReason", "body", "query", "filterStatus", "mine", "when", "columns"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
} as const;

const operationPermissions: Record<WorkOrderProposeOperation, PermissionId[]> = {
  create: ["workorders.create"],
  edit: ["workorders.update"], schedule: ["workorders.update"], assign: ["workorders.update"],
  add_tasks: ["workorders.update"], add_materials: ["workorders.update"],
  toggle_task: ["workorders.progress"], add_note: ["workorders.progress"],
  set_status: ["workorders.issue", "workorders.progress", "workorders.cancel"],
  complete: ["workorders.complete"], reopen: ["workorders.reopen"], export_csv: ["workorders.export"],
};
/** Collection-level capability only; the confirmed write re-authorizes against the exact record. */
export function availableWorkOrderOperations(context: AuthorizationContext): WorkOrderProposeOperation[] {
  if (!authorize(context, { permission: "assistant.use" }).allowed || !canQueryWorkOrders(context)) return [];
  const resource = { kind: "work_order" as const, id: "capability", workspaceId: context.workspaceId, job: null };
  return workOrderProposeOperations.filter(op => operationPermissions[op].some(permission =>
    permission === "workorders.export" ? resolveAuthorizedCollectionScope(context, permission).allowed
      : authorize(context, { permission, ...(permission === "workorders.create" ? {} : { resource }) }).allowed));
}

import { z } from "zod";

export const jobStatuses = ["needs-scheduling", "scheduled", "in-progress", "waiting", "completed", "canceled"] as const;
export const jobStatusSchema = z.enum(jobStatuses);
export type JobStatus = z.infer<typeof jobStatusSchema>;
export const jobIdSchema = z.uuid();
export const jobWaitingReasons = ["customer", "materials", "approval", "other"] as const;
export const jobCancellationReasons = ["customer-canceled", "unable-to-proceed", "duplicate", "other"] as const;
export const arrivalWindows = ["08:00-10:00", "09:00-11:00", "10:00-12:00", "12:00-14:00", "13:00-15:00", "14:00-16:00"] as const;
/** A workspace-local calendar date, never an implicitly converted UTC timestamp. */
export const jobDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
});
const userId = z.string().trim().min(1).max(200);
const text = z.string().trim().max(4000);
const expected = { workspaceId: z.uuid(), jobId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive() };
export const createJobSchema = z.object({
  workspaceId: z.uuid(), submissionId: z.uuid(), customerId: z.uuid(), sourceLeadId: z.uuid().nullable().default(null),
  title: z.string().trim().min(1).max(200), service: z.string().trim().max(200).default(""),
  location: z.string().trim().max(500).default(""), description: text.default(""),
  primaryOwnerId: userId.nullable(), teamUserIds: z.array(userId).max(100).refine(ids => new Set(ids).size === ids.length).default([]),
  scheduledDate: jobDateSchema.nullable().default(null), arrivalWindow: z.enum(arrivalWindows).nullable().default(null),
  completionDeadline: jobDateSchema.nullable().default(null),
}).strict().refine(input => !input.arrivalWindow || !!input.scheduledDate, { message: "An arrival window requires a scheduled work date.", path: ["arrivalWindow"] });
export type CreateJobInput = z.input<typeof createJobSchema>;
export const jobMutationSchema = z.discriminatedUnion("action", [
  z.object({ ...expected, action: z.literal("schedule"), scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable() }).strict()
    .refine(input => !input.arrivalWindow || !!input.scheduledDate, { message: "An arrival window requires a scheduled work date." }),
  z.object({ ...expected, action: z.literal("deadline"), completionDeadline: jobDateSchema.nullable() }).strict(),
  z.object({ ...expected, action: z.literal("assign"), primaryOwnerId: userId.nullable(), teamUserIds: z.array(userId).max(100).refine(ids => new Set(ids).size === ids.length) }).strict(),
  z.object({ ...expected, action: z.literal("note"), body: text.min(1) }).strict(),
  z.object({ ...expected, action: z.literal("status"), to: jobStatusSchema,
    waitingReason: z.enum(jobWaitingReasons).optional(), cancellationReason: z.enum(jobCancellationReasons).optional(),
    note: text.default(""), confirmed: z.boolean().default(false),
    // Reopening explicitly retains, changes or removes the old deadline. No implicit reminder restart.
    reopenDeadline: jobDateSchema.nullable().optional(),
  }).strict(),
]);
export type JobMutation = z.output<typeof jobMutationSchema>;
export const jobQuerySchema = z.object({
  workspaceId: z.uuid(), q: z.string().trim().max(200).default(""),
  status: jobStatusSchema.optional(), closed: z.boolean().default(false), ownerId: userId.optional(), customerId: z.uuid().optional(),
  service: z.string().trim().max(200).optional(), customerName: z.string().trim().max(200).optional(),
  mine: z.boolean().default(false), unassigned: z.boolean().default(false),
  deadline: z.enum(["all", "overdue", "upcoming", "unset"]).default("all"), createdAfter: jobDateSchema.optional(),
  sort: z.enum(["number", "title", "customerName", "service", "status", "ownerName", "scheduledDate", "completionDeadline", "createdAt"]).default("number"),
  direction: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().min(1).max(100000).default(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict();
export type JobQuery = z.input<typeof jobQuerySchema>;
export type JobRecord = {
  id: string; number: string; customerId: string | null; customerName: string; sourceLeadId: string | null;
  title: string; service: string; location: string; description: string; status: JobStatus;
  primaryOwnerId: string | null; teamUserIds: string[]; scheduledDate: string | null;
  arrivalWindow: typeof arrivalWindows[number] | null; completionDeadline: string | null;
  waitingReason: typeof jobWaitingReasons[number] | null; version: number; createdAt: string; updatedAt: string;
};

export type JobCapabilities = { status: boolean; complete: boolean; cancel: boolean; reopen: boolean; schedule: boolean; assign: boolean; note: boolean; edit: boolean; files: boolean; removeFiles: boolean };
export type JobMember = { id: string; name: string; role: "owner" | "admin" | "office" | "field" };
export type JobView = JobRecord & { ownerName: string; teamNames: string[]; nextStep: string; capabilities: JobCapabilities };
export type JobActivityRecord = { id: string; actorName: string; source: string; type: string; changes: Record<string, unknown>; createdAt: string };
export type JobListResult = { rows: JobView[]; total: number; page: number; pageSize: number; timezone: string; today: string;
  metrics: { active: number; overdue: number; waiting: number; unassigned: number };
  options: { members: JobMember[]; customers: { id: string; name: string }[]; customerNames: string[]; services: string[] };
  canCreate: boolean; canScheduleCreation: boolean;
};
export type JobDetailResult = { job: JobView; activity: JobActivityRecord[]; activityTotal: number; activityPage: number; canOpenCustomer: boolean; canOpenLead: boolean };
/** Only recognized URL parameters are projected into the strict query contract. */
export function jobQueryFromURL(workspaceId: string, params: URLSearchParams): JobQuery {
  const optional = (key: string) => params.get(key) || undefined;
  return jobQuerySchema.parse({ workspaceId, q: optional("q"), status: optional("status"), closed: params.get("closed") === "true",
    ownerId: optional("ownerId"), customerId: optional("customerId"), customerName: optional("customerName"), service: optional("service"),
    mine: params.get("mine") === "true", unassigned: params.get("unassigned") === "true", deadline: optional("deadline"), createdAfter: optional("createdAfter"),
    sort: optional("sort"), direction: optional("direction"), page: params.has("page") ? Number(params.get("page")) : undefined,
    pageSize: params.has("pageSize") ? Number(params.get("pageSize")) : undefined });
}

export { ZodError as JobContractError } from "zod";

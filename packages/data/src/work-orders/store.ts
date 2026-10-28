import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  workOrderQuerySchema, workOrderIdSchema,
  type AuthorizationContext, type PermissionId, type WorkOrderCapabilityFlags, type WorkOrderDetailResult, type WorkOrderListResult, type WorkOrderQuery, type WorkOrderRecord, type WorkOrderRowView, type WorkOrderStatus,
} from "@salesmora/contracts";
import { authorize, isOverdue, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";

export class WorkOrderConflictError extends Error {
  constructor(message = "This work order changed. Reload its current details before trying again.") { super(message); }
}
export class WorkOrderValidationError extends Error {}
export type Row = {
  id: string; workspaceId: string; workOrderNumber: number; jobId: string; title: string; status: WorkOrderStatus;
  instructions: string; accessNotes: string; safetyNotes: string; scheduledDate: string | null; arrivalWindow: WorkOrderRecord["arrivalWindow"];
  primaryAssigneeId: string | null; sourceEstimateId: string | null; cancellationReason: string | null;
  issuedAt: Date | null; startedAt: Date | null; completedAt: Date | null; canceledAt: Date | null; archivedAt: Date | null; changedAfterIssueAt: Date | null;
  version: number; createdAt: Date; updatedAt: Date;
  jobNumber: number; jobOwnerId: string | null; jobTeamUserIds: string[]; customerName: string; location: string;
  crewIds: string[]; tasksDone: number; tasksTotal: number; requiredOpen: number;
};
const iso = (d: Date | null) => d ? d.toISOString() : null;
export const formatWorkOrderNumber = (n: number) => `WO-${String(n).padStart(4, "0")}`;
export const resource = (row: Row) => ({ kind: "work_order" as const, id: row.id, workspaceId: row.workspaceId,
  primaryAssigneeId: row.primaryAssigneeId,
  assigneeIds: [...(row.primaryAssigneeId ? [row.primaryAssigneeId] : []), ...row.crewIds],
  job: { kind: "job" as const, id: row.jobId, workspaceId: row.workspaceId, ownerId: row.jobOwnerId, teamUserIds: row.jobTeamUserIds } });

/** Apply the current read scope in SQL before search, counts, pagination or record lookup; Field never sees drafts. */
export function scoped(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, "workorders.read");
  if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx("workOrders as w").join("jobs as j", q => q.on("j.workspaceId", "w.workspaceId").andOn("j.id", "w.jobId")).where("w.workspaceId", context.workspaceId);
  if (scope.scope === "assigned_job") {
    query.whereNot("w.status", "draft").andWhere(q => q.where("j.primaryOwnerId", context.userId).orWhere("w.primaryAssigneeId", context.userId).orWhereExists(
      trx("workOrderCrew as wc").select(trx.raw("1")).whereRaw('wc."workspaceId" = w."workspaceId" AND wc."workOrderId" = w.id').where("wc.userId", context.userId)).orWhereExists(
      trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where("jt.userId", context.userId)));
  }
  return query;
}
export const selects = (trx: Knex.Transaction) => [
  "w.*", trx.raw(`to_char(w."scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "j.jobNumber", "j.primaryOwnerId as jobOwnerId", "j.customerName", "j.location",
  trx.raw(`(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "jobTeamUserIds"`),
  trx.raw(`(SELECT coalesce(array_agg(c."userId" ORDER BY c."userId"), ARRAY[]::text[]) FROM "workOrderCrew" c WHERE c."workspaceId"=w."workspaceId" AND c."workOrderId"=w.id) AS "crewIds"`),
  trx.raw(`(SELECT count(*) FILTER (WHERE k.done)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "tasksDone"`),
  trx.raw(`(SELECT count(*)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "tasksTotal"`),
  trx.raw(`(SELECT count(*) FILTER (WHERE k.required AND NOT k.done)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "requiredOpen"`),
];
function dto(row: Row): WorkOrderRecord {
  return { id: row.id, number: formatWorkOrderNumber(row.workOrderNumber), jobId: row.jobId, title: row.title, status: row.status,
    instructions: row.instructions, accessNotes: row.accessNotes, safetyNotes: row.safetyNotes, scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow,
    primaryAssigneeId: row.primaryAssigneeId, crewIds: row.crewIds, sourceEstimateId: row.sourceEstimateId, cancellationReason: row.cancellationReason,
    changedAfterIssue: !!row.changedAfterIssueAt && row.status !== "draft", archived: !!row.archivedAt,
    issuedAt: iso(row.issuedAt), startedAt: iso(row.startedAt), completedAt: iso(row.completedAt), canceledAt: iso(row.canceledAt),
    version: row.version, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
function capabilities(row: Row, context: AuthorizationContext): WorkOrderCapabilityFlags {
  const can = (permission: PermissionId) => authorize(context, { permission, resource: resource(row) }).allowed;
  const open = !row.archivedAt && !["completed", "canceled"].includes(row.status);
  return { update: open && can("workorders.update"), issue: row.status === "draft" && !row.archivedAt && can("workorders.issue"),
    start: row.status === "issued" && !row.archivedAt && can("workorders.progress"), progress: open && row.status !== "draft" && can("workorders.progress"),
    complete: row.status === "in-progress" && !row.archivedAt && can("workorders.complete"), cancel: open && can("workorders.cancel"),
    reopen: !row.archivedAt && ["completed", "canceled"].includes(row.status) && can("workorders.reopen"),
    archive: ["completed", "canceled"].includes(row.status) && can("workorders.archive"), remove: row.status === "draft" && can("workorders.delete"),
    print: can("workorders.read"), duplicate: can("workorders.create") };
}
function view(row: Row, context: AuthorizationContext, names: Map<string, string>, today: string): WorkOrderRowView {
  const name = (id: string) => names.get(id) ?? "Former teammate";
  return { ...dto(row), jobNumber: `J-${String(row.jobNumber).padStart(4, "0")}`, customerName: row.customerName, address: row.location,
    assigneeName: row.primaryAssigneeId ? name(row.primaryAssigneeId) : null, crewNames: row.crewIds.map(name),
    tasksDone: row.tasksDone, tasksTotal: row.tasksTotal, overdue: isOverdue(row.status, row.scheduledDate, today), capabilities: capabilities(row, context) };
}
const like = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;

export async function readWorkOrders(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: WorkOrderQuery): Promise<WorkOrderListResult> {
  const input = workOrderQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const workspace = await trx("workspaces").where({ id: context.workspaceId }).first("timezone");
    const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [workspace.timezone])).rows[0];
    const live = () => scoped(trx, context).whereNull("w.archivedAt");
    const metricsRow = await live().select(trx.raw(
      `count(*) filter (where (w."issuedAt" AT TIME ZONE ?)::date = ?::date)::int as "issuedToday",
       count(*) filter (where w.status = 'in-progress')::int as "inProgress",
       count(*) filter (where w.status in ('issued','in-progress') and w."scheduledDate" < ?::date)::int as overdue,
       count(*) filter (where w.status = 'in-progress' and exists (select 1 from "workOrderTasks" k where k."workOrderId"=w.id) and not exists (select 1 from "workOrderTasks" k where k."workOrderId"=w.id and k.required and not k.done))::int as "awaitingSignoff"`,
      [workspace.timezone, today, today])).first();
    const base = scoped(trx, context);
    if (input.archived) base.whereNotNull("w.archivedAt"); else base.whereNull("w.archivedAt");
    if (input.status) base.where("w.status", input.status);
    if (input.assigneeId) base.where("w.primaryAssigneeId", input.assigneeId);
    if (input.jobId) base.where("w.jobId", input.jobId);
    if (input.jobNumber) base.whereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [like(input.jobNumber)]);
    if (input.scheduledFrom) base.where("w.scheduledDate", ">=", input.scheduledFrom);
    if (input.scheduledTo) base.where("w.scheduledDate", "<=", input.scheduledTo);
    if (input.mine) base.andWhere(q => q.where("w.primaryAssigneeId", context.userId).orWhereExists(
      trx("workOrderCrew as c").select(trx.raw("1")).whereRaw('c."workspaceId" = w."workspaceId" AND c."workOrderId" = w.id').where("c.userId", context.userId)));
    if (input.q) {
      const q = like(input.q);
      base.andWhere(b => b.whereILike("w.title", q).orWhereILike("j.customerName", q).orWhereILike("j.location", q)
        .orWhereRaw(`('WO-' || lpad(w."workOrderNumber"::text,4,'0')) ILIKE ?`, [q]).orWhereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [q]));
    }
    const total = Number((await base.clone().count({ n: "w.id" }).first())?.n ?? 0);
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
    const sortColumn = input.sort === "number" ? "w.workOrderNumber" : `w.${input.sort}`;
    const rows: Row[] = await base.clone().select(...selects(trx)).orderBy(sortColumn, input.direction, "last").orderBy("w.workOrderNumber").limit(input.pageSize).offset((page - 1) * input.pageSize);

    const canAssign = authorize(context, { permission: "workorders.update", resource: { kind: "work_order", id: context.workspaceId, workspaceId: context.workspaceId, job: null } }).allowed;
    const visible = await scoped(trx, context).select("w.primaryAssigneeId", "j.id as jobId", "j.jobNumber", "j.title as jobTitle", "j.customerName");
    const participantIds = new Set<string>(rows.flatMap(r => [...(r.primaryAssigneeId ? [r.primaryAssigneeId] : []), ...r.crewIds]));
    const memberQuery = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt");
    if (!canAssign) memberQuery.whereIn("u.id", [...participantIds, ...visible.map(v => v.primaryAssigneeId).filter(Boolean)]);
    const members: { id: string; name: string }[] = await memberQuery.select("u.id", "u.name").orderBy("u.name").orderBy("u.id");
    const names = new Map(members.map(m => [m.id, m.name]));
    const jobs = new Map<string, { id: string; number: string; title: string; customerName: string }>();
    for (const v of visible) jobs.set(v.jobId, { id: v.jobId, number: `J-${String(v.jobNumber).padStart(4, "0")}`, title: v.jobTitle, customerName: v.customerName });
    return { rows: rows.map(r => view(r, context, names, today)), total, page, pageSize: input.pageSize, timezone: workspace.timezone, today,
      metrics: { issuedToday: Number(metricsRow.issuedToday), inProgress: Number(metricsRow.inProgress), overdue: Number(metricsRow.overdue), awaitingSignoff: Number(metricsRow.awaitingSignoff) },
      options: { members, jobs: [...jobs.values()].sort((a, b) => a.number.localeCompare(b.number)) },
      canCreate: authorize(context, { permission: "workorders.create" }).allowed, canExport: resolveAuthorizedCollectionScope(context, "workorders.export").allowed };
  });
}

/** Single scoped record read; an out-of-scope or missing id is indistinguishable. */
export async function readWorkOrderRecord(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string): Promise<WorkOrderRowView> {
  id = workOrderIdSchema.parse(id);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const workspace = await trx("workspaces").where({ id: context.workspaceId }).first("timezone");
    const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [workspace.timezone])).rows[0];
    const row: Row | undefined = await scoped(trx, context).where("w.id", id).select(...selects(trx)).first();
    if (!row || !authorize(context, { permission: "workorders.read", resource: resource(row) }).allowed) throw new AuthorizationAccessError();
    const ids = [...(row.primaryAssigneeId ? [row.primaryAssigneeId] : []), ...row.crewIds];
    const people = ids.length ? await trx("users").whereIn("id", ids).select("id", "name") : [];
    return view(row, context, new Map(people.map(p => [p.id, p.name])), today);
  });
}

/** Record plus children; material prices and costs are only returned to callers who hold those permissions. */
export async function readWorkOrderDetail(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string): Promise<WorkOrderDetailResult> {
  const workOrder = await readWorkOrderRecord(db, identity, enabled, id);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await scoped(trx, context).where("w.id", workOrder.id).select(...selects(trx)).first();
    if (!row) throw new AuthorizationAccessError();
    const can = (permission: PermissionId) => authorize(context, { permission, resource: resource(row) }).allowed;
    const prices = can("workorders.view_prices"), costs = prices && can("workorders.view_costs");
    const where = { workspaceId: context.workspaceId, workOrderId: row.id };
    const taskRows = await trx("workOrderTasks as t").leftJoin("users as u", "u.id", "t.doneBy").where({ "t.workspaceId": where.workspaceId, "t.workOrderId": where.workOrderId }).orderBy("t.position").select("t.*", "u.name as doneByName");
    const materialRows = await trx("workOrderMaterials").where(where).orderBy("position");
    const activityRows = await trx("workOrderActivity").where(where).whereNot({ type: "note" }).orderBy("createdAt", "desc").orderBy("id", "desc").limit(50);
    const noteRows = await trx("workOrderActivity").where({ ...where, type: "note" }).orderBy("createdAt", "desc").orderBy("id", "desc").limit(100);
    const completionRow = await trx("workOrderCompletions").where(where).first();
    const settings = await trx("workspaces").where({ id: context.workspaceId }).first("businessPhone", "workOrderSignoffRequired");
    const customer = await trx("jobs as j").join("customers as c", q => q.on("c.workspaceId", "j.workspaceId").andOn("c.id", "j.customerId"))
      .where({ "j.workspaceId": context.workspaceId, "j.id": row.jobId }).first("c.phone");
    const canAssign = can("workorders.update");
    const members: { id: string; name: string }[] = canAssign
      ? await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt").select("u.id", "u.name").orderBy("u.name").orderBy("u.id")
      : [...(workOrder.primaryAssigneeId ? [{ id: workOrder.primaryAssigneeId, name: workOrder.assigneeName ?? "" }] : []), ...workOrder.crewIds.map((cid, i) => ({ id: cid, name: workOrder.crewNames[i] ?? "" }))];
    return {
      workOrder,
      tasks: taskRows.map(t => ({ id: t.id, label: t.label, required: t.required, done: t.done, doneByName: t.doneByName ?? null, doneAt: iso(t.doneAt) })),
      materials: materialRows.map(m => ({ id: m.id, catalogId: m.catalogId, name: m.name, quantity: Number(m.quantity), unit: m.unit, imageUrl: m.imageUrl ?? "", status: m.status, note: m.note,
        customerPriceCents: prices ? m.customerPriceCents : null, costCents: costs ? m.costCents : null })),
      activity: activityRows.map(a => ({ id: a.id, type: a.type, actorName: a.actorName, source: a.source, changes: a.changes, createdAt: a.createdAt.toISOString() })),
      notes: noteRows.map(a => ({ id: a.id, body: (a.changes as { body: string }).body, authorName: a.actorName, createdAt: a.createdAt.toISOString() })),
      completion: completionRow ? { summary: completionRow.summary, followUp: completionRow.followUp, followUpNote: completionRow.followUpNote, completedByName: completionRow.completedByName,
        completedAt: completionRow.completedAt.toISOString(), signerName: completionRow.signerName, signedAt: iso(completionRow.signedAt), signatureImage: completionRow.signatureImage, overrideReason: completionRow.overrideReason } : null,
      members, access: { prices, costs, canSchedule: !row.archivedAt && !["completed", "canceled"].includes(row.status) && can("workorders.schedule.update"), canNote: can("workorders.progress"), canOverride: context.membership.role !== "field" && can("workorders.complete"), signoffRequired: !!settings?.workOrderSignoffRequired },
      businessPhone: settings?.businessPhone ?? "",
      contact: { name: row.customerName, phone: customer?.phone || null, address: row.location },
    };
  });
}

export async function logWorkOrderFileActivity(
  db: Knex,
  identity: WorkspaceIdentity,
  workOrderId: string,
  action: 'file_uploaded' | 'file_removed',
  fileName: string
): Promise<void> {
  const actor = await db('users').where({ id: identity.userId }).first('name');
  const actorName = actor?.name || identity.userId;
  
  await db('workOrderActivity').insert({
    id: crypto.randomUUID(),
    workspaceId: identity.workspaceId,
    workOrderId,
    actorId: identity.userId,
    actorName,
    source: 'ui',
    type: action,
    changes: JSON.stringify({ fileName }),
  });
}

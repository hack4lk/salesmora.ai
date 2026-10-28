import { notifyVisitChange } from "../notifications/visits";
import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  calendarScheduleCommandSchema, calendarLinkCommandSchema, calendarSeparateCommandSchema, workOrderVisitChangeSchema,
  type WorkOrderVisitManagement, type CalendarVisit, type AuthorizationContext, type CalendarRecordRef, type CalendarSchedule, type PermissionId, type JobStatus,
} from "@salesmora/contracts";
import { assertCalendarRevision, authorize, CalendarRevisionError, scheduledJobStatus, assertEditable, editsChangeIssuedContent, WorkOrderLifecycleError } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { scoped, selects, resource, type Row } from "../work-orders/store";
import { calendarRecordColumn, calendarRecordTable, snapshotCalendarRecord } from "./sync";

type Source = "ui" | "assistant-confirmed";
type Loaded = { ref: CalendarRecordRef; row: { id: string; version: number; status: string; scheduledDate: string | null; arrivalWindow: string | null }; order?: Row };
type Result = { visitId: string; version: number; records: CalendarRecordRef[] };

async function load(trx: Knex.Transaction, context: AuthorizationContext, ref: CalendarRecordRef): Promise<Loaded> {
  if (ref.type === "work_order") {
    const row: Row | undefined = await scoped(trx, context).where("w.id", ref.id).select(...selects(trx)).forUpdate("w").first();
    if (!row || !authorize(context, { permission: "workorders.schedule.update", resource: resource(row) }).allowed) throw new AuthorizationAccessError();
    assertEditable({ status: row.status, archived: !!row.archivedAt });
    return { ref: { ...ref, expectedVersion: row.version }, row, order: row };
  }
  const row = await trx("jobs").where({ workspaceId: context.workspaceId, id: ref.id })
    .select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).forUpdate().first();
  if (!row) throw new AuthorizationAccessError();
  const team = await trx("jobTeamMembers").where({ workspaceId: context.workspaceId, jobId: row.id }).pluck("userId");
  const jobResource = { kind: "job" as const, id: row.id, workspaceId: context.workspaceId, ownerId: row.primaryOwnerId, teamUserIds: team };
  for (const permission of ["jobs.read", "jobs.schedule.update"] as const) {
    if (!authorize(context, { permission, resource: jobResource }).allowed) throw new AuthorizationAccessError();
  }
  if (["completed", "canceled"].includes(row.status)) throw new CalendarRevisionError();
  return { ref: { ...ref, expectedVersion: row.version }, row };
}
async function visit(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const row = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id }).forUpdate().first();
  if (!row) throw new AuthorizationAccessError();
  const links = await trx("calendarVisitRecords").where({ workspaceId: context.workspaceId, visitId: id }).whereNull("endedAt").orderBy("id").forUpdate();
  if (!links.length) throw new CalendarRevisionError();
  const records: Loaded[] = [];
  // Full membership is loaded and authorized before any details or version mismatch leave the service.
  for (const link of links) records.push(await load(trx, context, { type: link.jobId ? "job" : "work_order", id: link.jobId ?? link.workOrderId, expectedVersion: 1 }));
  return { row, records };
}
async function replay(trx: Knex.Transaction, context: AuthorizationContext, submissionId: string, hash: string): Promise<Result | undefined> {
  const previous = await trx("calendarOperations").where({ workspaceId: context.workspaceId, submissionId }).first();
  if (!previous) return;
  if (previous.actorId !== context.userId || previous.inputHash !== hash) throw new CalendarRevisionError();
  const result = previous.result as Result;
  for (const ref of result.records) await load(trx, context, ref);
  return result;
}
async function remember(trx: Knex.Transaction, context: AuthorizationContext, submissionId: string, hash: string, result: Result) {
  await trx("calendarOperations").insert({ workspaceId: context.workspaceId, submissionId, actorId: context.userId, inputHash: hash, result: JSON.stringify(result) });
  return result;
}
async function writeSchedule(trx: Knex.Transaction, context: AuthorizationContext, visitId: string, record: Loaded, schedule: CalendarSchedule, source: Source, action = "schedule") {
  const { row, ref, order } = record;
  const status = ref.type === "job" ? scheduledJobStatus(row.status as JobStatus, schedule.scheduledDate) : row.status;
  await snapshotCalendarRecord(trx, context.workspaceId, visitId, ref.type, row, schedule.scheduledDate ? "rescheduled" : "cleared");
  await trx(calendarRecordTable(ref.type)).where({ workspaceId: context.workspaceId, id: row.id }).update({ ...schedule, status, version: row.version + 1, updatedAt: trx.fn.now(),
    ...(ref.type === "job" ? { lastActivityAt: trx.fn.now() } : order && editsChangeIssuedContent(order.status) ? { changedAfterIssueAt: trx.fn.now() } : {}) });
  const actor = await trx("users").where({ id: context.userId }).first("name");
  await trx(ref.type === "job" ? "jobActivity" : "workOrderActivity").insert({ id: randomUUID(), workspaceId: context.workspaceId, [calendarRecordColumn(ref.type)]: row.id,
    actorId: context.userId, actorName: actor.name, source, type: action,
    changes: JSON.stringify({ visitId, from: { scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, status: row.status }, to: { ...schedule, status } }) });
  return { ...ref, expectedVersion: row.version + 1 };
}
const hashInput = (action: string, input: unknown, source: Source) => createHash("sha256").update(JSON.stringify({ action, input, source })).digest("hex");

export async function scheduleCalendarVisit(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, source: Source = "ui") {
  const input = calendarScheduleCommandSchema.parse(raw), hash = hashInput("schedule", input, source);
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const current = await visit(trx, context, input.visitId);
    const previous = await replay(trx, context, input.submissionId, hash); if (previous) return previous;
    assertCalendarRevision(current.row.version, input.expectedVisitVersion, current.records.map(r => r.ref), input.records);
    const before = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.visitId }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
    const records: CalendarRecordRef[] = [];
    for (const record of current.records) records.push(await writeSchedule(trx, context, input.visitId, record, input.schedule, source));
    await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.visitId })
      .update({ ...input.schedule, version: current.row.version + 1, updatedAt: trx.fn.now() });
    await notifyVisitChange(trx, context, input.submissionId, !input.schedule.scheduledDate ? "cleared" : before.scheduledDate ? "rescheduled" : "scheduled", records, before, input.schedule);
    return remember(trx, context, input.submissionId, hash, { visitId: input.visitId, version: current.row.version + 1, records });
  });
}

/** The only join path. Dates are copied from the Job's explicitly selected visit, never inferred. */
export async function linkCalendarWorkOrder(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, source: Source = "ui") {
  const input = calendarLinkCommandSchema.parse(raw), hash = hashInput("link", input, source);
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const previous = await replay(trx, context, input.submissionId, hash); if (previous) return previous;
    const target = await visit(trx, context, input.visitId), from = await visit(trx, context, input.sourceVisitId);
    assertCalendarRevision(target.row.version, input.expectedVisitVersion, target.records.map(r => r.ref), input.records);
    if (from.row.id === target.row.id || from.row.version !== input.expectedSourceVisitVersion || from.records.length !== 1 ||
      from.records[0].ref.type !== "work_order" || from.records[0].ref.id !== input.workOrderId || from.records[0].row.version !== input.expectedWorkOrderVersion) throw new CalendarRevisionError();
    const order = from.records[0];
    if (!target.row.scheduledDate || !target.records.some(r => r.ref.type === "job" && r.ref.id === order.order?.jobId) ||
      target.records.some(r => r.order && r.order.jobId !== order.order?.jobId)) throw new CalendarRevisionError();
    const date = await trx("calendarVisits").where({ id: input.visitId, workspaceId: context.workspaceId })
      .select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
    const before = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.sourceVisitId }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
    const ref = await writeSchedule(trx, context, input.sourceVisitId, order, date, source, "visit-linked");
    await notifyVisitChange(trx, context, input.submissionId, "joined", [ref], before, date);
    await trx("calendarVisitRecords").where({ workspaceId: context.workspaceId, visitId: input.sourceVisitId }).whereNull("endedAt").update({ endedAt: trx.fn.now() });
    await trx("calendarVisitRecords").insert({ id: randomUUID(), workspaceId: context.workspaceId, visitId: input.visitId, workOrderId: input.workOrderId });
    await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.sourceVisitId }).increment("version", 1).update({ updatedAt: trx.fn.now() });
    await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.visitId }).increment("version", 1).update({ updatedAt: trx.fn.now() });
    return remember(trx, context, input.submissionId, hash, { visitId: input.visitId, version: target.row.version + 1, records: [...target.records.map(r => r.ref), ref] });
  });
}

export async function separateCalendarWorkOrder(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, source: Source = "ui") {
  const input = calendarSeparateCommandSchema.parse(raw), hash = hashInput("separate", input, source);
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const previous = await replay(trx, context, input.submissionId, hash); if (previous) return previous;
    const current = await visit(trx, context, input.visitId);
    assertCalendarRevision(current.row.version, input.expectedVisitVersion, current.records.map(r => r.ref), input.records);
    const order = current.records.find(r => r.ref.type === "work_order" && r.ref.id === input.workOrderId);
    if (!order || current.records.length < 2) throw new CalendarRevisionError();
    const before = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.visitId }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
    const id = randomUUID();
    await snapshotCalendarRecord(trx, context.workspaceId, input.visitId, order.ref.type, order.row, "separated");
    await trx("calendarVisits").insert({ id, workspaceId: context.workspaceId, ...input.schedule });
    const ref = await writeSchedule(trx, context, id, order, input.schedule, source, "visit-separated");
    await trx("calendarVisitRecords").where({ workspaceId: context.workspaceId, visitId: input.visitId, workOrderId: input.workOrderId }).whereNull("endedAt").update({ endedAt: trx.fn.now() });
    await trx("calendarVisitRecords").insert({ id: randomUUID(), workspaceId: context.workspaceId, visitId: id, workOrderId: input.workOrderId });
    await notifyVisitChange(trx, context, input.submissionId, "separated", [ref], before, input.schedule);
    // Membership revision changes; original visit's date/window and other resource rows stay untouched.
    await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: input.visitId }).increment("version", 1).update({ updatedAt: trx.fn.now() });
    return remember(trx, context, input.submissionId, hash, { visitId: id, version: 1, records: [ref] });
  });
}

/** Creation preview uses Job access, independent of Calendar menu access. Never expose hidden linked records. */
export async function workOrderCreationVisit(trx: Knex.Transaction, context: AuthorizationContext, jobId: string) {
  const job = await trx("jobs").where({ workspaceId: context.workspaceId, id: jobId }).first();
  const team = await trx("jobTeamMembers").where({ workspaceId: context.workspaceId, jobId }).pluck("userId");
  if (!job || !authorize(context, { permission: "workorders.create" }).allowed ||
    !authorize(context, { permission: "jobs.read", resource: { kind: "job", id: jobId, workspaceId: context.workspaceId, ownerId: job.primaryOwnerId, teamUserIds: team } }).allowed) throw new AuthorizationAccessError();
  if (["completed", "canceled"].includes(job.status)) throw new CalendarRevisionError();
  const link = await trx("calendarVisitRecords").where({ workspaceId: context.workspaceId, jobId }).whereNull("endedAt").first();
  if (!link) throw new CalendarRevisionError();
  const current = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: link.visitId })
    .select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
  if (!current) throw new CalendarRevisionError();
  if (!current.scheduledDate) return null;
  const workspace = await trx("workspaces").where({ id: context.workspaceId }).first("timezone");
  let loaded: Awaited<ReturnType<typeof visit>> | undefined;
  try { loaded = await visit(trx, context, current.id); }
  catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; }
  const records = loaded?.records.map(r => r.ref) ?? [];
  const references = [`J-${String(job.jobNumber).padStart(4, "0")}`];
  // A successful full authorization is required before reading any linked work-order number.
  if (loaded) for (const record of loaded.records) if (record.order) references.push(`WO-${String(record.order.workOrderNumber).padStart(4, "0")}`);
  return { id: current.id as string, scheduledDate: current.scheduledDate as string, arrivalWindow: current.arrivalWindow as CalendarSchedule["arrivalWindow"],
    timezone: workspace.timezone as string, canJoin: !!loaded, references,
    revision: createHash("sha256").update(JSON.stringify([current.version, records])).digest("hex"),
    review: loaded ? { expectedVisitVersion: current.version as number, records } : null };
}
export async function readWorkOrderCreationVisit(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], jobId: string) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const result = await workOrderCreationVisit(trx, context, jobId);
    if (!result) return null;
    // Internal command records are never part of the HTTP preview.
    const { review: _review, ...preview } = result;
    void _review;
    return preview;
  });
}

const membershipRevision = (loaded: Awaited<ReturnType<typeof visit>>) => createHash("sha256").update(JSON.stringify([loaded.row.version, loaded.records.map(r => r.ref)])).digest("hex");

async function projectManagedVisit(trx: Knex.Transaction, context: AuthorizationContext, loaded: Awaited<ReturnType<typeof visit>>, timezone: string, today: string): Promise<CalendarVisit> {
  const refs = loaded.records, first = refs[0];
  const jobId = first.order?.jobId ?? first.row.id;
  const job = await trx("jobs").where({ workspaceId: context.workspaceId, id: jobId }).select("*", trx.raw(`to_char("completionDeadline",'YYYY-MM-DD') AS "completionDeadline"`)).first();
  const canReadJob = !first.order || authorize(context, { permission: "jobs.read", resource: resource(first.order).job }).allowed;
  const people = new Set<string>();
  for (const item of refs) {
    if (item.order) {
      if (item.order.primaryAssigneeId) people.add(item.order.primaryAssigneeId);
      item.order.crewIds.forEach(id => people.add(id));
    } else {
      const owner = await trx("jobs").where({ workspaceId: context.workspaceId, id: item.row.id }).first("primaryOwnerId");
      if (owner.primaryOwnerId) people.add(owner.primaryOwnerId);
      (await trx("jobTeamMembers").where({ workspaceId: context.workspaceId, jobId: item.row.id }).pluck("userId")).forEach(id => people.add(id));
    }
  }
  const names = await trx("users").whereIn("id", [...people]).select("id", "name");
  const date = await trx("calendarVisits").where({ workspaceId: context.workspaceId, id: loaded.row.id })
    .select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
  const records: CalendarVisit["records"] = refs.map(item => item.order ? { type: "work_order", id: item.row.id,
    number: `WO-${String(item.order.workOrderNumber).padStart(4, "0")}`, title: item.order.title, status: item.order.status }
    : { type: "job", id: item.row.id, number: `J-${String(job.jobNumber).padStart(4, "0")}`, title: job.title, status: item.row.status as JobStatus });
  return { id: loaded.row.id, revision: membershipRevision(loaded), ...date, timezone, title: records[0].title, customerName: job.customerName,
    location: job.location || null, nextStep: null, records, crew: names, completionDeadline: canReadJob && job.completionDeadline ? { date: job.completionDeadline, overdue: job.completionDeadline < today } : null, waiting: false, canReschedule: true,
    review: { expectedVisitVersion: loaded.row.version, records: refs.map(r => r.ref) } };
}
async function readableOrder(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const row: Row | undefined = await scoped(trx, context).where("w.id", id).select(...selects(trx)).first();
  if (!row) throw new AuthorizationAccessError();
  return row;
}
/** Work Order surface: no Calendar-menu or create grant is required; full resource authority is still mandatory. */
export async function readWorkOrderVisitManagement(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], workOrderId: string): Promise<WorkOrderVisitManagement> {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const order = await readableOrder(trx, context, workOrderId);
    const workspace = await trx("workspaces").where({ id: context.workspaceId }).first("timezone");
    const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [workspace.timezone])).rows[0];
    const result: WorkOrderVisitManagement = { today, source: null, target: null, canJoin: false, canSeparate: false };
    if (["completed", "canceled"].includes(order.status) || order.archivedAt) return result;
    const project = async (column: "jobId" | "workOrderId", id: string) => {
      const link = await trx("calendarVisitRecords").where({ workspaceId: context.workspaceId, [column]: id }).whereNull("endedAt").first();
      if (!link) return null;
      try { return await projectManagedVisit(trx, context, await visit(trx, context, link.visitId), workspace.timezone, today); }
      catch (error) { if (error instanceof AuthorizationAccessError || error instanceof WorkOrderLifecycleError || error instanceof CalendarRevisionError) return null; throw error; }
    };
    result.source = await project("workOrderId", workOrderId);
    if (!result.source) return result;
    result.canSeparate = result.source.records.length > 1;
    if (!result.canSeparate) {
      result.target = await project("jobId", order.jobId);
      result.canJoin = !!result.target?.scheduledDate && result.target.id !== result.source.id;
    }
    return result;
  });
}
export async function changeWorkOrderVisit(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workOrderVisitChangeSchema.parse(raw), hash = hashInput("work-order-visit", input, "ui");
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await readableOrder(trx, context, input.workOrderId);
    const previous = await replay(trx, context, input.submissionId, hash); if (previous) return previous;
    const sourceId = input.kind === "join" ? input.sourceVisitId : input.visitId;
    const from = await visit(trx, context, sourceId);
    const order = from.records.find(r => r.ref.type === "work_order" && r.ref.id === input.workOrderId);
    if (!order || membershipRevision(from) !== (input.kind === "join" ? input.sourceRevision : input.revision)) throw new CalendarRevisionError();
    let result: Result;
    if (input.kind === "join") {
      const target = await visit(trx, context, input.visitId);
      if (membershipRevision(target) !== input.revision) throw new CalendarRevisionError();
      result = await linkCalendarWorkOrder(trx, identity, enabled, { workspaceId: context.workspaceId, submissionId: randomUUID(), workOrderId: input.workOrderId,
        visitId: input.visitId, expectedVisitVersion: target.row.version, records: target.records.map(r => r.ref),
        sourceVisitId: sourceId, expectedSourceVisitVersion: from.row.version, expectedWorkOrderVersion: order.row.version });
    } else result = await separateCalendarWorkOrder(trx, identity, enabled, { workspaceId: context.workspaceId, submissionId: randomUUID(), workOrderId: input.workOrderId,
      visitId: sourceId, expectedVisitVersion: from.row.version, records: from.records.map(r => r.ref), schedule: { scheduledDate: input.scheduledDate, arrivalWindow: input.arrivalWindow } });
    return remember(trx, context, input.submissionId, hash, result);
  });
}

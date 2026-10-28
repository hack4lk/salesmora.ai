import { randomUUID } from "node:crypto";
import type { Knex } from "knex";

export type CalendarRecordType = "job" | "work_order";
export class CalendarSharedReviewRequiredError extends Error {
  constructor() { super("This record shares a visit. Review the entire visit before changing its schedule."); }
}
export const calendarRecordColumn = (type: CalendarRecordType) => type === "job" ? "jobId" : "workOrderId";
export const calendarRecordTable = (type: CalendarRecordType) => type === "job" ? "jobs" : "workOrders";

/** Existing mutations already hold the exclusive workspace lock. No independent transaction here. */
export async function synchronizeCalendarRecord(trx: Knex.Transaction, workspaceId: string, type: CalendarRecordType, id: string) {
  const column = calendarRecordColumn(type), table = calendarRecordTable(type);
  const row = await trx(table).where({ workspaceId, id }).select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
  if (!row) throw Error("Missing Calendar source record.");
  const link = await trx("calendarVisitRecords").where({ workspaceId, [column]: id }).whereNull("endedAt").forUpdate().first();
  const closed = ["completed", "canceled"].includes(row.status);
  if (!link && closed) return;
  if (!link) {
    // Creation/reopening is ALWAYS independent. Rejoining requires a later explicit reviewed action.
    const visitId = randomUUID();
    await trx("calendarVisits").insert({ id: visitId, workspaceId, scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow });
    await trx("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, [column]: id });
    await snapshotCalendarRecord(trx, workspaceId, visitId, type, row, "backfill");
    return;
  }
  if (closed) {
    await snapshotCalendarRecord(trx, workspaceId, link.visitId, type, row, "closed");
    await trx("calendarVisitRecords").where({ id: link.id, workspaceId }).update({ endedAt: trx.fn.now() });
    await trx("calendarVisits").where({ id: link.visitId, workspaceId }).increment("version", 1).update({ updatedAt: trx.fn.now() });
    return;
  }
  const visit = await trx("calendarVisits").where({ workspaceId, id: link.visitId })
    .select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).forUpdate().first();
  if (visit.scheduledDate === row.scheduledDate && visit.arrivalWindow === row.arrivalWindow) return;
  await assertIndependentCalendarSchedule(trx, workspaceId, type, id);
  await snapshotCalendarRecord(trx, workspaceId, link.visitId, type, row, row.scheduledDate ? "rescheduled" : "cleared");
  await trx("calendarVisits").where({ workspaceId, id: link.visitId })
    .update({ scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, version: visit.version + 1, updatedAt: trx.fn.now() });
}

/** Legacy one-record controls cannot silently turn into a multi-record mutation. */
export async function assertIndependentCalendarSchedule(trx: Knex.Transaction, workspaceId: string, type: CalendarRecordType, id: string) {
  const link = await trx("calendarVisitRecords").where({ workspaceId, [calendarRecordColumn(type)]: id }).whereNull("endedAt").first();
  if (!link) return;
  const { count } = await trx("calendarVisitRecords").where({ workspaceId, visitId: link.visitId }).whereNull("endedAt").count("id as count").first() as { count: string };
  if (Number(count) !== 1) throw new CalendarSharedReviewRequiredError();
}
export async function snapshotCalendarRecord(trx: Knex.Transaction, workspaceId: string, visitId: string, type: CalendarRecordType,
  row: { id: string; version: number; status: string; scheduledDate: string | null; arrivalWindow: string | null }, reason: string) {
  await trx("calendarScheduleSnapshots").insert({ id: randomUUID(), workspaceId, visitId, [calendarRecordColumn(type)]: row.id,
    recordVersion: row.version, recordStatus: row.status, scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, reason });
}
export async function removeEmptyCalendarVisits(trx: Knex.Transaction, workspaceId: string) {
  await trx("calendarVisits as v").where("v.workspaceId", workspaceId).whereNotExists(
    trx("calendarVisitRecords as r").select(trx.raw("1")).whereRaw('r."workspaceId"=v."workspaceId" AND r."visitId"=v.id')
  ).delete();
}

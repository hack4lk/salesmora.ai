import { randomUUID } from "node:crypto";
import type { Knex } from "knex";

/** Freeze writers during the one-time cutover; do not serve the earlier baseline as current. */
export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw Error("Calendar reconciliation requires one transaction.");
  await db.raw(`LOCK TABLE workspaces, jobs, "workOrders", "calendarVisits", "calendarVisitRecords" IN SHARE ROW EXCLUSIVE MODE`);
  for (const [table, column] of [["jobs", "jobId"], ["workOrders", "workOrderId"]] as const) {
    let after = "00000000-0000-0000-0000-000000000000";
    while (true) {
      const rows = await db(table).where("id", ">", after).orderBy("id").limit(500)
        .select("*", db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`));
      if (!rows.length) break;
      for (const row of rows) {
        const workspaceId = row.workspaceId;
        const link = await db("calendarVisitRecords").where({ workspaceId, [column]: row.id }).whereNull("endedAt").first();
        const closed = ["completed", "canceled"].includes(row.status);
        const snapshot = async (visitId: string, reason: string) => db("calendarScheduleSnapshots").insert({ id: randomUUID(), workspaceId, visitId,
          [column]: row.id, recordVersion: row.version, recordStatus: row.status, scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, reason });
        if (!link) {
          if (closed && await db("calendarVisitRecords").where({ workspaceId, [column]: row.id }).first("id")) continue;
          const visitId = randomUUID();
          await db("calendarVisits").insert({ id: visitId, workspaceId, scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow });
          await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, [column]: row.id, ...(closed ? { endedAt: db.fn.now() } : {}) });
          await snapshot(visitId, "backfill");
          continue;
        }
        if (closed) {
          await snapshot(link.visitId, "closed");
          await db("calendarVisitRecords").where({ workspaceId, id: link.id }).update({ endedAt: db.fn.now() });
          await db("calendarVisits").where({ workspaceId, id: link.visitId }).increment("version", 1).update({ updatedAt: db.fn.now() });
          continue;
        }
        const visit = await db("calendarVisits").where({ workspaceId, id: link.visitId }).select("*", db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
        if (visit.scheduledDate === row.scheduledDate && visit.arrivalWindow === row.arrivalWindow) continue;
        const active = await db("calendarVisitRecords").where({ workspaceId, visitId: link.visitId }).whereNull("endedAt");
        if (active.length !== 1) throw Error("Repair inconsistent shared schedules before Calendar cutover.");
        await snapshot(link.visitId, "backfill");
        await db("calendarVisits").where({ workspaceId, id: link.visitId }).update({ scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, version: visit.version + 1, updatedAt: db.fn.now() });
      }
      after = rows[rows.length - 1].id;
    }
  }
}
export async function down() { throw Error("Calendar reconciliation preserves source history and is forward-only."); }

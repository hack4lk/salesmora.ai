import type { Knex } from "knex";

/** Additive foundation only. Legacy record schedules remain authoritative until the command cutover. */
export async function up(db: Knex) {
  await db.schema.createTable("calendarVisits", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.date("scheduledDate").nullable(); t.text("arrivalWindow").nullable();
    t.integer("version").notNullable().defaultTo(1);
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp("updatedAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]);
    t.index(["workspaceId", "scheduledDate", "id"]);
    t.check(`version > 0 AND ("arrivalWindow" IS NULL OR ("scheduledDate" IS NOT NULL AND "arrivalWindow" IN ('08:00-10:00','09:00-11:00','10:00-12:00','12:00-14:00','13:00-15:00','14:00-16:00')))`);
  });
  await db.schema.createTable("calendarVisitRecords", t => {
    t.uuid("id").primary(); t.uuid("workspaceId").notNullable(); t.uuid("visitId").notNullable();
    t.uuid("jobId").nullable(); t.uuid("workOrderId").nullable();
    t.timestamp("linkedAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp("endedAt", { useTz: true }).nullable();
    t.foreign(["workspaceId", "visitId"]).references(["workspaceId", "id"]).inTable("calendarVisits").onDelete("CASCADE");
    t.foreign(["workspaceId", "jobId"]).references(["workspaceId", "id"]).inTable("jobs").onDelete("CASCADE");
    t.foreign(["workspaceId", "workOrderId"]).references(["workspaceId", "id"]).inTable("workOrders").onDelete("CASCADE");
    t.check(`("jobId" IS NULL) <> ("workOrderId" IS NULL)`);
    t.check(`"endedAt" IS NULL OR "endedAt" >= "linkedAt"`);
    t.index(["workspaceId", "visitId", "endedAt"]);
  });
  for (const column of ["jobId", "workOrderId"]) {
    await db.raw(`CREATE UNIQUE INDEX "calendar_active_${column}" ON "calendarVisitRecords" ("workspaceId", "${column}") WHERE "endedAt" IS NULL AND "${column}" IS NOT NULL`);
  }
  await db.schema.createTable("calendarScheduleSnapshots", t => {
    t.uuid("id").primary(); t.uuid("workspaceId").notNullable(); t.uuid("visitId").notNullable();
    t.uuid("jobId").nullable(); t.uuid("workOrderId").nullable();
    t.integer("recordVersion").notNullable(); t.text("recordStatus").notNullable();
    t.date("scheduledDate").nullable(); t.text("arrivalWindow").nullable();
    t.text("reason").notNullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.foreign(["workspaceId", "visitId"]).references(["workspaceId", "id"]).inTable("calendarVisits").onDelete("CASCADE");
    t.foreign(["workspaceId", "jobId"]).references(["workspaceId", "id"]).inTable("jobs").onDelete("CASCADE");
    t.foreign(["workspaceId", "workOrderId"]).references(["workspaceId", "id"]).inTable("workOrders").onDelete("CASCADE");
    t.check(`("jobId" IS NULL) <> ("workOrderId" IS NULL)`);
    t.check(`"recordVersion" > 0 AND reason IN ('backfill','closed','separated','rescheduled','cleared')`);
    t.check(`"arrivalWindow" IS NULL OR "scheduledDate" IS NOT NULL`);
    t.index(["workspaceId", "visitId", "createdAt", "id"]);
  });
  // UPDATE is forbidden; tenant/record deletion still follows the existing erasure policy.
  await db.raw(`CREATE FUNCTION protect_calendar_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Calendar schedule snapshots cannot be updated'; END $$`);
  await db.raw(`CREATE TRIGGER protect_calendar_snapshot BEFORE UPDATE ON "calendarScheduleSnapshots" FOR EACH ROW EXECUTE FUNCTION protect_calendar_snapshot()`);

  // Separate identity for EVERY record, including unscheduled/closed records. Never group matching fields.
  await db.raw(`CREATE TEMP TABLE calendar_backfill ON COMMIT DROP AS
    SELECT gen_random_uuid() AS "visitId", gen_random_uuid() AS "linkId", "workspaceId", id AS "jobId", NULL::uuid AS "workOrderId",
      "scheduledDate", "arrivalWindow", version, status, "createdAt", "updatedAt"
    FROM jobs
    UNION ALL
    SELECT gen_random_uuid(), gen_random_uuid(), "workspaceId", NULL::uuid, id,
      "scheduledDate", "arrivalWindow", version, status, "createdAt", "updatedAt" FROM "workOrders"`);
  await db.raw(`INSERT INTO "calendarVisits" (id,"workspaceId","scheduledDate","arrivalWindow","createdAt","updatedAt")
    SELECT "visitId","workspaceId","scheduledDate","arrivalWindow","createdAt","updatedAt" FROM calendar_backfill`);
  await db.raw(`INSERT INTO "calendarVisitRecords" (id,"workspaceId","visitId","jobId","workOrderId","linkedAt","endedAt")
    SELECT "linkId","workspaceId","visitId","jobId","workOrderId","updatedAt",
      CASE WHEN status IN ('completed','canceled') THEN "updatedAt" ELSE NULL END FROM calendar_backfill`);
  await db.raw(`INSERT INTO "calendarScheduleSnapshots" (id,"workspaceId","visitId","jobId","workOrderId","recordVersion","recordStatus","scheduledDate","arrivalWindow",reason)
    SELECT gen_random_uuid(),"workspaceId","visitId","jobId","workOrderId",version,status,"scheduledDate","arrivalWindow",'backfill' FROM calendar_backfill`);
}

export async function down(db: Knex) {
  if (await db("calendarVisits").first("id")) throw Error("Retained Calendar visits require this migration.");
  await db.schema.dropTable("calendarScheduleSnapshots");
  await db.raw("DROP FUNCTION protect_calendar_snapshot()");
  await db.schema.dropTable("calendarVisitRecords");
  await db.schema.dropTable("calendarVisits");
}

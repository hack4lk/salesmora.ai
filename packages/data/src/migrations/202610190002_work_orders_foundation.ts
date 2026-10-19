import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("workOrders", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.integer("workOrderNumber").notNullable();
    t.uuid("jobId").notNullable();
    t.text("title").notNullable();
    t.text("status").notNullable().defaultTo("draft");
    t.text("instructions").notNullable().defaultTo(""); t.text("accessNotes").notNullable().defaultTo(""); t.text("safetyNotes").notNullable().defaultTo("");
    t.date("scheduledDate").nullable(); t.text("arrivalWindow").nullable();
    t.text("primaryAssigneeId").nullable();
    t.uuid("sourceEstimateId").nullable(); t.uuid("sourceWorkOrderId").nullable();
    t.text("cancellationReason").nullable();
    t.text("createdBy").references("id").inTable("users").onDelete("SET NULL");
    for (const name of ["issuedAt", "startedAt", "completedAt", "canceledAt", "archivedAt"]) t.timestamp(name, {useTz:true}).nullable();
    t.timestamp("changedAfterIssueAt", {useTz:true}).nullable();
    t.integer("version").notNullable().defaultTo(1);
    for (const name of ["createdAt", "updatedAt"]) t.timestamp(name, {useTz:true}).notNullable().defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]); t.unique(["workspaceId", "workOrderNumber"]);
    t.index(["workspaceId", "status", "createdAt", "id"]);
    t.index(["workspaceId", "scheduledDate", "id"]);
    t.index(["workspaceId", "primaryAssigneeId", "scheduledDate"]);
    t.index(["workspaceId", "jobId", "createdAt"]);
    t.check(`status IN ('draft','issued','in-progress','completed','canceled') AND version > 0 AND "workOrderNumber" > 0`);
    t.check(`"arrivalWindow" IS NULL OR "scheduledDate" IS NOT NULL`);
    t.check(`(status = 'canceled' AND "cancellationReason" IS NOT NULL AND "canceledAt" IS NOT NULL) OR (status <> 'canceled' AND "cancellationReason" IS NULL)`);
    t.check(`(status = 'completed') = ("completedAt" IS NOT NULL)`);
    t.check(`status = 'draft' OR "issuedAt" IS NOT NULL OR status = 'canceled'`);
    t.check(`char_length(instructions) <= 2000 AND char_length("accessNotes") <= 2000 AND char_length("safetyNotes") <= 2000`);
  });
  // Work-order history outlives its source records; the job link is never nulled because it is the tenant and access anchor.
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_job_workspace_fk FOREIGN KEY ("workspaceId","jobId") REFERENCES jobs("workspaceId",id) ON DELETE RESTRICT`);
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_assignee_workspace_fk FOREIGN KEY ("workspaceId","primaryAssigneeId") REFERENCES "workspaceMemberships"("workspaceId","userId") ON DELETE SET NULL ("primaryAssigneeId")`);
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_source_wo_fk FOREIGN KEY ("workspaceId","sourceWorkOrderId") REFERENCES "workOrders"("workspaceId",id) ON DELETE SET NULL ("sourceWorkOrderId")`);
  await db.raw(`CREATE INDEX work_orders_open ON "workOrders"("workspaceId","scheduledDate",id) WHERE status IN ('issued','in-progress') AND "archivedAt" IS NULL`);

  await db.schema.createTable("workspaceWorkOrderCounters", t => {
    t.uuid("workspaceId").primary().references("id").inTable("workspaces").onDelete("CASCADE"); t.integer("lastNumber").notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_work_order_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceWorkOrderCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1)
    ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceWorkOrderCounters"."lastNumber"+1
    RETURNING "lastNumber" INTO NEW."workOrderNumber"; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER assign_work_order_number BEFORE INSERT ON "workOrders" FOR EACH ROW EXECUTE FUNCTION assign_work_order_number()`);

  const child = (t: Knex.CreateTableBuilder) => {
    t.uuid("workspaceId").notNullable(); t.uuid("workOrderId").notNullable();
    t.foreign(["workspaceId", "workOrderId"]).references(["workspaceId", "id"]).inTable("workOrders").onDelete("CASCADE");
  };
  await db.schema.createTable("workOrderTasks", t => {
    t.uuid("id").primary(); child(t);
    t.integer("position").notNullable(); t.text("label").notNullable(); t.boolean("required").notNullable().defaultTo(false);
    t.boolean("done").notNullable().defaultTo(false); t.text("doneBy").references("id").inTable("users").onDelete("SET NULL"); t.timestamp("doneAt", {useTz:true}).nullable();
    t.unique(["workOrderId", "position"], {deferrable: "deferred"}); t.index(["workspaceId", "workOrderId", "position"]);
    t.check(`char_length(label) BETWEEN 1 AND 200 AND position >= 0 AND (done OR ("doneBy" IS NULL AND "doneAt" IS NULL))`);
  });
  await db.schema.createTable("workOrderMaterials", t => {
    t.uuid("id").primary(); child(t);
    t.integer("position").notNullable(); t.uuid("catalogId").nullable(); t.text("name").notNullable();
    t.decimal("quantity", 12, 3).notNullable().defaultTo(1); t.text("unit").notNullable().defaultTo("each");
    t.text("status").notNullable().defaultTo("needed"); t.text("note").notNullable().defaultTo("");
    t.integer("customerPriceCents").nullable(); t.integer("costCents").nullable();
    t.index(["workspaceId", "workOrderId", "position"]);
    t.check(`status IN ('needed','ordered','on-hand','used') AND quantity > 0 AND char_length(name) BETWEEN 1 AND 200 AND char_length(note) <= 500`);
    t.check(`("customerPriceCents" IS NULL OR "customerPriceCents" >= 0) AND ("costCents" IS NULL OR "costCents" >= 0)`);
  });
  await db.schema.createTable("workOrderCrew", t => {
    child(t); t.text("userId").notNullable();
    t.primary(["workspaceId", "workOrderId", "userId"]);
    t.foreign(["workspaceId", "userId"]).references(["workspaceId", "userId"]).inTable("workspaceMemberships").onDelete("CASCADE");
    t.index(["workspaceId", "userId", "workOrderId"]);
  });
  await db.schema.createTable("workOrderCompletions", t => {
    t.uuid("id").primary(); child(t); t.unique(["workOrderId"]);
    t.text("summary").notNullable(); t.text("followUp").notNullable().defaultTo("none"); t.text("followUpNote").notNullable().defaultTo("");
    t.text("completedBy").references("id").inTable("users").onDelete("SET NULL"); t.text("completedByName").notNullable();
    t.timestamp("completedAt", {useTz:true}).notNullable();
    t.text("signerName").nullable(); t.timestamp("signedAt", {useTz:true}).nullable(); t.text("signatureRef").nullable();
    t.text("overrideReason").notNullable().defaultTo("");
    t.check(`"followUp" IN ('none','work-order','job-note') AND char_length(summary) <= 2000`);
    t.check(`("signerName" IS NULL) = ("signedAt" IS NULL)`);
  });
  await db.schema.createTable("workOrderActivity", t => {
    t.uuid("id").primary(); child(t);
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL"); t.text("actorName").notNullable();
    t.text("source").notNullable(); t.text("type").notNullable(); t.jsonb("changes").notNullable();
    t.timestamp("createdAt", {useTz:true}).notNullable().defaultTo(db.fn.now());
    t.index(["workspaceId", "workOrderId", "createdAt", "id"]); t.check(`source IN ('ui','assistant-confirmed','system')`);
  });
  await db.schema.createTable("workOrderOperations", t => {
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("submissionId").notNullable(); t.uuid("workOrderId").notNullable();
    t.foreign(["workspaceId", "workOrderId"]).references(["workspaceId", "id"]).inTable("workOrders").onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.string("inputHash", 64).notNullable(); t.integer("version").notNullable();
    t.timestamp("createdAt", {useTz:true}).notNullable().defaultTo(db.fn.now());
    t.primary(["workspaceId", "submissionId"]);
  });
}

export async function down(db: Knex) {
  if (await db("workOrders").first("id")) throw Error("Retained work-order history requires this migration.");
  for (const table of ["workOrderOperations", "workOrderActivity", "workOrderCompletions", "workOrderCrew", "workOrderMaterials", "workOrderTasks", "workOrders", "workspaceWorkOrderCounters"]) await db.schema.dropTable(table);
  await db.raw("DROP FUNCTION assign_work_order_number()");
}

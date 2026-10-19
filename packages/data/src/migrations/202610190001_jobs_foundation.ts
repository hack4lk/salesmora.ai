import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("leads", t => t.unique(["workspaceId","id"], {indexName:"leads_jobs_workspace_id_unique"}));
  await db.schema.createTable("jobs", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.integer("jobNumber").notNullable();
    t.uuid("customerId").nullable(); t.text("customerName").notNullable();
    t.uuid("sourceLeadId").nullable(); t.text("sourceLeadNumber").nullable();
    t.text("title").notNullable(); t.text("service").notNullable(); t.text("location").notNullable(); t.text("description").notNullable();
    t.text("status").notNullable().defaultTo("needs-scheduling");
    t.text("primaryOwnerId").nullable();
    t.text("createdBy").references("id").inTable("users").onDelete("SET NULL");
    t.date("scheduledDate").nullable(); t.text("arrivalWindow").nullable(); t.date("completionDeadline").nullable();
    t.text("waitingReason").nullable();
    t.integer("version").notNullable().defaultTo(1);
    for (const name of ["createdAt", "updatedAt", "lastActivityAt"]) t.timestamp(name, {useTz:true}).notNullable().defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]); t.unique(["workspaceId", "jobNumber"]);
    t.index(["workspaceId", "status", "createdAt", "id"]);
    t.index(["workspaceId", "scheduledDate", "id"]);
    t.index(["workspaceId", "primaryOwnerId", "scheduledDate"]);
    t.index(["workspaceId", "customerId"]);
    t.check(`status IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled') AND version > 0 AND "jobNumber" > 0`);
    t.check(`("arrivalWindow" IS NULL OR ("scheduledDate" IS NOT NULL AND "arrivalWindow" IN ('08:00-10:00','09:00-11:00','10:00-12:00','12:00-14:00','13:00-15:00','14:00-16:00')))`);
    t.check(`status <> 'scheduled' OR "scheduledDate" IS NOT NULL`);
    t.check(`status <> 'needs-scheduling' OR "scheduledDate" IS NULL`);
    t.check(`(status = 'waiting' AND "waitingReason" IS NOT NULL AND "waitingReason" IN ('customer','materials','approval','other')) OR (status <> 'waiting' AND "waitingReason" IS NULL)`);
  });
  // Preserve closed-job history when a source record is removed; never null the workspace key.
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_customer_workspace_fk FOREIGN KEY ("workspaceId","customerId") REFERENCES customers("workspaceId",id) ON DELETE SET NULL ("customerId")`);
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_lead_workspace_fk FOREIGN KEY ("workspaceId","sourceLeadId") REFERENCES leads("workspaceId",id) ON DELETE SET NULL ("sourceLeadId")`);
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_owner_workspace_fk FOREIGN KEY ("workspaceId","primaryOwnerId") REFERENCES "workspaceMemberships"("workspaceId","userId") ON DELETE SET NULL ("primaryOwnerId")`);
  await db.raw(`CREATE UNIQUE INDEX jobs_source_lead_once ON jobs("workspaceId","sourceLeadId") WHERE "sourceLeadId" IS NOT NULL`);
  await db.raw(`CREATE INDEX jobs_needs_schedule ON jobs("workspaceId","completionDeadline",id) WHERE "scheduledDate" IS NULL AND status NOT IN ('completed','canceled')`);
  await db.schema.createTable("workspaceJobCounters", t => {
    t.uuid("workspaceId").primary().references("id").inTable("workspaces").onDelete("CASCADE"); t.integer("lastNumber").notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_job_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceJobCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1)
    ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceJobCounters"."lastNumber"+1
    RETURNING "lastNumber" INTO NEW."jobNumber"; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER assign_job_number BEFORE INSERT ON jobs FOR EACH ROW EXECUTE FUNCTION assign_job_number()`);
  await db.schema.createTable("jobTeamMembers", t => {
    t.uuid("workspaceId").notNullable(); t.uuid("jobId").notNullable(); t.text("userId").notNullable();
    t.primary(["workspaceId","jobId","userId"]);
    t.foreign(["workspaceId","jobId"]).references(["workspaceId","id"]).inTable("jobs").onDelete("CASCADE");
    t.foreign(["workspaceId","userId"]).references(["workspaceId","userId"]).inTable("workspaceMemberships").onDelete("CASCADE");
    t.index(["workspaceId","userId","jobId"]);
  });
  await db.schema.createTable("jobActivity", t => {
    t.uuid("id").primary(); t.uuid("workspaceId").notNullable(); t.uuid("jobId").notNullable();
    t.foreign(["workspaceId","jobId"]).references(["workspaceId","id"]).inTable("jobs").onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL"); t.text("actorName").notNullable();
    t.text("source").notNullable(); t.text("type").notNullable(); t.jsonb("changes").notNullable();
    t.timestamp("createdAt",{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.index(["workspaceId","jobId","createdAt","id"]); t.check(`source IN ('ui','assistant-confirmed','system')`);
  });
  await db.schema.createTable("jobOperations", t => {
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("submissionId").notNullable(); t.uuid("jobId").notNullable();
    t.foreign(["workspaceId","jobId"]).references(["workspaceId","id"]).inTable("jobs").onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.string("inputHash",64).notNullable(); t.integer("version").notNullable();
    t.timestamp("createdAt",{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.primary(["workspaceId","submissionId"]);
  });
}

export async function down(db: Knex) {
  if(await db("jobs").first("id")) throw Error("Retained job history requires this migration.");
  for(const table of ["jobOperations","jobActivity","jobTeamMembers","jobs","workspaceJobCounters"]) await db.schema.dropTable(table);
  await db.raw("DROP FUNCTION assign_job_number()");
  await db.schema.alterTable("leads", t => t.dropUnique(["workspaceId","id"], "leads_jobs_workspace_id_unique"));
}

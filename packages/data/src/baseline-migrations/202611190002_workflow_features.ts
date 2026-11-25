import type { Knex } from 'knex';
import { serviceCatalog } from '@salesmora/contracts';

export async function up(db: Knex) {
  // 202611190002_workflow-queue.ts
  {
  await db.schema.alterTable("workflowSteps", table => { table.unique(["workspaceId", "id"]); });
  await db.schema.alterTable("leadWorkflowNotifications", table => { table.unique(["workspaceId", "id"]); });
  await db.schema.createTable("workflowQueueOutbox", table => {
    table.uuid("id").primary().defaultTo(db.raw("gen_random_uuid()"));
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.text("kind").notNullable();
    table.uuid("stepId").unique();
    table.uuid("estimateNoticeId").unique();
    table.uuid("leadNoticeId").unique();
    for (const [key, target] of [["stepId", "workflowSteps"], ["estimateNoticeId", "estimateNotifications"], ["leadNoticeId", "leadWorkflowNotifications"]]) {
      table.foreign(["workspaceId", key]).references(["workspaceId", "id"]).inTable(target).onDelete("CASCADE");
    }
    table.integer("version").notNullable().defaultTo(1);
    table.timestamp("availableAt", { useTz: true }).notNullable();
    table.timestamp("nextDispatchAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("completedAt", { useTz: true });
    table.check(`version > 0 AND ((kind = 'step' AND "stepId" IS NOT NULL AND "estimateNoticeId" IS NULL AND "leadNoticeId" IS NULL)
      OR (kind = 'estimate_email' AND "stepId" IS NULL AND "estimateNoticeId" IS NOT NULL AND "leadNoticeId" IS NULL)
      OR (kind = 'lead_email' AND "stepId" IS NULL AND "estimateNoticeId" IS NULL AND "leadNoticeId" IS NOT NULL))`);
  });
  await db.raw(`CREATE INDEX workflow_outbox_pending ON "workflowQueueOutbox" ("nextDispatchAt",id) WHERE "completedAt" IS NULL`);
  await db.raw(`CREATE INDEX workflow_outbox_completed ON "workflowQueueOutbox" ("completedAt",id) WHERE "completedAt" IS NOT NULL`);
  await db.raw(`CREATE INDEX estimate_nonworkflow_email_queue ON "estimateNotifications" ("nextAttemptAt",id) WHERE "emailStatus" = 'queued' AND "workflowId" IS NULL`);
  await db.raw(`CREATE INDEX workflow_global_due ON "workflowSteps" ("dueAt",id) WHERE status = 'queued'`);
  await db.raw(`CREATE INDEX workflow_event_routes ON workflows ("workspaceId", (definition->>'kind'), "enrollAfter")
    WHERE status = 'active' AND "publisherId" IS NOT NULL AND definition IS NOT NULL`);
  // The trigger is a durable adapter for the three current recipes. It also covers intake/import/chat writes.
  await db.raw(`CREATE FUNCTION workflow_enroll_record(ws uuid, recipe text, record_id uuid, triggered_at timestamptz) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
      IF triggered_at IS NULL THEN RETURN; END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","leadId","estimateId","dueAt",status)
      SELECT gen_random_uuid(), ws, w.id, CASE WHEN recipe = 'unassigned_lead' THEN 'lead' ELSE 'estimate' END,
        CASE WHEN recipe = 'unassigned_lead' THEN record_id END, CASE WHEN recipe <> 'unassigned_lead' THEN record_id END,
        timing.due, 'queued'
      FROM workflows w CROSS JOIN LATERAL (
        SELECT ((day::date + time '17:00') AT TIME ZONE (w.definition->>'timezone')) AS due
        FROM generate_series((triggered_at AT TIME ZONE (w.definition->>'timezone'))::date + interval '1 day',
          (triggered_at AT TIME ZONE (w.definition->>'timezone'))::date + interval '65 days', interval '1 day') day
        WHERE extract(isodow FROM day) < 6 ORDER BY day OFFSET ((w.definition->>'businessDays')::int - 1) LIMIT 1
      ) timing
      WHERE w."workspaceId" = ws AND w.status = 'active' AND w."publisherId" IS NOT NULL
        AND w.definition->>'kind' = recipe AND w."enrollAfter" < triggered_at
      ON CONFLICT DO NOTHING;
    END $$`);
  await db.raw(`CREATE FUNCTION workflow_source_event() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
    IF TG_TABLE_NAME = 'leads' THEN
      IF NEW."archivedAt" IS NULL THEN PERFORM workflow_enroll_record(NEW."workspaceId", 'unassigned_lead', NEW.id, NEW."createdAt"); END IF;
    ELSIF TG_TABLE_NAME = 'estimates' THEN
      IF NEW.status = 'accepted' AND NEW."archivedAt" IS NULL AND NEW."supersededById" IS NULL THEN
        IF TG_OP = 'INSERT' THEN PERFORM workflow_enroll_record(NEW."workspaceId", 'unscheduled_estimate', NEW.id, NEW."decidedAt");
        ELSIF OLD.status IS DISTINCT FROM NEW.status OR OLD."decidedAt" IS DISTINCT FROM NEW."decidedAt" THEN
          PERFORM workflow_enroll_record(NEW."workspaceId", 'unscheduled_estimate', NEW.id, NEW."decidedAt"); END IF;
      END IF;
    ELSIF NEW.status = 'sent' AND NEW."sentAt" IS NOT NULL THEN
      IF TG_OP = 'UPDATE' THEN IF OLD.status = 'sent' THEN RETURN NEW; END IF; END IF;
      IF NOT EXISTS (SELECT 1 FROM estimate_deliveries d WHERE d."workspaceId" = NEW."workspaceId" AND d."estimateId" = NEW."estimateId" AND d.status = 'sent' AND d.id <> NEW.id) THEN
        PERFORM workflow_enroll_record(NEW."workspaceId", 'estimate_follow_up', NEW."estimateId", NEW."sentAt"); END IF;
    END IF;
    RETURN NEW;
  END $$`);
  await db.raw(`CREATE TRIGGER workflow_lead_created AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION workflow_source_event()`);
  await db.raw(`CREATE TRIGGER workflow_estimate_accepted AFTER INSERT OR UPDATE OF status,"decidedAt" ON estimates FOR EACH ROW EXECUTE FUNCTION workflow_source_event()`);
  await db.raw(`CREATE TRIGGER workflow_estimate_sent AFTER INSERT OR UPDATE OF status,"sentAt" ON estimate_deliveries FOR EACH ROW EXECUTE FUNCTION workflow_source_event()`);
  await db.raw(`CREATE FUNCTION workflow_queue_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE work_kind text; work_column text; available timestamptz; pending boolean;
    BEGIN
      IF TG_TABLE_NAME = 'workflowSteps' THEN
        work_kind := 'step'; work_column := 'stepId'; available := NEW."dueAt";
        pending := NEW.status = 'queued' AND (NEW."leadId" IS NOT NULL OR NEW."estimateId" IS NOT NULL);
      ELSIF TG_TABLE_NAME = 'estimateNotifications' THEN
        IF NEW."workflowId" IS NULL THEN RETURN NEW; END IF;
        work_kind := 'estimate_email'; work_column := 'estimateNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSE
        work_kind := 'lead_email'; work_column := 'leadNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      END IF;
      IF pending THEN
        EXECUTE format('INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,%I,"availableAt") VALUES ($1,$2,$3,$4)
          ON CONFLICT (%I) DO UPDATE SET "availableAt" = EXCLUDED."availableAt", "nextDispatchAt" = now(), "completedAt" = NULL,
            version = "workflowQueueOutbox".version + 1', work_column, work_column)
          USING NEW."workspaceId", work_kind, NEW.id, available;
        PERFORM pg_notify('salesmora_workflow_queue', '');
      ELSE
        EXECUTE format('UPDATE "workflowQueueOutbox" SET "completedAt" = now(), version = version + 1 WHERE %I = $1 AND "completedAt" IS NULL', work_column) USING NEW.id;
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_step_queue AFTER INSERT OR UPDATE OF status,"dueAt" ON "workflowSteps" FOR EACH ROW EXECUTE FUNCTION workflow_queue_changed()`);
  for (const table of ["estimateNotifications", "leadWorkflowNotifications"]) {
    await db.raw(`CREATE TRIGGER workflow_email_queue AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON ?? FOR EACH ROW EXECUTE FUNCTION workflow_queue_changed()`, [table]);
  }
  // One-time cutover catches qualifying events not yet discovered by the previous poller.
  // Existing queued/held/completed steps win their unique keys; paused workflows stay paused.
  await db.raw(`SELECT workflow_enroll_record(l."workspaceId", 'unassigned_lead', l.id, l."createdAt") FROM leads l
    WHERE l."archivedAt" IS NULL AND EXISTS (SELECT 1 FROM workflows w WHERE w."workspaceId" = l."workspaceId" AND w.status = 'active'
      AND w.definition->>'kind' = 'unassigned_lead' AND w."enrollAfter" < l."createdAt")`);
  await db.raw(`SELECT workflow_enroll_record(e."workspaceId", 'unscheduled_estimate', e.id, e."decidedAt") FROM estimates e
    WHERE e.status = 'accepted' AND e."archivedAt" IS NULL AND e."supersededById" IS NULL AND EXISTS (SELECT 1 FROM workflows w
      WHERE w."workspaceId" = e."workspaceId" AND w.status = 'active' AND w.definition->>'kind' = 'unscheduled_estimate' AND w."enrollAfter" < e."decidedAt")`);
  await db.raw(`SELECT workflow_enroll_record(e."workspaceId", 'estimate_follow_up', e.id, sends.first_sent) FROM estimates e JOIN
    (SELECT "workspaceId","estimateId",min("sentAt") AS first_sent FROM estimate_deliveries WHERE status = 'sent' GROUP BY "workspaceId","estimateId") sends
    ON sends."workspaceId" = e."workspaceId" AND sends."estimateId" = e.id WHERE e.status = 'sent' AND e."archivedAt" IS NULL AND e."supersededById" IS NULL
    AND EXISTS (SELECT 1 FROM workflows w WHERE w."workspaceId" = e."workspaceId" AND w.status = 'active'
      AND w.definition->>'kind' = 'estimate_follow_up' AND w."enrollAfter" < sends.first_sent)`);
  // Seed already queued work without rewriting its schedule or notification state.
  for (const [kind, table, column, time, predicate] of [
    ["step", "workflowSteps", "stepId", "dueAt", `status = 'queued' AND ("leadId" IS NOT NULL OR "estimateId" IS NOT NULL)`],
    ["estimate_email", "estimateNotifications", "estimateNoticeId", "nextAttemptAt", `"emailStatus" = 'queued' AND "workflowId" IS NOT NULL`],
    ["lead_email", "leadWorkflowNotifications", "leadNoticeId", "nextAttemptAt", `"emailStatus" = 'queued'`],
  ]) await db.raw(`INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,??,"availableAt") SELECT "workspaceId",?,id,?? FROM ?? WHERE ${predicate} ON CONFLICT DO NOTHING`, [column, kind, time, table]);
}
  // 202611190003_workflow-weekly-briefing.ts
  {
  await db.raw(`ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind`);
  await db.schema.alterTable("workflowSteps", table => {
    table.text("origin").notNullable().defaultTo("scheduled");
    table.check(`origin IN ('scheduled','manual')`, [], "workflow_step_origin");
    table.check(`("recordKind" = 'estimate' AND "leadId" IS NULL) OR
      ("recordKind" = 'lead' AND "leadId" IS NOT NULL AND "estimateId" IS NULL) OR
      ("recordKind" = 'briefing' AND "leadId" IS NULL AND "estimateId" IS NULL)`, [], "workflow_step_record_kind");
  });
  await db.raw(`CREATE UNIQUE INDEX workflow_one_pending_briefing ON "workflowSteps" ("workflowId")
    WHERE "recordKind" = 'briefing' AND origin = 'scheduled' AND status IN ('queued','held')`);
  await db.raw(`ALTER TABLE "workflowManualRuns" DROP CONSTRAINT workflow_manual_record_kind`);
  await db.schema.alterTable("workflowManualRuns", table => {
    table.jsonb("briefingSnapshot");
    table.check(`"recordKind" IN ('estimate','lead','briefing')`, [], "workflow_manual_record_kind");
  });
  await db.schema.alterTable("notificationPreferences", table => { table.boolean("workflowBriefingEmail").notNullable().defaultTo(true); });
  await db.schema.createTable("workflowBriefings", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.uuid("workflowId").notNullable();
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.jsonb("snapshot").notNullable();
    table.foreign(["workspaceId", "id"]).references(["workspaceId", "id"]).inTable("workflowSteps").onDelete("CASCADE");
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.unique(["workspaceId", "id"]);
  });
  await db.schema.createTable("workflowBriefingNotifications", table => {
    table.uuid("id").primary(); table.uuid("workspaceId").notNullable(); table.uuid("workflowId").notNullable(); table.uuid("briefingId").notNullable();
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.foreign(["workspaceId", "briefingId"]).references(["workspaceId", "id"]).inTable("workflowBriefings").onDelete("CASCADE");
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.boolean("inApp").notNullable().defaultTo(true);
    table.text("emailStatus").notNullable(); table.integer("attempts").notNullable().defaultTo(0);
    table.timestamp("nextAttemptAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("readAt", { useTz: true }); table.timestamp("sentAt", { useTz: true });
    table.unique(["workspaceId", "id"]); table.unique(["workspaceId", "briefingId", "userId"]);
    table.index(["workspaceId", "userId", "createdAt"]);
    table.check(`"emailStatus" IN ('queued','sent','skipped','failed') AND attempts >= 0`);
  });
  await db.raw(`CREATE INDEX workflow_briefing_email_queue ON "workflowBriefingNotifications" ("nextAttemptAt",id) WHERE "emailStatus" = 'queued'`);
  // Drop the previous anonymous kind check without relying on a generated constraint name.
  await db.raw(`DO $$ DECLARE c record; BEGIN FOR c IN SELECT conname FROM pg_constraint
    WHERE conrelid = '"workflowQueueOutbox"'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT %I', c.conname); END LOOP; END $$`);
  await db.schema.alterTable("workflowQueueOutbox", table => {
    table.uuid("briefingNoticeId").unique();
    table.foreign(["workspaceId", "briefingNoticeId"]).references(["workspaceId", "id"]).inTable("workflowBriefingNotifications").onDelete("CASCADE");
    table.check(`version > 0 AND num_nonnulls("stepId","estimateNoticeId","leadNoticeId","briefingNoticeId") = 1 AND
      ((kind = 'step' AND "stepId" IS NOT NULL) OR (kind = 'estimate_email' AND "estimateNoticeId" IS NOT NULL) OR
       (kind = 'lead_email' AND "leadNoticeId" IS NOT NULL) OR (kind = 'briefing_email' AND "briefingNoticeId" IS NOT NULL))`, [], "workflow_outbox_kind");
  });
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_queue_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE work_kind text; work_column text; available timestamptz; pending boolean;
    BEGIN
      IF TG_TABLE_NAME = 'workflowSteps' THEN
        work_kind := 'step'; work_column := 'stepId'; available := NEW."dueAt";
        pending := NEW.status = 'queued' AND (NEW."leadId" IS NOT NULL OR NEW."estimateId" IS NOT NULL OR NEW."recordKind" = 'briefing');
      ELSIF TG_TABLE_NAME = 'estimateNotifications' THEN
        IF NEW."workflowId" IS NULL THEN RETURN NEW; END IF;
        work_kind := 'estimate_email'; work_column := 'estimateNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSIF TG_TABLE_NAME = 'workflowBriefingNotifications' THEN
        work_kind := 'briefing_email'; work_column := 'briefingNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSE
        work_kind := 'lead_email'; work_column := 'leadNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      END IF;
      IF pending THEN
        EXECUTE format('INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,%I,"availableAt") VALUES ($1,$2,$3,$4)
          ON CONFLICT (%I) DO UPDATE SET "availableAt" = EXCLUDED."availableAt", "nextDispatchAt" = now(), "completedAt" = NULL,
            version = "workflowQueueOutbox".version + 1', work_column, work_column) USING NEW."workspaceId",work_kind,NEW.id,available;
        PERFORM pg_notify('salesmora_workflow_queue','');
      ELSE
        EXECUTE format('UPDATE "workflowQueueOutbox" SET "completedAt" = now(), version = version + 1 WHERE %I = $1 AND "completedAt" IS NULL', work_column) USING NEW.id;
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_email_queue AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "workflowBriefingNotifications" FOR EACH ROW EXECUTE FUNCTION workflow_queue_changed()`);
  await db.raw(`CREATE FUNCTION workflow_next_monday(anchor timestamptz, zone text) RETURNS timestamptz LANGUAGE sql STABLE AS $$
    SELECT CASE WHEN candidate > anchor THEN candidate ELSE (local_day + 7 + time '09:00') AT TIME ZONE zone END
    FROM (SELECT date_trunc('week', anchor AT TIME ZONE zone)::date AS local_day) day
    CROSS JOIN LATERAL (SELECT (local_day + time '09:00') AT TIME ZONE zone AS candidate) timing $$`);
  await db.raw(`CREATE FUNCTION workflow_schedule_briefing(ws uuid, workflow uuid) RETURNS void LANGUAGE sql SET search_path = public, pg_catalog AS $$
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind",origin,status,"dueAt")
    SELECT gen_random_uuid(), ws, w.id, 'briefing','scheduled','queued',workflow_next_monday(now(),w.definition->>'timezone')
    FROM workflows w WHERE w.id = workflow AND w."workspaceId" = ws AND w.status = 'active' AND w."publisherId" IS NOT NULL
      AND w.definition->>'kind' = 'weekly_briefing' ON CONFLICT DO NOTHING $$`);
  await db.raw(`CREATE FUNCTION workflow_briefing_schedule_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
    IF TG_TABLE_NAME = 'workflows' THEN
      IF TG_OP = 'INSERT' THEN PERFORM workflow_schedule_briefing(NEW."workspaceId",NEW.id);
      ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'active' THEN PERFORM workflow_schedule_briefing(NEW."workspaceId",NEW.id); END IF;
    ELSIF NEW."recordKind" = 'briefing' AND NEW.origin = 'scheduled' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('completed','skipped','failed','canceled') THEN
      PERFORM workflow_schedule_briefing(NEW."workspaceId",NEW."workflowId");
    END IF; RETURN NEW;
  END $$`);
  await db.raw(`CREATE TRIGGER workflow_briefing_published AFTER INSERT OR UPDATE OF status ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_briefing_schedule_changed()`);
  await db.raw(`CREATE TRIGGER workflow_briefing_advanced AFTER UPDATE OF status ON "workflowSteps" FOR EACH ROW EXECUTE FUNCTION workflow_briefing_schedule_changed()`);
}
  // 202611190004_workflow-unassigned-visit.ts
  {
  await db.raw(`ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind`);
  await db.schema.alterTable("workflowSteps", table => {
    table.uuid("visitId"); table.date("visitDate"); table.date("cursorDate"); table.uuid("cursorId");
    table.foreign(["workspaceId", "visitId"]).references(["workspaceId", "id"]).inTable("calendarVisits").onDelete("CASCADE");
    table.unique(["workflowId", "visitId", "visitDate"]);
    table.check(`("recordKind" = 'estimate' AND "leadId" IS NULL AND "visitId" IS NULL AND "visitDate" IS NULL) OR
      ("recordKind" = 'lead' AND "leadId" IS NOT NULL AND "estimateId" IS NULL AND "visitId" IS NULL AND "visitDate" IS NULL) OR
      ("recordKind" IN ('briefing','visit_init') AND "leadId" IS NULL AND "estimateId" IS NULL AND "visitId" IS NULL AND "visitDate" IS NULL) OR
      ("recordKind" = 'visit' AND "leadId" IS NULL AND "estimateId" IS NULL AND "visitId" IS NOT NULL AND "visitDate" IS NOT NULL)`, [], "workflow_step_record_kind");
  });
  await db.raw(`CREATE UNIQUE INDEX workflow_one_visit_initializer ON "workflowSteps" ("workflowId") WHERE "recordKind" = 'visit_init' AND status IN ('queued','held')`);
  await db.raw(`CREATE INDEX workflow_calendar_future_visits ON "calendarVisits" ("workspaceId","scheduledDate",id) WHERE "scheduledDate" IS NOT NULL`);
  await db.raw(`ALTER TABLE "workflowManualRuns" DROP CONSTRAINT workflow_manual_record_kind`);
  await db.schema.alterTable("workflowManualRuns", table => {
    table.jsonb("reviewedVisits");
    table.check(`"recordKind" IN ('estimate','lead','briefing','visit')`, [], "workflow_manual_record_kind");
  });
  await db.schema.alterTable("notificationPreferences", table => { table.boolean("workflowVisitEmail").notNullable().defaultTo(true); });
  await db.schema.createTable("workflowVisitNotifications", table => {
    table.uuid("id").primary(); table.uuid("workspaceId").notNullable(); table.uuid("workflowId").notNullable();
    table.uuid("stepId").notNullable(); table.uuid("visitId").notNullable(); table.date("scheduledDate").notNullable();
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE"); table.jsonb("snapshot").notNullable();
    for (const [column, target] of [["workflowId", "workflows"], ["stepId", "workflowSteps"], ["visitId", "calendarVisits"]])
      table.foreign(["workspaceId", column]).references(["workspaceId", "id"]).inTable(target).onDelete("CASCADE");
    table.boolean("inApp").notNullable(); table.text("emailStatus").notNullable(); table.integer("attempts").notNullable().defaultTo(0);
    table.timestamp("nextAttemptAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("readAt", { useTz: true }); table.timestamp("sentAt", { useTz: true });
    table.unique(["workspaceId", "id"]); table.unique(["workspaceId", "workflowId", "visitId", "scheduledDate", "userId"]);
    table.index(["workspaceId", "userId", "createdAt"]);
    table.check(`"emailStatus" IN ('queued','sent','skipped','failed') AND attempts >= 0`);
  });
  await db.raw(`CREATE INDEX workflow_visit_email_queue ON "workflowVisitNotifications" ("nextAttemptAt",id) WHERE "emailStatus" = 'queued'`);
  await db.raw(`ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind`);
  await db.schema.alterTable("workflowQueueOutbox", table => {
    table.uuid("visitNoticeId").unique();
    table.foreign(["workspaceId", "visitNoticeId"]).references(["workspaceId", "id"]).inTable("workflowVisitNotifications").onDelete("CASCADE");
    table.check(`version > 0 AND num_nonnulls("stepId","estimateNoticeId","leadNoticeId","briefingNoticeId","visitNoticeId") = 1 AND
      ((kind = 'step' AND "stepId" IS NOT NULL) OR (kind = 'estimate_email' AND "estimateNoticeId" IS NOT NULL) OR
       (kind = 'lead_email' AND "leadNoticeId" IS NOT NULL) OR (kind = 'briefing_email' AND "briefingNoticeId" IS NOT NULL) OR
       (kind = 'visit_email' AND "visitNoticeId" IS NOT NULL))`, [], "workflow_outbox_kind");
  });
  await db.raw(`CREATE FUNCTION workflow_visit_records(ws uuid, visit uuid) RETURNS TABLE(id uuid, type text, number integer, title text, "customerName" text, assigned boolean)
    LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
      SELECT j.id, 'job', j."jobNumber"::int, j.title, j."customerName", j."primaryOwnerId" IS NOT NULL OR EXISTS
        (SELECT 1 FROM "jobTeamMembers" t WHERE t."workspaceId" = ws AND t."jobId" = j.id)
      FROM "calendarVisitRecords" r JOIN jobs j ON j."workspaceId" = ws AND j.id = r."jobId"
      WHERE r."workspaceId" = ws AND r."visitId" = visit AND r."endedAt" IS NULL AND j.status NOT IN ('completed','canceled')
      UNION ALL
      SELECT w.id, 'work_order', w."workOrderNumber"::int, w.title, j."customerName", w."primaryAssigneeId" IS NOT NULL OR EXISTS
        (SELECT 1 FROM "workOrderCrew" c WHERE c."workspaceId" = ws AND c."workOrderId" = w.id)
      FROM "calendarVisitRecords" r JOIN "workOrders" w ON w."workspaceId" = ws AND w.id = r."workOrderId"
        JOIN jobs j ON j."workspaceId" = ws AND j.id = w."jobId"
      WHERE r."workspaceId" = ws AND r."visitId" = visit AND r."endedAt" IS NULL AND w."archivedAt" IS NULL AND w.status NOT IN ('completed','canceled')
    $$`);
  await db.raw(`CREATE FUNCTION workflow_visit_unassigned(ws uuid, visit uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
    SELECT count(*) > 0 AND NOT coalesce(bool_or(assigned),false) FROM workflow_visit_records(ws,visit) $$`);
  await db.raw(`CREATE FUNCTION workflow_initialize_visits(ws uuid, workflow uuid) RETURNS void LANGUAGE sql SET search_path = public, pg_catalog AS $$
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind",status,"dueAt")
    SELECT gen_random_uuid(),ws,w.id,'visit_init','queued',now() FROM workflows w WHERE w.id = workflow AND w."workspaceId" = ws
      AND w.status = 'active' AND w."publisherId" IS NOT NULL AND w.definition->>'kind' = 'unassigned_visit' ON CONFLICT DO NOTHING $$`);
  await db.raw(`CREATE FUNCTION workflow_sync_visit(ws uuid, visit uuid, only_workflow uuid DEFAULT NULL) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE vdate date; eligible boolean; w record; due timestamptz;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM workflows WHERE "workspaceId" = ws AND status IN ('active','paused')
        AND definition->>'kind' = 'unassigned_visit' AND (only_workflow IS NULL OR id = only_workflow)) THEN RETURN; END IF;
      SELECT "scheduledDate" INTO vdate FROM "calendarVisits" WHERE id = visit AND "workspaceId" = ws;
      eligible := workflow_visit_unassigned(ws,visit);
      UPDATE "workflowSteps" s SET status = 'canceled' WHERE s."workspaceId" = ws AND s."visitId" = visit
        AND s.status IN ('queued','held') AND (only_workflow IS NULL OR s."workflowId" = only_workflow)
        AND (vdate IS NULL OR s."visitDate" IS DISTINCT FROM vdate OR NOT eligible);
      IF vdate IS NULL OR NOT eligible THEN RETURN; END IF;
      FOR w IN SELECT id,definition FROM workflows WHERE "workspaceId" = ws AND status = 'active' AND "publisherId" IS NOT NULL
        AND definition->>'kind' = 'unassigned_visit' AND (only_workflow IS NULL OR id = only_workflow) LOOP
        IF vdate <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date THEN CONTINUE; END IF;
        due := greatest(((vdate - 1) + time '09:00') AT TIME ZONE (w.definition->>'timezone'),now());
        INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitId","visitDate","dueAt",status)
          VALUES (gen_random_uuid(),ws,w.id,'visit',visit,vdate,due,'queued')
        ON CONFLICT ("workflowId","visitId","visitDate") DO UPDATE SET status = 'queued', "dueAt" = EXCLUDED."dueAt"
          WHERE "workflowSteps".status IN ('skipped','canceled') OR ("workflowSteps".status IN ('queued','held') AND "workflowSteps"."dueAt" IS DISTINCT FROM EXCLUDED."dueAt");
      END LOOP;
    END $$`);
  await db.raw(`CREATE FUNCTION workflow_visit_source_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE ws uuid; target_id uuid; previous_id uuid; v record;
    BEGIN
      ws := CASE WHEN TG_OP = 'DELETE' THEN OLD."workspaceId" ELSE NEW."workspaceId" END;
      IF TG_TABLE_NAME = 'workflows' THEN
        IF NEW.definition->>'kind' = 'unassigned_visit' THEN PERFORM workflow_initialize_visits(ws,NEW.id); END IF; RETURN NEW; END IF;
      IF TG_TABLE_NAME = 'calendarVisits' THEN PERFORM workflow_sync_visit(ws,NEW.id); RETURN NEW; END IF;
      IF TG_TABLE_NAME = 'calendarVisitRecords' THEN
        IF TG_OP <> 'INSERT' THEN PERFORM workflow_sync_visit(ws,OLD."visitId"); END IF;
        IF TG_OP <> 'DELETE' THEN PERFORM workflow_sync_visit(ws,NEW."visitId"); END IF;
      ELSE
        IF TG_TABLE_NAME = 'jobs' THEN target_id := NEW.id;
        ELSIF TG_TABLE_NAME = 'jobTeamMembers' THEN target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD."jobId" ELSE NEW."jobId" END;
        ELSIF TG_TABLE_NAME = 'workOrders' THEN target_id := NEW.id;
        ELSE target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD."workOrderId" ELSE NEW."workOrderId" END; END IF;
        IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'jobTeamMembers' THEN previous_id := OLD."jobId";
        ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'workOrderCrew' THEN previous_id := OLD."workOrderId"; END IF;
        FOR v IN SELECT DISTINCT "visitId" FROM "calendarVisitRecords" WHERE "workspaceId" = ws AND "endedAt" IS NULL AND
          CASE WHEN TG_TABLE_NAME IN ('jobs','jobTeamMembers') THEN "jobId" IN (target_id,previous_id) ELSE "workOrderId" IN (target_id,previous_id) END LOOP
          PERFORM workflow_sync_visit(ws,v."visitId");
        END LOOP;
      END IF;
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_visit_published AFTER INSERT ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`);
  await db.raw(`CREATE TRIGGER workflow_visit_scheduled AFTER INSERT OR UPDATE OF "scheduledDate" ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`);
  await db.raw(`CREATE TRIGGER workflow_visit_membership AFTER INSERT OR UPDATE OR DELETE ON "calendarVisitRecords" FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`);
  await db.raw(`CREATE TRIGGER workflow_visit_job AFTER UPDATE OF "primaryOwnerId",status ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`);
  await db.raw(`CREATE TRIGGER workflow_visit_order AFTER UPDATE OF "primaryAssigneeId",status,"archivedAt" ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`);
  for (const table of ["jobTeamMembers", "workOrderCrew"]) await db.raw(`CREATE TRIGGER workflow_visit_crew AFTER INSERT OR UPDATE OR DELETE ON ?? FOR EACH ROW EXECUTE FUNCTION workflow_visit_source_changed()`, [table]);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_queue_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE work_kind text; work_column text; available timestamptz; pending boolean;
    BEGIN
      IF TG_TABLE_NAME = 'workflowSteps' THEN
        work_kind := 'step'; work_column := 'stepId'; available := NEW."dueAt";
        pending := NEW.status = 'queued' AND (NEW."leadId" IS NOT NULL OR NEW."estimateId" IS NOT NULL OR NEW."recordKind" IN ('briefing','visit','visit_init'));
      ELSIF TG_TABLE_NAME = 'estimateNotifications' THEN
        IF NEW."workflowId" IS NULL THEN RETURN NEW; END IF;
        work_kind := 'estimate_email'; work_column := 'estimateNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSIF TG_TABLE_NAME = 'workflowBriefingNotifications' THEN
        work_kind := 'briefing_email'; work_column := 'briefingNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSIF TG_TABLE_NAME = 'workflowVisitNotifications' THEN
        work_kind := 'visit_email'; work_column := 'visitNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      ELSE
        work_kind := 'lead_email'; work_column := 'leadNoticeId'; available := NEW."nextAttemptAt"; pending := NEW."emailStatus" = 'queued';
      END IF;
      IF pending THEN
        EXECUTE format('INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,%I,"availableAt") VALUES ($1,$2,$3,$4)
          ON CONFLICT (%I) DO UPDATE SET "availableAt" = EXCLUDED."availableAt", "nextDispatchAt" = now(), "completedAt" = NULL,
            version = "workflowQueueOutbox".version + 1', work_column, work_column) USING NEW."workspaceId",work_kind,NEW.id,available;
        PERFORM pg_notify('salesmora_workflow_queue','');
      ELSE
        EXECUTE format('UPDATE "workflowQueueOutbox" SET "completedAt" = now(), version = version + 1 WHERE %I = $1 AND "completedAt" IS NULL', work_column) USING NEW.id;
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_email_queue AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "workflowVisitNotifications" FOR EACH ROW EXECUTE FUNCTION workflow_queue_changed()`);
}
  // 202611200001_workflow-send-time.ts
  {
  await db.raw(`ALTER TABLE workflows ADD CONSTRAINT workflow_local_time CHECK (
    NOT jsonb_exists(definition, 'localTime') OR (jsonb_typeof(definition->'localTime') = 'string'
      AND definition->>'localTime' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'))`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_enroll_record(ws uuid, recipe text, record_id uuid, triggered_at timestamptz) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
      IF triggered_at IS NULL THEN RETURN; END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","leadId","estimateId","dueAt",status)
      SELECT gen_random_uuid(), ws, w.id, CASE WHEN recipe = 'unassigned_lead' THEN 'lead' ELSE 'estimate' END,
        CASE WHEN recipe = 'unassigned_lead' THEN record_id END, CASE WHEN recipe <> 'unassigned_lead' THEN record_id END,
        timing.due, 'queued'
      FROM workflows w CROSS JOIN LATERAL (
        SELECT ((day::date + coalesce(w.definition->>'localTime','17:00')::time) AT TIME ZONE (w.definition->>'timezone')) AS due
        FROM generate_series((triggered_at AT TIME ZONE (w.definition->>'timezone'))::date + interval '1 day',
          (triggered_at AT TIME ZONE (w.definition->>'timezone'))::date + interval '65 days', interval '1 day') day
        WHERE extract(isodow FROM day) < 6 ORDER BY day OFFSET ((w.definition->>'businessDays')::int - 1) LIMIT 1
      ) timing
      WHERE w."workspaceId" = ws AND w.status = 'active' AND w."publisherId" IS NOT NULL
        AND w.definition->>'kind' = recipe AND w."enrollAfter" < triggered_at
      ON CONFLICT DO NOTHING;
    END $$`);
  await db.raw(`CREATE FUNCTION workflow_next_monday(anchor timestamptz, zone text, send_time time) RETURNS timestamptz LANGUAGE sql STABLE AS $$
    SELECT CASE WHEN candidate > anchor THEN candidate ELSE (local_day + 7 + send_time) AT TIME ZONE zone END
    FROM (SELECT date_trunc('week', anchor AT TIME ZONE zone)::date AS local_day) day
    CROSS JOIN LATERAL (SELECT (local_day + send_time) AT TIME ZONE zone AS candidate) timing $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_schedule_briefing(ws uuid, workflow uuid) RETURNS void LANGUAGE sql SET search_path = public, pg_catalog AS $$
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind",origin,status,"dueAt")
    SELECT gen_random_uuid(), ws, w.id, 'briefing','scheduled','queued',workflow_next_monday(now(),w.definition->>'timezone',coalesce(w.definition->>'localTime','09:00')::time)
    FROM workflows w WHERE w.id = workflow AND w."workspaceId" = ws AND w.status = 'active' AND w."publisherId" IS NOT NULL
      AND w.definition->>'kind' = 'weekly_briefing' ON CONFLICT DO NOTHING $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_sync_visit(ws uuid, visit uuid, only_workflow uuid DEFAULT NULL) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE vdate date; eligible boolean; w record; due timestamptz;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM workflows WHERE "workspaceId" = ws AND status IN ('active','paused')
        AND definition->>'kind' = 'unassigned_visit' AND (only_workflow IS NULL OR id = only_workflow)) THEN RETURN; END IF;
      SELECT "scheduledDate" INTO vdate FROM "calendarVisits" WHERE id = visit AND "workspaceId" = ws;
      eligible := workflow_visit_unassigned(ws,visit);
      UPDATE "workflowSteps" s SET status = 'canceled' WHERE s."workspaceId" = ws AND s."visitId" = visit
        AND s.status IN ('queued','held') AND (only_workflow IS NULL OR s."workflowId" = only_workflow)
        AND (vdate IS NULL OR s."visitDate" IS DISTINCT FROM vdate OR NOT eligible);
      IF vdate IS NULL OR NOT eligible THEN RETURN; END IF;
      FOR w IN SELECT id,definition FROM workflows WHERE "workspaceId" = ws AND status = 'active' AND "publisherId" IS NOT NULL
        AND definition->>'kind' = 'unassigned_visit' AND (only_workflow IS NULL OR id = only_workflow) LOOP
        IF vdate <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date THEN CONTINUE; END IF;
        due := greatest(((vdate - 1) + coalesce(w.definition->>'localTime','09:00')::time) AT TIME ZONE (w.definition->>'timezone'),now());
        INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitId","visitDate","dueAt",status)
          VALUES (gen_random_uuid(),ws,w.id,'visit',visit,vdate,due,'queued')
        ON CONFLICT ("workflowId","visitId","visitDate") DO UPDATE SET status = 'queued', "dueAt" = EXCLUDED."dueAt"
          WHERE "workflowSteps".status IN ('skipped','canceled') OR ("workflowSteps".status IN ('queued','held') AND "workflowSteps"."dueAt" IS DISTINCT FROM EXCLUDED."dueAt");
      END LOOP;
    END $$`);
}
  // 202611200002_workflow-visit-materials.ts
  {
  await db.schema.alterTable("notificationPreferences", table => { table.boolean("workflowMaterialsEmail").notNullable().defaultTo(true); });
  await db.raw(`CREATE FUNCTION workflow_visit_material_records(ws uuid, visit uuid)
    RETURNS TABLE(id uuid, number integer, title text, "customerName" text, needed bigint, ordered bigint)
    LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
      SELECT r.id, r.number, r.title, r."customerName", count(*) FILTER (WHERE m.status = 'needed'), count(*) FILTER (WHERE m.status = 'ordered')
      FROM workflow_visit_records(ws,visit) r JOIN "workOrders" w ON w."workspaceId" = ws AND w.id = r.id
        JOIN "workOrderMaterials" m ON m."workspaceId" = ws AND m."workOrderId" = w.id
      WHERE r.type = 'work_order' AND w.status IN ('issued','in-progress') AND m.status IN ('needed','ordered')
      GROUP BY r.id, r.number, r.title, r."customerName"
    $$`);
  await db.raw(`CREATE FUNCTION workflow_visit_has_pending_materials(ws uuid, visit uuid) RETURNS boolean
    LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
      SELECT EXISTS (SELECT 1 FROM workflow_visit_material_records(ws,visit)) $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_initialize_visits(ws uuid, workflow uuid) RETURNS void LANGUAGE sql SET search_path = public, pg_catalog AS $$
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind",status,"dueAt")
    SELECT gen_random_uuid(),ws,w.id,'visit_init','queued',now() FROM workflows w WHERE w.id = workflow AND w."workspaceId" = ws
      AND w.status = 'active' AND w."publisherId" IS NOT NULL AND w.definition->>'kind' IN ('unassigned_visit','visit_materials') ON CONFLICT DO NOTHING $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_sync_visit(ws uuid, visit uuid, only_workflow uuid DEFAULT NULL) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE vdate date; unassigned boolean; materials boolean; needs_assignment boolean; needs_materials boolean; w record; due timestamptz;
    BEGIN
      SELECT bool_or(definition->>'kind' = 'unassigned_visit'), bool_or(definition->>'kind' = 'visit_materials')
        INTO needs_assignment, needs_materials FROM workflows WHERE "workspaceId" = ws AND status IN ('active','paused')
        AND definition->>'kind' IN ('unassigned_visit','visit_materials') AND (only_workflow IS NULL OR id = only_workflow);
      IF NOT coalesce(needs_assignment OR needs_materials,false) THEN RETURN; END IF;
      SELECT "scheduledDate" INTO vdate FROM "calendarVisits" WHERE id = visit AND "workspaceId" = ws;
      unassigned := coalesce(needs_assignment,false) AND workflow_visit_unassigned(ws,visit);
      materials := coalesce(needs_materials,false) AND workflow_visit_has_pending_materials(ws,visit);
      UPDATE "workflowSteps" s SET status = 'canceled' FROM workflows rule WHERE rule.id = s."workflowId" AND rule."workspaceId" = ws
        AND rule.definition->>'kind' IN ('unassigned_visit','visit_materials') AND s."workspaceId" = ws AND s."visitId" = visit
        AND s.status IN ('queued','held') AND (only_workflow IS NULL OR s."workflowId" = only_workflow)
        AND (vdate IS NULL OR s."visitDate" IS DISTINCT FROM vdate OR NOT (CASE WHEN rule.definition->>'kind' = 'visit_materials' THEN materials ELSE unassigned END));
      IF vdate IS NULL OR NOT (unassigned OR materials) THEN RETURN; END IF;
      FOR w IN SELECT id,definition FROM workflows WHERE "workspaceId" = ws AND status = 'active' AND "publisherId" IS NOT NULL
        AND definition->>'kind' IN ('unassigned_visit','visit_materials') AND (only_workflow IS NULL OR id = only_workflow) LOOP
        IF NOT (CASE WHEN w.definition->>'kind' = 'visit_materials' THEN materials ELSE unassigned END)
          OR vdate <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date THEN CONTINUE; END IF;
        due := greatest(((vdate - 1) + coalesce(w.definition->>'localTime','09:00')::time) AT TIME ZONE (w.definition->>'timezone'),now());
        INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitId","visitDate","dueAt",status)
          VALUES (gen_random_uuid(),ws,w.id,'visit',visit,vdate,due,'queued')
        ON CONFLICT ("workflowId","visitId","visitDate") DO UPDATE SET status = 'queued', "dueAt" = EXCLUDED."dueAt"
          WHERE "workflowSteps".status IN ('skipped','canceled') OR ("workflowSteps".status IN ('queued','held') AND "workflowSteps"."dueAt" IS DISTINCT FROM EXCLUDED."dueAt");
      END LOOP;
    END $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_visit_source_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE ws uuid; target_id uuid; previous_id uuid; v record;
    BEGIN
      ws := CASE WHEN TG_OP = 'DELETE' THEN OLD."workspaceId" ELSE NEW."workspaceId" END;
      IF TG_TABLE_NAME = 'workflows' THEN
        IF NEW.definition->>'kind' IN ('unassigned_visit','visit_materials') THEN PERFORM workflow_initialize_visits(ws,NEW.id); END IF; RETURN NEW; END IF;
      IF TG_TABLE_NAME = 'calendarVisits' THEN PERFORM workflow_sync_visit(ws,NEW.id); RETURN NEW; END IF;
      IF TG_TABLE_NAME = 'calendarVisitRecords' THEN
        IF TG_OP <> 'INSERT' THEN PERFORM workflow_sync_visit(ws,OLD."visitId"); END IF;
        IF TG_OP <> 'DELETE' THEN PERFORM workflow_sync_visit(ws,NEW."visitId"); END IF;
      ELSE
        IF TG_TABLE_NAME = 'jobs' THEN target_id := NEW.id;
        ELSIF TG_TABLE_NAME = 'jobTeamMembers' THEN target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD."jobId" ELSE NEW."jobId" END;
        ELSIF TG_TABLE_NAME = 'workOrders' THEN target_id := NEW.id;
        ELSE target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD."workOrderId" ELSE NEW."workOrderId" END; END IF;
        IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'jobTeamMembers' THEN previous_id := OLD."jobId";
        ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'workOrderCrew' THEN previous_id := OLD."workOrderId"; END IF;
        FOR v IN SELECT DISTINCT "visitId" FROM "calendarVisitRecords" WHERE "workspaceId" = ws AND "endedAt" IS NULL AND
          CASE WHEN TG_TABLE_NAME IN ('jobs','jobTeamMembers') THEN "jobId" IN (target_id,previous_id) ELSE "workOrderId" IN (target_id,previous_id) END LOOP
          PERFORM workflow_sync_visit(ws,v."visitId");
        END LOOP;
      END IF;
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END $$`);
  // Transition tables coalesce all lines in a materials write into affected canonical visits.
  // The application replaces lists with DELETE/INSERT; this is statement-level, never per material row.
  await db.raw(`CREATE FUNCTION workflow_materials_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE changed text; v record;
    BEGIN
      IF TG_OP = 'INSERT' THEN changed := 'SELECT "workspaceId", "workOrderId" FROM new_materials';
      ELSIF TG_OP = 'DELETE' THEN changed := 'SELECT "workspaceId", "workOrderId" FROM old_materials';
      ELSE changed := 'SELECT o."workspaceId", o."workOrderId" FROM old_materials o JOIN new_materials n USING(id)
        WHERE (o.status,o."workspaceId",o."workOrderId") IS DISTINCT FROM (n.status,n."workspaceId",n."workOrderId")
        UNION SELECT n."workspaceId", n."workOrderId" FROM old_materials o JOIN new_materials n USING(id)
        WHERE (o.status,o."workspaceId",o."workOrderId") IS DISTINCT FROM (n.status,n."workspaceId",n."workOrderId")'; END IF;
      FOR v IN EXECUTE 'SELECT DISTINCT r."workspaceId", r."visitId" FROM "calendarVisitRecords" r JOIN (' || changed || ') c
        ON c."workspaceId" = r."workspaceId" AND c."workOrderId" = r."workOrderId" WHERE r."endedAt" IS NULL
        AND EXISTS (SELECT 1 FROM workflows w WHERE w."workspaceId" = r."workspaceId" AND w.status IN (''active'',''paused'') AND w.definition->>''kind'' = ''visit_materials'')'
      LOOP PERFORM workflow_sync_visit(v."workspaceId",v."visitId"); END LOOP;
      RETURN NULL;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_materials_inserted AFTER INSERT ON "workOrderMaterials" REFERENCING NEW TABLE AS new_materials FOR EACH STATEMENT EXECUTE FUNCTION workflow_materials_changed()`);
  await db.raw(`CREATE TRIGGER workflow_materials_deleted AFTER DELETE ON "workOrderMaterials" REFERENCING OLD TABLE AS old_materials FOR EACH STATEMENT EXECUTE FUNCTION workflow_materials_changed()`);
  await db.raw(`CREATE TRIGGER workflow_materials_updated AFTER UPDATE ON "workOrderMaterials" REFERENCING OLD TABLE AS old_materials NEW TABLE AS new_materials FOR EACH STATEMENT EXECUTE FUNCTION workflow_materials_changed()`);
}
  // 202611200003_workflow-editing.ts
  {
  await db.schema.alterTable("workflowSteps", table => { table.timestamp("triggeredAt", { useTz: true }); });
  // Retain the original event anchor for future edits. Legacy pending work uses its current source once.
  await db.raw(`UPDATE "workflowSteps" s SET "triggeredAt" = CASE WHEN w.definition->>'kind' = 'unassigned_lead' THEN
      (SELECT l."createdAt" FROM leads l WHERE l."workspaceId" = s."workspaceId" AND l.id = s."leadId")
      WHEN w.definition->>'kind' = 'estimate_follow_up' THEN (SELECT min(d."sentAt") FROM estimate_deliveries d
        WHERE d."workspaceId" = s."workspaceId" AND d."estimateId" = s."estimateId" AND d.status = 'sent') ELSE
      (SELECT e."decidedAt" FROM estimates e WHERE e."workspaceId" = s."workspaceId" AND e.id = s."estimateId") END
    FROM workflows w WHERE s."workflowId" = w.id AND s."workspaceId" = w."workspaceId" AND s.status IN ('queued','held')
      AND w.definition->>'kind' IN ('unassigned_lead','estimate_follow_up','unscheduled_estimate')`);
  await db.raw(`CREATE FUNCTION workflow_reminder_due(anchor timestamptz, days integer, send_time time, zone text)
    RETURNS timestamptz LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
      SELECT (day::date + send_time) AT TIME ZONE zone
      FROM generate_series((anchor AT TIME ZONE zone)::date + interval '1 day',
        (anchor AT TIME ZONE zone)::date + interval '65 days', interval '1 day') day
      WHERE extract(isodow FROM day) < 6 ORDER BY day OFFSET (days - 1) LIMIT 1 $$`);
  await db.raw(`CREATE OR REPLACE FUNCTION workflow_enroll_record(ws uuid, recipe text, record_id uuid, triggered_at timestamptz) RETURNS void
    LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
      IF triggered_at IS NULL THEN RETURN; END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","leadId","estimateId","triggeredAt","dueAt",status)
      SELECT gen_random_uuid(), ws, w.id, CASE WHEN recipe = 'unassigned_lead' THEN 'lead' ELSE 'estimate' END,
        CASE WHEN recipe = 'unassigned_lead' THEN record_id END, CASE WHEN recipe <> 'unassigned_lead' THEN record_id END,
        triggered_at, workflow_reminder_due(triggered_at,(w.definition->>'businessDays')::int,coalesce(w.definition->>'localTime','17:00')::time,w.definition->>'timezone'), 'queued'
      FROM workflows w WHERE w."workspaceId" = ws AND w.status = 'active' AND w."publisherId" IS NOT NULL
        AND w.definition->>'kind' = recipe AND w."enrollAfter" < triggered_at ON CONFLICT DO NOTHING;
    END $$`);
  await db.schema.createTable("workflowEditAudit", table => {
    table.uuid("id").primary(); table.uuid("workspaceId").notNullable(); table.uuid("workflowId").notNullable();
    table.text("actorId").notNullable();
    table.uuid("requestId").notNullable(); table.text("requestHash").notNullable(); table.integer("version").notNullable();
    table.jsonb("before").notNullable(); table.jsonb("after").notNullable(); table.jsonb("response").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.unique(["workspaceId", "actorId", "requestId"]); table.unique(["workspaceId", "workflowId", "version"]);
  });
}
  // 202611200004_workflow-lead-routing.ts
  {
  await db.schema.alterTable("workflows", table => { table.text("executionIssue"); });
  await db.raw(`CREATE UNIQUE INDEX workflow_active_lead_source ON workflows ("workspaceId", (definition->>'sourceId'))
    WHERE status = 'active' AND "deletedAt" IS NULL AND definition->>'kind' = 'lead_routing'`);
  await db.schema.createTable("workflowRoutingReceipts", table => {
    table.uuid("workspaceId").notNullable(); table.uuid("leadId").notNullable(); table.uuid("workflowId").notNullable();
    table.integer("version").notNullable(); table.text("assigneeId").notNullable(); table.uuid("sourceId").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(["workspaceId", "leadId"]);
    table.foreign(["workspaceId", "leadId"]).references(["workspaceId", "id"]).inTable("leads").onDelete("CASCADE");
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
  });
  await db.schema.alterTable("assignmentNotifications", table => { table.boolean("inApp").notNullable().defaultTo(true); });
  await db.schema.alterTable("assignmentNotifications", table => { table.unique(["workspaceId", "id"]); });
  await db.schema.alterTable("assignmentEmailOutbox", table => { table.boolean("workflowRouting").notNullable().defaultTo(false); });
  await db.raw('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind');
  await db.schema.alterTable("workflowQueueOutbox", table => {
    table.uuid("assignmentNoticeId").unique();
    table.foreign(["workspaceId", "assignmentNoticeId"]).references(["workspaceId", "id"]).inTable("assignmentNotifications").onDelete("CASCADE");
    table.check(`version > 0 AND num_nonnulls("stepId","estimateNoticeId","leadNoticeId","briefingNoticeId","visitNoticeId","assignmentNoticeId") = 1 AND
      ((kind = 'step' AND "stepId" IS NOT NULL) OR (kind = 'estimate_email' AND "estimateNoticeId" IS NOT NULL) OR
       (kind = 'lead_email' AND "leadNoticeId" IS NOT NULL) OR (kind = 'briefing_email' AND "briefingNoticeId" IS NOT NULL) OR
       (kind = 'visit_email' AND "visitNoticeId" IS NOT NULL) OR (kind = 'assignment_email' AND "assignmentNoticeId" IS NOT NULL))`, [], "workflow_outbox_kind");
  });
  await db.raw(`CREATE FUNCTION workflow_assignment_queue_changed() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE ws uuid;
    BEGIN
      IF NOT NEW."workflowRouting" THEN RETURN NEW; END IF;
      SELECT "workspaceId" INTO ws FROM "assignmentNotifications" WHERE id = NEW.id;
      IF NEW.status = 'queued' THEN
        INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,"assignmentNoticeId","availableAt")
          VALUES (ws,'assignment_email',NEW.id,NEW."nextAttemptAt")
          ON CONFLICT ("assignmentNoticeId") DO UPDATE SET "availableAt" = EXCLUDED."availableAt", "nextDispatchAt" = now(), "completedAt" = NULL,
            version = "workflowQueueOutbox".version + 1;
        PERFORM pg_notify('salesmora_workflow_queue', '');
      ELSE
        UPDATE "workflowQueueOutbox" SET "completedAt" = now(), version = version + 1 WHERE "assignmentNoticeId" = NEW.id AND "completedAt" IS NULL;
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER workflow_assignment_email_queue AFTER INSERT OR UPDATE OF status,"nextAttemptAt" ON "assignmentEmailOutbox"
    FOR EACH ROW EXECUTE FUNCTION workflow_assignment_queue_changed()`);

}
  // 202611200005_calendar-work-time.ts
  {
  for (const name of ['calendarVisits', 'calendarScheduleSnapshots']) await db.schema.alterTable(name, table => {
    table.jsonb('workTime'); table.text('workTimezone');
    table.timestamp('workStartsAt', { useTz: true }); table.timestamp('workEndsAt', { useTz: true });
  });
  // Candidate offsets are sampled on either side of the date, including half-hour/date-line changes.
  // Exactly one round-trip match is required: nonexistent and repeated local times are not guessed.
  await db.raw(`CREATE FUNCTION calendar_local_work_at(local_at timestamp, zone text) RETURNS timestamptz
    LANGUAGE sql STABLE SET search_path = public, pg_catalog AS $$
      WITH anchor AS (SELECT local_at AT TIME ZONE zone AS at), offsets AS (
        SELECT DISTINCT (sample AT TIME ZONE zone) - (sample AT TIME ZONE 'UTC') AS zone_offset
        FROM anchor CROSS JOIN LATERAL generate_series(at - interval '2 days',at + interval '2 days',interval '12 hours') sample
      ), candidates AS (SELECT DISTINCT (local_at - zone_offset) AT TIME ZONE 'UTC' AS at FROM offsets)
      SELECT CASE WHEN count(*) = 1 THEN min(at) ELSE NULL END FROM candidates WHERE at AT TIME ZONE zone = local_at
    $$`);
  await db.raw(`CREATE FUNCTION calendar_set_work_time() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$
    DECLARE mins integer; local_start timestamp; local_end timestamp;
    BEGIN
      IF NEW."scheduledDate" IS NULL THEN NEW."workTime" := NULL; END IF;
      IF TG_OP = 'UPDATE' AND (NEW."workTime" IS DISTINCT FROM OLD."workTime" OR NEW."scheduledDate" IS DISTINCT FROM OLD."scheduledDate" OR NEW."workTimezone" IS DISTINCT FROM OLD."workTimezone") THEN
        NEW.version := greatest(NEW.version,OLD.version + 1); NEW."updatedAt" := current_timestamp;
      END IF;
      IF NEW."workTime" IS NULL THEN NEW."workTimezone" := NULL; NEW."workStartsAt" := NULL; NEW."workEndsAt" := NULL; RETURN NEW; END IF;
      IF (jsonb_typeof(NEW."workTime") = 'object' AND NEW."workTime" = jsonb_build_object('startTime',NEW."workTime"->'startTime','durationMinutes',NEW."workTime"->'durationMinutes')
        AND jsonb_typeof(NEW."workTime"->'startTime') = 'string' AND NEW."workTime"->>'startTime' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        AND jsonb_typeof(NEW."workTime"->'durationMinutes') = 'number') IS NOT TRUE THEN
        RAISE EXCEPTION 'Invalid planned work time' USING ERRCODE = '23514', CONSTRAINT = 'calendar_work_time_valid'; END IF;
      IF (NEW."workTime"->>'durationMinutes')::numeric <> floor((NEW."workTime"->>'durationMinutes')::numeric)
        OR (NEW."workTime"->>'durationMinutes')::numeric NOT BETWEEN 15 AND 480 THEN
        RAISE EXCEPTION 'Invalid work duration' USING ERRCODE = '23514', CONSTRAINT = 'calendar_work_time_valid'; END IF;
      mins := (NEW."workTime"->>'durationMinutes')::integer;
      local_start := NEW."scheduledDate" + (NEW."workTime"->>'startTime')::time;
      local_end := local_start + make_interval(mins => mins);
      IF local_end::date <> NEW."scheduledDate" THEN RAISE EXCEPTION 'Work must finish on the same day' USING ERRCODE = '23514', CONSTRAINT = 'calendar_work_time_valid'; END IF;
      IF TG_OP = 'INSERT' OR NEW."workTimezone" IS NULL THEN SELECT timezone INTO NEW."workTimezone" FROM workspaces WHERE id = NEW."workspaceId";
      ELSIF NEW."workTime" IS DISTINCT FROM OLD."workTime" THEN SELECT timezone INTO NEW."workTimezone" FROM workspaces WHERE id = NEW."workspaceId"; END IF;
      NEW."workStartsAt" := calendar_local_work_at(local_start,NEW."workTimezone");
      NEW."workEndsAt" := calendar_local_work_at(local_end,NEW."workTimezone");
      IF NEW."workStartsAt" IS NULL OR NEW."workEndsAt" IS NULL OR NEW."workEndsAt" - NEW."workStartsAt" <> make_interval(mins => mins) THEN
        RAISE EXCEPTION 'Choose work times outside a daylight-saving clock change' USING ERRCODE = '23514', CONSTRAINT = 'calendar_work_time_clock'; END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER calendar_visit_work_time BEFORE INSERT OR UPDATE OF "workspaceId","scheduledDate","workTime","workTimezone","workStartsAt","workEndsAt"
    ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION calendar_set_work_time()`);
  await db.raw(`CREATE INDEX calendar_work_intervals ON "calendarVisits" ("workspaceId","workStartsAt","workEndsAt",id) WHERE "workStartsAt" IS NOT NULL`);
}
  // 202611200006_calendar-availability.ts
  {
  await db.schema.createTable('calendarPersonAvailability', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('personId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('version').notNullable(); table.text('timezone').notNullable(); table.jsonb('availability').notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'personId']);
  });
  await db.schema.createTable('calendarAvailabilityOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable(); table.text('actorId').notNullable(); table.text('personId').notNullable();
    table.text('payloadHash').notNullable(); table.jsonb('result').notNullable(); table.jsonb('before').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']); table.index(['workspaceId', 'personId', 'createdAt']);
  });
  await db.raw(`ALTER TABLE "calendarPersonAvailability" ADD CONSTRAINT calendar_availability_version CHECK (version > 0),
    ADD CONSTRAINT calendar_availability_object CHECK (jsonb_typeof(availability) = 'object')`);
}
  // 202611200007_calendar-booking.ts
  {
  for (const name of ['calendarVisits', 'calendarScheduleSnapshots']) await db.schema.alterTable(name, table => {
    table.integer('bookingGapMinutes');
  });
  for (const name of ['calendarVisits', 'calendarScheduleSnapshots']) await db.raw('ALTER TABLE ?? ADD CONSTRAINT ?? CHECK ("bookingGapMinutes" IS NULL OR "bookingGapMinutes" BETWEEN 0 AND 120)', [name, name + '_booking_gap']);
  await db.raw(`CREATE FUNCTION calendar_set_booking_gap() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_catalog AS $$ BEGIN
    IF NEW."scheduledDate" IS NULL THEN NEW."bookingGapMinutes" := NULL; END IF;
    IF TG_OP = 'UPDATE' AND NEW."bookingGapMinutes" IS DISTINCT FROM OLD."bookingGapMinutes" THEN
      NEW.version := greatest(NEW.version,OLD.version+1); NEW."updatedAt" := current_timestamp;
    END IF; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER calendar_booking_gap BEFORE INSERT OR UPDATE OF "scheduledDate","bookingGapMinutes" ON "calendarVisits"
    FOR EACH ROW EXECUTE FUNCTION calendar_set_booking_gap()`);
  await db.schema.createTable('calendarBookingOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable(); table.uuid('jobId').notNullable(); table.text('actorId').notNullable();
    table.text('inputHash').notNullable(); table.jsonb('result').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']); table.index(['workspaceId', 'jobId', 'createdAt']);
  });
}
  // 202611210001_workflow-routine-booking.ts
  {
  await db.schema.alterTable('workflowSteps', t => {
    t.uuid('jobId'); t.date('bookingFrom'); t.date('bookingThrough'); t.uuid('bookingAttemptId').defaultTo(db.raw('gen_random_uuid()')); t.jsonb('bookingResult');
    t.foreign(['workspaceId','jobId']).references(['workspaceId','id']).inTable('jobs').onDelete('CASCADE');
  });
  const old = (await db.raw(`SELECT pg_get_expr(conbin,conrelid) AS expression FROM pg_constraint WHERE conrelid = '"workflowSteps"'::regclass AND conname = 'workflow_step_record_kind'`)).rows[0].expression;
  await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
  await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK
    (("recordKind" = 'booking' AND "jobId" IS NOT NULL AND "leadId" IS NULL AND "estimateId" IS NULL AND "visitId" IS NULL AND "bookingFrom" IS NOT NULL AND "bookingThrough" >= "bookingFrom") OR ("jobId" IS NULL AND (${old})))`);
  await db.raw(`CREATE UNIQUE INDEX workflow_booking_once ON "workflowSteps" ("workflowId","jobId") WHERE "recordKind" = 'booking'`);
  await db.raw(`CREATE INDEX workflow_booking_pending ON "workflowSteps" ("workspaceId","jobId","bookingThrough") WHERE "recordKind" = 'booking' AND status IN ('queued','held')`);
  await db.raw(`CREATE UNIQUE INDEX workflow_booking_service ON workflows ("workspaceId",(definition->>'service')) WHERE status = 'active' AND "deletedAt" IS NULL AND definition->>'kind' = 'routine_booking'`);
  const queue = (await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) AS code`)).rows[0].code;
  await db.raw(queue.replace("'briefing','visit','visit_init'", "'briefing','visit','visit_init','booking'"));
  await db.schema.createTable('workflowBookingNotifications', t => {
    t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()')); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('workflowId').notNullable(); t.uuid('stepId').notNullable(); t.uuid('jobId').notNullable(); t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('event').notNullable(); t.jsonb('snapshot').notNullable(); t.boolean('inApp').notNullable(); t.timestamp('readAt',{useTz:true});
    t.text('emailStatus').notNullable(); t.integer('attempts').notNullable().defaultTo(0); t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now()); t.timestamp('sentAt',{useTz:true});
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.unique(['workspaceId','id']); t.unique(['stepId','userId','event']);
    for(const [column,table] of [['workflowId','workflows'],['stepId','workflowSteps'],['jobId','jobs']]) t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
    t.check("event IN ('booked','no_slot') AND \"emailStatus\" IN ('queued','sent','skipped','failed') AND attempts >= 0",[], 'workflow_booking_notice_valid');
    t.index(['workspaceId','userId','readAt','createdAt']);
  });
  await db.raw('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind');
  await db.schema.alterTable('workflowQueueOutbox', t => { t.uuid('bookingNoticeId').unique(); t.foreign(['workspaceId','bookingNoticeId']).references(['workspaceId','id']).inTable('workflowBookingNotifications').onDelete('CASCADE'); });
  const columns=['stepId','estimateNoticeId','leadNoticeId','briefingNoticeId','visitNoticeId','assignmentNoticeId','bookingNoticeId'];
  const kinds=['step','estimate_email','lead_email','briefing_email','visit_email','assignment_email','booking_email'];
  await db.raw(`ALTER TABLE "workflowQueueOutbox" ADD CONSTRAINT workflow_outbox_kind CHECK (version > 0 AND num_nonnulls(${columns.map(c=>'"'+c+'"').join(',')})=1 AND (${columns.map((c,i)=>`(kind='${kinds[i]}' AND "${c}" IS NOT NULL)`).join(' OR ')}))`);
  await db.raw(`CREATE FUNCTION workflow_booking_notice_queue() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    IF NEW."emailStatus"='queued' THEN INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,"bookingNoticeId","availableAt") VALUES (NEW."workspaceId",'booking_email',NEW.id,NEW."nextAttemptAt")
      ON CONFLICT ("bookingNoticeId") DO UPDATE SET "availableAt"=EXCLUDED."availableAt","nextDispatchAt"=now(),"completedAt"=NULL,version="workflowQueueOutbox".version+1; PERFORM pg_notify('salesmora_workflow_queue','');
    ELSE UPDATE "workflowQueueOutbox" SET "completedAt"=now(),version=version+1 WHERE "bookingNoticeId"=NEW.id AND "completedAt" IS NULL; END IF; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER workflow_booking_notice AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "workflowBookingNotifications" FOR EACH ROW EXECUTE FUNCTION workflow_booking_notice_queue()`);
  await db.raw(`CREATE FUNCTION workflow_booking_job_created() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    IF NEW.status <> 'needs-scheduling' OR NEW.service = '' THEN RETURN NEW; END IF;
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","jobId","triggeredAt","bookingFrom","bookingThrough","dueAt",status)
      SELECT gen_random_uuid(),NEW."workspaceId",w.id,'booking',NEW.id,NEW."createdAt",(NEW."createdAt" AT TIME ZONE (w.definition->>'timezone'))::date+1,
      (NEW."createdAt" AT TIME ZONE (w.definition->>'timezone'))::date+(w.definition->'rules'->>'horizonDays')::int,now(),'queued'
      FROM workflows w WHERE w."workspaceId"=NEW."workspaceId" AND w.status='active' AND w."publisherId" IS NOT NULL AND w."deletedAt" IS NULL
        AND w.definition->>'kind'='routine_booking' AND w.definition->>'service'=NEW.service AND NEW."createdAt">w."enrollAfter" ON CONFLICT DO NOTHING;
    RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER workflow_booking_job AFTER INSERT ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_booking_job_created()`);
  await db.raw(`CREATE FUNCTION workflow_booking_recheck(ws uuid,people text[],source_job uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    UPDATE "workflowSteps" s SET "dueAt"=now(),"bookingAttemptId"=gen_random_uuid()
      FROM workflows w,jobs j WHERE s."workspaceId"=ws AND w."workspaceId"=ws AND w.id=s."workflowId" AND j."workspaceId"=ws AND j.id=s."jobId"
      AND s."recordKind"='booking' AND s.status='queued' AND s."dueAt">now() AND s."bookingResult"->>'status'='no_slot' AND w.status='active'
      AND s."bookingThrough">=(now() AT TIME ZONE (w.definition->>'timezone'))::date AND
      (j.id=source_job OR j."primaryOwnerId"=ANY(people) OR EXISTS (SELECT 1 FROM "jobTeamMembers" t WHERE t."workspaceId"=ws AND t."jobId"=j.id AND t."userId"=ANY(people))
        OR EXISTS (SELECT 1 FROM "calendarVisitRecords" r JOIN "calendarVisitRecords" o ON o."workspaceId"=ws AND o."visitId"=r."visitId" AND o."endedAt" IS NULL
          JOIN "workOrders" wo ON wo."workspaceId"=ws AND wo.id=o."workOrderId" WHERE r."workspaceId"=ws AND r."jobId"=j.id AND r."endedAt" IS NULL AND
          (wo."primaryAssigneeId"=ANY(people) OR EXISTS (SELECT 1 FROM "workOrderCrew" c WHERE c."workspaceId"=ws AND c."workOrderId"=wo.id AND c."userId"=ANY(people)))));
    END $$`);
  await db.raw(`CREATE FUNCTION workflow_booking_facts_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE item jsonb; ws uuid; people text[]:=ARRAY[]::text[]; source_job uuid; vid uuid;
    BEGIN
      item:=CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END; ws:=(item->>'workspaceId')::uuid;
      IF TG_TABLE_NAME='calendarPersonAvailability' THEN people:=ARRAY[item->>'personId'];
      ELSIF TG_TABLE_NAME='jobs' THEN source_job:=(item->>'id')::uuid; people:=ARRAY[item->>'primaryOwnerId',OLD."primaryOwnerId"];
      ELSIF TG_TABLE_NAME='jobTeamMembers' THEN source_job:=(item->>'jobId')::uuid; people:=ARRAY[item->>'userId'];
      ELSIF TG_TABLE_NAME='workOrders' THEN source_job:=(item->>'jobId')::uuid; people:=ARRAY[item->>'primaryAssigneeId',OLD."primaryAssigneeId"];
      ELSIF TG_TABLE_NAME='workOrderCrew' THEN people:=ARRAY[item->>'userId'];
      ELSE
        vid:=CASE WHEN TG_TABLE_NAME='calendarVisits' THEN (item->>'id')::uuid ELSE (item->>'visitId')::uuid END;
        SELECT array_agg(DISTINCT p) INTO people FROM (
          SELECT j."primaryOwnerId" p FROM "calendarVisitRecords" r JOIN jobs j ON j."workspaceId"=ws AND j.id=r."jobId" WHERE r."workspaceId"=ws AND r."visitId"=vid
          UNION SELECT t."userId" FROM "calendarVisitRecords" r JOIN "jobTeamMembers" t ON t."workspaceId"=ws AND t."jobId"=r."jobId" WHERE r."workspaceId"=ws AND r."visitId"=vid
          UNION SELECT wo."primaryAssigneeId" FROM "calendarVisitRecords" r JOIN "workOrders" wo ON wo."workspaceId"=ws AND wo.id=r."workOrderId" WHERE r."workspaceId"=ws AND r."visitId"=vid
          UNION SELECT c."userId" FROM "calendarVisitRecords" r JOIN "workOrderCrew" c ON c."workspaceId"=ws AND c."workOrderId"=r."workOrderId" WHERE r."workspaceId"=ws AND r."visitId"=vid) assigned;
      END IF;
      PERFORM workflow_booking_recheck(ws,coalesce(people,ARRAY[]::text[]),source_job); RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
    END $$`);
  for(const table of ['calendarPersonAvailability','jobTeamMembers','workOrderCrew','calendarVisitRecords']) await db.raw(`CREATE TRIGGER workflow_booking_facts AFTER INSERT OR UPDATE OR DELETE ON ?? FOR EACH ROW EXECUTE FUNCTION workflow_booking_facts_changed()`,[table]);
  await db.raw(`CREATE TRIGGER workflow_booking_facts AFTER UPDATE OF "scheduledDate","workTime","bookingGapMinutes" ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION workflow_booking_facts_changed()`);
  await db.raw(`CREATE TRIGGER workflow_booking_facts AFTER UPDATE OF "primaryOwnerId",status,service,"completionDeadline" ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_booking_facts_changed()`);
  await db.raw(`CREATE TRIGGER workflow_booking_facts AFTER UPDATE OF "primaryAssigneeId",status,"archivedAt" ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_booking_facts_changed()`);
  await db.raw(`CREATE FUNCTION workflow_booking_lifecycle() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    IF OLD.definition->>'kind'='routine_booking' AND (NEW.status<>'active' OR NEW.definition IS DISTINCT FROM OLD.definition) THEN
      UPDATE "workflowBookingNotifications" SET "emailStatus"='skipped' WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "emailStatus"='queued';
      IF NEW.definition IS DISTINCT FROM OLD.definition THEN UPDATE "workflowSteps" SET status='canceled' WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "recordKind"='booking' AND status IN ('queued','held'); END IF;
    END IF; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER workflow_booking_lifecycle AFTER UPDATE OF status,definition ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_booking_lifecycle()`);
}
  // 202611210002_workspace-services.ts
  {
  await db.schema.alterTable('workspaceServices',t=>{t.uuid('id').notNullable().defaultTo(db.raw('gen_random_uuid()'));t.text('name');t.timestamp('archivedAt',{useTz:true});t.unique(['workspaceId','id']);});
  await db('workspaceServices').update({name:db.raw('initcap(replace(service,\'-\',\' \'))')});
  await db.raw(`UPDATE "workspaceServices" s SET name=c.label FROM jsonb_to_recordset(?::jsonb) AS c(value text,label text) WHERE s.service=c.value`,[JSON.stringify(serviceCatalog)]);
  await db.raw(`WITH duplicates AS (SELECT "workspaceId",lower(name) n FROM "workspaceServices" GROUP BY 1,2 HAVING count(*)>1) UPDATE "workspaceServices" s SET name=s.name||' ('||s.service||')' FROM duplicates d WHERE s."workspaceId"=d."workspaceId" AND lower(s.name)=d.n`);
  await db.raw(`ALTER TABLE "workspaceServices" ALTER COLUMN name SET NOT NULL`);
  await db.raw(`CREATE UNIQUE INDEX workspace_service_name ON "workspaceServices"("workspaceId",lower(btrim(name)))`);
  await db.raw(`ALTER TABLE workspaces ADD COLUMN "servicesVersion" integer NOT NULL DEFAULT 0`);
  await db.schema.createTable('serviceSettingsOperations',t=>{t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('requestId').notNullable();t.text('actorId').notNullable();t.text('inputHash').notNullable();t.integer('afterVersion').notNullable();t.jsonb('command').notNullable();t.timestamp('createdAt',{useTz:true}).defaultTo(db.fn.now());t.primary(['workspaceId','requestId']);});
  // Immutable compatibility keys keep old drafts/history readable. User-visible renames only change name.
  await db.raw(`CREATE FUNCTION workspace_service_identity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP='UPDATE' AND (NEW.id<>OLD.id OR NEW.service<>OLD.service OR NEW."workspaceId"<>OLD."workspaceId") THEN RAISE EXCEPTION 'Service identity cannot change'; END IF;
    IF NEW.name IS NULL THEN NEW.name:=initcap(replace(NEW.service,'-',' ')); END IF;
    IF length(btrim(NEW.name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid service name'; END IF; RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER workspace_service_identity BEFORE INSERT OR UPDATE ON "workspaceServices" FOR EACH ROW EXECUTE FUNCTION workspace_service_identity()`);
  for(const table of ['jobs','leads','workflows']) {
    await db.schema.alterTable(table,t=>{t.uuid('serviceId');t.foreign(['workspaceId','serviceId']).references(['workspaceId','id']).inTable('workspaceServices');t.index(['workspaceId','serviceId']);});
    const match=table==='workflows'?`r.definition->>'service'`:'r.service';
    await db.raw(`UPDATE ?? r SET "serviceId"=s.id FROM "workspaceServices" s WHERE s."workspaceId"=r."workspaceId" AND s.service=${match}`,[table]);
  }
  // Map exact labels only when unambiguous; retain unmatched historical text for explicit classification.
  for(const table of ['jobs','leads'])await db.raw(`UPDATE ?? r SET "serviceId"=s.id FROM "workspaceServices" s WHERE r."serviceId" IS NULL AND s."workspaceId"=r."workspaceId" AND s.name=r.service AND NOT EXISTS (SELECT 1 FROM "workspaceServices" o WHERE o."workspaceId"=s."workspaceId" AND o.id<>s.id AND o.service=r.service)`,[table]);
  await db.raw(`CREATE FUNCTION record_service_identity() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE selected uuid; ref text; BEGIN
    IF TG_TABLE_NAME='workflows' THEN ref:=NEW.definition->>'service'; ELSE ref:=NEW.service; END IF;
    SELECT s.id INTO selected FROM "workspaceServices" s WHERE s."workspaceId"=NEW."workspaceId" AND (s.service=ref OR s.id::text=ref OR s.name=ref)
      ORDER BY (s.id::text=ref) DESC,(CASE WHEN TG_TABLE_NAME='leads' THEN s.name=ref ELSE s.service=ref END) DESC LIMIT 1;
    NEW."serviceId":=selected; RETURN NEW; END $$`);
  for(const table of ['jobs','leads','workflows'])await db.raw(`CREATE TRIGGER record_service_identity BEFORE INSERT OR UPDATE OF ${table==='workflows'?'definition':'service'} ON ?? FOR EACH ROW EXECUTE FUNCTION record_service_identity()`,[table]);
  await db.raw(`DROP INDEX workflow_booking_service`);
  await db.raw(`CREATE UNIQUE INDEX workflow_booking_service ON workflows ("workspaceId","serviceId") WHERE status='active' AND "deletedAt" IS NULL AND definition->>'kind'='routine_booking'`);
  const f=(await db.raw(`SELECT pg_get_functiondef('workflow_booking_job_created()'::regprocedure) AS body`)).rows[0].body as string;
  await db.raw(f.replace("w.definition->>'service'=NEW.service",`w."serviceId"=NEW."serviceId" AND EXISTS(SELECT 1 FROM "workspaceServices" c WHERE c."workspaceId"=NEW."workspaceId" AND c.id=NEW."serviceId" AND c."archivedAt" IS NULL)`));
}
  // 202611210003_service-qualified-workers.ts
  {
 await db.schema.createTable('serviceQualifiedWorkers',t=>{t.uuid('workspaceId').notNullable();t.uuid('serviceId').notNullable();t.text('personId').notNullable();t.integer('priority').notNullable();t.primary(['workspaceId','serviceId','personId']);t.unique(['workspaceId','serviceId','priority']);t.foreign(['workspaceId','serviceId']).references(['workspaceId','id']).inTable('workspaceServices').onDelete('CASCADE');t.foreign(['workspaceId','personId']).references(['workspaceId','userId']).inTable('workspaceMemberships').onDelete('CASCADE');t.index(['workspaceId','personId','serviceId']);t.check('priority BETWEEN 0 AND 99');});
 await db.raw(`CREATE FUNCTION workflow_qualified_workers_changed() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
   UPDATE "workflowSteps" s SET "dueAt"=now(),"bookingAttemptId"=gen_random_uuid() FROM workflows w
   WHERE w.id=s."workflowId" AND w."workspaceId"=s."workspaceId" AND w.status='active' AND w.definition->>'assignmentMode'='qualified_if_unassigned'
   AND s."recordKind"='booking' AND s.status='queued' AND s."dueAt">now() AND s."bookingResult"->>'status'='no_slot'
   AND s."bookingThrough">=(now() AT TIME ZONE (w.definition->>'timezone'))::date
   AND EXISTS(SELECT 1 FROM changed c WHERE c."workspaceId"=w."workspaceId" AND c."serviceId"=w."serviceId"); RETURN NULL; END $$`);
 for(const event of ['INSERT','UPDATE','DELETE'])await db.raw(`CREATE TRIGGER qualified_workers_${event.toLowerCase()} AFTER ${event} ON "serviceQualifiedWorkers" REFERENCING ${event==='DELETE'?'OLD':'NEW'} TABLE AS changed FOR EACH STATEMENT EXECUTE FUNCTION workflow_qualified_workers_changed()`);
 const body=(await db.raw(`SELECT pg_get_functiondef('workflow_booking_recheck(uuid,text[],uuid)'::regprocedure) AS body`)).rows[0].body as string;
 if(!body.includes('j.id=source_job OR'))throw Error('Booking recheck definition changed.');
 await db.raw(body.replace('j.id=source_job OR',`j.id=source_job OR (w.definition->>'assignmentMode'='qualified_if_unassigned' AND EXISTS(SELECT 1 FROM "serviceQualifiedWorkers" q WHERE q."workspaceId"=ws AND q."serviceId"=w."serviceId" AND q."personId"=ANY(people))) OR`));
 await db.raw(`CREATE FUNCTION workflow_qualified_member_changed() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE ws uuid; BEGIN
   IF (NEW."suspendedAt",NEW."deletionRequestedAt") IS NOT DISTINCT FROM (OLD."suspendedAt",OLD."deletionRequestedAt") THEN RETURN NEW; END IF;
   FOR ws IN SELECT DISTINCT "workspaceId" FROM "serviceQualifiedWorkers" WHERE "personId"=NEW.id LOOP PERFORM workflow_booking_recheck(ws,ARRAY[NEW.id]); END LOOP; RETURN NEW; END $$`);
 await db.raw(`CREATE TRIGGER qualified_member_changed AFTER UPDATE OF "suspendedAt","deletionRequestedAt" ON users FOR EACH ROW EXECUTE FUNCTION workflow_qualified_member_changed()`);
}
  // 202611220001_workflow-cancellation-fill.ts
  {
 await db.schema.createTable('workflowCancellationOpenings',t=>{
  t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
  t.uuid('workflowId').notNullable();t.integer('workflowVersion').notNullable();t.uuid('sourceVisitId').notNullable();t.integer('sourceVersion').notNullable();
  t.date('date').notNullable();t.text('timezone').notNullable();t.jsonb('workTime').notNullable();t.timestamp('startsAt',{useTz:true}).notNullable();t.timestamp('endsAt',{useTz:true}).notNullable();
  t.jsonb('crew').notNullable();t.jsonb('sourceJobIds').notNullable();t.text('status').notNullable().defaultTo('open');t.uuid('bookedJobId');t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
  t.unique(['workspaceId','id']);t.unique(['workflowId','sourceVisitId','sourceVersion']);
  t.foreign(['workspaceId','workflowId']).references(['workspaceId','id']).inTable('workflows').onDelete('CASCADE');
  t.check("status IN ('open','filled','expired') AND \"endsAt\">\"startsAt\"");
 });
 await db.schema.alterTable('workflowSteps',t=>{t.uuid('openingId').unique();t.foreign(['workspaceId','openingId']).references(['workspaceId','id']).inTable('workflowCancellationOpenings').onDelete('CASCADE');});
 const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
 await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
 await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='cancellation' AND "openingId" IS NOT NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "visitId" IS NULL) OR ("openingId" IS NULL AND (${old})))`);
 const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
 await db.raw(queue.replace("'visit_init','booking'","'visit_init','booking','cancellation'"));
 await db.raw(`CREATE UNIQUE INDEX workflow_cancellation_service ON workflows ("workspaceId","serviceId") WHERE status='active' AND "deletedAt" IS NULL AND definition->>'kind'='cancellation_fill'`);
 await db.schema.createTable('workflowCancellationNotifications',t=>{
  t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('workflowId').notNullable();t.uuid('openingId').notNullable();t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.text('description').notNullable();t.boolean('inApp').notNullable();t.timestamp('readAt',{useTz:true});t.text('emailStatus').notNullable();t.integer('attempts').notNullable().defaultTo(0);t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('sentAt',{useTz:true});t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.unique(['workspaceId','id']);t.unique(['openingId','userId']);
  for(const [column,table] of [['workflowId','workflows'],['openingId','workflowCancellationOpenings']])t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
  t.check("\"emailStatus\" IN ('queued','sent','skipped','failed') AND attempts>=0");t.index(['workspaceId','userId','readAt','createdAt']);
 });
 await db.schema.createTable('workflowCancellationBookings',t=>{t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('requestId').notNullable();t.text('actorId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.text('hash').notNullable();t.uuid('openingId').notNullable();t.jsonb('result').notNullable();t.primary(['workspaceId','requestId']);t.foreign(['workspaceId','openingId']).references(['workspaceId','id']).inTable('workflowCancellationOpenings').onDelete('CASCADE');});
 await db.schema.alterTable('workflowQueueOutbox',t=>{t.uuid('cancellationNoticeId').unique();t.foreign(['workspaceId','cancellationNoticeId']).references(['workspaceId','id']).inTable('workflowCancellationNotifications').onDelete('CASCADE');});
 await db.raw('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind');
 const columns=['stepId','estimateNoticeId','leadNoticeId','briefingNoticeId','visitNoticeId','assignmentNoticeId','bookingNoticeId','cancellationNoticeId'],kinds=['step','estimate_email','lead_email','briefing_email','visit_email','assignment_email','booking_email','cancellation_email'];
 await db.raw(`ALTER TABLE "workflowQueueOutbox" ADD CONSTRAINT workflow_outbox_kind CHECK(version>0 AND num_nonnulls(${columns.map(c=>'"'+c+'"').join(',')})=1 AND (${columns.map((c,i)=>`(kind='${kinds[i]}' AND "${c}" IS NOT NULL)`).join(' OR ')}))`);
 await db.raw(`CREATE FUNCTION workflow_cancellation_email_queue() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW."emailStatus"='queued' THEN INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,"cancellationNoticeId","availableAt") VALUES(NEW."workspaceId",'cancellation_email',NEW.id,NEW."nextAttemptAt") ON CONFLICT("cancellationNoticeId") DO UPDATE SET "availableAt"=EXCLUDED."availableAt","nextDispatchAt"=now(),"completedAt"=NULL,version="workflowQueueOutbox".version+1;PERFORM pg_notify('salesmora_workflow_queue','');
 ELSE UPDATE "workflowQueueOutbox" SET "completedAt"=now(),version=version+1 WHERE "cancellationNoticeId"=NEW.id AND "completedAt" IS NULL;END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_cancellation_email AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "workflowCancellationNotifications" FOR EACH ROW EXECUTE FUNCTION workflow_cancellation_email_queue()`);
 // Calendar writes already hold the workspace lock. The old interval is captured, not inferred later.
 await db.raw(`CREATE FUNCTION workflow_cancellation_source() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE people jsonb;source_jobs jsonb;made record;BEGIN
 IF OLD."workStartsAt" IS NULL OR OLD."workEndsAt" IS NULL OR OLD."scheduledDate" <= (now() AT TIME ZONE OLD."workTimezone")::date THEN RETURN NEW;END IF;
 IF NEW."workStartsAt" IS NOT DISTINCT FROM OLD."workStartsAt" AND NEW."workEndsAt" IS NOT DISTINCT FROM OLD."workEndsAt" AND EXISTS(SELECT 1 FROM "calendarVisitRecords" r WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND r."endedAt" IS NULL) THEN RETURN NEW;END IF;
 SELECT coalesce(jsonb_agg(DISTINCT j.id) FILTER(WHERE j.id IS NOT NULL),'[]'::jsonb) INTO source_jobs FROM "calendarVisitRecords" r LEFT JOIN "workOrders" wo ON wo."workspaceId"=r."workspaceId" AND wo.id=r."workOrderId" LEFT JOIN jobs j ON j."workspaceId"=r."workspaceId" AND j.id=coalesce(r."jobId",wo."jobId") WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND (r."endedAt" IS NULL OR r."endedAt">=transaction_timestamp());
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name) ORDER BY u.id),'[]'::jsonb) INTO people FROM users u WHERE u.id IN (
 SELECT j."primaryOwnerId" FROM "calendarVisitRecords" r JOIN jobs j ON j."workspaceId"=r."workspaceId" AND j.id=r."jobId" WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND (r."endedAt" IS NULL OR r."endedAt">=transaction_timestamp())
 UNION SELECT t."userId" FROM "calendarVisitRecords" r JOIN "jobTeamMembers" t ON t."workspaceId"=r."workspaceId" AND t."jobId"=r."jobId" WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND (r."endedAt" IS NULL OR r."endedAt">=transaction_timestamp())
 UNION SELECT wo."primaryAssigneeId" FROM "calendarVisitRecords" r JOIN "workOrders" wo ON wo."workspaceId"=r."workspaceId" AND wo.id=r."workOrderId" WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND (r."endedAt" IS NULL OR r."endedAt">=transaction_timestamp())
 UNION SELECT t."userId" FROM "calendarVisitRecords" r JOIN "workOrderCrew" t ON t."workspaceId"=r."workspaceId" AND t."workOrderId"=r."workOrderId" WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND (r."endedAt" IS NULL OR r."endedAt">=transaction_timestamp()));
 IF NEW."workStartsAt" IS NOT DISTINCT FROM OLD."workStartsAt" AND NEW."workEndsAt" IS NOT DISTINCT FROM OLD."workEndsAt" AND NOT EXISTS(SELECT 1 FROM "calendarVisitRecords" r LEFT JOIN jobs j ON j."workspaceId"=r."workspaceId" AND j.id=r."jobId" LEFT JOIN "workOrders" wo ON wo."workspaceId"=r."workspaceId" AND wo.id=r."workOrderId" WHERE r."workspaceId"=OLD."workspaceId" AND r."visitId"=OLD.id AND r."endedAt">=transaction_timestamp() AND (j.status='canceled' OR wo.status='canceled')) THEN RETURN NEW;END IF;
 IF jsonb_array_length(people)=0 THEN RETURN NEW;END IF;
 FOR made IN INSERT INTO "workflowCancellationOpenings" ("workspaceId","workflowId","workflowVersion","sourceVisitId","sourceVersion",date,timezone,"workTime","startsAt","endsAt",crew,"sourceJobIds")
 SELECT w."workspaceId",w.id,w.version,OLD.id,OLD.version,OLD."scheduledDate",OLD."workTimezone",OLD."workTime",OLD."workStartsAt",OLD."workEndsAt",people,source_jobs FROM workflows w
 WHERE w."workspaceId"=OLD."workspaceId" AND w.status='active' AND w."deletedAt" IS NULL AND w."publisherId" IS NOT NULL AND w.definition->>'kind'='cancellation_fill' AND now()>w."enrollAfter" AND w.definition->>'timezone'=OLD."workTimezone"
 AND EXISTS(SELECT 1 FROM jobs j WHERE j."workspaceId"=w."workspaceId" AND j."serviceId"=w."serviceId" AND source_jobs @> jsonb_build_array(j.id))
 AND EXISTS(SELECT 1 FROM "workspaceServices" c WHERE c."workspaceId"=w."workspaceId" AND c.id=w."serviceId" AND c."archivedAt" IS NULL)
 ON CONFLICT DO NOTHING RETURNING id,"workspaceId","workflowId" LOOP
 INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","openingId","dueAt",status) VALUES(gen_random_uuid(),made."workspaceId",made."workflowId",'cancellation',made.id,now(),'queued');END LOOP;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_cancellation_source AFTER UPDATE ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION workflow_cancellation_source()`);
}
  // 202611220002_workflow-service-due.ts
  {
 await db.raw(`INSERT INTO "workspaceRolePolicies" ("workspaceId",role,permission,scope) SELECT id,r,'customers.email.send','enabled' FROM workspaces CROSS JOIN unnest(ARRAY['owner','admin']) r ON CONFLICT DO NOTHING`);
 await db.raw(`UPDATE "workspacePolicies" SET revision=revision+1`);
 await db.schema.createTable('serviceDueCompletions',t=>{t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('customerId').notNullable();t.uuid('serviceId').notNullable();t.uuid('jobId').notNullable();t.uuid('activityId').notNullable();t.timestamp('completedAt',{useTz:true}).notNullable();t.primary(['workspaceId','customerId','serviceId']);for(const [col,table] of [['customerId','customers'],['serviceId','workspaceServices'],['jobId','jobs']])t.foreign(['workspaceId',col]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');});
 await db.schema.createTable('workflowServiceDueCycles',t=>{
  t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('workflowId').notNullable();t.uuid('customerId').notNullable();t.uuid('serviceId').notNullable();t.uuid('jobId').notNullable();t.uuid('activityId').notNullable();t.timestamp('completedAt',{useTz:true}).notNullable();t.date('dueDate').notNullable();t.date('reminderOn').notNullable();t.text('status').notNullable().defaultTo('due');t.integer('version').notNullable().defaultTo(1);t.timestamp('notifiedAt',{useTz:true});t.text('emailStatus');t.unique(['workspaceId','id']);t.unique(['workflowId','customerId','activityId']);
  for(const [col,table] of [['workflowId','workflows'],['customerId','customers'],['serviceId','workspaceServices'],['jobId','jobs']])t.foreign(['workspaceId',col]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
  t.check("status IN ('due','dismissed','superseded') AND version>0 AND (\"emailStatus\" IS NULL OR \"emailStatus\" IN ('queued','sent','failed'))");t.index(['workspaceId','workflowId','reminderOn']);
 });
 await db.schema.createTable('serviceOutreachCompany',t=>{t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');t.integer('version').notNullable().defaultTo(0);t.text('phone').notNullable().defaultTo('');t.text('email').notNullable().defaultTo('');});
 await db.schema.createTable('serviceOutreachPreferences',t=>{t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('customerId').notNullable();t.boolean('unsubscribed').notNullable().defaultTo(false);t.timestamp('updatedAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.primary(['workspaceId','customerId']);t.foreign(['workspaceId','customerId']).references(['workspaceId','id']).inTable('customers').onDelete('CASCADE');});
 await db.schema.createTable('serviceEmailTemplates',t=>{t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('serviceId').notNullable();t.integer('version').notNullable().defaultTo(1);t.text('subject').notNullable().defaultTo('Time for your next {Service}?');t.text('body').notNullable().defaultTo('Hi {First name},\n\nYour next {Service} is due around {Due date}. To arrange a visit, call {Company phone} or email {Company email}.\n\nThank you.');t.unique(['workspaceId','serviceId']);t.foreign(['workspaceId','serviceId']).references(['workspaceId','id']).inTable('workspaceServices').onDelete('CASCADE');});
 await db.schema.createTable('serviceEmailReviews',t=>{t.uuid('id').primary();t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('workflowId').notNullable();t.text('actorId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.integer('workflowVersion').notNullable();t.integer('companyVersion').notNullable();t.text('revision').notNullable();t.jsonb('review').notNullable();t.jsonb('tokens').notNullable();t.timestamp('expiresAt',{useTz:true}).notNullable();t.jsonb('result');t.unique(['workspaceId','id']);t.foreign(['workspaceId','workflowId']).references(['workspaceId','id']).inTable('workflows').onDelete('CASCADE');});
 await db.schema.createTable('serviceDueOperations',t=>{t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('requestId').notNullable();t.text('actorId').notNullable();t.text('hash').notNullable();t.jsonb('result').notNullable();t.primary(['workspaceId','requestId']);});
 for(const [table,customer] of [['workflowServiceDueNotifications',false],['serviceOutreachDeliveries',true]] as const)await db.schema.createTable(table,t=>{
  t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('workflowId').notNullable();t.integer('workflowVersion').notNullable();t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.text('emailStatus').notNullable();t.integer('attempts').notNullable().defaultTo(0);t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('sentAt',{useTz:true});t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
  t.foreign(['workspaceId','workflowId']).references(['workspaceId','id']).inTable('workflows').onDelete('CASCADE');t.unique(['workspaceId','id']);
  if(customer){t.uuid('cycleId').notNullable();t.integer('cycleVersion').notNullable();t.uuid('customerId').notNullable();t.uuid('reviewId').notNullable();t.text('address').notNullable();t.text('subject').notNullable();t.text('body').notNullable();t.text('replyTo').notNullable();t.text('unsubscribeHash').notNullable().unique();t.unique(['cycleId']);t.foreign(['workspaceId','cycleId']).references(['workspaceId','id']).inTable('workflowServiceDueCycles').onDelete('CASCADE');}
  else{t.uuid('stepId').notNullable().unique();t.integer('count').notNullable();t.boolean('inApp').notNullable();t.timestamp('readAt',{useTz:true});}
 });
 await db.raw(`CREATE INDEX service_completion_jobs ON jobs ("workspaceId","customerId","serviceId",status)`);
 await db.raw(`CREATE INDEX service_completion_activity ON "jobActivity" ("workspaceId","jobId","createdAt",id) WHERE type='status' AND changes->>'to'='completed'`);
 const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
 await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
 await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind" IN ('service_due','service_due_init') AND "openingId" IS NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "visitId" IS NULL) OR (${old}))`);
 await db.raw(`CREATE UNIQUE INDEX service_due_digest_once ON "workflowSteps" ("workflowId","visitDate") WHERE "recordKind"='service_due'`);
 await db.raw(`CREATE UNIQUE INDEX service_due_initializer ON "workflowSteps" ("workflowId") WHERE "recordKind"='service_due_init' AND status IN ('queued','held')`);
 await db.raw(`CREATE UNIQUE INDEX service_due_rule ON workflows ("workspaceId","serviceId") WHERE status='active' AND "deletedAt" IS NULL AND definition->>'kind'='service_due'`);
 const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;await db.raw(queue.replace("'booking','cancellation'","'booking','cancellation','service_due','service_due_init'"));
 await db.schema.alterTable('workflowQueueOutbox',t=>{for(const [column,table] of [['serviceDueNoticeId','workflowServiceDueNotifications'],['serviceOutreachId','serviceOutreachDeliveries']]){t.uuid(column).unique();t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');}});
 await db.raw('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind');
 const cols=['stepId','estimateNoticeId','leadNoticeId','briefingNoticeId','visitNoticeId','assignmentNoticeId','bookingNoticeId','cancellationNoticeId','serviceDueNoticeId','serviceOutreachId'],kinds=['step','estimate_email','lead_email','briefing_email','visit_email','assignment_email','booking_email','cancellation_email','service_due_notice_email','service_outreach_email'];
 await db.raw(`ALTER TABLE "workflowQueueOutbox" ADD CONSTRAINT workflow_outbox_kind CHECK(version>0 AND num_nonnulls(${cols.map(c=>'"'+c+'"').join(',')})=1 AND (${cols.map((c,i)=>`(kind='${kinds[i]}' AND "${c}" IS NOT NULL)`).join(' OR ')}))`);
 for(const [table,column,kind] of [['workflowServiceDueNotifications','serviceDueNoticeId','service_due_notice_email'],['serviceOutreachDeliveries','serviceOutreachId','service_outreach_email']]){
  await db.raw(`CREATE FUNCTION queue_${column.toLowerCase()}() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
   IF NEW."emailStatus"='queued' THEN INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,"${column}","availableAt") VALUES(NEW."workspaceId",'${kind}',NEW.id,NEW."nextAttemptAt") ON CONFLICT("${column}") DO UPDATE SET "availableAt"=EXCLUDED."availableAt","nextDispatchAt"=now(),"completedAt"=NULL,version="workflowQueueOutbox".version+1;PERFORM pg_notify('salesmora_workflow_queue','');
   ELSE UPDATE "workflowQueueOutbox" SET "completedAt"=now(),version=version+1 WHERE "${column}"=NEW.id AND "completedAt" IS NULL;END IF;RETURN NEW;END $$`);
  await db.raw(`CREATE TRIGGER queued_email AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "${table}" FOR EACH ROW EXECUTE FUNCTION queue_${column.toLowerCase()}()`);
 }
 await db.raw(`CREATE FUNCTION workflow_service_schedule(ws uuid,wid uuid,d date) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE w record;day date;due timestamptz;BEGIN
 SELECT * INTO w FROM workflows WHERE "workspaceId"=ws AND id=wid AND status='active' AND "deletedAt" IS NULL AND definition->>'kind'='service_due';IF NOT FOUND THEN RETURN;END IF;
 day:=greatest(d,(now() AT TIME ZONE (w.definition->>'timezone'))::date);due:=(day+(w.definition->>'localTime')::time) AT TIME ZONE (w.definition->>'timezone');
 IF due<=now() OR EXISTS(SELECT 1 FROM "workflowSteps" WHERE "workflowId"=wid AND "recordKind"='service_due' AND "visitDate"=day AND status NOT IN ('queued','held')) THEN day:=day+1;due:=(day+(w.definition->>'localTime')::time) AT TIME ZONE (w.definition->>'timezone');END IF;
 INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitDate","dueAt",status) VALUES(gen_random_uuid(),ws,wid,'service_due',day,due,'queued') ON CONFLICT ("workflowId","visitDate") WHERE "recordKind"='service_due' DO UPDATE SET status='queued',"dueAt"=EXCLUDED."dueAt" WHERE "workflowSteps".status='canceled';END $$`);
 await db.raw(`CREATE FUNCTION workflow_service_enroll(ws uuid,cust uuid,svc uuid) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE c record;w record;d date;BEGIN
 SELECT * INTO c FROM "serviceDueCompletions" WHERE "workspaceId"=ws AND "customerId"=cust AND "serviceId"=svc;

 IF c."activityId" IS NULL THEN RETURN;END IF;
 FOR w IN SELECT * FROM workflows WHERE "workspaceId"=ws AND "serviceId"=svc AND status='active' AND "deletedAt" IS NULL AND definition->>'kind'='service_due' AND c."completedAt">"enrollAfter" LOOP
 d:=((c."completedAt" AT TIME ZONE(w.definition->>'timezone'))::date+make_interval(months=>(w.definition->'rules'->>'intervalMonths')::int))::date;
 INSERT INTO "workflowServiceDueCycles" ("workspaceId","workflowId","customerId","serviceId","jobId","activityId","completedAt","dueDate","reminderOn") VALUES(ws,w.id,cust,svc,c."jobId",c."activityId",c."completedAt",d,d) ON CONFLICT DO NOTHING;
 PERFORM workflow_service_schedule(ws,w.id,d);END LOOP;END $$`);
 await db.raw(`CREATE FUNCTION workflow_service_sync(ws uuid,cust uuid,svc uuid) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE c record;w record;BEGIN
 IF cust IS NULL OR svc IS NULL THEN RETURN;END IF;
 SELECT j.id AS job,a.id AS activity,a."createdAt" AS completed INTO c FROM jobs j JOIN "jobActivity" a ON a."workspaceId"=j."workspaceId" AND a."jobId"=j.id AND a.type='status' AND a.changes->>'to'='completed' WHERE j."workspaceId"=ws AND j."customerId"=cust AND j."serviceId"=svc AND j.status='completed' ORDER BY a."createdAt" DESC,a.id DESC LIMIT 1;
 IF c.activity IS NULL THEN DELETE FROM "serviceDueCompletions" WHERE "workspaceId"=ws AND "customerId"=cust AND "serviceId"=svc;
 ELSE INSERT INTO "serviceDueCompletions" ("workspaceId","customerId","serviceId","jobId","activityId","completedAt") VALUES(ws,cust,svc,c.job,c.activity,c.completed) ON CONFLICT("workspaceId","customerId","serviceId") DO UPDATE SET "jobId"=EXCLUDED."jobId","activityId"=EXCLUDED."activityId","completedAt"=EXCLUDED."completedAt";END IF;
 PERFORM workflow_service_enroll(ws,cust,svc);
 FOR w IN SELECT DISTINCT "workflowId","reminderOn" FROM "workflowServiceDueCycles" WHERE "workspaceId"=ws AND "customerId"=cust AND "serviceId"=svc AND status='due' AND "notifiedAt" IS NULL LOOP PERFORM workflow_service_schedule(ws,w."workflowId",w."reminderOn");END LOOP;END $$`);
 await db.raw(`CREATE FUNCTION workflow_service_job_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF TG_TABLE_NAME='jobActivity' THEN IF NEW.type='status' THEN PERFORM workflow_service_sync(NEW."workspaceId",j."customerId",j."serviceId") FROM jobs j WHERE j."workspaceId"=NEW."workspaceId" AND j.id=NEW."jobId";END IF;
 ELSE IF TG_OP='UPDATE' AND (OLD."customerId" IS DISTINCT FROM NEW."customerId" OR OLD."serviceId" IS DISTINCT FROM NEW."serviceId") THEN PERFORM workflow_service_sync(OLD."workspaceId",OLD."customerId",OLD."serviceId");END IF;PERFORM workflow_service_sync(NEW."workspaceId",NEW."customerId",NEW."serviceId");END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_service_activity AFTER INSERT ON "jobActivity" FOR EACH ROW EXECUTE FUNCTION workflow_service_job_changed()`);
 await db.raw(`CREATE TRIGGER workflow_service_job AFTER INSERT OR UPDATE OF status,"serviceId","customerId","scheduledDate" ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_service_job_changed()`);
 await db.raw(`CREATE FUNCTION workflow_service_published() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW.definition->>'kind'='service_due' THEN
 INSERT INTO "serviceEmailTemplates" ("workspaceId","serviceId") VALUES(NEW."workspaceId",NEW."serviceId") ON CONFLICT DO NOTHING;
 IF TG_OP='INSERT' AND (NEW.definition->'rules'->>'includeExisting')::boolean THEN INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","dueAt",status) VALUES(gen_random_uuid(),NEW."workspaceId",NEW.id,'service_due_init',now(),'queued');END IF;
 END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_service_published AFTER INSERT ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_service_published()`);
}
  // 202611220003_service-email-subject.ts
  {
 await db.raw(`ALTER TABLE "serviceEmailTemplates" ALTER COLUMN subject SET DEFAULT ('Time for your next {Service}' || chr(63))`);
 await db('serviceEmailTemplates').where({subject:'Time for your next {Service}$1'}).update({subject:'Time for your next {Service}?',version:db.raw('version+1')});
}
  // 202611220004_service-due-reschedule.ts
  {
 const row=(await db.raw(`SELECT pg_get_functiondef('workflow_service_schedule(uuid,uuid,date)'::regprocedure) code`)).rows[0];
 await db.raw(row.code.replace("status NOT IN ('queued','held')","status IN ('completed','skipped')"));
}
  // 202611220005_workflow-completion-handoff.ts
  {
 await db.raw(`CREATE UNIQUE INDEX job_activity_workspace_identity ON "jobActivity" ("workspaceId",id)`);
 await db.schema.alterTable('workflowSteps',t=>{t.uuid('completionActivityId');t.foreign(['workspaceId','completionActivityId']).references(['workspaceId','id']).inTable('jobActivity').onDelete('CASCADE');});
 const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
 await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
 await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='handoff' AND "completionActivityId" IS NOT NULL AND "jobId" IS NOT NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "visitId" IS NULL AND "openingId" IS NULL) OR ("completionActivityId" IS NULL AND (${old})))`);
 await db.raw(`CREATE UNIQUE INDEX workflow_handoff_once ON "workflowSteps" ("workflowId","completionActivityId") WHERE "recordKind"='handoff'`);
 await db.raw(`CREATE INDEX workflow_handoff_pending ON "workflowSteps" ("workspaceId","jobId") WHERE "recordKind"='handoff' AND status IN ('queued','held')`);
 await db.raw(`CREATE INDEX workflow_handoff_orders ON "workOrders" ("workspaceId","jobId",id) WHERE "archivedAt" IS NULL AND status IN ('draft','issued','in-progress')`);
 const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
 if(!queue.includes("'service_due_init'"))throw Error('Workflow queue prerequisite missing');
 await db.raw(queue.replace("'service_due_init'","'service_due_init','handoff'"));
 await db.schema.createTable('workflowHandoffNotifications',t=>{
  t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');t.uuid('workflowId').notNullable();t.integer('workflowVersion').notNullable();t.uuid('stepId').notNullable().unique();t.uuid('jobId').notNullable();t.uuid('completionActivityId').notNullable();t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.jsonb('snapshot').notNullable();t.boolean('inApp').notNullable();t.timestamp('readAt',{useTz:true});t.text('emailStatus').notNullable();t.integer('attempts').notNullable().defaultTo(0);t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('sentAt',{useTz:true});t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.unique(['workspaceId','id']);
  for(const [col,table] of [['workflowId','workflows'],['stepId','workflowSteps'],['jobId','jobs'],['completionActivityId','jobActivity']])t.foreign(['workspaceId',col]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
  t.check(`"emailStatus" IN ('queued','sent','skipped','failed') AND attempts>=0 AND "workflowVersion">0`);t.index(['workspaceId','userId','readAt','createdAt']);t.index(['workspaceId','jobId']);
 });
 await db.schema.alterTable('workflowQueueOutbox',t=>{t.uuid('handoffNoticeId').unique();t.foreign(['workspaceId','handoffNoticeId']).references(['workspaceId','id']).inTable('workflowHandoffNotifications').onDelete('CASCADE');});
 await db.raw('ALTER TABLE "workflowQueueOutbox" DROP CONSTRAINT workflow_outbox_kind');
 const columns=['stepId','estimateNoticeId','leadNoticeId','briefingNoticeId','visitNoticeId','assignmentNoticeId','bookingNoticeId','cancellationNoticeId','serviceDueNoticeId','serviceOutreachId','handoffNoticeId'],kinds=['step','estimate_email','lead_email','briefing_email','visit_email','assignment_email','booking_email','cancellation_email','service_due_notice_email','service_outreach_email','handoff_email'];
 await db.raw(`ALTER TABLE "workflowQueueOutbox" ADD CONSTRAINT workflow_outbox_kind CHECK(version>0 AND num_nonnulls(${columns.map(c=>'"'+c+'"').join(',')})=1 AND (${columns.map((c,i)=>`(kind='${kinds[i]}' AND "${c}" IS NOT NULL)`).join(' OR ')}))`);
 await db.raw(`CREATE FUNCTION workflow_handoff_email_queue() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW."emailStatus"='queued' THEN INSERT INTO "workflowQueueOutbox" ("workspaceId",kind,"handoffNoticeId","availableAt") VALUES(NEW."workspaceId",'handoff_email',NEW.id,NEW."nextAttemptAt") ON CONFLICT("handoffNoticeId") DO UPDATE SET "availableAt"=EXCLUDED."availableAt","nextDispatchAt"=now(),"completedAt"=NULL,version="workflowQueueOutbox".version+1;PERFORM pg_notify('salesmora_workflow_queue','');
 ELSE UPDATE "workflowQueueOutbox" SET "completedAt"=now(),version=version+1 WHERE "handoffNoticeId"=NEW.id AND "completedAt" IS NULL;END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_handoff_email_queue AFTER INSERT OR UPDATE OF "emailStatus","nextAttemptAt" ON "workflowHandoffNotifications" FOR EACH ROW EXECUTE FUNCTION workflow_handoff_email_queue()`);
 await db.raw(`CREATE FUNCTION workflow_handoff_snapshot(ws uuid,jid uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
 SELECT jsonb_build_object('jobId',j.id,'jobNumber','J-'||lpad(j."jobNumber"::text,4,'0'),'jobTitle',j.title,'totalOpen',(SELECT count(*) FROM "workOrders" wo WHERE wo."workspaceId"=ws AND wo."jobId"=jid AND wo."archivedAt" IS NULL AND wo.status IN ('draft','issued','in-progress')),'workOrders',(SELECT coalesce(jsonb_agg(jsonb_build_object('number','WO-'||lpad(o."workOrderNumber"::text,4,'0'),'title',o.title,'status',o.status) ORDER BY o."workOrderNumber",o.id),'[]'::jsonb) FROM (SELECT id,"workOrderNumber",title,status FROM "workOrders" WHERE "workspaceId"=ws AND "jobId"=jid AND "archivedAt" IS NULL AND status IN ('draft','issued','in-progress') ORDER BY "workOrderNumber",id LIMIT 3) o)) FROM jobs j WHERE j."workspaceId"=ws AND j.id=jid AND j.status='completed' $$`);
 await db.raw(`CREATE FUNCTION workflow_handoff_recheck(ws uuid,jid uuid) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE current_snapshot jsonb;BEGIN
 current_snapshot:=workflow_handoff_snapshot(ws,jid);
 IF current_snapshot IS NULL OR (current_snapshot->>'totalOpen')::bigint=0 THEN
 UPDATE "workflowSteps" SET status='skipped' WHERE "workspaceId"=ws AND "jobId"=jid AND "recordKind"='handoff' AND status IN ('queued','held');
 UPDATE "workflowHandoffNotifications" SET "readAt"=coalesce("readAt",now()),"emailStatus"=CASE WHEN "emailStatus"='queued' THEN 'skipped' ELSE "emailStatus" END WHERE "workspaceId"=ws AND "jobId"=jid AND ("readAt" IS NULL OR "emailStatus"='queued');
 ELSE UPDATE "workflowHandoffNotifications" SET snapshot=current_snapshot WHERE "workspaceId"=ws AND "jobId"=jid AND "readAt" IS NULL AND snapshot IS DISTINCT FROM current_snapshot;END IF;END $$`);
 await db.raw(`CREATE FUNCTION workflow_handoff_completion() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW.type='status' AND NEW.changes->>'to'='completed' THEN
 INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","jobId","completionActivityId","triggeredAt","dueAt",status)
 SELECT gen_random_uuid(),w."workspaceId",w.id,'handoff',j.id,NEW.id,NEW."createdAt",now(),'queued' FROM workflows w JOIN jobs j ON j."workspaceId"=w."workspaceId" AND j.id=NEW."jobId" WHERE w."workspaceId"=NEW."workspaceId" AND w.status='active' AND w."deletedAt" IS NULL AND w.definition->>'kind'='completion_handoff' AND NEW."createdAt">w."enrollAfter" AND j.status='completed' AND EXISTS(SELECT 1 FROM "workOrders" wo WHERE wo."workspaceId"=j."workspaceId" AND wo."jobId"=j.id AND wo."archivedAt" IS NULL AND wo.status IN ('draft','issued','in-progress')) ON CONFLICT DO NOTHING;
 END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_handoff_completion AFTER INSERT ON "jobActivity" FOR EACH ROW EXECUTE FUNCTION workflow_handoff_completion()`);
 await db.raw(`CREATE FUNCTION workflow_handoff_source_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF TG_TABLE_NAME='jobs' THEN PERFORM workflow_handoff_recheck(NEW."workspaceId",NEW.id);
 ELSIF TG_OP='DELETE' THEN PERFORM workflow_handoff_recheck(OLD."workspaceId",OLD."jobId");RETURN OLD;
 ELSE PERFORM workflow_handoff_recheck(NEW."workspaceId",NEW."jobId");END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_handoff_job_changed AFTER UPDATE OF status ON jobs FOR EACH ROW WHEN(OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION workflow_handoff_source_changed()`);
 await db.raw(`CREATE TRIGGER workflow_handoff_order_changed AFTER UPDATE OF status,"archivedAt" OR DELETE ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_handoff_source_changed()`);
}
  // 202611220006_handoff-record-labels.ts
  {
 const row=(await db.raw(`SELECT pg_get_functiondef('workflow_handoff_snapshot(uuid,uuid)'::regprocedure) code`)).rows[0];
 await db.raw(row.code.replace(`lpad(j."jobNumber"::text,4,'0')`,`lpad(j."jobNumber"::text,greatest(4,length(j."jobNumber"::text)),'0')`).replace(`lpad(o."workOrderNumber"::text,4,'0')`,`lpad(o."workOrderNumber"::text,greatest(4,length(o."workOrderNumber"::text)),'0')`));
}
  // 202611220007_team-member-coverage.ts
  {
  await db.schema.createTable('workspaceMemberCoverage', table => {
    table.uuid('workspaceId').notNullable(); table.text('personId').notNullable();
    table.integer('version').notNullable(); table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'personId']);
    table.foreign(['workspaceId', 'personId']).references(['workspaceId', 'userId']).inTable('workspaceMemberships').onDelete('CASCADE');
    table.check('version > 0');
  });
  await db.schema.createTable('workspaceMemberPostalCodes', table => {
    table.uuid('workspaceId').notNullable(); table.text('personId').notNullable();
    table.text('countryCode').notNullable(); table.text('postalCode').notNullable();
    table.primary(['workspaceId', 'personId', 'countryCode', 'postalCode']);
    table.foreign(['workspaceId', 'personId']).references(['workspaceId', 'personId']).inTable('workspaceMemberCoverage').onDelete('CASCADE');
    table.index(['workspaceId', 'countryCode', 'postalCode', 'personId']);
    table.check('"countryCode" = \'US\' AND "postalCode" ~ \'^[0-9]{5}$\'');
  });
  await db.schema.createTable('teamSettingsOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('requestId').notNullable(); table.text('actorId').notNullable(); table.text('personId').notNullable();
    table.text('inputHash').notNullable(); table.jsonb('before').notNullable(); table.jsonb('result').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'requestId']); table.index(['workspaceId', 'personId', 'createdAt']);
  });
}
  // 202611230001_record-postal-codes.ts
  {
  for (const name of ['jobs', 'leads']) {
    await db.schema.alterTable(name, table => { table.text('postalCode'); table.text('countryCode'); });
    await db.raw(`ALTER TABLE ?? ADD CONSTRAINT ?? CHECK (("postalCode" IS NULL AND "countryCode" IS NULL) OR ("postalCode" IS NOT NULL AND "countryCode" IS NOT NULL AND "postalCode" ~ '^[0-9]{5}$' AND "countryCode"='US'))`, [name, `${name}_postal_country`]);
  }
  await db.raw(`CREATE INDEX jobs_postal_code ON jobs ("workspaceId","countryCode","postalCode") WHERE "postalCode" IS NOT NULL`);
  await db.raw(`CREATE INDEX leads_postal_code ON leads ("workspaceId","countryCode","postalCode") WHERE "postalCode" IS NOT NULL`);
}
  // 202611230002_smart-routing.ts
  {
  await db.schema.alterTable('workflows', table => { table.text('routingCursor'); });
  await db.schema.alterTable('workflowRoutingReceipts', table => { table.jsonb('routingDetails'); });
  await db.raw(`CREATE INDEX leads_owner_open_routing ON leads ("workspaceId","ownerId") WHERE "archivedAt" IS NULL AND stage IN ('new','contacted','estimate-sent')`);
  await db.raw(`CREATE FUNCTION workflow_zip_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    IF TG_TABLE_NAME='jobs' THEN
      IF (NEW."postalCode",NEW."countryCode") IS DISTINCT FROM (OLD."postalCode",OLD."countryCode") THEN PERFORM workflow_booking_recheck(NEW."workspaceId",ARRAY[]::text[],NEW.id); END IF;
    END IF;
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
  END $$`);
  await db.raw(`CREATE FUNCTION workflow_coverage_codes_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    UPDATE "workflowSteps" s SET "dueAt"=now(),"bookingAttemptId"=gen_random_uuid() FROM workflows w,jobs j
    WHERE w.id=s."workflowId" AND w."workspaceId"=s."workspaceId" AND w.status='active' AND w."deletedAt" IS NULL
      AND j.id=s."jobId" AND j."workspaceId"=s."workspaceId" AND j.status='needs-scheduling' AND j."scheduledDate" IS NULL
      AND s."recordKind"='booking' AND s.status='queued' AND s."dueAt">now() AND s."bookingResult"->>'status'='no_slot'
      AND s."bookingThrough">=(now() AT TIME ZONE (w.definition->>'timezone'))::date
      AND EXISTS(SELECT 1 FROM changed c WHERE c."workspaceId"=j."workspaceId" AND c."countryCode"=j."countryCode" AND c."postalCode"=j."postalCode"
        AND (j."primaryOwnerId"=c."personId" OR EXISTS(SELECT 1 FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id AND t."userId"=c."personId")
          OR (w.definition->>'assignmentMode'='qualified_if_unassigned' AND EXISTS(SELECT 1 FROM "serviceQualifiedWorkers" q WHERE q."workspaceId"=w."workspaceId" AND q."serviceId"=w."serviceId" AND q."personId"=c."personId"))));
    RETURN NULL;
  END $$`);
  for(const [event,version,suffix] of [['INSERT','NEW','insert'],['DELETE','OLD','delete'],['UPDATE','OLD','old'],['UPDATE','NEW','new']])
    await db.raw(`CREATE TRIGGER workflow_member_zip_${suffix} AFTER ${event} ON "workspaceMemberPostalCodes" REFERENCING ${version} TABLE AS changed FOR EACH STATEMENT EXECUTE FUNCTION workflow_coverage_codes_changed()`);
  await db.raw(`CREATE TRIGGER workflow_job_zip_changed AFTER UPDATE OF "postalCode","countryCode" ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_zip_changed()`);
  await db.raw(`CREATE FUNCTION workflow_routing_policy_changed() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.definition->>'kind'='lead_routing' AND (jsonb_path_query_array(NEW.definition,'$.routing.members[*].id'),NEW.definition->>'sourceId') IS DISTINCT FROM (jsonb_path_query_array(OLD.definition,'$.routing.members[*].id'),OLD.definition->>'sourceId') THEN NEW."routingCursor":=NULL; END IF; RETURN NEW;
  END $$`);
  await db.raw(`CREATE TRIGGER workflow_routing_policy_changed BEFORE UPDATE OF definition ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_routing_policy_changed()`);
}
  // 202611240001_annual-service-review.ts
  {
  await db.schema.alterTable('serviceEmailTemplates', t => { t.text('purpose').notNullable().defaultTo('repeat'); t.dropUnique(['workspaceId','serviceId']); t.unique(['workspaceId','serviceId','purpose']); t.check("purpose IN ('repeat','annual')", [], "service_email_template_purpose"); });
  await db.schema.alterTable('workflowServiceDueCycles', t => { t.date('reviewDate'); t.dropUnique(['workflowId','customerId','activityId']); });
  await db.raw(`CREATE UNIQUE INDEX service_repeat_cycle_once ON "workflowServiceDueCycles" ("workflowId","customerId","activityId") WHERE "reviewDate" IS NULL`);
  await db.raw(`CREATE UNIQUE INDEX service_annual_customer_once ON "workflowServiceDueCycles" ("workflowId","customerId","reviewDate") WHERE "reviewDate" IS NOT NULL`);
  await db.raw(`CREATE INDEX service_annual_review_rows ON "workflowServiceDueCycles" ("workspaceId","workflowId","reviewDate") WHERE "reviewDate" IS NOT NULL`);
  await db.raw(`CREATE UNIQUE INDEX service_annual_rule ON workflows ("workspaceId","serviceId",right(definition->'rules'->>'firstReviewDate',5)) WHERE status='active' AND "deletedAt" IS NULL AND definition->>'kind'='annual_service_review'`);
  const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
  await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
  await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='annual_review' AND "openingId" IS NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "visitId" IS NULL AND "visitDate" IS NOT NULL AND "triggeredAt" IS NOT NULL) OR (${old}))`);
  await db.raw(`CREATE UNIQUE INDEX annual_review_one_pending ON "workflowSteps" ("workflowId") WHERE "recordKind"='annual_review' AND status IN ('queued','held')`);
  const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
  if(!queue.includes("'service_due_init'"))throw Error('Expected service queue adapter.');
  await db.raw(queue.replace("'service_due_init'","'service_due_init','annual_review'"));
  const snooze=(await db.raw(`SELECT pg_get_functiondef('workflow_service_schedule(uuid,uuid,date)'::regprocedure) code`)).rows[0].code;
  await db.raw(snooze.replace("definition->>'kind'='service_due'","definition->>'kind' IN ('service_due','annual_service_review')"));
  // A local wall clock must identify exactly one instant. Never silently shift a review on a clock change.
  await db.raw(`CREATE FUNCTION workflow_annual_instant(d date,t time,zone text) RETURNS timestamptz LANGUAGE sql STABLE AS $$
    WITH candidate AS (SELECT (d+t) AT TIME ZONE zone AS at), matches AS (
      SELECT x FROM candidate, LATERAL generate_series(at-interval '2 hours',at+interval '2 hours',interval '15 minutes') x WHERE x AT TIME ZONE zone=d+t)
    SELECT CASE WHEN count(*)=1 THEN min(x) END FROM matches $$`);
  await db.raw(`CREATE FUNCTION workflow_annual_schedule(ws uuid,wid uuid) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE w record;first_day date;d date;due timestamptz;y int;BEGIN
    SELECT * INTO w FROM workflows WHERE "workspaceId"=ws AND id=wid AND status='active' AND "deletedAt" IS NULL AND definition->>'kind'='annual_service_review'; IF NOT FOUND THEN RETURN;END IF;
    IF EXISTS(SELECT 1 FROM "workflowSteps" WHERE "workspaceId"=ws AND "workflowId"=wid AND "recordKind"='annual_review' AND status IN ('queued','held')) THEN RETURN;END IF;
    first_day:=(w.definition->'rules'->>'firstReviewDate')::date;
    FOR y IN greatest(extract(year FROM first_day)::int,extract(year FROM now() AT TIME ZONE(w.definition->>'timezone'))::int)..9999 LOOP
      BEGIN d:=make_date(y,extract(month FROM first_day)::int,extract(day FROM first_day)::int);EXCEPTION WHEN datetime_field_overflow THEN CONTINUE;END;
      due:=workflow_annual_instant(d,(w.definition->>'localTime')::time,w.definition->>'timezone');
      IF due IS NULL THEN UPDATE workflows SET "executionIssue"='An annual review falls on a clock change. Choose another send time.' WHERE id=wid AND "workspaceId"=ws;CONTINUE;END IF;
      IF due<=now() OR EXISTS(SELECT 1 FROM "workflowSteps" WHERE "workflowId"=wid AND "recordKind"='annual_review' AND "visitDate"=d AND status IN ('completed','skipped')) THEN CONTINUE;END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitDate","dueAt","triggeredAt",status) VALUES(gen_random_uuid(),ws,wid,'annual_review',d,due,due,'queued');RETURN;
    END LOOP;END $$`);
  await db.raw(`CREATE FUNCTION workflow_annual_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
    IF TG_TABLE_NAME='workflows' THEN
      IF NEW.definition->>'kind'<>'annual_service_review' THEN RETURN NEW;END IF;
      INSERT INTO "serviceEmailTemplates" ("workspaceId","serviceId",purpose,subject,body) VALUES(NEW."workspaceId",NEW."serviceId",'annual','Planning your {Service}'||chr(63),'Hi {First name},'||chr(10)||chr(10)||'We are planning upcoming {Service} visits. To arrange yours, call {Company phone} or email {Company email}.'||chr(10)||chr(10)||'Thank you.') ON CONFLICT DO NOTHING;
      IF TG_OP='UPDATE' AND (OLD.definition->'rules',OLD.definition->>'localTime',OLD.definition->>'timezone',OLD."serviceId") IS DISTINCT FROM (NEW.definition->'rules',NEW.definition->>'localTime',NEW.definition->>'timezone',NEW."serviceId") THEN
        UPDATE "workflowSteps" SET status='canceled' WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "recordKind" IN ('annual_review','service_due') AND status IN ('queued','held');
        IF OLD."serviceId" IS DISTINCT FROM NEW."serviceId" THEN UPDATE "workflowServiceDueCycles" SET status='superseded',version=version+1 WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id; END IF;
      END IF;
      IF NEW.status='active' THEN
        UPDATE "workflowSteps" SET status='canceled' WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "recordKind"='annual_review' AND status='held' AND "triggeredAt"<=now();
        PERFORM workflow_annual_schedule(NEW."workspaceId",NEW.id);
      END IF;
    ELSIF NEW."recordKind"='annual_review' AND NEW.status IN ('completed','skipped') AND OLD.status IS DISTINCT FROM NEW.status THEN PERFORM workflow_annual_schedule(NEW."workspaceId",NEW."workflowId");END IF;
    RETURN NEW;END $$`);
  await db.raw(`CREATE TRIGGER workflow_annual_changed AFTER INSERT OR UPDATE OF definition,status ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_annual_changed()`);
  await db.raw(`CREATE TRIGGER workflow_annual_completed AFTER UPDATE OF status ON "workflowSteps" FOR EACH ROW EXECUTE FUNCTION workflow_annual_changed()`);
}
  // 202611240002_customer-visit-reminders.ts
  {
  await db.raw(`CREATE UNIQUE INDEX customer_visit_one_rule ON workflows ("workspaceId") WHERE status IN ('active','paused') AND "deletedAt" IS NULL AND definition->>'kind'='customer_visit_reminder'`);
  await db.schema.createTable('customerVisitReminderPreferences', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('customerId').notNullable();
    t.boolean('disabled').notNullable().defaultTo(false); t.primary(['workspaceId','customerId']);
    t.foreign(['workspaceId','customerId']).references(['workspaceId','id']).inTable('customers').onDelete('CASCADE');
  });
  await db.schema.createTable('customerVisitReminderDeliveries', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable(); t.uuid('workflowId').notNullable(); t.uuid('visitId').notNullable(); t.date('visitDate').notNullable(); t.uuid('customerId').notNullable();
    for(const [column,table] of [['workflowId','workflows'],['visitId','calendarVisits'],['customerId','customers']])t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
    t.text('status').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0); t.text('address');t.text('payloadHash');t.text('unsubscribeHash').notNullable().unique();t.text('token').notNullable();
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now()); t.timestamp('sentAt',{useTz:true});t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.unique(['workspaceId','visitId','visitDate','customerId']); t.index(['workspaceId','workflowId','visitId','visitDate','status']);
    t.check("status IN ('queued','sent','skipped','failed') AND attempts BETWEEN 0 AND 5");
  });
  const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
  await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
  await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='customer_visit' AND "visitId" IS NOT NULL AND "visitDate" IS NOT NULL AND "triggeredAt" IS NOT NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "openingId" IS NULL) OR ("recordKind"='customer_visit_init' AND "visitId" IS NULL AND "visitDate" IS NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "openingId" IS NULL) OR (${old}))`);
  await db.raw(`CREATE UNIQUE INDEX customer_visit_one_initializer ON "workflowSteps" ("workflowId") WHERE "recordKind"='customer_visit_init' AND status IN ('queued','held')`);
  const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
  if(!queue.includes("'annual_review'"))throw Error('Expected annual queue adapter.');
  await db.raw(queue.replace("'annual_review'","'annual_review','customer_visit','customer_visit_init'"));
  await db.raw(`CREATE FUNCTION workflow_customer_visit_customers(ws uuid,visit uuid) RETURNS TABLE("customerId" uuid) LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
    SELECT DISTINCT j."customerId" FROM "calendarVisitRecords" r JOIN jobs j ON j."workspaceId"=ws AND j.id=r."jobId"
      WHERE r."workspaceId"=ws AND r."visitId"=visit AND r."endedAt" IS NULL AND j.status NOT IN ('completed','canceled')
    UNION
    SELECT DISTINCT j."customerId" FROM "calendarVisitRecords" r JOIN "workOrders" o ON o."workspaceId"=ws AND o.id=r."workOrderId" JOIN jobs j ON j."workspaceId"=ws AND j.id=o."jobId"
      WHERE r."workspaceId"=ws AND r."visitId"=visit AND r."endedAt" IS NULL AND o."archivedAt" IS NULL AND o.status NOT IN ('completed','canceled') AND j.status NOT IN ('completed','canceled') $$`);
  await db.raw(`CREATE FUNCTION workflow_customer_visit_sync(ws uuid,visit uuid,only_workflow uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE vdate date;w record;due timestamptz;BEGIN
    IF NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND status IN ('active','paused') AND definition->>'kind'='customer_visit_reminder') THEN RETURN;END IF;
    SELECT "scheduledDate" INTO vdate FROM "calendarVisits" WHERE "workspaceId"=ws AND id=visit;
    UPDATE "workflowSteps" s SET status='canceled' WHERE s."workspaceId"=ws AND s."visitId"=visit AND s."recordKind"='customer_visit' AND s.status IN ('queued','held') AND (only_workflow IS NULL OR s."workflowId"=only_workflow) AND (vdate IS NULL OR s."visitDate" IS DISTINCT FROM vdate OR NOT EXISTS(SELECT 1 FROM workflow_customer_visit_customers(ws,visit)));
    IF vdate IS NULL OR NOT EXISTS(SELECT 1 FROM workflow_customer_visit_customers(ws,visit)) THEN RETURN;END IF;
    FOR w IN SELECT * FROM workflows WHERE "workspaceId"=ws AND status='active' AND "publisherId" IS NOT NULL AND "deletedAt" IS NULL AND definition->>'kind'='customer_visit_reminder' AND (only_workflow IS NULL OR id=only_workflow) LOOP
      due:=workflow_annual_instant(vdate-1,(w.definition->>'localTime')::time,w.definition->>'timezone');
      IF due IS NULL THEN UPDATE workflows SET "executionIssue"='A reminder falls on a clock change. Choose another send time.' WHERE "workspaceId"=ws AND id=w.id;CONTINUE;END IF;
      IF due<=now() THEN CONTINUE;END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitId","visitDate","dueAt","triggeredAt",status) VALUES(gen_random_uuid(),ws,w.id,'customer_visit',visit,vdate,due,due,'queued')
        ON CONFLICT ("workflowId","visitId","visitDate") DO UPDATE SET status='queued',"dueAt"=EXCLUDED."dueAt","triggeredAt"=EXCLUDED."triggeredAt", "cursorId"=NULL
        WHERE "workflowSteps".status IN ('canceled','skipped') OR ("workflowSteps".status IN ('queued','held') AND "workflowSteps"."triggeredAt" IS DISTINCT FROM EXCLUDED."triggeredAt");
    END LOOP;END $$`);
  await db.raw(`CREATE FUNCTION workflow_customer_visit_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE ws uuid;v record;BEGIN
    ws:=CASE WHEN TG_OP='DELETE' THEN OLD."workspaceId" ELSE NEW."workspaceId" END;
    IF TG_TABLE_NAME<>'workflows' AND NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND status IN ('active','paused') AND definition->>'kind'='customer_visit_reminder') THEN IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;END IF;
    IF TG_TABLE_NAME='workflows' THEN
      IF NEW.definition->>'kind'<>'customer_visit_reminder' THEN RETURN NEW;END IF;
      IF TG_OP='UPDATE' AND (OLD.definition->>'localTime',OLD.definition->>'timezone') IS DISTINCT FROM (NEW.definition->>'localTime',NEW.definition->>'timezone') THEN
        UPDATE "workflowSteps" SET status='canceled' WHERE "workspaceId"=ws AND "workflowId"=NEW.id AND "recordKind"='customer_visit' AND status IN ('queued','held');END IF;
      IF NEW.status='active' AND NEW."deletedAt" IS NULL THEN INSERT INTO "workflowSteps"(id,"workspaceId","workflowId","recordKind","dueAt",status) VALUES(gen_random_uuid(),ws,NEW.id,'customer_visit_init',now(),'queued') ON CONFLICT DO NOTHING;END IF;
    ELSIF TG_TABLE_NAME='calendarVisits' THEN PERFORM workflow_customer_visit_sync(ws,NEW.id);
    ELSIF TG_TABLE_NAME='calendarVisitRecords' THEN
      IF TG_OP<>'INSERT' THEN PERFORM workflow_customer_visit_sync(ws,OLD."visitId");END IF;
      IF TG_OP<>'DELETE' THEN PERFORM workflow_customer_visit_sync(ws,NEW."visitId");END IF;
    ELSE
      FOR v IN SELECT DISTINCT r."visitId" FROM "calendarVisitRecords" r LEFT JOIN "workOrders" o ON o."workspaceId"=ws AND o.id=r."workOrderId"
        WHERE r."workspaceId"=ws AND r."endedAt" IS NULL AND CASE WHEN TG_TABLE_NAME='jobs' THEN r."jobId"=NEW.id OR o."jobId"=NEW.id ELSE r."workOrderId"=NEW.id END LOOP
        PERFORM workflow_customer_visit_sync(ws,v."visitId");END LOOP;
    END IF;IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;END $$`);
  await db.raw(`CREATE TRIGGER customer_visit_workflow AFTER INSERT OR UPDATE OF definition,status ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_customer_visit_changed()`);
  await db.raw(`CREATE TRIGGER customer_visit_schedule AFTER INSERT OR UPDATE OF "scheduledDate","arrivalWindow" ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION workflow_customer_visit_changed()`);
  await db.raw(`CREATE TRIGGER customer_visit_records AFTER INSERT OR UPDATE OR DELETE ON "calendarVisitRecords" FOR EACH ROW EXECUTE FUNCTION workflow_customer_visit_changed()`);
  await db.raw(`CREATE TRIGGER customer_visit_job AFTER UPDATE OF status,"customerId" ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_customer_visit_changed()`);
  await db.raw(`CREATE TRIGGER customer_visit_order AFTER UPDATE OF status,"archivedAt","jobId" ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_customer_visit_changed()`);
}
  // 202611240003_assigned-lead-cold.ts
  {
 await db.schema.alterTable('workflowSteps',t=>{t.text('coldOwnerId');});
 await db.schema.alterTable('leadWorkflowNotifications',t=>{t.timestamp('activityAt',{useTz:true});t.text('ownerId');t.integer('workflowVersion');t.integer('businessDays');t.dropUnique(['workspaceId','workflowId','leadId','userId']);});
 await db.raw(`CREATE UNIQUE INDEX unassigned_lead_notice_once ON "leadWorkflowNotifications" ("workspaceId","workflowId","leadId","userId") WHERE "activityAt" IS NULL`);
 await db.raw(`CREATE UNIQUE INDEX cold_lead_notice_once ON "leadWorkflowNotifications" ("workspaceId","workflowId","leadId","activityAt","ownerId") WHERE "activityAt" IS NOT NULL`);
 const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
 await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
 await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='cold_lead' AND "leadId" IS NOT NULL AND "coldOwnerId" IS NOT NULL AND "triggeredAt" IS NOT NULL AND "estimateId" IS NULL AND "jobId" IS NULL AND "visitId" IS NULL AND "openingId" IS NULL) OR ("recordKind"='cold_lead_init' AND "leadId" IS NULL AND "estimateId" IS NULL AND "jobId" IS NULL AND "visitId" IS NULL AND "openingId" IS NULL) OR (${old}))`);
 await db.raw(`CREATE UNIQUE INDEX cold_lead_one_initializer ON "workflowSteps" ("workflowId") WHERE "recordKind"='cold_lead_init' AND status IN ('queued','held')`);
 await db.raw(`CREATE INDEX cold_lead_enrollment ON leads ("workspaceId",id) WHERE "ownerId" IS NOT NULL AND "archivedAt" IS NULL AND stage IN ('new','contacted','estimate-sent')`);
 const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
 if(!queue.includes("'customer_visit_init'"))throw Error('Expected customer visit queue adapter.');
 await db.raw(queue.replace("'customer_visit_init'","'customer_visit_init','cold_lead_init'"));
 await db.raw(`CREATE FUNCTION workflow_cold_lead_sync(ws uuid,lead uuid,only_workflow uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
 DECLARE l record;w record;due timestamptz;eligible boolean;BEGIN
 IF NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND status IN ('active','paused') AND definition->>'kind'='assigned_lead_cold') THEN RETURN;END IF;
 SELECT * INTO l FROM leads WHERE "workspaceId"=ws AND id=lead;
 eligible:=FOUND AND l."archivedAt" IS NULL AND l.stage IN ('new','contacted','estimate-sent') AND EXISTS(SELECT 1 FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=ws AND m."userId"=l."ownerId" AND u."suspendedAt" IS NULL AND u."deletionRequestedAt" IS NULL);
 UPDATE "workflowSteps" s SET status='canceled' WHERE s."workspaceId"=ws AND s."leadId"=lead AND s."recordKind"='cold_lead' AND s.status IN ('queued','held') AND (only_workflow IS NULL OR s."workflowId"=only_workflow) AND (NOT eligible OR s."triggeredAt" IS DISTINCT FROM l."lastActivityAt" OR s."coldOwnerId" IS DISTINCT FROM l."ownerId");
 IF NOT eligible THEN RETURN;END IF;
 FOR w IN SELECT * FROM workflows WHERE "workspaceId"=ws AND status='active' AND "deletedAt" IS NULL AND "publisherId" IS NOT NULL AND definition->>'kind'='assigned_lead_cold' AND (only_workflow IS NULL OR id=only_workflow) LOOP
   due:=workflow_reminder_due(greatest(l."lastActivityAt",w."enrollAfter"),(w.definition->>'businessDays')::int,(w.definition->>'localTime')::time,w.definition->>'timezone');
   INSERT INTO "workflowSteps"(id,"workspaceId","workflowId","recordKind","leadId","coldOwnerId","triggeredAt","dueAt",status) VALUES(gen_random_uuid(),ws,w.id,'cold_lead',lead,l."ownerId",l."lastActivityAt",due,'queued')
   ON CONFLICT ("workflowId","leadId") DO UPDATE SET status='queued',"coldOwnerId"=EXCLUDED."coldOwnerId","triggeredAt"=EXCLUDED."triggeredAt","dueAt"=EXCLUDED."dueAt"
   WHERE "workflowSteps"."triggeredAt" IS DISTINCT FROM EXCLUDED."triggeredAt" OR "workflowSteps"."coldOwnerId" IS DISTINCT FROM EXCLUDED."coldOwnerId" OR ("workflowSteps".status IN ('queued','held','canceled','skipped') AND NOT EXISTS(SELECT 1 FROM "leadWorkflowNotifications" n WHERE n."workspaceId"=ws AND n."workflowId"=w.id AND n."leadId"=lead AND n."activityAt"=l."lastActivityAt" AND n."ownerId"=l."ownerId"));
 END LOOP;END $$`);
 await db.raw(`CREATE FUNCTION workflow_cold_lead_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF TG_TABLE_NAME='leads' THEN PERFORM workflow_cold_lead_sync(NEW."workspaceId",NEW.id);
 ELSIF NEW.definition->>'kind'='assigned_lead_cold' AND NEW.status='active' AND NEW."deletedAt" IS NULL THEN
  UPDATE "workflowSteps" SET status='queued',"cursorId"=NULL,"dueAt"=now() WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "recordKind"='cold_lead_init' AND status IN ('queued','held');
  INSERT INTO "workflowSteps"(id,"workspaceId","workflowId","recordKind","dueAt",status) VALUES(gen_random_uuid(),NEW."workspaceId",NEW.id,'cold_lead_init',now(),'queued') ON CONFLICT DO NOTHING;
 END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER workflow_cold_lead_source AFTER INSERT OR UPDATE OF "ownerId","lastActivityAt",stage,"archivedAt" ON leads FOR EACH ROW EXECUTE FUNCTION workflow_cold_lead_changed()`);
 await db.raw(`CREATE TRIGGER workflow_cold_lead_published AFTER INSERT OR UPDATE OF definition,status ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_cold_lead_changed()`);
}
  // 202611250001_post-job-thank-you.ts
  {
  await db.raw(`CREATE UNIQUE INDEX post_job_one_rule ON workflows ("workspaceId") WHERE status IN ('active','paused') AND "deletedAt" IS NULL AND definition->>'kind'='post_job_thank_you'`);
  await db.schema.createTable('postJobPeriods', t => {
    t.uuid('workspaceId').notNullable(); t.uuid('workflowId').notNullable(); t.uuid('jobId').notNullable();
    t.boolean('finished').notNullable(); t.timestamp('readyAt', {useTz:true}); t.primary(['workspaceId','workflowId','jobId']);
    for (const [column, table] of [['workflowId','workflows'],['jobId','jobs']]) t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
  });
  await db.schema.createTable('postJobPreferences', t => {
    t.uuid('workspaceId').notNullable(); t.uuid('customerId').notNullable(); t.boolean('disabled').notNullable().defaultTo(false);
    t.timestamp('lastReviewAt',{useTz:true}); t.primary(['workspaceId','customerId']);
    t.foreign(['workspaceId','customerId']).references(['workspaceId','id']).inTable('customers').onDelete('CASCADE');
  });
  await db.schema.createTable('postJobDeliveries', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable(); t.uuid('workflowId').notNullable(); t.uuid('jobId').notNullable(); t.uuid('customerId').notNullable();
    for (const [column, table] of [['workflowId','workflows'],['jobId','jobs'],['customerId','customers']]) t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
    t.text('status').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.text('token').notNullable(); t.text('unsubscribeHash').notNullable().unique(); t.text('payloadHash'); t.boolean('includeReview');
    t.timestamp('sentAt',{useTz:true}); t.timestamp('nextAttemptAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.unique(['workspaceId','jobId','customerId']); t.index(['workspaceId','customerId','status']);
    t.check("status IN ('queued','sent','skipped','failed') AND attempts BETWEEN 0 AND 5");
  });
  await db.schema.createTable('postJobNotifications', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable(); t.uuid('workflowId').notNullable(); t.uuid('stepId').notNullable().unique(); t.uuid('jobId').notNullable();
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE'); t.text('reason').notNullable();
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now()); t.timestamp('readAt',{useTz:true});
    for (const [column, table] of [['workflowId','workflows'],['stepId','workflowSteps'],['jobId','jobs']]) t.foreign(['workspaceId',column]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
    t.index(['workspaceId','userId','readAt','createdAt']);
  });
  const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
  await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
  await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='post_job' AND "jobId" IS NOT NULL AND "triggeredAt" IS NOT NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "visitId" IS NULL AND "openingId" IS NULL AND "completionActivityId" IS NULL) OR (${old}))`);
  await db.raw(`CREATE UNIQUE INDEX post_job_period_step ON "workflowSteps" ("workflowId","jobId","triggeredAt") WHERE "recordKind"='post_job'`);
  await db.raw(`CREATE INDEX post_job_pending ON "workflowSteps" ("workspaceId","workflowId","jobId") WHERE "recordKind"='post_job' AND status IN ('queued','held')`);
  const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
  if(!queue.includes("'customer_visit'"))throw Error('Expected customer visit queue adapter.');
  await db.raw(queue.replace("'customer_visit'","'customer_visit','post_job'"));
  await db.raw(`CREATE FUNCTION workflow_post_job_finished(ws uuid,jid uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
    SELECT EXISTS(SELECT 1 FROM jobs j WHERE j."workspaceId"=ws AND j.id=jid AND j.status='completed'
      AND NOT EXISTS(SELECT 1 FROM "workOrders" o WHERE o."workspaceId"=ws AND o."jobId"=jid AND o."archivedAt" IS NULL AND o.status NOT IN ('completed','canceled'))) $$`);
  await db.raw(`CREATE FUNCTION workflow_post_job_sync(ws uuid,jid uuid,admit boolean DEFAULT true) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE w record;p record;finished boolean;anchor timestamptz;due timestamptz;BEGIN
    IF jid IS NULL THEN RETURN;END IF;
    IF NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND definition->>'kind'='post_job_thank_you' AND status IN ('active','paused') AND "deletedAt" IS NULL) THEN RETURN;END IF;
    finished:=workflow_post_job_finished(ws,jid);
    FOR w IN SELECT * FROM workflows WHERE "workspaceId"=ws AND definition->>'kind'='post_job_thank_you' AND status IN ('active','paused') AND "deletedAt" IS NULL LOOP
      SELECT * INTO p FROM "postJobPeriods" WHERE "workspaceId"=ws AND "workflowId"=w.id AND "jobId"=jid FOR UPDATE;
      anchor:=p."readyAt";
      IF NOT finished THEN anchor:=NULL;
      ELSIF (p."jobId" IS NULL OR NOT p.finished) THEN anchor:=CASE WHEN admit AND w.status='active' THEN clock_timestamp() ELSE NULL END;END IF;
      INSERT INTO "postJobPeriods" ("workspaceId","workflowId","jobId",finished,"readyAt") VALUES(ws,w.id,jid,finished,anchor)
        ON CONFLICT ("workspaceId","workflowId","jobId") DO UPDATE SET finished=EXCLUDED.finished,"readyAt"=EXCLUDED."readyAt";
      UPDATE "workflowSteps" SET status='canceled' WHERE "workspaceId"=ws AND "workflowId"=w.id AND "jobId"=jid AND "recordKind"='post_job' AND status IN ('queued','held') AND (anchor IS NULL OR "triggeredAt" IS DISTINCT FROM anchor);
      IF anchor IS NULL OR w.status<>'active' THEN CONTINUE;END IF;
      due:=workflow_annual_instant((anchor AT TIME ZONE (w.definition->>'timezone'))::date+(w.definition->'rules'->>'calendarDays')::int,(w.definition->>'localTime')::time,w.definition->>'timezone');
      IF due IS NULL THEN UPDATE workflows SET "executionIssue"='A thank-you falls on a clock change. Choose another send time.' WHERE "workspaceId"=ws AND id=w.id;CONTINUE;END IF;
      INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","jobId","triggeredAt","dueAt",status) VALUES(gen_random_uuid(),ws,w.id,'post_job',jid,anchor,due,'queued')
        ON CONFLICT ("workflowId","jobId","triggeredAt") WHERE "recordKind"='post_job' DO UPDATE SET "dueAt"=EXCLUDED."dueAt" WHERE "workflowSteps".status IN ('queued','held');
    END LOOP;END $$`);
  await db.raw(`CREATE FUNCTION workflow_post_job_changed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
    DECLARE p record;BEGIN
    IF TG_TABLE_NAME='workflows' THEN
      IF NEW.definition->>'kind'='post_job_thank_you' AND NEW.status='active' AND OLD.definition IS DISTINCT FROM NEW.definition THEN
        FOR p IN SELECT DISTINCT "jobId" FROM "workflowSteps" WHERE "workspaceId"=NEW."workspaceId" AND "workflowId"=NEW.id AND "recordKind"='post_job' AND status IN ('queued','held') LOOP PERFORM workflow_post_job_sync(NEW."workspaceId",p."jobId",false);END LOOP;
      END IF;RETURN NEW;
    ELSIF TG_TABLE_NAME='jobs' THEN
      IF TG_OP='INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN PERFORM workflow_post_job_sync(NEW."workspaceId",NEW.id);END IF;RETURN NEW;
    ELSE
      IF TG_OP<>'INSERT' THEN PERFORM workflow_post_job_sync(OLD."workspaceId",OLD."jobId",TG_OP='DELETE' OR OLD.status NOT IN ('completed','canceled'));END IF;
      IF TG_OP<>'DELETE' THEN PERFORM workflow_post_job_sync(NEW."workspaceId",NEW."jobId",TG_OP<>'INSERT' AND OLD.status NOT IN ('completed','canceled'));RETURN NEW;END IF;
      RETURN OLD;
    END IF;END $$`);
  await db.raw(`CREATE TRIGGER post_job_status AFTER INSERT OR UPDATE OF status ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_post_job_changed()`);
  await db.raw(`CREATE TRIGGER post_job_work AFTER INSERT OR DELETE OR UPDATE OF status,"archivedAt","jobId" ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_post_job_changed()`);
  await db.raw(`CREATE TRIGGER post_job_settings AFTER UPDATE OF definition ON workflows FOR EACH ROW EXECUTE FUNCTION workflow_post_job_changed()`);
}
  // 202611250002_customer-schedule-changes.ts
  {
 await db.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
 await db.raw(`CREATE UNIQUE INDEX schedule_change_one_rule ON workflows ("workspaceId") WHERE status IN ('active','paused') AND "deletedAt" IS NULL AND definition->>'kind'='customer_schedule_change'`);
 await db.schema.createTable('customerSchedulePreferences',t=>{t.uuid('workspaceId').notNullable();t.uuid('customerId').notNullable();t.boolean('disabled').notNullable().defaultTo(false);t.primary(['workspaceId','customerId']);t.foreign(['workspaceId','customerId']).references(['workspaceId','id']).inTable('customers').onDelete('CASCADE');});
 await db.schema.createTable('customerScheduleDirty',t=>{t.uuid('workspaceId').notNullable();t.uuid('visitId').notNullable();t.jsonb('before').notNullable();t.primary(['workspaceId','visitId']);t.foreign(['workspaceId','visitId']).references(['workspaceId','id']).inTable('calendarVisits').onDelete('CASCADE');});
 await db.schema.createTable('customerScheduleNotices',t=>{
  t.uuid('id').primary();t.uuid('workspaceId').notNullable();t.uuid('workflowId').notNullable();t.uuid('visitId').notNullable();t.uuid('customerId').notNullable();t.jsonb('before').notNullable();t.jsonb('after');t.jsonb('sourceRefs').notNullable();t.text('sourceIssue');
  for(const [col,table] of [['workflowId','workflows'],['visitId','calendarVisits'],['customerId','customers']])t.foreign(['workspaceId',col]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');
  t.text('status').notNullable().defaultTo('queued');t.integer('version').notNullable().defaultTo(1);t.timestamp('firstAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('dueAt',{useTz:true}).notNullable();t.timestamp('sentAt',{useTz:true});t.integer('attempts').notNullable().defaultTo(0);t.text('payloadHash');t.text('token').notNullable();t.text('unsubscribeHash').notNullable().unique();t.unique(['workspaceId','id']);
  t.check(`status IN ('queued','sent','skipped','failed','canceled') AND attempts BETWEEN 0 AND 5 AND version>0`);
 });
 await db.raw(`CREATE UNIQUE INDEX schedule_change_pending_customer ON "customerScheduleNotices" ("workspaceId","visitId","customerId") WHERE status='queued'`);
 await db.schema.createTable('customerScheduleNotifications',t=>{
  t.uuid('id').primary();t.uuid('workspaceId').notNullable();t.uuid('noticeId').notNullable().unique();t.uuid('jobId').notNullable();t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');t.text('reason').notNullable();t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('readAt',{useTz:true});
  for(const [col,table] of [['noticeId','customerScheduleNotices'],['jobId','jobs']])t.foreign(['workspaceId',col]).references(['workspaceId','id']).inTable(table).onDelete('CASCADE');t.index(['workspaceId','userId','readAt','createdAt']);
 });
 const old=(await db.raw(`SELECT pg_get_expr(conbin,conrelid) expression FROM pg_constraint WHERE conrelid='"workflowSteps"'::regclass AND conname='workflow_step_record_kind'`)).rows[0].expression;
 await db.raw('ALTER TABLE "workflowSteps" DROP CONSTRAINT workflow_step_record_kind');
 await db.raw(`ALTER TABLE "workflowSteps" ADD CONSTRAINT workflow_step_record_kind CHECK (("recordKind"='schedule_change' AND "visitId" IS NOT NULL AND "jobId" IS NULL AND "estimateId" IS NULL AND "leadId" IS NULL AND "openingId" IS NULL AND "completionActivityId" IS NULL) OR (${old}))`);
 const queue=(await db.raw(`SELECT pg_get_functiondef('workflow_queue_changed()'::regprocedure) code`)).rows[0].code;
 if(!queue.includes("'post_job'"))throw Error('Expected post-job queue adapter.');await db.raw(queue.replace("'post_job'","'post_job','schedule_change'"));
 await db.raw(`CREATE FUNCTION workflow_schedule_projection(ws uuid,vid uuid DEFAULT NULL,refs jsonb DEFAULT NULL,cust uuid DEFAULT NULL) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
 WITH source AS (
  SELECT r."visitId",j."customerId",j.id "jobId",'job' type,j.id id FROM "calendarVisitRecords" r JOIN jobs j ON j."workspaceId"=ws AND j.id=r."jobId" WHERE r."workspaceId"=ws AND r."endedAt" IS NULL AND j.status NOT IN ('completed','canceled')
  UNION ALL
  SELECT r."visitId",j."customerId",j.id,'work_order',o.id FROM "calendarVisitRecords" r JOIN "workOrders" o ON o."workspaceId"=ws AND o.id=r."workOrderId" JOIN jobs j ON j."workspaceId"=ws AND j.id=o."jobId" WHERE r."workspaceId"=ws AND r."endedAt" IS NULL AND o."archivedAt" IS NULL AND o.status IN ('issued','in-progress') AND j.status NOT IN ('completed','canceled')
 ), grouped AS (
 SELECT s."visitId",s."customerId",to_char(v."scheduledDate",'YYYY-MM-DD') date,v."arrivalWindow",jsonb_agg(DISTINCT jsonb_build_object('type',s.type,'id',s.id,'jobId',s."jobId")) refs FROM source s JOIN "calendarVisits" v ON v."workspaceId"=ws AND v.id=s."visitId"
 WHERE (cust IS NULL OR s."customerId"=cust) AND ((vid IS NOT NULL AND s."visitId"=vid) OR (refs IS NOT NULL AND EXISTS(SELECT 1 FROM jsonb_array_elements(refs) x WHERE x->>'type'=s.type AND (x->>'id')::uuid=s.id)))
 GROUP BY s."visitId",s."customerId",v."scheduledDate",v."arrivalWindow" LIMIT 101)
 SELECT coalesce(jsonb_agg(jsonb_build_object('visitId',"visitId",'customerId',"customerId",'schedule',jsonb_build_object('date',date,'arrivalWindow',"arrivalWindow"),'refs',refs)),'[]'::jsonb) FROM grouped $$`);
 await db.raw(`CREATE FUNCTION workflow_schedule_mark(ws uuid,vid uuid) RETURNS void LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF vid IS NULL OR NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND definition->>'kind'='customer_schedule_change' AND status IN ('active','paused') AND "deletedAt" IS NULL) THEN RETURN;END IF;
 INSERT INTO "customerScheduleDirty" ("workspaceId","visitId","before") VALUES(ws,vid,workflow_schedule_projection(ws,vid)) ON CONFLICT DO NOTHING;END $$`);
 await db.raw(`CREATE FUNCTION workflow_schedule_capture() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ DECLARE v record;ws uuid;BEGIN
 ws:=CASE WHEN TG_OP='DELETE' THEN OLD."workspaceId" ELSE NEW."workspaceId" END;
 IF NOT EXISTS(SELECT 1 FROM workflows WHERE "workspaceId"=ws AND definition->>'kind'='customer_schedule_change' AND status IN ('active','paused') AND "deletedAt" IS NULL) THEN IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;END IF;
 IF TG_TABLE_NAME='calendarVisits' THEN
  IF (OLD."scheduledDate",OLD."arrivalWindow") IS DISTINCT FROM (NEW."scheduledDate",NEW."arrivalWindow") THEN PERFORM workflow_schedule_mark(ws,NEW.id);END IF;
 ELSIF TG_TABLE_NAME='calendarVisitRecords' THEN
  IF TG_OP<>'INSERT' THEN PERFORM workflow_schedule_mark(ws,OLD."visitId");END IF;IF TG_OP<>'DELETE' THEN PERFORM workflow_schedule_mark(ws,NEW."visitId");END IF;
 ELSE
  FOR v IN SELECT DISTINCT r."visitId" FROM "calendarVisitRecords" r LEFT JOIN "workOrders" o ON o."workspaceId"=ws AND o.id=r."workOrderId" WHERE r."workspaceId"=ws AND r."endedAt" IS NULL AND CASE WHEN TG_TABLE_NAME='jobs' THEN r."jobId"=OLD.id OR o."jobId"=OLD.id ELSE r."workOrderId"=OLD.id END LOOP PERFORM workflow_schedule_mark(ws,v."visitId");END LOOP;
 END IF;IF TG_OP='DELETE' THEN RETURN OLD;ELSE RETURN NEW;END IF;END $$`);
 await db.raw(`CREATE TRIGGER schedule_change_visit BEFORE UPDATE OF "scheduledDate","arrivalWindow" ON "calendarVisits" FOR EACH ROW EXECUTE FUNCTION workflow_schedule_capture()`);
 await db.raw(`CREATE TRIGGER schedule_change_records BEFORE INSERT OR UPDATE OR DELETE ON "calendarVisitRecords" FOR EACH ROW EXECUTE FUNCTION workflow_schedule_capture()`);
 await db.raw(`CREATE TRIGGER schedule_change_job BEFORE UPDATE OF status,"customerId" ON jobs FOR EACH ROW EXECUTE FUNCTION workflow_schedule_capture()`);
 await db.raw(`CREATE TRIGGER schedule_change_order BEFORE UPDATE OF status,"archivedAt","jobId" ON "workOrders" FOR EACH ROW EXECUTE FUNCTION workflow_schedule_capture()`);
 await db.raw(`CREATE FUNCTION workflow_schedule_finish() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
 DECLARE d record;w record;b jsonb;a jsonb;states jsonb;refs jsonb;before_state jsonb;after_state jsonb;n record;nid uuid;now_at timestamptz;cancelled boolean;issue text;token text;BEGIN
 DELETE FROM "customerScheduleDirty" WHERE "workspaceId"=NEW."workspaceId" AND "visitId"=NEW."visitId" RETURNING * INTO d;IF NOT FOUND THEN RETURN NULL;END IF;
 SELECT * INTO w FROM workflows WHERE "workspaceId"=d."workspaceId" AND definition->>'kind'='customer_schedule_change' AND status IN ('active','paused') AND "deletedAt" IS NULL;IF NOT FOUND THEN RETURN NULL;END IF;
 IF jsonb_array_length(d."before")>100 THEN UPDATE workflows SET "executionIssue"='This shared visit has too many customers for automatic updates. Contact customers manually.' WHERE "workspaceId"=d."workspaceId" AND id=w.id;RETURN NULL;END IF;
 FOR b IN SELECT * FROM jsonb_array_elements(d."before") LOOP
  SELECT * INTO n FROM "customerScheduleNotices" WHERE "workspaceId"=d."workspaceId" AND "visitId"=d."visitId" AND "customerId"=(b->>'customerId')::uuid AND status='queued' FOR UPDATE;
  IF b->'schedule'->>'date' IS NULL AND n.id IS NULL THEN CONTINUE;END IF;
  IF w.status<>'active' THEN IF n.id IS NOT NULL THEN UPDATE "customerScheduleNotices" SET status='canceled' WHERE id=n.id;END IF;CONTINUE;END IF;
  refs:=b->'refs';issue:=NULL;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(refs) r WHERE NOT EXISTS(SELECT 1 FROM jobs j WHERE j."workspaceId"=d."workspaceId" AND j.id=(r->>'jobId')::uuid AND j."customerId"=(b->>'customerId')::uuid)) THEN issue:='The customer relationship changed. Review the visit before contacting the customer.';END IF;
  states:=workflow_schedule_projection(d."workspaceId",NULL,refs,(b->>'customerId')::uuid);
  IF (SELECT count(DISTINCT x->'schedule') FROM jsonb_array_elements(states) x)>1 THEN issue:='The visit was split into different schedules. Review the customer update.';END IF;
  a:=states->0;after_state:=CASE WHEN a->'schedule'->>'date' IS NOT NULL THEN a->'schedule' ELSE NULL END;
  cancelled:=EXISTS(SELECT 1 FROM jsonb_array_elements(refs) r JOIN jobs j ON j."workspaceId"=d."workspaceId" AND j.id=(r->>'jobId')::uuid LEFT JOIN "workOrders" o ON o."workspaceId"=d."workspaceId" AND o.id=(r->>'id')::uuid AND r->>'type'='work_order' WHERE j.status='canceled' OR o.status='canceled');
  IF a IS NULL AND NOT cancelled AND issue IS NULL THEN IF n.id IS NOT NULL THEN UPDATE "customerScheduleNotices" SET status='canceled' WHERE id=n.id;END IF;CONTINUE;END IF;
  before_state:=coalesce(n."before",b->'schedule');
  IF before_state IS NOT DISTINCT FROM after_state AND issue IS NULL THEN IF n.id IS NOT NULL THEN UPDATE "customerScheduleNotices" SET status='canceled' WHERE id=n.id;END IF;CONTINUE;END IF;
  IF b->'schedule' IS NOT DISTINCT FROM after_state AND issue IS NULL THEN CONTINUE;END IF;
  now_at:=clock_timestamp();
  IF n.id IS NOT NULL AND n.attempts>0 THEN
    INSERT INTO "customerScheduleNotifications" (id,"workspaceId","noticeId","jobId","userId",reason) SELECT gen_random_uuid(),d."workspaceId",n.id,(refs->0->>'jobId')::uuid,w."publisherId",'The schedule changed during a delivery retry. A fresh update will use the latest schedule.' WHERE w."publisherId" IS NOT NULL ON CONFLICT("noticeId") DO NOTHING;
    UPDATE "customerScheduleNotices" SET status='skipped' WHERE id=n.id;n.id:=NULL;
  END IF;
  IF n.id IS NOT NULL THEN
    UPDATE "customerScheduleNotices" SET "after"=after_state,"sourceIssue"=issue,"sourceRefs"=refs,version=version+1,"dueAt"=least(now_at+interval '5 minutes',"firstAt"+interval '15 minutes') WHERE id=n.id;
  ELSE
    nid:=gen_random_uuid();token:=encode(gen_random_bytes(32),'hex');
    INSERT INTO "customerScheduleNotices" (id,"workspaceId","workflowId","visitId","customerId","before","after","sourceRefs","sourceIssue","firstAt","dueAt",token,"unsubscribeHash") VALUES(nid,d."workspaceId",w.id,d."visitId",(b->>'customerId')::uuid,before_state,after_state,refs,issue,now_at,now_at+interval '5 minutes',token,encode(digest(token,'sha256'),'hex'));
    INSERT INTO "workflowSteps" (id,"workspaceId","workflowId","recordKind","visitId","triggeredAt","dueAt",status) VALUES(nid,d."workspaceId",w.id,'schedule_change',d."visitId",now_at,now_at+interval '5 minutes','queued');
  END IF;
 END LOOP;RETURN NULL;END $$`);
 await db.raw(`CREATE CONSTRAINT TRIGGER schedule_change_final_state AFTER INSERT ON "customerScheduleDirty" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION workflow_schedule_finish()`);
 await db.raw(`CREATE FUNCTION workflow_schedule_notice_queue() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW.status='queued' THEN UPDATE "workflowSteps" SET "dueAt"=NEW."dueAt" WHERE "workspaceId"=NEW."workspaceId" AND id=NEW.id AND status IN ('queued','held');
 ELSE UPDATE "workflowSteps" SET status=CASE WHEN NEW.status='sent' THEN 'completed' WHEN NEW.status='canceled' THEN 'canceled' ELSE 'skipped' END WHERE "workspaceId"=NEW."workspaceId" AND id=NEW.id AND status IN ('queued','held');END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER schedule_change_notice_queue AFTER UPDATE OF status,"dueAt" ON "customerScheduleNotices" FOR EACH ROW EXECUTE FUNCTION workflow_schedule_notice_queue()`);
 await db.raw(`CREATE FUNCTION workflow_schedule_step_closed() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$ BEGIN
 IF NEW."recordKind"='schedule_change' AND NEW.status IN ('canceled','skipped','failed') THEN UPDATE "customerScheduleNotices" SET status='canceled' WHERE "workspaceId"=NEW."workspaceId" AND id=NEW.id AND status='queued';END IF;RETURN NEW;END $$`);
 await db.raw(`CREATE TRIGGER schedule_change_step_closed AFTER UPDATE OF status ON "workflowSteps" FOR EACH ROW EXECUTE FUNCTION workflow_schedule_step_closed()`);
}

}

export async function down() {
  throw new Error('Workflow migrations are forward-only.');
}

import type { Knex } from 'knex';

export async function up(db: Knex) {
  // 202611170001_workflows.ts
  {
  await db.schema.createTable("workflows", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.text("name").notNullable();
    table.text("rule").notNullable();
    table.text("status").notNullable();
    table.integer("version").notNullable().defaultTo(1);
    table.timestamp("deletedAt", { useTz: true });
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("updatedAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(["workspaceId", "id"]);
    table.index(["workspaceId", "deletedAt", "id"]);
    table.check("length(btrim(name)) BETWEEN 1 AND 120 AND length(btrim(rule)) BETWEEN 1 AND 1000 AND version > 0");
    table.check("status IN ('active', 'paused', 'deleted') AND (status = 'deleted') = (\"deletedAt\" IS NOT NULL)");
  });
  await db.schema.createTable("workflowSteps", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.uuid("workflowId").notNullable();
    table.text("status").notNullable();
    table.timestamp("dueAt", { useTz: true }).notNullable();
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.index(["workspaceId", "workflowId", "status"]);
    table.check("status IN ('queued','held','running','completed','skipped','failed','canceled')");
  });
  await db.schema.createTable("workflowLifecycleAudit", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.uuid("workflowId").notNullable();
    table.text("actorId").notNullable();
    table.text("action").notNullable();
    table.integer("version").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.unique(["workflowId", "version"]);
    table.check("action IN ('pause','resume','delete') AND version > 0");
  });
  // Existing policies receive conservative initial grants for this new feature.
  await db.raw(`INSERT INTO "workspaceRolePolicies" ("workspaceId",role,permission,scope)
    SELECT w.id, g.role, g.permission, 'enabled' FROM workspaces w CROSS JOIN
      (VALUES ('owner','workflows.read'), ('admin','workflows.read'), ('office','workflows.read'),
              ('owner','workflows.manage'), ('admin','workflows.manage')) AS g(role,permission)
    ON CONFLICT DO NOTHING`);
  await db("workspacePolicies").increment("revision", 1);
}
  // 202611170002_workflow-publication.ts
  {
  await db.schema.alterTable("workflows", table => {
    table.jsonb("definition");
    table.text("publisherId").references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("enrollAfter", { useTz: true });
  });
  await db.schema.alterTable("workflowSteps", table => {
    table.uuid("estimateId");
    table.foreign(["workspaceId", "estimateId"]).references(["workspaceId", "id"]).inTable("estimates").onDelete("CASCADE");
    table.unique(["workflowId", "estimateId"]);
  });
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_turn_proposal_families');
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_turn_proposal_families CHECK ("proposalFamilies" IS NULL OR (
    jsonb_typeof("proposalFamilies") = 'array' AND "proposalFamilies" <@
    '["calendar","captureSource","captureSetup","estimateDraft","estimateSharing","estimateDecision","estimateDraftAction","estimateVoid","estimateArchive","estimateDraftDelete","estimateConversion","action","customer","workOrder","material","workflow"]'::jsonb))`);
  await db.raw('ALTER TABLE "chatProposals" DROP CONSTRAINT chat_proposal_family');
  await db.raw(`ALTER TABLE "chatProposals" ADD CONSTRAINT chat_proposal_family CHECK (family IN (
    'action','estimateDraft','estimateSharing','estimateDecision','estimateDraftAction','estimateVoid',
    'estimateArchive','estimateDraftDelete','estimateConversion','calendar','captureSetup','captureSource',
    'customer','workOrder','material','workflow'))`);
  await db.raw('ALTER TABLE "chatProposalAudit" DROP CONSTRAINT chat_proposal_audit_family');
  await db.raw(`ALTER TABLE "chatProposalAudit" ADD CONSTRAINT chat_proposal_audit_family CHECK (family IN (
    'action','estimateDraft','estimateSharing','estimateDecision','estimateDraftAction','estimateVoid',
    'estimateArchive','estimateDraftDelete','estimateConversion','calendar','captureSetup','captureSource',
    'customer','workOrder','material','workflow'))`);
  await db.raw(`CREATE UNIQUE INDEX workflow_pending_proposal ON "chatProposals" ("workspaceId","userId","threadId")
    WHERE family = 'workflow' AND state = 'pending'`);
  await db.raw(`CREATE UNIQUE INDEX workflow_proposal_turn ON "chatProposals" ("turnId") WHERE family = 'workflow'`);
  await db.raw(`CREATE INDEX workflow_accepted_estimate_enrollment ON estimates ("workspaceId","decidedAt",id)
    WHERE status = 'accepted' AND "archivedAt" IS NULL AND "supersededById" IS NULL`);
  await db.raw(`CREATE INDEX workflow_due_steps ON "workflowSteps" ("workflowId","dueAt",id) WHERE status = 'queued'`);
  // Keep all pre-existing estimate event checks and add the workflow notice.
  const constraints = await db("pg_constraint").whereRaw(`conrelid = '"estimateNotifications"'::regclass`)
    .where("contype", "c").select<{ conname: string }[]>("conname");
  for (const constraint of constraints) {
    const result = await db.raw<{ rows: { definition: string }[] }>("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid = ?::regclass AND conname = ?", ['"estimateNotifications"', constraint.conname]);
    if (result.rows[0].definition.includes("event")) await db.raw('ALTER TABLE "estimateNotifications" DROP CONSTRAINT ??', [constraint.conname]);
  }
  await db.raw(`ALTER TABLE "estimateNotifications" ADD CONSTRAINT estimate_notification_event CHECK (
    event IN ('sent','delivery_failed','viewed','decision_recorded','expiring_soon','expired','needs_scheduling'))`);
  await db.raw(`INSERT INTO "workspaceRolePolicies" ("workspaceId",role,permission,scope)
    SELECT p."workspaceId", p.role, 'workflows.publish', 'enabled' FROM "workspaceRolePolicies" p
    WHERE p.permission = 'workflows.read' AND p.role IN ('owner','admin')
    AND EXISTS (SELECT 1 FROM "workspaceRolePolicies" a WHERE a."workspaceId" = p."workspaceId"
      AND a.role = p.role AND a.permission = 'assistant.use')
    ON CONFLICT DO NOTHING`);
  await db("workspacePolicies").increment("revision", 1);
}
  // 202611180001_workflow-manual-runs.ts
  {
  await db.schema.createTable("workflowManualRuns", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.uuid("workflowId").notNullable();
    table.text("actorId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("version").notNullable();
    table.jsonb("estimateIds").notNullable();
    table.jsonb("result");
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("expiresAt", { useTz: true }).notNullable();
    table.timestamp("completedAt", { useTz: true });
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.index(["workspaceId", "workflowId", "actorId"]);
    table.check('version > 0 AND jsonb_typeof("estimateIds") = \'array\' AND jsonb_array_length("estimateIds") <= 100');
    table.check('("completedAt" IS NULL) = (result IS NULL)');
  });
}
  // 202611180002_workflow-notification-channels.ts
  {
  await db.schema.alterTable("estimateNotifications", table => {
    table.boolean("inApp").notNullable().defaultTo(true);
    table.uuid("workflowId");
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows");
  });
  const checks = await db("pg_constraint").whereRaw(`conrelid = '"workflowLifecycleAudit"'::regclass AND contype = 'c'`).select<{ conname: string }[]>("conname");
  for (const check of checks) await db.raw('ALTER TABLE "workflowLifecycleAudit" DROP CONSTRAINT ??', [check.conname]);
  await db.raw(`ALTER TABLE "workflowLifecycleAudit" ADD CONSTRAINT workflow_lifecycle_action CHECK (action IN ('pause','resume','delete','notifications') AND version > 0)`);
}
  // 202611180003_workflow-estimate-follow-up.ts
  {
  await db.raw('ALTER TABLE "estimateNotifications" DROP CONSTRAINT estimate_notification_event');
  await db.raw(`ALTER TABLE "estimateNotifications" ADD CONSTRAINT estimate_notification_event CHECK (
    event IN ('sent','delivery_failed','viewed','decision_recorded','expiring_soon','expired','needs_scheduling','awaiting_decision'))`);
  await db.raw(`CREATE INDEX workflow_successful_estimate_sends ON estimate_deliveries ("workspaceId","estimateId","sentAt") WHERE status = 'sent'`);
}
  // 202611190001_workflow-unassigned-lead.ts
  {
  await db.schema.alterTable("workflowSteps", table => {
    table.text("recordKind").notNullable().defaultTo("estimate");
    table.uuid("leadId");
    table.foreign(["workspaceId", "leadId"]).references(["workspaceId", "id"]).inTable("leads").onDelete("CASCADE");
    table.unique(["workflowId", "leadId"]);
    // Legacy non-executable steps may have no record. Lead steps always have a lead reference.
    table.check(`("recordKind" = 'estimate' AND "leadId" IS NULL) OR
      ("recordKind" = 'lead' AND "leadId" IS NOT NULL AND "estimateId" IS NULL)`, [], "workflow_step_record_kind");
  });
  await db.schema.alterTable("workflowManualRuns", table => {
    table.renameColumn("estimateIds", "recordIds");
    table.text("recordKind").notNullable().defaultTo("estimate");
    table.check(`"recordKind" IN ('estimate','lead')`, [], "workflow_manual_record_kind");
  });
  await db.schema.createTable("leadWorkflowNotifications", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.uuid("workflowId").notNullable();
    table.uuid("leadId").notNullable();
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.foreign(["workspaceId", "workflowId"]).references(["workspaceId", "id"]).inTable("workflows").onDelete("CASCADE");
    table.foreign(["workspaceId", "leadId"]).references(["workspaceId", "id"]).inTable("leads").onDelete("CASCADE");
    table.boolean("inApp").notNullable().defaultTo(true);
    table.text("emailStatus").notNullable().defaultTo("queued");
    table.integer("attempts").notNullable().defaultTo(0);
    table.timestamp("nextAttemptAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("readAt", { useTz: true });
    table.timestamp("sentAt", { useTz: true });
    table.unique(["workspaceId", "workflowId", "leadId", "userId"]);
    table.index(["workspaceId", "userId", "createdAt"]);
    table.check(`"emailStatus" IN ('queued','sent','skipped','failed') AND attempts >= 0`);
  });
  await db.raw(`CREATE INDEX workflow_new_lead_enrollment ON leads ("workspaceId","createdAt",id) WHERE "archivedAt" IS NULL`);
  await db.raw(`CREATE INDEX lead_workflow_email_queue ON "leadWorkflowNotifications" ("nextAttemptAt",id) WHERE "emailStatus" = 'queued'`);
}

}

export async function down() {
  throw new Error('Workflow migrations are forward-only.');
}

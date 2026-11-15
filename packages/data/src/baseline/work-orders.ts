import type { Knex } from 'knex';

export async function createWorkOrderTables(db: Knex) {
  await db.schema.createTable('workOrderExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.integer('rowCount').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('workOrderDeleteAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('workOrderNumber').notNullable();
    table.text('title').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('source').notNullable().defaultTo('ui');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
  });
  await db.schema.createTable('workOrders', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('workOrderNumber').notNullable();
    table.uuid('jobId').notNullable();
    table.text('title').notNullable();
    table.text('status').notNullable().defaultTo('draft');
    for (const field of ['instructions', 'accessNotes', 'safetyNotes']) table.text(field).notNullable().defaultTo('');
    table.date('scheduledDate');
    table.text('arrivalWindow');
    table.text('primaryAssigneeId');
    table.uuid('sourceEstimateId');
    table.uuid('sourceWorkOrderId');
    table.text('cancellationReason');
    table.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    for (const field of ['issuedAt', 'startedAt', 'completedAt', 'canceledAt', 'archivedAt', 'changedAfterIssueAt']) {
      table.timestamp(field, { useTz: true });
    }
    table.integer('version').notNullable().defaultTo(1);
    for (const field of ['createdAt', 'updatedAt']) table.timestamp(field, { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'workOrderNumber']);
    table.index(['workspaceId', 'status', 'createdAt', 'id']);
    table.index(['workspaceId', 'scheduledDate', 'id']);
    table.index(['workspaceId', 'primaryAssigneeId', 'scheduledDate']);
    table.index(['workspaceId', 'jobId', 'createdAt']);
    table.check(`status IN ('draft','issued','in-progress','completed','canceled') AND version > 0 AND "workOrderNumber" > 0`);
    table.check(`"arrivalWindow" IS NULL OR "scheduledDate" IS NOT NULL`);
    table.check(`(status = 'canceled' AND "cancellationReason" IS NOT NULL AND "canceledAt" IS NOT NULL) OR (status <> 'canceled' AND "cancellationReason" IS NULL)`);
    table.check(`(status = 'completed') = ("completedAt" IS NOT NULL)`);
    table.check(`status = 'draft' OR "issuedAt" IS NOT NULL OR status = 'canceled'`);
    table.check(`char_length(instructions) <= 2000 AND char_length("accessNotes") <= 2000 AND char_length("safetyNotes") <= 2000`);
  });
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_job_workspace_fk FOREIGN KEY ("workspaceId","jobId") REFERENCES jobs("workspaceId",id) ON DELETE RESTRICT`);
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_assignee_workspace_fk FOREIGN KEY ("workspaceId","primaryAssigneeId") REFERENCES "workspaceMemberships"("workspaceId","userId") ON DELETE SET NULL ("primaryAssigneeId")`);
  await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT work_orders_source_wo_fk FOREIGN KEY ("workspaceId","sourceWorkOrderId") REFERENCES "workOrders"("workspaceId",id) ON DELETE SET NULL ("sourceWorkOrderId")`);
  await db.raw(`CREATE INDEX work_orders_open ON "workOrders"("workspaceId","scheduledDate",id) WHERE status IN ('issued','in-progress') AND "archivedAt" IS NULL`);
  await db.schema.createTable('workspaceWorkOrderCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_work_order_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceWorkOrderCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1)
    ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceWorkOrderCounters"."lastNumber"+1
    RETURNING "lastNumber" INTO NEW."workOrderNumber"; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER assign_work_order_number BEFORE INSERT ON "workOrders" FOR EACH ROW EXECUTE FUNCTION assign_work_order_number()');
  const child = (table: Knex.CreateTableBuilder) => {
    table.uuid('workspaceId').notNullable();
    table.uuid('workOrderId').notNullable();
    table.foreign(['workspaceId', 'workOrderId']).references(['workspaceId', 'id']).inTable('workOrders').onDelete('CASCADE');
  };
  await db.schema.createTable('workOrderTasks', table => {
    table.uuid('id').primary(); child(table);
    table.integer('position').notNullable();
    table.text('label').notNullable();
    table.boolean('required').notNullable().defaultTo(false);
    table.boolean('done').notNullable().defaultTo(false);
    table.text('doneBy').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('doneAt', { useTz: true });
    table.unique(['workOrderId', 'position'], { deferrable: 'deferred' });
    table.index(['workspaceId', 'workOrderId', 'position']);
    table.check(`char_length(label) BETWEEN 1 AND 200 AND position >= 0 AND (done OR ("doneBy" IS NULL AND "doneAt" IS NULL))`);
  });
  await db.schema.createTable('workOrderMaterials', table => {
    table.uuid('id').primary(); child(table);
    table.integer('position').notNullable();
    table.uuid('catalogId');
    table.text('name').notNullable();
    table.decimal('quantity', 12, 3).notNullable().defaultTo(1);
    table.text('unit').notNullable().defaultTo('each');
    table.text('status').notNullable().defaultTo('needed');
    table.text('note').notNullable().defaultTo('');
    table.integer('customerPriceCents');
    table.integer('costCents');
    table.text('imageUrl').notNullable().defaultTo('');
    table.index(['workspaceId', 'workOrderId', 'position']);
    table.check(`status IN ('needed','ordered','on-hand','used') AND quantity > 0 AND char_length(name) BETWEEN 1 AND 200 AND char_length(note) <= 500`);
    table.check(`("customerPriceCents" IS NULL OR "customerPriceCents" >= 0) AND ("costCents" IS NULL OR "costCents" >= 0)`);
  });
  await db.schema.createTable('workOrderCrew', table => {
    child(table); table.text('userId').notNullable();
    table.primary(['workspaceId', 'workOrderId', 'userId']);
    table.foreign(['workspaceId', 'userId']).references(['workspaceId', 'userId']).inTable('workspaceMemberships').onDelete('CASCADE');
    table.index(['workspaceId', 'userId', 'workOrderId']);
  });
  await db.schema.createTable('workOrderCompletions', table => {
    table.uuid('id').primary(); child(table);
    table.unique(['workOrderId']);
    table.text('summary').notNullable();
    table.text('followUp').notNullable().defaultTo('none');
    table.text('followUpNote').notNullable().defaultTo('');
    table.text('completedBy').references('id').inTable('users').onDelete('SET NULL');
    table.text('completedByName').notNullable();
    table.timestamp('completedAt', { useTz: true }).notNullable();
    table.text('signerName');
    table.timestamp('signedAt', { useTz: true });
    table.text('overrideReason').notNullable().defaultTo('');
    table.text('signatureImage');
    table.check(`"followUp" IN ('none','work-order','job-note') AND char_length(summary) <= 2000`);
    table.check(`("signerName" IS NULL) = ("signedAt" IS NULL)`);
  });
  await db.raw(`ALTER TABLE "workOrderCompletions" ADD CONSTRAINT "workOrderCompletionsSignatureImageCheck" CHECK ("signatureImage" IS NULL OR ("signerName" IS NOT NULL AND "signatureImage" LIKE 'data:image/png;base64,%' AND length("signatureImage") <= 60000))`);
  await db.schema.createTable('workOrderActivity', table => {
    table.uuid('id').primary(); child(table);
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName').notNullable();
    table.text('source').notNullable();
    table.text('type').notNullable();
    table.jsonb('changes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'workOrderId', 'createdAt', 'id']);
    table.check(`source IN ('ui','assistant-confirmed','system')`);
  });
  await db.schema.createTable('workOrderOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.uuid('workOrderId').notNullable();
    table.foreign(['workspaceId', 'workOrderId']).references(['workspaceId', 'id']).inTable('workOrders').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.string('inputHash', 64).notNullable();
    table.integer('version').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']);
  });
}

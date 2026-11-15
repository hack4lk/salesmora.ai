import type { Knex } from 'knex';

export async function createLeadTables(db: Knex) {
  await db.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public');
  await db.schema.createTable('customers', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('customerNumber').notNullable();
    for (const field of ['name', 'type', 'companyName', 'email', 'phone', 'location', 'internalNotes']) table.text(field).notNullable();
    table.text('ownerId').references('id').inTable('users').onDelete('SET NULL');
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('lastActivityAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('archivedAt', { useTz: true });
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'customerNumber']);
    table.index(['workspaceId', 'archivedAt', 'name', 'id']);
    table.index(['workspaceId', 'ownerId']);
    table.check(`type IN ('person','business') AND version > 0 AND "customerNumber" > 0`);
  });
  await db.schema.createTable('workspaceCustomerCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_customer_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO "workspaceCustomerCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1) ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceCustomerCounters"."lastNumber"+1 RETURNING "lastNumber" INTO NEW."customerNumber"; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER assign_customer_number BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION assign_customer_number()');
  for (const field of ['name', 'email']) await db.raw('CREATE INDEX ?? ON customers USING gin (?? public.gin_trgm_ops)', [`customers_${field}_search`, field]);
  await db.raw(`CREATE INDEX customers_phone_search ON customers USING gin ((regexp_replace(phone,'[^0-9]','','g')) public.gin_trgm_ops)`);

  await db.schema.createTable('leads', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('submissionId').notNullable();
    table.text('submissionHash').notNullable();
    for (const field of ['name', 'email', 'phone', 'service', 'address', 'details', 'notes', 'source', 'stage']) table.text(field).notNullable();
    table.text('ownerId').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('leadNumber').notNullable();
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('lastActivityAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('archivedAt', { useTz: true });
    table.text('archivedBy').references('id').inTable('users').onDelete('SET NULL');
    table.text('ownerName');
    table.uuid('customerId');
    table.foreign(['workspaceId', 'customerId']).references(['workspaceId', 'id']).inTable('customers');
    table.unique(['workspaceId', 'createdBy', 'submissionId']);
    table.unique(['workspaceId', 'leadNumber']);
    table.unique(['workspaceId', 'id'], { indexName: 'leads_jobs_workspace_id_unique' });
    table.unique(['workspaceId', 'id'], { indexName: 'leads_capture_tenant_identity' });
    table.check(`source IN ('website', 'referral', 'phone', 'gmail', 'other')`);
    table.check(`stage IN ('new','contacted','estimate-sent','won','lost')`, [], 'leads_stage_v2_check');
    table.check('version > 0 AND "leadNumber" > 0', [], 'leads_positive_versions');
    for (const columns of [
      ['workspaceId', 'createdAt'], ['workspaceId', 'stage', 'archivedAt'], ['workspaceId', 'ownerId'],
      ['workspaceId', 'source'], ['workspaceId', 'createdAt', 'id'], ['workspaceId', 'lastActivityAt'], ['workspaceId', 'customerId'],
    ]) table.index(columns);
  });
  await db.schema.createTable('workspaceLeadCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
  });
  await db.schema.createTable('workspaceLeadAdmissions', table => {
    table.uuid('leadId').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
  });
  await db.schema.createTable('leadActivity', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('leadId').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName');
    table.text('actorType').notNullable();
    table.text('type').notNullable();
    table.jsonb('changes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.index(['workspaceId', 'leadId', 'createdAt', 'id']);
    table.check(`"actorType" IN ('user','assistant-confirmed','system')`);
  });
  await db.raw(`CREATE FUNCTION assign_lead_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.stage = 'in-progress' THEN NEW.stage := 'estimate-sent'; END IF;
    INSERT INTO "workspaceLeadCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1)
    ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber" = "workspaceLeadCounters"."lastNumber" + 1
    RETURNING "lastNumber" INTO NEW."leadNumber";
    NEW."updatedAt" := NEW."createdAt"; NEW."lastActivityAt" := NEW."createdAt";
    SELECT name INTO NEW."ownerName" FROM users WHERE id = NEW."ownerId";
    RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER assign_lead_number BEFORE INSERT ON leads FOR EACH ROW EXECUTE FUNCTION assign_lead_number()');
  await db.raw(`CREATE FUNCTION record_lead_creation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "leadActivity" (id,"workspaceId","leadId","actorId","actorName","actorType",type,changes,"createdAt")
    VALUES (NEW.id,NEW."workspaceId",NEW.id,NEW."createdBy",(SELECT name FROM users WHERE id=NEW."createdBy"),CASE WHEN NEW."createdBy" IS NULL THEN 'system' ELSE 'user' END,'created',jsonb_build_object('source',NEW.source),NEW."createdAt"); RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER record_lead_creation AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION record_lead_creation()');
  await db.raw(`CREATE FUNCTION record_lead_admission() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceLeadAdmissions" ("leadId","workspaceId","createdAt")
    VALUES (NEW.id,NEW."workspaceId",NEW."createdAt") ON CONFLICT ("leadId") DO NOTHING;
    RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER record_lead_admission AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION record_lead_admission()');
  for (const field of ['name', 'email', 'service', 'address']) await db.raw('CREATE INDEX ?? ON leads USING gin (?? public.gin_trgm_ops)', [`leads_${field}_search`, field]);
  await db.raw(`CREATE INDEX leads_phone_search ON leads USING gin ((regexp_replace(phone,'[^0-9]','','g')) public.gin_trgm_ops)`);
}

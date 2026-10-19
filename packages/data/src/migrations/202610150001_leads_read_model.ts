import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.raw('LOCK TABLE leads IN SHARE ROW EXCLUSIVE MODE');
  await db.schema.alterTable('workspaces', table => { table.text('timezone').notNullable().defaultTo('UTC'); });
  await db.schema.alterTable('leads', table => {
    table.integer('leadNumber'); table.integer('version').notNullable().defaultTo(1);
    table.timestamp('updatedAt', { useTz: true }); table.timestamp('lastActivityAt', { useTz: true });
    table.timestamp('archivedAt', { useTz: true }); table.text('archivedBy').references('id').inTable('users').onDelete('SET NULL');
    table.text('ownerName'); table.dropForeign(['workspaceId', 'ownerId']);
    table.foreign('ownerId').references('id').inTable('users').onDelete('SET NULL');
  });
  // Discover Knex's legacy generated check name instead of assuming a particular name.
  await db.raw(`DO $$ DECLARE c record; BEGIN
    FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = 'leads'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%stage%'
    LOOP EXECUTE format('ALTER TABLE leads DROP CONSTRAINT %I', c.conname); END LOOP;
  END $$`);
  await db('leads').where({ stage: 'in-progress' }).update({ stage: 'estimate-sent' });
  await db.raw(`ALTER TABLE leads ADD CONSTRAINT leads_stage_v2_check CHECK (stage IN ('new','contacted','estimate-sent','won','lost'))`);
  await db.raw(`WITH numbered AS (SELECT id, row_number() OVER (PARTITION BY "workspaceId" ORDER BY "createdAt", id)::integer AS n FROM leads)
    UPDATE leads l SET "leadNumber" = numbered.n, "updatedAt" = l."createdAt", "lastActivityAt" = l."createdAt" FROM numbered WHERE l.id = numbered.id`);
  await db.raw('UPDATE leads l SET "ownerName" = u.name FROM users u WHERE l."ownerId" = u.id');
  await db.schema.alterTable('leads', table => {
    table.integer('leadNumber').notNullable().alter(); table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now()).alter();
    table.timestamp('lastActivityAt', { useTz: true }).notNullable().defaultTo(db.fn.now()).alter();
    table.unique(['workspaceId', 'leadNumber']); table.check('version > 0 AND "leadNumber" > 0', [], 'leads_positive_versions');
    table.index(['workspaceId', 'stage', 'archivedAt']); table.index(['workspaceId', 'ownerId']);
    table.index(['workspaceId', 'source']); table.index(['workspaceId', 'createdAt', 'id']); table.index(['workspaceId', 'lastActivityAt']);
  });
  await db.schema.createTable('workspaceLeadCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
  });
  await db.raw('INSERT INTO "workspaceLeadCounters" ("workspaceId","lastNumber") SELECT "workspaceId", max("leadNumber") FROM leads GROUP BY "workspaceId"');
  // Allocates under a row lock, including old callers that do not know about the new columns.
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
  await db.schema.createTable('leadActivity', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('leadId').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL'); table.text('actorName');
    table.text('actorType').notNullable(); table.text('type').notNullable(); table.jsonb('changes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable(); table.index(['workspaceId', 'leadId', 'createdAt', 'id']);
    table.check(`"actorType" IN ('user','assistant-confirmed','system')`);
  });
  await db.raw(`INSERT INTO "leadActivity" (id,"workspaceId","leadId","actorId","actorName","actorType",type,changes,"createdAt")
    SELECT l.id,l."workspaceId",l.id,l."createdBy",u.name,CASE WHEN u.id IS NULL THEN 'system' ELSE 'user' END,'created',jsonb_build_object('source',l.source),l."createdAt" FROM leads l LEFT JOIN users u ON u.id=l."createdBy"`);
  await db.raw(`CREATE FUNCTION record_lead_creation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "leadActivity" (id,"workspaceId","leadId","actorId","actorName","actorType",type,changes,"createdAt")
    VALUES (NEW.id,NEW."workspaceId",NEW.id,NEW."createdBy",(SELECT name FROM users WHERE id=NEW."createdBy"),CASE WHEN NEW."createdBy" IS NULL THEN 'system' ELSE 'user' END,'created',jsonb_build_object('source',NEW.source),NEW."createdAt"); RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER record_lead_creation AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION record_lead_creation()');
  await db.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public');
  for (const field of ['name', 'email', 'service', 'address']) await db.raw('CREATE INDEX ?? ON leads USING gin (?? public.gin_trgm_ops)', [`leads_${field}_search`, field]);
  await db.raw(`CREATE INDEX leads_phone_search ON leads USING gin ((regexp_replace(phone,'[^0-9]','','g')) public.gin_trgm_ops)`);
}
export async function down() { throw new Error('Lead numbering/stage backfill is forward-only; restore a snapshot if needed.'); }

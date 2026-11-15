import type { Knex } from 'knex';

export async function createEstimateTables(db: Knex) {
  await db.schema.createTable('workspaceEstimateCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
    table.check('"lastNumber" > 0');
  });
  await db.schema.createTable('workspaceEstimateSettings', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    for (const field of ['businessName', 'address', 'phone', 'replyToEmail']) table.text(field).notNullable().defaultTo('');
    table.text('logoFileId');
    table.text('licenseLine').notNullable().defaultTo('');
    table.integer('defaultTaxRateMilliPercent').notNullable().defaultTo(0);
    table.integer('validForDays').notNullable().defaultTo(30);
    table.jsonb('paymentTermPresets').notNullable().defaultTo('[]');
    table.text('defaultMessage').notNullable().defaultTo('');
    table.text('defaultTerms').notNullable().defaultTo('');
    table.text('defaultDepositType').notNullable().defaultTo('none');
    table.decimal('defaultDepositValue', 12, 3).notNullable().defaultTo(0);
    table.text('numberPrefix').notNullable().defaultTo('EST-');
    table.text('updatedBy').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('version').notNullable().defaultTo(1);
    table.boolean('requireServiceAddress').notNullable().defaultTo(true);
    table.check(`"defaultTaxRateMilliPercent" BETWEEN 0 AND 100000 AND "validForDays" BETWEEN 1 AND 365 AND "defaultDepositType" IN ('none','percent','amount') AND "defaultDepositValue" >= 0`);
    table.check(`char_length("businessName") <= 200 AND char_length(address) <= 500 AND char_length(phone) <= 100 AND char_length("replyToEmail") <= 254 AND char_length("licenseLine") <= 200 AND char_length("defaultMessage") <= 2000 AND char_length("defaultTerms") <= 5000`);
  });
  await db.schema.createTable('estimates', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('estimateNumber').notNullable();
    table.integer('revision').notNullable().defaultTo(1);
    table.text('name').notNullable();
    table.text('status').notNullable().defaultTo('draft');
    table.text('parentType').notNullable();
    table.uuid('leadId'); table.uuid('jobId'); table.uuid('customerId'); table.text('ownerId');
    for (const field of ['recipientName', 'recipientEmail', 'serviceAddress', 'scope', 'message', 'termsNote', 'paymentTerms', 'internalNotes']) table.text(field).notNullable().defaultTo('');
    table.text('depositType').notNullable().defaultTo('none');
    table.decimal('depositValue', 12, 3).notNullable().defaultTo(0);
    table.integer('taxRateMilliPercent').notNullable().defaultTo(0);
    table.text('discountType').notNullable().defaultTo('none');
    table.decimal('discountValue', 12, 3).notNullable().defaultTo(0);
    for (const field of ['subtotalCents', 'discountCents', 'taxCents', 'totalCents', 'depositCents', 'balanceCents']) table.bigint(field);
    table.text('currency').notNullable().defaultTo('USD');
    table.date('validUntil');
    for (const field of ['sentAt', 'publishedAt', 'decidedAt']) table.timestamp(field, { useTz: true });
    table.text('decidedBy').references('id').inTable('users').onDelete('SET NULL');
    table.text('decisionChannel');
    table.text('decisionNote').notNullable().defaultTo('');
    table.uuid('supersededById');
    table.timestamp('archivedAt', { useTz: true });
    table.text('archivedBy').references('id').inTable('users').onDelete('SET NULL');
    table.text('voidReason').notNullable().defaultTo('');
    table.integer('version').notNullable().defaultTo(1);
    table.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('paymentLink').notNullable().defaultTo('');
    table.bigint('acceptedTotalCents');
    table.uuid('sourceEstimateId');
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'estimateNumber', 'revision']);
    table.unique(['workspaceId', 'estimateNumber', 'id'], { indexName: 'estimates_family_id_unique' });
    for (const fields of [['workspaceId', 'status', 'archivedAt', 'updatedAt', 'id'], ['workspaceId', 'estimateNumber', 'revision'],
      ['workspaceId', 'leadId'], ['workspaceId', 'jobId'], ['workspaceId', 'ownerId'], ['workspaceId', 'validUntil', 'status']]) table.index(fields);
    table.foreign(['workspaceId', 'leadId']).references(['workspaceId', 'id']).inTable('leads');
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs');
    table.foreign(['workspaceId', 'customerId']).references(['workspaceId', 'id']).inTable('customers');
    table.foreign('ownerId').references('id').inTable('users').onDelete('SET NULL');
    table.foreign(['workspaceId', 'supersededById']).references(['workspaceId', 'id']).inTable('estimates');
    table.foreign(['workspaceId', 'estimateNumber', 'sourceEstimateId'], 'estimates_revision_source_fk').references(['workspaceId', 'estimateNumber', 'id']).inTable('estimates');
    table.check(`("parentType" = 'lead' AND "leadId" IS NOT NULL AND "jobId" IS NULL) OR ("parentType" = 'job' AND "jobId" IS NOT NULL AND "leadId" IS NULL)`);
    table.check(`status IN ('draft','sent','published','accepted','declined','expired','superseded','void') AND "estimateNumber" > 0 AND revision > 0 AND version > 0`);
    table.check(`"depositType" IN ('none','percent','amount') AND "discountType" IN ('none','percent','amount') AND "depositValue" >= 0 AND "discountValue" >= 0 AND "taxRateMilliPercent" BETWEEN 0 AND 100000`);
    table.check(`currency = 'USD' AND char_length(name) BETWEEN 1 AND 120 AND char_length("recipientName") <= 200 AND char_length("recipientEmail") <= 254 AND char_length("serviceAddress") <= 500 AND char_length(scope) <= 5000 AND char_length(message) <= 2000 AND char_length("termsNote") <= 5000 AND char_length("paymentTerms") <= 500 AND char_length("internalNotes") <= 5000 AND char_length("decisionNote") <= 500 AND char_length("voidReason") <= 500`);
    table.check(`"decisionChannel" IS NULL OR "decisionChannel" IN ('email','phone','in-person','other')`);
    table.check(`("subtotalCents" IS NULL OR "subtotalCents" >= 0) AND ("discountCents" IS NULL OR "discountCents" >= 0) AND ("taxCents" IS NULL OR "taxCents" >= 0) AND ("totalCents" IS NULL OR "totalCents" >= 0) AND ("depositCents" IS NULL OR "depositCents" >= 0) AND ("balanceCents" IS NULL OR "balanceCents" >= 0)`);
    table.check('length("paymentLink") <= 2048', [], 'estimate_payment_link_length_check');
    table.check('"acceptedTotalCents" IS NULL OR "acceptedTotalCents" >= 0', [], 'estimates_accepted_total_check');
    table.check('"sourceEstimateId" IS NULL OR ("sourceEstimateId" <> id AND revision > 1)', [], 'estimates_revision_source_check');
  });
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_accepted_estimate_fk FOREIGN KEY ("workspaceId","acceptedEstimateId") REFERENCES estimates("workspaceId","id") ON DELETE SET NULL ("acceptedEstimateId")`);
  await db.raw(`CREATE UNIQUE INDEX estimates_one_pending_revision ON estimates ("workspaceId", "estimateNumber") WHERE "sourceEstimateId" IS NOT NULL AND status = 'draft'`);
  await db.raw(`CREATE FUNCTION assign_estimate_number() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."estimateNumber" IS NULL THEN
        INSERT INTO "workspaceEstimateCounters" ("workspaceId","lastNumber")
        VALUES (NEW."workspaceId",1)
        ON CONFLICT ("workspaceId") DO UPDATE
          SET "lastNumber" = "workspaceEstimateCounters"."lastNumber" + 1
        RETURNING "lastNumber" INTO NEW."estimateNumber";
      END IF;
      RETURN NEW;
    END
  $$`);
  await db.raw('CREATE TRIGGER assign_estimate_number BEFORE INSERT ON estimates FOR EACH ROW EXECUTE FUNCTION assign_estimate_number()');
  await db.schema.createTable('workspaceEstimateRevisionCounters', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('estimateNumber').notNullable();
    table.integer('lastRevision').notNullable();
    table.primary(['workspaceId', 'estimateNumber']);
    table.check('"estimateNumber" > 0 AND "lastRevision" > 0');
  });
  await db.raw(`CREATE FUNCTION assign_estimate_revision() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."sourceEstimateId" IS NULL THEN
        INSERT INTO "workspaceEstimateRevisionCounters" ("workspaceId","estimateNumber","lastRevision")
        VALUES (NEW."workspaceId",NEW."estimateNumber",NEW.revision)
        ON CONFLICT ("workspaceId","estimateNumber") DO UPDATE
        SET "lastRevision" = greatest("workspaceEstimateRevisionCounters"."lastRevision", EXCLUDED."lastRevision");
      ELSE
        INSERT INTO "workspaceEstimateRevisionCounters" ("workspaceId","estimateNumber","lastRevision")
        VALUES (NEW."workspaceId",NEW."estimateNumber",1)
        ON CONFLICT ("workspaceId","estimateNumber") DO UPDATE
        SET "lastRevision" = "workspaceEstimateRevisionCounters"."lastRevision" + 1
        RETURNING "lastRevision" INTO NEW.revision;
      END IF;
      RETURN NEW;
    END
  $$`);
  await db.raw('CREATE TRIGGER assign_estimate_revision BEFORE INSERT ON estimates FOR EACH ROW EXECUTE FUNCTION assign_estimate_revision()');
}

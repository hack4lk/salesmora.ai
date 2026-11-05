import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

const tables = ['captureGmailAccounts', 'captureGmailCredentials', 'captureGmailOAuthAttempts', 'captureGmailMailboxState', 'captureGmailEligibilityWindows', 'captureGmailMessageJobs'];
function base(db: Knex, table: Knex.CreateTableBuilder) {
  table.uuid('id').primary();
  table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
  table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  table.unique(['workspaceId', 'id']);
}
function positive(table: Knex.CreateTableBuilder, name: string) {
  table.integer(name).notNullable().defaultTo(1); table.check(`"${name}" > 0`);
}
function account(table: Knex.CreateTableBuilder) {
  table.uuid('accountId').notNullable();
  table.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
}
function gmailSource(table: Knex.CreateTableBuilder) {
  table.uuid('sourceId').notNullable(); table.text('sourceType').notNullable().defaultTo('gmail'); table.check('"sourceType" = \'gmail\'');
  table.foreign(['workspaceId', 'sourceId', 'sourceType']).references(['workspaceId', 'id', 'type']).inTable('captureSources').deferrable('deferred');
}
export async function up(db: Knex) {
  await db.raw(`CREATE FUNCTION capture_gmail_envelope_valid(value jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
    SELECT COALESCE(jsonb_typeof(value) = 'object'
      AND value - ARRAY['schemaVersion','keyId','iv','tag','ciphertext'] = '{}'::jsonb
      AND value->'schemaVersion' = '1'::jsonb
      AND jsonb_typeof(value->'keyId') = 'string' AND value->>'keyId' ~ '^[a-zA-Z0-9_-]{1,64}$'
      AND jsonb_typeof(value->'iv') = 'string' AND value->>'iv' ~ '^[A-Za-z0-9+/]{16}$'
      AND jsonb_typeof(value->'tag') = 'string' AND value->>'tag' ~ '^[A-Za-z0-9+/]{22}==$'
      AND jsonb_typeof(value->'ciphertext') = 'string' AND length(value->>'ciphertext') BETWEEN 4 AND 65536
      AND value->>'ciphertext' ~ '^[A-Za-z0-9+/]+={0,2}$', false)
  $$`);
  await db.schema.createTable('captureGmailAccounts', table => {
    base(db, table); table.text('providerSubject').notNullable(); table.text('email').notNullable();
    table.text('status').notNullable(); positive(table, 'version'); positive(table, 'credentialGeneration');
    table.text('connectedBy').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('length("providerSubject") BETWEEN 1 AND 255'); table.check('length(email) BETWEEN 3 AND 254');
    table.check("status IN ('connected','reconnect-required','disconnected')");
    table.unique(['workspaceId', 'providerSubject']);
    table.unique(['workspaceId', 'id', 'credentialGeneration'], { indexName: 'capture_gmail_account_generation' });
  });
  await db.raw(`CREATE FUNCTION capture_gmail_identity_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF (NEW.id, NEW."workspaceId", NEW."providerSubject") IS DISTINCT FROM (OLD.id, OLD."workspaceId", OLD."providerSubject") THEN
        RAISE EXCEPTION 'Gmail account identity is immutable' USING ERRCODE = '23514';
      END IF;
      RETURN NEW;
    END
  $$`);
  await db.raw('CREATE TRIGGER capture_gmail_identity_immutable BEFORE UPDATE ON "captureGmailAccounts" FOR EACH ROW EXECUTE FUNCTION capture_gmail_identity_immutable()');
  await db.schema.createTable('captureGmailCredentials', table => {
    base(db, table); account(table); positive(table, 'generation'); table.jsonb('envelope').notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'accountId']); table.check('capture_gmail_envelope_valid(envelope)');
    table.foreign(['workspaceId', 'accountId', 'generation']).references(['workspaceId', 'id', 'credentialGeneration']).inTable('captureGmailAccounts').deferrable('deferred');
  });
  await db.schema.createTable('captureGmailOAuthAttempts', table => {
    base(db, table); gmailSource(table);
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('requestId').notNullable(); table.text('stateHash').notNullable().unique(); table.text('sessionHash').notNullable();
    table.jsonb('envelope').notNullable(); positive(table, 'expectedSourceVersion'); positive(table, 'expectedDraftVersion');
    table.uuid('reconnectAccountId'); table.integer('expectedAccountVersion');
    table.foreign(['workspaceId', 'reconnectAccountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    table.text('state').notNullable().defaultTo('pending'); table.timestamp('expiresAt', { useTz: true }).notNullable(); table.timestamp('resolvedAt', { useTz: true });
    table.check('"stateHash" ~ \'^[a-f0-9]{64}$\' AND "sessionHash" ~ \'^[a-f0-9]{64}$\'');
    table.check('capture_gmail_envelope_valid(envelope)');
    table.check("state IN ('pending','consumed','cancelled')");
    table.check('(state = \'pending\') = ("resolvedAt" IS NULL)');
    table.check('"expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + interval \'10 minutes\'');
    table.check('("reconnectAccountId" IS NULL AND "expectedAccountVersion" IS NULL) OR ("reconnectAccountId" IS NOT NULL AND "expectedAccountVersion" > 0 AND "expectedAccountVersion" IS NOT NULL)');
    table.unique(['workspaceId', 'userId', 'requestId']); table.index(['expiresAt']);
  });
  await db.schema.createTable('captureGmailMailboxState', table => {
    base(db, table); account(table); positive(table, 'version'); positive(table, 'credentialGeneration');
    table.text('historyId'); table.uuid('leaseId'); table.timestamp('leaseUntil', { useTz: true });
    table.timestamp('nextSyncAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); table.timestamp('lastSuccessAt', { useTz: true });
    table.text('failure'); table.integer('attempts').notNullable().defaultTo(0);
    table.check('"historyId" IS NULL OR "historyId" ~ \'^[0-9]{1,30}$\'');
    table.check('("leaseId" IS NULL) = ("leaseUntil" IS NULL)'); table.check('attempts >= 0');
    table.check("failure IS NULL OR failure IN ('authorization','rate-limit','provider','cursor-expired','recovery-required')");
    table.unique(['workspaceId', 'accountId']); table.index(['nextSyncAt']);
  });
  await db.schema.createTable('captureGmailEligibilityWindows', table => {
    base(db, table); account(table); gmailSource(table); positive(table, 'configurationVersion');
    table.text('startHistoryId').notNullable(); table.timestamp('startedAt', { useTz: true }).notNullable(); table.timestamp('endedAt', { useTz: true });
    table.check('"startHistoryId" ~ \'^[0-9]{1,30}$\''); table.check('"endedAt" IS NULL OR "endedAt" >= "startedAt"');
    table.foreign(['workspaceId', 'sourceId', 'configurationVersion']).references(['workspaceId', 'sourceId', 'configurationVersion']).inTable('captureSourceVersions').deferrable('deferred');
    table.unique(['workspaceId', 'id', 'sourceId', 'accountId', 'configurationVersion'], { indexName: 'capture_gmail_window_binding' });
  });
  await db.raw('CREATE UNIQUE INDEX capture_gmail_open_window ON "captureGmailEligibilityWindows" ("workspaceId", "sourceId") WHERE "endedAt" IS NULL');
  await db.schema.alterTable('captureReceipts', table => {
    table.unique(['workspaceId', 'sourceId', 'id', 'connectionId', 'messageId'], { indexName: 'capture_gmail_receipt_binding' });
  });
  await db.schema.createTable('captureGmailMessageJobs', table => {
    base(db, table); account(table); gmailSource(table); table.uuid('windowId').notNullable(); positive(table, 'configurationVersion');
    table.foreign(['workspaceId', 'windowId', 'sourceId', 'accountId', 'configurationVersion']).references(['workspaceId', 'id', 'sourceId', 'accountId', 'configurationVersion']).inTable('captureGmailEligibilityWindows').deferrable('deferred');
    table.text('messageId').notNullable(); table.text('state').notNullable().defaultTo('pending');
    table.uuid('leaseId'); table.timestamp('leaseUntil', { useTz: true }); table.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('attempts').notNullable().defaultTo(0); table.text('failure'); table.uuid('receiptId');
    table.foreign(['workspaceId', 'sourceId', 'receiptId', 'accountId', 'messageId'], 'capture_gmail_job_receipt').references(['workspaceId', 'sourceId', 'id', 'connectionId', 'messageId']).inTable('captureReceipts').deferrable('deferred');
    table.check('length("messageId") BETWEEN 1 AND 500'); table.check('attempts >= 0');
    table.check("state IN ('pending','processing','retry','accepted','ignored','failed')");
    table.check('("leaseId" IS NULL) = ("leaseUntil" IS NULL)'); table.check('(state = \'processing\') = ("leaseId" IS NOT NULL)');
    table.check('(state = \'accepted\') = ("receiptId" IS NOT NULL)');
    table.check("failure IS NULL OR failure IN ('authorization','rate-limit','provider','content','extraction','unavailable')");
    table.unique(['workspaceId', 'sourceId', 'accountId', 'messageId'], { indexName: 'capture_gmail_message_identity' });
    table.index(['state', 'retryAt']);
  });
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  for (const table of tables) if (await db(table).first('id')) throw Error('Retained Gmail records require this migration. Disconnecting does not authorize dropping evidence.');
  for (const table of [...tables].reverse()) await db.schema.dropTable(table);
  await db.schema.alterTable('captureReceipts', table => { table.dropUnique([], 'capture_gmail_receipt_binding'); });
  await db.raw('DROP FUNCTION capture_gmail_envelope_valid(jsonb)');
  await db.raw('DROP FUNCTION capture_gmail_identity_immutable()');
}

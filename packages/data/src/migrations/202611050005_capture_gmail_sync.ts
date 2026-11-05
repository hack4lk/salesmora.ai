import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.schema.alterTable('captureGmailMailboxState', t => {
    t.text('pageToken'); t.integer('scanPages').notNullable().defaultTo(0);
    t.timestamp('recoveryStartedAt', { useTz: true }); t.timestamp('recoveryUntil', { useTz: true }); t.text('recoveryHistoryId');
    t.check('"pageToken" IS NULL OR length("pageToken") BETWEEN 1 AND 2048', [], 'capture_gmail_sync_1');
    t.check('"scanPages" BETWEEN 0 AND 100', [], 'capture_gmail_sync_2');
    t.check('("recoveryStartedAt" IS NULL) = ("recoveryUntil" IS NULL) AND ("recoveryUntil" IS NULL) = ("recoveryHistoryId" IS NULL)', [], 'capture_gmail_sync_3');
    t.check('"recoveryHistoryId" IS NULL OR "recoveryHistoryId" ~ \'^[0-9]{1,30}$\'', [], 'capture_gmail_sync_4');
    t.check('"recoveryUntil" IS NULL OR ("recoveryUntil" > "recoveryStartedAt" AND "recoveryUntil" <= "recoveryStartedAt" + interval \'7 days\')', [], 'capture_gmail_sync_5');
  });
  // Stable-mailbox deduplication cannot depend on a reconnect's account generation.
  await db.schema.alterTable('captureGmailMessageJobs', t => {
    t.text('observedHistoryId'); t.check('"observedHistoryId" IS NULL OR "observedHistoryId" ~ \'^[0-9]{1,30}$\'', [], 'capture_gmail_sync_6');
  });
  await db.raw(`CREATE FUNCTION capture_gmail_close_source_window() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF OLD.type = 'gmail' AND (NEW.status <> 'active' OR NEW.block <> 'none' OR NEW."approvedVersion" IS DISTINCT FROM OLD."approvedVersion") THEN
      UPDATE "captureGmailEligibilityWindows" SET "endedAt" = GREATEST("startedAt", clock_timestamp()) WHERE "workspaceId" = NEW."workspaceId" AND "sourceId" = NEW.id AND "endedAt" IS NULL;
      UPDATE "captureGmailMessageJobs" SET state = 'ignored', "leaseId" = NULL, "leaseUntil" = NULL, failure = 'unavailable' WHERE "workspaceId" = NEW."workspaceId" AND "sourceId" = NEW.id AND state IN ('pending','processing','retry');
    END IF; RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER capture_gmail_close_source_window AFTER UPDATE ON "captureSources" FOR EACH ROW EXECUTE FUNCTION capture_gmail_close_source_window()');
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  if (await db('captureGmailMailboxState').first('id') || await db('captureGmailMessageJobs').first('id')) throw Error('Retained Gmail work requires synchronization metadata.');
  await db.raw('DROP TRIGGER capture_gmail_close_source_window ON "captureSources"');
  await db.raw('DROP FUNCTION capture_gmail_close_source_window()');
  await db.schema.alterTable('captureGmailMessageJobs', t => { t.dropColumn('observedHistoryId'); });
  await db.schema.alterTable('captureGmailMailboxState', t => { for (const name of ['pageToken', 'scanPages', 'recoveryStartedAt', 'recoveryUntil', 'recoveryHistoryId']) t.dropColumn(name); });
}

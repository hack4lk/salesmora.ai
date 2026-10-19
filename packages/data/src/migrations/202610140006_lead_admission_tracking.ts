import type {Knex} from 'knex';
export async function up(db:Knex){
  // Close the rollout gap: the previous app can still insert leads while migrations run.
  await db.raw('LOCK TABLE leads IN SHARE ROW EXCLUSIVE MODE');
  await db.raw(`CREATE FUNCTION record_lead_admission() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceLeadAdmissions" ("leadId","workspaceId","createdAt")
    VALUES (NEW.id,NEW."workspaceId",NEW."createdAt") ON CONFLICT ("leadId") DO NOTHING;
    RETURN NEW;
  END $$`);
  await db.raw('CREATE TRIGGER record_lead_admission AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION record_lead_admission()');
  await db.raw('INSERT INTO "workspaceLeadAdmissions" ("leadId","workspaceId","createdAt") SELECT id,"workspaceId","createdAt" FROM leads ON CONFLICT ("leadId") DO NOTHING');
}
export async function down(){throw Error('Lead admission accounting is forward-only');}

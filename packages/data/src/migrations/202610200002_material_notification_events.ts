import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.raw(`DO $$ DECLARE c text; BEGIN FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = '"materialNotifications"'::regclass AND contype = 'c' LOOP EXECUTE format('ALTER TABLE "materialNotifications" DROP CONSTRAINT %I', c); END LOOP; END $$`);
  await db.raw(`ALTER TABLE "materialNotifications" ADD CHECK (event IN ('proposed','approved','edited','rejected'))`);
}
export async function down(db: Knex) {
  await db('materialNotifications').whereIn('event', ['proposed', 'edited']).delete();
  await db.raw(`DO $$ DECLARE c text; BEGIN FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = '"materialNotifications"'::regclass AND contype = 'c' LOOP EXECUTE format('ALTER TABLE "materialNotifications" DROP CONSTRAINT %I', c); END LOOP; END $$`);
  await db.raw(`ALTER TABLE "materialNotifications" ADD CHECK (event IN ('approved','rejected'))`);
}

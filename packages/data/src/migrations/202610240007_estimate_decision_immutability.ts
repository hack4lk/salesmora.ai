import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.raw(`CREATE FUNCTION protect_estimate_decision() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."actorId" IS NULL AND (to_jsonb(NEW) - 'actorId') = (to_jsonb(OLD) - 'actorId') THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'Estimate decisions are immutable';
    END
  $$`);
  await db.raw(`CREATE TRIGGER protect_estimate_decision BEFORE UPDATE ON estimate_decisions
    FOR EACH ROW EXECUTE FUNCTION protect_estimate_decision()`);
}

export async function down(db: Knex) {
  await db.raw("DROP TRIGGER protect_estimate_decision ON estimate_decisions");
  await db.raw("DROP FUNCTION protect_estimate_decision()");
}

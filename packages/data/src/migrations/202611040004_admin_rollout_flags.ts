import type { Knex } from 'knex';
import { applyAdminIdentityGrants, applyAdminRuntimeFeatureFlagGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('rolloutFlags', table => {
    table.text('key').primary();
    table.text('description').notNullable();
    table.boolean('enabled').notNullable().defaultTo(false);
    table.text('updatedBy').notNullable().references('id').inTable('admin.staffUsers');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"key" ~ '^[a-z][a-z0-9._-]{0,99}$'`);
    table.check('char_length(btrim(description)) BETWEEN 1 AND 200');
  });
  await db.raw(`
    CREATE FUNCTION public.is_salesmora_rollout_enabled(flag_key text)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = pg_catalog, admin, pg_temp
    AS $function$
      SELECT COALESCE((SELECT enabled FROM admin."rolloutFlags" WHERE key = flag_key), FALSE)
    $function$
  `);
  await db.raw('REVOKE ALL ON FUNCTION public.is_salesmora_rollout_enabled(text) FROM PUBLIC');
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeFeatureFlagGrants(db);
}

export async function down(db: Knex) {
  await db.raw('DROP FUNCTION public.is_salesmora_rollout_enabled(text)');
  await db.schema.withSchema('admin').dropTable('rolloutFlags');
}

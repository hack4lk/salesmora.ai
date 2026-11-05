import type { Knex } from 'knex';
import { applyAdminIdentityGrants, applyAdminRuntimeSettingsGrants, RUNTIME_LOGIN_ROLES } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('systemSettingVersions', table => {
    table.uuid('id').primary();
    table.text('key').notNullable();
    table.integer('version').notNullable();
    table.jsonb('value').notNullable();
    table.text('reason').notNullable();
    table.text('createdBy').notNullable().references('id').inTable('admin.staffUsers');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['key', 'version']);
    table.check(`"key" = 'default_monthly_ai_tokens'`);
    table.check('"version" > 0');
    table.check(`jsonb_typeof(value) = 'object' AND jsonb_exists(value, 'monthlyTokens') AND (
      jsonb_typeof(value->'monthlyTokens') = 'null' OR
      CASE WHEN jsonb_typeof(value->'monthlyTokens') = 'number' THEN
        (value->>'monthlyTokens') ~ '^(0|[1-9][0-9]*)$' AND
        char_length(value->>'monthlyTokens') <= 13 AND
        (value->>'monthlyTokens')::numeric BETWEEN 0 AND 1000000000000
      ELSE false END
    )`);
    table.check('char_length(btrim(reason)) BETWEEN 10 AND 500');
  });
  await db.raw(`
    CREATE FUNCTION public.get_default_monthly_ai_tokens()
    RETURNS bigint
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = pg_catalog, admin, pg_temp
    AS $function$
      SELECT CASE
        WHEN jsonb_typeof(value->'monthlyTokens') = 'number'
        THEN (value->>'monthlyTokens')::bigint
        ELSE NULL
      END
      FROM admin."systemSettingVersions"
      WHERE key = 'default_monthly_ai_tokens'
      ORDER BY version DESC
      LIMIT 1
    $function$
  `);
  await db.raw('REVOKE ALL ON FUNCTION public.get_default_monthly_ai_tokens() FROM PUBLIC');
  for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
    const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
      'SELECT to_regrole(?) IS NOT NULL AS exists', [role],
    );
    if (exists) {
      await db.raw('GRANT EXECUTE ON FUNCTION public.get_default_monthly_ai_tokens() TO ??', [role]);
    }
  }
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeSettingsGrants(db);
}

export async function down(db: Knex) {
  await db.raw('REVOKE ALL ON FUNCTION public.get_default_monthly_ai_tokens() FROM PUBLIC');
  for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
    const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
      'SELECT to_regrole(?) IS NOT NULL AS exists', [role],
    );
    if (exists) await db.raw('REVOKE ALL ON FUNCTION public.get_default_monthly_ai_tokens() FROM ??', [role]);
  }
  await db.raw('DROP FUNCTION public.get_default_monthly_ai_tokens()');
  await db.schema.withSchema('admin').dropTable('systemSettingVersions');
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeSettingsGrants(db);
}

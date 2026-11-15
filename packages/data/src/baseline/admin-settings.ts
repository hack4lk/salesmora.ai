import type { Knex } from 'knex';

export async function createAdminSettingsTables(db: Knex) {
  await db.schema.withSchema('admin').createTable('aiModelPricing', table => {
    table.uuid('id').primary();
    table.text('model').notNullable();
    table.decimal('inputUsdPerMillion', 14, 6).notNullable();
    table.decimal('cachedInputUsdPerMillion', 14, 6).notNullable();
    table.decimal('outputUsdPerMillion', 14, 6).notNullable();
    table.text('source').notNullable();
    table.timestamp('effectiveFrom', { useTz: true }).notNullable();
    table.text('createdBy').notNullable().references('id').inTable('admin.staffUsers');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['model', 'effectiveFrom']);
    table.check('char_length("model") BETWEEN 1 AND 128');
    table.check('char_length("source") BETWEEN 1 AND 500');
    table.check('"inputUsdPerMillion" >= 0 AND "cachedInputUsdPerMillion" >= 0 AND "outputUsdPerMillion" >= 0');
    table.index(['model', 'effectiveFrom']);
  });
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
  await db.schema.withSchema('admin').createTable('featureFlags', table => {
    table.text('id').primary();
    table.boolean('defaultEnabled').notNullable();
    table.boolean('enabled').notNullable();
    table.text('owner').notNullable();
    table.text('description').notNullable();
    table.timestamp('expiresAt', { useTz: true });
    table.text('updatedBy').references('id').inTable('admin.staffUsers');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"id" IN ('chat.enabled', 'estimate.sharing.enabled')`);
    table.check('char_length(btrim("owner")) BETWEEN 1 AND 100');
    table.check('char_length(btrim("description")) BETWEEN 1 AND 500');
  });
  await db.schema.withSchema('admin').createTable('featureFlagOverrides', table => {
    table.text('flagId').notNullable().references('id').inTable('admin.featureFlags').onDelete('CASCADE');
    table.text('targetType').notNullable();
    table.text('targetId').notNullable();
    table.boolean('enabled').notNullable();
    table.timestamp('expiresAt', { useTz: true });
    table.text('reason').notNullable();
    table.text('updatedBy').notNullable().references('id').inTable('admin.staffUsers');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['flagId', 'targetType', 'targetId']);
    table.check(`"targetType" IN ('plan', 'workspace')`);
    table.check(`("targetType" <> 'plan' OR "targetId" IN ('free', 'standard', 'premium'))`);
    table.check(`("targetType" <> 'workspace' OR "targetId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')`);
    table.check('char_length(btrim(reason)) BETWEEN 10 AND 500');
    table.index(['flagId', 'targetType', 'targetId']);
  });
  await db('featureFlags').withSchema('admin').insert([
    { id: 'chat.enabled', defaultEnabled: true, enabled: true, owner: 'Product',
      description: 'Allows workspace members to use the AI assistant in the application.' },
    { id: 'estimate.sharing.enabled', defaultEnabled: true, enabled: true, owner: 'Product',
      description: 'Allows workspaces to share estimates with customers.' },
  ]);
  await db.raw(`
    CREATE FUNCTION public.is_salesmora_feature_enabled(flag_id text, plan_id text, workspace_id text)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = pg_catalog, admin, pg_temp
    AS $function$
      SELECT COALESCE(
        (SELECT enabled FROM admin."featureFlagOverrides"
          WHERE "flagId" = flag_id AND "targetType" = 'workspace' AND "targetId" = workspace_id
            AND ("expiresAt" IS NULL OR "expiresAt" > statement_timestamp())),
        (SELECT enabled FROM admin."featureFlagOverrides"
          WHERE "flagId" = flag_id AND "targetType" = 'plan' AND "targetId" = plan_id
            AND ("expiresAt" IS NULL OR "expiresAt" > statement_timestamp())),
        (SELECT enabled FROM admin."featureFlags"
          WHERE id = flag_id AND ("expiresAt" IS NULL OR "expiresAt" > statement_timestamp())),
        (SELECT "defaultEnabled" FROM admin."featureFlags" WHERE id = flag_id),
        FALSE
      )
    $function$
  `);
  await db.raw('REVOKE ALL ON FUNCTION public.is_salesmora_feature_enabled(text,text,text) FROM PUBLIC');
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
}

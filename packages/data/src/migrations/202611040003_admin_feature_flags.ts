import type { Knex } from 'knex';
import {
  applyAdminIdentityGrants,
  applyAdminRuntimeFeatureFlagGrants,
  RUNTIME_LOGIN_ROLES,
} from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('featureFlags', table => {
    table.text('id').primary();
    table.boolean('defaultEnabled').notNullable();
    table.boolean('enabled').notNullable();
    table.text('owner').notNullable();
    table.text('description').notNullable();
    table.timestamp('expiresAt', { useTz: true }).nullable();
    table.text('updatedBy').nullable().references('id').inTable('admin.staffUsers');
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
    table.timestamp('expiresAt', { useTz: true }).nullable();
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

  await db.withSchema('admin').table('featureFlags').insert([
    {
      id: 'chat.enabled',
      defaultEnabled: true,
      enabled: true,
      owner: 'Product',
      description: 'Allows workspace members to use the AI assistant in the application.',
    },
    {
      id: 'estimate.sharing.enabled',
      defaultEnabled: true,
      enabled: true,
      owner: 'Product',
      description: 'Allows workspaces to share estimates with customers.',
    },
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
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeFeatureFlagGrants(db);
}

export async function down(db: Knex) {
  await db.raw('REVOKE ALL ON FUNCTION public.is_salesmora_feature_enabled(text,text,text) FROM PUBLIC');
  for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
    const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
      'SELECT to_regrole(?) IS NOT NULL AS exists', [role],
    );
    if (exists) await db.raw('REVOKE ALL ON FUNCTION public.is_salesmora_feature_enabled(text,text,text) FROM ??', [role]);
  }
  await db.raw('DROP FUNCTION public.is_salesmora_feature_enabled(text,text,text)');
  await db.schema.withSchema('admin').dropTable('featureFlagOverrides');
  await db.schema.withSchema('admin').dropTable('featureFlags');
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeFeatureFlagGrants(db);
}

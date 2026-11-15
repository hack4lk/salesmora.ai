import type { Knex } from 'knex';
import {
  applyAdminAuditGrants,
  applyAdminIdentityGrants,
  applyAdminRuntimeFeatureFlagGrants,
  applyAdminRuntimeSettingsGrants,
  applyAuditWorkerGrants,
  applyRuntimeGrants,
  RUNTIME_LOGIN_ROLES,
} from '../runtime-roles';

export async function applyBaselineGrants(db: Knex) {
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
  await applyAdminAuditGrants(db);
  await applyAuditWorkerGrants(db);
  await applyAdminRuntimeSettingsGrants(db);
  await applyAdminRuntimeFeatureFlagGrants(db);
  const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
    'SELECT to_regrole(?) IS NOT NULL AS exists', [RUNTIME_LOGIN_ROLES.web],
  );
  if (exists) {
    for (const signature of [
      'public.complete_admin_user_email_change(text)',
      'public.read_owner_workspace_export(uuid,text)',
      'public.record_owner_workspace_export_download(uuid,text)',
    ]) {
      await db.raw(`GRANT EXECUTE ON FUNCTION ${signature} TO ??`, [RUNTIME_LOGIN_ROLES.web]);
    }
  }
}

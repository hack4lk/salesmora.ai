import type { Knex } from 'knex';
import { applyAdminIdentityGrants, applyRuntimeGrants } from '../runtime-roles';

const readFunction = `
CREATE FUNCTION public.read_owner_workspace_export(p_request_id uuid, p_user_id text)
RETURNS TABLE (
  "workspaceName" text,
  "expiresAt" timestamptz,
  "objectKey" text,
  "encryptedDek" bytea,
  "fileIv" bytea,
  "fileAuthTag" bytea,
  "artifactSizeBytes" bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, admin
AS $$
  SELECT w."businessName", r."expiresAt", a."objectKey", a."encryptedDek",
    a."fileIv", a."fileAuthTag", a."artifactSizeBytes"
  FROM admin."workspaceExportRequests" r
  JOIN admin."workspaceExportArtifacts" a ON a."requestId" = r.id
  JOIN public.workspaces w ON w.id = r."workspaceId" AND w."ownerId" = p_user_id
  JOIN public."workspaceMemberships" m ON m."workspaceId" = w.id AND m."userId" = p_user_id AND m.role = 'owner'
  JOIN public.users u ON u.id = p_user_id AND u.id = w."ownerId"
  WHERE r.id = p_request_id
    AND r."ownerUserId" = p_user_id
    AND r.state = 'ready'
    AND r."expiresAt" > statement_timestamp()
    AND u."emailVerified" = true
    AND u."deletionRequestedAt" IS NULL
    AND u."suspendedAt" IS NULL
    AND w."deletionRequestedAt" IS NULL
    AND w."suspendedAt" IS NULL
$$`;

const recordDownloadFunction = `
CREATE FUNCTION public.record_owner_workspace_export_download(p_request_id uuid, p_user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, admin
AS $$
DECLARE
  export_request admin."workspaceExportRequests"%ROWTYPE;
  downloaded_at timestamptz := clock_timestamp();
BEGIN
  SELECT r.* INTO export_request
  FROM admin."workspaceExportRequests" r
  JOIN admin."workspaceExportArtifacts" a ON a."requestId" = r.id
  JOIN public.workspaces w ON w.id = r."workspaceId" AND w."ownerId" = p_user_id
  JOIN public."workspaceMemberships" m ON m."workspaceId" = w.id AND m."userId" = p_user_id AND m.role = 'owner'
  JOIN public.users u ON u.id = p_user_id AND u.id = w."ownerId"
  WHERE r.id = p_request_id
    AND r."ownerUserId" = p_user_id
    AND r.state = 'ready'
    AND r."expiresAt" > downloaded_at
    AND u."emailVerified" = true
    AND u."deletionRequestedAt" IS NULL
    AND u."suspendedAt" IS NULL
    AND w."deletionRequestedAt" IS NULL
    AND w."suspendedAt" IS NULL
  FOR UPDATE OF r;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE admin."workspaceExportRequests"
    SET "downloadedAt" = downloaded_at, "updatedAt" = downloaded_at
    WHERE id = p_request_id;
  INSERT INTO public."accountAudit" ("userId", action, "actorType", "actorId", reason, details)
    VALUES (p_user_id, 'workspace.export.downloaded', 'system', p_user_id, 'Owner downloaded their workspace data export.',
      jsonb_build_object('requestId', p_request_id, 'workspaceId', export_request."workspaceId"));
  RETURN true;
END;
$$`;

export async function up(db: Knex) {
  await db.schema.withSchema('admin').alterTable('workspaceExportRequests', table => {
    table.text('notificationStatus').notNullable().defaultTo('pending');
    table.integer('notificationAttempts').notNullable().defaultTo(0);
    table.timestamp('nextNotificationAt', { useTz: true });
    table.timestamp('notificationSentAt', { useTz: true });
    table.index(['notificationStatus', 'nextNotificationAt', 'expiresAt']);
  });
  await db.raw(`ALTER TABLE admin."workspaceExportRequests"
    ADD CONSTRAINT workspace_export_notification_status_check
      CHECK ("notificationStatus" IN ('pending', 'sent', 'failed')),
    ADD CONSTRAINT workspace_export_notification_attempts_check
      CHECK ("notificationAttempts" >= 0)`);
  await db.raw(`ALTER TABLE public."accountAudit" DROP CONSTRAINT IF EXISTS "accountAudit_action_check"`);
  await db.raw(`ALTER TABLE public."accountAudit"
    ADD CONSTRAINT "accountAudit_action_check"
    CHECK (action IN ('sessions.revoked', 'email.marked_verified', 'email.changed', 'workspace.export.downloaded'))`);
  await db.raw(readFunction);
  await db.raw(recordDownloadFunction);
  await db.raw('REVOKE ALL ON FUNCTION public.read_owner_workspace_export(uuid, text) FROM PUBLIC');
  await db.raw('REVOKE ALL ON FUNCTION public.record_owner_workspace_export_download(uuid, text) FROM PUBLIC');
  const webRole = await db('pg_roles').where({ rolname: 'salesmora_web' }).first('rolname');
  if (webRole) {
    await db.raw('GRANT EXECUTE ON FUNCTION public.read_owner_workspace_export(uuid, text) TO salesmora_web');
    await db.raw('GRANT EXECUTE ON FUNCTION public.record_owner_workspace_export_download(uuid, text) TO salesmora_web');
  }
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.raw('REVOKE ALL ON FUNCTION public.read_owner_workspace_export(uuid, text) FROM PUBLIC');
  await db.raw('REVOKE ALL ON FUNCTION public.record_owner_workspace_export_download(uuid, text) FROM PUBLIC');
  const webRole = await db('pg_roles').where({ rolname: 'salesmora_web' }).first('rolname');
  if (webRole) {
    await db.raw('REVOKE ALL ON FUNCTION public.read_owner_workspace_export(uuid, text) FROM salesmora_web');
    await db.raw('REVOKE ALL ON FUNCTION public.record_owner_workspace_export_download(uuid, text) FROM salesmora_web');
  }
  await db.raw('DROP FUNCTION public.record_owner_workspace_export_download(uuid, text)');
  await db.raw('DROP FUNCTION public.read_owner_workspace_export(uuid, text)');
  await db.raw(`ALTER TABLE public."accountAudit" DROP CONSTRAINT IF EXISTS "accountAudit_action_check"`);
  await db.raw(`ALTER TABLE public."accountAudit"
    ADD CONSTRAINT "accountAudit_action_check"
    CHECK (action IN ('sessions.revoked', 'email.marked_verified', 'email.changed'))`);
  await db.schema.withSchema('admin').alterTable('workspaceExportRequests', table => {
    table.dropIndex(['notificationStatus', 'nextNotificationAt', 'expiresAt']);
    table.dropColumn('notificationSentAt');
    table.dropColumn('nextNotificationAt');
    table.dropColumn('notificationAttempts');
    table.dropColumn('notificationStatus');
  });
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
}

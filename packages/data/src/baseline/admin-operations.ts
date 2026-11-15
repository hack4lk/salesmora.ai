import type { Knex } from 'knex';

export async function createAdminOperationTables(db: Knex) {
  await db.schema.withSchema('admin').createTable('userEmailChanges', table => {
    table.uuid('id').primary();
    table.text('tokenHash').notNullable().unique();
    table.text('userId').notNullable();
    table.text('oldEmail').notNullable();
    table.text('newEmail').notNullable();
    table.text('reason').notNullable();
    table.text('requestedBy').notNullable();
    table.text('staffRole').notNullable();
    table.text('requestId').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('consumedAt', { useTz: true });
    table.timestamp('completedAt', { useTz: true });
    table.timestamp('invalidatedAt', { useTz: true });
    table.integer('sessionsRevoked');
    table.check(`"staffRole" = 'super_admin'`);
    table.check('"newEmail" = lower(btrim("newEmail"))');
    table.check('"expiresAt" > "createdAt"');
    table.check('("completedAt" IS NULL) = ("consumedAt" IS NULL)');
    table.check('"sessionsRevoked" IS NULL OR "sessionsRevoked" >= 0');
    table.index(['userId', 'createdAt']);
  });
  await db.raw(`CREATE UNIQUE INDEX user_email_change_one_pending_per_user
    ON admin."userEmailChanges" ("userId")
    WHERE "consumedAt" IS NULL AND "invalidatedAt" IS NULL`);
  await db.raw(`
CREATE FUNCTION public.complete_admin_user_email_change(p_token_hash text)
RETURNS TABLE (result text, user_id text, sessions_revoked integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, admin
AS $$
DECLARE
  pending admin."userEmailChanges"%ROWTYPE;
  account public.users%ROWTYPE;
  revoked_count integer;
  completed_at timestamptz := clock_timestamp();
BEGIN
  IF p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::text, 0;
    RETURN;
  END IF;

  SELECT * INTO pending
    FROM admin."userEmailChanges"
    WHERE "tokenHash" = p_token_hash
    FOR UPDATE;
  IF NOT FOUND OR pending."consumedAt" IS NOT NULL OR pending."invalidatedAt" IS NOT NULL THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::text, 0;
    RETURN;
  END IF;
  IF pending."expiresAt" <= completed_at THEN
    RETURN QUERY SELECT 'expired'::text, NULL::text, 0;
    RETURN;
  END IF;

  SELECT * INTO account FROM public.users WHERE id = pending."userId" FOR UPDATE;
  IF NOT FOUND OR account."deletionRequestedAt" IS NOT NULL OR
      lower(btrim(account.email)) <> lower(btrim(pending."oldEmail")) THEN
    UPDATE admin."userEmailChanges" SET "invalidatedAt" = completed_at WHERE id = pending.id;
    RETURN QUERY SELECT 'ineligible'::text, pending."userId", 0;
    RETURN;
  END IF;

  BEGIN
    UPDATE public.users SET email = pending."newEmail", "emailVerified" = true, "updatedAt" = completed_at
      WHERE id = pending."userId";
  EXCEPTION WHEN unique_violation THEN
    UPDATE admin."userEmailChanges" SET "invalidatedAt" = completed_at WHERE id = pending.id;
    RETURN QUERY SELECT 'email_taken'::text, pending."userId", 0;
    RETURN;
  END;

  DELETE FROM public.sessions WHERE "userId" = pending."userId";
  GET DIAGNOSTICS revoked_count = ROW_COUNT;
  INSERT INTO public."accountAudit" (
    "userId", action, "actorType", "actorId", reason, details
  ) VALUES (
    pending."userId", 'email.changed', 'staff', pending."requestedBy", pending.reason,
    jsonb_build_object('sessionsRevoked', revoked_count)
  );
  UPDATE admin."userEmailChanges"
    SET "consumedAt" = completed_at, "completedAt" = completed_at, "sessionsRevoked" = revoked_count
    WHERE id = pending.id;
  RETURN QUERY SELECT 'completed'::text, pending."userId", revoked_count;
END;
$$`);
  await db.raw('REVOKE ALL ON FUNCTION public.complete_admin_user_email_change(text) FROM PUBLIC');
  await db.schema.withSchema('admin').createTable('workspaceInvitationDeliveries', table => {
    table.uuid('id').primary();
    table.uuid('invitationId').notNullable().references('id').inTable('public.workspaceInvitations').onDelete('CASCADE');
    table.text('tokenHash').notNullable();
    table.text('encryptedPayload');
    table.text('status').notNullable().defaultTo('pending');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('sentAt', { useTz: true });
    table.check(`"status" IN ('pending', 'sent', 'failed', 'superseded')`);
    table.check('"attempts" BETWEEN 0 AND 5');
    table.index(['invitationId', 'createdAt']);
  });
  await db.schema.withSchema('admin').createTable('workspaceExportRequests', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('workspaceName').notNullable();
    table.text('ownerUserId').notNullable();
    table.text('ownerName').notNullable();
    table.text('maskedOwnerEmail').notNullable();
    table.text('requestedBy').notNullable();
    table.text('requestedByName').notNullable();
    table.text('requestedByRole').notNullable();
    table.text('reason').notNullable();
    table.text('state').notNullable().defaultTo('queued');
    table.timestamp('requestedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('expiresAt', { useTz: true });
    table.integer('csvCount');
    table.integer('fileMetadataCount');
    table.timestamp('downloadedAt', { useTz: true });
    table.integer('attempts').notNullable().defaultTo(0);
    table.text('failureCode');
    table.timestamp('nextAttemptAt', { useTz: true });
    table.text('notificationStatus').notNullable().defaultTo('pending');
    table.integer('notificationAttempts').notNullable().defaultTo(0);
    table.timestamp('nextNotificationAt', { useTz: true });
    table.timestamp('notificationSentAt', { useTz: true });
    table.check(`"requestedByRole" IN ('super_admin', 'support')`);
    table.check(`"state" IN ('queued', 'generating', 'ready', 'expired', 'failed')`);
    table.check('char_length(btrim("workspaceName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("ownerName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("requestedByName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("reason")) BETWEEN 10 AND 500');
    table.check('"csvCount" IS NULL OR "csvCount" >= 0');
    table.check('"fileMetadataCount" IS NULL OR "fileMetadataCount" >= 0');
    table.check('"attempts" >= 0');
    table.check(`"notificationStatus" IN ('pending', 'sent', 'failed')`, [], 'workspace_export_notification_status_check');
    table.check('"notificationAttempts" >= 0', [], 'workspace_export_notification_attempts_check');
    table.index(['state', 'requestedAt']);
    table.index(['workspaceId', 'requestedAt']);
    table.index(['notificationStatus', 'nextNotificationAt', 'expiresAt']);
  });
  await db.schema.withSchema('admin').createTable('workspaceExportArtifacts', table => {
    table.uuid('requestId').primary().references('id').inTable('admin.workspaceExportRequests').onDelete('CASCADE');
    table.text('objectKey').notNullable().unique();
    table.binary('encryptedDek').notNullable();
    table.binary('fileIv').notNullable();
    table.binary('fileAuthTag').notNullable();
    table.bigint('archiveSizeBytes').notNullable();
    table.bigint('artifactSizeBytes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('octet_length("encryptedDek") = 64');
    table.check('octet_length("fileIv") = 16');
    table.check('octet_length("fileAuthTag") = 16');
    table.check('"archiveSizeBytes" > 0 AND "artifactSizeBytes" > 0');
  });
  await db.raw(`
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
$$`);
  await db.raw(`
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
$$`);
  await db.raw('REVOKE ALL ON FUNCTION public.read_owner_workspace_export(uuid, text) FROM PUBLIC');
  await db.raw('REVOKE ALL ON FUNCTION public.record_owner_workspace_export_download(uuid, text) FROM PUBLIC');
}

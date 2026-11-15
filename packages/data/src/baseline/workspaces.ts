import type { Knex } from 'knex';

export async function createWorkspaceTables(db: Knex) {
  await db.schema.createTable('workspaces', table => {
    table.uuid('id').primary();
    table.text('ownerId').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.text('businessName').notNullable();
    table.text('businessType').notNullable();
    table.text('postalCode').notNullable();
    table.text('serviceRange').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('deletionRequestedAt', { useTz: true });
    table.text('timezone').notNullable().defaultTo('UTC');
    table.text('businessPhone').notNullable().defaultTo('');
    table.boolean('workOrderSignoffRequired').notNullable().defaultTo(false);
    table.timestamp('suspendedAt', { useTz: true });
    table.text('suspendedReason');
    table.text('planOverride');
    table.timestamp('planOverrideEndsAt', { useTz: true });
    table.text('planOverrideReason');
    table.uuid('planOverrideId');
    table.check('("suspendedAt" IS NULL) = ("suspendedReason" IS NULL)', [], 'workspaces_suspension_pair');
    table.check(`"planOverride" IN ('standard', 'premium')`, [], 'workspaces_plan_override_plan');
    table.check(`num_nulls("planOverride", "planOverrideEndsAt", "planOverrideReason", "planOverrideId") IN (0, 4)`,
      [], 'workspaces_plan_override_set');
  });
  await db.raw('CREATE INDEX workspaces_suspended_idx ON workspaces ("suspendedAt") WHERE "suspendedAt" IS NOT NULL');
  await db.raw('CREATE INDEX workspaces_plan_override_ends_idx ON workspaces ("planOverrideEndsAt") WHERE "planOverrideEndsAt" IS NOT NULL');

  await db.schema.createTable('workspaceMemberships', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('role').notNullable();
    table.primary(['workspaceId', 'userId']);
    table.index('userId');
    table.check(`role IN ('owner', 'admin', 'office', 'field')`, [], 'workspaceMemberships_authorization_role_check');
  });
  await db.schema.createTable('workspaceServices', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('service').notNullable();
    table.primary(['workspaceId', 'service']);
  });
  await db.schema.createTable('workspaceInvitations', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('email').notNullable();
    table.text('role').notNullable();
    table.text('status').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('tokenHash').unique();
    table.timestamp('expiresAt', { useTz: true });
    table.timestamp('sentAt', { useTz: true });
    table.timestamp('acceptedAt', { useTz: true });
    table.text('acceptedBy').references('id').inTable('users').onDelete('SET NULL');
    table.integer('deliveryAttempts').notNullable().defaultTo(0);
    table.timestamp('lastAttemptAt', { useTz: true });
    table.text('inviterId').references('id').inTable('users').onDelete('SET NULL');
    table.unique(['workspaceId', 'email']);
    table.index(['status', 'workspaceId']);
    table.check(`status IN ('pending_verification', 'queued', 'sent', 'accepted', 'revoked')`);
    table.check(`role IN ('admin', 'office', 'field')`, [], 'workspaceInvitations_authorization_role_check');
  });
  await db.schema.createTable('workspacePolicies', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('revision').notNullable().defaultTo(0);
    table.integer('templateVersion').notNullable().defaultTo(1);
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('revision >= 0');
    table.check('"templateVersion" = 1');
  });
  await db.schema.createTable('workspaceRolePolicies', table => {
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspacePolicies').onDelete('CASCADE');
    table.text('role').notNullable();
    table.text('permission').notNullable();
    table.text('scope').notNullable();
    table.primary(['workspaceId', 'role', 'permission']);
    table.check(`role IN ('owner', 'admin', 'office', 'field')`);
    table.check(`scope IN ('enabled', 'workspace', 'assigned', 'related_assigned', 'assigned_job', 'own_assigned')`);
  });
  await db.raw(`ALTER TABLE "workspaceRolePolicies" ADD CONSTRAINT "workspaceRolePolicies_admin_actions_check" CHECK (
    permission NOT LIKE '%.export' AND permission NOT LIKE '%.delete' AND permission NOT LIKE '%.archive'
    OR role IN ('owner', 'admin') OR (permission IN ('estimates.archive', 'estimates.delete', 'leadCapture.archive')
    AND role = 'office'))`);
  await db.raw(`ALTER TABLE "workspaceRolePolicies" ADD CONSTRAINT "workspaceRolePolicies_check1" CHECK (
    permission NOT IN ('permissions.read', 'permissions.manage', 'billing.manage', 'ownership.transfer') OR role = 'owner')`);
  await db.schema.createTable('authorizationAudit', table => {
    table.bigIncrements('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.text('action').notNullable();
    table.integer('beforeRevision');
    table.integer('afterRevision').notNullable();
    table.jsonb('beforePolicy');
    table.jsonb('afterPolicy').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
  });

  await db.raw(`CREATE FUNCTION authorization_lock_workspace() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE wid uuid;
    BEGIN
      IF TG_OP = 'UPDATE' AND OLD."workspaceId" <> NEW."workspaceId" THEN
        RAISE EXCEPTION 'Cannot move authorization rows between workspaces';
      END IF;
      IF TG_OP = 'DELETE' THEN wid := OLD."workspaceId"; ELSE wid := NEW."workspaceId"; END IF;
      PERFORM 1 FROM workspaces WHERE id = wid FOR UPDATE;
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END $$`);
  for (const table of ['workspaceMemberships', 'workspacePolicies', 'workspaceRolePolicies']) {
    await db.raw('CREATE TRIGGER authorization_lock BEFORE INSERT OR UPDATE OR DELETE ON ?? FOR EACH ROW EXECUTE FUNCTION authorization_lock_workspace()', [table]);
  }
  await db.raw(`CREATE FUNCTION authorization_check_owner() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE wid uuid; owner_id text; owner_count integer;
    BEGIN
      IF TG_TABLE_NAME = 'workspaces' THEN
        IF TG_OP = 'DELETE' THEN wid := OLD.id; ELSE wid := NEW.id; END IF;
      ELSE
        IF TG_OP = 'DELETE' THEN wid := OLD."workspaceId"; ELSE wid := NEW."workspaceId"; END IF;
      END IF;
      SELECT "ownerId" INTO owner_id FROM workspaces WHERE id = wid;
      IF NOT FOUND THEN RETURN NULL; END IF;
      SELECT count(*) INTO owner_count FROM "workspaceMemberships" WHERE "workspaceId" = wid AND role = 'owner';
      IF owner_count <> 1 OR NOT EXISTS (SELECT 1 FROM "workspaceMemberships" WHERE "workspaceId" = wid AND "userId" = owner_id AND role = 'owner') THEN
        RAISE EXCEPTION 'Workspace requires exactly one matching Owner';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM "workspacePolicies" WHERE "workspaceId" = wid) THEN
        RAISE EXCEPTION 'Workspace requires a persisted authorization policy';
      END IF;
      RETURN NULL;
    END $$`);
  for (const table of ['workspaces', 'workspaceMemberships', 'workspacePolicies']) {
    await db.raw('CREATE CONSTRAINT TRIGGER authorization_owner_invariant AFTER INSERT OR UPDATE OR DELETE ON ?? DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION authorization_check_owner()', [table]);
  }
  await db.raw(`CREATE FUNCTION authorization_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Authorization audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER authorization_audit_immutable BEFORE UPDATE OR DELETE ON "authorizationAudit" FOR EACH ROW EXECUTE FUNCTION authorization_audit_immutable()');
}

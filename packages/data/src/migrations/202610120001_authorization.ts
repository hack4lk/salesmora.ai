/** Controlled cutover paired with the four-role application adapters. Forward-only after enforcement. */
import type { Knex } from 'knex';
import defaults from '../authorization/defaults-v1.json' with { type: 'json' };

export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw new Error('Authorization cutover requires one transaction.');
  // Caller uses one transaction. Reject damaged historical ownership rather than inventing an Owner.
  const invalid = await db('workspaces as w').whereRaw(`NOT EXISTS (
    SELECT 1 FROM "workspaceMemberships" m WHERE m."workspaceId" = w.id AND m."userId" = w."ownerId" AND m.role = 'owner'
  ) OR (SELECT count(*) FROM "workspaceMemberships" m WHERE m."workspaceId" = w.id AND m.role = 'owner') <> 1`).first('w.id');
  if (invalid) throw new Error('Repair workspace ownership before authorization migration.');
  for (const table of ['workspaceMemberships', 'workspaceInvitations']) {
    const checks = await db.raw(`SELECT conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid = ?::regclass AND contype = 'c'`, [`"${table}"`]);
    for (const check of checks.rows as { conname: string; definition: string }[]) {
      if (/\brole\b/.test(check.definition)) await db.raw('ALTER TABLE ?? DROP CONSTRAINT ??', [table, check.conname]);
    }
    await db(table).where({ role: 'member' }).update({ role: db.ref('profile') });
    await db.schema.alterTable(table, t => t.check(table === 'workspaceMemberships'
      ? "role IN ('owner', 'admin', 'office', 'field')" : "role IN ('admin', 'office', 'field')", [], `${table}_authorization_role_check`));
  }
  for (const table of ['workspaceMemberships', 'workspaceInvitations']) {
    await db.schema.alterTable(table, t => t.dropColumn('profile'));
  }
  await db.schema.alterTable('workspaceInvitations', t => t.text('inviterId').references('id').inTable('users').onDelete('SET NULL'));
  await db.raw(`UPDATE "workspaceInvitations" i SET "inviterId" = w."ownerId" FROM workspaces w WHERE i."workspaceId" = w.id`);
  await db.schema.createTable('workspacePolicies', t => {
    t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    t.integer('revision').notNullable().defaultTo(0); t.check('revision >= 0');
    t.integer('templateVersion').notNullable().defaultTo(1); t.check('"templateVersion" = 1');
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('workspaceRolePolicies', t => {
    t.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspacePolicies').onDelete('CASCADE');
    t.text('role').notNullable(); t.text('permission').notNullable(); t.text('scope').notNullable();
    t.primary(['workspaceId', 'role', 'permission']);
    t.check("role IN ('owner', 'admin', 'office', 'field')");
    t.check("scope IN ('enabled', 'workspace', 'assigned', 'related_assigned', 'assigned_job', 'own_assigned')");
    t.check("permission NOT LIKE '%.export' AND permission NOT LIKE '%.delete' AND permission NOT LIKE '%.archive' OR role IN ('owner', 'admin')");
    t.check("permission NOT IN ('permissions.read', 'permissions.manage', 'billing.manage', 'ownership.transfer') OR role = 'owner'");
  });
  await db.schema.createTable('authorizationAudit', t => {
    t.bigIncrements('id').primary();
    // Retain evidence; deletion workflows must explicitly define retention first.
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('RESTRICT');
    t.text('actorId').notNullable(); t.text('action').notNullable();
    t.integer('beforeRevision').nullable(); t.integer('afterRevision').notNullable();
    t.jsonb('beforePolicy').nullable(); t.jsonb('afterPolicy').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(['workspaceId', 'createdAt']);
  });
  const workspaces = await db('workspaces').select('id', 'ownerId');
  for (const workspace of workspaces) {
    await db('workspacePolicies').insert({ workspaceId: workspace.id });
    await db('workspaceRolePolicies').insert(defaults.map(grant => ({ ...grant, workspaceId: workspace.id })));
    await db('authorizationAudit').insert({ workspaceId: workspace.id, actorId: workspace.ownerId, action: 'migration.seeded',
      beforeRevision: null, afterRevision: 0, afterPolicy: JSON.stringify({ workspaceId: workspace.id, revision: 0, grants: defaults }) });
  }
  // All authority mutations serialize with protected repository reads and policy saves.
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

export async function down() {
  throw new Error('Authorization cutover is forward-only. Do not restore permissive legacy access.');
}

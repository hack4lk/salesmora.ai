import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').alterTable('staffUsers', table => {
    table.timestamp('disabledAt', { useTz: true });
    table.timestamp('accessChangedAt', { useTz: true });
    table.integer('accessVersion').notNullable().defaultTo(0);
    table.check('"accessVersion" >= 0', [], 'staffUsers_access_version_check');
  });
  await db.schema.withSchema('admin').alterTable('approvalRequests', table => {
    table.text('accountUserId').references('id').inTable('admin.staffUsers');
    table.text('accountKind');
    table.text('accountRole');
    table.integer('accountVersion');
    table.check(`("accountUserId" IS NULL AND "accountKind" IS NULL AND "accountRole" IS NULL AND "accountVersion" IS NULL)
      OR ("accountUserId" IS NOT NULL AND "accountKind" IS NOT NULL AND "accountRole" IS NOT NULL AND "accountVersion" IS NOT NULL
      AND "accountKind" IN ('enable', 'role_change') AND "accountRole" IN ('super_admin', 'support', 'billing') AND "accountVersion" >= 0)`,
    [], 'approvalRequests_account_change_check');
  });
  // Serialize session creation with access changes, including in-flight sign-ins.
  await db.raw(`CREATE FUNCTION admin.check_staff_session_access() RETURNS trigger
    LANGUAGE plpgsql SET search_path = pg_catalog, admin AS $$
    DECLARE staff admin."staffUsers"%ROWTYPE;
    BEGIN
      SELECT * INTO staff FROM admin."staffUsers" WHERE id = NEW."userId" FOR SHARE;
      IF NOT FOUND OR staff."disabledAt" IS NOT NULL OR
        (staff."accessChangedAt" IS NOT NULL AND NEW."createdAt" < staff."accessChangedAt") THEN
        RAISE EXCEPTION 'Staff access changed; sign in again' USING ERRCODE = '42501';
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER staff_session_access BEFORE INSERT ON admin."staffSessions"
    FOR EACH ROW EXECUTE FUNCTION admin.check_staff_session_access()`);
  await db.raw('REVOKE ALL ON FUNCTION admin.check_staff_session_access() FROM PUBLIC');
}

export async function down(db: Knex) {
  await db.raw('DROP TRIGGER staff_session_access ON admin."staffSessions"');
  await db.raw('DROP FUNCTION admin.check_staff_session_access()');
  await db.schema.withSchema('admin').alterTable('approvalRequests', table => {
    table.dropColumns('accountUserId', 'accountKind', 'accountRole', 'accountVersion');
  });
  await db.schema.withSchema('admin').alterTable('staffUsers', table => {
    table.dropColumns('disabledAt', 'accessChangedAt', 'accessVersion');
  });
}

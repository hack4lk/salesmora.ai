import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.raw('ALTER TABLE admin."staffInvitations" ALTER COLUMN "invitedBy" DROP NOT NULL');
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.raw('ALTER TABLE admin."staffInvitations" ALTER COLUMN "invitedBy" SET NOT NULL');
  await applyAdminIdentityGrants(db);
}

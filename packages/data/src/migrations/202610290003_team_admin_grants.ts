import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

/** Grants-only: lets the admin app remove members and revoke or resend invitations (0d part b). */
export async function up(db: Knex) {
  await applyRuntimeGrants(db);
}

// Re-applying the earlier grant set would need the previous ADMIN_WRITES list; the extra grants are harmless to keep.
export async function down() {}

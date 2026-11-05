import type { Knex } from 'knex';
import { RUNTIME_LOGIN_ROLES } from '../runtime-roles';

export async function up(db: Knex) {
  const worker = await db('pg_roles').where({ rolname: RUNTIME_LOGIN_ROLES.worker }).first('rolname');
  if (worker) await db.raw('GRANT SELECT ON ?? TO ??', ['workspaceAITokenBudgets', worker.rolname]);
}

export async function down(db: Knex) {
  const worker = await db('pg_roles').where({ rolname: RUNTIME_LOGIN_ROLES.worker }).first('rolname');
  if (worker) await db.raw('REVOKE SELECT ON ?? FROM ??', ['workspaceAITokenBudgets', worker.rolname]);
}

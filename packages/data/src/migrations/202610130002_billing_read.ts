import type { Knex } from 'knex';

/** Add billing visibility without broadening locked Owner-only management powers. */
export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw Error('Billing permission migration requires a transaction.');
  const workspaces = await db('workspaces').select('id', 'ownerId').orderBy('id');
  for (const workspace of workspaces) {
    await db('workspaces').where({id:workspace.id}).forUpdate().first();
    const head = await db('workspacePolicies').where({workspaceId:workspace.id}).first();
    const grants = await db('workspaceRolePolicies').where({workspaceId:workspace.id}).select('role','permission','scope');
    const before = {workspaceId:workspace.id,revision:head.revision,grants};
    await db('workspaceRolePolicies').insert(['owner','admin'].map(role => ({workspaceId:workspace.id,role,permission:'billing.read',scope:'enabled'}))).onConflict(['workspaceId','role','permission']).ignore();
    const afterGrants = await db('workspaceRolePolicies').where({workspaceId:workspace.id}).select('role','permission','scope');
    await db('workspacePolicies').where({workspaceId:workspace.id}).update({revision:head.revision+1,updatedAt:db.fn.now()});
    await db('authorizationAudit').insert({workspaceId:workspace.id,actorId:workspace.ownerId,action:'migration.billing-read',beforeRevision:head.revision,afterRevision:head.revision+1,beforePolicy:JSON.stringify(before),afterPolicy:JSON.stringify({...before,revision:head.revision+1,grants:afterGrants})});
  }
}
export async function down() { throw Error('Billing permission cutover is forward-only.'); }

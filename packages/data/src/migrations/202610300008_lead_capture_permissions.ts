import type { Knex } from 'knex';
import { validateWorkspacePolicy } from '@salesmora/domain';
import { canonicalCaptureGrants, untouchedCaptureDefault } from '../lead-capture/policy-upgrade';

export async function up(db: Knex) {
  await db.raw(`ALTER TABLE "workspaceRolePolicies" DROP CONSTRAINT "workspaceRolePolicies_admin_actions_check"`);
  await db.raw(`ALTER TABLE "workspaceRolePolicies" ADD CONSTRAINT "workspaceRolePolicies_admin_actions_check" CHECK (
    (permission NOT LIKE '%.export' AND permission NOT LIKE '%.delete' AND permission NOT LIKE '%.archive') OR role IN ('owner','admin')
    OR (permission IN ('estimates.archive','estimates.delete','leadCapture.archive') AND role = 'office'))`);
  for (const { workspaceId } of await db('workspacePolicies').select('workspaceId').orderBy('workspaceId')) {
    const workspace = await db('workspaces').where({ id: workspaceId }).forUpdate().first('ownerId');
    const head = await db('workspacePolicies').where({ workspaceId }).first('revision');
    const before = await db('workspaceRolePolicies').where({ workspaceId }).select('role', 'permission', 'scope');
    const audits = await db('authorizationAudit').where({ workspaceId }).orderBy('id').select('action', 'beforeRevision', 'afterRevision', 'beforePolicy', 'afterPolicy');
    const after = canonicalCaptureGrants(before);
    if (untouchedCaptureDefault(workspaceId, head.revision, before, audits) && !after.some(grant => grant.role === 'office' && grant.permission === 'leadCapture.archive')) after.push({ role: 'office', permission: 'leadCapture.archive', scope: 'workspace' });
    const checked = validateWorkspacePolicy({ workspaceId, revision: head.revision + 1, grants: after });
    if (!checked.ok) throw new Error(`Repair Lead Capture policy before migrating workspace ${workspaceId}: ${checked.reason}`);
    await db('workspaceRolePolicies').where({ workspaceId }).delete();
    await db('workspaceRolePolicies').insert(after.map(grant => ({ workspaceId, ...grant })));
    await db('workspacePolicies').where({ workspaceId }).update({ revision: head.revision + 1, updatedAt: db.fn.now() });
    await db('authorizationAudit').insert({ workspaceId, actorId: workspace.ownerId, action: 'migration.lead-capture', beforeRevision: head.revision, afterRevision: head.revision + 1,
      beforePolicy: JSON.stringify({ workspaceId, revision: head.revision, grants: before }), afterPolicy: JSON.stringify(checked.policy) });
  }
}
export async function down() { throw new Error('The audited Lead Capture permission cutover is forward-only.'); }

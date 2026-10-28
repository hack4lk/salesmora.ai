import type { Knex } from 'knex';
import { defaultDeadlineRuleSchema, type AuthorizationContext, type PermissionId, type JobCreationDeadlineContext, type CreateJobInput } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope, defaultJobDeadline } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
export class JobDeadlineReviewConflict extends Error {
  constructor() { super('The deadline rule or creation date changed. Reload the deadline rule and review this Job again.'); }
}
export async function jobDeadlineContextInTransaction(trx: Knex.Transaction, workspaceId: string): Promise<JobCreationDeadlineContext['context'] & { createdAt: Date }> {
  const row = await trx('jobNotificationSettings').where({ workspaceId, section: 'deadline' }).first('version', 'values');
  const workspace = await trx('workspaces').where({ id: workspaceId }).first('timezone');
  const { today, createdAt } = (await trx.raw(`SELECT to_char(at AT TIME ZONE ?, 'YYYY-MM-DD') AS today, at AS \"createdAt\" FROM (SELECT clock_timestamp() AS at) creation`, [workspace.timezone])).rows[0];
  const rule = defaultDeadlineRuleSchema.parse(row?.values ?? { mode: 'unset' });
  return { createdAt, rule, revision: String(row?.version ?? 0), createdDate: today, projectedDate: defaultJobDeadline(today, rule), timezone: workspace.timezone };
}
/** Creation-specific projection: no settings-menu permission, recipient roster or email policy is exposed. */
export async function readJobCreationDeadline(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, c): Promise<JobCreationDeadlineContext> => {
    const resource = { kind: 'job' as const, id: c.workspaceId, workspaceId: c.workspaceId, ownerId: c.userId, teamUserIds: [] };
    if (!authorize(c, { permission: 'jobs.create' }).allowed || !resolveAuthorizedCollectionScope(c, 'jobs.read').allowed || !authorize(c, { permission: 'jobs.assign', resource }).allowed) throw new AuthorizationAccessError();
    const { createdAt: _createdAt, ...context } = await jobDeadlineContextInTransaction(trx, c.workspaceId); void _createdAt;
    return { context, canOverride: authorize(c, { permission: 'jobs.schedule.update', resource }).allowed };
  });
}
/** Called under the creation workspace lock, after receipt lookup and before any insert. */
export async function resolveReviewedJobDeadline(trx: Knex.Transaction, context: AuthorizationContext, input: CreateJobInput) {
  if (!input.deadlineIntent || !input.deadlinePreview) return { completionDeadline: input.completionDeadline ?? null };
  const current = await jobDeadlineContextInTransaction(trx, context.workspaceId), preview = input.deadlinePreview;
  const resolved = input.deadlineIntent.mode === 'workspace' ? current.projectedDate : input.deadlineIntent.mode === 'date' ? input.deadlineIntent.date : null;
  if (preview.revision !== current.revision || preview.createdDate !== current.createdDate || preview.timezone !== current.timezone || preview.resolvedDate !== resolved || input.completionDeadline !== resolved) throw new JobDeadlineReviewConflict();
  return { completionDeadline: resolved, createdAt: current.createdAt };
}

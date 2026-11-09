import type { Knex } from 'knex';
import { jobReportQuerySchema, jobReportReadResultSchema, jobStatuses,
  type AuthorizationContext, type JobReportQuery, type JobReportReadResult } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { jobReportContext } from './job-context';
import { readJobWorkloadReportInTransaction } from './jobs';
import { readJobLifecycleReportInTransaction } from './job-lifecycle';
import { readJobCompletionReportInTransaction } from './job-completion';
import { resolveJobReportExportScope } from './job-export-access';

const activeStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const statusLabels = {
  'needs-scheduling': 'Needs Scheduling', scheduled: 'Scheduled', 'in-progress': 'In Progress',
  waiting: 'Waiting', completed: 'Completed', canceled: 'Canceled',
} as const;

async function readOptions(trx: Knex.Transaction, auth: Awaited<ReturnType<typeof jobReportContext>>, current: boolean) {
  const base = auth.query.clone();
  if (current) base.whereIn('j.status', activeStatuses);
  const owners = await base.clone().leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId')
    .distinct<{ value: string; label: string }[]>(trx.raw(
      `CASE WHEN j."primaryOwnerId" IS NULL THEN 'unassigned' ELSE 'member:' || j."primaryOwnerId" END AS "value",
       CASE WHEN j."primaryOwnerId" IS NULL THEN 'No current primary owner'
         ELSE COALESCE(NULLIF("reportOwner"."name", ''), 'Current teammate') END AS "label"`,
    )).orderBy('value');
  const services = await base.clone().distinct<{ value: string; label: string }[]>(trx.raw(
    `CASE WHEN btrim(j."service") = '' THEN 'none' ELSE 'service:' || btrim(j."service") END AS "value",
     CASE WHEN btrim(j."service") = '' THEN 'No recorded service' ELSE btrim(j."service") END AS "label"`,
  )).orderBy('value');
  return {
    context: current ? 'current' as const : 'period' as const,
    statuses: (current ? activeStatuses : jobStatuses).map(value => ({ value, label: statusLabels[value] })),
    owners, services,
  };
}
export async function readJobReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: JobReportQuery,
): Promise<JobReportReadResult> {
  const query = jobReportQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await jobReportContext(trx, context);
  const report = query.view === 'workload' ? await readJobWorkloadReportInTransaction(trx, context, query)
    : query.view === 'lifecycle' ? await readJobLifecycleReportInTransaction(trx, context, query)
      : await readJobCompletionReportInTransaction(trx, context, query);
  const options = await readOptions(trx, auth, query.view === 'workload');
  return jobReportReadResultSchema.parse({ workspaceId: context.workspaceId, viewerId: context.userId,
    policyRevision: context.policy.revision, scope: auth.scope, exportScope: resolveJobReportExportScope(context),
    today: auth.today, query, report, options });
}
export async function initialJobReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<JobReportReadResult> {
  const { today } = await jobReportContext(trx, context);
  return readJobReportWithAuthorityInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'lifecycle', period: { from: addCalendarDays(today, -29), to: today },
    filters: { statuses: [], owners: [], services: [] }, selectedView: 'created', page: 1, pageSize: 25,
  });
}

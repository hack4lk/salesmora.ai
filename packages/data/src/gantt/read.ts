import type { Knex } from 'knex';
import type { GanttJob, GanttResult, GanttWorkOrder, PermissionId } from '@salesmora/contracts';
import { canViewGantt, isClosedJob } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';

/** Guard against unbounded responses; the caller is told when it was hit. */
export const ganttJobLimit = 300;
/** Closed jobs stay on the chart this long after their last date so recent history is visible. */
const closedJobVisibleDays = 90;

const teamSelect = `(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`;
const formatJobNumber = (n: number) => `J-${String(n).padStart(4, '0')}`;
const formatWorkOrderNumber = (n: number) => `WO-${String(n).padStart(4, '0')}`;

/** Read-only timeline of jobs and their work orders. Visible only where canViewGantt allows it. */
export async function readGantt(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]): Promise<GanttResult> {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    if (!canViewGantt(context)) throw new AuthorizationAccessError();
    const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
    const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [workspace.timezone])).rows[0];

    const members: { id: string; name: string }[] = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
      .where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
    const nameOf = (id: string | null | undefined) => (id ? members.find(member => member.id === id)?.name ?? 'Former teammate' : null);

    const jobRows = await trx('jobs as j').where('j.workspaceId', context.workspaceId)
      .andWhere(q => q.whereNotIn('j.status', ['completed', 'canceled'])
        .orWhereRaw(`coalesce(j."completionDeadline", j."scheduledDate") >= ?::date - ?::int`, [today, closedJobVisibleDays]))
      .select('j.id', 'j.jobNumber', 'j.title', 'j.status', 'j.customerId', 'j.customerName', 'j.primaryOwnerId',
        trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`), trx.raw(teamSelect))
      .orderByRaw('j."scheduledDate" ASC NULLS LAST').orderBy('j.jobNumber').limit(ganttJobLimit + 1);
    const truncated = jobRows.length > ganttJobLimit;
    const visibleJobs = truncated ? jobRows.slice(0, ganttJobLimit) : jobRows;

    const orderRows = visibleJobs.length ? await trx('workOrders as w').where('w.workspaceId', context.workspaceId).whereNull('w.archivedAt')
      .whereIn('w.jobId', visibleJobs.map(job => job.id))
      .select('w.id', 'w.jobId', 'w.workOrderNumber', 'w.title', 'w.status', 'w.primaryAssigneeId',
        trx.raw(`to_char(w."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`),
        trx.raw(`CASE WHEN w.status = 'completed' THEN to_char(w."completedAt" AT TIME ZONE ?, 'YYYY-MM-DD') END AS "completionDate"`, [workspace.timezone]))
      .orderByRaw('w."scheduledDate" ASC NULLS LAST').orderBy('w.workOrderNumber') : [];

    const ordersByJob = new Map<string, GanttWorkOrder[]>();
    for (const row of orderRows) {
      const order: GanttWorkOrder = { id: row.id, jobId: row.jobId, number: formatWorkOrderNumber(row.workOrderNumber), title: row.title, status: row.status,
        scheduledDate: row.scheduledDate, completionDate: row.completionDate, assigneeId: row.primaryAssigneeId, assigneeName: nameOf(row.primaryAssigneeId) };
      ordersByJob.set(row.jobId, [...(ordersByJob.get(row.jobId) ?? []), order]);
    }

    const jobs: GanttJob[] = visibleJobs.map(row => ({ id: row.id, number: formatJobNumber(row.jobNumber), title: row.title, status: row.status,
      customerId: row.customerId, customerName: row.customerName, scheduledDate: row.scheduledDate, completionDeadline: row.completionDeadline,
      primaryOwnerId: row.primaryOwnerId, primaryOwnerName: nameOf(row.primaryOwnerId), teamUserIds: row.teamUserIds,
      overdue: !isClosedJob(row.status) && !!row.completionDeadline && row.completionDeadline < today, workOrders: ordersByJob.get(row.id) ?? [] }));

    const customers = [...new Map(jobs.map(job => [job.customerId, { id: job.customerId, name: job.customerName }])).values()]
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    return { jobs, teamMembers: members, customers, today, truncated };
  });
}

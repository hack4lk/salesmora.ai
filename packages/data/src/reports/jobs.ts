import type { Knex } from 'knex';
import {
  jobWorkloadQuerySchema,
  jobWorkloadResultSchema,
  jobWaitingReasons,
  type AuthorizationContext,
  type JobWorkloadQuery,
  type JobWorkloadResult,
} from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { jobReportContext } from './job-context';
import { applyJobReportFilters, validateJobReportFilters } from './job-filters';

const activeStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const waitingLabels = {
  customer: 'Waiting on customer',
  materials: 'Waiting on materials',
  approval: 'Waiting on approval',
  other: 'Other',
} as const;
const statusLabels = {
  'needs-scheduling': 'Needs Scheduling',
  scheduled: 'Scheduled',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
} as const;
const metrics = ['active', 'overdue', 'dueSoon', 'noDeadline', 'waiting', 'unassigned'] as const;
type RawJob = {
  id: string;
  jobNumber: number;
  title: string;
  customerName: string;
  status: typeof activeStatuses[number];
  primaryOwnerId: string | null;
  ownerName: string | null;
  service: string;
  completionDeadline: string | null;
  scheduledDate: string | null;
  waitingReason: typeof jobWaitingReasons[number] | null;
};
type GroupRow = { id: string; label: string; count: string | number };

function safeCount(value: unknown): number {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Job workload count is outside the safe integer range.');
  }
  return count;
}

function serviceId(service: string): string {
  return service ? `service:${service}` : 'none';
}

function groupRows(rows: readonly GroupRow[]) {
  return rows.map(row => ({
    id: row.id,
    label: row.label,
    count: safeCount(row.count),
  }));
}

export function selectJobWorkloadProjection(
  query: Knex.QueryBuilder,
  selection: JobWorkloadQuery['selection'],
  today: string,
): Knex.QueryBuilder {
  if (selection.kind === 'metric') {
    switch (selection.metric) {
      case 'active':
        return query;
      case 'overdue':
        return query.whereRaw('j."completionDeadline" < ?::date', [today]);
      case 'dueSoon':
        return query.whereRaw('j."completionDeadline" BETWEEN ?::date AND ?::date', [
          today,
          addCalendarDays(today, 7),
        ]);
      case 'noDeadline':
        return query.whereNull('j.completionDeadline');
      case 'waiting':
        return query.where('j.status', 'waiting');
      case 'unassigned':
        return query.whereNull('j.primaryOwnerId');
    }
  }
  switch (selection.group) {
    case 'status':
      if (!activeStatuses.includes(selection.id as typeof activeStatuses[number])) {
        throw new RangeError('The selected Job status group is invalid.');
      }
      return query.where('j.status', selection.id);
    case 'owner':
      if (selection.id === 'unassigned') return query.whereNull('j.primaryOwnerId');
      if (!selection.id.startsWith('member:') || selection.id.length === 7) {
        throw new RangeError('The selected Job owner group is invalid.');
      }
      return query.where('j.primaryOwnerId', selection.id.slice('member:'.length));
    case 'service':
      if (selection.id === 'none') return query.whereRaw('btrim(j."service") = ?', ['']);
      if (!selection.id.startsWith('service:') || selection.id.length === 8) {
        throw new RangeError('The selected Job service group is invalid.');
      }
      return query.whereRaw('btrim(j."service") = ?', [selection.id.slice('service:'.length)]);
    case 'waitingReason':
      if (!jobWaitingReasons.includes(selection.id as typeof jobWaitingReasons[number])) {
        throw new RangeError('The selected Job waiting-reason group is invalid.');
      }
      return query.where('j.waitingReason', selection.id);
  }
}

async function countQuery(query: Knex.QueryBuilder): Promise<number> {
  const row = await query.count<{ count: string }[]>({ count: 'j.id' }).first();
  return safeCount(row?.count ?? 0);
}

async function readWorkload(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  query: JobWorkloadQuery,
  auth: Awaited<ReturnType<typeof jobReportContext>>,
): Promise<JobWorkloadResult> {
  const active = auth.query.clone().whereIn('j.status', activeStatuses);
  await validateJobReportFilters(active, query.filters, trx);
  const filtered = applyJobReportFilters(active.clone(), query.filters);
  const counts = await jobWorkloadCounts(trx, filtered, auth.today);

  const statusRows = await filtered.clone()
    .select('j.status')
    .count<{ status: string; count: string }[]>({ count: 'j.id' })
    .groupBy('j.status');
  const ownerRows = await filtered.clone()
    .leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId')
    .select(trx.raw(
      `CASE WHEN j."primaryOwnerId" IS NULL THEN 'unassigned'
       ELSE 'member:' || j."primaryOwnerId" END AS "id",
       COALESCE("reportOwner"."name", 'Current teammate') AS "label"`,
    ))
    .count<{ id: string; label: string; count: string }[]>({ count: 'j.id' })
    .groupBy('j.primaryOwnerId', 'reportOwner.name');
  const serviceRows = await filtered.clone()
    .select(trx.raw(
      `CASE WHEN btrim(j."service") = '' THEN 'none'
       ELSE 'service:' || btrim(j."service") END AS "id",
       CASE WHEN btrim(j."service") = '' THEN 'No recorded service'
       ELSE btrim(j."service") END AS "label"`,
    ))
    .count<{ id: string; label: string; count: string }[]>({ count: 'j.id' })
    .groupByRaw('btrim(j."service")');
  const waitingRows = await filtered.clone()
    .where('j.status', 'waiting')
    .select('j.waitingReason as id')
    .count<{ id: string; count: string }[]>({ count: 'j.id' })
    .groupBy('j.waitingReason');
  const groups = {
    status: activeStatuses.map(status => ({
      id: status,
      label: statusLabels[status],
      count: safeCount(statusRows.find(row => row.status === status)?.count ?? 0),
      evidenceId: `status:${status}`,
    })),
    owner: [
      ...groupRows(ownerRows).map(row => ({
        ...row,
        label: row.id === 'unassigned' ? 'No current primary owner' : row.label,
        evidenceId: `owner:${row.id}`,
      })),
      ...(!ownerRows.some(row => row.id === 'unassigned')
        ? [{ id: 'unassigned', label: 'No current primary owner', count: 0, evidenceId: 'owner:unassigned' }]
        : []),
    ],
    service: groupRows(serviceRows).map(row => ({ ...row, evidenceId: `service:${row.id}` })),
    waitingReason: jobWaitingReasons.map(reason => ({
      id: reason,
      label: waitingLabels[reason],
      count: safeCount(waitingRows.find(row => row.id === reason)?.count ?? 0),
      evidenceId: `waitingReason:${reason}`,
    })),
  };
  if (!groups.service.some(group => group.id === 'none')) {
    groups.service.push({ id: 'none', label: 'No recorded service', count: 0, evidenceId: 'service:none' });
  }
  const selection = query.selection;
  if (selection.kind === 'group') {
    const selectedGroups = groups[selection.group];
    if (!selectedGroups.some(group => group.id === selection.id)) {
      throw new RangeError('The selected Job workload group is no longer available.');
    }
  }

  const evidenceQuery = selectJobWorkloadProjection(filtered.clone(), selection, auth.today);
  const evidenceTotal = await countQuery(evidenceQuery.clone());
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  const rawRows = await evidenceQuery
    .leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId')
    .select(
      'j.id',
      'j.jobNumber',
      'j.title',
      'j.customerName',
      'j.status',
      'j.primaryOwnerId',
      'reportOwner.name as ownerName',
      trx.raw('btrim(j."service") AS "service"'),
      trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`),
      trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`),
      'j.waitingReason',
    )
    .orderByRaw('j."completionDeadline" ASC NULLS LAST')
    .orderByRaw('j."scheduledDate" ASC NULLS LAST')
    .orderBy('j.jobNumber', 'asc')
    .orderBy('j.id', 'asc')
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize) as RawJob[];
  const rows = rawRows.map(row => {
    const id = serviceId(row.service);
    return {
      id: row.id,
      recordId: row.id,
      label: `J-${String(row.jobNumber).padStart(4, '0')} / ${row.title || row.customerName}`,
      cells: {
        owner: row.primaryOwnerId === null ? 'No current primary owner' : row.ownerName || 'Current teammate',
        service: row.service || 'No recorded service',
      },
      status: row.status,
      completionDeadline: row.completionDeadline,
      scheduledDate: row.scheduledDate,
      primaryOwnerId: row.primaryOwnerId,
      serviceId: id,
      waitingReason: row.waitingReason,
    };
  });
  return jobWorkloadResultSchema.parse({
    view: 'workload',
    asOf: auth.asOf.toISOString(),
    today: auth.today,
    timezone: auth.timezone,
    scopeLabel: auth.scopeLabel,
    filters: query.filters,
    counts,
    groups,
    evidenceIds: Object.fromEntries(metrics.map(metric => [metric, metric])),
    selection,
    page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows,
  });
}

export async function jobWorkloadCounts(trx: Knex.Transaction, scoped: Knex.QueryBuilder, today: string) {
  const filtered = scoped.clone().whereIn('j.status', activeStatuses);
  const windowEnd = addCalendarDays(today, 7);
  const metricRow = await filtered.clone().select(trx.raw(
    `COUNT(*) AS "active",
     COUNT(*) FILTER (WHERE j."completionDeadline" < ?::date) AS "overdue",
     COUNT(*) FILTER (WHERE j."completionDeadline" BETWEEN ?::date AND ?::date) AS "dueSoon",
     COUNT(*) FILTER (WHERE j."completionDeadline" IS NULL) AS "noDeadline",
     COUNT(*) FILTER (WHERE j."status" = 'waiting') AS "waiting",
     COUNT(*) FILTER (WHERE j."primaryOwnerId" IS NULL) AS "unassigned"`,
    [today, today, windowEnd],
  )).first();
  return Object.fromEntries(metrics.map(metric => [metric, safeCount(metricRow?.[metric])])) as
    Record<typeof metrics[number], number>;
}

export async function readJobWorkloadReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  rawQuery: JobWorkloadQuery,
  forceAssigned = false,
): Promise<JobWorkloadResult> {
  const query = jobWorkloadQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await jobReportContext(trx, context, forceAssigned);
  return readWorkload(trx, context, query, auth);
}

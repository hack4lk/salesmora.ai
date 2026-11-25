import {serviceDisplaySql} from '../services/store';
import type { Knex } from 'knex';
import {
  jobLifecycleQuerySchema,
  jobLifecycleResultSchema,
  type AuthorizationContext,
  type JobLifecycleQuery,
  type JobLifecycleResult,
  type JobStatus,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { jobReportContext } from './job-context';
import { applyJobReportFilters, validateJobReportFilters } from './job-filters';
import {
  applyJobReportPeriod,
  invalidJobStatusEvents,
  jobStatusEvents,
  selectedJobLifecycleEvents,
  validateJobReportPeriod,
} from './job-events';

const views = ['created', 'completed', 'canceled', 'reopened'] as const;

type RawLifecycleJob = {
  id: string;
  jobNumber: number;
  title: string;
  customerName: string;
  status: JobStatus;
  ownerId: string | null;
  ownerName: string | null;
  service: string;
  reportDate: string;
};

function safeCount(value: unknown): number {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Job lifecycle count is outside the safe integer range.');
  }
  return count;
}

export async function jobLifecycleCounts(
  trx: Knex.Transaction,
  period: JobLifecycleQuery['period'],
  auth: Awaited<ReturnType<typeof jobReportContext>>,
) {
  validateJobReportPeriod(period, auth.today);
  const eventBase = jobStatusEvents(trx, auth, period);
  const invalidEvent = await invalidJobStatusEvents(eventBase).first('a.id');
  if (invalidEvent) {
    throw new Error('Jobs report encountered invalid lifecycle transition evidence.');
  }

  const eventCounts = await eventBase.clone()
    .select(trx.raw(
      `COUNT(DISTINCT a."jobId") FILTER (WHERE a."changes"->>'to' = 'completed') AS "completed",
       COUNT(DISTINCT a."jobId") FILTER (WHERE a."changes"->>'to' = 'canceled') AS "canceled",
       COUNT(DISTINCT a."jobId") FILTER (
         WHERE a."changes"->>'from' IN ('completed','canceled')
           AND a."changes"->>'to' NOT IN ('completed','canceled')
       ) AS "reopened"`,
    ))
    .first();
  const createdQuery = applyJobReportPeriod(
    auth.query.clone(),
    'j."createdAt"',
    period,
    auth.timezone,
  );
  const createdRow = await createdQuery.clone().count<{ count: string }[]>({ count: 'j.id' }).first();
  const counts = {
    created: safeCount(createdRow?.count ?? 0),
    completed: safeCount(eventCounts?.completed ?? 0),
    canceled: safeCount(eventCounts?.canceled ?? 0),
    reopened: safeCount(eventCounts?.reopened ?? 0),
  };
  return counts;
}

async function readLifecycle(
  trx: Knex.Transaction,
  query: JobLifecycleQuery,
  auth: Awaited<ReturnType<typeof jobReportContext>>,
): Promise<JobLifecycleResult> {
  const counts = await jobLifecycleCounts(trx, query.period, auth);
  const evidenceTotal = counts[query.selectedView];
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  const evidenceQuery = auth.query.clone();
  if (query.selectedView === 'created') {
    applyJobReportPeriod(evidenceQuery, 'j."createdAt"', query.period, auth.timezone);
    evidenceQuery.select(
      'j.id',
      'j.jobNumber',
      'j.title',
      'j.customerName',
      'j.status',
      'j.primaryOwnerId as ownerId',
      trx.raw(`${serviceDisplaySql('j')} AS service`),
      trx.raw('to_char(j."createdAt" AT TIME ZONE ?, \'YYYY-MM-DD\') AS "reportDate"', [auth.timezone]),
    );
  } else {
    const selected = selectedJobLifecycleEvents(trx, auth, query.period, query.selectedView).toSQL();
    evidenceQuery.joinRaw(
      `INNER JOIN (${selected.sql}) AS "selectedEvent"
       ON "selectedEvent"."jobId" = "j"."id"`,
      [...selected.bindings],
    ).select(
      'j.id',
      'j.jobNumber',
      'j.title',
      'j.customerName',
      'j.status',
      'j.primaryOwnerId as ownerId',
      trx.raw(`${serviceDisplaySql('j')} AS service`),
      'selectedEvent.reportDate',
    );
  }
  const rawRows = await evidenceQuery
    .leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId')
    .select('reportOwner.name as ownerName')
    .orderBy('reportDate', 'desc')
    .orderBy('j.jobNumber', 'asc')
    .orderBy('j.id', 'asc')
    .offset((page - 1) * query.pageSize)
    .limit(query.pageSize) as RawLifecycleJob[];
  const rows = rawRows.map(row => ({
    id: row.id,
    recordId: row.id,
    label: `J-${String(row.jobNumber).padStart(4, '0')} / ${row.title || row.customerName}`,
    cells: {
      date: row.reportDate,
      status: row.status,
      owner: row.ownerId === null ? 'No current primary owner' : row.ownerName || 'Current teammate',
      service: row.service.trim() || 'No recorded service',
    },
  }));
  const metricCoverage = { kind: 'complete' as const };
  return jobLifecycleResultSchema.parse({
    view: 'lifecycle',
    asOf: auth.asOf.toISOString(),
    from: query.period.from,
    to: query.period.to,
    timezone: auth.timezone,
    scopeLabel: auth.scopeLabel,
    filters: query.filters,
    counts,
    coverage: {
      created: metricCoverage,
      completed: metricCoverage,
      canceled: metricCoverage,
      reopened: metricCoverage,
    },
    evidenceIds: Object.fromEntries(views.map(view => [view, view])),
    selectedView: query.selectedView,
    page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows,
  });
}

export async function readJobLifecycleReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  rawQuery: JobLifecycleQuery,
  forceAssigned = false,
): Promise<JobLifecycleResult> {
  const query = jobLifecycleQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await jobReportContext(trx, context, forceAssigned);
  await validateJobReportFilters(auth.query, query.filters, trx);
  applyJobReportFilters(auth.query, query.filters);
  return readLifecycle(trx, query, auth);
}

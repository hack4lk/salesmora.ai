import type { Knex } from 'knex';
import { jobStatuses } from '@salesmora/contracts';
import type { jobReportContext } from './job-context';

type ReportContext = Awaited<ReturnType<typeof jobReportContext>>;
type Period = { from: string; to: string };
type EventView = 'completed' | 'canceled' | 'reopened';
const activeStatuses = jobStatuses.filter(status => status !== 'completed' && status !== 'canceled');
const allStatusValues = jobStatuses.map(status => `'${status}'`).join(',');
const activeStatusValues = activeStatuses.map(status => `'${status}'`).join(',');
const validTransition = `jsonb_typeof(a."changes") = 'object'
  AND jsonb_typeof(a."changes"->'from') = 'string'
  AND jsonb_typeof(a."changes"->'to') = 'string'
  AND a."changes"->>'from' IN (${allStatusValues})
  AND a."changes"->>'to' IN (${allStatusValues})
  AND a."changes"->>'from' <> a."changes"->>'to'
  AND (a."changes"->>'from' IN (${activeStatusValues})
    OR (a."changes"->>'from' IN ('completed','canceled')
      AND a."changes"->>'to' IN (${activeStatusValues})))`;

export function applyJobReportPeriod(
  query: Knex.QueryBuilder,
  column: string,
  period: Period,
  timezone: string,
) {
  return query.whereRaw(
    `${column} >= (?::date::timestamp AT TIME ZONE ?) AND
     ${column} < ((?::date + 1)::timestamp AT TIME ZONE ?)`,
    [period.from, timezone, period.to, timezone],
  );
}

export function validateJobReportPeriod(period: Period, today: string) {
  const days = (Date.parse(`${period.to}T00:00:00Z`) -
    Date.parse(`${period.from}T00:00:00Z`)) / 86_400_000 + 1;
  if (period.from > period.to || period.to > today || !Number.isInteger(days) || days < 1 || days > 366) {
    throw new RangeError('Choose an ordered Jobs report period of at most 366 dates ending no later than today.');
  }
}

export function jobStatusEvents(trx: Knex.Transaction, context: ReportContext, period: Period) {
  const authorized = context.query.clone()
    .clearSelect()
    .clearOrder()
    .select(trx.raw('1'))
    .whereRaw('j.id = a."jobId" AND j."workspaceId" = a."workspaceId"');
  const query = trx('jobActivity as a')
    .where('a.type', 'status')
    .whereRaw('EXISTS (?)', [authorized]);
  return applyJobReportPeriod(query, 'a."createdAt"', period, context.timezone);
}

export function invalidJobStatusEvents(query: Knex.QueryBuilder) {
  return query.clone().whereRaw(
    `((${validTransition}) IS NOT TRUE OR (
      a."changes"->>'to' = 'completed' AND EXISTS (
        SELECT 1 FROM jobs AS evidenceJob
        WHERE evidenceJob.id = a."jobId"
          AND evidenceJob."workspaceId" = a."workspaceId"
          AND a."createdAt" < evidenceJob."createdAt"
      )
    ))`,
  );
}

export function selectedJobLifecycleEvents(
  trx: Knex.Transaction,
  context: ReportContext,
  period: Period,
  view: EventView,
) {
  const category = view === 'reopened'
    ? `a."changes"->>'from' IN ('completed','canceled')
      AND a."changes"->>'to' IN (${activeStatusValues})`
    : `a."changes"->>'to' = ?`;
  return jobStatusEvents(trx, context, period)
    .whereRaw(`(${validTransition}) IS TRUE`)
    .whereRaw(category, view === 'reopened' ? [] : [view])
    .distinctOn('a.jobId')
    .select(
      'a.jobId',
      'a.id as eventId',
      'a.createdAt as eventAt',
      trx.raw(
        `to_char(a."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "reportDate"`,
        [context.timezone],
      ),
    )
    .orderBy('a.jobId')
    .orderBy('a.createdAt', 'desc')
    .orderBy('a.id', 'desc');
}

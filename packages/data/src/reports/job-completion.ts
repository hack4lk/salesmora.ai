import type { Knex } from 'knex';
import {
  jobCompletionQuerySchema,
  jobCompletionResultSchema,
  type AuthorizationContext,
  type JobCompletionQuery,
  type JobCompletionResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { jobReportContext } from './job-context';
import { applyJobReportFilters, validateJobReportFilters } from './job-filters';
import { invalidJobStatusEvents, jobStatusEvents, selectedJobLifecycleEvents, validateJobReportPeriod } from './job-events';

type CompletionProjection = {
  invalid: boolean;
  total: string;
  totalElapsedDays: string;
  evidenceTotal: string;
  page: number;
  days: unknown;
  rows: unknown;
};

function safeCount(value: string): number {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Job completion count or elapsed-day sum is outside the safe integer range.');
  }
  return count;
}

/** Aggregates and bounded evidence share one database statement snapshot and one period-selected event set. */
export async function readJobCompletionReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  rawQuery: JobCompletionQuery,
  forceAssigned = false,
): Promise<JobCompletionResult> {
  const query = jobCompletionQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await jobReportContext(trx, context, forceAssigned);
  validateJobReportPeriod(query.period, auth.today);
  await validateJobReportFilters(auth.query, query.filters, trx);
  applyJobReportFilters(auth.query, query.filters);
  const events = selectedJobLifecycleEvents(trx, auth, query.period, 'completed').toSQL();
  const invalid = invalidJobStatusEvents(jobStatusEvents(trx, auth, query.period)).select('a.id').toSQL();
  const projection = await trx.raw<{ rows: CompletionProjection[] }>(
    `WITH selected AS MATERIALIZED (${events.sql}),
     completed AS MATERIALIZED (
       SELECT j.id, j."jobNumber", j.title, j."customerName", j.status, j."primaryOwnerId",
         s."reportDate"::date AS "completionDate",
         (j."createdAt" AT TIME ZONE ?)::date AS "createdDate",
         s."reportDate"::date - (j."createdAt" AT TIME ZONE ?)::date AS "elapsedDays"
       FROM selected s JOIN jobs j ON j.id = s."jobId" AND j."workspaceId" = ?::uuid
     ),
     evidence AS MATERIALIZED (
       SELECT * FROM completed WHERE (?::date IS NULL OR "completionDate" = ?::date)
     ),
     totals AS (
       SELECT COUNT(*) AS total, COALESCE(SUM("elapsedDays"), 0) AS elapsed FROM completed
     ),
     dayCounts AS (
       SELECT "completionDate", COUNT(*) AS count FROM completed GROUP BY "completionDate"
     ),
     paging AS (
       SELECT COUNT(*) AS total,
         LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT e.*, u.name AS "ownerName" FROM evidence e
       LEFT JOIN users u ON u.id = e."primaryOwnerId"
       ORDER BY e."completionDate" DESC, e."jobNumber", e.id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT EXISTS (${invalid.sql}) AS invalid,
       totals.total::text AS total, totals.elapsed::text AS "totalElapsedDays",
       paging.total::text AS "evidenceTotal", paging.page,
       (SELECT jsonb_agg(jsonb_build_object(
         'date', to_char(d.date, 'YYYY-MM-DD'),
         'count', COALESCE(c.count, 0),
         'evidenceId', 'completion:day:' || to_char(d.date, 'YYYY-MM-DD')
       ) ORDER BY d.date)
       FROM (SELECT ?::date + i AS date FROM generate_series(0, ?::date - ?::date) AS i) d
       LEFT JOIN dayCounts c ON c."completionDate" = d.date) AS days,
       COALESCE((SELECT jsonb_agg(jsonb_build_object(
         'id', r.id, 'recordId', r.id,
         'label', 'J-' || CASE WHEN length(r."jobNumber"::text) < 4
           THEN lpad(r."jobNumber"::text, 4, '0') ELSE r."jobNumber"::text END
           || ' / ' || CASE WHEN r.title = '' THEN r."customerName" ELSE r.title END,
         'createdDate', to_char(r."createdDate", 'YYYY-MM-DD'),
         'completionDate', to_char(r."completionDate", 'YYYY-MM-DD'),
         'cells', jsonb_build_object('status', r.status, 'owner',
           CASE WHEN r."primaryOwnerId" IS NULL THEN 'No current primary owner'
           ELSE COALESCE(NULLIF(r."ownerName", ''), 'Current teammate') END)
       ) ORDER BY r."completionDate" DESC, r."jobNumber", r.id) FROM pageRows r), '[]'::jsonb) AS rows
     FROM totals CROSS JOIN paging`,
    [
      ...events.bindings,
      auth.timezone, auth.timezone, query.workspaceId,
      query.selectedDate ?? null, query.selectedDate ?? null,
      query.page, query.pageSize, query.pageSize, query.pageSize,
      ...invalid.bindings,
      query.period.from, query.period.to, query.period.from,
    ],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no Job completion projection.');
  if (result.invalid) throw new Error('Jobs report encountered invalid lifecycle transition evidence.');
  const total = safeCount(result.total);
  const totalElapsedDays = safeCount(result.totalElapsedDays);
  return jobCompletionResultSchema.parse({
    view: 'completion',
    asOf: auth.asOf.toISOString(),
    from: query.period.from,
    to: query.period.to,
    timezone: auth.timezone,
    scopeLabel: auth.scopeLabel,
    filters: query.filters,
    total,
    coverage: { kind: 'complete' },
    days: result.days,
    duration: {
      sampleSize: total,
      totalElapsedDays,
      averageElapsedDays: total === 0 ? null : totalElapsedDays / total,
    },
    evidenceId: 'completion:all',
    ...(query.selectedDate === undefined ? {} : { selectedDate: query.selectedDate }),
    page: result.page,
    pageSize: query.pageSize,
    evidenceTotal: safeCount(result.evidenceTotal),
    rows: result.rows,
  });
}

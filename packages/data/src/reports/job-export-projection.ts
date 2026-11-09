import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import { jobReportExportColumns, jobReportExportInputSchema, jobStatuses, jobWaitingReasons,
  type AuthorizationContext, type JobReportExportInput } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { resolveJobReportExportScope } from './job-export-access';
import { jobReportContext } from './job-context';
import { applyJobReportFilters, validateJobReportFilters } from './job-filters';
import { applyJobReportPeriod, selectedJobLifecycleEvents } from './job-events';
import { readJobLifecycleReportInTransaction } from './job-lifecycle';
import { readJobCompletionReportInTransaction } from './job-completion';
import { readJobWorkloadReportInTransaction, selectJobWorkloadProjection } from './jobs';

const activeStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const text = z.string().min(1);
const evidence = { id: z.uuid(), label: text, status: z.enum(jobStatuses), owner: text };
const lifecycleRow = z.object({ ...evidence, service: text, reportDate: z.iso.date() }).strict();
const completionRow = z.object({ ...evidence, createdDate: z.iso.date(), completionDate: z.iso.date(),
  elapsedDays: z.number().int().nonnegative().refine(Number.isSafeInteger) }).strict();
const workloadRow = z.object({ ...evidence, service: text, completionDeadline: z.iso.date().nullable(),
  scheduledDate: z.iso.date().nullable(), waitingReason: z.enum(jobWaitingReasons).nullable() }).strict();

/** Caller owns one authorized snapshot through preparation and complete cursor consumption. */
export async function prepareJobReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: JobReportExportInput,
) {
  const input = jobReportExportInputSchema.parse(raw);
  const scope = resolveJobReportExportScope(context);
  if (!scope || input.query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { query, dataset } = input;
  const forceAssigned = scope === 'assigned';
  const paging = { page: 1, pageSize: 100 as const };
  const report = query.view === 'lifecycle'
    ? await readJobLifecycleReportInTransaction(trx, context, { ...query, ...paging }, forceAssigned)
    : query.view === 'completion'
      ? await readJobCompletionReportInTransaction(trx, context, { ...query, ...paging }, forceAssigned)
      : await readJobWorkloadReportInTransaction(trx, context, { ...query, ...paging }, forceAssigned);
  const auth = await jobReportContext(trx, context, forceAssigned);
  if (auth.scope !== scope || auth.asOf.toISOString() !== report.asOf) {
    throw new Error('Jobs export and native read context disagree.');
  }
  const columns = jobReportExportColumns(input);
  const dateBasis = query.view === 'lifecycle' ? 'lifecycle-local-dates' as const
    : query.view === 'completion' ? 'completion-date' as const : 'current-snapshot' as const;
  const selection = query.view === 'lifecycle' ? query.selectedView
    : query.view === 'completion' ? query.selectedDate ?? 'all dates'
      : query.selection.kind === 'metric' ? query.selection.metric : `${query.selection.group}:${query.selection.id}`;
  const coverage = 'Current authorized Jobs including archived; filters and assignment are current. ' +
    'Lifecycle categories overlap; latest matching event per Job; elapsed days use local dates. ' +
    `Evidence selection: ${selection}.`;
  const common = [query.view, dataset, dateBasis, 'period' in query ? query.period.from : null,
    'period' in query ? query.period.to : null, report.asOf, report.timezone, scope, 'included', coverage];
  const groupKey = dataset === 'waiting-reasons' ? 'waitingReason' : dataset;
  const groups = report.view === 'workload' && (groupKey === 'status' || groupKey === 'owner' ||
    groupKey === 'service' || groupKey === 'waitingReason') ? report.groups[groupKey] : null;
  const count = dataset === 'summary' ? 1 : dataset === 'days' && report.view === 'completion'
    ? report.days.length : groups ? groups.length : report.evidenceTotal;

  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (dataset === 'summary') {
      yield [...common, ...(report.view === 'lifecycle'
        ? [report.counts.created, report.counts.completed, report.counts.canceled, report.counts.reopened]
        : report.view === 'completion'
          ? [report.total, report.duration.sampleSize, report.duration.totalElapsedDays, report.duration.averageElapsedDays]
          : [report.counts.active, report.counts.overdue, report.counts.dueSoon, report.counts.noDeadline,
            report.counts.waiting, report.counts.unassigned])];
      return;
    }
    if (dataset === 'days' && report.view === 'completion') {
      for (const day of report.days) { signal?.throwIfAborted(); yield [...common, day.date, day.count]; }
      return;
    }
    if (groups) {
      for (const group of groups) { signal?.throwIfAborted(); yield [...common, group.id, group.label, group.count]; }
      return;
    }
    if (dataset !== 'evidence') throw new Error('Invalid Jobs CSV dataset.');
    const base = auth.query.clone();
    if (query.view === 'workload') base.whereIn('j.status', activeStatuses);
    await validateJobReportFilters(base, query.filters, trx);
    applyJobReportFilters(base, query.filters);
    const scopedAuth = { ...auth, query: base };
    const evidenceQuery = base.clone();
    if (query.view === 'lifecycle' && query.selectedView === 'created') {
      applyJobReportPeriod(evidenceQuery, 'j."createdAt"', query.period, auth.timezone);
      evidenceQuery.select(trx.raw(`to_char(j."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "reportDate"`, [auth.timezone]));
    } else if (query.view === 'lifecycle' && query.selectedView !== 'created' || query.view === 'completion') {
      const selectedView = query.view === 'completion' ? 'completed' : query.selectedView;
      if (selectedView === 'created') throw new Error('Invalid Jobs lifecycle evidence selection.');
      const selected = selectedJobLifecycleEvents(trx, scopedAuth, query.period, selectedView).toSQL();
      evidenceQuery.joinRaw(`INNER JOIN (${selected.sql}) AS "selectedEvent" ON "selectedEvent"."jobId" = j.id`,
        [...selected.bindings]);
      if (query.view === 'lifecycle') evidenceQuery.select('selectedEvent.reportDate');
      else {
        if (query.selectedDate) evidenceQuery.where('selectedEvent.reportDate', query.selectedDate);
        evidenceQuery.select(
          trx.raw(`to_char(j."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "createdDate"`, [auth.timezone]),
          'selectedEvent.reportDate as completionDate',
          trx.raw(`"selectedEvent"."reportDate"::date - (j."createdAt" AT TIME ZONE ?)::date AS "elapsedDays"`, [auth.timezone]),
        );
      }
    } else if (query.view === 'workload') {
      selectJobWorkloadProjection(evidenceQuery, query.selection, auth.today);
      evidenceQuery.select(
        trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`),
        trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), 'j.waitingReason',
      );
    }
    evidenceQuery.leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId')
      .select('j.id', 'j.status', trx.raw(
        `'J-' || CASE WHEN length(j."jobNumber"::text) < 4 THEN lpad(j."jobNumber"::text, 4, '0')
          ELSE j."jobNumber"::text END || ' / ' || CASE WHEN j.title = '' THEN j."customerName" ELSE j.title END AS label`,
      ), trx.raw(`CASE WHEN j."primaryOwnerId" IS NULL THEN 'No current primary owner'
        ELSE COALESCE(NULLIF("reportOwner".name, ''), 'Current teammate') END AS owner`));
    if (query.view !== 'completion') evidenceQuery.select(trx.raw(`COALESCE(NULLIF(btrim(j.service), ''), 'No recorded service') AS service`));
    if (query.view === 'workload') evidenceQuery.orderByRaw('j."completionDeadline" ASC NULLS LAST')
      .orderByRaw('j."scheduledDate" ASC NULLS LAST');
    else evidenceQuery.orderBy(query.view === 'completion' ? 'completionDate' : 'reportDate', 'desc');
    evidenceQuery.orderBy('j.jobNumber').orderBy('j.id');
    const statement = evidenceQuery.toSQL();
    const cursor = `jobs_csv_${randomUUID().replaceAll('-', '')}`;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement.sql}`, [cursor, ...statement.bindings]);
    let emitted = 0;
    try {
      while (true) {
        signal?.throwIfAborted();
        const batch = await trx.raw<{ rows: unknown[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
        if (!batch.rows.length) break;
        for (const saved of batch.rows) {
          signal?.throwIfAborted();
          let cells: (string | number | null)[];
          if (query.view === 'lifecycle') {
            const row = lifecycleRow.parse(saved);
            cells = [row.id, row.label, query.selectedView, row.reportDate, row.status, row.owner, row.service];
          } else if (query.view === 'completion') {
            const row = completionRow.parse(saved);
            cells = [row.id, row.label, row.createdDate, row.completionDate, row.elapsedDays, row.status, row.owner];
          } else {
            const row = workloadRow.parse(saved);
            cells = [row.id, row.label, row.status, row.owner, row.service, row.completionDeadline,
              row.scheduledDate, row.waitingReason];
          }
          emitted++;
          if (emitted > count || common.length + cells.length !== columns.length) {
            throw new Error('Jobs export evidence count or columns do not match the native projection.');
          }
          yield [...common, ...cells];
        }
      }
      if (emitted !== count) throw new Error('Jobs export evidence population does not match its count.');
    } finally { await trx.raw('CLOSE ??', [cursor]); }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope, archiveVisibility: 'included' as const, asOf: report.asOf, today: auth.today,
    timezone: report.timezone, dateBasis, coverage, count, columns, rows };
}

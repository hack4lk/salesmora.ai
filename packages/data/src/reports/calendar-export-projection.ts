import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import {
  calendarExportColumns, calendarExportInputSchema, calendarScheduledBusyThreshold,
  calendarReportArrivalWindowSchema, type AuthorizationContext, type CalendarExportInput,
} from '@salesmora/contracts';
import { requireCalendarExportAccess } from './calendar-export-access';
import { filteredCalendarReportRecords, calendarReportRecordLabelSQL } from './calendar-filters';
import { readCalendarScheduledReportInTransaction } from './calendar-scheduled';
import { readCalendarReviewReportInTransaction } from './calendar-review';
import { readCalendarUnscheduledReportInTransaction } from './calendar-unscheduled';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const date = z.iso.date();
const linkedRecord = z.object({
  recordId: z.uuid(), type: z.enum(['job', 'work_order']), label: text, participantIds: z.array(text),
}).strict();
const visit = z.object({
  id: z.uuid(), label: text, date: date.nullable(), span: calendarReportArrivalWindowSchema.nullable(),
  people: z.array(text), records: z.array(linkedRecord).min(1),
}).strict();
const record = z.object({
  visitId: z.uuid(), id: z.uuid(), label: text, status: text, people: z.array(text),
}).strict();
const overlap = z.object({
  personId: text, label: text, date,
  left: visit, right: visit,
}).strict();

/** Caller owns one authorized snapshot through preparation and complete cursor consumption. */
export async function prepareCalendarCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: CalendarExportInput,
) {
  const input = calendarExportInputSchema.parse(raw);
  const access = requireCalendarExportAccess(context, input);
  const { query, dataset } = input;
  const paging = { page: 1, pageSize: 100 as const };
  const report = query.view === 'calendar-scheduled'
    ? await readCalendarScheduledReportInTransaction(trx, context, { ...query, ...paging }, access.outputScopes)
    : query.view === 'calendar-review'
      ? await readCalendarReviewReportInTransaction(trx, context, { ...query, ...paging }, access.outputScopes)
      : await readCalendarUnscheduledReportInTransaction(trx, context, { ...query, ...paging }, access.outputScopes);
  if (JSON.stringify(report.scope) !== JSON.stringify(access.scope)) {
    throw new Error('Calendar export and native read scope disagree.');
  }
  const columns = calendarExportColumns(input);
  const dateBasis = query.view === 'calendar-unscheduled' ? 'current-unscheduled' as const : 'current-scheduled-date' as const;
  const coverage = 'Current authorized active records; visits distinct; participant totals and person-pairs non-additive; ' +
    'past schedules do not prove missed attendance. ' +
    `Jobs: ${access.outputScopes.jobs.kind}; Work Orders: ${access.outputScopes.workOrders.kind}.`;
  const common = [
    query.view, dataset, dateBasis, 'period' in query ? query.period.from : null, 'period' in query ? query.period.to : null,
    report.asOf, report.timezone, access.scope.kind,
    access.outputScopes.jobs.kind === 'available' ? access.outputScopes.jobs.scope : null,
    access.outputScopes.workOrders.kind === 'available' ? access.outputScopes.workOrders.scope : null, coverage,
  ];
  const count = dataset === 'summary' ? 1
    : dataset === 'days' && report.view === 'calendar-scheduled' ? report.days.length
      : dataset === 'person-days' && report.view === 'calendar-scheduled' ? report.members.length * report.days.length
        : report.evidenceTotal;
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Calendar export count is invalid.');

  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (dataset === 'summary') {
      yield [...common, ...(report.view === 'calendar-scheduled'
        ? [report.counts.visits, report.counts.busyPersonDays, calendarScheduledBusyThreshold]
        : report.view === 'calendar-review'
          ? [report.counts.scheduledVisits, report.counts.missingWindows, report.counts.overlapPairs, report.counts.pastVisits]
          : [report.counts.visits, access.outputScopes.jobs.kind === 'available' ? report.counts.jobs : null,
            access.outputScopes.workOrders.kind === 'available' ? report.counts.workOrders : null])];
      return;
    }
    if (report.view === 'calendar-scheduled' && (dataset === 'days' || dataset === 'person-days' || dataset === 'busy-person-days')) {
      let emitted = 0;
      const members = [...report.members].sort((left, right) => left.id.localeCompare(right.id));
      for (const [index, day] of report.days.entries()) {
        signal?.throwIfAborted();
        if (dataset === 'days') { emitted++; yield [...common, day.date, day.count, day.unassignedCount]; }
        else for (const member of members) {
          signal?.throwIfAborted();
          const visits = member.counts[index];
          if (!Number.isSafeInteger(visits) || visits === undefined) throw new Error('Calendar person-day count is invalid.');
          if (dataset === 'busy-person-days' && visits < calendarScheduledBusyThreshold) continue;
          emitted++;
          yield [...common, text.parse(member.id), text.parse(member.label), day.date, visits, calendarScheduledBusyThreshold];
        }
      }
      if (emitted !== count) throw new Error('Calendar export person-day population does not match its count.');
      return;
    }
    const source = await filteredCalendarReportRecords(trx, context, access.scope.kind === 'own', query.filters,
      query.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated', 'period' in query ? query.period : undefined,
      access.outputScopes);
    const ctes = `WITH visible AS MATERIALIZED (${source.sql}),
      visitPeople AS MATERIALIZED (
        SELECT "visitId", array_agg(DISTINCT p ORDER BY p) AS people
        FROM visible CROSS JOIN LATERAL unnest(people) p GROUP BY "visitId"
      ),
      visits AS MATERIALIZED (
        SELECT v."visitId" AS id, min(v.title) AS label, v."scheduledDate" AS date, v."arrivalWindow" AS span,
          COALESCE(p.people, ARRAY[]::text[]) AS people,
          jsonb_agg(jsonb_build_object('recordId', v.id, 'type', v.type,
            'label', ${calendarReportRecordLabelSQL('v')},
            'participantIds', to_jsonb(v.people)) ORDER BY v.type, v.id) AS records
        FROM visible v LEFT JOIN visitPeople p ON p."visitId" = v."visitId"
        GROUP BY v."visitId", v."scheduledDate", v."arrivalWindow", p.people
      )`;
    const statement = dataset === 'overlaps'
      ? `${ctes} SELECT jsonb_build_object('personId', p, 'label', u.name, 'date', l.date,
          'left', to_jsonb(l), 'right', to_jsonb(r)) AS row
        FROM visits l JOIN visits r ON l.date = r.date AND l.id < r.id
        CROSS JOIN LATERAL unnest(l.people) p JOIN users u ON u.id = p
        WHERE p = ANY(r.people) AND l.span IS NOT NULL AND r.span IS NOT NULL
          AND left(l.span,5) < right(r.span,5) AND left(r.span,5) < right(l.span,5)
        ORDER BY l.date, p, l.id, r.id`
      : dataset === 'jobs' || dataset === 'workOrders'
        ? `WITH visible AS MATERIALIZED (${source.sql})
          SELECT jsonb_build_object('visitId', "visitId", 'id', id, 'status', status, 'people', to_jsonb(people),
            'label', ${calendarReportRecordLabelSQL('v')}) AS row
          FROM visible v WHERE type = ? ORDER BY "visitId", id`
        : `${ctes} SELECT to_jsonb(v) AS row FROM visits v ${dataset === 'past' ? 'WHERE date::date < ?::date' : ''}
          ORDER BY date NULLS FIRST, id`;
    const bindings = [...source.bindings, ...(dataset === 'past' ? [report.today]
      : dataset === 'jobs' || dataset === 'workOrders' ? [dataset === 'jobs' ? 'job' : 'work_order'] : [])];
    const cursor = `calendar_csv_${randomUUID().replaceAll('-', '')}`;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [cursor, ...bindings]);
    let emitted = 0;
    try {
      while (true) {
        signal?.throwIfAborted();
        const batch = await trx.raw<{ rows: { row: unknown }[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
        if (!batch.rows.length) break;
        for (const saved of batch.rows) {
          signal?.throwIfAborted();
          let cells: (string | number | null)[];
          if (dataset === 'overlaps') {
            const row = overlap.parse(saved.row);
            cells = [row.personId, row.label, row.date, row.left.id, row.left.label, row.left.span,
              row.right.id, row.right.label, row.right.span];
          } else if (dataset === 'jobs' || dataset === 'workOrders') {
            const row = record.parse(saved.row);
            cells = [row.visitId, row.id, row.label, row.status, JSON.stringify(row.people)];
          } else {
            const row = visit.parse(saved.row);
            cells = [row.id, row.label, row.date, ...(dataset === 'past' ? [row.span] : []),
              JSON.stringify(row.people), JSON.stringify(row.records)];
          }
          emitted++;
          if (emitted > count || common.length + cells.length !== columns.length) {
            throw new Error('Calendar export evidence count or columns do not match the native projection.');
          }
          yield [...common, ...cells];
        }
      }
      if (emitted !== count) throw new Error('Calendar export evidence population does not match its count.');
    } finally { await trx.raw('CLOSE ??', [cursor]); }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope: access.scope, outputScopes: access.outputScopes, asOf: report.asOf, today: report.today,
    timezone: report.timezone, dateBasis, coverage, count, columns, rows };
}

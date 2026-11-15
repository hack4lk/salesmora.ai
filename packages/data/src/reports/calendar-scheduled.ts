import type { Knex } from 'knex';
import {
  calendarScheduledQuerySchema, calendarScheduledResultSchema, calendarScheduledBusyThreshold,
  type AuthorizationContext, type CalendarExportOutputScopes, type CalendarScheduledQuery, type CalendarScheduledResult,
} from '@salesmora/contracts';
import { calendarReportContext } from './calendar-context';
import { filteredCalendarReportRecords, calendarReportRosterFilterSQL, calendarReportRecordLabelSQL } from './calendar-filters';

/** Canonical visits and authorized participant workload share one current-schedule statement snapshot. */
export async function readCalendarScheduledReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: CalendarScheduledQuery,
  exportScopes?: CalendarExportOutputScopes,
): Promise<CalendarScheduledResult> {
  const query = calendarScheduledQuerySchema.parse(rawQuery);
  const { own, wide, ...clock } = await calendarReportContext(trx, context, query.workspaceId, exportScopes);
  const source = await filteredCalendarReportRecords(trx, context, own, query.filters, 'dated', query.period, exportScopes);
  const roster = calendarReportRosterFilterSQL(query.filters, 'm."userId"');
  const visitEvidence = query.selected === 'visits';
  const projection = await trx.raw<{ rows: { counts: unknown; days: unknown; members: unknown; rows: unknown; total: string; page: number }[] }>(
    `WITH visible AS MATERIALIZED (${source.sql}),
     scheduled AS MATERIALIZED (
       SELECT * FROM visible WHERE "scheduledDate"::date BETWEEN ?::date AND ?::date
     ),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", s."scheduledDate"::date AS date, m."userId" AS id
       FROM scheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     visitPeople AS MATERIALIZED (
       SELECT "visitId", jsonb_agg(id ORDER BY id) AS people FROM participants GROUP BY "visitId"
     ),
     visits AS MATERIALIZED (
       SELECT s."visitId" AS id, s."scheduledDate"::date AS date,
         min(s.title) AS label, jsonb_agg(jsonb_build_object(
           'id', s.id, 'recordId', s.id, 'type', s.type, 'participantIds', to_jsonb(s.people),
           'label', ${calendarReportRecordLabelSQL('s')}
         ) ORDER BY s.type, s.id) AS records,
         COALESCE(p.people, '[]'::jsonb) AS people
       FROM scheduled s LEFT JOIN visitPeople p ON p."visitId" = s."visitId"
       GROUP BY s."visitId", s."scheduledDate", p.people
     ),
     dates AS (SELECT generate_series(?::date, ?::date, INTERVAL '1 day')::date AS date),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     ),
     personDays AS MATERIALIZED (
       SELECT r.id, r.label, d.date, count(p."visitId")::int AS count
       FROM roster r CROSS JOIN dates d LEFT JOIN participants p ON p.id = r.id AND p.date = d.date
       GROUP BY r.id, r.label, d.date
     ),
     busy AS MATERIALIZED (SELECT * FROM personDays WHERE count >= ?::int),
     evidence AS MATERIALIZED (${visitEvidence ? 'SELECT id, date FROM visits' : 'SELECT id, date FROM busy'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (SELECT * FROM evidence ORDER BY date, id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging))
     SELECT (SELECT jsonb_build_object('visits', count(*), 'busyPersonDays', (SELECT count(*) FROM busy)) FROM visits) AS counts,
       (SELECT jsonb_agg(jsonb_build_object('date', to_char(d.date,'YYYY-MM-DD'),
         'count', (SELECT count(*) FROM visits v WHERE v.date = d.date),
         'unassignedCount', (SELECT count(*) FROM visits v WHERE v.date = d.date AND jsonb_array_length(v.people) = 0)
       ) ORDER BY d.date) FROM dates d) AS days,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', r.id, 'label', r.label,
         'counts', (SELECT jsonb_agg(p.count ORDER BY p.date) FROM personDays p WHERE p.id = r.id))
         ORDER BY lower(r.label), r.id) FROM roster r), '[]'::jsonb) AS members,
       ${visitEvidence
    ? `COALESCE((SELECT jsonb_agg(jsonb_build_object('id', v.id, 'label', v.label,
         'date', to_char(v.date,'YYYY-MM-DD'), 'participantIds', v.people, 'records', v.records)
         ORDER BY v.date, v.id) FROM pageRows p JOIN visits v ON v.id = p.id), '[]'::jsonb)`
    : `COALESCE((SELECT jsonb_agg(jsonb_build_object('personId', id, 'date', to_char(date,'YYYY-MM-DD'))
         ORDER BY date, id) FROM pageRows), '[]'::jsonb)`} AS rows,
       paging.total::text, paging.page FROM paging`,
    [...source.bindings, query.period.from, query.period.to, context.workspaceId, own, context.userId,
      query.period.from, query.period.to, context.workspaceId, own, context.userId, wide, context.userId,
      ...roster.bindings, calendarScheduledBusyThreshold, query.page, query.pageSize, query.pageSize, query.pageSize],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no scheduled Calendar projection.');
  return calendarScheduledResultSchema.parse({
    workspaceId: context.workspaceId, view: 'calendar-scheduled', from: query.period.from, to: query.period.to,
    today: clock.today, asOf: clock.asOf, timezone: clock.timezone,
    scope: own ? { kind: 'own', viewerId: context.userId } : { kind: 'workspace' },
    scopeLabel: own ? 'My current scheduled visits and authorized active records only.' : 'Current canonical visits with currently authorized active records; participant counts are non-additive.',
    counts: result.counts, days: result.days, members: result.members, filters: query.filters,
    evidence: { kind: query.selected, rows: result.rows }, evidenceTotal: Number(result.total),
    page: result.page, pageSize: query.pageSize,
  });
}

import type { Knex } from 'knex';
import {
  calendarReviewQuerySchema, calendarReviewResultSchema,
  type AuthorizationContext, type CalendarExportOutputScopes, type CalendarReviewQuery, type CalendarReviewResult,
} from '@salesmora/contracts';
import { calendarReportContext } from './calendar-context';
import { filteredCalendarReportRecords, calendarReportRosterFilterSQL, calendarReportRecordLabelSQL } from './calendar-filters';

/** Known arrival-window pairs and past current schedules, never inferred attendance or availability. */
export async function readCalendarReviewReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: CalendarReviewQuery,
  exportScopes?: CalendarExportOutputScopes,
): Promise<CalendarReviewResult> {
  const query = calendarReviewQuerySchema.parse(rawQuery);
  const { own, wide, ...clock } = await calendarReportContext(trx, context, query.workspaceId, exportScopes);
  const source = await filteredCalendarReportRecords(trx, context, own, query.filters, 'dated', query.period, exportScopes);
  const roster = calendarReportRosterFilterSQL(query.filters, 'm."userId"');
  const overlaps = query.selected === 'overlaps';
  const projection = await trx.raw<{ rows: {
    counts: unknown; members: unknown; visits: unknown; evidence: unknown; total: string; page: number; invalidWindows: string;
  }[] }>(
    `WITH visible AS (${source.sql}),
     scheduled AS MATERIALIZED (
       SELECT "visitId", "scheduledDate"::date AS date, "arrivalWindow" AS span, id, type, number, title, people
       FROM visible WHERE "scheduledDate"::date BETWEEN ?::date AND ?::date
     ),
     visitDates AS MATERIALIZED (SELECT DISTINCT "visitId", date, span FROM scheduled),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", s.date, m."userId" AS id
       FROM scheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     pairs AS MATERIALIZED (
       SELECT l.date, l.id AS "personId", l."visitId" AS "leftVisitId", r."visitId" AS "rightVisitId"
       FROM participants l JOIN participants r ON r.id = l.id AND r.date = l.date AND l."visitId" < r."visitId"
       JOIN visitDates lv ON lv."visitId" = l."visitId" JOIN visitDates rv ON rv."visitId" = r."visitId"
       WHERE lv.span IS NOT NULL AND rv.span IS NOT NULL
         AND left(lv.span, 5) < right(rv.span, 5) AND left(rv.span, 5) < right(lv.span, 5)
     ),
     past AS MATERIALIZED (SELECT * FROM visitDates WHERE date < ?::date),
     evidence AS MATERIALIZED (${overlaps ? 'SELECT * FROM pairs' : 'SELECT "visitId", date FROM past'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS MATERIALIZED (
       SELECT * FROM evidence ORDER BY date, ${overlaps ? '"personId", "leftVisitId", "rightVisitId"' : '"visitId"'}
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     ),
     pageVisits AS (${overlaps
    ? 'SELECT "leftVisitId" AS id FROM pageRows UNION SELECT "rightVisitId" AS id FROM pageRows'
    : 'SELECT "visitId" AS id FROM pageRows'}),
     visits AS (
       SELECT s."visitId" AS id, s.date, s.span, min(s.title) AS label,
         jsonb_agg(jsonb_build_object('id', s.id, 'recordId', s.id, 'type', s.type, 'participantIds', to_jsonb(s.people),
           'label', ${calendarReportRecordLabelSQL('s')}
         ) ORDER BY s.type, s.id) AS records,
         COALESCE((SELECT jsonb_agg(p.id ORDER BY p.id) FROM participants p WHERE p."visitId" = s."visitId"), '[]'::jsonb) AS people
       FROM scheduled s JOIN pageVisits pv ON pv.id = s."visitId" GROUP BY s."visitId", s.date, s.span
     ),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     )
     SELECT (SELECT jsonb_build_object('scheduledVisits', count(*), 'missingWindows', count(*) FILTER (WHERE span IS NULL),
       'overlapPairs', (SELECT count(*) FROM pairs), 'pastVisits', (SELECT count(*) FROM past)) FROM visitDates) AS counts,
       (SELECT count(*)::text FROM visitDates WHERE span IS NOT NULL AND
         (span !~ '^([01][0-9]|2[0-3]):[0-5][0-9]-([01][0-9]|2[0-3]):[0-5][0-9]$' OR left(span, 5) >= right(span, 5))) AS "invalidWindows",
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label) ORDER BY lower(label), id)
         FROM roster), '[]'::jsonb) AS members,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label, 'date', to_char(date,'YYYY-MM-DD'),
         'arrivalWindow', span, 'participantIds', people, 'records', records) ORDER BY date, id)
         FROM visits), '[]'::jsonb) AS visits,
       ${overlaps
    ? `jsonb_build_object('kind', 'overlaps', 'rows',
         COALESCE((SELECT jsonb_agg(jsonb_build_object('personId', "personId",
           'leftVisitId', "leftVisitId", 'rightVisitId', "rightVisitId") ORDER BY date, "personId", "leftVisitId", "rightVisitId")
           FROM pageRows), '[]'::jsonb))`
    : `jsonb_build_object('kind', 'past', 'visitIds',
         COALESCE((SELECT jsonb_agg("visitId" ORDER BY date, "visitId") FROM pageRows), '[]'::jsonb))`} AS evidence,
       paging.total::text, paging.page FROM paging`,
    [...source.bindings, query.period.from, query.period.to, context.workspaceId, own, context.userId, clock.today,
      query.page, query.pageSize, query.pageSize, query.pageSize,
      context.workspaceId, own, context.userId, wide, context.userId, ...roster.bindings],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no Calendar schedule-review projection.');
  if (result.invalidWindows !== '0') throw new Error('An authorized scheduled visit has an invalid persisted arrival window.');
  return calendarReviewResultSchema.parse({
    workspaceId: context.workspaceId, view: 'calendar-review', from: query.period.from, to: query.period.to, ...clock,
    scope: own ? { kind: 'own', viewerId: context.userId } : { kind: 'workspace' },
    scopeLabel: own ? 'My current scheduled visits and known window pairs only; past dates prompt review, not missed attendance.'
      : 'Current authorized scheduled visits and known window pairs per person; participant pair counts are non-additive.',
    counts: result.counts, members: result.members, visits: result.visits, evidence: result.evidence, filters: query.filters,
    evidenceTotal: Number(result.total), page: result.page, pageSize: query.pageSize,
  });
}

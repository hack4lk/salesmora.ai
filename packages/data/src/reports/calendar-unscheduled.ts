import type { Knex } from 'knex';
import {
  calendarUnscheduledQuerySchema, calendarUnscheduledResultSchema,
  type AuthorizationContext, type CalendarExportOutputScopes, type CalendarUnscheduledQuery, type CalendarUnscheduledResult,
} from '@salesmora/contracts';
import { calendarReportContext } from './calendar-context';
import { filteredCalendarReportRecords, calendarReportRosterFilterSQL, calendarReportRecordLabelSQL } from './calendar-filters';

/** Current unscheduled visits and separate active record queues, without a visit-date predicate. */
export async function readCalendarUnscheduledReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: CalendarUnscheduledQuery,
  exportScopes?: CalendarExportOutputScopes,
): Promise<CalendarUnscheduledResult> {
  const query = calendarUnscheduledQuerySchema.parse(rawQuery);
  const { own, wide, ...clock } = await calendarReportContext(trx, context, query.workspaceId, exportScopes);
  const source = await filteredCalendarReportRecords(trx, context, own, query.filters, 'unscheduled', undefined, exportScopes);
  const roster = calendarReportRosterFilterSQL(query.filters, 'm."userId"');
  const visitEvidence = query.selected === 'visits';
  const projection = await trx.raw<{ rows: { counts: unknown; members: unknown; visits: unknown; evidence: unknown; total: string; page: number }[] }>(
    `WITH visible AS (${source.sql}),
     unscheduled AS MATERIALIZED (
       SELECT "visitId", id, type, number, title, status, people FROM visible WHERE "scheduledDate" IS NULL
     ),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", m."userId" AS id
       FROM unscheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     visitIds AS MATERIALIZED (SELECT DISTINCT "visitId" FROM unscheduled),
     evidence AS MATERIALIZED (${visitEvidence
    ? 'SELECT "visitId", "visitId" AS id FROM visitIds'
    : 'SELECT "visitId", id FROM unscheduled WHERE type = ?'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS MATERIALIZED (SELECT * FROM evidence ORDER BY "visitId", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)),
     pageVisits AS (SELECT DISTINCT "visitId" FROM pageRows),
     visits AS (
       SELECT s."visitId" AS id, min(s.title) AS label, jsonb_agg(
         jsonb_build_object('id', s.id, 'recordId', s.id, 'type', s.type, 'status', s.status, 'participantIds', to_jsonb(s.people),
           'label', ${calendarReportRecordLabelSQL('s')})
         || CASE WHEN s.type = 'work_order' THEN jsonb_build_object('archived', false) ELSE '{}'::jsonb END
         ORDER BY s.type, s.id) AS records,
         COALESCE((SELECT jsonb_agg(p.id ORDER BY p.id) FROM participants p WHERE p."visitId" = s."visitId"), '[]'::jsonb) AS people
       FROM unscheduled s JOIN pageVisits pv ON pv."visitId" = s."visitId" GROUP BY s."visitId"
     ),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     )
     SELECT jsonb_build_object('visits', (SELECT count(*) FROM visitIds),
       'jobs', (SELECT count(*) FROM unscheduled WHERE type = 'job'),
       'workOrders', (SELECT count(*) FROM unscheduled WHERE type = 'work_order')) AS counts,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label) ORDER BY lower(label), id)
         FROM roster), '[]'::jsonb) AS members,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label, 'scheduledDate', NULL,
         'participantIds', people, 'records', records) ORDER BY id) FROM visits), '[]'::jsonb) AS visits,
       ${visitEvidence
    ? `jsonb_build_object('kind', 'visits', 'visitIds',
         COALESCE((SELECT jsonb_agg("visitId" ORDER BY "visitId") FROM pageRows), '[]'::jsonb))`
    : `jsonb_build_object('kind', ?::text, 'records',
         COALESCE((SELECT jsonb_agg(jsonb_build_object('visitId', "visitId", 'recordId', id)
           ORDER BY "visitId", id) FROM pageRows), '[]'::jsonb))`} AS evidence,
       paging.total::text, paging.page FROM paging`,
    [...source.bindings, context.workspaceId, own, context.userId,
      ...(visitEvidence ? [] : [query.selected === 'jobs' ? 'job' : 'work_order']),
      query.page, query.pageSize, query.pageSize, query.pageSize,
      context.workspaceId, own, context.userId, wide, context.userId, ...roster.bindings,
      ...(visitEvidence ? [] : [query.selected])],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no unscheduled Calendar projection.');
  return calendarUnscheduledResultSchema.parse({
    workspaceId: context.workspaceId, view: 'calendar-unscheduled', ...clock,
    scope: own ? { kind: 'own', viewerId: context.userId } : { kind: 'workspace' },
    scopeLabel: own ? 'My current unscheduled visits and authorized active records only.'
      : 'Current unscheduled canonical visits and authorized active records; record and participant counts are non-additive.',
    counts: result.counts, members: result.members, visits: result.visits, evidence: result.evidence, filters: query.filters,
    evidenceTotal: Number(result.total), page: result.page, pageSize: query.pageSize,
  });
}

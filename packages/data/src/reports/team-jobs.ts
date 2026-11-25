import {serviceDisplaySql} from '../services/store';
import type { Knex } from 'knex';
import {
  teamJobsQuerySchema, teamJobsResultSchema,
  type AuthorizationContext, type TeamJobsQuery, type TeamJobsResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { jobReportContext } from './job-context';
import { validateTeamReportMembers } from './team-filters';

export const teamJobEvidenceJSON = `jsonb_build_object(
  'id', j.id, 'recordId', j.id,
  'label', 'J-' || CASE WHEN length(j."jobNumber"::text) < 4 THEN lpad(j."jobNumber"::text, 4, '0')
    ELSE j."jobNumber"::text END || ' / ' || COALESCE(NULLIF(j.title, ''), j."customerName"),
  'status', j.status, 'completionDeadline', to_char(j."completionDeadline", 'YYYY-MM-DD'),
  'scheduledDate', to_char(j."scheduledDate", 'YYYY-MM-DD'), 'waitingReason', j."waitingReason",
  'cells', jsonb_build_object('service', COALESCE(NULLIF(btrim(${serviceDisplaySql('j')}), ''), 'No recorded service')),
  'primary', CASE WHEN ?::boolean AND j."primaryOwnerId" IS DISTINCT FROM ?
    THEN jsonb_build_object('kind', 'withheld')
    WHEN j."primaryOwnerId" IS NULL THEN jsonb_build_object('kind', 'unassigned')
    ELSE jsonb_build_object('kind', 'member', 'id', j."primaryOwnerId") END,
  'supportingMemberIds', COALESCE((SELECT jsonb_agg(s."userId" ORDER BY s."userId") FROM support s
    WHERE s."jobId" = j.id), '[]'::jsonb))`;

export async function teamJobsWorkloadSource(
  trx: Knex.Transaction, context: AuthorizationContext, query: TeamJobsQuery, forceAssigned = false,
) {
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await jobReportContext(trx, context, forceAssigned);
  const assigned = auth.scope === 'assigned';
  await validateTeamReportMembers(trx, context, assigned, query.filters);
  const selected = query.selected;
  if (assigned && (selected.kind === 'unassigned' ||
    (selected.kind === 'queue' && selected.queue === 'unassigned') ||
    (selected.kind === 'member' && selected.id !== context.userId))) {
    throw new AuthorizationAccessError();
  }
  const scoped = auth.query.clone().whereIn('j.status', ['needs-scheduling', 'scheduled', 'in-progress', 'waiting']);
  if (query.filters.members.length > 0) scoped.where(builder => {
    builder.whereIn('j.primaryOwnerId', query.filters.members).orWhereExists(
      trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('?? = ??', ['t.jobId', 'j.id'])
        .whereRaw('?? = ??', ['t.workspaceId', 'j.workspaceId']).whereIn('t.userId', query.filters.members),
    );
  });
  const base = scoped.select('j.*').toSQL();
  const predicate = selected.kind === 'queue'
    ? selected.queue === 'active' ? 'TRUE' : selected.queue === 'overdue' ? 'j.overdue'
      : selected.queue === 'waiting' ? `j.status = 'waiting'` : 'j."primaryOwnerId" IS NULL'
    : `${selected.kind === 'unassigned' ? 'j."primaryOwnerId" IS NULL'
      : selected.responsibility === 'primary' ? 'j."primaryOwnerId" = ?'
        : 'EXISTS (SELECT 1 FROM support s WHERE s."jobId" = j.id AND s."userId" = ?)'}
      AND ${selected.filter === 'all' ? 'TRUE' : selected.filter === 'overdue' ? 'j.overdue' : 'j.status = ?'}`;
  const selectionBindings = [
    ...(selected.kind === 'member' ? [selected.id] : []),
    ...(selected.kind !== 'queue' && selected.filter !== 'all' && selected.filter !== 'overdue' ? [selected.filter] : []),
  ];
  return { auth, assigned, predicate, selectionBindings, sql: `WITH active AS MATERIALIZED (${base.sql}),
     reportJobs AS MATERIALIZED (
       SELECT j.*, COALESCE(j."completionDeadline" < ?::date, FALSE) AS overdue FROM active j
     ),
     roster AS MATERIALIZED (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m
       JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND (?::boolean = FALSE OR m."userId" = ?)
     ),
     support AS MATERIALIZED (
       SELECT DISTINCT t."jobId", t."userId" FROM "jobTeamMembers" t
       JOIN reportJobs j ON j.id = t."jobId" AND j."workspaceId" = t."workspaceId"
       JOIN roster r ON r.id = t."userId"
     )`, bindings: [...base.bindings, auth.today, context.workspaceId, assigned, context.userId] };
}

/** Primary/supporting projections and evidence share one authorized active-Job statement snapshot. */
export async function readTeamJobsReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  rawQuery: Omit<TeamJobsQuery, 'filters'> & { filters?: TeamJobsQuery['filters'] },
  forceAssigned = false,
): Promise<TeamJobsResult> {
  const query = teamJobsQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { auth, assigned, sql, bindings, predicate, selectionBindings } =
    await teamJobsWorkloadSource(trx, context, query, forceAssigned);
  const selected = query.selected;
  const result = await trx.raw<{ rows: { members: unknown; unassigned: unknown; counts: unknown; rows: unknown; evidenceTotal: string; page: number; invalid: boolean }[] }>(
    `${sql},
     participation AS MATERIALIZED (
       SELECT j.id AS "jobId", j."primaryOwnerId" AS member, 'primary' AS responsibility FROM reportJobs j
       WHERE j."primaryOwnerId" IS NOT NULL
       UNION ALL
       SELECT s."jobId", s."userId", 'supporting' FROM support s
     ),
     workloads AS (
       SELECT p.member, p.responsibility, jsonb_build_object(
         'count', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE j.overdue),
         'waiting', COUNT(*) FILTER (WHERE j.status = 'waiting'),
         'statuses', jsonb_build_object(
           'needs-scheduling', COUNT(*) FILTER (WHERE j.status = 'needs-scheduling'),
           'scheduled', COUNT(*) FILTER (WHERE j.status = 'scheduled'),
           'in-progress', COUNT(*) FILTER (WHERE j.status = 'in-progress'),
           'waiting', COUNT(*) FILTER (WHERE j.status = 'waiting')
         )) AS value
       FROM participation p JOIN reportJobs j ON j.id = p."jobId" GROUP BY p.member, p.responsibility
     ),
     empty AS (
       SELECT '{"count":0,"overdue":0,"waiting":0,"statuses":{"needs-scheduling":0,"scheduled":0,"in-progress":0,"waiting":0}}'::jsonb AS value
     ),
     evidence AS MATERIALIZED (SELECT j.* FROM reportJobs j WHERE ${predicate}),
     paging AS (
       SELECT COUNT(*) AS total, LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "completionDeadline" ASC NULLS LAST, "jobNumber", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT EXISTS (
       SELECT 1 FROM support s JOIN reportJobs j ON j.id = s."jobId" WHERE s."userId" = j."primaryOwnerId"
     ) AS invalid,
     (SELECT jsonb_build_object('active', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE overdue),
       'waiting', COUNT(*) FILTER (WHERE status = 'waiting')) FROM reportJobs) AS counts,
     COALESCE((SELECT jsonb_agg(jsonb_build_object(
       'id', r.id, 'label', r.label,
       'primary', COALESCE(p.value, e.value), 'supporting', COALESCE(s.value, e.value)
     ) ORDER BY lower(r.label), r.id)
       FROM roster r CROSS JOIN empty e
       LEFT JOIN workloads p ON p.member = r.id AND p.responsibility = 'primary'
       LEFT JOIN workloads s ON s.member = r.id AND s.responsibility = 'supporting'), '[]'::jsonb) AS members,
     CASE WHEN ?::boolean THEN NULL ELSE
       (SELECT jsonb_build_object('count', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE overdue),
         'waiting', COUNT(*) FILTER (WHERE status = 'waiting'), 'statuses', jsonb_build_object(
           'needs-scheduling', COUNT(*) FILTER (WHERE status = 'needs-scheduling'),
           'scheduled', COUNT(*) FILTER (WHERE status = 'scheduled'),
           'in-progress', COUNT(*) FILTER (WHERE status = 'in-progress'),
           'waiting', COUNT(*) FILTER (WHERE status = 'waiting')))
        FROM reportJobs WHERE "primaryOwnerId" IS NULL) END AS unassigned,
     COALESCE((SELECT jsonb_agg(${teamJobEvidenceJSON}
       ORDER BY j."completionDeadline" ASC NULLS LAST, j."jobNumber", j.id) FROM pageRows j), '[]'::jsonb) AS rows,
     paging.total::text AS "evidenceTotal", paging.page FROM paging`,
    [
      ...bindings,
      ...selectionBindings, query.page, query.pageSize, query.pageSize, query.pageSize,
      assigned, assigned, context.userId,
    ],
  );
  const projection = result.rows[0];
  if (!projection) throw new Error('The database returned no Team Jobs workload projection.');
  if (projection.invalid) throw new Error('Team Jobs report encountered overlapping primary and supporting assignments.');
  if (selected.kind === 'member') {
    const members = projection.members;
    if (!Array.isArray(members) || !members.some(member =>
      member !== null && typeof member === 'object' && 'id' in member && member.id === selected.id)) {
      throw new AuthorizationAccessError();
    }
  }
  const evidenceTotal = Number(projection.evidenceTotal);
  if (!Number.isSafeInteger(evidenceTotal) || evidenceTotal < 0) throw new RangeError('Team Jobs evidence count is outside the safe integer range.');
  return teamJobsResultSchema.parse({
    filters: query.filters,
    view: 'team-jobs', asOf: auth.asOf.toISOString(), today: auth.today, timezone: auth.timezone,
    scopeLabel: assigned ? 'My current Job responsibility and supporting participation only.' : auth.scopeLabel,
    scope: assigned ? { kind: 'assigned', currentMemberId: context.userId } : { kind: 'workspace' },
    counts: projection.counts, members: projection.members, unassigned: projection.unassigned,
    selected, page: projection.page, pageSize: query.pageSize, evidenceTotal, rows: projection.rows,
  });
}

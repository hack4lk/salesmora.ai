import type { Knex } from 'knex';
import {
  teamLeadsQuerySchema, teamLeadsResultSchema,
  type AuthorizationContext, type TeamLeadsQuery, type TeamLeadsResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { leadReportContext } from './leads';
import { validateTeamReportMembers } from './team-filters';

export const teamLeadEvidenceJSON = `jsonb_build_object(
  'id', l.id, 'recordId', l.id, 'label', l.name, 'stage', l.stage, 'archived', FALSE,
  'currentOwnerId', l."currentOwnerId", 'ownerState', l."ownerState", 'inactive', l.inactive,
  'cells', jsonb_build_object(
    'created', to_char(l."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'activity', to_char(l."lastActivityAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'owner', CASE WHEN l."ownerState" = 'former' THEN 'Former owner / reassignment needed'
      WHEN l."ownerState" = 'unassigned' THEN 'No current owner'
      ELSE (SELECT r.label FROM roster r WHERE r.id = l."currentOwnerId") END
  ))`;

export async function teamLeadsWorkloadSource(
  trx: Knex.Transaction, context: AuthorizationContext, query: TeamLeadsQuery, forceAssigned = false,
) {
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await leadReportContext(trx, context, forceAssigned);
  const assigned = auth.scope === 'assigned';
  await validateTeamReportMembers(trx, context, assigned, query.filters);
  const selected = query.selected;
  if (assigned && (selected.kind === 'queue' ? selected.queue === 'unassigned'
    : selected.id !== `member:${context.userId}`)) throw new AuthorizationAccessError();
  const scoped = auth.scoped.clone().whereNull('l.archivedAt').whereIn('l.stage', ['new', 'contacted', 'estimate-sent']);
  if (query.filters.members.length > 0) scoped.whereIn('l.ownerId', query.filters.members);
  const base = scoped.select('l.*').toSQL();
  const predicate = selected.kind === 'queue'
    ? selected.queue === 'open' ? 'TRUE' : selected.queue === 'inactive' ? 'l.inactive' : 'l."currentOwnerId" IS NULL'
    : `l."ownerKey" = ? ${selected.stage === undefined ? '' : 'AND l.stage = ?'} ${selected.inactiveOnly ? 'AND l.inactive' : ''}`;
  const selectionBindings = selected.kind === 'queue' ? [] : [selected.id, ...(selected.stage ? [selected.stage] : [])];
  return { auth, assigned, predicate, selectionBindings, sql: `WITH open AS MATERIALIZED (${base.sql}),
     roster AS MATERIALIZED (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND (?::boolean = FALSE OR m."userId" = ?)
     ),
     reportLeads AS MATERIALIZED (
       SELECT l.*, r.id AS "currentOwnerId",
         CASE WHEN r.id IS NULL THEN 'unassigned' ELSE 'member:' || r.id END AS "ownerKey",
         CASE WHEN r.id IS NOT NULL THEN 'member' WHEN l."ownerId" IS NOT NULL THEN 'former' ELSE 'unassigned' END AS "ownerState",
         l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days' AS inactive
       FROM open l LEFT JOIN roster r ON r.id = l."ownerId"
     )`, bindings: [...base.bindings, context.workspaceId, assigned, context.userId] };
}

/** Current owner groups, inactivity and selected evidence share one authorized statement snapshot. */
export async function readTeamLeadsReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  rawQuery: Omit<TeamLeadsQuery, 'filters'> & { filters?: TeamLeadsQuery['filters'] },
  forceAssigned = false,
): Promise<TeamLeadsResult> {
  const query = teamLeadsQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { auth, assigned, sql, bindings, predicate, selectionBindings } =
    await teamLeadsWorkloadSource(trx, context, query, forceAssigned);
  const selected = query.selected;
  const result = await trx.raw<{ rows: { counts: unknown; owners: unknown; rows: unknown; page: number; evidenceTotal: string; inactivityCutoff: string }[] }>(
    `${sql},
     groups AS (
       SELECT "ownerKey" AS id, jsonb_build_object(
         'count', COUNT(*), 'inactive', COUNT(*) FILTER (WHERE inactive), 'stages', jsonb_build_object(
           'new', COUNT(*) FILTER (WHERE stage = 'new'),
           'contacted', COUNT(*) FILTER (WHERE stage = 'contacted'),
           'estimate-sent', COUNT(*) FILTER (WHERE stage = 'estimate-sent')
         )) AS value FROM reportLeads GROUP BY "ownerKey"
     ),
     options AS (
       SELECT 'member:' || id AS id, label FROM roster
       UNION ALL SELECT 'unassigned', 'No current owner / reassignment needed' WHERE ?::boolean = FALSE
     ),
     evidence AS MATERIALIZED (SELECT l.* FROM reportLeads l WHERE ${predicate}),
     paging AS (
       SELECT COUNT(*) AS total,
         LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "lastActivityAt", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT (SELECT jsonb_build_object('open', COUNT(*), 'inactive', COUNT(*) FILTER (WHERE inactive),
       'unassigned', COUNT(*) FILTER (WHERE "currentOwnerId" IS NULL)) FROM reportLeads) AS counts,
       COALESCE((SELECT jsonb_agg(
         jsonb_build_object('id', o.id, 'label', o.label) || COALESCE(g.value,
           '{"count":0,"inactive":0,"stages":{"new":0,"contacted":0,"estimate-sent":0}}'::jsonb)
         ORDER BY (o.id = 'unassigned'), lower(o.label), o.id)
         FROM options o LEFT JOIN groups g ON g.id = o.id), '[]'::jsonb) AS owners,
       COALESCE((SELECT jsonb_agg(${teamLeadEvidenceJSON}
         ORDER BY l."lastActivityAt", l.id) FROM pageRows l), '[]'::jsonb) AS rows,
       paging.page, paging.total::text AS "evidenceTotal",
       to_char((CURRENT_TIMESTAMP - INTERVAL '7 days') AT TIME ZONE 'UTC',
         'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "inactivityCutoff"
     FROM paging`,
    [
      ...bindings, assigned,
      ...selectionBindings, query.page, query.pageSize, query.pageSize, query.pageSize,
    ],
  );
  const projection = result.rows[0];
  if (!projection) throw new Error('The database returned no Team Lead workload projection.');
  if (selected.kind === 'owner') {
    const owners = projection.owners;
    if (!Array.isArray(owners) || !owners.some(owner =>
      owner !== null && typeof owner === 'object' && 'id' in owner && owner.id === selected.id)) {
      throw new AuthorizationAccessError();
    }
  }
  const evidenceTotal = Number(projection.evidenceTotal);
  if (!Number.isSafeInteger(evidenceTotal) || evidenceTotal < 0) throw new RangeError('Team Lead evidence count is outside the safe integer range.');
  return teamLeadsResultSchema.parse({
    view: 'team-leads', asOf: auth.asOf.toISOString(), today: auth.today, timezone: auth.timezone,
    scope: assigned ? { kind: 'assigned', currentMemberId: context.userId } : { kind: 'workspace' },
    scopeLabel: assigned ? 'My current non-archived open Leads only.' : 'Currently authorized non-archived open Leads; missing memberships need reassignment.',
    inactivityCutoff: projection.inactivityCutoff,
    filters: query.filters,
    counts: projection.counts, owners: projection.owners, selected,
    page: projection.page, pageSize: query.pageSize, evidenceTotal, rows: projection.rows,
  });
}

import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import {
  estimateFirstQuotedQuerySchema, estimateFirstQuotedResultSchema,
  type AuthorizationContext, type EstimateFirstQuotedQuery, type EstimateFirstQuotedResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { estimateReportContext } from './estimate-context';
import { applyEstimateReportFilters, validateEstimateReportFilters, estimateReportOwnerSQL } from './estimate-filters';

export async function estimateFirstQuotedSource(
  trx: Knex.Transaction, context: AuthorizationContext, query: EstimateFirstQuotedQuery, forceAssigned = false,
) {
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await estimateReportContext(trx, context, forceAssigned);
  if (query.period.to > auth.clock.today) throw new RangeError('First-quoted periods cannot extend beyond the workspace date.');
  const scoped = auth.scoped.select('e.*').toSQL();
  const candidates = auth.scoped.clone().clearSelect()
    .where(builder => builder.whereNotNull('e.sentAt').orWhereNotNull('e.publishedAt').orWhereNot('e.status', 'draft')
      .orWhereExists(trx('estimate_activity as a').select(trx.raw('1')).whereRaw(
        `a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id AND a.type IN ('sent','published')`)))
    .distinctOn('e.estimateNumber').select('e.*').orderBy('e.estimateNumber').orderBy('e.revision', 'desc').orderBy('e.id', 'desc');
  const options = trx.from(candidates.as('e'));
  if (!auth.includeArchived) options.whereNull('e.archivedAt');
  await validateEstimateReportFilters(options, query.filters, trx);
  const filtered = applyEstimateReportFilters(trx('current as e').select('e.*',
    trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`)), query.filters).toSQL();
  const sql = `WITH authorized AS MATERIALIZED (${scoped.sql}),
     issued AS MATERIALIZED (
       SELECT e.* FROM authorized e
       WHERE e."sentAt" IS NOT NULL OR e."publishedAt" IS NOT NULL
         OR e.status <> 'draft'
         OR EXISTS (SELECT 1 FROM estimate_activity a WHERE a."workspaceId" = e."workspaceId"
           AND a."estimateId" = e.id AND a.type IN ('sent', 'published'))
     ),
     current AS MATERIALIZED (
       SELECT DISTINCT ON ("estimateNumber") * FROM issued ORDER BY "estimateNumber", revision DESC, id DESC
     ),
     filtered AS MATERIALIZED (${filtered.sql}),
     families AS MATERIALIZED (
       SELECT c.*, f.at AS "firstAt", f.revision AS "firstRevision", f.type AS "firstType",
         own.at AS "currentAt",
         EXISTS (
           SELECT 1 FROM issued e WHERE e."estimateNumber" = c."estimateNumber" AND NOT EXISTS (
             SELECT 1 FROM estimate_activity a WHERE a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
               AND a.type IN ('sent', 'published'))
         ) AS missing,
         EXISTS (
           SELECT 1 FROM issued e JOIN estimate_activity a
             ON a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
           WHERE e."estimateNumber" = c."estimateNumber" AND a.type IN ('sent', 'published')
             AND ((a.changes->'status'->>'before' = 'draft'
               AND a.changes->'status'->>'after' = a.type) IS NOT TRUE OR a."createdAt" > CURRENT_TIMESTAMP
               OR a."createdAt" < e."createdAt")
         ) AS malformed
       FROM filtered c
       LEFT JOIN LATERAL (
         SELECT a."createdAt" AS at, e.revision, a.type FROM issued e
         JOIN estimate_activity a ON a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
         WHERE e."estimateNumber" = c."estimateNumber" AND a.type IN ('sent', 'published')
         ORDER BY a."createdAt", e.revision, a.id LIMIT 1
       ) f ON TRUE
       LEFT JOIN LATERAL (
         SELECT a."createdAt" AS at FROM estimate_activity a
         WHERE a."workspaceId" = c."workspaceId" AND a."estimateId" = c.id AND a.type IN ('sent', 'published')
         ORDER BY a."createdAt", a.id LIMIT 1
       ) own ON TRUE
       WHERE (?::boolean OR c."archivedAt" IS NULL)
     ),
     evidence AS MATERIALIZED (
       SELECT *, to_char("firstAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "firstDate",
         to_char("currentAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "currentDate"
       FROM families WHERE NOT missing AND "firstAt" IS NOT NULL AND "currentAt" IS NOT NULL
         AND ("firstAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date
     )`;
  const bindings = [...scoped.bindings, ...filtered.bindings, auth.includeArchived, auth.clock.timezone, auth.clock.timezone,
    auth.clock.timezone, query.period.from, query.period.to];
  return { auth, sql, bindings };
}

const evidenceJSON = `jsonb_build_object(
  'ownerKey', "ownerKey", 'parentType', "parentType",
  'familyId', ? || ':EST-' || CASE WHEN length("estimateNumber"::text) < 4 THEN lpad("estimateNumber"::text, 4, '0') ELSE "estimateNumber"::text END,
  'estimateNumber', 'EST-' || CASE WHEN length("estimateNumber"::text) < 4 THEN lpad("estimateNumber"::text, 4, '0') ELSE "estimateNumber"::text END,
  'recordId', id, 'label', name, 'firstIssuedDate', "firstDate", 'firstIssuedRevision', "firstRevision",
  'firstIssuedVia', CASE WHEN "firstType" = 'sent' THEN 'send' ELSE 'publish' END,
  'currentIssuedRevision', revision, 'currentIssuedDate', "currentDate",
  'currentStatus', CASE WHEN status IN ('sent','published') AND "validUntil" < ?::date THEN 'expired' ELSE status END,
  'archived', "archivedAt" IS NOT NULL
)`;

/** Callers retain the transaction and must exhaust or close the generator. */
export async function* estimateFirstQuotedEvidence(
  trx: Knex.Transaction, source: Awaited<ReturnType<typeof estimateFirstQuotedSource>>,
  workspaceId: string, signal?: AbortSignal,
): AsyncGenerator<EstimateFirstQuotedResult['rows'][number]> {
  const cursor = `estimate_first_${randomUUID().replaceAll('-', '')}`;
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${source.sql}
    SELECT ${evidenceJSON} AS row FROM evidence ORDER BY "firstAt" DESC, id`,
  [cursor, ...source.bindings, workspaceId, source.auth.clock.today]);
  try {
    while (true) {
      signal?.throwIfAborted();
      const batch = await trx.raw<{ rows: { row: unknown }[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
      if (!batch.rows.length) break;
      for (const row of batch.rows) {
        signal?.throwIfAborted();
        yield estimateFirstQuotedResultSchema.shape.rows.element.parse(row.row);
      }
    }
  } finally { await trx.raw('CLOSE ??', [cursor]); }
}

/** Select original issuance before the period; totals, coverage and evidence share one statement snapshot. */
export async function readEstimateFirstQuotedReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
  rawQuery: Omit<EstimateFirstQuotedQuery, 'filters'> & { filters?: EstimateFirstQuotedQuery['filters'] },
  forceAssigned = false,
): Promise<EstimateFirstQuotedResult> {
  const query = estimateFirstQuotedQuerySchema.parse(rawQuery);
  const source = await estimateFirstQuotedSource(trx, context, query, forceAssigned);
  const { auth } = source;
  const projection = await trx.raw<{ rows: { total: string; page: number; missing: boolean; invalid: boolean; rows: unknown }[] }>(
    `${source.sql},
     paging AS (
       SELECT COUNT(*) AS total, LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "firstAt" DESC, id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT paging.total::text, paging.page,
       EXISTS (SELECT 1 FROM families WHERE missing) AS missing,
       EXISTS (SELECT 1 FROM families WHERE malformed OR status NOT IN ('sent','published','accepted','declined','expired','void')
         OR "firstRevision" > revision OR "currentAt" < "firstAt") AS invalid,
       COALESCE((SELECT jsonb_agg(${evidenceJSON} ORDER BY "firstAt" DESC, id) FROM pageRows), '[]'::jsonb) AS rows FROM paging`,
    [...source.bindings, query.page, query.pageSize, query.pageSize, query.pageSize, context.workspaceId, auth.clock.today],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no first-quoted Estimate projection.');
  if (result.invalid) throw new Error('First-quoted Estimate history has inconsistent initial issuance evidence.');
  return estimateFirstQuotedResultSchema.parse({
    workspaceId: context.workspaceId, view: 'estimate-first-quoted',
    asOf: auth.clock.asOf.toISOString(), from: query.period.from, to: query.period.to,
    today: auth.clock.today, timezone: auth.clock.timezone, scope: auth.scope,
    archiveVisibility: auth.includeArchived ? 'included' : 'excluded',
    scopeLabel: `${auth.assigned ? 'Estimates on currently assigned Jobs only.' : 'Currently authorized workspace Estimate families.'} First initial Send/Publish history; no monetary or decision attribution.`,
    total: Number(result.total), page: result.page, pageSize: query.pageSize, rows: result.rows,
    filters: query.filters,
    coverage: result.missing ? { kind: 'partial', explanation: 'Some authorized issued families lack initial Send/Publish history and are excluded; no issuance dates are inferred.' }
      : { kind: 'complete' },
  });
}

import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  estimateDecisionsQuerySchema, estimateDecisionsResultSchema, jobDateSchema,
  type AuthorizationContext, type EstimateDecisionsQuery, type EstimateDecisionsResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { estimateReportContext, estimateReportFrozenMoney, addEstimateReportMoney } from './estimate-context';
import { applyEstimateReportFilters, validateEstimateReportFilters, estimateReportOwnerSQL } from './estimate-filters';

const sourceRow = z.object({
  id: z.uuid(), estimateNumber: z.number().int().positive(), revision: z.number().int().positive(),
  version: z.number().int().positive(), name: z.string().trim().min(1), status: z.enum(['accepted', 'declined']),
  archived: z.boolean(), decisionId: z.uuid(), decisionVersion: z.number().int().positive(),
  outcome: z.enum(['accepted', 'declined']), decisionDate: jobDateSchema, recordedDate: jobDateSchema,
  snapshotId: z.uuid(), decisionSnapshotId: z.uuid(), content: z.unknown(), contentHash: z.string(),
  snapshotTotalCents: z.string(), acceptedTotalCents: z.string().nullable(),
  ownerKey: z.string(), parentType: z.enum(['lead', 'job']),
});

export async function estimateDecisionsSource(
  trx: Knex.Transaction, context: AuthorizationContext, query: EstimateDecisionsQuery, forceAssigned = false,
) {
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await estimateReportContext(trx, context, forceAssigned);
  const { query: scoped, includeArchived, clock } = auth;
  const options = scoped.clone();
  if (!includeArchived) options.whereNull('e.archivedAt');
  await validateEstimateReportFilters(options, query.filters, trx);
  applyEstimateReportFilters(scoped, query.filters);
  if (query.period.to > clock.today) throw new RangeError('Estimate decision periods cannot extend beyond the workspace date.');
  const source = scoped
    .whereIn('e.status', ['accepted', 'declined'])
    .joinRaw(`LEFT JOIN LATERAL (
      SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
      ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
    ) d ON TRUE`)
    .leftJoin('estimate_snapshots as s', function joinSnapshot() {
      this.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id');
    })
    .where(builder => builder.whereBetween('d.decisionDate', [query.period.from, query.period.to]).orWhereNull('d.id'))
    .select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'e.status',
      'e.parentType', trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`),
      's.content', 's.contentHash', 'd.outcome',
      trx.raw(`e."archivedAt" IS NOT NULL AS archived, d.id AS "decisionId",
        d."estimateVersion" AS "decisionVersion", s.id AS "snapshotId", d."snapshotId" AS "decisionSnapshotId",
        d."snapshotTotalCents"::text AS "snapshotTotalCents", e."acceptedTotalCents"::text AS "acceptedTotalCents",
        to_char(d."decisionDate", 'YYYY-MM-DD') AS "decisionDate",
        to_char(d."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "recordedDate"`, [clock.timezone]))
    .orderBy('d.decisionDate', 'desc').orderBy('e.id');
  if (!includeArchived) source.whereNull('e.archivedAt');
  return { auth, source };
}

/** Callers retain the transaction and must exhaust or close the generator. */
export async function* estimateDecisionsEvidence(
  trx: Knex.Transaction, context: AuthorizationContext, source: Knex.QueryBuilder, signal?: AbortSignal,
): AsyncGenerator<EstimateDecisionsResult['rows'][number]> {
  const cursor = `estimate_decisions_${randomUUID().replaceAll('-', '')}`;
  const sql = source.toSQL();
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [cursor, ...sql.bindings]);
  try {
    while (true) {
      signal?.throwIfAborted();
      const batch = await trx.raw<{ rows: unknown[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
      if (!batch.rows.length) break;
      for (const rawRow of batch.rows) {
        signal?.throwIfAborted();
        const row = sourceRow.parse(rawRow);
        if (row.outcome !== row.status || row.decisionVersion > row.version ||
          row.snapshotId !== row.decisionSnapshotId) {
          throw new Error('The effective Estimate decision does not match its issued revision.');
        }
        const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
        const money = estimateReportFrozenMoney(row.content, row.contentHash, number, row.revision, {
          total: row.snapshotTotalCents, ...(row.outcome === 'accepted' ? { acceptedTotal: row.acceptedTotalCents } : {}),
        });
        yield {
          ownerKey: row.ownerKey, parentType: row.parentType,
          familyId: `${context.workspaceId}:${number}`, recordId: row.id, estimateNumber: number,
          revision: row.revision, decisionVersion: row.decisionVersion, label: row.name, outcome: row.outcome,
          decisionDate: row.decisionDate, recordedDate: row.recordedDate, archived: row.archived, money,
        };
      }
    }
  } finally { await trx.raw('CLOSE ??', [cursor]); }
}

/** Cursor-scans one statement snapshot, validating every accepted value while retaining bounded evidence. */
export async function readEstimateDecisionsReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
  rawQuery: Omit<EstimateDecisionsQuery, 'filters'> & { filters?: EstimateDecisionsQuery['filters'] },
  forceAssigned = false,
): Promise<EstimateDecisionsResult> {
  const query = estimateDecisionsQuerySchema.parse(rawQuery);
  const { auth, source } = await estimateDecisionsSource(trx, context, query, forceAssigned);
  const { scope, assigned, includeArchived, clock } = auth;
  const counts = { accepted: 0, declined: 0 };
  let money: EstimateDecisionsResult['money'] = { kind: 'available', preTaxCents: 0, customerTotalCents: 0 };
  let evidenceTotal = 0;
  const requested: EstimateDecisionsResult['rows'] = [];
  let lastPage: EstimateDecisionsResult['rows'] = [];
  const offset = (query.page - 1) * query.pageSize;
  for await (const evidence of estimateDecisionsEvidence(trx, context, source)) {
    counts[evidence.outcome]++;
    if (!Number.isSafeInteger(counts[evidence.outcome])) throw new RangeError('Estimate decision count exceeds the safe integer range.');
    if (evidence.outcome === 'accepted') money = addEstimateReportMoney(money, evidence.money);
    if (query.selected !== 'decided' && query.selected !== evidence.outcome) continue;
    if (evidenceTotal % query.pageSize === 0) lastPage = [];
    lastPage.push(evidence);
    if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
    evidenceTotal++;
  }
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  return estimateDecisionsResultSchema.parse({
    view: 'estimate-decisions', workspaceId: context.workspaceId, asOf: clock.asOf.toISOString(),
    from: query.period.from, to: query.period.to, timezone: clock.timezone, scope,
    archiveVisibility: includeArchived ? 'included' : 'excluded',
    scopeLabel: `${assigned ? 'Estimates on currently assigned Jobs only.' : 'Currently authorized workspace Estimates.'} ${includeArchived ? 'Archived effective decisions included.' : 'Archived decisions excluded by current access.'}`,
    counts, money, selected: query.selected, page, pageSize: query.pageSize, evidenceTotal,
    filters: query.filters,
    rows: page === query.page ? requested : lastPage,
  });
}

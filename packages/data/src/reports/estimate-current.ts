import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import {
  estimateCurrentQuerySchema, estimateCurrentResultSchema, jobDateSchema,
  type AuthorizationContext, type EstimateCurrentQuery, type EstimateCurrentResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { estimateReportContext, estimateReportFrozenMoney, addEstimateReportMoney, estimateReportHandoffAllowed } from './estimate-context';
import { applyEstimateReportFilters, validateEstimateReportFilters, estimateReportOwnerSQL } from './estimate-filters';

const sourceRow = z.object({
  id: z.uuid(), estimateNumber: z.number().int().positive(), revision: z.number().int().positive(),
  version: z.number().int().positive(), name: z.string().trim().min(1),
  status: z.enum(['sent', 'published', 'expired', 'accepted']),
  issuedDate: jobDateSchema, validUntil: jobDateSchema.nullable(), sent: z.boolean(),
  content: z.unknown(), contentHash: z.string().nullable(), snapshotId: z.uuid().nullable(),
  decisionSnapshotId: z.uuid().nullable(), decisionVersion: z.number().int().positive().nullable(),
  outcome: z.string().nullable(), decisionDate: jobDateSchema.nullable(),
  snapshotTotalCents: z.string().nullable(), acceptedTotalCents: z.string().nullable(),
  ownerKey: z.string(), parentType: z.enum(['lead', 'job']),
});

export async function estimateCurrentSource(
  trx: Knex.Transaction, context: AuthorizationContext, query: EstimateCurrentQuery,
  forceAssigned = false, allowHandoff = true,
) {
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await estimateReportContext(trx, context, forceAssigned);
  await validateEstimateReportFilters(auth.query.clone().whereNull('e.archivedAt'), query.filters, trx);
  applyEstimateReportFilters(auth.query, query.filters);
  const canHandoff = allowHandoff && estimateReportHandoffAllowed(context, auth);
  const source = auth.query.whereNull('e.archivedAt').where(builder => {
    builder.whereIn('e.status', ['sent', 'published', 'expired']);
    if (canHandoff) builder.orWhere(handoff => handoff.where('e.status', 'accepted')
      .where('e.parentType', 'lead').whereNotNull('l.id').whereNull('l.archivedAt')
      .whereNotExists(trx('jobs as converted').select(trx.raw('1')).whereRaw(
        `converted."workspaceId" = e."workspaceId" AND
         (converted."acceptedEstimateId" = e.id OR converted."sourceLeadId" = e."leadId")`)));
  }).leftJoin('estimate_snapshots as s', function joinSnapshot() {
    this.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id');
  });
  if (canHandoff) source.joinRaw(`LEFT JOIN LATERAL (
    SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
    ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
  ) d ON e.status = 'accepted'`);
  source.select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'e.status', 's.content', 's.contentHash',
    'e.parentType', trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`),
    trx.raw(`s.id AS "snapshotId", e."acceptedTotalCents"::text AS "acceptedTotalCents",
      e."sentAt" IS NOT NULL AS sent,
      to_char(LEAST(s."createdAt", e."sentAt", e."publishedAt") AT TIME ZONE ?, 'YYYY-MM-DD') AS "issuedDate",
      to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`, [auth.clock.timezone]),
    trx.raw(canHandoff
      ? `d."snapshotId" AS "decisionSnapshotId", d."estimateVersion" AS "decisionVersion",
         d.outcome, d."snapshotTotalCents"::text AS "snapshotTotalCents",
         to_char(d."decisionDate", 'YYYY-MM-DD') AS "decisionDate"`
      : `NULL AS "decisionSnapshotId", NULL AS "decisionVersion", NULL AS outcome,
         NULL AS "snapshotTotalCents", NULL AS "decisionDate"`))
    .orderByRaw('LEAST(s."createdAt", e."sentAt", e."publishedAt") ASC, e.id ASC');
  return { auth, source, canHandoff };
}

/** Callers retain the transaction and must exhaust or close the generator. */
export async function* estimateCurrentEvidence(
  trx: Knex.Transaction, context: AuthorizationContext,
  source: Knex.QueryBuilder, today: string, canHandoff: boolean, signal?: AbortSignal,
): AsyncGenerator<{ queue: 'awaiting' | 'expired' | 'handoff'; evidence: EstimateCurrentResult['rows'][number] }> {
  const cursor = `estimate_current_${randomUUID().replaceAll('-', '')}`;
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
      if (row.issuedDate > today) throw new Error('Current Estimate has a future issuance date.');
      const queue = row.status === 'accepted' ? 'handoff'
        : row.validUntil !== null && row.validUntil < today ? 'expired' : 'awaiting';
      if (queue === 'handoff') {
        if (!canHandoff || row.outcome !== 'accepted' || row.decisionVersion === null ||
          row.decisionVersion > row.version || row.snapshotId === null || row.decisionSnapshotId !== row.snapshotId ||
          row.decisionDate === null || row.decisionDate < row.issuedDate || row.decisionDate > today ||
          row.snapshotTotalCents === null) throw new Error('Accepted handoff Estimate has inconsistent decision evidence.');
      }
      const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
      const money = estimateReportFrozenMoney(row.content, row.contentHash, number, row.revision,
        row.status === 'accepted' && row.snapshotTotalCents !== null
          ? { total: row.snapshotTotalCents, acceptedTotal: row.acceptedTotalCents } : undefined);
      const common = {
        ownerKey: row.ownerKey, parentType: row.parentType,
        familyId: `${context.workspaceId}:${number}`, recordId: row.id, estimateNumber: number,
        revision: row.revision, label: row.name, issuedDate: row.issuedDate, validUntil: row.validUntil,
        archived: false as const, money,
      };
      let evidence: EstimateCurrentResult['rows'][number];
      if (row.status === 'accepted') {
        if (row.decisionDate === null) throw new Error('Accepted handoff decision date is unavailable.');
        evidence = { ...common, status: 'accepted', decisionDate: row.decisionDate,
          parentType: 'lead', leadArchived: false, linkage: 'confirmed-absent' };
      } else evidence = { ...common, status: row.status === 'expired' ? row.sent ? 'sent' : 'published' : row.status };
      yield { queue, evidence };
    }
  }
  } finally { await trx.raw('CLOSE ??', [cursor]); }
}

/** Current queues use one cursor snapshot; handoff absence is queried only with complete linkage authority. */
export async function readEstimateCurrentReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
  rawQuery: Omit<EstimateCurrentQuery, 'filters'> & { filters?: EstimateCurrentQuery['filters'] },
  forceAssigned = false, allowHandoff = true,
): Promise<EstimateCurrentResult> {
  const query = estimateCurrentQuerySchema.parse(rawQuery);
  const { auth, source, canHandoff } = await estimateCurrentSource(trx, context, query, forceAssigned, allowHandoff);
  const counts = { awaiting: 0, expired: 0 };
  let handoffCount = 0;
  let awaitingMoney: EstimateCurrentResult['awaitingMoney'] = { kind: 'available', preTaxCents: 0, customerTotalCents: 0 };
  let evidenceTotal = 0;
  const requested: EstimateCurrentResult['rows'] = [];
  let lastPage: EstimateCurrentResult['rows'] = [];
  const offset = (query.page - 1) * query.pageSize;
  for await (const { queue, evidence } of estimateCurrentEvidence(trx, context, source, auth.clock.today, canHandoff)) {
    if (queue === 'handoff') handoffCount++;
    else counts[queue]++;
    if (![counts.awaiting, counts.expired, handoffCount].every(Number.isSafeInteger)) {
      throw new RangeError('Current Estimate queue count exceeds the safe integer range.');
    }
    if (queue === 'awaiting') awaitingMoney = addEstimateReportMoney(awaitingMoney, evidence.money);
    if (queue !== query.selected) continue;
    if (evidenceTotal % query.pageSize === 0) lastPage = [];
    lastPage.push(evidence);
    if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
    evidenceTotal++;
  }
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  return estimateCurrentResultSchema.parse({
    workspaceId: context.workspaceId, view: 'estimate-current', asOf: auth.clock.asOf.toISOString(),
    today: auth.clock.today, timezone: auth.clock.timezone, scope: auth.scope,
    scopeLabel: `${auth.assigned ? 'Current Estimates on assigned Jobs only.' : 'Currently authorized workspace Estimates.'} Archived Estimates excluded.`,
    counts, awaitingMoney,
    filters: query.filters,
    handoff: canHandoff ? { kind: 'available', count: handoffCount }
      : { kind: 'unavailable', explanation: 'Complete current Lead and Job linkage visibility is required; missing access does not prove no handoff.' },
    selected: query.selected, page, pageSize: query.pageSize, evidenceTotal,
    rows: page === query.page ? requested : lastPage,
  });
}

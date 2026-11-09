import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import { financialMaterialsQuerySchema, financialMaterialsResultSchema, workOrderMaterialStatuses,
  type AuthorizationContext, type FinancialMaterialsQuery, type FinancialMaterialsResult } from '@salesmora/contracts';
import { authorize, recordedMaterialLineCostCents, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scoped as scopedWorkOrders } from '../work-orders/store';
import { scopedJobQuery } from '../jobs/query';

const material = z.object({
  id: z.uuid(), workOrderId: z.uuid(), workOrderLabel: z.string(), jobLabel: z.string().nullable(),
  workOrderStatus: z.enum(['issued', 'in-progress']), itemLabel: z.string(), quantity: z.string(),
  unit: z.string(), status: z.enum(workOrderMaterialStatuses), unitCostCents: z.number().int().nullable(),
  changedAfterIssue: z.boolean(),
});
const materialEvidenceSchema = financialMaterialsResultSchema.shape.rows.element;
type Coverage = { lineCount: number; knownCostLines: number; missingCostLines: number; knownCostCents: number | null };
const emptyCoverage = (): Coverage => ({ lineCount: 0, knownCostLines: 0, missingCostLines: 0, knownCostCents: null });
function addLine(total: Coverage, cost: number | null): void {
  total.lineCount++;
  if (cost === null) total.missingCostLines++;
  else { total.knownCostLines++; total.knownCostCents = (total.knownCostCents ?? 0) + cost; }
  if (![total.lineCount, total.knownCostLines, total.missingCostLines, total.knownCostCents]
    .every(value => value === null || Number.isSafeInteger(value))) {
    throw new RangeError('Recorded material costs exceed the safe integer range.');
  }
}

export async function* financialMaterialEvidence(
  trx: Knex.Transaction, source: Knex.QueryBuilder, signal?: AbortSignal,
): AsyncGenerator<FinancialMaterialsResult['rows'][number]> {
  const cursor = `financial_materials_${randomUUID().replaceAll('-', '')}`, sql = source.toSQL();
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [cursor, ...sql.bindings]);
  try {
    while (true) {
      signal?.throwIfAborted();
      const batch = await trx.raw<{ rows: unknown[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
      if (!batch.rows.length) break;
      for (const saved of batch.rows) {
        signal?.throwIfAborted();
        const row = material.parse(saved), cost = recordedMaterialLineCostCents(row.quantity, row.unitCostCents);
        if (cost === undefined) throw new Error('An authorized material has an invalid quantity or recorded unit cost.');
        yield materialEvidenceSchema.parse({ ...row, lineCostCents: cost });
      }
    }
  } finally { await trx.raw('CLOSE ??', [cursor]); }
}

/** Current material snapshots only, with exact per-line rounding and bounded whole-population validation. */
export async function prepareFinancialMaterialsReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: FinancialMaterialsQuery,
  options: { forceAssigned?: boolean; allowJobLabels?: boolean; forceAssignedJobLabels?: boolean } = {},
) {
  const query = financialMaterialsQuerySchema.parse(rawQuery);
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (query.workspaceId !== context.workspaceId || !report.allowed ||
    !authorize(context, { permission: 'reports.financial.read' }).allowed) throw new AuthorizationAccessError();
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
    trx.raw('CURRENT_TIMESTAMP AS "asOf"'),
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.timezone !== 'string' || typeof clock.today !== 'string' || !(clock.asOf instanceof Date)) {
    throw new Error('The workspace Financial clock is unavailable.');
  }
  const orders = resolveAuthorizedCollectionScope(context, 'workorders.read');
  const assigned = !!options.forceAssigned || report.scope === 'assigned' || orders.allowed && orders.scope === 'assigned_job';
  const scope = assigned ? 'assigned' : 'workspace';
  const base = { workspaceId: context.workspaceId, view: 'financial-materials' as const, today: clock.today,
    asOf: clock.asOf.toISOString(), timezone: clock.timezone, scope, archiveVisibility: 'excluded' as const,
    scopeLabel: 'Current non-archived issued/in-progress Work Order material snapshots. Rounded half up per line; missing costs excluded, not zero. Not actual spend or consumption; post-issue edits may restate.',
    filters: query.filters, selected: query.selected, pageSize: query.pageSize };
  const can = (permission: 'workorders.view_prices' | 'workorders.view_costs') => authorize(context, {
    permission, resource: { kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, job: null },
  }).allowed;
  if (!orders.allowed || !can('workorders.view_prices') || !can('workorders.view_costs')) {
    const result = financialMaterialsResultSchema.parse({ ...base, costs: { kind: 'unavailable', reason: 'permissions',
      explanation: 'Current Work Order read, price and cost authority is required. Material evidence and costs are withheld.' },
    evidenceTotal: 0, rows: [], page: 1 });
    return { report: result, source: null };
  }
  const source = scopedWorkOrders(trx, context, assigned).whereNull('w.archivedAt').whereIn('w.status', ['issued', 'in-progress'])
    .join('workOrderMaterials as m', join => join.on('m.workspaceId', 'w.workspaceId').andOn('m.workOrderId', 'w.id'));
  if (query.filters.statuses.length) source.whereIn('m.status', query.filters.statuses);
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const visibleJobs = options.allowJobLabels !== false && jobs.allowed && report.sourceScopes?.job
    ? scopedJobQuery(trx, context, report.sourceScopes.job === 'assigned' || !!options.forceAssignedJobLabels).query.select('j.id').toSQL() : null;
  source.select('m.id', 'm.workOrderId', 'm.unit', 'm.status', 'w.status as workOrderStatus', 'm.costCents as unitCostCents',
    trx.raw(`m.quantity::text AS quantity, m.name AS "itemLabel", w."changedAfterIssueAt" IS NOT NULL AS "changedAfterIssue",
      left('Work Order WO-' || CASE WHEN length(w."workOrderNumber"::text) < 4 THEN lpad(w."workOrderNumber"::text, 4, '0')
        ELSE w."workOrderNumber"::text END || ' / ' || w.title, 200) AS "workOrderLabel"`),
    visibleJobs ? trx.raw(`CASE WHEN w."jobId" IN (${visibleJobs.sql}) THEN left('Job J-' || j."jobNumber"::text || ' / ' || j.title, 200)
      ELSE NULL END AS "jobLabel"`, [...visibleJobs.bindings]) : trx.raw('NULL::text AS "jobLabel"'))
    .orderBy('w.id').orderBy('m.id');
  const total = emptyCoverage(), groups = workOrderMaterialStatuses.map(status => ({ status, ...emptyCoverage() }));
  const requested: FinancialMaterialsResult['rows'] = [];
  let last: FinancialMaterialsResult['rows'] = [], evidenceTotal = 0;
  const offset = (query.page - 1) * query.pageSize;
  for await (const evidence of financialMaterialEvidence(trx, source)) {
    const cost = evidence.lineCostCents;
    addLine(total, cost);
    const group = groups.find(item => item.status === evidence.status);
    if (!group) throw new Error('An authorized material has an unsupported workflow status.');
    addLine(group, cost);
    if (query.selected !== 'all' && (query.selected === 'known' ? cost === null : cost !== null)) continue;
    if (evidenceTotal % query.pageSize === 0) last = [];
    last.push(evidence);
    if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
    evidenceTotal++;
  }
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  return { report: financialMaterialsResultSchema.parse({ ...base, costs: { kind: 'available', coverage: total, groups },
    evidenceTotal, page, rows: page === query.page ? requested : last }), source };
}
export async function readFinancialMaterialsReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: FinancialMaterialsQuery,
): Promise<FinancialMaterialsResult> {
  return (await prepareFinancialMaterialsReportInTransaction(trx, context, rawQuery)).report;
}

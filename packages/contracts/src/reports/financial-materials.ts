import { z } from 'zod';
import { jobDateSchema } from '../job';
import { workOrderMaterialStatuses } from '../work-order';

const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(200).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const status = z.enum(workOrderMaterialStatuses);
const filters = z.object({ statuses: z.array(status).max(4).transform(values => [...new Set(values)]) }).strict();
const coverage = z.object({
  lineCount: count, knownCostLines: count, missingCostLines: count, knownCostCents: count.nullable(),
}).strict().refine(value => value.knownCostLines + value.missingCostLines === value.lineCount &&
  (value.knownCostLines === 0 ? value.knownCostCents === null : value.knownCostCents !== null));
export const financialMaterialsQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('financial-materials'),
  filters: filters.default({ statuses: [] }), selected: z.enum(['all', 'known', 'missing']).default('all'),
  page: z.number().int().min(1).max(100000).default(1),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict();
export type FinancialMaterialsQuery = z.infer<typeof financialMaterialsQuerySchema>;
const row = z.object({
  id: z.uuid(), workOrderId: z.uuid(), workOrderLabel: text, jobLabel: text.nullable(),
  workOrderStatus: z.enum(['issued', 'in-progress']), itemLabel: text,
  quantity: z.string().regex(/^\d{1,6}(?:\.\d{1,3})?$/).refine(value => Number(value) > 0),
  unit: text.max(40), status, unitCostCents: z.number().int().min(0).max(2_147_483_647).nullable(),
  lineCostCents: count.nullable(), changedAfterIssue: z.boolean(),
}).strict().refine(value => {
  if (!/^\d{1,6}(?:\.\d{1,3})?$/.test(value.quantity)) return false;
  if (value.unitCostCents === null) return value.lineCostCents === null;
  if (value.lineCostCents === null) return false;
  const [whole, fraction = ''] = value.quantity.split('.');
  const quantity = BigInt(whole!) * 1000n + BigInt(fraction.padEnd(3, '0'));
  return BigInt(value.lineCostCents) === (quantity * BigInt(value.unitCostCents) + 500n) / 1000n;
});
export const financialMaterialsResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('financial-materials'),
  today: jobDateSchema, asOf: z.iso.datetime(), timezone: text, scopeLabel: z.string().trim().min(1),
  scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.literal('excluded'), filters,
  costs: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), coverage,
      groups: z.array(coverage.safeExtend({ status })).length(4) }).strict(),
    z.object({ kind: z.literal('unavailable'), reason: z.literal('permissions'), explanation: text }).strict(),
  ]),
  selected: financialMaterialsQuerySchema.shape.selected.removeDefault(),
  evidenceTotal: count, page: financialMaterialsQuerySchema.shape.page.removeDefault(),
  pageSize: financialMaterialsQuerySchema.shape.pageSize.removeDefault(), rows: z.array(row).max(100),
}).strict().superRefine((result, context) => {
  let valid = result.page <= Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(item => item.id)).size === result.rows.length &&
    result.rows.every(item => !result.filters.statuses.length || result.filters.statuses.includes(item.status));
  try { new Intl.DateTimeFormat('en-GB', { timeZone: result.timezone }); }
  catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (result.costs.kind === 'unavailable') {
    valid &&= result.evidenceTotal === 0 && result.rows.length === 0;
  } else {
    const { coverage: total, groups } = result.costs;
    valid &&= new Set(groups.map(group => group.status)).size === 4 &&
      (['lineCount', 'knownCostLines', 'missingCostLines'] as const).every(key =>
        groups.reduce((sum, group) => sum + group[key], 0) === total[key]) &&
      groups.reduce((sum, group) => sum + (group.knownCostCents ?? 0), 0) === (total.knownCostCents ?? 0) &&
      result.evidenceTotal === (result.selected === 'all' ? total.lineCount :
        result.selected === 'known' ? total.knownCostLines : total.missingCostLines) &&
      groups.every(group => !result.filters.statuses.length || result.filters.statuses.includes(group.status) || group.lineCount === 0);
    const known = result.rows.filter(item => item.unitCostCents !== null);
    valid &&= result.rows.every((item, index) =>
      (result.selected === 'all' || (result.selected === 'known' ? item.unitCostCents !== null : item.unitCostCents === null)) &&
      (!index || result.rows[index - 1]!.workOrderId < item.workOrderId ||
        result.rows[index - 1]!.workOrderId === item.workOrderId && result.rows[index - 1]!.id < item.id)) &&
      known.length <= total.knownCostLines &&
      result.rows.length - known.length <= total.missingCostLines &&
      known.reduce((sum, item) => sum + item.lineCostCents!, 0) <= (total.knownCostCents ?? 0);
    for (const group of groups) {
      const observed = result.rows.filter(item => item.status === group.status);
      const observedKnown = observed.filter(item => item.unitCostCents !== null);
      const observedCost = observedKnown.reduce((sum, item) => sum + item.lineCostCents!, 0);
      valid &&= observedKnown.length <= group.knownCostLines &&
        observed.length - observedKnown.length <= group.missingCostLines &&
        observedCost <= (group.knownCostCents ?? 0);
      if (observedKnown.length === group.knownCostLines) valid &&= observedCost === (group.knownCostCents ?? 0);
    }
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Financial material coverage, exact costs and evidence do not reconcile.' });
});
export type FinancialMaterialsResult = z.infer<typeof financialMaterialsResultSchema>;

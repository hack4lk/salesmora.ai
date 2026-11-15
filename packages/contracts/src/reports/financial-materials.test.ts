import { describe, expect, it } from 'vitest';
import { financialMaterialsQuerySchema, financialMaterialsResultSchema } from './financial-materials';
import { workOrderMaterialStatuses } from '../work-order';

const uuid = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const empty = { lineCount: 0, knownCostLines: 0, missingCostLines: 0, knownCostCents: null };
const coverage = { lineCount: 1, knownCostLines: 1, missingCostLines: 0, knownCostCents: 113 };
const result = {
  workspaceId: uuid(1), view: 'financial-materials', today: '2026-11-07', asOf: '2026-11-07T18:00:00Z',
  timezone: 'America/New_York', scope: 'workspace', archiveVisibility: 'excluded', scopeLabel: 'Recorded cost, not spend.',
  filters: { statuses: [] }, selected: 'all', page: 1, pageSize: 25, evidenceTotal: 1,
  costs: { kind: 'available', coverage, groups: workOrderMaterialStatuses.map(status => ({ status, ...(status === 'needed' ? coverage : empty) })) },
  rows: [{ id: uuid(2), workOrderId: uuid(3), workOrderLabel: 'Work Order WO-0001 / Repair', jobLabel: null,
    workOrderStatus: 'issued', itemLabel: 'Pipe', quantity: '1.125', unit: 'each', status: 'needed',
    unitCostCents: 100, lineCostCents: 113, changedAfterIssue: false }],
};
describe('Financial material contract', () => {
  it('accepts a current snapshot request without a historical period and deduplicates workflow facets', () => {
    expect(financialMaterialsQuerySchema.parse({ workspaceId: uuid(1), view: 'financial-materials' }).selected).toBe('all');
    expect(financialMaterialsQuerySchema.parse({ workspaceId: uuid(1), view: 'financial-materials',
      filters: { statuses: ['used', 'used'] } }).filters.statuses).toEqual(['used']);
    for (const patch of [{ pageSize: 1 }, { period: { from: '2026-01-01', to: '2026-02-01' } },
      { filters: { statuses: ['spent'] } }, { scope: 'workspace' }]) {
      expect(financialMaterialsQuerySchema.safeParse({ workspaceId: uuid(1), view: 'financial-materials', ...patch }).success).toBe(false);
    }
  });
  it('checks exact arithmetic, explicit null coverage, lifecycle exclusion and safe evidence shapes', () => {
    expect(financialMaterialsResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [
      { rows: [{ ...result.rows[0], lineCostCents: 112 }] },
      { rows: [{ ...result.rows[0], unitCostCents: null }] },
      { rows: [{ ...result.rows[0], workOrderStatus: 'completed' }] },
      { rows: [{ ...result.rows[0], quantity: '1.0001' }] },
      { rows: [{ ...result.rows[0], quantity: 'not-a-decimal' }] },
      { rows: [{ ...result.rows[0], costNote: 'PRIVATE' }] },
      { rows: [{ ...result.rows[0], itemLabel: 'PRIVATE\nNOTE' }] },
      { evidenceTotal: 2 }, { archiveVisibility: 'included' }, { timezone: 'Invalid/Timezone' },
      { selected: 'missing' }, { filters: { statuses: ['used'] } },
      { costs: { ...result.costs, groups: [] } },
      { costs: { ...result.costs, coverage: { ...coverage, knownCostCents: null } } },
    ]) expect(financialMaterialsResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('distinguishes authorized empty, zero unit cost, missing costs and permission withholding', () => {
    const unavailable = { ...result, costs: { kind: 'unavailable', reason: 'permissions', explanation: 'Cost authority unavailable.' },
      evidenceTotal: 0, rows: [] };
    expect(financialMaterialsResultSchema.safeParse(unavailable).success).toBe(true);
    expect(financialMaterialsResultSchema.safeParse({ ...unavailable, rows: result.rows }).success).toBe(false);
    const zero = { ...result, rows: [{ ...result.rows[0], unitCostCents: 0, lineCostCents: 0 }],
      costs: { ...result.costs, coverage: { ...coverage, knownCostCents: 0 },
        groups: result.costs.groups.map(group => ({ ...group, knownCostCents: group.knownCostLines ? 0 : null })) } };
    expect(financialMaterialsResultSchema.safeParse(zero).success).toBe(true);
    const emptyResult = { ...result, rows: [], evidenceTotal: 0,
      costs: { kind: 'available', coverage: empty, groups: workOrderMaterialStatuses.map(status => ({ status, ...empty })) } };
    expect(financialMaterialsResultSchema.safeParse(emptyResult).success).toBe(true);
    const missingCoverage = { lineCount: 1, knownCostLines: 0, missingCostLines: 1, knownCostCents: null };
    const missingResult = { ...result, selected: 'missing', rows: [{ ...result.rows[0], unitCostCents: null, lineCostCents: null }],
      costs: { kind: 'available', coverage: missingCoverage,
        groups: workOrderMaterialStatuses.map(status => ({ status, ...(status === 'needed' ? missingCoverage : empty) })) } };
    expect(financialMaterialsResultSchema.safeParse(missingResult).success).toBe(true);
  });
});

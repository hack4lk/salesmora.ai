import { describe, expect, it } from 'vitest';
import {
  financialMaterialLineCostCents,
  validFinancialReportResult,
} from './financial-report.validation';
import {
  defaultFinancialPeriod,
  financialReportResponse,
  financialReportTimezone,
  financialReportToday,
  fullFinancialAccess,
} from './financial-report.fixtures';
import type { FinancialReportAccess } from './financial-report.validation';

const valid = (
  result = financialReportResponse(),
  access: FinancialReportAccess = fullFinancialAccess,
  period = defaultFinancialPeriod,
) => validFinancialReportResult(result, period, access, financialReportToday, financialReportTimezone);

describe('Financial report validation', () => {
  it('does not require an unavailable issue date for accepted evidence, but still validates awaiting issue dates', () => {
    const accepted = financialReportResponse();
    const withoutIssue = { ...accepted, evidence: { ...accepted.evidence, rows: accepted.evidence.rows.map(row => {
      if (row.kind !== 'accepted') return row;
      const { issuedDate, ...evidence } = row;
      expect(issuedDate).toBeDefined();
      return evidence;
    }) } };
    expect(valid(withoutIssue)).toBe(true);
    const awaiting = financialReportResponse({ selected: 'awaiting' });
    expect(valid({ ...awaiting, evidence: { ...awaiting.evidence,
      rows: awaiting.evidence.rows.map(row => ({ ...row, issuedDate: undefined })) } } as never)).toBe(false);
    expect(valid({ ...accepted, evidence: { ...accepted.evidence,
      rows: accepted.evidence.rows.map(row => ({ ...row, issuedDate: '2026-11-06' })) } } as never)).toBe(false);
  });
  it('calculates exact per-line costs with half-up rounding and validates missing and zero costs', () => {
    expect(financialMaterialLineCostCents('1.005', 100)).toBe(101);
    expect(financialMaterialLineCostCents('0.005', 450)).toBe(2);
    expect(financialMaterialLineCostCents('1.000', 0)).toBe(0);
    expect(financialMaterialLineCostCents('1.000', null)).toBeNull();
    expect(financialMaterialLineCostCents('1.0001', 100)).toBeUndefined();
    expect(financialMaterialLineCostCents('0', 100)).toBeUndefined();
    expect(financialMaterialLineCostCents('1.000', -1)).toBeUndefined();
    expect(financialMaterialLineCostCents('1.000', 2_147_483_648)).toBeUndefined();

    const result = financialReportResponse({ selected: 'materials' });
    expect(result.costs).toMatchObject({
      kind: 'available',
      lineCount: 6,
      knownCostLines: 5,
      missingCostLines: 1,
      knownCostCents: 17_762,
    });
    expect(result.evidence.total).toBe(6);
    expect(valid(result)).toBe(true);
  });

  it('keeps accepted period commitments separate from the current awaiting snapshot', () => {
    const result = financialReportResponse();
    expect(result.estimates).toMatchObject({
      kind: 'available',
      accepted: { count: 3, money: { kind: 'available', preTaxCents: 455_000, customerTotalCents: 546_000 } },
      awaiting: { count: 2, money: { kind: 'available', preTaxCents: 215_000, customerTotalCents: 258_000 } },
    });
    expect(valid(result)).toBe(true);

    const oldPeriod = { preset: 'custom' as const, from: '2026-08-01', to: '2026-08-30' };
    const noAcceptedEstimates = financialReportResponse({ period: oldPeriod });
    expect(noAcceptedEstimates.estimates.kind).toBe('available');
    if (noAcceptedEstimates.estimates.kind === 'available') {
      expect(noAcceptedEstimates.estimates.accepted).toMatchObject({
        count: 0,
        money: { kind: 'available', preTaxCents: 0, customerTotalCents: 0 },
      });
      expect(noAcceptedEstimates.estimates.awaiting.count).toBe(2);
    }
    expect(valid(noAcceptedEstimates, fullFinancialAccess, oldPeriod)).toBe(true);
  });

  it('excludes draft, completed, canceled and archived Work Orders from current material costs', () => {
    const result = financialReportResponse({ selected: 'materials' });
    expect(result.costs.kind).toBe('available');
    expect(result.evidence.rows.map(row => row.kind === 'material' ? row.id : row.familyId))
      .toEqual(['material-001', 'material-002', 'material-003', 'material-004', 'material-005',
        'material-006']);
    expect(valid(result)).toBe(true);
  });

  it('validates selected evidence pagination and reconciles complete material evidence', () => {
    const secondPage = financialReportResponse({
      selected: 'accepted',
      page: 2,
      pageSize: 2,
    });
    expect(secondPage.evidence.total).toBe(3);
    expect(secondPage.evidence.rows).toHaveLength(1);
    expect(valid(secondPage)).toBe(true);

    const materials = financialReportResponse({ selected: 'materials' });
    const alteredCost = {
      ...materials,
      evidence: {
        ...materials.evidence,
        rows: materials.evidence.rows.map((row, index) => index === 0 && row.kind === 'material'
          ? { ...row, lineCostCents: row.lineCostCents! + 1 }
          : row),
      },
    };
    expect(valid(alteredCost)).toBe(false);
    if (materials.costs.kind === 'available') {
      expect(valid({ ...materials, costs: { ...materials.costs, knownCostCents: 1 } })).toBe(false);
    }
    expect(valid({ ...secondPage, evidence: { ...secondPage.evidence, page: 3 } })).toBe(false);
  });

  it('removes financial values when monetary permissions are unavailable or revoked', () => {
    const estimateValueAccess: FinancialReportAccess = {
      ...fullFinancialAccess,
      canReadEstimateValues: false,
    };
    const estimateValuesWithheld = financialReportResponse({ access: estimateValueAccess });
    expect(valid(estimateValuesWithheld, estimateValueAccess)).toBe(true);
    expect(valid(financialReportResponse(), estimateValueAccess)).toBe(false);

    const costAccess: FinancialReportAccess = {
      ...fullFinancialAccess,
      canReadWorkOrderCosts: false,
    };
    const costsWithheld = financialReportResponse({ access: costAccess, selected: 'materials' });
    expect(costsWithheld.costs.kind).toBe('unavailable');
    expect(costsWithheld.evidence.total).toBe(0);
    expect(valid(costsWithheld, costAccess)).toBe(true);
    expect(valid(financialReportResponse({ selected: 'materials' }), costAccess)).toBe(false);

    const noEstimateAccess: FinancialReportAccess = {
      ...fullFinancialAccess,
      canReadEstimates: false,
      canReadEstimateValues: false,
    };
    expect(valid(financialReportResponse({ access: noEstimateAccess, selected: 'materials' }),
      noEstimateAccess)).toBe(true);
  });

  it('rejects unknown fields, invalid snapshots and incompatible evidence shapes', () => {
    const result = financialReportResponse({ selected: 'materials' });
    expect(valid({ ...result, privatePayload: 'must not cross the projection' } as never)).toBe(false);
    expect(valid({ ...result, today: '2026-11-05' })).toBe(false);
    expect(valid({ ...result, timezone: 'UTC' })).toBe(false);
    expect(valid({
      ...result,
      evidence: { ...result.evidence, rows: [{ ...result.evidence.rows[0], internalCost: 1 }] },
    } as never)).toBe(false);
    expect(valid({
      ...result,
      evidence: { ...result.evidence, rows: [null] },
    } as never)).toBe(false);
  });
});

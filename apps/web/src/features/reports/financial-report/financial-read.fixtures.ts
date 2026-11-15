import { financialReportQuerySchema, financialReportNativeQueries, financialReportReadResultSchema,
  type FinancialReportQuery } from '@salesmora/contracts';
import { financialBackendResponses, financialBackendWorkspaceId } from './financial-report.adapter.fixtures';
import { fullFinancialAccess } from './financial-report.fixtures';

export const initialFinancialQuery = financialReportQuerySchema.parse({ workspaceId: financialBackendWorkspaceId,
  view: 'financial', period: { from: '2026-10-08', to: '2026-11-06' } });
export function financialReadResponse(query: FinancialReportQuery = initialFinancialQuery, access = fullFinancialAccess) {
  return financialReportReadResultSchema.parse({
    workspaceId: query.workspaceId, viewerId: 'financial-story-viewer', policyRevision: 1,
    today: '2026-11-06', timezone: 'Europe/Warsaw', query,
    exportAccess: { estimates: null, materials: null },
    authority: { scope: 'workspace', financial: true, estimates: access.canReadEstimates
      ? { scope: 'workspace', archives: 'included', money: true } : null,
    materials: { scope: 'workspace', read: access.canReadWorkOrders,
      costs: access.canReadWorkOrders && access.canReadWorkOrderCosts, jobLabels: true } },
    reports: financialBackendResponses(financialReportNativeQueries(query), access),
  });
}
export function largeFinancialReadResponse(query: FinancialReportQuery = initialFinancialQuery) {
  const initial = financialReadResponse({ ...query, page: 1, pageSize: 100 });
  const requests = financialReportNativeQueries(query);
  const identity = (id: string, copy: number) =>
    `00000000-0000-4000-8000-${String(Number(id.slice(-12)) * 100 + copy).padStart(12, '0')}`;
  const paging = <T,>(rows: T[], page: number) => {
    const clamped = Math.min(page, Math.max(1, Math.ceil(rows.length / query.pageSize)));
    return { evidenceTotal: rows.length, page: clamped, pageSize: query.pageSize,
      rows: rows.slice((clamped - 1) * query.pageSize, clamped * query.pageSize) };
  };
  const reports = initial.reports;
  for (const kind of ['accepted', 'awaiting'] as const) {
    const section = reports[kind].estimates;
    if (section.kind === 'unavailable') throw new Error('Large Financial fixture requires Estimate access.');
    const report = section.report;
    const rows = report.rows.flatMap(row => Array.from({ length: 26 }, (_, copy) => ({
      ...row, estimateNumber: `${row.estimateNumber}-${copy}`, familyId: `${query.workspaceId}:${row.estimateNumber}-${copy}`,
      recordId: identity(row.recordId, copy), label: `${row.label} / copy ${copy}`,
    })));
    Object.assign(report, paging(rows, requests[kind].page));
    if (section.kind === 'accepted') {
      section.report.counts.accepted *= 26;
      if (section.report.money.kind === 'available') {
        section.report.money.preTaxCents *= 26; section.report.money.customerTotalCents *= 26;
      }
    } else {
      section.report.counts.awaiting *= 26;
      if (section.report.awaitingMoney.kind === 'available') {
        section.report.awaitingMoney.preTaxCents *= 26; section.report.awaitingMoney.customerTotalCents *= 26;
      }
    }
  }
  const materials = reports.materials;
  if (materials.costs.kind !== 'available') throw new Error('Large Financial fixture requires material costs.');
  const rows = materials.rows.flatMap(row => Array.from({ length: 26 }, (_, copy) => ({
    ...row, id: identity(row.id, copy), workOrderId: identity(row.workOrderId, copy),
    workOrderLabel: `${row.workOrderLabel} / copy ${copy}`,
  }))).sort((a, b) => a.workOrderId.localeCompare(b.workOrderId) || a.id.localeCompare(b.id));
  for (const coverage of [materials.costs.coverage, ...materials.costs.groups]) {
    coverage.lineCount *= 26; coverage.knownCostLines *= 26; coverage.missingCostLines *= 26;
    if (coverage.knownCostCents !== null) coverage.knownCostCents *= 26;
  }
  Object.assign(materials, paging(rows, requests.materials.page));
  return financialReportReadResultSchema.parse({ ...initial, query, reports });
}

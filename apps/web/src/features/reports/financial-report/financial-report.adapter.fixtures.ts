import { financialEstimatesResultSchema, financialMaterialsResultSchema,
  type FinancialEstimatesQuery, type FinancialMaterialsQuery } from '@salesmora/contracts';
import { financialReportResponse, financialReportToday, financialReportTimezone, fullFinancialAccess } from './financial-report.fixtures';
import type { FinancialReportAccess } from './financial-report.validation';
import type { FinancialReportRequests } from './financial-report.adapter';

export const financialBackendWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const financialBackendScopeKey = 'financial-backend-current-authority';
const uuid = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
function estimateIdentity(number: string) {
  const match = /^E-(\d+)$/.exec(number);
  if (!match) throw new Error('Unknown Financial Estimate mock identity.');
  const index = Number(match[1]);
  return { number: `EST-${match[1]}`, recordId: uuid(index) };
}
function materialIdentity(id: string) {
  const match = /^(?:material|work-order)-(\d+)$/.exec(id);
  if (!match) throw new Error('Unknown Financial material mock identity.');
  return uuid(1000 + Number(match[1]) + (id.startsWith('work-order') ? 100 : 0));
}
const period = (request: FinancialEstimatesQuery) => ({ preset: 'custom' as const, ...request.period });
const unavailable = (explanation: string) => ({ kind: 'unavailable' as const, reason: 'permissions' as const, explanation });

/** Reuse the established canonical fictional aggregation, translating only backend contracts and identities. */
function estimateResponse(request: FinancialEstimatesQuery, access: FinancialReportAccess) {
  const base = financialReportResponse({ period: period(request), selected: request.selected, access, pageSize: request.pageSize });
  const page = Math.min(request.page, Math.max(1, Math.ceil(base.evidence.total / request.pageSize)));
  const result = financialReportResponse({ period: period(request), selected: request.selected, access, page, pageSize: request.pageSize });
  const common = { workspaceId: request.workspaceId, view: 'financial-estimates', ...request.period, selected: request.selected };
  if (result.estimates.kind === 'unavailable') {
    return financialEstimatesResultSchema.parse({ ...common, estimates: unavailable(result.estimates.explanation) });
  }
  const rows = result.evidence.rows.map(row => {
    if (row.kind === 'material') throw new Error('Unexpected Financial material evidence.');
    const identity = estimateIdentity(row.estimateNumber);
    const shared = { familyId: `${request.workspaceId}:${identity.number}`, recordId: identity.recordId,
      estimateNumber: identity.number, revision: row.revision, label: row.label.replaceAll(row.estimateNumber, identity.number),
      archived: row.archived, money: row.money, ownerKey: 'unassigned', parentType: 'job' };
    return row.kind === 'accepted'
      ? { ...shared, outcome: 'accepted', decisionVersion: row.revision + 1, decisionDate: row.decisionDate, recordedDate: row.decisionDate }
      : { ...shared, archived: false, status: 'published', issuedDate: row.issuedDate, validUntil: row.validUntil };
  });
  const report = { workspaceId: request.workspaceId, asOf: '2026-11-06T10:00:00Z', timezone: financialReportTimezone,
    scope: 'workspace', scopeLabel: 'Currently authorized Estimate commitments, not revenue or payments.',
    filters: request.filters, selected: request.selected, page, pageSize: request.pageSize, evidenceTotal: result.evidence.total, rows };
  return financialEstimatesResultSchema.parse({ ...common, estimates: request.selected === 'accepted'
    ? { kind: 'accepted', report: { ...report, view: 'estimate-decisions', ...request.period, archiveVisibility: 'included',
      counts: { accepted: result.estimates.accepted.count, declined: 0 }, money: result.estimates.accepted.money } }
    : { kind: 'awaiting', report: { ...report, view: 'estimate-current', today: financialReportToday,
      counts: { awaiting: result.estimates.awaiting.count, expired: 0 }, awaitingMoney: result.estimates.awaiting.money,
      handoff: { kind: 'unavailable', explanation: 'Handoff metadata is not part of the Financial mock.' } } } });
}
function materialResponse(request: FinancialMaterialsQuery, access: FinancialReportAccess) {
  const base = financialReportResponse({ selected: 'materials', access, pageSize: request.pageSize });
  const page = Math.min(request.page, Math.max(1, Math.ceil(base.evidence.total / request.pageSize)));
  const result = financialReportResponse({ selected: 'materials', access, page, pageSize: request.pageSize });
  return financialMaterialsResultSchema.parse({
    workspaceId: request.workspaceId, view: 'financial-materials', today: financialReportToday,
    asOf: '2026-11-06T10:00:01Z', timezone: financialReportTimezone, scope: 'workspace', archiveVisibility: 'excluded',
    scopeLabel: 'Current non-archived issued/in-progress Work Orders. Recorded costs, not actual spend; edits may restate.',
    filters: request.filters, selected: 'all', page, pageSize: request.pageSize, evidenceTotal: result.evidence.total,
    costs: result.costs.kind === 'available' ? { kind: 'available',
      coverage: { lineCount: result.costs.lineCount, knownCostLines: result.costs.knownCostLines,
        missingCostLines: result.costs.missingCostLines, knownCostCents: result.costs.knownCostCents }, groups: result.costs.groups }
      : unavailable(result.costs.explanation),
    rows: result.evidence.rows.map(row => {
      if (row.kind !== 'material') throw new Error('Unexpected Financial Estimate evidence.');
      return { id: materialIdentity(row.id), workOrderId: materialIdentity(row.workOrderId),
        workOrderLabel: row.workOrderLabel, jobLabel: row.jobLabel, workOrderStatus: row.workOrderStatus,
        itemLabel: row.itemLabel, quantity: row.quantity, unit: row.unit, status: row.status,
        unitCostCents: row.unitCostCents, lineCostCents: row.lineCostCents, changedAfterIssue: row.changedAfterIssue };
    }),
  });
}
export function financialBackendResponses(requests: FinancialReportRequests, access = fullFinancialAccess) {
  return { accepted: estimateResponse(requests.accepted, access), awaiting: estimateResponse(requests.awaiting, access),
    materials: materialResponse(requests.materials, access) };
}

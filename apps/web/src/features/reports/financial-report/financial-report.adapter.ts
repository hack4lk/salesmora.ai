import { financialEstimatesQuerySchema, financialEstimatesResultSchema, financialMaterialsQuerySchema,
  financialMaterialsResultSchema, financialReportReadResultSchema, financialReportNativeQueries,
  type FinancialReportReadResult, type FinancialReportQuery, type FinancialEstimatesQuery, type FinancialMaterialsQuery } from '@salesmora/contracts';
import { formatReportDate, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { FinancialReportState } from './financial-report';
import { validFinancialReportResult, type FinancialReportAccess, type FinancialEvidencePage,
  type FinancialEstimateEvidenceRow, type FinancialReportResult } from './financial-report.validation';

export type FinancialReportRequests = {
  accepted: FinancialEstimatesQuery; awaiting: FinancialEstimatesQuery; materials: FinancialMaterialsQuery;
};
export function financialReportScopeKey(result: FinancialReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.authority, result.exportAccess]);
}
export function financialReportAccess(result: FinancialReportReadResult): FinancialReportAccess {
  return { canReadEstimates: result.authority.estimates !== null,
    canReadEstimateValues: result.authority.estimates?.money ?? false,
    canReadWorkOrders: result.authority.materials.read, canReadWorkOrderCosts: result.authority.materials.costs };
}
export function adaptFinancialReadResponse(raw: unknown, input: {
  request: FinancialReportQuery; period: ReportPeriodSelection; scopeKey: string; today: string; timezone: string;
}) {
  const parsed = financialReportReadResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Financial report data does not match the current request, authority or evidence. Reload the report.');
  const response = parsed.data;
  if (financialReportScopeKey(response) !== input.scopeKey || JSON.stringify(response.query) !== JSON.stringify(input.request) ||
    response.today !== input.today || response.timezone !== input.timezone) {
    throw new Error('Financial report request or authority has changed. Reload the report.');
  }
  return adaptFinancialReportResponses(response.reports, {
    requests: financialReportNativeQueries(input.request), selected: input.request.selected, period: input.period,
    scopeKey: input.scopeKey, canRead: true, access: financialReportAccess(response),
    today: input.today, timezone: input.timezone,
    estimateScope: response.authority.estimates?.scope ?? 'workspace',
    estimateArchives: response.authority.estimates?.archives ?? 'excluded',
    materialScope: response.authority.materials.scope, canReadJobLabels: response.authority.materials.jobLabels,
  });
}
export type FinancialRecordReference = { kind: 'estimate' | 'work-order'; recordId: string };
export function visibleFinancialRecord(result: FinancialReportReadResult, id: string): FinancialRecordReference | undefined {
  if (result.query.selected === 'materials') {
    if (result.reports.materials.rows.some(row => row.workOrderId === id)) return { kind: 'work-order', recordId: id };
  } else {
    const section = result.reports[result.query.selected].estimates;
    if (section.kind !== 'unavailable' && section.report.rows.some(row => row.recordId === id)) {
      return { kind: 'estimate', recordId: id };
    }
  }
  return undefined;
}
export function financialReportRequests(input: {
  workspaceId: string; range: { from: string; to: string }; selected: FinancialEvidencePage['kind']; page: number; pageSize: number;
}): FinancialReportRequests {
  const period = { from: input.range.from, to: input.range.to };
  const estimate = (selected: 'accepted' | 'awaiting') => financialEstimatesQuerySchema.parse({
    workspaceId: input.workspaceId, view: 'financial-estimates', period, selected,
    filters: { owners: [], parents: [] }, page: input.selected === selected ? input.page : 1, pageSize: input.pageSize,
  });
  if (!['accepted', 'awaiting', 'materials'].includes(input.selected)) throw new Error('Unsupported Financial evidence selection.');
  return { accepted: estimate('accepted'), awaiting: estimate('awaiting'),
    materials: financialMaterialsQuerySchema.parse({ workspaceId: input.workspaceId, view: 'financial-materials',
      filters: { statuses: [] }, selected: 'all', page: input.selected === 'materials' ? input.page : 1, pageSize: input.pageSize }) };
}
type Host = {
  requests: FinancialReportRequests; selected: FinancialEvidencePage['kind']; period: ReportPeriodSelection;
  scopeKey: string; canRead: boolean; access: FinancialReportAccess; today: string; timezone: string;
  estimateScope: 'workspace' | 'assigned_job'; estimateArchives: 'included' | 'excluded';
  materialScope: 'workspace' | 'assigned'; canReadJobLabels: boolean;
};
const matchesPage = (response: { page: number; pageSize: number; evidenceTotal: number }, request: { page: number; pageSize: number }) =>
  response.pageSize === request.pageSize &&
  response.page === Math.min(request.page, Math.max(1, Math.ceil(response.evidenceTotal / response.pageSize)));
const snapshotDate = (asOf: string, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(asOf));
  const part = (type: 'year' | 'month' | 'day') => parts.find(value => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

/** Compose separately timestamped native projections without claiming a single cross-section snapshot. */
export function adaptFinancialReportResponses(raw: { accepted: unknown; awaiting: unknown; materials: unknown }, input: Host):
  { scopeKey: string; state: FinancialReportState } {
  const requests = { accepted: financialEstimatesQuerySchema.parse(input.requests.accepted),
    awaiting: financialEstimatesQuerySchema.parse(input.requests.awaiting),
    materials: financialMaterialsQuerySchema.parse(input.requests.materials) };
  const accepted = financialEstimatesResultSchema.parse(raw.accepted), awaiting = financialEstimatesResultSchema.parse(raw.awaiting);
  const materials = financialMaterialsResultSchema.parse(raw.materials);
  const fail = (): never => { throw new Error('Financial results do not match the current request or authority. Retry the report.'); };
  if (!input.canRead || !input.scopeKey.trim() || requests.accepted.selected !== 'accepted' ||
    requests.awaiting.selected !== 'awaiting' || requests.materials.selected !== 'all' ||
    requests.accepted.filters.owners.length || requests.accepted.filters.parents.length ||
    requests.awaiting.filters.owners.length || requests.awaiting.filters.parents.length || requests.materials.filters.statuses.length ||
    requests.awaiting.workspaceId !== requests.accepted.workspaceId || requests.materials.workspaceId !== requests.accepted.workspaceId ||
    requests.awaiting.period.from !== requests.accepted.period.from || requests.awaiting.period.to !== requests.accepted.period.to ||
    requests.accepted.pageSize !== requests.awaiting.pageSize || requests.accepted.pageSize !== requests.materials.pageSize ||
    !['accepted', 'awaiting', 'materials'].includes(input.selected)) fail();
  const stamps: string[] = [], coverage: string[] = [];
  for (const [kind, response] of [['accepted', accepted], ['awaiting', awaiting]] as const) {
    const request = requests[kind];
    if (response.workspaceId !== request.workspaceId || response.from !== request.period.from || response.to !== request.period.to ||
      response.selected !== kind) fail();
    const section = response.estimates;
    if (section.kind === 'unavailable') { coverage.push(`${kind}: ${section.explanation}`); continue; }
    const report = section.report;
    if (!input.access.canReadEstimates || section.kind !== kind ||
      report.scope !== input.estimateScope || report.timezone !== input.timezone ||
      snapshotDate(report.asOf, report.timezone) !== input.today ||
      !matchesPage(report, request) || report.filters.owners.length || report.filters.parents.length ||
      kind === 'accepted' && section.kind === 'accepted' && section.report.archiveVisibility !== input.estimateArchives ||
      section.kind === 'awaiting' && section.report.today !== input.today) fail();
    if (!input.access.canReadEstimateValues && (section.kind === 'accepted'
      ? section.report.money.kind === 'available' : section.report.awaitingMoney.kind === 'available') ||
      !input.access.canReadEstimateValues && report.rows.some(row => row.money.kind === 'available')) fail();
    stamps.push(`${kind} ${report.asOf}`);
    coverage.push(`${kind}: ${report.scopeLabel}`);
  }
  if (materials.workspaceId !== requests.materials.workspaceId || materials.today !== input.today || materials.timezone !== input.timezone ||
    snapshotDate(materials.asOf, materials.timezone) !== input.today ||
    materials.scope !== input.materialScope || materials.selected !== 'all' || materials.filters.statuses.length ||
    !matchesPage(materials, requests.materials) ||
    materials.costs.kind === 'available' && (!input.access.canReadWorkOrders || !input.access.canReadWorkOrderCosts) ||
    !input.canReadJobLabels && materials.rows.some(row => row.jobLabel !== null)) fail();
  stamps.push(`materials ${materials.asOf}`);
  coverage.push(`materials: ${materials.scopeLabel}`);
  const acceptedSection = accepted.estimates, awaitingSection = awaiting.estimates;
  let estimates: FinancialReportResult['estimates'];
  if (acceptedSection.kind === 'accepted' && awaitingSection.kind === 'awaiting') {
    estimates = { kind: 'available', accepted: { count: acceptedSection.report.counts.accepted, money: acceptedSection.report.money },
      awaiting: { count: awaitingSection.report.counts.awaiting, money: awaitingSection.report.awaitingMoney } };
  } else if (acceptedSection.kind === 'unavailable' && awaitingSection.kind === 'unavailable') {
    estimates = { kind: 'unavailable', explanation: acceptedSection.explanation };
  } else {
    return fail();
  }
  let evidence: FinancialEvidencePage;
  if (input.selected === 'materials') {
    evidence = { kind: 'materials', total: materials.evidenceTotal, page: materials.page, pageSize: materials.pageSize,
      rows: materials.rows.map(row => ({ kind: 'material', ...row })) };
  } else {
    const section = input.selected === 'accepted' ? acceptedSection : awaitingSection;
    if (section.kind === 'unavailable') {
      evidence = { kind: input.selected, total: 0, page: 1, pageSize: requests[input.selected].pageSize, rows: [] };
    } else {
      const rows: FinancialEstimateEvidenceRow[] = section.kind === 'accepted'
        ? section.report.rows.map(row => ({ kind: 'accepted', familyId: row.familyId, recordId: row.recordId,
          estimateNumber: row.estimateNumber, revision: row.revision, label: row.label, archived: row.archived,
          money: row.money, decisionDate: row.decisionDate }))
        : section.report.rows.map(row => {
          if (row.status === 'accepted') throw new Error('Unexpected handoff evidence in Financial awaiting quotes.');
          return { kind: 'awaiting', familyId: row.familyId, recordId: row.recordId, estimateNumber: row.estimateNumber,
            revision: row.revision, label: row.label, archived: row.archived, money: row.money,
            issuedDate: row.issuedDate, validUntil: row.validUntil };
        });
      evidence = { kind: input.selected, total: section.report.evidenceTotal, page: section.report.page,
        pageSize: section.report.pageSize, rows };
    }
  }
  const result: FinancialReportResult = {
    from: accepted.from, to: accepted.to, today: input.today, timezone: input.timezone,
    periodLabel: `${formatReportDate(accepted.from)} - ${formatReportDate(accepted.to)}`,
    snapshotLabel: 'Separate section snapshots; see coverage for timestamps.',
    scopeLabel: `${coverage.join(' ')} Read at: ${stamps.join('; ')}. No single cross-section snapshot is claimed.`,
    estimates, costs: materials.costs.kind === 'available'
      ? { kind: 'available', ...materials.costs.coverage, groups: materials.costs.groups }
      : { kind: 'unavailable', explanation: materials.costs.explanation },
    evidence,
  };
  if (!validFinancialReportResult(result, input.period, input.access, input.today, input.timezone)) {
    throw new Error('Financial metrics and selected evidence cannot be displayed consistently. Retry the report.');
  }
  return { scopeKey: input.scopeKey, state: { kind: 'ready', result } };
}

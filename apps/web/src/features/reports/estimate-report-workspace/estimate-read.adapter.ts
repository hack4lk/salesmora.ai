import { estimateReportQuerySchema, estimateReportReadResultSchema,
  type EstimateReportQuery, type EstimateReportReadResult, type EstimateDecisionsQuery, type EstimateCurrentQuery } from '@salesmora/contracts';
import type { EstimateReportFilterContext, EstimateReportFiltersValue } from '../estimate-report-filters/estimate-report-filters';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import type { EstimateReportProjection, EstimateReportView } from './estimate-report-workspace';
import { validEstimateReportProjection } from './estimate-report-workspace.validation';

export type EstimateReportEvidence = { decisions: EstimateDecisionsQuery['selected']; current: EstimateCurrentQuery['selected'] };
export const initialEstimateEvidence: EstimateReportEvidence = { decisions: 'accepted', current: 'awaiting' };
export function estimateReportRequest(input: {
  workspaceId: string; view: EstimateReportView; range: { from: string; to: string };
  filters: Record<EstimateReportFilterContext, EstimateReportFiltersValue>; evidence: EstimateReportEvidence;
  page: number; pageSize: number;
}): EstimateReportQuery {
  const common = { workspaceId: input.workspaceId, filters: input.filters[input.view === 'current' ? 'current' : 'period'],
    page: input.page, pageSize: input.pageSize };
  if (input.view === 'current') return estimateReportQuerySchema.parse({ ...common, view: 'estimate-current', selected: input.evidence.current });
  return estimateReportQuerySchema.parse(input.view === 'decisions'
    ? { ...common, view: 'estimate-decisions', period: { from: input.range.from, to: input.range.to }, selected: input.evidence.decisions }
    : { ...common, view: 'estimate-first-quoted', period: { from: input.range.from, to: input.range.to } });
}
export function estimateReportScopeKey(result: EstimateReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.authority, result.exportAccess]);
}
const decisionId = (selected: EstimateReportEvidence['decisions']) => `estimate-decisions:${selected}`;
const currentId = (selected: EstimateReportEvidence['current']) => `estimate-current:${selected}`;
const firstId = 'estimate-first-quoted';
export function adaptEstimateReadResponse(raw: unknown, input: {
  request: EstimateReportQuery; scopeKey: string; today: string; timezone: string;
}): { projection: EstimateReportProjection; filterOptions: EstimateReportReadResult['options'] } {
  const request = estimateReportQuerySchema.parse(input.request), parsed = estimateReportReadResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Estimates report data does not match the current request, authority or evidence. Reload the report.');
  const response = parsed.data, report = response.report;
  if (JSON.stringify(response.query) !== JSON.stringify(request) || estimateReportScopeKey(response) !== input.scopeKey ||
    response.today !== input.today || report.timezone !== input.timezone) {
    throw new Error('Estimates report results no longer match this request or current authority. Reload the report.');
  }
  const snapshotLabel = `Current authorized Estimates / ${new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: report.timezone,
  }).format(new Date(report.asOf))} (${report.timezone})`;
  const attribution = report.rows.map(row => ({ familyId: row.familyId, ownerKey: row.ownerKey, parentType: row.parentType }));
  const common = { filters: request.filters, scopeKey: input.scopeKey, attribution };
  let projection: EstimateReportProjection;
  if (report.view === 'estimate-current') {
    projection = { ...common, view: 'current', state: { kind: 'ready', result: {
      ...report, snapshotLabel, evidenceIds: { awaiting: currentId('awaiting'), expired: currentId('expired') },
      handoff: report.handoff.kind === 'available' ? { ...report.handoff, evidenceId: currentId('handoff') } : report.handoff,
    } } };
  } else {
    const periodLabel = `${formatReportDate(report.from)} - ${formatReportDate(report.to)}, both dates included`;
    projection = report.view === 'estimate-decisions'
      ? { ...common, view: 'decisions', state: { kind: 'ready', result: { ...report, snapshotLabel, periodLabel,
        evidenceIds: { accepted: decisionId('accepted'), declined: decisionId('declined'), decided: decisionId('decided') } } } }
      : { ...common, view: 'first-quoted', state: { kind: 'ready', result: { ...report, snapshotLabel, periodLabel, evidenceId: firstId } } };
  }
  if (!validEstimateReportProjection(projection, request.filters, response.options, input.scopeKey,
    response.authority.money, response.authority.handoff)) {
    throw new Error('Estimates report filters, scope or evidence cannot be displayed consistently. Retry the report.');
  }
  return { projection, filterOptions: response.options };
}
export type EstimateReportEvidenceSelection =
  | { view: 'decisions'; evidence: EstimateReportEvidence['decisions'] }
  | { view: 'current'; evidence: EstimateReportEvidence['current'] }
  | { view: 'first-quoted' };
export function estimateReportEvidenceSelection(result: EstimateReportReadResult, id: string): EstimateReportEvidenceSelection {
  const report = result.report;
  if (report.view === 'estimate-decisions') {
    const evidence = (['accepted', 'declined', 'decided'] as const).find(selected => decisionId(selected) === id);
    if (evidence) return { view: 'decisions', evidence };
  } else if (report.view === 'estimate-current') {
    const evidence = (['awaiting', 'expired', ...(report.handoff.kind === 'available' ? ['handoff'] as const : [])] as const)
      .find(selected => currentId(selected) === id);
    if (evidence) return { view: 'current', evidence };
  } else if (id === firstId) return { view: 'first-quoted' };
  throw new Error('This Estimates evidence selection is unavailable.');
}
export function visibleEstimateRecord(result: EstimateReportReadResult, id: string): string | undefined {
  return result.report.rows.find(row => row.recordId === id)?.recordId;
}

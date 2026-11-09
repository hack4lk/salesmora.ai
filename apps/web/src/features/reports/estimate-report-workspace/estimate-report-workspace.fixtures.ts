import { estimateDecisionFamilies, estimateDecisionsResponse, type EstimateDecisionFixtureFamily } from '../estimate-decisions-report/estimate-decisions-report.fixtures';
import { estimateCurrentFamilies, estimateCurrentResponse, type EstimateCurrentFixtureFamily } from '../estimate-current-report/estimate-current-report.fixtures';
import { estimateIssuanceFamilies, estimateFirstQuotedResponse, type EstimateIssuanceFixtureFamily } from '../estimate-first-quoted-report/estimate-first-quoted-report.fixtures';
import type { EstimateReportFiltersValue } from '../estimate-report-filters/estimate-report-filters';
import type { EstimateReportAttribution, EstimateReportProjection, EstimateReportView } from './estimate-report-workspace';
import { estimateMatchesReportFilters } from './estimate-report-workspace.validation';

export const estimateWorkspaceOptions = {
  owners: [{ value: 'member:a', label: 'Alex' }, { value: 'member:b', label: 'Blair' }, { value: 'unassigned', label: 'No current owner' }],
  parents: [{ value: 'lead', label: 'Lead' }, { value: 'job', label: 'Job' }],
};
export const estimateWorkspaceScope = 'fixture:workspace:current-grants';
/** Fictional current attribution for the report-selected issued revision, not historical ownership or newer drafts. */
export function estimateWorkspaceAttribution(familyId: string, number: string, parentType: 'lead' | 'job'): EstimateReportAttribution {
  return { familyId, parentType, ownerKey: number === 'E2' || number === 'E4' || number === 'HANDOFF' ? 'member:b'
    : number === 'NO-EXPIRY' ? 'unassigned' : 'member:a' };
}
export type EstimateWorkspacePopulation = {
  decisions: readonly EstimateDecisionFixtureFamily[]; current: readonly EstimateCurrentFixtureFamily[];
  firstQuoted: readonly EstimateIssuanceFixtureFamily[];
};
export const estimateWorkspacePopulation: EstimateWorkspacePopulation = {
  decisions: estimateDecisionFamilies, current: estimateCurrentFamilies, firstQuoted: estimateIssuanceFamilies,
};

/** Mock host filters authorized families before aggregation/pagination; no page-only filtering. */
export function estimateWorkspaceResponse(view: EstimateReportView, filters: EstimateReportFiltersValue,
  evidence?: string, page = 1, pageSize = 25, scopeKey = estimateWorkspaceScope,
  range = { from: '2026-10-01', to: '2026-10-31' }, population = estimateWorkspacePopulation): EstimateReportProjection {
  const scopeLabel = 'Matching currently authorized issued families / mock current owner and parent attribution.';
  if (view === 'first-quoted') {
    if (evidence !== undefined && evidence !== 'first-quoted') throw new RangeError('Unknown mock first-quoted evidence.');
    const familyAttribution = population.firstQuoted.map(family => estimateWorkspaceAttribution(family.id, family.number, family.number === 'E3' ? 'job' : 'lead'));
    const families = population.firstQuoted.filter(family => {
      const current = familyAttribution.find(row => row.familyId === family.id);
      if (!current) throw new Error('Missing mock issuance attribution.');
      return estimateMatchesReportFilters(current, filters);
    });
    const total = estimateFirstQuotedResponse(families, 1, pageSize, range.from, range.to).total;
    const result = estimateFirstQuotedResponse(families, Math.min(page, Math.max(1, Math.ceil(total / pageSize))), pageSize, range.from, range.to);
    return { view, filters, scopeKey, state: { kind: 'ready', result: { ...result, scopeLabel } },
      attribution: familyAttribution.filter(row => result.rows.some(evidence => evidence.familyId === row.familyId)) };
  }
  if (view === 'decisions') {
    if (evidence !== undefined && evidence !== 'accepted' && evidence !== 'declined' && evidence !== 'decided') throw new RangeError('Unknown mock decision evidence.');
    const familyAttribution = population.decisions.map(family => estimateWorkspaceAttribution(family.id, family.number, family.number === 'E3' ? 'job' : 'lead'));
    const families = population.decisions.filter(family => {
      const current = familyAttribution.find(row => row.familyId === family.id);
      if (!current) throw new Error('Missing mock decision attribution.');
      return estimateMatchesReportFilters(current, filters);
    });
    const selected = evidence ?? 'decided', initial = estimateDecisionsResponse(families, selected, 1, pageSize, range.from, range.to);
    const total = selected === 'decided' ? initial.counts.accepted + initial.counts.declined : initial.counts[selected];
    const result = estimateDecisionsResponse(families, selected, Math.min(page, Math.max(1, Math.ceil(total / pageSize))), pageSize, range.from, range.to);
    return { view, filters, scopeKey, state: { kind: 'ready', result: { ...result, scopeLabel } },
      attribution: familyAttribution.filter(row => result.rows.some(evidence => evidence.familyId === row.familyId)) };
  }
  if (evidence !== undefined && evidence !== 'awaiting' && evidence !== 'expired' && evidence !== 'handoff') throw new RangeError('Unknown mock current evidence.');
  const familyAttribution = population.current.map(family => estimateWorkspaceAttribution(family.id, family.number, family.parentType));
  const families = population.current.filter(family => {
    const current = familyAttribution.find(row => row.familyId === family.id);
    if (!current) throw new Error('Missing mock current attribution.');
    return estimateMatchesReportFilters(current, filters);
  });
  const selected = evidence ?? 'awaiting', initial = estimateCurrentResponse(families, selected, 1, pageSize);
  const total = selected === 'handoff' ? initial.handoff.kind === 'available' ? initial.handoff.count : 0 : initial.counts[selected];
  const result = estimateCurrentResponse(families, selected, Math.min(page, Math.max(1, Math.ceil(total / pageSize))), pageSize);
  return { view, filters, scopeKey, state: { kind: 'ready', result: { ...result, scopeLabel } },
    attribution: familyAttribution.filter(row => result.rows.some(evidence => evidence.familyId === row.familyId)) };
}

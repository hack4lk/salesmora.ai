import { estimateReportQuerySchema, estimateReportReadResultSchema, estimateDecisionsResultSchema,
  estimateCurrentResultSchema, estimateFirstQuotedResultSchema, type EstimateReportQuery, type EstimateReportReadResult } from '@salesmora/contracts';
import { estimateDecisionsTotal } from '../estimate-decisions-report/estimate-decisions-report.validation';
import { estimateCurrentTotal } from '../estimate-current-report/estimate-current-report.validation';
import { estimateWorkspaceResponse, estimateWorkspacePopulation, estimateWorkspaceOptions,
  estimateWorkspaceAttribution, type EstimateWorkspacePopulation } from './estimate-report-workspace.fixtures';

export const estimateReadWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const initialEstimateQuery = estimateReportQuerySchema.parse({ workspaceId: estimateReadWorkspaceId,
  view: 'estimate-decisions', period: { from: '2026-10-01', to: '2026-10-31' }, selected: 'accepted' });
export type EstimateFixtureAuthority = EstimateReportReadResult['authority'];
export const estimateReadAuthority: EstimateFixtureAuthority = { scope: 'workspace', archives: 'included', money: true, handoff: true };
const numbers = [...new Set([...estimateWorkspacePopulation.decisions, ...estimateWorkspacePopulation.current].map(family => family.number))];
function nativeIdentity(workspaceId: string, familyId: string, number: string, revision: number) {
  const index = numbers.indexOf(number);
  if (index < 0) throw new Error('Unknown fictional Estimate family identity.');
  const copy = familyId.includes('~') ? Number(familyId.split('~').at(-1)) : 0;
  const nativeNumber = `EST-${String(index + 1).padStart(4, '0')}${copy ? `-${copy}` : ''}`;
  return { familyId: `${workspaceId}:${nativeNumber}`, estimateNumber: nativeNumber,
    recordId: `00000000-0000-4000-8000-${String((index + 1) * 10000 + copy * 10 + revision).padStart(12, '0')}` };
}
function mockPopulation(authority: EstimateFixtureAuthority, large: boolean): EstimateWorkspacePopulation {
  const allowed = (family: EstimateWorkspacePopulation['decisions'][number]) => {
    const issued = family.revisions.filter(revision => revision.issuedDate !== undefined).sort((a, b) => b.revision - a.revision)[0];
    return !!issued && (authority.archives === 'included' || !issued.archived) &&
      (authority.scope === 'workspace' || family.number === 'E3');
  };
  const population = {
    decisions: estimateWorkspacePopulation.decisions.filter(allowed),
    firstQuoted: estimateWorkspacePopulation.firstQuoted.filter(allowed),
    current: estimateWorkspacePopulation.current.filter(family => authority.scope === 'workspace' || family.parentType === 'job'),
  };
  if (!large) return population;
  return {
    decisions: population.decisions.flatMap(family => Array.from({ length: 26 }, (_, copy) => ({ ...family, id: `${family.id}~${copy}` }))),
    firstQuoted: population.firstQuoted.flatMap(family => Array.from({ length: 26 }, (_, copy) => ({ ...family, id: `${family.id}~${copy}` }))),
    current: population.current.flatMap(family => Array.from({ length: 26 }, (_, copy) => ({ ...family, id: `${family.id}~${copy}` }))),
  };
}
/** Strict native-envelope bridge over the established fictional families, not a live authorization engine. */
export function estimateReadResponse(rawQuery: EstimateReportQuery, authority = estimateReadAuthority, large = false): EstimateReportReadResult {
  const query = estimateReportQuerySchema.parse(rawQuery), population = mockPopulation(authority, large);
  const view = query.view === 'estimate-decisions' ? 'decisions' : query.view === 'estimate-current' ? 'current' : 'first-quoted';
  const facetRows = view === 'current'
    ? population.current.filter(family => {
      const issued = family.revisions.filter(revision => revision.issuedDate !== null).sort((a, b) => b.revision - a.revision)[0];
      return !!issued && !issued.archived;
    }).map(family => estimateWorkspaceAttribution(family.id, family.number, family.parentType))
    : population.decisions.map(family => estimateWorkspaceAttribution(family.id, family.number, family.number === 'E3' ? 'job' : 'lead'));
  const owners = estimateWorkspaceOptions.owners.filter(option => facetRows.some(row => row.ownerKey === option.value));
  const parents = estimateWorkspaceOptions.parents.filter(option => facetRows.some(row => row.parentType === option.value));
  if (query.filters.owners.some(value => !owners.some(option => option.value === value)) ||
    query.filters.parents.some(value => !parents.some(option => option.value === value))) {
    throw new Error('The selected Estimate facet is unavailable under current authority.');
  }
  const range = 'period' in query ? query.period : { from: '2026-10-01', to: '2026-10-31' };
  const selected = 'selected' in query ? query.selected : 'first-quoted';
  const projection = estimateWorkspaceResponse(view, query.filters, selected, query.page, query.pageSize, 'fixture', range, population);
  const common = { workspaceId: query.workspaceId, asOf: '2026-11-05T09:00:00.000Z', timezone: 'Europe/Warsaw',
    scope: authority.scope, scopeLabel: 'Currently authorized fictional issued families.', filters: query.filters };
  const attribution = (id: string) => {
    const row = projection.attribution.find(row => row.familyId === id);
    if (!row) throw new Error('Missing fictional Estimate attribution.');
    return { ownerKey: row.ownerKey, parentType: row.parentType };
  };
  let report;
  if (projection.view === 'decisions' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    report = estimateDecisionsResultSchema.parse({ ...common, view: 'estimate-decisions', from: result.from, to: result.to,
      archiveVisibility: authority.archives, counts: result.counts, money: result.money, selected: result.selected,
      page: result.page, pageSize: result.pageSize, evidenceTotal: estimateDecisionsTotal(result),
      rows: result.rows.map(row => ({ ...row, ...attribution(row.familyId),
        ...nativeIdentity(query.workspaceId, row.familyId, row.estimateNumber, row.revision) })) });
  } else if (projection.view === 'first-quoted' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    report = estimateFirstQuotedResultSchema.parse({ ...common, view: 'estimate-first-quoted', today: result.today,
      from: result.from, to: result.to, archiveVisibility: authority.archives, total: result.total, coverage: result.coverage,
      page: result.page, pageSize: result.pageSize, rows: result.rows.map(row => ({ ...row, ...attribution(row.familyId),
        ...nativeIdentity(query.workspaceId, row.familyId, row.estimateNumber, row.currentIssuedRevision) })) });
  } else if (projection.view === 'current' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    const handoff = authority.handoff ? result.handoff.kind === 'available' ? { kind: 'available', count: result.handoff.count } : result.handoff
      : { kind: 'unavailable', explanation: 'Complete current Lead and Job linkage access is required.' };
    report = estimateCurrentResultSchema.parse({ ...common, view: 'estimate-current', today: result.today,
      counts: result.counts, awaitingMoney: result.awaitingMoney, handoff, selected: result.selected,
      page: !authority.handoff && result.selected === 'handoff' ? 1 : result.page, pageSize: result.pageSize,
      evidenceTotal: estimateCurrentTotal({ ...result, handoff: authority.handoff ? result.handoff : {
        kind: 'unavailable', explanation: 'Incomplete linkage access.' } }, authority.handoff) ?? 0,
      rows: !authority.handoff && result.selected === 'handoff' ? [] : result.rows.map(row => ({ ...row, ...attribution(row.familyId),
        ...nativeIdentity(query.workspaceId, row.familyId, row.estimateNumber, row.revision) })) });
  } else throw new Error('Expected a ready fictional Estimate projection.');
  return estimateReportReadResultSchema.parse({ workspaceId: query.workspaceId, viewerId: 'estimates-viewer', policyRevision: 1,
    today: '2026-11-05', authority, exportAccess: null, query, report,
    options: { context: view === 'current' ? 'current' : 'period', owners, parents } });
}

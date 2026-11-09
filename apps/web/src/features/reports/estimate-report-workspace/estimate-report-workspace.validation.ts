import { estimateParentTypes } from '@salesmora/contracts';
import { validEstimateReportFilters, type EstimateReportFiltersValue, type EstimateReportFiltersOptions } from '../estimate-report-filters/estimate-report-filters';
import { validEstimateDecisionsResult } from '../estimate-decisions-report/estimate-decisions-report.validation';
import { validEstimateCurrentResult, estimateCurrentTotal } from '../estimate-current-report/estimate-current-report.validation';
import { validEstimateFirstQuotedResult } from '../estimate-first-quoted-report/estimate-first-quoted-report.validation';
import type { EstimateReportAttribution, EstimateReportProjection } from './estimate-report-workspace';

export function estimateMatchesReportFilters(attribution: EstimateReportAttribution, filters: EstimateReportFiltersValue): boolean {
  return (filters.owners.length === 0 || filters.owners.includes(attribution.ownerKey)) &&
    (filters.parents.length === 0 || filters.parents.includes(attribution.parentType));
}

/** Validate observable attribution; unseen aggregate membership and real authorization remain the host's responsibility. */
export function validEstimateReportProjection(projection: EstimateReportProjection, filters: EstimateReportFiltersValue,
  options: EstimateReportFiltersOptions, scopeKey: string, canReadMoney: boolean, canReadHandoff: boolean): boolean {
  if (!scopeKey.trim() || projection.scopeKey !== scopeKey ||
    !validEstimateReportFilters(filters, options) || !validEstimateReportFilters(projection.filters, options) ||
    !(['owners', 'parents'] as const).every(facet => filters[facet].length === projection.filters[facet].length &&
      projection.filters[facet].every(value => filters[facet].includes(value)))) return false;
  if (projection.state.kind !== 'ready') return true;
  let familyIds: readonly string[];
  if (projection.view === 'decisions' && projection.state.kind === 'ready') {
    if (!validEstimateDecisionsResult(projection.state.result, canReadMoney)) return false;
    familyIds = projection.state.result.rows.map(row => row.familyId);
  } else if (projection.view === 'first-quoted' && projection.state.kind === 'ready') {
    if (!validEstimateFirstQuotedResult(projection.state.result)) return false;
    familyIds = projection.state.result.rows.map(row => row.familyId);
  } else if (projection.view === 'current' && projection.state.kind === 'ready') {
    if (!validEstimateCurrentResult(projection.state.result, canReadMoney, canReadHandoff)) return false;
    if (estimateCurrentTotal(projection.state.result, canReadHandoff) === undefined) return true;
    familyIds = projection.state.result.rows.map(row => row.familyId);
    if (projection.state.result.selected === 'handoff' &&
      projection.attribution.some(row => row.parentType !== 'lead')) return false;
  } else return false;
  return projection.attribution.length === familyIds.length &&
    new Set(projection.attribution.map(row => row.familyId)).size === familyIds.length &&
    projection.attribution.every(row => familyIds.includes(row.familyId) && row.ownerKey.trim() &&
      estimateParentTypes.some(parent => parent === row.parentType) &&
      (options.owners === undefined || options.owners.some(option => option.value === row.ownerKey)) &&
      (options.parents === undefined || options.parents.some(option => option.value === row.parentType)) &&
      estimateMatchesReportFilters(row, filters));
}

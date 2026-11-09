'use client';

import { estimateParentTypes } from '@salesmora/contracts';
import { ReportFacetFilters } from '../report-facet-filters/report-facet-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';

export type EstimateReportFiltersValue = { owners: readonly string[]; parents: readonly string[] };
export type EstimateReportFilterContext = 'period' | 'current';
export type EstimateReportFiltersOptions = Partial<Record<keyof EstimateReportFiltersValue, readonly ReportScopeOption[]>>;
export type EstimateReportFiltersProps = {
  value: EstimateReportFiltersValue;
  /** Currently authorized applicable options only; omitted facets require empty selections. */
  options: EstimateReportFiltersOptions;
  context: EstimateReportFilterContext;
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  onChange: (value: EstimateReportFiltersValue) => void;
  onRetry: () => void;
};
const facets = ['owners', 'parents'] as const;
const labels = { owners: 'Current owner', parents: 'Parent type' };

function validEstimateReportFilterOptions(options: EstimateReportFiltersOptions): boolean {
  return facets.every(facet => {
    const choices = options[facet] ?? [];
    return new Set(choices.map(option => option.value)).size === choices.length &&
      choices.every(option => option.value.trim() && option.label.trim() &&
        (facet !== 'parents' || estimateParentTypes.some(parent => parent === option.value)));
  });
}

export function validEstimateReportFilters(value: EstimateReportFiltersValue, options: EstimateReportFiltersOptions): boolean {
  return validEstimateReportFilterOptions(options) && facets.every(facet =>
    new Set(value[facet]).size === value[facet].length &&
    value[facet].every(selected => options[facet]?.some(option => option.value === selected)));
}

/** Filter configuration only; hosts intersect domain grants and query matching family projections before pagination. */
export function EstimateReportFilters({ value, options, context, canRead, state = 'ready', pending = false, onChange, onRetry }: EstimateReportFiltersProps) {
  return <ReportFacetFilters reportLabel="Estimates" context={context} canRead={canRead} state={state} pending={pending}
    facets={facets.map(facet => ({ id: facet, label: labels[facet], selected: value[facet], options: options[facet] }))}
    validOptions={validEstimateReportFilterOptions(options)} validSelection={validEstimateReportFilters(value, options)}
    attributionHelp="Owner and parent type use current surviving values of the report-selected issued revision, not historical attribution. Assigned estimate access follows authorized Job relationships, not estimate ownership; selecting an owner never grants access. Decision, awaiting, expired and handoff views retain their own predicates without a conflicting status filter. Handoff remains lead-parent only. Hosts keep period/current drafts separate and replace matching counts, money and evidence together. Saved unavailable selections must be explicitly corrected."
    onSelect={(id, selected) => {
      const facet = facets.find(facet => facet === id);
      if (facet) onChange({ ...value, [facet]: selected });
    }}
    onClear={() => onChange({ owners: [], parents: [] })} onRetry={onRetry} />;
}

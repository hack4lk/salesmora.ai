'use client';

import { leadStages, leadSources } from '@salesmora/contracts';
import { ReportFacetFilters } from '../report-facet-filters/report-facet-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';

export type LeadReportFiltersValue = { stages: readonly string[]; owners: readonly string[]; sources: readonly string[] };
export type LeadReportFiltersProps = {
  value: LeadReportFiltersValue;
  /** Omit an inapplicable facet. Hosts supply only currently authorized options. */
  options: Partial<Record<keyof LeadReportFiltersValue, readonly ReportScopeOption[]>>;
  context: 'period' | 'current';
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  onChange: (value: LeadReportFiltersValue) => void;
  onRetry: () => void;
};
const facets = ['stages', 'owners', 'sources'] as const;
const labels = { stages: 'Current stage', owners: 'Current primary owner', sources: 'Current source' };
const limits = { stages: 5, owners: 50, sources: 5 };

function validLeadReportFilterOptions(options: LeadReportFiltersProps['options']): boolean {
  return facets.every(facet => {
    const choices = options[facet] ?? [];
    return new Set(choices.map(option => option.value)).size === choices.length &&
      choices.every(option => option.value.trim() && option.label.trim() &&
        (facet === 'owners' || (facet === 'stages' ? leadStages : leadSources).some(item => item === option.value)));
  });
}

export function validLeadReportFilters(value: LeadReportFiltersValue, options: LeadReportFiltersProps['options']): boolean {
  return validLeadReportFilterOptions(options) && facets.every(facet => value[facet].length <= limits[facet] &&
    new Set(value[facet]).size === value[facet].length &&
    value[facet].every(selected => options[facet]?.some(option => option.value === selected)));
}

/** Controlled configuration, not grant inference or client-side report aggregation. */
export function LeadReportFilters({ value, options, context, canRead, state = 'ready', pending = false, onChange, onRetry }: LeadReportFiltersProps) {
  return <ReportFacetFilters reportLabel="Leads" context={context} canRead={canRead} state={state} pending={pending}
    facets={facets.map(facet => ({ id: facet, label: labels[facet], selected: value[facet], options: options[facet], limit: limits[facet] }))}
    validOptions={validLeadReportFilterOptions(options)} validSelection={validLeadReportFilters(value, options)}
    attributionHelp="Stage, primary owner and source use current surviving values, not historical attribution. Saved unavailable selections must be explicitly removed or corrected."
    onSelect={(id, selected) => {
      const facet = facets.find(facet => facet === id);
      if (facet) onChange({ ...value, [facet]: selected });
    }}
    onClear={() => onChange({ stages: [], owners: [], sources: [] })} onRetry={onRetry} />;
}

'use client';

import { jobStatuses } from '@salesmora/contracts';
import { ReportFacetFilters } from '../report-facet-filters/report-facet-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';
import { activeJobStatuses } from '../job-workload-report/job-workload-report.validation';

export type JobReportFiltersValue = { statuses: readonly string[]; owners: readonly string[]; services: readonly string[] };
export type JobReportFilterContext = 'period' | 'current';
export type JobReportFiltersOptions = Partial<Record<keyof JobReportFiltersValue, readonly ReportScopeOption[]>>;
export type JobReportFiltersProps = {
  value: JobReportFiltersValue;
  /** Only currently authorized, applicable options; omitted facets require empty selections. */
  options: JobReportFiltersOptions;
  context: JobReportFilterContext;
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  onChange: (value: JobReportFiltersValue) => void;
  onRetry: () => void;
};
const facets = ['statuses', 'owners', 'services'] as const;
const labels = { statuses: 'Current status', owners: 'Current primary owner', services: 'Current service' };

function validJobReportFilterOptions(options: JobReportFiltersOptions, context: JobReportFilterContext): boolean {
  return facets.every(facet => {
    const choices = options[facet] ?? [];
    return new Set(choices.map(option => option.value)).size === choices.length &&
      choices.every(option => option.value.trim() && option.label.trim() &&
        (facet !== 'statuses' || (context === 'current' ? activeJobStatuses : jobStatuses).some(status => status === option.value)));
  });
}

export function validJobReportFilters(value: JobReportFiltersValue, options: JobReportFiltersOptions, context: JobReportFilterContext): boolean {
  return validJobReportFilterOptions(options, context) && facets.every(facet =>
    new Set(value[facet]).size === value[facet].length &&
    value[facet].every(selected => options[facet]?.some(option => option.value === selected)));
}

/** Hosts keep separate drafts and intersect current facets with period-event/current-snapshot queries. */
export function JobReportFilters({ value, options, context, canRead, state = 'ready', pending = false, onChange, onRetry }: JobReportFiltersProps) {
  return <ReportFacetFilters reportLabel="Jobs" context={context} canRead={canRead} state={state} pending={pending}
    facets={facets.map(facet => ({ id: facet, label: labels[facet], selected: value[facet], options: options[facet] }))}
    validOptions={validJobReportFilterOptions(options, context)} validSelection={validJobReportFilters(value, options, context)}
    attributionHelp="Status, primary owner and service use current surviving values, not historical attribution. Current status does not infer or replace period lifecycle events. Primary responsibility is separate from supporting team participation. Saved unavailable selections must be explicitly removed or corrected."
    onSelect={(id, selected) => {
      const facet = facets.find(facet => facet === id);
      if (facet) onChange({ ...value, [facet]: selected });
    }}
    onClear={() => onChange({ statuses: [], owners: [], services: [] })} onRetry={onRetry} />;
}

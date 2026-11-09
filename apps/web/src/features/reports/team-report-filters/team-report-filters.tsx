'use client';

import { ReportFacetFilters } from '../report-facet-filters/report-facet-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';

export type TeamReportFiltersValue = { members: readonly string[] };
export type TeamReportFilterScope = { kind: 'workspace' } | { kind: 'assigned'; currentMemberId: string };
export type TeamReportFiltersProps = {
  value: TeamReportFiltersValue;
  /** Current authorized member IDs only, not owner-group keys or an unassigned sentinel. */
  options: readonly ReportScopeOption[];
  scope: TeamReportFilterScope;
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  onChange: (value: TeamReportFiltersValue) => void;
  onRetry: () => void;
};
const alphabetic = new Intl.Collator('en', { sensitivity: 'base' });

function validTeamReportFilterOptions(options: readonly ReportScopeOption[], scope: TeamReportFilterScope): boolean {
  return new Set(options.map(option => option.value)).size === options.length &&
    options.every(option => option.value.trim() && option.value !== 'unassigned' && option.label.trim()) &&
    (scope.kind === 'workspace' || scope.currentMemberId.trim() !== '' && scope.currentMemberId !== 'unassigned' &&
      options.every(option => option.value === scope.currentMemberId));
}

export function validTeamReportFilters(value: TeamReportFiltersValue, options: readonly ReportScopeOption[], scope: TeamReportFilterScope): boolean {
  return validTeamReportFilterOptions(options, scope) && new Set(value.members).size === value.members.length &&
    value.members.every(selected => options.some(option => option.value === selected));
}

/** Hosts query matching distinct records and replace aggregates/evidence atomically; this component never filters rendered rows. */
export function TeamReportFilters({ value, options, scope, canRead, state = 'ready', pending = false, onChange, onRetry }: TeamReportFiltersProps) {
  const choices = options.map(option => scope.kind === 'assigned' ? { ...option, label: 'Me' } : option)
    .sort((a, b) => alphabetic.compare(a.label, b.label) || alphabetic.compare(a.value, b.value));
  return <ReportFacetFilters reportLabel="Team" context="current" canRead={canRead} state={state} pending={pending}
    facets={[{ id: 'members', label: 'Current member', selected: value.members, options: choices }]}
    validOptions={validTeamReportFilterOptions(options, scope)} validSelection={validTeamReportFilters(value, options, scope)}
    attributionHelp="Members use current surviving membership, not historical attribution. Leads match selected primary owners. Jobs match selected members in either primary responsibility or supporting participation; each Job counts once overall. Primary and supporting cards remain separate and supporting counts are non-additive. The unassigned queue stays separate, not a member option. Assigned scope exposes Me only. The host supplies matching authorized aggregates and evidence; saved unavailable members require explicit correction."
    onSelect={(_, members) => onChange({ members })}
    onClear={() => onChange({ members: [] })} onRetry={onRetry} />;
}

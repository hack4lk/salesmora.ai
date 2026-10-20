'use client';
import { StatusBadge } from '../../data-display/status-badge/status-badge';
import { leadSearchResultsCardData as copy } from './lead-search-results-card.data';

export interface LeadSearchResultRow {
  id: string; number: string; name: string; service: string;
  stage: keyof typeof copy.stages; ownerName: string | null; archived: boolean;
}
export interface LeadSearchResultSet {
  id: string; scope: 'workspace' | 'assigned'; filterLabels: readonly string[];
  includeArchived: boolean; total: number; rows: readonly LeadSearchResultRow[];
}
export interface LeadSearchResultsCardProps {
  result?: LeadSearchResultSet;
  state?: 'ready' | keyof typeof copy.states;
  disabled?: boolean;
  /** Host supplies authorized results and owns fresh record authorization/navigation. */
  onOpenLead?: (leadId: string) => void;
  /** Host maps this result identity to its actual scoped filters; labels are not executable filters. */
  onOpenList?: (resultId: string) => void;
}

/** Read-only bounded presentation. No URLs, queries, writes or permission inference. */
export function LeadSearchResultsCard({ result, state = 'ready', disabled = false, onOpenLead, onOpenList }: LeadSearchResultsCardProps) {
  const valid = !!result && Number.isSafeInteger(result.total) && result.total >= result.rows.length && (result.total === 0 || result.rows.length > 0) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    (result.includeArchived || !result.rows.some(row => row.archived));
  const unavailable = state === 'ready' ? (!valid ? 'error' : undefined) : state;
  const rows = unavailable ? [] : result!.rows.slice(0, 10);
  return <section aria-label={copy.title} aria-busy={state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{copy.title}</h3>
    {unavailable ? <p role="status" className="mt-3 mb-0 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : <>
      <p role="status" className="mt-3 mb-4 text-base font-semibold text-assistant-accent">{copy.count(rows.length, result!.total)}</p>
      <dl className="m-0 grid min-w-0 gap-3 text-sm leading-6">
        <div><dt className="font-semibold text-assistant-muted">{copy.scope}</dt><dd className="m-0 mt-1">{result!.scope === 'assigned' ? copy.assigned : copy.workspace}</dd></div>
        <div><dt className="font-semibold text-assistant-muted">{copy.filters}</dt><dd className="m-0 mt-1 wrap-anywhere">{result!.filterLabels.length ? <ul className="m-0 grid list-disc gap-1 pl-5">{result!.filterLabels.map((label, index) => <li key={index}>{label}</li>)}</ul> : copy.noFilters}</dd></div>
      </dl>
      <p className="mt-3 mb-4 text-sm leading-6 text-assistant-muted">{result!.includeArchived ? copy.archivedIncluded : copy.archivedExcluded}</p>
      {rows.length ? <ul className="m-0 grid list-none gap-3 p-0">{rows.map(row => <li key={row.id} className="min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3">
        {onOpenLead ? <button type="button" aria-label={copy.openLead(row.number, row.name)} disabled={disabled} onClick={() => onOpenLead(row.id)}
          className="min-h-11 max-w-full cursor-pointer rounded-lg py-2 text-left text-base font-semibold text-assistant-accent wrap-anywhere focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{row.number} · {row.name}</button>
          : <p className="m-0 text-base font-semibold leading-6 wrap-anywhere">{row.number} · {row.name}</p>}
        <p className="mt-1 mb-3 text-sm leading-6 wrap-anywhere">{row.service || copy.noService}</p>
        <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2">
          <div className="min-w-0"><dt className="mb-1 text-xs font-semibold text-assistant-muted">{copy.stage}</dt><dd className="m-0"><StatusBadge label={copy.stages[row.stage]}/></dd></div>
          <div className="min-w-0"><dt className="mb-1 text-xs font-semibold text-assistant-muted">{copy.owner}</dt><dd className="m-0 text-sm leading-6 wrap-anywhere">{row.ownerName || copy.unassigned}</dd></div>
        </dl>
        {row.archived && <p className="mt-3 mb-0 text-sm font-semibold text-assistant-muted">{copy.archived}</p>}
      </li>)}</ul> : <p className="m-0 rounded-xl border border-assistant-border bg-assistant-message p-4 text-sm leading-6">{copy.empty}</p>}
      {result!.total > rows.length && <p className="mt-4 mb-0 text-sm leading-6 text-assistant-muted">{copy.more}</p>}
      {onOpenList && <button type="button" disabled={disabled} onClick={() => onOpenList(result!.id)} className="mt-4 min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.openList}</button>}
      <p className="mt-3 mb-0 text-xs leading-5 text-assistant-muted">{copy.snapshot}</p>
    </>}
  </section>;
}

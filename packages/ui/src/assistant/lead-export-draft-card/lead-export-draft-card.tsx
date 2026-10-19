'use client';
import { useEffect, useRef, useState } from 'react';
import { leadExportDraftCardData as copy } from './lead-export-draft-card.data';

export interface LeadExportProposal {
  id: string;
  inputHash: string;
  expiresAt: string;
  state: keyof typeof copy.states;
  scope: 'workspace' | 'assigned';
  filterLabels: readonly string[];
  includeArchived: boolean;
  count: number | null;
  rowLimit: number;
}
export interface LeadExportDraftCardProps {
  draft: LeadExportProposal;
  disabled?: boolean;
  /** Controlled preview: the host supplies the authoritative outcome after the decision. */
  onDecide?: (draft: LeadExportProposal, decision: 'confirm' | 'cancel') => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function LeadExportDraftCard(props: LeadExportDraftCardProps) {
  return <ExportReview key={`${props.draft.id}:${props.draft.inputHash}:${props.draft.expiresAt}`} {...props}/>;
}

function ExportReview({ draft, disabled = false, onDecide }: LeadExportDraftCardProps) {
  const deadline = new Date(draft.expiresAt).getTime();
  const hasExpired = () => !Number.isFinite(deadline) || deadline <= Date.now();
  const [expired, setExpired] = useState(hasExpired);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const lock = useRef(false);
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const timer = setTimeout(() => setExpired(true), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [deadline]);
  const state = draft.state === 'pending' && expired ? 'expired' : draft.state;
  const validCount = draft.count !== null && Number.isSafeInteger(draft.count) && draft.count >= 0;
  const validLimit = Number.isSafeInteger(draft.rowLimit) && draft.rowLimit > 0;
  const overLimit = validCount && validLimit && draft.count! > draft.rowLimit;
  const blocked = !validCount || !validLimit || draft.count === 0 || overLimit;
  async function decide(decision: 'confirm' | 'cancel') {
    if (lock.current || disabled || state !== 'pending' || !onDecide || (decision === 'confirm' && blocked)) return;
    // A click queued at the deadline must not dispatch an expired proposal.
    if (hasExpired()) { setExpired(true); return; }
    lock.current = true; setPending(true); setError(undefined);
    try {
      const result = await onDecide(draft, decision);
      if (!result.ok) setError(result.message);
    } catch { setError(copy.failure); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-label={copy.title} aria-busy={pending} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{copy.title}</h3>
    <p className="mt-2 mb-4 text-sm leading-6 text-assistant-muted">{copy.description}</p>
    <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="min-w-0"><dt className="text-sm font-semibold text-assistant-muted">{copy.scope}</dt>
        <dd className="m-0 mt-1 text-sm leading-6">{draft.scope === 'assigned' ? copy.assigned : copy.workspace}</dd></div>
      <div className="min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3"><dt className="text-sm font-semibold text-assistant-muted">{copy.matches}</dt>
        <dd className="m-0 mt-1 text-base font-semibold text-assistant-accent">{validCount ? copy.count(draft.count!) : copy.unknown}</dd></div>
      <div className="min-w-0 sm:col-span-2"><dt className="text-sm font-semibold text-assistant-muted">{copy.filters}</dt>
        <dd className="m-0 mt-1 text-sm leading-6 wrap-anywhere">{draft.filterLabels.length ? <ul className="m-0 grid list-disc gap-1 pl-5">{draft.filterLabels.map((label, index) => <li key={index}>{label}</li>)}</ul> : copy.noFilters}</dd></div>
    </dl>
    <p className="mt-4 mb-0 text-sm leading-6 text-assistant-muted">{draft.includeArchived ? copy.archivedIncluded : copy.archivedExcluded}</p>
    <p className="mt-3 mb-0 text-sm leading-6 text-assistant-muted">{copy.format}</p>
    <details className="mt-3 text-sm leading-6 text-assistant-muted"><summary className="min-h-11 cursor-pointer rounded-lg py-2 font-semibold text-assistant-accent focus-visible:focus-ring">{copy.columnsLabel}</summary><p className="mt-2 mb-0 wrap-anywhere">{copy.columns}</p><p className="mt-2 mb-0">{copy.notes}</p></details>
    <p className="mt-3 mb-0 text-sm leading-6 text-assistant-muted">{copy.recheck}</p>
    {Number.isFinite(deadline) && <p className="mt-4 mb-0 text-xs leading-5 text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{new Date(deadline).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}</time></p>}
    <p role="status" aria-live="polite" className="mt-3 mb-3 text-sm font-semibold">{pending ? copy.saving : copy.states[state]}</p>
    {blocked && state === 'pending' && <p className="text-sm leading-6 text-assistant-muted">{!validCount || !validLimit ? copy.unavailable : overLimit ? copy.overLimit(draft.rowLimit) : copy.empty}</p>}
    {error && <p role="alert" className="text-sm leading-6">{error}</p>}
    {state === 'pending' && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled || pending || blocked} onClick={() => void decide('confirm')} className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.confirm}</button>
      <button type="button" disabled={disabled || pending} onClick={() => void decide('cancel')} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.cancel}</button>
    </div>}
  </section>;
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { leadUpdateDraftCardData as copy } from './lead-update-draft-card.data';
export type LeadFieldChange = { field: Exclude<keyof typeof copy.fields, 'stage'>; before: string; after: string };
export interface LeadUpdateProposal {
  id: string; inputHash: string; expiresAt: string; state: keyof typeof copy.states;
  lead: { id: string; number: string; name: string };
  changes: readonly LeadFieldChange[];
  stage?: { from: keyof typeof copy.stages; to: keyof typeof copy.stages; reason?: string };
}
export interface LeadUpdateDraftCardProps {
  draft: LeadUpdateProposal;
  disabled?: boolean;
  /** Host supplies the authoritative outcome. The card never writes a lead or infers authorization. */
  onDecide?: (draft: LeadUpdateProposal, decision: 'confirm' | 'cancel') => Promise<{ ok: true } | { ok: false; message: string }>;
}
export function LeadUpdateDraftCard(props: LeadUpdateDraftCardProps) {
  return <UpdateReview key={`${props.draft.id}:${props.draft.inputHash}:${props.draft.expiresAt}`} {...props}/>;
}
function displayValue(field: keyof typeof copy.fields, value: string) {
  if (field === 'stage' && Object.hasOwn(copy.stages, value)) return copy.stages[value as keyof typeof copy.stages];
  if (field === 'source' && Object.hasOwn(copy.sources, value)) return copy.sources[value as keyof typeof copy.sources];
  return value;
}
function UpdateReview({ draft, disabled = false, onDecide }: LeadUpdateDraftCardProps) {
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
  const changes: { field: keyof typeof copy.fields; before: string; after: string }[] = draft.changes.filter(change => change.before !== change.after);
  if (draft.stage && draft.stage.from !== draft.stage.to) changes.unshift({ field: 'stage', before: draft.stage.from, after: draft.stage.to });
  async function decide(decision: 'confirm' | 'cancel') {
    if (lock.current || disabled || state !== 'pending' || !onDecide || (decision === 'confirm' && !changes.length)) return;
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
    <p className="m-0 mb-4 text-sm font-semibold leading-6 wrap-anywhere">{draft.lead.number} · {draft.lead.name}</p>
    <div className="grid min-w-0 gap-4">{changes.map(change => <section key={change.field} aria-label={copy.fields[change.field]} className="min-w-0 border-t border-assistant-border pt-4">
      <h4 className="m-0 mb-3 text-sm font-semibold">{copy.fields[change.field]}</h4>
      <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0"><dt className="text-sm font-semibold text-assistant-muted">{copy.current}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{displayValue(change.field, change.before) || copy.empty}</dd></div>
        <div className="min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3"><dt className="text-sm font-semibold text-assistant-muted">{copy.proposed}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{displayValue(change.field, change.after) || copy.cleared}</dd></div>
      </dl>
    </section>)}</div>
    {draft.stage?.reason && <p className="mt-4 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{copy.lostReason}: {draft.stage.reason}</p>}
    {Number.isFinite(deadline) && <p className="mt-4 mb-0 text-xs leading-5 text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{new Date(deadline).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}</time></p>}
    <p role="status" aria-live="polite" className="mt-3 mb-3 text-sm font-semibold">{pending ? copy.saving : state === 'pending' && !changes.length ? copy.unchanged : copy.states[state]}</p>
    {error && <p role="alert" className="text-sm leading-6">{error}</p>}
    {state === 'pending' && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled || pending || !changes.length} onClick={() => void decide('confirm')} className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.confirm}</button>
      <button type="button" disabled={disabled || pending} onClick={() => void decide('cancel')} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.cancel}</button>
    </div>}
  </section>;
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { leadNoteDraftCardData as copy } from './lead-note-draft-card.data';

export interface LeadNoteProposal {
  id: string;
  inputHash: string;
  expiresAt: string;
  state: keyof typeof copy.states;
  lead: { id: string; number: string; name: string };
  body: string;
}
export interface LeadNoteDraftCardProps {
  draft: LeadNoteProposal;
  disabled?: boolean;
  /** Controlled preview: the host supplies the authoritative outcome after the decision. */
  onDecide?: (draft: LeadNoteProposal, decision: 'confirm' | 'cancel') => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function LeadNoteDraftCard(props: LeadNoteDraftCardProps) {
  return <NoteReview key={`${props.draft.id}:${props.draft.inputHash}:${props.draft.expiresAt}`} {...props}/>;
}

function NoteReview({ draft, disabled = false, onDecide }: LeadNoteDraftCardProps) {
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
  const invalid = !draft.body.trim() || draft.body.length > copy.maxLength;
  async function decide(decision: 'confirm' | 'cancel') {
    if (lock.current || disabled || state !== 'pending' || !onDecide || (decision === 'confirm' && invalid)) return;
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
    <dl className="m-0 grid min-w-0 gap-4">
      <div className="min-w-0"><dt className="text-sm font-semibold text-assistant-muted">{copy.lead}</dt>
        <dd className="m-0 mt-1 text-sm leading-6 wrap-anywhere">{draft.lead.number} · {draft.lead.name}</dd></div>
      <div className="min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3"><dt className="text-sm font-semibold text-assistant-muted">{copy.note}</dt>
        <dd className="m-0 mt-2 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{draft.body || copy.empty}</dd></div>
    </dl>
    <p className="mt-4 mb-0 text-sm leading-6 text-assistant-muted">{copy.appendDescription}</p>
    {Number.isFinite(deadline) && <p className="mt-4 mb-0 text-xs leading-5 text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{new Date(deadline).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}</time></p>}
    <p role="status" aria-live="polite" className="mt-3 mb-3 text-sm font-semibold">{pending ? copy.saving : copy.states[state]}</p>
    {invalid && state === 'pending' && <p role="alert" className="text-sm leading-6">{draft.body.length > copy.maxLength ? copy.tooLong : copy.emptyError}</p>}
    {error && <p role="alert" className="text-sm leading-6">{error}</p>}
    {state === 'pending' && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled || pending || invalid} onClick={() => void decide('confirm')} className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.confirm}</button>
      <button type="button" disabled={disabled || pending} onClick={() => void decide('cancel')} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.cancel}</button>
    </div>}
  </section>;
}

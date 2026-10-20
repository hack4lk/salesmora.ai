'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { leadDeleteDraftCardData as copy } from './lead-delete-draft-card.data';

export interface LeadDeleteProposal {
  id: string;
  inputHash: string;
  expiresAt: string;
  state: keyof typeof copy.states;
  lead: { id: string; number: string; name: string };
  stage?: keyof typeof copy.stages;
  archived?: boolean;
}
export interface LeadDeleteDraftCardProps {
  draft: LeadDeleteProposal;
  disabled?: boolean;
  /** Host reauthorizes and validates the exact confirmation; this card never deletes data. */
  onDecide?: (draft: LeadDeleteProposal, decision: 'confirm' | 'cancel', typedConfirmation: string) => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function LeadDeleteDraftCard(props: LeadDeleteDraftCardProps) {
  return <DeleteReview key={`${props.draft.id}:${props.draft.inputHash}:${props.draft.expiresAt}:${props.draft.lead.id}:${props.draft.lead.number}:${props.draft.stage}`} {...props}/>;
}

function DeleteReview({ draft, disabled = false, onDecide }: LeadDeleteDraftCardProps) {
  const inputId = useId(), helpId = useId();
  const deadline = new Date(draft.expiresAt).getTime();
  const hasExpired = () => !Number.isFinite(deadline) || deadline <= Date.now();
  const [expired, setExpired] = useState(hasExpired);
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const lock = useRef(false);
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const timer = setTimeout(() => setExpired(true), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [deadline]);
  const state = draft.state === 'pending' && expired ? 'expired' : draft.state;
  const won = draft.stage === 'won';
  const validSnapshot = !!draft.stage && typeof draft.archived === 'boolean';
  const validNumber = draft.lead.number.trim().length > 0;
  const matches = validNumber && value === draft.lead.number;
  async function decide(decision: 'confirm' | 'cancel') {
    if (lock.current || disabled || state !== 'pending' || !onDecide || (decision === 'confirm' && (!matches || won || !validSnapshot))) return;
    if (hasExpired()) { setExpired(true); return; }
    lock.current = true; setPending(true); setError(undefined);
    try {
      const result = await onDecide(draft, decision, decision === 'confirm' ? value : '');
      if (!result.ok) setError(result.message);
      else setValue('');
    } catch { setError(copy.failure); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-label={copy.title} aria-busy={pending} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{copy.title}</h3>
    <p className="mt-2 mb-4 text-sm leading-6 text-assistant-muted">{copy.description}</p>
    <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="min-w-0 sm:col-span-2"><dt className="text-sm font-semibold text-assistant-muted">{copy.lead}</dt>
        <dd className="m-0 mt-1 text-base font-semibold wrap-anywhere">{draft.lead.number}{state !== 'confirmed' && <> · {draft.lead.name}</>}</dd></div>
      {state !== 'confirmed' && draft.stage && <div className="min-w-0"><dt className="text-sm font-semibold text-assistant-muted">{copy.stage}</dt>
        <dd className="m-0 mt-1 text-sm leading-6">{copy.stages[draft.stage]}</dd></div>}
      {state !== 'confirmed' && typeof draft.archived === 'boolean' && <div className="min-w-0"><dt className="text-sm font-semibold text-assistant-muted">{copy.visibility}</dt>
        <dd className="m-0 mt-1 text-sm leading-6">{draft.archived ? copy.archived : copy.active}</dd></div>}
    </dl>
    <div className="mt-4 rounded-xl border border-error bg-error/10 p-4">
      <p className="m-0 text-base font-semibold">{copy.warningTitle}</p>
      <p className="mt-2 mb-0 text-sm leading-6">{state === 'confirmed' ? copy.deleted : copy.warning}</p>
    </div>
    {state !== 'confirmed' && <p className="mt-4 mb-0 text-sm leading-6 text-assistant-muted">{copy.alternative}</p>}
    <p className="mt-3 mb-0 text-sm leading-6 text-assistant-muted">{copy.allowance}</p>
    {won && state === 'pending' && <p className="mt-3 text-sm font-semibold leading-6">{copy.won}</p>}
    {!validSnapshot && state === 'pending' && <p className="mt-3 text-sm leading-6">{copy.incomplete}</p>}
    {!validNumber && state === 'pending' && <p className="mt-3 text-sm leading-6">{copy.noNumber}</p>}
    {state === 'pending' && onDecide && !won && validNumber && validSnapshot && <div className="mt-4 min-w-0">
      <label htmlFor={inputId} className="block text-sm font-semibold">{copy.confirmation}</label>
      <p id={helpId} className="mt-2 mb-2 text-sm leading-6 text-assistant-muted wrap-anywhere">{copy.typeNumber(draft.lead.number)}</p>
      <input id={inputId} type="text" value={value} onChange={event => setValue(event.target.value)} aria-describedby={helpId}
        onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }}
        autoComplete="off" spellCheck={false} disabled={disabled || pending}
        className="min-h-11 w-full min-w-0 rounded-xl border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-default disabled:opacity-50"/>
    </div>}
    {Number.isFinite(deadline) && <p className="mt-4 mb-0 text-xs leading-5 text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{new Date(deadline).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}</time></p>}
    <p role="status" aria-live="polite" className="mt-3 mb-3 text-sm font-semibold">{pending ? copy.saving : copy.states[state]}</p>
    {error && <p role="alert" className="text-sm leading-6">{error}</p>}
    {state === 'pending' && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled || pending || !matches || won || !validSnapshot} onClick={() => void decide('confirm')} className="min-h-11 cursor-pointer rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.confirm}</button>
      <button type="button" disabled={disabled || pending} onClick={() => void decide('cancel')} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.cancel}</button>
    </div>}
  </section>;
}

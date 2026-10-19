'use client';
import { useEffect, useRef, useState } from 'react';
import { leadDraftCardData as copy } from './lead-draft-card.data';
export interface LeadDraftProposal {
  id: string; inputHash: string; expiresAt: string; state: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'superseded'; ownerName: string; leadId?: string;
  lead: { name: string; service: string; email: string; phone: string; address: string; details: string; notes: string; source: keyof typeof copy.sources; stage: keyof typeof copy.stages; ownerId: string };
}
export interface LeadDraftCardProps {
  draft: LeadDraftProposal; disabled?: boolean;
  onDecide?: (draft: LeadDraftProposal, decision: 'confirm' | 'cancel') => Promise<{ ok: true } | { ok: false; message: string }>;
}
export function LeadDraftCard({ draft, disabled, onDecide }: LeadDraftCardProps) {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>();
  const [expired, setExpired] = useState(false); const lock = useRef(false);
  useEffect(() => {
    const remaining = new Date(draft.expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => setExpired(true), Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [draft.expiresAt]);
  const state = draft.state === 'pending' && expired ? 'expired' : draft.state;
  async function decide(decision: 'confirm' | 'cancel') {
    if (lock.current || disabled || state !== 'pending' || !onDecide) return;
    lock.current = true; setPending(true); setError(undefined);
    try { const result = await onDecide(draft, decision); if (!result.ok) setError(result.message); }
    catch { setError(copy.failure); }
    finally { lock.current = false; setPending(false); }
  }
  const fields = { name: draft.lead.name, service: draft.lead.service, email: draft.lead.email, phone: draft.lead.phone,
    address: draft.lead.address, details: draft.lead.details, notes: draft.lead.notes, source: copy.sources[draft.lead.source],
    stage: copy.stages[draft.lead.stage], owner: draft.ownerName || copy.unassigned };
  return <section aria-label={copy.title} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{copy.title}</h3>
    <p className="mt-2 text-sm leading-6 text-assistant-muted">{copy.description}</p>
    <dl className="grid min-w-0 gap-3 sm:grid-cols-2">{Object.entries(fields).map(([key, value]) => <div key={key} className="min-w-0">
      <dt className="text-sm font-semibold text-assistant-muted">{copy.fields[key as keyof typeof fields]}</dt>
      <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{value || copy.empty}</dd>
    </div>)}</dl>
    <p className="text-xs text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{draft.expiresAt.replace('T', ' ').replace('.000Z', ' UTC').replace('Z', ' UTC')}</time></p>
    <p role="status" aria-live="polite" className="text-sm font-semibold">{pending ? copy.pending : copy.states[state]}</p>
    {error && <p role="alert" className="text-sm text-assistant-foreground">{error}</p>}
    {state === 'pending' && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled || pending} onClick={() => void decide('confirm')} className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.confirm}</button>
      <button type="button" disabled={disabled || pending} onClick={() => void decide('cancel')} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{copy.cancel}</button>
    </div>}
  </section>;
}

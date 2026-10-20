'use client';

import { useId, type Ref } from 'react';
import { ArrowForwardOutlined } from '@salesmora/ui';
import { leadNextStepCardData as copy } from './lead-next-step-card.data';

export type NextStepLead = { id: string; version: number; leadNumber: string; name: string };
export type FollowUpRequest = { lead: NextStepLead; prompt: string };
export type LeadNextStepCardProps = {
  lead: NextStepLead; suggestion: { title: string; body: string } | null;
  assistantStatus?: 'ready' | 'busy' | 'unavailable';
  prepareButtonRef?: Ref<HTMLButtonElement>;
  /** Opens/selects scoped assistant context and prefills a reviewable prompt; never sends it. */
  onPrepare?: (request: FollowUpRequest) => void;
};

export function LeadNextStepCard({ lead, suggestion, assistantStatus = 'ready', prepareButtonRef, onPrepare }: LeadNextStepCardProps) {
  const id = useId();
  const available = assistantStatus === 'ready' && !!onPrepare;
  const reason = assistantStatus === 'busy' ? copy.busy : copy.unavailable;
  const hasSuggestion = !!suggestion?.title.trim() || !!suggestion?.body.trim();
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-6">
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2>
    {hasSuggestion ? <div className="grid min-w-0 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      {suggestion?.title.trim() && <h3 className="m-0 text-base font-semibold text-ink wrap-anywhere">{suggestion.title}</h3>}
      {suggestion?.body.trim() && <p className="m-0 text-base leading-6 whitespace-pre-line text-muted wrap-anywhere">{suggestion.body}</p>}
    </div> : <div className="grid gap-2"><p className="m-0 text-base text-ink">{copy.empty}</p><p className="m-0 text-sm leading-6 text-muted">{copy.emptyHelp}</p></div>}
    <div className="grid gap-3"><button type="button" ref={prepareButtonRef} disabled={!available} aria-describedby={`${id}-hint`}
      onClick={() => { if (available) onPrepare?.({ lead, prompt: copy.prompt(lead.leadNumber) }); }}
      className="flex min-h-11 w-fit max-w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">
      {copy.prepare}<ArrowForwardOutlined aria-hidden="true"/>
    </button><p id={`${id}-hint`} className="m-0 text-sm leading-6 text-muted">{available ? copy.draftHint : reason}</p></div>
  </section>;
}

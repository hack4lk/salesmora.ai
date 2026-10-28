'use client';
import { useEffect, useRef, useState } from 'react';
import { StatusBadge } from '@salesmora/ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import { calendarEventCardData as calendarCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { calendarScheduleDraftCardData as copy } from './calendar-schedule-draft-card.data';
import { reviewCalendarScheduleDraft } from './calendar-schedule-draft-card.preview';
import type { CalendarScheduleDraftCardProps } from './calendar-schedule-draft-card.types';
export type { CalendarScheduleDraftCardProps, CalendarScheduleProposal, CalendarScheduleReviewContext, CalendarScheduleDecision } from './calendar-schedule-draft-card.types';
export function CalendarScheduleDraftCard(props: CalendarScheduleDraftCardProps) {
  return <ScheduleReview key={`${props.draft.id}:${props.draft.inputHash}:${props.draft.revision}:${props.draft.expiresAt}:${props.draft.state}`} {...props}/>;
}
const action = 'min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-foreground focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:opacity-50';
function ScheduleReview({ draft, context, state = 'ready', disabled = false, onDecide }: CalendarScheduleDraftCardProps) {
  const [clock,setClock] = useState(() => Date.now()), [pending,setPending] = useState(false), [awaiting,setAwaiting] = useState(false), [error,setError] = useState<string>();
  const lock = useRef(false), review = reviewCalendarScheduleDraft(draft,context,clock);
  const expires = review.kind === 'ready' ? review.expires : undefined;
  useEffect(() => {
    if (expires === undefined || draft.state !== 'pending') return;
    const timer = setTimeout(() => setClock(Date.now()),Math.max(0,expires - Date.now()));
    return () => clearTimeout(timer);
  },[expires,draft.state]);
  const hidden = state !== 'ready' ? state : review.kind !== 'ready' ? review.kind : undefined;
  const status = draft.state === 'pending' && review.kind === 'ready' && review.expired ? 'expired' : draft.state;
  async function decide(decision: 'confirm' | 'cancel') {
    const current = reviewCalendarScheduleDraft(draft,context,Date.now());
    if (lock.current || disabled || state !== 'ready' || !onDecide || draft.state !== 'pending' || current.kind !== 'ready' || current.expired || (decision === 'confirm' && current.unchanged)) return;
    lock.current = true; setPending(true); setError(undefined);
    try {
      const result = await onDecide({ proposalId:draft.id,inputHash:draft.inputHash,visitId:draft.visitId,revision:draft.revision,decision });
      if (result.ok) setAwaiting(true); else { setError(result.message); lock.current = false; }
    } catch { setError(copy.failure); lock.current = false; }
    finally { setPending(false); }
  }
  const clearing = draft.intent === 'clear';
  const title = clearing ? copy.clear.title : copy.title;
  const people = [...new Map(draft.crew.map(p => [p.id,p])).values()];
  const schedule = (value: CalendarScheduleDraftCardProps['draft']['from']) => value.scheduledDate ? <><time dateTime={value.scheduledDate}>{calendarCopy.date(value.scheduledDate)}</time><span className="mt-1 block text-sm font-normal">{value.arrivalWindow ? calendarCopy.window(value.arrivalWindow) : calendarCopy.noWindow}</span></> : copy.unscheduled;
  return <section aria-label={title} aria-busy={pending || awaiting || state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{title}</h3>
    {hidden ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[hidden]}</p> : review.kind === 'ready' && <>
      <p className="mb-0 mt-3 text-sm font-semibold">{clearing ? copy.clear.heading : draft.from.scheduledDate ? copy.reschedule : copy.schedule}</p>
      {status === 'pending' && <p className="mb-0 mt-2 text-sm leading-6 text-assistant-muted">{clearing ? copy.clear.description : copy.description}</p>}
      <dl className="mb-0 mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-assistant-border p-3"><dt className="text-xs font-semibold text-assistant-muted">{status === 'confirmed' ? copy.previous : copy.current}</dt><dd className="m-0 mt-2 text-base font-semibold wrap-anywhere">{schedule(draft.from)}</dd></div>
        <div className="min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3"><dt className="text-xs font-semibold text-assistant-muted">{status === 'confirmed' ? copy.saved : copy.proposed}</dt><dd className="m-0 mt-2 text-base font-semibold text-assistant-accent wrap-anywhere">{schedule(draft.to)}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs text-assistant-muted">{copy.timezone}</dt><dd className="m-0 mt-1 text-sm wrap-anywhere">{draft.timezone}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs text-assistant-muted">{copy.people}</dt><dd className="m-0 mt-1 text-sm leading-6 wrap-anywhere">{people.length ? people.map(p => p.name).join(', ') : calendarCopy.unassigned}</dd></div>
      </dl>
      <h4 className="mb-0 mt-4 text-sm font-semibold">{copy.affected}</h4>
      {draft.records.length > 1 && <div className="mt-3 grid gap-2 rounded-xl border border-assistant-border bg-assistant-message p-3"><p className="m-0 text-sm font-semibold">{copy.shared}</p><p className="m-0 text-xs leading-5 text-assistant-muted">{clearing ? copy.clear.sharedHelp : copy.sharedHelp}</p></div>}
      <ol aria-label={copy.affected} className="mb-0 mt-3 grid list-none gap-3 p-0">{draft.records.map(r => <li key={`${r.type}:${r.id}`} className="grid min-w-0 gap-2 rounded-xl border border-assistant-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{r.number}</span><span className="inline-flex rounded-full bg-paper">{r.type === 'job' ? <JobStatusBadge status={r.status}/> : <WorkOrderStatusBadge status={r.status}/>}</span></div>
        <p className="m-0 text-sm leading-6 wrap-anywhere">{r.title}</p>
      </li>)}</ol>
      <p className="mb-0 mt-3 text-xs leading-5 text-assistant-muted">{copy.history}</p><p className="mb-0 mt-2 text-xs leading-5 text-assistant-muted">{clearing ? copy.clear.impact : copy.unchanged}</p>
      {draft.warnings.length > 0 && <aside aria-label={copy.warningTitle} className="mt-4 grid gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3">
        <span className="inline-flex justify-self-start rounded-full bg-paper"><StatusBadge label={copy.warningTitle} tone="warning"/></span>
        <ul className="m-0 grid gap-2 pl-4 text-sm leading-6 wrap-anywhere">{draft.warnings.map((w,i) => <li key={`${i}:${w}`}>{w}</li>)}</ul><p className="m-0 text-xs leading-5 text-assistant-muted">{copy.warningHelp}</p>
      </aside>}
      <p className="mb-0 mt-4 text-xs leading-5 text-assistant-muted">{copy.expires}: <time dateTime={draft.expiresAt}>{new Intl.DateTimeFormat('en-US',{ timeZone:draft.timezone,month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit' }).format(new Date(draft.expiresAt))}</time></p>
      <p role="status" className="mb-0 mt-3 text-sm font-semibold leading-6">{pending ? copy.saving : awaiting ? copy.awaiting : clearing && status === 'confirmed' ? copy.clear.confirmed : copy.states[status === 'forbidden' ? 'unavailable' : status]}</p>
      {review.unchanged && status === 'pending' && <p className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.noChange}</p>}
      {error && <p role="alert" className="mb-0 mt-3 text-sm leading-6 wrap-anywhere">{error}</p>}
      {status === 'pending' && onDecide && <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={`${action} bg-assistant-accent text-assistant-surface`} disabled={disabled || pending || awaiting || review.unchanged} onClick={() => { void decide('confirm'); }}>{clearing ? copy.clear.confirm : copy.confirm}</button>
        <button type="button" className={action} disabled={disabled || pending || awaiting} onClick={() => { void decide('cancel'); }}>{copy.cancel}</button>
      </div>}
    </>}
  </section>;
}

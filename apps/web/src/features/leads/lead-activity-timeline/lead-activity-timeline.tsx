'use client';

import { useId } from 'react';
import { FormFeedback, StatusBadge, type StatusBadgeTone } from '@salesmora/ui';
import type { LeadStage } from '../move-stage-dialog/move-stage-dialog';
import type { LeadEditValues } from '../lead-edit-form/lead-edit-form';
import { createLeadDateFormatter } from '../lead-date';
import { leadActivityTimelineData as copy } from './lead-activity-timeline.data';

type ActivityBase = { id: string; createdAt: string; actorName: string; viaAssistant?: boolean };
type ActivityOwner = { name: string; former?: boolean } | null;
export type LeadActivityEvent = ActivityBase & (
  { kind: 'created'; source: typeof copy.sources[number]['value'] }
  | { kind: 'edited'; changes: readonly { field: keyof LeadEditValues; before: string | null; after: string | null }[] }
  | { kind: 'stage'; from: LeadStage; to: LeadStage; reason?: string | null }
  | { kind: 'assigned'; from: ActivityOwner; to: ActivityOwner }
  | { kind: 'note'; body: string }
  | { kind: 'archived' | 'restored' }
);
export type LeadActivityTimelineProps = {
  /** Already authorized, paged event slice and total. Server supplies actor, before/after values and confirmation attribution. */
  events: readonly LeadActivityEvent[]; total: number; now: string; timezone: string;
  loading?: boolean; error?: string; onLoadMore?: () => void; onRetry?: () => void;
};
const tones: Record<LeadStage, StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };
const button = 'min-h-11 w-fit cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50';

export function LeadActivityTimeline({ events, total, now, timezone, loading = false, error, onLoadMore, onRetry }: LeadActivityTimelineProps) {
  const id = useId(), date = createLeadDateFormatter(now, timezone);
  const ordered = [...events].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  const owner = (value: ActivityOwner) => value === null ? copy.unassigned : value.former ? copy.former : value.name;
  function text(value: string | null, field?: keyof LeadEditValues) {
    if (!value?.trim()) return copy.missing;
    return field === 'source' ? copy.sources.find(source => source.value === value)?.label ?? value : value;
  }
  function body(event: LeadActivityEvent) {
    switch (event.kind) {
      case 'created': return <StatusBadge label={copy.sources.find(source => source.value === event.source)!.label}/>;
      case 'stage': return <div className="grid min-w-0 gap-3"><div className="flex min-w-0 flex-wrap items-center gap-2"><StatusBadge label={copy.stages.find(stage => stage.value === event.from)!.label} tone={tones[event.from]} dot/><span className="text-sm text-muted">{copy.to}</span><StatusBadge label={copy.stages.find(stage => stage.value === event.to)!.label} tone={tones[event.to]} dot/></div>
        {event.to === 'lost' && event.reason?.trim() && <dl className="m-0"><dt className="text-sm font-semibold text-ink">{copy.reason}</dt><dd className="m-0 mt-1 text-sm leading-6 whitespace-pre-line text-muted wrap-anywhere">{event.reason}</dd></dl>}
      </div>;
      case 'assigned': return <div className="flex min-w-0 flex-wrap items-center gap-2"><StatusBadge label={owner(event.from)}/><span className="text-sm text-muted">{copy.to}</span><StatusBadge label={owner(event.to)}/></div>;
      case 'note': return <p className="m-0 text-base leading-6 whitespace-pre-line text-ink wrap-anywhere">{event.body}</p>;
      case 'edited': return <div className="grid min-w-0 gap-4">{event.changes.map(change => <div key={change.field} className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-4">
        <p className="m-0 text-sm font-semibold text-ink">{copy.fields[change.field]}</p>
        <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.before}</dt><dd className="m-0 mt-1 text-sm leading-6 whitespace-pre-line text-muted wrap-anywhere">{text(change.before, change.field)}</dd></div><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.after}</dt><dd className="m-0 mt-1 text-sm leading-6 whitespace-pre-line text-ink wrap-anywhere">{text(change.after, change.field)}</dd></div></dl>
      </div>)}</div>;
      default: return null;
    }
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={loading} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2><span className="text-sm text-muted">{copy.newest}</span></div>
    {error && <><FormFeedback kind="error" message={error}/>{onRetry && <button type="button" disabled={loading} onClick={() => { if (!loading) onRetry(); }} className={button}>{copy.retry}</button>}</>}
    {ordered.length ? <ol role="list" className="m-0 grid list-none gap-0 p-0">{ordered.map(event => {
      const created = date(event.createdAt), content = body(event);
      return <li key={event.id} className="grid min-w-0 gap-3 border-l-2 border-line pb-6 pl-5 last:pb-0">
        <h3 className="m-0 text-base font-semibold text-ink">{copy.events[event.kind]}</h3>
        <div className="grid min-w-0 gap-1"><p className="m-0 text-sm text-muted wrap-anywhere">{event.viaAssistant ? copy.assistant(event.actorName) : event.actorName}</p>{created ? <time dateTime={event.createdAt} className="text-xs leading-5 text-muted">{created.exact}</time> : <span className="text-xs text-muted">{copy.dateUnavailable}</span>}</div>
        {content && <div className="min-w-0">{content}</div>}
      </li>;
    })}</ol> : !loading && !error && <p className="m-0 text-sm text-muted">{copy.empty}</p>}
    {loading && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
    {!error && !loading && <p className="m-0 text-xs text-muted">{copy.loaded(events.length, total)}</p>}
    {events.length < total && onLoadMore && !error && <button type="button" disabled={loading} onClick={() => { if (!loading) onLoadMore(); }} className={button}>{copy.older}</button>}
  </section>;
}

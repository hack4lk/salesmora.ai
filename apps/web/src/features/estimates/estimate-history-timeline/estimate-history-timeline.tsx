"use client";

import { useId } from "react";
import { FormFeedback, MoneyText } from "@salesmora/ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { estimateHistoryTimelineData as c } from "./estimate-history-timeline.data";
import {
  createEstimateHistoryDateFormatter, estimateHistoryDecisionDate, estimateHistoryTimestamp, orderEstimateHistory,
  type EstimateHistoryChange, type EstimateHistoryEvent,
} from "./estimate-history-timeline.preview";

export type EstimateHistoryTimelineProps = {
  /** Already-authorized, bounded event page and scoped count from the host. */
  events: readonly EstimateHistoryEvent[];
  total: number;
  timezone: string;
  canRead?: boolean;
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  onRetry?: () => void;
};

function Change({ change }: { change: EstimateHistoryChange }) {
  if (change.kind === "field") return <p className="m-0 text-sm leading-6 wrap-anywhere">
    <span className="text-muted">{c.changed}: </span>{c.fields[change.field]}
  </p>;
  if (change.kind === "converted-job") return <p className="m-0 text-sm leading-6 wrap-anywhere">
    <span className="text-muted">{c.convertedJob}: </span>{change.number}
  </p>;
  const values = change.kind === "status"
    ? [change.before ? <EstimateStatusBadge key="before" status={change.before} /> : c.noStatus, <EstimateStatusBadge key="after" status={change.after} />]
    : change.kind === "total" ? [<MoneyText key="before" cents={change.beforeCents} />, <MoneyText key="after" cents={change.afterCents} />]
      : [change.before, change.after];
  return <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
    <span className="text-xs font-semibold text-muted">{change.kind === "status" ? c.status : change.kind === "total" ? c.total : c.revision}</span>
    <dl className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
      {([c.before, c.after] as const).map((label, index) => <div key={label} className="flex min-w-0 flex-wrap items-baseline gap-x-1">
        <dt className="text-xs text-muted">{index === 1 && <span aria-hidden="true" className="mr-2">→</span>}{label}</dt>
        <dd className="m-0 wrap-anywhere">{values[index]}</dd>
      </div>)}
    </dl>
  </div>;
}

export function EstimateHistoryTimeline({
  events, total, timezone, canRead = false, loading = false, error, onLoadMore, onRetry,
}: EstimateHistoryTimelineProps) {
  const id = useId();
  if (!canRead) return <section aria-labelledby={`${id}-title`} className={`${estimatePanel} grid gap-4 print:hidden`}>
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
    <p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
  </section>;
  const formatter = createEstimateHistoryDateFormatter(timezone);
  const ordered = orderEstimateHistory(events);
  return <section aria-labelledby={`${id}-title`} aria-busy={loading} className={`${estimatePanel} grid gap-3 print:hidden`}>
    <div className="grid min-w-0 gap-1">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
        {formatter && <p className="m-0 text-xs leading-5 text-muted wrap-anywhere">{c.timezone(timezone)}</p>}
      </div>
      <p className="m-0 text-sm leading-5 text-muted">{c.description}</p>
    </div>
    {!formatter && <FormFeedback kind="error" message={c.timezoneUnavailable} />}
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} />
      {onRetry && <button type="button" disabled={loading} className={estimateButton}
        onClick={() => { if (!loading) onRetry(); }}>{c.retry}</button>}
      {ordered.length > 0 && <p className="m-0 text-sm leading-6 text-muted">{c.stale}</p>}
    </div>}
    {ordered.length > 0 ? <ol aria-label={c.title} className="m-0 min-w-0 list-none divide-y divide-line p-0" role="list">
      {ordered.map((event) => {
        const time = estimateHistoryTimestamp(event.createdAt, formatter);
        const actor = event.source.type === "worker" ? c.system : event.source.actorName?.trim() || c.former;
        return <li key={event.id} className="grid min-w-0 gap-1.5 py-3 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="m-0 text-sm font-semibold">{c.events[event.kind]}</h3>
            {time ? <time dateTime={event.createdAt} className="text-xs leading-5 text-muted wrap-anywhere">{time}</time>
              : <span className="text-xs leading-5 text-muted">{c.dateUnavailable}</span>}
          </div>
          <p className="m-0 text-xs leading-5 text-muted wrap-anywhere"><span>{actor}</span><span aria-hidden="true"> · </span><span>{c.sources[event.source.type]}</span></p>
          {event.changes.length > 0 && <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            {event.changes.map((change, index) => <Change key={index} change={change} />)}
          </div>}
          {(event.kind === "decision-recorded" || event.kind === "decision-corrected") && <dl className="m-0 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2"><dt className="text-xs font-semibold text-muted">{c.decisionDate}</dt><dd className="m-0 wrap-anywhere">{estimateHistoryDecisionDate(event.decisionDate) ?? c.decisionDateUnavailable}</dd></div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2"><dt className="text-xs font-semibold text-muted">{c.channel}</dt><dd className="m-0">{c.channels[event.channel]}</dd></div>
            {event.note?.trim() && <div className="w-full min-w-0"><dt className="text-xs font-semibold text-muted">{c.decisionNote}</dt><dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{event.note}</dd></div>}
          </dl>}
          {(event.kind === "decision-corrected" || event.kind === "voided") && <dl className="m-0 min-w-0 text-sm">
            <dt className="text-xs font-semibold text-muted">{event.kind === "voided" ? c.voidReason : c.correctionReason}</dt>
            <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{event.reason}</dd>
          </dl>}
        </li>;
      })}
    </ol> : !loading && !error && <p className="m-0 text-sm leading-6 text-muted">{c.empty}</p>}
    {loading && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.loading}</p>}
    {!loading && !error && <p role="status" className="m-0 text-xs leading-5 text-muted">{c.loaded(events.length, total)}</p>}
    {events.length < total && !error && (onLoadMore
      ? <button type="button" disabled={loading} className={`${estimateButton} justify-self-start`}
        onClick={() => { if (!loading) onLoadMore(); }}>{c.older}</button>
      : !loading && <p className="m-0 text-sm leading-6 text-muted">{c.moreUnavailable}</p>)}
  </section>;
}

'use client';

import { useEffect, useId, useState } from 'react';
import type { CalendarWorkTime } from '@salesmora/contracts';
import { calendarWorkTimeSummary } from '@salesmora/domain';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobDate, jobPanel, jobPrimary } from '../../jobs/job-ui';
import { cancellationOpeningData as copy } from './workflow-cancellation-opening.data';

export type CancellationSuggestion = {
  jobId: string; jobVersion: number; number: string; title: string; customerName: string;
  workTime: CalendarWorkTime; people: readonly { id: string; name: string }[];
  assignment: 'preserved' | 'qualified';
};
export type CancellationOpening = {
  id: string; revision: string; date: string; timezone: string; workTime: CalendarWorkTime;
  service: string; crew: readonly { id: string; name: string }[]; expiresAt: string;
};
export type CancellationBookingReview = {
  openingId: string; openingRevision: string; jobId: string; jobVersion: number;
  date: string; timezone: string; workTime: CalendarWorkTime; personIds: string[];
};
export type WorkflowCancellationOpeningProps = {
  opening: CancellationOpening; suggestions: readonly CancellationSuggestion[];
  state: 'open' | 'loading' | 'error' | 'filled' | 'expired' | 'paused';
  canRead: boolean; canBook: boolean; refreshing?: boolean; limited?:boolean;
  onBack: () => void; onRefresh: () => void;
  onBook: (review: CancellationBookingReview) => Promise<void>;
};

/** Canonical opening view. The host must authorize facts and revalidate every confirmed booking. */
export function WorkflowCancellationOpening(props: WorkflowCancellationOpeningProps) {
  return <OpeningReview key={`${props.opening.id}:${props.opening.revision}`} {...props}/>;
}
function OpeningReview({ opening, suggestions, state, canRead, canBook, refreshing, limited, onBack, onRefresh, onBook }: WorkflowCancellationOpeningProps) {
  const id = useId();
  const [selected, setSelected] = useState<CancellationSuggestion>();
  const [booking, setBooking] = useState(false);
  const [expired, setExpired] = useState(() => !Number.isFinite(Date.parse(opening.expiresAt)) || Date.parse(opening.expiresAt) <= Date.now());
  useEffect(() => {
    if (expired) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const remaining = Date.parse(opening.expiresAt) - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) setExpired(true);
      else timer = setTimeout(check, Math.min(remaining, 2_147_483_647));
    };
    check();
    return () => clearTimeout(timer);
  }, [opening.expiresAt, expired]);
  const work = calendarWorkTimeSummary(opening.workTime);
  const current = suggestions.find(item => item.jobId === selected?.jobId && JSON.stringify(item) === JSON.stringify(selected));
  const currentWork = calendarWorkTimeSummary(current?.workTime);
  const active = state === 'open' && !expired && !!work;
  const allowed = canRead && canBook && active && !refreshing;
  const terminal = state === 'filled' ? copy.filled : state === 'paused' ? copy.paused : copy.expired;
  return <div className="grid min-w-0 gap-5 text-ink">
    <button type="button" className={`${jobButton} justify-self-start`} disabled={booking} onClick={onBack}>{copy.back}</button>
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h1 className="m-0 text-2xl font-semibold">{copy.title}</h1>
      {canRead && active && <StatusBadge label={copy.available} tone="success" dot/>}</header>
    {!canRead ? <p role="status">{copy.denied}</p> : state === 'loading' ? <p role="status">{copy.loading}</p>
      : state === 'error' ? <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.error}/><button type="button" className={jobButton} onClick={onRefresh}>{copy.retry}</button></div>
      : <>
        <section aria-label={copy.available} className={jobPanel}>
          <p className="m-0 text-lg font-semibold">{jobDate(opening.date)}{work ? ` · ${work.range}` : ''}</p>
          <p className="mb-0 mt-1 text-xs text-muted wrap-anywhere">{opening.timezone}</p>
          <dl className="mb-0 mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-muted">{copy.service}</dt><dd className="m-0 mt-1 wrap-anywhere">{opening.service}</dd></div>
            <div><dt className="font-semibold text-muted">{copy.crew}</dt><dd className="m-0 mt-1 wrap-anywhere">{opening.crew.map(person => person.name).join(', ')}</dd></div></dl>
        </section>
        {!active ? <p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm">{terminal}</p> : <section aria-labelledby={`${id}-suggestions`} className="grid min-w-0 gap-4" aria-busy={refreshing}>
          <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 id={`${id}-suggestions`} className="m-0 text-lg font-semibold">{copy.suggestions}</h2><p className="mb-0 mt-1 text-sm text-muted">{copy.help}</p></div>
            <button type="button" className={jobButton} disabled={booking || refreshing} onClick={onRefresh}>{copy.refresh}</button></header>
          {!canBook && <p role="status" className="m-0 text-sm text-muted">{copy.readOnly}</p>}
          {!suggestions.length ? <div className={jobPanel}><p className="m-0 font-semibold">{copy.empty}</p><p className="mb-0 mt-2 text-sm text-muted">{copy.emptyHelp}</p></div>
            : <ul className="m-0 grid list-none gap-3 p-0">{suggestions.slice(0, 5).map(item => {
              const planned = calendarWorkTimeSummary(item.workTime);
              return <li key={item.jobId} className={`${jobPanel} flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
                <div className="grid min-w-0 flex-1 gap-1"><h3 className="m-0 text-base font-semibold wrap-anywhere">{item.number} · {item.title}</h3>
                  <p className="m-0 text-sm text-muted wrap-anywhere">{item.customerName}</p>
                  <p className="mb-0 mt-2 text-sm">{planned ? `${planned.range} · ${planned.duration}` : copy.stale}</p>
                  <p className="m-0 text-sm wrap-anywhere">{item.people.map(person => person.name).join(', ')}</p>
                  <p className="m-0 text-xs text-muted">{item.assignment === 'preserved' ? copy.preserved : copy.qualified}</p></div>
                <button type="button" className={jobPrimary} aria-label={`${copy.choose}: ${item.number}`} disabled={!allowed || booking || !planned || !item.people.length}
                  onClick={() => setSelected(structuredClone(item))}>{copy.choose}</button>
              </li>;
            })}</ul>}
          <p className="m-0 text-xs text-muted">{copy.limit}</p>{limited&&<p role="status" className="m-0 text-sm text-muted">Some jobs could not be checked. Review the schedule manually if you need more options.</p>}
        </section>}
      </>}
    {selected && canRead && <JobDialog open title={copy.review} description={copy.reviewHelp} confirmLabel={copy.confirm}
      confirmDisabled={!allowed || !current || !currentWork || !current.people.length} pending={booking} onClose={() => setSelected(undefined)}
      error={!active ? terminal : !current ? copy.stale : undefined}
      onSubmit={async () => {
        if (!allowed || !current || !currentWork || Date.parse(opening.expiresAt) <= Date.now()) throw Error(copy.stale);
        setBooking(true);
        try { await onBook({ openingId: opening.id, openingRevision: opening.revision, jobId: current.jobId, jobVersion: current.jobVersion,
          date: opening.date, timezone: opening.timezone, workTime: current.workTime, personIds: current.people.map(person => person.id) }); }
        finally { setBooking(false); }
      }}>
      {current && <><dl className="m-0 grid gap-3 rounded-xl border border-line bg-canvas p-4 text-sm">
        {[[copy.job, `${current.number} · ${current.title}`], [copy.customer, current.customerName], [copy.planned, `${jobDate(opening.date)} · ${currentWork?.range} · ${currentWork?.duration}`],
          [copy.people, current.people.map(person => person.name).join(', ')]].map(([label, value]) => <div key={label}><dt className="font-semibold text-muted">{label}</dt><dd className="m-0 mt-1 wrap-anywhere">{value}</dd></div>)}
      </dl><p className="m-0 text-xs text-muted">{opening.timezone}</p><p className="m-0 text-sm">{copy.assumption}</p></>}
    </JobDialog>}
  </div>;
}

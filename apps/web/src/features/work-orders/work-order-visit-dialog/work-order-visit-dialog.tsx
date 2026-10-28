'use client';
import { useEffect, useRef, useState } from 'react';
import { arrivalWindows, jobDateSchema } from '@salesmora/contracts';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woButton, woInput, woLabel } from '../work-order-ui';
import type { CalendarScheduleTarget } from '../../calendar/calendar-schedule-dialog/calendar-schedule-dialog';
import { calendarScheduleDialogData as scheduleCopy } from '../../calendar/calendar-schedule-dialog/calendar-schedule-dialog.data';
import { calendarEventCardData as format } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { workOrderVisitDialogData as copy } from './work-order-visit-dialog.data';
export type WorkOrderVisitChange =
  | { kind: 'join'; workOrderId: string; sourceVisitId: string; sourceRevision: string; visitId: string; revision: string }
  | { kind: 'separate'; workOrderId: string; visitId: string; revision: string; scheduledDate: string | null; arrivalWindow: typeof arrivalWindows[number] | null };
export type WorkOrderVisitDialogProps = {
  open: boolean; mode: 'join' | 'separate'; today: string; workOrder: { id: string; jobId: string; number: string; title: string };
  /** Already-scoped projections; capability flags cover every affected active record. */
  source: CalendarScheduleTarget | null; target?: CalendarScheduleTarget | null;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; error?: string; conflict?: boolean;
  onReload?: () => void; onClose: () => void; onConfirm: (draft: WorkOrderVisitChange) => void | Promise<void>;
};
export function WorkOrderVisitDialog(props: WorkOrderVisitDialogProps) {
  // A new authoritative review invalidates the previous selection, including permission revocation/restoration.
  const key = JSON.stringify([props.open, props.mode, props.workOrder.id, props.workOrder.jobId, props.state,
    props.source?.id, props.source?.revision, props.source?.canReschedule, props.target?.id, props.target?.revision, props.target?.canReschedule]);
  return <VisitSession key={key} {...props}/>;
}
function VisitSession({ open, mode, today, workOrder, source, target, state = 'ready', pending, error, conflict, onReload, onClose, onConfirm }: WorkOrderVisitDialogProps) {
  const [date, setDate] = useState(source?.scheduledDate ?? ''), [window, setWindow] = useState<typeof arrivalWindows[number] | ''>(source?.arrivalWindow ?? '');
  const [unscheduled, setUnscheduled] = useState(!source?.scheduledDate), [reviewing, setReviewing] = useState(false);
  const summary = useRef<HTMLDListElement>(null), dateField = useRef<HTMLInputElement>(null);
  useEffect(() => { if (reviewing) summary.current?.focus(); }, [reviewing]);
  const active = source?.records.filter(r => !['completed', 'canceled'].includes(r.status)) ?? [];
  const targetActive = target?.records.filter(r => !['completed', 'canceled'].includes(r.status)) ?? [];
  const own = active.find(r => r.type === 'work_order' && r.id === workOrder.id);
  const allowed = state === 'ready' && !!source?.canReschedule && !!own && (mode === 'separate' ? active.length > 1
    : active.length === 1 && !!target?.canReschedule && !!target.scheduledDate && target.id !== source.id && target.timezone === source.timezone
      && targetActive.some(r => r.type === 'job' && r.id === workOrder.jobId));
  const valid = allowed && (mode === 'join' || unscheduled || jobDateSchema.safeParse(date).success);
  const proposedDate = mode === 'join' ? target?.scheduledDate ?? null : unscheduled ? null : date;
  const proposedWindow = mode === 'join' ? target?.arrivalWindow ?? null : unscheduled ? null : window || null;
  const warnings = mode === 'separate' && !unscheduled && allowed ? [
    ...(date && date < today ? [scheduleCopy.past] : []),
    ...(date && source?.completionDeadline && date > source.completionDeadline.date ? [scheduleCopy.after] : []),
  ] : [];
  const schedule = (day: string | null, arrival: string | null) => day ? `${format.date(day)} · ${arrival ? format.window(arrival) : copy.noWindow}` : copy.noDate;
  return <JobDialog open={open} title={mode === 'join' ? copy.join : copy.separate} description={mode === 'join' ? copy.joinDescription : copy.separateDescription}
    confirmLabel={reviewing ? mode === 'join' ? copy.confirmJoin : copy.confirmSeparate : copy.review} confirmDisabled={!valid}
    pending={pending} error={error} conflict={conflict} onReload={onReload} closeOnSubmit={reviewing} onClose={onClose}
    onSubmit={async () => {
      if (!valid || !source) return;
      if (!reviewing) { setReviewing(true); return; }
      if (mode === 'join' && target) await onConfirm({ kind: 'join', workOrderId: workOrder.id, sourceVisitId: source.id, sourceRevision: source.revision, visitId: target.id, revision: target.revision });
      else await onConfirm({ kind: 'separate', workOrderId: workOrder.id, visitId: source.id, revision: source.revision, scheduledDate: proposedDate, arrivalWindow: proposedWindow });
    }}>
    {state !== 'ready' ? <>
      <p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'loading' ? copy.loading : copy.error}</p>
      {state === 'error' && onReload && <button type="button" className={woButton} onClick={onReload}>{copy.reload}</button>}
    </> : <>
      {!allowed && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.denied}</p>}
      <section aria-label={copy.affected} className="grid gap-1 rounded-xl border border-line p-3"><strong className="text-sm">{workOrder.number}</strong><p className="m-0 text-sm wrap-anywhere">{workOrder.title}</p></section>
      <dl ref={summary} tabIndex={-1} aria-label={copy.summary} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring sm:grid-cols-2">
        <div><dt className="font-semibold text-muted">{copy.current}</dt><dd className="m-0 mt-1">{schedule(source?.scheduledDate ?? null, source?.arrivalWindow ?? null)}</dd></div>
        {(mode === 'join' || reviewing) && <div><dt className="font-semibold text-muted">{copy.proposed}</dt><dd className="m-0 mt-1 font-semibold">{schedule(proposedDate, proposedWindow)}</dd></div>}
        <div className="min-w-0 sm:col-span-2"><dt className="font-semibold text-muted">{copy.timezone}</dt><dd className="m-0 mt-1 wrap-anywhere">{source?.timezone}</dd></div>
      </dl>
      {mode === 'separate' && !reviewing && <>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-primary focus-visible:focus-ring" checked={unscheduled} disabled={!allowed} onChange={e => setUnscheduled(e.target.checked)}/>{copy.unscheduled}</label>
        <label className={woLabel}>{copy.date}<input ref={dateField} type="date" required={!unscheduled} disabled={!allowed || unscheduled} className={woInput} value={date} onChange={e => setDate(e.target.value)}/></label>
        <label className={woLabel}>{copy.window}<select className={woInput} value={window} disabled={!allowed || unscheduled} onChange={e => setWindow(arrivalWindows.find(w => w === e.target.value) ?? '')}>
          <option value="">{copy.noWindow}</option>{arrivalWindows.map(w => <option key={w} value={w}>{format.window(w)}</option>)}
        </select></label>
      </>}
      {mode === 'join' && targetActive.length > 0 && <section aria-label={copy.target} className="grid gap-2"><h3 className="m-0 text-sm font-semibold">{copy.target}</h3><ul className="m-0 grid list-none gap-2 p-0 text-sm">{targetActive.map(r => <li key={`${r.type}:${r.id}`} className="wrap-anywhere">{r.number} · {r.title}</li>)}</ul></section>}
      {mode === 'separate' && active.length > 1 && <section aria-label={copy.remains} className="grid gap-2"><h3 className="m-0 text-sm font-semibold">{copy.remains}</h3><ul className="m-0 grid list-none gap-2 p-0 text-sm">{active.filter(r => r !== own).map(r => <li key={`${r.type}:${r.id}`} className="wrap-anywhere">{r.number} · {r.title}</li>)}</ul></section>}
      <p className="m-0 text-sm leading-6 text-muted">{mode === 'join' ? copy.joinHelp : copy.separateHelp}</p>
      {source && active.length !== source.records.length && <p className="m-0 text-xs leading-5 text-muted">{copy.history}</p>}
      <p className="m-0 text-xs leading-5 text-muted">{copy.unchanged}</p>
      {warnings.length > 0 && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><p className="m-0 font-semibold">{scheduleCopy.warnings}</p><ul className="mb-0 mt-2 pl-5">{warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}
      {reviewing && <button type="button" className={woButton} onClick={() => { setReviewing(false); requestAnimationFrame(() => { if (mode === 'separate' && !unscheduled) dateField.current?.focus(); else summary.current?.focus(); }); }}>{copy.back}</button>}
    </>}
  </JobDialog>;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { arrivalWindows, jobDateSchema } from '@salesmora/contracts';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobInput, jobLabel } from '../../jobs/job-ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { CalendarVisitPeek } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer';
import { calendarEventCardData as eventCopy } from '../calendar-event-card/calendar-event-card.data';
import { calendarScheduleDialogData as copy } from './calendar-schedule-dialog.data';

/** Presentation snapshot only; live commands must reauthorize every affected record and check its version. */
export type CalendarScheduleTarget = CalendarVisitPeek & { revision: string };
export type CalendarScheduleDraft = { visitId: string; revision: string; scheduledDate: string | null; arrivalWindow: typeof arrivalWindows[number] | null };
export type CalendarScheduleDialogProps = {
  open: boolean;
  targets: readonly CalendarScheduleTarget[];
  initialVisitId?: string;
  initialDate?: string;
  today: string;
  /** Already-scoped server advisories, valid only for this exact candidate schedule. */
  advisories?: CalendarScheduleDraft & { messages: readonly string[] };
  onDraftChange?: (draft: CalendarScheduleDraft) => void;
  pending?: boolean;
  error?: string;
  conflict?: boolean;
  onReload?: () => void;
  onClose: () => void;
  onConfirm: (draft: CalendarScheduleDraft) => void | Promise<void>;
};
export function CalendarScheduleDialog(props: CalendarScheduleDialogProps) {
  return <ScheduleSession key={`${props.open}:${props.initialVisitId ?? ''}`} {...props}/>;
}
function ScheduleSession(props: CalendarScheduleDialogProps) {
  const [selected, setSelected] = useState(props.initialVisitId ?? props.targets[0]?.id ?? '');
  const visit = props.targets.find(target => target.id === selected) ?? props.targets[0];
  if (!visit) return <JobDialog open={props.open} title={copy.title} description={copy.empty} confirmLabel={copy.review} confirmDisabled onClose={props.onClose} onSubmit={() => {}}><p className="m-0 text-sm text-muted">{copy.empty}</p></JobDialog>;
  return <ScheduleForm key={`${visit.id}:${visit.revision}`} {...props} visit={visit} onSelect={setSelected}/>;
}
function ScheduleForm({ visit, onSelect, ...props }: CalendarScheduleDialogProps & { visit: CalendarScheduleTarget; onSelect: (id: string) => void }) {
  const [date, setDate] = useState(props.initialDate ?? visit.scheduledDate ?? ''), [window, setWindow] = useState<typeof arrivalWindows[number] | ''>(visit.arrivalWindow ?? '');
  const [step, setStep] = useState<'edit' | 'review' | 'clear'>('edit');
  const review = useRef<HTMLDListElement>(null);
  useEffect(() => { if (step !== 'edit') review.current?.focus(); }, [step]);
  const active = visit.records.filter(record => !['completed', 'canceled'].includes(record.status));
  const allowed = visit.canReschedule && active.length > 0;
  const draft: CalendarScheduleDraft = { visitId: visit.id, revision: visit.revision, scheduledDate: step === 'clear' ? null : date, arrivalWindow: step === 'clear' ? null : window || null };
  const { onDraftChange } = props;
  useEffect(() => { onDraftChange?.({ visitId: visit.id, revision: visit.revision, scheduledDate: step === 'clear' ? null : date, arrivalWindow: step === 'clear' ? null : window || null }); }, [onDraftChange, visit.id, visit.revision, date, window, step]);
  const changed = draft.scheduledDate !== visit.scheduledDate || draft.arrivalWindow !== visit.arrivalWindow;
  const valid = step === 'clear' || jobDateSchema.safeParse(date).success;
  const warnings = step === 'clear' ? [] : [
    ...(date && date < props.today ? [copy.past] : []),
    ...(date && visit.completionDeadline && date > visit.completionDeadline.date ? [copy.after] : []),
    ...(props.advisories && props.advisories.visitId === draft.visitId && props.advisories.revision === draft.revision && props.advisories.scheduledDate === draft.scheduledDate && props.advisories.arrivalWindow === draft.arrivalWindow ? props.advisories.messages : []),
  ];
  const people = [...new Map(visit.crew.map(person => [person.id, person])).values()];
  const schedule = (day: string | null, arrival: string | null) => day ? `${eventCopy.date(day)} · ${arrival ? eventCopy.window(arrival) : eventCopy.noWindow}` : copy.noDate;
  return <JobDialog open={props.open} title={step === 'clear' ? copy.clearTitle : visit.scheduledDate ? copy.edit : copy.title} description={copy.description}
    confirmLabel={step === 'edit' ? copy.review : step === 'clear' ? copy.confirmClear : copy.confirm}
    confirmDisabled={!allowed || !valid || !changed} pending={props.pending} error={props.error || (props.conflict ? copy.conflict : undefined)} conflict={props.conflict} onReload={props.onReload}
    closeOnSubmit={step !== 'edit'} onClose={props.onClose}
    onSubmit={async () => { if (!allowed || !valid || !changed) return; if (step === 'edit') setStep('review'); else await props.onConfirm(draft); }}>
    {!allowed && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
    {step === 'edit' ? <>
      <label className={jobLabel}>{copy.visit}<select className={jobInput} value={visit.id} onChange={e => onSelect(e.target.value)}>
        {props.targets.map(target => <option key={target.id} value={target.id} disabled={!target.canReschedule}>{target.title} · {target.records.map(record => record.number).join(', ')}</option>)}
      </select></label>
      <label className={jobLabel}>{copy.date}<input type="date" className={jobInput} required disabled={!allowed} value={date} onChange={e => { setDate(e.target.value); }}/></label>
      <label className={jobLabel}>{copy.window}<select className={jobInput} disabled={!allowed} value={window} onChange={e => { const value = arrivalWindows.find(window => window === e.target.value) ?? ''; setWindow(value); }}>
        <option value="">{copy.none}</option>{arrivalWindows.map(window => <option key={window} value={window}>{eventCopy.window(window)}</option>)}
      </select></label>
    </> : <>
      <dl ref={review} tabIndex={-1} aria-label={copy.review} className="m-0 grid gap-3 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring">
        <div><dt className="font-semibold text-muted">{copy.from}</dt><dd className="m-0 mt-1">{schedule(visit.scheduledDate, visit.arrivalWindow)}</dd></div>
        <div><dt className="font-semibold text-muted">{copy.to}</dt><dd className="m-0 mt-1 font-semibold">{schedule(draft.scheduledDate, draft.arrivalWindow)}</dd></div>
      </dl>
      {step === 'clear' && <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{copy.clearHelp}</p>}
      <button type="button" className={jobButton} onClick={() => setStep('edit')}>{copy.back}</button>
    </>}
    <p className="m-0 text-xs text-muted">{copy.timezone}: {visit.timezone}</p>
    <p className="m-0 text-sm leading-6"><strong>{copy.people}: </strong>{people.length ? people.map(person => person.name).join(', ') : eventCopy.unassigned}</p>
    <section aria-label={copy.affected} className="grid gap-3">
      <h3 className="m-0 text-base font-semibold">{copy.affected}</h3>
      {active.map(record => <div key={`${record.type}:${record.id}`} className="grid min-w-0 gap-2 rounded-xl border border-line p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{record.number}</span>{record.type === 'job' ? <JobStatusBadge status={record.status}/> : <WorkOrderStatusBadge status={record.status}/>}</div>
        <p className="m-0 text-sm wrap-anywhere">{record.title}</p>
      </div>)}
      {active.length > 1 && <p className="m-0 text-sm leading-6 text-muted">{copy.shared}</p>}
      {active.length !== visit.records.length && <p className="m-0 text-sm leading-6 text-muted">{copy.history}</p>}
    </section>
    <p className="m-0 text-xs leading-5 text-muted">{copy.unchanged}</p>
    {warnings.length > 0 && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><p className="m-0 font-semibold">{copy.warnings}</p><ul className="mb-0 mt-2 pl-5">{warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}
    {step === 'edit' && visit.scheduledDate && allowed && <button type="button" className={jobButton} onClick={() => setStep('clear')}>{copy.clear}</button>}
  </JobDialog>;
}

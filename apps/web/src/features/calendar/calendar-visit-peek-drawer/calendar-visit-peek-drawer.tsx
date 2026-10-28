'use client';

import { FormFeedback, SideDrawer, StatusBadge } from '@salesmora/ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { CalendarVisitPreview } from '../calendar-event-card/calendar-event-card';
import { calendarEventCardData as eventCopy } from '../calendar-event-card/calendar-event-card.data';
import { calendarVisitPeekDrawerData as copy } from './calendar-visit-peek-drawer.data';

/** Already-authorized projection: omit inaccessible records, people and related data upstream. */
export type CalendarVisitPeek = CalendarVisitPreview & {
  scheduledDate: string | null;
  timezone: string;
  location: string | null;
  nextStep: string | null;
};
export type CalendarVisitPeekDrawerProps = {
  open: boolean;
  visit: CalendarVisitPeek | null;
  state?: 'ready' | 'loading' | 'error';
  onClose: () => void;
  onRetry?: () => void;
  onOpenRecord: (record: { type: 'job' | 'work_order'; id: string }) => void;
  /** Authority for every affected active record must be computed by the server. */
  onSchedule?: (visitId: string) => void;
  /** Handoff identity only. The host closes this drawer and reauthorizes context in the global assistant. */
  onAskAssistant?: (visitId: string) => void;
  assistantDisabled?: boolean;
};
const action = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
export function CalendarVisitPeekDrawer({ open, visit, state = 'ready', onClose, onRetry, onOpenRecord, onSchedule, onAskAssistant, assistantDisabled = false }: CalendarVisitPeekDrawerProps) {
  const ready = state === 'ready' && visit !== null;
  const people = visit ? [...new Map(visit.crew.map(person => [person.id, person])).values()] : [];
  return <SideDrawer open={open} title={ready ? visit.title : copy.title} description={copy.description} onClose={onClose}
    footer={ready ? <div className="grid gap-3">
      <button type="button" disabled={!visit.canReschedule || !onSchedule} onClick={() => onSchedule?.(visit.id)}
        className={`${action} w-full border-primary bg-primary text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:border-line disabled:bg-canvas disabled:text-muted`}>
        {visit.scheduledDate ? copy.reschedule : copy.scheduleAction}
      </button>
      {onAskAssistant && <>
        <button type="button" disabled={assistantDisabled} className={`${action} w-full disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted`}
          onClick={() => { if (!assistantDisabled) onAskAssistant(visit.id); }}>{copy.askAssistant}</button>
        <p className="m-0 text-sm leading-6 text-muted">{assistantDisabled ? copy.assistantBusy : copy.assistantHelp}</p>
      </>}
      {(!visit.canReschedule || !onSchedule) && <p className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
    </div> : undefined}>
    {state === 'loading' ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>
      : !ready ? <div className="grid gap-4"><FormFeedback kind="error" title={copy.errorTitle} message={copy.error}/>
        {onRetry && <button type="button" className={action} onClick={onRetry}>{copy.retry}</button>}
      </div> : <div className="grid min-w-0 gap-6">
        <dl className="m-0 grid gap-4">
          <div><dt className="text-xs font-semibold text-muted">{copy.customer}</dt><dd className="m-0 mt-1 font-semibold">{visit.customerName}</dd></div>
          <div><dt className="text-xs font-semibold text-muted">{copy.location}</dt><dd className="m-0 mt-1 text-sm leading-6">{visit.location ?? copy.noLocation}</dd></div>
          <div className="grid gap-2 rounded-xl border border-line bg-canvas p-4">
            <dt className="text-xs font-semibold text-muted">{copy.schedule}</dt>
            <dd className="m-0 grid gap-2 text-sm"><span className="font-semibold">{visit.scheduledDate ? <time dateTime={visit.scheduledDate}>{eventCopy.date(visit.scheduledDate)}</time> : copy.noDate}</span>
              <span>{visit.arrivalWindow ? eventCopy.window(visit.arrivalWindow) : eventCopy.noWindow}</span>
              <span className="text-xs text-muted">{copy.timezone}: {visit.timezone}</span>
            </dd>
          </div>
          <div><dt className="text-xs font-semibold text-muted">{copy.people}</dt><dd className="m-0 mt-1 text-sm leading-6">{people.length ? people.map(person => person.name).join(', ') : eventCopy.unassigned}</dd></div>
          {visit.completionDeadline && <div><dt className="text-xs font-semibold text-muted">{eventCopy.deadline}</dt><dd className={`m-0 mt-1 text-sm ${visit.completionDeadline.overdue ? 'font-semibold text-error' : ''}`}>
            <time dateTime={visit.completionDeadline.date}>{eventCopy.date(visit.completionDeadline.date)}</time>{visit.completionDeadline.overdue && ` · ${eventCopy.overdue}`}
          </dd></div>}
          <div><dt className="text-xs font-semibold text-muted">{copy.next}</dt><dd className="m-0 mt-1 text-sm leading-6">{visit.nextStep ?? copy.noNext}</dd></div>
        </dl>
        {visit.waiting && <StatusBadge label={eventCopy.waiting} tone="warning" dot/>}
        <section aria-label={copy.records} className="grid gap-3">
          <h3 className="m-0 text-base font-semibold">{copy.records}</h3>
          {visit.records.length > 1 && <p className="m-0 text-sm leading-6 text-muted">{copy.shared}</p>}
          {visit.records.map(record => <div key={`${record.type}:${record.id}`} className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{record.number}</span>
              {record.type === 'job' ? <JobStatusBadge status={record.status}/> : <WorkOrderStatusBadge status={record.status}/>}</div>
            <p className="m-0 text-sm leading-6">{record.title}</p>
            <button type="button" className={action} onClick={() => onOpenRecord({ type: record.type, id: record.id })}>{copy.openRecord(record.type, record.number)}</button>
          </div>)}
        </section>
      </div>}
  </SideDrawer>;
}

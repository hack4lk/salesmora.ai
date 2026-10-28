'use client';
import { jobDateSchema, type JobStatus, type WorkOrderStatus, type arrivalWindows } from '@salesmora/contracts';
import { StatusBadge } from '@salesmora/ui';
import { calendarEventCardData as calendarCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import { calendarResultsCardData as copy } from './calendar-results-card.data';

type ResultRecord = { id: string; number: string; title: string } & (
  { type: 'job'; status: JobStatus } | { type: 'work_order'; status: WorkOrderStatus }
);
export type CalendarAssistantVisit = {
  id: string; title: string; scheduledDate: string | null; arrivalWindow: (typeof arrivalWindows)[number] | null;
  records: readonly ResultRecord[]; crew: readonly { id: string; name: string }[];
};
/** Presentation snapshot only; the host must supply authorized records and people. */
export type CalendarAssistantResult = {
  id: string; scope: 'workspace' | 'own'; timezone: string; checkedAt: string;
  filterLabels: readonly string[]; total: number; visits: readonly CalendarAssistantVisit[];
} & ({ mode: 'schedule'; from: string; to: string } | { mode: 'unscheduled' });
export type CalendarResultsCardProps = {
  result?: CalendarAssistantResult;
  state?: 'ready' | keyof typeof copy.states;
  disabled?: boolean;
  /** The host rechecks current access before opening a visit or navigating. Labels are never executable filters. */
  onOpenVisit?: (resultId: string, visitId: string) => void;
  onOpenCalendar?: (resultId: string) => void;
};
function validResult(result: CalendarAssistantResult | undefined): result is CalendarAssistantResult {
  if (!result || !result.id || !Number.isSafeInteger(result.total) || result.total < result.visits.length || result.visits.length > 25 ||
    (result.total > 0 && !result.visits.length) || new Set(result.visits.map(v => v.id)).size !== result.visits.length || !Number.isFinite(Date.parse(result.checkedAt))) return false;
  const recordKeys = result.visits.flatMap(v => v.records.map(r => `${r.type}:${r.id}`));
  if (new Set(recordKeys).size !== recordKeys.length) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: result.timezone }).format(); } catch { return false; }
  if (result.mode === 'schedule' && (!jobDateSchema.safeParse(result.from).success || !jobDateSchema.safeParse(result.to).success || result.from > result.to)) return false;
  return result.visits.every(visit => !!visit.id && !!visit.title.trim() && visit.records.length > 0 &&
    new Set(visit.records.map(r => `${r.type}:${r.id}`)).size === visit.records.length &&
    (result.mode === 'unscheduled' ? visit.scheduledDate === null && visit.arrivalWindow === null :
      jobDateSchema.safeParse(visit.scheduledDate).success && visit.scheduledDate! >= result.from && visit.scheduledDate! <= result.to));
}
const action = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 py-2 text-left text-sm font-semibold text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted';

/** Read-only bounded result. No fetch, URL construction, permission inference or business mutation. */
export function CalendarResultsCard({ result, state = 'ready', disabled = false, onOpenVisit, onOpenCalendar }: CalendarResultsCardProps) {
  const unavailable = state !== 'ready' ? state : !validResult(result) ? 'error' : undefined;
  const ready = unavailable ? undefined : result;
  return <section aria-label={ready ? copy.titles[ready.mode] : copy.titles.schedule} aria-busy={state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{ready ? copy.titles[ready.mode] : copy.titles.schedule}</h3>
    {unavailable ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : ready && <>
      <p className="mb-0 mt-3 text-sm font-semibold">{copy.scope[ready.scope]}</p>
      {ready.mode === 'schedule' && <p className="mb-0 mt-2 text-sm leading-6">{copy.date(ready.from)} – {copy.date(ready.to)}</p>}
      <p className="mb-0 mt-2 text-xs leading-5 text-assistant-muted wrap-anywhere">{copy.timezone}: {ready.timezone}<br/>{copy.captured}: {copy.timestamp(ready.checkedAt, ready.timezone)}</p>
      {!!ready.filterLabels.length && <ul aria-label={copy.filters} className="mb-0 mt-3 flex list-none flex-wrap gap-2 p-0">{ready.filterLabels.map((label, index) => <li key={index} className="max-w-full rounded-lg border border-assistant-border px-2 py-1 text-xs leading-5 wrap-anywhere">{label}</li>)}</ul>}
      <p role="status" className="mb-0 mt-3 text-sm leading-6">{copy.count(ready.visits.length, ready.total)}</p>
      {!ready.visits.length ? <p className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.empty[ready.mode]}</p> : <ol className="mb-0 mt-4 grid list-none gap-3 p-0">
        {ready.visits.map(visit => <li key={visit.id} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3">
          <h4 className="m-0 text-sm font-semibold wrap-anywhere">{visit.title}</h4>
          <p className="m-0 text-sm leading-6">{visit.scheduledDate ? <time dateTime={visit.scheduledDate}>{copy.date(visit.scheduledDate)}</time> : <span>{copy.noDate}</span>}<br/><span>{visit.arrivalWindow ? calendarCopy.window(visit.arrivalWindow) : copy.noWindow}</span></p>
          {visit.records.length > 1 && <span className="inline-flex max-w-full justify-self-start rounded-full bg-paper"><StatusBadge label={copy.shared} tone="info"/></span>}
          <ul className="m-0 grid list-none gap-2 p-0">{visit.records.map(record => <li key={`${record.type}:${record.id}`} className="flex min-w-0 flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold wrap-anywhere">{copy.types[record.type]} · {record.number} · {record.title}</span><span className="inline-flex max-w-full rounded-full bg-paper">{record.type === 'job' ? <JobStatusBadge status={record.status}/> : <WorkOrderStatusBadge status={record.status}/>}</span></li>)}</ul>
          <p className="m-0 text-xs leading-5 text-assistant-muted wrap-anywhere">{copy.team}: {[...new Map(visit.crew.map(p => [p.id, p.name])).values()].join(', ') || copy.unassigned}</p>
          {onOpenVisit && <button type="button" className={`${action} justify-self-start`} disabled={disabled} aria-label={copy.viewLabel(visit.title)} onClick={() => { if (!disabled) onOpenVisit(ready.id, visit.id); }}>{copy.open}</button>}
        </li>)}
      </ol>}
      {onOpenCalendar && <button type="button" className={`${action} mt-4`} disabled={disabled} onClick={() => { if (!disabled) onOpenCalendar(ready.id); }}>{copy.openCalendar}</button>}
      <p className="mb-0 mt-3 text-xs leading-5 text-assistant-muted">{copy.historical}</p>
    </>}
  </section>;
}

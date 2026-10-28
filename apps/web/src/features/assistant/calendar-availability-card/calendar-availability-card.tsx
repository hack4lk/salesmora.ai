'use client';
import { jobDateSchema, type arrivalWindows } from '@salesmora/contracts';
import { StatusBadge } from '@salesmora/ui';
import { calendarEventCardData as calendarCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { calendarAvailabilityCardData as copy } from './calendar-availability-card.data';
export type CalendarDateSuggestion = {
  id: string; date: string; person: { id: string; name: string };
  /** Deduplicated visible visits, not linked-record counts or estimated work hours. */
  visitCount: number; unknownWindowCount: number; timing: 'no-known-overlap' | 'not-checked';
};
export type CalendarAvailabilityResult = {
  id: string; from: string; to: string; timezone: string; checkedAt: string;
  scope: 'workspace' | 'own'; viewerId: string; people: readonly { id: string; name: string }[]; arrivalWindow: (typeof arrivalWindows)[number] | null;
  total: number; suggestions: readonly CalendarDateSuggestion[];
};
export type CalendarAvailabilityCardProps = {
  result?: CalendarAvailabilityResult; state?: 'ready' | keyof typeof copy.states; disabled?: boolean;
  /** Host must reauthorize the frozen result/date intent before navigation. No scheduling callback. */
  onOpenDate?: (resultId: string, suggestionId: string) => void;
  onOpenCalendar?: (resultId: string) => void;
};
function valid(result: CalendarAvailabilityResult | undefined): result is CalendarAvailabilityResult {
  if (!result?.id || !result.viewerId || !jobDateSchema.safeParse(result.from).success || !jobDateSchema.safeParse(result.to).success || result.from > result.to || !Number.isFinite(Date.parse(result.checkedAt))) return false;
  if (!Number.isSafeInteger(result.total) || result.total < result.suggestions.length || result.suggestions.length > 3 || (result.total > 0 && !result.suggestions.length)) return false;
  if (!result.people.length || result.people.length > 10 || new Set(result.people.map(p => p.id)).size !== result.people.length || result.people.some(p => !p.id || !p.name.trim() || (result.scope === 'own' && p.id !== result.viewerId))) return false;
  if (new Set(result.suggestions.map(s => s.id)).size !== result.suggestions.length || new Set(result.suggestions.map(s => `${s.person.id}:${s.date}`)).size !== result.suggestions.length) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: result.timezone }); } catch { return false; }
  return result.suggestions.every(s => !!s.id && !!s.person.id && !!s.person.name.trim() && result.people.some(p => p.id === s.person.id && p.name === s.person.name) && jobDateSchema.safeParse(s.date).success && s.date >= result.from && s.date <= result.to &&
    Number.isSafeInteger(s.visitCount) && s.visitCount >= 0 && Number.isSafeInteger(s.unknownWindowCount) && s.unknownWindowCount >= 0 && s.unknownWindowCount <= s.visitCount && (result.scope !== 'own' || s.person.id === result.viewerId) && (s.timing !== 'no-known-overlap' || (result.arrivalWindow !== null && (s.visitCount === 0 || s.unknownWindowCount < s.visitCount))));
}
const action = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 py-2 text-left text-sm font-semibold text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted';
/** Pure read-only advice. The host supplies authorized, complete counts and candidates; no availability is inferred here. */
export function CalendarAvailabilityCard({ result, state = 'ready', disabled = false, onOpenDate, onOpenCalendar }: CalendarAvailabilityCardProps) {
  const unavailable = state !== 'ready' ? state : !valid(result) ? 'error' : undefined;
  const ready = unavailable ? undefined : result;
  return <section aria-label={copy.title} aria-busy={state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 className="m-0 text-base font-semibold">{copy.title}</h3>
    {unavailable ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : ready && <>
      <p className="mb-0 mt-3 text-sm font-semibold">{copy.scope[ready.scope]}</p>
      <aside className="mt-3 grid gap-2 rounded-xl border border-assistant-border bg-assistant-message p-3"><p className="m-0 text-sm font-semibold">{copy.basis}</p><p className="m-0 text-xs leading-5 text-assistant-muted">{copy.limitations}</p></aside>
      <dl className="mb-0 mt-4 grid min-w-0 gap-3 text-xs leading-5">
        <div><dt className="text-assistant-muted">{copy.people}</dt><dd className="m-0 wrap-anywhere">{ready.people.map(p => p.name).join(', ')}</dd></div>
        <div><dt className="text-assistant-muted">{copy.period}</dt><dd className="m-0 wrap-anywhere">{copy.date(ready.from)} – {copy.date(ready.to)}</dd></div>
        <div><dt className="text-assistant-muted">{copy.timezone}</dt><dd className="m-0 wrap-anywhere">{ready.timezone}</dd></div>
        <div><dt className="text-assistant-muted">{copy.window}</dt><dd className="m-0">{ready.arrivalWindow ? calendarCopy.window(ready.arrivalWindow) : copy.countOnly}</dd></div>
        <div><dt className="text-assistant-muted">{copy.checked}</dt><dd className="m-0">{copy.timestamp(ready.checkedAt, ready.timezone)}</dd></div>
      </dl>
      <p role="status" className="mb-0 mt-4 text-sm leading-6">{copy.shown(ready.suggestions.length, ready.total)}</p>
      {!ready.suggestions.length ? <p className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.empty}</p> : <ol className="mb-0 mt-3 grid list-none gap-3 p-0">{ready.suggestions.map(s => <li key={s.id} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3">
        <h4 className="m-0 text-sm font-semibold"><time dateTime={s.date}>{copy.date(s.date)}</time></h4>
        <p className="m-0 text-sm leading-6 wrap-anywhere"><span className="sr-only">{copy.person}: </span>{s.person.name}</p>
        <p className="m-0 text-xs leading-5 text-assistant-muted">{copy.visits(s.visitCount)}</p>
        {ready.arrivalWindow && <p className="m-0 text-xs leading-5">{s.timing === 'no-known-overlap' ? copy.noKnownOverlap : copy.notChecked}</p>}
        {s.unknownWindowCount > 0 && <p className="m-0 rounded-lg border border-assistant-border p-3 text-xs font-semibold leading-5">{copy.unknown(s.unknownWindowCount)}</p>}
        {s.visitCount >= 4 && <div className="grid gap-2"><span className="inline-flex max-w-full justify-self-start rounded-full bg-paper"><StatusBadge label={copy.busy} tone="warning"/></span><p className="m-0 text-xs leading-5">{copy.busyDetail}</p></div>}
        {onOpenDate && <button type="button" className={`${action} justify-self-start`} disabled={disabled} aria-label={copy.openDateLabel(copy.date(s.date),s.person.name)} onClick={() => { if (!disabled) onOpenDate(ready.id,s.id); }}>{copy.openDate}</button>}
      </li>)}</ol>}
      {onOpenCalendar && <button type="button" className={`${action} mt-4`} disabled={disabled} onClick={() => { if (!disabled) onOpenCalendar(ready.id); }}>{copy.openCalendar}</button>}
      <p className="mb-0 mt-3 text-xs leading-5 text-assistant-muted">{copy.snapshot}</p>
    </>}
  </section>;
}

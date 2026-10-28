'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { calendarChatResultSchema, type CalendarChatResult } from '@salesmora/contracts';
import { CalendarAvailabilityCard } from '../calendar-availability-card/calendar-availability-card';
import { CalendarResultsCard, type CalendarAssistantResult } from './calendar-results-card';
export function ConnectedCalendarResult({ result, workspaceId, turnId, disabled, onNavigate }: {
  result: CalendarChatResult; workspaceId: string; turnId: string; disabled: boolean; onNavigate: (href: string) => void;
}) {
  const [current, setCurrent] = useState<CalendarChatResult>(), [state, setState] = useState<'loading'|'ready'|'unavailable'>('loading'), [opening,setOpening] = useState(false);
  const sequence = useRef(0), flight = useRef(false), mounted = useRef(false), controllers = useRef(new Set<AbortController>());
  const latestDisabled = useRef(disabled);
  useLayoutEffect(() => { latestDisabled.current = disabled; }, [disabled]);
  const invalidate = useCallback(() => { sequence.current++; }, []);
  const refresh = useCallback(async () => {
    if (flight.current) return;
    const token = ++sequence.current, controller = new AbortController(); controllers.current.add(controller);
    try {
      const params = new URLSearchParams({ workspaceId, turnId, resultId: result.id });
      const response = await fetch(`/api/chat/calendar?${params}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw Error(); const next = calendarChatResultSchema.parse((await response.json()).result);
      if (next.id !== result.id || next.mode !== result.mode) throw Error();
      if (mounted.current && token === sequence.current) { setCurrent(next); setState('ready'); }
    } catch { if (mounted.current && token === sequence.current) { setCurrent(undefined); setState('unavailable'); } }
    finally { controllers.current.delete(controller); }
  }, [workspaceId, turnId, result.id, result.mode]);
  useEffect(() => {
    mounted.current = true; void Promise.resolve().then(refresh); const active = controllers.current;
    const recheck = () => { if (document.visibilityState !== 'hidden') void refresh(); };
    window.addEventListener('focus', recheck); const timer = setInterval(recheck,15000);
    return () => { mounted.current = false; invalidate(); for (const c of active) c.abort(); clearInterval(timer); window.removeEventListener('focus',recheck); };
  }, [refresh, invalidate]);
  async function open(resultId: string, visitId?: string, suggestionId?: string) {
    if (disabled || flight.current || state !== 'ready' || resultId !== result.id) return;
    flight.current = true; setOpening(true); const token = ++sequence.current, controller = new AbortController(); controllers.current.add(controller);
    try {
      const response = await fetch('/api/chat/calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ workspaceId, turnId, resultId, ...(visitId ? { visitId } : {}), ...(suggestionId ? { suggestionId } : {}) }) });
      if (!response.ok) throw Error(); const value = await response.json();
      if (typeof value.href !== 'string') throw Error(); const url = new URL(value.href, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname !== '/calendar' || url.searchParams.get('workspace') !== workspaceId || (url.searchParams.get('visit') ?? undefined) !== visitId) throw Error();
      if (current?.mode === 'availability') {
        const suggestion = suggestionId ? current.suggestions.find(s => s.id === suggestionId) : undefined;
        if (suggestionId && !suggestion) throw Error();
        const person = current.scope === 'own' ? 'me' : suggestion ? `member:${suggestion.person.id}` : current.people.length === 1 ? `member:${current.people[0].id}` : 'all';
        if (url.searchParams.get('date') !== (suggestion?.date ?? current.from) || url.searchParams.get('person') !== person || url.searchParams.get('recordType') !== 'all' || url.searchParams.get('status') !== 'all' || url.searchParams.get('customerQuery') !== '') throw Error();
      }
      if (mounted.current && token === sequence.current && !latestDisabled.current) onNavigate(url.pathname + url.search);
    } catch { if (mounted.current && token === sequence.current) { setCurrent(undefined); setState('unavailable'); } }
    finally { controllers.current.delete(controller); flight.current = false; if (mounted.current) setOpening(false); }
  }
  if (result.mode === 'availability') return <CalendarAvailabilityCard result={current?.mode === 'availability' ? current : undefined} state={state} disabled={disabled || opening} onOpenDate={(id,suggestionId) => { void open(id,undefined,suggestionId); }} onOpenCalendar={id => { void open(id); }}/>;
  const display: CalendarAssistantResult | undefined = current && current.mode !== 'availability' ? current.mode === 'schedule' ? { ...current, mode: 'schedule', from: current.from!, to: current.to! } : { ...current, mode: 'unscheduled' } : undefined;
  return <CalendarResultsCard result={display} state={state} disabled={disabled || opening} onOpenVisit={(id, visitId) => { void open(id, visitId); }} onOpenCalendar={id => { void open(id); }}/>
}

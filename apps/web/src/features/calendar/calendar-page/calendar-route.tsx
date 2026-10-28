'use client';
import { calendarScheduleChangedEvent } from '../calendar-events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormFeedback } from '@salesmora/ui';
import { calendarQueryFromURL, calendarScheduleSchema, type CalendarResult, type CalendarVisit, type CalendarQueryValue } from '@salesmora/contracts';
import { CalendarPage } from './calendar-page';
import type { CalendarFiltersValue } from '../calendar-filters/calendar-filters';
import type { CalendarScheduleDraft } from '../calendar-schedule-dialog/calendar-schedule-dialog';
import { calendarVisitPeekDrawerData as peekCopy } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer.data';
import { calendarRouteData as copy } from './calendar-route.data';
class RequestError extends Error { constructor(message: string, readonly status: number) { super(message); } }
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const result = await response.json();
  if (!response.ok) throw new RequestError(result.error ?? copy.error, response.status);
  return result as T;
}
function parameters(query: CalendarQueryValue) {
  return new URLSearchParams({ workspace: query.workspaceId, date: query.date ?? '', view: 'week', person: query.person,
    recordType: query.recordType, status: query.status, customerQuery: query.customerQuery, queuePage: String(query.queuePage) });
}
export function CalendarRoute({ initial, initialVisit }: { initial: CalendarResult; initialVisit?: CalendarVisit }) {
  const router = useRouter(), search = useSearchParams(), workspaceId = initial.query.workspaceId;
  const [list, setList] = useState(initial), [loadedKey, setLoadedKey] = useState(parameters(initial.query).toString()), [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [pending, setPending] = useState(false), [conflict, setConflict] = useState(false);
  const [overlay, setOverlay] = useState<{ kind: 'schedule'; visitId?: string; date?: string } | undefined>();
  const [detail, setDetail] = useState(initialVisit), [peekState, setPeekState] = useState<'ready' | 'loading' | 'error'>('ready');
  const [extras, setExtras] = useState<CalendarVisit[]>([]), [draft, setDraft] = useState<CalendarScheduleDraft>();
  const [advisories, setAdvisories] = useState<CalendarScheduleDraft & { messages: string[] }>();
  const flight = useRef(false), opening = useRef(false), sequence = useRef(0), receipt = useRef<{ payload: string; id: string }>(undefined);
  const readyKey = useRef(parameters(initial.query).toString());
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const raw = search.toString();
  const query = useMemo(() => { try { return calendarQueryFromURL(workspaceId, new URLSearchParams(raw)); } catch { return initial.query; } }, [raw, workspaceId, initial.query]);
  const queryKey = parameters(query).toString(), current = useRef(queryKey);
  const workspaceAssistant = useWorkspaceAssistant(),setAssistantContext = workspaceAssistant?.setPageContext;
  const assistantReturnFocus = useRef<HTMLDivElement>(null);
  const [assistantSelection,setAssistantSelection] = useState<{ key:string;queryKey:string;list:CalendarResult;visit:CalendarVisit }>();
  useEffect(() => {
    if (state !== 'ready' || loadedKey !== queryKey) { setAssistantContext?.(undefined); return; }
    const calendarFilters = { date: list.weekDate, person: list.scope === 'own' ? 'me' : list.query.person, recordType: list.query.recordType, status: list.query.status, customerQuery: list.query.customerQuery };
    const selection = assistantSelection?.queryKey === queryKey && assistantSelection.list === list ? assistantSelection : undefined;
    setAssistantContext?.({ key: selection ? `calendar:${workspaceId}:${queryKey}:${selection.key}` : `calendar:${workspaceId}:${queryKey}`,
      label: selection ? peekCopy.assistantContext(selection.visit.records.map(record => record.number)) : copy.assistantContext(list.weekDate,list.scope === 'own'),calendarFilters,
      ...(selection ? { calendarVisit:{ id:selection.visit.id,revision:selection.visit.revision } } : {}) });
    return () => setAssistantContext?.(undefined);
  }, [setAssistantContext, state, loadedKey, queryKey, workspaceId, list.weekDate, list.scope, list.query, list, assistantSelection]);
  const visitId = search.get('visit');
  const targets = [...new Map([...list.unscheduled, ...list.entries, ...extras].map(v => [v.id, v])).values()].sort((a, b) => Number(!a.canReschedule) - Number(!b.canReschedule));
  const filters: CalendarFiltersValue = { person: list.scope === 'own' ? 'me' : query.person as CalendarFiltersValue['person'], recordType: query.recordType, status: query.status, customerQuery: query.customerQuery };
  function navigate(next: CalendarQueryValue, replace = false, visit?: string | null) {
    const params = parameters(next); if (visit) params.set('visit', visit);
    window.history[replace ? 'replaceState' : 'pushState'](null, '', '/calendar?' + params.toString());
  }
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const key = current.current, n = ++sequence.current;
    let result: CalendarResult;
    try { result = await request<CalendarResult>('/api/calendar?' + key, { signal }); }
    catch (error) { if (n !== sequence.current || current.current !== key || signal?.aborted) throw new DOMException('Superseded Calendar request.', 'AbortError'); throw error; }
    if (mounted.current && current.current === key && n === sequence.current && !signal?.aborted) {
      const canonical = parameters(result.query);
      readyKey.current = canonical.toString(); setList(result); setLoadedKey(readyKey.current); setState('ready');
      if (readyKey.current !== key) { const selected = new URL(window.location.href).searchParams.get('visit'); if (selected) canonical.set('visit', selected); window.history.replaceState(null, '', '/calendar?' + canonical.toString()); }
    }
    return result;
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const reload = () => { void refresh(controller.signal).catch(() => { if (!controller.signal.aborted) { setState('error');setError(copy.error); } }); };
    window.addEventListener(calendarScheduleChangedEvent,reload);
    return () => { controller.abort();window.removeEventListener(calendarScheduleChangedEvent,reload); };
  },[refresh]);
  useEffect(() => {
    const controller = new AbortController();
    // Hide previous query counts/rows immediately; stale responses never repopulate a different view.
    current.current = queryKey; sequence.current++;
    if (readyKey.current === queryKey) return () => controller.abort();
    const timer = setTimeout(() => { setState('loading'); setError(''); void refresh(controller.signal).catch(e => {
      if (!controller.signal.aborted && mounted.current && !(e instanceof DOMException && e.name === 'AbortError')) { setState('error'); setError(e instanceof Error ? e.message : copy.error); }
    }); }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [queryKey, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    if (!visitId) return () => controller.abort();
    void request<CalendarVisit>(`/api/calendar/${encodeURIComponent(visitId)}?workspace=${encodeURIComponent(workspaceId)}`, { signal: controller.signal })
      .then(visit => { if (!controller.signal.aborted) { setDetail(visit); setPeekState('ready'); } })
      .catch(() => { if (!controller.signal.aborted) setPeekState('error'); });
    return () => controller.abort();
  }, [visitId, workspaceId]);
  const onDraftChange = useCallback((next: CalendarScheduleDraft) => setDraft(old => JSON.stringify(old) === JSON.stringify(next) ? old : next), []);
  useEffect(() => {
    const controller = new AbortController();
    if (!draft || overlay?.kind !== 'schedule' || !calendarScheduleSchema.safeParse({ scheduledDate: draft.scheduledDate, arrivalWindow: draft.arrivalWindow }).success) return () => controller.abort();
    const timer = setTimeout(() => { void request<{ messages: string[] }>('/api/calendar/advisories', { method: 'POST', signal: controller.signal,
      body: JSON.stringify({ workspaceId, visitId: draft.visitId, revision: draft.revision, schedule: { scheduledDate: draft.scheduledDate, arrivalWindow: draft.arrivalWindow } }) })
      .then(result => { if (!controller.signal.aborted) setAdvisories({ ...draft, messages: result.messages }); })
      .catch(() => { if (!controller.signal.aborted) setAdvisories({ ...draft, messages: [copy.warningsUnavailable] }); }); }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [draft, workspaceId, overlay?.kind]);
  function close() { if (flight.current) return; setOverlay(undefined); setError(''); setConflict(false); receipt.current = undefined;
    if (visitId) navigate(query, true); }
  async function retry() { setError(''); setState('loading'); try { await refresh(); } catch (e) { setState('error'); setError(e instanceof Error ? e.message : copy.error); } }
  async function openSchedule(value: { visitId?: string; date?: string }) {
    if (flight.current || opening.current) return;
    opening.current = true; setError(''); setConflict(false); receipt.current = undefined; setState('loading');
    if (visitId) navigate(query, true);
    setOverlay(undefined);
    try {
      await refresh();
      const selected = value.visitId ? await request<CalendarVisit>(`/api/calendar/${value.visitId}?workspace=${encodeURIComponent(workspaceId)}`) : undefined;
      if (!mounted.current) return;
      setExtras(selected ? [selected] : []); setDraft(undefined); setAdvisories(undefined); setOverlay({ kind: 'schedule', ...value });
    } catch (e) { if (mounted.current) { setState('error'); setError(e instanceof Error ? e.message : copy.error); } }
    finally { opening.current = false; }
  }
  async function reloadReview() {
    const id = draft?.visitId ?? overlay?.visitId;
    setError(''); setConflict(false); receipt.current = undefined;
    try {
      await refresh();
      if (id) { const visit = await request<CalendarVisit>(`/api/calendar/${id}?workspace=${encodeURIComponent(workspaceId)}`); setExtras([visit]); }
    } catch (e) { setError(e instanceof Error ? e.message : copy.error); setConflict(true); }
  }
  async function confirm(value: CalendarScheduleDraft) {
    if (flight.current) throw new Error(copy.unavailable);
    const target = targets.find(v => v.id === value.visitId && v.revision === value.revision);
    if (!target?.canReschedule || !target.review) throw new Error(copy.unavailable);
    const payload = JSON.stringify({ workspaceId, visitId: target.id, ...target.review, schedule: { scheduledDate: value.scheduledDate, arrivalWindow: value.arrivalWindow } });
    if (receipt.current?.payload !== payload) receipt.current = { payload, id: crypto.randomUUID() };
    flight.current = true; setPending(true); setError(''); let saved = false;
    try {
      await request(`/api/calendar/${target.id}`, { method: 'PATCH', body: JSON.stringify({ ...JSON.parse(payload), submissionId: receipt.current.id }) });
      saved = true; receipt.current = undefined; setOverlay(undefined); setExtras([]); setNotice(copy.saved); setConflict(false);
      await refresh();
    } catch (e) {
      if (!mounted.current) throw e;
      if (saved) { setError(copy.savedReload); setState('error'); return; }
      setError(e instanceof Error ? e.message : copy.error); setConflict(e instanceof RequestError && e.status === 409); throw e;
    } finally { flight.current = false; if (mounted.current) setPending(false); }
  }
  return <div ref={assistantReturnFocus} tabIndex={-1} className="min-w-0 focus-visible:focus-ring">
    {error && overlay?.kind !== 'schedule' && <div className="mb-4"><FormFeedback kind="error" title={copy.errorTitle} message={error}/></div>}
    <CalendarPage weekDate={list.weekDate} today={list.today} timezone={list.timezone} filters={filters} members={list.members} viewerId={list.viewerId} scope={list.scope}
      entries={list.entries} unscheduled={list.unscheduled} unscheduledTotal={list.unscheduledTotal} workload={list.entries} canSchedule={list.canSchedule} state={state === 'error' ? 'error' : loadedKey !== queryKey ? 'loading' : state} notice={notice}
      onNavigate={date => { close(); navigate({ ...query, date }); }} onFilters={value => navigate({ ...query, ...value, queuePage: 1 }, value.customerQuery !== query.customerQuery)}
      onOpenVisit={id => navigate(query, false, id)} onSchedule={value => { void openSchedule(value); }} onRetry={() => void retry()}
      queuePagination={{ page: list.query.queuePage, total: list.unscheduledTotal, onPage: queuePage => navigate({ ...query, queuePage }) }}
      peek={visitId ? { open: true, visit: detail?.id === visitId ? detail : null, state: detail?.id === visitId ? peekState : peekState === 'error' ? 'error' : 'loading', onClose: close,
        onRetry: () => { const id = visitId; if (id) { setPeekState('loading'); void request<CalendarVisit>(`/api/calendar/${id}?workspace=${encodeURIComponent(workspaceId)}`).then(v => { setDetail(v); setPeekState('ready'); }).catch(() => setPeekState('error')); } },
        assistantDisabled:workspaceAssistant?.status !== 'ready' || state !== 'ready' || loadedKey !== queryKey || peekState !== 'ready' || detail?.id !== visitId,
        onAskAssistant:workspaceAssistant && workspaceAssistant.status !== 'unavailable' ? id => {
          if (workspaceAssistant.status !== 'ready' || state !== 'ready' || loadedKey !== queryKey || peekState !== 'ready' || detail?.id !== id || visitId !== id || flight.current) return;
          setAssistantSelection({ key:crypto.randomUUID(),queryKey,list,visit:detail });
          close();workspaceAssistant.prepare('',assistantReturnFocus.current);
        } : undefined,
        onOpenRecord: record => router.push(`/${record.type === 'job' ? 'jobs' : 'work-orders'}/${record.id}?workspace=${encodeURIComponent(workspaceId)}`) } : undefined}
      schedule={overlay?.kind === 'schedule' ? { open: true, targets, initialVisitId: overlay.visitId, initialDate: overlay.date, today: list.today,
        pending, error, conflict, onClose: close, onReload: () => void reloadReview(), onDraftChange, advisories, onConfirm: confirm } : undefined}/>
  </div>;
}

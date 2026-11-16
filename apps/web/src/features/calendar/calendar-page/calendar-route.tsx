'use client';
import { calendarScheduleChangedEvent } from '../calendar-events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { useApiMutation } from '../../api/use-api-mutation';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { apiRequest, ApiRequestError } from '../../api/api-request';
import { calendarResultSchema, calendarVisitSchema, calendarAdvisoryResultSchema, calendarSavedResultSchema } from '@salesmora/contracts';
import { isApiAccessError } from '../../api/api-query';
import { FormFeedback } from '@salesmora/ui';
import { calendarQueryFromURL, calendarScheduleSchema, type CalendarResult, type CalendarVisit, type CalendarQueryValue } from '@salesmora/contracts';
import { CalendarPage } from './calendar-page';
import type { CalendarFiltersValue } from '../calendar-filters/calendar-filters';
import type { CalendarScheduleDraft } from '../calendar-schedule-dialog/calendar-schedule-dialog';
import { calendarVisitPeekDrawerData as peekCopy } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer.data';
import { calendarRouteData as copy } from './calendar-route.data';
function parameters(query: CalendarQueryValue) {
  return new URLSearchParams({ workspace: query.workspaceId, date: query.date ?? '', view: 'week', person: query.person,
    recordType: query.recordType, status: query.status, customerQuery: query.customerQuery, queuePage: String(query.queuePage) });
}
export interface CalendarRouteProps { initial: CalendarResult; initialVisit?: CalendarVisit; initialUpdatedAt: number }
export function CalendarRoute(props: CalendarRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.initial.viewerId, workspaceId: props.initial.query.workspaceId }}>
    <CalendarContent key={`${props.initial.viewerId}:${props.initial.query.workspaceId}`} {...props} />
  </ApiQueryScopeBoundary>;
}
function CalendarContent({ initial, initialVisit, initialUpdatedAt }: CalendarRouteProps) {
  const router = useRouter(), search = useSearchParams(), workspaceId = initial.query.workspaceId;
  const client = useQueryClient(), scope = { viewerId: initial.viewerId, workspaceId };
  const [reviewLoading, setReviewLoading] = useState(false), [blocked, setBlocked] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [pending, setPending] = useState(false), [conflict, setConflict] = useState(false);
  const [overlay, setOverlay] = useState<{ kind: 'schedule'; visitId?: string; date?: string } | undefined>();
  const [extras, setExtras] = useState<CalendarVisit[]>([]), [draft, setDraft] = useState<CalendarScheduleDraft>();
  const [advisories, setAdvisories] = useState<CalendarScheduleDraft & { messages: string[] }>();
  const flight = useRef(false), opening = useRef(false), sequence = useRef(0), receipt = useRef<{ payload: string; id: string }>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const raw = search.toString();
  const parsedQuery = useMemo(() => {
    try { return { query: calendarQueryFromURL(workspaceId, new URLSearchParams(raw)), error: false }; }
    catch { return { query: initial.query, error: true }; }
  }, [raw, workspaceId, initial.query]);
  const query = parsedQuery.query;
  const queryKey = parameters(query).toString(), current = useRef(queryKey);
  useEffect(() => { current.current = queryKey; sequence.current++; }, [queryKey]);
  const listOptions = apiReadOptions(scope, 'calendar', query, '/api/calendar?' + queryKey, raw => calendarResultSchema.parse(raw), copy.error);
  const listQuery = useApiQuery({ ...listOptions, enabled: !parsedQuery.error,
    initialData: queryKey === parameters(initial.query).toString() ? initial : undefined, initialDataUpdatedAt: initialUpdatedAt });
  const list = listQuery.data ?? initial;
  const loadedKey = listQuery.data ? queryKey : '';
  const state = parsedQuery.error || listQuery.isError ? 'error' : listQuery.isPending || reviewLoading ? 'loading' : 'ready';
  const visitId = search.get('visit');
  const visitOptions = (id: string) => apiReadOptions(scope, 'calendar-visit', { id },
    `/api/calendar/${encodeURIComponent(id)}?workspace=${encodeURIComponent(workspaceId)}`, raw => calendarVisitSchema.parse(raw), copy.unavailable);
  const detailQuery = useApiQuery({ ...visitOptions(visitId ?? ''), enabled: !!visitId && !parsedQuery.error,
    initialData: visitId === initialVisit?.id ? initialVisit : undefined, initialDataUpdatedAt: initialUpdatedAt });
  const detail = detailQuery.isError ? undefined : detailQuery.data;
  const peekState = detailQuery.isError ? 'error' : detailQuery.isPending ? 'loading' : 'ready';
  const scheduleMutation = useApiMutation('calendar', raw => calendarSavedResultSchema.parse(raw), copy.error);
  const workspaceAssistant = useWorkspaceAssistant(),setAssistantContext = workspaceAssistant?.setPageContext;
  const assistantReturnFocus = useRef<HTMLDivElement>(null);
  const [assistantSelection,setAssistantSelection] = useState<{ key:string;queryKey:string;list:CalendarResult;visit:CalendarVisit }>();
  useEffect(() => {
    if (blocked || state !== 'ready' || loadedKey !== queryKey) { setAssistantContext?.(undefined); return; }
    const calendarFilters = { date: list.weekDate, person: list.scope === 'own' ? 'me' : list.query.person, recordType: list.query.recordType, status: list.query.status, customerQuery: list.query.customerQuery };
    const selection = assistantSelection?.queryKey === queryKey && assistantSelection.list === list ? assistantSelection : undefined;
    setAssistantContext?.({ key: selection ? `calendar:${workspaceId}:${queryKey}:${selection.key}` : `calendar:${workspaceId}:${queryKey}`,
      label: selection ? peekCopy.assistantContext(selection.visit.records.map(record => record.number)) : copy.assistantContext(list.weekDate,list.scope === 'own'),calendarFilters,
      ...(selection ? { calendarVisit:{ id:selection.visit.id,revision:selection.visit.revision } } : {}) });
    return () => setAssistantContext?.(undefined);
  }, [setAssistantContext, blocked, state, loadedKey, queryKey, workspaceId, list.weekDate, list.scope, list.query, list, assistantSelection]);
  const targets = [...new Map([...list.unscheduled, ...list.entries, ...extras].map(v => [v.id, v])).values()].sort((a, b) => Number(!a.canReschedule) - Number(!b.canReschedule));
  const filters: CalendarFiltersValue = { person: list.scope === 'own' ? 'me' : query.person as CalendarFiltersValue['person'], recordType: query.recordType, status: query.status, customerQuery: query.customerQuery };
  function navigate(next: CalendarQueryValue, replace = false, visit?: string | null) {
    const params = parameters(next); if (visit) params.set('visit', visit);
    window.history[replace ? 'replaceState' : 'pushState'](null, '', '/calendar?' + params.toString());
  }
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const key = current.current, n = ++sequence.current;
    let result: CalendarResult;
    try {
      const options = apiReadOptions({ viewerId: initial.viewerId, workspaceId }, 'calendar', calendarQueryFromURL(workspaceId, new URLSearchParams(key)), '/api/calendar?' + key, raw => calendarResultSchema.parse(raw), copy.error);
      await client.invalidateQueries({ queryKey: options.queryKey, refetchType: 'none' });
      result = await client.fetchQuery(options);
    }
    catch (error) { if (n !== sequence.current || current.current !== key || signal?.aborted) throw new DOMException('Superseded Calendar request.', 'AbortError'); throw error; }
    if (mounted.current && current.current === key && n === sequence.current && !signal?.aborted) {
      const canonical = parameters(result.query);
      if (canonical.toString() !== key) { const selected = new URL(window.location.href).searchParams.get('visit'); if (selected) canonical.set('visit', selected); window.history.replaceState(null, '', '/calendar?' + canonical.toString()); }
    }
    return result;
  }, [client, initial.viewerId, workspaceId]);
  useEffect(() => {
    const controller = new AbortController();
    const reload = () => { void invalidateWorkspaceResources(client, workspaceId, ['calendar', 'calendar-visit', 'calendar-advisories', 'jobs', 'job-detail', 'home', 'reports']).catch(() => { if (!controller.signal.aborted) setError(copy.error); }); };
    window.addEventListener(calendarScheduleChangedEvent,reload);
    return () => { controller.abort();window.removeEventListener(calendarScheduleChangedEvent,reload); };
  },[client, workspaceId]);
  useEffect(() => {
    if (!listQuery.data) return;
    const canonical = parameters(listQuery.data.query);
    if (canonical.toString() !== queryKey) {
      if (visitId) canonical.set('visit', visitId);
      client.setQueryData(apiReadOptions({ viewerId: initial.viewerId, workspaceId }, 'calendar', listQuery.data.query, '', raw => calendarResultSchema.parse(raw), copy.error).queryKey, listQuery.data, { updatedAt: listQuery.dataUpdatedAt });
      window.history.replaceState(null, '', '/calendar?' + canonical.toString());
    }
  }, [client, workspaceId, initial.viewerId, listQuery.data, listQuery.dataUpdatedAt, queryKey, visitId]);
  useEffect(() => {
    if (isApiAccessError(listQuery.error) || isApiAccessError(detailQuery.error)) router.refresh();
  }, [listQuery.error, detailQuery.error, router]);
  const onDraftChange = useCallback((next: CalendarScheduleDraft) => setDraft(old => JSON.stringify(old) === JSON.stringify(next) ? old : next), [setDraft]);
  useEffect(() => {
    const controller = new AbortController();
    if (!draft || overlay?.kind !== 'schedule' || !calendarScheduleSchema.safeParse({ scheduledDate: draft.scheduledDate, arrivalWindow: draft.arrivalWindow }).success) return () => controller.abort();
    const body = { workspaceId, visitId: draft.visitId, revision: draft.revision, schedule: { scheduledDate: draft.scheduledDate, arrivalWindow: draft.arrivalWindow } };
    const timer = setTimeout(() => { void client.fetchQuery({
      queryKey: apiReadOptions({ viewerId: initial.viewerId, workspaceId }, 'calendar-advisories', body, '', raw => calendarAdvisoryResultSchema.parse(raw), copy.warningsUnavailable).queryKey,
      queryFn: ({ signal }) => apiRequest('/api/calendar/advisories', { method: 'POST', signal, body, parse: raw => calendarAdvisoryResultSchema.parse(raw), failureMessage: copy.warningsUnavailable }),
    })
      .then(result => { if (!controller.signal.aborted) setAdvisories({ ...draft, messages: result.messages }); })
      .catch(() => { if (!controller.signal.aborted) setAdvisories({ ...draft, messages: [copy.warningsUnavailable] }); }); }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [draft, workspaceId, initial.viewerId, overlay?.kind, client]);
  async function freshVisit(id: string) {
    const options = visitOptions(id);
    await client.invalidateQueries({ queryKey: options.queryKey, refetchType: 'none' });
    return client.fetchQuery(options);
  }
  function close() { if (flight.current) return; setOverlay(undefined); setError(''); setConflict(false); receipt.current = undefined;
    if (visitId) navigate(query, true); }
  async function retry() { setError(''); try { await refresh(); } catch (e) { setError(e instanceof Error ? e.message : copy.error); } }
  async function openSchedule(value: { visitId?: string; date?: string }) {
    if (flight.current || opening.current) return;
    opening.current = true; setError(''); setConflict(false); receipt.current = undefined; setReviewLoading(true);
    if (visitId) navigate(query, true);
    setOverlay(undefined);
    try {
      await refresh();
      const selected = value.visitId ? await freshVisit(value.visitId) : undefined;
      if (!mounted.current) return;
      setExtras(selected ? [selected] : []); setDraft(undefined); setAdvisories(undefined); setOverlay({ kind: 'schedule', ...value });
    } catch (e) { if (mounted.current) { if (isApiAccessError(e)) { setBlocked(true); router.refresh(); } setError(e instanceof Error ? e.message : copy.error); } }
    finally { opening.current = false; if (mounted.current) setReviewLoading(false); }
  }
  async function reloadReview() {
    const id = draft?.visitId ?? overlay?.visitId;
    setError(''); setConflict(false); receipt.current = undefined;
    try {
      await refresh();
      if (id) { const visit = await freshVisit(id); setExtras([visit]); }
    } catch (e) { if (isApiAccessError(e)) { setBlocked(true); router.refresh(); } setError(e instanceof Error ? e.message : copy.error); setConflict(true); }
  }
  async function confirm(value: CalendarScheduleDraft) {
    if (flight.current) throw new Error(copy.unavailable);
    const target = targets.find(v => v.id === value.visitId && v.revision === value.revision);
    if (!target?.canReschedule || !target.review) throw new Error(copy.unavailable);
    const payload = JSON.stringify({ workspaceId, visitId: target.id, ...target.review, schedule: { scheduledDate: value.scheduledDate, arrivalWindow: value.arrivalWindow } });
    if (receipt.current?.payload !== payload) receipt.current = { payload, id: crypto.randomUUID() };
    flight.current = true; setPending(true); setError(''); let saved = false;
    try {
      await scheduleMutation.mutateAsync({ path: `/api/calendar/${target.id}`, method: 'PATCH', body: { ...JSON.parse(payload), submissionId: receipt.current.id } });
      saved = true; receipt.current = undefined; setOverlay(undefined); setExtras([]); setNotice(copy.saved); setConflict(false);
      await invalidateWorkspaceResources(client, workspaceId, ['calendar', 'calendar-visit', 'calendar-advisories', 'jobs', 'job-detail', 'work-orders', 'home', 'reports']);
    } catch (e) {
      if (!mounted.current) throw e;
      if (isApiAccessError(e)) { setBlocked(true); router.refresh(); }
      if (saved) { setError(copy.savedReload); return; }
      setError(e instanceof Error ? e.message : copy.error); setConflict(e instanceof ApiRequestError && e.status === 409); throw e;
    } finally { flight.current = false; if (mounted.current) setPending(false); }
  }
  if (blocked || isApiAccessError(listQuery.error) || isApiAccessError(detailQuery.error)) return <FormFeedback kind="error" message={copy.unavailable}/>;
  return <div ref={assistantReturnFocus} tabIndex={-1} className="min-w-0 focus-visible:focus-ring">
    {error && overlay?.kind !== 'schedule' && <div className="mb-4"><FormFeedback kind="error" title={copy.errorTitle} message={error}/></div>}
    <CalendarPage weekDate={list.weekDate} today={list.today} timezone={list.timezone} filters={filters} members={list.members} viewerId={list.viewerId} scope={list.scope}
      entries={list.entries} unscheduled={list.unscheduled} unscheduledTotal={list.unscheduledTotal} workload={list.entries} canSchedule={list.canSchedule} state={state === 'error' ? 'error' : loadedKey !== queryKey ? 'loading' : state} notice={notice}
      onNavigate={date => { close(); navigate({ ...query, date }); }} onFilters={value => navigate({ ...query, ...value, queuePage: 1 }, value.customerQuery !== query.customerQuery)}
      onOpenVisit={id => navigate(query, false, id)} onSchedule={value => { void openSchedule(value); }} onRetry={() => void retry()}
      queuePagination={{ page: list.query.queuePage, total: list.unscheduledTotal, onPage: queuePage => navigate({ ...query, queuePage }) }}
      peek={visitId ? { open: true, visit: detail?.id === visitId ? detail : null, state: detail?.id === visitId ? peekState : peekState === 'error' ? 'error' : 'loading', onClose: close,
        onRetry: () => { void detailQuery.refetch({ throwOnError: true }).catch(() => setError(copy.unavailable)); },
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

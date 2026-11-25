'use client';
import {WorkspaceServiceField} from '../../services/service-picker/workspace-service-field';
import { RelatedCustomerContact } from '../../customers/customer-contact-card/customer-contact-card';
import { RelatedEstimates } from '../../estimates/related-estimates-card/related-estimates';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { apiQueryKeys, isApiAccessError } from '../../api/api-query';
import { ApiRequestError } from '../../api/api-request';
import { leadListOptions, leadDetailOptions, leadNotesOptions, mergeLeadColumn, mergeLeadActivity, invalidateLeadQueries } from './lead-queries';
import { useLeadMutation } from './use-lead-mutation';
import { leadVersionSavedSchema, leadArchiveSavedSchema, leadDeletedSchema, leadNoteSavedSchema, leadDetailResultSchema } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { leadQueryFromURL, leadQueryToURL, leadAssignedActivitySchema, leadCreatedActivitySchema, leadStageActivitySchema, leadNoteActivitySchema, leadEditedActivitySchema, leadEditConflictSchema, leadExportPreviewSchema, type LeadDetailResult, type LeadListQuery, type LeadListResult, type LeadReadRecord } from '@salesmora/contracts';
import { leadAssistantContext } from './lead-assistant-context';
import { LeadsPage, type LeadPageRecord, type LeadsPageProps } from './leads-page';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import type { LeadEditFormProps } from '../lead-edit-form/lead-edit-form';
import type { LeadNotesProps } from '../lead-notes/lead-notes';
import type { MoveStageRequest } from '../move-stage-dialog/move-stage-dialog';
import type { LeadsToolbarValues } from '../leads-toolbar/leads-toolbar';
import type { LeadActivityEvent } from '../lead-activity-timeline/lead-activity-timeline';
import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';
import { leadsReadRouteData as copy } from './leads-read-route.data';

const valuesFor = (q: LeadListQuery): LeadsToolbarValues => ({ query: q.q, stages: q.stages, sources: q.sources, ownerIds: q.ownerIds, created: q.created, from: q.from ?? '', to: q.to ?? '', attention: q.attention, archived: q.archived, view: q.view });
function pageRecord(lead: LeadReadRecord, detail?: LeadDetailResult): LeadPageRecord {
  const events: LeadActivityEvent[] = [];
  for (const row of detail?.activity ?? []) {
    if (row.type === 'archived' || row.type === 'restored') events.push({id:row.id,kind:row.type,actorName:row.actorName ?? copy.system,createdAt:row.createdAt,viaAssistant:row.actorType === 'assistant-confirmed'});
    const assigned = leadAssignedActivitySchema.safeParse(row.changes);
    if (row.type === 'assigned' && assigned.success) events.push({ id: row.id, kind: 'assigned', from: assigned.data.from ? { name: assigned.data.from } : null, to: assigned.data.to ? { name: assigned.data.to } : null, actorName: row.actorName ?? copy.system, createdAt: row.createdAt, viaAssistant: row.actorType === 'assistant-confirmed' });
    const created = leadCreatedActivitySchema.safeParse(row.changes);
    const stage = leadStageActivitySchema.safeParse(row.changes);
    const note = leadNoteActivitySchema.safeParse(row.changes);
    const edited = leadEditedActivitySchema.safeParse(row.changes);
    if (row.type === 'edited' && edited.success) events.push({ id: row.id, kind: 'edited', changes: edited.data.fields, actorName: row.actorName ?? copy.system, createdAt: row.createdAt, viaAssistant: row.actorType === 'assistant-confirmed' });
    if (row.type === 'note' && note.success) events.push({ id: row.id, kind: 'note', body: note.data.body, actorName: row.actorName ?? copy.system, createdAt: row.createdAt, viaAssistant: row.actorType === 'assistant-confirmed' });
    if (row.type === 'stage' && stage.success) events.push({ id: row.id, kind: 'stage', ...stage.data, actorName: row.actorName ?? copy.system, createdAt: row.createdAt, viaAssistant: row.actorType === 'assistant-confirmed' });
    if (row.type === 'created' && created.success) events.push({ id: row.id, kind: 'created', source: created.data.source, actorName: row.actorName ?? copy.system, createdAt: row.createdAt, viaAssistant: row.actorType === 'assistant-confirmed' });
  }
  return { ...lead, owner: lead.owner ? { ...lead.owner, name: lead.owner.former ? copy.former : lead.owner.name } : null, canMove: lead.canMove, nextStep: null, teamNotes: detail?.teamNotes.map(note => ({ ...note, authorName: note.authorName || copy.system })) ?? [], events };
}
const unavailable = async () => { throw new Error(copy.notAvailable); };
export interface LeadsReadRouteProps {
  workspaceId: string; viewerId: string; initial: LeadListResult; initialDetail?: LeadDetailResult; initialQuery: LeadListQuery; initialUpdatedAt: number;
}
export function LeadsReadRoute(props: LeadsReadRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <LeadsReadContent key={`${props.viewerId}-${props.workspaceId}-${props.initialDetail?.lead.id ?? 'list'}`} {...props} />
  </ApiQueryScopeBoundary>;
}
function LeadsReadContent({ workspaceId, viewerId, initial, initialDetail, initialQuery, initialUpdatedAt }: LeadsReadRouteProps) {
  const assistant = useWorkspaceAssistant(), prepareRef = useRef<HTMLButtonElement>(null);
  const router = useRouter(), params = useSearchParams(), rawURL = params.toString();
  const query = useMemo(() => ({ ...leadQueryFromURL(workspaceId, new URLSearchParams(rawURL)), column: undefined, columnPage: 1 }), [workspaceId, rawURL]);
  const client = useQueryClient();
  const scope = useMemo(() => ({ viewerId, workspaceId }), [viewerId, workspaceId]);
  const listOptions = useMemo(() => leadListOptions(scope, query), [scope, query]);
  const detailOptions = useMemo(() => leadDetailOptions(scope, initialDetail?.lead.id ?? ''), [scope, initialDetail?.lead.id]);
  const initialListOptions = useMemo(() => leadListOptions(scope, initialQuery), [scope, initialQuery]);
  const [quickSelection, setQuickSelection] = useState<{ url: string; id: string | null }>({ url: rawURL, id: null });
  const quickId = quickSelection.url === rawURL ? quickSelection.id : null;
  const setQuickId = useCallback((id: string | null) => setQuickSelection({ url: rawURL, id }), [rawURL]);
  const listQuery = useApiQuery({
    ...listOptions, enabled: !initialDetail,
    initialData: !initialDetail && JSON.stringify(query) === JSON.stringify(initialQuery) ? initial : undefined,
    initialDataUpdatedAt: initialUpdatedAt,
    refetchInterval: query => query.state.data?.scope === 'assigned' ? 15_000 : false,
  });
  const detailQuery = useApiQuery({
    ...detailOptions, enabled: !!initialDetail, initialData: initialDetail, initialDataUpdatedAt: initialUpdatedAt,
    refetchInterval: query => query.state.data?.scope === 'assigned' ? 15_000 : false,
  });
  const quickQuery = useApiQuery({
    ...leadDetailOptions(scope, quickId ?? ''), enabled: !!quickId,
    refetchInterval: query => query.state.data?.scope === 'assigned' ? 15_000 : false,
  });
  const currentQuery = initialDetail ? detailQuery : listQuery;
  const state = currentQuery.isError ? 'error' : currentQuery.isPending ? 'loading' : 'ready';
  const result = listQuery.data ?? initial;
  const detail = detailQuery.isError ? undefined : detailQuery.data;
  const quick = quickQuery.isError || state !== 'ready' ? undefined : quickQuery.data;
  const recordLoading = !!quickId && quickQuery.isPending;
  const setResult = useCallback((update: (old: LeadListResult) => LeadListResult) => {
    client.setQueryData(listOptions.queryKey, old => old ? update(old) : old);
  }, [client, listOptions]);
  const setDetail = useCallback((update: LeadDetailResult | ((old: LeadDetailResult | undefined) => LeadDetailResult | undefined)) => {
    client.setQueryData(detailOptions.queryKey, update);
  }, [client, detailOptions]);
  const [draft, setDraft] = useState({ url: rawURL, values: valuesFor(initialQuery) });
  const [feedback, setFeedback] = useState<string>();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const viewGeneration = useRef(0);
  const active = useRef(true);
  const columnRequests = useRef(new Set<string>());
  const [columnState, setColumnState] = useState<{ url: string; stages: readonly string[] }>({ url: rawURL, stages: [] });
  const columnsBusy = columnState.url === rawURL ? columnState.stages : [];
  const setColumnsBusy = useCallback((update: readonly string[] | ((old: readonly string[]) => readonly string[])) => {
    setColumnState(old => ({ url: rawURL, stages: typeof update === 'function' ? update(old.url === rawURL ? old.stages : []) : update }));
  }, [rawURL]);
  const [activityBusy, setActivityBusy] = useState(false);
  const deleteAttempt = useRef<{fingerprint:string;submissionId:string}|undefined>(undefined);
  const archiveAttempt = useRef<{fingerprint:string;submissionId:string}|undefined>(undefined);
  const assignAttempt = useRef<{ fingerprint: string; submissionId: string } | undefined>(undefined);
  const editAttempt = useRef<{ fingerprint: string; submissionId: string } | undefined>(undefined);
  const activityPage = useRef(1), notesPage = useRef(1), notesGeneration = useRef(0);
  const [notesBusy, setNotesBusy] = useState(false);
  const stageMutation = useLeadMutation(raw => leadVersionSavedSchema.parse(raw), copy.moveUnconfirmed);
  const archiveMutation = useLeadMutation(raw => leadArchiveSavedSchema.parse(raw), copy.archiveUnconfirmed);
  const assignMutation = useLeadMutation(raw => leadVersionSavedSchema.parse(raw), copy.assignUnconfirmed);
  const deleteMutation = useLeadMutation(raw => leadDeletedSchema.parse(raw), copy.deleteUnconfirmed);
  const noteMutation = useLeadMutation(raw => leadNoteSavedSchema.parse(raw), copy.noteSavedReload);
  const editMutation = useLeadMutation(raw => leadDetailResultSchema.parse(raw), copy.editUnconfirmed);
  const [estimateCreation, setEstimateCreation] = useState({ id: '', version: 0, allowed: false });
  const estimateLeadId = detail?.lead.id, estimateLeadVersion = detail?.lead.version;
  const onEstimateCreation = useCallback((allowed: boolean) => {
    setEstimateCreation({ id: estimateLeadId ?? '', version: estimateLeadVersion ?? 0, allowed });
  }, [estimateLeadId, estimateLeadVersion]);
  const canCreateEstimate = !recordLoading && state === 'ready' && estimateCreation.id === estimateLeadId && estimateCreation.version === estimateLeadVersion && estimateCreation.allowed;
  const setPageContext = assistant?.setPageContext;
  const pageContext = useMemo(() => state !== 'ready' ? undefined : leadAssistantContext(query, detail?.lead), [query, detail, state]);
  useEffect(() => { setPageContext?.(pageContext); }, [setPageContext, pageContext]);
  const values = draft.url === rawURL ? draft.values : valuesFor(query);
  useEffect(() => {
    const restore = () => { const url = new URLSearchParams(window.location.search).toString(); setDraft({ url, values: valuesFor(leadQueryFromURL(workspaceId, new URLSearchParams(url))) }); };
    window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore);
  }, [workspaceId]);
  useEffect(() => {
    viewGeneration.current++; notesGeneration.current++;
    columnRequests.current.clear();
  }, [rawURL]);
  useEffect(() => {
    if (isApiAccessError(currentQuery.error) && currentQuery.error.status === 401) router.replace('/login');
  }, [currentQuery.error, router]);
  useEffect(() => {
    if (!quickQuery.error) return;
    if (isApiAccessError(quickQuery.error) && quickQuery.error.status === 401) router.replace('/login');
  }, [quickQuery.error, router]);
  useEffect(() => {
    // Fresh server props (including assistant writes) must supersede an older client snapshot.
    const options = initialDetail ? detailOptions : initialListOptions;
    if ((client.getQueryState(options.queryKey)?.dataUpdatedAt ?? 0) < initialUpdatedAt) {
      if (initialDetail) client.setQueryData(detailOptions.queryKey, initialDetail, { updatedAt: initialUpdatedAt });
      else client.setQueryData(initialListOptions.queryKey, initial, { updatedAt: initialUpdatedAt });
    }
  }, [client, detailOptions, initialListOptions, initial, initialDetail, initialUpdatedAt]);
  const navigate = useCallback((next: LeadListQuery, replace = false) => {
    clearTimeout(searchTimer.current);
    setFeedback(undefined);
    const url = `/leads?${leadQueryToURL({ ...next, column: undefined, columnPage: 1 })}`;
    setDraft({ url: rawURL, values: valuesFor(next) });
    if (replace) window.history.replaceState(null, '', url); else window.history.pushState(null, '', url);
  }, [rawURL]);
  useEffect(() => {
    if (values.query === query.q || initialDetail) return;
    searchTimer.current = setTimeout(() => navigate({ ...query, q: values.query, page: 1 }, true), 300);
    return () => clearTimeout(searchTimer.current);
  // The URL/query snapshot owns every filter; only the draft search is debounced.
  }, [values.query, query, initialDetail, navigate]);
  useEffect(() => {
    active.current = true;
    const view = viewGeneration, notes = notesGeneration, timer = searchTimer;
    return () => { active.current = false; view.current++; notes.current++; clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!detailQuery.isFetching) { activityPage.current = 1; notesPage.current = 1; notesGeneration.current++; }
  }, [detailQuery.isFetching]);
  function change(next: LeadsToolbarValues) {
    setDraft({ url: rawURL, values: next });
    if (next.query !== values.query && JSON.stringify({ ...next, query: '' }) === JSON.stringify({ ...values, query: '' })) return;
    if (next.created === 'custom' && (!next.from || !next.to || next.from > next.to)) return;
    navigate({ ...query, ...next, stages: [...next.stages], sources: [...next.sources], ownerIds: [...next.ownerIds], q: next.query, from: next.from || undefined, to: next.to || undefined, page: 1 });
  }
  function quickView(id: string | null) {
    setFeedback(undefined);
    setQuickId(id);
  }
  async function loadColumn(stage: LeadReadRecord['stage']) {
    if (columnRequests.current.has(stage)) return;
    const current = result.columns.find(column => column.stage === stage); if (!current) return;
    const generation = viewGeneration.current; columnRequests.current.add(stage); setColumnsBusy(old => [...old, stage]); setFeedback(undefined);
    try {
      const next = await client.fetchQuery(leadListOptions(scope, { ...query, view: 'pipeline', column: stage, columnPage: current.page + 1 }));
      if (generation !== viewGeneration.current) return;
      const merged = mergeLeadColumn(result, next, stage);
      if (!merged) { await refreshLeadView(); return; }
      setResult(old => mergeLeadColumn(old, next, stage) ?? old);
    } catch (error) { if (generation === viewGeneration.current) { setFeedback(copy.failure); if (isApiAccessError(error)) await refreshLeadView(); } }
    finally { if (generation === viewGeneration.current) { columnRequests.current.delete(stage); setColumnsBusy(old => old.filter(value => value !== stage)); } }
  }
  async function loadActivity() {
    if (!detail || activityBusy) return; const generation = notesGeneration.current; setActivityBusy(true); setFeedback(undefined);
    try {
      const next = await client.fetchQuery(leadDetailOptions(scope, detail.lead.id, activityPage.current + 1));
      if (generation !== notesGeneration.current) return;
      const merged = mergeLeadActivity(detail, next);
      if (!merged) { await refreshLeadView(); return; }
      activityPage.current++; setDetail(old => old ? mergeLeadActivity(old, next) ?? old : old);
    } catch (error) { if (generation === notesGeneration.current) { setFeedback(copy.activityFailure); if (isApiAccessError(error)) await refreshLeadView(); } }
    finally { setActivityBusy(false); }
  }
  const refreshLeadView = useCallback(async (preserveQuick = false) => {
    if (!active.current) return false;
    const generation = ++viewGeneration.current;
    notesGeneration.current++;
    if (!preserveQuick) setQuickId(null);
    columnRequests.current.clear(); setColumnsBusy([]);
    try {
      await client.cancelQueries({ queryKey: apiQueryKeys.resource(scope, 'leads') });
      await invalidateLeadQueries(client, workspaceId);
      if (generation !== viewGeneration.current) return false;
      activityPage.current = 1; notesPage.current = 1;
      return true;
    } catch (error) {
      if (generation === viewGeneration.current) {
        setFeedback(copy.failure);
        if (isApiAccessError(error) && error.status === 401) router.replace('/login');
      }
      return false;
    }
  }, [client, scope, workspaceId, router, setQuickId, setColumnsBusy]);
  async function moveStage(request: MoveStageRequest) {
    setFeedback(undefined);
    try {
      await stageMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.lead.id)}/stage`, method: 'POST', body: { workspaceId, leadId: request.lead.id, expectedVersion: request.lead.version, submissionId: crypto.randomUUID(), to: request.to, ...(request.reason ? { reason: request.reason } : {}) } });
    } catch (error) {
      await refreshLeadView();
      setFeedback(error instanceof ApiRequestError && error.status === 409 ? copy.moveConflict : isApiAccessError(error) ? copy.moveDenied : copy.moveUnconfirmed);
      throw new Error(copy.moveUnconfirmed);
    }
    // Refresh authoritative cards/counts without unmounting the board or losing its expanded Lost column.
    // Failed writes never optimistically move a card; a successful write remains saved if refresh fails.
    if (!await refreshLeadView()) setFeedback(copy.savedReload);
  }
  async function loadNotes() {
    if (!detail || notesBusy) return;
    const generation = notesGeneration.current; setNotesBusy(true); setFeedback(undefined);
    try {
      const next = await client.fetchQuery(leadNotesOptions(scope, detail.lead.id, notesPage.current + 1));
      if (generation !== notesGeneration.current) return;
      notesPage.current++;
      setDetail(old => old ? { ...old, notesTotal: next.total, teamNotes: [...new Map([...old.teamNotes, ...next.notes].map(note => [note.id, note])).values()] } : old);
    } catch (error) { if (generation === notesGeneration.current) { setFeedback(copy.notesFailure); if (isApiAccessError(error)) await refreshLeadView(); } }
    finally { setNotesBusy(false); }
  }
  async function changeArchive(request: {leadId:string;expectedVersion:number}, archived:boolean) {
    const fingerprint=JSON.stringify([request,archived]);
    if (archiveAttempt.current?.fingerprint!==fingerprint) archiveAttempt.current={fingerprint,submissionId:crypto.randomUUID()};
    try {
      await archiveMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.leadId)}/archive`, method: archived ? 'POST' : 'DELETE', body: { workspaceId, ...request, submissionId: archiveAttempt.current.submissionId } });
    } catch (error) {
      if (error instanceof ApiRequestError) await refreshLeadView();
      setFeedback(error instanceof ApiRequestError && error.status === 409 ? copy.archiveConflict : isApiAccessError(error) ? copy.archiveDenied : copy.archiveUnconfirmed);
      throw new Error(copy.archiveUnconfirmed);
    }
    archiveAttempt.current=undefined;
    if (!await refreshLeadView()) setFeedback(copy.savedReload);
    window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  }
  const previewExport: NonNullable<LeadsPageProps['onPreviewExport']> = async request => {
    const response = await fetch('/api/leads/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...request }) });
    if (!response.ok) { if ([401, 404].includes(response.status)) await refreshLeadView(); throw new Error(copy.exportFailure); }
    return leadExportPreviewSchema.parse(await response.json());
  };
  const downloadExport: LeadsPageProps['onExport'] = async request => {
    const params = new URLSearchParams({ workspaceId, filters: JSON.stringify(request.filters) });
    const response = await fetch(`/api/leads/export?${params}`, { headers: { 'X-SalesMora-Export': '1' }, cache: 'no-store' });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('text/csv')) {
      if ([401, 404].includes(response.status)) await refreshLeadView();
      const body = await response.json().catch(() => null);
      setFeedback(response.status === 422 && typeof body?.error === 'string' ? body.error : copy.exportFailure);
      throw new Error(copy.exportFailure);
    }
    // Do not offer a partially received file: a broken stream rejects blob().
    const blob = await response.blob();
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = copy.exportFilename; link.hidden = true;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const deleteRecord: LeadsPageProps['onDelete'] = async request => {
    const fingerprint = JSON.stringify(request);
    if (deleteAttempt.current?.fingerprint !== fingerprint) deleteAttempt.current = { fingerprint, submissionId: crypto.randomUUID() };
    try {
      await deleteMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.leadId)}`, method: 'DELETE', body: { workspaceId, ...request, submissionId: deleteAttempt.current.submissionId } });
    } catch (error) {
      const message = error instanceof ApiRequestError && error.status === 409 ? copy.deleteConflict : isApiAccessError(error) ? copy.deleteDenied : error instanceof ApiRequestError && error.status === 422 ? error.message : copy.deleteUnconfirmed;
      // Preserve the frozen confirmation for uncertain responses so the same request
      // can safely replay even after deletion. Confirmed conflicts reload authority.
      if (error instanceof ApiRequestError && [401, 404, 409, 422].includes(error.status)) await refreshLeadView();
      setFeedback(message); throw new Error(message);
    }
    deleteAttempt.current = undefined;
    notesGeneration.current++; viewGeneration.current++; setQuickId(null);
    try { await invalidateLeadQueries(client, workspaceId, request.leadId); }
    catch { setFeedback(copy.deleteSavedReload); }
    window.dispatchEvent(new Event('salesmora:notifications-refresh'));
    // Replace the removed record URL, preserving the originating list filters.
    router.replace(`/leads?${leadQueryToURL(query)}`);
    router.refresh();
  };
  const assignOwner: LeadsPageProps['onAssign'] = async request => {
    const fingerprint = JSON.stringify(request);
    if (assignAttempt.current?.fingerprint !== fingerprint) assignAttempt.current = { fingerprint, submissionId: crypto.randomUUID() };
    try {
      await assignMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.leadId)}/owner`, method: 'POST', body: { workspaceId, ...request, submissionId: assignAttempt.current.submissionId } });
    } catch (error) {
      if (error instanceof ApiRequestError) await refreshLeadView();
      setFeedback(error instanceof ApiRequestError && error.status === 409 ? copy.assignConflict : isApiAccessError(error) ? copy.assignDenied : copy.assignUnconfirmed);
      throw new Error(copy.assignUnconfirmed);
    }
    assignAttempt.current = undefined;
    if (!await refreshLeadView()) setFeedback(copy.savedReload);
    window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  };
  const addNote: LeadNotesProps['onAdd'] = async request => {
    let result: Awaited<ReturnType<typeof noteMutation.mutateAsync>>;
    try {
      result = await noteMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.leadId)}/notes`, method: 'POST', body: { workspaceId, ...request } });
    } catch (error) {
      if (isApiAccessError(error)) await refreshLeadView();
      return { ok: false, message: isApiAccessError(error) ? copy.noteDenied : error instanceof ApiRequestError && error.status === 409 ? copy.noteConflict : copy.noteUnconfirmed };
    }
    notesGeneration.current++;
    // A confirmed save remains successful if reloading fails; the draft's request ID prevents duplicate retry.
    if (!await refreshLeadView()) setFeedback(copy.noteSavedReload);
    return result;
  };
  const editLead: LeadEditFormProps['onSubmit'] = async request => {
    const fingerprint = JSON.stringify(request);
    if (editAttempt.current?.fingerprint !== fingerprint) editAttempt.current = { fingerprint, submissionId: crypto.randomUUID() };
    notesGeneration.current++;
    let next: LeadDetailResult;
    try {
      next = await editMutation.mutateAsync({ path: `/api/leads/${encodeURIComponent(request.leadId)}`, method: 'PATCH', body: { workspaceId, ...request, submissionId: editAttempt.current.submissionId } });
      if (next.lead.id !== request.leadId) throw new Error(copy.editUnconfirmed);
    } catch (error) {
      const conflict = leadEditConflictSchema.safeParse(error instanceof ApiRequestError ? error.details : undefined);
      if (error instanceof ApiRequestError && error.status === 409) return { ok: false, error: { kind: 'conflict', message: copy.editConflict, changedFields: conflict.success ? conflict.data.changedFields : [] } };
      if (isApiAccessError(error)) {
        await refreshLeadView();
        return { ok: false, error: { kind: 'conflict', message: copy.editDenied } };
      }
      return { ok: false, error: { kind: 'error', message: error instanceof ApiRequestError && error.status === 422 ? error.message : copy.editUnconfirmed } };
    }
    setDetail(next); activityPage.current = 1; notesPage.current = 1; editAttempt.current = undefined;
    if (request.ownerId !== undefined) window.dispatchEvent(new Event('salesmora:notifications-refresh'));
    try { await invalidateLeadQueries(client, workspaceId); }
    catch { setFeedback(copy.editSavedReload); }
    const { id, version, canEdit, origin, name, email, phone, service, address, details, notes, source, owner } = next.lead;
    return { ok: true, lead: { id, version, canEdit, origin, values: { name, email, phone, service, address, postalCode:next.lead.postalCode??'', details, notes, source, ownerId: owner?.id ?? null } } };
  };
  async function reloadEdit(leadId: string) {
    await client.invalidateQueries({ queryKey: leadDetailOptions(scope, leadId).queryKey, refetchType: 'none' });
    const next = await client.fetchQuery(leadDetailOptions(scope, leadId));
    notesGeneration.current++; setDetail(next); activityPage.current = 1; notesPage.current = 1; editAttempt.current = undefined;
    return pageRecord(next.lead, next);
  }
  const record = detail ? pageRecord(detail.lead, detail) : undefined;
  const labels: string[] = [];
  if (values.query.length >= 2) labels.push(`${leadsToolbarData.search}: ${values.query}`);
  if (values.stages.length) labels.push(`${leadsToolbarData.stage}: ${values.stages.map(value => leadsToolbarData.stages.find(stage => stage.value === value)!.label).join(', ')}`);
  if (values.sources.length) labels.push(`${leadsToolbarData.source}: ${values.sources.map(value => leadsToolbarData.sources.find(source => source.value === value)!.label).join(', ')}`);
  if (values.ownerIds.length) labels.push(`${leadsToolbarData.owner}: ${values.ownerIds.map(id => id === 'me' || id === viewerId ? leadsToolbarData.me : id === 'unassigned' ? leadsToolbarData.unassigned : result.owners.find(owner => owner.id === id)?.name ?? copy.selectedOwner).join(', ')}`);
  if (values.created !== 'any') labels.push(`${leadsToolbarData.created}: ${values.created === 'custom' ? `${values.from} – ${values.to}` : leadsToolbarData.dates.find(date => date.value === values.created)!.label}`);
  if (values.attention) labels.push(leadsToolbarData.attention);
  if (values.archived) labels.push(leadsToolbarData.archived);
  return <>
    {(feedback || (quickId && quickQuery.error)) && <div className="mb-6"><FormFeedback kind="error" message={feedback ?? copy.unavailable}/></div>}
    {(recordLoading || columnsBusy.length > 0 || activityBusy) && <p role="status" className="mb-4 text-sm text-muted">{recordLoading ? copy.loadingRecord : copy.loadingMore}</p>}
    <LeadsPage serviceControl={props=><WorkspaceServiceField {...props} workspaceId={workspaceId} required allowRetainedValue/>} relatedCustomer={detail?.relatedCustomer ? <RelatedCustomerContact customer={detail.relatedCustomer} onOpenProfile={detail.relatedCustomer.customerId ? () => router.push(`/customers/${detail.relatedCustomer!.customerId}?workspace=${encodeURIComponent(workspaceId)}`) : undefined}/> : undefined} rows={result.rows.map(lead => pageRecord(lead))} columns={result.columns.map(column => ({ ...column, leads: column.leads.map(lead => pageRecord(lead)), loading: columnsBusy.includes(column.stage) }))}
      relatedEstimates={detail && !recordLoading && state === 'ready' && <RelatedEstimates key={`${workspaceId}:${detail.lead.id}:${detail.lead.version}`} workspaceId={workspaceId} recordType="lead" recordId={detail.lead.id} onCanCreateChange={onEstimateCreation} />}
      onCreateEstimate={canCreateEstimate && detail ? () => router.push(`/estimates/new?${new URLSearchParams({ workspace: workspaceId, leadId: detail.lead.id })}`) : undefined}
      record={record} assistantStatus={assistant?.status ?? 'unavailable'} prepareButtonRef={prepareRef} onPrepareFollowUp={assistant && detail ? () => assistant.prepare(copy.followUpPrompt(detail.lead), prepareRef.current) : undefined} activityTotal={detail?.activityTotal} onLoadMoreActivity={detail && detail.activity.length < detail.activityTotal && !activityBusy ? () => { void loadActivity(); } : undefined}
      total={result.total} values={values} onChange={change} access={{ scope: detail?.scope ?? result.scope, canCreate: state === 'ready' && (detail?.canCreate ?? result.canCreate), canExport: state === 'ready' && (detail?.canExport ?? result.canExport), canArchive: state === 'ready' && (detail?.canShowArchived ?? result.canShowArchived), canAssign: state === 'ready' && (detail?.canAssign ?? result.canAssign), canEdit: detail?.lead.canEdit ?? false, canDelete: detail?.lead.canDelete ?? false, canManageBilling: false, canPrepareEstimate: canCreateEstimate, canStartJob: false }}
      members={state === 'ready' ? detail?.owners ?? result.owners : []} filterOwners={state === 'ready' ? result.owners : []} viewerId={viewerId} now={new Date().toISOString()} timezone={detail?.timezone ?? result.timezone} notesTotal={detail?.notesTotal} notesLoading={notesBusy} onLoadMoreNotes={detail && detail.teamNotes.length < detail.notesTotal ? () => { void loadNotes(); } : undefined} canManageArchive={state === 'ready' && (detail?.canShowArchived ?? result.canShowArchived)}
      quickRecord={quick ? pageRecord(quick.lead, quick) : undefined} onQuickViewChange={quickView}
      sort={{ column: query.sort, direction: query.direction }} onSort={sort => navigate({ ...query, sort: sort.column, direction: sort.direction, page: 1 })} page={result.page} pageSize={result.pageSize}
      onPageChange={page => navigate({ ...query, page })} onPageSizeChange={pageSize => navigate({ ...query, page: 1, pageSize: pageSize as 25 | 50 | 100 })} state={state} onRetry={() => { void refreshLeadView(); }}
      onClearFilters={() => navigate(leadQueryFromURL(workspaceId, new URLSearchParams(`view=${query.view}`)))}
      getRecordHref={id => `/leads/${encodeURIComponent(id)}?${leadQueryToURL(query)}`} listHref={`/leads?${leadQueryToURL(query)}`} onRequestCreate={() => router.push(`/leads/new?workspace=${encodeURIComponent(workspaceId)}`)}
      onLoadMoreColumn={stage => { void loadColumn(stage); }} onCreate={unavailable} onMove={moveStage} onAssign={assignOwner} onArchive={request=>changeArchive(request,true)} onRestore={request=>changeArchive(request,false)} onDelete={deleteRecord} onExport={downloadExport} onPreviewExport={previewExport} exportScope={result.exportScope} onEdit={editLead} onReloadEdit={reloadEdit} onNote={addNote} filterLabels={labels} exportRowLimit={50000}/>
  </>;
}

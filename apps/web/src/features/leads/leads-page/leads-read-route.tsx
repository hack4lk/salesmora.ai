'use client';
import { RelatedCustomerContact } from '../../customers/customer-contact-card/customer-contact-card';
import { RelatedEstimates } from '../../estimates/related-estimates-card/related-estimates';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
export function LeadsReadRoute({ workspaceId, viewerId, initial, initialDetail, initialQuery }: { workspaceId: string; viewerId: string; initial: LeadListResult; initialDetail?: LeadDetailResult; initialQuery: LeadListQuery }) {
  const assistant = useWorkspaceAssistant(), prepareRef = useRef<HTMLButtonElement>(null);
  const router = useRouter(), params = useSearchParams(), rawURL = params.toString();
  const query = useMemo(() => ({ ...leadQueryFromURL(workspaceId, new URLSearchParams(rawURL)), column: undefined, columnPage: 1 }), [workspaceId, rawURL]);
  const [result, setResult] = useState(initial), [detail, setDetail] = useState(initialDetail), [quick, setQuick] = useState<LeadDetailResult>();
  const [draft, setDraft] = useState({ url: rawURL, values: valuesFor(initialQuery) }), [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const [recordLoading, setRecordLoading] = useState(false), [feedback, setFeedback] = useState<string>(), [retry, setRetry] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialURL = useRef(rawURL), first = useRef(true), quickAbort = useRef<AbortController | undefined>(undefined);
  const refreshAbort = useRef<AbortController | undefined>(undefined), viewGeneration = useRef(0);
  const columnRequests = useRef(new Map<string, AbortController>());
  const [columnsBusy, setColumnsBusy] = useState<readonly string[]>([]), [activityBusy, setActivityBusy] = useState(false);
  const deleteAttempt = useRef<{fingerprint:string;submissionId:string}|undefined>(undefined);
  const archiveAttempt = useRef<{fingerprint:string;submissionId:string}|undefined>(undefined);
  const assignAttempt = useRef<{ fingerprint: string; submissionId: string } | undefined>(undefined);
  const editAttempt = useRef<{ fingerprint: string; submissionId: string } | undefined>(undefined);
  const activityPage = useRef(1), notesPage = useRef(1), notesGeneration = useRef(0);
  const [notesBusy, setNotesBusy] = useState(false);
  const [estimateCreation, setEstimateCreation] = useState({ id: '', version: 0, allowed: false });
  const estimateLeadId = detail?.lead.id, estimateLeadVersion = detail?.lead.version;
  const onEstimateCreation = useCallback((allowed: boolean) => {
    setEstimateCreation({ id: estimateLeadId ?? '', version: estimateLeadVersion ?? 0, allowed });
  }, [estimateLeadId, estimateLeadVersion]);
  const canCreateEstimate = !recordLoading && state === 'ready' && estimateCreation.id === estimateLeadId && estimateCreation.version === estimateLeadVersion && estimateCreation.allowed;
  const setPageContext = assistant?.setPageContext;
  const pageContext = useMemo(() => initialDetail && !detail ? undefined : leadAssistantContext(query, detail?.lead), [query, detail, initialDetail]);
  useEffect(() => { setPageContext?.(pageContext); }, [setPageContext, pageContext]);
  const values = draft.url === rawURL ? draft.values : valuesFor(query);
  useEffect(() => {
    const restore = () => { const url = new URLSearchParams(window.location.search).toString(); setDraft({ url, values: valuesFor(leadQueryFromURL(workspaceId, new URLSearchParams(url))) }); };
    window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore);
  }, [workspaceId]);
  useEffect(() => {
    if (initialDetail) return;
    if (first.current && initialURL.current === rawURL && retry === 0) { first.current = false; return; }
    first.current = false;
    viewGeneration.current++; refreshAbort.current?.abort();
    const abort = new AbortController();
    for (const request of columnRequests.current.values()) request.abort(); columnRequests.current.clear(); setColumnsBusy([]);
    quickAbort.current?.abort(); setQuick(undefined); setRecordLoading(false); setState('loading');
    fetch(`/api/leads?${leadQueryToURL(query)}`, { signal: abort.signal, cache: 'no-store' }).then(async response => {
      if (response.status === 401) { router.replace('/login'); throw new Error(); }
      if (!response.ok) throw new Error();
      const body: LeadListResult = await response.json();
      if (!abort.signal.aborted) { setResult(body); setState('ready'); }
    }).catch(() => { if (!abort.signal.aborted) setState('error'); });
    return () => abort.abort();
  // A fresh server snapshot (including assistant writes) invalidates the current list and quick view.
  }, [query, rawURL, retry, router, initialDetail, initial]);
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
  useEffect(() => () => { refreshAbort.current?.abort(); quickAbort.current?.abort(); for (const request of columnRequests.current.values()) request.abort(); }, []);
  function change(next: LeadsToolbarValues) {
    setDraft({ url: rawURL, values: next });
    if (next.query !== values.query && JSON.stringify({ ...next, query: '' }) === JSON.stringify({ ...values, query: '' })) return;
    if (next.created === 'custom' && (!next.from || !next.to || next.from > next.to)) return;
    navigate({ ...query, ...next, stages: [...next.stages], sources: [...next.sources], ownerIds: [...next.ownerIds], q: next.query, from: next.from || undefined, to: next.to || undefined, page: 1 });
  }
  async function quickView(id: string | null) {
    quickAbort.current?.abort(); setQuick(undefined); setFeedback(undefined);
    if (!id) { setRecordLoading(false); return; }
    const abort = new AbortController(); quickAbort.current = abort; setRecordLoading(true);
    try {
      const response = await fetch(`/api/leads/${encodeURIComponent(id)}?workspace=${encodeURIComponent(workspaceId)}`, { signal: abort.signal, cache: 'no-store' });
      if (!response.ok) throw new Error();
      const body: LeadDetailResult = await response.json(); if (!abort.signal.aborted) setQuick(body);
    } catch { if (!abort.signal.aborted) setFeedback(copy.unavailable); }
    finally { if (!abort.signal.aborted) setRecordLoading(false); }
  }
  async function loadColumn(stage: LeadReadRecord['stage']) {
    if (columnRequests.current.has(stage)) return;
    const current = result.columns.find(column => column.stage === stage); if (!current) return;
    const key = rawURL, abort = new AbortController(); columnRequests.current.set(stage, abort); setColumnsBusy(old => [...old, stage]); setFeedback(undefined);
    try {
      const response = await fetch(`/api/leads?${leadQueryToURL({ ...query, view: 'pipeline', column: stage, columnPage: current.page + 1 })}`, { signal: abort.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(); const next: LeadListResult = await response.json();
      if (abort.signal.aborted || new URLSearchParams(window.location.search).toString() !== key) return;
      if (next.scope !== result.scope || next.policyRevision !== result.policyRevision) { setState('loading'); setRetry(n => n + 1); return; }
      const page = next.columns.find(column => column.stage === stage); if (!page) throw new Error();
      setResult(old => ({ ...old, total: next.total, columns: old.columns.map(column => column.stage === stage ? { ...page, leads: [...new Map([...column.leads, ...page.leads].map(lead => [lead.id, lead])).values()] } : column) }));
    } catch { if (!abort.signal.aborted) setFeedback(copy.failure); }
    finally { if (columnRequests.current.get(stage) === abort) { columnRequests.current.delete(stage); setColumnsBusy(old => old.filter(value => value !== stage)); } }
  }
  async function loadActivity() {
    if (!detail || activityBusy) return; const generation = notesGeneration.current; setActivityBusy(true); setFeedback(undefined);
    try {
      const response = await fetch(`/api/leads/${detail.lead.id}?workspace=${encodeURIComponent(workspaceId)}&activityPage=${activityPage.current + 1}`, { cache: 'no-store' });
      if (generation !== notesGeneration.current) return;
      if (!response.ok) { setDetail(undefined); setState('error'); throw new Error(); }
      const next: LeadDetailResult = await response.json(); if (generation !== notesGeneration.current) return; activityPage.current++;
      setDetail(old => old && old.lead.version > next.lead.version ? old : old ? { ...next, teamNotes: old.teamNotes, activity: [...new Map([...old.activity, ...next.activity].map(event => [event.id, event])).values()] } : next);
    } catch { if (generation === notesGeneration.current) setFeedback(copy.activityFailure); }
    finally { setActivityBusy(false); }
  }
  const refreshLeadView = useCallback(async (preserveQuick = false) => {
    const generation = ++viewGeneration.current; refreshAbort.current?.abort(); const abort = new AbortController(); refreshAbort.current = abort;
    notesGeneration.current++;
    if (!preserveQuick) { quickAbort.current?.abort(); setQuick(undefined); setRecordLoading(false); }
    for (const request of columnRequests.current.values()) request.abort();
    columnRequests.current.clear(); setColumnsBusy([]);
    try {
      const url = initialDetail ? `/api/leads/${encodeURIComponent(initialDetail.lead.id)}?workspace=${encodeURIComponent(workspaceId)}` : `/api/leads?${leadQueryToURL(query)}`;
      const response = await fetch(url, { cache: 'no-store', signal: abort.signal });
      if (generation !== viewGeneration.current) return false;
      if (response.status === 401) router.replace('/login');
      if (!response.ok) throw new Error();
      if (initialDetail) { const next: LeadDetailResult = await response.json(); setDetail(old => old && old.lead.version > next.lead.version ? old : next); activityPage.current = 1; notesPage.current = 1; }
      else setResult(await response.json());
      if (preserveQuick && quick) {
        const response = await fetch(`/api/leads/${encodeURIComponent(quick.lead.id)}?workspace=${encodeURIComponent(workspaceId)}`, { cache: 'no-store', signal: abort.signal });
        if (generation !== viewGeneration.current) return false;
        if (response.ok) setQuick(await response.json()); else setQuick(undefined);
      }
      setState('ready');
      return true;
    } catch { if (!abort.signal.aborted && generation === viewGeneration.current) { if (initialDetail) setDetail(undefined); setQuick(undefined); setState('error'); } return false; }
  }, [initialDetail, workspaceId, query, router, quick]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void refreshLeadView(true); };
    const timer = setInterval(() => { if ((detail?.scope ?? result.scope) === 'assigned') refresh(); }, 15000); window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refreshLeadView, detail?.scope, result.scope]);
  async function moveStage(request: MoveStageRequest) {
    setFeedback(undefined);
    let response: Response;
    try {
      response = await fetch(`/api/leads/${encodeURIComponent(request.lead.id)}/stage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, leadId: request.lead.id, expectedVersion: request.lead.version, submissionId: crypto.randomUUID(), to: request.to, ...(request.reason ? { reason: request.reason } : {}) }) });
    } catch { await refreshLeadView(); setFeedback(copy.moveUnconfirmed); throw new Error(copy.moveUnconfirmed); }
    if (!response.ok) {
      await refreshLeadView();
      setFeedback(response.status === 409 ? copy.moveConflict : response.status === 404 ? copy.moveDenied : copy.moveUnconfirmed);
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
      const response = await fetch(`/api/leads/${detail.lead.id}/notes?workspace=${encodeURIComponent(workspaceId)}&page=${notesPage.current + 1}`, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const next: { notes: LeadDetailResult['teamNotes']; total: number } = await response.json();
      if (generation !== notesGeneration.current) return;
      notesPage.current++;
      setDetail(old => old ? { ...old, notesTotal: next.total, teamNotes: [...new Map([...old.teamNotes, ...next.notes].map(note => [note.id, note])).values()] } : old);
    } catch { if (generation === notesGeneration.current) setFeedback(copy.notesFailure); }
    finally { setNotesBusy(false); }
  }
  async function changeArchive(request: {leadId:string;expectedVersion:number}, archived:boolean) {
    const fingerprint=JSON.stringify([request,archived]);
    if (archiveAttempt.current?.fingerprint!==fingerprint) archiveAttempt.current={fingerprint,submissionId:crypto.randomUUID()};
    let response:Response;
    try {response=await fetch(`/api/leads/${encodeURIComponent(request.leadId)}/archive`,{method:archived?'POST':'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,...request,submissionId:archiveAttempt.current.submissionId})});}
    catch {setFeedback(copy.archiveUnconfirmed);throw new Error(copy.archiveUnconfirmed);}
    if (!response.ok) {await refreshLeadView();setFeedback(response.status===409?copy.archiveConflict:response.status===404?copy.archiveDenied:copy.archiveUnconfirmed);throw new Error(copy.archiveUnconfirmed);}
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
    let response: Response;
    try { response = await fetch(`/api/leads/${encodeURIComponent(request.leadId)}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...request, submissionId: deleteAttempt.current.submissionId }) }); }
    catch { setFeedback(copy.deleteUnconfirmed); throw new Error(copy.deleteUnconfirmed); }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = response.status === 409 ? copy.deleteConflict : response.status === 404 ? copy.deleteDenied : response.status === 422 && typeof body?.error === 'string' ? body.error : copy.deleteUnconfirmed;
      // Preserve the frozen confirmation for uncertain responses so the same request
      // can safely replay even after deletion. Confirmed conflicts reload authority.
      if ([401, 404, 409, 422].includes(response.status)) await refreshLeadView();
      setFeedback(message); throw new Error(message);
    }
    const body = await response.json().catch(() => null);
    if (body?.deleted !== true) { setFeedback(copy.deleteUnconfirmed); throw new Error(copy.deleteUnconfirmed); }
    deleteAttempt.current = undefined;
    notesGeneration.current++; viewGeneration.current++; refreshAbort.current?.abort(); quickAbort.current?.abort();
    setQuick(undefined);
    window.dispatchEvent(new Event('salesmora:notifications-refresh'));
    // Replace the removed record URL, preserving the originating list filters.
    router.replace(`/leads?${leadQueryToURL(query)}`);
    router.refresh();
  };
  const assignOwner: LeadsPageProps['onAssign'] = async request => {
    const fingerprint = JSON.stringify(request);
    if (assignAttempt.current?.fingerprint !== fingerprint) assignAttempt.current = { fingerprint, submissionId: crypto.randomUUID() };
    let response: Response;
    try { response = await fetch(`/api/leads/${encodeURIComponent(request.leadId)}/owner`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...request, submissionId: assignAttempt.current.submissionId }) }); }
    catch { throw new Error(copy.assignUnconfirmed); }
    if (!response.ok) { await refreshLeadView(); setFeedback(response.status === 409 ? copy.assignConflict : copy.assignDenied); throw new Error(copy.assignUnconfirmed); }
    assignAttempt.current = undefined;
    if (!await refreshLeadView()) setFeedback(copy.savedReload);
    window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  };
  const addNote: LeadNotesProps['onAdd'] = async request => {
    let response: Response;
    try { response = await fetch(`/api/leads/${encodeURIComponent(request.leadId)}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...request }) }); }
    catch { return { ok: false }; }
    if (!response.ok) return { ok: false, message: response.status === 404 ? copy.noteDenied : response.status === 409 ? copy.noteConflict : undefined };
    const result: { ok: true; note: LeadDetailResult['teamNotes'][number] } = await response.json();
    notesGeneration.current++;
    // A confirmed save remains successful if reloading fails; the draft's request ID prevents duplicate retry.
    if (!await refreshLeadView()) setFeedback(copy.noteSavedReload);
    return result;
  };
  const editLead: LeadEditFormProps['onSubmit'] = async request => {
    const fingerprint = JSON.stringify(request);
    if (editAttempt.current?.fingerprint !== fingerprint) editAttempt.current = { fingerprint, submissionId: crypto.randomUUID() };
    notesGeneration.current++;
    let response: Response;
    try { response = await fetch(`/api/leads/${encodeURIComponent(request.leadId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...request, submissionId: editAttempt.current.submissionId }) }); }
    catch { return { ok: false, error: { kind: 'error', message: copy.editUnconfirmed } }; }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const conflict = leadEditConflictSchema.safeParse(body);
      if (response.status === 409) return { ok: false, error: { kind: 'conflict', message: copy.editConflict, changedFields: conflict.success ? conflict.data.changedFields : [] } };
      if (response.status === 404 || response.status === 401) return { ok: false, error: { kind: 'conflict', message: copy.editDenied } };
      return { ok: false, error: { kind: 'error', message: response.status === 422 && typeof body?.error === 'string' ? body.error : copy.editUnconfirmed } };
    }
    if (!body?.lead) return { ok: false, error: { kind: 'error', message: copy.editUnconfirmed } };
    const next: LeadDetailResult = body;
    setDetail(next); activityPage.current = 1; notesPage.current = 1; editAttempt.current = undefined;
    const { id, version, canEdit, origin, name, email, phone, service, address, details, notes, source } = next.lead;
    return { ok: true, lead: { id, version, canEdit, origin, values: { name, email, phone, service, address, details, notes, source } } };
  };
  async function reloadEdit(leadId: string) {
    const response = await fetch(`/api/leads/${encodeURIComponent(leadId)}?workspace=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(copy.editDenied);
    const next: LeadDetailResult = await response.json();
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
    {feedback && <div className="mb-6"><FormFeedback kind="error" message={feedback}/></div>}
    {(recordLoading || columnsBusy.length > 0 || activityBusy) && <p role="status" className="mb-4 text-sm text-muted">{recordLoading ? copy.loadingRecord : copy.loadingMore}</p>}
    <LeadsPage relatedCustomer={detail?.relatedCustomer ? <RelatedCustomerContact customer={detail.relatedCustomer} onOpenProfile={detail.relatedCustomer.customerId ? () => router.push(`/customers/${detail.relatedCustomer!.customerId}?workspace=${encodeURIComponent(workspaceId)}`) : undefined}/> : undefined} rows={result.rows.map(lead => pageRecord(lead))} columns={result.columns.map(column => ({ ...column, leads: column.leads.map(lead => pageRecord(lead)), loading: columnsBusy.includes(column.stage) }))}
      relatedEstimates={detail && !recordLoading && state === 'ready' && <RelatedEstimates key={`${workspaceId}:${detail.lead.id}:${detail.lead.version}`} workspaceId={workspaceId} recordType="lead" recordId={detail.lead.id} onCanCreateChange={onEstimateCreation} />}
      onCreateEstimate={canCreateEstimate && detail ? () => router.push(`/estimates/new?${new URLSearchParams({ workspace: workspaceId, leadId: detail.lead.id })}`) : undefined}
      record={record} assistantStatus={assistant?.status ?? 'unavailable'} prepareButtonRef={prepareRef} onPrepareFollowUp={assistant && detail ? () => assistant.prepare(copy.followUpPrompt(detail.lead), prepareRef.current) : undefined} activityTotal={detail?.activityTotal} onLoadMoreActivity={detail && detail.activity.length < detail.activityTotal && !activityBusy ? () => { void loadActivity(); } : undefined}
      total={result.total} values={values} onChange={change} access={{ scope: result.scope, canCreate: result.canCreate, canExport: result.canExport, canArchive: detail?.canShowArchived ?? result.canShowArchived, canAssign: detail?.canAssign ?? result.canAssign, canEdit: detail?.lead.canEdit ?? false, canDelete: detail?.lead.canDelete ?? false, canManageBilling: false, canPrepareEstimate: canCreateEstimate, canStartJob: false }}
      members={detail?.owners ?? result.owners} filterOwners={result.owners} viewerId={viewerId} now={new Date().toISOString()} timezone={result.timezone} notesTotal={detail?.notesTotal} notesLoading={notesBusy} onLoadMoreNotes={detail && detail.teamNotes.length < detail.notesTotal ? () => { void loadNotes(); } : undefined} canManageArchive={detail?.canShowArchived ?? result.canShowArchived}
      quickRecord={quick ? pageRecord(quick.lead, quick) : undefined} onQuickViewChange={id => { void quickView(id); }}
      sort={{ column: query.sort, direction: query.direction }} onSort={sort => navigate({ ...query, sort: sort.column, direction: sort.direction, page: 1 })} page={result.page} pageSize={result.pageSize}
      onPageChange={page => navigate({ ...query, page })} onPageSizeChange={pageSize => navigate({ ...query, page: 1, pageSize: pageSize as 25 | 50 | 100 })} state={state} onRetry={() => { if (initialDetail) router.refresh(); else setRetry(n => n + 1); }}
      onClearFilters={() => navigate(leadQueryFromURL(workspaceId, new URLSearchParams(`view=${query.view}`)))}
      getRecordHref={id => `/leads/${encodeURIComponent(id)}?${leadQueryToURL(query)}`} listHref={`/leads?${leadQueryToURL(query)}`} onRequestCreate={() => router.push(`/leads/new?workspace=${encodeURIComponent(workspaceId)}`)}
      onLoadMoreColumn={stage => { void loadColumn(stage); }} onCreate={unavailable} onMove={moveStage} onAssign={assignOwner} onArchive={request=>changeArchive(request,true)} onRestore={request=>changeArchive(request,false)} onDelete={deleteRecord} onExport={downloadExport} onPreviewExport={previewExport} exportScope={result.exportScope} onEdit={editLead} onReloadEdit={reloadEdit} onNote={addNote} filterLabels={labels} exportRowLimit={50000}/>
  </>;
}

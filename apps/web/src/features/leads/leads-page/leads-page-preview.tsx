import type { LeadExportPreview } from '@salesmora/contracts';
import { useMemo, useRef, useState } from 'react';
import { AssistantPanel, WorkspaceNavigation, type AssistantMessage } from '@salesmora/ui';
import { LeadsPage, type LeadPageRecord, type LeadsPageAccess } from './leads-page';
import { leadsPageData as copy } from './leads-page.data';
import { leadsTableData } from '../leads-table/leads-table.data';
import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';
import { emptyLeadsToolbarValues, type LeadsToolbarValues } from '../leads-toolbar/leads-toolbar';
import type { LeadTableSort } from '../leads-table/leads-table';
import type { LeadActivityEvent } from '../lead-activity-timeline/lead-activity-timeline';

export type LeadsPagePreviewProps = { initialView?: 'list' | 'pipeline'; initialRecord?: string; empty?: boolean; filteredEmpty?: boolean; state?: 'ready' | 'loading' | 'error'; assignedOnly?: boolean; readOnly?: boolean; limitReached?: boolean; failActions?: boolean; exportPreviewState?: 'ready' | 'loading' | 'error' };
const fixtureRecords: LeadPageRecord[] = Array.from({ length: 65 }, (_, index) => {
  const row = leadsTableData.stories.rows[index % 5];
  return { ...row, id: index === 0 ? 'jordan' : `lead-${index}`, name: index < 5 ? row.name : copy.stories.name(row.name, index), leadNumber: copy.stories.leadNumber(index),
    version: 1, archived: index === 64, needsAttention: index % 3 === 0, canMove: true,
    email: copy.stories.contactEmail, phone: copy.stories.contactPhone, address: copy.stories.address, details: copy.stories.details, notes: copy.stories.notes,
    nextStep: { title: copy.stories.nextTitle, body: copy.stories.nextBody }, teamNotes: [], events: [{ id: `created-${index}`, kind: 'created', source: row.source, actorName: copy.stories.viewer, createdAt: row.createdAt }] };
});

/** Storybook-only in-memory adapter. It performs no API, provider, database or download calls. */
export function LeadsPagePreview({ initialView = 'pipeline', initialRecord, empty, filteredEmpty, state: initialState = 'ready', assignedOnly = false, readOnly = false, limitReached = false, failActions = false, exportPreviewState }: LeadsPagePreviewProps) {
  const [records, setRecords] = useState(empty ? [] : fixtureRecords);
  const current = useRef(records);
  const nextLeadNumber = useRef(fixtureRecords.length);
  const [values, setValues] = useState<LeadsToolbarValues>({ ...emptyLeadsToolbarValues, view: initialView, query: filteredEmpty ? copy.stories.missingSearch : '' });
  const [sort, setSort] = useState<LeadTableSort>({ column: 'created', direction: 'desc' }), [page, setPage] = useState(1), [pageSize, setPageSize] = useState(25);
  const [recordId, setRecordId] = useState<string | null>(initialRecord ?? null), [quickId, setQuickId] = useState<string | null>(null), [state, setState] = useState(initialState);
  const [assistantOpen, setAssistantOpen] = useState(false), [assistantDraft, setAssistantDraft] = useState(''), [messages, setMessages] = useState<AssistantMessage[]>([]);
  const prepareRef = useRef<HTMLButtonElement>(null);
  const access: LeadsPageAccess = { scope: assignedOnly ? 'assigned' : 'workspace', canCreate: !assignedOnly && !readOnly, canAssign: !assignedOnly && !readOnly, canEdit: !readOnly, canArchive: !assignedOnly && !readOnly, canDelete: !assignedOnly && !readOnly, canExport: !assignedOnly && !readOnly, canManageBilling: !assignedOnly && !readOnly, canPrepareEstimate: true, canStartJob: !assignedOnly && !readOnly };
  const scoped = useMemo(() => records.filter(lead => !assignedOnly || lead.owner?.id === 'sam').map(lead => ({ ...lead, canMove: !readOnly && !lead.archived, canEdit: !readOnly && !lead.archived, canAssign: !assignedOnly && !readOnly && !lead.archived, canArchive: !assignedOnly && !readOnly && !lead.archived, canRestore: !assignedOnly && !readOnly && lead.archived, canDelete: !assignedOnly && !readOnly })), [records, assignedOnly, readOnly]);
  const members = copy.stories.memberIds.map((id, index) => ({ id, name: copy.stories.memberNames[index], openLeadCount: scoped.filter(lead => lead.owner?.id === id && !lead.archived && !['won', 'lost'].includes(lead.stage)).length }));
  function matchesFilters(lead: LeadPageRecord) {
    const q = values.query.trim().toLowerCase();
    if (q.length >= 2 && ![lead.name, lead.service, lead.email, lead.phone, lead.address].some(text => text.toLowerCase().includes(q))) return false;
    if (!values.archived && lead.archived) return false;
    if (values.stages.length && !values.stages.includes(lead.stage)) return false;
    if (values.sources.length && !values.sources.includes(lead.source)) return false;
    if (values.ownerIds.length && !values.ownerIds.some(id => id === 'me' ? lead.owner?.id === 'sam' : id === 'unassigned' ? !lead.owner : lead.owner?.id === id)) return false;
    if (values.attention && !lead.needsAttention) return false;
    const day = lead.createdAt.slice(0, 10), age = (Date.parse(copy.stories.now) - Date.parse(lead.createdAt)) / 86400000;
    if (values.created === '7days' && age > 7 || values.created === '30days' && age > 30) return false;
    if (values.created === 'custom' && (values.from && day < values.from || values.to && day > values.to)) return false;
    return true;
  }
  const filtered = scoped.filter(matchesFilters);
  const sorted = [...filtered].sort((a, b) => {
    if (sort.column === 'owner' && (!a.owner || !b.owner)) return a.owner ? -1 : b.owner ? 1 : a.id.localeCompare(b.id);
    const value = (lead: LeadPageRecord) => sort.column === 'created' ? lead.createdAt : sort.column === 'owner' ? lead.owner?.name ?? '' : lead[sort.column];
    return (sort.direction === 'asc' ? 1 : -1) * value(a).localeCompare(value(b)) || a.id.localeCompare(b.id);
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize)), activePage = Math.min(page, pageCount);
  const rows = values.view === 'pipeline' ? sorted : sorted.slice((activePage - 1) * pageSize, activePage * pageSize);
  const record = scoped.find(lead => lead.id === recordId), quickRecord = scoped.find(lead => lead.id === quickId);
  const labels: string[] = [];
  if (values.query) labels.push(`${leadsToolbarData.search}: ${values.query}`);
  if (values.stages.length) labels.push(`${leadsToolbarData.stage}: ${values.stages.map(value => leadsToolbarData.stages.find(stage => stage.value === value)!.label).join(', ')}`);
  if (values.sources.length) labels.push(`${leadsToolbarData.source}: ${values.sources.map(value => leadsToolbarData.sources.find(source => source.value === value)!.label).join(', ')}`);
  if (values.ownerIds.length) labels.push(`${leadsToolbarData.owner}: ${values.ownerIds.map(id => id === 'me' ? leadsToolbarData.me : id === 'unassigned' ? leadsToolbarData.unassigned : members.find(member => member.id === id)?.name ?? id).join(', ')}`);
  if (values.created !== 'any') labels.push(`${leadsToolbarData.created}: ${values.created === 'custom' ? `${values.from} – ${values.to}` : leadsToolbarData.dates.find(date => date.value === values.created)!.label}`);
  if (values.attention) labels.push(leadsToolbarData.attention);
  function commit(next: LeadPageRecord[]) { current.current = next; setRecords(next); }
  function checked(id: string, version: number) {
    const lead = current.current.find(item => item.id === id && (!assignedOnly || item.owner?.id === 'sam'));
    if (!lead || lead.version !== version || failActions) throw new Error(copy.failure);
    return lead;
  }
  type EventBody<T = LeadActivityEvent> = T extends LeadActivityEvent ? Omit<T, 'id' | 'createdAt' | 'actorName'> : never;
  function update(lead: LeadPageRecord, patch: Partial<LeadPageRecord>, event?: EventBody) {
    const nextEvent = event ? { ...event, id: crypto.randomUUID(), createdAt: copy.stories.now, actorName: copy.stories.viewer } as LeadActivityEvent : undefined;
    commit(current.current.map(item => item.id === lead.id ? { ...item, ...patch, version: item.version + 1, events: nextEvent ? [nextEvent, ...item.events] : item.events } : item));
  }
  return <div className="min-h-screen bg-canvas md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: assignedOnly ? 'field' : 'owner' }} currentPage="leads" contentId="leads-preview-content" authorizedPages={['home', 'leads', 'settings']} availablePages={['leads']} onNavigate={() => { setRecordId(null); }} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false}/>
    <main id="leads-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 pb-28 focus-visible:focus-ring sm:px-8 sm:py-8 sm:pb-28">
      <p className="mb-6 mt-0 text-sm text-muted">{copy.stories.preview}</p>
      <LeadsPage rows={rows} columns={copy.stages.map(stage => ({ stage: stage.value, leads: sorted.filter(lead => lead.stage === stage.value), total: sorted.filter(lead => lead.stage === stage.value).length }))}
        total={sorted.length} record={record} quickRecord={quickRecord} onQuickViewChange={setQuickId} values={values} onChange={next => { setValues(next); setPage(1); }} access={access}
        members={access.canAssign ? members : []} viewerId="sam" now={copy.stories.now} timezone={copy.stories.timezone} sort={sort} onSort={next => { setSort(next); setPage(1); }} page={activePage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        state={state} onRetry={() => setState('ready')} onClearFilters={() => { setValues({ ...emptyLeadsToolbarValues, view: values.view }); setPage(1); }}
        getRecordHref={id => `#preview-record-${id}`} listHref="#preview-leads" onNavigateRecord={setRecordId} limitReached={limitReached} billingHref="#preview-billing" exportRowLimit={50000} filterLabels={labels}
        onCreate={async ({ lead }) => {
          if (!access.canCreate || limitReached) return { ok: false, kind: 'limit_reached' };
          const id = crypto.randomUUID(), created: LeadPageRecord = { ...fixtureRecords[0], ...lead, id, version: 1, leadNumber: copy.stories.leadNumber(nextLeadNumber.current++), stage: 'new', owner: members.find(member => member.id === lead.ownerId) ?? null, createdAt: copy.stories.now, needsAttention: false, archived: false, teamNotes: [], events: [{ id: crypto.randomUUID(), kind: 'created', source: lead.source, actorName: copy.stories.viewer, createdAt: copy.stories.now }] };
          commit([created, ...current.current]);
          return { ok: true, lead: { id, name: created.name, href: `#preview-record-${id}` }, hiddenByFilters: !matchesFilters(created) };
        }}
        onMove={async request => { if (readOnly) throw new Error(copy.failure); const lead = checked(request.lead.id, request.lead.version); if (lead.archived) throw new Error(copy.failure); update(lead, { stage: request.to }, { kind: 'stage', from: lead.stage, to: request.to, reason: request.reason }); }}
        onAssign={async request => { if (!access.canAssign) throw new Error(copy.failure); const lead = checked(request.leadId, request.expectedVersion); const owner = members.find(member => member.id === request.ownerId) ?? null; update(lead, { owner }, { kind: 'assigned', from: lead.owner, to: owner }); }}
        onArchive={async request => { if (!access.canArchive) throw new Error(copy.failure); update(checked(request.leadId, request.expectedVersion), { archived: true }, { kind: 'archived' }); }}
        onRestore={async request => { if (!access.canArchive) throw new Error(copy.failure); update(checked(request.leadId, request.expectedVersion), { archived: false }, { kind: 'restored' }); }}
        onDelete={async request => { if (!access.canDelete) throw new Error(copy.failure); const lead = checked(request.leadId, request.expectedVersion); if (lead.stage === 'won' || request.typedConfirmation !== lead.leadNumber) throw new Error(copy.failure); commit(current.current.filter(item => item.id !== lead.id)); }}
        onPreviewExport={exportPreviewState ? async () => {
          if (exportPreviewState === 'loading') return new Promise<LeadExportPreview>(() => {});
          if (exportPreviewState === 'error') throw new Error(copy.failure);
          return { count: filtered.length, rowLimit: 50000, scope: access.scope };
        } : undefined}
        onExport={async () => { if (!access.canExport || failActions) throw new Error(copy.failure); }}
        onEdit={async request => { try { if (!access.canEdit) throw new Error(copy.failure); const lead = checked(request.leadId, request.expectedVersion); update(lead, request.values, { kind: 'edited', changes: (Object.keys(request.values) as (keyof typeof request.values)[]).filter(field => lead[field] !== request.values[field]).map(field => ({ field, before: lead[field], after: request.values[field] ?? null })) }); return { ok: true, lead: { id: lead.id, version: lead.version + 1, canEdit: true, origin: lead.source === 'gmail' ? 'gmail' : 'manual', values: { ...lead, ...request.values } } }; } catch { return { ok: false, error: { kind: 'error', message: copy.failure } }; } }}
        onNote={async request => { const lead = current.current.find(lead => lead.id === request.leadId && (!assignedOnly || lead.owner?.id === 'sam')); if (!lead || failActions) return { ok: false, message: copy.failure }; const note = { id: request.submissionId, body: request.body, authorName: copy.stories.viewer, createdAt: copy.stories.now }; update(lead, { teamNotes: [note, ...lead.teamNotes] }, { kind: 'note', body: note.body }); return { ok: true, note }; }}
        onPrepareFollowUp={request => { if (!assistantDraft.trim()) setAssistantDraft(request.prompt); setAssistantOpen(true); }} prepareButtonRef={prepareRef}/>
    </main>
    <AssistantPanel open={assistantOpen} onOpenChange={setAssistantOpen} draft={assistantDraft} onDraftChange={setAssistantDraft} returnFocusRef={prepareRef} messages={messages} contextLabel={record ? `${record.leadNumber} · ${record.name}` : undefined}
      onSend={async text => { setMessages(items => [...items, { id: crypto.randomUUID(), role: 'user', text }, { id: crypto.randomUUID(), role: 'assistant', text: copy.stories.reply }]); return { ok: true }; }}/>
  </div>;
}

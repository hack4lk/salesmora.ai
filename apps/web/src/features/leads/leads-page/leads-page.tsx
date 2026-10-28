'use client';

import { useRef, useState, type MouseEvent, type Ref } from 'react';
import { ConfirmDialog, FormFeedback, SideDrawer, Toast } from '@salesmora/ui';
import { LeadsToolbar, type LeadsToolbarProps } from '../leads-toolbar/leads-toolbar';
import { LeadsTable, type LeadsTableProps } from '../leads-table/leads-table';
import { LeadPipelineBoard, type PipelineColumn } from '../lead-pipeline-board/lead-pipeline-board';
import type { LeadCardRecord } from '../lead-card/lead-card';
import { LeadRowDrawer, type LeadQuickView } from '../lead-row-drawer/lead-row-drawer';
import { AddLeadDrawer, type AddLeadDrawerProps } from '../add-lead-drawer/add-lead-drawer';
import { MoveStageDialog, type MoveStageRequest, type MoveStageValue } from '../move-stage-dialog/move-stage-dialog';
import { LeadOwnerSelect, type LeadOwnerMember } from '../lead-owner-select/lead-owner-select';
import { ArchiveLeadDialog } from '../archive-lead-dialog/archive-lead-dialog';
import { DeleteLeadDialog, type DeleteLeadRequest } from '../delete-lead-dialog/delete-lead-dialog';
import { ExportLeadsDialog, type ExportLeadsRequest } from '../export-leads-dialog/export-leads-dialog';
import { LeadsEmptyState } from '../leads-empty-state/leads-empty-state';
import { LeadDetailHeader } from '../lead-detail-header/lead-detail-header';
import { LeadContactCard } from '../lead-contact-card/lead-contact-card';
import { LeadServiceCard } from '../lead-service-card/lead-service-card';
import { LeadNotes, type LeadNotesProps, type LeadNote } from '../lead-notes/lead-notes';
import { LeadActivityTimeline, type LeadActivityEvent } from '../lead-activity-timeline/lead-activity-timeline';
import { LeadNextStepCard, type FollowUpRequest } from '../lead-next-step-card/lead-next-step-card';
import { LeadEditForm, type LeadEditValues, type LeadEditFormProps } from '../lead-edit-form/lead-edit-form';
import type { LeadExportPreview } from '@salesmora/contracts';
import { useFormReady } from '../../auth/use-form-ready';
import { leadsPageData as copy } from './leads-page.data';

export type LeadPageRecord = LeadCardRecord & {
  canArchive?: boolean; canRestore?: boolean; canAssign?: boolean; canEdit?: boolean; origin?: 'manual' | 'gmail' | 'campaign'; leadNumber: string; email: string; phone: string; address: string; details: string; notes: string;
  nextStep: { title: string; body: string } | null; teamNotes: readonly LeadNote[]; events: readonly LeadActivityEvent[];
};
export type LeadsPageAccess = LeadsToolbarProps['access'] & { canAssign: boolean; canEdit: boolean; canDelete: boolean; canManageBilling: boolean; canPrepareEstimate: boolean; canStartJob: boolean };
export type LeadsPageProps = { relatedCustomer?: import('react').ReactNode;
  relatedEstimates?: import('react').ReactNode;
  onCreateEstimate?: () => void;
  /** Already authorized/filtered/sorted/paged data. The host owns queries, URL state and counts. */
  rows: readonly LeadPageRecord[]; columns: readonly PipelineColumn[]; total: number; record?: LeadPageRecord;
  values: LeadsToolbarProps['values']; onChange: LeadsToolbarProps['onChange']; access: LeadsPageAccess;
  members: readonly LeadOwnerMember[]; viewerId: string; now: string; timezone: string;
  sort: LeadsTableProps['sort']; page: number; pageSize: number; onSort: NonNullable<LeadsTableProps['onSort']>;
  onPageChange: LeadsTableProps['onPageChange']; onPageSizeChange: LeadsTableProps['onPageSizeChange'];
  quickRecord?: LeadPageRecord; onQuickViewChange: (id: string | null) => void;
  state?: 'ready' | 'loading' | 'error'; onRetry: () => void; onClearFilters: () => void;
  getRecordHref: (id: string) => string; listHref: string;
  /** Optional routing adapter for the preview. Native links remain intact when omitted. */
  onNavigateRecord?: (id: string | null) => void;
  onCreate: AddLeadDrawerProps['onSubmit']; limitReached?: boolean; billingHref?: string;
  onMove: (request: MoveStageRequest) => Promise<void>;
  onAssign: (request: { leadId: string; expectedVersion: number; ownerId: string | null }) => Promise<void>;
  onArchive: (request: { leadId: string; expectedVersion: number }) => Promise<void>;
  onRestore: (request: { leadId: string; expectedVersion: number }) => Promise<void>;
  onDelete: (request: DeleteLeadRequest) => Promise<void>; onExport: (request: ExportLeadsRequest) => Promise<void>;
  onReloadEdit?: (leadId: string) => Promise<LeadPageRecord>;
  onEdit: LeadEditFormProps['onSubmit']; onNote: LeadNotesProps['onAdd'];
  filterLabels: readonly string[]; exportRowLimit: number; exportScope?: 'workspace' | 'assigned';
  onPreviewExport?: (request: ExportLeadsRequest) => Promise<LeadExportPreview>;
  onPrepareFollowUp?: (request: FollowUpRequest) => void;
  onRequestCreate?: () => void;
  filterOwners?: readonly { id: string; name: string }[];
  onLoadMoreColumn?: (stage: LeadPageRecord['stage']) => void;
  notesReadOnly?: boolean;
  notesTotal?: number; notesLoading?: boolean; onLoadMoreNotes?: () => void;
  canManageArchive?: boolean;
  activityTotal?: number; onLoadMoreActivity?: () => void;
  prepareButtonRef?: Ref<HTMLButtonElement>;
  assistantStatus?: 'ready' | 'busy' | 'unavailable';
};
type Workflow = { kind: 'move' | 'assign' | 'archive' | 'restore' | 'delete' | 'edit'; lead: LeadPageRecord } | { kind: 'create' } | { kind: 'export'; review: { request: ExportLeadsRequest; labels: readonly string[]; count: number | null; scope: LeadsPageAccess['scope']; rowLimit: number; loading: boolean } };
const button = 'min-h-11 w-fit cursor-pointer rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const editValues = (lead: LeadPageRecord): LeadEditValues => ({ name: lead.name, email: lead.email, phone: lead.phone, service: lead.service, address: lead.address, details: lead.details, notes: lead.notes, source: lead.source });

export function LeadsPage(props: LeadsPageProps) {
  const { values, access, record, state = 'ready' } = props;
  const interactive = useFormReady();
  const archiveActions = props.canManageArchive ?? access.canArchive;
  const [workflow, setWorkflow] = useState<Workflow>();
  const [move, setMove] = useState<MoveStageValue>({ to: 'new', reason: '' });
  const [ownerId, setOwnerId] = useState<string | null>(null), [typed, setTyped] = useState(''), [note, setNote] = useState('');
  const [edit, setEdit] = useState<LeadEditValues>();
  const editDirty = useRef(false);
  const exportGeneration = useRef(0);
  const [discardEdit, setDiscardEdit] = useState(false);
  const [pending, setPending] = useState(false), [error, setError] = useState<string>();
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string }>();
  const [hiddenCreated, setHiddenCreated] = useState(false);
  const inFlight = useRef(false);
  const quickCurrent = props.quickRecord;
  const filtered = !!(values.query.trim().length >= 2 || values.stages.length || values.sources.length || values.ownerIds.length || values.created !== 'any' || values.attention || values.archived);
  function request(kind: Extract<Workflow, { lead: LeadPageRecord }>['kind'], lead: LeadPageRecord) {
    if (pending) return;
    props.onQuickViewChange(null); setError(undefined); setTyped(''); setOwnerId(lead.owner?.id ?? null); setEdit(editValues(lead));
    setMove({ to: copy.stages.find(stage => stage.value !== lead.stage)!.value, reason: '' });
    setWorkflow({ kind, lead });
  }
  function close() { if (!pending) { exportGeneration.current++; setWorkflow(undefined); setError(undefined); } }
  function reviewExport() {
    if (pending || !access.canExport) return;
    const generation = ++exportGeneration.current;
    setError(undefined);
    const request: ExportLeadsRequest = { filters: { query: values.query, stages: [...values.stages], sources: [...values.sources], ownerIds: [...values.ownerIds], created: values.created, from: values.from, to: values.to, attention: values.attention, archived: values.archived } };
    setWorkflow({ kind: 'export', review: { request, labels: [...props.filterLabels], count: props.onPreviewExport ? null : props.total, scope: props.exportScope ?? access.scope, rowLimit: props.exportRowLimit, loading: !!props.onPreviewExport } });
    if (props.onPreviewExport) void props.onPreviewExport(request).then(preview => {
      if (generation !== exportGeneration.current) return;
      setWorkflow(current => current?.kind === 'export' ? { ...current, review: { ...current.review, ...preview, loading: false } } : current);
    }).catch(() => {
      if (generation !== exportGeneration.current) return;
      setError(copy.failure);
      setWorkflow(current => current?.kind === 'export' ? { ...current, review: { ...current.review, count: null, loading: false } } : current);
    });
  }
  async function run(action: () => Promise<void>, message: string, navigateAway = false) {
    if (inFlight.current) return;
    inFlight.current = true; setPending(true); setError(undefined);
    try { await action(); setWorkflow(undefined); setNotice({ kind: 'success', text: message }); if (navigateAway) props.onNavigateRecord?.(null); }
    catch { setError(copy.failure); setNotice({ kind: 'error', text: copy.failure }); throw new Error(copy.failure); }
    finally { inFlight.current = false; setPending(false); }
  }
  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (!props.onNavigateRecord || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === props.listHref) { event.preventDefault(); props.onQuickViewChange(null); setNote(''); props.onNavigateRecord(null); }
    else {
      const lead = [...props.rows, ...(record ? [record] : [])].find(row => props.getRecordHref(row.id) === href);
      if (lead) { event.preventDefault(); props.onQuickViewChange(null); setNote(''); props.onNavigateRecord(lead.id); }
    }
  }
  const lead = workflow && 'lead' in workflow ? workflow.lead : undefined;
  const freshLead = lead && [record, props.quickRecord, ...props.rows, ...props.columns.flatMap(column => column.leads)].find(item => item?.id === lead.id);
  const conflict = !!lead && (!freshLead || freshLead.version !== lead.version);
  const reviewError = conflict ? { kind: 'conflict' as const, message: copy.stale } : error ? { kind: 'error' as const, message: error } : undefined;
  const quickLead: LeadQuickView | undefined = quickCurrent && { ...quickCurrent, permissions: { canMove: quickCurrent.canMove, canAssign: access.canAssign && (quickCurrent.canAssign ?? !quickCurrent.archived) }, nextStep: quickCurrent.nextStep?.body ?? null,
    activityTotal: quickCurrent.events.length, activity: quickCurrent.events.slice(0, 5).map(event => ({ ...event, summary: event.kind === 'note' ? event.body : event.kind === 'created' ? copy.created : event.kind === 'stage' ? copy.moved : event.kind === 'assigned' ? copy.assigned : event.kind === 'archived' ? copy.archived : event.kind === 'restored' ? copy.restored : copy.saved, viaAssistant: !!event.viaAssistant })) };
  const controls = record && (record.canMove && !record.archived || access.canAssign && (record.canAssign ?? !record.archived)) && <section className="grid gap-4 rounded-2xl border border-line bg-paper p-6" aria-label={copy.management}>
    <h2 className="m-0 text-lg font-semibold text-ink">{copy.management}</h2>
    {record.canMove && !record.archived && <button type="button" className={button} onClick={() => request('move', record)}>{copy.move}</button>}
    {access.canAssign && (record.canAssign ?? !record.archived) && <button type="button" className={button} onClick={() => request('assign', record)}>{copy.assign}</button>}
  </section>;
  return <div className="grid min-w-0 gap-6" onClick={navigate}>
    {record ? <>
      <LeadDetailHeader lead={record} now={props.now} timezone={props.timezone} backHref={props.listHref} pending={pending}
        permissions={{ canEdit: record.canEdit ?? access.canEdit, canArchive: archiveActions && (record.canArchive ?? !record.archived), canRestore: archiveActions && (record.canRestore ?? record.archived), canDelete: record.canDelete ?? access.canDelete, canCreateEstimate: access.canPrepareEstimate, canStartJob: access.canStartJob }}
        onCreateEstimate={props.onCreateEstimate} onEdit={() => request('edit', record)} onRequestArchive={() => request('archive', record)} onRequestRestore={() => request('restore', record)} onRequestDelete={() => request('delete', record)}/>
      <div className="grid min-w-0 gap-6 lg:grid-cols-3"><div className="grid min-w-0 content-start gap-6 lg:col-span-2">
        <LeadContactCard contact={record} viewerId={props.viewerId}/>{props.relatedCustomer}<LeadServiceCard service={record.service} address={record.address} details={record.details}/>
        <LeadNotes key={record.id} leadId={record.id} value={note} onChange={setNote} notes={record.teamNotes} now={props.now} timezone={props.timezone} disabled={props.notesReadOnly} total={props.notesTotal} loading={props.notesLoading} onLoadMore={props.onLoadMoreNotes} onAdd={props.onNote} onAdded={() => setNotice({ kind: 'success', text: copy.saved })}/>
        <LeadActivityTimeline events={record.events} total={props.activityTotal ?? record.events.length} onLoadMore={props.onLoadMoreActivity} now={props.now} timezone={props.timezone}/>
      </div><aside className="grid min-w-0 content-start gap-6"><LeadNextStepCard lead={record} suggestion={record.nextStep} onPrepare={props.onPrepareFollowUp} prepareButtonRef={props.prepareButtonRef} assistantStatus={props.assistantStatus}/>{props.relatedEstimates}{controls}</aside></div>
    </> : <>
      <header><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-3 text-base leading-6 text-muted">{copy.description}</p></header>
      <LeadsToolbar values={values} owners={props.filterOwners ?? (access.canAssign ? props.members : [])} viewerId={props.viewerId} access={access} disabled={pending || !interactive} onChange={props.onChange} onAdd={props.onRequestCreate ?? (() => setWorkflow({ kind: 'create' }))} onExport={reviewExport}/>
      {hiddenCreated && <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper p-4"><p className="m-0 text-sm text-muted">{copy.hiddenCreated}</p><button type="button" className={button} onClick={() => { props.onClearFilters(); setHiddenCreated(false); }}>{copy.clearFilters}</button></div>}
      {state === 'loading' ? <p role="status" className="rounded-2xl border border-line bg-paper p-8 text-muted">{copy.loading}</p> : state === 'error' ? <div className="grid gap-4"><FormFeedback kind="error" message={copy.loadError}/><button type="button" className={button} onClick={props.onRetry}>{copy.retry}</button></div> : props.total === 0 ? <LeadsEmptyState variant={filtered ? 'filtered' : 'first-run'} scope={access.scope} canCreate={access.canCreate} onAdd={props.onRequestCreate ?? (() => setWorkflow({ kind: 'create' }))} onClearFilters={props.onClearFilters}/> : <>
        <p role="status" className="m-0 text-sm text-muted">{copy.results(props.total)}</p>
        {values.view === 'pipeline' ? <LeadPipelineBoard columns={props.columns} now={props.now} timezone={props.timezone} pendingId={pending ? lead?.id ?? 'pending' : undefined} recordHref={row => props.getRecordHref(row.id)}
          onLoadMore={props.onLoadMoreColumn} onOpen={row => props.onQuickViewChange(row.id)} onConfirmMove={request => { void run(() => props.onMove({ lead: { ...request.lead }, to: request.to, reason: request.reason }), copy.moved).catch(() => {}); }}/>
          : <LeadsTable rows={props.rows.map(row => ({ ...row, canRestore: archiveActions && (row.canRestore ?? row.archived) }))} total={props.total} page={props.page} pageSize={props.pageSize} now={props.now} timezone={props.timezone} sort={props.sort}
            getLeadHref={row => props.getRecordHref(row.id)} onRowOpen={row => props.onQuickViewChange(row.id)} onRestore={row => { const found = props.rows.find(item => item.id === row.id); if (found) request('restore', found); }}
            onSort={props.onSort} onPageChange={props.onPageChange} onPageSizeChange={props.onPageSizeChange}/>}</>}
    </>}
    {quickLead && <LeadRowDrawer open lead={quickLead} viewerId={props.viewerId} timezone={props.timezone} recordHref={props.getRecordHref(quickLead.id)} onClose={() => props.onQuickViewChange(null)} onRequestMove={() => request('move', quickCurrent!)} onRequestAssignment={() => request('assign', quickCurrent!)} onAssignToMe={() => { request('assign', quickCurrent!); setOwnerId(props.viewerId); }}/>}
    {workflow?.kind === 'create' && <AddLeadDrawer open canCreate={access.canCreate} canAssign={access.canAssign} members={access.canAssign ? props.members : []} viewerId={props.viewerId} canManageBilling={access.canManageBilling} billingHref={props.billingHref} limitReached={props.limitReached} onClose={close} onSubmit={props.onCreate} onCreated={result => { setHiddenCreated(!!result.hiddenByFilters); setNotice({ kind: 'success', text: copy.created }); }}/>}
    {workflow?.kind === 'move' && lead && <MoveStageDialog open lead={{ ...lead, canMove: freshLead?.canMove ?? false, archived: freshLead?.archived ?? lead.archived }} value={move} onChange={setMove} pending={pending} error={reviewError} onClose={close} onConfirm={request => run(() => props.onMove(request), copy.moved)}/>}
    {workflow?.kind === 'assign' && lead && <ConfirmDialog open title={copy.assign} description={copy.assignDescription} confirmLabel={copy.assignConfirm} pending={pending} error={reviewError?.message} confirmDisabled={conflict || !access.canAssign || !(lead.canAssign ?? !lead.archived) || (ownerId !== null && !props.members.some(member => member.id === ownerId)) || ownerId === (lead.owner?.id ?? null)} onClose={close} onConfirm={() => run(() => props.onAssign({ leadId: lead.id, expectedVersion: lead.version, ownerId }), copy.assigned)}>
      <LeadOwnerSelect members={access.canAssign ? props.members : []} viewerId={props.viewerId} value={ownerId} currentOwner={lead.owner} canAssign={access.canAssign} pending={pending} onChange={setOwnerId}/>
    </ConfirmDialog>}
    {workflow?.kind === 'archive' && lead && <ArchiveLeadDialog open lead={{ ...lead, canArchive: archiveActions && (freshLead?.canArchive ?? !freshLead?.archived) }} pending={pending} error={reviewError} onClose={close} onConfirm={request => run(() => props.onArchive(request), copy.archived)}/>}
    {workflow?.kind === 'restore' && lead && <ConfirmDialog open title={copy.restore} description={copy.restoreDescription} confirmLabel={copy.restoreConfirm} pending={pending} confirmDisabled={conflict || !archiveActions || !(freshLead?.canRestore ?? freshLead?.archived)} error={reviewError?.message} onClose={close} onConfirm={() => run(() => props.onRestore({ leadId: lead.id, expectedVersion: lead.version }), copy.restored)}/>}
    {workflow?.kind === 'delete' && lead && <DeleteLeadDialog open lead={{ ...lead, canDelete: freshLead?.canDelete ?? access.canDelete }} value={typed} onChange={setTyped} pending={pending} error={reviewError} onClose={close} onConfirm={request => run(() => props.onDelete(request), copy.deleted, true)}/>}
    {workflow?.kind === 'export' && <ExportLeadsDialog open filters={workflow.review.request.filters} filterLabels={workflow.review.labels} scope={workflow.review.scope} count={workflow.review.count} rowLimit={workflow.review.rowLimit} loading={workflow.review.loading} canExport={access.canExport} pending={pending} error={error} onClose={close} onConfirm={request => run(() => props.onExport(request), copy.exported)}/>}
    {workflow?.kind === 'edit' && lead && edit && <SideDrawer open title={copy.edit} busy={pending} onClose={() => { if (editDirty.current) setDiscardEdit(true); else close(); }}><LeadEditForm lead={{ id: lead.id, version: lead.version, values: editValues(lead), canEdit: lead.canEdit ?? access.canEdit, origin: lead.origin ?? (lead.source === 'gmail' ? 'gmail' : 'manual') }} value={edit} onChange={setEdit} onCancel={close} onDirtyChange={dirty => { editDirty.current = dirty; }} error={reviewError} onReload={props.onReloadEdit ? async () => { const next = await props.onReloadEdit!(lead.id); setWorkflow({ kind: 'edit', lead: next }); setEdit(editValues(next)); setError(undefined); } : undefined} onSubmit={async request => { setPending(true); try { return await props.onEdit(request); } finally { setPending(false); } }} onSaved={() => { setWorkflow(undefined); setNotice({ kind: 'success', text: copy.saved }); }}/></SideDrawer>}
    {discardEdit && <ConfirmDialog open title={copy.discardTitle} description={copy.discardDescription} confirmLabel={copy.discard} onClose={() => setDiscardEdit(false)} onConfirm={() => { setDiscardEdit(false); close(); }}/>}
    <Toast open={!!notice} kind={notice?.kind ?? 'success'} message={notice?.text ?? ''} autoHideMs={notice?.kind === 'error' ? null : 2000} onClose={() => setNotice(undefined)}/>
  </div>;
}

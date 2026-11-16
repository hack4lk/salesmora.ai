'use client';
import { useCalendarScheduleRefresh } from '../../calendar/calendar-events';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary, useApiQueryScope } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { isApiAccessError } from '../../api/api-query';
import { workOrderCreationVisitSchema, jobDetailResultSchema, jobListResultSchema, workOrderListResultSchema } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import type { JobView, WorkOrderDetailResult, WorkOrderStatus, WorkOrderListResult, WorkOrderQuery } from '@salesmora/contracts';
import type { CreateWorkOrderValues, WorkOrderListAction, WorkOrderListFilters, WorkOrderListSort, WorkOrderListView, WorkOrderView } from '../work-order-preview.types';
import { WorkOrdersList } from '../work-orders-list/work-orders-list';
import { defaultWorkOrderListFilters } from '../work-orders-list/work-orders-list.filter';
import { toView } from '../work-order-view';
import { WorkOrderDetailRoute } from './work-order-detail-route';
import { CreateWorkOrderDialog, type CreateWorkOrderVisitContext } from '../create-work-order-dialog/create-work-order-dialog';
import { WorkOrderDeleteDialog } from '../work-order-delete-dialog/work-order-delete-dialog';
import { WorkOrderMoveDialog } from '../work-order-move-dialog/work-order-move-dialog';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woInput, woLabel, woPrimary } from '../work-order-ui';
import { statusPayload, useWorkOrderWrites } from '../work-order-writes';
import { workOrdersRouteData as copy } from './work-orders-route.data';

export interface WorkOrdersRouteProps { workspaceId: string; viewerId: string; initialUpdatedAt: number; initial: WorkOrderListResult; initialQuery: WorkOrderQuery; initialDetail?: WorkOrderDetailResult; field: boolean; createForJobId?: string }
export function WorkOrdersRoute(props: WorkOrdersRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    {props.initialDetail ? <WorkOrderDetailRoute key={`${props.viewerId}:${props.workspaceId}:${props.initialDetail.workOrder.id}`} workspaceId={props.workspaceId} initial={props.initialDetail} initialUpdatedAt={props.initialUpdatedAt}/>
      : <WorkOrdersListRoute key={`${props.viewerId}:${props.workspaceId}`} {...props}/>}
  </ApiQueryScopeBoundary>;
}

function WorkOrdersListRoute({ workspaceId, initial, initialQuery, field, createForJobId, initialUpdatedAt }: WorkOrdersRouteProps) {
  const router = useRouter(), client = useQueryClient(), scope = useApiQueryScope();
  const [error, setError] = useState('');
  const [view, setView] = useState<WorkOrderListView>('table'), [page, setPage] = useState(initial.page), [pageSize, setPageSize] = useState(initial.pageSize);
  const [sort, setSort] = useState<WorkOrderListSort>({ column: initialQuery.sort ?? 'scheduledDate', direction: initialQuery.direction ?? 'asc' });
  const members = initial.options.members;
  const [filters, setFilters] = useState<WorkOrderListFilters>(() => ({ ...defaultWorkOrderListFilters, search: initialQuery.q ?? '', status: initialQuery.status ?? 'all',
    assignee: members.find(m => m.id === initialQuery.assigneeId)?.name ?? 'all', jobNumber: initialQuery.jobNumber ?? 'all', scheduledFrom: initialQuery.scheduledFrom ?? '',
    scheduledTo: initialQuery.scheduledTo ?? '', mine: field || (initialQuery.mine ?? false), archived: initialQuery.archived ?? false }));
  const writes = useWorkOrderWrites(workspaceId, copy.saveError);
  const [moving, setMoving] = useState<{ row: WorkOrderView; to: WorkOrderStatus | null }>();
  const [deleting, setDeleting] = useState<WorkOrderView>(), [exporting, setExporting] = useState(false);
  const [picking, setPicking] = useState(false), [pickedJobId, setPickedJobId] = useState(''), [chosenJob, setCreatingFor] = useState<JobView>(), [creationDismissed, setCreationDismissed] = useState(false);
  const jobsPath = '/api/jobs?' + new URLSearchParams({ workspace: workspaceId, pageSize: '100', closed: 'false', sort: 'number', direction: 'desc' });
  const jobsQuery = useApiQuery({ ...apiReadOptions(scope, 'jobs', { url: jobsPath }, jobsPath, raw => jobListResultSchema.parse(raw), copy.jobsError), enabled: picking });
  const jobs = jobsQuery.data?.rows, selectedJobId = pickedJobId || jobs?.[0]?.id || '';
  const creationJobQuery = useApiQuery({ ...apiReadOptions(scope, 'job-detail', { id: createForJobId, activityPage: 1 },
    `/api/jobs/${createForJobId ?? ''}?workspace=${encodeURIComponent(workspaceId)}`, raw => jobDetailResultSchema.parse(raw), copy.jobsError), enabled: !!createForJobId });
  const creatingFor = chosenJob ?? (creationDismissed ? undefined : creationJobQuery.data?.job);
  const visitQuery = useApiQuery({ ...apiReadOptions(scope, 'work-order-creation', { jobId: creatingFor?.id },
    '/api/work-orders/creation-visit?' + new URLSearchParams({ workspace: workspaceId, jobId: creatingFor?.id ?? '' }),
    raw => workOrderCreationVisitSchema.parse(raw), copy.jobsError), enabled: !!creatingFor, staleTime: 0 });
  const reloadVisit = () => { void visitQuery.refetch(); };
  const visitContext: CreateWorkOrderVisitContext = { state: visitQuery.isError ? 'error' : visitQuery.isPending || visitQuery.isFetching ? 'loading' : 'ready', visit: visitQuery.data ?? null };
  const url = useMemo(() => {
    const assignee = members.find(m => m.name === filters.assignee)?.id;
    return '/api/work-orders?' + new URLSearchParams({ workspace: workspaceId, q: filters.search, ...(filters.status !== 'all' ? { status: filters.status } : {}),
      ...(assignee ? { assigneeId: assignee } : {}), ...(filters.jobNumber !== 'all' ? { jobNumber: filters.jobNumber } : {}),
      ...(filters.scheduledFrom ? { scheduledFrom: filters.scheduledFrom } : {}), ...(filters.scheduledTo ? { scheduledTo: filters.scheduledTo } : {}),
      mine: String(filters.mine), archived: String(filters.archived), page: String(page), pageSize: String(pageSize), sort: sort.column, direction: sort.direction }).toString();
  }, [filters, members, page, pageSize, sort, workspaceId]);
  const [initialURL] = useState(url);
  const [readURL, setReadURL] = useState(url);
  useEffect(() => { const timer = setTimeout(() => setReadURL(url), 200); return () => clearTimeout(timer); }, [url]);
  const listQuery = useApiQuery({ ...apiReadOptions(scope, 'work-orders', { url: readURL }, readURL, raw => workOrderListResultSchema.parse(raw), copy.error),
    initialData: readURL === initialURL ? initial : undefined, initialDataUpdatedAt: initialUpdatedAt });
  const list = listQuery.data ?? initial, loading = listQuery.isPending;
  const denied = writes.denied || isApiAccessError(listQuery.error) || isApiAccessError(visitQuery.error);
  useEffect(() => { if (denied) router.refresh(); }, [denied, router]);
  const rows = useMemo(() => list.rows.map(toView), [list.rows]);
  const reset = (patch: () => void) => { patch(); setPage(1); };
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const refetch = () => { void invalidateWorkspaceResources(client, workspaceId, ['work-orders']).catch(() => setError(copy.error)); };
  useCalendarScheduleRefresh(refetch);
  const open = (w: WorkOrderView) => router.push(`/work-orders/${w.id}${query}`);
  async function move(row: WorkOrderView, payload: object) {
    const live = list.rows.find(r => r.id === row.id);
    if (!live) return false;
    const result = await writes.patch({ id: live.id, version: live.version }, payload);
    if (result) setMoving(undefined);
    if (result || writes.conflict) refetch();
    return !!result;
  }
  async function remove(row: WorkOrderView) {
    const live = list.rows.find(r => r.id === row.id);
    if (!live) { setDeleting(undefined); return; }
    const result = await writes.patch({ id: live.id, version: live.version }, { action: 'delete' });
    if (result || writes.conflict) { setDeleting(undefined); refetch(); }
  }
  async function exportCsv() {
    if (exporting) return;
    setExporting(true); setError('');
    try {
      const params = new URLSearchParams(url.split('?')[1]);
      const query: Record<string, string | boolean | number> = {};
      params.forEach((value, key) => { if (key !== 'workspace') query[key] = value === 'true' ? true : value === 'false' ? false : key === 'page' || key === 'pageSize' ? Number(value) : value; });
      const response = await fetch('/api/work-orders/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, query, expectedCount: list.total }) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? copy.exportError);
      const link = document.createElement('a'), href = URL.createObjectURL(await response.blob());
      link.href = href; link.download = 'work-orders.csv'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(href);
    } catch (e) { setError(e instanceof Error ? e.message : copy.exportError); }
    finally { setExporting(false); }
  }
  async function duplicate(row: WorkOrderView) {
    const created = await writes.create({ jobId: row.jobId, title: `${row.title}${copy.copySuffix}`.slice(0, 200), assigneeId: list.rows.find(r => r.id === row.id)?.primaryAssigneeId ?? null, source: { kind: 'duplicate', workOrderId: row.id } });
    if (created) router.push(`/work-orders/${created.workOrderId}${query}`); else refetch();
  }
  function onAction(row: WorkOrderView, action: WorkOrderListAction) {
    writes.clearError();
    if (action === 'open') open(row);
    else if (action === 'status') setMoving({ row, to: null });
    else if (action === 'cancel') setMoving({ row, to: 'canceled' });
    else if (action === 'archive') void move(row, { action: 'archive', archived: true });
    else if (action === 'delete') setDeleting(row);
    else if (action === 'duplicate') void duplicate(row);
    else if (action === 'print') window.open(`/work-orders/${row.id}/print${query}`, '_blank', 'noopener');
  }
  function requestMove(row: WorkOrderView, to: WorkOrderStatus) {
    writes.clearError();
    if (to === 'completed') open(row);
    else setMoving({ row, to });
  }
  function startPicking() { writes.clearError(); setPicking(true); }
  async function create(value: CreateWorkOrderValues) {
    const created = await writes.create({ jobId: value.jobId, title: value.title, assigneeId: value.assigneeId, source: value.source, visit: value.visit });
    if (created) router.push(`/work-orders/${created.workOrderId}${query}`);
    else { reloadVisit(); throw new Error(copy.saveError); }
  }
  const duplicateSources = creatingFor ? rows.filter(r => r.jobId === creatingFor.id).map(r => ({ value: r.id, label: copy.sourceDuplicate(r.number, r.title), detail: copy.sourceDuplicateDetail })) : [];
  if (denied) return <FormFeedback kind="error" message={copy.unavailable}/>;
  return <div className="grid min-w-0 gap-4">
    {listQuery.isError && <FormFeedback kind="error" message={copy.error}/>}
    {creationJobQuery.isError && <FormFeedback kind="error" message={copy.jobsError}/>}
    {(error || (writes.error && !moving && !creatingFor && !deleting)) && <FormFeedback kind="error" message={error || writes.error} />}
    {list.canCreate && <div className="flex justify-end"><button type="button" className={woPrimary} onClick={() => void startPicking()}>{copy.add}</button></div>}
    <WorkOrdersList rows={rows} total={list.total} page={list.page} pageSize={list.pageSize} filters={filters} sort={sort} metrics={list.metrics}
      members={members} jobNumbers={list.options.jobs.map(j => j.number)} view={view} onView={setView} field={field} state={loading ? 'loading' : listQuery.isError ? 'error' : 'ready'}
      pendingId={writes.pending ? moving?.row.id : undefined} onRequestMove={requestMove}
      onFilters={next => reset(() => setFilters(next))} onSort={next => reset(() => setSort(next))} onPage={setPage} onPageSize={n => reset(() => setPageSize(n))}
      onOpen={open} onAction={onAction} canExport={list.canExport} exporting={exporting} onExport={() => void exportCsv()} onRetry={refetch} />
    {moving && <WorkOrderMoveDialog key={`${moving.row.id}:${moving.to}`} open workOrder={moving.row} to={moving.to} pending={writes.pending} error={writes.error} onClose={() => setMoving(undefined)}
      onConfirm={(to, reason) => to === 'completed' ? open(moving.row) : void move(moving.row, statusPayload(to, reason))} />}
    {deleting && <WorkOrderDeleteDialog key={deleting.id} open number={deleting.number} title={deleting.title} pending={writes.pending} error={writes.error} onClose={() => setDeleting(undefined)} onConfirm={() => void remove(deleting)} />}
    {picking && !creatingFor && <JobDialog open title={copy.pickJob} description={copy.pickJobHint} confirmLabel={copy.continue} confirmDisabled={!selectedJobId || jobsQuery.isError || jobsQuery.isPending} error={jobsQuery.isError ? copy.jobsError : undefined} closeOnSubmit={false} onClose={() => setPicking(false)}
      onSubmit={() => { setCreatingFor(jobs?.find(j => j.id === selectedJobId)); setPicking(false); }}>
      {jobsQuery.isPending ? <p role="status" className="m-0 text-sm text-muted">{copy.loadingJobs}</p> : jobsQuery.isError ? <button type="button" className={woPrimary} onClick={() => void jobsQuery.refetch()}>{copy.retry}</button> : jobs && jobs.length === 0 ? <p role="status" className="m-0 text-sm text-muted">{copy.noJobs}</p>
        : <label className={woLabel}>{copy.pickJob}<select className={woInput} value={selectedJobId} onChange={e => setPickedJobId(e.target.value)}>{jobs?.map(j => <option key={j.id} value={j.id}>{j.number} · {j.title} · {j.customerName}</option>)}</select></label>}
    </JobDialog>}
    {creatingFor && <CreateWorkOrderDialog key={creatingFor.id} open job={{ id: creatingFor.id, number: creatingFor.number, title: creatingFor.title, customerName: creatingFor.customerName, address: creatingFor.location, ownerId: creatingFor.primaryOwnerId }}
      members={members} sources={duplicateSources} visitContext={{ ...visitContext, onReload: reloadVisit }} jobClosed={['completed', 'canceled'].includes(creatingFor.status)} canCreate={list.canCreate} pending={writes.pending} error={writes.error} onClose={() => { setCreatingFor(undefined); setCreationDismissed(true); }} onConfirm={create} />}
  </div>;
}

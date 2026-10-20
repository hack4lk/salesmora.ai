'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormFeedback, Pagination, Toast } from '@salesmora/ui';
import type { JobDetailResult, JobListResult, JobQuery, JobStatus, JobView } from '@salesmora/contracts';
import type { JobAction, JobFilters } from '../job-preview.types';
import { JobsMetrics } from '../jobs-metrics/jobs-metrics';
import { JobsToolbar, defaultJobFilters } from '../jobs-toolbar/jobs-toolbar';
import { JobsBoard } from '../jobs-board/jobs-board';
import { JobsTable } from '../jobs-table/jobs-table';
import { JobsEmptyState } from '../jobs-empty-state/jobs-empty-state';
import { JobWorkOrdersCard } from '../../work-orders/job-work-orders-card/job-work-orders-card';
import type { JobWorkOrderRow } from '../../work-orders/work-order-preview.types';
import { JobDetailPage } from '../job-detail-page/job-detail-page';
import { JobPeekDrawer } from '../job-peek-drawer/job-peek-drawer';
import { JobCreateDialog, type JobCreateValues } from '../job-create-dialog/job-create-dialog';
import { JobStatusDialog } from '../job-status-dialog/job-status-dialog';
import { JobScheduleDialog } from '../job-schedule-dialog/job-schedule-dialog';
import { JobDeadlineDialog } from '../job-deadline-dialog/job-deadline-dialog';
import { JobTeamDialog } from '../job-team-dialog/job-team-dialog';
import { jobButton, jobPrimary } from '../job-ui';
import { jobActivityView } from './job-activity';
import { jobsRouteData as copy } from './jobs-route.data';

class JobRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new JobRequestError(body.error ?? copy.error, response.status);
  return body as T;
}
function filtersFromQuery(query: JobQuery, field: boolean): JobFilters {
  return { ...defaultJobFilters, search: query.q ?? '', status: query.status ?? 'all', owner: query.unassigned ? 'unassigned' : query.ownerId ?? 'all',
    customer: query.customerName ?? 'all', service: query.service ?? 'all', deadline: query.deadline ?? 'all', createdAfter: query.createdAfter ?? '', closed: query.closed ?? false, mine: field || (query.mine ?? false) };
}
const noop = () => {};
export function JobsRoute({ workspaceId, initial, initialQuery, initialDetail, field, workOrders }: {
  workspaceId: string; initial: JobListResult; initialQuery: JobQuery; initialDetail?: JobDetailResult; field: boolean;
  workOrders?: { rows: JobWorkOrderRow[]; canCreate: boolean };
}) {
  const router = useRouter();
  const [list, setList] = useState(initial), [filters, setFilters] = useState(() => filtersFromQuery(initialQuery, field));
  const [customerIdFilter, setCustomerIdFilter] = useState(initialQuery.customerId);
  const [view, setView] = useState<'board' | 'table'>('board'), [page, setPage] = useState(initial.page), [pageSize, setPageSize] = useState(initial.pageSize);
  const [sort, setSort] = useState({ column: initialQuery.sort ?? 'number', direction: initialQuery.direction ?? 'asc' });
  const [detail, setDetail] = useState(initialDetail), [selected, setSelected] = useState<JobView | undefined>(initialDetail?.job);
  const [overlay, setOverlay] = useState<JobAction | 'create' | 'peek'>(), [target, setTarget] = useState<JobStatus>();
  const [error, setError] = useState(''), [conflict, setConflict] = useState(false), [pending, setPending] = useState(false), [loading, setLoading] = useState(false), [notice, setNotice] = useState('');
  const flight = useRef(false), writeReceipt = useRef<{ payload: string; id: string } | undefined>(undefined), querySequence = useRef(0);
  const listURL = '/api/jobs?' + new URLSearchParams({ workspace: workspaceId, q: filters.search,
    ...(filters.status !== 'all' ? { status: filters.status } : {}), ...(filters.owner === 'unassigned' ? { unassigned: 'true' } : filters.owner !== 'all' ? { ownerId: filters.owner } : {}),
    ...(customerIdFilter ? { customerId: customerIdFilter } : {}), ...(filters.customer !== 'all' ? { customerName: filters.customer } : {}), ...(filters.service !== 'all' ? { service: filters.service } : {}),
    ...(filters.createdAfter ? { createdAfter: filters.createdAfter } : {}), closed: String(filters.closed), mine: String(filters.mine), deadline: filters.deadline,
    page: String(page), pageSize: String(pageSize), sort: sort.column, direction: sort.direction }).toString();
  useEffect(() => {
    const controller = new AbortController(), sequence = ++querySequence.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const result = await request<JobListResult>(listURL, { signal: controller.signal }); if (querySequence.current === sequence) { setList(result); setPage(result.page); } }
      catch (e) { if (!controller.signal.aborted && querySequence.current === sequence) setError(e instanceof Error ? e.message : copy.error); }
      finally { if (!controller.signal.aborted && querySequence.current === sequence) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [listURL]);
  const detailURL = (id: string, activityPage = 1) => `/api/jobs/${id}?workspace=${encodeURIComponent(workspaceId)}&page=${activityPage}`;
  async function loadDetail(id: string, activityPage = 1) {
    const result = await request<JobDetailResult>(detailURL(id, activityPage));
    setDetail(result); setSelected(result.job); return result;
  }
  function close() { if (flight.current) return; setOverlay(undefined); setError(''); setConflict(false); writeReceipt.current = undefined; }
  async function reload() {
    if (flight.current) return;
    setError(''); setConflict(false); setOverlay(undefined); writeReceipt.current = undefined;
    try {
      const result = await request<JobListResult>(listURL); setList(result); setPage(result.page);
      if (selected && initialDetail) await loadDetail(selected.id);
      else setSelected(undefined);
    } catch (e) { setError(e instanceof Error ? e.message : copy.error); }
  }
  function openAction(job: JobView, action: JobAction, to?: JobStatus) {
    if (flight.current) return;
    setError(''); setConflict(false); writeReceipt.current = undefined; setSelected(job); setTarget(to);
    if (action === 'open' || action === 'note') router.push(`/jobs/${job.id}?workspace=${encodeURIComponent(workspaceId)}`);
    else setOverlay(action);
  }
  async function write(values: Record<string, unknown>, create = false) {
    if (flight.current) throw new Error('A save is already in progress.');
    if (!create && !selected) throw new Error(copy.unavailable);
    flight.current = true; querySequence.current++; setLoading(false); setPending(true); setError('');
    const payload = JSON.stringify({ workspaceId, ...(!create ? { jobId: selected!.id, expectedVersion: selected!.version } : {}), ...values });
    if (writeReceipt.current?.payload !== payload) writeReceipt.current = { payload, id: crypto.randomUUID() };
    let saved = false;
    try {
      const result = await request<{ jobId: string }>('/api/jobs' + (create ? '' : `/${selected!.id}`), { method: create ? 'POST' : 'PATCH', body: JSON.stringify({ ...JSON.parse(payload), submissionId: writeReceipt.current.id }) });
      saved = true; writeReceipt.current = undefined; setOverlay(undefined); setConflict(false);
      setNotice(create ? copy.created : values.action === 'note' ? copy.noteSaved : copy.saved);
      if (create) { router.push(`/jobs/${result.jobId}?workspace=${encodeURIComponent(workspaceId)}`); return; }
      const resultList = await request<JobListResult>(listURL); setList(resultList); setPage(resultList.page);
      if (initialDetail) await loadDetail(result.jobId, detail?.activityPage ?? 1);
      else setSelected(undefined);
    } catch (e) {
      if (saved) { setError(copy.savedReload); return; }
      setError(e instanceof Error ? e.message : copy.error);
      setConflict(e instanceof JobRequestError && e.status === 409);
      throw e;
    } finally { flight.current = false; setPending(false); }
  }
  async function create(values: JobCreateValues) {
    await write({ customerId: values.customerId, title: values.title, primaryOwnerId: values.primaryOwnerId, teamUserIds: values.teamUserIds,
      service: values.service, location: values.location, description: values.description, scheduledDate: values.scheduledDate,
      arrivalWindow: values.arrivalWindow, completionDeadline: values.completionDeadline }, true);
  }
  const common = { open: true, pending, error: error || undefined, conflict, onReload: reload, onClose: close };
  const job = selected;
  const related = detail ? [
    ...(detail.job.customerId ? [{ id: detail.job.customerId, kind: 'customer' as const, label: detail.job.customerName, canOpen: detail.canOpenCustomer }] : []),
    ...(detail.job.sourceLeadId ? [{ id: detail.job.sourceLeadId, kind: 'lead' as const, label: 'Source lead', canOpen: detail.canOpenLead }] : []),
  ] : [];
  return <div className="grid min-w-0 gap-6">
    {error && !overlay && <FormFeedback kind="error" message={error}/>}
    {error && !overlay && <button className={`${jobButton} justify-self-start`} onClick={reload}>{copy.reload}</button>}
    {initialDetail && detail ? <>
      <JobDetailPage job={detail.job} today={list.today} activity={detail.activity.map(jobActivityView)} files={[]} messages={[]} related={related}
        extendedFeatures={false} assistantAvailable={false} workspaceId={workspaceId}
        workOrdersSlot={workOrders && <JobWorkOrdersCard workOrders={workOrders.rows} canCreate={workOrders.canCreate} jobClosed={['completed', 'canceled'].includes(detail.job.status)}
          onOpen={id => router.push(`/work-orders/${id}?workspace=${encodeURIComponent(workspaceId)}`)}
          onAdd={() => router.push(`/work-orders?workspace=${encodeURIComponent(workspaceId)}&newForJob=${detail.job.id}`)} />} onBack={() => router.push(`/jobs?workspace=${encodeURIComponent(workspaceId)}`)}
        onAction={a => openAction(detail.job, a)} onNote={body => write({ action: 'note', body })}
        onAssistant={noop} onMessage={noop} onAddFile={noop} onOpenFile={noop} onDownloadFile={noop} onRemoveFile={noop}
        onRelated={(id, kind) => router.push(`/${kind === 'customer' ? 'customers' : 'leads'}/${id}?workspace=${encodeURIComponent(workspaceId)}`)}/>
      {detail.activityTotal > 20 && <section aria-label={copy.history}><Pagination total={detail.activityTotal} page={detail.activityPage} pageSize={20} pageSizeOptions={[20]} onPageSizeChange={noop}
        onPageChange={p => { loadDetail(detail.job.id, p).catch(e => setError(e.message)); }}/></section>}
    </> : <>
      <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="m-0 text-heading-lg font-semibold">{copy.title}</h1><p className="mb-0 mt-2 text-base text-muted">{copy.description}</p></div>
        {list.canCreate && <button className={jobPrimary} disabled={pending} onClick={() => { close(); setOverlay('create'); }}>{copy.create}</button>}</header>
      <JobsMetrics {...list.metrics}/>
      <JobsToolbar value={filters} members={list.options.members} customers={list.options.customerNames} services={list.options.services} count={list.total} view={view} field={field}
        onView={setView} onChange={v => { setCustomerIdFilter(undefined); setFilters(v); setPage(1); }}/>
      <div aria-busy={loading}>
        {!list.rows.length ? <JobsEmptyState kind={filters.closed ? 'closed' : filters.search || filters.status !== 'all' || filters.customer !== 'all' || filters.service !== 'all' || filters.owner !== 'all' || filters.deadline !== 'all' || filters.createdAfter ? 'filtered' : 'empty'}
          canCreate={list.canCreate} onCreate={() => setOverlay('create')} onClear={() => { setCustomerIdFilter(undefined); setFilters({ ...defaultJobFilters, mine: field }); setPage(1); }}/>
          : view === 'board' ? <JobsBoard rows={list.rows} today={list.today} closed={filters.closed}
            onOpen={j => { setError(''); setSelected(j); setOverlay('peek'); }} onAction={openAction} onRequestMove={(j, to) => openAction(j, 'status', to)}/>
          : <JobsTable rows={list.rows} today={list.today} onOpen={j => { setSelected(j); setOverlay('peek'); }} onAction={openAction} sort={sort}
            onSort={(column, direction) => { setSort({ column: column as typeof sort.column, direction }); setPage(1); }}/>
        }
      </div>
      <Pagination total={list.total} page={list.page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={n => { setPageSize(n); setPage(1); }}/>
    </>}
    {overlay === 'peek' && job && <JobPeekDrawer open job={job} today={list.today} onClose={close} onOpen={() => openAction(job, 'open')} onAction={a => openAction(job, a)}/>}
    {overlay === 'create' && <JobCreateDialog {...common} members={list.options.members} customers={list.options.customers} allowNewCustomer={false}
      canSchedule={list.canScheduleCreation} onConfirm={create}/>}
    {overlay === 'status' && job && <JobStatusDialog key={`${job.id}:${job.version}:${target}`} {...common} job={job}
      initialTo={target ?? (['completed', 'canceled', 'needs-scheduling'].includes(job.status) ? 'in-progress' : job.status === 'in-progress' ? 'waiting' : 'in-progress')}
      onConfirm={v => write({ action: 'status', ...v })} onSchedule={job.capabilities.schedule ? () => setOverlay('schedule') : undefined}/>}
    {overlay === 'schedule' && job && <JobScheduleDialog key={job.version} {...common} job={job} today={list.today} onConfirm={v => write({ action: 'schedule', ...v })}/>}
    {overlay === 'deadline' && job && <JobDeadlineDialog key={job.version} {...common} job={job} today={list.today} onConfirm={date => write({ action: 'deadline', completionDeadline: date })}/>}
    {overlay === 'team' && job && <JobTeamDialog key={job.version} {...common} job={job} members={list.options.members} onConfirm={v => write({ action: 'assign', ...v })}/>}
    <Toast open={!!notice} kind="success" message={notice} autoHideMs={2000} onClose={() => setNotice('')}/>
  </div>;
}

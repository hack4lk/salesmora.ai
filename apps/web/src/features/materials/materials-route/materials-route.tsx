'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary, useApiQueryScope } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { useApiMutation } from '../../api/use-api-mutation';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { isApiAccessError } from '../../api/api-query';
import { ApiRequestError } from '../../api/api-request';
import { FormFeedback } from '@salesmora/ui';
import { materialListResultSchema, materialSavedResultSchema, type MaterialListResult, type MaterialQuery, type MaterialView } from '@salesmora/contracts';
import { MaterialsPage } from '../materials-page/materials-page';
import { defaultMaterialsFilters, type MaterialsPageFilters, type MaterialsPageSort } from '../materials-page.types';
import { MaterialDialog, type MaterialDialogMode } from '../material-dialog/material-dialog';
import { MaterialRejectDialog } from '../material-reject-dialog/material-reject-dialog';
import { MaterialArchiveDialog } from '../material-archive-dialog/material-archive-dialog';
import { fieldsFromForm, patchFromForm, type MaterialFormValues } from '../material-dialog/material-form';
import { createReceipts } from '../../work-orders/work-order-client';
import { materialsRouteData as copy } from './materials-route.data';

type Dialog = { mode: MaterialDialogMode; row?: MaterialView };

export interface MaterialsRouteProps { workspaceId: string; viewerId: string; initialUpdatedAt: number; initial: MaterialListResult; initialQuery: MaterialQuery }
export function MaterialsRoute(props: MaterialsRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <MaterialsContent key={`${props.viewerId}:${props.workspaceId}`} {...props}/>
  </ApiQueryScopeBoundary>;
}
function MaterialsContent({ workspaceId, initial, initialQuery, initialUpdatedAt }: MaterialsRouteProps) {
  const client = useQueryClient(), scope = useApiQueryScope(), router = useRouter();
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [blocked, setBlocked] = useState(false);
  const [page, setPage] = useState(initial.page), [pageSize, setPageSize] = useState(initial.pageSize);
  const [sort, setSort] = useState<MaterialsPageSort>({ column: initialQuery.sort ?? 'name', direction: initialQuery.direction ?? 'asc' });
  const [filters, setFilters] = useState<MaterialsPageFilters>({ ...defaultMaterialsFilters, q: initialQuery.q ?? '', category: initialQuery.category ?? 'all', supplier: initialQuery.supplier ?? 'all', archived: initialQuery.archived ?? false, status: initialQuery.status ?? 'active' });
  const [dialog, setDialog] = useState<Dialog>(), [rejecting, setRejecting] = useState<MaterialView>(), [archiving, setArchiving] = useState<{ row: MaterialView; restore: boolean }>();
  const [pending, setPending] = useState(false), [writeError, setWriteError] = useState(''), [conflict, setConflict] = useState(false);
  const [exporting, setExporting] = useState(false);
  const flight = useRef(false), receipts = useRef(createReceipts());

  const url = useMemo(() => '/api/materials?' + new URLSearchParams({
    workspace: workspaceId, q: filters.q, ...(filters.category !== 'all' ? { category: filters.category } : {}), ...(filters.supplier !== 'all' ? { supplier: filters.supplier } : {}),
    status: filters.status, archived: String(filters.archived), page: String(page), pageSize: String(pageSize), sort: sort.column, direction: sort.direction,
  }).toString(), [filters, page, pageSize, sort, workspaceId]);

  const [initialURL] = useState(url);
  const [readURL, setReadURL] = useState(url);
  useEffect(() => { const timer = setTimeout(() => setReadURL(url), 200); return () => clearTimeout(timer); }, [url]);
  const query = useApiQuery({ ...apiReadOptions(scope, 'materials', { url: readURL }, readURL, raw => materialListResultSchema.parse(raw), copy.error),
    initialData: readURL === initialURL ? initial : undefined, initialDataUpdatedAt: initialUpdatedAt });
  const list = query.data ?? initial, loading = query.isPending, denied = blocked || isApiAccessError(query.error);
  const mutation = useApiMutation('materials', raw => materialSavedResultSchema.parse(raw), copy.saveError);
  useEffect(() => { if (denied) router.refresh(); }, [denied, router]);
  const reload = () => { setError(''); void query.refetch(); };
  const clearWrite = () => { setWriteError(''); setConflict(false); };
  async function write(payload: Record<string, unknown>, done: string): Promise<boolean> {
    if (flight.current) return false;
    flight.current = true; setPending(true); clearWrite(); setNotice('');
    try {
      const submissionId = receipts.current(payload);
      await mutation.mutateAsync({ path: '/api/materials', method: 'POST', body: { workspaceId, submissionId, ...payload } });
      setNotice(done);
      try { await invalidateWorkspaceResources(client, workspaceId, ['materials', 'work-orders', 'estimates', 'home', 'reports']); }
      catch { setError(copy.savedReload); }
      return true;
    } catch (e) {
      if (isApiAccessError(e)) setBlocked(true);
      setWriteError(e instanceof Error ? e.message : copy.saveError); setConflict(e instanceof ApiRequestError && e.status === 409);
      return false;
    } finally { flight.current = false; setPending(false); }
  }
  const access = { canViewCosts: list.canViewCosts, canViewPrices: list.canViewPrices };
  const target = (row: MaterialView) => ({ materialId: row.id, expectedVersion: row.version });
  const closeDialog = () => { setDialog(undefined); clearWrite(); };
  async function submit(values: MaterialFormValues) {
    if (!dialog) return;
    const { mode, row } = dialog;
    const ok = mode === 'create' || mode === 'propose' ? await write({ action: mode, item: fieldsFromForm(values, access) }, copy.saved[mode])
      : row && (await write({ action: mode === 'edit' ? 'update' : 'approve', ...target(row), item: patchFromForm(values, row, access) }, copy.saved[mode === 'edit' ? 'update' : 'approve']));
    if (ok) closeDialog();
  }
  // An edit with no changes would be rejected by the server, so it closes quietly instead.
  const submitEdit = async (values: MaterialFormValues) => {
    if (dialog?.mode === 'edit' && dialog.row && Object.keys(patchFromForm(values, dialog.row, access)).length === 0) { closeDialog(); return; }
    await submit(values);
  };
  async function exportCsv() {
    if (exporting) return;
    setExporting(true); setError('');
    try {
      const query = { q: filters.q, ...(filters.category !== 'all' ? { category: filters.category } : {}), ...(filters.supplier !== 'all' ? { supplier: filters.supplier } : {}), status: filters.status, archived: filters.archived, sort: sort.column, direction: sort.direction };
      const response = await fetch('/api/materials/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, query, expectedCount: list.total }) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? copy.exportError);
      const link = document.createElement('a'), href = URL.createObjectURL(await response.blob());
      link.href = href; link.download = 'materials.csv'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(href);
    } catch (e) { setError(e instanceof Error ? e.message : copy.exportError); }
    finally { setExporting(false); }
  }
  const reloadAfterConflict = () => { clearWrite(); closeDialog(); setRejecting(undefined); setArchiving(undefined); reload(); };

  if (denied) return <FormFeedback kind="error" message={copy.unavailable}/>;
  return (
    <div className="grid min-w-0 gap-6">
      <header><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-3 text-base leading-relaxed text-muted">{copy.description}</p></header>
      {notice && <div role="status"><FormFeedback kind="success" message={notice} /></div>}
      {(error || query.isError) && !loading && <FormFeedback kind="error" message={error || copy.error} />}
      <MaterialsPage {...list} canExport={list.canExport} exporting={exporting} onExport={() => void exportCsv()} filters={filters} sort={sort} state={loading ? 'loading' : query.isError ? 'error' : 'ready'} pendingId={pending ? (dialog?.row ?? rejecting ?? archiving?.row)?.id : undefined}
        onFilters={next => { setFilters(next); setPage(1); }} onSort={next => { setSort(next); setPage(1); }} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1); }}
        onAdd={() => { clearWrite(); setDialog({ mode: list.canManage ? 'create' : 'propose' }); }} onEdit={row => { clearWrite(); setDialog({ mode: 'edit', row }); }}
        onArchive={row => { clearWrite(); setArchiving({ row, restore: false }); }} onRestore={row => { clearWrite(); setArchiving({ row, restore: true }); }}
        onApprove={row => { clearWrite(); setDialog({ mode: 'approve', row }); }} onReject={row => { clearWrite(); setRejecting(row); }}
        onWithdraw={row => void write({ action: 'withdraw', ...target(row) }, copy.saved.withdraw)} onRetry={reload} />
      <MaterialDialog open={!!dialog} mode={dialog?.mode ?? 'create'} material={dialog?.row} {...access} categories={list.options.categories} suppliers={list.options.suppliers} existingNames={list.rows.map(row => row.name)}
        pending={pending} error={conflict ? undefined : writeError} conflict={conflict} onReload={reloadAfterConflict} onClose={closeDialog} onSubmit={submitEdit} />
      <MaterialRejectDialog open={!!rejecting} name={rejecting?.name ?? ''} pending={pending} error={conflict ? undefined : writeError} conflict={conflict} onReload={reloadAfterConflict} onClose={() => { setRejecting(undefined); clearWrite(); }}
        onSubmit={async reason => { if (rejecting && await write({ action: 'reject', ...target(rejecting), reason }, copy.saved.reject)) { setRejecting(undefined); } }} />
      <MaterialArchiveDialog open={!!archiving} name={archiving?.row.name ?? ''} restore={archiving?.restore} pending={pending} error={writeError} onClose={() => { setArchiving(undefined); clearWrite(); }}
        onConfirm={async () => { if (archiving && await write({ action: 'archive', ...target(archiving.row), archived: !archiving.restore }, copy.saved[archiving.restore ? 'restore' : 'archive'])) setArchiving(undefined); }} />
    </div>
  );
}

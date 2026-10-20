'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import type { MaterialListResult, MaterialQuery, MaterialView } from '@salesmora/contracts';
import { MaterialsPage } from '../materials-page/materials-page';
import { defaultMaterialsFilters, type MaterialsPageFilters, type MaterialsPageSort } from '../materials-page.types';
import { MaterialDialog, type MaterialDialogMode } from '../material-dialog/material-dialog';
import { MaterialRejectDialog } from '../material-reject-dialog/material-reject-dialog';
import { MaterialArchiveDialog } from '../material-archive-dialog/material-archive-dialog';
import { fieldsFromForm, patchFromForm, type MaterialFormValues } from '../material-dialog/material-form';
import { createReceipts, workOrderRequest, WorkOrderRequestError } from '../../work-orders/work-order-client';
import { materialsRouteData as copy } from './materials-route.data';

async function load(url: string, signal: AbortSignal): Promise<MaterialListResult> {
  const response = await fetch(url, { cache: 'no-store', signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? copy.error);
  return body;
}

type Dialog = { mode: MaterialDialogMode; row?: MaterialView };

export function MaterialsRoute({ workspaceId, initial, initialQuery }: { workspaceId: string; initial: MaterialListResult; initialQuery: MaterialQuery }) {
  const [list, setList] = useState(initial), [error, setError] = useState(''), [notice, setNotice] = useState(''), [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initial.page), [pageSize, setPageSize] = useState(initial.pageSize);
  const [sort, setSort] = useState<MaterialsPageSort>({ column: initialQuery.sort ?? 'name', direction: initialQuery.direction ?? 'asc' });
  const [filters, setFilters] = useState<MaterialsPageFilters>({ ...defaultMaterialsFilters, q: initialQuery.q ?? '', category: initialQuery.category ?? 'all', supplier: initialQuery.supplier ?? 'all', archived: initialQuery.archived ?? false, status: initialQuery.status ?? 'active' });
  const [refresh, setRefresh] = useState(0), sequence = useRef(0), first = useRef(true);
  const [dialog, setDialog] = useState<Dialog>(), [rejecting, setRejecting] = useState<MaterialView>(), [archiving, setArchiving] = useState<{ row: MaterialView; restore: boolean }>();
  const [pending, setPending] = useState(false), [writeError, setWriteError] = useState(''), [conflict, setConflict] = useState(false);
  const [exporting, setExporting] = useState(false);
  const flight = useRef(false), receipts = useRef(createReceipts());

  const url = useMemo(() => '/api/materials?' + new URLSearchParams({
    workspace: workspaceId, q: filters.q, ...(filters.category !== 'all' ? { category: filters.category } : {}), ...(filters.supplier !== 'all' ? { supplier: filters.supplier } : {}),
    status: filters.status, archived: String(filters.archived), page: String(page), pageSize: String(pageSize), sort: sort.column, direction: sort.direction,
  }).toString(), [filters, page, pageSize, sort, workspaceId]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const controller = new AbortController(), current = ++sequence.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const result = await load(url, controller.signal); if (sequence.current === current) { setList(result); setPage(result.page); setError(''); } }
      catch (e) { if (!controller.signal.aborted && sequence.current === current) setError(e instanceof Error ? e.message : copy.error); }
      finally { if (!controller.signal.aborted && sequence.current === current) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [url, refresh]);

  const reload = () => setRefresh(value => value + 1);
  const clearWrite = () => { setWriteError(''); setConflict(false); };
  async function write(payload: Record<string, unknown>, done: string): Promise<boolean> {
    if (flight.current) return false;
    flight.current = true; setPending(true); clearWrite(); setNotice('');
    try {
      const submissionId = receipts.current(payload);
      await workOrderRequest('/api/materials', { method: 'POST', body: JSON.stringify({ workspaceId, submissionId, ...payload }) }, copy.saveError);
      setNotice(done); reload();
      return true;
    } catch (e) {
      setWriteError(e instanceof Error ? e.message : copy.saveError); setConflict(e instanceof WorkOrderRequestError && e.status === 409);
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

  return (
    <div className="grid min-w-0 gap-6">
      <header><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-3 text-base leading-relaxed text-muted">{copy.description}</p></header>
      {notice && <div role="status"><FormFeedback kind="success" message={notice} /></div>}
      {error && !loading && <FormFeedback kind="error" message={error} />}
      <MaterialsPage {...list} canExport={list.canExport} exporting={exporting} onExport={() => void exportCsv()} filters={filters} sort={sort} state={loading ? 'loading' : error ? 'error' : 'ready'} pendingId={pending ? (dialog?.row ?? rejecting ?? archiving?.row)?.id : undefined}
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

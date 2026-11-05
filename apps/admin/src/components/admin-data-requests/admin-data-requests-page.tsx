'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { DeletionRequestQueue } from './deletion-request-queue';
import type {
  AdminDataRequestRole,
  AdminDataRequestFilter,
  AdminDeletionRequest,
  AdminExportWorkspace,
  AdminWorkspaceExport,
} from './admin-data-requests.types';
import { WorkspaceExportList } from './workspace-export-list';
import { WorkspaceExportRequestDialog } from './workspace-export-request-dialog';
import type { WorkspaceExportRequestDialogProps } from './workspace-export-request-dialog';

export interface AdminDataRequestsPageProps {
  role: AdminDataRequestRole;
  deletionRequests: readonly AdminDeletionRequest[];
  workspaceExports: readonly AdminWorkspaceExport[];
  exportWorkspaces: readonly AdminExportWorkspace[];
  loading?: boolean;
  error?: string;
  deletionFilter?: AdminDataRequestFilter;
  deletionPage?: number;
  deletionPageSize?: number;
  deletionTotal?: number;
  allDeletionTotal?: number;
  retryScheduledTotal?: number;
  exportMethods?: readonly ('passkey' | 'totp')[];
  exportsAvailable?: boolean;
  exportRequestsEnabled?: boolean;
  onRefresh?: () => void;
  onDeletionFilterChange?: (filter: AdminDataRequestFilter) => void;
  onDeletionPageChange?: (page: number) => void;
  onStartExport?: WorkspaceExportRequestDialogProps['onStartExport'];
  onVerifyExport?: WorkspaceExportRequestDialogProps['onVerifyExport'];
  onRequestExport?: WorkspaceExportRequestDialogProps['onRequestExport'];
}

type DataRequestTab = 'deletions' | 'exports';

export function AdminDataRequestsPage({
  role,
  deletionRequests,
  workspaceExports,
  exportWorkspaces,
  loading = false,
  error,
  deletionFilter,
  deletionPage = 0,
  deletionPageSize = 20,
  deletionTotal = deletionRequests.length,
  allDeletionTotal = deletionTotal,
  retryScheduledTotal = deletionRequests.filter(request =>
    request.state === 'pending' && request.lastError !== null).length,
  exportMethods = [],
  exportsAvailable = true,
  exportRequestsEnabled = true,
  onRefresh,
  onDeletionFilterChange,
  onDeletionPageChange,
  onStartExport,
  onVerifyExport,
  onRequestExport,
}: AdminDataRequestsPageProps) {
  const [activeTab, setActiveTab] = useState<DataRequestTab>('deletions');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const canAccess = role === 'super_admin' || role === 'support';
  const inProgressExports = workspaceExports.filter(item => item.state === 'queued' || item.state === 'generating').length;
  const readyExports = workspaceExports.filter(item => item.state === 'ready').length;

  return <div className="mx-auto grid w-full max-w-7xl gap-5 p-4 text-slate-900 sm:p-6">
    <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Privacy operations</p>
        <h1 className="m-0 text-2xl font-bold tracking-tight" id="admin-title">Data requests</h1>
        <p className="mb-0 mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {exportRequestsEnabled
            ? 'Review customer deletion processing and prepare verified workspace-owner data exports.'
            : exportsAvailable
              ? 'Review customer deletion and workspace export processing. New exports are temporarily disabled.'
              : 'Review the persisted status of customer deletion requests.'}
        </p>
      </div>
      {canAccess && <div className="flex flex-wrap gap-2">
        {onRefresh && <button type="button" onClick={onRefresh}
          className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">
          Refresh
        </button>}
        {exportRequestsEnabled && onStartExport && onVerifyExport && onRequestExport && <button type="button" onClick={() => { setSuccess(''); setRequestDialogOpen(true); }}
          className="min-h-11 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">
          Request workspace export
        </button>}
      </div>}
    </header>

    {success && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{success}</div>}
    {error && <FormFeedback kind="error" message={error} />}
    {!canAccess ? <div role="alert" className="rounded-xl border border-line bg-paper p-6 text-sm text-muted">
      Your current role cannot access data requests.
    </div> : <>
      <section className={`grid gap-3 sm:grid-cols-2 ${exportsAvailable ? 'xl:grid-cols-4' : 'xl:grid-cols-2'}`}
        aria-label="Request summary">
        <Metric label="Deletion requests" value={allDeletionTotal} detail="Account and workspace requests" />
        <Metric label="Retry scheduled" value={retryScheduledTotal} detail="Next retry follows the worker schedule" />
        {exportsAvailable && <>
          <Metric label="Exports in progress" value={inProgressExports} detail="Queued or generating" />
          <Metric label="Ready for Owner" value={readyExports} detail="Owner sign-in required · expires after 7 days" />
        </>}
      </section>

      <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
        <strong>Deletion actions are not available here.</strong> Customer deletion blocks access immediately and the worker permanently processes the request.
        Admin cancellation, expedite and confirmation are deferred until deletion grace rules are defined.
      </div>

      <div className="flex gap-2 border-b border-line" role="tablist" aria-label="Data request type">
        <Tab active={activeTab === 'deletions'} id="deletion-tab" panelId="deletion-panel"
          onClick={() => setActiveTab('deletions')}>
          Deletion requests <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{allDeletionTotal}</span>
        </Tab>
        <Tab active={activeTab === 'exports'} id="export-tab" panelId="export-panel"
          onClick={() => setActiveTab('exports')}>
          Workspace exports {exportsAvailable
            ? <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{workspaceExports.length}</span>
            : <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">Unavailable</span>}
        </Tab>
      </div>

      <section role="tabpanel" id="deletion-panel" aria-labelledby="deletion-tab" hidden={activeTab !== 'deletions'}>
        {activeTab === 'deletions' && (loading ? <LoadingState />
          : !error && <DeletionRequestQueue requests={deletionRequests} filter={deletionFilter}
            page={deletionPage} pageSize={deletionPageSize} total={deletionTotal}
            onFilterChange={onDeletionFilterChange} onPageChange={onDeletionPageChange} />)}
      </section>
      <section role="tabpanel" id="export-panel" aria-labelledby="export-tab" hidden={activeTab !== 'exports'}>
        {activeTab === 'exports' && (loading ? <LoadingState /> : !error && (exportsAvailable
          ? <div className="grid gap-4">
            {!exportRequestsEnabled && <p role="note" className="m-0 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
              New export requests are disabled until the worker, private storage, and export key are configured.
            </p>}
            <WorkspaceExportList exports={workspaceExports} />
          </div>
          : <p role="note" className="rounded-xl border border-line bg-paper p-6 text-sm leading-6 text-muted">
            Workspace export management is not available yet. No exports can be requested or viewed from this page.
          </p>))}
      </section>
    </>}

    {canAccess && exportRequestsEnabled && onStartExport && onVerifyExport && onRequestExport && <WorkspaceExportRequestDialog open={requestDialogOpen}
      workspaces={exportWorkspaces} methods={exportMethods}
      onClose={() => setRequestDialogOpen(false)} onStartExport={onStartExport}
      onVerifyExport={onVerifyExport} onRequestExport={onRequestExport} onSuccess={setSuccess} />}
  </div>;
}

function LoadingState() {
  return <p role="status" className="py-8 text-center text-sm text-muted">Loading data requests…</p>;
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="rounded-xl border border-line bg-paper p-4">
    <span className="text-xs font-semibold text-muted">{label}</span>
    <strong className="mt-1 block text-2xl font-bold tabular-nums">{value}</strong>
    <span className="mt-1 block text-xs text-muted">{detail}</span>
  </div>;
}

function Tab({ active, id, panelId, onClick, children }: {
  active: boolean;
  id: string;
  panelId: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return <button id={id} type="button" role="tab" aria-controls={panelId} aria-selected={active}
    tabIndex={active ? 0 : -1} onClick={onClick}
    className={`min-h-11 cursor-pointer border-b-2 px-3 text-sm font-semibold focus-visible:focus-ring ${
      active ? 'border-blue-700 text-blue-900' : 'border-transparent text-muted hover:text-ink'
    }`}>{children}</button>;
}

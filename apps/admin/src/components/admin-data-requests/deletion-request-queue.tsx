'use client';

import { useState } from 'react';
import {
  DataRequestDetail,
  DataRequestDetailsDialog,
  DataRequestEmptyState,
  DataRequestStatus,
  formatDataRequestDateTime,
} from './admin-data-request-ui';
import type { AdminDataRequestFilter, AdminDeletionRequest } from './admin-data-requests.types';

type DeletionFilter = AdminDataRequestFilter;

export interface DeletionRequestQueueProps {
  requests: readonly AdminDeletionRequest[];
  filter?: DeletionFilter;
  page?: number;
  pageSize?: number;
  total?: number;
  onFilterChange?: (filter: DeletionFilter) => void;
  onPageChange?: (page: number) => void;
}

const stateLabel = (request: AdminDeletionRequest) => request.state === 'completed'
  ? 'Completed' : request.lastError ? 'Retry scheduled' : 'Pending';

export function DeletionRequestQueue({
  requests, filter, page = 0, pageSize = 20, total, onFilterChange, onPageChange,
}: DeletionRequestQueueProps) {
  const [localFilter, setLocalFilter] = useState<DeletionFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<AdminDeletionRequest | null>(null);
  const selectedFilter = filter ?? localFilter;
  const filteredRequests = onFilterChange ? requests : requests.filter(request => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'completed') return request.state === 'completed';
    if (selectedFilter === 'retry') return request.state === 'pending' && request.lastError === 'retry_required';
    return request.state === 'pending';
  });
  const resultStart = total === undefined || total === 0 ? 0 : page * pageSize + 1;
  const resultEnd = total === undefined ? 0 : Math.min((page + 1) * pageSize, total);

  return <>
    <section className="overflow-hidden rounded-xl border border-line bg-paper" aria-labelledby="deletion-heading">
      <div className="flex flex-col items-start justify-between gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
        <div><h2 id="deletion-heading" className="m-0 text-base font-semibold">Account deletion queue</h2>
          <p className="mb-0 mt-1 text-xs leading-5 text-muted">Worker status reflects persisted queue state, attempt count and next retry time.</p></div>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="deletion-filter">Filter deletion requests</label>
          <select id="deletion-filter" value={selectedFilter}
            onChange={event => {
              const nextFilter = event.target.value as DeletionFilter;
              if (onFilterChange) onFilterChange(nextFilter);
              else setLocalFilter(nextFilter);
            }}
            className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:focus-ring">
            <option value="all">All requests</option><option value="pending">Pending</option>
            <option value="retry">Retry scheduled</option><option value="completed">Completed</option>
          </select>
        </div>
      </div>
      {filteredRequests.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted"><tr>
            <th scope="col" className="p-3">Customer / request</th><th scope="col" className="p-3">Workspace</th>
            <th scope="col" className="p-3">Requested</th><th scope="col" className="p-3">Worker status</th>
            <th scope="col" className="p-3">Attempts / next retry</th><th scope="col" className="p-3"><span className="sr-only">Details</span></th>
          </tr></thead>
          <tbody>{filteredRequests.map(request => <tr key={request.id} className="border-t border-line text-sm">
            <td className="p-3"><strong className="block font-semibold">{request.customerName}</strong>
              <span className="text-xs text-muted">{request.maskedEmail} · <code>{request.id}</code></span></td>
            <td className="p-3">{request.workspaceName ?? 'Personal account'}</td>
            <td className="p-3">{formatDataRequestDateTime(request.requestedAt)}</td>
            <td className="p-3"><DataRequestStatus label={stateLabel(request)}
              tone={request.state === 'completed' ? 'success' : request.lastError ? 'warning' : 'info'} /></td>
            <td className="p-3">{request.attempts} {request.attempts === 1 ? 'attempt' : 'attempts'}
              <span className="block text-xs text-muted">{formatDataRequestDateTime(request.retryAt)}</span></td>
            <td className="p-3"><button type="button" aria-haspopup="dialog" onClick={() => setSelectedRequest(request)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring">Details</button></td>
          </tr>)}</tbody>
        </table>
      </div> : <DataRequestEmptyState>No deletion requests match this view.</DataRequestEmptyState>}
      {total !== undefined && onPageChange && <nav className="flex items-center justify-between gap-3 border-t border-line p-4 text-xs text-muted"
        aria-label="Deletion request pagination">
        <p className="m-0">{total === 0 ? 'No requests' : `Showing ${resultStart}–${resultEnd} of ${total} requests`}</p>
        <div className="flex gap-2">
          <button type="button" disabled={page === 0} onClick={() => onPageChange?.(page - 1)}
            className="min-h-10 cursor-pointer rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <button type="button" disabled={resultEnd >= total} onClick={() => onPageChange?.(page + 1)}
            className="min-h-10 cursor-pointer rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      </nav>}
    </section>
    <p className="m-0 text-xs leading-5 text-muted">Pending means the worker has not committed the purge. Retry status uses the generic worker marker; the page does not imply a finer processing stage than the worker records.</p>
    {selectedRequest && <DataRequestDetailsDialog title={`Deletion request · ${selectedRequest.customerName}`}
      onClose={() => setSelectedRequest(null)}>
      <DataRequestDetail label="Customer">{selectedRequest.maskedEmail}</DataRequestDetail>
      <DataRequestDetail label="Workspace">{selectedRequest.workspaceName ?? 'Personal account'}</DataRequestDetail>
      <DataRequestDetail label="Requested">{formatDataRequestDateTime(selectedRequest.requestedAt)}</DataRequestDetail>
      <DataRequestDetail label="Worker state">{stateLabel(selectedRequest)}</DataRequestDetail>
      <DataRequestDetail label="Attempts">{selectedRequest.attempts}</DataRequestDetail>
      <DataRequestDetail label="Next retry">{formatDataRequestDateTime(selectedRequest.retryAt)}</DataRequestDetail>
      <DataRequestDetail label="Last worker result">{selectedRequest.lastError ? 'Retry required' : '—'}</DataRequestDetail>
      <DataRequestDetail label="Completed">{formatDataRequestDateTime(selectedRequest.completedAt)}</DataRequestDetail>
      <p className="mb-0 mt-4 rounded-lg bg-canvas p-3 text-sm leading-6 text-muted">
        Access was revoked when the customer submitted the request. The worker performs the irreversible purge. Admin cancellation, expedite and confirmation are not available while grace rules are undefined.
      </p>
    </DataRequestDetailsDialog>}
  </>;
}

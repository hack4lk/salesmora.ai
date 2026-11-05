'use client';

import { useState } from 'react';
import {
  DataRequestDetail,
  DataRequestDetailsDialog,
  DataRequestEmptyState,
  DataRequestStatus,
  formatDataRequestDateTime,
} from './admin-data-request-ui';
import type { AdminWorkspaceExport } from './admin-data-requests.types';

export interface WorkspaceExportListProps {
  exports: readonly AdminWorkspaceExport[];
}

const stateLabel = (state: AdminWorkspaceExport['state']) => state === 'queued' ? 'Queued'
  : state === 'generating' ? 'Generating' : state === 'ready' ? 'Ready for Owner'
    : state === 'expired' ? 'Expired' : 'Failed';

export function WorkspaceExportList({ exports }: WorkspaceExportListProps) {
  const [selectedExport, setSelectedExport] = useState<AdminWorkspaceExport | null>(null);

  return <>
    <section className="overflow-hidden rounded-xl border border-line bg-paper" aria-labelledby="export-heading">
      <div className="border-b border-line p-4"><h2 id="export-heading" className="m-0 text-base font-semibold">Workspace export requests</h2>
        <p className="mb-0 mt-1 text-xs leading-5 text-muted">Only the current verified Owner can download after signing in. Export notice status is shown below.</p></div>
      {exports.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted"><tr>
            <th scope="col" className="p-3">Workspace / request</th><th scope="col" className="p-3">Owner</th>
            <th scope="col" className="p-3">Requested by</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3">Owner notice</th>
            <th scope="col" className="p-3">Expires</th><th scope="col" className="p-3"><span className="sr-only">Details</span></th>
          </tr></thead>
          <tbody>{exports.map(item => <tr key={item.id} className="border-t border-line text-sm">
            <td className="p-3"><strong className="block font-semibold">{item.workspaceName}</strong>
              <span className="text-xs text-muted"><code>{item.id}</code></span></td>
            <td className="p-3"><strong className="block font-medium">{item.ownerName}</strong>
              <span className="text-xs text-muted">{item.maskedOwnerEmail}</span></td>
            <td className="p-3">{item.requestedByName}<span className="block text-xs text-muted">{item.requestedByRole.replace('_', ' ')}</span></td>
            <td className="p-3"><DataRequestStatus label={stateLabel(item.state)}
              tone={item.state === 'ready' ? 'success' : item.state === 'failed' ? 'danger' : item.state === 'expired' ? 'neutral' : 'info'} /></td>
            <td className="p-3"><DataRequestStatus label={item.notificationStatus === 'sent' ? 'Sent'
              : item.notificationStatus === 'failed' ? 'Not sent' : 'Pending'}
              tone={item.notificationStatus === 'sent' ? 'success'
                : item.notificationStatus === 'failed' ? 'danger' : 'info'} /></td>
            <td className="p-3">{formatDataRequestDateTime(item.expiresAt)}</td>
            <td className="p-3"><button type="button" aria-haspopup="dialog" onClick={() => setSelectedExport(item)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring">Details</button></td>
          </tr>)}</tbody>
        </table>
      </div> : <DataRequestEmptyState>No workspace exports yet. Request one for a verified workspace Owner.</DataRequestEmptyState>}
    </section>
    <p className="m-0 text-xs leading-5 text-muted">The archive contains CSV datasets and file metadata only. Uploaded file contents are excluded. The current verified Owner must sign in to download within 7 days.</p>
    {selectedExport && <DataRequestDetailsDialog title={selectedExport.workspaceName}
      subtitle={`${selectedExport.workspaceId} · ${selectedExport.id}`} onClose={() => setSelectedExport(null)}>
      <DataRequestDetail label="Verified Owner">{selectedExport.ownerName} · {selectedExport.maskedOwnerEmail}</DataRequestDetail>
      <DataRequestDetail label="Requested by">{selectedExport.requestedByName} · {selectedExport.requestedByRole.replace('_', ' ')}</DataRequestDetail>
      <DataRequestDetail label="Status">{stateLabel(selectedExport.state)}</DataRequestDetail>
      <DataRequestDetail label="Owner notice">{selectedExport.notificationStatus === 'sent'
        ? `Sent ${formatDataRequestDateTime(selectedExport.notificationSentAt)}`
        : selectedExport.notificationStatus === 'failed' ? 'Not sent; Owner eligibility changed'
          : `Pending · ${selectedExport.notificationAttempts} attempt${selectedExport.notificationAttempts === 1 ? '' : 's'}`}</DataRequestDetail>
      <DataRequestDetail label="Archive contents">{selectedExport.csvCount === null ? 'Not generated yet'
        : `${selectedExport.csvCount} CSV datasets · ${selectedExport.fileMetadataCount ?? 0} file metadata rows`}</DataRequestDetail>
      <DataRequestDetail label="Link expires">{formatDataRequestDateTime(selectedExport.expiresAt)}</DataRequestDetail>
      <DataRequestDetail label="Downloaded">{formatDataRequestDateTime(selectedExport.downloadedAt)}</DataRequestDetail>
      <p className="mb-0 mt-4 rounded-lg bg-canvas p-3 text-sm leading-6 text-muted">
        Archive encrypted at rest. The emailed link is not a bearer credential: download requires the current verified Owner to sign in. Request, generation, delivery, download and expiry events are audited. Uploaded file contents are never included.
      </p>
    </DataRequestDetailsDialog>}
  </>;
}

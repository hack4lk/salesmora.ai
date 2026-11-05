'use client';

import { useRouter } from 'next/navigation';
import {
  adminWorkspaceExportRequestRecordSchema,
  adminWorkspaceExportStartResponseSchema,
  adminWorkspaceExportVerifiedResponseSchema,
  type AdminDataRequestsResponse,
  type AdminWorkspaceExportsResponse,
} from '@salesmora/contracts';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import type { AdminWorkspaceExportRequest } from './admin-data-requests.types';
import { AdminDataRequestsPage } from './admin-data-requests-page';

export class AdminWorkspaceExportRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function postExportOperation(input: unknown) {
  let response: Response;
  try {
    response = await fetch('/api/admin/data-requests/exports', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new AdminWorkspaceExportRequestError('The workspace export service could not be reached.', 0);
  }
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new AdminWorkspaceExportRequestError('The workspace export service returned an invalid response.', response.status); }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error : 'The workspace export request failed.';
    throw new AdminWorkspaceExportRequestError(message, response.status);
  }
  return body;
}

export function AdminDataRequestsRoute({
  data,
  exports,
}: {
  data: AdminDataRequestsResponse;
  exports: AdminWorkspaceExportsResponse;
}) {
  const router = useRouter();

  function navigate(filter: AdminDataRequestsResponse['filter'], page: number) {
    const query = new URLSearchParams();
    if (filter !== 'all') query.set('filter', filter);
    if (page > 0) query.set('page', String(page));
    const suffix = query.size ? `?${query.toString()}` : '';
    router.push(`/data-requests${suffix}`);
  }

  async function onStartExport(request: AdminWorkspaceExportRequest & {
    password: string;
    method: 'totp' | 'passkey';
  }) {
    const body = await postExportOperation({ operation: 'start', ...request });
    const parsed = adminWorkspaceExportStartResponseSchema.safeParse(body);
    if (!parsed.success) throw new AdminWorkspaceExportRequestError('The workspace export service returned an invalid verification challenge.', 502);
    return parsed.data;
  }

  async function onVerifyExport(input:
    | { token: string; method: 'totp'; code: string }
    | { token: string; method: 'passkey'; response: AuthenticationResponseJSON }) {
    const body = await postExportOperation({ operation: 'factor', ...input });
    if (!adminWorkspaceExportVerifiedResponseSchema.safeParse(body).success) {
      throw new AdminWorkspaceExportRequestError('The workspace export factor verification failed.', 502);
    }
  }

  async function onRequestExport(input: { token: string }) {
    const body = await postExportOperation({ operation: 'commit', token: input.token });
    if (!adminWorkspaceExportRequestRecordSchema.safeParse(body).success) {
      throw new AdminWorkspaceExportRequestError('The workspace export service returned an invalid request record.', 502);
    }
    router.refresh();
  }

  return <AdminDataRequestsPage
    role={data.role}
    deletionRequests={data.requests}
    workspaceExports={exports.exports}
    exportWorkspaces={exports.workspaces}
    exportMethods={exports.methods}
    deletionFilter={data.filter}
    deletionPage={data.page}
    deletionPageSize={data.pageSize}
    deletionTotal={data.total}
    allDeletionTotal={data.allRequestsTotal}
    retryScheduledTotal={data.retryScheduledTotal}
    exportsAvailable
    exportRequestsEnabled={exports.enabled}
    onStartExport={onStartExport}
    onVerifyExport={onVerifyExport}
    onRequestExport={onRequestExport}
    onRefresh={() => router.refresh()}
    onDeletionFilterChange={filter => navigate(filter, 0)}
    onDeletionPageChange={page => navigate(data.filter, page)}
  />;
}

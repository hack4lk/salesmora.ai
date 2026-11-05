'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceDirectoryResponseSchema,
  type AdminWorkspaceDirectoryQuery,
  type AdminWorkspaceDirectoryResponse,
} from '@salesmora/contracts';
import { BrandProvider } from '@salesmora/ui';
import { AdminWorkspaceDirectoryView } from './admin-workspace-directory';
import { adminWorkspaceManagementData as copy } from './admin-workspace-management.data';

class WorkspaceRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestDirectory(filters: AdminWorkspaceDirectoryQuery, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch('/api/admin/workspaces', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(filters),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new WorkspaceRequestError(copy.loadFailed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new WorkspaceRequestError(copy.loadFailed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.loadFailed;
    throw new WorkspaceRequestError(message, response.status);
  }
  const parsed = adminWorkspaceDirectoryResponseSchema.safeParse(result);
  if (!parsed.success) throw new WorkspaceRequestError(copy.loadFailed, 502);
  return parsed.data;
}

export function AdminWorkspaceDirectoryPage({
  initialDirectory,
  preview = false,
}: {
  initialDirectory: AdminWorkspaceDirectoryResponse;
  preview?: boolean;
}) {
  const [directory, setDirectory] = useState(initialDirectory);
  const [filters, setFilters] = useState<AdminWorkspaceDirectoryQuery>({
    query: '',
    status: 'all',
    plan: 'all',
    page: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const firstRead = useRef(true);
  const accessInvalidated = useRef(false);

  useEffect(() => {
    if (firstRead.current && revision === 0 && filters.query === '' && filters.status === 'all' &&
      filters.plan === 'all' && filters.page === 0) {
      firstRead.current = false;
      return;
    }
    firstRead.current = false;
    if (accessInvalidated.current) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await requestDirectory(filters, controller.signal);
        if (!controller.signal.aborted && !accessInvalidated.current) {
          setDirectory(result);
          setError('');
          setLoading(false);
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (failure instanceof WorkspaceRequestError && [401, 403].includes(failure.status)) {
          accessInvalidated.current = true;
          setDirectory({ workspaces: [], total: 0, page: 0, pageSize: 20 });
        }
        setError(failure instanceof Error ? failure.message : copy.loadFailed);
        setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [filters, revision]);

  function changeFilters(patch: Partial<AdminWorkspaceDirectoryQuery>) {
    if (accessInvalidated.current) return;
    setError('');
    setLoading(true);
    setFilters(current => ({ ...current, page: 0, ...patch }));
  }

  function retryDirectory() {
    accessInvalidated.current = false;
    setError('');
    setLoading(true);
    setRevision(current => current + 1);
  }

  return (
    <BrandProvider>
      <AdminWorkspaceDirectoryView
        workspaces={directory.workspaces}
        query={filters.query}
        plan={filters.plan}
        status={filters.status}
        page={directory.page}
        pageSize={directory.pageSize}
        total={directory.total}
        preview={preview}
        loading={loading}
        error={error}
        onQueryChange={query => changeFilters({ query })}
        onPlanChange={plan => changeFilters({ plan })}
        onStatusChange={status => changeFilters({ status })}
        onPageChange={page => {
          setError('');
          setLoading(true);
          setFilters(current => ({ ...current, page }));
        }}
        onRetry={retryDirectory}
      />
    </BrandProvider>
  );
}

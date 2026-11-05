'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminCustomerUserDetailSchema,
  adminUserDirectoryResponseSchema,
  type AdminUserDirectoryQuery,
  type AdminUserDirectoryResponse,
} from '@salesmora/contracts';
import { BrandProvider } from '@salesmora/ui';
import { AdminUserDetail } from './admin-user-detail';
import { AdminUserDirectory } from './admin-user-directory';
import { adminUserManagementData as copy } from './admin-user-management.data';

class CustomerUserRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request(url: string, options: RequestInit = {}, unavailableMessage: string = copy.loadFailed): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new CustomerUserRequestError(unavailableMessage, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new CustomerUserRequestError(unavailableMessage, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : unavailableMessage;
    throw new CustomerUserRequestError(message, response.status);
  }
  return result;
}

const initialFilters: AdminUserDirectoryQuery = { query: '', status: 'all', page: 0 };

export function AdminUserManagement({ initialDirectory }: { initialDirectory: AdminUserDirectoryResponse }) {
  const [directory, setDirectory] = useState(initialDirectory);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ReturnType<typeof adminCustomerUserDetailSchema.parse>>();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [directoryRevision, setDirectoryRevision] = useState(0);
  const [profileRevision, setProfileRevision] = useState(0);
  const firstRead = useRef(true);
  const accessInvalidated = useRef(false);

  useEffect(() => {
    if (firstRead.current && directoryRevision === 0 && filters.query === '' && filters.status === 'all' && filters.page === 0) {
      firstRead.current = false;
      return;
    }
    firstRead.current = false;
    if (accessInvalidated.current) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const parsed = adminUserDirectoryResponseSchema.safeParse(
          await request('/api/admin/users', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query: filters.query, status: filters.status, page: filters.page }),
            signal: controller.signal,
          }),
        );
        if (!parsed.success) throw new CustomerUserRequestError(copy.loadFailed, 502);
        if (!controller.signal.aborted && !accessInvalidated.current) {
          setDirectory(parsed.data);
          setError('');
          setLoading(false);
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (failure instanceof CustomerUserRequestError && [401, 403].includes(failure.status)) {
          accessInvalidated.current = true;
          setDirectory({ users: [], total: 0, page: 0, pageSize: 20 });
          setSelectedId(null);
        }
        setError(failure instanceof Error ? failure.message : copy.loadFailed);
        setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [filters, directoryRevision]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const parsed = adminCustomerUserDetailSchema.safeParse(
          await request(`/api/admin/users/${encodeURIComponent(selectedId)}`, { signal: controller.signal }, copy.detailUnavailable),
        );
        if (!parsed.success) throw new CustomerUserRequestError(copy.detailUnavailable, 502);
        if (!controller.signal.aborted && !accessInvalidated.current) {
          setProfile(parsed.data);
          setProfileError('');
          setProfileLoading(false);
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (failure instanceof CustomerUserRequestError && [401, 403].includes(failure.status)) {
          accessInvalidated.current = true;
          setDirectory({ users: [], total: 0, page: 0, pageSize: 20 });
          setSelectedId(null);
          setError(failure.message);
        } else {
          setProfileError(failure instanceof Error ? failure.message : copy.detailUnavailable);
        }
        setProfileLoading(false);
      }
    }, 0);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [selectedId, profileRevision]);

  function changeFilters(patch: Partial<AdminUserDirectoryQuery>) {
    if (accessInvalidated.current) return;
    setError('');
    setLoading(true);
    setFilters(current => ({ ...current, page: 0, ...patch }));
  }

  function retryDirectory() {
    accessInvalidated.current = false;
    setLoading(true);
    setError('');
    setDirectoryRevision(current => current + 1);
  }

  function selectUser(userId: string) {
    setProfile(undefined);
    setProfileError('');
    setProfileLoading(true);
    setSelectedId(userId);
  }

  function retryProfile() {
    accessInvalidated.current = false;
    setProfileError('');
    setProfileLoading(true);
    setProfileRevision(current => current + 1);
  }

  function handleSuspensionComplete() {
    setProfile(undefined);
    setProfileLoading(true);
    setProfileRevision(current => current + 1);
  }

  function handleEmailVerificationComplete() {
    setProfile(undefined);
    setProfileLoading(true);
    setProfileRevision(current => current + 1);
  }

  function handleEmailChangeComplete() {
    setProfile(undefined);
    setProfileLoading(true);
    setProfileRevision(current => current + 1);
  }

  const handleSessionRevocationComplete = useCallback(() => {
    setProfileError('');
    setProfileRevision(current => current + 1);
  }, []);

  const handleSuspensionAccessError = useCallback((status: number, message: string) => {
    if (![401, 403].includes(status)) return;
    accessInvalidated.current = true;
    setDirectory({ users: [], total: 0, page: 0, pageSize: 20 });
    setSelectedId(null);
    setError(message);
  }, []);

  function backToDirectory() {
    setSelectedId(null);
    setProfile(undefined);
    setProfileError('');
    setProfileLoading(false);
  }

  return (
    <BrandProvider>
      {selectedId ? (
        <AdminUserDetail
          user={profile?.user}
          supplemental={profile?.supplemental}
          canSuspend={profile?.permissions?.canSuspend}
          canRevokeSessions={profile?.permissions?.canRevokeSessions}
          canRequestPasswordReset={profile?.permissions?.canRequestPasswordReset}
          canManageEmailVerification={profile?.permissions?.canManageEmailVerification}
          canChangeEmail={profile?.permissions?.canChangeEmail}
          canRevealPii={profile?.permissions?.canRevealPii}
          canReadRelatedAudit={profile?.permissions?.canReadRelatedAudit}
          pendingEmailChange={profile?.pendingEmailChange}
          sessionRefreshKey={profileRevision}
          loading={profileLoading}
          error={profileError}
          onBack={backToDirectory}
          onRetry={retryProfile}
          onSuspensionComplete={handleSuspensionComplete}
          onEmailVerificationComplete={handleEmailVerificationComplete}
          onEmailChangeComplete={handleEmailChangeComplete}
          onSessionRevocationComplete={handleSessionRevocationComplete}
          onAccessError={handleSuspensionAccessError}
        />
      ) : (
        <AdminUserDirectory
          users={directory.users}
          query={filters.query}
          status={filters.status}
          page={directory.page}
          pageSize={directory.pageSize}
          total={directory.total}
          preview={false}
          loading={loading}
          error={error}
          onQueryChange={query => changeFilters({ query })}
          onStatusChange={status => changeFilters({ status })}
          onPageChange={page => {
            setError('');
            setLoading(true);
            setFilters(current => ({ ...current, page }));
          }}
          onSelect={selectUser}
          onRetry={retryDirectory}
        />
      )}
    </BrandProvider>
  );
}

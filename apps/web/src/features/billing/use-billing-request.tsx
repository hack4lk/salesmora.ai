'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary, useApiQueryScope, useApiViewerId } from '../api/api-query-provider';
import { apiQueryKeys, isApiAccessError, removeDeniedApiQueries } from '../api/api-query';
import { billingMutationOptions } from './billing-queries';

const DenialContext = createContext<((error: unknown) => void) | null>(null);

export function BillingQueryBoundary({ workspaceId, unavailable, children }: { workspaceId: string; unavailable: string; children: ReactNode }) {
  const viewerId = useApiViewerId();
  return <ApiQueryScopeBoundary scope={{ viewerId, workspaceId }}>
    <BillingSession key={`${viewerId}:${workspaceId}`} unavailable={unavailable}>{children}</BillingSession>
  </ApiQueryScopeBoundary>;
}

function BillingSession({ unavailable, children }: { unavailable: string; children: ReactNode }) {
  const [denied, setDenied] = useState(false);
  const scope = useApiQueryScope(), client = useQueryClient();
  const deny = useCallback((error: unknown) => {
    if (!isApiAccessError(error)) return;
    removeDeniedApiQueries(client, apiQueryKeys.workspace(scope), error);
    setDenied(true);
  }, [client, scope]);
  return <DenialContext.Provider value={deny}>{denied ? <p role="alert">{unavailable}</p> : <Fragment>{children}</Fragment>}</DenialContext.Provider>;
}

export function useBillingAccessError() {
  const deny = useContext(DenialContext);
  if (!deny) throw new Error('Billing requests require an authenticated billing boundary.');
  return deny;
}

export function useBillingMutation<T>(path: string, parse: (raw: unknown) => T, failureMessage: string) {
  const scope = useApiQueryScope(), client = useQueryClient(), deny = useBillingAccessError();
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const { mutateAsync, reset } = useMutation(billingMutationOptions(client, scope, path, parse, failureMessage));
  const request = useCallback(async (body: unknown, changesBilling = false) => {
    try {
      const result = await mutateAsync({ body, changesBilling });
      if (!active.current) throw new Error(failureMessage);
      return result;
    } catch (error) {
      if (active.current) deny(error);
      throw error;
    } finally {
      // Provider client secrets belong only to the mounted payment UI.
      reset();
    }
  }, [mutateAsync, reset, deny, failureMessage]);
  const isActive = useCallback(() => active.current, []);
  return { request, isActive };
}

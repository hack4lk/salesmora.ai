'use client';

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createApiQueryClient, retainApiQueryScope, type ApiQueryScope } from './api-query';

const ScopeContext = createContext<ApiQueryScope | null>(null);
const ViewerContext = createContext<string | null>(null);

export function ApiViewerProvider({ viewerId, children }: { viewerId: string | null; children: ReactNode }) {
  return <ViewerContext.Provider value={viewerId}>{children}</ViewerContext.Provider>;
}

export function useApiViewerId() {
  const viewerId = useContext(ViewerContext);
  if (!viewerId?.trim()) throw new Error('API queries require a server-authenticated viewer.');
  return viewerId;
}

export function ApiQueryProvider({ children, testing = false }: { children: ReactNode; testing?: boolean }) {
  const [client] = useState(() => createApiQueryClient({ testing }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function ApiQueryScopeBoundary({ scope, children }: { scope: ApiQueryScope; children: ReactNode }) {
  const client = useQueryClient();
  const { viewerId, workspaceId } = scope;
  if (!viewerId.trim() || !workspaceId.trim()) throw new Error('API queries require a non-empty viewer and workspace identity.');
  useLayoutEffect(() => {
    retainApiQueryScope(client, { viewerId, workspaceId });
  }, [client, viewerId, workspaceId]);
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

export function useApiQueryScope() {
  const scope = useContext(ScopeContext);
  if (!scope) throw new Error('API queries require an authenticated viewer and workspace scope boundary.');
  return scope;
}

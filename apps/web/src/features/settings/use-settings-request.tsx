'use client';

import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary, useApiQueryScope, useApiViewerId } from '../api/api-query-provider';
import { useApiQuery } from '../api/use-api-query';
import { settingsMutationOptions, settingsReadOptions, type SettingsCommand, type SettingsResource } from './settings-queries';
import { apiQueryKeys, removeDeniedApiQueries } from '../api/api-query';

export function SettingsQueryBoundary({ workspaceId, children }: { workspaceId: string; children: ReactNode }) {
  const viewerId = useApiViewerId();
  return <ApiQueryScopeBoundary scope={{ viewerId, workspaceId }}>
    <Fragment key={`${viewerId}:${workspaceId}`}>{children}</Fragment>
  </ApiQueryScopeBoundary>;
}

export function useSettingsRequest<T, U = T>(resource: SettingsResource, path: string, parse: (raw: unknown) => T, failureMessage: string) {
  const scope = useApiQueryScope(), client = useQueryClient(), active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const query = useApiQuery({ ...settingsReadOptions(scope, resource, path, parse, failureMessage), enabled: false });
  const mutation = useMutation(settingsMutationOptions<U>(client, scope, resource));
  useEffect(() => {
    removeDeniedApiQueries(client, apiQueryKeys.resource(scope, resource), mutation.error);
  }, [client, scope, resource, mutation.error]);
  const { refetch } = query, { mutateAsync } = mutation;
  async function read() {
    const result = await refetch({ throwOnError: true, cancelRefetch: false });
    if (!active.current || result.data === undefined) throw new Error(failureMessage);
    return result.data;
  }
  async function write(command: SettingsCommand<U>) {
    const result = await mutateAsync(command);
    if (!active.current) throw new Error(failureMessage);
    return result;
  }
  return { read, write, query, mutation, isActive: () => active.current };
}

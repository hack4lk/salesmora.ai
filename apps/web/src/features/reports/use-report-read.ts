'use client';

import { useState } from 'react';
import { useApiQueryScope } from '../api/api-query-provider';
import { isApiAccessError } from '../api/api-query';
import { useApiQuery } from '../api/use-api-query';
import { reportReadOptions } from './report-read-options';
import { ApiContractError } from '../api/api-request';

export function useReportRead(input: {
  key: string; initial: unknown; initialUpdatedAt: number; url: string;
  validate: (raw: unknown) => void; failureMessage: string; enabled?: boolean;
}) {
  const { key, initial, initialUpdatedAt, url, enabled = true } = input;
  const scope = useApiQueryScope();
  const [initialUrl] = useState(url);
  const query = useApiQuery({
    ...reportReadOptions({ ...input, scope }), enabled,
    ...(url === initialUrl ? { initialData: initial, initialDataUpdatedAt: initialUpdatedAt } : {}),
  });
  const failure = query.error instanceof ApiContractError && query.error.cause instanceof Error
    ? query.error.cause : query.error;
  return {
    key, raw: enabled && !query.isError ? query.data : undefined,
    error: enabled ? failure?.message : undefined,
    denied: enabled && isApiAccessError(query.error), pending: enabled && query.isPending,
    refresh: () => { void query.refetch(); },
  };
}

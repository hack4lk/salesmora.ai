import { queryOptions } from '@tanstack/react-query';
import { apiQueryKeys, type ApiQueryScope } from '../api/api-query';
import { apiRequest } from '../api/api-request';

export function reportReadOptions(input: {
  scope: ApiQueryScope; key: string; url: string; validate: (raw: unknown) => void; failureMessage: string;
}) {
  const { scope, key, url, validate, failureMessage } = input;
  return queryOptions({
    queryKey: apiQueryKeys.list(scope, 'reports', { context: key, url }),
    queryFn: ({ signal }) => apiRequest(url, {
      signal, failureMessage, parse: raw => { validate(raw); return raw; },
    }),
  });
}

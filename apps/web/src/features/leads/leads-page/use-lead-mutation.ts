'use client';

import { useApiMutation } from '../../api/use-api-mutation';

export function useLeadMutation<T>(parse: (raw: unknown) => T, failureMessage: string) {
  return useApiMutation('leads', parse, failureMessage);
}

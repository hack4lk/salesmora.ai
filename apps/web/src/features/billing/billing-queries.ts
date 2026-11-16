import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { billingInvoiceHistorySchema, workspaceBillingSnapshotSchema } from '@salesmora/contracts';
import { apiReadOptions } from '../api/api-read-options';
import { apiQueryKeys, type ApiQueryScope } from '../api/api-query';
import { apiRequest } from '../api/api-request';

export function billingSummaryOptions(scope: ApiQueryScope, failureMessage: string) {
  const path = `/api/billing/summary?workspace=${encodeURIComponent(scope.workspaceId)}`;
  return { ...apiReadOptions(scope, 'billing', {}, path, workspaceBillingSnapshotSchema.parse, failureMessage), staleTime: 0 };
}

export function billingInvoiceOptions(scope: ApiQueryScope, after: string, failureMessage: string) {
  const path = `/api/billing/invoices?workspace=${encodeURIComponent(scope.workspaceId)}&after=${encodeURIComponent(after)}`;
  return { ...apiReadOptions(scope, 'billing-invoices', { after }, path, billingInvoiceHistorySchema.parse, failureMessage), staleTime: 0 };
}

export function cancelBillingReads(client: QueryClient, scope: ApiQueryScope) {
  return Promise.all(['billing', 'billing-invoices'].map(resource =>
    client.cancelQueries({ queryKey: apiQueryKeys.resource(scope, resource) })));
}

export function billingMutationOptions<T>(
  client: QueryClient, scope: ApiQueryScope, path: string, parse: (raw: unknown) => T, failureMessage: string,
) {
  return mutationOptions({
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    mutationFn: ({ body }: { body: unknown; changesBilling?: boolean }) =>
      apiRequest(path, { method: 'POST', body, parse, failureMessage }),
    onSuccess: async (_result, { changesBilling }) => {
      if (!changesBilling) return;
      await cancelBillingReads(client, scope);
      // Entitlements can change, but open reviews must not be silently replaced.
      await client.invalidateQueries({ queryKey: apiQueryKeys.workspace(scope), refetchType: 'none' });
    },
  });
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver, QueryObserver } from '@tanstack/react-query';
import {
  billingCheckoutPreparationSchema, billingCheckoutStatusSchema, billingPaymentMethodPreparationSchema,
  billingPaymentMethodSavedSchema, paymentRecoveryResultSchema, planChangeQuoteSchema, planChangeResultSchema,
} from '@salesmora/contracts';
import { apiQueryKeys, createApiQueryClient, retainApiQueryScope } from '../api/api-query';
import { ApiContractError } from '../api/api-request';
import { billingInvoiceOptions, billingMutationOptions, billingSummaryOptions, cancelBillingReads } from './billing-queries';
import { billingQuoteFixture, billingRecoveryFixture, billingScope as scope, billingSnapshotFixture } from './billing-queries.fixtures';

afterEach(() => vi.unstubAllGlobals());
describe('billing queries and commands', () => {
  it('only reloads a frozen server snapshot explicitly and validates every response', async () => {
    const fetch = vi.fn(async () => Response.json(billingSnapshotFixture));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), options = billingSummaryOptions(scope, 'Failed.');
    const observer = new QueryObserver(client, { ...options, enabled: false });
    const unsubscribe = observer.subscribe(() => {});
    expect(fetch).not.toHaveBeenCalled();
    await observer.refetch({ throwOnError: true });
    await observer.refetch({ throwOnError: true });
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockResolvedValue(Response.json({ plan: 'premium' }));
    await expect(observer.refetch({ throwOnError: true })).rejects.toBeInstanceOf(ApiContractError);
    unsubscribe(); client.clear();
  });
  it('keys invoice pages by the complete cursor and authenticated scope', async () => {
    const client = createApiQueryClient({ testing: true });
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () =>
      Response.json({ invoices: billingSnapshotFixture.invoices, hasMore: true, nextCursor: billingSnapshotFixture.invoices.at(-1)?.id }));
    vi.stubGlobal('fetch', fetch);
    const options = billingInvoiceOptions(scope, 'in_first', 'Failed.');
    await client.fetchQuery(options);
    expect(fetch.mock.calls[0][0]).toContain('&after=in_first');
    expect(options.queryKey).not.toEqual(billingInvoiceOptions(scope, 'in_other', 'Failed.').queryKey);
    expect(options.queryKey).not.toEqual(billingInvoiceOptions({ ...scope, viewerId: 'other' }, 'in_first', 'Failed.').queryKey);
    expect(options.queryKey).not.toEqual(billingInvoiceOptions({ ...scope, workspaceId: 'other' }, 'in_first', 'Failed.').queryKey);
    fetch.mockResolvedValue(Response.json({ invoices: [], hasMore: true, nextCursor: 'in_missing' }));
    await expect(client.fetchQuery(options)).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it.each(['refresh', 'workspace'] as const)('aborts pending invoice requests on %s and prevents late cache writes', async reason => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_path, init: RequestInit) => {
      signal = init.signal ?? undefined;
      return new Promise<Response>(() => {});
    }));
    const client = createApiQueryClient({ testing: true }), options = billingInvoiceOptions(scope, 'in_first', 'Failed.');
    const pending = client.fetchQuery(options).catch(error => error);
    if (reason === 'refresh') await cancelBillingReads(client, scope);
    else retainApiQueryScope(client, { ...scope, workspaceId: 'other' });
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  const commands: { name: string; path: string; body: unknown; result: unknown; parse: (raw: unknown) => unknown }[] = [
    { name: 'plan preview', path: '/api/billing/plan', body: { workspaceId: scope.workspaceId, action: 'preview', plan: 'premium' }, result: billingQuoteFixture, parse: planChangeQuoteSchema.parse },
    { name: 'plan confirmation', path: '/api/billing/plan', body: { workspaceId: scope.workspaceId, action: 'confirm', quoteId: billingQuoteFixture.id }, result: { status: 'complete' }, parse: planChangeResultSchema.parse },
    { name: 'card preparation', path: '/api/billing/payment-method', body: { workspaceId: scope.workspaceId, action: 'prepare' }, result: { attemptId: billingQuoteFixture.id, clientSecret: 'fictional-secret', confirmed: true, card: null }, parse: billingPaymentMethodPreparationSchema.parse },
    { name: 'card save', path: '/api/billing/payment-method', body: { workspaceId: scope.workspaceId, action: 'save', attemptId: billingQuoteFixture.id, consent: true }, result: { saved: true }, parse: billingPaymentMethodSavedSchema.parse },
    { name: 'recovery confirmation', path: '/api/billing/recovery', body: { workspaceId: scope.workspaceId, action: 'confirm', quoteId: billingQuoteFixture.id }, result: billingRecoveryFixture, parse: paymentRecoveryResultSchema.parse },
    { name: 'checkout preparation', path: '/api/billing/checkout', body: { workspaceId: scope.workspaceId, action: 'checkout' }, result: { clientSecret: 'fictional-secret' }, parse: billingCheckoutPreparationSchema.parse },
    { name: 'checkout reconciliation', path: '/api/billing/checkout', body: { workspaceId: scope.workspaceId, action: 'refresh' }, result: { billing: { hasCheckout: true, intendedPlan: 'premium', plan: 'free', status: 'incomplete' } }, parse: billingCheckoutStatusSchema.parse },
  ];
  it.each(commands)('validates $name and preserves exact caller payloads', async ({ path, body, result, parse }) => {
    const fetch = vi.fn(async () => Response.json(result));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const mutation = new MutationObserver(client, billingMutationOptions<unknown>(client, scope, path, parse, 'Failed.'));
    expect(await mutation.mutate({ body })).toEqual(result);
    expect(fetch.mock.calls[0]).toMatchObject([path, { method: 'POST', credentials: 'same-origin', body: JSON.stringify(body) }]);
    fetch.mockResolvedValue(Response.json({}));
    await expect(mutation.mutate({ body })).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it.each([401, 403, 404, 409, 422, 423, 429, 503])('never retries a payment command on HTTP %s, retaining error details and reviewed quote identity', async status => {
    const fetch = vi.fn(async () => Response.json({ error: 'Review required.', reason: 'changed' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), body = commands[1].body;
    const mutation = new MutationObserver(client, billingMutationOptions<unknown>(client, scope, '/api/billing/plan', planChangeResultSchema.parse, 'Failed.'));
    await expect(mutation.mutate({ body, changesBilling: true })).rejects.toMatchObject({ status, details: { reason: 'changed' } });
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(mutation.mutate({ body, changesBilling: true })).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(fetch.mock.calls[1]);
    client.clear();
  });
  it('marks originating workspace entitlements stale without refetching or replacing open reviews', async () => {
    const fetch = vi.fn(async () => Response.json({ status: 'scheduled' }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const key = apiQueryKeys.resource(scope, 'jobs'), billing = billingSummaryOptions(scope, 'Failed.');
    const otherWorkspace = apiQueryKeys.resource({ ...scope, workspaceId: 'other' }, 'jobs');
    const otherViewer = apiQueryKeys.resource({ ...scope, viewerId: 'other' }, 'jobs');
    for (const k of [key, otherWorkspace, otherViewer]) client.setQueryData(k, {});
    client.setQueryData(billing.queryKey, billingSnapshotFixture);
    const observer = new QueryObserver(client, { ...billing, enabled: false }), unsubscribe = observer.subscribe(() => {});
    const mutation = new MutationObserver(client, billingMutationOptions<unknown>(client, scope, '/api/billing/plan', planChangeResultSchema.parse, 'Failed.'));
    await mutation.mutate({ body: commands[1].body, changesBilling: true });
    expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    expect(client.getQueryState(otherWorkspace)?.isInvalidated).toBe(false);
    expect(client.getQueryState(otherViewer)?.isInvalidated).toBe(false);
    expect(client.getQueryData(billing.queryKey)).toEqual(billingSnapshotFixture);
    expect(fetch).toHaveBeenCalledTimes(1);
    unsubscribe(); client.clear();
  });
  it('does not invalidate or cache a preview/secret as a read, and immediately collects detached mutation results', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ clientSecret: 'fictional-secret' })));
    const client = createApiQueryClient({ testing: true }), key = apiQueryKeys.resource(scope, 'billing');
    client.setQueryData(key, billingSnapshotFixture);
    const mutation = new MutationObserver(client, billingMutationOptions<unknown>(client, scope, '/api/billing/checkout', billingCheckoutPreparationSchema.parse, 'Failed.'));
    await mutation.mutate({ body: commands[5].body });
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    expect(client.getQueryCache().getAll()).toHaveLength(1);
    mutation.reset();
    await vi.waitFor(() => expect(client.getMutationCache().getAll()).toHaveLength(0));
    client.clear();
  });
});

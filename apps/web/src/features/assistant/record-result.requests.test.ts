import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver } from '@tanstack/react-query';
import { apiQueryKeys, createApiQueryClient } from '../api/api-query';
import { ApiContractError } from '../api/api-request';
import { assistantResultMutationOptions } from './assistant-result-queries';
import { customerDecisionResponse, customerNavigationResponse, workOrderDecisionResponse } from './record-result.requests';
import { customerRecordDraft, workOrderRecordDraft, recordWorkspace as workspaceId, recordId } from './record-result.fixtures';

afterEach(() => vi.unstubAllGlobals());
describe('record assistant receipts', () => {
  it.each(['confirm', 'cancel'] as const)('accepts matching %s customer and Work Order receipts', decision => {
    const state = decision === 'confirm' ? 'confirmed' : 'canceled';
    const customer = customerRecordDraft(), workOrder = workOrderRecordDraft();
    expect(customerDecisionResponse(customer, decision, { draft: { ...customer, state } }).state).toBe(state);
    expect(workOrderDecisionResponse(workOrder, decision, { draft: { ...workOrder, state } }).state).toBe(state);
  });
  it.each([
    { id: recordId }, { inputHash: 'c'.repeat(64) }, { action: 'create' },
    { state: 'pending' }, { state: 'canceled' },
  ])('rejects mismatched confirmation receipts: %j', patch => {
    const customer = customerRecordDraft(), workOrder = workOrderRecordDraft();
    expect(() => customerDecisionResponse(customer, 'confirm', { draft: { ...customer, state: 'confirmed', ...patch } })).toThrow();
    expect(() => workOrderDecisionResponse(workOrder, 'confirm', { draft: { ...workOrder, state: 'confirmed', ...patch } })).toThrow();
  });
  it('rejects changed existing record identities but accepts server-assigned creation identities', () => {
    const customer = customerRecordDraft(), workOrder = workOrderRecordDraft();
    expect(() => customerDecisionResponse(customer, 'confirm', { draft: { ...customer, state: 'confirmed', customer: { ...customer.customer, id: workspaceId } } })).toThrow();
    expect(() => workOrderDecisionResponse(workOrder, 'confirm', { draft: { ...workOrder, state: 'confirmed', workOrder: { ...workOrder.workOrder, id: workspaceId } } })).toThrow();
    expect(customerDecisionResponse({ ...customer, action: 'create' }, 'confirm', { draft: { ...customer, action: 'create', state: 'confirmed', customer: { ...customer.customer, id: workspaceId } } }).customer.id).toBe(workspaceId);
    expect(workOrderDecisionResponse({ ...workOrder, action: 'create' }, 'confirm', { draft: { ...workOrder, action: 'create', state: 'confirmed', workOrder: { ...workOrder.workOrder, id: workspaceId } } }).workOrder.id).toBe(workspaceId);
  });
  it.each(['customer', 'work-order'] as const)('preserves %s decisions and only evicts originating history', async kind => {
    const customer = customerRecordDraft('delete'), workOrder = workOrderRecordDraft('material-archive');
    const draft = kind === 'customer' ? customer : workOrder;
    const body = { workspaceId, draftId: draft.id, inputHash: draft.inputHash, decision: 'confirm', ...(kind === 'customer' ? { typedConfirmation: customer.customer.number, unlinkOpenLeads: true } : {}) };
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ draft: { ...draft, state: 'confirmed' } }));
    vi.stubGlobal('fetch', fetch);
    const scope = { viewerId: 'viewer', workspaceId }, client = createApiQueryClient({ testing: true });
    const key = apiQueryKeys.resource(scope, 'assistant-history'), other = apiQueryKeys.resource({ ...scope, workspaceId: recordId }, 'assistant-history');
    client.setQueryData(key, {}); client.setQueryData(other, {});
    const observer = new MutationObserver(client, assistantResultMutationOptions<unknown>(client, scope, 'assistant-history', 'Failed.'));
    await observer.mutate({
      path: kind === 'customer' ? '/api/chat/customers/actions' : '/api/chat/work-orders/actions', body,
      signal: new AbortController().signal, changes: true,
      parse: raw => kind === 'customer' ? customerDecisionResponse(customer, 'confirm', raw) : workOrderDecisionResponse(workOrder, 'confirm', raw),
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual(body);
    expect(client.getQueryData(key)).toBeUndefined();
    expect(client.getQueryData(other)).toEqual({});
    client.clear();
  });
  it.each([401, 403, 409, 422, 423, 503])('does not retry HTTP %s or change the reviewed payload on explicit retry', async status => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ error: 'unavailable' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), scope = { viewerId: 'viewer', workspaceId };
    const observer = new MutationObserver(client, assistantResultMutationOptions<unknown>(client, scope, 'assistant-history', 'Failed.'));
    const draft = customerRecordDraft();
    const command = {
      path: '/api/chat/customers/actions', body: { workspaceId, draftId: draft.id, inputHash: draft.inputHash, decision: 'cancel' },
      parse: (raw: unknown) => customerDecisionResponse(draft, 'cancel', raw), signal: new AbortController().signal,
    };
    await expect(observer.mutate(command)).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(observer.mutate(command)).rejects.toMatchObject({ status });
    expect(fetch.mock.calls[0]).toEqual(fetch.mock.calls[1]);
    client.clear();
  });
  it('rejects wrong JSON receipts without evicting valid history or reporting success', async () => {
    const draft = workOrderRecordDraft();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ draft: { ...draft, id: recordId, state: 'confirmed' } })));
    const scope = { viewerId: 'viewer', workspaceId }, client = createApiQueryClient({ testing: true });
    const key = apiQueryKeys.resource(scope, 'assistant-history');
    client.setQueryData(key, { reviewed: true });
    const observer = new MutationObserver(client, assistantResultMutationOptions<unknown>(client, scope, 'assistant-history', 'Failed.'));
    await expect(observer.mutate({
      path: '/api/chat/work-orders/actions', body: {}, signal: new AbortController().signal, changes: true,
      parse: raw => workOrderDecisionResponse(draft, 'confirm', raw),
    })).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(key)).toEqual({ reviewed: true });
    client.clear();
  });
});
describe('customer assistant navigation', () => {
  it.each(['customer', 'lead'] as const)('accepts only the requested %s destination', kind => {
    const href = `/${kind === 'lead' ? 'leads' : 'customers'}/${recordId}?workspace=${workspaceId}`;
    expect(customerNavigationResponse(workspaceId, recordId, kind, { href })).toBe(href);
  });
  it.each([
    `https://external.example.test/customers/${recordId}?workspace=${workspaceId}`,
    `/customers/${workspaceId}?workspace=${workspaceId}`, `/customers/${recordId}?workspace=${recordId}`,
    `/leads/${recordId}?workspace=${workspaceId}`, `/customers/${recordId}?workspace=${workspaceId}#other`,
  ])('rejects changed or unsafe destinations: %s', href => {
    expect(() => customerNavigationResponse(workspaceId, recordId, 'customer', { href })).toThrow();
  });
});

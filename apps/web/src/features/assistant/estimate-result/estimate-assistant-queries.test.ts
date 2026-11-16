import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiQueryKeys, createApiQueryClient } from '../../api/api-query';
import { ApiContractError, type apiRequest } from '../../api/api-request';
import { estimateAssistantRequest } from './estimate-assistant-queries';
import { estimateArchiveRequest } from './estimate-archive-client';
import { estimateSharingRequest } from './estimate-sharing-client';
import { estimateDraftBinding, estimateDraftRequest } from './estimate-draft-client';
import { estimateDraftViewFixture, estimateDraftWorkspaceId } from './estimate-draft.fixtures';
import { estimateSharingFixture, estimateSharingWorkspaceId } from './estimate-sharing.fixtures';
import { estimateArchiveCardFixture, estimateArchiveCardConfirmed, estimateArchiveWorkspace } from '../../estimates/estimate-archive-card/estimate-archive-card.fixtures';

afterEach(() => vi.unstubAllGlobals());
function transport(workspaceId = estimateArchiveWorkspace) {
  const client = createApiQueryClient({ testing: true }), scope = { viewerId: 'viewer', workspaceId };
  const request: typeof apiRequest = (path, options) => estimateAssistantRequest(client, scope, 'reviewed', path, options, options.signal ?? new AbortController().signal);
  return { client, scope, request };
}
describe('scoped estimate assistant requests', () => {
  it('deduplicates fresh validated reads without retaining detached review data', async () => {
    const view = estimateArchiveCardFixture(), fetch = vi.fn(async () => Response.json({ view }));
    vi.stubGlobal('fetch', fetch);
    const { client, request } = transport();
    await Promise.all([1, 2].map(() => estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'GET', undefined, undefined, request)));
    expect(fetch).toHaveBeenCalledTimes(1);
    await estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'GET', undefined, undefined, request);
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(client.getQueryCache().getAll()).toHaveLength(0));
    client.clear();
  });
  it('removes only the originating history after a validated decision and releases mutation data', async () => {
    const view = estimateArchiveCardFixture();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ view: estimateArchiveCardConfirmed(view) })));
    const { client, scope, request } = transport(), key = apiQueryKeys.resource(scope, 'assistant-history');
    const other = apiQueryKeys.resource({ ...scope, viewerId: 'other' }, 'assistant-history');
    client.setQueryData(key, {}); client.setQueryData(other, {});
    await estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'POST', 'confirm', undefined, request);
    expect(client.getQueryData(key)).toBeUndefined(); expect(client.getQueryData(other)).toEqual({});
    expect(client.getMutationCache().getAll()).toHaveLength(0);
    client.clear();
  });
  it('preserves sharing recipient PATCH identity and clears obsolete history without confirming', async () => {
    const original = estimateSharingFixture('estimate.resend'), view = structuredClone(original);
    view.ticket.id = '10000000-0000-4000-8000-000000000099';
    view.ticket.inputHash = 'f'.repeat(64); view.review.recipientEmail = 'updated@example.test';
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ view }));
    vi.stubGlobal('fetch', fetch);
    const { client, scope, request } = transport(estimateSharingWorkspaceId), key = apiQueryKeys.resource(scope, 'assistant-history');
    client.setQueryData(key, {});
    await estimateSharingRequest(estimateSharingWorkspaceId, original.ticket, 'PATCH', { recipientEmail: view.review.recipientEmail }, undefined, request);
    expect(fetch.mock.calls[0][1]?.method).toBe('PATCH');
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({
      workspaceId: estimateSharingWorkspaceId, request: { proposalId: original.ticket.id, inputHash: original.ticket.inputHash }, recipientEmail: view.review.recipientEmail,
    });
    expect(client.getQueryData(key)).toBeUndefined(); expect(client.getMutationCache().getAll()).toHaveLength(0);
    client.clear();
  });
  it('does not evict history on reviewed navigation or accept a mismatched receipt', async () => {
    const view = estimateArchiveCardConfirmed(estimateArchiveCardFixture());
    const fetch = vi.fn(async () => Response.json({ view, href: `/estimates/${view.receipt!.estimateId}?workspace=${estimateArchiveWorkspace}` }));
    vi.stubGlobal('fetch', fetch);
    const { client, scope, request } = transport(), key = apiQueryKeys.resource(scope, 'assistant-history');
    client.setQueryData(key, {});
    await estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'POST', 'open', undefined, request);
    expect(client.getQueryData(key)).toEqual({});
    fetch.mockResolvedValue(Response.json({ view: estimateArchiveCardFixture() }));
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'POST', 'confirm', undefined, request)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(key)).toEqual({}); expect(client.getMutationCache().getAll()).toHaveLength(0);
    client.clear();
  });
  it.each([401, 403, 409, 422, 423, 503])('surfaces HTTP %s once for reads, commands and recipient PATCH', async status => {
    const fetch = vi.fn(async () => Response.json({ error: 'Changed.' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const { client, request } = transport(), view = estimateArchiveCardFixture();
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'GET', undefined, undefined, request)).rejects.toMatchObject({ status });
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, 'POST', 'confirm', undefined, request)).rejects.toMatchObject({ status });
    const sharing = estimateSharingFixture();
    await expect(estimateSharingRequest(estimateSharingWorkspaceId, sharing.ticket, 'PATCH', { recipientEmail: 'updated@example.test' }, undefined, request)).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(3); expect(client.getMutationCache().getAll()).toHaveLength(0);
    client.clear();
  });
});
describe('estimate draft command bindings', () => {
  it.each(['confirm', 'cancel', 'open', 'editor'] as const)('checks the exact %s binding and navigation destination', async decision => {
    const view = estimateDraftViewFixture(), binding = estimateDraftBinding(view);
    if (decision === 'confirm' || decision === 'open') {
      view.draft.state = 'confirmed';
      view.receipt = { id: estimateDraftWorkspaceId, number: 'EST-2048', revision: 1, version: 1, updatedAt: new Date().toISOString() };
    } else if (decision === 'cancel') view.draft.state = 'cancelled';
    const href = decision === 'open' ? `/estimates/${estimateDraftWorkspaceId}?workspace=${estimateDraftWorkspaceId}`
      : decision === 'editor' ? `/estimates/new?workspace=${estimateDraftWorkspaceId}&proposal=${view.draft.id}` : undefined;
    const fetch = vi.fn(async () => Response.json({ view, ...(href ? { href } : {}) }));
    vi.stubGlobal('fetch', fetch);
    const { client, request } = transport(estimateDraftWorkspaceId);
    await expect(estimateDraftRequest('POST', { workspaceId: estimateDraftWorkspaceId, ...binding, decision }, undefined, request)).resolves.toMatchObject({ view });
    fetch.mockResolvedValue(Response.json({ view: { ...view, draft: { ...view.draft, id: estimateDraftWorkspaceId }, context: { ...view.context, proposalId: estimateDraftWorkspaceId } }, ...(href ? { href } : {}) }));
    await expect(estimateDraftRequest('POST', { workspaceId: estimateDraftWorkspaceId, ...binding, decision }, undefined, request)).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('accepts a new pending PATCH proposal only for the same source target', async () => {
    const old = estimateDraftViewFixture(), view = structuredClone(old);
    view.draft.id = estimateDraftWorkspaceId; view.context.proposalId = view.draft.id;
    view.draft.inputHash = 'f'.repeat(64); view.context.inputHash = view.draft.inputHash;
    const fetch = vi.fn(async () => Response.json({ view })); vi.stubGlobal('fetch', fetch);
    const { client, request } = transport(estimateDraftWorkspaceId);
    const body = { workspaceId: estimateDraftWorkspaceId, request: estimateDraftBinding(old), content: old.draft.proposed };
    await expect(estimateDraftRequest('PATCH', body, undefined, request)).resolves.toMatchObject({ view });
    fetch.mockResolvedValue(Response.json({ view: old }));
    await expect(estimateDraftRequest('PATCH', body, undefined, request)).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
});

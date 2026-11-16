import { afterEach, describe, expect, it, vi } from 'vitest';
import { estimateEditorSeedSchema, estimateSharingReviewSchema, estimateListResultSchema, estimateDeletedResultSchema, estimateLinkResultSchema } from '@salesmora/contracts';
import { estimateSeedFixture, estimateSharingFixture, estimateListFixture } from '../api/api-estimate.fixtures';
import { workflowScope } from '../api/api-workflow.fixtures';
import { apiReadOptions } from '../api/api-read-options';
import { createApiQueryClient } from '../api/api-query';
import { ApiContractError, ApiRequestError } from '../api/api-request';
import { estimateReadResource, fetchEstimateQuery } from './use-estimate-request';

afterEach(() => vi.unstubAllGlobals());
describe('estimate query projections', () => {
  it.each([
    ['/api/estimates/related?page=2', 'related-estimates'], ['/api/estimates/parents', 'estimate-parents'],
    ['/api/estimates/id/lifecycle', 'estimate-history'], ['/api/estimates/id/revisions', 'estimate-revisions'],
    ['/api/estimates/id/sharing', 'estimate-sharing'], ['/api/estimates/id/decision', 'estimate-decision'],
    ['/api/estimates/id/convert', 'estimate-conversion'], ['/api/estimates/id/lead-stage', 'estimate-lead-stage'],
    ['/api/estimates/id', 'estimate-detail'], ['/api/materials?q=fitting', 'materials'],
    ['/api/leads?q=kitchen', 'leads'], ['/api/jobs?status=open', 'jobs'],
  ])('maps %s into the %s invalidation family', (path, resource) => {
    expect(estimateReadResource(path)).toBe(resource);
  });
  it('accepts saved and incomplete drafts without inventing required recipient details', () => {
    expect(estimateEditorSeedSchema.parse(estimateSeedFixture)).toEqual(estimateSeedFixture);
    const seed = structuredClone(estimateSeedFixture);
    seed.estimate!.values.details.recipientName = '';
    seed.estimate!.values.details.recipientEmail = '';
    seed.estimate!.values.items = [];
    seed.estimate!.values.terms.validUntil = '';
    expect(estimateEditorSeedSchema.safeParse(seed).success).toBe(true);
    expect(estimateSharingReviewSchema.safeParse(estimateSharingFixture).success).toBe(true);
    expect(estimateListResultSchema.safeParse(estimateListFixture).success).toBe(true);
  });
  it('requires an authoritative deletion receipt and a same-origin capability path', () => {
    expect(estimateDeletedResultSchema.safeParse({ deleted: true }).success).toBe(false);
    expect(estimateDeletedResultSchema.safeParse({ deleted: true, id: estimateSeedFixture.estimate!.id }).success).toBe(true);
    expect(estimateLinkResultSchema.safeParse({ path: `/e/${'a'.repeat(43)}` }).success).toBe(true);
    expect(estimateLinkResultSchema.safeParse({ path: `https://example.test/e/${'a'.repeat(43)}` }).success).toBe(false);
  });
  it('reuses exact filters, revalidates explicit reviews and refuses malformed data', async () => {
    const fetch = vi.fn(async () => Response.json(estimateListFixture));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const read = (q: string) => apiReadOptions(workflowScope, 'estimates', { q, page: 1 }, `/api/estimates?q=${q}`, raw => estimateListResultSchema.parse(raw), 'Read failed.');
    try {
      await client.fetchQuery(read(''));
      await client.fetchQuery(read('kitchen'));
      await client.fetchQuery(read(''));
      expect(fetch).toHaveBeenCalledTimes(2);
      await client.fetchQuery({ ...read(''), staleTime: 0 });
      expect(fetch).toHaveBeenCalledTimes(3);
      fetch.mockImplementation(async () => Response.json({ rows: [] }));
      await expect(client.fetchQuery(read('malformed'))).rejects.toBeInstanceOf(ApiContractError);
      expect(client.getQueryData(read('malformed').queryKey)).toBeUndefined();
    } finally { client.clear(); }
  });
  it('does not abort another consumer when a review closes during a deduplicated read', async () => {
    let respond!: (response: Response) => void;
    const fetch = vi.fn(() => new Promise<Response>(resolve => { respond = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), controller = new AbortController();
    const path = `/api/estimates/${estimateSeedFixture.estimate!.id}?workspace=${workflowScope.workspaceId}`;
    try {
      const first = fetchEstimateQuery(client, workflowScope, path, 'Read failed.', { signal: controller.signal }, raw => estimateEditorSeedSchema.parse(raw));
      const firstRejected = expect(first).rejects.toMatchObject({ name: 'AbortError' });
      controller.abort();
      const second = fetchEstimateQuery(client, workflowScope, path, 'Read failed.', {}, raw => estimateEditorSeedSchema.parse(raw));
      respond(Response.json(estimateSeedFixture));
      await firstRejected;
      expect(await second).toEqual(estimateSeedFixture);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally { client.clear(); }
  });
  it('lets concurrent active reviews receive their own denial instead of canceling each other', async () => {
    const responses = new Map<string, (response: Response) => void>();
    vi.stubGlobal('fetch', vi.fn((path: string) => new Promise<Response>(resolve => { responses.set(path, resolve); })));
    const client = createApiQueryClient({ testing: true });
    const historyPath = '/api/estimates/id/lifecycle', revisionPath = '/api/estimates/id/revisions';
    try {
      const history = fetchEstimateQuery(client, workflowScope, historyPath, 'Read failed.', {}, raw => raw);
      const revision = fetchEstimateQuery(client, workflowScope, revisionPath, 'Read failed.', {}, raw => raw);
      const historyRejected = expect(history).rejects.toBeInstanceOf(ApiRequestError);
      const revisionRejected = expect(revision).rejects.toMatchObject({ status: 404 });
      responses.get(historyPath)!(Response.json({ error: 'Denied.' }, { status: 403 }));
      await historyRejected;
      responses.get(revisionPath)!(Response.json({ error: 'Unavailable.' }, { status: 404 }));
      await revisionRejected;
      expect(client.getQueryCache().getAll()).toHaveLength(0);
    } finally { client.clear(); }
  });
  it('never stores bearer capability links in the query cache', async () => {
    const path = `/e/${'a'.repeat(43)}`;
    const fetch = vi.fn(async () => Response.json({ path }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    try {
      for (let index = 0; index < 2; index++) {
        expect(await fetchEstimateQuery(client, workflowScope, '/api/estimates/id/sharing/link', 'Read failed.', {}, raw => estimateLinkResultSchema.parse(raw))).toEqual({ path });
      }
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(client.getQueryCache().getAll()).toHaveLength(0);
    } finally { client.clear(); }
  });
});

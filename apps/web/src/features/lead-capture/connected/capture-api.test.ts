import { afterEach, expect, it, vi } from 'vitest';
import { captureLifecycleWrite, captureReadSource, CaptureRequestError } from './capture-api';
import { captureInitialConfiguration } from './capture-adapters';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002';
const business = { businessName: 'Fictional business', businessEmail: '', businessPhone: '', services: [], serviceArea: '', timezone: 'UTC', gmailAccess: 'available' as const, teammates: [] };
const source = { id: sourceId, workspaceId, version: 1, name: 'Fictional form', type: 'website', status: 'draft', block: 'none', approvedVersion: null, draftVersion: 1, lastActivityAt: null, scheduledAt: null, timezone: null, metrics: { captured: 0, awaitingReview: 0, approved: 0 } };
const view = () => ({ canEdit: true, policyRevision: 0, business, detail: { source, approved: null, draft: { id: workspaceId, version: 1, baseApprovedVersion: null, configuration: captureInitialConfiguration('website', business) } } });
afterEach(() => vi.unstubAllGlobals());
it('loads an uncached, bounded, scoped source without accepting a response from a different tenant or source', async () => {
  const fetcher = vi.fn().mockImplementation(async () => Response.json(view())); vi.stubGlobal('fetch', fetcher);
  expect((await captureReadSource(workspaceId, sourceId)).detail.source.id).toBe(sourceId);
  expect(fetcher).toHaveBeenCalledWith(`/api/lead-capture/${sourceId}?workspace=${workspaceId}`, expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }));
  for (const change of [{ workspaceId: sourceId }, { id: workspaceId }]) {
    fetcher.mockImplementationOnce(async () => Response.json({ ...view(), detail: { ...view().detail, source: { ...source, ...change } } }));
    await expect(captureReadSource(workspaceId, sourceId)).rejects.toThrow('The source could not be loaded.');
  }
});
it('treats session/scoped denial as a typed failure rather than a usable review', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Unavailable.' }, { status: 404 })));
  await expect(captureReadSource(workspaceId, sourceId)).rejects.toBeInstanceOf(CaptureRequestError);
});
it('requires a valid lifecycle acknowledgement before the dialog can close', async () => {
  const fetcher = vi.fn(async () => Response.json({ ok: true, sourceId, sourceVersion: 2 })); vi.stubGlobal('fetch', fetcher);
  const command = { workspaceId, sourceId, requestId: workspaceId, action: 'archive', confirmed: true, expectedVersion: 1 };
  await expect(captureLifecycleWrite(sourceId, command)).resolves.toMatchObject({ sourceId, sourceVersion: 2 });
  expect(fetcher).toHaveBeenCalledWith(`/api/lead-capture/${sourceId}/lifecycle`, expect.objectContaining({ method: 'POST', body: JSON.stringify(command), signal: expect.any(AbortSignal) }));
  fetcher.mockImplementationOnce(async () => Response.json({ ok: true }));
  await expect(captureLifecycleWrite(sourceId, command)).rejects.toThrow();
});

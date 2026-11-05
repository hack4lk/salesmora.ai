import { expect, it } from 'vitest';
import { capturePublicationWorkspaces, captureReadinessKey } from './delivery-policy';
it('never broadens empty or malformed operator scopes', () => {
  const id = '00000000-0000-4000-8000-000000000001';
  expect(capturePublicationWorkspaces()).toEqual([]); expect(capturePublicationWorkspaces(id + ',' + id)).toEqual([id]);
  for (const value of ['*', 'all', id + ',', 'invalid', 'x'.repeat(3701)]) expect(capturePublicationWorkspaces(value)).toBeNull();
  const key = Buffer.alloc(32, 4).toString('base64'); expect(captureReadinessKey(key)?.length).toBe(32); expect(captureReadinessKey(key.slice(0, -1))).toBeNull();
});

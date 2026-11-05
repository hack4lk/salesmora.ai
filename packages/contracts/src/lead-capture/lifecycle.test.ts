import { expect, it } from 'vitest';
import { captureLifecycleCommandSchema } from './lifecycle';
const id = '00000000-0000-4000-8000-000000000001';
const command = { workspaceId: id, sourceId: id, expectedVersion: 3, requestId: id, action: 'pause', confirmed: true };
it('requires confirmation, identities and exact approved resume context', () => {
  expect(captureLifecycleCommandSchema.safeParse(command).success).toBe(true);
  expect(captureLifecycleCommandSchema.safeParse({ ...command, action: 'archive' }).success).toBe(true);
  expect(captureLifecycleCommandSchema.safeParse({ ...command, action: 'restore' }).success).toBe(true);
  expect(captureLifecycleCommandSchema.safeParse({ ...command, action: 'resume', configuration: { kind: 'approved', version: 2 } }).success).toBe(true);
  for (const change of [{ confirmed: false }, { requestId: '' }, { expectedVersion: 0 }, { action: 'resume' }, { action: 'resume', configuration: { kind: 'draft', version: 2 } }, { configuration: { kind: 'approved', version: 2 } }, { action: 'restore', configuration: { kind: 'approved', version: 2 } }, { action: 'duplicate' }, { authority: { websiteReady: true } }, { readiness: true }, { actorId: 'forged' }]) {
    expect(captureLifecycleCommandSchema.safeParse({ ...command, ...change }).success).toBe(false);
  }
});

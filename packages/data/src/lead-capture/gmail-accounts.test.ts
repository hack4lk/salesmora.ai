import { describe, expect, it } from 'vitest';
import { permissionIds, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { captureGmailCapabilities } from './gmail-accounts';
function context(role: WorkspaceRole): AuthorizationContext {
  const userId = `${role}-user`, workspaceId = 'workspace-a';
  return { userId, workspaceId, ownerUserId: 'owner-user', membership: { userId, workspaceId, role }, enabledPermissions: [...permissionIds], policy: createDefaultWorkspacePolicy(workspaceId, 1) };
}
describe('Gmail capability matrix', () => {
  it('derives access from current grants for every role', () => {
    for (const role of ['owner', 'admin', 'office'] as const) {
      expect(captureGmailCapabilities(context(role), true)).toEqual({ canRead: true, canConnect: true, canReconnect: true, canSelect: true, canDisconnect: true });
    }
    expect(Object.values(captureGmailCapabilities(context('field'), true))).toEqual([false, false, false, false, false]);
  });
  it('retains cleanup on downgrade and makes pause permission necessary for disconnect', () => {
    const c = context('office');
    expect(captureGmailCapabilities(c, false)).toEqual({ canRead: true, canConnect: false, canReconnect: false, canSelect: false, canDisconnect: true });
    c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== 'leadCapture.pause');
    expect(captureGmailCapabilities(c, true).canDisconnect).toBe(false);
    expect(captureGmailCapabilities(c, true).canConnect).toBe(true);
  });
  it('respects independently revoked grants and server feature permissions', () => {
    for (const permission of ['leadCapture.read', 'leadCapture.update'] as const) {
      const c = context('office'); c.enabledPermissions = permissionIds.filter(item => item !== permission);
      expect(captureGmailCapabilities(c, true).canConnect).toBe(false);
      expect(captureGmailCapabilities(c, true).canDisconnect).toBe(false);
    }
    const c = context('office'); c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== 'leadCapture.update');
    expect(captureGmailCapabilities(c, true).canRead).toBe(true);
    expect(captureGmailCapabilities(c, true).canSelect).toBe(false);
  });
});

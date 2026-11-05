import { describe, expect, it } from 'vitest';
import { adminPermissionIds, staffRolePermissions } from '@salesmora/contracts';
import { authorizeAdmin } from './authorize';

describe('authorizeAdmin', () => {
  it('grants every catalog permission to Super Admin', () => {
    expect(staffRolePermissions.super_admin).toEqual(adminPermissionIds);
    for (const permission of adminPermissionIds) {
      expect(authorizeAdmin('super_admin', permission)).toEqual({ allowed: true, role: 'super_admin', permission });
    }
  });

  it('limits Support to customer support and day-to-day account operations', () => {
    expect(authorizeAdmin('support', 'admin.users.suspend').allowed).toBe(true);
    expect(authorizeAdmin('support', 'admin.workspaces.members.remove').allowed).toBe(true);
    expect(authorizeAdmin('support', 'admin.data.requests.export').allowed).toBe(true);
    expect(authorizeAdmin('support', 'admin.queues.read').allowed).toBe(true);
    expect(authorizeAdmin('support', 'admin.queues.retry')).toEqual({ allowed: false, reason: 'permission-denied' });
    expect(authorizeAdmin('support', 'admin.workspaces.ownership.transfer')).toEqual({ allowed: false, reason: 'permission-denied' });
    expect(authorizeAdmin('support', 'admin.users.email.change')).toEqual({ allowed: false, reason: 'permission-denied' });
    expect(authorizeAdmin('support', 'admin.data.requests.process')).toEqual({ allowed: false, reason: 'permission-denied' });
  });

  it('limits Billing to financial operations and read-only account access', () => {
    expect(authorizeAdmin('billing', 'admin.billing.plan.change').allowed).toBe(true);
    expect(authorizeAdmin('billing', 'admin.workspaces.plan.override').allowed).toBe(true);
    expect(authorizeAdmin('billing', 'admin.users.pii.reveal').allowed).toBe(true);
    expect(authorizeAdmin('billing', 'admin.users.suspend')).toEqual({ allowed: false, reason: 'permission-denied' });
    expect(authorizeAdmin('billing', 'admin.workspaces.suspend')).toEqual({ allowed: false, reason: 'permission-denied' });
    expect(authorizeAdmin('billing', 'admin.impersonation.start')).toEqual({ allowed: false, reason: 'permission-denied' });
  });

  it('fails closed for unrecognized roles and permissions', () => {
    expect(authorizeAdmin('engineer', 'admin.queues.read')).toEqual({ allowed: false, reason: 'invalid-role' });
    expect(authorizeAdmin('support', 'admin.unknown.read')).toEqual({ allowed: false, reason: 'invalid-permission' });
    expect(authorizeAdmin(null, 'admin.users.read')).toEqual({ allowed: false, reason: 'invalid-role' });
  });
});

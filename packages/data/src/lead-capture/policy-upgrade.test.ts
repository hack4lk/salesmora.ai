import { describe, expect, it } from 'vitest';
import defaults from '../authorization/defaults-v1.json' with { type: 'json' };
import { canonicalCaptureGrants, untouchedCaptureDefault } from './policy-upgrade';
const workspaceId = 'workspace';
const seeded = defaults.filter(grant => (!/\.(export|delete|archive)$/.test(grant.permission) || ['owner', 'admin'].includes(grant.role)) && (!['permissions.read', 'permissions.manage', 'billing.manage', 'ownership.transfer'].includes(grant.permission) || grant.role === 'owner'));
const snapshot = { workspaceId, revision: 0, grants: seeded };
const first = { action: 'migration.seeded', beforeRevision: null, afterRevision: 0, beforePolicy: null, afterPolicy: snapshot };
describe('Lead Capture policy cutover', () => {
  it('renames each existing grant, preserves denials and rejects conflicting aliases', () => {
    expect(canonicalCaptureGrants([{ role: 'office', permission: 'campaigns.pause', scope: 'workspace' }])).toEqual([{ role: 'office', permission: 'leadCapture.pause', scope: 'workspace' }]);
    expect(canonicalCaptureGrants([])).toEqual([]);
    expect(() => canonicalCaptureGrants([{ role: 'office', permission: 'campaigns.create', scope: 'enabled' }, { role: 'office', permission: 'leadCapture.create', scope: 'workspace' }])).toThrow('Conflicting');
  });
  it('requires a recognized exact seed, continuous audit history and matching current grants', () => {
    expect(untouchedCaptureDefault(workspaceId, 0, seeded, [first])).toBe(true);
    expect(untouchedCaptureDefault(workspaceId, 0, seeded, [])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 0, [...seeded, { role: 'office', permission: 'leadCapture.read', scope: 'workspace' }], [first])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 0, seeded.slice(1), [first])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 0, seeded, [{ ...first, afterPolicy: { ...snapshot, grants: seeded.slice(1) } }])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 1, seeded, [first, { action: 'policy.saved', beforeRevision: 0, afterRevision: 1, beforePolicy: snapshot, afterPolicy: { ...snapshot, revision: 1 } }])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 2, seeded, [first, { action: 'migration.estimates', beforeRevision: 1, afterRevision: 2, beforePolicy: { ...snapshot, revision: 1 }, afterPolicy: { ...snapshot, revision: 2 } }])).toBe(false);
  });
  it('does not accept known action names as a substitute for chain integrity', () => {
    const after = { ...snapshot, revision: 1 };
    const audit = { action: 'migration.estimates', beforeRevision: 0, afterRevision: 1, beforePolicy: snapshot, afterPolicy: after };
    expect(untouchedCaptureDefault(workspaceId, 1, seeded, [first, audit])).toBe(true);
    expect(untouchedCaptureDefault(workspaceId, 1, seeded, [first, { ...audit, beforePolicy: { ...snapshot, grants: [] } }])).toBe(false);
    expect(untouchedCaptureDefault(workspaceId, 1, seeded, [first, { ...audit, action: 'unknown' }])).toBe(false);
  });
});

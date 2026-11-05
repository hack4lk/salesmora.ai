import { canonicalCapturePermission } from '@salesmora/contracts';
import frozenDefaults from '../authorization/defaults-v1.json' with { type: 'json' };

type Grant = { role: string; permission: string; scope: string };
type Audit = { action: string; beforeRevision: number | null; afterRevision: number; beforePolicy: unknown; afterPolicy: unknown };
/** Migration compatibility, not an authorization engine. Ambiguous duplicate identities stop the cutover. */
export function canonicalCaptureGrants(grants: readonly Grant[]): Grant[] {
  const result = new Map<string, Grant>();
  for (const grant of grants) {
    const next = { role: grant.role, permission: canonicalCapturePermission(grant.permission), scope: grant.scope }, key = `${next.role}:${next.permission}`;
    const prior = result.get(key);
    if (prior && prior.scope !== next.scope) throw new Error(`Conflicting capture policy grant: ${key}`);
    result.set(key, next);
  }
  return [...result.values()];
}
const serialize = (grants: readonly Grant[]) => JSON.stringify(canonicalCaptureGrants(grants).map(grant => `${grant.role}:${grant.permission}:${grant.scope}`).sort());
const historicalSeed = frozenDefaults.filter(grant => (!/\.(export|delete|archive)$/.test(grant.permission) || ['owner', 'admin'].includes(grant.role)) && (!['permissions.read', 'permissions.manage', 'billing.manage', 'ownership.transfer'].includes(grant.permission) || grant.role === 'owner'));
const historicalNewWorkspace = [...frozenDefaults, { role: 'field', permission: 'jobs.schedule.update', scope: 'assigned' }, ...['owner', 'admin', 'office'].map(role => ({ role, permission: 'workorders.schedule.update', scope: 'workspace' })), { role: 'field', permission: 'workorders.schedule.update', scope: 'assigned_job' }, ...['owner', 'admin'].map(role => ({ role, permission: 'billing.read', scope: 'enabled' }))];
const knownActions = new Set(['migration.billing-read', 'customers.field-ceiling-aligned', 'migration.work-orders', 'migration.materials', 'migration.calendar-scheduling', 'migration.estimates']);
function policy(input: unknown, workspaceId: string): { revision: number; grants: Grant[] } | null {
  if (!input || typeof input !== 'object' || !('workspaceId' in input) || input.workspaceId !== workspaceId || !('revision' in input) || !Number.isSafeInteger(input.revision) || !('grants' in input) || !Array.isArray(input.grants)) return null;
  if (!input.grants.every(grant => grant && ['role', 'permission', 'scope'].every(key => typeof grant[key] === 'string'))) return null;
  return input as { revision: number; grants: Grant[] };
}
/** Frozen known seeds and a complete, unchanged audit chain are required. Unknown histories never acquire Office archive. */
export function untouchedCaptureDefault(workspaceId: string, revision: number, current: readonly Grant[], audits: readonly Audit[]): boolean {
  try {
    if (canonicalCaptureGrants(current).length !== current.length) return false;
    const [first, ...rest] = audits;
    if (!first || first.beforeRevision !== null || first.afterRevision !== 0) return false;
    const seed = first.action === 'migration.seeded' ? historicalSeed : first.action === 'workspace.seeded' ? historicalNewWorkspace : null;
    let previous = policy(first.afterPolicy, workspaceId);
    if (!seed || !previous || previous.revision !== 0 || serialize(previous.grants) !== serialize(seed)) return false;
    for (const audit of rest) {
      const before = policy(audit.beforePolicy, workspaceId), after = policy(audit.afterPolicy, workspaceId);
      if (!knownActions.has(audit.action) || !before || !after || audit.beforeRevision !== previous.revision || audit.afterRevision !== previous.revision + 1 || before.revision !== previous.revision || after.revision !== audit.afterRevision || serialize(before.grants) !== serialize(previous.grants)) return false;
      previous = after;
    }
    return previous.revision === revision && serialize(previous.grants) === serialize(current);
  } catch { return false; }
}

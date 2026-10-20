import type { AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';

/** Intersect export authority with read authority; an export can never broaden a read. */
export function resolveExportScope(context: AuthorizationContext): 'workspace' | 'assigned' | null {
  const read = resolveAuthorizedCollectionScope(context, 'leads.read'), exp = resolveAuthorizedCollectionScope(context, 'leads.export');
  if (!read.allowed || !exp.allowed || read.resourceKind !== 'lead' || exp.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(read.scope) || !['workspace', 'assigned'].includes(exp.scope)) return null;
  return read.scope === 'assigned' || exp.scope === 'assigned' ? 'assigned' : 'workspace';
}

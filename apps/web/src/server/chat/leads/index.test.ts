import { describe, expect, it, vi } from 'vitest';
import { isLeadOperation, leadCapabilities, permissionCatalog, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { toolRegistry } from '@salesmora/agent';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { AuthorizationAccessError } from '@salesmora/data';
vi.mock('server-only', () => ({}));
import { assertToolOperation } from '../tools/authorization';

const filters = { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
const changes = [{ field: 'phone', value: '' }];
const inputs = {
  history: { leadRef: '', mode: 'notes' }, details: { leadRef: '' },
  search: { mode: 'filters', filters }, pipeline_summary: {},
  create: { name: '', service: '', email: '', phone: '', address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: '' },
  update: { leadRef: '', changes },
  update_with_stage: { leadRef: '', changes, stage: { to: 'contacted', reason: '' } },
  add_note: { leadRef: '', body: '' }, delete: { leadRef: '' },
  export_csv: { mode: 'filters', filters },
  set_archived: { leadRef: '', archived: true },
  assign: { leadRef: '', assignment: { kind: 'self', teammateRef: '' } },
  change_stage: { leadRef: '', to: 'contacted', reason: '' },
};
const identity = { userId: 'fictional-owner', workspaceId: '00000000-0000-4000-8000-000000000001' };
const authority: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId, membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(identity.workspaceId),
  enabledPermissions: Object.keys(permissionCatalog) as PermissionId[],
};

describe('shared Lead operation authorization', () => {
  it.each(Object.entries(inputs))('checks %s before domain execution or missing-field clarification', (operation, input) => {
    if (!isLeadOperation(operation)) throw new Error('Unknown fixture operation.');
    const tool = leadCapabilities[operation].tool;
    const args = toolRegistry[tool].inputSchema.parse({ request: { operation, input } });
    expect(() => assertToolOperation(authority, 'home', tool, args)).not.toThrow();
    expect(() => assertToolOperation({ ...authority, enabledPermissions: ['assistant.use'] }, 'home', tool, args))
      .toThrow(AuthorizationAccessError);
  });
  it('does not let broad read access authorize a write operation', () => {
    expect(() => assertToolOperation({ ...authority, enabledPermissions: ['assistant.use', 'leads.read'] },
      'home', 'leads_propose_action', { request: { operation: 'delete', input: inputs.delete } }))
      .toThrow(AuthorizationAccessError);
  });
});

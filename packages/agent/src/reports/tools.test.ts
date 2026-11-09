import { describe, expect, it } from 'vitest';
import { chatSurfaceKeys, permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { authorizeChatTool, availableChatTools } from '../access';
import { implementedTools, liveChatTools, readToolRegistry } from '../tools/registry';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const context: AuthorizationContext = {
  workspaceId, userId: 'owner', ownerUserId: 'owner', membership: { workspaceId, userId: 'owner', role: 'owner' },
  policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: [...permissionIds],
};
describe('registered report tool activation boundary', () => {
  it('is read-only and available to authorized callers on every registered surface through the live registry', () => {
    expect(readToolRegistry.reports_query.kind).toBe('read');
    for (const surface of chatSurfaceKeys) {
      expect(authorizeChatTool(context, surface, 'reports_query', implementedTools).allowed).toBe(true);
      expect(availableChatTools(context, surface, liveChatTools)).toContain('reports_query');
      expect(authorizeChatTool(context, surface, 'reports_query', liveChatTools).allowed).toBe(true);
    }
  });
  it('requires both assistant and reports entrance; native readers independently gate domain and money', () => {
    for (const permission of ['assistant.use', 'reports.read']) {
      const denied = { ...context, enabledPermissions: context.enabledPermissions.filter(value => value !== permission) };
      expect(authorizeChatTool(denied, 'home', 'reports_query', implementedTools).allowed).toBe(false);
    }
    expect(authorizeChatTool(context, 'home', 'reports_query').allowed).toBe(false);
    expect(readToolRegistry.reports_query.modelDefinition.function.parameters.type).toBe('object');
  });
});

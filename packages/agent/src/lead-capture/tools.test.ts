import { describe, expect, it } from 'vitest';
import { chatSurfaceKeys, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { authorizeChatTool } from '../access';
import { implementedTools } from '../tools/registry';
import { captureSetupProposeSchema } from '@salesmora/contracts';
import { captureSetupTool, captureQueryTool } from './tools';
const workspaceId = '00000000-0000-4000-8000-000000000001';
function context(role: WorkspaceRole): AuthorizationContext { const userId = `${role}-user`; return { workspaceId, userId, ownerUserId: 'owner-user', membership: { workspaceId, userId, role }, policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: ['assistant.use', 'leadCapture.read'] }; }
describe('registered Lead Capture read tool', () => {
  for (const role of ['owner', 'admin', 'office'] as const) it(`${role}: offers reads globally only with both current permissions and an implemented handler`, () => {
    const c = context(role);
    for (const surface of chatSurfaceKeys) expect(authorizeChatTool(c, surface, 'lead_capture_query', implementedTools).allowed).toBe(true);
    for (const permission of c.enabledPermissions) expect(authorizeChatTool({ ...c, enabledPermissions: c.enabledPermissions.filter(p => p !== permission) }, 'lead_capture.detail', 'lead_capture_query', implementedTools).allowed).toBe(false);
    expect(authorizeChatTool(c, 'home', 'lead_capture_query', []).allowed).toBe(false);
  });
  it('preserves Field defaults and grants custom reviewed read access independently of source mutation permissions', () => {
    const c = context('field'); expect(authorizeChatTool(c, 'home', 'lead_capture_query', implementedTools).allowed).toBe(false);
    c.policy.grants.push({ role: 'field', permission: 'leadCapture.read', scope: 'workspace' });
    const decision = authorizeChatTool(c, 'lead_capture.list', 'lead_capture_query', implementedTools);
    expect(decision).toMatchObject({ allowed: true, scope: 'workspace', workspaceId, permission: 'leadCapture.read' });
    expect(authorizeChatTool(c, 'lead_capture.list', 'lead_capture_propose_action', implementedTools).allowed).toBe(false);
  });
  it('allows a wire-valid missing source name to reach clarification while refusing it as a business command', () => {
    const input = { operation: 'create_source', sourceId: null, name: null, sourceType: 'gmail', fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null };
    expect(captureSetupTool.inputSchema.safeParse(input).success).toBe(true);
    expect(captureSetupProposeSchema.safeParse(input).success).toBe(false);
  });
  it('identifies the exact missing sample arrays so the assistant can repair its proposal', () => {
    const result = captureSetupProposeSchema.safeParse({ operation: 'extract_sample', sourceId: null, name: null, sourceType: null, fields: null, contactRequired: true, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map(issue => issue.path.join('.'))).toEqual(['fields', 'findings', 'mappings']);
  });
  it('exposes only strict bounded read operations, never a confirmation or readiness override', () => {
    expect(captureQueryTool.modelDefinition.function.parameters.additionalProperties).toBe(false);
    expect(captureQueryTool.modelDefinition.function.parameters.properties.operation.enum).not.toContain('publish');
    expect(captureQueryTool.inputSchema.safeParse({ operation: 'sources', sourceId: null, search: '', type: null, status: null, archived: false, usePageFilters: false, page: 1, limit: 20, confirmed: true }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { chatToolIds, materialsQuerySchema, materialsProposeSchema, workspaceRoles, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { authorizeChatTool } from '../access';
import { availableMaterialOperations } from './tools';
import { isImplementedTool, readToolRegistry } from '../tools/registry';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const context = (role: WorkspaceRole, enabled: string[]): AuthorizationContext => ({
  workspaceId, userId: `${role}-user`, ownerUserId: 'owner-user', membership: { workspaceId, userId: role + '-user', role },
  policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: enabled as AuthorizationContext['enabledPermissions'] });
const base = { query: null, category: null, supplier: null, limit: null };

describe('materials_query', () => {
  it('is a registered read tool that the model cannot widen', () => {
    expect(isImplementedTool('materials_query')).toBe(true);
    expect(readToolRegistry.materials_query.kind).toBe('read');
    expect(() => materialsQuerySchema.parse({ ...base, operation: 'search', workspaceId })).toThrow();
    expect(() => materialsQuerySchema.parse({ ...base, operation: 'delete' })).toThrow();
    expect(() => materialsQuerySchema.parse({ ...base, operation: 'details' })).toThrow();
    expect(() => materialsQuerySchema.parse({ ...base, operation: 'search', limit: 21 })).toThrow();
    expect(materialsQuerySchema.parse({ ...base, operation: 'details', query: 'SKU-1' }).query).toBe('SKU-1');
  });
  for (const role of workspaceRoles) it(`${role}: needs both the assistant and the catalog read grant`, () => {
    const allowed = authorizeChatTool(context(role, ['assistant.use', 'materials.read']), 'work_order.detail', 'materials_query', chatToolIds).allowed;
    expect(authorizeChatTool(context(role, ['assistant.use']), 'work_order.detail', 'materials_query', chatToolIds).allowed).toBe(false);
    expect(authorizeChatTool(context(role, ['materials.read']), 'work_order.detail', 'materials_query', chatToolIds).allowed).toBe(false);
    if (['owner', 'admin', 'office'].includes(role)) expect(allowed).toBe(true);
  });
});

const propose = { target: null, name: null, sku: null, unit: null, category: null, supplier: null, costDollars: null, priceDollars: null, notes: null, sourceUrl: null };
describe('materials_propose_action', () => {
  it('is a draft tool with a strict, validated shape', () => {
    expect(isImplementedTool('materials_propose_action')).toBe(true);
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'create' })).toThrow();
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'edit', target: 'Wire' })).toThrow();
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'archive' })).toThrow();
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'create', name: 'Wire', materialId: 'x' })).toThrow();
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'create', name: 'Wire', unit: 'pallet' })).toThrow();
    expect(() => materialsProposeSchema.parse({ ...propose, operation: 'create', name: 'Wire', sourceUrl: 'javascript:alert(1)' })).toThrow();
    expect(materialsProposeSchema.parse({ ...propose, operation: 'edit', target: 'Wire', priceDollars: 2.5 }).priceDollars).toBe(2.5);
  });
  it('export needs no target but nothing else', () => {
    expect(materialsProposeSchema.parse({ ...propose, operation: 'export' }).operation).toBe('export');
  });
  it('owners manage, proposers only create, readers get nothing', () => {
    expect(availableMaterialOperations(context('owner', ['assistant.use', 'materials.read', 'materials.manage']))).toEqual(['create', 'edit', 'archive', 'restore', 'export']);
    expect(availableMaterialOperations(context('office', ['assistant.use', 'materials.read', 'materials.propose']))).toEqual(['create']);
    expect(availableMaterialOperations(context('office', ['assistant.use', 'materials.read']))).toEqual([]);
    expect(availableMaterialOperations(context('owner', ['materials.read', 'materials.manage']))).toEqual([]);
  });
  it('is hidden without a change capability', () => {
    expect(authorizeChatTool(context('owner', ['assistant.use', 'materials.read']), 'work_order.detail', 'materials_propose_action', chatToolIds).allowed).toBe(false);
    expect(authorizeChatTool(context('owner', ['assistant.use', 'materials.read', 'materials.manage']), 'work_order.detail', 'materials_propose_action', chatToolIds).allowed).toBe(true);
  });
});

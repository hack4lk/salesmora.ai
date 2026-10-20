import { describe, expect, it } from 'vitest';
import { chatToolIds, workOrdersQuerySchema, workOrdersProposeSchema, workspaceRoles, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { authorizeChatTool } from '../access';
import { availableWorkOrderOperations } from './tools';
import { isImplementedTool, readToolRegistry } from '../tools/registry';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const context = (role: WorkspaceRole, enabled = ['assistant.use', 'workorders.read']): AuthorizationContext => ({
  workspaceId, userId: `${role}-user`, ownerUserId: 'owner-user', membership: { workspaceId, userId: role + '-user', role },
  policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: enabled as AuthorizationContext['enabledPermissions'] });
const base = { query: null, status: null, mine: null, when: null, workOrderNumber: null, limit: null };

describe('work_orders_query', () => {
  it('is a registered read tool that the model cannot widen', () => {
    expect(isImplementedTool('work_orders_query')).toBe(true);
    expect(readToolRegistry.work_orders_query.kind).toBe('read');
    expect(() => workOrdersQuerySchema.parse({ ...base, operation: 'search', workspaceId })).toThrow();
    expect(() => workOrdersQuerySchema.parse({ ...base, operation: 'delete' })).toThrow();
    expect(() => workOrdersQuerySchema.parse({ ...base, operation: 'details' })).toThrow();
    expect(() => workOrdersQuerySchema.parse({ ...base, operation: 'details', workOrderNumber: 'WO-1; drop' })).toThrow();
    expect(() => workOrdersQuerySchema.parse({ ...base, operation: 'search', limit: 21 })).toThrow();
    expect(workOrdersQuerySchema.parse({ ...base, operation: 'details', workOrderNumber: 'wo-1004' }).workOrderNumber).toBe('wo-1004');
  });
  for (const role of workspaceRoles) it(`${role}: follows the read grant on every surface`, () => {
    for (const surface of ['home', 'work_order.list', 'work_order.detail']) {
      expect(authorizeChatTool(context(role), surface, 'work_orders_query', chatToolIds).allowed).toBe(true);
      expect(authorizeChatTool(context(role, ['assistant.use']), surface, 'work_orders_query', chatToolIds).allowed).toBe(false);
      expect(authorizeChatTool(context(role, ['workorders.read']), surface, 'work_orders_query', chatToolIds).allowed).toBe(false);
    }
  });
  it('is unavailable unless the runtime lists it', () => {
    expect(authorizeChatTool(context('owner'), 'home', 'work_orders_query', []).allowed).toBe(false);
  });
});

describe('work_orders_propose_action', () => {
  const propose = { workOrderNumber: null, jobNumber: null, title: null, instructions: null, safetyNotes: null, scheduledDate: null, arrivalWindow: null, assignee: null, crew: null, tasks: null, taskLabel: null, done: null, materials: null, status: null, reason: null, summary: null, overrideReason: null, body: null, query: null, filterStatus: null, mine: null, when: null, columns: null };
  it('is a draft tool and rejects unknown operations or missing fields', () => {
    expect(isImplementedTool('work_orders_propose_action')).toBe(true);
    expect(() => workOrdersProposeSchema.parse({ ...propose, operation: 'delete' })).toThrow();
    expect(() => workOrdersProposeSchema.parse({ ...propose, operation: 'add_note' })).toThrow();
    expect(() => workOrdersProposeSchema.parse({ ...propose, operation: 'add_note', body: 'x', extra: 1 })).toThrow();
    expect(workOrdersProposeSchema.parse({ ...propose, operation: 'add_note', body: 'Call first' }).body).toBe('Call first');
  });
  it('is offered only with work order read access and no write grant yields none', () => {
    expect(availableWorkOrderOperations(context('owner', ['assistant.use'])).length).toBe(0);
    expect(availableWorkOrderOperations(context('owner')).includes('export_csv')).toBe(false);
    expect(authorizeChatTool(context('owner', ['assistant.use']), 'work_order.detail', 'work_orders_propose_action', chatToolIds).allowed).toBe(false);
  });
});

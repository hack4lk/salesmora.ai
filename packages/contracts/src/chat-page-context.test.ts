import { describe, expect, it } from 'vitest';
import { chatTurnRequestSchema } from './chat';
const id = '00000000-0000-4000-8000-000000000001';
const base = { workspaceId: id, clientTurnId: id, message: 'Summarize this lead', surfaceKey: 'lead.detail' };
describe('chat page context intent', () => {
  it('accepts one lead ID without trusting its display label or version', () => {
    expect(chatTurnRequestSchema.safeParse({ ...base, recordRefs: [{ type: 'lead', id }] }).success).toBe(true);
    for (const ref of [{ type: 'lead', id, name: 'Owner' }, { type: 'lead', id, version: 1 }, { type: 'campaign', id }]) expect(chatTurnRequestSchema.safeParse({ ...base, recordRefs: [ref] }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...base, recordRefs: [{ type: 'lead', id }, { type: 'lead', id }] }).success).toBe(false);
  });
  it('restricts context to its surface and rejects bulk selection, forged authority and invalid dates', () => {
    const uiState = { view: 'pipeline', filters: { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false } };
    expect(chatTurnRequestSchema.safeParse({ ...base, surfaceKey: 'leads.list', uiState }).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({ ...base, uiState }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...base, surfaceKey: 'home', recordRefs: [{ type: 'lead', id }] }).success).toBe(false);
    for (const patch of [{ role: 'owner' }, { selectedLeadIds: [id] }, { contextLabel: 'Using Owner' }]) expect(chatTurnRequestSchema.safeParse({ ...base, ...patch }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...base, surfaceKey: 'leads.list', uiState: { ...uiState, filters: { ...uiState.filters, created: 'custom' } } }).success).toBe(false);
  });
});

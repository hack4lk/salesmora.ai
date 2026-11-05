import { describe, expect, it } from 'vitest';
import { chatTurnRequestSchema, chatStreamEventSchema } from '../chat';
import { captureChatQuerySchema, captureChatResultSchema, captureChatOpenSchema } from './assistant-read';
const id = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const query = { operation: 'sources', sourceId: null, search: null, type: null, status: null, archived: false, usePageFilters: true, page: 1, limit: 20 };
describe('executable capture read contracts', () => {
  it('requires bounded exact read inputs and rejects mutation/authority fields', () => {
    expect(captureChatQuerySchema.safeParse(query).success).toBe(true);
    for (const patch of [{ limit: 21 }, { operation: 'publish' }, { confirmed: true }, { workspaceId: id }, { websiteReady: true }]) expect(captureChatQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    expect(captureChatQuerySchema.safeParse({ ...query, operation: 'source_details', sourceId: id }).success).toBe(false);
    expect(captureChatQuerySchema.safeParse({ ...query, operation: 'source_details', sourceId: id, usePageFilters: false, limit: 1 }).success).toBe(true);
  });
  it('binds context to the actual source page while allowing explicitly cleared context', () => {
    const request = { workspaceId: id, clientTurnId: other, surfaceKey: 'lead_capture.detail', message: 'Read this source', captureContext: { surface: 'lead_capture.detail', sourceId: id } };
    expect(chatTurnRequestSchema.safeParse(request).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({ ...request, surfaceKey: 'home' }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...request, captureContext: undefined }).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({ ...request, captureContext: { ...request.captureContext, websiteReady: true } }).success).toBe(false);
  });
  it('keeps source counts and filter windows truthful and metadata navigation mutation-free', () => {
    const result = { id, workspaceId: id, operation: 'sources', retrievedAt: '2026-11-02T12:00:00Z', timezone: 'America/New_York', rows: [], total: 50, page: 1, limit: 20, filters: { search: '', archived: false } };
    expect(captureChatResultSchema.safeParse(result).success).toBe(true);
    expect(captureChatResultSchema.safeParse({ ...result, timezone: 'invalid' }).success).toBe(false);
    expect(captureChatOpenSchema.safeParse({ workspaceId: id, turnId: other, resultId: id, snapshotHash: 'a'.repeat(64), sourceId: other, confirmed: true }).success).toBe(false);
  });
  it('streams only a result ticket, without trusting browser-supplied source data', () => {
    const event = { version: 1, runId: id, turnId: id, sequence: 1, type: 'capture.result', messageId: other, result: { workspaceId: id, turnId: id, resultId: other, operation: 'sources', snapshotHash: 'a'.repeat(64) } };
    expect(chatStreamEventSchema.safeParse(event).success).toBe(true);
    expect(chatStreamEventSchema.safeParse({ ...event, result: { ...event.result, source: { name: 'Injected' } } }).success).toBe(false);
  });
});

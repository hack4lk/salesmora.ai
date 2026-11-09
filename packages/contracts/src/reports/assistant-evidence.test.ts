import { describe, expect, it } from 'vitest';
import { reportAssistantBindingSchema, reportAssistantEvidenceSchema, reportAssistantTicket,
  reportAssistantTicketSchema, reportAssistantReadSnapshotSchema, reportAssistantResultRequestSchema } from './assistant-evidence';
import { reportSelectionExamples } from './assistant-query.fixtures';
import { chatTurnRequestSchema, chatStreamEventSchema, chatHistoryResponseSchema } from '../chat';

const id = '00000000-0000-4000-8000-000000000022';
const binding = reportAssistantBindingSchema.parse({
  id, workspaceId: reportSelectionExamples[0].query.workspaceId, viewerId: 'owner', policyRevision: 1,
  selection: reportSelectionExamples[0], stamp: 'a'.repeat(64), contentHash: 'b'.repeat(64),
  retrievedAt: '2026-11-09T15:00:00.000Z',
});
describe('private report evidence and opaque transport', () => {
  it.each(reportSelectionExamples)('binds native $area / $query.view configuration without browser authority', selection => {
    expect(reportAssistantBindingSchema.parse({ ...binding, selection }).selection).toEqual(selection);
  });
  it('requires identity/query consistency, immutable hashes and valid retrieval timestamps', () => {
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000099' }, { stamp: 'provider-authored' },
      { contentHash: 'a'.repeat(63) }, { retrievedAt: 'today' }, { policyRevision: -1 }, { access: 'workspace' },
    ]) expect(reportAssistantBindingSchema.safeParse({ ...binding, ...patch }).success).toBe(false);
    expect(reportAssistantReadSnapshotSchema.safeParse({ binding, native: { area: 'leads', read: {} } }).success).toBe(false);
  });
  it('bounds distinct inherited evidence and rejects duplicate IDs', () => {
    const items = Array.from({ length: 7 }, (_, index) => ({ ...binding,
      id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}` }));
    expect(reportAssistantEvidenceSchema.safeParse(items).success).toBe(true);
    expect(reportAssistantEvidenceSchema.safeParse([...items, binding]).success).toBe(false);
    expect(reportAssistantEvidenceSchema.safeParse([binding, binding]).success).toBe(false);
    expect(reportAssistantEvidenceSchema.safeParse(null).success).toBe(false);
  });
  it('only carries an opaque result ticket through stream/history contracts', () => {
    const ticket = reportAssistantTicket(binding);
    expect(ticket).toEqual({ id, area: 'overview', retrievedAt: binding.retrievedAt });
    const envelope = { version: 1, runId: id, turnId: id, sequence: 1, messageId: id };
    expect(chatStreamEventSchema.parse({ ...envelope, type: 'report.result', result: ticket })).toEqual({
      ...envelope, type: 'report.result', result: ticket,
    });
    for (const key of ['native', 'selection', 'stamp', 'viewerId', 'contentHash', 'href']) {
      expect(reportAssistantTicketSchema.safeParse({ ...ticket, [key]: binding }).success).toBe(false);
    }
    const history = { threadId: id, turns: [{ id, state: 'completed', clientTurnId: id,
      createdAt: binding.retrievedAt, reportResult: ticket, reportStatus: 'ready', reportSources: [id], sources: [] }], messages: [] };
    expect(chatHistoryResponseSchema.safeParse(history).success).toBe(true);
    expect(chatHistoryResponseSchema.safeParse({ ...history,
      turns: [{ ...history.turns[0], reportSnapshot: binding }] }).success).toBe(false);
  });
  it('accepts same-workspace configuration but rejects injected results and binding authority on turns', () => {
    const input = { workspaceId: binding.workspaceId, clientTurnId: id, surfaceKey: 'home',
      message: 'Explain this report', reportContext: { selection: binding.selection, period: { preset: 'last30days' } } };
    expect(chatTurnRequestSchema.safeParse(input).success).toBe(true);
    for (const key of ['reportResult', 'reportSnapshot', 'reportEvidence', 'reportSources']) {
      expect(chatTurnRequestSchema.safeParse({ ...input, [key]: binding }).success).toBe(false);
    }
    expect(chatTurnRequestSchema.safeParse({ ...input,
      reportContext: { ...input.reportContext, result: reportAssistantTicket(binding) } }).success).toBe(false);
  });
  it('only accepts private turn/result IDs, not browser-supplied navigation or report evidence', () => {
    const request = { workspaceId: binding.workspaceId, turnId: id, resultId: id };
    expect(reportAssistantResultRequestSchema.parse(request)).toEqual(request);
    for (const key of ['selection', 'href', 'native', 'reportSnapshot', 'stamp']) {
      expect(reportAssistantResultRequestSchema.safeParse({ ...request, [key]: binding }).success).toBe(false);
    }
  });
});

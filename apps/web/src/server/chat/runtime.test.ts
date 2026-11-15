import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { AuthorizationContext } from '@salesmora/contracts';
import type { ConversationModel } from '@salesmora/agent';
import type { ChatToolRequestContext } from './tools/types';
import type { StoredTurn } from './store';
import { withAdmittedChatTurn } from '@salesmora/data';

const mocks = vi.hoisted(() => ({ setup: vi.fn(), validate: vi.fn(), toolTurn: vi.fn(), executor: vi.fn(), history: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('./store', async importOriginal => ({
  ...await importOriginal<typeof import('./store')>(),
  turnRuntimeContext: mocks.setup, validateTurnEvidence: mocks.validate,
  validateTurnEvidenceInTransaction: mocks.toolTurn, readThreads: mocks.history,
}));
vi.mock('./tools', () => ({ createChatToolExecutor: mocks.executor }));
import { liveChatResponse } from './runtime';

const id = '00000000-0000-4000-8000-000000000001';
const identity = { userId: 'fictional-owner', workspaceId: id };
const authority: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId, membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(id), enabledPermissions: ['assistant.use', 'leads.read'],
};
const turn: StoredTurn = {
  ...identity, id, threadId: id, clientTurnId: id, messageId: id, surfaceKey: 'home', state: 'running',
  pageContext: {}, leadEvidence: [], leadSearchEvidence: [], sources: [],
  leadHistoryResult: null, leadDetailsResult: null, leadSearchSnapshot: null,
  requestHash: 'fixture', accessHash: 'fixture', leaseUntil: new Date(Date.now() + 120000), createdAt: new Date(),
};
const request = { workspaceId: id, clientTurnId: id, surfaceKey: 'home' as const, message: 'Fictional question.' };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.setup.mockResolvedValue({ context: authority, reference: null });
  mocks.validate.mockResolvedValue(authority);
  mocks.executor.mockImplementation((context: ChatToolRequestContext) => {
    expect(context.sessionId).toBe('trusted-session');
    return async () => ({ evidence: { type: 'fictional-pipeline' } });
  });
});
const model = (plan: ConversationModel['plan']): ConversationModel => ({
  plan, async *answer() { yield 'Fictional authorized answer.'; },
});

describe('request-local presentation capabilities', () => {
  it('uses setup capabilities for planning, graph dispatch and answer without DB capability reloads', async () => {
    const planning = vi.fn<ConversationModel['plan']>(async () => [
      { name: 'leads_query', args: { request: { operation: 'pipeline_summary', input: {} } } },
    ]);
    const emit = vi.fn(async () => {});
    await liveChatResponse(identity, request, turn, new AbortController().signal, emit, 'trusted-session', model(planning));
    expect(mocks.setup).toHaveBeenCalledOnce();
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(mocks.executor).toHaveBeenCalledOnce();
    expect(planning.mock.calls[0][1]).toContain('leads_query');
    expect(emit).toHaveBeenCalledWith({ type: 'text', text: 'Fictional authorized answer.' });
  });

  it('cannot use stale presentation capabilities to bypass a revoked tool at execution', async () => {
    const answer = vi.fn<ConversationModel['answer']>(async function* () { yield 'Never released.'; });
    const provider: ConversationModel = {
      async plan() {
        return [{ name: 'leads_query', args: { request: { operation: 'pipeline_summary', input: {} } } }];
      },
      answer,
    };
    mocks.executor.mockReturnValue(async () => { throw new Error('Access denied.'); });
    await expect(liveChatResponse(identity, request, turn, new AbortController().signal, async () => {},
      'trusted-session', provider)).rejects.toThrow('Access denied.');
    expect(answer).not.toHaveBeenCalled();
  });

  it('does not reload answer capabilities on no-tool turns; text still goes through the release callback', async () => {
    const denied = new Error('Release denied.');
    const emit = vi.fn(async (event: { type: string }) => {
      if (event.type === 'text') throw denied;
    });
    await expect(liveChatResponse(identity, request, turn, new AbortController().signal, emit,
      'trusted-session', model(async () => []))).rejects.toThrow('Conversation step interrupted');
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(mocks.setup).toHaveBeenCalledOnce();
  });

  it('honors cancellation after planning before executing a tool', async () => {
    const abort = new AbortController();
    const provider = model(async () => {
      abort.abort();
      return [{ name: 'leads_query', args: { request: { operation: 'pipeline_summary', input: {} } } }];
    });
    await expect(liveChatResponse(identity, request, turn, abort.signal, async () => {},
      'trusted-session', provider)).rejects.toThrow('This operation was aborted');
    expect(mocks.validate).not.toHaveBeenCalled();
  });

  it('does not feed restricted or incomplete answers into a follow-up or inherit their evidence', async () => {
    mocks.history.mockResolvedValue({
      threadId: id,
      turns: [
        { id: 'restricted', contextAvailable: false },
        { id: 'incomplete', contextAvailable: false },
      ],
      messages: [
        { id: 'restricted-message', turnId: 'restricted', role: 'assistant', text: 'Restricted source.' },
        { id: 'incomplete-message', turnId: 'incomplete', role: 'assistant', text: 'Incomplete source.' },
        { id: 'question', turnId: id, role: 'user', text: request.message },
      ],
    });
    const planning = vi.fn<ConversationModel['plan']>(async () => []);
    await liveChatResponse(identity, { ...request, threadId: id }, turn, new AbortController().signal,
      async () => {}, 'trusted-session', model(planning));
    const input = JSON.stringify(planning.mock.calls[0][0]);
    expect(input).toContain(request.message);
    expect(input).not.toContain('Restricted source.');
    expect(input).not.toContain('Incomplete source.');
  });
  it('uses shared recorded states with family-specific limitations instead of confirmation reviews', async () => {
    mocks.history.mockResolvedValue({
      threadId: id,
      turns: [{ id: 'proposal', contextAvailable: true,
        proposalHistory: [{ family: 'estimateConversion', state: 'confirmed' }, { family: 'captureSetup', state: 'pending' }] }],
      messages: [
        { id: 'answer', turnId: 'proposal', role: 'assistant', text: 'Historical proposal answer.' },
        { id: 'question', turnId: id, role: 'user', text: request.message },
      ],
    });
    const planning = vi.fn<ConversationModel['plan']>(async () => []);
    await withAdmittedChatTurn(turn, () => {}, () =>
      liveChatResponse(identity, { ...request, threadId: id }, turn, new AbortController().signal,
        async () => {}, 'trusted-session', model(planning)));
    const input = JSON.stringify(planning.mock.calls[0][0]);
    expect(input).toContain('App-recorded historical proposal states');
    expect(input).toContain('pending may be stale or expired');
    expect(input).toContain('captureSetup confirms a suggestion that still requires saving');
    expect(input).toContain('estimateConversion opens Job review only, not Job creation');
    expect(mocks.history).toHaveBeenCalledExactlyOnceWith(identity, id, 'runtime');
  });
});

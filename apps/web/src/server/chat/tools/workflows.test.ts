import { beforeEach, expect, it, vi } from 'vitest';
import type { ChatToolHandler } from './types';
const mocks = vi.hoisted(() => ({ prepare: vi.fn(), WorkflowDraftError: class extends Error {} }));
vi.mock('server-only', () => ({}));
vi.mock('@salesmora/data', () => ({ prepareWorkflowInTransaction: mocks.prepare, WorkflowDraftError: mocks.WorkflowDraftError }));
import { workflowsPrepare } from './workflows';
const context = { db: {}, authority: {}, turn: { threadId: 'fictional-thread' }, turnId: 'fictional-turn' } as unknown as Parameters<ChatToolHandler>[0];
const team = { operation: 'create', workflowRef: null, kind: 'lead_routing', name: 'Share website leads', source: 'Fictional Demo Form', businessDays: null,
  recipient: null, notifications: null, routing: { strategy: 'round_robin', members: ['Jordan Example', 'Taylor Example'], matchWorkZipCodes: true } };
beforeEach(() => vi.clearAllMocks());
it('clarifies incomplete team requests without executing a workflow command', async () => {
  for (const patch of [{ name: null }, { recipient: 'Jordan Example' }, { routing: null }, { kind: null }]) {
    const result = await workflowsPrepare(context, { ...team, ...patch });
    expect(result.workflowDraft).toBeUndefined();
    expect(result.evidence).toMatchObject({ type: 'workflow-clarification', published: false });
  }
  expect(mocks.prepare).not.toHaveBeenCalled();
});
it('passes the validated team request with both default channels to the service', async () => {
  const draft = { name: 'Share website leads', rule: 'Take turns.', definition: { kind: 'lead_routing' } };
  mocks.prepare.mockResolvedValue(draft);
  expect((await workflowsPrepare(context, team)).workflowDraft).toBe(draft);
  expect(mocks.prepare.mock.calls[0][3]).toMatchObject({ routing: team.routing, recipient: '', notifications: { inApp: true, email: true } });
});
it('explains missing member ZIPs without converting it into an interrupted response', async () => {
  mocks.prepare.mockRejectedValue(new mocks.WorkflowDraftError('Add work ZIP codes for Jordan Example in Settings → Team.'));
  expect((await workflowsPrepare(context, team)).evidence).toMatchObject({ clarification: 'Add work ZIP codes for Jordan Example in Settings → Team.', published: false });
});
it('propagates unexpected and access failures rather than presenting them as setup advice', async () => {
  const failure = Error('Fictional access failure'); mocks.prepare.mockRejectedValue(failure);
  await expect(workflowsPrepare(context, team)).rejects.toBe(failure);
});

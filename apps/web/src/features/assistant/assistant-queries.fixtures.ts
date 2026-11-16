import { chatHistoryResponseSchema, leadNoteDraftReviewSchema } from '@salesmora/contracts';

export const assistantScope = { viewerId: 'assistant-viewer', workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
export const assistantThreadId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const assistantTurnId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const assistantNoteFixture = leadNoteDraftReviewSchema.parse({
  actionType: 'lead.note', id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', inputHash: 'a'.repeat(64),
  expiresAt: new Date(Date.now() + 86400_000).toISOString(), state: 'pending',
  lead: { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', number: 'LD-1048', name: 'Fictional Customer' },
  body: 'Call the customer on Friday.',
});
export const assistantHistoryFixture = chatHistoryResponseSchema.parse({
  threadId: assistantThreadId,
  turns: [{
    id: assistantTurnId, state: 'completed', clientTurnId: assistantTurnId, createdAt: '2026-11-16T19:00:00.000Z',
    surfaceKey: 'home', sources: [], action: assistantNoteFixture,
  }],
  messages: [{
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', turnId: assistantTurnId, role: 'assistant',
    text: 'Fictional saved conversation.',
  }],
});

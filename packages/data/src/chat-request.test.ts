import { describe, expect, it } from 'vitest';
import { admittedChatTurn, stageAdmittedChatTurn, withAdmittedChatTurn, type AdmittedChatTurn, type ChatTurnEvidenceUpdate } from './chat-request';
import { AuthorizationAccessError } from './authorization/store';

const turn = (userId = 'fictional-owner'): AdmittedChatTurn => ({
  userId, workspaceId: 'fictional-workspace', id: 'fictional-turn', threadId: 'fictional-thread',
  surfaceKey: 'home', pageContext: {}, state: 'accepted', leaseUntil: new Date(Date.now() + 120_000),
  accessHash: 'fictional-hash', leadEvidence: [], leadSearchEvidence: [],
  leadSearchSnapshot: null, leadHistoryResult: null, leadDetailsResult: null, sources: [],
});
describe('admitted chat turn scope', () => {
  it('only reuses the exact admitted identity and turn and never survives into the next request', async () => {
    const snapshot = turn(), updates: ChatTurnEvidenceUpdate[] = [];
    expect(admittedChatTurn(snapshot, snapshot.id)).toBeUndefined();
    await withAdmittedChatTurn(snapshot, update => updates.push(update), async () => {
      await Promise.resolve();
      expect(admittedChatTurn(snapshot, snapshot.id)).toBe(snapshot);
      expect(admittedChatTurn(snapshot, 'other-turn')).toBeUndefined();
      expect(() => admittedChatTurn({ ...snapshot, workspaceId: 'other-workspace' }, snapshot.id))
        .toThrow(AuthorizationAccessError);
      expect(() => admittedChatTurn({ ...snapshot, userId: 'other-user' }, snapshot.id))
        .toThrow(AuthorizationAccessError);
      expect(stageAdmittedChatTurn(snapshot, snapshot.id, { estimateStamp: 'fictional-stamp' })).toBe(true);
      expect(stageAdmittedChatTurn(snapshot, 'other-turn', { sources: [] })).toBe(false);
    });
    expect(updates).toEqual([{ estimateStamp: 'fictional-stamp' }]);
    expect(stageAdmittedChatTurn(snapshot, snapshot.id, { sources: [] })).toBe(false);
    expect(admittedChatTurn(snapshot, snapshot.id)).toBeUndefined();
  });
  it('isolates concurrently executing requests', async () => {
    await Promise.all(['fictional-a', 'fictional-b'].map(userId => {
      const snapshot = turn(userId);
      return withAdmittedChatTurn(snapshot, () => {}, async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(admittedChatTurn(snapshot, snapshot.id)?.userId).toBe(userId);
      });
    }));
  });
});

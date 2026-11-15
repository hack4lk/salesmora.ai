import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabase, stageAdmittedChatTurn } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { AuthorizationContext } from '@salesmora/contracts';
import type { StoredTurn } from './store';

const mocks = vi.hoisted(() => ({ authorize: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../workspaces/store', () => ({ database: () => db }));
vi.mock('../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorize, enabledPermissions: [] }));
import { withChatRequest, admittedChatRequest } from './request-context';
import { ChatCancelledError, finishTurn, rememberCalendarRead, rememberTurnSources, turnRuntimeContext, validateTurnEvidence } from './store';

const db = createDatabase('postgres://localhost/unused');
const id = '00000000-0000-4000-8000-000000000001';
const identity = { userId: 'fictional-owner', workspaceId: id };
const authority: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId, membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(id), enabledPermissions: ['assistant.use'],
};
const makeTurn = (): StoredTurn => ({
  ...identity, id, threadId: id, clientTurnId: id, messageId: id, surfaceKey: 'home', state: 'accepted',
  pageContext: {}, leadEvidence: [], leadSearchEvidence: [], sources: [],
  leadHistoryResult: null, leadDetailsResult: null, leadSearchSnapshot: null,
  requestHash: 'fictional', accessHash: 'fictional', leaseUntil: new Date(Date.now() + 120_000), createdAt: new Date(),
});
const queries: { sql: string; bindings: unknown[] }[] = [];
let saved = true;
beforeEach(() => {
  vi.resetAllMocks();
  saved = true;
  queries.length = 0;
  mocks.authorize.mockRejectedValue(new Error('Fresh independent authorization required.'));
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue({});
  vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  vi.spyOn(db.client, 'query').mockImplementation(async (_connection, query) => {
    if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
      !('bindings' in query) || !Array.isArray(query.bindings)) throw new Error('Expected compiled query.');
    queries.push({ sql: query.sql, bindings: query.bindings });
    return { ...query, response: { rows: [{ saved }], rowCount: 1, command: 'SELECT' } };
  });
});
afterEach(() => vi.restoreAllMocks());
afterAll(() => db.destroy());

describe('one admitted authority for the complete answer', () => {
  it('prepares ordinary context, validates release and stages evidence with zero database calls', async () => {
    const turn = makeTurn();
    await withChatRequest({ authority, turn, sessionId: 'fictional-session', clock: { timezone: 'UTC', today: '2026-07-04' } }, async () => {
      expect(await validateTurnEvidence(identity, id)).toBe(authority);
      expect(await turnRuntimeContext(identity, id)).toMatchObject({
        context: authority, calendarClock: { timezone: 'UTC', today: '2026-07-04' },
      });
      await rememberCalendarRead(identity, id, 'a'.repeat(64));
      await rememberTurnSources(identity, id, []);
      expect(stageAdmittedChatTurn(identity, id, { estimateStamp: 'b'.repeat(64) })).toBe(true);
      expect(turn.calendarStamp).toBe('a'.repeat(64));
      expect(turn.estimateStamp).toBe('b'.repeat(64));
    });
    expect(queries).toHaveLength(0);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(admittedChatRequest(identity, id)).toBeUndefined();
    await expect(validateTurnEvidence(identity, id)).rejects.toThrow('Fresh independent authorization required.');
  });
  it('saves staged evidence, transcript and terminal state together in exactly one guarded statement', async () => {
    await withChatRequest({ authority, turn: makeTurn(), sessionId: 'fictional-session' }, async () => {
      await rememberCalendarRead(identity, id, 'a'.repeat(64));
      stageAdmittedChatTurn(identity, id, { proposalFamilies: ['calendar'] });
      await finishTurn(identity, id, 'completed', 'Fictional complete answer.');
    });
    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toContain('WITH finished AS');
    expect(queries[0].sql).toContain('"leaseUntil" > CURRENT_TIMESTAMP');
    expect(queries[0].sql).toContain('update "chatTurns"');
    expect(queries[0].sql).toContain('UPDATE "chatMessages"');
    expect(queries[0].sql).not.toMatch(/sessions|workspacePolicies|workspaceMemberships/);
    expect(queries[0].bindings).toEqual(expect.arrayContaining([
      'completed', 'a'.repeat(64), '["calendar"]', 'Fictional complete answer.',
    ]));
    expect(mocks.authorize).not.toHaveBeenCalled();
  });
  it('never persists a completed answer when Stop or lease expiry wins the atomic update', async () => {
    saved = false;
    await expect(withChatRequest({ authority, turn: makeTurn(), sessionId: 'fictional-session' }, () =>
      finishTurn(identity, id, 'completed', 'Never durable.'))).rejects.toBeInstanceOf(ChatCancelledError);
    expect(queries).toHaveLength(1);
  });
  it('cannot apply one turn snapshot to another turn or identity', async () => {
    await withChatRequest({ authority, turn: makeTurn(), sessionId: 'fictional-session' }, async () => {
      expect(admittedChatRequest(identity, 'another-turn')).toBeUndefined();
      expect(() => admittedChatRequest({ ...identity, workspaceId: 'another-workspace' }, id)).toThrow('Access denied.');
      await expect(validateTurnEvidence(identity, 'another-turn')).rejects.toThrow('Fresh independent authorization required.');
    });
  });
  it('retains all Work Order read IDs and aggregate provenance across multiple tools', async () => {
    const turn = makeTurn();
    const counts = { inProgress: 2, overdue: 1, awaitingSignoff: 0 };
    await withChatRequest({ authority, turn, sessionId: 'fictional-session' }, async () => {
      stageAdmittedChatTurn(identity, id, { workOrderReadEvidence: { ids: ['first', 'shared'], counts } });
      stageAdmittedChatTurn(identity, id, { workOrderReadEvidence: { ids: ['shared', 'second'] } });
      expect(turn.workOrderReadEvidence).toEqual({ ids: ['first', 'shared', 'second'], counts });
      expect(admittedChatRequest(identity, id)?.staged?.workOrderReadEvidence).toEqual(turn.workOrderReadEvidence);
    });
    expect(queries).toHaveLength(0);
  });
});

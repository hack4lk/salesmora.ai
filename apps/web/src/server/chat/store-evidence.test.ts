import { beforeEach, afterEach, afterAll, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { createDatabase, AuthorizationAccessError } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { AuthorizationContext } from '@salesmora/contracts';
import { chatTurnRequestSchema } from '@salesmora/contracts';

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(), lead: vi.fn(), search: vi.fn(), calendar: vi.fn(), other: vi.fn(),
  completedEstimate: vi.fn(), proposals: vi.fn(), historical: vi.fn(), visibleDraft: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorize, enabledPermissions: [] }));
vi.mock('../workspaces/store', () => ({ database: vi.fn() }));
vi.mock('./customers', () => ({ visibleCustomerResult: vi.fn(), customerPageReference: vi.fn() }));
vi.mock('./work-orders-actions', () => ({ visibleWorkOrderResult: vi.fn(), workOrderPageReference: vi.fn() }));
vi.mock('./actions', () => ({ visibleTurnDraft: mocks.visibleDraft }));
vi.mock('./delete-actions', () => ({ visibleDeletionReceipt: vi.fn() }));
vi.mock('./capture-policy', () => ({ captureChatDeliveryStamp: () => 'fixture' }));
vi.mock('./history-proposals', () => ({ readHistoryProposalPresence: mocks.proposals }));
vi.mock('./historical-evidence', () => ({ historicalEvidenceAllowed: mocks.historical }));
vi.mock('@salesmora/data', async importOriginal => ({
  ...await importOriginal<typeof import('@salesmora/data')>(),
  leadChatEvidenceAllowed: mocks.lead, leadSearchEvidenceAllowed: mocks.search,
  calendarProposalEvidenceAllowed: mocks.calendar,
  reportAssistantEvidenceAllowed: mocks.other, captureSourceEvidenceAllowed: mocks.other,
  captureSetupEvidenceAllowed: mocks.other, captureChatEvidenceAllowed: mocks.other,
  calendarChatEvidenceAllowed: mocks.other, estimateChatEvidenceAllowed: mocks.other,
  customerChatEvidenceAllowed: mocks.other,
  estimateDraftChatEvidenceAllowed: mocks.other, estimateShareChatEvidenceAllowed: mocks.other,
  estimateDecisionChatEvidenceAllowed: mocks.other, estimateDraftActionChatEvidenceAllowed: mocks.other,
  estimateVoidChatEvidenceAllowed: mocks.other,
  estimateArchiveChatEvidenceAllowed: mocks.completedEstimate,
  estimateDraftDeleteChatEvidenceAllowed: mocks.completedEstimate,
  estimateConversionChatEvidenceAllowed: mocks.completedEstimate,
}));
import {
  chatAccessHash, ChatCancelledError, rememberTurnLeadEvidence,
  rememberTurnSearchEvidence, rememberCalendarProposalHistory, finishTurn, validateTurnEvidence, turnRuntimeContext,
  acceptTurn, ChatConflictError, ChatLimitError,
  navigateLeadResult, readThreads,
  validateTurnEvidenceInTransaction,
} from './store';

const id = '00000000-0000-4000-8000-000000000001';
const sourceId = '00000000-0000-4000-8000-000000000002';
const nextId = '00000000-0000-4000-8000-000000000003';
const identity = { userId: 'fictional-owner', workspaceId: id };
const context: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId, membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(id), enabledPermissions: ['assistant.use'],
};
const lead = { id: sourceId, version: 1, ownerStamp: 'a'.repeat(64) };
const db = createDatabase('postgres://localhost/unused');
let turn: ReturnType<typeof storedTurn> | undefined;
function storedTurn() {
  return {
    ...identity, id, threadId: nextId, state: 'running', accessHash: chatAccessHash(context),
    leaseUntil: new Date(Date.now() + 120_000),
    surfaceKey: 'home', pageContext: {}, leadSearchSnapshot: null,
    leadEvidence: [lead], leadSearchEvidence: [sourceId], calendarProposalEvidence: [sourceId], sources: [],
  };
}
const queries: { sql: string; bindings: unknown[] }[] = [];
beforeEach(() => {
  vi.clearAllMocks();
  queries.length = 0;
  turn = storedTurn();
  for (const mock of [mocks.lead, mocks.search, mocks.calendar, mocks.other, mocks.completedEstimate, mocks.historical]) mock.mockResolvedValue(true);
  mocks.proposals.mockResolvedValue(() => false);
  mocks.authorize.mockImplementation(async (_user, _workspace, _write, use) => use(db, context));
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue({});
  vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  vi.spyOn(db.client, 'query').mockImplementation(async (_connection, query) => {
    if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
        !('bindings' in query) || !Array.isArray(query.bindings)) throw new Error('Expected compiled query.');
    queries.push({ sql: query.sql, bindings: query.bindings });
    return { ...query, response: { rows: turn ? [turn] : [], rowCount: 1, command: query.sql.startsWith('update') ? 'UPDATE' : 'SELECT' } };
  });
});
afterAll(() => db.destroy());
afterEach(() => vi.restoreAllMocks());

describe('consolidated turn admission', () => {
  const request = chatTurnRequestSchema.parse({
    workspaceId: id, clientTurnId: sourceId, surfaceKey: 'home', message: 'Fictional question.',
  });
  let admission: { hasActive: boolean; recentCount: number } | undefined;
  let previous: (ReturnType<typeof storedTurn> & { requestHash: string }) | undefined;
  let owned = true;
  beforeEach(() => {
    admission = { hasActive: false, recentCount: 0 };
    previous = undefined;
    owned = true;
    vi.mocked(db.client.query).mockImplementation(async (_connection: unknown, query: unknown) => {
      if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
        !('bindings' in query) || !Array.isArray(query.bindings)) throw Error('Expected compiled query.');
      queries.push({ sql: query.sql, bindings: query.bindings });
      const command = query.sql.split(' ', 1)[0].toUpperCase();
      const rows = query.sql.includes('bool_or') ? admission ? [{
        ...admission, previous, messageId: nextId, owned, timezone: 'UTC', today: '2026-07-04',
      }] : []
        : query.sql.includes('accepted_turn AS') ? [{ turn: storedTurn() }]
        : [{ id: nextId }];
      return { ...query, response: { rows, rowCount: rows.length, command } };
    });
  });

  it('uses one write authority boundary, one admission read and no timestamp update for a new thread', async () => {
    const available = vi.fn(async () => { expect(queries).toHaveLength(0); });
    const accepted = await acceptTurn(identity, request, available);
    expect(accepted.replay).toBe(false);
    expect(available).toHaveBeenCalledOnce();
    expect(available).toHaveBeenCalledWith(db);
    expect(mocks.authorize).toHaveBeenCalledExactlyOnceWith(
      identity.userId, identity.workspaceId, true, expect.any(Function),
    );
    expect(queries).toHaveLength(2);
    const summary = queries.find(query => query.sql.includes('bool_or'))!;
    expect(summary.sql).toContain('FILTER (WHERE t."createdAt" > CURRENT_TIMESTAMP');
    expect(summary.bindings).toEqual(expect.arrayContaining([identity.userId, identity.workspaceId]));
    expect(queries[1].sql).toContain('target_thread AS (insert into "chatThreads"');
    expect(queries[1].sql).toContain('accepted_turn AS (insert into "chatTurns"');
    expect(queries[1].sql).toContain('messages AS (insert into "chatMessages"');
  });

  it('retains thread ownership validation and updates the existing thread timestamp', async () => {
    await acceptTurn(identity, { ...request, threadId: nextId });
    expect(queries[0].sql).toContain('FROM "chatThreads"');
    expect(queries[0].bindings).toEqual(expect.arrayContaining([identity.userId, identity.workspaceId, nextId]));
    expect(queries.at(-1)?.sql).toContain('update "chatThreads"');
  });

  it('rejects a foreign thread before recovery or insertion', async () => {
    owned = false;
    await expect(acceptTurn(identity, { ...request, threadId: nextId })).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(queries).toHaveLength(1);
  });

  it('rejects disabled availability after authorization but before recovery or persistence', async () => {
    const unavailable = new Error('Provider unavailable');
    await expect(acceptTurn(identity, request, async () => { throw unavailable; })).rejects.toBe(unavailable);
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(queries).toHaveLength(0);
  });

  it('does not disclose provider availability to unauthorized callers', async () => {
    mocks.authorize.mockRejectedValue(new AuthorizationAccessError());
    const available = vi.fn();
    await expect(acceptTurn(identity, request, available)).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(available).not.toHaveBeenCalled();
  });

  it('checks assistant permission before availability even with a valid workspace membership', async () => {
    mocks.authorize.mockImplementation(async (_user, _workspace, _write, use) =>
      use(db, { ...context, enabledPermissions: [] }));
    const available = vi.fn();
    await expect(acceptTurn(identity, request, available)).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(available).not.toHaveBeenCalled();
    expect(queries).toHaveLength(0);
  });

  it.each([
    { hasActive: true, recentCount: 0, error: ChatConflictError },
    { hasActive: true, recentCount: 10, error: ChatConflictError },
    { hasActive: false, recentCount: 10, error: ChatLimitError },
  ])('retains conflict/rate precedence for $hasActive active / $recentCount recent', async item => {
    admission = item;
    await expect(acceptTurn(identity, request)).rejects.toBeInstanceOf(item.error);
    expect(queries).toHaveLength(1);
    expect(queries.some(query => query.sql.startsWith('insert'))).toBe(false);
  });

  it('admits the tenth turn but rejects an invalid empty admission result explicitly', async () => {
    admission = { hasActive: false, recentCount: 9 };
    await expect(acceptTurn(identity, request)).resolves.toMatchObject({ replay: false });
    admission = undefined;
    await expect(acceptTurn(identity, request)).rejects.toThrow('Chat admission query returned no result.');
  });

  it('returns an exact replay before active/rate checks without regenerating or inserting', async () => {
    previous = { ...storedTurn(), requestHash: createHash('sha256').update(JSON.stringify(request)).digest('hex') };
    admission = { hasActive: true, recentCount: 10 };
    await expect(acceptTurn(identity, request)).resolves.toMatchObject({ replay: true });
    expect(queries).toHaveLength(1);
    expect(queries.some(query => query.sql.includes('accepted_turn AS'))).toBe(false);
    await expect(acceptTurn(identity, { ...request, message: 'Changed question.' })).rejects.toBeInstanceOf(ChatConflictError);
  });
});

const cases = [
  { name: 'Lead', save: () => rememberTurnLeadEvidence(identity, id, [lead]),
    empty: () => rememberTurnLeadEvidence(identity, id, []),
    add: () => rememberTurnLeadEvidence(identity, id, [{ ...lead, id: nextId }]),
    invalid: () => rememberTurnLeadEvidence(identity, id, [{ ...lead, version: 0 }]),
    field: 'leadEvidence', validator: mocks.lead },
  { name: 'search', save: () => rememberTurnSearchEvidence(identity, id, [sourceId, sourceId]),
    empty: () => rememberTurnSearchEvidence(identity, id, []),
    add: () => rememberTurnSearchEvidence(identity, id, [nextId]),
    invalid: () => rememberTurnSearchEvidence(identity, id, ['invalid']),
    field: 'leadSearchEvidence', validator: mocks.search },
  { name: 'Calendar proposal', save: () => rememberCalendarProposalHistory(identity, id, [sourceId, sourceId]),
    empty: () => rememberCalendarProposalHistory(identity, id, []),
    add: () => rememberCalendarProposalHistory(identity, id, [nextId]),
    invalid: () => rememberCalendarProposalHistory(identity, id, ['invalid']),
    field: 'calendarProposalEvidence', validator: mocks.calendar },
];

describe('completion-only answer persistence', () => {
  it('validates a tool turn in its held context with one session-bound read and no nested authority', async () => {
    // Knex is mocked as the existing held transaction for these SQL-shape checks.
    await mocks.authorize(identity.userId, identity.workspaceId, true, async (trx: Parameters<typeof validateTurnEvidenceInTransaction>[0]) => {
      const current = await validateTurnEvidenceInTransaction(trx, context, id, { sessionId: 'session', activeOnly: true });
      expect(current).toEqual(turn);
    });
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toContain('exists (select 1 from "sessions"');
    expect(queries[0].bindings).toEqual(expect.arrayContaining(['session', identity.userId, identity.workspaceId, id]));
    expect(queries[0].sql).not.toContain('"policy"');
    expect(mocks.historical).toHaveBeenCalledOnce();
  });

  it('validates completed-only Estimate proposals inside the completion transaction after saving the state', async () => {
    const original = turn!;
    vi.mocked(db.client.query).mockImplementation(async (_connection: unknown, query: unknown) => {
      if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
        !('bindings' in query) || !Array.isArray(query.bindings)) throw Error('Expected compiled query.');
      queries.push({ sql: query.sql, bindings: query.bindings });
      return { ...query, response: { rows: [{ ...original, estimateStamp: 'fixture' }], rowCount: 1,
        command: query.sql.startsWith('update') ? 'UPDATE' : 'SELECT' } };
    });
    mocks.completedEstimate.mockImplementation(async () => {
      expect(queries.at(-1)?.sql).toContain('update "chatTurns"');
      return true;
    });
    await finishTurn(identity, id, 'completed', 'Complete answer.');
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(mocks.completedEstimate).toHaveBeenCalledTimes(3);
    mocks.completedEstimate.mockResolvedValue(false);
    await expect(finishTurn(identity, id, 'completed', 'Rejected answer.')).rejects.toBeInstanceOf(AuthorizationAccessError);
  });

  it('loads page context and initial capabilities through one session-bound authority check', async () => {
    const setup = await turnRuntimeContext(identity, id, { sessionId: 'authenticated-session', activeOnly: true });
    expect(setup.context).toBe(context);
    expect(setup.calendarClock).toBeUndefined();
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(queries).toHaveLength(1);
    expect(queries[0].bindings).toContain('authenticated-session');
    expect(mocks.historical).toHaveBeenCalledWith(db, context, turn, undefined);
  });

  it('does not prepare planner context for a revoked session or inactive turn', async () => {
    turn = undefined;
    await expect(turnRuntimeContext(identity, id, { sessionId: 'revoked-session', activeOnly: true }))
      .rejects.toBeInstanceOf(AuthorizationAccessError);
    turn = { ...storedTurn(), state: 'cancelled' };
    await expect(turnRuntimeContext(identity, id, { sessionId: 'session', activeOnly: true }))
      .rejects.toBeInstanceOf(ChatCancelledError);
  });

  it('checks the authenticated session in the locked turn query without an extra database call', async () => {
    await finishTurn(identity, id, 'completed', 'Complete answer.', 'authenticated-session');
    expect(queries).toHaveLength(3);
    expect(queries[0].sql).toContain('exists (select 1 from "sessions"');
    expect(queries[0].sql).toContain('"expiresAt" > CURRENT_TIMESTAMP');
    expect(queries[0].bindings).toEqual(expect.arrayContaining(['authenticated-session', identity.userId]));
  });

  it('saves the complete answer and terminal state in the same authorized transaction', async () => {
    await finishTurn(identity, id, 'completed', 'Complete answer.');
    expect(mocks.authorize).toHaveBeenCalledExactlyOnceWith(
      identity.userId, identity.workspaceId, true, expect.any(Function),
    );
    expect(queries.map(query => query.sql)).toEqual([
      expect.stringContaining('for update'),
      expect.stringContaining('update "chatMessages"'),
      expect.stringContaining('update "chatTurns"'),
    ]);
    expect(queries[1].bindings).toContain('Complete answer.');
    expect(queries[2].bindings).toContain('completed');
  });

  describe('consolidated turn access validation', () => {
    it('checks session, ownership and turn activity using one turn read', async () => {
      expect(await validateTurnEvidence(identity, id, { sessionId: 'authenticated-session', activeOnly: true }))
        .toBe(context);
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toContain('exists (select 1 from "sessions"');
      expect(queries[0].sql).toContain('"expiresAt" > CURRENT_TIMESTAMP');
      expect(queries[0].bindings).toEqual(expect.arrayContaining([id, identity.workspaceId, identity.userId, 'authenticated-session']));
    });

    it('does not release evidence when the session-constrained turn query returns no row', async () => {
      turn = undefined;
      await expect(validateTurnEvidence(identity, id, { sessionId: 'revoked-session' }))
        .rejects.toBeInstanceOf(AuthorizationAccessError);
      expect(queries).toHaveLength(1);
      expect(mocks.lead).not.toHaveBeenCalled();
    });

    it.each(['cancelled', 'failed', 'completed'])('rejects a %s turn at the streaming boundary', async state => {
      turn!.state = state;
      await expect(validateTurnEvidence(identity, id, { sessionId: 'session', activeOnly: true }))
        .rejects.toBeInstanceOf(ChatCancelledError);
      expect(queries).toHaveLength(1);
    });

    it('rejects an expired lease at the streaming boundary', async () => {
      turn!.leaseUntil = new Date(Date.now() - 1000);
      await expect(validateTurnEvidence(identity, id, { sessionId: 'session', activeOnly: true }))
        .rejects.toBeInstanceOf(ChatCancelledError);
    });

    it('retains access checks for completed structured results without requiring an active turn', async () => {
      turn!.state = 'completed';
      expect(await validateTurnEvidence(identity, id, { sessionId: 'session' })).toBe(context);
    });

    it('reloads evidence on each independent check rather than caching permission', async () => {
      await validateTurnEvidence(identity, id, { sessionId: 'session', activeOnly: true });
      mocks.historical.mockResolvedValueOnce(false);
      await expect(validateTurnEvidence(identity, id, { sessionId: 'session', activeOnly: true }))
        .rejects.toBeInstanceOf(AuthorizationAccessError);
      expect(mocks.authorize).toHaveBeenCalledTimes(2);
      expect(queries).toHaveLength(2);
    });
  });

  it.each(['cancelled', 'failed', 'completed'])('does not save over a %s turn', async state => {
    turn!.state = state;
    await expect(finishTurn(identity, id, 'completed', 'Late answer.')).rejects.toBeInstanceOf(ChatCancelledError);
    expect(queries).toHaveLength(1);
  });

  it('does not save an answer after its lease expires', async () => {
    turn!.leaseUntil = new Date(Date.now() - 1000);
    await expect(finishTurn(identity, id, 'completed', 'Late answer.')).rejects.toBeInstanceOf(ChatCancelledError);
    expect(queries).toHaveLength(1);
  });

  it('does not save an answer after evidence access is revoked', async () => {
    mocks.historical.mockResolvedValue(false);
    await expect(finishTurn(identity, id, 'completed', 'Restricted answer.')).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(queries).toHaveLength(1);
  });

  it('does not persist completion when the session-constrained turn query returns no row', async () => {
    turn = undefined;
    await expect(finishTurn(identity, id, 'completed', 'Late answer.', 'revoked-session'))
      .rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(queries).toHaveLength(1);
    expect(queries[0].bindings).toContain('revoked-session');
  });

  it('rejects oversized or unsuccessful answer persistence before opening a transaction', async () => {
    await expect(finishTurn(identity, id, 'completed', 'x'.repeat(32001))).rejects.toThrow();
    await expect(finishTurn(identity, id, 'cancelled', 'Partial answer.')).rejects.toThrow();
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(queries).toHaveLength(0);
  });
});

describe('request-local history and navigation checks', () => {
  const snapshot = {
    filters: { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false },
    result: { id, scope: 'workspace', asOf: '2026-11-13T12:00:00.000Z', filterLabels: [], includeArchived: false, total: 0, rows: [] },
    versions: [], ownerIds: [],
  };
  beforeEach(() => {
    vi.mocked(db.client.query).mockImplementation(async (_connection: unknown, query: unknown) => {
      if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
        !('bindings' in query) || !Array.isArray(query.bindings)) throw Error('Expected compiled query.');
      queries.push({ sql: query.sql, bindings: query.bindings });
      const completed = { ...storedTurn(), state: 'completed', leadSearchSnapshot: snapshot, leadSearchEvidence: [id] };
      const rows = query.sql.includes('from "chatTurns"') ? [completed, { ...completed, id: sourceId }]
        : query.sql.includes('from "chatThreads"') ? [{ id: nextId }] : [];
      return { ...query, response: { rows, rowCount: rows.length, command: query.sql.startsWith('update') ? 'UPDATE' : 'SELECT' } };
    });
  });

  it('uses one workspace/turn/evidence check for a navigation request and rechecks on the next request', async () => {
    await expect(navigateLeadResult(identity, id)).resolves.toMatchObject({ href: expect.stringContaining('/leads?') });
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(mocks.historical).toHaveBeenCalledOnce();
    expect(queries).toHaveLength(1);
    mocks.historical.mockResolvedValue(false);
    await expect(navigateLeadResult(identity, id)).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(mocks.authorize).toHaveBeenCalledTimes(2);
    expect(queries).toHaveLength(2);
  });

  it('rejects records outside the displayed search rows without a second authorization', async () => {
    await expect(navigateLeadResult(identity, id, nextId)).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(queries).toHaveLength(1);
  });

  it('checks historical provenance under one authority per load, never trusting a previous request', async () => {
    await readThreads(identity, nextId);
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(mocks.historical).toHaveBeenCalledTimes(2);
    await readThreads(identity, nextId);
    expect(mocks.authorize).toHaveBeenCalledTimes(2);
    expect(mocks.historical).toHaveBeenCalledTimes(4);
  });
  it('uses recorded states for model history without rebuilding reviews; display still loads fresh reviews', async () => {
    const presence = Object.assign((_id: string, family: string) => family === 'action', {
      states: () => [{ family: 'action', state: 'pending' }], covers: () => true,
    });
    mocks.proposals.mockResolvedValue(presence);
    const runtime = await readThreads(identity, nextId, 'runtime');
    expect(runtime.turns?.[0]).toMatchObject({
      contextAvailable: true, proposalHistory: [{ family: 'action', state: 'pending' }],
    });
    expect(mocks.visibleDraft).not.toHaveBeenCalled();
    expect(mocks.proposals).toHaveBeenCalledOnce();
    expect(mocks.historical.mock.calls.every(call => call[3] === presence)).toBe(true);
    await readThreads(identity, nextId);
    expect(mocks.visibleDraft).toHaveBeenCalledTimes(2);
    mocks.historical.mockResolvedValue(false);
    const restricted = await readThreads(identity, nextId, 'runtime');
    expect(restricted.turns?.[0]).toMatchObject({ contextAvailable: false });
    expect(restricted.turns?.[0]).not.toHaveProperty('proposalHistory');
  });
});

describe.each(cases)('$name additive evidence persistence', item => {
  it('does no authorization or database work for an empty addition and does not clear stored evidence', async () => {
    const before = structuredClone(turn);
    await item.empty();
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(queries).toEqual([]);
    expect(turn).toEqual(before);
  });
  it('validates input before entering a transaction', async () => {
    await expect(item.invalid()).rejects.toThrow();
    expect(mocks.authorize).not.toHaveBeenCalled();
  });
  it('freshly validates unchanged evidence but avoids its update', async () => {
    await item.save();
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(item.validator).toHaveBeenCalled();
    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toMatch(/^select/);
  });
  it('retains existing provenance and persists newly added evidence once', async () => {
    await item.add();
    const updates = queries.filter(query => query.sql.startsWith('update'));
    expect(updates).toHaveLength(1);
    expect(updates[0].sql).toContain(`"${item.field}"`);
    const serialized = updates[0].bindings.find(value => typeof value === 'string' && value.startsWith('['));
    if (typeof serialized !== 'string') throw new Error('Missing evidence payload.');
    const evidence = JSON.parse(serialized);
    expect(evidence).toHaveLength(2);
    expect(JSON.stringify(evidence)).toContain(sourceId);
    expect(JSON.stringify(evidence)).toContain(nextId);
  });
  it('rejects revoked evidence even when its value is unchanged', async () => {
    item.validator.mockResolvedValue(false);
    await expect(item.save()).rejects.toBeInstanceOf(AuthorizationAccessError);
    expect(queries.some(query => query.sql.startsWith('update'))).toBe(false);
  });
  it('propagates authorization failures without treating unchanged evidence as success', async () => {
    const failure = new AuthorizationAccessError();
    mocks.authorize.mockRejectedValue(failure);
    await expect(item.save()).rejects.toBe(failure);
    expect(queries).toEqual([]);
  });
  it.each(['missing', 'completed'])('denies a %s turn before skipping an unchanged update', async state => {
    turn = state === 'missing' ? undefined : { ...storedTurn(), state };
    await expect(item.save()).rejects.toSatisfy(error =>
      error instanceof AuthorizationAccessError || error instanceof ChatCancelledError);
    expect(queries.some(query => query.sql.startsWith('update'))).toBe(false);
  });
});

it.each([
  { version: 2, ownerStamp: lead.ownerStamp },
  { version: 1, ownerStamp: 'b'.repeat(64) },
])('persists changed Lead versions or owner stamps rather than mistaking them for duplicates: %j', async patch => {
  await rememberTurnLeadEvidence(identity, id, [{ ...lead, ...patch }]);
  expect(queries.filter(query => query.sql.startsWith('update'))).toHaveLength(1);
});

it('preserves a stored owner stamp when identical Lead evidence omits it', async () => {
  await rememberTurnLeadEvidence(identity, id, [{ id: sourceId, version: 1 }]);
  expect(mocks.lead).toHaveBeenLastCalledWith(db, context, [lead]);
  expect(queries.filter(query => query.sql.startsWith('update'))).toHaveLength(0);
});

it.each(cases.slice(0, 2))('validates newly merged $name evidence before updating', async item => {
  item.validator.mockResolvedValueOnce(false);
  await expect(item.add()).rejects.toBeInstanceOf(AuthorizationAccessError);
  expect(item.validator).toHaveBeenCalledOnce();
  expect(queries.filter(query => query.sql.startsWith('update'))).toHaveLength(0);
});

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { createDatabase, type Knex } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { readHistoryProposalPresence } from './history-proposals';

const db = createDatabase('postgres://localhost/unused');
Object.defineProperty(db, 'isTransaction', { value: true });
const trx = db as unknown as Knex.Transaction;
const identity = { userId: 'fictional-user', workspaceId: '00000000-0000-4000-8000-000000000001' };
const authority: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId,
  membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(identity.workspaceId), enabledPermissions: [...permissionIds],
};
const id = (n: number) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
afterEach(() => vi.restoreAllMocks());
afterAll(() => db.destroy());

function queryFixture(rows: { turnId: string; family: string; state: string; payloadVersion: number }[] = []) {
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue({});
  vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  return vi.spyOn(db.client, 'query').mockImplementation(async (_connection, query) => {
    if (!query || typeof query !== 'object') throw new Error('Expected compiled SQL query.');
    return { ...query, response: { rows, command: 'SELECT' } };
  });
}
function statement(value: unknown) {
  if (!value || typeof value !== 'object' || !('sql' in value) || typeof value.sql !== 'string' ||
    !('bindings' in value) || !Array.isArray(value.bindings)) throw new Error('Expected compiled SQL query.');
  return { sql: value.sql, bindings: value.bindings };
}
const read = (ids: string[], metadata?: ReadonlyMap<string, unknown>) =>
  readHistoryProposalPresence(trx, identity, ids, metadata, authority);

describe('canonical history proposal presence', () => {
  it('does not query for empty or modern plain turns', async () => {
    const query = queryFixture();
    const empty = await read([]);
    const plain = await read([id(1)], new Map([[id(1), []]]));
    expect(query).not.toHaveBeenCalled();
    expect(empty(id(1), 'action')).toBe(false);
    expect(plain.states(id(1))).toEqual([]);
    expect(plain.covers(id(1))).toBe(true);
    expect(plain.covers(id(2))).toBe(false);
  });
  it.each([1, 49, 50])('uses one bounded owned query for %i turns', async count => {
    const query = queryFixture();
    const ids = Array.from({ length: count }, (_, index) => id(index + 1));
    await read(ids);
    expect(query).toHaveBeenCalledOnce();
    const compiled = statement(query.mock.calls[0][1]);
    expect(compiled.sql).toContain('"chatProposals"');
    expect(compiled.sql).not.toMatch(/union all|chatEstimateDrafts|chatCalendarProposals/);
    expect(compiled.bindings).toEqual(expect.arrayContaining([identity.userId, identity.workspaceId, ...ids]));
  });
  it('keeps recorded families and turns separate', async () => {
    queryFixture([
      { turnId: id(1), family: 'calendar', state: 'pending', payloadVersion: 1 },
      { turnId: id(1), family: 'estimateSharing', state: 'confirmed', payloadVersion: 1 },
      { turnId: id(2), family: 'action', state: 'cancelled', payloadVersion: 1 },
    ]);
    const presence = await read([id(1), id(2)]);
    expect(presence(id(1), 'calendar')).toBe(true);
    expect(presence(id(1), 'action')).toBe(false);
    expect(presence(id(2), 'action')).toBe(true);
    expect(presence.states(id(2))).toEqual([{ family: 'action', state: 'cancelled' }]);
  });
  it('limits discovery to declared families and unknown turns', async () => {
    const query = queryFixture([{ turnId: id(2), family: 'estimateDraft', state: 'confirmed', payloadVersion: 1 }]);
    const presence = await read([id(1), id(2), id(3)], new Map([[id(1), []], [id(2), ['estimateDraft']], [id(3), null]]));
    const compiled = statement(query.mock.calls[0][1]);
    expect(compiled.bindings).not.toContain(id(1));
    expect(compiled.bindings).toEqual(expect.arrayContaining([id(2), id(3), 'estimateDraft']));
    expect(compiled.sql).toContain('distinct on ("turnId", "family")');
    expect(presence.states(id(2))).toEqual([{ family: 'estimateDraft', state: 'confirmed' }]);
  });
  it.each(['workOrder', 'material'] as const)('uses the canonical family for %s', async family => {
    const query = queryFixture([{ turnId: id(1), family, state: 'cancelled', payloadVersion: 1 }]);
    const presence = await read([id(1)], new Map([[id(1), [family]]]));
    expect(statement(query.mock.calls[0][1]).bindings).toContain(family);
    expect(presence.states(id(1))).toEqual([{ family, state: 'cancelled' }]);
  });
  it('rejects invalid metadata and mismatched or absent authority', async () => {
    const query = queryFixture();
    await expect(read([id(1)], new Map([[id(1), ['not-a-family']]]))).rejects.toThrow();
    await expect(readHistoryProposalPresence(trx, identity, [id(1)])).rejects.toThrow();
    await expect(readHistoryProposalPresence(trx, { ...identity, userId: 'other' }, [id(1)], undefined, authority)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
  it('propagates database failures', async () => {
    const query = queryFixture();
    query.mockRejectedValueOnce(new Error('Fictional database failure'));
    await expect(read([id(1)])).rejects.toThrow('Fictional database failure');
  });
});

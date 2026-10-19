import { it, expect } from 'vitest';
import { leadHistoryEntry, leadHistoryResultSchema } from './lead-history';
import { leadsQuerySchema, leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
const id = '00000000-0000-4000-8000-000000000001', createdAt = '2026-10-17T12:00:00.000Z';
const row = { id, createdAt, actorName: 'Taylor', actorType: 'assistant-confirmed', type: 'note', changes: { body: 'Saved note', requestHash: 'PRIVATE_HASH', actorId: 'PRIVATE_ACTOR', toVersion: 9 } };
it('history uses the closed read facade with exact reference and explicit activity/notes mode', () => {
  for (const mode of ['activity', 'notes']) expect(leadsQuerySchema.safeParse({ request: { operation: 'history', input: { leadRef: '', mode } } }).success).toBe(true);
  for (const input of [{ leadRef: id }, { leadRef: id, mode: 'all' }, { leadRef: id, mode: 'notes', workspaceId: id }, { leadRef: id, mode: 'notes', sql: 'SELECT *' }]) expect(leadsQuerySchema.safeParse({ request: { operation: 'history', input } }).success).toBe(false);
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'history', input: { leadRef: id, mode: 'notes' } } }).success).toBe(false);
  const schema = JSON.stringify(leadToolParameters('leads_query', ['history'])); expect(schema).toContain('history'); expect(schema).not.toContain('pipeline_summary'); expect(schema).not.toContain('expectedVersion');
});
it('normalizes persisted events through explicit whitelists, retaining confirmed attribution without private metadata', () => {
  expect(leadHistoryEntry(row)).toEqual({ id, createdAt, actorName: 'Taylor', viaAssistant: true, kind: 'note', body: 'Saved note' });
  const json = JSON.stringify(leadHistoryEntry(row)); expect(json).not.toContain('PRIVATE_'); expect(json).not.toContain('toVersion');
  for (const [type, changes] of [['created', { source: 'phone' }], ['stage', { from: 'new', to: 'contacted' }], ['assigned', { from: null, to: 'Sam' }], ['edited', { fromVersion: 1, toVersion: 2, fields: [{ field: 'phone', before: '', after: '123' }] }], ['archived', {}], ['restored', {}]] as const) expect(leadHistoryEntry({ ...row, type, changes }).kind).toBe(type);
  expect(() => leadHistoryEntry({ ...row, type: 'unknown' })).toThrow(); expect(() => leadHistoryEntry({ ...row, changes: { body: '' } })).toThrow();
});
it('result rejects mixed notes, duplicate IDs, stale/future metadata and incomplete or overlong windows', () => {
  const result = { id, retrievedAt: createdAt, mode: 'notes', scope: 'assigned', lead: { id, number: 'LD-0001', name: 'Fictional', archived: false }, entries: [leadHistoryEntry(row)], total: 1 };
  expect(leadHistoryResultSchema.safeParse(result).success).toBe(true);
  for (const patch of [{ total: 2 }, { total: 0 }, { entries: [result.entries[0], result.entries[0]], total: 2 }, { retrievedAt: 'invalid' }, { retrievedAt: '2020-01-01T00:00:00.000Z' }, { entries: [leadHistoryEntry({ ...row, type: 'archived' })] }]) expect(leadHistoryResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
});

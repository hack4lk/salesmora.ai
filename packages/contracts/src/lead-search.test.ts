import { expect, it } from 'vitest';
import { leadSearchInputSchema, leadSearchResultSchema, leadSearchNavigationSchema, leadSearchEvidenceSchema } from './lead-search';
import { leadsQuerySchema, leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
const id = '00000000-0000-4000-8000-000000000001';
const filters = { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
it('accepts a bounded read intent and rejects SQL, caller identity, pagination and mutation', () => {
  const input = { mode: 'filters', filters };
  expect(leadsQuerySchema.safeParse({ request: { operation: 'search', input } }).success).toBe(true);
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'search', input } }).success).toBe(false);
  for (const extra of [{ sql: 'SELECT * FROM leads' }, { workspaceId: id }, { limit: 1000 }, { scope: 'workspace' }, { href: '/leads' }]) expect(leadSearchInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  expect(leadSearchInputSchema.safeParse({ ...input, filters: { ...filters, ownerName: 'Guess' } }).success).toBe(false);
  const schema = JSON.stringify(leadToolParameters('leads_query', ['search']));
  expect(schema).toContain('search'); expect(schema).not.toContain('pipeline_summary'); expect(schema).not.toContain('sql'); expect(schema).not.toContain('href');
});
it('rejects oversized, duplicate, inconsistent or private result data', () => {
  const row = { id, number: 'LD-0001', name: 'Fictional', service: 'Repair', stage: 'new', archived: false, ownerName: null };
  const result = { id, scope: 'assigned', filterLabels: [], includeArchived: false, total: 1, rows: [row] };
  expect(leadSearchResultSchema.safeParse(result).success).toBe(true);
  for (const bad of [{ ...result, rows: [{ ...row, phone: 'private' }] }, { ...result, total: 0 }, { ...result, rows: [{ ...row, archived: true }] }, { ...result, total: 2, rows: [row, row] }, { ...result, total: 11, rows: Array(11).fill(row) }]) expect(leadSearchResultSchema.safeParse(bad).success).toBe(false);
  expect(leadSearchResultSchema.safeParse({ ...result, total: 0, rows: [] }).success).toBe(true);
});
it('navigation is only saved result/row intent, and inherited query evidence is bounded', () => {
  expect(leadSearchNavigationSchema.safeParse({ workspaceId: id, resultId: id, leadId: id }).success).toBe(true);
  for (const extra of [{ filters }, { href: 'https://example.test' }, { role: 'owner' }]) expect(leadSearchNavigationSchema.safeParse({ workspaceId: id, resultId: id, ...extra }).success).toBe(false);
  expect(leadSearchEvidenceSchema.safeParse(Array(9).fill(id)).success).toBe(false);
});

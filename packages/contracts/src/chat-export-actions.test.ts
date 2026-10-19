import { expect, it } from 'vitest';
import { leadExportDraftInputSchema, leadExportDraftReviewSchema } from './chat-actions';
import { leadToolParameters, leadsProposeActionSchema } from './lead-capabilities';
const filters = { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
it('export intent has no browser/model-supplied authority, row count, destination or approval', () => {
  const input = { mode: 'filters', filters };
  expect(leadExportDraftInputSchema.safeParse(input).success).toBe(true);
  for (const extra of [{ workspaceId: 'foreign' }, { count: 1 }, { scope: 'workspace' }, { confirmed: true }, { email: 'foreign@example.test' }, { columns: ['secret'] }]) expect(leadExportDraftInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'export_csv', input } }).success).toBe(true);
});
it('export is a strict branch of the existing proposal facade', () => {
  const schema = JSON.stringify(leadToolParameters('leads_propose_action', ['export_csv']));
  expect(schema).toContain('export_csv'); expect(schema).toContain('"additionalProperties":false'); expect(schema).not.toContain('run_sql');
});
it('public review includes only export metadata', () => {
  const review = { actionType: 'lead.export', id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: '2026-10-16T00:00:00.000Z', scope: 'assigned', filterLabels: [], includeArchived: false, count: 2, rowLimit: 50000 };
  expect(leadExportDraftReviewSchema.safeParse(review).success).toBe(true);
  expect(leadExportDraftReviewSchema.safeParse({ ...review, filters }).success).toBe(false);
  expect(leadExportDraftReviewSchema.safeParse({ ...review, count: -1 }).success).toBe(false);
});

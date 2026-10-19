import { describe, expect, it } from 'vitest';
import { leadExportSchema, leadExportQuery } from './lead-export';
const input = { workspaceId: '24ab2ee0-5407-430c-ad58-24e883a674ad', filters: { query: ' Repair ', stages: ['new'], sources: [], ownerIds: ['me'], created: 'any', from: '', to: '', attention: false, archived: false } };
describe('lead export request', () => {
  it('accepts filters only and converts them to the shared list query', () => {
    const query = leadExportQuery(leadExportSchema.parse(input));
    expect(query).toMatchObject({ q: 'Repair', ownerIds: ['me'], stages: ['new'], page: 1 });
  });
  it('rejects forged scope, counts, row limits, selection and invalid date filters', () => {
    for (const extra of [{ scope: 'workspace' }, { count: 10 }, { rowLimit: 9999999 }, { actorId: 'owner' }, { selectedIds: [] }]) expect(leadExportSchema.safeParse({ ...input, ...extra }).success).toBe(false);
    for (const patch of [{ page: 1 }, { stages: ['unknown'] }, { created: 'custom', from: '', to: '' }, { created: 'custom', from: '2026-10-15', to: '2026-10-01' }]) expect(leadExportSchema.safeParse({ ...input, filters: { ...input.filters, ...patch } }).success).toBe(false);
  });
});

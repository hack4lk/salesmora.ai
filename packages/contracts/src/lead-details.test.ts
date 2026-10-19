import { expect, it } from 'vitest';
import { leadDetailsInputSchema, leadDetailsResultSchema } from './lead-details';
import { leadsQuerySchema, leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
import { chatLeadEvidenceSchema, mergeChatLeadEvidence } from './chat';
const id = '00000000-0000-4000-8000-000000000001';
it('details is a closed exact-reference read operation, never a mutation or arbitrary database request', () => {
  for (const leadRef of ['', id, 'LD-0001']) expect(leadsQuerySchema.safeParse({ request: { operation: 'details', input: { leadRef } } }).success).toBe(true);
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'details', input: { leadRef: id } } }).success).toBe(false);
  for (const extra of [{ workspaceId: id }, { sql: 'select * from leads' }, { fields: ['notes'] }, { scope: 'workspace' }, { includeActivity: true }, { expectedVersion: 1 }]) expect(leadDetailsInputSchema.safeParse({ leadRef: id, ...extra }).success).toBe(false);
  const schema = JSON.stringify(leadToolParameters('leads_query', ['details'])); expect(schema).toContain('details'); expect(schema).not.toContain('pipeline_summary'); expect(schema).not.toContain('ownerId');
});
it('bounds public snapshots and excludes timeline/authority/URL payloads', () => {
  const result = { id, scope: 'assigned', retrievedAt: '2026-10-17T14:30:00.000Z', lead: { id, number: 'LD-0001', name: 'Fictional lead', service: 'Repair', stage: 'new', source: 'other', ownerName: null, archived: false, email: '', phone: '', address: '', details: '', notes: '' } };
  expect(leadDetailsResultSchema.safeParse(result).success).toBe(true);
  for (const lead of [{ ...result.lead, notes: 'n'.repeat(10001) }, { ...result.lead, name: '' }, { ...result.lead, teamNotes: [] }, { ...result.lead, canDelete: true }, { ...result.lead, href: '/leads' }]) expect(leadDetailsResultSchema.safeParse({ ...result, lead }).success).toBe(false);
  expect(leadDetailsResultSchema.safeParse({ ...result, retrievedAt: 'invalid' }).success).toBe(false);
});
it('preserves stronger owner provenance through bare references and rejects malformed evidence', () => {
  const source = { id, version: 1, ownerStamp: 'a'.repeat(64) };
  expect(mergeChatLeadEvidence([source], [{ id, version: 1 }])).toEqual([source]);
  expect(mergeChatLeadEvidence([{ id, version: 1 }], [source])).toEqual([source]);
  expect(mergeChatLeadEvidence([source], [{ id, version: 1, ownerStamp: undefined }])).toEqual([source]);
  expect(chatLeadEvidenceSchema.safeParse([{ ...source, ownerStamp: 'forged' }]).success).toBe(false);
});

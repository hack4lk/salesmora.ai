import { expect, it } from 'vitest';
import { leadDeleteDraftInputSchema, leadDeleteDraftPayloadSchema, leadDeleteDraftReviewSchema, chatDeleteActionRequestSchema } from './chat-actions';
import { leadToolParameters, leadsProposeActionSchema } from './lead-capabilities';
const id = '00000000-0000-4000-8000-000000000001';
it('model deletion intent contains only a target, never approval or authority', () => {
  expect(leadDeleteDraftInputSchema.safeParse({ leadRef: '' }).success).toBe(true);
  for (const extra of [{ typedConfirmation: 'LD-0001' }, { confirmed: true }, { workspaceId: id }, { force: true }, { expectedVersion: 1 }]) expect(leadDeleteDraftInputSchema.safeParse({ leadRef: id, ...extra }).success).toBe(false);
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'delete', input: { leadRef: id } } }).success).toBe(true);
  const schema = JSON.stringify(leadToolParameters('leads_propose_action', ['delete']));
  expect(schema).toContain('"additionalProperties":false'); expect(schema).not.toContain('typedConfirmation');
});
it('browser confirmation is required, untrimmed and rejects mutation body fields', () => {
  const body = { workspaceId: id, draftId: id, inputHash: '0'.repeat(64), decision: 'confirm', typedConfirmation: ' LD-0001 ' };
  expect(chatDeleteActionRequestSchema.parse(body).typedConfirmation).toBe(' LD-0001 ');
  expect(chatDeleteActionRequestSchema.safeParse({ ...body, leadId: id }).success).toBe(false);
  const { typedConfirmation: _value, ...missing } = body; void _value;
  expect(chatDeleteActionRequestSchema.safeParse(missing).success).toBe(false);
});
it('confirmed public receipts cannot carry customer names or historical stage/visibility', () => {
  const review = { actionType: 'lead.delete', id, inputHash: '0'.repeat(64), state: 'confirmed', expiresAt: '2026-10-17T00:00:00.000Z', lead: { id, number: 'LD-0001', name: '' } };
  expect(leadDeleteDraftReviewSchema.safeParse(review).success).toBe(true);
  expect(leadDeleteDraftReviewSchema.safeParse({ ...review, lead: { ...review.lead, name: 'Private customer' } }).success).toBe(false);
  expect(leadDeleteDraftReviewSchema.safeParse({ ...review, stage: 'new', archived: false }).success).toBe(false);
  expect(leadDeleteDraftReviewSchema.safeParse({ ...review, state: 'pending' }).success).toBe(false);
});
it('private receipts keep only identifiers and retry version, without the deleted snapshot', () => {
  const receipt = { kind: 'receipt', lead: { id, number: 'LD-0001' }, expectedVersion: 2 };
  expect(leadDeleteDraftPayloadSchema.safeParse(receipt).success).toBe(true);
  expect(leadDeleteDraftPayloadSchema.safeParse({ ...receipt, lead: { ...receipt.lead, name: 'Private customer' } }).success).toBe(false);
  expect(leadDeleteDraftPayloadSchema.safeParse({ ...receipt, stage: 'new' }).success).toBe(false);
});

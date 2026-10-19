import { expect, it } from 'vitest';
import { chatActionReviewSchema, leadStageDraftInputSchema, leadStageDraftReviewSchema } from './chat-actions';
it('accepts bounded stage intent and rejects forged authority, unsupported stages and excess reason text', () => {
  const input = { leadRef: '', to: 'estimate-sent', reason: '' };
  expect(leadStageDraftInputSchema.safeParse(input).success).toBe(true);
  for (const patch of [{ role: 'owner' }, { expectedVersion: 1 }, { to: 'sent' }, { reason: 'x'.repeat(501) }]) {
    expect(leadStageDraftInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  }
});
it('accepts typed stage review without treating it as a create proposal', () => {
  const review = { actionType: 'lead.stage', id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: '2026-10-16T00:00:00.000Z',
    lead: { id: '00000000-0000-4000-8000-000000000002', number: 'LD-0001', name: 'Fictional customer' }, from: 'new', to: 'estimate-sent' };
  expect(chatActionReviewSchema.safeParse(review).success).toBe(true);
  expect(leadStageDraftReviewSchema.safeParse({ ...review, ownerName: 'Forged' }).success).toBe(false);
});

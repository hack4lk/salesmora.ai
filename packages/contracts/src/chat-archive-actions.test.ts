import { expect, it } from 'vitest';
import { chatActionReviewSchema, leadArchiveDraftInputSchema } from './chat-actions';
import { leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
it('accepts explicit boolean archive/restore intent and rejects forged authority and destructive flags', () => {
  const input = { leadRef: '', archived: true };
  for (const archived of [true, false]) expect(leadsProposeActionSchema.safeParse({ request: { operation: 'set_archived', input: { ...input, archived } } }).success).toBe(true);
  for (const patch of [{ archived: 'false' }, { archived: null }, { expectedVersion: 1 }, { role: 'owner' }, { permanent: true }, { stage: 'lost' }]) {
    expect(leadArchiveDraftInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  }
  const parameters = JSON.stringify(leadToolParameters('leads_propose_action', ['set_archived']));
  expect(parameters).toContain('archived'); expect(parameters).not.toContain('expectedVersion'); expect(parameters).not.toContain('permanent');
});
it('validates archive and restore reviews separately from stage changes', () => {
  const review = { actionType: 'lead.archive', id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: '2026-10-16T00:00:00.000Z',
    lead: { id: '00000000-0000-4000-8000-000000000002', number: 'LD-0001', name: 'Fictional customer' }, from: false, to: true };
  expect(chatActionReviewSchema.safeParse(review).success).toBe(true);
  expect(chatActionReviewSchema.safeParse({ ...review, from: true, to: false }).success).toBe(true);
  for (const patch of [{ to: 'archived' }, { actionType: 'lead.stage' }, { archivedBy: 'forged' }]) expect(chatActionReviewSchema.safeParse({ ...review, ...patch }).success).toBe(false);
});

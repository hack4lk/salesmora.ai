import { expect, it } from 'vitest';
import { chatActionReviewSchema, leadNoteDraftInputSchema } from './chat-actions';
import { leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
it('accepts only bounded note intent and normalizes text like the manual note schema', () => {
  const input = { leadRef: '', body: '  Called the customer.\n\nFollow up Friday.  ' };
  expect(leadNoteDraftInputSchema.parse(input).body).toBe('Called the customer.\n\nFollow up Friday.');
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'add_note', input } }).success).toBe(true);
  expect(leadNoteDraftInputSchema.safeParse({ ...input, body: '' }).success).toBe(true);
  expect(leadNoteDraftInputSchema.safeParse({ ...input, body: 'x'.repeat(2000) }).success).toBe(true);
  for (const patch of [{ body: 'x'.repeat(2001) }, { actorId: 'forged' }, { role: 'owner' }, { expectedVersion: 1 }, { noteId: 'prior-note' }, { viaAssistant: false }]) {
    expect(leadNoteDraftInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  }
  const parameters = JSON.stringify(leadToolParameters('leads_propose_action', ['add_note']));
  expect(parameters).toContain('add_note'); expect(parameters).not.toContain('actorId'); expect(parameters).not.toContain('expectedVersion');
});
it('validates a note review independently from editable Internal notes and rejects empty reviews', () => {
  const review = { actionType: 'lead.note', id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: '2026-10-16T00:00:00.000Z',
    lead: { id: '00000000-0000-4000-8000-000000000002', number: 'LD-0001', name: 'Fictional customer' }, body: 'Called the customer.' };
  expect(chatActionReviewSchema.safeParse(review).success).toBe(true);
  expect(chatActionReviewSchema.safeParse({ ...review, body: '' }).success).toBe(false);
  expect(chatActionReviewSchema.safeParse({ ...review, expectedVersion: 1 }).success).toBe(false);
  expect(chatActionReviewSchema.safeParse({ ...review, actionType: 'lead.update' }).success).toBe(false);
});

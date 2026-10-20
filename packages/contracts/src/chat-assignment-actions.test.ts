import { expect, it } from 'vitest';
import { chatActionReviewSchema, leadAssignmentDraftInputSchema } from './chat-actions';
import { leadsProposeActionSchema, leadToolParameters } from './lead-capabilities';
it('accepts explicit assignment intent and rejects authority, incompatible modes and arbitrary columns', () => {
  const input = { leadRef: '', assignment: { kind: 'teammate', teammateRef: 'Alex Chen' } };
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'assign', input } }).success).toBe(true);
  for (const bad of [
    { ...input, role: 'owner' }, { ...input, ownerId: 'forged' }, { ...input, expectedVersion: 1 },
    { ...input, assignment: { kind: 'self', teammateRef: 'forged' } },
    { ...input, assignment: { kind: 'teammate', teammateRef: '' } },
    { ...input, assignment: { kind: 'unassign', teammateRef: '', workspaceId: 'forged' } },
  ]) expect(leadAssignmentDraftInputSchema.safeParse(bad).success).toBe(false);
  for (const kind of ['self', 'unassign']) expect(leadAssignmentDraftInputSchema.safeParse({ ...input, assignment: { kind, teammateRef: '' } }).success).toBe(true);
  const parameters = JSON.stringify(leadToolParameters('leads_propose_action', ['assign']));
  expect(parameters).toContain('teammateRef'); expect(parameters).not.toContain('membershipVersion'); expect(parameters).not.toContain('expectedVersion');
});
it('accepts assignment reviews but excludes private membership snapshots', () => {
  const review = { actionType: 'lead.assign', id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: '2026-10-16T00:00:00.000Z',
    lead: { id: '00000000-0000-4000-8000-000000000002', number: 'LD-0001', name: 'Fictional customer' },
    from: null, to: { id: '00000000-0000-4000-8000-000000000003', name: 'Alex Chen' } };
  expect(chatActionReviewSchema.safeParse(review).success).toBe(true);
  expect(chatActionReviewSchema.safeParse({ ...review, to: { id: 'opaque-auth-user-id', name: 'Alex Chen' } }).success).toBe(true);
  expect(chatActionReviewSchema.safeParse({ ...review, targetSnapshot: { role: 'owner' } }).success).toBe(false);
  expect(chatActionReviewSchema.safeParse({ ...review, to: null }).success).toBe(true);
});

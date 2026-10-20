import { describe, it, expect } from 'vitest';
import { chatActionRequestSchema, leadDraftInputSchema } from './chat-actions';
const request = { workspaceId: '00000000-0000-4000-8000-000000000001', draftId: '00000000-0000-4000-8000-000000000002', inputHash: 'a'.repeat(64), decision: 'confirm' };
describe('explicit lead approval boundary', () => {
  it('rejects browser-supplied edits, role claims and natural-language confirmation', () => {
    expect(chatActionRequestSchema.safeParse(request).success).toBe(true);
    for (const forged of [{ ...request, lead: { name: 'Changed' } }, { ...request, role: 'owner' }, { ...request, decision: 'yes' }, { ...request, inputHash: 'stale' }]) expect(chatActionRequestSchema.safeParse(forged).success).toBe(false);
  });
  it('allows missing required facts in a proposal but rejects stages that imply progress or privileged input', () => {
    const draft = { name: '', service: '', email: '', phone: '', address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: '' };
    expect(leadDraftInputSchema.safeParse(draft).success).toBe(true);
    expect(leadDraftInputSchema.safeParse({ ...draft, stage: 'in-progress' }).success).toBe(false);
    expect(leadDraftInputSchema.safeParse({ ...draft, createdBy: 'forged' }).success).toBe(false);
  });
});

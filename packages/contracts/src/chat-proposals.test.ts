import { describe, expect, it } from 'vitest';
import { chatProposalFamilies, chatProposalSchema, proposalSupersession, estimateProposalFamilies } from './chat-proposals';

const uuid = '10000000-0000-4000-8000-000000000001';
const hash = 'a'.repeat(64);
const row = {
  family: 'action', id: uuid, workspaceId: uuid, userId: 'owner', threadId: uuid, turnId: uuid,
  payloadVersion: 1, state: 'pending', inputHash: hash, requestId: null,
  createdAt: '2026-11-13T12:00:00.000Z', expiresAt: '2026-11-13T12:15:00.000Z', resolvedAt: null,
};
const lead = {
  name: ' Fictional lead ', email: 'FICTIONAL@example.test', phone: '', service: ' Repair ',
  address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: 'owner',
};
const payload = { actionType: 'lead.create', capability: 'leads.create', lead, accessHash: hash };

describe('Canonical proposal contracts', () => {
  it('retains signed raw values instead of applying native trims, defaults or transforms', () => {
    const parsed = chatProposalSchema.parse({ ...row, payload });
    expect(parsed.payload).toEqual(payload);
    expect(parsed.payload).toBe(payload);
  });
  it('retains nullable and absent legacy columns distinctly', () => {
    const nullable = { ...payload, ownerSnapshot: null, leadId: null, stagePayload: null };
    expect(chatProposalSchema.parse({ ...row, payload: nullable }).payload).toEqual(nullable);
    expect(chatProposalSchema.parse({ ...row, payload }).payload).not.toHaveProperty('stagePayload');
  });
  it.each([
    { ...row, payloadVersion: 2, payload },
    { ...row, state: 'expired', payload },
    { ...row, family: 'unknown', payload },
    { ...row, requestId: uuid, payload },
    { ...row, payload: { ...payload, capability: 'leads.delete' } },
    { ...row, payload: { ...payload, stagePayload: {} } },
    { ...row, payload: { ...payload, lead: { ...lead, email: 'invalid' } } },
  ])('rejects malformed or unsupported envelopes %#', input => {
    expect(chatProposalSchema.safeParse(input).success).toBe(false);
  });
  it('preserves a minimal delete receipt with its original request hash', () => {
    const receipt = {
      actionType: 'lead.delete', capability: 'leads.delete', lead: {}, accessHash: hash,
      deletePayload: { kind: 'receipt', lead: { id: uuid, number: 'LD-1000' }, expectedVersion: 1 },
    };
    expect(chatProposalSchema.parse({ ...row, state: 'confirmed', payload: receipt }).inputHash).toBe(hash);
  });
  it('defines all fifteen directional families without a universal pending-thread policy', () => {
    expect(Object.keys(proposalSupersession)).toEqual(expect.arrayContaining([...chatProposalFamilies]));
    expect(Object.keys(proposalSupersession)).toHaveLength(15);
    expect(proposalSupersession.action).toEqual(['action']);
    expect(proposalSupersession.customer).toEqual(['customer', 'action']);
    for (const family of ['workOrder', 'material'] as const)
      expect(proposalSupersession[family]).toEqual(['workOrder', 'material', 'customer', 'action']);
    for (const family of estimateProposalFamilies) expect(proposalSupersession[family]).toEqual(estimateProposalFamilies);
    expect(proposalSupersession.calendar).toEqual(['calendar']);
    expect(proposalSupersession.captureSetup).toEqual(['captureSetup', 'captureSource']);
    expect(proposalSupersession.captureSource).toEqual(['captureSetup', 'captureSource']);
  });
});

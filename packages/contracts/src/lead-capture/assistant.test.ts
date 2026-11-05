import { describe, expect, it } from 'vitest';
import { captureAssistantContextSchema, captureAssistantQuerySchema, captureAssistantEvidenceSchema, captureAssistantProposalBindingSchema, captureAssistantProposalTicketSchema, captureAssistantProposalDecisionSchema } from './assistant';
const id = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002', hash = 'a'.repeat(64);
const source = { kind: 'source', sourceId: id, sourceVersion: 2, draftVersion: 1, approvedVersion: null };
const binding = { workspaceId: id, proposalId: other, inputHash: hash, operation: 'save_draft', target: source };
describe('Lead Capture assistant boundaries', () => {
  it('keeps context to typed page intent without record authority', () => {
    expect(captureAssistantContextSchema.parse({ surface: 'lead_capture.setup', sourceId: id })).toEqual({ surface: 'lead_capture.setup', sourceId: id });
    for (const input of [{ surface: 'intake.detail', sourceId: id }, { surface: 'lead_capture.list', filters: {}, sourceId: id }, { surface: 'lead_capture.setup', sourceId: id, websiteReady: true }, { surface: 'lead_capture.setup', sourceId: id, sourceVersion: 1 }]) expect(captureAssistantContextSchema.safeParse(input).success).toBe(false);
  });
  it('bounds query windows and refuses workspace/identity or mutation parameters', () => {
    expect(captureAssistantQuerySchema.safeParse({ operation: 'sources', filters: {}, page: 1, limit: 20 }).success).toBe(true);
    for (const patch of [{ limit: 21 }, { workspaceId: id }, { confirmed: true }, { operation: 'publish' }]) expect(captureAssistantQuerySchema.safeParse({ operation: 'sources', filters: {}, page: 1, limit: 20, ...patch }).success).toBe(false);
    expect(captureAssistantQuerySchema.safeParse({ operation: 'source_details', sourceId: 'invented-name' }).success).toBe(false);
  });
  it('binds proposal operations to exact target versions', () => {
    expect(captureAssistantProposalBindingSchema.safeParse(binding).success).toBe(true);
    for (const patch of [{ operation: 'create_source' }, { operation: 'link_lead' }, { target: { ...source, sourceVersion: 0 } }, { target: { ...source, draftVersion: null } }, { operation: 'resume' }]) expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, ...patch }).success).toBe(false);
    expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, operation: 'create_source', target: { kind: 'new_source' } }).success).toBe(true);
  });

  it('binds schedule reviews to the pending transition without accepting it for other actions', () => {
    const scheduled = { ...binding, operation: 'cancel_schedule', target: { ...source, approvedVersion: 1 } };
    const transition = { transitionId: other, configurationVersion: 2 };
    expect(captureAssistantProposalBindingSchema.safeParse(scheduled).success).toBe(false);
    expect(captureAssistantProposalBindingSchema.safeParse({ ...scheduled, transition }).success).toBe(true);
    expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, transition }).success).toBe(false);
  });
  it('requires an exact existing lead only for linking', () => {
    const target = { kind: 'intake', intakeId: id, intakeVersion: 1, reviewId: other, definitionVersion: 1, workflowVersion: 1, lead: null };
    expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, operation: 'link_lead', target }).success).toBe(false);
    const linked = { ...target, lead: { leadId: other, leadVersion: 3 } };
    expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, operation: 'link_lead', target: linked }).success).toBe(true);
    expect(captureAssistantProposalBindingSchema.safeParse({ ...binding, operation: 'dismiss_intake', target: linked }).success).toBe(false);
  });
  it('retains target validation in expiring tickets and rejects payload substitution at confirmation', () => {
    const ticket = { ...binding, state: 'pending', createdAt: '2026-11-02T12:00:00Z', expiresAt: '2026-11-02T12:15:00Z' };
    expect(captureAssistantProposalTicketSchema.safeParse(ticket).success).toBe(true);
    expect(captureAssistantProposalTicketSchema.safeParse({ ...ticket, target: { ...source, draftVersion: null } }).success).toBe(false);
    for (const expiresAt of ['2026-11-02T12:00:00Z', '2026-11-02T12:15:01Z']) expect(captureAssistantProposalTicketSchema.safeParse({ ...ticket, expiresAt }).success).toBe(false);
    const decision = { workspaceId: id, proposalId: other, inputHash: hash, decision: 'confirm' };
    expect(captureAssistantProposalDecisionSchema.safeParse(decision).success).toBe(true);
    expect(captureAssistantProposalDecisionSchema.safeParse({ ...decision, configuration: {} }).success).toBe(false);
  });
  it('rejects duplicate or unrelated evidence and bounds read references', () => {
    const row = { sourceId: id, sourceVersion: 1, draftVersion: 1, approvedVersion: null };
    const evidence = { workspaceId: id, operation: 'sources', retrievedAt: '2026-11-02T12:00:00Z', accessHash: hash, snapshotHash: hash, sources: [row], intake: [], leads: [] };
    expect(captureAssistantEvidenceSchema.safeParse(evidence).success).toBe(true);
    expect(captureAssistantEvidenceSchema.safeParse({ ...evidence, operation: 'source_details', sources: [] }).success).toBe(false);
    expect(captureAssistantEvidenceSchema.safeParse({ ...evidence, operation: 'intake_details' }).success).toBe(false);
    expect(captureAssistantEvidenceSchema.safeParse({ ...evidence, sources: [row, row] }).success).toBe(false);
    expect(captureAssistantEvidenceSchema.safeParse({ ...evidence, leads: [{ leadId: id, leadVersion: 1, accessHash: hash }] }).success).toBe(false);
    expect(captureAssistantEvidenceSchema.safeParse({ ...evidence, sources: Array(21).fill(row) }).success).toBe(false);
  });
});

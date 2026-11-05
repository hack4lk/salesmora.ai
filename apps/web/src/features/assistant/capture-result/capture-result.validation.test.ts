import { describe, expect, it } from 'vitest';
import { captureAssistantProposalFixture, captureAssistantResultFixture } from './capture-result.fixtures';
import { captureAssistantReferenceKey, captureAssistantViewMatches } from './capture-result.validation';

describe('Lead Capture assistant canonical review bindings', () => {
  for (const kind of ['fields', 'workflow', 'publication', 'lifecycle', 'intake'] as const) it(`accepts the canonical ${kind} review with an exact proposal binding`, () => {
    const view = captureAssistantProposalFixture(kind);
    expect(captureAssistantViewMatches(view.reference, view)).toBe(true);
    expect(captureAssistantViewMatches(view.reference, { ...view, ticket: { ...view.ticket, inputHash: 'b'.repeat(64) } })).toBe(false);
    expect(captureAssistantViewMatches(view.reference, { ...view, ticket: { ...view.ticket, workspaceId: '00000000-0000-4000-8000-000000000099' } })).toBe(false);
  });
  it('canonicalizes property ordering without weakening the target comparison', () => {
    const view = captureAssistantProposalFixture();
    if (view.reference.kind !== 'proposal') throw Error('fixture');
    const binding = view.reference.binding;
    expect(captureAssistantReferenceKey({ kind: 'proposal', binding: { target: binding.target, operation: binding.operation, inputHash: binding.inputHash, proposalId: binding.proposalId, workspaceId: binding.workspaceId } })).toBe(captureAssistantReferenceKey(view.reference));
  });
  it('rejects mismatched source versions and draft identity before rendering a review', () => {
    const life = captureAssistantProposalFixture('lifecycle'); if (life.content.kind !== 'lifecycle') throw Error('fixture');
    expect(captureAssistantViewMatches(life.reference, { ...life, content: { ...life.content, source: { ...life.content.source, version: 3 } } })).toBe(false);
    const publication = captureAssistantProposalFixture('publication'); if (publication.content.kind !== 'publication') throw Error('fixture');
    expect(captureAssistantViewMatches(publication.reference, { ...publication, content: { ...publication.content, draft: { ...publication.content.draft, version: 4 } } })).toBe(false);
  });
  it('rejects invalid field/workflow proposals rather than enabling their confirmation', () => {
    const fields = captureAssistantProposalFixture('fields');
    expect(captureAssistantViewMatches(fields.reference, { ...fields, content: { kind: 'fields', value: { contactRequired: true, fields: [] } } })).toBe(false);
    const workflow = captureAssistantProposalFixture('workflow'); if (workflow.content.kind !== 'workflow') throw Error('fixture');
    expect(captureAssistantViewMatches(workflow.reference, { ...workflow, content: { ...workflow.content, value: { ...workflow.content.value, assignment: 'teammate', teammateId: 'removed' } } })).toBe(false);
  });
  it('binds intake confirmation to the review snapshot and decision kind', () => {
    const view = captureAssistantProposalFixture('intake'); if (view.content.kind !== 'intake') throw Error('fixture');
    expect(captureAssistantViewMatches(view.reference, { ...view, content: { ...view.content, review: { ...view.content.review, revision: 'different-review' } } })).toBe(false);
    expect(captureAssistantViewMatches(view.reference, { ...view, content: { ...view.content, review: { ...view.content.review, decision: 'dismiss' } } })).toBe(false);
  });
  for (const kind of ['sources', 'summary', 'installation', 'intake_evidence'] as const) it(`accepts canonical ${kind} read content with its snapshot reference`, () => {
    const view = captureAssistantResultFixture(kind);
    expect(captureAssistantViewMatches(view.reference, view)).toBe(true);
    const wrong = captureAssistantProposalFixture().reference;
    expect(captureAssistantViewMatches(wrong, view)).toBe(false);
  });
  it('rejects oversized lists, invalid totals and unusable dates', () => {
    const view = captureAssistantResultFixture('sources'); if (view.kind !== 'result' || view.content.kind !== 'sources') throw Error('fixture');
    expect(captureAssistantViewMatches(view.reference, { ...view, content: { ...view.content, total: 0 } })).toBe(false);
    expect(captureAssistantViewMatches(view.reference, { ...view, content: { ...view.content, rows: Array(21).fill(view.content.rows[0]) } })).toBe(false);
    expect(captureAssistantViewMatches(view.reference, { ...view, retrievedAt: 'not-a-date' })).toBe(false);
  });
});

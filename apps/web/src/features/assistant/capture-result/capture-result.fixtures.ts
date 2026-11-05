import type { CaptureAssistantProposalBinding } from '@salesmora/contracts';
import type { CaptureAssistantReference, CaptureAssistantView } from './capture-result.types';
import { captureAssistantResultData as copy } from './capture-result.data';
export const captureAssistantWorkspace = '00000000-0000-4000-8000-000000000001';
export const captureAssistantSource = '00000000-0000-4000-8000-000000000002';
const proposalId = '00000000-0000-4000-8000-000000000003', intakeId = '00000000-0000-4000-8000-000000000004', reviewId = '00000000-0000-4000-8000-000000000005';
const hash = 'a'.repeat(64);
const definition = { contactRequired: true, fields: [
  { id: 'name', key: 'name' as const, type: 'short_text' as const, label: 'Name', required: true, options: [] },
  { id: 'email', key: 'email' as const, type: 'email' as const, label: 'Email', required: false, options: [] },
  { id: 'service', key: 'service' as const, type: 'short_text' as const, label: 'Service requested', required: true, options: [] },
] };
export function captureAssistantProposalFixture(kind: 'fields' | 'workflow' | 'publication' | 'lifecycle' | 'intake' = 'fields'): Extract<CaptureAssistantView, { kind: 'proposal' }> {
  const target = { kind: 'source' as const, sourceId: captureAssistantSource, sourceVersion: 2, draftVersion: 1, approvedVersion: 1 };
  const operations = { fields: 'suggest_website_fields', workflow: 'suggest_workflow', publication: 'publish', lifecycle: 'pause', intake: 'create_lead' } as const;
  const binding: CaptureAssistantProposalBinding = { workspaceId: captureAssistantWorkspace, proposalId, inputHash: hash, operation: operations[kind], target: kind === 'intake' ? { kind: 'intake', intakeId, intakeVersion: 1, reviewId, definitionVersion: 1, workflowVersion: 1, lead: null } : target };
  const now = Date.now();
  const content = kind === 'fields' ? { kind, value: definition }
    : kind === 'workflow' ? { kind, source: 'website' as const, value: { assignment: 'default' as const, teammateId: '', stage: 'new' as const, tagsText: 'Website request', notifyAssigned: false }, teammates: [] }
      : kind === 'publication' ? { kind, draft: { id: captureAssistantSource, version: 1, name: copy.stories.name, source: 'website' as const, timezone: 'America/New_York', sections: [
        { id: 'source' as const, rows: [{ label: 'Source', value: copy.stories.name }] },
        { id: 'fields' as const, rows: [{ label: 'Fields', value: 'Name, Email, Service requested' }] },
        { id: 'workflow' as const, rows: [{ label: 'Notifications', value: 'Off — no assignment emails' }] },
      ], checks: (['source', 'fields', 'workflow', 'access', 'capacity'] as const).map(id => ({ id, status: 'ready' as const })) }, timing: { mode: 'now' as const, localDateTime: '' } }
        : kind === 'lifecycle' ? { kind, action: 'pause' as const, source: { id: captureAssistantSource, version: 2, name: copy.stories.name, type: 'website' as const, status: 'active' as const, canPause: true, canResume: true, resumeReadiness: 'ready' as const, approved: [{ label: 'Notifications', value: 'Off' }] } }
          : { kind: 'intake' as const, review: { intakeId, intakeVersion: 1, revision: reviewId, resolved: false, duplicateRequired: false, decision: 'create' as const, matches: [], definitionVersion: 1, definition, answers: { name: 'Fictional Customer', email: 'fictional@example.test', service: 'Plumbing repair' }, workflowVersion: 1, workflow: [{ label: 'Assignment notifications', value: 'Off' }], access: 'ready' as const, capacity: 'available' as const, canCreate: true, canLink: false, canDismiss: true } };
  return { kind: 'proposal', reference: { kind: 'proposal', binding }, retrievedAt: new Date(now).toISOString(), ticket: { ...binding, state: 'pending', createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString() }, title: copy.stories.name, content };
}
export function captureAssistantResultFixture(kind: 'sources' | 'summary' | 'installation' | 'intake_evidence' = 'summary'): CaptureAssistantView {
  const reference: CaptureAssistantReference = { kind: 'result', workspaceId: captureAssistantWorkspace, resultId: proposalId, snapshotHash: hash };
  const source = { id: captureAssistantSource, name: copy.stories.name, type: 'website' as const, status: 'paused' as const };
  const content = kind === 'summary' ? { kind, source, totals: { captured: 12, awaitingReview: 2, approved: 10 } }
    : kind === 'sources' ? { kind, rows: [{ id: source.id, name: source.name, source: source.type, status: source.status, captured: 12, awaitingReview: 2, lastActivityAt: '2026-11-02T12:00:00Z', allowedActions: ['resume' as const] }], total: 38, timezone: 'America/New_York', archived: false }
      : kind === 'installation' ? { kind, publication: { id: captureAssistantSource, version: 1, name: source.name, status: 'paused' as const, hostedUrl: 'https://forms.salesmora.example/f/fictional', embeds: [{ method: 'iframe' as const, code: '<iframe src="https://forms.salesmora.example/f/fictional" title="Fictional request" width="100%" height="640"></iframe>' }], timezone: 'America/New_York' } }
        : { kind: 'intake_evidence' as const, timezone: 'America/New_York', snapshot: { intakeId, version: 1, type: 'website' as const, sourceName: source.name, receivedAt: '2026-11-02T12:00:00Z', answers: [{ id: 'service', label: 'Service requested', value: 'Plumbing repair' }], fields: [{ id: 'service', label: 'Service requested', uncertain: false, origin: { kind: 'form' as const, answerId: 'service', quote: 'Plumbing repair' } }] } };
  return { kind: 'result', reference, retrievedAt: '2026-11-02T12:00:00Z', content };
}

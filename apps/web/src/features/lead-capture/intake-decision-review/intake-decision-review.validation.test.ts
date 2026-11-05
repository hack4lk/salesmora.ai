import { describe, expect, it } from 'vitest';
import { intakeDecisionIssue as issue, intakeDecisionRequest as request, type IntakeDecisionReviewModel } from './intake-decision-review.validation';
const review: IntakeDecisionReviewModel = { intakeId: 'item', intakeVersion: 1, revision: 'r1', resolved: false, duplicateRequired: false, decision: 'create', matches: [], definitionVersion: 1, definition: { contactRequired: true, fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }] }, answers: { name: ' Jamie ', email: 'JAMIE@example.com', service: 'Kitchen', injected: 'ignore' }, workflowVersion: 1, workflow: [{ label: 'Stage', value: 'New' }], access: 'ready', capacity: 'available', canCreate: true, canLink: true, canDismiss: true };
describe('final intake decision boundary', () => {
  it('normalizes and allowlists reviewed answers and binds definition/workflow versions', () => { expect(issue(review)).toBe(null); expect(request(review)).toEqual({ intakeId: 'item', expectedVersion: 1, reviewRevision: 'r1', kind: 'create', definitionVersion: 1, workflowVersion: 1, answers: { name: 'Jamie', email: 'jamie@example.com', service: 'Kitchen' } }); });
  it('blocks invalid fields, access, capacity and already-resolved decisions', () => {
    expect(issue({ ...review, answers: {} })).toBe('fields'); expect(issue({ ...review, capacity: 'exhausted' })).toBe('capacity'); expect(issue({ ...review, access: 'checking' })).toBe('checking'); expect(issue({ ...review, canCreate: false })).toBe('permission'); expect(issue({ ...review, resolved: true })).toBe('resolved'); expect(request({ ...review, intakeVersion: 0 })).toBe(null);
  });
  it('does not require new-lead fields or capacity to dismiss', () => { const dismiss = { ...review, decision: 'dismiss' as const, answers: {}, capacity: 'exhausted' as const }; expect(issue(dismiss)).toBe(null); expect(request(dismiss)).toEqual({ intakeId: 'item', expectedVersion: 1, reviewRevision: 'r1', kind: 'dismiss' }); });
  it('requires duplicate resolution and exact authorized link/field/version binding', () => {
    const duplicate = { ...review, duplicateRequired: true }; expect(issue(duplicate)).toBe('choice');
    const link: IntakeDecisionReviewModel = { ...duplicate, answers: {}, capacity: 'exhausted', matches: [{ id: 'lead', version: 2, name: 'Jamie', contact: '', reason: '', canLink: true, changes: [{ id: 'phone', label: 'Phone', existing: '111', proposed: '222' }] }], decision: { kind: 'link', reviewRevision: 'r1', leadId: 'lead', leadVersion: 2, changeIds: ['phone'] } };
    expect(issue(link)).toBe(null); expect(request(link)).toEqual({ intakeId: 'item', expectedVersion: 1, reviewRevision: 'r1', kind: 'link', leadId: 'lead', expectedLeadVersion: 2, changeIds: ['phone'] });
    expect(issue({ ...link, revision: 'r2' })).toBe('choice'); expect(issue({ ...link, canLink: false })).toBe('permission');
  });
});

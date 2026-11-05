import { describe, expect, it } from 'vitest';
import { captureWorkflowTags, defaultCaptureLeadWorkflow as defaults, validateCaptureLeadWorkflow as validate } from './capture-lead-workflow.validation';
const teammates = [{ id: 'sam', name: 'Sam Rivera' }];
describe('capture source workflow draft', () => {
  it('defaults to business assignment, New, no tags and teammate notification', () => {
    expect(validate(defaults, [])).toEqual({}); expect(captureWorkflowTags(defaults.tagsText)).toEqual([]); expect(defaults.notifyAssigned).toBe(true);
  });
  it('requires a current eligible teammate only for direct assignment', () => {
    expect(validate({ ...defaults, assignment: 'teammate' }, teammates).teammateId).toBeTruthy();
    expect(validate({ ...defaults, assignment: 'teammate', teammateId: 'removed' }, teammates).teammateId).toBeTruthy();
    expect(validate({ ...defaults, assignment: 'teammate', teammateId: 'sam' }, teammates)).toEqual({});
    expect(validate({ ...defaults, assignment: 'teammate', teammateId: 'sam' }, teammates, false).teammateId).toBeTruthy();
    expect(validate(defaults, [], false)).toEqual({});
  });
  it('normalizes tag whitespace and rejects duplicates, excessive count and oversized tags', () => {
    expect(captureWorkflowTags(' Urgent, Website , , ')).toEqual(['Urgent', 'Website']);
    for (const tagsText of ['Urgent, urgent', 'x'.repeat(51), Array.from({ length: 21 }, (_, index) => String(index)).join(',')]) expect(validate({ ...defaults, tagsText }, teammates).tagsText).toBeTruthy();
    expect(validate({ ...defaults, tagsText: Array.from({ length: 20 }, (_, index) => String(index)).join(',') }, teammates)).toEqual({});
  });
  it('rejects unsupported stages, assignment modes and invalid notification values', () => {
    expect(validate({ ...defaults, stage: 'qualified' as typeof defaults.stage }, teammates).stage).toBeTruthy();
    expect(validate({ ...defaults, assignment: 'round-robin' as typeof defaults.assignment }, teammates).assignment).toBeTruthy();
    expect(validate({ ...defaults, notifyAssigned: 'yes' as unknown as boolean }, teammates).notifyAssigned).toBeTruthy();
  });
});

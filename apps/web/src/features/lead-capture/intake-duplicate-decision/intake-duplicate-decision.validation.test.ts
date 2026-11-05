import { describe, expect, it } from 'vitest';
import { validIntakeDuplicateReview as reviewValid, validIntakeDuplicateChoice as choiceValid, type IntakeDuplicateChoice, type IntakeDuplicateMatch } from './intake-duplicate-decision.validation';
const review = { intakeId: 'item', intakeVersion: 1, revision: 'review-1', resolved: false };
const matches: IntakeDuplicateMatch[] = [{ id: 'lead', version: 3, name: 'Jamie', contact: '', reason: '', canLink: true, changes: [{ id: 'phone', label: 'Phone', existing: '111', proposed: '222' }, { id: 'same', label: 'Name', existing: 'Jamie', proposed: 'Jamie' }] }];
const choice: IntakeDuplicateChoice = { kind: 'link', reviewRevision: 'review-1', leadId: 'lead', leadVersion: 3, changeIds: ['phone'] };
describe('duplicate review selection boundary', () => {
  it('requires valid versioned identities and unique changes', () => { expect(reviewValid(review, matches)).toBe(true); expect(reviewValid({ ...review, intakeVersion: 0 }, matches)).toBe(false); expect(reviewValid(review, [...matches, ...matches])).toBe(false); expect(reviewValid(review, [{ ...matches[0], changes: [...matches[0].changes, ...matches[0].changes] }])).toBe(false); });
  it('binds selected changes to the authorized existing lead and exact review revision', () => {
    expect(choiceValid(review, matches, choice)).toBe(true); expect(choiceValid(review, matches, { ...choice, changeIds: [] })).toBe(true);
    expect(choiceValid(review, matches, { ...choice, leadVersion: 2 })).toBe(false); expect(choiceValid({ ...review, revision: 'new' }, matches, choice)).toBe(false); expect(choiceValid(review, [{ ...matches[0], canLink: false }], choice)).toBe(false);
  });
  it('rejects invented, unchanged and repeated changes instead of broadening updates', () => { for (const changeIds of [['unknown'], ['same'], ['phone', 'phone']]) expect(choiceValid(review, matches, { ...choice, changeIds })).toBe(false); });
  it('requires an explicit choice and rejects resolved items', () => { expect(choiceValid(review, matches, null)).toBe(false); expect(choiceValid({ ...review, resolved: true }, matches, choice)).toBe(false); for (const kind of ['separate', 'dismiss'] as const) expect(choiceValid(review, matches, { kind, reviewRevision: 'review-1' })).toBe(true); });
});

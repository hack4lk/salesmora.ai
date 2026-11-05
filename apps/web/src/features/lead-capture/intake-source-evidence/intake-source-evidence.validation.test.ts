import { describe, expect, it } from 'vitest';
import { validIntakeEvidenceSnapshot as valid, verifiedIntakeEvidence as verified, type IntakeEvidenceSnapshot } from './intake-source-evidence.validation';
const email: IntakeEvidenceSnapshot = { intakeId: 'item', version: 1, sourceName: 'Gmail', receivedAt: null, type: 'gmail', from: 'sender@example.com', subject: 'Estimate', body: 'Name: Jamie', fields: [] };
const form: IntakeEvidenceSnapshot = { intakeId: 'form-item', version: 1, sourceName: 'Form', receivedAt: null, type: 'website', answers: [{ id: 'name', label: 'Name', value: 'Jamie' }], fields: [] };
describe('immutable source evidence', () => {
  it('accepts only exact quotes from the declared email location', () => {
    expect(verified(email, { kind: 'email', location: 'body', quote: 'Name: Jamie' })).toBe(true);
    expect(verified(email, { kind: 'email', location: 'subject', quote: 'Name: Jamie' })).toBe(false);
    expect(verified(email, { kind: 'email', location: 'body', quote: 'Name: Alex' })).toBe(false);
    expect(verified(email, { kind: 'email', location: 'body', quote: ' ' })).toBe(false); expect(verified(email, null)).toBe(false);
  });
  it('binds form quotes to the original answer ID and source kind', () => {
    expect(verified(form, { kind: 'form', answerId: 'name', quote: 'Jamie' })).toBe(true);
    expect(verified(form, { kind: 'form', answerId: 'other', quote: 'Jamie' })).toBe(false);
    expect(verified(email, { kind: 'form', answerId: 'name', quote: 'Jamie' })).toBe(false);
    expect(verified(form, { kind: 'email', location: 'body', quote: 'Jamie' })).toBe(false);
  });
  it('requires a versioned item identity and unique original field/answer identities', () => {
    expect(valid(email)).toBe(true); expect(valid(form)).toBe(true); expect(valid(undefined)).toBe(false);
    expect(valid({ ...email, intakeId: '' })).toBe(false); expect(valid({ ...email, version: 0 })).toBe(false);
    expect(valid({ ...form, answers: [...form.answers, ...form.answers] })).toBe(false);
    const field = { id: 'name', label: 'Name', origin: null }; expect(valid({ ...email, fields: [field, field] })).toBe(false);
  });
});

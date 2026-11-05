import { describe, expect, it } from 'vitest';
import { validIntakeEditorDefinition as valid, validateIntakeProposedAnswers as validate, intakeAnswerEdited as edited } from './intake-proposed-lead-editor.validation';
import type { CaptureFormFieldEditorValue } from '../capture-form-field-editor/capture-form-field-editor.validation';
const definition: CaptureFormFieldEditorValue = { contactRequired: true, fields: [
  { id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'phone', key: 'phone', label: 'Phone', type: 'phone', required: false, options: [] },
] };
const record = { id: 'item', version: 1, resolved: false };
describe('proposed lead correction checks', () => {
  it('requires identity, mandatory lead fields and a contact policy', () => {
    expect(valid(record, definition)).toBe(true); expect(valid({ ...record, version: 0 }, definition)).toBe(false);
    expect(valid(record, { ...definition, contactRequired: false })).toBe(false);
    expect(valid(record, { ...definition, fields: definition.fields.filter(field => field.key !== 'service') })).toBe(false);
  });
  it('requires name, service and one contact, validating supplied email even if phone exists', () => {
    expect(Object.keys(validate(definition, {}))).toEqual(['name', 'service', 'email', 'phone']);
    expect(validate(definition, { name: 'Jamie', service: 'Kitchen', phone: '555-0100' })).toEqual({});
    expect(validate(definition, { name: 'Jamie', service: 'Kitchen', phone: '555-0100', email: 'invalid' })).toHaveProperty('email');
  });
  it('validates custom choices, date values and length without changing answers', () => {
    const custom: CaptureFormFieldEditorValue = { ...definition, fields: [...definition.fields, { id: 'choice', key: 'custom', label: 'Choice', type: 'dropdown', required: true, options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }, { id: 'date', key: 'custom', label: 'Date', type: 'date', required: false, options: [] }] };
    const answers = { name: 'x'.repeat(201), service: 'Kitchen', phone: '555', choice: 'unknown', date: '2026-02-30' };
    expect(Object.keys(validate(custom, answers))).toEqual(['name', 'choice', 'date']); expect(answers.choice).toBe('unknown');
  });
  it('marks corrections independently of original evidence and ignores checkbox order', () => {
    expect(edited('Original', 'Corrected')).toBe(true); expect(edited(undefined, '')).toBe(false);
    expect(edited(['a', 'b'], ['b', 'a'])).toBe(false); expect(edited(['a'], ['a', 'b'])).toBe(true);
  });
});

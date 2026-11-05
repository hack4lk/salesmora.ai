import { describe, expect, it } from 'vitest';
import { validateCaptureFormFields, type CaptureFormField } from './capture-form-field-editor.validation';
import { captureFormFieldEditorData as copy } from './capture-form-field-editor.data';

const field: CaptureFormField = { id: 'custom-one', key: 'custom', label: 'Visit window', type: 'dropdown', required: false, options: [{ id: 'a', label: 'Morning' }, { id: 'b', label: 'Afternoon' }] };
const check = (fields: CaptureFormField[], contactRequired = false) => validateCaptureFormFields({ fields, contactRequired }).map(issue => issue.message);
describe('capture form configuration validation', () => {
  it('rejects a contact requirement with no mapped contact field', () => {
    expect(check([field], true)).toContain(copy.errors.contact);
    expect(check([{ ...field, key: 'email', type: 'email' }], true)).not.toContain(copy.errors.contact);
  });
  it('rejects case and whitespace variants of the same choice', () => {
    expect(check([{ ...field, options: [{ id: 'a', label: 'Morning' }, { id: 'b', label: ' morning ' }] }])).toContain(copy.errors.duplicateOption);
  });
  it('requires choice labels, enough options and unique option identities', () => {
    expect(check([{ ...field, options: [{ id: 'a', label: '' }] }])).toEqual(expect.arrayContaining([copy.errors.optionCount, copy.errors.optionLabel]));
    expect(check([{ ...field, options: [{ id: 'a', label: 'One' }, { id: 'a', label: 'Two' }] }])).toContain(copy.errors.optionIdentity);
  });
  it('rejects duplicate field identities and duplicate standard mappings', () => {
    expect(check([field, field])).toContain(copy.errors.duplicateField);
    expect(check([{ ...field, id: 'one', key: 'email' }, { ...field, id: 'two', key: 'email' }])).toContain(copy.errors.duplicateStandard);
  });
  it('bounds field count and rejects blank or overlong field labels', () => {
    expect(check([])).toContain(copy.errors.empty);
    expect(check([{ ...field, label: ' ' }])).toContain(copy.errors.label);
    expect(check([{ ...field, label: 'x'.repeat(61) }])).toContain(copy.errors.label);
    expect(check(Array.from({ length: 51 }, (_, index) => ({ ...field, id: `f-${index}` })))).toContain(copy.errors.count);
  });
  it('preserves editable labels and ignores retained choices for non-choice types', () => {
    expect(check([{ ...field, label: 'Preferred window', type: 'date', options: [] }])).toEqual([]);
    expect(check([field])).toEqual([]);
  });
  it('allows compatible lead-field formats and rejects incompatible contact formats', () => {
    expect(check([{ ...field, key: 'service' }])).toEqual([]);
    expect(check([{ ...field, key: 'name', type: 'long_text' }])).toEqual([]);
    expect(check([{ ...field, key: 'email', type: 'date' }])).toContain(copy.errors.type);
  });
});

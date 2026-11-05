import { captureFormFieldEditorData as copy } from './capture-form-field-editor.data';

export type CaptureCustomFieldType = 'short_text' | 'long_text' | 'dropdown' | 'checkboxes' | 'date';
export type CaptureStandardField = keyof typeof copy.standards;
export type CaptureFormField = {
  id: string;
  key: CaptureStandardField | 'custom';
  label: string;
  type: keyof typeof copy.types;
  required: boolean;
  /** Choice identities survive label changes; unused choices are retained in the draft on type changes. */
  options: readonly { id: string; label: string }[];
};
export type CaptureFormFieldEditorValue = { fields: readonly CaptureFormField[]; contactRequired: boolean };
export type CaptureFieldIssue = { fieldId?: string; optionId?: string; message: string };
export const customCaptureFieldTypes: readonly CaptureCustomFieldType[] = ['short_text', 'long_text', 'dropdown', 'checkboxes', 'date'];
export const standardCaptureFieldTypes: Record<CaptureStandardField, CaptureFormField['type']> = { name: 'short_text', email: 'email', phone: 'phone', service: 'short_text', details: 'long_text', address: 'address' };
export const captureFieldTypesForKey: Record<CaptureFormField['key'], readonly CaptureFormField['type'][]> = {
  custom: customCaptureFieldTypes,
  name: ['short_text', 'long_text'], email: ['email'], phone: ['phone'],
  service: ['short_text', 'dropdown'], details: ['long_text', 'short_text'], address: ['address', 'short_text', 'long_text'],
};
export const isChoiceField = (field: CaptureFormField) => field.type === 'dropdown' || field.type === 'checkboxes';

/** Draft configuration checks only; authoritative contracts and submission validation belong to integration. */
export function validateCaptureFormFields(value: CaptureFormFieldEditorValue): CaptureFieldIssue[] {
  const issues: CaptureFieldIssue[] = [];
  if (!value.fields.length) issues.push({ message: copy.errors.empty });
  if (value.fields.length > 50) issues.push({ message: copy.errors.count });
  if (value.contactRequired && !value.fields.some(field => field.key === 'email' || field.key === 'phone')) issues.push({ message: copy.errors.contact });
  const ids = new Set<string>(), standards = new Set<string>();
  for (const field of value.fields) {
    const add = (message: string, optionId?: string) => issues.push({ fieldId: field.id, optionId, message });
    if (!field.id || ids.has(field.id)) add(copy.errors.duplicateField);
    ids.add(field.id);
    if (field.key !== 'custom') {
      if (standards.has(field.key)) add(copy.errors.duplicateStandard);
      standards.add(field.key);
    }
    if (!field.label.trim() || field.label.length > 60) add(copy.errors.label);
    if (!captureFieldTypesForKey[field.key].includes(field.type)) add(copy.errors.type);
    if (!isChoiceField(field)) continue;
    if (field.options.length < 2 || field.options.length > 50) add(copy.errors.optionCount);
    const options = new Set<string>(), labels = new Set<string>();
    for (const option of field.options) {
      if (!option.id || options.has(option.id)) add(copy.errors.optionIdentity, option.id);
      options.add(option.id);
      const label = option.label.trim().toLocaleLowerCase('en-US');
      if (!label || option.label.length > 60) add(copy.errors.optionLabel, option.id);
      if (labels.has(label)) add(copy.errors.duplicateOption, option.id);
      labels.add(label);
    }
  }
  return issues;
}

import { describe, expect, it } from 'vitest';
import { isVisitorDefinitionValid, normalizeVisitorCapture, validateVisitorCapture, type VisitorCaptureDefinition, type VisitorCaptureValues } from './visitor-capture-form.validation';
import { visitorCaptureFormData as copy } from './visitor-capture-form.data';

const definition: VisitorCaptureDefinition = { id: 'form', version: 1, title: 'Request service', businessName: 'Example', contactRequired: true, fields: [
  { id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] },
  { id: 'email', key: 'email', type: 'email', label: 'Email', required: false, options: [] },
  { id: 'phone', key: 'phone', type: 'phone', label: 'Phone', required: false, options: [] },
] };
const value: VisitorCaptureValues = { answers: { name: 'Jordan', email: 'jordan@example.com' }, consent: false, website: '' };
describe('visitor capture validation', () => {
  it('requires visible mandatory fields and either contact method', () => {
    const result = validateVisitorCapture(definition, { ...value, answers: {} });
    expect(result.fields).toEqual({ name: copy.required, email: copy.contact, phone: copy.contact });
    expect(validateVisitorCapture(definition, { ...value, answers: { name: 'Jordan', phone: '2125550123' } }).fields).toEqual({});
  });
  it('rejects malformed provided email even when another contact is present', () => {
    expect(validateVisitorCapture(definition, { ...value, answers: { ...value.answers, email: 'invalid', phone: '2125550123' } }).fields.email).toBe(copy.email);
  });
  it('rejects unknown or duplicate choice IDs and wrong answer shapes', () => {
    const choice: VisitorCaptureDefinition = { ...definition, fields: [...definition.fields, { id: 'choice', key: 'custom', type: 'checkboxes', label: 'Choice', required: true, options: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }] }] };
    for (const answer of [['unknown'], ['a', 'a'], 'a']) expect(validateVisitorCapture(choice, { ...value, answers: { ...value.answers, choice: answer } }).fields.choice).toBe(copy.choice);
  });
  it('validates calendar dates rather than accepting normalized overflow dates', () => {
    const date: VisitorCaptureDefinition = { ...definition, fields: [...definition.fields, { id: 'date', key: 'custom', type: 'date', label: 'Date', required: true, options: [] }] };
    expect(validateVisitorCapture(date, { ...value, answers: { ...value.answers, date: '2026-02-30' } }).fields.date).toBe(copy.date);
    expect(validateVisitorCapture(date, { ...value, answers: { ...value.answers, date: '2028-02-29' } }).fields.date).toBeUndefined();
  });
  it('binds consent to its configured version and requires an affirmative choice only when required', () => {
    const consent = { ...definition, consent: { id: 'consent', version: 2, label: 'Contact me', required: true } };
    expect(validateVisitorCapture(consent, value).consent).toBe(copy.consent);
    expect(normalizeVisitorCapture(consent, { ...value, consent: true }).consent).toEqual({ id: 'consent', version: 2, accepted: true });
    expect(validateVisitorCapture({ ...consent, consent: { ...consent.consent, required: false } }, value).consent).toBeUndefined();
  });
  it('normalizes only configured answers and preserves the honeypot for server checks', () => {
    const payload = normalizeVisitorCapture(definition, { ...value, website: 'bot-filled', answers: { name: ' Jordan ', email: ' JORDAN@EXAMPLE.COM ', unknown: 'omit' } });
    expect(payload.answers).toEqual({ name: 'Jordan', email: 'jordan@example.com', phone: '' });
    expect(payload.website).toBe('bot-filled'); expect(payload.definitionVersion).toBe(1);
  });
  it('rejects unsafe privacy links and inconsistent published configurations', () => {
    expect(isVisitorDefinitionValid(definition)).toBe(true);
    expect(isVisitorDefinitionValid({ ...definition, fields: [] })).toBe(false);
    expect(isVisitorDefinitionValid({ ...definition, privacy: { label: 'Privacy', href: 'javascript:alert(1)' } })).toBe(false);
    expect(isVisitorDefinitionValid({ ...definition, privacy: { label: 'Privacy', href: 'https://example.com/privacy' } })).toBe(true);
  });
});

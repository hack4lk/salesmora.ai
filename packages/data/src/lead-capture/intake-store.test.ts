import { describe, expect, it } from 'vitest';
import type { CaptureDraftConfiguration } from '@salesmora/contracts';
import { intakeLeadValues, normalizeIntakeAnswers } from './intake-store';
const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'gmail', fields: [
  { id: 'person', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] },
  { id: 'contact', key: 'email', label: 'Email', type: 'email', required: false, options: [] },
  { id: 'work', key: 'service', label: 'Service', type: 'dropdown', required: true, options: [{ id: 'repair', label: 'Repair' }] },
  { id: 'extra', key: 'custom', label: 'Extras', type: 'checkboxes', required: false, options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] },
] };
describe('Intake review answer boundary', () => {
  it('maps configured field keys and choice labels without treating custom data as CRM fields', () => {
    expect(intakeLeadValues(configuration, { person: '  Alex  ', contact: 'ALEX@example.com', work: 'repair', extra: ['a'] })).toEqual({ name: 'Alex', email: 'alex@example.com', service: 'Repair', phone: '', address: '', details: '' });
  });
  it('normalizes absent values and checkbox order to the same final review payload', () => {
    expect(normalizeIntakeAnswers(configuration, { person: ' Alex ', contact: 'ALEX@example.com', extra: ['b', 'a'] })).toEqual({ person: 'Alex', contact: 'alex@example.com', work: '', extra: ['a', 'b'] });
  });
  it('rejects unknown fields, wrong field shapes and unknown checkbox choices', () => {
    for (const answers of [{ injected: 'x' }, { person: ['x'] }, { extra: 'a' }, { extra: ['invented'] }] as Record<string, string | string[]>[]) expect(() => normalizeIntakeAnswers(configuration, answers)).toThrow();
  });
});

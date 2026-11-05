import { describe, expect, it } from 'vitest';
import { matchesGmailCaptureRules as matches, validateGmailCaptureRules as validate, type GmailCaptureRulesValue } from './gmail-capture-rules.validation';
const value: GmailCaptureRulesValue = { location: 'both', mode: 'all', phrases: [{ id: 'quote', text: 'request a quote' }, { id: 'service', text: 'water heater' }] };
describe('Gmail capture phrase matching', () => {
  it('matches all phrases across subject/body without case sensitivity', () => {
    expect(matches(value, { subject: 'REQUEST A QUOTE', body: 'A new Water Heater please' })).toBe(true);
    expect(matches(value, { subject: 'request a quote', body: 'kitchen sink' })).toBe(false);
  });
  it('limits matching to the configured location', () => {
    const message = { subject: 'request a quote', body: 'water heater' };
    expect(matches({ ...value, location: 'subject' }, message)).toBe(false);
    expect(matches({ ...value, location: 'body' }, message)).toBe(false);
  });
  it('supports OR independently of phrase order', () => {
    expect(matches({ ...value, mode: 'any' }, { subject: 'water heater', body: '' })).toBe(true);
    expect(matches({ ...value, mode: 'any' }, { subject: 'kitchen sink', body: '' })).toBe(false);
  });
  it('treats punctuation as literal text, trims outer spaces and retains internal spaces', () => {
    const rule: GmailCaptureRulesValue = { ...value, phrases: [{ id: 'literal', text: '  quote (urgent).*  ' }] };
    expect(matches(rule, { subject: 'QUOTE (URGENT).*', body: '' })).toBe(true);
    expect(matches(rule, { subject: 'quote urgent now', body: '' })).toBe(false);
    expect(matches({ ...value, phrases: [{ id: 'space', text: 'water  heater' }] }, { subject: 'water heater', body: '' })).toBe(false);
  });
  it('never joins subject/body into a phrase that is not present in either', () => {
    expect(matches({ ...value, phrases: [{ id: 'boundary', text: 'water heater' }] }, { subject: 'water', body: 'heater' })).toBe(false);
  });
  it('rejects empty, duplicate, oversized and excessive phrase configurations', () => {
    for (const phrases of [[], [{ id: 'blank', text: '   ' }], [{ id: 'long', text: 'x'.repeat(201) }], [{ id: 'a', text: 'Quote' }, { id: 'b', text: ' quote ' }], Array.from({ length: 21 }, (_, index) => ({ id: String(index), text: String(index) }))]) {
      expect(validate({ ...value, phrases }).length).toBeGreaterThan(0);
      expect(matches({ ...value, phrases }, { subject: 'request a quote water heater', body: '' })).toBe(false);
    }
  });
  it('rejects missing/duplicate identities and unsupported choices', () => {
    expect(validate({ ...value, phrases: [{ id: '', text: 'quote' }] }).length).toBeGreaterThan(0);
    expect(validate({ ...value, phrases: [{ id: 'same', text: 'quote' }, { id: 'same', text: 'service' }] }).length).toBeGreaterThan(0);
    expect(matches({ ...value, location: 'sender' as GmailCaptureRulesValue['location'] }, { subject: '', body: '' })).toBe(false);
    expect(validate({ ...value, mode: 'regex' as GmailCaptureRulesValue['mode'] }).length).toBeGreaterThan(0);
  });
});

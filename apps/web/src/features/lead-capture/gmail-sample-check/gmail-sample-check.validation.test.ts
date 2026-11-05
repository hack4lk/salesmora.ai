import { describe, expect, it } from 'vitest';
import { checkGmailSample as check } from './gmail-sample-check.validation';
import type { GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
const rules: GmailCaptureRulesValue = { mode: 'all', location: 'both', phrases: [{ id: 'quote', text: 'quote' }, { id: 'service', text: 'water heater' }] };
describe('Gmail sample check evidence', () => {
  it('finds literal phrases separately in subject, body or both, ignoring case', () => {
    expect(check(rules, { subject: 'QUOTE', body: 'Quote for a Water Heater' })).toEqual({ status: 'matches', phrases: [{ ...rules.phrases[0], location: 'both' }, { ...rules.phrases[1], location: 'body' }] });
  });
  it('respects the configured search location in both evidence and the result', () => {
    expect(check({ ...rules, location: 'subject' }, { subject: 'quote', body: 'water heater' })).toEqual({ status: 'noMatch', phrases: [{ ...rules.phrases[0], location: 'subject' }, { ...rules.phrases[1], location: 'none' }] });
  });
  it('shows missing phrases even when any-phrase matching succeeds', () => {
    const sample = { subject: 'quote', body: '' };
    expect(check(rules, sample).status).toBe('noMatch');
    expect(check({ ...rules, mode: 'any' }, sample)).toMatchObject({ status: 'matches', phrases: [{ location: 'subject' }, { location: 'none' }] });
  });
  it('never reports a ready result for absent samples or invalid rules', () => {
    expect(check(rules, null)).toEqual({ status: 'missing', phrases: [] });
    expect(check({ ...rules, phrases: [] }, { subject: 'quote', body: '' })).toEqual({ status: 'invalid', phrases: [] });
  });
  it('recomputes after sample or rule changes instead of retaining an old pass', () => {
    const sample = { subject: 'quote', body: 'water heater' };
    expect(check(rules, sample).status).toBe('matches');
    expect(check(rules, { ...sample, body: 'plumbing' }).status).toBe('noMatch');
    expect(check({ ...rules, location: 'subject' }, sample).status).toBe('noMatch');
    expect(check({ ...rules, phrases: [{ id: 'split', text: 'quote water' }] }, sample).status).toBe('noMatch');
  });
});

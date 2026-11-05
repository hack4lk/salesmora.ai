import { describe, expect, it } from 'vitest';
import { validateGmailEmailExample as validate } from './gmail-email-example.validation';
describe('Gmail example validation', () => {
  it('allows an optional subject with a nonempty body', () => { expect(validate({ subject: '', body: 'Name: Alex' })).toEqual({}); });
  it('rejects missing or whitespace-only bodies', () => { expect(validate({ subject: 'Inquiry', body: ' \n\t ' }).body).toBeDefined(); });
  it('accepts the exact subject/body limits', () => { expect(validate({ subject: 'x'.repeat(500), body: 'x'.repeat(20000) })).toEqual({}); });
  it('rejects oversize text without rewriting it', () => {
    const value = { subject: 'x'.repeat(501), body: 'x'.repeat(20001) };
    expect(validate(value).subject).toBeDefined(); expect(validate(value).body).toBeDefined(); expect(value.body).toHaveLength(20001);
  });
});

import { describe, expect, it } from 'vitest';
import { renderEmailVerificationEmail } from './email-verification';
import { emailVerificationEmailData as verificationCopy } from './email-verification.data';
import { renderPasswordResetEmail } from './password-reset';
import { passwordResetEmailData as resetCopy } from './password-reset.data';
import { renderTeamInvitationEmail } from './team-invitation';

// Both the customer app and the admin console send these emails, so they render from @salesmora/data.
describe('account emails', () => {
  it('invitation escapes customer-entered names and keeps the subject on one line', () => {
    const email = renderTeamInvitationEmail({ url: 'https://app.example.com/accept-invitation?token=abc', inviterName: '<Ana>', workspaceName: 'North\r\nstar & Co', role: 'office' });
    expect(email.subject).toBe('Join North star & Co on SalesMora.ai');
    expect(email.html).toContain('&lt;Ana&gt;');
    expect(email.html).not.toContain('<Ana>');
    expect(email.text).toContain('https://app.example.com/accept-invitation?token=abc');
  });

  it('invitation and verification refuse non-HTTP links', () => {
    expect(() => renderTeamInvitationEmail({ url: 'javascript:alert(1)', inviterName: 'Ana', workspaceName: 'North', role: 'field' })).toThrow();
    expect(() => renderEmailVerificationEmail('javascript:alert(1)')).toThrow();
  });

  it('verification and password reset include the link', () => {
    const verification = renderEmailVerificationEmail('https://app.example.com/verify?token=v');
    expect(verification.subject).toBe(verificationCopy.subject);
    expect(verification.text).toContain('https://app.example.com/verify?token=v');
    const reset = renderPasswordResetEmail('https://app.example.com/reset?token=r');
    expect(reset.subject).toBe(resetCopy.subject);
    expect(reset.text).toContain('https://app.example.com/reset?token=r');
  });
});

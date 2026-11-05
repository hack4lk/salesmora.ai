import { createHash, randomBytes } from 'node:crypto';

/** Invitation links stay valid for seven days after each send. */
export const invitationLifetimeMs = 7 * 86_400_000;
/** Statuses that still hold a seat and can be sent (again) or revoked. */
export const openInvitationStatuses = ['pending_verification', 'queued', 'sent'] as const;

export const invitationTokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

/** Only the hash is stored; the raw token exists in the email link alone. */
export function newInvitationToken() {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: invitationTokenHash(token) };
}

export function invitationURL(appURL: string, token: string) {
  const url = new URL('/accept-invitation', appURL);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('The app URL must use HTTP or HTTPS.');
  url.searchParams.set('token', token);
  return url.href;
}

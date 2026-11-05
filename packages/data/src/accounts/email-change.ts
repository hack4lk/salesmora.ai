import { adminEmailChangeTokenHash } from '../admin-email-change-signature';
import type { Knex } from 'knex';

export class EmailChangeCompletionError extends Error {
  constructor(message: string, readonly status: 400 | 409 | 410) {
    super(message);
  }
}

export async function completeAdminEmailChange(db: Knex, token: string) {
  if (!/^[\w-]{43}$/.test(token)) {
    throw new EmailChangeCompletionError('This email-change link is invalid or no longer active.', 400);
  }
  const { rows } = await db.raw<{
    rows: { result: string; user_id: string | null; sessions_revoked: number }[];
  }>('SELECT * FROM public.complete_admin_user_email_change(?)', [adminEmailChangeTokenHash(token)]);
  const completion = rows[0];
  if (!completion) throw new Error('Email-change completion returned no result.');
  if (completion.result === 'completed' && completion.user_id && Number.isInteger(completion.sessions_revoked)) {
    return { completed: true as const, sessionsRevoked: completion.sessions_revoked };
  }
  if (completion.result === 'expired') {
    throw new EmailChangeCompletionError('This email-change link has expired. Ask an administrator to send a new one.', 410);
  }
  if (completion.result === 'email_taken') {
    throw new EmailChangeCompletionError('That email address is no longer available. Ask an administrator to review the request.', 409);
  }
  if (completion.result === 'ineligible') {
    throw new EmailChangeCompletionError('This account can no longer use the email-change link.', 409);
  }
  if (completion.result === 'invalid') {
    throw new EmailChangeCompletionError('This email-change link is invalid or has already been used.', 409);
  }
  throw new Error('Email-change completion returned an unsupported result.');
}

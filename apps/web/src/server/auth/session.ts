import 'server-only';
import { headers } from 'next/headers';
import { database } from '../workspaces/store';
import { auth } from './auth';

export async function getAuthenticatedSession() {
  return auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true, disableRefresh: true } });
}
export async function getSession() {
  const session = await getAuthenticatedSession();
  if (!session || !await database()('users').where({ id: session.user.id }).whereNull('deletionRequestedAt').whereNull('suspendedAt').first('id')) return null;
  return session;
}

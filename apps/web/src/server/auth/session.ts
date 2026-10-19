import 'server-only';
import { headers } from 'next/headers';
import { database } from '../workspaces/store';
import { auth } from './auth';

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true, disableRefresh: true } });
  if (!session || !await database()('users').where({ id: session.user.id }).whereNull('deletionRequestedAt').first('id')) return null;
  return session;
}

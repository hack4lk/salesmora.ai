import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { verifyPassword } from 'better-auth/crypto';
import { accountDeletionRequestSchema } from '@salesmora/contracts';
import { requestAccountDeletion, AccountDeletionError, AuthorizationAccessError } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
const reply = (body: unknown, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return reply({ error: 'Invalid origin.' }, 403);
  const session = await getSession();
  if (!session) return reply({ error: 'Sign in to continue.' }, 401);
  const text = await request.text();
  if (text.length > 2000) return reply({ error: 'Request too large.' }, 413);
  let body;
  try { body = accountDeletionRequestSchema.parse(JSON.parse(text)); }
  catch { return reply({ error: 'Check the deletion confirmation.' }, 400); }
  try {
    const db = database(), now = Date.now();
    const rate = await db('rateLimits').insert({ id: randomUUID(), key: `account-delete:${session.user.id}`, count: 1, lastRequest: now }).onConflict('key').merge({ count: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count+1 END', [now - 60000]), lastRequest: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END', [now - 60000, now]) }).returning('count');
    if (Number(rate[0].count) > 5) return reply({ error: 'Too many attempts. Try again in a minute.' }, 429);
    await requestAccountDeletion(db, session.user.id, body.workspaceId, body.confirmation, hash => verifyPassword({ hash, password: body.password }));
    return reply({ accepted: true }, 202);
  } catch (error) {
    return reply({ error: error instanceof AccountDeletionError ? error.message : error instanceof AuthorizationAccessError ? 'Account deletion access denied.' : 'Deletion could not be started. Try again.' }, error instanceof AuthorizationAccessError ? 403 : 409);
  }
}

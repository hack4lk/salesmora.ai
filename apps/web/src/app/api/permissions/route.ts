import { NextResponse } from 'next/server';
import { policyChangeSchema } from '@salesmora/contracts';
import { validateWorkspacePolicy } from '@salesmora/domain';
import { AuthorizationAccessError, AuthorizationConflictError } from '@salesmora/data';
import { getSession } from '../../../server/auth/session';
import { permissionAuthenticationWindowMs, readPermissions, savePermissions } from '../../../server/authorization/policy-editor';

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return reply({ error: 'Sign in to view permissions.' }, 401);
  const workspaceId = new URL(request.url).searchParams.get('workspace');
  if (!workspaceId || !identifier.test(workspaceId)) return reply({ error: 'Invalid workspace.' }, 400);
  try { return reply({ policy: await readPermissions(session.user.id, workspaceId) }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return reply({ error: 'Permissions are unavailable.' }, 403);
    return reply({ error: 'Permissions could not be loaded.' }, 500);
  }
}

export async function POST(request: Request) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return reply({ error: 'Invalid origin.' }, 403);
  const session = await getSession();
  if (!session) return reply({ error: 'Sign in to change permissions.' }, 401);
  let body: unknown;
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 64000) return reply({ error: 'Request is too large.' }, 413);
    const text = await request.text();
    if (text.length > 64000) return reply({ error: 'Request is too large.' }, 413);
    body = JSON.parse(text);
  } catch { return reply({ error: 'Invalid permission change.' }, 400); }
  const parsed = policyChangeSchema.safeParse(body);
  if (!parsed.success || !identifier.test(parsed.data.policy.workspaceId)) return reply({ error: 'Invalid permission change.' }, 422);
  try {
    // Check current authority before revealing validation or freshness outcomes.
    await readPermissions(session.user.id, parsed.data.policy.workspaceId);
    const age = Date.now() - new Date(session.session.createdAt).getTime();
    if (!Number.isFinite(age) || age < 0 || age >= permissionAuthenticationWindowMs) return reply({ error: 'Confirm your identity before saving.', reason: 'reauthentication' }, 428);
    if (!validateWorkspacePolicy(parsed.data.policy).ok) return reply({ error: 'Invalid permission dependencies or protected permissions.' }, 422);
    return reply({ policy: await savePermissions(session.user.id, parsed.data) });
  } catch (error) {
    if (error instanceof AuthorizationConflictError) return reply({ error: 'Permissions changed elsewhere.', reason: 'conflict' }, 409);
    if (error instanceof AuthorizationAccessError) return reply({ error: 'This permission change is unavailable.' }, 403);
    return reply({ error: 'Permissions could not be saved.' }, 500);
  }
}

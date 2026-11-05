import { adminRolloutFlagMutationSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { getAdminSession } from '../../../../server/get-admin-session';
import { adminFeatureFlags, AdminFeatureFlagsError } from '../../../../server/admin-feature-flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

async function identity(request: NextRequest) {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminFeatureFlagsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function mutation(request: NextRequest) {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new AdminFeatureFlagsError('Invalid request origin.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new AdminFeatureFlagsError('Use a JSON request.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AdminFeatureFlagsError('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        throw new AdminFeatureFlagsError('The rollout flag request is too large.', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AdminFeatureFlagsError('Invalid JSON request.'); }
  const parsed = adminRolloutFlagMutationSchema.safeParse(body);
  if (!parsed.success) throw new AdminFeatureFlagsError('Invalid rollout flag request.');
  return parsed.data;
}

async function handle(request: NextRequest, write: boolean) {
  try {
    const actor = await identity(request);
    if (request.nextUrl.searchParams.size) throw new AdminFeatureFlagsError('Rollout flags do not accept query parameters.');
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    const response = write
      ? await adminFeatureFlags.mutateRollout(actor, await mutation(request), context)
      : await adminFeatureFlags.readRollouts(actor, context);
    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminFeatureFlagsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin rollout flag request failed.');
    return NextResponse.json({ error: 'Rollout flags are unavailable. Refresh before trying again.' }, {
      status: 503, headers: responseHeaders,
    });
  }
}

export async function GET(request: NextRequest) { return handle(request, false); }
export async function POST(request: NextRequest) { return handle(request, true); }

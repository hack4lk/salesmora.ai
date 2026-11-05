import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import {
  adminFeatureFlagOperationSchema,
} from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { getAdminSession } from '../../../../server/get-admin-session';
import {
  adminFeatureFlags,
  AdminFeatureFlagsError,
  type AdminFeatureFlagsIdentity,
} from '../../../../server/admin-feature-flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};
const maxBodyBytes = 16_384;

function isAuthenticationResponseJSON(value: unknown): value is AuthenticationResponseJSON {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const response = record.response;
  const extensions = record.clientExtensionResults;
  if (!response || typeof response !== 'object' || Array.isArray(response) ||
    !extensions || typeof extensions !== 'object' || Array.isArray(extensions)) return false;
  const payload = response as Record<string, unknown>;
  return typeof record.id === 'string' &&
    typeof record.rawId === 'string' &&
    record.type === 'public-key' &&
    typeof payload.clientDataJSON === 'string' &&
    typeof payload.authenticatorData === 'string' &&
    typeof payload.signature === 'string' &&
    (payload.userHandle === null || typeof payload.userHandle === 'string');
}

async function identity(request: NextRequest): Promise<AdminFeatureFlagsIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminFeatureFlagsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function operation(request: NextRequest) {
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
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new AdminFeatureFlagsError('The feature flag request is too large.', 413);
    }
    chunks.push(value);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AdminFeatureFlagsError('Invalid JSON request.'); }
  const parsed = adminFeatureFlagOperationSchema.safeParse(value);
  if (!parsed.success) throw new AdminFeatureFlagsError('Invalid feature flag operation.');
  return parsed.data;
}

export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.size) throw new AdminFeatureFlagsError('Feature flag settings do not accept query parameters.');
    const actor = await identity(request);
    const response = await adminFeatureFlags.read(actor, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminFeatureFlagsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin feature flag read failed.');
    return NextResponse.json({ error: 'Feature flag settings are unavailable.' }, { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await identity(request);
    const input = await operation(request);
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (input.operation === 'start') {
      return NextResponse.json(await adminFeatureFlags.start(actor, input, context), { headers: responseHeaders });
    }
    if (input.operation === 'factor') {
      if (input.method === 'totp' && input.code) {
        return NextResponse.json(await adminFeatureFlags.verifyFactor(actor, input.token, {
          method: 'totp',
          code: input.code,
        }, context), { headers: responseHeaders });
      }
      if (input.method === 'passkey' && input.response && isAuthenticationResponseJSON(input.response)) {
        return NextResponse.json(await adminFeatureFlags.verifyFactor(actor, input.token, {
          method: 'passkey',
          response: input.response,
        }, context), { headers: responseHeaders });
      }
      throw new AdminFeatureFlagsError('The selected second factor is incomplete.', 400);
    }
    return NextResponse.json(await adminFeatureFlags.commit(actor, input.token, context), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminFeatureFlagsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin feature flag update failed.');
    return NextResponse.json({ error: 'The feature flag could not be changed. Refresh and try again.' },
      { status: 503, headers: responseHeaders });
  }
}

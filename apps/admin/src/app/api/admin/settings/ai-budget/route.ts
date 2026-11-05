import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { adminPlatformSettingsOperationSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../../server/auth-config';
import { getAdminSession } from '../../../../../server/get-admin-session';
import {
  adminPlatformSettings,
  AdminPlatformSettingsError,
  type AdminPlatformSettingsIdentity,
} from '../../../../../server/admin-platform-settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};
const maxBodyBytes = 16_384;

async function identity(request: NextRequest): Promise<AdminPlatformSettingsIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminPlatformSettingsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function operation(request: NextRequest) {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new AdminPlatformSettingsError('Invalid request origin.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new AdminPlatformSettingsError('Use a JSON request.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AdminPlatformSettingsError('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new AdminPlatformSettingsError('The platform setting request is too large.', 413);
    }
    chunks.push(value);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AdminPlatformSettingsError('Invalid JSON request.'); }
  const parsed = adminPlatformSettingsOperationSchema.safeParse(value);
  if (!parsed.success) throw new AdminPlatformSettingsError('Invalid platform setting operation.');
  return parsed.data;
}

export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.size) throw new AdminPlatformSettingsError('AI budget settings do not accept query parameters.');
    const actor = await identity(request);
    const response = await adminPlatformSettings.read(actor, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminPlatformSettingsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin platform settings read failed.');
    return NextResponse.json({ error: 'Platform AI budget settings are unavailable.' }, { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await identity(request);
    const input = await operation(request);
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (input.operation === 'start') {
      return NextResponse.json(await adminPlatformSettings.start(actor, input, context), { headers: responseHeaders });
    }
    if (input.operation === 'factor') {
      const factor = input.method === 'totp'
        ? { method: input.method, code: input.code }
        : { method: input.method, response: input.response satisfies AuthenticationResponseJSON };
      return NextResponse.json(await adminPlatformSettings.verifyFactor(actor, input.token, factor, context), {
        headers: responseHeaders,
      });
    }
    return NextResponse.json(await adminPlatformSettings.commit(actor, input.token, context), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminPlatformSettingsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin platform setting update failed.');
    return NextResponse.json({ error: 'The default AI budget could not be changed. Refresh settings before trying again.' },
      { status: 503, headers: responseHeaders });
  }
}

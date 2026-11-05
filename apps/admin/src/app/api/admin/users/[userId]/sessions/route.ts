import { adminCustomerUserIdSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../../../server/auth-config';
import {
  customerUserManagement,
  CustomerUserManagementError,
  type CustomerUserManagementIdentity,
} from '../../../../../../server/customer-user-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };
const maxBodyBytes = 16_384;

async function identity(request: NextRequest): Promise<CustomerUserManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new CustomerUserManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function operation(request: NextRequest): Promise<unknown> {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new CustomerUserManagementError('Invalid request origin.', 403);
  }
  if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
    throw new CustomerUserManagementError('Use a JSON request.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new CustomerUserManagementError('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new CustomerUserManagementError('The session-revocation request is too large.', 413);
    }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new CustomerUserManagementError('Invalid JSON request.'); }
}

function context(request: NextRequest) {
  return { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    if (request.nextUrl.searchParams.size) throw new CustomerUserManagementError('Session lookup does not accept query parameters.');
    const { userId } = await params;
    if (!adminCustomerUserIdSchema.safeParse(userId).success) throw new CustomerUserManagementError('Invalid customer user ID.');
    const actor = await identity(request);
    return NextResponse.json(await customerUserManagement.readSessions(actor, userId, context(request)), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof CustomerUserManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin customer sessions request failed.');
    return NextResponse.json({ error: 'Customer sessions are unavailable. Refresh the profile before trying again.' },
      { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await identity(request);
    const [{ userId }, input] = await Promise.all([params, operation(request)]);
    if (!adminCustomerUserIdSchema.safeParse(userId).success) throw new CustomerUserManagementError('Invalid customer user ID.');
    if (!input || typeof input !== 'object' || !('userId' in input) || input.userId !== userId) {
      throw new CustomerUserManagementError('The session-revocation target changed.', 400);
    }
    return NextResponse.json(await customerUserManagement.revokeSessions(actor, input, context(request)), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof CustomerUserManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin customer session-revocation request failed.');
    return NextResponse.json({ error: 'Customer sessions could not be revoked. Refresh the profile before trying again.' },
      { status: 503, headers: responseHeaders });
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { getAdminSession } from '../../../../server/get-admin-session';
import {
  customerUserManagement,
  CustomerUserManagementError,
  type CustomerUserManagementIdentity,
} from '../../../../server/customer-user-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };
const MAX_BODY_BYTES = 4096;

async function identity(request: NextRequest): Promise<CustomerUserManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new CustomerUserManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function readFilters(request: NextRequest) {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new CustomerUserManagementError('Invalid request origin.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
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
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new CustomerUserManagementError('Customer user filters are too large.', 413);
    }
    chunks.push(value);
  }
  try {
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
    return input;
  } catch {
    throw new CustomerUserManagementError('Invalid customer user filters.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await identity(request);
    const result = await customerUserManagement.readDirectory(actor, await readFilters(request), {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof CustomerUserManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin customer user directory request failed.');
    return NextResponse.json(
      { error: 'The customer user directory is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

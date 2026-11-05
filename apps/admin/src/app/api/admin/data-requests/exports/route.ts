import { adminWorkspaceExportOperationSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../../server/auth-config';
import {
  adminWorkspaceExports,
} from '../../../../../server/admin-workspace-exports';
import {
  AdminDataRequestsError,
  type AdminDataRequestsIdentity,
} from '../../../../../server/admin-data-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };
const maxBodyBytes = 16_384;

async function identity(request: NextRequest): Promise<AdminDataRequestsIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminDataRequestsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

function assertOrigin(request: NextRequest) {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new AdminDataRequestsError('Invalid request origin.', 403);
  }
}

async function operation(request: NextRequest) {
  if (request.nextUrl.searchParams.size) {
    throw new AdminDataRequestsError('Workspace export operations do not accept query parameters.');
  }
  assertOrigin(request);
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new AdminDataRequestsError('Use a JSON request.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AdminDataRequestsError('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new AdminDataRequestsError('The workspace export request is too large.', 413);
    }
    chunks.push(value);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AdminDataRequestsError('Invalid JSON request.'); }
  const parsed = adminWorkspaceExportOperationSchema.safeParse(value);
  if (!parsed.success) throw new AdminDataRequestsError('Invalid workspace export operation.');
  return parsed.data;
}

export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.size) {
      throw new AdminDataRequestsError('Export verification methods do not accept query parameters.');
    }
    const actor = await identity(request);
    const methods = await adminWorkspaceExports.methods(actor, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(methods, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminDataRequestsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace export verification-method request failed.');
    return NextResponse.json({ error: 'Workspace export step-up is unavailable.' }, { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await identity(request);
    const input = await operation(request);
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (input.operation === 'start') {
      return NextResponse.json(await adminWorkspaceExports.start(actor, input, context), { headers: responseHeaders });
    }
    if (input.operation === 'factor') {
      return NextResponse.json(await adminWorkspaceExports.verifyFactor(actor, input, context), { headers: responseHeaders });
    }
    return NextResponse.json(await adminWorkspaceExports.commit(actor, input, context), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminDataRequestsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace export request failed.');
    return NextResponse.json(
      { error: 'Workspace export could not be queued. Refresh before retrying an uncertain request.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

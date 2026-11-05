import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../server/get-admin-session';
import { adminOperations, AdminOperationsError, type AdminOperationsIdentity } from '../../../../server/admin-operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };

async function identity(request: NextRequest): Promise<AdminOperationsIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminOperationsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

export async function GET(request: NextRequest) {
  try {
    const actor = await identity(request);
    const response = await adminOperations.read(actor, request.headers.get('user-agent')?.slice(0, 2048) ?? null);
    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminOperationsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    const errorCode = typeof error === 'object' && error !== null && 'code' in error &&
      typeof error.code === 'string' ? error.code : undefined;
    console.error(JSON.stringify({
      event: 'admin.operations.health_failed',
      errorName: error instanceof Error ? error.name : 'unknown',
      ...(errorCode ? { errorCode } : {}),
    }));
    return NextResponse.json({ error: 'Operations reporting is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders });
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../server/get-admin-session';
import { adminAIUsage, AdminAIUsageError, type AdminAIUsageIdentity } from '../../../../server/admin-ai-usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };

async function identity(request: NextRequest): Promise<AdminAIUsageIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminAIUsageError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    if ([...params.keys()].some(key => key !== 'period') || params.getAll('period').length > 1) {
      throw new AdminAIUsageError('Invalid AI usage filters.');
    }
    const actor = await identity(request);
    const response = await adminAIUsage.read(actor, params.get('period') ?? '30d',
      request.headers.get('user-agent')?.slice(0, 2048) ?? null);
    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminAIUsageError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin AI usage report failed.');
    return NextResponse.json({ error: 'AI usage reporting is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders });
  }
}

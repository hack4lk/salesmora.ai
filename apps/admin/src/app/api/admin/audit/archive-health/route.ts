import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../server/get-admin-session';
import { auditViewer, AuditViewerError, type AuditViewerIdentity } from '../../../../../server/audit-viewer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };

async function identity(request: NextRequest): Promise<AuditViewerIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AuditViewerError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

export async function GET(request: NextRequest) {
  try {
    const actor = await identity(request);
    if (request.nextUrl.searchParams.size) throw new AuditViewerError('Archive health does not accept query parameters.');
    const report = await auditViewer.archiveHealth(actor, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(report, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AuditViewerError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin audit archive health request failed.');
    return NextResponse.json(
      { error: 'Recorded archive health is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

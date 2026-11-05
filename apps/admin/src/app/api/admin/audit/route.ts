import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { auditViewer, AuditViewerError, type AuditViewerIdentity } from '../../../../server/audit-viewer';

export const runtime = 'nodejs';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };

async function identity(request: NextRequest): Promise<AuditViewerIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AuditViewerError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function handle(request: NextRequest, verify: boolean) {
  try {
    if (verify && request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
      throw new AuditViewerError('Invalid request origin.', 403);
    }
    const actor = await identity(request);
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (verify) {
      // Verification has no caller-controlled scope or payload.
      if (request.body) {
        const reader = request.body.getReader();
        const { done } = await reader.read();
        if (!done) { await reader.cancel(); throw new AuditViewerError('Audit verification does not accept a request body.'); }
      }
      return NextResponse.json(await auditViewer.verify(actor, context), { headers: responseHeaders });
    }
    const params = request.nextUrl.searchParams;
    const allowed = ['query', 'actor', 'category', 'range', 'page', 'asOf', 'throughSequence'];
    if ([...params.keys()].some(key => !allowed.includes(key) || params.getAll(key).length !== 1)) {
      throw new AuditViewerError('Invalid audit filters.');
    }
    const input: Record<string, unknown> = Object.fromEntries(params);
    if (params.has('page')) {
      const page = params.get('page')!;
      if (!/^(0|[1-9]\d{0,6})$/.test(page)) throw new AuditViewerError('Invalid audit page.');
      input.page = Number(page);
    }
    return NextResponse.json(await auditViewer.read(actor, input, context), { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AuditViewerError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin audit request failed.');
    return NextResponse.json({ error: 'The audit store is unavailable. Retry before relying on these results.' }, { status: 503, headers: responseHeaders });
  }
}

export const GET = (request: NextRequest) => handle(request, false);
export const POST = (request: NextRequest) => handle(request, true);

import { auditExportOperationSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { getAdminSession } from '../../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../../server/auth-config';
import { auditViewer, AuditViewerError } from '../../../../../server/audit-viewer';

export const runtime = 'nodejs';
const headers = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };

async function handle(request: NextRequest, mutate: boolean) {
  try {
    if (mutate && request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) throw new AuditViewerError('Invalid request origin.', 403);
    if (request.nextUrl.searchParams.size) throw new AuditViewerError('Export does not accept URL parameters.');
    const session = await getAdminSession(request.headers);
    const email = request.headers.get('x-admin-access-email');
    if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) throw new AuditViewerError('Sign in with your verified staff identity.', 401);
    const identity = { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (!mutate) return NextResponse.json(await auditViewer.exportMethods(identity, context), { headers });
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AuditViewerError('Use a JSON request.', 415);
    const reader = request.body?.getReader();
    if (!reader) throw new AuditViewerError('Missing request body.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) { await reader.cancel(); throw new AuditViewerError('Request is too large.', 413); }
      chunks.push(value);
    }
    let value: unknown;
    try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw new AuditViewerError('Invalid JSON request.'); }
    const parsed = auditExportOperationSchema.safeParse(value);
    if (!parsed.success) throw new AuditViewerError('Invalid audit export operation.');
    const input = parsed.data;
    if (input.operation === 'start') return NextResponse.json(await auditViewer.startExport(identity, input.input, input.password, context), { headers });
    if (input.operation === 'factor') {
      const factor = input.method === 'totp' ? { method: input.method, code: input.code }
        : { method: input.method, response: input.response satisfies AuthenticationResponseJSON };
      return NextResponse.json(await auditViewer.verifyExportFactor(identity, input.token, factor, context), { headers });
    }
    const result = await auditViewer.commitExport(identity, input.token, context);
    return new Response(result.csv, { headers: {
      ...headers, 'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="salesmora-admin-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
      'x-export-count': String(result.count), 'x-audit-event-id': result.eventId, 'x-export-sha256': result.checksum,
    } });
  } catch (error) {
    if (error instanceof AuditViewerError) return NextResponse.json({ error: error.message }, { status: error.status, headers });
    console.error('Admin audit export request failed.');
    return NextResponse.json({ error: 'Audit export is unavailable. No file was released. Refresh and start a new review; do not retry an uncertain download.' },
      { status: 503, headers });
  }
}
export const GET = (request: NextRequest) => handle(request, false);
export const POST = (request: NextRequest) => handle(request, true);

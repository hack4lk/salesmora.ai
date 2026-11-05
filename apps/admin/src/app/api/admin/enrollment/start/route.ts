import { NextResponse, type NextRequest } from 'next/server';
import { StaffEnrollmentError, beginStaffEnrollment } from '../../../../../server/staff-enrollment';

export const runtime = 'nodejs';

function isStartBody(value: unknown): value is {
  token: string;
  name: string;
  password: string;
  factor: 'passkey' | 'totp';
} {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return typeof body.token === 'string' && typeof body.name === 'string' &&
    typeof body.password === 'string' && (body.factor === 'passkey' || body.factor === 'totp');
}

export async function POST(request: NextRequest) {
  const accessEmail = request.headers.get('x-admin-access-email');
  if (!accessEmail) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > 16_384) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!isStartBody(body)) return NextResponse.json({ error: 'Invalid enrollment request.' }, { status: 400 });

  try {
    const result = await beginStaffEnrollment({ ...body, accessEmail });
    const response = NextResponse.json({
      email: result.email,
      factor: result.factor,
      expiresAt: result.expiresAt.toISOString(),
      ...(result.passkeyOptions ? { passkeyOptions: result.passkeyOptions } : {}),
      ...(result.totpURI ? { totpURI: result.totpURI } : {}),
    }, { headers: { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
    response.cookies.set('sm_admin.enrollment', result.enrollmentCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/admin/enrollment',
      maxAge: 600,
    });
    return response;
  } catch (error) {
    if (error instanceof StaffEnrollmentError) {
      return NextResponse.json({ error: error.message }, {
        status: error.status,
        headers: { 'cache-control': 'no-store' },
      });
    }
    throw error;
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { StaffEnrollmentError, completeStaffTotpEnrollment } from '../../../../../server/staff-enrollment';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const accessEmail = request.headers.get('x-admin-access-email');
  const enrollmentCookie = request.cookies.get('sm_admin.enrollment')?.value;
  if (!accessEmail || !enrollmentCookie) {
    return NextResponse.json({ error: 'Enrollment expired. Open your invitation link again.' }, { status: 401 });
  }
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > 4096) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || !('code' in body) || typeof body.code !== 'string') {
    return NextResponse.json({ error: 'Enter the six-digit authenticator code.' }, { status: 400 });
  }

  try {
    const result = await completeStaffTotpEnrollment({
      enrollmentCookie,
      code: body.code,
      accessEmail,
      auditContext: {
        requestId: request.headers.get('cf-ray') ?? undefined,
        ipAddress: request.headers.get('cf-connecting-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });
    const response = NextResponse.json({ completed: true, backupCodes: result.backupCodes }, {
      headers: { 'cache-control': 'no-store' },
    });
    response.cookies.set('sm_admin.enrollment', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/admin/enrollment',
      maxAge: 0,
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

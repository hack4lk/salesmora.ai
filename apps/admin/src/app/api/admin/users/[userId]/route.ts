import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../server/get-admin-session';
import {
  customerUserManagement,
  CustomerUserManagementError,
  type CustomerUserManagementIdentity,
} from '../../../../../server/customer-user-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };

async function identity(request: NextRequest): Promise<CustomerUserManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new CustomerUserManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    if (request.nextUrl.searchParams.size) throw new CustomerUserManagementError('User profiles do not accept query parameters.');
    const actor = await identity(request);
    const { userId } = await params;
    const user = await customerUserManagement.readProfile(actor, userId, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    if (!user) {
      return NextResponse.json({ error: 'Customer user not found.' }, { status: 404, headers: responseHeaders });
    }
    return NextResponse.json(user, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof CustomerUserManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin customer user profile request failed.');
    return NextResponse.json(
      { error: 'The customer user profile is unavailable. Retry before relying on these details.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

import {
  adminCustomerUserIdSchema,
  adminCustomerUserStaffActionsQuerySchema,
} from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../../../server/auth-config';
import {
  customerUserManagement,
  CustomerUserManagementError,
  type CustomerUserManagementIdentity,
} from '../../../../../../server/customer-user-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' };

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
    const origin = request.headers.get('origin');
    if ((origin && origin !== getAdminAuthConfiguration().trustedOrigin) ||
      request.headers.get('sec-fetch-site') === 'cross-site') {
      throw new CustomerUserManagementError('Invalid request origin.', 403);
    }
    const userId = (await params).userId;
    if (!adminCustomerUserIdSchema.safeParse(userId).success) throw new CustomerUserManagementError('Invalid customer user ID.');
    const values = request.nextUrl.searchParams;
    if ([...values.keys()].some(key => key !== 'cursor') || values.getAll('cursor').length > 1) {
      throw new CustomerUserManagementError('Invalid related staff-action filters.');
    }
    const query = adminCustomerUserStaffActionsQuerySchema.safeParse({ cursor: values.get('cursor') });
    if (!query.success) throw new CustomerUserManagementError('Invalid related staff-action cursor.');
    const actor = await identity(request);
    const result = await customerUserManagement.readRelatedStaffActions(actor, userId, query.data, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof CustomerUserManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin related customer staff-actions request failed.');
    return NextResponse.json({ error: 'Related staff actions are unavailable. Refresh the profile before trying again.' },
      { status: 503, headers: responseHeaders });
  }
}

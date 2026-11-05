import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../server/get-admin-session';
import {
  adminDataRequests,
  AdminDataRequestsError,
  type AdminDataRequestsIdentity,
} from '../../../../server/admin-data-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };

async function identity(request: NextRequest): Promise<AdminDataRequestsIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AdminDataRequestsError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

function readQuery(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  for (const key of params.keys()) {
    if (key !== 'filter' && key !== 'page') throw new AdminDataRequestsError('Invalid data-request filters.');
  }
  const filterValues = params.getAll('filter');
  const pageValues = params.getAll('page');
  if (filterValues.length > 1 || pageValues.length > 1) {
    throw new AdminDataRequestsError('Invalid data-request filters.');
  }
  const rawPage = pageValues[0];
  if (rawPage !== undefined && !/^(0|[1-9]\d*)$/.test(rawPage)) {
    throw new AdminDataRequestsError('Invalid data-request filters.');
  }
  return {
    ...(filterValues[0] === undefined ? {} : { filter: filterValues[0] }),
    ...(rawPage === undefined ? {} : { page: Number(rawPage) }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const actor = await identity(request);
    const result = await adminDataRequests.readDeletionQueue(actor, readQuery(request), {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof AdminDataRequestsError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin data-request queue request failed.');
    return NextResponse.json(
      { error: 'The deletion-request queue is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

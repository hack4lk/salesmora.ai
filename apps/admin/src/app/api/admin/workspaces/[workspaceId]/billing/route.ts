import { adminWorkspaceBillingRequestSchema } from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../../../server/get-admin-session';
import {
  workspaceManagement,
  WorkspaceManagementError,
  type WorkspaceManagementIdentity,
} from '../../../../../../server/workspace-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

async function identity(request: NextRequest): Promise<WorkspaceManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new WorkspaceManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    if (request.nextUrl.searchParams.size) {
      throw new WorkspaceManagementError('Workspace billing does not accept query parameters.');
    }
    const { workspaceId } = await params;
    const parsed = adminWorkspaceBillingRequestSchema.safeParse({ workspaceId });
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');

    const actor = await identity(request);
    const result = await workspaceManagement.readBilling(actor, parsed.data, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof WorkspaceManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace billing request failed.');
    return NextResponse.json(
      { error: 'Workspace billing is unavailable. Retry before relying on these details.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

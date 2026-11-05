import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import {
  adminWorkspaceDetailRequestSchema,
  adminWorkspacePlanOverrideOperationSchema,
} from '@salesmora/contracts';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../../../server/auth-config';
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
const maxBodyBytes = 16_384;

async function identity(request: NextRequest): Promise<WorkspaceManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new WorkspaceManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function operation(request: NextRequest) {
  if (request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
    throw new WorkspaceManagementError('Invalid request origin.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new WorkspaceManagementError('Use a JSON request.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new WorkspaceManagementError('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new WorkspaceManagementError('The plan-override request is too large.', 413);
    }
    chunks.push(value);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new WorkspaceManagementError('Invalid JSON request.'); }
  const parsed = adminWorkspacePlanOverrideOperationSchema.safeParse(value);
  if (!parsed.success) throw new WorkspaceManagementError('Invalid plan-override operation.');
  return parsed.data;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    if (request.nextUrl.searchParams.size) {
      throw new WorkspaceManagementError('Plan-override verification does not accept query parameters.');
    }
    const { workspaceId } = await params;
    if (!adminWorkspaceDetailRequestSchema.safeParse({ workspaceId }).success) {
      throw new WorkspaceManagementError('Invalid workspace identifier.');
    }
    const actor = await identity(request);
    const methods = await workspaceManagement.planOverrideMethods(actor, {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(methods, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof WorkspaceManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace plan-override methods request failed.');
    return NextResponse.json({ error: 'Plan-override verification is unavailable.' },
      { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const actor = await identity(request);
    const [{ workspaceId }, input] = await Promise.all([params, operation(request)]);
    const context = { userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null };
    if (input.operation === 'start') {
      if (input.workspaceId !== workspaceId) {
        throw new WorkspaceManagementError('The plan-override target changed.', 400);
      }
      return NextResponse.json(await workspaceManagement.startPlanOverride(actor, input, context), {
        headers: responseHeaders,
      });
    }
    if (input.operation === 'factor') {
      const factor = input.method === 'totp'
        ? { method: input.method, code: input.code }
        : { method: input.method, response: input.response satisfies AuthenticationResponseJSON };
      return NextResponse.json(
        await workspaceManagement.verifyPlanOverrideFactor(actor, input.token, factor, context),
        { headers: responseHeaders },
      );
    }
    return NextResponse.json(
      await workspaceManagement.commitPlanOverride(actor, input.token, context),
      { headers: responseHeaders },
    );
  } catch (error) {
    if (error instanceof WorkspaceManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace plan-override request failed.');
    return NextResponse.json(
      { error: 'Workspace plan override could not be changed. Refresh the workspace before trying again.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

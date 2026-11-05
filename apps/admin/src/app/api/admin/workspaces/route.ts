import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { getAdminSession } from '../../../../server/get-admin-session';
import {
  workspaceManagement,
  WorkspaceManagementError,
  type WorkspaceManagementIdentity,
} from '../../../../server/workspace-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };
const MAX_BODY_BYTES = 4096;

async function identity(request: NextRequest): Promise<WorkspaceManagementIdentity> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new WorkspaceManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

async function readFilters(request: NextRequest) {
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
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new WorkspaceManagementError('Workspace filters are too large.', 413);
    }
    chunks.push(value);
  }
  try {
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
    return input;
  } catch {
    throw new WorkspaceManagementError('Invalid workspace filters.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await identity(request);
    const result = await workspaceManagement.readDirectory(actor, await readFilters(request), {
      userAgent: request.headers.get('user-agent')?.slice(0, 2048) ?? null,
    });
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof WorkspaceManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Admin workspace directory request failed.');
    return NextResponse.json(
      { error: 'The workspace directory is unavailable. Retry before relying on these results.' },
      { status: 503, headers: responseHeaders },
    );
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '../../../../server/get-admin-session';
import { getAdminAuthConfiguration } from '../../../../server/auth-config';
import { staffManagement, StaffManagementError, type StaffActor } from '../../../../server/staff-management';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';

export const runtime = 'nodejs';
const responseHeaders = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };

async function identity(request: NextRequest): Promise<StaffActor> {
  const session = await getAdminSession(request.headers);
  const email = request.headers.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    throw new StaffManagementError('Sign in with your verified staff identity.', 401);
  }
  return { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
}

function isPasskey(value: unknown): value is AuthenticationResponseJSON {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  if (typeof body.id !== 'string' || typeof body.rawId !== 'string' || body.type !== 'public-key' ||
    !body.response || typeof body.response !== 'object' ||
    !body.clientExtensionResults || typeof body.clientExtensionResults !== 'object') return false;
  const response = body.response as Record<string, unknown>;
  return ['clientDataJSON', 'authenticatorData', 'signature'].every(key => typeof response[key] === 'string') &&
    (response.userHandle === undefined || typeof response.userHandle === 'string');
}

async function handle(request: NextRequest, mutate: boolean) {
  try {
    if (mutate && request.headers.get('origin') !== getAdminAuthConfiguration().trustedOrigin) {
      throw new StaffManagementError('Invalid request origin.', 403);
    }
    const actor = await identity(request);
    if (!mutate) return NextResponse.json(await staffManagement.snapshot(actor), { headers: responseHeaders });
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new StaffManagementError('Use a JSON request.', 415);
    // Bound the bytes read even when Content-Length is missing or forged.
    const reader = request.body?.getReader();
    if (!reader) throw new StaffManagementError('Missing request body.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) { await reader.cancel(); throw new StaffManagementError('Request is too large.', 413); }
      chunks.push(value);
    }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw new StaffManagementError('Invalid JSON request.'); }
    if (!body || typeof body !== 'object') throw new StaffManagementError('Invalid staff request.');
    const input = body as Record<string, unknown>;
    let result: unknown;
    if (input.operation === 'start' && typeof input.password === 'string') {
      result = await staffManagement.start(actor, input.input, input.password);
    } else if (input.operation === 'factor' && typeof input.token === 'string' && input.token.length <= 128) {
      if (input.method === 'totp' && typeof input.code === 'string' && /^\d{6}$/.test(input.code)) {
        result = await staffManagement.verifyFactor(actor, input.token, { method: 'totp', code: input.code });
      } else if (input.method === 'passkey' && isPasskey(input.response)) {
        result = await staffManagement.verifyFactor(actor, input.token, { method: 'passkey', response: input.response });
      } else throw new StaffManagementError('Invalid second-factor request.');
    } else if (input.operation === 'commit' && typeof input.token === 'string' && input.token.length <= 128) {
      result = await staffManagement.commit(actor, input.token, { userAgent: request.headers.get('user-agent') });
    } else if (input.operation === 'retry-delivery' && typeof input.invitationId === 'string' && /^[0-9a-f-]{36}$/.test(input.invitationId)) {
      result = { delivery: await staffManagement.dispatch(actor, input.invitationId) };
    } else throw new StaffManagementError('Invalid staff operation.');
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof StaffManagementError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    console.error('Staff administration request failed.');
    throw error;
  }
}

export const GET = (request: NextRequest) => handle(request, false);
export const POST = (request: NextRequest) => handle(request, true);

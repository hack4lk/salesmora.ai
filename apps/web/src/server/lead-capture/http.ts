import 'server-only';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, CaptureDraftConflictError, CaptureDraftValidationError, CaptureDraftEntitlementError, CapturePublicationError } from '@salesmora/data';
import { captureIdSchema } from '@salesmora/contracts';
import { getSession } from '../auth/session';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../http/suspension';
import { CaptureGmailProviderError } from '@salesmora/data/lead-capture/gmail-provider';
import { CaptureGmailCustodyError } from '@salesmora/data/lead-capture/gmail-credentials';
import { CaptureGmailMessageError } from '@salesmora/data/lead-capture/gmail-message';
import { PlanCapacityError } from '@salesmora/data';
export const captureHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
const limit = 2_000_000;
async function jsonBody(request: Request): Promise<unknown> {
  if (!request.body) throw new CaptureDraftValidationError();
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new RangeError(); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new CaptureDraftValidationError(); }
}
export async function captureRequest(request: Request, run: (identity: { userId: string; workspaceId: string }, input: unknown, sessionId: string) => Promise<unknown>, write = false, sourceId?: string) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers: captureHeaders });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to access Lead Capture.' }, { status: 401, headers: captureHeaders });
  try {
    const params = new URL(request.url).searchParams;
    let input: unknown;
    if (write) input = await jsonBody(request);
    else {
      if ([...params.keys()].some(key => params.getAll(key).length !== 1)) throw new CaptureDraftValidationError();
      const query: Record<string, unknown> = Object.fromEntries(params); query.workspaceId = query.workspace; delete query.workspace;
      for (const key of ['page', 'pageSize']) if (key in query) query[key] = /^\d+$/.test(String(query[key])) ? Number(query[key]) : Number.NaN;
      if ('archived' in query) { if (!['true', 'false'].includes(String(query.archived))) throw new CaptureDraftValidationError(); query.archived = query.archived === 'true'; }
      if (sourceId) { if (Object.keys(query).some(key => key !== 'workspaceId')) throw new CaptureDraftValidationError(); query.sourceId = sourceId; }
      input = query;
    }
    const workspaceId = input && typeof input === 'object' && 'workspaceId' in input ? input.workspaceId : undefined;
    if (!captureIdSchema.safeParse(workspaceId).success || sourceId && !captureIdSchema.safeParse(sourceId).success) throw new AuthorizationAccessError();
    if (sourceId && write && (!input || typeof input !== 'object' || !('sourceId' in input) || input.sourceId !== sourceId)) throw new CaptureDraftValidationError();
    const result = await run({ userId: session.user.id, workspaceId: workspaceId as string }, input, session.session?.id ?? '');
    return NextResponse.json(result, { headers: captureHeaders });
  } catch (error) {
    if (error instanceof PlanCapacityError) return NextResponse.json({ error: 'Workspace lead capacity is exhausted. Your intake item remains available.', code: 'capacity' }, { status: 409, headers: captureHeaders });
    if (error instanceof CaptureGmailMessageError) return NextResponse.json({ error: 'This Gmail example is unavailable or exceeds the supported text limits. Choose another message or paste an example.', code: 'sample' }, { status: 422, headers: captureHeaders });
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof CaptureGmailProviderError || error instanceof CaptureGmailCustodyError) return NextResponse.json({ error: 'Gmail connection is unavailable. Try again or reconnect the account.', code: 'connection' }, { status: 503, headers: captureHeaders });
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof CapturePublicationError ? error.kind === 'conflict' ? 409 : 422 : error instanceof CaptureDraftConflictError ? 409 : error instanceof CaptureDraftEntitlementError ? 403 : error instanceof CaptureDraftValidationError || error instanceof Error && error.name === 'ZodError' ? 422 : error instanceof RangeError ? 413 : 500;
    const message = error instanceof CapturePublicationError ? error.message : status === 404 ? 'This capture source or workspace is unavailable.' : status === 409 ? 'This draft changed. Your corrections are preserved. Reload before saving.' : status === 403 ? 'Gmail capture requires an eligible workspace plan.' : status === 413 ? 'The capture source details are too large.' : status === 422 ? 'Check the draft details and selected teammate.' : 'The capture source could not be saved. Try again.';
    return NextResponse.json({ error: message, ...(error instanceof CapturePublicationError ? { failures: error.failures } : {}), code: status === 409 ? 'conflict' : status === 403 ? 'entitlement' : status === 404 ? 'unavailable' : status === 422 ? 'validation' : 'error' }, { status, headers: captureHeaders });
  }
}

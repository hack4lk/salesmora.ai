import 'server-only';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, ReportTemplateConflictError, listReportTemplatesInTransaction,
  createReportTemplateInTransaction, updateReportTemplateInTransaction, deleteReportTemplateInTransaction,
  runReportTemplateInTransaction } from '@salesmora/data';
import { reportTemplateAreaSchema, reportTemplateCreateSchema, reportTemplateUpdateSchema,
  reportTemplateDeleteSchema, reportTemplateIdSchema, reportTemplateRunInputSchema } from '@salesmora/contracts';
import { getSession } from '../auth/session';
import { authorizedWorkspace } from '../authorization/permissions';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../http/suspension';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
const invalid = () => NextResponse.json({ error: 'Choose a valid personal report template request.' }, { status: 422, headers });
class TemplateBodyTooLargeError extends Error {}
async function body(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json' || !request.body) {
    return undefined;
  }
  const reader = request.body.getReader(), chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > 16000) { await reader.cancel(); throw new TemplateBodyTooLargeError(); }
      chunks.push(next.value);
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) return undefined;
    throw error;
  } finally { reader.releaseLock(); }
}
export async function reportTemplateHttp(request: Request, action: 'list' | 'create' | 'update' | 'delete' | 'run', id?: string) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to manage report templates.' }, { status: 401, headers });
  if (action !== 'list') {
    const configured = process.env.BETTER_AUTH_URL;
    if (!configured) {
      console.error('Report template origin configuration is missing.');
      return NextResponse.json({ error: 'Report templates are unavailable.' }, { status: 503, headers });
    }
    let origin: string;
    try { origin = new URL(configured).origin; }
    catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error('Report template origin configuration is invalid.');
      return NextResponse.json({ error: 'Report templates are unavailable.' }, { status: 503, headers });
    }
    if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
    }
  }
  if (id !== undefined && !reportTemplateIdSchema.safeParse(id).success) return invalid();
  try {
    if (action === 'list') {
      const params = new URL(request.url).searchParams;
      if ([...params.keys()].some(key => key !== 'workspaceId' && key !== 'area') ||
        params.getAll('workspaceId').length !== 1 || params.getAll('area').length !== 1) return invalid();
      const workspace = reportTemplateIdSchema.safeParse(params.get('workspaceId')), area = reportTemplateAreaSchema.safeParse(params.get('area'));
      if (!workspace.success || !area.success) return invalid();
      const result = await authorizedWorkspace(session.user.id, workspace.data, false,
        (trx, context) => listReportTemplatesInTransaction(trx, context, area.data));
      return NextResponse.json(result, { headers });
    }
    if (new URL(request.url).search) return invalid();
    const raw = await body(request);
    if (action === 'create') {
      const input = reportTemplateCreateSchema.safeParse(raw);
      if (!input.success) return invalid();
      const result = await authorizedWorkspace(session.user.id, input.data.workspaceId, true,
        (trx, context) => createReportTemplateInTransaction(trx, context, input.data));
      return NextResponse.json(result, { status: 201, headers });
    }
    if (!id) return invalid();
    if (action === 'run') {
      const input = reportTemplateRunInputSchema.safeParse(raw);
      if (!input.success) return invalid();
      const result = await authorizedWorkspace(session.user.id, input.data.workspaceId, false,
        (trx, context) => runReportTemplateInTransaction(trx, context, id));
      return NextResponse.json(result, { headers });
    }
    const input = (action === 'update' ? reportTemplateUpdateSchema : reportTemplateDeleteSchema).safeParse(raw);
    if (!input.success) return invalid();
    if (action === 'update') {
      const result = await authorizedWorkspace(session.user.id, input.data.workspaceId, true,
        (trx, context) => updateReportTemplateInTransaction(trx, context, id, input.data));
      return NextResponse.json(result, { headers });
    }
    await authorizedWorkspace(session.user.id, input.data.workspaceId, true,
      (trx, context) => deleteReportTemplateInTransaction(trx, context, id, input.data));
    return new Response(null, { status: 204, headers });
  } catch (error) {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This template or report is unavailable.' }, { status: 404, headers });
    if (error instanceof ReportTemplateConflictError) return NextResponse.json({ error: error.message }, { status: 409, headers });
    if (error instanceof TemplateBodyTooLargeError) return NextResponse.json({ error: 'The template request is too large.' }, { status: 413, headers });
    if (error instanceof RangeError) return NextResponse.json({ error: 'Check the report period and selections.' }, { status: 422, headers });
    console.error('Report template operation could not be completed.');
    return NextResponse.json({ error: 'Report templates could not be updated. Try again.' }, { status: 500, headers });
  }
}

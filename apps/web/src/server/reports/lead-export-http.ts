import 'server-only';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { leadReportExportInputSchema, leadReportExportPreviewSchema, leadReportExportGenerationSchema } from '@salesmora/contracts';
import { getSession } from '../auth/session';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../http/suspension';
import { previewWorkspaceLeadReportExport, exportWorkspaceLeadReport } from './lead-export';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
function failure(error: unknown) {
  if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
  if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This report export is unavailable.' }, { status: 404, headers });
  if (error instanceof ReportExportLimitError) return NextResponse.json({
    error: 'This report exceeds the technical CSV limit. Narrow the filters; no rows were omitted.',
  }, { status: 422, headers });
  if (error instanceof RangeError) return NextResponse.json({ error: 'Check the report period and selections.' }, { status: 422, headers });
  console.error('Leads report CSV request could not be completed or failed server contract validation.');
  return NextResponse.json({ error: 'The report CSV could not be completed. Try again.' }, { status: 500, headers });
}
export async function leadReportExportHttp(request: Request, mode: 'preview' | 'download') {
  const configured = process.env.BETTER_AUTH_URL;
  if (!configured) {
    console.error('Report CSV origin configuration is missing.');
    return NextResponse.json({ error: 'Report export is unavailable.' }, { status: 503, headers });
  }
  let origin: string;
  try { origin = new URL(configured).origin; }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error('Report CSV origin configuration is invalid.');
    return NextResponse.json({ error: 'Report export is unavailable.' }, { status: 503, headers });
  }
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Invalid export origin.' }, { status: 403, headers });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to export reports.' }, { status: 401, headers });
  const invalid = () => NextResponse.json({ error: 'Choose a valid Leads report CSV request.' }, { status: 422, headers });
  if (new URL(request.url).search) return invalid();
  if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    return NextResponse.json({ error: 'Send a JSON report export request.' }, { status: 415, headers });
  }
  if (!request.body) return invalid();
  const reader = request.body.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 16000) {
        await reader.cancel();
        return NextResponse.json({ error: 'Report export filters are too large.' }, { status: 413, headers });
      }
      chunks.push(next.value);
    }
  } catch {
    console.error('Report CSV request body could not be read.');
    return invalid();
  } finally { reader.releaseLock(); }
  let raw: unknown;
  try { raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
  catch (error) { if (!(error instanceof SyntaxError) && !(error instanceof TypeError)) throw error; return invalid(); }
  const parsed = leadReportExportInputSchema.safeParse(raw);
  if (!parsed.success) return invalid();
  try {
    if (mode === 'preview') return NextResponse.json(
      leadReportExportPreviewSchema.parse(await previewWorkspaceLeadReportExport(session.user.id, parsed.data)), { headers });
    const result = await exportWorkspaceLeadReport(session.user.id, parsed.data, request.signal);
    try {
      const metadata = leadReportExportGenerationSchema.parse({
        id: result.id, workspaceId: result.workspaceId, policyRevision: result.policyRevision,
        scope: result.scope, archiveVisibility: result.archiveVisibility, asOf: result.asOf, today: result.today,
        timezone: result.timezone, dateBasis: result.dateBasis, count: result.count, limits: result.limits,
      });
      const basis = parsed.data.query.view === 'intake' ? 'creation-date'
        : ['won', 'lost'].includes(parsed.data.query.view) ? 'recorded-transition-date' : 'current-snapshot';
      if (metadata.workspaceId !== parsed.data.query.workspaceId || metadata.dateBasis !== basis ||
        JSON.stringify(result.input) !== JSON.stringify(parsed.data)) {
        throw new Error('Report CSV generation does not match the submitted request.');
      }
      return new Response(result.stream, { headers: {
        ...headers, 'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="salesmora-leads-${parsed.data.query.view}-${parsed.data.dataset}-${metadata.today}.csv"`,
        'X-Report-Export': Buffer.from(JSON.stringify(metadata)).toString('base64url'), 'X-Accel-Buffering': 'no',
      } });
    } catch (error) {
      await result.stream.cancel();
      throw error;
    }
  } catch (error) { return failure(error); }
}

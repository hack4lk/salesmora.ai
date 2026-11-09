import 'server-only';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { getSession } from '../auth/session';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../http/suspension';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
type Input = { query: { workspaceId: string; view: string }; dataset: string };
type Generation = { id: string; workspaceId: string; today: string };

export async function reportExportHttp<I extends Input, P, G extends Generation>(
  request: Request, mode: 'preview' | 'download', options: {
    label: string; input: { safeParse: (value: unknown) => { success: true; data: I } | { success: false } };
    preview: { parse: (value: unknown) => P }; generation: { parse: (value: unknown) => G };
    load: (userId: string, input: I) => Promise<P>;
    download: (userId: string, input: I, signal: AbortSignal) =>
      Promise<{ input: I; id: string; generation: G; stream: ReadableStream<Uint8Array> }>;
  },
) {
  const { label } = options;
  const failure = (error: unknown) => {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This report export is unavailable.' }, { status: 404, headers });
    if (error instanceof ReportExportLimitError || error instanceof RangeError) return NextResponse.json({
      error: `Check the ${label} selection and technical CSV limits; no rows were omitted.`,
    }, { status: 422, headers });
    console.error(`${label} CSV request could not be completed or failed server contract validation.`);
    return NextResponse.json({ error: 'The report CSV could not be completed. Try again.' }, { status: 500, headers });
  };
  const configured = process.env.BETTER_AUTH_URL;
  if (!configured) {
    console.error(`${label} CSV origin configuration is missing.`);
    return NextResponse.json({ error: 'Report export is unavailable.' }, { status: 503, headers });
  }
  let origin: string;
  try { origin = new URL(configured).origin; }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error(`${label} CSV origin configuration is invalid.`);
    return NextResponse.json({ error: 'Report export is unavailable.' }, { status: 503, headers });
  }
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Invalid export origin.' }, { status: 403, headers });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to export reports.' }, { status: 401, headers });
  const invalid = () => NextResponse.json({ error: `Choose a valid ${label} report CSV request.` }, { status: 422, headers });
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
    console.error(`${label} CSV request body could not be read.`);
    return invalid();
  } finally { reader.releaseLock(); }
  let raw: unknown;
  try { raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
  catch (error) { if (!(error instanceof SyntaxError) && !(error instanceof TypeError)) throw error; return invalid(); }
  const parsed = options.input.safeParse(raw);
  if (!parsed.success) return invalid();
  try {
    if (mode === 'preview') return NextResponse.json(options.preview.parse(await options.load(session.user.id, parsed.data)), { headers });
    const result = await options.download(session.user.id, parsed.data, request.signal);
    try {
      const metadata = options.generation.parse(result.generation);
      if (metadata.id !== result.id || metadata.workspaceId !== parsed.data.query.workspaceId ||
        JSON.stringify(result.input) !== JSON.stringify(parsed.data)) {
        throw new Error(`${label} CSV generation does not match the submitted request.`);
      }
      return new Response(result.stream, { headers: {
        ...headers, 'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="salesmora-${parsed.data.query.view}-${parsed.data.dataset}-${metadata.today}.csv"`,
        'X-Report-Export': Buffer.from(JSON.stringify(metadata)).toString('base64url'), 'X-Accel-Buffering': 'no',
      } });
    } catch (error) { await result.stream.cancel(); throw error; }
  } catch (error) { return failure(error); }
}

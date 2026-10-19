import { NextResponse } from 'next/server';
import { AuthorizationAccessError, LeadExportLimitError, LeadExportEmptyError } from '@salesmora/data';
import { leadExportSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { previewWorkspaceLeadExport, exportWorkspaceLeads } from '../../../../server/leads/export';

export const runtime = 'nodejs';
export const maxDuration = 40;
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
function failure(error: unknown) {
  if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'Export is unavailable or you no longer have permission.' }, { status: 404, headers });
  if (error instanceof LeadExportLimitError) return NextResponse.json({ error: 'This export exceeds the row limit. Narrow your filters; no rows were omitted.' }, { status: 422, headers });
  if (error instanceof LeadExportEmptyError) return NextResponse.json({ error: 'No leads match these filters.' }, { status: 422, headers });
  return NextResponse.json({ error: 'The export could not be completed. Try again.' }, { status: 500, headers });
}
export async function POST(request: Request) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession(); if (!session) return NextResponse.json({ error: 'Sign in to export leads.' }, { status: 401, headers });
  let body: unknown;
  try { const text = await request.text(); if (text.length > 16000) return NextResponse.json({ error: 'Request too large.' }, { status: 413, headers }); body = JSON.parse(text); }
  catch { return NextResponse.json({ error: 'Invalid export filters.' }, { status: 400, headers }); }
  const input = leadExportSchema.safeParse(body); if (!input.success) return NextResponse.json({ error: 'Invalid export filters.' }, { status: 400, headers });
  try { return NextResponse.json(await previewWorkspaceLeadExport(session.user.id, input.data), { headers }); }
  catch (error) { return failure(error); }
}
export async function GET(request: Request) {
  // Explicit fetch-only intent prevents a cross-site link/navigation from initiating
  // a sensitive download. No cross-origin CORS permissions are exposed.
  const origin = process.env.BETTER_AUTH_URL && new URL(process.env.BETTER_AUTH_URL).origin;
  if (!origin || request.headers.get('x-salesmora-export') !== '1' || request.headers.get('origin') && request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: 'Invalid export request.' }, { status: 403, headers });
  const session = await getSession(); if (!session) return NextResponse.json({ error: 'Sign in to export leads.' }, { status: 401, headers });
  let raw: unknown;
  try {
    const params = new URL(request.url).searchParams;
    if (request.url.length > 24000 || params.getAll('workspaceId').length !== 1 || params.getAll('filters').length !== 1 || [...params.keys()].some(key => !['workspaceId', 'filters'].includes(key))) throw new Error();
    raw = { workspaceId: params.get('workspaceId'), filters: JSON.parse(params.get('filters')!) };
  } catch { return NextResponse.json({ error: 'Invalid export filters.' }, { status: 400, headers }); }
  const input = leadExportSchema.safeParse(raw); if (!input.success) return NextResponse.json({ error: 'Invalid export filters.' }, { status: 400, headers });
  try {
    const result = await exportWorkspaceLeads(session.user.id, input.data, request.signal);
    return new Response(result.stream, { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="salesmora-leads-${new Date().toISOString().slice(0, 10)}.csv"`, 'X-Export-Count': String(result.count), 'X-Accel-Buffering': 'no' } });
  } catch (error) { return failure(error); }
}

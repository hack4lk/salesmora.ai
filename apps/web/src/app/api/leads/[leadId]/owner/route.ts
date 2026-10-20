import { NextResponse } from 'next/server';
import { AuthorizationAccessError, LeadAssignmentConflictError } from '@salesmora/data';
import { assignLeadSchema } from '@salesmora/contracts';
import { getSession } from '../../../../../server/auth/session';
import { assignWorkspaceLead } from '../../../../../server/leads/assign';
export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to assign a lead.' }, { status: 401, headers });
  let body: unknown;
  try { const text = await request.text(); if (text.length > 4000) return NextResponse.json({ error: 'Request too large.' }, { status: 413, headers }); body = JSON.parse(text); }
  catch { return NextResponse.json({ error: 'Invalid assignment.' }, { status: 400, headers }); }
  const input = assignLeadSchema.safeParse(body), { leadId } = await params;
  if (!input.success || input.data.leadId !== leadId) return NextResponse.json({ error: 'Check the selected teammate.' }, { status: 422, headers });
  try { return NextResponse.json(await assignWorkspaceLead(session.user.id, input.data), { headers }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This lead is unavailable or you no longer have permission to assign it.' }, { status: 404, headers });
    if (error instanceof LeadAssignmentConflictError) return NextResponse.json({ error: 'This lead or teammate changed. Reload before assigning.' }, { status: 409, headers });
    return NextResponse.json({ error: 'The assignment could not be confirmed. Reload the lead before trying again.' }, { status: 500, headers });
  }
}

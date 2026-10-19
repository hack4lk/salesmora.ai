import { NextResponse } from 'next/server';
import { AuthorizationAccessError, LeadNoteConflictError } from '@salesmora/data';
import { addLeadNoteSchema, leadNotesQuerySchema } from '@salesmora/contracts';
import { getSession } from '../../../../../server/auth/session';
import { addWorkspaceLeadNote } from '../../../../../server/leads/notes';
import { workspaceLead } from '../../../../../server/leads/read';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
export async function GET(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to view notes.' }, { status: 401, headers });
  const url = new URL(request.url), { leadId } = await params;
  const input = leadNotesQuerySchema.safeParse({ workspaceId: url.searchParams.get('workspace'), leadId, page: url.searchParams.get('page') ?? '1' });
  if (!input.success) return NextResponse.json({ error: 'These notes are unavailable.' }, { status: 404, headers });
  try {
    const result = await workspaceLead(session.user.id, input.data.workspaceId, leadId, 1, input.data.page);
    return NextResponse.json({ notes: result.teamNotes, total: result.notesTotal }, { headers });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'These notes are unavailable.' }, { status: 404, headers });
    return NextResponse.json({ error: 'Notes could not be loaded. Try again.' }, { status: 500, headers });
  }
}
export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to add a note.' }, { status: 401, headers });
  let body: unknown;
  try { const text = await request.text(); if (text.length > 16000) return NextResponse.json({ error: 'Request too large.' }, { status: 413, headers }); body = JSON.parse(text); }
  catch { return NextResponse.json({ error: 'Invalid note.' }, { status: 400, headers }); }
  const input = addLeadNoteSchema.safeParse(body), { leadId } = await params;
  if (!input.success || input.data.leadId !== leadId) return NextResponse.json({ error: 'Enter a note of up to 2,000 characters.' }, { status: 422, headers });
  try { return NextResponse.json({ ok: true, note: await addWorkspaceLeadNote(session.user.id, input.data) }, { headers }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This lead is unavailable or you no longer have permission to add notes.' }, { status: 404, headers });
    if (error instanceof LeadNoteConflictError) return NextResponse.json({ error: 'This note submission was used for different text. Reload before trying again.' }, { status: 409, headers });
    return NextResponse.json({ error: 'Could not add your note. Your text is preserved. Try again.' }, { status: 500, headers });
  }
}

import { NextResponse } from 'next/server';
import { AuthorizationAccessError, LeadEditConflictError, LeadSourceLockedError, LeadDeleteConflictError, LeadDeleteConfirmationError, LeadDeleteWonError } from '@salesmora/data';
import { leadDetailQuerySchema, updateLeadSchema, deleteLeadSchema } from '@salesmora/contracts';
import { deleteWorkspaceLead } from '../../../../server/leads/delete';
import { updateWorkspaceLead } from '../../../../server/leads/update';
import { getSession } from '../../../../server/auth/session';
import { workspaceLead } from '../../../../server/leads/read';
export async function GET(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to view leads.' }, { status: 401, headers });
  const url = new URL(request.url), { leadId } = await params;
  const input = leadDetailQuerySchema.safeParse({ workspaceId: url.searchParams.get('workspace'), leadId, activityPage: url.searchParams.get('activityPage') ?? '1' });
  if (!input.success) return NextResponse.json({ error: 'This lead is unavailable.' }, { status: 404, headers });
  try { return NextResponse.json(await workspaceLead(session.user.id, input.data.workspaceId, leadId, input.data.activityPage), { headers }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This lead is unavailable.' }, { status: 404, headers });
    return NextResponse.json({ error: 'This lead could not be loaded. Try again.' }, { status: 500, headers });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to edit a lead.' }, { status: 401, headers });
  let body: unknown;
  try { const text = await request.text(); if (text.length > 128000) return NextResponse.json({ error: 'Request too large.' }, { status: 413, headers }); body = JSON.parse(text); }
  catch { return NextResponse.json({ error: 'Invalid lead details.' }, { status: 400, headers }); }
  const input = updateLeadSchema.safeParse(body), { leadId } = await params;
  if (!input.success) return NextResponse.json({ error: 'Check your lead details and try again.' }, { status: input.error.issues.some(issue => issue.code === 'unrecognized_keys') ? 400 : 422, headers });
  if (input.data.leadId !== leadId) return NextResponse.json({ error: 'Invalid lead details.' }, { status: 422, headers });
  try {
    await updateWorkspaceLead(session.user.id, input.data);
    return NextResponse.json(await workspaceLead(session.user.id, input.data.workspaceId, leadId), { headers });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This lead is unavailable or you no longer have permission to edit it.' }, { status: 404, headers });
    if (error instanceof LeadEditConflictError) return NextResponse.json({ error: error.message, changedFields: error.changedFields }, { status: 409, headers });
    if (error instanceof LeadSourceLockedError) return NextResponse.json({ error: 'The source of this Gmail or campaign lead cannot be changed.' }, { status: 422, headers });
    return NextResponse.json({ error: 'Could not save this lead. Your edits are preserved. Try again.' }, { status: 500, headers });
  }
}

/** Explicit typed-confirmation boundary; never reached from a model tool. */
export async function DELETE(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to delete a lead.' }, { status: 401, headers });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 4000) return NextResponse.json({ error: 'Request too large.' }, { status: 413, headers });
    body = JSON.parse(text);
  } catch { return NextResponse.json({ error: 'Invalid deletion request.' }, { status: 400, headers }); }
  const input = deleteLeadSchema.safeParse(body), { leadId } = await params;
  if (!input.success || input.data.leadId !== leadId) return NextResponse.json({ error: 'Invalid deletion request.' }, { status: 400, headers });
  try { return NextResponse.json(await deleteWorkspaceLead(session.user.id, input.data), { headers }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This lead is unavailable or you no longer have permission to delete it.' }, { status: 404, headers });
    if (error instanceof LeadDeleteConflictError) return NextResponse.json({ error: 'This lead changed. Reload before deleting it.' }, { status: 409, headers });
    if (error instanceof LeadDeleteWonError) return NextResponse.json({ error: 'Won leads cannot be deleted. Archive this lead instead.' }, { status: 422, headers });
    if (error instanceof LeadDeleteConfirmationError) return NextResponse.json({ error: 'Type the exact lead number to confirm deletion.' }, { status: 422, headers });
    return NextResponse.json({ error: 'Deletion could not be confirmed. Retry to check the saved result.' }, { status: 500, headers });
  }
}

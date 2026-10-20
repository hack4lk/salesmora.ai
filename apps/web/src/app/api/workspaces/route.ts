import { safelyDeliverOwnerInvitations } from '../../../server/invitations/store';
import { NextResponse } from 'next/server';
import { workspaceSchema } from '@salesmora/contracts';
import { getSession } from '../../../server/auth/session';
import { createWorkspace, WorkspaceCapacityError } from '../../../server/workspaces/store';
export async function POST(request: Request) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to create a workspace.' }, { status: 401 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 64000) return NextResponse.json({ error: 'Workspace details are too large.' }, { status: 413 });
    body = JSON.parse(text);
  } catch { return NextResponse.json({ error: 'Invalid workspace details.' }, { status: 400 }); }
  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success || parsed.data.team.invitations.some(invite => invite.email === session.user.email.toLowerCase())) return NextResponse.json({ error: 'Check your business, services, and teammate details.' }, { status: 422 });
  try {
    const result = await createWorkspace(session.user.id, parsed.data);
    await safelyDeliverOwnerInvitations(session.user.id);
    return NextResponse.json({ workspaceId: result.id }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof WorkspaceCapacityError) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ error: 'Workspace could not be saved. Please try again.' }, { status: 500 });
  }
}

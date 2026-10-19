import { PlanCapacityError, AuthorizationAccessError } from '@salesmora/data';
import { NextResponse } from 'next/server';
import { createLeadSchema } from '@salesmora/contracts';
import { leadQueryFromURL, leadDetailQuerySchema } from '@salesmora/contracts';
import { workspaceLeads } from '../../../server/leads/read';
import { getSession } from '../../../server/auth/session';
import { createLead, LeadAccessError, LeadConflictError, LeadOwnerError } from '../../../server/leads/store';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to view leads.' }, { status: 401, headers });
  const params = new URL(request.url).searchParams, workspaceId = params.get('workspace');
  if (!workspaceId || !leadDetailQuerySchema.shape.workspaceId.safeParse(workspaceId).success) return NextResponse.json({ error: 'This workspace is unavailable.' }, { status: 404, headers });
  try { return NextResponse.json(await workspaceLeads(session.user.id, leadQueryFromURL(workspaceId, params)), { headers }); }
  catch (error) {
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This workspace is unavailable.' }, { status: 404, headers });
    return NextResponse.json({ error: 'Leads could not be loaded. Try again.' }, { status: 500, headers });
  }
}
export async function POST(request: Request) {
  if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to create a lead.' }, { status: 401 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 64000) return NextResponse.json({ error: 'Lead details are too large.' }, { status: 413 });
    body = JSON.parse(text);
  } catch { return NextResponse.json({ error: 'Invalid lead details.' }, { status: 400 }); }
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Check your lead details and try again.' }, { status: 422 });
  try {
    const { workspaceId, submissionId, lead } = parsed.data;
    const result = await createLead(session.user.id, workspaceId, submissionId, lead);
    return NextResponse.json({ leadId: result.id }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof PlanCapacityError) return NextResponse.json({error:'Your workspace has reached its monthly new-lead limit. Ask the Owner to change plans or wait for the next monthly reset.',code:'plan_limit',resource:error.resource,limit:error.limit,resetAt:error.resetAt},{status:409,headers:{'Cache-Control':'no-store'}});
    if (error instanceof LeadAccessError || error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This workspace is unavailable.' }, { status: 403 });
    if (error instanceof LeadOwnerError) return NextResponse.json({ error: 'Choose a current workspace member as lead owner.' }, { status: 422 });
    if (error instanceof LeadConflictError) return NextResponse.json({ error: 'This submission was already saved with different details. Reload to create another lead.' }, { status: 409 });
    return NextResponse.json({ error: 'Lead could not be saved. Please try again.' }, { status: 500 });
  }
}

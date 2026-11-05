import { NextResponse } from 'next/server';
import { leadAssignmentSettingsQuerySchema } from '@salesmora/contracts';
import { AuthorizationAccessError, LeadAssignmentSettingsConflict, LeadAssignmentSettingsInvalid, LeadAssignmentSettingsUnavailable, readLeadAssignmentSettings, saveLeadAssignmentSettings } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../../../../server/http/suspension';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
async function handle(request: Request, write: boolean) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession(); if (!session) return NextResponse.json({ error: 'Sign in to access settings.' }, { status: 401, headers });
  try {
    let body: unknown, workspaceId: unknown = new URL(request.url).searchParams.get('workspace');
    if (write) {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'Use a JSON request.' }, { status: 415, headers });
      const text = await request.text(); if (new TextEncoder().encode(text).length > 16000) return NextResponse.json({ error: 'Settings request is too large.' }, { status: 413, headers });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid settings request.' }, { status: 400, headers }); }
      workspaceId = body && typeof body === 'object' && 'workspaceId' in body ? body.workspaceId : null;
    }
    const parsed = leadAssignmentSettingsQuerySchema.safeParse({ workspaceId }); if (!parsed.success) throw new AuthorizationAccessError();
    const identity = { userId: session.user.id, workspaceId: parsed.data.workspaceId };
    return NextResponse.json(write ? await saveLeadAssignmentSettings(database(), identity, enabledPermissions, body) : await readLeadAssignmentSettings(database(), identity, enabledPermissions), { headers });
  } catch (error) {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof LeadAssignmentSettingsConflict ? 409 : error instanceof LeadAssignmentSettingsInvalid ? 422 : error instanceof LeadAssignmentSettingsUnavailable ? 503 : 500;
    return NextResponse.json({ error: status === 404 ? 'These lead settings are unavailable.' : status === 409 ? 'Settings changed. Reload before saving.' : status === 422 ? 'Choose a currently available assignment rule.' : 'Lead settings could not be loaded or saved.' }, { status, headers });
  }
}
export function GET(request: Request) { return handle(request, false); }
export function PUT(request: Request) { return handle(request, true); }

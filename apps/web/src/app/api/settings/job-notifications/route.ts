import { NextResponse } from 'next/server';
import { workOrderIdSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, JobNotificationSettingsConflict, JobNotificationSettingsInvalid, readJobNotificationSettings, saveJobNotificationSettings } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
async function handle(request: Request, write: boolean) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to access settings.' }, { status: 401, headers });
  try {
    let body: unknown, workspaceId: unknown = new URL(request.url).searchParams.get('workspace');
    if (write) {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'Use a JSON request.' }, { status: 415, headers });
      const text = await request.text();
      if (text.length > 64000) return NextResponse.json({ error: 'Settings are too large.' }, { status: 413, headers });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid settings request.' }, { status: 400, headers }); }
      workspaceId = body && typeof body === 'object' && 'workspaceId' in body ? body.workspaceId : null;
    }
    const parsed = workOrderIdSchema.safeParse(workspaceId);
    if (!parsed.success) throw new AuthorizationAccessError();
    const identity = { userId: session.user.id, workspaceId: parsed.data };
    return NextResponse.json(write ? await saveJobNotificationSettings(database(), identity, enabledPermissions, body) : await readJobNotificationSettings(database(), identity, enabledPermissions), { headers });
  } catch (error) {
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof JobNotificationSettingsConflict ? 409 : error instanceof JobNotificationSettingsInvalid ? 422 : 500;
    return NextResponse.json({ error: status === 404 ? 'These settings are unavailable.' : status === 409 ? 'Settings changed. Reload before saving.' : status === 422 ? 'Check the settings and current plan before saving.' : 'Settings could not be loaded or saved.', ...(status === 409 ? { code: 'conflict' } : {}) }, { status, headers });
  }
}
export function GET(request: Request) { return handle(request, false); }
export function PUT(request: Request) { return handle(request, true); }

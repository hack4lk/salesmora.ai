import { NextResponse } from 'next/server';
import { AuthorizationAccessError } from '@salesmora/data';
import { getSession } from '../../../server/auth/session';
import { readWorkspaceAIUsage } from '../../../server/workspaces/ai-usage';
import { aiUsageRouteData as copy } from '../../../features/settings/ai-usage-page/ai-usage-route.data';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return reply({ error: copy.signIn }, 401);
  const workspaceId = new URL(request.url).searchParams.get('workspace');
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) return reply({ error: copy.invalidWorkspace }, 400);
  try { const { usage } = await readWorkspaceAIUsage(session.user.id, workspaceId); return reply({ usage }); }
  catch (error) { return reply({ error: copy.unavailable }, error instanceof AuthorizationAccessError ? 403 : 500); }
}

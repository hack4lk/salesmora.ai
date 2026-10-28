import 'server-only';
import { NextResponse } from 'next/server';
import { CalendarContractError, jobIdSchema } from '@salesmora/contracts';
import { AuthorizationAccessError } from '@salesmora/data';
import { CalendarRevisionError, JobLifecycleError, WorkOrderLifecycleError } from '@salesmora/domain';
import { getSession } from '../auth/session';
export const calendarHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
export async function calendarRequest(request: Request, run: (identity: { workspaceId: string; userId: string }, body: unknown) => Promise<Response>, write = false) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers: calendarHeaders });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to access the Calendar.' }, { status: 401, headers: calendarHeaders });
  try {
    let body: unknown, workspaceId = new URL(request.url).searchParams.get('workspace');
    if (write) {
      const text = await request.text();
      if (text.length > 64000) return NextResponse.json({ error: 'Calendar request is too large.' }, { status: 413, headers: calendarHeaders });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid Calendar request.' }, { status: 400, headers: calendarHeaders }); }
      workspaceId = body && typeof body === 'object' && 'workspaceId' in body && typeof body.workspaceId === 'string' ? body.workspaceId : null;
    }
    if (!jobIdSchema.safeParse(workspaceId).success) throw new AuthorizationAccessError();
    return await run({ workspaceId: workspaceId!, userId: session.user.id }, body);
  } catch (error) {
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof CalendarRevisionError ? 409 : error instanceof CalendarContractError || error instanceof JobLifecycleError || error instanceof WorkOrderLifecycleError ? 422 : 500;
    return NextResponse.json({ error: status === 404 ? 'This Calendar or visit is unavailable.' : status === 409 ? 'The visit changed. Reload and review its current schedule.' : status === 422 ? 'Check the Calendar details and try again.' : 'The Calendar could not be loaded or saved. Try again.', ...(status === 409 ? { code: 'conflict' } : {}) }, { status, headers: calendarHeaders });
  }
}

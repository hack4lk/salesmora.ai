import { CalendarRevisionError } from '@salesmora/domain';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, readCalendarAvailability, saveCalendarAvailability } from '@salesmora/data';
import { calendarHeaders, calendarRequest } from '../../../../../server/calendar/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
type Route = { params: Promise<{ personId: string }> };
export async function GET(request: Request, route: Route) {
  const { personId } = await route.params;
  return calendarRequest(request, async identity => NextResponse.json(await readCalendarAvailability(database(), identity, enabledPermissions, personId), { headers: calendarHeaders }));
}
export async function PATCH(request: Request, route: Route) {
  const { personId } = await route.params;
  return calendarRequest(request, async (identity, body) => {
    if (!body || typeof body !== 'object' || !('personId' in body) || body.personId !== personId) throw new AuthorizationAccessError();
    try { return NextResponse.json(await saveCalendarAvailability(database(), identity, enabledPermissions, body), { headers: calendarHeaders }); }
    catch (error) {
      if (error instanceof CalendarRevisionError) return NextResponse.json({ error: 'Availability changed. Reload the latest values before saving.', code: 'conflict' }, { status: 409, headers: calendarHeaders });
      throw error;
    }
  }, true);
}

import { NextResponse } from 'next/server';
import { readCalendarVisit, scheduleCalendarVisit, withWorkspaceAuthorization } from '@salesmora/data';
import { calendarScheduleCommandSchema } from '@salesmora/contracts';
import { calendarRequest, calendarHeaders } from '../../../../server/calendar/http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
import { AuthorizationAccessError } from '@salesmora/data';
type Route = { params: Promise<{ visitId: string }> };
export async function GET(request: Request, route: Route) {
  const { visitId } = await route.params;
  return calendarRequest(request, async identity => NextResponse.json(await readCalendarVisit(database(), identity, enabledPermissions, visitId), { headers: calendarHeaders }));
}
export async function PATCH(request: Request, route: Route) {
  const { visitId } = await route.params;
  return calendarRequest(request, async (identity, body) => {
    const input = calendarScheduleCommandSchema.parse(body);
    if (input.visitId !== visitId) throw new AuthorizationAccessError();
    // Calendar authority is required in addition to every resource's scheduling authority.
    const result = await withWorkspaceAuthorization(database(), identity, enabledPermissions, true, async trx => {
      const visit = await readCalendarVisit(trx, identity, enabledPermissions, visitId);
      if (!visit.canReschedule) throw new AuthorizationAccessError();
      return scheduleCalendarVisit(trx, identity, enabledPermissions, input);
    });
    return NextResponse.json(result, { headers: calendarHeaders });
  }, true);
}

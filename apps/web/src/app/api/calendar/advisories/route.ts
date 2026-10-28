import { NextResponse } from 'next/server';
import { readCalendarAdvisories } from '@salesmora/data';
import { calendarRequest, calendarHeaders } from '../../../../server/calendar/http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export function POST(request: Request) {
  return calendarRequest(request, async (identity, body) => NextResponse.json(await readCalendarAdvisories(database(), identity, enabledPermissions, body), { headers: calendarHeaders }), true);
}

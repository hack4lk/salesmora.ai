import { NextResponse } from 'next/server';
import { readCalendar } from '@salesmora/data';
import { calendarQueryFromURL } from '@salesmora/contracts';
import { calendarRequest, calendarHeaders } from '../../../server/calendar/http';
import { database } from '../../../server/workspaces/store';
import { enabledPermissions } from '../../../server/authorization/permissions';
export function GET(request: Request) {
  return calendarRequest(request, async identity => NextResponse.json(await readCalendar(database(), identity, enabledPermissions, calendarQueryFromURL(identity.workspaceId, new URL(request.url).searchParams)), { headers: calendarHeaders }));
}

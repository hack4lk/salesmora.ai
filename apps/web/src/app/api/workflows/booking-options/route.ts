import { NextResponse } from 'next/server';
import { readRoutineBookingOptions } from '@salesmora/data';
import { calendarRequest,calendarHeaders } from '../../../../server/calendar/http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export function GET(request:Request) { return calendarRequest(request,async identity=>NextResponse.json(await readRoutineBookingOptions(database(),identity,enabledPermissions),{headers:calendarHeaders})); }

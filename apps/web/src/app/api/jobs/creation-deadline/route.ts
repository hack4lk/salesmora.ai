import { NextResponse } from 'next/server';
import { readJobCreationDeadline } from '@salesmora/data';
import { jobRequest, jobHeaders } from '../../../../server/jobs/http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export function GET(request: Request) {
  return jobRequest(request, async identity => NextResponse.json(await readJobCreationDeadline(database(), identity, enabledPermissions), { headers: jobHeaders }));
}

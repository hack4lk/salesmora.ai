import { NextResponse } from "next/server";
import { createJob, readJobs } from "@salesmora/data";
import { createJobSchema, jobQueryFromURL } from "@salesmora/contracts";
import { jobRequest, jobHeaders } from "../../../server/jobs/http";
import { database } from "../../../server/workspaces/store";
import { enabledPermissions } from "../../../server/authorization/permissions";
export function GET(request: Request) {
  return jobRequest(request, async identity => NextResponse.json(await readJobs(database(), identity, enabledPermissions, jobQueryFromURL(identity.workspaceId, new URL(request.url).searchParams)), { headers: jobHeaders }));
}
export function POST(request: Request) {
  return jobRequest(request, async (identity, body) => NextResponse.json(await createJob(database(), identity, enabledPermissions, createJobSchema.parse(body)), { status: 201, headers: jobHeaders }), true);
}

import { NextResponse } from "next/server";
import { mutateJob, readJob, JobValidationError } from "@salesmora/data";
import { jobMutationSchema } from "@salesmora/contracts";
import { jobRequest, jobHeaders } from "../../../../server/jobs/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
type Params = { params: Promise<{ jobId: string }> };
export function GET(request: Request, { params }: Params) {
  return jobRequest(request, async identity => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return NextResponse.json(await readJob(database(), identity, enabledPermissions, (await params).jobId, page), { headers: jobHeaders });
  });
}
export function PATCH(request: Request, { params }: Params) {
  return jobRequest(request, async (identity, body) => {
    const input = jobMutationSchema.parse(body);
    if (input.jobId !== (await params).jobId) throw new JobValidationError("The job does not match this request.");
    return NextResponse.json(await mutateJob(database(), identity, enabledPermissions, input), { headers: jobHeaders });
  }, true);
}

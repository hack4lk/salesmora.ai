import { NextResponse } from "next/server";
import { readWorkOrderCreationVisit } from "@salesmora/data";
import { workOrderIdSchema } from "@salesmora/contracts";
import { workOrderRequest, workOrderHeaders } from "../../../../server/work-orders/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
export function GET(request: Request) {
  return workOrderRequest(request, async identity => {
    const jobId = workOrderIdSchema.parse(new URL(request.url).searchParams.get("jobId"));
    return NextResponse.json(await readWorkOrderCreationVisit(database(), identity, enabledPermissions, jobId), { headers: workOrderHeaders });
  });
}

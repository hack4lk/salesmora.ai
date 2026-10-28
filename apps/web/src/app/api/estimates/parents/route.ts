import { NextResponse } from "next/server";
import { estimateCustomerParentsQuerySchema } from "@salesmora/contracts";
import { readEstimateCustomerParents } from "@salesmora/data";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
import { estimateHeaders, estimateRequest } from "../../../../server/estimates/http";

export function GET(request: Request) {
  return estimateRequest(request, async (identity) => {
    const params = new URL(request.url).searchParams;
    const result = await readEstimateCustomerParents(database(), identity, enabledPermissions, estimateCustomerParentsQuerySchema.parse({
      workspaceId: identity.workspaceId,
      customerId: params.get("customerId"),
      type: params.get("type"),
      q: params.get("q") ?? "",
    }));
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

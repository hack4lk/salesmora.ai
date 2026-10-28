import { NextResponse } from "next/server";
import { relatedEstimatesQuerySchema } from "@salesmora/contracts";
import { readRelatedEstimates } from "@salesmora/data";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
import { estimateHeaders, estimateRequest } from "../../../../server/estimates/http";

export function GET(request: Request) {
  return estimateRequest(request, async (identity) => {
    const params = new URL(request.url).searchParams;
    const includeHidden = params.get("includeHidden") ?? "false";
    if (includeHidden !== "true" && includeHidden !== "false") {
      return NextResponse.json({ error: "Invalid related estimate filters." }, { status: 422, headers: estimateHeaders });
    }
    const result = await readRelatedEstimates(database(), identity, enabledPermissions, relatedEstimatesQuerySchema.parse({
      workspaceId: identity.workspaceId,
      recordType: params.get("recordType"),
      recordId: params.get("recordId"),
      includeHidden: includeHidden === "true",
      page: params.has("page") ? Number(params.get("page")) : 1,
    }));
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

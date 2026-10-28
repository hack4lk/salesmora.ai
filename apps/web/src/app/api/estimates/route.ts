import { NextResponse } from "next/server";
import {
  estimateListQueryFromURL,
  estimateListQuerySchema,
} from "@salesmora/contracts";
import { workspaceEstimates } from "../../../server/estimates/read";
import { createEstimateDraft } from "@salesmora/data";
import { database } from "../../../server/workspaces/store";
import { enabledPermissions } from "../../../server/authorization/permissions";
import { estimateHeaders, estimateRequest } from "../../../server/estimates/http";

export function GET(request: Request) {
  return estimateRequest(request, async (identity) => {
    const params = new URL(request.url).searchParams;
    const workspaceId = identity.workspaceId;
    if (!estimateListQuerySchema.shape.workspaceId.safeParse(workspaceId).success) {
      return NextResponse.json(
        { error: "This workspace is unavailable." },
        { status: 404, headers: estimateHeaders },
      );
    }
    const query = estimateListQueryFromURL(workspaceId, params);
    const result = await workspaceEstimates(identity.userId, query);
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

export function POST(request: Request) {
  return estimateRequest(
    request,
    async (identity, body) => {
      const result = await createEstimateDraft(
        database(),
        identity,
        enabledPermissions,
        body,
      );
      return NextResponse.json(result, { status: 201, headers: estimateHeaders });
    },
    true,
  );
}

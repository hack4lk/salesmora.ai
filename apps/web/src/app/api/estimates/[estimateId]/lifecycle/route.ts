import { NextResponse } from "next/server";
import { estimateIdSchema } from "@salesmora/contracts";
import { readEstimateLifecycle } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export function GET(request: Request, { params }: { params: Promise<{ estimateId: string }> }) {
  return estimateRequest(request, async identity => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const query = new URL(request.url).searchParams;
    const hasCursor = query.has("beforeAt") || query.has("beforeId");
    const result = await readEstimateLifecycle(database(), identity, enabledPermissions, {
      workspaceId: identity.workspaceId, estimateId,
      ...(hasCursor ? { before: { createdAt: query.get("beforeAt"), id: query.get("beforeId") } } : {}),
    });
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

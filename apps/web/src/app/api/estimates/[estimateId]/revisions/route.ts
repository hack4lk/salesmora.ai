import { NextResponse } from "next/server";
import { estimateIdSchema, estimateRevisionsQuerySchema } from "@salesmora/contracts";
import { readEstimateRevisionFamily } from "@salesmora/data";
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
    const before = query.get("beforeRevision");
    const input = estimateRevisionsQuerySchema.parse({
      workspaceId: identity.workspaceId, estimateId,
      ...(query.has("beforeRevision") ? { beforeRevision: before && /^[1-9]\d*$/.test(before) ? Number(before) : null } : {}),
    });
    return NextResponse.json(await readEstimateRevisionFamily(database(), identity, enabledPermissions, input), { headers: estimateHeaders });
  });
}

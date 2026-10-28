import { NextResponse } from "next/server";
import { estimateIdSchema, voidEstimateSchema } from "@salesmora/contracts";
import { voidEstimate } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export function POST(request: Request, { params }: { params: Promise<{ estimateId: string }> }) {
  return estimateRequest(request, async (identity, body) => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const input = voidEstimateSchema.parse(body);
    if (input.estimateId !== estimateId) {
      return NextResponse.json({ error: "The estimate identifier does not match the request." }, { status: 400, headers: estimateHeaders });
    }
    return NextResponse.json(await voidEstimate(database(), identity, enabledPermissions, input), { headers: estimateHeaders });
  }, true);
}

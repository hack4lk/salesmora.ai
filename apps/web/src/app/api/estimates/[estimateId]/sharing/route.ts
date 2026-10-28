import { NextResponse } from "next/server";
import { estimateIdSchema, shareEstimateSchema } from "@salesmora/contracts";
import { readEstimateSharingReview, shareEstimate } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";
import { staffEstimateSharing } from "../../../../../server/estimates/sharing";

type RouteContext = { params: Promise<{ estimateId: string }> };

export function GET(request: Request, { params }: RouteContext) {
  return estimateRequest(request, async identity => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const review = await readEstimateSharingReview(database(), identity, enabledPermissions, estimateId);
    return NextResponse.json(staffEstimateSharing(review), { headers: estimateHeaders });
  });
}

export function POST(request: Request, { params }: RouteContext) {
  return estimateRequest(request, async (identity, body) => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const input = shareEstimateSchema.parse(body);
    if (input.estimateId !== estimateId) {
      return NextResponse.json({ error: "The estimate identifier does not match the request." }, { status: 400, headers: estimateHeaders });
    }
    const receipt = await shareEstimate(database(), identity, enabledPermissions, input);
    return NextResponse.json(receipt, { headers: estimateHeaders });
  }, true);
}

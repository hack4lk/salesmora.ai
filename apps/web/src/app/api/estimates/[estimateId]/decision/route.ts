import { NextResponse } from "next/server";
import { estimateDecisionCommandSchema, estimateIdSchema } from "@salesmora/contracts";
import { readEstimateDecisionReview, recordEstimateDecision } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

type Context = { params: Promise<{ estimateId: string }> };
export function GET(request: Request, { params }: Context) {
  return estimateRequest(request, async identity => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    return NextResponse.json(await readEstimateDecisionReview(database(), identity, enabledPermissions, estimateId), { headers: estimateHeaders });
  });
}
export function POST(request: Request, { params }: Context) {
  return estimateRequest(request, async (identity, body) => {
    const { estimateId } = await params;
    const input = estimateDecisionCommandSchema.parse(body);
    if (input.estimateId !== estimateId) {
      return NextResponse.json({ error: "The estimate identifier does not match the request." }, { status: 400, headers: estimateHeaders });
    }
    return NextResponse.json(await recordEstimateDecision(database(), identity, enabledPermissions, input), { headers: estimateHeaders });
  }, true);
}

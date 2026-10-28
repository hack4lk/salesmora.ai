import { NextResponse } from "next/server";
import { estimateLeadStageCommandSchema, estimateLeadStageQuerySchema } from "@salesmora/contracts";
import { confirmEstimateLeadStage, readEstimateLeadStageReview } from "@salesmora/data";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";

type Context = { params: Promise<{ estimateId: string }> };
export function GET(request: Request, { params }: Context) {
  return estimateRequest(request, async identity => {
    const { estimateId } = await params;
    const query = new URL(request.url).searchParams;
    const input = estimateLeadStageQuerySchema.parse({
      workspaceId: identity.workspaceId, estimateId,
      sourceSubmissionId: query.get("sourceSubmissionId"),
      expectedEstimateVersion: Number(query.get("expectedEstimateVersion")),
    });
    return NextResponse.json(await readEstimateLeadStageReview(database(), identity, enabledPermissions, input), { headers: estimateHeaders });
  });
}
export function POST(request: Request, { params }: Context) {
  return estimateRequest(request, async (identity, body) => {
    const { estimateId } = await params;
    const input = estimateLeadStageCommandSchema.parse(body);
    if (input.estimateId !== estimateId) {
      return NextResponse.json({ error: "The estimate identifier does not match the request." }, { status: 400, headers: estimateHeaders });
    }
    return NextResponse.json(await confirmEstimateLeadStage(database(), identity, enabledPermissions, input), { headers: estimateHeaders });
  }, true);
}

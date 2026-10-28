import { NextResponse } from "next/server";
import { estimateConversionCommandSchema, estimateIdSchema } from "@salesmora/contracts";
import { convertAcceptedEstimateToJob, readEstimateConversionReview } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

type Context = { params: Promise<{ estimateId: string }> };

export function GET(request: Request, { params }: Context) {
  return estimateRequest(request, async (identity) => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This estimate is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const review = await readEstimateConversionReview(database(), identity, enabledPermissions, estimateId);
    return NextResponse.json(review, { headers: estimateHeaders });
  });
}

export function POST(request: Request, { params }: Context) {
  return estimateRequest(request, async (identity, body) => {
    const { estimateId } = await params;
    const parsed = estimateConversionCommandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Review the job details and try again." }, { status: 422, headers: estimateHeaders });
    }
    if (parsed.data.estimateId !== estimateId) {
      return NextResponse.json({ error: "The estimate identifier does not match the request." }, { status: 400, headers: estimateHeaders });
    }
    const receipt = await convertAcceptedEstimateToJob(database(), identity, enabledPermissions, parsed.data);
    return NextResponse.json(receipt, { headers: estimateHeaders });
  }, true);
}

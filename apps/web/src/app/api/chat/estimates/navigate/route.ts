import { NextResponse } from "next/server";
import { estimateChatNavigateSchema, EstimateContractError } from "@salesmora/contracts";
import { estimateRequest, estimateHeaders } from "../../../../../server/estimates/http";
import { navigateEstimateResult } from "../../../../../server/chat/store";

export async function POST(request: Request) {
  return estimateRequest(request, async (identity, raw) => {
    const parsed = estimateChatNavigateSchema.safeParse(raw);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    const input = parsed.data;
    return NextResponse.json(
      await navigateEstimateResult(
        identity,
        input.turnId,
        input.resultId,
        input.estimateId,
        input.destination,
      ),
      { headers: estimateHeaders },
    );
  }, true);
}

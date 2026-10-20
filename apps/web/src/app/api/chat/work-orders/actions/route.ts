import { NextResponse } from "next/server";
import { workOrderChatDecisionSchema } from "@salesmora/contracts";
import { workOrderHeaders, workOrderRequest } from "../../../../../server/work-orders/http";
import { resolveWorkOrderDraft } from "../../../../../server/chat/work-orders-actions";

export async function POST(request: Request) {
  return workOrderRequest(request, async (identity, raw) => {
    const input = workOrderChatDecisionSchema.parse(raw);
    const result = await resolveWorkOrderDraft(identity, input);
    if (result.csv !== undefined)
      return new Response(result.csv, { headers: { ...workOrderHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${result.csvName}"`, "X-Content-Type-Options": "nosniff" } });
    return NextResponse.json({ draft: result.draft }, { headers: workOrderHeaders });
  }, true);
}

import { NextResponse } from "next/server";
import { EstimateContractError, estimateVoidChatBindingSchema, estimateVoidChatDecisionSchema, estimateVoidChatResponseSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, readEstimateChatVoid, operateEstimateChatVoid } from "@salesmora/data";
import { estimateRequest, estimateHeaders } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export function GET(request: Request) {
  return estimateRequest(request, async identity => {
    const parsed = estimateVoidChatBindingSchema.safeParse(Object.fromEntries(
      [...new URL(request.url).searchParams].filter(([key]) => key !== "workspace")
        .map(([key, value]) => [key, key === "expectedVersion" ? Number(value) : value]),
    ));
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    const view = await readEstimateChatVoid(database(), identity, enabledPermissions, parsed.data);
    return NextResponse.json(estimateVoidChatResponseSchema.parse({ view }), { headers: estimateHeaders });
  });
}
export function POST(request: Request) {
  return estimateRequest(request, async (identity, body) => {
    const parsed = estimateVoidChatDecisionSchema.safeParse(body);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    return NextResponse.json(estimateVoidChatResponseSchema.parse(
      await operateEstimateChatVoid(database(), identity, enabledPermissions, parsed.data.request, parsed.data.decision),
    ), { headers: estimateHeaders });
  }, true);
}

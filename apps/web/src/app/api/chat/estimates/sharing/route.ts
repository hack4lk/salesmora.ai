import { NextResponse } from "next/server";
import {
  EstimateContractError, estimateShareChatBindingSchema, estimateShareChatDecisionSchema,
  estimateShareChatRefreshSchema, estimateShareChatResponseSchema,
} from "@salesmora/contracts";
import { AuthorizationAccessError, readEstimateChatShare, operateEstimateChatShare, refreshEstimateChatShareRecipient } from "@salesmora/data";
import { estimateRequest, estimateHeaders } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export function GET(request: Request) {
  return estimateRequest(request, async identity => {
    const parsed = estimateShareChatBindingSchema.safeParse(Object.fromEntries(
      [...new URL(request.url).searchParams].filter(([key]) => key !== "workspace").map(([key, value]) => [key, key === "expectedVersion" ? Number(value) : value]),
    ));
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    const view = await readEstimateChatShare(database(), identity, enabledPermissions, parsed.data);
    return NextResponse.json(estimateShareChatResponseSchema.parse({ view }), { headers: estimateHeaders });
  });
}
export function POST(request: Request) {
  return estimateRequest(request, async (identity, body) => {
    const parsed = estimateShareChatDecisionSchema.safeParse(body);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    return NextResponse.json(estimateShareChatResponseSchema.parse(
      await operateEstimateChatShare(database(), identity, enabledPermissions, parsed.data.request, parsed.data.decision, parsed.data.paymentLinkReviewed),
    ), { headers: estimateHeaders });
  }, true);
}
export function PATCH(request: Request) {
  return estimateRequest(request, async (identity, body) => {
    const parsed = estimateShareChatRefreshSchema.safeParse(body);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    const view = await refreshEstimateChatShareRecipient(database(), identity, enabledPermissions, parsed.data.request, parsed.data.recipientEmail);
    return NextResponse.json(estimateShareChatResponseSchema.parse({ view }), { headers: estimateHeaders });
  }, true);
}

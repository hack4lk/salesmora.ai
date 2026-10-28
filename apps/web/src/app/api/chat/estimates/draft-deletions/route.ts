import { NextResponse } from "next/server";
import {
  EstimateContractError,
  estimateDraftDeleteChatBindingSchema,
  estimateDraftDeleteChatDecisionSchema,
  estimateDraftDeleteChatResponseSchema,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  operateEstimateChatDraftDelete,
  readEstimateChatDraftDelete,
} from "@salesmora/data";
import { estimateRequest, estimateHeaders } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export function GET(request: Request) {
  return estimateRequest(request, async identity => {
    const parsed = estimateDraftDeleteChatBindingSchema.safeParse(Object.fromEntries(
      [...new URL(request.url).searchParams].filter(([key]) => key !== "workspace")
        .map(([key, value]) => [key, key === "expectedVersion" ? Number(value) : value]),
    ));
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    const view = await readEstimateChatDraftDelete(database(), identity, enabledPermissions, parsed.data);
    return NextResponse.json(estimateDraftDeleteChatResponseSchema.parse({ view }), { headers: estimateHeaders });
  });
}

export function POST(request: Request) {
  return estimateRequest(request, async (identity, body) => {
    const parsed = estimateDraftDeleteChatDecisionSchema.safeParse(body);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    return NextResponse.json(estimateDraftDeleteChatResponseSchema.parse(
      await operateEstimateChatDraftDelete(database(), identity, enabledPermissions, parsed.data),
    ), { headers: estimateHeaders });
  }, true);
}

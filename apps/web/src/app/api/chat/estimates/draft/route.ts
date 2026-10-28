import { NextResponse } from "next/server";
import {
  estimateDraftChatDecisionSchema, estimateDraftChatRefreshSchema, estimateDraftChatResponseSchema,
  EstimateContractError, estimateIdSchema,
} from "@salesmora/contracts";
import { AuthorizationAccessError, operateEstimateChatDraft, refreshEstimateChatDraft, readEstimateChatDraftEditor } from "@salesmora/data";
import { estimateRequest, estimateHeaders } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

export async function GET(request: Request) {
  return estimateRequest(request, async identity => {
    const id = estimateIdSchema.safeParse(new URL(request.url).searchParams.get("proposal"));
    if (!id.success) throw new EstimateContractError(id.error.issues);
    const result = await readEstimateChatDraftEditor(database(), identity, enabledPermissions, id.data);
    return NextResponse.json({ view: result.view }, { headers: estimateHeaders });
  });
}

export async function POST(request: Request) {
  return estimateRequest(request, async (identity, raw) => {
    const parsed = estimateDraftChatDecisionSchema.safeParse(raw);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    const { decision, workspaceId, ...binding } = parsed.data;
    if (workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    return NextResponse.json(estimateDraftChatResponseSchema.parse(
      await operateEstimateChatDraft(database(), identity, enabledPermissions, binding, decision),
    ), { headers: estimateHeaders });
  }, true);
}

export async function PATCH(request: Request) {
  return estimateRequest(request, async (identity, raw) => {
    const parsed = estimateDraftChatRefreshSchema.safeParse(raw);
    if (!parsed.success) throw new EstimateContractError(parsed.error.issues);
    return NextResponse.json(estimateDraftChatResponseSchema.parse(
      await refreshEstimateChatDraft(database(), identity, enabledPermissions, parsed.data.request, parsed.data.content),
    ), { headers: estimateHeaders });
  }, true);
}

import { NextResponse } from "next/server";
import { estimateIdSchema } from "@salesmora/contracts";
import { readEstimateCustomerLink } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../../server/estimates/http";
import { database } from "../../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../../server/authorization/permissions";
import { configuredEstimateSharingAvailable } from "../../../../../../server/estimates/sharing-availability";

export function GET(request: Request, { params }: { params: Promise<{ estimateId: string }> }) {
  return estimateRequest(request, async identity => {
    const { estimateId } = await params;
    if (!configuredEstimateSharingAvailable() || !estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json({ error: "This customer link is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    const result = await readEstimateCustomerLink(database(), identity, enabledPermissions, estimateId);
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

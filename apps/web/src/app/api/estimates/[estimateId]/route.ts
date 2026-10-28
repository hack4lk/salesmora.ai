import { NextResponse } from "next/server";
import {
  deleteEstimateDraftSchema,
  estimateIdSchema,
  updateEstimateDraftSchema,
} from "@salesmora/contracts";
import {
  deleteEstimateDraft,
  readEstimateEditor,
  updateEstimateDraft,
} from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../server/estimates/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";

type RouteContext = { params: Promise<{ estimateId: string }> };

export function GET(request: Request, { params }: RouteContext) {
  return estimateRequest(request, async (identity) => {
    const { estimateId } = await params;
    if (!estimateIdSchema.safeParse(estimateId).success) {
      return NextResponse.json(
        { error: "This estimate is unavailable." },
        { status: 404, headers: estimateHeaders },
      );
    }
    const result = await readEstimateEditor(
      database(),
      identity,
      enabledPermissions,
      estimateId,
    );
    return NextResponse.json(result, { headers: estimateHeaders });
  });
}

export function PATCH(request: Request, { params }: RouteContext) {
  return estimateRequest(
    request,
    async (identity, body) => {
      const { estimateId } = await params;
      if (!estimateIdSchema.safeParse(estimateId).success) {
        return NextResponse.json(
          { error: "This estimate is unavailable." },
          { status: 404, headers: estimateHeaders },
        );
      }
      const input = updateEstimateDraftSchema.parse(body);
      if (input.estimateId !== estimateId) {
        return NextResponse.json(
          { error: "The estimate identifier does not match the request." },
          { status: 400, headers: estimateHeaders },
        );
      }
      const result = await updateEstimateDraft(
        database(),
        identity,
        enabledPermissions,
        input,
      );
      return NextResponse.json(result, { headers: estimateHeaders });
    },
    true,
  );
}

export function DELETE(request: Request, { params }: RouteContext) {
  return estimateRequest(
    request,
    async (identity, body) => {
      const { estimateId } = await params;
      if (!estimateIdSchema.safeParse(estimateId).success) {
        return NextResponse.json(
          { error: "This estimate is unavailable." },
          { status: 404, headers: estimateHeaders },
        );
      }
      const input = deleteEstimateDraftSchema.parse(body);
      if (input.estimateId !== estimateId) {
        return NextResponse.json(
          { error: "The estimate identifier does not match the request." },
          { status: 400, headers: estimateHeaders },
        );
      }
      const result = await deleteEstimateDraft(
        database(),
        identity,
        enabledPermissions,
        input,
      );
      return NextResponse.json({ deleted: true, id: result.id }, { headers: estimateHeaders });
    },
    true,
  );
}

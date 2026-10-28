import { NextResponse } from "next/server";
import {
  duplicateEstimateSchema,
  estimateIdSchema,
} from "@salesmora/contracts";
import { duplicateEstimate } from "@salesmora/data";
import { estimateHeaders, estimateRequest } from "../../../../../server/estimates/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

type RouteContext = { params: Promise<{ estimateId: string }> };

export function POST(request: Request, { params }: RouteContext) {
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
      const input = duplicateEstimateSchema.parse(body);
      if (input.estimateId !== estimateId) {
        return NextResponse.json(
          { error: "The estimate identifier does not match the request." },
          { status: 400, headers: estimateHeaders },
        );
      }
      const result = await duplicateEstimate(
        database(),
        identity,
        enabledPermissions,
        input,
      );
      return NextResponse.json(result, { status: 201, headers: estimateHeaders });
    },
    true,
  );
}

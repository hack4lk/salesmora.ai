import { NextResponse } from "next/server";
import { saveWorkOrderSettings } from "@salesmora/data";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
import { workOrderHeaders, workOrderRequest } from "../../../../server/work-orders/http";

export function PUT(request: Request) {
  return workOrderRequest(request, async (identity, body) =>
    NextResponse.json(await saveWorkOrderSettings(database(), identity, enabledPermissions, body), { headers: workOrderHeaders }), true);
}

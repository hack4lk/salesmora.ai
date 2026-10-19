import { NextResponse } from "next/server";
import { createWorkOrder, readWorkOrders } from "@salesmora/data";
import { createWorkOrderSchema, workOrderQueryFromURL } from "@salesmora/contracts";
import { workOrderRequest, workOrderHeaders } from "../../../server/work-orders/http";
import { database } from "../../../server/workspaces/store";
import { enabledPermissions } from "../../../server/authorization/permissions";
export function GET(request: Request) {
  return workOrderRequest(request, async identity => NextResponse.json(await readWorkOrders(database(), identity, enabledPermissions, workOrderQueryFromURL(identity.workspaceId, new URL(request.url).searchParams)), { headers: workOrderHeaders }));
}
export function POST(request: Request) {
  return workOrderRequest(request, async (identity, body) => NextResponse.json(await createWorkOrder(database(), identity, enabledPermissions, createWorkOrderSchema.parse(body)), { status: 201, headers: workOrderHeaders }), true);
}

import { NextResponse } from "next/server";
import { mutateWorkOrder, readWorkOrderDetail } from "@salesmora/data";
import { workOrderRequest, workOrderHeaders } from "../../../../server/work-orders/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
export async function GET(request: Request, { params }: { params: Promise<{ workOrderId: string }> }) {
  const { workOrderId } = await params;
  return workOrderRequest(request, async identity => NextResponse.json(await readWorkOrderDetail(database(), identity, enabledPermissions, workOrderId), { headers: workOrderHeaders }));
}
export async function PATCH(request: Request, { params }: { params: Promise<{ workOrderId: string }> }) {
  const { workOrderId } = await params;
  return workOrderRequest(request, async (identity, body) => NextResponse.json(await mutateWorkOrder(database(), identity, enabledPermissions, { ...(body as object), workOrderId }), { headers: workOrderHeaders }), true);
}

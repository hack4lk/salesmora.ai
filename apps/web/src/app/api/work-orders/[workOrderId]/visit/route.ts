import { NextResponse } from 'next/server';
import { changeWorkOrderVisit, readWorkOrderVisitManagement, WorkOrderValidationError } from '@salesmora/data';
import { workOrderIdSchema, workOrderVisitChangeSchema } from '@salesmora/contracts';
import { workOrderRequest, workOrderHeaders } from '../../../../../server/work-orders/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
type Params = { params: Promise<{ workOrderId: string }> };
export function GET(request: Request, { params }: Params) {
  return workOrderRequest(request, async identity => NextResponse.json(await readWorkOrderVisitManagement(database(), identity, enabledPermissions,
    workOrderIdSchema.parse((await params).workOrderId)), { headers: workOrderHeaders }));
}
export function PATCH(request: Request, { params }: Params) {
  return workOrderRequest(request, async (identity, body) => {
    const input = workOrderVisitChangeSchema.parse(body);
    if (input.workOrderId !== (await params).workOrderId) throw new WorkOrderValidationError('The Work Order does not match this request.');
    return NextResponse.json(await changeWorkOrderVisit(database(), identity, enabledPermissions, input), { headers: workOrderHeaders });
  }, true);
}

import { NextResponse } from "next/server";
import {
  readCustomer,
  mutateCustomer,
  AuthorizationAccessError,
} from "@salesmora/data";
import { customerMutationSchema } from "@salesmora/contracts";
import { customerIdSchema } from "@salesmora/contracts";
import {
  customerRequest,
  customerHeaders,
} from "../../../../server/customers/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
type Context = { params: Promise<{ customerId: string }> };
export async function GET(request: Request, context: Context) {
  const { customerId } = await context.params;
  return customerRequest(request, async (identity) => {
    if (!customerIdSchema.safeParse(customerId).success)
      throw new AuthorizationAccessError();
    const p = new URL(request.url).searchParams;
    return NextResponse.json(
      await readCustomer(
        database(),
        identity,
        enabledPermissions,
        customerId,
        Number(p.get("activityPage") ?? 1),
        Number(p.get("notesPage") ?? 1),
        Number(p.get("leadsPage") ?? 1),
      ),
      { headers: customerHeaders },
    );
  });
}
export async function PATCH(request: Request, context: Context) {
  const { customerId } = await context.params;
  return customerRequest(
    request,
    async (identity, body) => {
      const input = customerMutationSchema.parse(body);
      if (input.customerId !== customerId) throw new AuthorizationAccessError();
      return NextResponse.json(
        await mutateCustomer(database(), identity, enabledPermissions, input),
        { headers: customerHeaders },
      );
    },
    true,
  );
}
export const DELETE = PATCH;

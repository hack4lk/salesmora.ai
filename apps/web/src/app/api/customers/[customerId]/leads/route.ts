import { NextResponse } from "next/server";
import { searchCustomerLeads, AuthorizationAccessError } from "@salesmora/data";
import { customerIdSchema } from "@salesmora/contracts";
import {
  customerRequest,
  customerHeaders,
} from "../../../../../server/customers/http";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;
  return customerRequest(request, async (identity) => {
    if (!customerIdSchema.safeParse(customerId).success)
      throw new AuthorizationAccessError();
    return NextResponse.json(
      {
        records: await searchCustomerLeads(
          database(),
          identity,
          enabledPermissions,
          customerId,
          new URL(request.url).searchParams.get("q") ?? "",
        ),
      },
      { headers: customerHeaders },
    );
  });
}

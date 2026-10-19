import { NextResponse } from "next/server";
import { readCustomers, createCustomer } from "@salesmora/data";
import { customerQueryFromURL } from "@salesmora/contracts";
import {
  customerRequest,
  customerHeaders,
} from "../../../server/customers/http";
import { database } from "../../../server/workspaces/store";
import { enabledPermissions } from "../../../server/authorization/permissions";
export function GET(request: Request) {
  return customerRequest(request, async (identity) =>
    NextResponse.json(
      await readCustomers(
        database(),
        identity,
        enabledPermissions,
        customerQueryFromURL(
          identity.workspaceId,
          new URL(request.url).searchParams,
        ),
      ),
      { headers: customerHeaders },
    ),
  );
}
export function POST(request: Request) {
  return customerRequest(
    request,
    async (identity, body) =>
      NextResponse.json(
        await createCustomer(database(), identity, enabledPermissions, body),
        { status: 201, headers: customerHeaders },
      ),
    true,
  );
}

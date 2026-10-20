import { exportCustomers } from "@salesmora/data";
import {
  customerRequest,
  customerHeaders,
} from "../../../../server/customers/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";
export function POST(request: Request) {
  return customerRequest(
    request,
    async (identity, body) =>
      new Response(
        await exportCustomers(database(), identity, enabledPermissions, body),
        {
          headers: {
            ...customerHeaders,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="customers.csv"',
            "X-Content-Type-Options": "nosniff",
          },
        },
      ),
    true,
  );
}

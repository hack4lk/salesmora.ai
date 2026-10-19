import { NextResponse } from "next/server";
import { customerChatDecisionSchema } from "@salesmora/contracts";
import {
  customerRequest,
  customerHeaders,
} from "../../../../../server/customers/http";
import { resolveCustomerDraft } from "../../../../../server/chat/customers";
export async function POST(request: Request) {
  return customerRequest(
    request,
    async (identity, raw) => {
      const input = customerChatDecisionSchema.parse(raw);
      const result = await resolveCustomerDraft(identity, input);
      if (result.csv !== undefined)
        return new Response(result.csv, {
          headers: {
            ...customerHeaders,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="customers.csv"',
            "X-Content-Type-Options": "nosniff",
          },
        });
      return NextResponse.json(
        { draft: result.draft },
        { headers: customerHeaders },
      );
    },
    true,
  );
}

import { NextResponse } from "next/server";
import { customerChatNavigateSchema } from "@salesmora/contracts";
import {
  customerRequest,
  customerHeaders,
} from "../../../../../server/customers/http";
import { navigateCustomerResult } from "../../../../../server/chat/customers";
export async function POST(request: Request) {
  return customerRequest(
    request,
    async (identity, raw) => {
      const input = customerChatNavigateSchema.parse(raw);
      return NextResponse.json(
        await navigateCustomerResult(
          identity,
          input.turnId,
          input.recordId,
          input.kind,
        ),
        { headers: customerHeaders },
      );
    },
    true,
  );
}

import "server-only";
import { NextResponse } from "next/server";
import { CustomerContractError, customerIdSchema } from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  CustomerConflictError,
  CustomerDuplicateError,
  CustomerValidationError,
} from "@salesmora/data";
import { getSession } from "../auth/session";
export const customerHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};
export async function customerRequest(
  request: Request,
  run: (
    identity: { userId: string; workspaceId: string },
    body: unknown,
  ) => Promise<Response>,
  write = false,
) {
  if (
    write &&
    (!process.env.BETTER_AUTH_URL ||
      request.headers.get("origin") !==
        new URL(process.env.BETTER_AUTH_URL).origin)
  )
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers: customerHeaders },
    );
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: "Sign in to access customers." },
      { status: 401, headers: customerHeaders },
    );
  try {
    let body: unknown;
    let workspaceId = new URL(request.url).searchParams.get("workspace");
    if (write) {
      const text = await request.text();
      if (text.length > 64000)
        return NextResponse.json(
          { error: "Customer details are too large." },
          { status: 413, headers: customerHeaders },
        );
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Invalid customer request." },
          { status: 400, headers: customerHeaders },
        );
      }
      const object = body as {
        workspaceId?: string;
        query?: { workspaceId?: string };
      };
      workspaceId = object?.workspaceId ?? object?.query?.workspaceId ?? null;
    }
    if (!customerIdSchema.safeParse(workspaceId).success)
      throw new AuthorizationAccessError();
    return await run(
      { userId: session.user.id, workspaceId: workspaceId! },
      body,
    );
  } catch (error) {
    if (error instanceof CustomerDuplicateError)
      return NextResponse.json(
        { error: error.message, code: "duplicate", matches: error.matches },
        { status: 409, headers: customerHeaders },
      );
    if (error instanceof CustomerConflictError)
      return NextResponse.json(
        { error: error.message, code: "conflict" },
        { status: 409, headers: customerHeaders },
      );
    if (error instanceof AuthorizationAccessError)
      return NextResponse.json(
        { error: "This customer or workspace is unavailable." },
        { status: 404, headers: customerHeaders },
      );
    if (
      error instanceof CustomerValidationError ||
      error instanceof CustomerContractError
    )
      return NextResponse.json(
        {
          error:
            error instanceof CustomerValidationError
              ? error.message
              : "Check the customer details and try again.",
        },
        { status: 422, headers: customerHeaders },
      );
    return NextResponse.json(
      { error: "Customers could not be loaded or saved. Try again." },
      { status: 500, headers: customerHeaders },
    );
  }
}

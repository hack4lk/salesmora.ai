import "server-only";
import { NextResponse } from "next/server";
import {
  EstimateContractError,
  estimateIdSchema,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  EstimateDraftConflictError,
  EstimateDraftValidationError,
} from "@salesmora/data";
import { getSession } from "../auth/session";

export const estimateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export type EstimateRequestIdentity = { userId: string; workspaceId: string };

export async function estimateRequest(
  request: Request,
  run: (
    identity: EstimateRequestIdentity,
    body: unknown,
  ) => Promise<Response>,
  write = false,
  workspaceIdFromBody?: (body: unknown) => string | null,
) {
  if (
    write &&
    (!process.env.BETTER_AUTH_URL ||
      request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin)
  ) {
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers: estimateHeaders },
    );
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to access estimates." },
      { status: 401, headers: estimateHeaders },
    );
  }

  let body: unknown;
  let workspaceId = new URL(request.url).searchParams.get("workspace");
  if (write) {
    const text = await request.text();
    if (text.length > 64_000) {
      return NextResponse.json(
        { error: "Estimate details are too large." },
        { status: 413, headers: estimateHeaders },
      );
    }
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid estimate request." },
        { status: 400, headers: estimateHeaders },
      );
    }
    workspaceId = workspaceIdFromBody
      ? workspaceIdFromBody(body)
      : body &&
          typeof body === "object" &&
          "workspaceId" in body &&
          typeof body.workspaceId === "string"
        ? body.workspaceId
        : null;
  }
  const parsedWorkspaceId = estimateIdSchema.safeParse(workspaceId);
  if (!parsedWorkspaceId.success) {
    return NextResponse.json(
      { error: "This workspace is unavailable." },
      { status: 404, headers: estimateHeaders },
    );
  }

  try {
    return await run({ userId: session.user.id, workspaceId: parsedWorkspaceId.data }, body);
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json(
        { error: "This estimate or workspace is unavailable." },
        { status: 404, headers: estimateHeaders },
      );
    }
    if (error instanceof EstimateDraftConflictError) {
      return NextResponse.json(
        { error: error.message, code: "conflict" },
        { status: 409, headers: estimateHeaders },
      );
    }
    if (
      error instanceof EstimateContractError ||
      error instanceof EstimateDraftValidationError
    ) {
      return NextResponse.json(
        { error: error instanceof EstimateDraftValidationError ? error.message : "Check the estimate details and try again." },
        { status: 422, headers: estimateHeaders },
      );
    }
    throw error;
  }
}

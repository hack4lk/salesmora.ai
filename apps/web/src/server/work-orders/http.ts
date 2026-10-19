import "server-only";
import { NextResponse } from "next/server";

import { WorkOrderContractError, workOrderIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, WorkOrderConflictError, WorkOrderValidationError } from "@salesmora/data";
import { WorkOrderLifecycleError } from "@salesmora/domain";
import { getSession } from "../auth/session";
export const workOrderHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };
/** Session identity and workspace are server-validated; all data operations reauthorize. */
export async function workOrderRequest(request: Request, run: (identity: { userId: string; workspaceId: string }, body: unknown) => Promise<Response>, write = false) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers: workOrderHeaders });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to access work orders." }, { status: 401, headers: workOrderHeaders });
  try {
    let body: unknown;
    let workspaceId = new URL(request.url).searchParams.get("workspace");
    if (write) {
      const text = await request.text();
      if (text.length > 64000) return NextResponse.json({ error: "Work order details are too large." }, { status: 413, headers: workOrderHeaders });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid work order request." }, { status: 400, headers: workOrderHeaders }); }
      workspaceId = body && typeof body === "object" && "workspaceId" in body && typeof body.workspaceId === "string" ? body.workspaceId : null;
    }
    if (!workOrderIdSchema.safeParse(workspaceId).success) throw new AuthorizationAccessError();
    return await run({ userId: session.user.id, workspaceId: workspaceId! }, body);
  } catch (error) {
    const known = error instanceof WorkOrderValidationError || error instanceof WorkOrderLifecycleError;
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof WorkOrderConflictError ? 409 : error instanceof WorkOrderContractError || known ? 422 : 500;
    const message = status === 404 ? "This work order or workspace is unavailable." : error instanceof WorkOrderConflictError || known ? (error as Error).message : status === 422 ? "Check the work order details and try again." : "Work orders could not be loaded or saved. Try again.";
    return NextResponse.json({ error: message, ...(status === 409 ? { code: "conflict" } : {}) }, { status, headers: workOrderHeaders });
  }
}

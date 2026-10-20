import "server-only";
import { NextResponse } from "next/server";

import { MaterialContractError, workOrderIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, MaterialConflictError, MaterialValidationError } from "@salesmora/data";
import { getSession } from "../auth/session";
export const materialHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };
/** Session identity and workspace are server-validated; all data operations reauthorize. */
export async function materialRequest(request: Request, run: (identity: { userId: string; workspaceId: string }, body: unknown) => Promise<Response>, write = false) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers: materialHeaders });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to access materials." }, { status: 401, headers: materialHeaders });
  try {
    let body: unknown;
    let workspaceId = new URL(request.url).searchParams.get("workspace");
    if (write) {
      const text = await request.text();
      if (text.length > 16000) return NextResponse.json({ error: "Material details are too large." }, { status: 413, headers: materialHeaders });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid material request." }, { status: 400, headers: materialHeaders }); }
      workspaceId = body && typeof body === "object" && "workspaceId" in body && typeof body.workspaceId === "string" ? body.workspaceId : null;
    }
    if (!workOrderIdSchema.safeParse(workspaceId).success) throw new AuthorizationAccessError();
    return await run({ userId: session.user.id, workspaceId: workspaceId! }, body);
  } catch (error) {
    const known = error instanceof MaterialValidationError;
    const status = error instanceof AuthorizationAccessError ? 404 : error instanceof MaterialConflictError ? 409 : error instanceof MaterialContractError || known ? 422 : 500;
    const message = status === 404 ? "This material or workspace is unavailable." : error instanceof MaterialConflictError || known ? (error as Error).message : status === 422 ? "Check the material details and try again." : "Materials could not be updated. Try again.";
    return NextResponse.json({ error: message, ...(status === 409 ? { code: "conflict" } : {}) }, { status, headers: materialHeaders });
  }
}

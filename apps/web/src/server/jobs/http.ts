import "server-only";
import { NextResponse } from "next/server";
import { JobContractError } from "@salesmora/contracts";
import { jobIdSchema } from "@salesmora/contracts";
import { CalendarSharedReviewRequiredError, JobDeadlineReviewConflict, AuthorizationAccessError, JobConflictError, JobValidationError } from "@salesmora/data";
import { JobLifecycleError } from "@salesmora/domain";
import { getSession } from "../auth/session";
export const jobHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };
/** Session identity and workspace are server-validated; all data operations reauthorize. */
export async function jobRequest(request: Request, run: (identity: { userId: string; workspaceId: string }, body: unknown) => Promise<Response>, write = false) {
  if (write && (!process.env.BETTER_AUTH_URL || request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers: jobHeaders });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to access jobs." }, { status: 401, headers: jobHeaders });
  try {
    let body: unknown;
    let workspaceId = new URL(request.url).searchParams.get("workspace");
    if (write) {
      const text = await request.text();
      if (text.length > 64000) return NextResponse.json({ error: "Job details are too large." }, { status: 413, headers: jobHeaders });
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid job request." }, { status: 400, headers: jobHeaders }); }
      workspaceId = body && typeof body === "object" && "workspaceId" in body && typeof body.workspaceId === "string" ? body.workspaceId : null;
    }
    if (!jobIdSchema.safeParse(workspaceId).success) throw new AuthorizationAccessError();
    return await run({ userId: session.user.id, workspaceId: workspaceId! }, body);
  } catch (error) {
    const status = error instanceof AuthorizationAccessError ? 404 : (error instanceof JobDeadlineReviewConflict || error instanceof JobConflictError || error instanceof CalendarSharedReviewRequiredError) ? 409 : error instanceof JobContractError || error instanceof JobValidationError || error instanceof JobLifecycleError ? 422 : 500;
    const message = status === 404 ? "This job or workspace is unavailable." : error instanceof JobDeadlineReviewConflict || error instanceof JobConflictError || error instanceof CalendarSharedReviewRequiredError || error instanceof JobValidationError || error instanceof JobLifecycleError ? error.message : status === 422 ? "Check the job details and try again." : "Jobs could not be loaded or saved. Try again.";
    return NextResponse.json({ error: message, ...(status === 409 ? { code: error instanceof JobDeadlineReviewConflict ? "deadline-review-changed" : "conflict" } : {}) }, { status, headers: jobHeaders });
  }
}

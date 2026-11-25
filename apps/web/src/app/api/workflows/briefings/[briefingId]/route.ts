import { NextResponse } from "next/server";
import { workOrderIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, readWorkflowBriefingInTransaction } from "@salesmora/data";
import { getSession } from "../../../../../server/auth/session";
import { authorizedWorkspace } from "../../../../../server/authorization/permissions";
import { isWorkspaceSuspended, workspaceSuspendedResponse } from "../../../../../server/http/suspension";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
export async function GET(request: Request, { params }: { params: Promise<{ briefingId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to view this briefing." }, { status: 401, headers });
  const workspace = workOrderIdSchema.safeParse(new URL(request.url).searchParams.get("workspace"));
  const briefing = workOrderIdSchema.safeParse((await params).briefingId);
  if (!workspace.success || !briefing.success) return NextResponse.json({ error: "Invalid briefing." }, { status: 422, headers });
  try {
    const data = await authorizedWorkspace(session.user.id, workspace.data, false,
      (trx, context) => readWorkflowBriefingInTransaction(trx, context, briefing.data));
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: "This briefing is unavailable. Your access may have changed." }, { status: 404, headers });
    return NextResponse.json({ error: "Couldn't load this briefing." }, { status: 500, headers });
  }
}

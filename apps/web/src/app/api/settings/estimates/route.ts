import { NextResponse } from "next/server";
import {
  estimateIdSchema,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  EstimateBusinessProfileConflict,
  EstimateBusinessProfileInvalid,
  EstimateBusinessLogoUnavailable,
  readEstimateBusinessProfile,
  saveEstimateBusinessProfile,
} from "@salesmora/data";
import { getSession } from "../../../../server/auth/session";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

function validWriteOrigin(request: Request) {
  return !!process.env.BETTER_AUTH_URL &&
    request.headers.get("origin") === new URL(process.env.BETTER_AUTH_URL).origin;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to access settings." }, { status: 401, headers });
  }
  const workspaceId = new URL(request.url).searchParams.get("workspace");
  const parsedWorkspace = estimateIdSchema.safeParse(workspaceId);
  if (!parsedWorkspace.success) {
    return NextResponse.json({ error: "These settings are unavailable." }, { status: 404, headers });
  }
  try {
    const result = await readEstimateBusinessProfile(
      database(),
      { userId: session.user.id, workspaceId: parsedWorkspace.data },
      enabledPermissions,
    );
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json({ error: "These settings are unavailable." }, { status: 404, headers });
    }
    if (error instanceof EstimateBusinessLogoUnavailable) {
      return NextResponse.json({ error: "The saved business logo is unavailable." }, { status: 409, headers });
    }
    throw error;
  }
}

export async function PUT(request: Request) {
  if (!validWriteOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to access settings." }, { status: 401, headers });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Use a JSON request." }, { status: 415, headers });
  }
  const text = await request.text();
  if (text.length > 64_000) {
    return NextResponse.json({ error: "Settings are too large." }, { status: 413, headers });
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid settings request." }, { status: 400, headers });
  }
  const workspaceId = body && typeof body === "object" && "workspaceId" in body
    ? body.workspaceId
    : null;
  const parsedWorkspace = estimateIdSchema.safeParse(workspaceId);
  if (!parsedWorkspace.success) {
    return NextResponse.json({ error: "These settings are unavailable." }, { status: 404, headers });
  }
  try {
    const record = await saveEstimateBusinessProfile(
      database(),
      { userId: session.user.id, workspaceId: parsedWorkspace.data },
      enabledPermissions,
      body,
    );
    return NextResponse.json({ record }, { headers });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json({ error: "These settings are unavailable." }, { status: 404, headers });
    }
    if (error instanceof EstimateBusinessProfileConflict) {
      return NextResponse.json({ error: "Settings changed. Reload before saving.", code: "conflict" }, { status: 409, headers });
    }
    if (error instanceof EstimateBusinessProfileInvalid) {
      return NextResponse.json({ error: "Check the settings and uploaded logo before saving." }, { status: 422, headers });
    }
    if (error instanceof EstimateBusinessLogoUnavailable) {
      return NextResponse.json({ error: "The saved business logo is unavailable." }, { status: 409, headers });
    }
    throw error;
  }
}

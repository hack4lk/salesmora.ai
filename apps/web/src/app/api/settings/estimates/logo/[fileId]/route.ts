import { NextResponse } from "next/server";
import { estimateIdSchema } from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  createStorageAdapter,
  readEstimateBusinessLogo,
} from "@salesmora/data";
import { getSession } from "../../../../../../server/auth/session";
import { database } from "../../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../../server/authorization/permissions";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to view this logo." }, { status: 401, headers });
  }
  const { fileId } = await params;
  if (!estimateIdSchema.safeParse(fileId).success) {
    return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers });
  }
  const db = database();
  const file = await db("files")
    .where({ id: fileId, entityType: "estimate-business-profile-logo" })
    .whereNull("deletedAt")
    .first("workspaceId");
  if (!file) {
    return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers });
  }
  try {
    const data = await readEstimateBusinessLogo(
      db,
      createStorageAdapter(),
      { userId: session.user.id, workspaceId: String(file.workspaceId) },
      enabledPermissions,
      fileId,
    );
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "image/webp",
        "Content-Disposition": "inline; filename=\"estimate-logo.webp\"",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers });
    }
    throw error;
  }
}

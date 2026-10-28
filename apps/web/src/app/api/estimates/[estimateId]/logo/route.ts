import { NextResponse } from "next/server";
import { estimateIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, createStorageAdapter, readEstimateSnapshotLogo } from "@salesmora/data";
import { getSession } from "../../../../../server/auth/session";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";
import { estimateHeaders } from "../../../../../server/estimates/http";

export async function GET(_request: Request, { params }: { params: Promise<{ estimateId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to view this logo." }, { status: 401, headers: estimateHeaders });
  const { estimateId } = await params;
  if (!estimateIdSchema.safeParse(estimateId).success) {
    return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers: estimateHeaders });
  }
  const row = await database()("estimates").where({ id: estimateId }).first("workspaceId");
  if (!row) return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers: estimateHeaders });
  try {
    const image = await readEstimateSnapshotLogo(
      database(), createStorageAdapter(), { userId: session.user.id, workspaceId: row.workspaceId },
      enabledPermissions, estimateId,
    );
    return new NextResponse(new Uint8Array(image), {
      headers: { ...estimateHeaders, "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json({ error: "This logo is unavailable." }, { status: 404, headers: estimateHeaders });
    }
    throw error;
  }
}

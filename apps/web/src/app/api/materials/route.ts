import { NextResponse } from "next/server";
import { mutateMaterial, readMaterials } from "@salesmora/data";
import { materialQueryFromURL } from "@salesmora/contracts";
import { materialRequest, materialHeaders } from "../../../server/materials/http";
import { database } from "../../../server/workspaces/store";
import { enabledPermissions } from "../../../server/authorization/permissions";
export function GET(request: Request) {
  return materialRequest(request, async identity => NextResponse.json(await readMaterials(database(), identity, enabledPermissions, materialQueryFromURL(identity.workspaceId, new URL(request.url).searchParams)), { headers: materialHeaders }));
}
export function POST(request: Request) {
  return materialRequest(request, async (identity, body) => NextResponse.json(await mutateMaterial(database(), identity, enabledPermissions, body), { headers: materialHeaders }), true);
}

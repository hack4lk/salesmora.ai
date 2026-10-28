import "server-only";
import { readEstimates } from "@salesmora/data";
import type { EstimateListQuery } from "@salesmora/contracts";
import { enabledPermissions } from "../authorization/permissions";
import { database } from "../workspaces/store";

export function workspaceEstimates(userId: string, query: EstimateListQuery) {
  return readEstimates(
    database(),
    { userId, workspaceId: query.workspaceId },
    enabledPermissions,
    query,
  );
}

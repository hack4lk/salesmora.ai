import "server-only";
import {
  createEstimateCSVExport,
  previewEstimateExport,
} from "@salesmora/data";
import type { EstimateExportRequest } from "@salesmora/contracts";
import { enabledPermissions } from "../authorization/permissions";
import { database } from "../workspaces/store";

export function previewWorkspaceEstimateExport(
  userId: string,
  input: EstimateExportRequest,
) {
  return previewEstimateExport(
    database(),
    { userId, workspaceId: input.query.workspaceId },
    enabledPermissions,
    input,
  );
}

export function exportWorkspaceEstimates(
  userId: string,
  input: EstimateExportRequest,
  signal: AbortSignal,
) {
  return createEstimateCSVExport(
    database(),
    { userId, workspaceId: input.query.workspaceId },
    enabledPermissions,
    input,
    signal,
  );
}

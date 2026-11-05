import type {
  AdminDeletionRequestFilter,
  AdminDeletionRequestRecord,
  AdminDataRequestsResponse,
  AdminWorkspaceExportsResponse,
} from '@salesmora/contracts';

export type AdminDataRequestRole = 'super_admin' | 'support' | 'billing';
export type AdminDeletionRequest = AdminDeletionRequestRecord;
export type AdminDataRequestFilter = AdminDeletionRequestFilter;
export type AdminDataRequestsPageData = AdminDataRequestsResponse;

export type AdminWorkspaceExport = AdminWorkspaceExportsResponse['exports'][number];
export type AdminExportWorkspace = AdminWorkspaceExportsResponse['workspaces'][number];

export type AdminWorkspaceExportRequest = {
  workspaceId: string;
  reason: string;
};

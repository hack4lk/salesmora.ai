export const workspaceRoles = ['owner', 'admin', 'office', 'field'] as const;
export type WorkspaceRole = typeof workspaceRoles[number];
export const permissionScopes = ['enabled', 'workspace', 'assigned', 'related_assigned', 'assigned_job', 'own_assigned'] as const;
export type PermissionScope = typeof permissionScopes[number];
export type ResourceKind = 'workspace' | 'lead' | 'customer' | 'job' | 'work_order' | 'estimate' | 'intake' | 'campaign' | 'calendar' | 'report' | 'activity';
export interface PermissionDefinition {
  readonly description: string;
  readonly resource: ResourceKind;
  readonly mode: 'workspace' | 'collection' | 'record' | 'create';
  readonly scopes: readonly PermissionScope[];
  readonly eligibleRoles: readonly WorkspaceRole[];
  readonly locked: boolean;
  readonly reviewed: boolean;
  readonly dependencies: readonly string[];
  readonly defaults: Readonly<Record<WorkspaceRole, PermissionScope | null>>;
}

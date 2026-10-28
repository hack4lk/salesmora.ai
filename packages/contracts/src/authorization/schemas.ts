import { z } from 'zod';
import { permissionIds } from './catalog';
import { permissionScopes, workspaceRoles } from './types';
const identifier = z.string().min(1).max(200);
export const workspaceRoleSchema = z.enum(workspaceRoles);
export const permissionIdSchema = z.enum(permissionIds);
export const permissionScopeSchema = z.enum(permissionScopes);
export const roleGrantSchema = z.object({ role: workspaceRoleSchema, permission: permissionIdSchema, scope: permissionScopeSchema }).strict();
export const workspacePolicySchema = z.object({
  workspaceId: identifier, revision: z.number().int().nonnegative(), grants: z.array(roleGrantSchema).max(permissionIds.length * workspaceRoles.length),
}).strict();
export type WorkspacePolicy = z.infer<typeof workspacePolicySchema>;
export type RoleGrant = z.infer<typeof roleGrantSchema>;
/** Server-repository facts only. Parsing validates shape, not the provenance of these facts. */
export const authorizationContextSchema = z.object({
  userId: identifier, workspaceId: identifier, ownerUserId: identifier,
  membership: z.object({ userId: identifier, workspaceId: identifier, role: workspaceRoleSchema }).strict(),
  policy: workspacePolicySchema,
  // Explicit intersection of implemented features and applicable plan entitlements.
  enabledPermissions: z.array(permissionIdSchema).max(permissionIds.length),
}).strict();
export type AuthorizationContext = z.infer<typeof authorizationContextSchema>;
const job = z.object({ kind: z.literal('job'), id: identifier, workspaceId: identifier, ownerId: identifier.nullable(), teamUserIds: z.array(identifier).max(1000) }).strict();
const lead = z.object({ kind: z.literal('lead'), id: identifier, workspaceId: identifier, ownerId: identifier.nullable() }).strict();
export const authorizationResourceSchema = z.discriminatedUnion('kind', [
  lead, job,
  z.object({ kind: z.literal('estimate'), id: identifier, workspaceId: identifier, job: job.nullable() }).strict(),
  z.object({ kind: z.literal('work_order'), id: identifier, workspaceId: identifier, job: job.nullable(), assigneeIds: z.array(identifier).max(100).optional(), primaryAssigneeId: identifier.nullable().optional() }).strict(),
  z.object({ kind: z.literal('customer'), id: identifier, workspaceId: identifier, related: z.array(z.union([lead, job])).max(1000) }).strict(),
  z.object({ kind: z.literal('calendar'), id: identifier, workspaceId: identifier, userId: identifier.nullable(), job: job.nullable() }).strict(),
  z.object({ kind: z.enum(['intake', 'campaign']), id: identifier, workspaceId: identifier }).strict(),
]);
export type AuthorizationResource = z.infer<typeof authorizationResourceSchema>;
export const authorizationRequestSchema = z.object({
  permission: permissionIdSchema, resource: authorizationResourceSchema.optional(),
  // Required for any existing-member operation; facts must be reloaded server-side.
  targetMembership: z.object({ userId: identifier, workspaceId: identifier, role: workspaceRoleSchema }).strict().optional(),
  targetRole: workspaceRoleSchema.optional(),
  fields: z.array(z.string().min(1).max(100)).max(100).optional(),
}).strict();
export type AuthorizationRequest = z.infer<typeof authorizationRequestSchema>;
export const policyChangeSchema = z.object({ expectedRevision: z.number().int().nonnegative(), policy: workspacePolicySchema }).strict();
export type PolicyChange = z.infer<typeof policyChangeSchema>;

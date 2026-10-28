import {
  authorizationContextSchema,
  authorizationRequestSchema,
  permissionIdSchema,
  policyChangeSchema,
  type AuthorizationContext,
  type AuthorizationRequest,
  type AuthorizationResource,
  type PermissionId,
  type PermissionScope,
  type ResourceKind,
  type WorkspacePolicy,
  type WorkspaceRole,
} from "@salesmora/contracts";
import { definition, grantScope, validateWorkspacePolicy } from "./policy";

export type AuthorizationDenial = { allowed: false; reason: string };
export type AuthorizedScope = {
  allowed: true;
  permission: PermissionId;
  scope: PermissionScope;
  resourceKind: ResourceKind;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  policyRevision: number;
  /** Report repositories must intersect these source constraints with the report scope. */
  sourceScopes?: Partial<Record<"lead" | "job", "workspace" | "assigned">>;
};
export type AuthorizationDecision = AuthorizedScope | AuthorizationDenial;
const deny = (reason: string): AuthorizationDenial => ({
  allowed: false,
  reason,
});

/** Both inputs must come from current server repositories/configuration, never browser claims. */
function access(
  input: unknown,
  permissionInput: unknown,
): AuthorizationDecision {
  const parsed = authorizationContextSchema.safeParse(input);
  const permissionResult = permissionIdSchema.safeParse(permissionInput);
  if (!parsed.success || !permissionResult.success)
    return deny("invalid-context-or-permission");
  const context = parsed.data;
  const { membership, workspaceId, userId, ownerUserId } = context;
  if (
    membership.userId !== userId ||
    membership.workspaceId !== workspaceId ||
    context.policy.workspaceId !== workspaceId
  )
    return deny("membership-mismatch");
  if ((membership.role === "owner") !== (ownerUserId === userId))
    return deny("ownership-mismatch");
  const policy = validateWorkspacePolicy(context.policy);
  if (!policy.ok) return deny("invalid-policy");
  const permission = permissionResult.data;
  const spec = definition(permission);
  if (!spec.reviewed) return deny("permission-not-reviewed");
  if (!context.enabledPermissions.includes(permission))
    return deny("feature-or-entitlement-unavailable");
  if (!spec.eligibleRoles.includes(membership.role))
    return deny("role-ceiling");
  const scope = grantScope(policy.policy, membership.role, permission);
  if (!scope) return deny("permission-denied");
  for (const dependency of spec.dependencies as readonly PermissionId[]) {
    if (
      !context.enabledPermissions.includes(dependency) ||
      !definition(dependency).reviewed
    )
      return deny("dependency-unavailable");
  }
  return {
    allowed: true,
    permission,
    scope,
    resourceKind: spec.resource,
    workspaceId,
    userId,
    role: membership.role,
    policyRevision: policy.policy.revision,
  };
}

/** Produces a mandatory query constraint, never a boolean permission to read all records. */
export function resolveAuthorizedCollectionScope(
  context: unknown,
  permission: unknown,
): AuthorizationDecision {
  const result = access(context, permission);
  if (!result.allowed) return result;
  if (definition(result.permission).mode !== "collection")
    return deny("not-a-collection-permission");
  if (result.permission === "reports.read") {
    const sourceScopes: NonNullable<AuthorizedScope["sourceScopes"]> = {};
    for (const [kind, permission] of [
      ["lead", "leads.read"],
      ["job", "jobs.read"],
    ] as const) {
      const source = access(context, permission);
      if (
        source.allowed &&
        (source.scope === "workspace" || source.scope === "assigned")
      ) {
        sourceScopes[kind] =
          result.scope === "assigned" || source.scope === "assigned"
            ? "assigned"
            : "workspace";
      }
    }
    if (!Object.keys(sourceScopes).length)
      return deny("no-authorized-report-sources");
    return { ...result, sourceScopes };
  }
  return result;
}

function assignedJob(
  userId: string,
  job: Extract<AuthorizationResource, { kind: "job" }>,
): boolean {
  return job.ownerId === userId || job.teamUserIds.includes(userId);
}
function resourceMatches(
  context: AuthorizationContext,
  result: AuthorizedScope,
  resource: AuthorizationResource,
): boolean {
  if (
    resource.workspaceId !== result.workspaceId ||
    resource.kind !== result.resourceKind
  )
    return false;
  // Validate nested relationship tenant even when the outer grant is workspace-wide.
  if (
    resource.kind === "estimate" ||
    resource.kind === "work_order" ||
    resource.kind === "calendar"
  ) {
    if (resource.job && resource.job.workspaceId !== result.workspaceId)
      return false;
  }
  if (
    resource.kind === "customer" &&
    resource.related.some((record) => record.workspaceId !== result.workspaceId)
  )
    return false;
  if (result.scope === "workspace") return true;
  if (resource.kind === "lead" && result.scope === "assigned")
    return resource.ownerId === result.userId;
  if (resource.kind === "job" && result.scope === "assigned")
    return assignedJob(result.userId, resource);
  if (
    resource.kind === "work_order" &&
    result.scope === "assigned_job" &&
    resource.assigneeIds?.includes(result.userId)
  )
    return true;
  if (
    (resource.kind === "estimate" || resource.kind === "work_order") &&
    result.scope === "assigned_job"
  ) {
    return (
      !!resource.job &&
      assignedJob(result.userId, resource.job) &&
      authorize(context, { permission: "jobs.read", resource: resource.job })
        .allowed
    );
  }
  if (resource.kind === "calendar" && result.scope === "own_assigned") {
    return (
      resource.userId === result.userId ||
      (!!resource.job &&
        assignedJob(result.userId, resource.job) &&
        authorize(context, { permission: "jobs.read", resource: resource.job })
          .allowed)
    );
  }
  if (resource.kind === "customer" && result.scope === "related_assigned") {
    return resource.related.some((record) => {
      const assigned =
        record.kind === "lead"
          ? record.ownerId === result.userId
          : assignedJob(result.userId, record);
      return (
        assigned &&
        authorize(context, {
          permission: record.kind === "lead" ? "leads.read" : "jobs.read",
          resource: record,
        }).allowed
      );
    });
  }
  return false;
}

const ordinaryLeadFields = new Set([
  "customerId",
  "name",
  "email",
  "phone",
  "service",
  "address",
  "details",
  "notes",
  "source",
]);
function checkTarget(
  context: AuthorizationContext,
  request: AuthorizationRequest,
): boolean {
  const { permission, targetMembership: target, targetRole } = request;
  const role = context.membership.role;
  if (permission === "team.invite")
    return (
      !!targetRole &&
      targetRole !== "owner" &&
      (role === "owner" || (role === "admin" && targetRole !== "admin"))
    );
  if (permission !== "team.role.assign" && permission !== "team.remove")
    return true;
  if (
    !target ||
    target.workspaceId !== context.workspaceId ||
    target.role === "owner" ||
    target.userId === context.ownerUserId ||
    target.userId === context.userId
  )
    return false;
  if (role !== "owner" && (role !== "admin" || target.role === "admin"))
    return false;
  return (
    permission === "team.remove" ||
    (!!targetRole &&
      targetRole !== "owner" &&
      (role === "owner" || targetRole !== "admin"))
  );
}

/** Action/record access only. Lifecycle, payload field schemas, quotas, and transactions remain domain-use-case responsibilities. */
export function authorize(
  contextInput: unknown,
  requestInput: unknown,
): AuthorizationDecision {
  const parsed = authorizationRequestSchema.safeParse(requestInput);
  if (!parsed.success) return deny("invalid-request");
  const request = parsed.data;
  const result = access(contextInput, request.permission);
  if (!result.allowed) return result;
  const context = authorizationContextSchema.parse(contextInput);
  const spec = definition(request.permission);
  if (!checkTarget(context, request)) return deny("target-role-denied");
  if (
    request.permission === "jobs.schedule.update" &&
    context.membership.role === "field" &&
    (request.resource?.kind !== "job" ||
      request.resource.ownerId !== context.userId)
  )
    return deny("primary-job-owner-required");
  if (request.permission === "workorders.schedule.update" && context.membership.role === "field" &&
      (request.resource?.kind !== "work_order" || request.resource.primaryAssigneeId !== context.userId)) {
    return deny("primary-work-order-assignee-required");
  }
  if (
    request.permission === "customers.related.read" &&
    context.membership.role === "field" &&
    request.resource?.kind === "customer"
  ) {
    const assigned = request.resource.related.some(
      (record) =>
        (record.kind === "lead"
          ? record.ownerId === context.userId
          : assignedJob(context.userId, record)) &&
        authorize(context, {
          permission: record.kind === "lead" ? "leads.read" : "jobs.read",
          resource: record,
        }).allowed,
    );
    if (!assigned) return deny("field-related-assignment-required");
  }
  if (request.permission === "leads.update") {
    if (
      !request.fields?.length ||
      request.fields.some((field) => !ordinaryLeadFields.has(field))
    )
      return deny("forbidden-fields");
    if (
      request.fields.includes("customerId") &&
      (!access(contextInput, "customers.read").allowed ||
        !access(contextInput, "customers.update").allowed)
    )
      return deny("customer-link-permission-required");
  } else if (request.fields !== undefined) {
    // Do not imply generic field authorization for future schemas.
    return deny("unsupported-field-check");
  }
  if (request.resource) {
    if (!resourceMatches(context, result, request.resource))
      return deny("record-scope-denied");
  } else if (
    spec.mode === "record" ||
    spec.mode === "collection" ||
    result.scope !== "enabled"
  ) {
    return deny("resource-required");
  }
  // A create-only customized policy may not silently choose another assignee.
  if (
    request.permission === "leads.create" &&
    !access(context, "leads.assign").allowed
  )
    return deny("create-assignment-rule-unreviewed");
  return result;
}

export type PolicyChangeDecision =
  | { allowed: true; policy: WorkspacePolicy }
  | AuthorizationDenial;
/** Validates a proposed save; the adapter must atomically compare/lock current revision and write audit+policy. */
export function authorizePolicyChange(
  contextInput: unknown,
  changeInput: unknown,
): PolicyChangeDecision {
  const authority = access(contextInput, "permissions.manage");
  if (!authority.allowed) return authority;
  const parsed = policyChangeSchema.safeParse(changeInput);
  if (!parsed.success) return deny("invalid-policy-change");
  const { policy, expectedRevision } = parsed.data;
  if (policy.workspaceId !== authority.workspaceId)
    return deny("policy-workspace-mismatch");
  if (
    expectedRevision !== authority.policyRevision ||
    policy.revision !== expectedRevision + 1
  )
    return deny("stale-policy-revision");
  const validated = validateWorkspacePolicy(policy);
  return validated.ok
    ? { allowed: true, policy: validated.policy }
    : deny(validated.reason);
}

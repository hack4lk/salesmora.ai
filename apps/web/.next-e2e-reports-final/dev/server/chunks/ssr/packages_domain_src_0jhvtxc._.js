module.exports = [
"[project]/packages/domain/src/authorization/policy.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDefaultWorkspacePolicy",
    ()=>createDefaultWorkspacePolicy,
    "definition",
    ()=>definition,
    "grantScope",
    ()=>grantScope,
    "scopeCovers",
    ()=>scopeCovers,
    "validateWorkspacePolicy",
    ()=>validateWorkspacePolicy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/types.ts [app-rsc] (ecmascript)");
;
function definition(permission) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionCatalog"][permission];
}
function grantScope(policy, role, permission) {
    return policy.grants.find((grant)=>grant.role === role && grant.permission === permission)?.scope;
}
function scopeCovers(read, requested) {
    return read === requested || read === 'workspace';
}
function validateWorkspacePolicy(input) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspacePolicySchema"].safeParse(input);
    if (!parsed.success) return {
        ok: false,
        reason: 'invalid-policy'
    };
    const policy = parsed.data;
    const seen = new Set();
    for (const grant of policy.grants){
        const spec = definition(grant.permission);
        const key = `${grant.role}:${grant.permission}`;
        if (seen.has(key)) return {
            ok: false,
            reason: 'duplicate-grant'
        };
        seen.add(key);
        if (!spec.scopes.includes(grant.scope)) return {
            ok: false,
            reason: 'unsupported-scope'
        };
        if (!spec.eligibleRoles.includes(grant.role)) return {
            ok: false,
            reason: 'role-ceiling'
        };
    }
    for (const role of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceRoles"]){
        for (const permission of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionCatalog"])){
            const spec = definition(permission);
            const scope = grantScope(policy, role, permission);
            if (spec.locked && role === 'owner' && scope !== 'enabled') return {
                ok: false,
                reason: 'protected-owner-power'
            };
            if (!scope) continue;
            for (const dependency of spec.dependencies){
                if (scope === 'enabled' ? !grantScope(policy, role, dependency) : !scopeCovers(grantScope(policy, role, dependency), scope)) return {
                    ok: false,
                    reason: 'missing-read-dependency'
                };
            }
            if (scope === 'assigned_job' && !scopeCovers(grantScope(policy, role, 'jobs.read'), 'assigned')) return {
                ok: false,
                reason: 'missing-job-dependency'
            };
            if (scope === 'related_assigned' && !grantScope(policy, role, 'leads.read') && !grantScope(policy, role, 'jobs.read')) return {
                ok: false,
                reason: 'missing-related-dependency'
            };
        }
    }
    return {
        ok: true,
        policy
    };
}
function createDefaultWorkspacePolicy(workspaceId, revision = 0) {
    const grants = [];
    for (const role of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceRoles"]){
        for (const permission of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionCatalog"])){
            const scope = definition(permission).defaults[role];
            if (scope) grants.push({
                role,
                permission,
                scope
            });
        }
    }
    const result = validateWorkspacePolicy({
        workspaceId,
        revision,
        grants
    });
    if (!result.ok) throw new Error(`Invalid default policy: ${result.reason}`);
    return result.policy;
}
}),
"[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authorize",
    ()=>authorize,
    "authorizePolicyChange",
    ()=>authorizePolicyChange,
    "resolveAuthorizedCollectionScope",
    ()=>resolveAuthorizedCollectionScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/policy.ts [app-rsc] (ecmascript)");
;
;
const deny = (reason)=>({
        allowed: false,
        reason
    });
/** Both inputs must come from current server repositories/configuration, never browser claims. */ function access(input, permissionInput) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizationContextSchema"].safeParse(input);
    const permissionResult = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionIdSchema"].safeParse(permissionInput);
    if (!parsed.success || !permissionResult.success) return deny("invalid-context-or-permission");
    const context = parsed.data;
    const { membership, workspaceId, userId, ownerUserId } = context;
    if (membership.userId !== userId || membership.workspaceId !== workspaceId || context.policy.workspaceId !== workspaceId) return deny("membership-mismatch");
    if (membership.role === "owner" !== (ownerUserId === userId)) return deny("ownership-mismatch");
    const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateWorkspacePolicy"])(context.policy);
    if (!policy.ok) return deny("invalid-policy");
    const permission = permissionResult.data;
    const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["definition"])(permission);
    if (!spec.reviewed) return deny("permission-not-reviewed");
    if (!context.enabledPermissions.includes(permission)) return deny("feature-or-entitlement-unavailable");
    if (!spec.eligibleRoles.includes(membership.role)) return deny("role-ceiling");
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["grantScope"])(policy.policy, membership.role, permission);
    if (!scope) return deny("permission-denied");
    for (const dependency of spec.dependencies){
        if (!context.enabledPermissions.includes(dependency) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["definition"])(dependency).reviewed) return deny("dependency-unavailable");
    }
    return {
        allowed: true,
        permission,
        scope,
        resourceKind: spec.resource,
        workspaceId,
        userId,
        role: membership.role,
        policyRevision: policy.policy.revision
    };
}
function resolveAuthorizedCollectionScope(context, permission) {
    const result = access(context, permission);
    if (!result.allowed) return result;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["definition"])(result.permission).mode !== "collection") return deny("not-a-collection-permission");
    if (result.permission === "reports.read") {
        const sourceScopes = {};
        for (const [kind, permission] of [
            [
                "lead",
                "leads.read"
            ],
            [
                "job",
                "jobs.read"
            ]
        ]){
            const source = access(context, permission);
            if (source.allowed && (source.scope === "workspace" || source.scope === "assigned")) {
                sourceScopes[kind] = result.scope === "assigned" || source.scope === "assigned" ? "assigned" : "workspace";
            }
        }
        if (!Object.keys(sourceScopes).length) return deny("no-authorized-report-sources");
        return {
            ...result,
            sourceScopes
        };
    }
    return result;
}
function assignedJob(userId, job) {
    return job.ownerId === userId || job.teamUserIds.includes(userId);
}
function resourceMatches(context, result, resource) {
    if (resource.workspaceId !== result.workspaceId || resource.kind !== result.resourceKind) return false;
    // Validate nested relationship tenant even when the outer grant is workspace-wide.
    if (resource.kind === "estimate" || resource.kind === "work_order" || resource.kind === "calendar") {
        if (resource.job && resource.job.workspaceId !== result.workspaceId) return false;
    }
    if (resource.kind === "customer" && resource.related.some((record)=>record.workspaceId !== result.workspaceId)) return false;
    if (result.scope === "workspace") return true;
    if (resource.kind === "lead" && result.scope === "assigned") return resource.ownerId === result.userId;
    if (resource.kind === "job" && result.scope === "assigned") return assignedJob(result.userId, resource);
    if (resource.kind === "work_order" && result.scope === "assigned_job" && resource.assigneeIds?.includes(result.userId)) return true;
    if ((resource.kind === "estimate" || resource.kind === "work_order") && result.scope === "assigned_job") {
        return !!resource.job && assignedJob(result.userId, resource.job) && authorize(context, {
            permission: "jobs.read",
            resource: resource.job
        }).allowed;
    }
    if (resource.kind === "calendar" && result.scope === "own_assigned") {
        return resource.userId === result.userId || !!resource.job && assignedJob(result.userId, resource.job) && authorize(context, {
            permission: "jobs.read",
            resource: resource.job
        }).allowed;
    }
    if (resource.kind === "customer" && result.scope === "related_assigned") {
        return resource.related.some((record)=>{
            const assigned = record.kind === "lead" ? record.ownerId === result.userId : assignedJob(result.userId, record);
            return assigned && authorize(context, {
                permission: record.kind === "lead" ? "leads.read" : "jobs.read",
                resource: record
            }).allowed;
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
    "source"
]);
function checkTarget(context, request) {
    const { permission, targetMembership: target, targetRole } = request;
    const role = context.membership.role;
    if (permission === "team.invite") return !!targetRole && targetRole !== "owner" && (role === "owner" || role === "admin" && targetRole !== "admin");
    if (permission !== "team.role.assign" && permission !== "team.remove") return true;
    if (!target || target.workspaceId !== context.workspaceId || target.role === "owner" || target.userId === context.ownerUserId || target.userId === context.userId) return false;
    if (role !== "owner" && (role !== "admin" || target.role === "admin")) return false;
    return permission === "team.remove" || !!targetRole && targetRole !== "owner" && (role === "owner" || targetRole !== "admin");
}
function authorize(contextInput, requestInput) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizationRequestSchema"].safeParse(requestInput);
    if (!parsed.success) return deny("invalid-request");
    const request = parsed.data;
    const result = access(contextInput, request.permission);
    if (!result.allowed) return result;
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizationContextSchema"].parse(contextInput);
    const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["definition"])(request.permission);
    if (!checkTarget(context, request)) return deny("target-role-denied");
    if (request.permission === "jobs.schedule.update" && context.membership.role === "field" && (request.resource?.kind !== "job" || request.resource.ownerId !== context.userId)) return deny("primary-job-owner-required");
    if (request.permission === "workorders.schedule.update" && context.membership.role === "field" && (request.resource?.kind !== "work_order" || request.resource.primaryAssigneeId !== context.userId)) {
        return deny("primary-work-order-assignee-required");
    }
    if (request.permission === "customers.related.read" && context.membership.role === "field" && request.resource?.kind === "customer") {
        const assigned = request.resource.related.some((record)=>(record.kind === "lead" ? record.ownerId === context.userId : assignedJob(context.userId, record)) && authorize(context, {
                permission: record.kind === "lead" ? "leads.read" : "jobs.read",
                resource: record
            }).allowed);
        if (!assigned) return deny("field-related-assignment-required");
    }
    if (request.permission === "leads.update") {
        if (!request.fields?.length || request.fields.some((field)=>!ordinaryLeadFields.has(field))) return deny("forbidden-fields");
        if (request.fields.includes("customerId") && (!access(contextInput, "customers.read").allowed || !access(contextInput, "customers.update").allowed)) return deny("customer-link-permission-required");
    } else if (request.fields !== undefined) {
        // Do not imply generic field authorization for future schemas.
        return deny("unsupported-field-check");
    }
    if (request.resource) {
        if (!resourceMatches(context, result, request.resource)) return deny("record-scope-denied");
    } else if (spec.mode === "record" || spec.mode === "collection" || result.scope !== "enabled") {
        return deny("resource-required");
    }
    // A create-only customized policy may not silently choose another assignee.
    if (request.permission === "leads.create" && !access(context, "leads.assign").allowed) return deny("create-assignment-rule-unreviewed");
    return result;
}
function authorizePolicyChange(contextInput, changeInput) {
    const authority = access(contextInput, "permissions.manage");
    if (!authority.allowed) return authority;
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["policyChangeSchema"].safeParse(changeInput);
    if (!parsed.success) return deny("invalid-policy-change");
    const { policy, expectedRevision } = parsed.data;
    if (policy.workspaceId !== authority.workspaceId) return deny("policy-workspace-mismatch");
    if (expectedRevision !== authority.policyRevision || policy.revision !== expectedRevision + 1) return deny("stale-policy-revision");
    const validated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateWorkspacePolicy"])(policy);
    return validated.ok ? {
        allowed: true,
        policy: validated.policy
    } : deny(validated.reason);
}
}),
"[project]/packages/domain/src/billing/plans.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWorkspacePlan",
    ()=>getWorkspacePlan,
    "remainingPlanAllowance",
    ()=>remainingPlanAllowance,
    "workspacePlanCatalog",
    ()=>workspacePlanCatalog,
    "workspacePlanCatalogVersion",
    ()=>workspacePlanCatalogVersion,
    "workspaceUsagePeriod",
    ()=>workspaceUsagePeriod
]);
const workspacePlanCatalogVersion = '2026-10-13-v1';
const GB = 1_000_000_000;
function plan(id, monthlyPriceCents, limits) {
    return Object.freeze({
        id,
        monthlyPriceCents,
        currency: 'usd',
        limits: Object.freeze(limits)
    });
}
const workspacePlanCatalog = Object.freeze({
    free: plan('free', 0, {
        teammates: 1,
        newLeadsPerMonth: 100,
        publishedCaptureSources: 1,
        aiTokensPerMonth: 1_000_000,
        storageBytes: GB
    }),
    standard: plan('standard', 2900, {
        teammates: 5,
        newLeadsPerMonth: 1000,
        publishedCaptureSources: 5,
        aiTokensPerMonth: 5_000_000,
        storageBytes: 10 * GB
    }),
    premium: plan('premium', 4900, {
        teammates: 20,
        newLeadsPerMonth: 5000,
        publishedCaptureSources: null,
        aiTokensPerMonth: 20_000_000,
        storageBytes: 25 * GB
    })
});
function getWorkspacePlan(id) {
    if (!Object.hasOwn(workspacePlanCatalog, id)) throw new Error('Unknown workspace plan.');
    return workspacePlanCatalog[id];
}
function workspaceUsagePeriod(at) {
    if (!Number.isFinite(at.getTime())) throw new Error('Invalid usage date.');
    const year = at.getUTCFullYear(), month = at.getUTCMonth();
    const start = new Date(0), end = new Date(0);
    start.setUTCFullYear(year, month, 1);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCFullYear(year, month + 1, 1);
    end.setUTCHours(0, 0, 0, 0);
    return {
        start,
        end
    };
}
function remainingPlanAllowance(allowance, consumedOrReserved) {
    if (!Number.isSafeInteger(allowance) || allowance < 0 || !Number.isSafeInteger(consumedOrReserved) || consumedOrReserved < 0) throw new Error('Invalid usage amount.');
    return Math.max(0, allowance - consumedOrReserved);
}
}),
"[project]/packages/domain/src/billing/plan-override.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "effectiveWorkspacePlan",
    ()=>effectiveWorkspacePlan,
    "normalizePlanOverride",
    ()=>normalizePlanOverride,
    "normalizePlanOverrideReason",
    ()=>normalizePlanOverrideReason,
    "planOverrideLatestEnd",
    ()=>planOverrideLatestEnd,
    "planOverrideMaxMonths",
    ()=>planOverrideMaxMonths,
    "planOverridePlans",
    ()=>planOverridePlans,
    "planOverrideReasonMaxLength",
    ()=>planOverrideReasonMaxLength
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-rsc] (ecmascript)");
;
const planOverridePlans = [
    'standard',
    'premium'
];
const planOverrideMaxMonths = 12;
const planOverrideReasonMaxLength = 500;
const rank = {
    free: 0,
    standard: 1,
    premium: 2
};
const after = (value, now)=>Boolean(value) && new Date(value).getTime() > now.getTime();
function effectiveWorkspacePlan(subscription, workspace, now) {
    const paid = subscription?.status === 'active' && after(subscription.paidThrough, now);
    const grace = subscription?.status === 'past_due' && after(subscription.recoveryUntil, now);
    const billedPlan = paid || grace ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspacePlanIdSchema"].parse(subscription?.plan) : 'free';
    const overridePlan = workspace?.planOverride, overrideEnd = workspace?.planOverrideEndsAt;
    const override = overridePlan && planOverridePlans.includes(overridePlan) && after(overrideEnd, now) ? {
        plan: overridePlan,
        endsAt: new Date(overrideEnd)
    } : null;
    const plan = override && rank[override.plan] > rank[billedPlan] ? override.plan : billedPlan;
    return {
        plan,
        billedPlan,
        override
    };
}
function planOverrideLatestEnd(now) {
    const latest = new Date(now.getTime());
    latest.setUTCMonth(latest.getUTCMonth() + planOverrideMaxMonths);
    return latest;
}
function normalizePlanOverride(input, now) {
    if (typeof input.plan !== 'string' || !planOverridePlans.includes(input.plan)) {
        throw new RangeError('The override plan must be Standard or Premium.');
    }
    const endsAt = input.endsAt instanceof Date || typeof input.endsAt === 'string' ? new Date(input.endsAt) : new Date(NaN);
    if (!Number.isFinite(endsAt.getTime())) throw new RangeError('A valid end date is required.');
    if (endsAt.getTime() <= now.getTime()) throw new RangeError('The end date must be in the future.');
    if (endsAt.getTime() > planOverrideLatestEnd(now).getTime()) throw new RangeError(`The end date must be within ${planOverrideMaxMonths} months.`);
    return {
        plan: input.plan,
        endsAt,
        reason: normalizePlanOverrideReason(input.reason)
    };
}
function normalizePlanOverrideReason(reason) {
    const value = typeof reason === 'string' ? reason.trim() : '';
    if (!value) throw new RangeError('A reason is required.');
    if (value.length > planOverrideReasonMaxLength) throw new RangeError(`The reason must be ${planOverrideReasonMaxLength} characters or fewer.`);
    return value;
}
}),
"[project]/packages/domain/src/estimates/decimal.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseEstimateDecimal",
    ()=>parseEstimateDecimal,
    "roundEstimateHalfUp",
    ()=>roundEstimateHalfUp
]);
function parseEstimateDecimal(value, decimals, wholeDigits) {
    const text = value.trim();
    const pattern = new RegExp(`^(?:\\d{1,${wholeDigits}}(?:\\.\\d{0,${decimals}})?|\\.\\d{1,${decimals}})$`);
    if (!pattern.test(text)) return null;
    const [whole, fraction = ""] = text.split(".");
    return BigInt(whole || "0") * (decimals === 3 ? 1000n : 100n) + BigInt(fraction.padEnd(decimals, "0"));
}
function roundEstimateHalfUp(numerator, denominator) {
    return (2n * numerator + denominator) / (2n * denominator);
}
}),
"[project]/packages/domain/src/work-orders/material-cost.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recordedMaterialLineCostCents",
    ()=>recordedMaterialLineCostCents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/decimal.ts [app-rsc] (ecmascript)");
;
function recordedMaterialLineCostCents(quantity, unitCostCents) {
    const thousandths = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEstimateDecimal"])(quantity, 3, 6);
    if (thousandths === null || thousandths <= 0n) return undefined;
    if (unitCostCents === null) return null;
    if (!Number.isSafeInteger(unitCostCents) || unitCostCents < 0 || unitCostCents > 2_147_483_647) return undefined;
    const lineCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(thousandths * BigInt(unitCostCents), 1000n);
    return lineCost <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(lineCost) : undefined;
}
}),
"[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCalendarDays",
    ()=>addCalendarDays,
    "calendarWeekStart",
    ()=>calendarWeekStart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-rsc] (ecmascript) <locals>");
;
const date = (value)=>new Date(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].parse(value)}T12:00:00Z`);
function calendarWeekStart(value) {
    const day = date(value);
    day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
    return day.toISOString().slice(0, 10);
}
function addCalendarDays(value, days) {
    const day = date(value);
    day.setUTCDate(day.getUTCDate() + days);
    return day.toISOString().slice(0, 10);
}
}),
"[project]/packages/domain/src/reports/period.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultReportPreset",
    ()=>defaultReportPreset,
    "resolveReportPeriod",
    ()=>resolveReportPeriod
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
;
;
const isDate = (value)=>!value.startsWith('0000') && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(value).success;
const defaultReportPreset = (context)=>context === 'calendar' ? 'next7days' : 'last30days';
function resolveReportPeriod(selection, today, context) {
    if (!isDate(today)) return {
        error: 'context'
    };
    if (selection.preset !== 'custom' && selection.preset !== defaultReportPreset(context)) return {
        error: 'preset'
    };
    const from = selection.preset === 'custom' ? selection.from : selection.preset === 'last30days' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, -29) : today;
    const to = selection.preset === 'custom' ? selection.to : selection.preset === 'next7days' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, 6) : today;
    if (!from || !to) return {
        error: 'missing'
    };
    if (!isDate(from) || !isDate(to)) return {
        error: 'invalid'
    };
    if (to < from) return {
        error: 'order'
    };
    // Count date labels, not elapsed workspace hours across DST transitions.
    const count = (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000 + 1;
    if (count > 366) return {
        error: 'tooLong'
    };
    return {
        range: {
            from,
            to,
            count
        }
    };
}
}),
"[project]/packages/domain/src/calendar/gantt.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canViewGantt",
    ()=>canViewGantt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
;
const ganttRoles = [
    'owner',
    'admin'
];
const ganttReads = [
    'calendar.read',
    'jobs.read',
    'workorders.read'
];
function canViewGantt(context) {
    if (!ganttRoles.some((role)=>role === context.membership.role)) return false;
    return ganttReads.every((permission)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, permission);
        return scope.allowed && scope.scope === 'workspace';
    });
}
}),
"[project]/packages/domain/src/estimates/items.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEstimateItems",
    ()=>calculateEstimateItems,
    "estimateItemLimits",
    ()=>estimateItemLimits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/decimal.ts [app-rsc] (ecmascript)");
;
const estimateItemLimits = {
    count: 100,
    descriptionLength: 200,
    unitPriceCents: 100_000_000,
    amountCents: 1_000_000_000,
    subtotalCents: 1_000_000_000
};
function calculateItem(item) {
    const errors = {};
    if (!item.description.trim() || item.description.length > estimateItemLimits.descriptionLength) {
        errors.description = "description";
    }
    const quantity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEstimateDecimal"])(item.quantity, 3, 9);
    const price = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEstimateDecimal"])(item.unitPrice, 2, 7);
    if (quantity === null || quantity <= 0n) errors.quantity = "quantity";
    if (price === null || price > BigInt(estimateItemLimits.unitPriceCents)) errors.unitPrice = "unit-price";
    else if (price === 0n && !item.included) errors.unitPrice = "zero-price";
    else if (price !== 0n && item.included) errors.unitPrice = "included-price";
    let amountCents = null;
    if (!errors.quantity && !errors.unitPrice && quantity !== null && price !== null) {
        // Positive values only: round the exact product half up from thousandths of a cent.
        const rounded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(quantity * price, 1000n);
        if (rounded > BigInt(estimateItemLimits.amountCents)) errors.amount = "amount-limit";
        else amountCents = Number(rounded);
    }
    return {
        amountCents,
        errors
    };
}
function calculateEstimateItems(items) {
    if (!items.length || items.length > estimateItemLimits.count) {
        return {
            items: [],
            subtotalCents: null,
            taxableSubtotalCents: null,
            error: items.length ? "too-many-items" : "empty-items"
        };
    }
    const calculated = items.map(calculateItem);
    if (calculated.some((item)=>Object.keys(item.errors).length > 0)) {
        return {
            items: calculated,
            subtotalCents: null,
            taxableSubtotalCents: null,
            error: null
        };
    }
    let subtotal = 0;
    let taxableSubtotal = 0;
    calculated.forEach((item, index)=>{
        if (item.amountCents !== null) {
            subtotal += item.amountCents;
            if (items[index].taxable) taxableSubtotal += item.amountCents;
        }
    });
    if (subtotal > estimateItemLimits.subtotalCents) {
        return {
            items: calculated,
            subtotalCents: null,
            taxableSubtotalCents: null,
            error: "subtotal-limit"
        };
    }
    return {
        items: calculated,
        subtotalCents: subtotal,
        taxableSubtotalCents: taxableSubtotal,
        error: null
    };
}
}),
"[project]/packages/domain/src/estimates/totals.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEstimateTotals",
    ()=>calculateEstimateTotals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/decimal.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$items$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/items.ts [app-rsc] (ecmascript)");
;
;
function percent(value) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEstimateDecimal"])(value, 3, 3);
    return parsed !== null && parsed <= 100000n ? parsed : null;
}
function adjustmentValue(adjustment) {
    if (adjustment.type === "none") return 0n;
    return adjustment.type === "percent" ? percent(adjustment.value) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEstimateDecimal"])(adjustment.value, 2, 8);
}
function calculateEstimateTotals({ items, discount, taxRate, deposit }) {
    const lines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$items$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calculateEstimateItems"])(items);
    const discountValue = adjustmentValue(discount);
    const depositValue = adjustmentValue(deposit);
    const rate = percent(taxRate);
    const result = {
        items: lines,
        errors: {},
        taxRateMilliPercent: rate === null ? null : Number(rate),
        discountCents: null,
        taxableDiscountCents: null,
        nonTaxableDiscountCents: null,
        taxableAfterDiscountCents: null,
        taxCents: null,
        totalCents: null,
        depositCents: null,
        balanceCents: null
    };
    if (discountValue === null) result.errors.discount = discount.type === "percent" ? "discount-percent" : "discount-amount";
    if (rate === null) result.errors.taxRate = "tax-rate";
    if (depositValue === null) result.errors.deposit = deposit.type === "percent" ? "deposit-percent" : "deposit-amount";
    if (lines.subtotalCents === null || lines.taxableSubtotalCents === null || discountValue === null) return result;
    const subtotal = BigInt(lines.subtotalCents);
    const taxable = BigInt(lines.taxableSubtotalCents);
    const discountCents = discount.type === "percent" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(subtotal * discountValue, 100000n) : discountValue;
    if (discountCents > subtotal) {
        result.errors.discount = "discount-exceeds-subtotal";
        return result;
    }
    // Round only the taxable share; the remainder preserves the exact overall discount.
    const taxableDiscount = subtotal === 0n ? 0n : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(discountCents * taxable, subtotal);
    const taxableAfterDiscount = taxable - taxableDiscount;
    result.discountCents = Number(discountCents);
    result.taxableDiscountCents = Number(taxableDiscount);
    result.nonTaxableDiscountCents = Number(discountCents - taxableDiscount);
    result.taxableAfterDiscountCents = Number(taxableAfterDiscount);
    if (rate === null) return result;
    const tax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(taxableAfterDiscount * rate, 100000n);
    const total = subtotal - discountCents + tax;
    result.taxCents = Number(tax);
    result.totalCents = Number(total);
    if (depositValue === null) return result;
    const depositCents = deposit.type === "percent" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$decimal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roundEstimateHalfUp"])(total * depositValue, 100000n) : depositValue;
    if (depositCents > total) {
        result.errors.deposit = "deposit-exceeds-total";
        return result;
    }
    result.depositCents = Number(depositCents);
    result.balanceCents = Number(total - depositCents);
    return result;
}
}),
"[project]/packages/domain/src/estimates/sharing.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateSharingAmounts",
    ()=>estimateSharingAmounts,
    "estimateSharingIssues",
    ()=>estimateSharingIssues,
    "validEstimateFrozenSnapshot",
    ()=>validEstimateFrozenSnapshot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/totals.ts [app-rsc] (ecmascript)");
;
;
function estimateSharingIssues(content) {
    const issues = [];
    if (!content.number.trim() || !content.name.trim()) issues.push("Complete the estimate name and number.");
    const business = content.business;
    if (!business.name.trim() || !business.address.trim() || !business.phone.trim() || !business.email.trim() || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSchema"].shape.email.safeParse(business.email).success) {
        issues.push("Complete the estimate business name, address, phone and reply-to email in Settings.");
    }
    if (!content.recipientName.trim()) issues.push("Provide the prepared-for customer name.");
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSchema"].shape.email.safeParse(content.recipientEmail).success) {
        issues.push("Correct the customer email before sharing.");
    }
    if (business.requireServiceAddress && !content.serviceAddress.trim()) {
        issues.push("Provide the service address before sharing.");
    }
    if (!content.validUntil) issues.push("Choose a valid-until date before sharing.");
    if (!estimateSharingAmounts(content)) issues.push("Complete the line items, discount, tax and deposit before sharing.");
    return issues;
}
function estimateSharingAmounts(content) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])(content);
    const { items, discountCents, taxCents, totalCents, depositCents, balanceCents } = result;
    if (items.error || items.subtotalCents === null || discountCents === null || taxCents === null || totalCents === null || depositCents === null || balanceCents === null || Object.keys(result.errors).length) return null;
    const lineAmountsCents = [];
    for (const line of items.items){
        if (line.amountCents === null || Object.keys(line.errors).length) return null;
        lineAmountsCents.push(line.amountCents);
    }
    return {
        lineAmountsCents,
        subtotalCents: items.subtotalCents,
        discountCents,
        taxCents,
        totalCents,
        depositCents,
        balanceCents
    };
}
function validEstimateFrozenSnapshot(raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateFrozenSnapshotSchema"].safeParse(raw);
    if (!parsed.success || estimateSharingIssues(parsed.data.content).length) return null;
    const expected = estimateSharingAmounts(parsed.data.content);
    if (!expected) return null;
    for (const key of [
        "subtotalCents",
        "discountCents",
        "taxCents",
        "totalCents",
        "depositCents",
        "balanceCents"
    ]){
        if (expected[key] !== parsed.data.amounts[key]) return null;
    }
    const lines = parsed.data.amounts.lineAmountsCents;
    if (lines.length !== expected.lineAmountsCents.length || lines.some((amount, index)=>amount !== expected.lineAmountsCents[index])) return null;
    return parsed.data;
}
}),
"[project]/packages/domain/src/jobs/deadline.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultJobDeadline",
    ()=>defaultJobDeadline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/job-notification-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
;
;
function defaultJobDeadline(createdDate, raw) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].parse(createdDate);
    const rule = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultDeadlineRuleSchema"].parse(raw);
    if (rule.mode === 'unset') return null;
    if (rule.count === 'calendar') return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(createdDate, rule.days));
    let date = createdDate, remaining = rule.days;
    while(remaining > 0){
        date = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(date, 1));
        const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
        if (weekday !== 0 && weekday !== 6) remaining--;
    }
    return date;
}
}),
"[project]/packages/domain/src/calendar/availability.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarDateCandidates",
    ()=>calendarDateCandidates,
    "calendarWindowsOverlap",
    ()=>calendarWindowsOverlap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
;
const span = (window)=>window.split('-').map((t)=>Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
function calendarWindowsOverlap(a, b) {
    const [startA, endA] = span(a), [startB, endB] = span(b);
    return startA < endB && startB < endA;
}
function calendarDateCandidates(input) {
    const visits = [
        ...new Map(input.visits.map((v)=>[
                v.id,
                v
            ])).values()
    ];
    const candidates = [];
    for(let date = input.from; date <= input.to; date = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(date, 1)){
        if (!input.includeWeekends && [
            0,
            6
        ].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) continue;
        for (const person of input.people){
            const work = visits.filter((v)=>v.scheduledDate === date && v.crew.some((p)=>p.id === person.id));
            if (input.arrivalWindow && work.some((v)=>v.arrivalWindow && calendarWindowsOverlap(input.arrivalWindow, v.arrivalWindow))) continue;
            const unknownWindowCount = work.filter((v)=>!v.arrivalWindow).length;
            candidates.push({
                date,
                person,
                visitCount: work.length,
                unknownWindowCount,
                timing: input.arrivalWindow && (!work.length || unknownWindowCount < work.length) ? 'no-known-overlap' : 'not-checked'
            });
        }
    }
    // Fewer visits first, then fewer unknown windows, then earliest date and stable person identity.
    return candidates.sort((a, b)=>a.visitCount - b.visitCount || a.unknownWindowCount - b.unknownWindowCount || a.date.localeCompare(b.date) || a.person.id.localeCompare(b.person.id));
}
}),
"[project]/packages/domain/src/admin/authorize.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authorizeAdmin",
    ()=>authorizeAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/catalog.ts [app-rsc] (ecmascript)");
;
function authorizeAdmin(roleInput, permissionInput) {
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["staffRoleIdSchema"].safeParse(roleInput);
    if (!role.success) return {
        allowed: false,
        reason: 'invalid-role'
    };
    const permission = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminPermissionIdSchema"].safeParse(permissionInput);
    if (!permission.success) return {
        allowed: false,
        reason: 'invalid-permission'
    };
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["staffRolePermissions"][role.data].includes(permission.data)) {
        return {
            allowed: false,
            reason: 'permission-denied'
        };
    }
    return {
        allowed: true,
        role: role.data,
        permission: permission.data
    };
}
}),
"[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/policy.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$material$2d$cost$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/material-cost.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$gantt$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/gantt.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$items$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/items.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/totals.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/sharing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/deadline.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/availability.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$admin$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/admin/authorize.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
];

//# sourceMappingURL=packages_domain_src_0jhvtxc._.js.map
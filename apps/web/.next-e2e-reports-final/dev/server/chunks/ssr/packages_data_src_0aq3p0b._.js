module.exports = [
"[project]/packages/data/src/database.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDatabase",
    ()=>createDatabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$knex__$5b$external$5d$__$28$knex$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$knex$40$3$2e$3$2e$0_pg$40$8$2e$23$2e$1$2f$node_modules$2f$knex$29$__ = __turbopack_context__.i("[externals]/knex [external] (knex, cjs, [project]/node_modules/.pnpm/knex@3.3.0_pg@8.23.1/node_modules/knex)");
;
function createDatabase(connectionString) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$knex__$5b$external$5d$__$28$knex$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$knex$40$3$2e$3$2e$0_pg$40$8$2e$23$2e$1$2f$node_modules$2f$knex$29$__["default"])({
        client: 'pg',
        connection: connectionString,
        pool: {
            min: 0,
            max: 5
        }
    });
}
}),
"[project]/packages/data/src/auth-pool.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createAuthPool",
    ()=>createAuthPool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/.pnpm/pg@8.23.1/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function createAuthPool(connectionString, searchPath) {
    return new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__["default"].Pool({
        connectionString,
        max: 5,
        ...searchPath ? {
            options: `-c search_path=${searchPath}`
        } : {}
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/data/src/authorization/defaults-v1.json.[json].mjs [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
"use turbopack no side effects";
const __TURBOPACK__default__export__ = JSON.parse("[{\"role\":\"owner\",\"permission\":\"home.access\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"leads.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.create\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"leads.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.stage.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.assign\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.delete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.related.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.create\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"customers.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.delete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.create\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"jobs.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.schedule.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.assign\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.status.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.progress.create\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.complete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.cancel\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.reopen\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.delete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"calendar.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.create\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.send\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.decide\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.void\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.delete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"estimates.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"intake.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"intake.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"intake.approve\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"intake.dismiss\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"campaigns.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"campaigns.create\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"campaigns.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"campaigns.activate\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"campaigns.pause\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"campaigns.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"reports.read\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"leads.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"customers.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"jobs.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"activity.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"settings.business.read\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"settings.business.update\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"integrations.read\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"integrations.manage\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"team.read\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"team.invite\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"team.role.assign\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"team.remove\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"permissions.read\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"permissions.manage\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"billing.manage\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"ownership.transfer\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"workspace.delete\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"assistant.use\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"home.access\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"leads.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.create\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"leads.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.stage.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.assign\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.delete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.related.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.create\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"customers.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.delete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.create\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"jobs.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.schedule.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.assign\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.status.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.progress.create\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.complete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.cancel\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.reopen\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.delete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"calendar.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.create\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.send\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.decide\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.void\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.delete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"estimates.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"intake.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"intake.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"intake.approve\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"intake.dismiss\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"campaigns.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"campaigns.create\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"campaigns.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"campaigns.activate\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"campaigns.pause\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"campaigns.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"reports.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"leads.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"customers.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"jobs.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"activity.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"settings.business.read\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"settings.business.update\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"integrations.read\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"integrations.manage\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"team.read\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"team.invite\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"team.role.assign\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"team.remove\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"assistant.use\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"home.access\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"leads.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"leads.create\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"leads.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"leads.stage.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"leads.assign\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"customers.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"customers.related.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"customers.create\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"customers.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.create\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"jobs.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.schedule.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.assign\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.status.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.progress.create\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.complete\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"jobs.cancel\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"calendar.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.create\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.send\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.decide\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.void\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.archive\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"estimates.delete\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"intake.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"intake.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"intake.approve\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"intake.dismiss\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"campaigns.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"campaigns.create\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"campaigns.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"campaigns.activate\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"campaigns.pause\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"reports.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"assistant.use\",\"scope\":\"enabled\"},{\"role\":\"field\",\"permission\":\"home.access\",\"scope\":\"enabled\"},{\"role\":\"field\",\"permission\":\"leads.read\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"leads.update\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"leads.stage.update\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"customers.related.read\",\"scope\":\"related_assigned\"},{\"role\":\"field\",\"permission\":\"jobs.read\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"jobs.status.update\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"jobs.progress.create\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"jobs.complete\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"calendar.read\",\"scope\":\"own_assigned\"},{\"role\":\"field\",\"permission\":\"estimates.read\",\"scope\":\"assigned_job\"},{\"role\":\"field\",\"permission\":\"estimates.create\",\"scope\":\"assigned_job\"},{\"role\":\"field\",\"permission\":\"estimates.update\",\"scope\":\"assigned_job\"},{\"role\":\"field\",\"permission\":\"estimates.send\",\"scope\":\"assigned_job\"},{\"role\":\"field\",\"permission\":\"estimates.decide\",\"scope\":\"assigned_job\"},{\"role\":\"field\",\"permission\":\"reports.read\",\"scope\":\"assigned\"},{\"role\":\"field\",\"permission\":\"assistant.use\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"workorders.read\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.read\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.read\",\"scope\":\"workspace\"},{\"role\":\"field\",\"permission\":\"workorders.read\",\"scope\":\"assigned_job\"},{\"role\":\"owner\",\"permission\":\"workorders.create\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"workorders.create\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"workorders.create\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"workorders.update\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.update\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.update\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.issue\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.issue\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.issue\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.progress\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.progress\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.progress\",\"scope\":\"workspace\"},{\"role\":\"field\",\"permission\":\"workorders.progress\",\"scope\":\"assigned_job\"},{\"role\":\"owner\",\"permission\":\"workorders.complete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.complete\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.complete\",\"scope\":\"workspace\"},{\"role\":\"field\",\"permission\":\"workorders.complete\",\"scope\":\"assigned_job\"},{\"role\":\"owner\",\"permission\":\"workorders.cancel\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.cancel\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.cancel\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.reopen\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.reopen\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.reopen\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.archive\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.archive\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.delete\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.delete\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.export\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.export\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.view_prices\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.view_prices\",\"scope\":\"workspace\"},{\"role\":\"office\",\"permission\":\"workorders.view_prices\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"workorders.view_costs\",\"scope\":\"workspace\"},{\"role\":\"admin\",\"permission\":\"workorders.view_costs\",\"scope\":\"workspace\"},{\"role\":\"owner\",\"permission\":\"materials.read\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"materials.read\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"materials.read\",\"scope\":\"enabled\"},{\"role\":\"field\",\"permission\":\"materials.read\",\"scope\":\"enabled\"},{\"role\":\"office\",\"permission\":\"materials.propose\",\"scope\":\"enabled\"},{\"role\":\"owner\",\"permission\":\"materials.manage\",\"scope\":\"enabled\"},{\"role\":\"admin\",\"permission\":\"materials.manage\",\"scope\":\"enabled\"}]");
}),
"[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthorizationAccessError",
    ()=>AuthorizationAccessError,
    "AuthorizationConflictError",
    ()=>AuthorizationConflictError,
    "WorkspaceSuspendedError",
    ()=>WorkspaceSuspendedError,
    "authorizedLeadPipelineCounts",
    ()=>authorizedLeadPipelineCounts,
    "initializeWorkspacePolicy",
    ()=>initializeWorkspacePolicy,
    "listAuthorizedLeads",
    ()=>listAuthorizedLeads,
    "loadWorkspaceAuthorization",
    ()=>loadWorkspaceAuthorization,
    "saveWorkspacePolicy",
    ()=>saveWorkspacePolicy,
    "withWorkspaceAuthorization",
    ()=>withWorkspaceAuthorization
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$defaults$2d$v1$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/defaults-v1.json.[json].mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/policy.ts [app-rsc] (ecmascript)");
;
;
;
class AuthorizationAccessError extends Error {
    constructor(){
        super('Access denied.');
    }
}
class WorkspaceSuspendedError extends AuthorizationAccessError {
    constructor(){
        super();
        this.message = 'This workspace is unavailable. Contact support.';
    }
}
class AuthorizationConflictError extends Error {
    constructor(){
        super('Permissions changed. Reload before saving.');
    }
}
async function loadContext(trx, identity, enabledPermissions) {
    const workspace = await trx('workspaces').where({
        id: identity.workspaceId
    }).whereNull('deletionRequestedAt').first('ownerId');
    const user = await trx('users').where({
        id: identity.userId
    }).whereNull('deletionRequestedAt').whereNull('suspendedAt').first('id');
    const membership = await trx('workspaceMemberships').where(identity).first('userId', 'workspaceId', 'role');
    const head = await trx('workspacePolicies').where({
        workspaceId: identity.workspaceId
    }).first('revision');
    if (!user || !workspace || !membership || !head) throw new AuthorizationAccessError();
    const grants = await trx('workspaceRolePolicies').where({
        workspaceId: identity.workspaceId
    }).select('role', 'permission', 'scope');
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizationContextSchema"].safeParse({
        ...identity,
        ownerUserId: workspace.ownerId,
        membership,
        policy: {
            workspaceId: identity.workspaceId,
            revision: head.revision,
            grants
        },
        enabledPermissions
    });
    if (!parsed.success || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateWorkspacePolicy"])(parsed.data.policy).ok || membership.role === 'owner' !== (workspace.ownerId === identity.userId)) throw new AuthorizationAccessError();
    return parsed.data;
}
async function lockedWorkspace(trx, workspaceId, write) {
    const query = trx('workspaces').where({
        id: workspaceId
    }).whereNull('deletionRequestedAt');
    const row = await (write ? query.forUpdate() : query.forShare()).first('id', 'suspendedAt');
    if (!row) throw new AuthorizationAccessError();
    if (row.suspendedAt) throw new WorkspaceSuspendedError();
}
async function withWorkspaceAuthorization(db, identity, enabledPermissions, write, use) {
    return db.transaction(async (trx)=>{
        await lockedWorkspace(trx, identity.workspaceId, write);
        return use(trx, await loadContext(trx, identity, enabledPermissions));
    });
}
async function loadWorkspaceAuthorization(db, identity, enabledPermissions) {
    return withWorkspaceAuthorization(db, identity, enabledPermissions, false, async (_trx, context)=>context);
}
async function initializeWorkspacePolicy(trx, identity) {
    await lockedWorkspace(trx, identity.workspaceId, true);
    const workspace = await trx('workspaces').where({
        id: identity.workspaceId,
        ownerId: identity.userId
    }).first('id');
    const owner = await trx('workspaceMemberships').where({
        ...identity,
        role: 'owner'
    }).first('userId');
    if (!workspace || !owner || await trx('workspacePolicies').where({
        workspaceId: identity.workspaceId
    }).first()) throw new AuthorizationAccessError();
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateWorkspacePolicy"])({
        workspaceId: identity.workspaceId,
        revision: 0,
        grants: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$defaults$2d$v1$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
            {
                role: "office",
                permission: "leadCapture.archive",
                scope: "workspace"
            },
            {
                role: "field",
                permission: "jobs.schedule.update",
                scope: "assigned"
            },
            ...[
                "owner",
                "admin",
                "office"
            ].map((role)=>({
                    role,
                    permission: "workorders.schedule.update",
                    scope: "workspace"
                })),
            {
                role: "field",
                permission: "workorders.schedule.update",
                scope: "assigned_job"
            },
            {
                role: 'owner',
                permission: 'billing.read',
                scope: 'enabled'
            },
            {
                role: 'admin',
                permission: 'billing.read',
                scope: 'enabled'
            }
        ]
    });
    if (!result.ok) throw new AuthorizationAccessError();
    await trx('workspacePolicies').insert({
        workspaceId: identity.workspaceId,
        revision: 0,
        templateVersion: 1
    });
    await trx('workspaceRolePolicies').insert(result.policy.grants.map((grant)=>({
            workspaceId: identity.workspaceId,
            ...grant
        })));
    await trx('authorizationAudit').insert({
        workspaceId: identity.workspaceId,
        actorId: identity.userId,
        action: 'workspace.seeded',
        beforeRevision: null,
        afterRevision: 0,
        afterPolicy: JSON.stringify(result.policy)
    });
    return result.policy;
}
async function saveWorkspacePolicy(db, identity, enabledPermissions, change) {
    return db.transaction(async (trx)=>{
        await lockedWorkspace(trx, identity.workspaceId, true);
        const context = await loadContext(trx, identity, enabledPermissions);
        const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizePolicyChange"])(context, change);
        if (!decision.allowed) {
            if (decision.reason === 'stale-policy-revision') throw new AuthorizationConflictError();
            throw new AuthorizationAccessError();
        }
        await trx('workspaceRolePolicies').where({
            workspaceId: identity.workspaceId
        }).delete();
        await trx('workspaceRolePolicies').insert(decision.policy.grants.map((grant)=>({
                workspaceId: identity.workspaceId,
                ...grant
            })));
        await trx('workspacePolicies').where({
            workspaceId: identity.workspaceId
        }).update({
            revision: decision.policy.revision,
            updatedAt: trx.fn.now()
        });
        await trx('authorizationAudit').insert({
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            action: 'policy.saved',
            beforeRevision: context.policy.revision,
            afterRevision: decision.policy.revision,
            beforePolicy: JSON.stringify(context.policy),
            afterPolicy: JSON.stringify(decision.policy)
        });
        return decision.policy;
    });
}
async function withLeadQuery(db, identity, enabledPermissions, read) {
    return db.transaction(async (trx)=>{
        // Membership/policy mutations take the same workspace's exclusive lock. No stale decision is reused.
        await lockedWorkspace(trx, identity.workspaceId, false);
        const context = await loadContext(trx, identity, enabledPermissions);
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
        if (!scope.allowed || scope.resourceKind !== 'lead' || ![
            'workspace',
            'assigned'
        ].includes(scope.scope)) throw new AuthorizationAccessError();
        const query = trx('leads').where({
            workspaceId: scope.workspaceId
        });
        if (scope.scope === 'assigned') query.andWhere({
            ownerId: scope.userId
        });
        return read(query);
    });
}
async function listAuthorizedLeads(db, identity, enabledPermissions, limit = 50) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Limit must be between 1 and 100.');
    return withLeadQuery(db, identity, enabledPermissions, async (query)=>query.whereNull('archivedAt').select('id', 'name', 'service', 'stage', 'ownerId', 'createdAt').orderBy('createdAt', 'desc').orderBy('id', 'desc').limit(limit));
}
async function authorizedLeadPipelineCounts(db, identity, enabledPermissions) {
    return withLeadQuery(db, identity, enabledPermissions, async (query)=>{
        const rows = await query.whereNull('archivedAt').select('stage').count({
            count: '*'
        }).groupBy('stage');
        return Object.fromEntries(rows.map((row)=>[
                row.stage,
                Number(row.count)
            ]));
    });
}
}),
"[project]/packages/data/src/leads/csv.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "csvCell",
    ()=>csvCell,
    "csvLine",
    ()=>csvLine,
    "leadCSVHeaders",
    ()=>leadCSVHeaders
]);
const leadCSVHeaders = [
    'Lead ID',
    'Lead #',
    'Name',
    'Email',
    'Phone',
    'Service',
    'Address',
    'Details',
    'Internal notes',
    'Source',
    'Stage',
    'Owner name',
    'Owner ID',
    'Created',
    'Updated',
    'Archived'
];
function csvCell(value) {
    let text = value == null ? '' : String(value);
    if (/^[\s\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
}
function csvLine(values) {
    return values.map(csvCell).join(',') + '\r\n';
}
}),
"[project]/packages/data/src/leads/export-access.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveExportScope",
    ()=>resolveExportScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
;
function resolveExportScope(context) {
    const read = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read'), exp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.export');
    if (!read.allowed || !exp.allowed || read.resourceKind !== 'lead' || exp.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(read.scope) || ![
        'workspace',
        'assigned'
    ].includes(exp.scope)) return null;
    return read.scope === 'assigned' || exp.scope === 'assigned' ? 'assigned' : 'workspace';
}
}),
"[project]/packages/data/src/leads/query.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "filteredLeadQuery",
    ()=>filteredLeadQuery,
    "scopedLeadQuery",
    ()=>scopedLeadQuery,
    "workspaceTimezone",
    ()=>workspaceTimezone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
function scopedLeadQuery(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leads as l').where('l.workspaceId', scope.workspaceId);
    if (scope.scope === 'assigned') query.andWhere('l.ownerId', context.userId);
    return {
        query,
        scope: scope.scope
    };
}
async function workspaceTimezone(trx, workspaceId) {
    const row = await trx('workspaces').where({
        id: workspaceId
    }).first('timezone');
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: row.timezone
        }).format();
        return row.timezone;
    } catch  {
        return 'UTC';
    }
}
function filteredLeadQuery(query, input, identity, zone) {
    if (!input.archived) query.whereNull('l.archivedAt');
    if (input.stages.length) query.whereIn('l.stage', input.stages);
    if (input.sources.length) query.whereIn('l.source', input.sources);
    if (input.ownerIds.length) query.andWhere(function() {
        const ids = input.ownerIds.filter((id)=>id !== 'unassigned').map((id)=>id === 'me' ? identity.userId : id);
        if (ids.length) this.whereIn('l.ownerId', ids);
        if (input.ownerIds.includes('unassigned')) this.orWhereRaw(`NOT EXISTS (SELECT 1 FROM "workspaceMemberships" um WHERE um."workspaceId" = l."workspaceId" AND um."userId" = l."ownerId")`);
    });
    if (input.attention) query.andWhere(function() {
        this.whereRaw(`NOT EXISTS (SELECT 1 FROM "workspaceMemberships" um WHERE um."workspaceId" = l."workspaceId" AND um."userId" = l."ownerId")`).orWhereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`);
    });
    if (input.q.length >= 2) {
        const like = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`, digits = input.q.replace(/\D/g, '');
        query.andWhere(function() {
            for (const field of [
                'name',
                'email',
                'service',
                'address'
            ])this.orWhereILike(`l.${field}`, like);
            if (/^[+()\d\s.-]+$/.test(input.q) && digits.length >= 2) this.orWhereRaw(`regexp_replace(l.phone,'[^0-9]','','g') LIKE ?`, [
                `%${digits}%`
            ]);
            else this.orWhereILike('l.phone', like);
        });
    }
    if (input.created === 'custom') query.whereRaw(`l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [
        input.from,
        zone,
        input.to,
        zone
    ]);
    else if (input.created !== 'any') query.whereRaw(`l."createdAt" >= ((((CURRENT_TIMESTAMP AT TIME ZONE ?)::date - ?)::timestamp) AT TIME ZONE ?) AND l."createdAt" < ((((CURRENT_TIMESTAMP AT TIME ZONE ?)::date + 1)::timestamp) AT TIME ZONE ?)`, [
        zone,
        input.created === '7days' ? 6 : 29,
        zone,
        zone,
        zone
    ]);
    return query;
}
}),
"[project]/packages/data/src/leads/origin.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadOrigin",
    ()=>leadOrigin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$compatibility$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/compatibility.ts [app-rsc] (ecmascript)");
;
function leadOrigin(changes) {
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadCreationProvenanceSchema"].parse(changes);
    const origin = value.origin ?? (value.source === 'gmail' ? 'gmail' : 'manual');
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$compatibility$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canonicalCaptureOrigin"])(origin);
}
}),
"[project]/packages/data/src/leads/read.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readLead",
    ()=>readLead,
    "readLeadHistoryInTransaction",
    ()=>readLeadHistoryInTransaction,
    "readLeadRecordInTransaction",
    ()=>readLeadRecordInTransaction,
    "readLeads",
    ()=>readLeads
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$origin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/origin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const fields = [
    'id',
    'leadNumber',
    'version',
    'name',
    'service',
    'email',
    'phone',
    'address',
    'details',
    'notes',
    'stage',
    'source',
    'ownerId',
    'createdAt',
    'updatedAt',
    'lastActivityAt',
    'archivedAt'
].map((field)=>`l.${field}`);
// These record permissions have workspace-only scope. This projects the grant for read UI/roster
// availability, not permission to mutate any particular lead (writes must load that lead again).
function workspaceGrant(context, permission) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission,
        resource: {
            kind: 'lead',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            ownerId: null
        }
    }).allowed;
}
function canArchive(context) {
    return workspaceGrant(context, 'leads.archive');
}
function select(query, trx) {
    return query.leftJoin('leadActivity as c', function() {
        this.on('c.id', 'l.id').andOn('c.workspaceId', 'l.workspaceId');
    }).leftJoin('users as u', 'u.id', 'l.ownerId').leftJoin('workspaceMemberships as m', function() {
        this.on('m.userId', 'l.ownerId').andOn('m.workspaceId', 'l.workspaceId');
    }).select(...fields, 'c.changes as creationChanges', trx.raw('coalesce(u.name,l."ownerName") as "ownerName"'), 'm.userId as memberId', trx.raw(`((l."ownerId" IS NULL OR m."userId" IS NULL) OR l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days') as "needsAttention"`));
}
function dto(row, context) {
    return {
        id: row.id,
        leadNumber: `LD-${String(row.leadNumber).padStart(4, '0')}`,
        version: row.version,
        name: row.name,
        service: row.service,
        email: row.email,
        phone: row.phone,
        address: row.address,
        details: row.details,
        notes: row.notes,
        canDelete: workspaceGrant(context, 'leads.delete'),
        canArchive: !row.archivedAt && canArchive(context),
        canRestore: !!row.archivedAt && canArchive(context),
        canAssign: !row.archivedAt && workspaceGrant(context, 'leads.assign'),
        origin: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$origin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadOrigin"])(row.creationChanges),
        canEdit: !row.archivedAt && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.update',
            fields: [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadEditableFields"]
            ],
            resource: {
                kind: 'lead',
                id: row.id,
                workspaceId: context.workspaceId,
                ownerId: row.ownerId
            }
        }).allowed,
        stage: row.stage,
        source: row.source,
        owner: row.ownerId ? {
            id: row.ownerId,
            name: row.ownerName ?? '',
            former: !row.memberId
        } : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        lastActivityAt: row.lastActivityAt.toISOString(),
        archived: !!row.archivedAt,
        needsAttention: row.needsAttention,
        canMove: !row.archivedAt && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.stage.update',
            resource: {
                kind: 'lead',
                id: row.id,
                workspaceId: context.workspaceId,
                ownerId: row.ownerId
            }
        }).allowed
    };
}
function ordered(query, input) {
    if (input.sort === 'stage') query.orderByRaw(`CASE l.stage WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'estimate-sent' THEN 2 WHEN 'won' THEN 3 ELSE 4 END ${input.direction}`);
    else if (input.sort === 'owner') query.orderByRaw(`u.name ${input.direction} NULLS LAST`);
    else query.orderBy(input.sort === 'created' ? 'l.createdAt' : `l.${input.sort}`, input.direction);
    return query.orderBy('l.id', input.direction);
}
async function assignmentRoster(trx, context, scope) {
    if (scope !== 'workspace' || !workspaceGrant(context, 'leads.assign')) return [];
    const rows = await trx('workspaceMemberships as wm').join('users as u', 'u.id', 'wm.userId').where('wm.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').orderBy('u.name').orderBy('u.id').select('u.id', 'u.name', trx.raw(`(SELECT count(*)::int FROM leads ol WHERE ol."workspaceId" = wm."workspaceId" AND ol."ownerId" = wm."userId" AND ol."archivedAt" IS NULL AND ol.stage IN ('new','contacted','estimate-sent')) AS "openLeadCount"`));
    return rows;
}
async function readLeads(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadListQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const { query, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
        if (input.archived && !canArchive(context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (scope === 'assigned' && input.ownerIds.some((id)=>![
                'me',
                identity.userId
            ].includes(id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const timezone = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceTimezone"])(trx, identity.workspaceId);
        const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["filteredLeadQuery"])(query, input, identity, timezone);
        const count = await base.clone().count({
            count: 'l.id'
        }).first(), total = Number(count?.count ?? 0);
        const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
        const rows = input.view === 'list' ? await ordered(select(base.clone(), trx), input).offset((page - 1) * input.pageSize).limit(input.pageSize) : [];
        const grouped = await base.clone().select('l.stage').count({
            count: 'l.id'
        }).groupBy('l.stage');
        const columns = [];
        if (input.view === 'pipeline') for (const stage of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadStages"]){
            if (input.column && input.column !== stage) continue;
            const columnPage = input.column ? input.columnPage : 1;
            const leads = await ordered(select(base.clone().where('l.stage', stage), trx), input).offset((columnPage - 1) * 20).limit(20);
            const count = Number(grouped.find((row)=>row.stage === stage)?.count ?? 0);
            columns.push({
                stage,
                total: count,
                leads: leads.map((row)=>dto(row, context)),
                page: columnPage,
                hasMore: columnPage * 20 < count
            });
        }
        const owners = await assignmentRoster(trx, context, scope);
        return {
            rows: rows.map((row)=>dto(row, context)),
            total,
            page,
            pageSize: input.pageSize,
            timezone,
            columns,
            owners,
            scope,
            canExport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveExportScope"])(context) !== null,
            exportScope: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveExportScope"])(context) ?? scope,
            canAssign: scope === 'workspace' && workspaceGrant(context, 'leads.assign'),
            canCreate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leads.create'
            }).allowed,
            canShowArchived: canArchive(context),
            policyRevision: context.policy.revision
        };
    });
}
async function readLeadRecordInTransaction(trx, context, ref) {
    const { query, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    if (/^LD-\d{1,12}$/i.test(ref) && Number(ref.slice(3)) > 0 && Number(ref.slice(3)) <= 2147483647) query.andWhere('l.leadNumber', Number(ref.slice(3)));
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('l.id', ref);
    else throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = await select(query, trx).timeout(5000, {
        cancel: true
    }).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        lead: dto(row, context),
        scope
    };
}
async function readLead(db, identity, enabled, id, activityPage = 1, notesPage = 1) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !Number.isInteger(activityPage) || activityPage < 1 || activityPage > 100000 || !Number.isInteger(notesPage) || notesPage < 1 || notesPage > 100000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const { lead, scope } = await readLeadRecordInTransaction(trx, context, id);
        const history = await readLeadHistoryInTransaction(trx, context, lead.id, 'activity', 20, activityPage);
        const noteHistory = await readLeadHistoryInTransaction(trx, context, lead.id, 'notes', 20, notesPage);
        const activity = history.rows, notes = noteHistory.rows;
        const teamNotes = notes.map((note)=>({
                id: note.id,
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadNoteActivitySchema"].parse(note.changes),
                authorName: note.actorName ?? '',
                viaAssistant: note.actorType === 'assistant-confirmed',
                createdAt: note.createdAt.toISOString()
            }));
        return {
            relatedCustomer: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["relatedCustomerForLead"])(trx, context, lead.id),
            owners: await assignmentRoster(trx, context, scope),
            canExport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveExportScope"])(context) !== null,
            exportScope: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveExportScope"])(context) ?? scope,
            canAssign: scope === 'workspace' && workspaceGrant(context, 'leads.assign'),
            lead,
            teamNotes,
            notesTotal: noteHistory.total,
            activity: activity.map((row)=>({
                    ...row,
                    createdAt: row.createdAt.toISOString()
                })),
            activityTotal: history.total,
            timezone: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceTimezone"])(trx, identity.workspaceId),
            scope,
            canCreate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leads.create'
            }).allowed,
            canShowArchived: canArchive(context),
            policyRevision: context.policy.revision
        };
    });
}
async function readLeadHistoryInTransaction(trx, context, leadId, mode, limit = 10, page = 1) {
    if (![
        10,
        20
    ].includes(limit) || !Number.isInteger(page) || page < 1 || page > 100000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    // Recheck record scope as a defensive boundary even for internal callers.
    const { query: permitted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    if (!await permitted.where('l.id', leadId).first('l.id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leadActivity').where({
        workspaceId: context.workspaceId,
        leadId
    });
    if (mode === 'notes') query.andWhere('type', 'note');
    const count = await query.clone().count({
        count: '*'
    }).timeout(5000, {
        cancel: true
    }).first();
    const rows = await query.clone().orderBy('createdAt', 'desc').orderBy('id', 'desc').limit(limit).offset((page - 1) * limit).select('id', 'actorName', 'actorType', 'type', 'changes', 'createdAt').timeout(5000, {
        cancel: true
    });
    return {
        rows,
        total: Number(count?.count ?? 0)
    };
}
}),
"[project]/packages/data/src/leads/stage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadStageConflictError",
    ()=>LeadStageConflictError,
    "moveLeadStage",
    ()=>moveLeadStage,
    "moveLeadStageInTransaction",
    ()=>moveLeadStageInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadStageConflictError extends Error {
    constructor(){
        super('This lead changed or cannot be moved. Reload it before trying again.');
    }
}
async function moveLeadStage(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["moveLeadStageSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return moveLeadStageInTransaction(trx, context, input);
    });
}
async function moveLeadStageInTransaction(trx, context, raw, actorType = 'user') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["moveLeadStageSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const reason = input.to === 'lost' ? input.reason?.trim() || undefined : undefined;
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.expectedVersion,
        input.to,
        reason ?? null
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leads').where({
        workspaceId: identity.workspaceId,
        id: input.leadId
    });
    if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
    const lead = await query.forUpdate().first('id', 'stage', 'version', 'ownerId', 'archivedAt');
    if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.stage.update',
        resource: {
            kind: 'lead',
            id: lead.id,
            workspaceId: identity.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx('leadActivity').where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first('leadId', 'actorId', 'type', 'changes');
    if (previous) {
        if (previous.leadId !== input.leadId || previous.actorId !== identity.userId || previous.type !== 'stage' || previous.changes.requestHash !== requestHash) throw new LeadStageConflictError();
        return {
            version: lead.version
        };
    }
    if (lead.archivedAt || lead.version !== input.expectedVersion || lead.stage === input.to) throw new LeadStageConflictError();
    const now = new Date(), version = lead.version + 1;
    const updated = await trx('leads').where({
        workspaceId: identity.workspaceId,
        id: lead.id,
        version: input.expectedVersion
    }).update({
        stage: input.to,
        version,
        updatedAt: now,
        lastActivityAt: now
    });
    if (updated !== 1) throw new LeadStageConflictError();
    const actor = await trx('users').where({
        id: identity.userId
    }).first('name');
    await trx('leadActivity').insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        actorId: identity.userId,
        actorName: actor.name,
        actorType,
        type: 'stage',
        changes: JSON.stringify({
            from: lead.stage,
            to: input.to,
            ...reason ? {
                reason
            } : {},
            requestHash
        }),
        createdAt: now
    });
    return {
        version
    };
}
}),
"[project]/packages/data/src/leads/notes.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadNoteConflictError",
    ()=>LeadNoteConflictError,
    "addLeadNote",
    ()=>addLeadNote,
    "addLeadNoteInTransaction",
    ()=>addLeadNoteInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadNoteConflictError extends Error {
    constructor(){
        super('This note submission was already used for different content.');
    }
}
async function addLeadNote(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLeadNoteSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const result = await addLeadNoteInTransaction(trx, context, input);
        return result.note;
    });
}
async function addLeadNoteInTransaction(trx, context, raw, actorType = 'user') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLeadNoteSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.body
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leads').where({
        workspaceId: identity.workspaceId,
        id: input.leadId
    });
    if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
    const lead = await query.forUpdate().first('id', 'version');
    if (!lead) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx('leadActivity').where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first();
    if (previous) {
        if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== 'note' || previous.changes.requestHash !== requestHash) throw new LeadNoteConflictError();
        return {
            version: lead.version,
            note: {
                id: previous.id,
                body: input.body,
                authorName: previous.actorName,
                createdAt: previous.createdAt.toISOString(),
                viaAssistant: previous.actorType === 'assistant-confirmed'
            }
        };
    }
    const now = new Date(), actor = await trx('users').where({
        id: identity.userId
    }).first('name');
    await trx('leadActivity').insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        actorId: identity.userId,
        actorName: actor.name,
        actorType,
        type: 'note',
        changes: JSON.stringify({
            body: input.body,
            requestHash
        }),
        createdAt: now
    });
    await trx('leads').where({
        workspaceId: identity.workspaceId,
        id: lead.id
    }).update({
        version: lead.version + 1,
        updatedAt: now,
        lastActivityAt: now
    });
    return {
        version: lead.version + 1,
        note: {
            id: input.submissionId,
            body: input.body,
            authorName: actor.name,
            createdAt: now.toISOString(),
            viaAssistant: actorType === 'assistant-confirmed'
        }
    };
}
}),
"[project]/packages/data/src/leads/update.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadEditConflictError",
    ()=>LeadEditConflictError,
    "LeadSourceLockedError",
    ()=>LeadSourceLockedError,
    "updateLead",
    ()=>updateLead,
    "updateLeadInTransaction",
    ()=>updateLeadInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$origin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/origin.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class LeadEditConflictError extends Error {
    changedFields;
    constructor(changedFields = []){
        super("This lead changed. Reload its latest details before saving."), this.changedFields = changedFields;
    }
}
class LeadSourceLockedError extends Error {
}
async function updateLead(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateLeadSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>updateLeadInTransaction(trx, context, input));
}
async function updateLeadInTransaction(trx, context, raw, actorType = 'user', selectedFields) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateLeadSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (selectedFields && (!selectedFields.length || selectedFields.some((field)=>!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadEditableFields"].includes(field)))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const requestedValues = selectedFields ? Object.fromEntries(selectedFields.map((field)=>[
            field,
            input.values[field]
        ])) : input.values;
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.expectedVersion,
        requestedValues
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "leads.read");
    if (!scope.allowed || scope.resourceKind !== "lead" || ![
        "workspace",
        "assigned"
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx("leads").where({
        id: input.leadId,
        workspaceId: identity.workspaceId
    });
    if (scope.scope === "assigned") query.andWhere("ownerId", identity.userId);
    const lead = await query.forUpdate().first();
    if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "leads.update",
        fields: selectedFields ? [
            ...selectedFields
        ] : Object.keys(input.values),
        resource: {
            kind: "lead",
            id: lead.id,
            workspaceId: identity.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx("leadActivity").where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first();
    if (previous) {
        if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== "edited" || previous.changes.requestHash !== requestHash) throw new LeadEditConflictError();
        return {
            version: lead.version
        };
    }
    if (lead.archivedAt) throw new LeadEditConflictError();
    if (lead.version !== input.expectedVersion) {
        const events = await trx("leadActivity").where({
            workspaceId: identity.workspaceId,
            leadId: lead.id,
            type: "edited"
        }).whereRaw("(changes->>'toVersion')::integer > ?", [
            input.expectedVersion
        ]).select("changes");
        const changed = new Set();
        for (const event of events){
            const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadEditedActivitySchema"].safeParse(event.changes);
            if (parsed.success) for (const change of parsed.data.fields)changed.add(change.field);
        }
        throw new LeadEditConflictError([
            ...changed
        ]);
    }
    const creation = await trx("leadActivity").where({
        id: lead.id,
        workspaceId: identity.workspaceId,
        type: "created"
    }).first("changes");
    const origin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$origin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadOrigin"])(creation?.changes);
    if (origin !== "manual" && (!selectedFields || selectedFields.includes("source")) && input.values.source !== undefined && input.values.source !== lead.source) throw new LeadSourceLockedError();
    // Chat applies exactly the reviewed fields, even if legacy untouched values normalize differently.
    const values = selectedFields ? Object.fromEntries(selectedFields.map((field)=>[
            field,
            input.values[field] ?? lead[field]
        ])) : {
        ...input.values,
        source: input.values.source ?? lead.source
    };
    const fields = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadEditableFields"].filter((field)=>Object.hasOwn(values, field) && values[field] !== lead[field]).map((field)=>({
            field,
            before: lead[field],
            after: values[field]
        }));
    if (!fields.length) return {
        version: lead.version
    };
    const version = lead.version + 1, now = new Date(), actor = await trx("users").where({
        id: identity.userId
    }).first("name");
    const updated = await trx("leads").where({
        id: lead.id,
        workspaceId: identity.workspaceId,
        version: input.expectedVersion
    }).update({
        ...values,
        version,
        updatedAt: now,
        lastActivityAt: now
    });
    if (updated !== 1) throw new LeadEditConflictError();
    await trx("leadActivity").insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        actorId: identity.userId,
        actorName: actor.name,
        actorType,
        type: "edited",
        changes: JSON.stringify({
            fromVersion: lead.version,
            toVersion: version,
            fields,
            requestHash
        }),
        createdAt: now
    });
    return {
        version
    };
}
}),
"[project]/packages/data/src/leads/assign.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadAssignmentConflictError",
    ()=>LeadAssignmentConflictError,
    "assignLead",
    ()=>assignLead,
    "assignLeadInTransaction",
    ()=>assignLeadInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadAssignmentConflictError extends Error {
}
async function assignLead(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignLeadSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return assignLeadInTransaction(trx, context, input);
    });
}
async function assignLeadInTransaction(trx, context, raw, actorType = 'user') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignLeadSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.expectedVersion,
        input.ownerId
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leads').where({
        workspaceId: identity.workspaceId,
        id: input.leadId
    });
    if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
    const lead = await query.forUpdate().first('id', 'version', 'ownerId', 'ownerName', 'archivedAt');
    if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.assign',
        resource: {
            kind: 'lead',
            id: lead.id,
            workspaceId: identity.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx('leadActivity').where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first('leadId', 'actorId', 'type', 'changes');
    if (previous) {
        if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== 'assigned' || previous.changes.requestHash !== requestHash) throw new LeadAssignmentConflictError();
        return {
            version: lead.version
        };
    }
    if (lead.archivedAt || lead.version !== input.expectedVersion) throw new LeadAssignmentConflictError();
    const member = input.ownerId === null ? null : await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
        'm.workspaceId': identity.workspaceId,
        'm.userId': input.ownerId
    }).whereNull('u.deletionRequestedAt').first('u.name');
    if (input.ownerId !== null && !member) throw new LeadAssignmentConflictError();
    if (lead.ownerId === input.ownerId) return {
        version: lead.version
    };
    const now = new Date(), version = lead.version + 1;
    const actor = await trx('users').where({
        id: identity.userId
    }).first('name');
    await trx('leads').where({
        id: lead.id,
        workspaceId: identity.workspaceId,
        version: input.expectedVersion
    }).update({
        ownerId: input.ownerId,
        ownerName: member?.name ?? null,
        version,
        updatedAt: now,
        lastActivityAt: now
    });
    const former = lead.ownerId ? await trx('users').where({
        id: lead.ownerId
    }).first('name') : null;
    await trx('leadActivity').insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        actorId: identity.userId,
        actorName: actor.name,
        actorType,
        type: 'assigned',
        changes: JSON.stringify({
            from: former?.name ?? lead.ownerName ?? null,
            to: member?.name ?? null,
            ownerId: input.ownerId,
            toVersion: version,
            requestHash
        }),
        createdAt: now
    });
    if (input.ownerId && input.ownerId !== identity.userId) {
        await trx('assignmentNotifications').insert({
            id: input.submissionId,
            workspaceId: identity.workspaceId,
            leadId: lead.id,
            userId: input.ownerId,
            createdAt: now
        });
        await trx('assignmentEmailOutbox').insert({
            id: input.submissionId
        });
    }
    return {
        version
    };
}
}),
"[project]/packages/data/src/leads/archive.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadArchiveConflictError",
    ()=>LeadArchiveConflictError,
    "setLeadArchived",
    ()=>setLeadArchived,
    "setLeadArchivedInTransaction",
    ()=>setLeadArchivedInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadArchiveConflictError extends Error {
}
async function setLeadArchived(db, identity, enabled, raw, archived) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadArchiveSchema"].parse(raw);
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return setLeadArchivedInTransaction(trx, context, input, archived);
    });
}
async function setLeadArchivedInTransaction(trx, context, raw, archived, actorType = 'user') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadArchiveSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const type = archived ? 'archived' : 'restored';
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.expectedVersion,
        archived
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx('leads').where({
        id: input.leadId,
        workspaceId: identity.workspaceId
    });
    if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
    const lead = await query.forUpdate().first('id', 'ownerId', 'version', 'archivedAt');
    if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.archive',
        resource: {
            kind: 'lead',
            id: lead.id,
            workspaceId: identity.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx('leadActivity').where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first('leadId', 'actorId', 'type', 'changes');
    if (previous) {
        if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== type || previous.changes.requestHash !== requestHash) throw new LeadArchiveConflictError();
        return {
            version: lead.version,
            archived: !!lead.archivedAt
        };
    }
    if (lead.version !== input.expectedVersion || !!lead.archivedAt === archived) throw new LeadArchiveConflictError();
    const now = new Date(), version = lead.version + 1;
    const updated = await trx('leads').where({
        id: lead.id,
        workspaceId: identity.workspaceId,
        version: input.expectedVersion
    }).update({
        archivedAt: archived ? now : null,
        archivedBy: archived ? identity.userId : null,
        version,
        updatedAt: now,
        lastActivityAt: now
    });
    if (updated !== 1) throw new LeadArchiveConflictError();
    const actor = await trx('users').where({
        id: identity.userId
    }).first('name');
    await trx('leadActivity').insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        actorId: identity.userId,
        actorName: actor.name,
        actorType,
        type,
        changes: JSON.stringify({
            from: !!lead.archivedAt,
            to: archived,
            fromVersion: lead.version,
            toVersion: version,
            requestHash
        }),
        createdAt: now
    });
    return {
        version,
        archived
    };
}
}),
"[project]/packages/data/src/leads/delete.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadDeleteConfirmationError",
    ()=>LeadDeleteConfirmationError,
    "LeadDeleteConflictError",
    ()=>LeadDeleteConflictError,
    "LeadDeleteWonError",
    ()=>LeadDeleteWonError,
    "deleteLead",
    ()=>deleteLead,
    "deleteLeadInTransaction",
    ()=>deleteLeadInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadDeleteConflictError extends Error {
}
class LeadDeleteConfirmationError extends Error {
}
class LeadDeleteWonError extends Error {
}
async function deleteLead(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteLeadSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>deleteLeadInTransaction(trx, context, input));
}
async function deleteLeadInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteLeadSchema"].parse(raw);
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        input.leadId,
        input.expectedVersion,
        input.typedConfirmation
    ])).digest('hex');
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    const resource = {
        kind: 'lead',
        id: input.leadId,
        workspaceId: identity.workspaceId,
        ownerId: null
    };
    // Delete's catalog ceiling is Owner/Admin, workspace scope. Recheck even for retries
    // after the lead has gone, without using the audit as a substitute for authority.
    if (!scope.allowed || scope.resourceKind !== 'lead' || scope.scope !== 'workspace' || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.delete',
        resource
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const previous = await trx('leadDeletionAudit').where({
        id: input.submissionId,
        workspaceId: identity.workspaceId
    }).first();
    if (previous) {
        if (previous.leadId !== input.leadId || previous.actorId !== identity.userId || previous.requestHash !== requestHash) throw new LeadDeleteConflictError();
        return {
            deleted: true
        };
    }
    const lead = await trx('leads').where({
        id: input.leadId,
        workspaceId: identity.workspaceId
    }).forUpdate().first('id', 'leadNumber', 'version', 'stage');
    if (!lead) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (lead.version !== input.expectedVersion) throw new LeadDeleteConflictError();
    if (lead.stage === 'won') throw new LeadDeleteWonError();
    if (input.typedConfirmation !== `LD-${String(lead.leadNumber).padStart(4, '0')}`) throw new LeadDeleteConfirmationError();
    await trx('leadDeletionAudit').insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        leadNumber: lead.leadNumber,
        actorId: identity.userId,
        requestHash
    });
    // Confirmed creation proposals contain a copy of the lead. Remove those payloads;
    // immutable, non-content chat audit evidence and private conversations retain their policy.
    await trx('chatActionDrafts').where({
        workspaceId: identity.workspaceId
    }).andWhere(function() {
        this.where({
            leadId: lead.id
        }).orWhereIn('turnId', trx('chatTurns').where({
            workspaceId: identity.workspaceId
        }).whereRaw('"leadEvidence" @> ?::jsonb', [
            JSON.stringify([
                {
                    id: lead.id
                }
            ])
        ]).select('id'));
    }).delete();
    const removed = await trx('leads').where({
        id: lead.id,
        workspaceId: identity.workspaceId,
        version: input.expectedVersion
    }).delete();
    if (removed !== 1) throw new LeadDeleteConflictError();
    // Activity and assignment notification/outbox rows cascade. Creation admissions
    // intentionally remain independent; billing's monthly creation policy owns them.
    return {
        deleted: true
    };
}
}),
"[project]/packages/data/src/leads/export.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadExportEmptyError",
    ()=>LeadExportEmptyError,
    "LeadExportLimitError",
    ()=>LeadExportLimitError,
    "createLeadCSVExport",
    ()=>createLeadCSVExport,
    "leadExportRowLimit",
    ()=>leadExportRowLimit,
    "previewLeadExport",
    ()=>previewLeadExport,
    "previewLeadExportInTransaction",
    ()=>previewLeadExportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:events [external] (node:events, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
class LeadExportLimitError extends Error {
}
class LeadExportEmptyError extends Error {
}
function leadExportRowLimit() {
    const raw = process.env.LEAD_EXPORT_ROW_LIMIT ?? '50000';
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > 1_000_000) throw new Error('Invalid export row limit configuration.');
    return Number(raw);
}
async function withExportAuthorization(db, identity, enabled, use) {
    return db.transaction(async (trx)=>{
        // Set deadlines before the authorization lock, including time waiting for a writer.
        await trx.raw("SET LOCAL lock_timeout = '5s'");
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, identity, enabled, false, use);
    });
}
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadExportSchema"].parse(raw);
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
async function exportQuery(trx, context, identity, input) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveExportScope"])(context);
    if (!scope) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadExportQuery"])(input);
    if (parsed.archived && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.archive',
        resource: {
            kind: 'lead',
            id: identity.workspaceId,
            workspaceId: identity.workspaceId,
            ownerId: null
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (scope === 'assigned' && parsed.ownerIds.some((id)=>![
            'me',
            identity.userId
        ].includes(id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { query } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    if (scope === 'assigned') query.andWhere('l.ownerId', identity.userId);
    return {
        query: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["filteredLeadQuery"])(query, parsed, identity, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceTimezone"])(trx, identity.workspaceId)),
        scope
    };
}
function filterAudit(input) {
    const { query, ownerIds, ...filters } = input.filters;
    // Search can contain customer/contact text. Retain a fingerprint, never that text.
    return {
        ...filters,
        ownerCount: ownerIds.length,
        ownerHashes: ownerIds.map((id)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(id).digest('hex')),
        ...query ? {
            searchHash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(query).digest('hex')
        } : {}
    };
}
async function previewLeadExport(db, identity, enabled, raw) {
    const input = validate(identity, raw);
    return withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        return previewLeadExportInTransaction(trx, context, input);
    });
}
async function previewLeadExportInTransaction(trx, context, raw) {
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    const input = validate(identity, raw);
    const { query, scope } = await exportQuery(trx, context, identity, input);
    const result = await query.count('* as count').first();
    return {
        count: Number(result?.count ?? 0),
        scope,
        rowLimit: leadExportRowLimit()
    };
}
async function createLeadCSVExport(db, identity, enabled, raw, requestSignal, gate) {
    const input = validate(identity, raw), rowLimit = leadExportRowLimit(), id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const signal = AbortSignal.any([
        AbortSignal.timeout(30_000),
        ...requestSignal ? [
            requestSignal
        ] : []
    ]);
    const initial = await withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        signal.throwIfAborted();
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        await gate?.beforeRead(trx, context);
        const { query, scope } = await exportQuery(trx, context, identity, input);
        const result = await query.count('* as count').first(), count = Number(result?.count ?? 0);
        await trx('leadExportAudit').insert({
            id,
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            dataset: 'leads',
            scope,
            filters: JSON.stringify(filterAudit(input)),
            count,
            outcome: count === 0 || count > rowLimit ? 'rejected' : 'started',
            finishedAt: count === 0 || count > rowLimit ? new Date() : null
        });
        return {
            count,
            scope
        };
    });
    if (!initial.count) throw new LeadExportEmptyError();
    if (initial.count > rowLimit) throw new LeadExportLimitError();
    const output = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["PassThrough"]({
        highWaterMark: 64 * 1024
    });
    output.on('error', ()=>{});
    const onAbort = ()=>output.destroy(new Error('Export cancelled.'));
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    let resolveReady, rejectReady;
    const ready = new Promise((resolve, reject)=>{
        resolveReady = resolve;
        rejectReady = reject;
    });
    let rowsSent = 0, checked = initial;
    async function write(text) {
        signal.throwIfAborted();
        if (output.destroyed) throw new Error('Export cancelled.');
        if (!output.write(text, 'utf8')) await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__["once"])(output, 'drain', {
            signal
        });
    }
    const generation = withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        signal.throwIfAborted();
        await gate?.beforeRead(trx, context);
        const { query, scope } = await exportQuery(trx, context, identity, input);
        const selection = query.leftJoin('users as u', 'u.id', 'l.ownerId').orderBy('l.id').select('l.id', 'l.leadNumber', 'l.name', 'l.email', 'l.phone', 'l.service', 'l.address', 'l.details', 'l.notes', 'l.source', 'l.stage', 'l.ownerId', 'l.createdAt', 'l.updatedAt', 'l.archivedAt', trx.raw('CASE WHEN l."ownerId" IS NULL THEN NULL ELSE coalesce(u.name,l."ownerName") END as "ownerName"'), trx.raw('count(*) OVER ()::int as "__exportCount"')).toSQL();
        // The cursor fixes one SELECT snapshot without freezing authorization before
        // acquiring the workspace lock. All user values remain parameter bindings.
        await trx.raw('DECLARE lead_export_cursor NO SCROLL CURSOR FOR ' + selection.sql, [
            ...selection.bindings
        ]);
        let rows = (await trx.raw('FETCH FORWARD 100 FROM lead_export_cursor')).rows;
        const count = Number(rows[0]?.__exportCount ?? 0);
        checked = {
            count,
            scope
        };
        if (!count) throw new LeadExportEmptyError();
        if (count > rowLimit) throw new LeadExportLimitError();
        await gate?.onSnapshot(trx, context, {
            count,
            scope,
            rowLimit
        });
        resolveReady({
            count,
            scope,
            rowLimit
        });
        await write('\uFEFF' + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadCSVHeaders"]));
        while(rows.length){
            for (const row of rows){
                await write((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])([
                    row.id,
                    `LD-${String(row.leadNumber).padStart(4, '0')}`,
                    row.name,
                    row.email,
                    row.phone,
                    row.service,
                    row.address,
                    row.details,
                    row.notes,
                    row.source,
                    row.stage,
                    row.ownerName,
                    row.ownerId,
                    row.createdAt.toISOString(),
                    row.updatedAt.toISOString(),
                    row.archivedAt ? 'true' : 'false'
                ]));
                rowsSent++;
            }
            signal.throwIfAborted();
            rows = (await trx.raw('FETCH FORWARD 100 FROM lead_export_cursor')).rows;
        }
        await trx.raw('CLOSE lead_export_cursor');
        if (rowsSent !== count) throw new Error('Export snapshot changed.');
        return {
            count,
            scope
        };
    });
    void generation.then(async (result)=>{
        signal.throwIfAborted();
        await db('leadExportAudit').where({
            id,
            outcome: 'started'
        }).update({
            ...result,
            rowsSent,
            outcome: 'completed',
            finishedAt: new Date()
        });
        output.end();
    }).catch(async (error)=>{
        // The durable started record survives transaction rollback and process interruption.
        try {
            await db('leadExportAudit').where({
                id,
                outcome: 'started'
            }).update({
                ...checked,
                rowsSent,
                outcome: error instanceof LeadExportLimitError || error instanceof LeadExportEmptyError ? 'rejected' : 'failed',
                finishedAt: new Date()
            });
        } catch  {}
        rejectReady(error);
        output.destroy(new Error('CSV export could not be completed.'));
    }).finally(()=>signal.removeEventListener('abort', onAbort));
    const metadata = await ready;
    return {
        ...metadata,
        stream: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].toWeb(output)
    };
}
}),
"[project]/packages/data/src/leads/owner-stamp.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadOwnerStamp",
    ()=>leadOwnerStamp
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function leadOwnerStamp(owner) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(owner ? [
        owner.id,
        owner.former,
        owner.former ? '' : owner.name
    ] : null)).digest('hex');
}
}),
"[project]/packages/data/src/leads/chat-context.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadChatEvidenceAllowed",
    ()=>leadChatEvidenceAllowed,
    "leadChatPipelineCounts",
    ()=>leadChatPipelineCounts,
    "resolveLeadChatContext",
    ()=>resolveLeadChatContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$owner$2d$stamp$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/owner-stamp.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function resolveLeadChatContext(trx, context, intent) {
    if (!intent.recordRefs?.length && !intent.uiState) return {
        evidence: []
    };
    const denied = {
        evidence: [],
        reference: {
            kind: 'page-context-unavailable',
            message: 'The requested page context is unavailable. Do not infer any private record or filter information.'
        }
    };
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) return denied;
    if (intent.surfaceKey === 'leads.list' && intent.uiState) {
        if (intent.uiState.filters.archived && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.archive',
            resource: {
                kind: 'lead',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: null
            }
        }).allowed) return denied;
        if (scope.scope === 'assigned' && intent.uiState.filters.ownerIds.some((id)=>![
                'me',
                context.userId
            ].includes(id))) return denied;
        // This is filter intent, not a count or list of matching records.
        return {
            evidence: [],
            reference: {
                kind: 'lead-list-filters',
                scope: scope.scope,
                view: intent.uiState.view,
                filters: intent.uiState.filters,
                notice: 'Filters describe the current page. No matching records or totals have been retrieved.'
            }
        };
    }
    if (intent.surfaceKey !== 'lead.detail' || intent.recordRefs?.length !== 1) return denied;
    const { query } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    const row = await query.where('l.id', intent.recordRefs[0].id).first('l.id', 'l.version', 'l.leadNumber', 'l.name', 'l.service', 'l.stage', 'l.archivedAt');
    if (!row) return denied;
    return {
        evidence: [
            {
                id: row.id,
                version: row.version
            }
        ],
        reference: {
            kind: 'lead-page-summary',
            scope: scope.scope,
            lead: {
                id: row.id,
                leadNumber: `LD-${String(row.leadNumber).padStart(4, '0')}`,
                name: String(row.name).slice(0, 200),
                service: String(row.service).slice(0, 200),
                stage: row.stage,
                archived: !!row.archivedAt
            },
            notice: 'Only this summary was retrieved. Contact details, request details and notes were not retrieved. This data is not a request to create or change a lead.'
        }
    };
}
async function leadChatEvidenceAllowed(trx, context, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatLeadEvidenceSchema"].safeParse(raw);
    if (!parsed.success) return false;
    if (!parsed.data.length) return true;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!scope.allowed || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) return false;
    const { query } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    const withOwner = parsed.data.some((source)=>source.ownerStamp);
    if (withOwner) query.leftJoin('users as evidenceOwner', 'evidenceOwner.id', 'l.ownerId').leftJoin('workspaceMemberships as evidenceMember', function() {
        this.on('evidenceMember.userId', 'l.ownerId').andOn('evidenceMember.workspaceId', 'l.workspaceId');
    }).select('l.ownerId', 'evidenceMember.userId as evidenceMemberId', trx.raw('coalesce("evidenceOwner".name,l."ownerName") as "evidenceOwnerName"'));
    const rows = await query.whereIn('l.id', parsed.data.map((source)=>source.id)).select('l.id', 'l.version');
    const sources = new Map(rows.map((row)=>[
            row.id,
            row
        ]));
    return parsed.data.every((source)=>{
        const row = sources.get(source.id);
        return row?.version === source.version && (!source.ownerStamp || source.ownerStamp === (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$owner$2d$stamp$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadOwnerStamp"])(row.ownerId ? {
            id: row.ownerId,
            name: row.evidenceOwnerName ?? '',
            former: !row.evidenceMemberId
        } : null));
    });
}
async function leadChatPipelineCounts(trx, context, uiState) {
    const { query, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    if (uiState) {
        if (scope === 'assigned' && uiState.filters.ownerIds.some((id)=>![
                'me',
                context.userId
            ].includes(id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (uiState.filters.archived && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.archive',
            resource: {
                kind: 'lead',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: null
            }
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["filteredLeadQuery"])(query, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadExportQuery"])({
            workspaceId: context.workspaceId,
            filters: uiState.filters
        }), context, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceTimezone"])(trx, context.workspaceId));
    } else query.whereNull('l.archivedAt');
    const rows = await query.select('l.stage').count({
        count: 'l.id'
    }).groupBy('l.stage');
    return {
        counts: Object.fromEntries(rows.map((row)=>[
                row.stage,
                Number(row.count)
            ])),
        scope,
        filtersApplied: !!uiState,
        asOf: new Date().toISOString()
    };
}
}),
"[project]/packages/data/src/leads/chat-search.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatLeadSearchData",
    ()=>chatLeadSearchData
]);
const chatLeadSearchData = {
    owner: (name)=>`Owner: ${name}`,
    me: 'Me',
    unassigned: 'Unassigned',
    former: 'Former teammate',
    query: (value)=>`Search: ${value}`,
    stages: (value)=>`Stage: ${value}`,
    sources: (value)=>`Source: ${value}`,
    created: (value)=>`Created: ${value}`,
    custom: (from, to)=>`${from} – ${to}`,
    stagesMap: {
        new: 'New',
        contacted: 'Contacted',
        'estimate-sent': 'Estimate sent',
        won: 'Won',
        lost: 'Lost'
    },
    sourcesMap: {
        website: 'Website',
        referral: 'Referral',
        phone: 'Phone',
        gmail: 'Gmail',
        other: 'Other'
    },
    dates: {
        '7days': 'Last 7 days',
        '30days': 'Last 30 days'
    },
    attention: 'Needs attention'
};
}),
"[project]/packages/data/src/leads/chat-search.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatSearchSnapshotAllowed",
    ()=>chatSearchSnapshotAllowed,
    "leadChatTurnEvidenceAllowed",
    ()=>leadChatTurnEvidenceAllowed,
    "leadSearchEvidenceAllowed",
    ()=>leadSearchEvidenceAllowed,
    "searchChatLeads",
    ()=>searchChatLeads
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/chat-search.data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$search$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-search.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$context$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/chat-context.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function searchChatLeads(trx, context, id, raw) {
    const { filters } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadExportSchema"].parse({
        workspaceId: context.workspaceId,
        filters: raw
    });
    if (filters.query.length === 1) throw Error('Search text must contain at least two characters.');
    const { query, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    if (scope === 'assigned' && filters.ownerIds.some((owner)=>![
            'me',
            context.userId
        ].includes(owner))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (filters.archived && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.archive',
        resource: {
            kind: 'lead',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            ownerId: null
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const labels = [];
    // Resolve every owner against this workspace; never echo unknown identities or silently drop filters.
    for (const owner of filters.ownerIds){
        if (owner === 'me' || owner === context.userId) labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].owner(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].me));
        else if (owner === 'unassigned') labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].owner(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].unassigned));
        else {
            // Manual owner choices load a roster only with assignment/picker access.
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leads.assign',
                resource: {
                    kind: 'lead',
                    id: context.workspaceId,
                    workspaceId: context.workspaceId,
                    ownerId: null
                }
            }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
                'm.workspaceId': context.workspaceId,
                'm.userId': owner
            }).whereNull('u.deletionRequestedAt').first('u.name');
            if (!member) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].owner(String(member.name).slice(0, 200)));
        }
    }
    if (filters.query) labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].query(filters.query));
    if (filters.stages.length) labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].stages(filters.stages.map((stage)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].stagesMap[stage]).join(', ')));
    if (filters.sources.length) labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].sources(filters.sources.map((source)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].sourcesMap[source]).join(', ')));
    if (filters.created !== 'any') labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].created(filters.created === 'custom' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].custom(filters.from, filters.to) : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].dates[filters.created]));
    if (filters.attention) labels.push(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].attention);
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["filteredLeadQuery"])(query, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadExportQuery"])({
        workspaceId: context.workspaceId,
        filters
    }), context, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceTimezone"])(trx, context.workspaceId));
    const count = await base.clone().count({
        count: 'l.id'
    }).timeout(5000, {
        cancel: true
    }).first();
    const rows = await base.clone().leftJoin('users as u', 'u.id', 'l.ownerId').leftJoin('workspaceMemberships as m', function() {
        this.on('m.userId', 'l.ownerId').andOn('m.workspaceId', 'l.workspaceId');
    }).orderBy('l.createdAt', 'desc').orderBy('l.id', 'desc').limit(10).timeout(5000, {
        cancel: true
    }).select('l.id', 'l.version', 'l.leadNumber', 'l.name', 'l.service', 'l.stage', 'l.archivedAt', 'l.ownerId', 'm.userId as memberId', trx.raw('coalesce(u.name,l."ownerName") as "ownerName"'));
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$search$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSearchSnapshotSchema"].parse({
        filters,
        result: {
            id,
            scope,
            filterLabels: labels,
            includeArchived: filters.archived,
            total: Number(count?.count ?? 0),
            rows: rows.map((row)=>({
                    id: row.id,
                    number: `LD-${String(row.leadNumber).padStart(4, '0')}`,
                    name: String(row.name).slice(0, 200),
                    service: String(row.service).slice(0, 200),
                    stage: row.stage,
                    ownerName: row.memberId ? String(row.ownerName ?? '').slice(0, 200) : row.ownerId ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chatLeadSearchData"].former : null,
                    archived: !!row.archivedAt
                }))
        },
        versions: rows.map((row)=>({
                id: row.id,
                version: row.version
            }))
    });
}
async function chatSearchSnapshotAllowed(trx, context, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$search$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSearchSnapshotSchema"].safeParse(raw);
    if (!parsed.success) return false;
    try {
        return JSON.stringify(await searchChatLeads(trx, context, parsed.data.result.id, parsed.data.filters)) === JSON.stringify(parsed.data);
    } catch  {
        return false;
    }
}
async function leadChatTurnEvidenceAllowed(trx, context, turn) {
    if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$context$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadChatEvidenceAllowed"])(trx, context, turn.leadEvidence)) return false;
    return leadSearchEvidenceAllowed(trx, context, turn.leadSearchEvidence);
}
async function leadSearchEvidenceAllowed(trx, context, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$search$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSearchEvidenceSchema"].safeParse(raw);
    if (!parsed.success) return false;
    for (const id of parsed.data){
        const source = await trx('chatTurns').where({
            id,
            userId: context.userId,
            workspaceId: context.workspaceId
        }).first('leadSearchSnapshot');
        if (!source || !await chatSearchSnapshotAllowed(trx, context, source.leadSearchSnapshot)) return false;
    }
    return true;
}
}),
"[project]/packages/data/src/leads/admission.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "insertAdmittedLead",
    ()=>insertAdmittedLead
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
;
;
async function insertAdmittedLead(trx, input, identity, ownerId = null) {
    const createdAt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertLeadCapacity"])(trx, identity.workspaceId, {
        enforce: identity.createdBy === null
    });
    const rows = await trx('leads').insert({
        ...input,
        ...identity,
        ownerId,
        createdAt,
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()
    }).onConflict([
        'workspaceId',
        'createdBy',
        'submissionId'
    ]).ignore().returning('id');
    return rows[0]?.id;
}
}),
"[project]/packages/data/src/customers/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomerConflictError",
    ()=>CustomerConflictError,
    "CustomerDuplicateError",
    ()=>CustomerDuplicateError,
    "CustomerValidationError",
    ()=>CustomerValidationError,
    "createCustomer",
    ()=>createCustomer,
    "customerCapabilities",
    ()=>customerCapabilities,
    "exportCustomers",
    ()=>exportCustomers,
    "mutateCustomer",
    ()=>mutateCustomer,
    "readCustomer",
    ()=>readCustomer,
    "readCustomerRecordInTransaction",
    ()=>readCustomerRecordInTransaction,
    "readCustomers",
    ()=>readCustomers,
    "relatedCustomerForLead",
    ()=>relatedCustomerForLead,
    "searchCustomerLeads",
    ()=>searchCustomerLeads
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/customer.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class CustomerConflictError extends Error {
    constructor(message = "This record changed. Reload its latest details before trying again."){
        super(message);
    }
}
class CustomerValidationError extends Error {
}
class CustomerDuplicateError extends Error {
    matches;
    constructor(matches){
        super("This customer may already exist."), this.matches = matches;
    }
}
const number = (n)=>`CU-${String(n).padStart(4, "0")}`;
const resource = (context, id = context.workspaceId)=>({
        kind: "customer",
        id,
        workspaceId: context.workspaceId,
        related: []
    });
function permission(context, id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: id,
        resource: resource(context)
    }).allowed;
}
function customerCapabilities(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "customers.read");
    const read = scope.allowed && scope.scope === "workspace";
    return {
        read,
        create: read && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "customers.create"
        }).allowed,
        update: read && permission(context, "customers.update"),
        archive: read && permission(context, "customers.archive"),
        delete: read && permission(context, "customers.delete"),
        export: read && permission(context, "customers.export"),
        link: read && permission(context, "customers.update") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "leads.read").allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "leads.update",
            fields: [
                "customerId"
            ],
            resource: {
                kind: "lead",
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: context.userId
            }
        }).allowed,
        note: read
    };
}
function requireRead(context) {
    if (!customerCapabilities(context).read) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function leads(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "leads.read");
    const query = trx("leads as l").where("l.workspaceId", context.workspaceId);
    if (!scope.allowed || ![
        "workspace",
        "assigned"
    ].includes(scope.scope)) return query.whereRaw("false");
    if (scope.scope === "assigned") query.andWhere("l.ownerId", context.userId);
    return query;
}
function openLeads(trx, context) {
    return leads(trx, context).whereNull("l.archivedAt").whereIn("l.stage", [
        "new",
        "contacted",
        "estimate-sent"
    ]);
}
function baseQuery(trx, context, input) {
    const query = trx("customers as c").where("c.workspaceId", context.workspaceId);
    if (input.archived && !permission(context, "customers.archive")) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (!input.archived) query.whereNull("c.archivedAt");
    if (input.type !== "all") query.andWhere("c.type", input.type);
    if (input.owner !== "all") {
        if (input.owner === "unassigned") query.whereNull("c.ownerId");
        else query.andWhere("c.ownerId", input.owner);
    }
    if (input.relationship === "lead") query.whereExists(openLeads(trx, context).whereRaw("?? = ??", [
        "l.customerId",
        "c.id"
    ]).select(trx.raw("1")));
    if (input.q) {
        const pattern = "%" + input.q.replace(/[\\%_]/g, "\\$&") + "%";
        const digits = input.q.replace(/\D/g, "");
        query.andWhere(function() {
            this.whereILike("c.name", pattern).orWhereILike("c.email", pattern).orWhereILike("c.phone", pattern);
            if (digits && /^[+()\d\s.-]+$/.test(input.q)) this.orWhereRaw(`regexp_replace(c.phone,'[^0-9]','','g') LIKE ?`, [
                "%" + digits + "%"
            ]);
        });
    }
    return query;
}
function selected(query, trx, context) {
    const fields = [
        "id",
        "workspaceId",
        "customerNumber",
        "name",
        "type",
        "companyName",
        "email",
        "phone",
        "location",
        "internalNotes",
        "ownerId",
        "version",
        "createdAt",
        "archivedAt"
    ].map((key)=>`c.${key}`);
    return query.select(fields).select(openLeads(trx, context).whereRaw("?? = ??", [
        "l.customerId",
        "c.id"
    ]).count("*").as("openLeadCount")).select(trx.raw("greatest(c.??,coalesce((?),c.??)) as ??", [
        "lastActivityAt",
        leads(trx, context).whereRaw("?? = ??", [
            "l.customerId",
            "c.id"
        ]).max("l.lastActivityAt"),
        "lastActivityAt",
        "lastActivityAt"
    ]));
}
function dto(row) {
    return {
        id: row.id,
        number: number(row.customerNumber),
        name: row.name,
        type: row.type,
        companyName: row.companyName,
        email: row.email,
        phone: row.phone,
        location: row.location,
        internalNotes: row.internalNotes,
        ownerId: row.ownerId ?? "",
        version: row.version,
        archived: !!row.archivedAt,
        createdAt: row.createdAt.toISOString(),
        lastActivityAt: row.lastActivityAt.toISOString(),
        openLeadCount: Number(row.openLeadCount)
    };
}
async function members(trx, context) {
    return trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt").orderBy("u.name").orderBy("u.id").select("u.id", "u.name");
}
async function readCustomers(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customerQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        requireRead(context);
        const base = baseQuery(trx, context, input);
        const total = Number((await base.clone().count({
            n: "c.id"
        }).first())?.n ?? 0);
        const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
        const order = input.sort === "activity" ? "lastActivityAt" : input.sort === "newest" ? "c.createdAt" : "c.name";
        const direction = input.sort === "name" ? "asc" : "desc";
        const rows = await selected(base.clone(), trx, context).orderBy(order, direction).orderBy("c.id").offset((page - 1) * input.pageSize).limit(input.pageSize);
        const all = baseQuery(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customerQuerySchema"].parse({
            workspaceId: identity.workspaceId
        }));
        const customers = Number((await all.clone().count({
            n: "c.id"
        }).first())?.n ?? 0);
        const withOpenLeads = Number((await all.clone().whereExists(openLeads(trx, context).whereRaw("?? = ??", [
            "l.customerId",
            "c.id"
        ]).select(trx.raw("1"))).count({
            n: "c.id"
        }).first())?.n ?? 0);
        return {
            rows: rows.map(dto),
            total,
            page,
            members: await members(trx, context),
            capabilities: customerCapabilities(context),
            totals: {
                customers,
                withOpenLeads
            },
            policyRevision: context.policy.revision,
            now: new Date().toISOString()
        };
    });
}
async function record(trx, context, id, lock = false) {
    requireRead(context);
    const q = trx("customers as c").where({
        "c.id": id,
        "c.workspaceId": context.workspaceId
    });
    const row = await (lock ? q.forUpdate() : selected(q, trx, context)).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return row;
}
async function readCustomerRecordInTransaction(trx, context, id) {
    return dto(await record(trx, context, id));
}
function leadDTO(row) {
    return {
        id: row.id,
        number: `LD-${String(row.leadNumber).padStart(4, "0")}`,
        name: row.service,
        status: ({
            new: "New",
            contacted: "Contacted",
            "estimate-sent": "Estimate sent",
            won: "Won",
            lost: "Lost"
        })[row.stage] ?? row.stage,
        version: row.version,
        customerId: row.customerId,
        ...row.customerName ? {
            customerName: row.customerName
        } : {}
    };
}
const eventLabels = {
    created: "Customer created",
    updated: "Contact details updated",
    archived: "Customer archived",
    restored: "Customer restored",
    linked: "Lead linked",
    unlinked: "Lead unlinked",
    note: "Team note added"
};
async function readCustomer(db, identity, enabled, id, activityPage = 1, notesPage = 1, leadsPage = 1) {
    if (!/^[0-9a-f-]{36}$/i.test(id) || ![
        activityPage,
        notesPage,
        leadsPage
    ].every((p)=>Number.isInteger(p) && p > 0 && p <= 100000)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const customer = dto(await record(trx, context, id));
        const linkedCount = Number((await leads(trx, context).where("l.customerId", id).count({
            n: "l.id"
        }).first())?.n ?? 0);
        const linked = await leads(trx, context).where("l.customerId", id).orderBy("l.leadNumber").limit(20).offset((Math.min(leadsPage, Math.max(1, Math.ceil(linkedCount / 20))) - 1) * 20).select("l.id", "l.leadNumber", "l.name", "l.service", "l.stage", "l.version", "l.customerId", "l.ownerId");
        const activity = trx("customerActivity").where({
            workspaceId: identity.workspaceId,
            customerId: id
        });
        const customerEvents = activity.clone().select(trx.raw("concat('customer:',id) as id"), "type", "actorName", "createdAt", trx.raw("'customer' as source"));
        const linkedEvents = leads(trx, context).where("l.customerId", id).join("leadActivity as a", function() {
            this.on("a.leadId", "l.id").andOn("a.workspaceId", "l.workspaceId");
        }).select(trx.raw("concat('lead:',a.id) as id"), "a.type", "a.actorName", "a.createdAt", trx.raw("'lead' as source"));
        const history = trx.queryBuilder().unionAll([
            customerEvents,
            linkedEvents
        ], true).as("history");
        const activityTotal = Number((await trx.from(history).count({
            n: "id"
        }).first())?.n ?? 0);
        const events = await trx.from(history).select("*").orderBy("createdAt", "desc").orderBy("id", "desc").offset((Math.min(activityPage, Math.max(1, Math.ceil(activityTotal / 20))) - 1) * 20).limit(20);
        const noteQuery = activity.clone().andWhere("type", "note");
        const notesTotal = Number((await noteQuery.clone().count({
            n: "id"
        }).first())?.n ?? 0);
        const notes = await noteQuery.orderBy("createdAt", "desc").orderBy("id", "desc").offset((Math.min(notesPage, Math.max(1, Math.ceil(notesTotal / 20))) - 1) * 20).limit(20);
        return {
            customer,
            leads: linked.map((row)=>({
                    ...leadDTO(row),
                    canUnlink: customerCapabilities(context).link && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                        permission: "leads.update",
                        fields: [
                            "customerId"
                        ],
                        resource: {
                            kind: "lead",
                            id: row.id,
                            workspaceId: context.workspaceId,
                            ownerId: row.ownerId
                        }
                    }).allowed
                })),
            leadsTotal: linkedCount,
            events: events.map((e)=>({
                    id: e.id,
                    text: e.source === "lead" ? "Linked lead activity" : eventLabels[e.type] ?? "Customer updated",
                    actor: e.actorName ?? "Former teammate",
                    createdAt: e.createdAt.toISOString(),
                    source: e.source
                })),
            notes: notes.map((n)=>({
                    id: n.id,
                    body: n.body,
                    author: n.actorName,
                    createdAt: n.createdAt.toISOString()
                })),
            activityTotal,
            notesTotal,
            members: await members(trx, context),
            capabilities: customerCapabilities(context),
            policyRevision: context.policy.revision
        };
    });
}
async function searchCustomerLeads(db, identity, enabled, id, q) {
    if (q.length > 200) throw new CustomerValidationError("Search is too long.");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const c = await record(trx, context, id);
        if (!customerCapabilities(context).link || c.archivedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const pattern = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";
        const writable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "leads.update",
            fields: [
                "customerId"
            ],
            resource: {
                kind: "lead",
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: context.userId
            }
        });
        const result = await leads(trx, context).modify((query)=>{
            if (writable.allowed && writable.scope === "assigned") query.andWhere("l.ownerId", context.userId);
        }).whereNull("l.archivedAt").andWhere(function() {
            this.whereILike("l.name", pattern).orWhereILike("l.service", pattern);
            if (/^LD-\d+$/i.test(q) && Number.isSafeInteger(Number(q.slice(3))) && Number(q.slice(3)) <= 2147483647) this.orWhere("l.leadNumber", Number(q.slice(3)));
        }).leftJoin("customers as other", function() {
            this.on("other.id", "l.customerId").andOn("other.workspaceId", "l.workspaceId");
        }).orderBy("l.leadNumber").limit(25).select("l.id", "l.leadNumber", "l.name", "l.service", "l.stage", "l.version", "l.customerId", "l.ownerId", "other.name as customerName");
        return result.map(leadDTO);
    });
}
async function ownerValid(trx, context, ownerId) {
    if (ownerId && !await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where({
        "m.workspaceId": context.workspaceId,
        "m.userId": ownerId
    }).whereNull("u.deletionRequestedAt").first("u.id")) throw new CustomerValidationError("Choose a current workspace member.");
}
async function event(trx, context, id, type, body = "") {
    const actor = await trx("users").where("id", context.userId).first("name");
    await trx("customerActivity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        customerId: id,
        actorId: context.userId,
        actorName: actor.name,
        type,
        body
    });
}
async function replay(trx, context, id, action, hash) {
    const found = await trx("customerOperations").where("id", id).first();
    if (found && (found.workspaceId !== context.workspaceId || found.actorId !== context.userId || found.action !== action || found.requestHash !== hash)) throw new CustomerConflictError("This submission was already used with different details.");
    return found;
}
async function createCustomer(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customerCreateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireRead(context);
        if (!customerCapabilities(context).create) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
        const previous = await replay(trx, context, input.submissionId, "create", hash);
        if (previous) {
            await record(trx, context, previous.customerId);
            return {
                customerId: previous.customerId
            };
        }
        await ownerValid(trx, context, input.values.ownerId);
        const v = input.values;
        const possible = await trx("customers").where("workspaceId", identity.workspaceId).andWhere(function() {
            this.whereRaw("lower(name)=lower(?)", [
                v.name
            ]);
            if (v.email) this.orWhereRaw("lower(email)=lower(?)", [
                v.email
            ]);
            if (v.phone) this.orWhereRaw(`regexp_replace(phone,'[^0-9]','','g')=?`, [
                v.phone.replace(/\D/g, "")
            ]);
        }).orderBy("customerNumber").limit(10);
        if (possible.length && !input.allowDuplicate) throw new CustomerDuplicateError(possible.map((row)=>({
                id: row.id,
                number: number(row.customerNumber),
                name: row.name,
                reason: v.email && row.email.toLowerCase() === v.email.toLowerCase() ? "email" : v.phone && row.phone.replace(/\D/g, "") === v.phone.replace(/\D/g, "") ? "phone" : "name"
            })));
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx("customers").insert({
            ...v,
            ownerId: v.ownerId || null,
            id,
            workspaceId: identity.workspaceId
        });
        await event(trx, context, id, "created");
        await trx("customerOperations").insert({
            id: input.submissionId,
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            action: "create",
            requestHash: hash,
            customerId: id,
            version: 1
        });
        return {
            customerId: id
        };
    });
}
async function mutateCustomer(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customerMutationSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireRead(context);
        const permissionId = input.action === "note" ? "customers.read" : input.action === "archive" ? "customers.archive" : input.action === "delete" ? "customers.delete" : "customers.update";
        if (!permission(context, permissionId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
        const previous = await replay(trx, context, input.submissionId, input.action, hash);
        if (previous) {
            if (input.action !== "delete") await record(trx, context, input.customerId);
            return {
                customerId: input.customerId,
                version: previous.version,
                deleted: input.action === "delete"
            };
        }
        const customer = await record(trx, context, input.customerId, true);
        if (input.action !== "note" && customer.version !== input.expectedVersion) throw new CustomerConflictError();
        if (customer.archivedAt && ![
            "archive",
            "delete"
        ].includes(input.action)) throw new CustomerConflictError("Restore this customer before making changes.");
        const version = customer.version + 1;
        let type = "updated";
        const patch = {
            version,
            updatedAt: trx.fn.now(),
            lastActivityAt: trx.fn.now()
        };
        if (input.action === "update") {
            await ownerValid(trx, context, input.values.ownerId);
            Object.assign(patch, input.values, {
                ownerId: input.values.ownerId || null
            });
        }
        if (input.action === "archive") {
            patch.archivedAt = input.archived ? trx.fn.now() : null;
            type = input.archived ? "archived" : "restored";
        }
        if (input.action === "note") type = "note";
        if (input.action === "link") {
            const lead = await leads(trx, context).where("l.id", input.leadId).forUpdate().first();
            if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "leads.update",
                fields: [
                    "customerId"
                ],
                resource: {
                    kind: "lead",
                    id: lead.id,
                    workspaceId: identity.workspaceId,
                    ownerId: lead.ownerId
                }
            }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            if (lead.archivedAt || lead.version !== input.expectedLeadVersion || lead.customerId !== input.expectedPreviousCustomerId) throw new CustomerConflictError("This lead changed. Search again and review its current customer link.");
            if (input.unlink && lead.customerId !== customer.id || !input.unlink && lead.customerId && lead.customerId !== customer.id && !input.replace) throw new CustomerConflictError("Confirm replacement of the existing customer link.");
            if (lead.customerId && lead.customerId !== customer.id) {
                const old = await record(trx, context, lead.customerId, true);
                await trx("customers").where({
                    id: old.id,
                    workspaceId: identity.workspaceId
                }).update({
                    version: old.version + 1,
                    lastActivityAt: trx.fn.now(),
                    updatedAt: trx.fn.now()
                });
                await event(trx, context, old.id, "unlinked");
            }
            await trx("leads").where({
                id: lead.id,
                workspaceId: identity.workspaceId
            }).update({
                customerId: input.unlink ? null : customer.id,
                version: lead.version + 1,
                updatedAt: trx.fn.now(),
                lastActivityAt: trx.fn.now()
            });
            type = input.unlink ? "unlinked" : "linked";
        }
        if (input.action === "delete") {
            if (input.typedConfirmation !== number(customer.customerNumber)) throw new CustomerValidationError("Type the exact customer number to confirm deletion.");
            const linked = await trx("leads").where({
                workspaceId: identity.workspaceId,
                customerId: customer.id
            }).forUpdate().select("id", "ownerId", "stage", "archivedAt");
            // Compatible with the pre-foundation local schema while Jobs remains disabled.
            if (await trx.schema.hasTable("jobs")) {
                const activeJob = await trx("jobs").where({
                    workspaceId: identity.workspaceId,
                    customerId: customer.id
                }).whereNotIn("status", [
                    "completed",
                    "canceled"
                ]).first("id");
                if (activeJob) throw new CustomerValidationError("Complete or cancel this customer's active jobs before deleting the customer.");
            }
            if (linked.some((l)=>!l.archivedAt && [
                    "new",
                    "contacted",
                    "estimate-sent"
                ].includes(l.stage)) && !input.unlinkOpenLeads) throw new CustomerValidationError("Confirm that open leads will be unlinked and retained.");
            for (const l of linked)if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "leads.read",
                resource: {
                    kind: "lead",
                    id: l.id,
                    workspaceId: identity.workspaceId,
                    ownerId: l.ownerId
                }
            }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "leads.update",
                fields: [
                    "customerId"
                ],
                resource: {
                    kind: "lead",
                    id: l.id,
                    workspaceId: identity.workspaceId,
                    ownerId: l.ownerId
                }
            }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            await trx("leads").where({
                workspaceId: identity.workspaceId,
                customerId: customer.id
            }).update({
                customerId: null,
                version: trx.raw("version+1"),
                updatedAt: trx.fn.now(),
                lastActivityAt: trx.fn.now()
            });
            await trx("customers").where({
                id: customer.id,
                workspaceId: identity.workspaceId
            }).delete();
        } else {
            await trx("customers").where({
                id: customer.id,
                workspaceId: identity.workspaceId
            }).update(patch);
            await event(trx, context, customer.id, type, input.action === "note" ? input.body : "");
        }
        await trx("customerOperations").insert({
            id: input.submissionId,
            workspaceId: identity.workspaceId,
            customerId: customer.id,
            actorId: identity.userId,
            action: input.action,
            requestHash: hash,
            version
        });
        return {
            customerId: customer.id,
            version,
            deleted: input.action === "delete"
        };
    });
}
async function exportCustomers(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customerExportSchema"].parse(raw);
    if (input.query.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireRead(context);
        if (!permission(context, "customers.export")) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const q = baseQuery(trx, context, input.query);
        if (input.customerId) q.andWhere("c.id", input.customerId);
        const total = Number((await q.clone().count({
            n: "c.id"
        }).first())?.n ?? 0);
        if (total !== input.expectedCount || !total || total > 50000) throw new CustomerConflictError("Export scope changed or exceeds 50,000 rows. Reload and review the count again.");
        const rows = await q.clone().select("c.customerNumber", "c.name", "c.type", "c.companyName", "c.email", "c.phone", "c.location", "c.ownerId", "c.createdAt").orderBy("c.name").orderBy("c.id").limit(50000);
        const roster = await members(trx, context);
        const labels = {
            number: "Customer number",
            name: "Name",
            type: "Type",
            companyName: "Company",
            email: "Email",
            phone: "Phone",
            location: "Location",
            owner: "Owner",
            createdAt: "Customer since"
        };
        const chunks = [
            "\uFEFF" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((key)=>labels[key]))
        ];
        let bytes = Buffer.byteLength(chunks[0]);
        for (const row of rows){
            const cells = {
                ...row,
                number: number(row.customerNumber),
                owner: roster.find((m)=>m.id === row.ownerId)?.name ?? "",
                createdAt: row.createdAt.toISOString()
            };
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((key)=>cells[key]));
            bytes += Buffer.byteLength(line);
            if (bytes > 32000000) throw new CustomerValidationError("Narrow the export filters to reduce the file size.");
            chunks.push(line);
        }
        await trx("customerExportAudit").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            rowCount: total
        });
        return chunks.join("");
    });
}
async function relatedCustomerForLead(trx, context, leadId) {
    if (!context.enabledPermissions.includes("customers.related.read") && !context.enabledPermissions.includes("customers.read")) return undefined;
    const lead = await leads(trx, context).where("l.id", leadId).first("l.id", "l.customerId", "l.ownerId", "l.name", "l.email", "l.phone");
    if (!lead?.customerId || context.membership.role === "field" && lead.ownerId !== context.userId) return undefined;
    const ref = {
        kind: "lead",
        id: lead.id,
        workspaceId: context.workspaceId,
        ownerId: lead.ownerId
    };
    const target = {
        kind: "customer",
        id: lead.customerId,
        workspaceId: context.workspaceId,
        related: [
            ref
        ]
    };
    const full = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "customers.read",
        resource: target
    }).allowed;
    if (!full && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "customers.related.read",
        resource: target
    }).allowed) return undefined;
    const customer = await trx("customers").where({
        workspaceId: context.workspaceId,
        id: lead.customerId
    }).first("id", "customerNumber", "name", "email", "phone");
    if (!customer) return undefined;
    return {
        name: customer.name,
        number: number(customer.customerNumber),
        email: customer.email,
        phone: customer.phone,
        differs: customer.name !== lead.name || customer.email !== lead.email || customer.phone !== lead.phone,
        ...full ? {
            customerId: customer.id
        } : {}
    };
}
}),
"[project]/packages/data/src/customers/chat-evidence.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "customerChatEvidenceAllowed",
    ()=>customerChatEvidenceAllowed,
    "customerChatStamp",
    ()=>customerChatStamp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
;
async function customerChatStamp(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "leads.read");
    const leadScope = scope.allowed && [
        "workspace",
        "assigned"
    ].includes(scope.scope) ? scope.scope : "none";
    const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v),'')) AS stamp FROM (
 SELECT 'c:'||id::text||':'||version::text AS v FROM customers WHERE "workspaceId"=?
 UNION ALL SELECT 'a:'||id::text FROM "customerActivity" WHERE "workspaceId"=?
 UNION ALL SELECT 'l:'||id::text||':'||version::text||':'||coalesce("ownerId",'') FROM leads WHERE "workspaceId"=? AND (?='workspace' OR (?='assigned' AND "ownerId"=?))
 UNION ALL SELECT 'la:'||a.id::text FROM "leadActivity" a JOIN leads l ON l.id=a."leadId" AND l."workspaceId"=a."workspaceId" WHERE l."workspaceId"=? AND (?='workspace' OR (?='assigned' AND l."ownerId"=?))
 UNION ALL SELECT 'm:'||m."userId"||':'||m.xmin::text||':'||u.name||':'||u.email||':'||coalesce(u."deletionRequestedAt"::text,'') FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=?
 ) evidence`, [
        context.workspaceId,
        context.workspaceId,
        context.workspaceId,
        leadScope,
        leadScope,
        context.userId,
        context.workspaceId,
        leadScope,
        leadScope,
        context.userId,
        context.workspaceId
    ]);
    return rows[0].stamp;
}
async function customerChatEvidenceAllowed(trx, context, stamp) {
    if (!stamp) return true;
    const full = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "customers.read",
        resource: {
            kind: "customer",
            id: "evidence",
            workspaceId: context.workspaceId,
            related: []
        }
    }).allowed;
    const related = context.enabledPermissions.includes("customers.related.read") && context.policy.grants.some((g)=>g.role === context.membership.role && g.permission === "customers.related.read");
    return (full || related) && stamp === await customerChatStamp(trx, context);
}
}),
"[project]/packages/data/src/jobs/query.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scopedJobQuery",
    ()=>scopedJobQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
function scopedJobQuery(trx, context, forceAssigned = false) {
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    if (!access.allowed || ![
        'workspace',
        'assigned'
    ].includes(access.scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const scope = access.scope === 'assigned' || forceAssigned ? 'assigned' : 'workspace';
    const query = trx('jobs as j').where('j.workspaceId', context.workspaceId);
    if (scope === 'assigned') {
        query.andWhere((builder)=>builder.where('j.primaryOwnerId', context.userId).orWhereExists(trx('jobTeamMembers as jt').select(trx.raw('1')).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where('jt.userId', context.userId)));
    }
    return {
        query,
        scope
    };
}
}),
"[project]/packages/data/src/jobs/deadline.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobDeadlineReviewConflict",
    ()=>JobDeadlineReviewConflict,
    "jobDeadlineContextInTransaction",
    ()=>jobDeadlineContextInTransaction,
    "readJobCreationDeadline",
    ()=>readJobCreationDeadline,
    "resolveReviewedJobDeadline",
    ()=>resolveReviewedJobDeadline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/job-notification-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/deadline.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
class JobDeadlineReviewConflict extends Error {
    constructor(){
        super('The deadline rule or creation date changed. Reload the deadline rule and review this Job again.');
    }
}
async function jobDeadlineContextInTransaction(trx, workspaceId) {
    const row = await trx('jobNotificationSettings').where({
        workspaceId,
        section: 'deadline'
    }).first('version', 'values');
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).first('timezone');
    const { today, createdAt } = (await trx.raw(`SELECT to_char(at AT TIME ZONE ?, 'YYYY-MM-DD') AS today, at AS \"createdAt\" FROM (SELECT clock_timestamp() AS at) creation`, [
        workspace.timezone
    ])).rows[0];
    const rule = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultDeadlineRuleSchema"].parse(row?.values ?? {
        mode: 'unset'
    });
    return {
        createdAt,
        rule,
        revision: String(row?.version ?? 0),
        createdDate: today,
        projectedDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultJobDeadline"])(today, rule),
        timezone: workspace.timezone
    };
}
async function readJobCreationDeadline(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, c)=>{
        const resource = {
            kind: 'job',
            id: c.workspaceId,
            workspaceId: c.workspaceId,
            ownerId: c.userId,
            teamUserIds: []
        };
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
            permission: 'jobs.create'
        }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(c, 'jobs.read').allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
            permission: 'jobs.assign',
            resource
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const { createdAt: _createdAt, ...context } = await jobDeadlineContextInTransaction(trx, c.workspaceId);
        void _createdAt;
        return {
            context,
            canOverride: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
                permission: 'jobs.schedule.update',
                resource
            }).allowed
        };
    });
}
async function resolveReviewedJobDeadline(trx, context, input) {
    if (!input.deadlineIntent || !input.deadlinePreview) return {
        completionDeadline: input.completionDeadline ?? null
    };
    const current = await jobDeadlineContextInTransaction(trx, context.workspaceId), preview = input.deadlinePreview;
    const resolved = input.deadlineIntent.mode === 'workspace' ? current.projectedDate : input.deadlineIntent.mode === 'date' ? input.deadlineIntent.date : null;
    if (preview.revision !== current.revision || preview.createdDate !== current.createdDate || preview.timezone !== current.timezone || preview.resolvedDate !== resolved || input.completionDeadline !== resolved) throw new JobDeadlineReviewConflict();
    return {
        completionDeadline: resolved,
        createdAt: current.createdAt
    };
}
}),
"[project]/packages/data/src/jobs/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobConflictError",
    ()=>JobConflictError,
    "JobValidationError",
    ()=>JobValidationError,
    "createJob",
    ()=>createJob,
    "createJobInTransaction",
    ()=>createJobInTransaction,
    "createJobMessage",
    ()=>createJobMessage,
    "getJobMessages",
    ()=>getJobMessages,
    "mutateJob",
    ()=>mutateJob,
    "mutateJobInTransaction",
    ()=>mutateJobInTransaction,
    "readJob",
    ()=>readJob,
    "readJobs",
    ()=>readJobs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/jobs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/deadline.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/job-notification-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/sync.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
class JobConflictError extends Error {
    constructor(message = "This job changed. Reload its current details before trying again."){
        super(message);
    }
}
class JobValidationError extends Error {
}
function resource(row) {
    return {
        kind: "job",
        id: row.id,
        workspaceId: row.workspaceId,
        ownerId: row.primaryOwnerId,
        teamUserIds: row.teamUserIds
    };
}
function permit(context, permission, row) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission,
        ...row ? {
            resource: resource(row)
        } : {}
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
/** Apply current read scope in SQL before sorting, pagination, counts or record lookup. */ function scoped(trx, context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context).query;
}
const teamSelect = `(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`;
const dateSelect = `to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate", to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`;
async function record(trx, context, id, lock = false) {
    const q = scoped(trx, context).where("j.id", id).select("j.*", trx.raw(teamSelect), trx.raw(dateSelect));
    const row = await (lock ? q.forUpdate("j") : q).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return row;
}
function dto(row) {
    return {
        id: row.id,
        number: `J-${String(row.jobNumber).padStart(4, "0")}`,
        customerId: row.customerId,
        customerName: row.customerName,
        sourceLeadId: row.sourceLeadId,
        title: row.title,
        service: row.service,
        location: row.location,
        description: row.description,
        status: row.status,
        primaryOwnerId: row.primaryOwnerId,
        teamUserIds: row.teamUserIds,
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow,
        completionDeadline: row.completionDeadline,
        waitingReason: row.waitingReason,
        version: row.version,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    };
}
async function validTeam(trx, context, owner, team) {
    if (owner && team.includes(owner)) throw new JobValidationError("The primary owner is already on the job team.");
    const ids = [
        ...owner ? [
            owner
        ] : [],
        ...team
    ];
    if (!ids.length) return;
    const rows = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereIn("m.userId", ids).whereNull("u.deletionRequestedAt").select("m.userId");
    if (rows.length !== ids.length) throw new JobValidationError("Choose current workspace teammates.");
}
async function receipt(trx, context, id, hash) {
    const previous = await trx("jobOperations").where({
        workspaceId: context.workspaceId,
        submissionId: id
    }).first();
    if (previous && (previous.actorId !== context.userId || previous.inputHash !== hash)) throw new JobConflictError();
    return previous ? {
        jobId: previous.jobId,
        version: previous.version
    } : undefined;
}
async function activity(trx, context, jobId, submissionId, version, hash, type, changes, source, createdAt) {
    const actor = await trx("users").where({
        id: context.userId
    }).first("name");
    await trx("jobActivity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        jobId,
        actorId: context.userId,
        actorName: actor.name,
        source,
        type,
        changes: JSON.stringify(changes),
        ...createdAt ? {
            createdAt
        } : {}
    });
    await trx("jobOperations").insert({
        workspaceId: context.workspaceId,
        jobId,
        submissionId,
        actorId: context.userId,
        inputHash: hash,
        version
    });
}
const hashInput = (input)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
async function createJobInTransaction(trx, context, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createJobSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (options.acceptedEstimateId && !input.sourceLeadId) {
        throw new JobValidationError("An estimate-linked job must retain its source lead.");
    }
    permit(context, "jobs.create");
    const assignmentScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "jobs.read");
    const fake = {
        id: input.submissionId,
        workspaceId: context.workspaceId,
        primaryOwnerId: input.primaryOwnerId,
        teamUserIds: input.teamUserIds
    };
    permit(context, "jobs.assign", fake);
    if (!assignmentScope.allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (input.scheduledDate || (input.deadlineIntent ? input.deadlineIntent.mode !== "workspace" : input.completionDeadline)) permit(context, "jobs.schedule.update", fake);
    if (!input.deadlineIntent && !input.completionDeadline && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.schedule.update",
        resource: resource(fake)
    }).allowed) {
        const defaultRow = await trx("jobNotificationSettings").where({
            workspaceId: context.workspaceId,
            section: "deadline"
        }).first("values");
        if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultDeadlineRuleSchema"].parse(defaultRow?.values ?? {
            mode: "unset"
        }).mode === "relative") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const hash = hashInput(input);
    const previous = await receipt(trx, context, input.submissionId, hash);
    if (previous) {
        await record(trx, context, previous.jobId);
        return previous;
    }
    const customer = await trx("customers").where({
        id: input.customerId,
        workspaceId: context.workspaceId
    }).whereNull("archivedAt").first("id", "name");
    if (!customer || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "customers.read",
        resource: {
            kind: "customer",
            id: customer.id,
            workspaceId: context.workspaceId,
            related: []
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    let sourceLeadNumber = null;
    if (input.sourceLeadId) {
        const lead = await trx("leads").where({
            id: input.sourceLeadId,
            workspaceId: context.workspaceId
        }).whereNull("archivedAt").first();
        if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "leads.read",
            resource: {
                kind: "lead",
                id: lead.id,
                workspaceId: context.workspaceId,
                ownerId: lead.ownerId
            }
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (lead.customerId && lead.customerId !== customer.id) {
            throw new JobValidationError("Choose the customer linked to the source lead.");
        }
        if (await trx("jobs").where({
            workspaceId: context.workspaceId,
            sourceLeadId: lead.id
        }).first("id")) {
            throw new JobConflictError("This lead already has a job.");
        }
        sourceLeadNumber = `LD-${String(lead.leadNumber).padStart(4, "0")}`;
    }
    await validTeam(trx, context, input.primaryOwnerId, input.teamUserIds);
    const { completionDeadline, createdAt } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveReviewedJobDeadline"])(trx, context, input);
    // The reviewed workspace rule is a creation policy; manual overrides require scheduling authority above.
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const { submissionId, teamUserIds, deadlineIntent, deadlinePreview, ...values } = input;
    await trx("jobs").insert({
        ...values,
        completionDeadline,
        ...createdAt ? {
            createdAt,
            updatedAt: createdAt
        } : {},
        id,
        acceptedEstimateId: options.acceptedEstimateId ?? null,
        customerName: customer.name,
        sourceLeadNumber,
        createdBy: context.userId,
        status: input.scheduledDate ? "scheduled" : "needs-scheduling"
    });
    if (teamUserIds.length) {
        await trx("jobTeamMembers").insert(teamUserIds.map((userId)=>({
                workspaceId: context.workspaceId,
                jobId: id,
                userId
            })));
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["synchronizeCalendarRecord"])(trx, context.workspaceId, "job", id);
    await activity(trx, context, id, submissionId, 1, hash, "created", {
        status: input.scheduledDate ? "scheduled" : "needs-scheduling",
        primaryOwnerId: input.primaryOwnerId,
        teamUserIds,
        scheduledDate: input.scheduledDate,
        arrivalWindow: input.arrivalWindow,
        completionDeadline,
        ...deadlineIntent ? {
            deadlineIntent,
            deadlinePreview
        } : {}
    }, options.source ?? "ui", createdAt);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyJobCreated"])(trx, context, id, submissionId);
    if (options.requireRead) await record(trx, context, id);
    return {
        jobId: id,
        version: 1
    };
}
async function createJob(db, identity, enabled, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createJobSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>createJobInTransaction(trx, context, input, {
            source
        }));
}
async function membersFor(trx, context, ids) {
    const query = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt");
    if (ids) query.whereIn("u.id", ids);
    return query.select("u.id", "u.name", "m.role").orderBy("u.name").orderBy("u.id");
}
function view(row, context, members) {
    const allowed = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: resource(row)
        }).allowed;
    return {
        ...dto(row),
        ownerName: members.find((m)=>m.id === row.primaryOwnerId)?.name ?? (row.primaryOwnerId ? "Former teammate" : "Unassigned"),
        teamNames: row.teamUserIds.map((id)=>members.find((m)=>m.id === id)?.name ?? "Former teammate"),
        nextStep: "",
        capabilities: {
            status: allowed("jobs.status.update"),
            complete: allowed("jobs.complete"),
            cancel: allowed("jobs.cancel"),
            reopen: allowed("jobs.reopen"),
            schedule: allowed("jobs.schedule.update"),
            assign: allowed("jobs.assign"),
            note: allowed("jobs.progress.create"),
            edit: allowed("jobs.update"),
            files: allowed("jobs.progress.create"),
            removeFiles: allowed("jobs.progress.create")
        }
    };
}
async function readJobs(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const workspace = await trx("workspaces").where({
            id: context.workspaceId
        }).first("timezone");
        // All relative dates use the workspace timezone and the same transaction clock.
        const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [
            workspace.timezone
        ])).rows[0];
        const metricsRow = await scoped(trx, context).whereNotIn("j.status", [
            "completed",
            "canceled"
        ]).select(trx.raw(`count(*)::int as active, count(*) filter (where j."completionDeadline" < ?::date)::int as overdue,
       count(*) filter (where j.status = 'waiting')::int as waiting, count(*) filter (where j."primaryOwnerId" is null)::int as unassigned`, [
            today
        ])).first();
        const facets = await scoped(trx, context).distinct("j.customerName", "j.service");
        const canAssign = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "jobs.assign",
            resource: {
                kind: "job",
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: context.userId,
                teamUserIds: []
            }
        }).allowed;
        const visibleIds = await scoped(trx, context).select("j.primaryOwnerId", trx.raw(teamSelect));
        const participantIds = [
            ...new Set(visibleIds.flatMap((r)=>[
                    ...r.primaryOwnerId ? [
                        r.primaryOwnerId
                    ] : [],
                    ...r.teamUserIds
                ]))
        ];
        const members = await membersFor(trx, context, canAssign ? undefined : participantIds);
        const canReadCustomers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "customers.read");
        const customers = canReadCustomers.allowed && canReadCustomers.scope === "workspace" ? await trx("customers").where("workspaceId", context.workspaceId).whereNull("archivedAt").select("id", "name").orderBy("name").orderBy("id") : [];
        const base = scoped(trx, context);
        if (input.closed) base.whereIn("j.status", [
            "completed",
            "canceled"
        ]);
        else base.whereNotIn("j.status", [
            "completed",
            "canceled"
        ]);
        if (input.status) base.where("j.status", input.status);
        if (input.ownerId) base.where("j.primaryOwnerId", input.ownerId);
        if (input.unassigned) base.whereNull("j.primaryOwnerId");
        if (input.customerId) base.where("j.customerId", input.customerId);
        if (input.customerName) base.where("j.customerName", input.customerName);
        if (input.service) base.where("j.service", input.service);
        if (input.createdAfter) base.whereRaw(`(j."createdAt" AT TIME ZONE ?)::date >= ?::date`, [
            workspace.timezone,
            input.createdAfter
        ]);
        if (input.mine) base.andWhere((q)=>q.where("j.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where("jt.userId", context.userId)));
        if (input.deadline === "unset") base.whereNull("j.completionDeadline");
        if (input.deadline === "overdue") base.where("j.completionDeadline", "<", today);
        if (input.deadline === "upcoming") base.whereRaw(`j."completionDeadline" between ?::date and ?::date + 7`, [
            today,
            today
        ]);
        if (input.q) {
            const q = `%${input.q.replace(/[\\%_]/g, "\\$&")}%`;
            base.andWhere((b)=>b.whereILike("j.title", q).orWhereILike("j.customerName", q).orWhereILike("j.service", q).orWhereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [
                    q
                ]));
        }
        const total = Number((await base.clone().count({
            n: "j.id"
        }).first())?.n ?? 0);
        const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
        const sortColumn = input.sort === "number" ? "j.jobNumber" : input.sort === "ownerName" ? "ownerSort.name" : `j.${input.sort}`;
        const query = base.clone();
        if (input.sort === "ownerName") query.leftJoin("users as ownerSort", "ownerSort.id", "j.primaryOwnerId");
        const rows = await query.select("j.*", trx.raw(teamSelect), trx.raw(dateSelect)).orderBy(sortColumn, input.direction, "last").orderBy("j.id").limit(input.pageSize).offset((page - 1) * input.pageSize);
        return {
            rows: rows.map((r)=>view(r, context, members)),
            total,
            page,
            pageSize: input.pageSize,
            timezone: workspace.timezone,
            today,
            metrics: {
                active: Number(metricsRow.active),
                overdue: Number(metricsRow.overdue),
                waiting: Number(metricsRow.waiting),
                unassigned: Number(metricsRow.unassigned)
            },
            options: {
                members,
                customers,
                customerNames: [
                    ...new Set(facets.map((f)=>f.customerName))
                ].sort(),
                services: [
                    ...new Set(facets.map((f)=>f.service).filter(Boolean))
                ].sort()
            },
            canCreate: canAssign && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "jobs.create"
            }).allowed && canReadCustomers.allowed && canReadCustomers.scope === "workspace",
            canScheduleCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "jobs.schedule.update",
                resource: {
                    kind: "job",
                    id: context.workspaceId,
                    workspaceId: context.workspaceId,
                    ownerId: context.userId,
                    teamUserIds: []
                }
            }).allowed
        };
    });
}
async function readJob(db, identity, enabled, id, page = 1) {
    id = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobIdSchema"].parse(id);
    if (!Number.isInteger(page) || page < 1 || page > 100000) throw new JobValidationError("Invalid activity page.");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await record(trx, context, id);
        const query = trx("jobActivity").where({
            workspaceId: context.workspaceId,
            jobId: id
        });
        const total = Number((await query.clone().count({
            n: "id"
        }).first())?.n ?? 0);
        const activityPage = Math.min(page, Math.max(1, Math.ceil(total / 20)));
        const entries = await query.clone().select("id", "actorName", "source", "type", "changes", "createdAt").orderBy("createdAt", "desc").orderBy("id", "desc").limit(20).offset((activityPage - 1) * 20);
        const members = await membersFor(trx, context, [
            row.primaryOwnerId,
            ...row.teamUserIds
        ].filter((id)=>!!id));
        let canOpenCustomer = false, canOpenLead = false;
        if (row.customerId) canOpenCustomer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "customers.read",
            resource: {
                kind: "customer",
                id: row.customerId,
                workspaceId: context.workspaceId,
                related: [
                    {
                        kind: "job",
                        id: row.id,
                        workspaceId: context.workspaceId,
                        ownerId: row.primaryOwnerId,
                        teamUserIds: row.teamUserIds
                    }
                ]
            }
        }).allowed;
        if (row.sourceLeadId) {
            const lead = await trx("leads").where({
                workspaceId: context.workspaceId,
                id: row.sourceLeadId
            }).first("ownerId");
            canOpenLead = !!lead && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "leads.read",
                resource: {
                    kind: "lead",
                    id: row.sourceLeadId,
                    workspaceId: context.workspaceId,
                    ownerId: lead.ownerId
                }
            }).allowed;
        }
        return {
            job: view(row, context, members),
            activity: entries.map((e)=>({
                    ...e,
                    changes: e.changes,
                    createdAt: e.createdAt.toISOString()
                })),
            activityTotal: total,
            activityPage,
            canOpenCustomer,
            canOpenLead
        };
    });
}
async function mutateJob(db, identity, enabled, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobMutationSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>mutateJobInTransaction(trx, context, input, source));
}
async function mutateJobInTransaction(trx, context, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobMutationSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = await record(trx, context, input.jobId, true);
    const actionPermission = input.action === "note" ? "jobs.progress.create" : input.action === "assign" ? "jobs.assign" : input.action === "edit" ? "jobs.update" : input.action !== "status" ? "jobs.schedule.update" : input.reopenDeadline !== undefined ? "jobs.reopen" : input.to === "completed" ? "jobs.complete" : input.to === "canceled" ? "jobs.cancel" : "jobs.status.update";
    permit(context, actionPermission, row);
    const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
    if (previous) {
        if (previous.jobId !== row.id) throw new JobConflictError();
        return previous;
    }
    if (input.action !== "note" && row.version !== input.expectedVersion) throw new JobConflictError();
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isClosedJob"])(row.status) && input.action !== "status") throw new JobValidationError("Reopen this job before making changes.");
    const patch = {
        version: row.version + 1,
        updatedAt: trx.fn.now(),
        lastActivityAt: trx.fn.now()
    };
    let changes;
    if (input.action === "status") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateJobTransition"])(row, input);
        Object.assign(patch, {
            status: input.to,
            waitingReason: input.to === "waiting" ? input.waitingReason : null
        });
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isClosedJob"])(row.status)) patch.completionDeadline = input.reopenDeadline;
        changes = {
            from: row.status,
            to: input.to,
            waitingReason: input.waitingReason,
            cancellationReason: input.cancellationReason,
            note: input.note,
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isClosedJob"])(row.status) ? {
                previousDeadline: row.completionDeadline,
                completionDeadline: input.reopenDeadline
            } : {}
        };
    } else if (input.action === "schedule") {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertIndependentCalendarSchedule"])(trx, context.workspaceId, "job", row.id);
        Object.assign(patch, {
            scheduledDate: input.scheduledDate,
            arrivalWindow: input.arrivalWindow,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scheduledJobStatus"])(row.status, input.scheduledDate)
        });
        changes = {
            from: {
                scheduledDate: row.scheduledDate,
                arrivalWindow: row.arrivalWindow,
                status: row.status
            },
            to: {
                scheduledDate: input.scheduledDate,
                arrivalWindow: input.arrivalWindow,
                status: patch.status
            }
        };
    } else if (input.action === "deadline") {
        patch.completionDeadline = input.completionDeadline;
        changes = {
            from: row.completionDeadline,
            to: input.completionDeadline
        };
    } else if (input.action === "edit") {
        Object.assign(patch, {
            title: input.title,
            service: input.service,
            location: input.location,
            description: input.description
        });
        changes = {
            from: {
                title: row.title,
                service: row.service,
                location: row.location,
                description: row.description
            },
            to: {
                title: input.title,
                service: input.service,
                location: input.location,
                description: input.description
            }
        };
    } else if (input.action === "assign") {
        if (row.primaryOwnerId !== input.primaryOwnerId && row.primaryOwnerId && input.teamUserIds.includes(row.primaryOwnerId)) throw new JobValidationError("Remove the previous primary owner from the team; add them back explicitly in a later change if needed.");
        await validTeam(trx, context, input.primaryOwnerId, input.teamUserIds);
        patch.primaryOwnerId = input.primaryOwnerId;
        changes = {
            from: {
                primaryOwnerId: row.primaryOwnerId,
                teamUserIds: row.teamUserIds
            },
            to: {
                primaryOwnerId: input.primaryOwnerId,
                teamUserIds: input.teamUserIds
            }
        };
        await trx("jobTeamMembers").where({
            workspaceId: context.workspaceId,
            jobId: row.id
        }).delete();
        if (input.teamUserIds.length) await trx("jobTeamMembers").insert(input.teamUserIds.map((userId)=>({
                workspaceId: context.workspaceId,
                jobId: row.id,
                userId
            })));
    } else changes = {
        body: input.body
    };
    await trx("jobs").where({
        workspaceId: context.workspaceId,
        id: row.id
    }).update(patch);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["synchronizeCalendarRecord"])(trx, context.workspaceId, "job", row.id);
    if (input.action === "schedule") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyVisitChange"])(trx, context, input.submissionId, !input.scheduledDate ? "cleared" : row.scheduledDate ? "rescheduled" : "scheduled", [
        {
            type: "job",
            id: row.id
        }
    ], {
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow
    }, {
        scheduledDate: input.scheduledDate,
        arrivalWindow: input.arrivalWindow
    });
    await activity(trx, context, row.id, input.submissionId, row.version + 1, hash, input.action, changes, source);
    if (input.action === "status") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyJobStatusChanged"])(trx, context, row.id, input.submissionId, row.status, input.to);
    if (input.action === "deadline") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyJobDeadlineChanged"])(trx, context, row.id, input.submissionId, row.completionDeadline, input.completionDeadline);
    if (input.action === "status" && input.reopenDeadline !== undefined) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyJobDeadlineChanged"])(trx, context, row.id, input.submissionId, row.completionDeadline, input.reopenDeadline);
    if (input.action === "assign") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyJobAssignmentChanged"])(trx, context, row.id, input.submissionId, row, input);
    return {
        jobId: row.id,
        version: row.version + 1
    };
}
async function getJobMessages(db, identity, enabled, jobId, limit = 100) {
    jobId = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobIdSchema"].parse(jobId);
    if (identity.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        // Verify user can access this job
        const job = await record(trx, context, jobId, false);
        const messages = await trx('jobMessages').where({
            workspaceId: context.workspaceId,
            jobId
        }).orderBy('createdAt', 'desc').limit(Math.min(limit, 500)).select('id', 'authorId', 'authorName as author', 'createdAt as at', 'text');
        return messages.map((m)=>({
                ...m,
                at: m.at.toISOString()
            }));
    });
}
async function createJobMessage(db, identity, enabled, jobId, text) {
    jobId = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobIdSchema"].parse(jobId);
    if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 4000) {
        throw new JobValidationError('Message must be between 1 and 4000 characters');
    }
    if (identity.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        // Verify user can access this job
        const job = await record(trx, context, jobId, false);
        // Get author name
        const actor = await trx('users').where({
            id: context.userId
        }).first('name');
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        const now = new Date();
        // Create message
        await trx('jobMessages').insert({
            id,
            workspaceId: context.workspaceId,
            jobId,
            authorId: context.userId,
            authorName: actor?.name || context.userId,
            text: text.trim(),
            createdAt: now
        });
        return {
            id,
            authorId: context.userId,
            authorName: actor?.name || context.userId,
            createdAt: now.toISOString()
        };
    });
}
}),
"[project]/packages/data/src/calendar/read.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readCalendar",
    ()=>readCalendar,
    "readCalendarAdvisories",
    ()=>readCalendarAdvisories,
    "readCalendarVisit",
    ()=>readCalendarVisit,
    "scopedCalendarRecordsQuery",
    ()=>scopedCalendarRecordsQuery
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/schedule.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
const peopleSQL = (primary, table, alias, foreign, row)=>`ARRAY(SELECT DISTINCT p FROM unnest(ARRAY[${primary}]::text[] || ARRAY(SELECT ${alias}."userId" FROM "${table}" ${alias} WHERE ${alias}."workspaceId"=${row}."workspaceId" AND ${alias}."${foreign}"=${row}.id)) p WHERE p IS NOT NULL)`;
const jobTeamSQL = `ARRAY(SELECT jt."userId" FROM "jobTeamMembers" jt WHERE jt."workspaceId"=j."workspaceId" AND jt."jobId"=j.id)`;
const jobPeople = peopleSQL('j."primaryOwnerId"', 'jobTeamMembers', 'jt', 'jobId', 'j');
const orderPeople = peopleSQL('w."primaryAssigneeId"', 'workOrderCrew', 'wc', 'workOrderId', 'w');
const scopes = (context)=>({
        calendar: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read'),
        job: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read'),
        work_order: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read')
    });
function calendarScope(context) {
    const scope = scopes(context).calendar;
    if (!scope.allowed || ![
        'workspace',
        'own_assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return scope.scope === 'own_assigned' ? 'own' : 'workspace';
}
function scopedCalendarRecordsQuery(trx, context, range, ownOnly = false, exportScopes) {
    const scope = scopes(context), own = ownOnly || calendarScope(context) === 'own';
    const jobs = trx('jobs as j').join('calendarVisitRecords as r', (q)=>q.on('r.workspaceId', 'j.workspaceId').andOn('r.jobId', 'j.id')).join('calendarVisits as v', (q)=>q.on('v.workspaceId', 'r.workspaceId').andOn('v.id', 'r.visitId')).where('j.workspaceId', context.workspaceId).whereNull('r.endedAt').whereNotIn('j.status', [
        'completed',
        'canceled'
    ]);
    const orders = trx('workOrders as w').join('jobs as j', (q)=>q.on('j.workspaceId', 'w.workspaceId').andOn('j.id', 'w.jobId')).join('calendarVisitRecords as r', (q)=>q.on('r.workspaceId', 'w.workspaceId').andOn('r.workOrderId', 'w.id')).join('calendarVisits as v', (q)=>q.on('v.workspaceId', 'r.workspaceId').andOn('v.id', 'r.visitId')).where('w.workspaceId', context.workspaceId).whereNull('r.endedAt').whereNull('w.archivedAt').whereNotIn('w.status', [
        'completed',
        'canceled'
    ]);
    // Every linked record shares its visit date. Restrict visits before computing people,
    // deadlines and full active membership, while retaining the entire unscheduled queue.
    if (range) for (const records of [
        jobs,
        orders
    ])records.where((q)=>q.whereBetween('v.scheduledDate', [
            range.from,
            range.to
        ]).orWhereNull('v.scheduledDate'));
    const jobAllowed = scope.job.allowed && [
        'workspace',
        'assigned'
    ].includes(scope.job.scope);
    const orderAllowed = scope.work_order.allowed && [
        'workspace',
        'assigned_job'
    ].includes(scope.work_order.scope);
    if (!jobAllowed) jobs.whereRaw('false');
    if (own || scope.job.allowed && scope.job.scope === 'assigned') jobs.whereRaw('? = ANY(' + jobPeople + ')', [
        context.userId
    ]);
    if (!orderAllowed) orders.whereRaw('false');
    if (ownOnly) orders.whereNot('w.status', 'draft');
    if (scope.work_order.allowed && scope.work_order.scope === 'assigned_job') {
        orders.whereNot('w.status', 'draft').whereRaw('(? = ANY(' + orderPeople + ') OR ? = ANY(' + jobPeople + '))', [
            context.userId,
            context.userId
        ]);
    }
    if (own) orders.whereRaw('? = ANY(' + orderPeople + ')', [
        context.userId
    ]);
    if (exportScopes) {
        if (exportScopes.jobs.kind === 'unavailable') jobs.whereRaw('false');
        else if (exportScopes.jobs.scope === 'assigned') jobs.whereRaw('? = ANY(' + jobPeople + ')', [
            context.userId
        ]);
        if (exportScopes.workOrders.kind === 'unavailable') orders.whereRaw('false');
        else if (exportScopes.workOrders.scope === 'assigned_job') {
            orders.whereNot('w.status', 'draft').whereRaw('(? = ANY(' + orderPeople + ') OR (?::boolean AND ? = ANY(' + jobPeople + ')))', [
                context.userId,
                jobAllowed,
                context.userId
            ]);
        }
    }
    const common = `v.id AS "visitId", v.version AS "visitVersion", v."workspaceId", to_char(v."scheduledDate",'YYYY-MM-DD') AS "scheduledDate", v."arrivalWindow",
    (SELECT count(*)::int FROM "calendarVisitRecords" allr WHERE allr."workspaceId"=v."workspaceId" AND allr."visitId"=v.id AND allr."endedAt" IS NULL) AS "activeCount"`;
    jobs.select(trx.raw(`${common}, j.id, 'job' AS type, j."jobNumber" AS number, j.title, j.status, j.version, j."customerName", j.location,
    to_char(j."completionDeadline",'YYYY-MM-DD') AS deadline, j."primaryOwnerId" AS "primaryId", ${jobPeople} AS people, j.id AS "jobId", j."primaryOwnerId" AS "jobOwnerId", ${jobTeamSQL} AS "jobTeam"`));
    // Only a Job already readable in this Calendar scope may contribute a completion deadline.
    const limitedParent = jobAllowed && (own || scope.job.allowed && scope.job.scope === 'assigned');
    const parentVisible = jobAllowed ? `j.status NOT IN ('completed','canceled') AND (${limitedParent ? '? = ANY(' + jobPeople + ')' : 'true'})` : 'false';
    orders.select(trx.raw(`${common}, w.id, 'work_order' AS type, w."workOrderNumber" AS number, w.title, w.status, w.version, j."customerName", j.location,
    CASE WHEN ${parentVisible} THEN to_char(j."completionDeadline",'YYYY-MM-DD') ELSE NULL END AS deadline,
    w."primaryAssigneeId" AS "primaryId", ${orderPeople} AS people, j.id AS "jobId", j."primaryOwnerId" AS "jobOwnerId", ${jobTeamSQL} AS "jobTeam"`, limitedParent ? [
        context.userId
    ] : []));
    return jobs.unionAll([
        orders
    ]);
}
function resource(row) {
    if (row.type === 'job') return {
        kind: 'job',
        id: row.id,
        workspaceId: row.workspaceId,
        ownerId: row.primaryId,
        teamUserIds: row.jobTeam
    };
    return {
        kind: 'work_order',
        id: row.id,
        workspaceId: row.workspaceId,
        primaryAssigneeId: row.primaryId,
        assigneeIds: row.people,
        job: {
            kind: 'job',
            id: row.jobId,
            workspaceId: row.workspaceId,
            ownerId: row.jobOwnerId,
            teamUserIds: row.jobTeam
        }
    };
}
function canSchedule(context, row) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: row.type === 'job' ? 'jobs.schedule.update' : 'workorders.schedule.update',
        resource: resource(row)
    }).allowed;
}
function candidates(trx, query, viewerId) {
    const ids = trx('visible as f').select('f.visitId').groupBy('f.visitId');
    if (query.recordType !== 'all') ids.where('f.type', query.recordType);
    if (query.status !== 'all') {
        const [type, status] = query.status.split(':');
        ids.where({
            'f.type': type,
            'f.status': status
        });
    }
    if (query.customerQuery.trim()) ids.whereRaw(`f."customerName" ILIKE ? ESCAPE '\\'`, [
        '%' + query.customerQuery.trim().replace(/[\\%_]/g, '\\$&') + '%'
    ]);
    const person = query.person === 'me' ? viewerId : query.person.startsWith('member:') ? query.person.slice(7) : null;
    if (person) ids.whereExists(trx('visible as p').select(trx.raw('1')).whereRaw('p."visitId"=f."visitId" AND ? = ANY(p.people)', [
        person
    ]));
    if (query.person === 'unassigned') ids.whereNotExists(trx('visible as p').select(trx.raw('1')).whereRaw('p."visitId"=f."visitId" AND cardinality(p.people)>0'));
    return ids;
}
async function metadata(trx, context) {
    const scope = calendarScope(context);
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone').first();
    const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [
        workspace.timezone
    ])).rows[0];
    return {
        scope,
        timezone: workspace.timezone,
        today: today
    };
}
async function project(trx, context, rows, meta) {
    const ids = [
        ...new Set(rows.flatMap((row)=>row.people))
    ];
    const names = await trx('users').whereIn('id', meta.scope === 'own' ? [
        context.userId
    ] : ids).select('id', 'name');
    const name = new Map(names.map((row)=>[
            row.id,
            row.name
        ]));
    const grouped = new Map();
    for (const row of rows)grouped.set(row.visitId, [
        ...grouped.get(row.visitId) ?? [],
        row
    ]);
    return [
        ...grouped.values()
    ].map((records)=>{
        records.sort((a, b)=>a.type.localeCompare(b.type) || a.number - b.number || a.id.localeCompare(b.id));
        const row = records[0], allowed = records.length === row.activeCount && records.every((r)=>canSchedule(context, r));
        const people = [
            ...new Set(records.flatMap((r)=>r.people))
        ].filter((id)=>meta.scope !== 'own' || id === context.userId);
        const deadlines = records.map((r)=>r.deadline).filter((d)=>!!d).sort();
        const refs = records.map((r)=>({
                type: r.type,
                id: r.id,
                expectedVersion: r.version
            }));
        return {
            id: row.visitId,
            title: row.title,
            customerName: row.customerName,
            location: row.location || null,
            nextStep: null,
            scheduledDate: row.scheduledDate,
            arrivalWindow: row.arrivalWindow,
            timezone: meta.timezone,
            records: records.map((r)=>r.type === 'job' ? {
                    type: 'job',
                    id: r.id,
                    number: `J-${String(r.number).padStart(4, '0')}`,
                    title: r.title,
                    status: r.status
                } : {
                    type: 'work_order',
                    id: r.id,
                    number: `WO-${String(r.number).padStart(4, '0')}`,
                    title: r.title,
                    status: r.status
                }),
            crew: people.map((id)=>({
                    id,
                    name: name.get(id) ?? 'Former teammate'
                })),
            completionDeadline: deadlines.length ? {
                date: deadlines[0],
                overdue: deadlines[0] < meta.today
            } : null,
            waiting: records.some((r)=>r.type === 'job' && r.status === 'waiting'),
            canReschedule: allowed,
            revision: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
                row.visitVersion,
                refs
            ])).digest('hex'),
            review: allowed ? {
                expectedVisitVersion: row.visitVersion,
                records: refs
            } : null
        };
    });
}
async function readCalendar(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const meta = await metadata(trx, context), weekDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarWeekStart"])(input.date ?? meta.today);
        const query = {
            ...input,
            date: weekDate,
            person: meta.scope === 'own' ? 'me' : input.person
        };
        const base = ()=>trx.with('visible', scopedCalendarRecordsQuery(trx, context, {
                from: weekDate,
                to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(weekDate, 6)
            }));
        const matching = ()=>candidates(trx, query, context.userId);
        const queueCount = await base().from('visible').whereNull('scheduledDate').whereIn('visitId', matching()).countDistinct('visitId as count').first();
        const unscheduledTotal = Number(queueCount.count), queuePages = Math.max(1, Math.ceil(unscheduledTotal / 10));
        query.queuePage = Math.min(query.queuePage, queuePages);
        const queue = trx('visible').select('visitId').whereNull('scheduledDate').whereIn('visitId', matching()).groupBy('visitId').orderByRaw("min(deadline) ASC NULLS LAST, min(CASE WHEN type='job' THEN '0:' ELSE '1:' END || lpad(number::text,12,'0')) ASC").orderBy('visitId').limit(10).offset((query.queuePage - 1) * 10);
        const rows = await base().from('visible').select('*').where((q)=>q.whereBetween('scheduledDate', [
                weekDate,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(weekDate, 6)
            ]).whereIn('visitId', matching()).orWhereIn('visitId', queue));
        const visits = await project(trx, context, rows, meta);
        const scope = scopes(context), wide = meta.scope === 'workspace' && [
            scope.job,
            scope.work_order
        ].some((s)=>s.allowed && s.scope === 'workspace');
        const scopedPeople = !wide && meta.scope === 'workspace' ? await trx.with('visible', scopedCalendarRecordsQuery(trx, context)).from('visible').select(trx.raw('DISTINCT unnest(people) AS id')) : [];
        const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').modify((q)=>{
            if (!wide) q.whereIn('u.id', meta.scope === 'own' ? [
                context.userId
            ] : [
                ...new Set([
                    context.userId,
                    ...scopedPeople.map((p)=>p.id)
                ])
            ]);
        }).select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
        const entries = visits.filter((v)=>v.scheduledDate !== null);
        const unscheduled = visits.filter((v)=>v.scheduledDate === null).sort((a, b)=>(a.completionDeadline?.date ?? '9999').localeCompare(b.completionDeadline?.date ?? '9999') || a.records[0].number.localeCompare(b.records[0].number, 'en', {
                numeric: true
            }) || a.id.localeCompare(b.id));
        // Launcher availability only; each selected visit has its own complete-record capability check.
        const ownJob = {
            kind: 'job',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            ownerId: context.userId,
            teamUserIds: []
        };
        const canPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'jobs.schedule.update',
            resource: ownJob
        }).allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'workorders.schedule.update',
            resource: {
                kind: 'work_order',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                primaryAssigneeId: context.userId,
                assigneeIds: [
                    context.userId
                ],
                job: ownJob
            }
        }).allowed;
        return {
            query,
            weekDate,
            today: meta.today,
            timezone: meta.timezone,
            scope: meta.scope,
            viewerId: context.userId,
            members,
            canSchedule: canPlan,
            entries,
            unscheduled,
            unscheduledTotal,
            queuePages
        };
    });
}
async function readCalendarVisit(db, identity, enabled, visitId) {
    // Reuse the strict identity validator without accepting unrelated query parameters.
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarAdvisorySchema"].shape.visitId.parse(visitId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const meta = await metadata(trx, context);
        const rows = await trx.with('visible', scopedCalendarRecordsQuery(trx, context)).from('visible').where({
            visitId
        }).select('*');
        if (!rows.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return (await project(trx, context, rows, meta))[0];
    });
}
async function readCalendarAdvisories(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarAdvisorySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx)=>{
        const target = await readCalendarVisit(trx, identity, enabled, input.visitId);
        if (!target.canReschedule) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (target.revision !== input.revision) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        if (!input.schedule.scheduledDate) return {
            messages: []
        };
        const result = await readCalendar(trx, identity, enabled, {
            workspaceId: identity.workspaceId,
            date: input.schedule.scheduledDate
        });
        const others = result.entries.filter((v)=>v.id !== target.id && v.scheduledDate === input.schedule.scheduledDate);
        const messages = [];
        const span = (window)=>window.split('-').map((t)=>Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
        for (const person of target.crew){
            const work = others.filter((v)=>v.crew.some((p)=>p.id === person.id));
            if (work.length + 1 >= 4) messages.push(`${person.name} would have ${work.length + 1} visits on this date in the schedule you can access.`);
            if (input.schedule.arrivalWindow && work.some((v)=>{
                if (!v.arrivalWindow) return false;
                const [a, b] = span(input.schedule.arrivalWindow), [c, d] = span(v.arrivalWindow);
                return a < d && c < b;
            })) {
                messages.push(`${person.name} has an overlapping arrival window in the schedule you can access.`);
            }
        }
        return {
            messages
        };
    });
}
}),
"[project]/packages/data/src/calendar/sync.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarSharedReviewRequiredError",
    ()=>CalendarSharedReviewRequiredError,
    "assertIndependentCalendarSchedule",
    ()=>assertIndependentCalendarSchedule,
    "calendarRecordColumn",
    ()=>calendarRecordColumn,
    "calendarRecordTable",
    ()=>calendarRecordTable,
    "removeEmptyCalendarVisits",
    ()=>removeEmptyCalendarVisits,
    "snapshotCalendarRecord",
    ()=>snapshotCalendarRecord,
    "synchronizeCalendarRecord",
    ()=>synchronizeCalendarRecord
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
class CalendarSharedReviewRequiredError extends Error {
    constructor(){
        super("This record shares a visit. Review the entire visit before changing its schedule.");
    }
}
const calendarRecordColumn = (type)=>type === "job" ? "jobId" : "workOrderId";
const calendarRecordTable = (type)=>type === "job" ? "jobs" : "workOrders";
async function synchronizeCalendarRecord(trx, workspaceId, type, id) {
    const column = calendarRecordColumn(type), table = calendarRecordTable(type);
    const row = await trx(table).where({
        workspaceId,
        id
    }).select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
    if (!row) throw Error("Missing Calendar source record.");
    const link = await trx("calendarVisitRecords").where({
        workspaceId,
        [column]: id
    }).whereNull("endedAt").forUpdate().first();
    const closed = [
        "completed",
        "canceled"
    ].includes(row.status);
    if (!link && closed) return;
    if (!link) {
        // Creation/reopening is ALWAYS independent. Rejoining requires a later explicit reviewed action.
        const visitId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx("calendarVisits").insert({
            id: visitId,
            workspaceId,
            scheduledDate: row.scheduledDate,
            arrivalWindow: row.arrivalWindow
        });
        await trx("calendarVisitRecords").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId,
            visitId,
            [column]: id
        });
        await snapshotCalendarRecord(trx, workspaceId, visitId, type, row, "backfill");
        return;
    }
    if (closed) {
        await snapshotCalendarRecord(trx, workspaceId, link.visitId, type, row, "closed");
        await trx("calendarVisitRecords").where({
            id: link.id,
            workspaceId
        }).update({
            endedAt: trx.fn.now()
        });
        await trx("calendarVisits").where({
            id: link.visitId,
            workspaceId
        }).increment("version", 1).update({
            updatedAt: trx.fn.now()
        });
        return;
    }
    const visit = await trx("calendarVisits").where({
        workspaceId,
        id: link.visitId
    }).select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).forUpdate().first();
    if (visit.scheduledDate === row.scheduledDate && visit.arrivalWindow === row.arrivalWindow) return;
    await assertIndependentCalendarSchedule(trx, workspaceId, type, id);
    await snapshotCalendarRecord(trx, workspaceId, link.visitId, type, row, row.scheduledDate ? "rescheduled" : "cleared");
    await trx("calendarVisits").where({
        workspaceId,
        id: link.visitId
    }).update({
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow,
        version: visit.version + 1,
        updatedAt: trx.fn.now()
    });
}
async function assertIndependentCalendarSchedule(trx, workspaceId, type, id) {
    const link = await trx("calendarVisitRecords").where({
        workspaceId,
        [calendarRecordColumn(type)]: id
    }).whereNull("endedAt").first();
    if (!link) return;
    const { count } = await trx("calendarVisitRecords").where({
        workspaceId,
        visitId: link.visitId
    }).whereNull("endedAt").count("id as count").first();
    if (Number(count) !== 1) throw new CalendarSharedReviewRequiredError();
}
async function snapshotCalendarRecord(trx, workspaceId, visitId, type, row, reason) {
    await trx("calendarScheduleSnapshots").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId,
        visitId,
        [calendarRecordColumn(type)]: row.id,
        recordVersion: row.version,
        recordStatus: row.status,
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow,
        reason
    });
}
async function removeEmptyCalendarVisits(trx, workspaceId) {
    await trx("calendarVisits as v").where("v.workspaceId", workspaceId).whereNotExists(trx("calendarVisitRecords as r").select(trx.raw("1")).whereRaw('r."workspaceId"=v."workspaceId" AND r."visitId"=v.id')).delete();
}
}),
"[project]/packages/data/src/calendar/commands.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "changeWorkOrderVisit",
    ()=>changeWorkOrderVisit,
    "linkCalendarWorkOrder",
    ()=>linkCalendarWorkOrder,
    "readWorkOrderCreationVisit",
    ()=>readWorkOrderCreationVisit,
    "readWorkOrderVisitManagement",
    ()=>readWorkOrderVisitManagement,
    "scheduleCalendarVisit",
    ()=>scheduleCalendarVisit,
    "separateCalendarWorkOrder",
    ()=>separateCalendarWorkOrder,
    "workOrderCreationVisit",
    ()=>workOrderCreationVisit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/schedule.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/sync.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
async function load(trx, context, ref) {
    if (ref.type === "work_order") {
        const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoped"])(trx, context).where("w.id", ref.id).select(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selects"])(trx)).forUpdate("w").first();
        if (!row || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "workorders.schedule.update",
            resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(row)
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])({
            status: row.status,
            archived: !!row.archivedAt
        });
        return {
            ref: {
                ...ref,
                expectedVersion: row.version
            },
            row,
            order: row
        };
    }
    const row = await trx("jobs").where({
        workspaceId: context.workspaceId,
        id: ref.id
    }).select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).forUpdate().first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const team = await trx("jobTeamMembers").where({
        workspaceId: context.workspaceId,
        jobId: row.id
    }).pluck("userId");
    const jobResource = {
        kind: "job",
        id: row.id,
        workspaceId: context.workspaceId,
        ownerId: row.primaryOwnerId,
        teamUserIds: team
    };
    for (const permission of [
        "jobs.read",
        "jobs.schedule.update"
    ]){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: jobResource
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if ([
        "completed",
        "canceled"
    ].includes(row.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    return {
        ref: {
            ...ref,
            expectedVersion: row.version
        },
        row
    };
}
async function visit(trx, context, id) {
    const row = await trx("calendarVisits").where({
        workspaceId: context.workspaceId,
        id
    }).forUpdate().first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const links = await trx("calendarVisitRecords").where({
        workspaceId: context.workspaceId,
        visitId: id
    }).whereNull("endedAt").orderBy("id").forUpdate();
    if (!links.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    const records = [];
    // Full membership is loaded and authorized before any details or version mismatch leave the service.
    for (const link of links)records.push(await load(trx, context, {
        type: link.jobId ? "job" : "work_order",
        id: link.jobId ?? link.workOrderId,
        expectedVersion: 1
    }));
    return {
        row,
        records
    };
}
async function replay(trx, context, submissionId, hash) {
    const previous = await trx("calendarOperations").where({
        workspaceId: context.workspaceId,
        submissionId
    }).first();
    if (!previous) return;
    if (previous.actorId !== context.userId || previous.inputHash !== hash) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    const result = previous.result;
    for (const ref of result.records)await load(trx, context, ref);
    return result;
}
async function remember(trx, context, submissionId, hash, result) {
    await trx("calendarOperations").insert({
        workspaceId: context.workspaceId,
        submissionId,
        actorId: context.userId,
        inputHash: hash,
        result: JSON.stringify(result)
    });
    return result;
}
async function writeSchedule(trx, context, visitId, record, schedule, source, action = "schedule") {
    const { row, ref, order } = record;
    const status = ref.type === "job" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scheduledJobStatus"])(row.status, schedule.scheduledDate) : row.status;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["snapshotCalendarRecord"])(trx, context.workspaceId, visitId, ref.type, row, schedule.scheduledDate ? "rescheduled" : "cleared");
    await trx((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarRecordTable"])(ref.type)).where({
        workspaceId: context.workspaceId,
        id: row.id
    }).update({
        ...schedule,
        status,
        version: row.version + 1,
        updatedAt: trx.fn.now(),
        ...ref.type === "job" ? {
            lastActivityAt: trx.fn.now()
        } : order && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editsChangeIssuedContent"])(order.status) ? {
            changedAfterIssueAt: trx.fn.now()
        } : {}
    });
    const actor = await trx("users").where({
        id: context.userId
    }).first("name");
    await trx(ref.type === "job" ? "jobActivity" : "workOrderActivity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        [(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarRecordColumn"])(ref.type)]: row.id,
        actorId: context.userId,
        actorName: actor.name,
        source,
        type: action,
        changes: JSON.stringify({
            visitId,
            from: {
                scheduledDate: row.scheduledDate,
                arrivalWindow: row.arrivalWindow,
                status: row.status
            },
            to: {
                ...schedule,
                status
            }
        })
    });
    return {
        ...ref,
        expectedVersion: row.version + 1
    };
}
const hashInput = (action, input, source)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify({
        action,
        input,
        source
    })).digest("hex");
async function scheduleCalendarVisit(db, identity, enabled, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarScheduleCommandSchema"].parse(raw), hash = hashInput("schedule", input, source);
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const current = await visit(trx, context, input.visitId);
        const previous = await replay(trx, context, input.submissionId, hash);
        if (previous) return previous;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertCalendarRevision"])(current.row.version, input.expectedVisitVersion, current.records.map((r)=>r.ref), input.records);
        const before = await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.visitId
        }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
        const records = [];
        for (const record of current.records)records.push(await writeSchedule(trx, context, input.visitId, record, input.schedule, source));
        await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.visitId
        }).update({
            ...input.schedule,
            version: current.row.version + 1,
            updatedAt: trx.fn.now()
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyVisitChange"])(trx, context, input.submissionId, !input.schedule.scheduledDate ? "cleared" : before.scheduledDate ? "rescheduled" : "scheduled", records, before, input.schedule);
        return remember(trx, context, input.submissionId, hash, {
            visitId: input.visitId,
            version: current.row.version + 1,
            records
        });
    });
}
async function linkCalendarWorkOrder(db, identity, enabled, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarLinkCommandSchema"].parse(raw), hash = hashInput("link", input, source);
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const previous = await replay(trx, context, input.submissionId, hash);
        if (previous) return previous;
        const target = await visit(trx, context, input.visitId), from = await visit(trx, context, input.sourceVisitId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertCalendarRevision"])(target.row.version, input.expectedVisitVersion, target.records.map((r)=>r.ref), input.records);
        if (from.row.id === target.row.id || from.row.version !== input.expectedSourceVisitVersion || from.records.length !== 1 || from.records[0].ref.type !== "work_order" || from.records[0].ref.id !== input.workOrderId || from.records[0].row.version !== input.expectedWorkOrderVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        const order = from.records[0];
        if (!target.row.scheduledDate || !target.records.some((r)=>r.ref.type === "job" && r.ref.id === order.order?.jobId) || target.records.some((r)=>r.order && r.order.jobId !== order.order?.jobId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        const date = await trx("calendarVisits").where({
            id: input.visitId,
            workspaceId: context.workspaceId
        }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
        const before = await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.sourceVisitId
        }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
        const ref = await writeSchedule(trx, context, input.sourceVisitId, order, date, source, "visit-linked");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyVisitChange"])(trx, context, input.submissionId, "joined", [
            ref
        ], before, date);
        await trx("calendarVisitRecords").where({
            workspaceId: context.workspaceId,
            visitId: input.sourceVisitId
        }).whereNull("endedAt").update({
            endedAt: trx.fn.now()
        });
        await trx("calendarVisitRecords").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            visitId: input.visitId,
            workOrderId: input.workOrderId
        });
        await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.sourceVisitId
        }).increment("version", 1).update({
            updatedAt: trx.fn.now()
        });
        await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.visitId
        }).increment("version", 1).update({
            updatedAt: trx.fn.now()
        });
        return remember(trx, context, input.submissionId, hash, {
            visitId: input.visitId,
            version: target.row.version + 1,
            records: [
                ...target.records.map((r)=>r.ref),
                ref
            ]
        });
    });
}
async function separateCalendarWorkOrder(db, identity, enabled, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarSeparateCommandSchema"].parse(raw), hash = hashInput("separate", input, source);
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const previous = await replay(trx, context, input.submissionId, hash);
        if (previous) return previous;
        const current = await visit(trx, context, input.visitId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertCalendarRevision"])(current.row.version, input.expectedVisitVersion, current.records.map((r)=>r.ref), input.records);
        const order = current.records.find((r)=>r.ref.type === "work_order" && r.ref.id === input.workOrderId);
        if (!order || current.records.length < 2) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        const before = await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.visitId
        }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["snapshotCalendarRecord"])(trx, context.workspaceId, input.visitId, order.ref.type, order.row, "separated");
        await trx("calendarVisits").insert({
            id,
            workspaceId: context.workspaceId,
            ...input.schedule
        });
        const ref = await writeSchedule(trx, context, id, order, input.schedule, source, "visit-separated");
        await trx("calendarVisitRecords").where({
            workspaceId: context.workspaceId,
            visitId: input.visitId,
            workOrderId: input.workOrderId
        }).whereNull("endedAt").update({
            endedAt: trx.fn.now()
        });
        await trx("calendarVisitRecords").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            visitId: id,
            workOrderId: input.workOrderId
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyVisitChange"])(trx, context, input.submissionId, "separated", [
            ref
        ], before, input.schedule);
        // Membership revision changes; original visit's date/window and other resource rows stay untouched.
        await trx("calendarVisits").where({
            workspaceId: context.workspaceId,
            id: input.visitId
        }).increment("version", 1).update({
            updatedAt: trx.fn.now()
        });
        return remember(trx, context, input.submissionId, hash, {
            visitId: id,
            version: 1,
            records: [
                ref
            ]
        });
    });
}
async function workOrderCreationVisit(trx, context, jobId) {
    const job = await trx("jobs").where({
        workspaceId: context.workspaceId,
        id: jobId
    }).first();
    const team = await trx("jobTeamMembers").where({
        workspaceId: context.workspaceId,
        jobId
    }).pluck("userId");
    if (!job || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "workorders.create"
    }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.read",
        resource: {
            kind: "job",
            id: jobId,
            workspaceId: context.workspaceId,
            ownerId: job.primaryOwnerId,
            teamUserIds: team
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if ([
        "completed",
        "canceled"
    ].includes(job.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    const link = await trx("calendarVisitRecords").where({
        workspaceId: context.workspaceId,
        jobId
    }).whereNull("endedAt").first();
    if (!link) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    const current = await trx("calendarVisits").where({
        workspaceId: context.workspaceId,
        id: link.visitId
    }).select("*", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
    if (!current) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
    if (!current.scheduledDate) return null;
    const workspace = await trx("workspaces").where({
        id: context.workspaceId
    }).first("timezone");
    let loaded;
    try {
        loaded = await visit(trx, context, current.id);
    } catch (error) {
        if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
    }
    const records = loaded?.records.map((r)=>r.ref) ?? [];
    const references = [
        `J-${String(job.jobNumber).padStart(4, "0")}`
    ];
    // A successful full authorization is required before reading any linked work-order number.
    if (loaded) {
        for (const record of loaded.records)if (record.order) references.push(`WO-${String(record.order.workOrderNumber).padStart(4, "0")}`);
    }
    return {
        id: current.id,
        scheduledDate: current.scheduledDate,
        arrivalWindow: current.arrivalWindow,
        timezone: workspace.timezone,
        canJoin: !!loaded,
        references,
        revision: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify([
            current.version,
            records
        ])).digest("hex"),
        review: loaded ? {
            expectedVisitVersion: current.version,
            records
        } : null
    };
}
async function readWorkOrderCreationVisit(db, identity, enabled, jobId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const result = await workOrderCreationVisit(trx, context, jobId);
        if (!result) return null;
        // Internal command records are never part of the HTTP preview.
        const { review: _review, ...preview } = result;
        void _review;
        return preview;
    });
}
const membershipRevision = (loaded)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify([
        loaded.row.version,
        loaded.records.map((r)=>r.ref)
    ])).digest("hex");
async function projectManagedVisit(trx, context, loaded, timezone, today) {
    const refs = loaded.records, first = refs[0];
    const jobId = first.order?.jobId ?? first.row.id;
    const job = await trx("jobs").where({
        workspaceId: context.workspaceId,
        id: jobId
    }).select("*", trx.raw(`to_char("completionDeadline",'YYYY-MM-DD') AS "completionDeadline"`)).first();
    const canReadJob = !first.order || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.read",
        resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(first.order).job
    }).allowed;
    const people = new Set();
    for (const item of refs){
        if (item.order) {
            if (item.order.primaryAssigneeId) people.add(item.order.primaryAssigneeId);
            item.order.crewIds.forEach((id)=>people.add(id));
        } else {
            const owner = await trx("jobs").where({
                workspaceId: context.workspaceId,
                id: item.row.id
            }).first("primaryOwnerId");
            if (owner.primaryOwnerId) people.add(owner.primaryOwnerId);
            (await trx("jobTeamMembers").where({
                workspaceId: context.workspaceId,
                jobId: item.row.id
            }).pluck("userId")).forEach((id)=>people.add(id));
        }
    }
    const names = await trx("users").whereIn("id", [
        ...people
    ]).select("id", "name");
    const date = await trx("calendarVisits").where({
        workspaceId: context.workspaceId,
        id: loaded.row.id
    }).select(trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`), "arrivalWindow").first();
    const records = refs.map((item)=>item.order ? {
            type: "work_order",
            id: item.row.id,
            number: `WO-${String(item.order.workOrderNumber).padStart(4, "0")}`,
            title: item.order.title,
            status: item.order.status
        } : {
            type: "job",
            id: item.row.id,
            number: `J-${String(job.jobNumber).padStart(4, "0")}`,
            title: job.title,
            status: item.row.status
        });
    return {
        id: loaded.row.id,
        revision: membershipRevision(loaded),
        ...date,
        timezone,
        title: records[0].title,
        customerName: job.customerName,
        location: job.location || null,
        nextStep: null,
        records,
        crew: names,
        completionDeadline: canReadJob && job.completionDeadline ? {
            date: job.completionDeadline,
            overdue: job.completionDeadline < today
        } : null,
        waiting: false,
        canReschedule: true,
        review: {
            expectedVisitVersion: loaded.row.version,
            records: refs.map((r)=>r.ref)
        }
    };
}
async function readableOrder(trx, context, id) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoped"])(trx, context).where("w.id", id).select(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selects"])(trx)).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return row;
}
async function readWorkOrderVisitManagement(db, identity, enabled, workOrderId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const order = await readableOrder(trx, context, workOrderId);
        const workspace = await trx("workspaces").where({
            id: context.workspaceId
        }).first("timezone");
        const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [
            workspace.timezone
        ])).rows[0];
        const result = {
            today,
            source: null,
            target: null,
            canJoin: false,
            canSeparate: false
        };
        if ([
            "completed",
            "canceled"
        ].includes(order.status) || order.archivedAt) return result;
        const project = async (column, id)=>{
            const link = await trx("calendarVisitRecords").where({
                workspaceId: context.workspaceId,
                [column]: id
            }).whereNull("endedAt").first();
            if (!link) return null;
            try {
                return await projectManagedVisit(trx, context, await visit(trx, context, link.visitId), workspace.timezone, today);
            } catch (error) {
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderLifecycleError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]) return null;
                throw error;
            }
        };
        result.source = await project("workOrderId", workOrderId);
        if (!result.source) return result;
        result.canSeparate = result.source.records.length > 1;
        if (!result.canSeparate) {
            result.target = await project("jobId", order.jobId);
            result.canJoin = !!result.target?.scheduledDate && result.target.id !== result.source.id;
        }
        return result;
    });
}
async function changeWorkOrderVisit(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderVisitChangeSchema"].parse(raw), hash = hashInput("work-order-visit", input, "ui");
    if (identity.workspaceId !== input.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        await readableOrder(trx, context, input.workOrderId);
        const previous = await replay(trx, context, input.submissionId, hash);
        if (previous) return previous;
        const sourceId = input.kind === "join" ? input.sourceVisitId : input.visitId;
        const from = await visit(trx, context, sourceId);
        const order = from.records.find((r)=>r.ref.type === "work_order" && r.ref.id === input.workOrderId);
        if (!order || membershipRevision(from) !== (input.kind === "join" ? input.sourceRevision : input.revision)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        let result;
        if (input.kind === "join") {
            const target = await visit(trx, context, input.visitId);
            if (membershipRevision(target) !== input.revision) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
            result = await linkCalendarWorkOrder(trx, identity, enabled, {
                workspaceId: context.workspaceId,
                submissionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workOrderId: input.workOrderId,
                visitId: input.visitId,
                expectedVisitVersion: target.row.version,
                records: target.records.map((r)=>r.ref),
                sourceVisitId: sourceId,
                expectedSourceVisitVersion: from.row.version,
                expectedWorkOrderVersion: order.row.version
            });
        } else result = await separateCalendarWorkOrder(trx, identity, enabled, {
            workspaceId: context.workspaceId,
            submissionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workOrderId: input.workOrderId,
            visitId: sourceId,
            expectedVisitVersion: from.row.version,
            records: from.records.map((r)=>r.ref),
            schedule: {
                scheduledDate: input.scheduledDate,
                arrivalWindow: input.arrivalWindow
            }
        });
        return remember(trx, context, input.submissionId, hash, result);
    });
}
}),
"[project]/packages/data/src/calendar/chat.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarChatData",
    ()=>calendarChatData
]);
const calendarChatData = {
    choosePerson: 'Choose one exact full teammate name, me, or up to ten authorized people using all. The requested person was unavailable or ambiguous. Do not guess a match.',
    ownOnly: 'Only your own authorized schedule can be checked. Ask to check me instead.',
    types: {
        all: 'Jobs and Work Orders',
        job: 'Jobs',
        work_order: 'Work Orders'
    },
    people: {
        me: 'My assigned visits',
        all: 'All people',
        unassigned: 'Unassigned visits',
        member: 'Selected teammate'
    },
    statuses: {
        all: 'All active statuses',
        'job:needs-scheduling': 'Job: Needs Scheduling',
        'job:scheduled': 'Job: Scheduled',
        'job:in-progress': 'Job: In Progress',
        'job:waiting': 'Job: Waiting',
        'work_order:draft': 'Work Order: Draft',
        'work_order:issued': 'Work Order: Issued',
        'work_order:in-progress': 'Work Order: In Progress'
    },
    customer: (query)=>`Customer: ${query}`
};
}),
"[project]/packages/data/src/calendar/chat.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarFocusUnavailableError",
    ()=>CalendarFocusUnavailableError,
    "calendarChatClock",
    ()=>calendarChatClock,
    "calendarChatEvidenceAllowed",
    ()=>calendarChatEvidenceAllowed,
    "calendarChatStamp",
    ()=>calendarChatStamp,
    "readCalendarFocusForChat",
    ()=>readCalendarFocusForChat,
    "readCalendarForChat",
    ()=>readCalendarForChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/chat.data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar-chat.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/availability.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/read.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
class CalendarFocusUnavailableError extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] {
}
function permit(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read');
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'assistant.use'
    }).allowed || !scope.allowed || ![
        'workspace',
        'own_assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
async function calendarChatStamp(trx, context) {
    permit(context);
    const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
    SELECT 'j:' || id::text || ':' || xmin::text AS v FROM jobs WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'team:' || "jobId"::text || ':' || "userId" || ':' || xmin::text FROM "jobTeamMembers" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'wo:' || id::text || ':' || xmin::text FROM "workOrders" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'crew:' || "workOrderId"::text || ':' || "userId" || ':' || xmin::text FROM "workOrderCrew" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'v:' || id::text || ':' || xmin::text FROM "calendarVisits" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'r:' || id::text || ':' || xmin::text FROM "calendarVisitRecords" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'member:' || m."userId" || ':' || m.xmin::text || ':' || u.xmin::text FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=:workspace
    UNION ALL SELECT 'w:' || xmin::text || ':' || (now() AT TIME ZONE timezone)::date::text FROM workspaces WHERE id=:workspace
  ) evidence`, {
        workspace: context.workspaceId
    });
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        context.userId,
        rows[0].stamp
    ])).digest('hex');
}
async function calendarChatEvidenceAllowed(trx, context, stamp) {
    if (!stamp) return true;
    try {
        return stamp === await calendarChatStamp(trx, context);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
        throw error;
    }
}
async function readCalendarForChat(db, identity, enabled, args, pageFilters) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatQuerySchema"].parse(args);
    const filters = input.usePageFilters && pageFilters ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatContextSchema"].parse(pageFilters) : undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        permit(context);
        if (input.operation === 'availability') {
            // Read the full permitted week, with no conflict-hiding page filters or row cap.
            const initial = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendar"])(trx, identity, enabled, {
                workspaceId: identity.workspaceId,
                ...input.date ? {
                    date: input.date
                } : {}
            });
            const selected = input.person ?? filters?.person ?? 'me';
            const requested = selected.startsWith('member:') ? selected.slice(7) : selected;
            const people = requested === 'all' ? initial.members : initial.members.filter((p)=>requested === 'me' ? p.id === context.userId : p.id === requested || p.name.toLocaleLowerCase() === requested.toLocaleLowerCase());
            if (!people.length || people.length > 10 || requested !== 'all' && people.length !== 1) return {
                clarification: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].choosePerson
            };
            if (initial.scope === 'own' && (requested === 'all' || people.some((p)=>p.id !== context.userId))) return {
                clarification: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].ownOnly
            };
            const from = input.date ?? initial.today, to = input.to ?? (input.date ? from : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(from, 13));
            const entries = [
                ...initial.entries
            ];
            for(let week = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarWeekStart"])(from); week <= to; week = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(week, 7)){
                if (week === initial.weekDate) continue;
                const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendar"])(trx, identity, enabled, {
                    workspaceId: identity.workspaceId,
                    date: week
                });
                entries.push(...current.entries);
            }
            const candidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarDateCandidates"])({
                from,
                to,
                includeWeekends: input.includeWeekends ?? false,
                arrivalWindow: input.arrivalWindow ?? null,
                people,
                visits: entries
            });
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarAvailabilityResultSchema"].parse({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                mode: 'availability',
                from,
                to,
                scope: initial.scope,
                viewerId: context.userId,
                people,
                arrivalWindow: input.arrivalWindow ?? null,
                timezone: initial.timezone,
                checkedAt: new Date().toISOString(),
                total: candidates.length,
                suggestions: candidates.slice(0, 3).map((candidate)=>({
                        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        ...candidate
                    }))
            });
            const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarQuerySchema"].parse({
                workspaceId: identity.workspaceId,
                date: from,
                person: initial.scope === 'own' ? 'me' : people.length === 1 ? `member:${people[0].id}` : 'all'
            });
            return {
                result,
                query,
                stamp: await calendarChatStamp(trx, context)
            };
        }
        const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarQuerySchema"].parse({
            ...filters,
            workspaceId: identity.workspaceId,
            ...input.date ? {
                date: input.date
            } : {},
            queuePage: 1
        });
        const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendar"])(trx, identity, enabled, query);
        const candidates = input.operation === 'schedule' ? [
            ...current.entries
        ].sort((a, b)=>a.scheduledDate.localeCompare(b.scheduledDate) || (a.arrivalWindow ?? '99').localeCompare(b.arrivalWindow ?? '99') || a.id.localeCompare(b.id)) : current.unscheduled;
        const visits = candidates.slice(0, 25).map((v)=>({
                id: v.id,
                title: v.title.slice(0, 120),
                scheduledDate: v.scheduledDate,
                arrivalWindow: v.arrivalWindow,
                records: v.records.map((r)=>({
                        ...r,
                        title: r.title.slice(0, 120)
                    })),
                crew: v.crew.map((p)=>({
                        ...p,
                        name: p.name.slice(0, 100)
                    }))
            }));
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatResultSchema"].parse({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            mode: input.operation,
            scope: current.scope,
            timezone: current.timezone,
            checkedAt: new Date().toISOString(),
            filterLabels: [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].types[current.query.recordType],
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].people[current.query.person === 'me' ? 'me' : current.query.person === 'all' ? 'all' : current.query.person === 'unassigned' ? 'unassigned' : 'member'],
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].statuses[current.query.status],
                ...current.query.customerQuery ? [
                    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatData"].customer(current.query.customerQuery)
                ] : []
            ],
            total: input.operation === 'schedule' ? candidates.length : current.unscheduledTotal,
            visits,
            ...input.operation === 'schedule' ? {
                from: current.weekDate,
                to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(current.weekDate, 6)
            } : {}
        });
        if (result.mode === 'availability') throw Error('Unexpected Calendar result.');
        while(JSON.stringify(result).length > 45000 && result.visits.length > 1)result.visits.pop();
        if (JSON.stringify(result).length > 45000) throw Error('Calendar result exceeds the safe response size.');
        return {
            result,
            query: current.query,
            stamp: await calendarChatStamp(trx, context)
        };
    });
}
async function calendarChatClock(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        permit(context);
        const workspace = await trx('workspaces').where({
            id: context.workspaceId
        }).first('timezone');
        const today = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [
            workspace.timezone
        ])).rows[0].today;
        return {
            timezone: workspace.timezone,
            today: today
        };
    });
}
async function readCalendarFocusForChat(db, identity, enabled, raw) {
    const reference = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarVisitReferenceSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        permit(context);
        const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendarVisit"])(trx, identity, enabled, reference.id).catch((error)=>{
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) throw new CalendarFocusUnavailableError();
            throw error;
        });
        if (current.revision !== reference.revision) throw new CalendarFocusUnavailableError();
        const visit = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatVisitSchema"].parse({
            id: current.id,
            title: current.title,
            scheduledDate: current.scheduledDate,
            arrivalWindow: current.arrivalWindow,
            records: current.records,
            crew: current.crew
        });
        // Never silently omit linked records from a selected-visit summary.
        if (JSON.stringify(visit).length > 12000) throw new CalendarFocusUnavailableError();
        return {
            visit,
            stamp: await calendarChatStamp(trx, context)
        };
    });
}
}),
"[project]/packages/data/src/calendar/proposals.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarProposalData",
    ()=>calendarProposalData
]);
const calendarProposalData = {
    conflict: 'This visit or proposal changed. Ask for a fresh schedule review.',
    reference: 'Provide one exact Job or Work Order number, or a visit ID from a current Calendar result.',
    alreadyUnscheduled: 'This visit is already unscheduled; its date and arrival window are empty.',
    unchanged: 'This visit already has that date and arrival window.',
    tooLarge: 'This visit is too large for a complete chat review. Use Calendar to review it.',
    past: 'The proposed date is in the past. You can still save it.',
    after: 'The proposed date is after the Job completion deadline. You can still save it.',
    unknown: 'Another assigned visit has no arrival window. Timing cannot be fully checked.'
};
}),
"[project]/packages/data/src/calendar/proposals.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarProposalConflictError",
    ()=>CalendarProposalConflictError,
    "CalendarProposalValidationError",
    ()=>CalendarProposalValidationError,
    "calendarProposalBinding",
    ()=>calendarProposalBinding,
    "calendarProposalEvidenceAllowed",
    ()=>calendarProposalEvidenceAllowed,
    "operateCalendarScheduleProposal",
    ()=>operateCalendarScheduleProposal,
    "proposeCalendarSchedule",
    ()=>proposeCalendarSchedule,
    "readCalendarScheduleProposal",
    ()=>readCalendarScheduleProposal,
    "visibleCalendarScheduleProposal",
    ()=>visibleCalendarScheduleProposal
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar-proposal.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/schedule.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/commands.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/chat.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/proposals.data.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
class CalendarProposalConflictError extends Error {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].conflict);
    }
}
class CalendarProposalValidationError extends Error {
}
const identityFor = (c)=>({
        userId: c.userId,
        workspaceId: c.workspaceId
    });
function canonical(value) {
    return Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b])=>a.localeCompare(b)).map(([k, v])=>[
            k,
            canonical(v)
        ])) : value;
}
const refsDigest = (refs)=>digest(refs.map((r)=>`${r.type}:${r.id}:${r.expectedVersion}`).sort());
const digest = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(canonical(value))).digest('hex');
async function authority(trx, c) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(c, 'calendar.read');
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
        permission: 'assistant.use'
    }).allowed || !scope.allowed || ![
        'workspace',
        'own_assigned'
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const membership = await trx('workspaceMemberships').where(identityFor(c)).select(trx.raw('xmin::text AS version')).first();
    if (!membership) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    // Bind every permission relevant to this domain; unrelated implemented modules are not scheduling authority.
    return digest([
        {
            ...c,
            policy: {
                ...c.policy,
                grants: [
                    ...c.policy.grants
                ].sort((a, b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
            },
            enabledPermissions: c.enabledPermissions.filter((p)=>[
                    'assistant.use',
                    'calendar.read',
                    'jobs.read',
                    'workorders.read',
                    'jobs.schedule.update',
                    'workorders.schedule.update'
                ].includes(p)).sort()
        },
        membership.version
    ]);
}
async function sourceTurn(trx, c, row, activeId) {
    const turn = await trx('chatTurns').where({
        ...identityFor(c),
        id: row.turnId,
        threadId: row.threadId
    }).first();
    if (!turn || !await trx('chatThreads').where({
        ...identityFor(c),
        id: row.threadId
    }).first('id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (turn.state !== 'completed' && !(activeId === turn.id && [
        'accepted',
        'running'
    ].includes(turn.state) && new Date(turn.leaseUntil).getTime() > Date.now())) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return turn;
}
function calendarProposalBinding(draft) {
    return {
        proposalId: draft.id,
        inputHash: draft.inputHash,
        visitId: draft.visitId,
        revision: draft.revision
    };
}
function inputHash(payload) {
    const draft = Object.fromEntries(Object.entries(payload.draft).filter(([key])=>key !== 'inputHash' && key !== 'state'));
    return digest({
        draft,
        command: payload.command,
        authority: payload.authority,
        stamp: payload.stamp
    });
}
function view(payload, state = payload.draft.state) {
    const draft = {
        ...payload.draft,
        state,
        records: payload.draft.records.map((r)=>state === 'confirmed' && r.type === 'job' ? {
                ...r,
                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scheduledJobStatus"])(r.status, payload.draft.to.scheduledDate)
            } : r)
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalViewSchema"].parse({
        draft,
        context: {
            ...calendarProposalBinding(payload.draft),
            records: payload.command.records,
            read: true,
            canSchedule: true
        }
    });
}
async function fullVisit(trx, c, id, enabled) {
    const visit = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendarVisit"])(trx, identityFor(c), enabled, id);
    if (!visit.canReschedule || !visit.review) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return visit;
}
async function checked(trx, c, row, enabled, activeId) {
    await sourceTurn(trx, c, row, activeId);
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalStoredSchema"].parse(row.payload);
    if (payload.command.workspaceId !== c.workspaceId || payload.draft.id !== row.id || payload.draft.state !== row.state || payload.draft.inputHash !== inputHash(payload) || payload.authority !== await authority(trx, c)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const current = await fullVisit(trx, c, payload.draft.visitId, enabled);
    const stamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatStamp"])(trx, c);
    if (row.state === 'confirmed') {
        if (!payload.receipt || payload.resultStamp !== stamp || current.revision !== payload.receipt.revision || current.scheduledDate !== payload.draft.to.scheduledDate || current.arrivalWindow !== payload.draft.to.arrivalWindow || refsDigest(current.review.records) !== refsDigest(payload.receipt.records)) throw new CalendarProposalConflictError();
    } else if (payload.stamp !== stamp || current.revision !== payload.draft.revision || refsDigest(current.review.records) !== refsDigest(payload.command.records)) throw new CalendarProposalConflictError();
    return payload;
}
async function audit(trx, row, action) {
    await trx('chatCalendarProposalAudit').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.draft.inputHash
    });
}
async function proposeCalendarSchedule(db, identity, enabled, turnId, raw, signal) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, c)=>{
        signal.throwIfAborted();
        const authorization = await authority(trx, c);
        const turn = await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).first();
        if (!turn || ![
            'accepted',
            'running'
        ].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        let ref = input.recordRef;
        if (!ref && turn.surfaceKey === 'calendar') {
            const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
            if (page.calendarVisit) ref = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendarFocusForChat"])(trx, identity, enabled, page.calendarVisit)).visit.id;
        }
        if (!ref && turn.surfaceKey === 'work_order.detail') {
            const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext), record = page.recordRefs?.find((r)=>r.type === 'work_order');
            if (record) ref = (await trx('calendarVisitRecords').where({
                workspaceId: identity.workspaceId,
                workOrderId: record.id
            }).whereNull('endedAt').first('visitId'))?.visitId;
        }
        if (!ref) throw new CalendarProposalValidationError(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].reference);
        let visitId = ref;
        if (/^(J|WO)-/i.test(ref)) {
            const job = /^J-/i.test(ref), number = Number(ref.slice(job ? 2 : 3));
            if (!Number.isSafeInteger(number) || number < 1 || number > 2147483647) throw new CalendarProposalValidationError(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].reference);
            const record = await trx(job ? 'jobs' : 'workOrders').where({
                workspaceId: identity.workspaceId,
                [job ? 'jobNumber' : 'workOrderNumber']: number
            }).first('id');
            const link = record && await trx('calendarVisitRecords').where({
                workspaceId: identity.workspaceId,
                [job ? 'jobId' : 'workOrderId']: record.id
            }).whereNull('endedAt').first('visitId');
            if (!link) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            visitId = link.visitId;
        }
        const current = await fullVisit(trx, c, visitId, enabled);
        const clearing = input.operation === 'clear';
        const arrivalWindow = clearing ? null : input.windowMode === 'keep' || !input.windowMode && input.arrivalWindow === null ? current.arrivalWindow : input.arrivalWindow;
        if (current.scheduledDate === input.scheduledDate && current.arrivalWindow === arrivalWindow) return {
            clarification: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].alreadyUnscheduled : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].unchanged,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatStamp"])(trx, c)
        };
        const schedule = {
            scheduledDate: input.scheduledDate,
            arrivalWindow
        };
        // Clearing has no proposed day: overlap/workload/past-date advisories do not apply.
        const warnings = [];
        if (!clearing) {
            const advisories = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendarAdvisories"])(trx, identity, enabled, {
                workspaceId: identity.workspaceId,
                visitId,
                revision: current.revision,
                schedule
            });
            const calendar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendar"])(trx, identity, enabled, {
                workspaceId: identity.workspaceId,
                date: input.scheduledDate
            });
            warnings.push(...input.scheduledDate < calendar.today ? [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].past
            ] : [], ...current.completionDeadline && input.scheduledDate > current.completionDeadline.date ? [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].after
            ] : [], ...advisories.messages, ...calendar.entries.some((v)=>v.id !== current.id && v.scheduledDate === input.scheduledDate && !v.arrivalWindow && v.crew.some((p)=>current.crew.some((q)=>q.id === p.id))) ? [
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].unknown
            ] : []);
        }
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), now = new Date();
        const draft = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalDraftSchema"].parse({
            ...clearing ? {
                intent: 'clear'
            } : {},
            id,
            inputHash: '0'.repeat(64),
            visitId,
            revision: current.revision,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            state: 'pending',
            timezone: current.timezone,
            from: {
                scheduledDate: current.scheduledDate,
                arrivalWindow: current.arrivalWindow
            },
            to: schedule,
            records: current.records.map((r)=>({
                    ...r,
                    expectedVersion: current.review.records.find((ref)=>ref.id === r.id && ref.type === r.type).expectedVersion
                })),
            crew: current.crew,
            warnings
        });
        const payload = {
            draft,
            command: {
                workspaceId: identity.workspaceId,
                visitId,
                submissionId: id,
                expectedVisitVersion: current.review.expectedVisitVersion,
                records: current.review.records,
                schedule
            },
            authority: authorization,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatStamp"])(trx, c),
            receipt: null,
            resultStamp: null
        };
        draft.inputHash = inputHash(payload);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalStoredSchema"].parse(payload);
        if (JSON.stringify(payload).length > 45000) return {
            clarification: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].tooLarge,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatStamp"])(trx, c)
        };
        const replaced = await trx('chatCalendarProposals').where({
            ...identity,
            threadId: turn.threadId,
            state: 'pending'
        }).forUpdate();
        for (const prior of replaced){
            prior.payload.draft.state = 'superseded';
            prior.state = 'superseded';
            await trx('chatCalendarProposals').where({
                id: prior.id
            }).update({
                state: prior.state,
                payload: JSON.stringify(prior.payload),
                resolvedAt: trx.fn.now()
            });
            await audit(trx, prior, 'superseded');
        }
        const [row] = await trx('chatCalendarProposals').insert({
            ...identity,
            id,
            turnId,
            threadId: turn.threadId,
            payload: JSON.stringify(payload)
        }).returning('*');
        await audit(trx, row, 'proposed');
        const old = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalEvidenceSchema"].parse(turn.calendarProposalEvidence ?? []).filter((id)=>!replaced.some((p)=>p.id === id));
        await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).update({
            calendarProposalEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalEvidenceSchema"].parse([
                ...new Set([
                    ...old,
                    id
                ])
            ]))
        });
        signal.throwIfAborted();
        return {
            ...calendarProposalBinding(draft),
            state: 'pending'
        };
    });
}
async function readCalendarScheduleProposal(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, c)=>{
        const row = await trx('chatCalendarProposals').where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (digest(binding) !== digest(calendarProposalBinding(row.payload.draft))) throw new CalendarProposalConflictError();
        const payload = await checked(trx, c, row, enabled);
        return view(payload, row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now() ? 'expired' : row.state);
    });
}
async function operateCalendarScheduleProposal(db, identity, enabled, raw, decision) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalBindingSchema"].parse(raw);
    if (![
        'confirm',
        'cancel'
    ].includes(decision)) throw new CalendarProposalValidationError(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalData"].reference);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, c)=>{
        const row = await trx('chatCalendarProposals').where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (digest(binding) !== digest(calendarProposalBinding(row.payload.draft))) throw new CalendarProposalConflictError();
        const payload = await checked(trx, c, row, enabled);
        if (row.state === 'confirmed' || row.state === 'cancelled') {
            if (decision !== (row.state === 'confirmed' ? 'confirm' : 'cancel')) throw new CalendarProposalConflictError();
            return view(payload);
        }
        if (row.state !== 'pending' || Date.parse(payload.draft.expiresAt) <= Date.now()) throw new CalendarProposalConflictError();
        if (decision === 'confirm') {
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scheduleCalendarVisit"])(trx, identity, enabled, payload.command, 'assistant-confirmed');
                const current = await fullVisit(trx, c, payload.draft.visitId, enabled);
                payload.receipt = {
                    ...result,
                    revision: current.revision
                };
                payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarChatStamp"])(trx, c);
            } catch (error) {
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]) throw new CalendarProposalConflictError();
                throw error;
            }
        }
        row.state = decision === 'confirm' ? 'confirmed' : 'cancelled';
        payload.draft.state = row.state;
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalStoredSchema"].parse(payload);
        row.payload = payload;
        await trx('chatCalendarProposals').where({
            id: row.id
        }).update({
            state: row.state,
            payload: JSON.stringify(payload),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, row.state);
        await checked(trx, c, row, enabled);
        return view(payload);
    });
}
async function calendarProposalEvidenceAllowed(trx, c, enabled, turn) {
    for (const id of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarProposalEvidenceSchema"].parse(turn.calendarProposalEvidence ?? [])){
        const row = await trx('chatCalendarProposals').where({
            ...identityFor(c),
            threadId: turn.threadId,
            id
        }).first();
        if (!row) return false;
        try {
            const payload = await checked(trx, c, row, enabled, turn.id);
            if (row.state === 'superseded' || row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now()) return false;
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof CalendarProposalConflictError) return false;
            throw error;
        }
    }
    return true;
}
async function visibleCalendarScheduleProposal(trx, c, enabled, turnId) {
    const row = await trx('chatCalendarProposals').where({
        ...identityFor(c),
        turnId
    }).orderBy('createdAt', 'desc').orderBy('id', 'desc').first();
    if (!row) return undefined;
    try {
        const payload = await checked(trx, c, row, enabled);
        return {
            ...calendarProposalBinding(payload.draft),
            state: row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now() ? 'expired' : row.state
        };
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof CalendarProposalConflictError) return undefined;
        throw error;
    }
}
}),
"[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkOrderConflictError",
    ()=>WorkOrderConflictError,
    "WorkOrderValidationError",
    ()=>WorkOrderValidationError,
    "formatWorkOrderNumber",
    ()=>formatWorkOrderNumber,
    "logWorkOrderFileActivity",
    ()=>logWorkOrderFileActivity,
    "readWorkOrderDetail",
    ()=>readWorkOrderDetail,
    "readWorkOrderRecord",
    ()=>readWorkOrderRecord,
    "readWorkOrders",
    ()=>readWorkOrders,
    "resource",
    ()=>resource,
    "scoped",
    ()=>scoped,
    "selects",
    ()=>selects
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
class WorkOrderConflictError extends Error {
    constructor(message = "This work order changed. Reload its current details before trying again."){
        super(message);
    }
}
class WorkOrderValidationError extends Error {
}
const iso = (d)=>d ? d.toISOString() : null;
const formatWorkOrderNumber = (n)=>`WO-${String(n).padStart(4, "0")}`;
const resource = (row)=>({
        kind: "work_order",
        id: row.id,
        workspaceId: row.workspaceId,
        primaryAssigneeId: row.primaryAssigneeId,
        assigneeIds: [
            ...row.primaryAssigneeId ? [
                row.primaryAssigneeId
            ] : [],
            ...row.crewIds
        ],
        job: {
            kind: "job",
            id: row.jobId,
            workspaceId: row.workspaceId,
            ownerId: row.jobOwnerId,
            teamUserIds: row.jobTeamUserIds
        }
    });
function scoped(trx, context, assignedOnly = false) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "workorders.read");
    if (!scope.allowed || ![
        "workspace",
        "assigned_job"
    ].includes(scope.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const query = trx("workOrders as w").join("jobs as j", (q)=>q.on("j.workspaceId", "w.workspaceId").andOn("j.id", "w.jobId")).where("w.workspaceId", context.workspaceId);
    if (assignedOnly || scope.scope === "assigned_job") {
        query.whereNot("w.status", "draft").andWhere((q)=>q.where("j.primaryOwnerId", context.userId).orWhere("w.primaryAssigneeId", context.userId).orWhereExists(trx("workOrderCrew as wc").select(trx.raw("1")).whereRaw('wc."workspaceId" = w."workspaceId" AND wc."workOrderId" = w.id').where("wc.userId", context.userId)).orWhereExists(trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where("jt.userId", context.userId)));
    }
    return query;
}
const selects = (trx)=>[
        "w.*",
        trx.raw(`to_char(w."scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`),
        "j.jobNumber",
        "j.primaryOwnerId as jobOwnerId",
        "j.customerName",
        "j.location",
        trx.raw(`(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "jobTeamUserIds"`),
        trx.raw(`(SELECT coalesce(array_agg(c."userId" ORDER BY c."userId"), ARRAY[]::text[]) FROM "workOrderCrew" c WHERE c."workspaceId"=w."workspaceId" AND c."workOrderId"=w.id) AS "crewIds"`),
        trx.raw(`(SELECT count(*) FILTER (WHERE k.done)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "tasksDone"`),
        trx.raw(`(SELECT count(*)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "tasksTotal"`),
        trx.raw(`(SELECT count(*) FILTER (WHERE k.required AND NOT k.done)::int FROM "workOrderTasks" k WHERE k."workspaceId"=w."workspaceId" AND k."workOrderId"=w.id) AS "requiredOpen"`)
    ];
function dto(row) {
    return {
        id: row.id,
        number: formatWorkOrderNumber(row.workOrderNumber),
        jobId: row.jobId,
        title: row.title,
        status: row.status,
        instructions: row.instructions,
        accessNotes: row.accessNotes,
        safetyNotes: row.safetyNotes,
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow,
        primaryAssigneeId: row.primaryAssigneeId,
        crewIds: row.crewIds,
        sourceEstimateId: row.sourceEstimateId,
        cancellationReason: row.cancellationReason,
        changedAfterIssue: !!row.changedAfterIssueAt && row.status !== "draft",
        archived: !!row.archivedAt,
        issuedAt: iso(row.issuedAt),
        startedAt: iso(row.startedAt),
        completedAt: iso(row.completedAt),
        canceledAt: iso(row.canceledAt),
        version: row.version,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    };
}
function capabilities(row, context) {
    const can = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: resource(row)
        }).allowed;
    const open = !row.archivedAt && ![
        "completed",
        "canceled"
    ].includes(row.status);
    return {
        update: open && can("workorders.update"),
        issue: row.status === "draft" && !row.archivedAt && can("workorders.issue"),
        start: row.status === "issued" && !row.archivedAt && can("workorders.progress"),
        progress: open && row.status !== "draft" && can("workorders.progress"),
        complete: row.status === "in-progress" && !row.archivedAt && can("workorders.complete"),
        cancel: open && can("workorders.cancel"),
        reopen: !row.archivedAt && [
            "completed",
            "canceled"
        ].includes(row.status) && can("workorders.reopen"),
        archive: [
            "completed",
            "canceled"
        ].includes(row.status) && can("workorders.archive"),
        remove: row.status === "draft" && can("workorders.delete"),
        print: can("workorders.read"),
        duplicate: can("workorders.create")
    };
}
function view(row, context, names, today) {
    const name = (id)=>names.get(id) ?? "Former teammate";
    return {
        ...dto(row),
        jobNumber: `J-${String(row.jobNumber).padStart(4, "0")}`,
        customerName: row.customerName,
        address: row.location,
        assigneeName: row.primaryAssigneeId ? name(row.primaryAssigneeId) : null,
        crewNames: row.crewIds.map(name),
        tasksDone: row.tasksDone,
        tasksTotal: row.tasksTotal,
        overdue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOverdue"])(row.status, row.scheduledDate, today),
        capabilities: capabilities(row, context)
    };
}
const like = (value)=>`%${value.replace(/[\\%_]/g, "\\$&")}%`;
async function readWorkOrders(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const workspace = await trx("workspaces").where({
            id: context.workspaceId
        }).first("timezone");
        const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [
            workspace.timezone
        ])).rows[0];
        const live = ()=>scoped(trx, context).whereNull("w.archivedAt");
        const metricsRow = await live().select(trx.raw(`count(*) filter (where (w."issuedAt" AT TIME ZONE ?)::date = ?::date)::int as "issuedToday",
       count(*) filter (where w.status = 'in-progress')::int as "inProgress",
       count(*) filter (where w.status in ('issued','in-progress') and w."scheduledDate" < ?::date)::int as overdue,
       count(*) filter (where w.status = 'in-progress' and exists (select 1 from "workOrderTasks" k where k."workOrderId"=w.id) and not exists (select 1 from "workOrderTasks" k where k."workOrderId"=w.id and k.required and not k.done))::int as "awaitingSignoff"`, [
            workspace.timezone,
            today,
            today
        ])).first();
        const base = scoped(trx, context);
        if (input.archived) base.whereNotNull("w.archivedAt");
        else base.whereNull("w.archivedAt");
        if (input.status) base.where("w.status", input.status);
        if (input.assigneeId) base.where("w.primaryAssigneeId", input.assigneeId);
        if (input.jobId) base.where("w.jobId", input.jobId);
        if (input.jobNumber) base.whereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [
            like(input.jobNumber)
        ]);
        if (input.scheduledFrom) base.where("w.scheduledDate", ">=", input.scheduledFrom);
        if (input.scheduledTo) base.where("w.scheduledDate", "<=", input.scheduledTo);
        if (input.mine) base.andWhere((q)=>q.where("w.primaryAssigneeId", context.userId).orWhereExists(trx("workOrderCrew as c").select(trx.raw("1")).whereRaw('c."workspaceId" = w."workspaceId" AND c."workOrderId" = w.id').where("c.userId", context.userId)));
        if (input.q) {
            const q = like(input.q);
            base.andWhere((b)=>b.whereILike("w.title", q).orWhereILike("j.customerName", q).orWhereILike("j.location", q).orWhereRaw(`('WO-' || lpad(w."workOrderNumber"::text,4,'0')) ILIKE ?`, [
                    q
                ]).orWhereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [
                    q
                ]));
        }
        const total = Number((await base.clone().count({
            n: "w.id"
        }).first())?.n ?? 0);
        const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
        const sortColumn = input.sort === "number" ? "w.workOrderNumber" : `w.${input.sort}`;
        const rows = await base.clone().select(...selects(trx)).orderBy(sortColumn, input.direction, "last").orderBy("w.workOrderNumber").limit(input.pageSize).offset((page - 1) * input.pageSize);
        const canAssign = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "workorders.update",
            resource: {
                kind: "work_order",
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                job: null
            }
        }).allowed;
        const visible = await scoped(trx, context).select("w.primaryAssigneeId", "j.id as jobId", "j.jobNumber", "j.title as jobTitle", "j.customerName");
        const participantIds = new Set(rows.flatMap((r)=>[
                ...r.primaryAssigneeId ? [
                    r.primaryAssigneeId
                ] : [],
                ...r.crewIds
            ]));
        const memberQuery = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt");
        if (!canAssign) memberQuery.whereIn("u.id", [
            ...participantIds,
            ...visible.map((v)=>v.primaryAssigneeId).filter(Boolean)
        ]);
        const members = await memberQuery.select("u.id", "u.name").orderBy("u.name").orderBy("u.id");
        const names = new Map(members.map((m)=>[
                m.id,
                m.name
            ]));
        const jobs = new Map();
        for (const v of visible)jobs.set(v.jobId, {
            id: v.jobId,
            number: `J-${String(v.jobNumber).padStart(4, "0")}`,
            title: v.jobTitle,
            customerName: v.customerName
        });
        return {
            rows: rows.map((r)=>view(r, context, names, today)),
            total,
            page,
            pageSize: input.pageSize,
            timezone: workspace.timezone,
            today,
            metrics: {
                issuedToday: Number(metricsRow.issuedToday),
                inProgress: Number(metricsRow.inProgress),
                overdue: Number(metricsRow.overdue),
                awaitingSignoff: Number(metricsRow.awaitingSignoff)
            },
            options: {
                members,
                jobs: [
                    ...jobs.values()
                ].sort((a, b)=>a.number.localeCompare(b.number))
            },
            canCreate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "workorders.create"
            }).allowed,
            canExport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "workorders.export").allowed
        };
    });
}
async function readWorkOrderRecord(db, identity, enabled, id) {
    id = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderIdSchema"].parse(id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const workspace = await trx("workspaces").where({
            id: context.workspaceId
        }).first("timezone");
        const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [
            workspace.timezone
        ])).rows[0];
        const row = await scoped(trx, context).where("w.id", id).select(...selects(trx)).first();
        if (!row || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "workorders.read",
            resource: resource(row)
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const ids = [
            ...row.primaryAssigneeId ? [
                row.primaryAssigneeId
            ] : [],
            ...row.crewIds
        ];
        const people = ids.length ? await trx("users").whereIn("id", ids).select("id", "name") : [];
        return view(row, context, new Map(people.map((p)=>[
                p.id,
                p.name
            ])), today);
    });
}
async function readWorkOrderDetail(db, identity, enabled, id) {
    const workOrder = await readWorkOrderRecord(db, identity, enabled, id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await scoped(trx, context).where("w.id", workOrder.id).select(...selects(trx)).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const can = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission,
                resource: resource(row)
            }).allowed;
        const prices = can("workorders.view_prices"), costs = prices && can("workorders.view_costs");
        const where = {
            workspaceId: context.workspaceId,
            workOrderId: row.id
        };
        const taskRows = await trx("workOrderTasks as t").leftJoin("users as u", "u.id", "t.doneBy").where({
            "t.workspaceId": where.workspaceId,
            "t.workOrderId": where.workOrderId
        }).orderBy("t.position").select("t.*", "u.name as doneByName");
        const materialRows = await trx("workOrderMaterials").where(where).orderBy("position");
        const activityRows = await trx("workOrderActivity").where(where).whereNot({
            type: "note"
        }).orderBy("createdAt", "desc").orderBy("id", "desc").limit(50);
        const noteRows = await trx("workOrderActivity").where({
            ...where,
            type: "note"
        }).orderBy("createdAt", "desc").orderBy("id", "desc").limit(100);
        const completionRow = await trx("workOrderCompletions").where(where).first();
        const settings = await trx("workspaces").where({
            id: context.workspaceId
        }).first("businessPhone", "workOrderSignoffRequired");
        const customer = await trx("jobs as j").join("customers as c", (q)=>q.on("c.workspaceId", "j.workspaceId").andOn("c.id", "j.customerId")).where({
            "j.workspaceId": context.workspaceId,
            "j.id": row.jobId
        }).first("c.phone");
        const canAssign = can("workorders.update");
        const members = canAssign ? await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt").select("u.id", "u.name").orderBy("u.name").orderBy("u.id") : [
            ...workOrder.primaryAssigneeId ? [
                {
                    id: workOrder.primaryAssigneeId,
                    name: workOrder.assigneeName ?? ""
                }
            ] : [],
            ...workOrder.crewIds.map((cid, i)=>({
                    id: cid,
                    name: workOrder.crewNames[i] ?? ""
                }))
        ];
        return {
            workOrder,
            tasks: taskRows.map((t)=>({
                    id: t.id,
                    label: t.label,
                    required: t.required,
                    done: t.done,
                    doneByName: t.doneByName ?? null,
                    doneAt: iso(t.doneAt)
                })),
            materials: materialRows.map((m)=>({
                    id: m.id,
                    catalogId: m.catalogId,
                    name: m.name,
                    quantity: Number(m.quantity),
                    unit: m.unit,
                    imageUrl: m.imageUrl ?? "",
                    status: m.status,
                    note: m.note,
                    customerPriceCents: prices ? m.customerPriceCents : null,
                    costCents: costs ? m.costCents : null
                })),
            activity: activityRows.map((a)=>({
                    id: a.id,
                    type: a.type,
                    actorName: a.actorName,
                    source: a.source,
                    changes: a.changes,
                    createdAt: a.createdAt.toISOString()
                })),
            notes: noteRows.map((a)=>({
                    id: a.id,
                    body: a.changes.body,
                    authorName: a.actorName,
                    createdAt: a.createdAt.toISOString()
                })),
            completion: completionRow ? {
                summary: completionRow.summary,
                followUp: completionRow.followUp,
                followUpNote: completionRow.followUpNote,
                completedByName: completionRow.completedByName,
                completedAt: completionRow.completedAt.toISOString(),
                signerName: completionRow.signerName,
                signedAt: iso(completionRow.signedAt),
                signatureImage: completionRow.signatureImage,
                overrideReason: completionRow.overrideReason
            } : null,
            members,
            access: {
                prices,
                costs,
                canSchedule: !row.archivedAt && ![
                    "completed",
                    "canceled"
                ].includes(row.status) && can("workorders.schedule.update"),
                canNote: can("workorders.progress"),
                canOverride: context.membership.role !== "field" && can("workorders.complete"),
                signoffRequired: !!settings?.workOrderSignoffRequired
            },
            businessPhone: settings?.businessPhone ?? "",
            contact: {
                name: row.customerName,
                phone: customer?.phone || null,
                address: row.location
            }
        };
    });
}
async function logWorkOrderFileActivity(db, identity, workOrderId, action, fileName) {
    const actor = await db('users').where({
        id: identity.userId
    }).first('name');
    const actorName = actor?.name || identity.userId;
    await db('workOrderActivity').insert({
        id: crypto.randomUUID(),
        workspaceId: identity.workspaceId,
        workOrderId,
        actorId: identity.userId,
        actorName,
        source: 'ui',
        type: action,
        changes: JSON.stringify({
            fileName
        })
    });
}
}),
"[project]/packages/data/src/work-orders/notify.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notifyWorkOrderChange",
    ()=>notifyWorkOrderChange
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/lifecycle.ts [app-rsc] (ecmascript)");
;
;
async function notifyWorkOrderChange(trx, context, row, input) {
    const crew = row.crewIds ?? [];
    const current = [
        ...row.primaryAssigneeId ? [
            row.primaryAssigneeId
        ] : [],
        ...crew
    ];
    const wants = [];
    const office = async ()=>{
        const members = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereIn("m.role", [
            "owner",
            "admin",
            "office"
        ]).whereNull("u.deletionRequestedAt").select("m.userId");
        return [
            ...row.jobOwnerId ? [
                row.jobOwnerId
            ] : [],
            ...members.map((m)=>m.userId)
        ];
    };
    const open = row.status !== "draft";
    switch(input.action){
        case "status":
            if (input.to === "issued") wants.push({
                event: "issued",
                users: current
            });
            if (input.to === "canceled") wants.push({
                event: "canceled",
                users: [
                    ...await office(),
                    ...current
                ]
            });
            break;
        case "complete":
            wants.push({
                event: "completed",
                users: await office()
            });
            break;
        case "assign":
            {
                const next = [
                    ...input.assigneeId ? [
                        input.assigneeId
                    ] : [],
                    ...input.crewIds
                ];
                if (open) wants.push({
                    event: "assigned",
                    users: next.filter((id)=>!current.includes(id))
                });
                break;
            }
        case "schedule":
            break; // Combined visit notifications own schedule delivery.
        case "edit":
        case "tasks":
        case "materials":
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editsChangeIssuedContent"])(row.status)) wants.push({
                event: "changed",
                users: current
            });
            break;
    }
    if (!wants.length) return;
    const actor = await trx("users").where({
        id: context.userId
    }).first("name");
    const seen = new Set(), rows = [];
    for (const { event, users } of wants)for (const userId of users){
        if (userId === context.userId || seen.has(`${event}:${userId}`)) continue;
        seen.add(`${event}:${userId}`);
        rows.push({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            workOrderId: row.id,
            userId,
            event,
            actorName: actor?.name ?? ""
        });
    }
    if (rows.length) await trx("workOrderNotifications").insert(rows);
}
}),
"[project]/packages/data/src/work-orders/mutations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createWorkOrder",
    ()=>createWorkOrder,
    "mutateWorkOrder",
    ()=>mutateWorkOrder,
    "mutateWorkOrderInTransaction",
    ()=>mutateWorkOrderInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/schedule.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$snapshot$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/snapshot.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$notify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/notify.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/commands.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/sync.ts [app-rsc] (ecmascript)");
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
const hashInput = (input)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
function permit(context, permission, row) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission,
        ...row ? {
            resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(row)
        } : {}
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
async function record(trx, context, id) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoped"])(trx, context).where("w.id", id).select(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selects"])(trx)).forUpdate("w").first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return row;
}
async function receipt(trx, context, id, hash) {
    const previous = await trx("workOrderOperations").where({
        workspaceId: context.workspaceId,
        submissionId: id
    }).first();
    if (previous && (previous.actorId !== context.userId || previous.inputHash !== hash)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderConflictError"]();
    return previous ? {
        workOrderId: previous.workOrderId,
        version: previous.version
    } : undefined;
}
async function log(trx, context, workOrderId, submissionId, version, hash, type, changes, source) {
    const actor = await trx("users").where({
        id: context.userId
    }).first("name");
    await trx("workOrderActivity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        workOrderId,
        actorId: context.userId,
        actorName: actor.name,
        source,
        type,
        changes: JSON.stringify(changes)
    });
    await trx("workOrderOperations").insert({
        workspaceId: context.workspaceId,
        workOrderId,
        submissionId,
        actorId: context.userId,
        inputHash: hash,
        version
    });
}
async function assertMembers(trx, context, ids) {
    if (!ids.length) return;
    const rows = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereIn("m.userId", ids).whereNull("u.deletionRequestedAt").select("m.userId");
    if (rows.length !== new Set(ids).size) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Choose current workspace teammates.");
}
const task = (workspaceId, workOrderId, position, label, required, extra = {})=>({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId,
        workOrderId,
        position,
        label,
        required,
        ...extra
    });
async function createWorkOrder(db, identity, enabled, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createWorkOrderSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const source = options.source ?? "ui";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        permit(context, "workorders.create");
        const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
        if (previous) {
            await record(trx, context, previous.workOrderId);
            return previous;
        }
        const job = await trx("jobs as j").where({
            "j.workspaceId": context.workspaceId,
            "j.id": input.jobId
        }).select("j.id", "j.primaryOwnerId", "j.status", trx.raw(`(SELECT coalesce(array_agg(t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`)).first();
        if (!job || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "jobs.read",
            resource: {
                kind: "job",
                id: job.id,
                workspaceId: context.workspaceId,
                ownerId: job.primaryOwnerId,
                teamUserIds: job.teamUserIds
            }
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if ([
            "completed",
            "canceled"
        ].includes(job.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Reopen the job before adding a work order.");
        if (input.source.kind === "estimate") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Creating from an estimate is not available yet.");
        await assertMembers(trx, context, input.assigneeId ? [
            input.assigneeId
        ] : []);
        const selectedVisit = input.visit?.kind === "job" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workOrderCreationVisit"])(trx, context, input.jobId) : null;
        if (input.visit?.kind === "job" && (!selectedVisit?.canJoin || !selectedVisit.review || selectedVisit.id !== input.visit.visitId || selectedVisit.revision !== input.visit.revision)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$schedule$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarRevisionError"]();
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        let copied = {
            instructions: "",
            accessNotes: "",
            safetyNotes: ""
        }, tasks = [], materials = [];
        if (input.source.kind === "duplicate") {
            const from = await record(trx, context, input.source.workOrderId);
            if (from.jobId !== input.jobId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Duplicate from a work order on the same job.");
            permit(context, "workorders.read", from);
            copied = {
                instructions: from.instructions,
                accessNotes: from.accessNotes,
                safetyNotes: from.safetyNotes
            };
            tasks = await trx("workOrderTasks").where({
                workspaceId: context.workspaceId,
                workOrderId: from.id
            }).orderBy("position").select("label", "required");
            const canPrices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "workorders.view_prices",
                resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(from)
            }).allowed, canCosts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "workorders.view_costs",
                resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(from)
            }).allowed;
            const source = await trx("workOrderMaterials").where({
                workspaceId: context.workspaceId,
                workOrderId: from.id
            }).orderBy("position");
            // Linked rows get a fresh snapshot while the item is still active; otherwise they keep their old details as free text.
            const linkable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$snapshot$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadLinkableMaterials"])(trx, context.workspaceId, source.map((m)=>m.catalogId).filter(Boolean));
            materials = source.map((m)=>{
                const item = m.catalogId ? linkable.get(m.catalogId) : undefined;
                return {
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: context.workspaceId,
                    workOrderId: id,
                    position: m.position,
                    catalogId: item ? item.id : null,
                    name: item?.name ?? m.name,
                    quantity: m.quantity,
                    unit: item?.unit ?? m.unit,
                    imageUrl: item ? item.imageUrl : m.imageUrl,
                    status: "needed",
                    note: m.note,
                    customerPriceCents: item ? item.priceCents : canPrices ? m.customerPriceCents : null,
                    costCents: item ? item.costCents : canCosts ? m.costCents : null
                };
            });
        }
        await trx("workOrders").insert({
            id,
            workspaceId: context.workspaceId,
            jobId: input.jobId,
            title: input.title,
            status: "draft",
            ...copied,
            primaryAssigneeId: input.assigneeId,
            sourceWorkOrderId: input.source.kind === "duplicate" ? input.source.workOrderId : null,
            createdBy: context.userId
        });
        if (tasks.length) await trx("workOrderTasks").insert(tasks.map((t, i)=>task(context.workspaceId, id, i, t.label, t.required)));
        if (materials.length) await trx("workOrderMaterials").insert(materials);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["synchronizeCalendarRecord"])(trx, context.workspaceId, "work_order", id);
        let version = 1;
        if (selectedVisit?.review) {
            const independent = await trx("calendarVisitRecords").where({
                workspaceId: context.workspaceId,
                workOrderId: id
            }).whereNull("endedAt").first();
            const linked = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linkCalendarWorkOrder"])(trx, identity, enabled, {
                workspaceId: context.workspaceId,
                submissionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                visitId: selectedVisit.id,
                ...selectedVisit.review,
                workOrderId: id,
                expectedWorkOrderVersion: 1,
                sourceVisitId: independent.visitId,
                expectedSourceVisitVersion: 1
            }, source);
            version = linked.records.find((r)=>r.type === "work_order" && r.id === id).expectedVersion;
        }
        await log(trx, context, id, input.submissionId, version, hash, "created", {
            title: input.title,
            jobId: input.jobId,
            assigneeId: input.assigneeId,
            source: input.source.kind
        }, source);
        return {
            workOrderId: id,
            version
        };
    });
}
async function mutateWorkOrder(db, identity, enabled, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMutationSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>mutateWorkOrderInTransaction(trx, context, input, options));
}
const actionPermission = (input)=>{
    switch(input.action){
        case "task-toggle":
        case "note":
            return "workorders.progress";
        case "complete":
            return "workorders.complete";
        case "reopen":
            return "workorders.reopen";
        case "schedule":
            return "workorders.schedule.update";
        case "archive":
            return "workorders.archive";
        case "delete":
            return "workorders.delete";
        case "status":
            return input.to === "issued" ? "workorders.issue" : input.to === "canceled" ? "workorders.cancel" : "workorders.progress";
        default:
            return "workorders.update";
    }
};
async function mutateWorkOrderInTransaction(trx, context, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMutationSchema"].parse(raw), source = options.source ?? "ui";
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = await record(trx, context, input.workOrderId);
    permit(context, actionPermission(input), row);
    const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
    if (previous) {
        if (previous.workOrderId !== row.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderConflictError"]();
        return previous;
    }
    // Crew check items off and add notes concurrently, so these appends do not compare versions.
    if (input.action !== "task-toggle" && input.action !== "note" && row.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderConflictError"]();
    const state = {
        status: row.status,
        archived: !!row.archivedAt
    };
    const patch = {
        version: row.version + 1,
        updatedAt: trx.fn.now()
    };
    const flagChange = ()=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editsChangeIssuedContent"])(row.status)) patch.changedAfterIssueAt = trx.fn.now();
    };
    let changes;
    switch(input.action){
        case "edit":
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
                flagChange();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so only editable fields remain
                const { workspaceId, workOrderId, submissionId, expectedVersion, action, ...values } = input;
                Object.assign(patch, values);
                changes = {
                    from: Object.fromEntries(Object.keys(values).map((k)=>[
                            k,
                            row[k]
                        ])),
                    to: values
                };
                break;
            }
        case "schedule":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
            flagChange();
            if (context.membership.role === "field" && row.primaryAssigneeId !== context.userId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertIndependentCalendarSchedule"])(trx, context.workspaceId, "work_order", row.id);
            Object.assign(patch, {
                scheduledDate: input.scheduledDate,
                arrivalWindow: input.arrivalWindow
            });
            changes = {
                from: {
                    scheduledDate: row.scheduledDate,
                    arrivalWindow: row.arrivalWindow
                },
                to: {
                    scheduledDate: input.scheduledDate,
                    arrivalWindow: input.arrivalWindow
                }
            };
            break;
        case "assign":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
            flagChange();
            if (input.assigneeId && input.crewIds.includes(input.assigneeId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("The assignee is already part of the crew.");
            await assertMembers(trx, context, [
                ...input.assigneeId ? [
                    input.assigneeId
                ] : [],
                ...input.crewIds
            ]);
            patch.primaryAssigneeId = input.assigneeId;
            await trx("workOrderCrew").where({
                workspaceId: context.workspaceId,
                workOrderId: row.id
            }).delete();
            if (input.crewIds.length) await trx("workOrderCrew").insert(input.crewIds.map((userId)=>({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id,
                    userId
                })));
            changes = {
                from: {
                    assigneeId: row.primaryAssigneeId,
                    crewIds: row.crewIds
                },
                to: {
                    assigneeId: input.assigneeId,
                    crewIds: input.crewIds
                }
            };
            break;
        case "tasks":
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
                flagChange();
                const existing = await trx("workOrderTasks").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                });
                const byId = new Map(existing.map((t)=>[
                        t.id,
                        t
                    ]));
                if (input.tasks.some((t)=>t.id && !byId.has(t.id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("A task no longer exists. Reload and try again.");
                await trx("workOrderTasks").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).delete();
                if (input.tasks.length) await trx("workOrderTasks").insert(input.tasks.map((t, i)=>{
                    const old = t.id ? byId.get(t.id) : undefined;
                    return task(context.workspaceId, row.id, i, t.label, t.required, old ? {
                        id: old.id,
                        done: old.done,
                        doneBy: old.doneBy,
                        doneAt: old.doneAt
                    } : {});
                }));
                changes = {
                    from: existing.map((t)=>t.label),
                    to: input.tasks.map((t)=>t.label)
                };
                break;
            }
        case "task-toggle":
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
                if (row.status === "draft") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Issue this work order before checking off tasks.");
                const updated = await trx("workOrderTasks").where({
                    id: input.taskId,
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).update(input.done ? {
                    done: true,
                    doneBy: context.userId,
                    doneAt: trx.fn.now()
                } : {
                    done: false,
                    doneBy: null,
                    doneAt: null
                });
                if (!updated) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("That task no longer exists.");
                // The first checked task starts the work.
                if (row.status === "issued" && input.done) Object.assign(patch, {
                    status: "in-progress",
                    startedAt: trx.fn.now()
                });
                changes = {
                    taskId: input.taskId,
                    done: input.done,
                    ...patch.status ? {
                        from: "issued",
                        to: "in-progress"
                    } : {}
                };
                break;
            }
        case "materials":
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertEditable"])(state);
                flagChange();
                const prices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "workorders.view_prices",
                    resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(row)
                }).allowed;
                const costs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "workorders.view_costs",
                    resource: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resource"])(row)
                }).allowed;
                const existing = await trx("workOrderMaterials").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                });
                const byId = new Map(existing.map((m)=>[
                        m.id,
                        m
                    ]));
                if (input.materials.some((m)=>m.id && !byId.has(m.id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("A material no longer exists. Reload and try again.");
                // Rows keep their saved snapshot unless they are newly linked or re-linked to a catalog item; then the server copies name, unit and cost itself.
                const isNewLink = (m)=>!!m.catalogId && (!m.id || byId.get(m.id)?.catalogId !== m.catalogId);
                const linkable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$snapshot$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadLinkableMaterials"])(trx, context.workspaceId, input.materials.filter(isNewLink).map((m)=>m.catalogId));
                if (input.materials.some((m)=>isNewLink(m) && !linkable.has(m.catalogId))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("That catalog item is no longer available. Pick another or add a custom item.");
                // Prices and costs the editor cannot see are never wiped or set by them.
                await trx("workOrderMaterials").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).delete();
                if (input.materials.length) await trx("workOrderMaterials").insert(input.materials.map((m, i)=>{
                    const old = m.id ? byId.get(m.id) : undefined, item = isNewLink(m) ? linkable.get(m.catalogId) : undefined;
                    const kept = !!m.catalogId && !!old && old.catalogId === m.catalogId;
                    const price = prices ? m.customerPriceCents : old?.customerPriceCents ?? null;
                    return {
                        id: old?.id ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        workspaceId: context.workspaceId,
                        workOrderId: row.id,
                        position: i,
                        catalogId: m.catalogId,
                        name: item?.name ?? (kept ? old.name : m.name),
                        quantity: m.quantity,
                        unit: item?.unit ?? (kept ? old.unit : m.unit),
                        imageUrl: item ? item.imageUrl : kept ? old.imageUrl : "",
                        status: m.status,
                        note: m.note,
                        customerPriceCents: item ? prices && m.customerPriceCents !== null ? m.customerPriceCents : item.priceCents : price,
                        costCents: item ? item.costCents : kept ? old.costCents : costs ? m.costCents : old?.costCents ?? null
                    };
                }));
                changes = {
                    from: existing.map((m)=>m.name),
                    to: input.materials.map((m)=>m.name),
                    linked: input.materials.filter(isNewLink).map((m)=>linkable.get(m.catalogId).name)
                };
                break;
            }
        case "status":
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateStatusChange"])({
                    ...state,
                    assigneeId: row.primaryAssigneeId
                }, input);
                patch.status = input.to;
                if (input.to === "issued") patch.issuedAt = trx.fn.now();
                if (input.to === "in-progress") patch.startedAt = row.startedAt ?? trx.fn.now();
                if (input.to === "canceled") Object.assign(patch, {
                    canceledAt: trx.fn.now(),
                    cancellationReason: input.reason
                });
                changes = {
                    from: row.status,
                    to: input.to,
                    ...input.reason ? {
                        reason: input.reason
                    } : {}
                };
                break;
            }
        case "complete":
            {
                const tasks = await trx("workOrderTasks").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).select("required", "done");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateCompletion"])({
                    ...state,
                    tasks,
                    signoffRequired: options.signoffRequired ?? !!(await trx("workspaces").where({
                        id: context.workspaceId
                    }).first("workOrderSignoffRequired"))?.workOrderSignoffRequired,
                    canOverride: context.membership.role !== "field"
                }, input);
                const actor = await trx("users").where({
                    id: context.userId
                }).first("name");
                await trx("workOrderCompletions").insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: context.workspaceId,
                    workOrderId: row.id,
                    summary: input.summary,
                    followUp: input.followUp,
                    followUpNote: input.followUpNote,
                    completedBy: context.userId,
                    completedByName: actor.name,
                    completedAt: trx.fn.now(),
                    signerName: input.signerName || null,
                    signedAt: input.signerName ? trx.fn.now() : null,
                    signatureImage: input.signerName ? input.signatureImage : null,
                    overrideReason: input.overrideReason
                });
                Object.assign(patch, {
                    status: "completed",
                    completedAt: trx.fn.now()
                });
                changes = {
                    from: row.status,
                    to: "completed",
                    summary: input.summary,
                    followUp: input.followUp,
                    signed: !!input.signatureImage,
                    overrideReason: input.overrideReason
                };
                break;
            }
        case "reopen":
            {
                const to = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateReopen"])(state);
                // The completion record is removed from the live row but kept in the activity history.
                const completion = await trx("workOrderCompletions").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).first("summary", "signerName", "signedAt", "overrideReason");
                await trx("workOrderCompletions").where({
                    workspaceId: context.workspaceId,
                    workOrderId: row.id
                }).delete();
                Object.assign(patch, {
                    status: to,
                    completedAt: null,
                    canceledAt: null,
                    cancellationReason: null,
                    ...to === "draft" ? {
                        issuedAt: null,
                        startedAt: null
                    } : {}
                });
                changes = {
                    from: row.status,
                    to,
                    reason: input.reason,
                    previousCompletion: completion ?? null,
                    previousCancellationReason: row.cancellationReason
                };
                break;
            }
        case "note":
            if (row.archivedAt || ![
                "issued",
                "in-progress",
                "completed"
            ].includes(row.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderLifecycleError"]("Notes can be added once a work order is issued and until it is canceled.");
            changes = {
                body: input.body
            };
            break;
        case "archive":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateArchive"])(state, input.archived);
            patch.archivedAt = input.archived ? trx.fn.now() : null;
            changes = {
                archived: input.archived
            };
            break;
        case "delete":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateDelete"])(state);
            break;
    }
    if (input.action === "delete") {
        await trx("workOrderDeleteAudit").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            workOrderNumber: row.workOrderNumber,
            title: row.title,
            actorId: context.userId,
            source
        });
        await trx("workOrders").where({
            workspaceId: context.workspaceId,
            id: row.id
        }).delete();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeEmptyCalendarVisits"])(trx, context.workspaceId);
        return {
            workOrderId: row.id,
            version: row.version
        };
    }
    await trx("workOrders").where({
        workspaceId: context.workspaceId,
        id: row.id
    }).update(patch);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["synchronizeCalendarRecord"])(trx, context.workspaceId, "work_order", row.id);
    if (input.action === "schedule") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyVisitChange"])(trx, context, input.submissionId, !input.scheduledDate ? "cleared" : row.scheduledDate ? "rescheduled" : "scheduled", [
        {
            type: "work_order",
            id: row.id
        }
    ], {
        scheduledDate: row.scheduledDate,
        arrivalWindow: row.arrivalWindow
    }, {
        scheduledDate: input.scheduledDate,
        arrivalWindow: input.arrivalWindow
    });
    await log(trx, context, row.id, input.submissionId, row.version + 1, hash, input.action, changes, source);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$notify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notifyWorkOrderChange"])(trx, context, row, input);
    return {
        workOrderId: row.id,
        version: row.version + 1
    };
}
}),
"[project]/packages/data/src/work-orders/export.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportWorkOrders",
    ()=>exportWorkOrders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order-chat.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const headers = {
    number: "Work order",
    title: "Title",
    status: "Status",
    job: "Job",
    customer: "Customer",
    address: "Address",
    assignee: "Assignee",
    crew: "Crew",
    scheduledDate: "Scheduled date",
    arrivalWindow: "Arrival window",
    tasks: "Tasks done"
};
const pageSize = 100;
async function exportWorkOrders(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2d$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workOrderExportSchema"].parse(raw);
    if (input.query.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const check = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (_trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "workorders.export").allowed);
    if (!check) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const first = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readWorkOrders"])(db, identity, enabled, {
        ...input.query,
        page: 1,
        pageSize
    });
    if (first.total !== input.expectedCount || !first.total || first.total > 50000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderConflictError"]("Export scope changed or exceeds 50,000 rows. Prepare it again.");
    const lines = [
        "\uFEFF" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((key)=>headers[key]))
    ];
    let bytes = Buffer.byteLength(lines[0]);
    for(let page = 1; page <= Math.ceil(first.total / pageSize); page++){
        const { rows } = page === 1 ? first : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readWorkOrders"])(db, identity, enabled, {
            ...input.query,
            page,
            pageSize
        });
        for (const row of rows){
            const cells = {
                number: row.number,
                title: row.title,
                status: row.status,
                job: row.jobNumber,
                customer: row.customerName,
                address: row.address,
                assignee: row.assigneeName ?? "",
                crew: row.crewNames.join("; "),
                scheduledDate: row.scheduledDate ?? "",
                arrivalWindow: row.arrivalWindow ?? "",
                tasks: `${row.tasksDone}/${row.tasksTotal}`
            };
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((key)=>cells[key]));
            bytes += Buffer.byteLength(line);
            if (bytes > 32000000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkOrderValidationError"]("Narrow the export filters to reduce the file size.");
            lines.push(line);
        }
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx)=>{
        await trx("workOrderExportAudit").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            rowCount: first.total
        });
    });
    return lines.join("");
}
}),
"[project]/packages/data/src/work-orders/settings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readWorkOrderSettings",
    ()=>readWorkOrderSettings,
    "saveWorkOrderSettings",
    ()=>saveWorkOrderSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
const read = async (trx, workspaceId)=>{
    const row = await trx("workspaces").where({
        id: workspaceId
    }).first("businessPhone", "workOrderSignoffRequired");
    return {
        signoffRequired: !!row?.workOrderSignoffRequired,
        businessPhone: row?.businessPhone ?? ""
    };
};
async function readWorkOrderSettings(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "settings.business.read"
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return {
            settings: await read(trx, context.workspaceId),
            canEdit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "settings.business.update"
            }).allowed
        };
    });
}
async function saveWorkOrderSettings(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderSettingsSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "settings.business.update"
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await trx("workspaces").where({
            id: context.workspaceId
        }).update({
            workOrderSignoffRequired: input.signoffRequired,
            businessPhone: input.businessPhone
        });
        return read(trx, context.workspaceId);
    });
}
}),
"[project]/packages/data/src/knowledge/embeddings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createOpenAIEmbedder",
    ()=>createOpenAIEmbedder,
    "embeddingSpace",
    ()=>embeddingSpace,
    "validateVectors",
    ()=>validateVectors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/ai-usage.ts [app-rsc] (ecmascript)");
;
const embeddingSpace = {
    model: 'text-embedding-3-small',
    dimensions: 1536
};
function validateVectors(vectors, count, dimensions) {
    if (!Array.isArray(vectors) || vectors.length !== count || vectors.some((vector)=>!Array.isArray(vector) || vector.length !== dimensions || vector.some((n)=>typeof n !== 'number' || !Number.isFinite(n)) || !vector.some((n)=>n !== 0))) throw Error('Invalid embedding response');
}
function createOpenAIEmbedder(apiKey, request = fetch, accounting) {
    if (!apiKey?.trim()) throw Error('Embedding credentials are not configured');
    return {
        ...embeddingSpace,
        async embed (texts, signal) {
            if (!texts.length || texts.length > 30 || texts.some((text)=>!text.trim() || text.length > 8000)) throw Error('Invalid embedding input');
            let tokens;
            let completed = false;
            // Embedding inputs are text-only byte-pair encoded: UTF-8 bytes plus one framing token per input is a conservative bound.
            const reservation = texts.reduce((n, text)=>n + new TextEncoder().encode(text).byteLength + 1, 0);
            const finish = await accounting?.recorder.start(embeddingSpace.model, accounting.phase, reservation);
            try {
                const response = await request('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    signal: signal ? AbortSignal.any([
                        signal,
                        AbortSignal.timeout(30000)
                    ]) : AbortSignal.timeout(30000),
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...embeddingSpace,
                        input: texts,
                        encoding_format: 'float'
                    })
                });
                if (!response.ok) {
                    await response.body?.cancel();
                    throw Error('Embedding provider unavailable');
                }
                if (Number(response.headers.get('content-length')) > 2500000) {
                    await response.body?.cancel();
                    throw Error('Embedding response too large');
                }
                const reader = response.body?.getReader();
                if (!reader) throw Error('Empty embedding response');
                let size = 0;
                const buffers = [];
                try {
                    while(true){
                        const chunk = await reader.read();
                        if (chunk.done) break;
                        size += chunk.value.length;
                        if (size > 2500000) throw Error('Embedding response too large');
                        buffers.push(chunk.value);
                    }
                } finally{
                    await reader.cancel();
                }
                const result = JSON.parse(Buffer.concat(buffers).toString('utf8'));
                if (result.usage) {
                    const reported = {
                        inputTokens: result.usage.prompt_tokens,
                        totalTokens: result.usage.total_tokens,
                        outputTokens: 0,
                        cachedInputTokens: 0,
                        reasoningTokens: 0
                    };
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validAITokenUsage"])(reported)) tokens = reported;
                }
                if (result.model !== embeddingSpace.model || !Array.isArray(result.data) || result.data.length !== texts.length) throw Error('Invalid embedding response');
                const ordered = [
                    ...result.data
                ].sort((a, b)=>a.index - b.index);
                if (ordered.some((entry, index)=>entry.index !== index || entry.object !== 'embedding')) throw Error('Invalid embedding indices');
                const vectors = ordered.map((entry)=>entry.embedding);
                validateVectors(vectors, texts.length, embeddingSpace.dimensions);
                completed = true;
                return vectors;
            } catch  {
                throw Error('Embedding request failed; check server configuration or retry later');
            } finally{
                await finish?.({
                    outcome: completed ? 'completed' : signal?.aborted ? 'cancelled' : 'failed',
                    tokens
                });
            }
        }
    };
}
}),
"[project]/packages/data/src/knowledge/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "articleIdentity",
    ()=>articleIdentity,
    "ingestArticle",
    ()=>ingestArticle,
    "publishArticle",
    ()=>publishArticle,
    "readHelpArticle",
    ()=>readHelpArticle,
    "retireMissingArticles",
    ()=>retireMissingArticles,
    "retrieveHelp",
    ()=>retrieveHelp,
    "stageArticle",
    ()=>stageArticle
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$knowledge$2f$embeddings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/knowledge/embeddings.ts [app-rsc] (ecmascript)");
;
;
;
;
const hash = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
function articleIdentity(article, space) {
    return hash(JSON.stringify([
        article.slug,
        article.version,
        space.model,
        space.dimensions
    ]));
}
async function retire(db, ids) {
    if (!ids.length) return;
    await db('helpArticles').whereIn('id', ids).update({
        state: 'retired'
    });
    await db('helpEmbeddings').whereIn('chunkId', db('helpChunks').whereIn('articleId', ids).select('id')).delete();
}
async function stageArticle(db, article, space) {
    if (!Number.isInteger(space.dimensions) || space.dimensions < 1 || space.dimensions > 2000 || !space.model) throw Error('Invalid embedding space');
    const id = articleIdentity(article, space);
    return db.transaction(async (trx)=>{
        await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [
            `help:${article.slug}`
        ]);
        const current = await trx('helpArticles').where({
            id
        }).first();
        if (current?.state === 'published') return {
            id,
            ready: true
        };
        await retire(trx, (await trx('helpArticles').where({
            slug: article.slug
        }).whereNot({
            id
        }).select('id')).map((row)=>row.id));
        await trx('helpArticles').insert({
            id,
            slug: article.slug,
            version: article.version,
            title: article.title,
            sourcePath: article.sourcePath,
            roles: article.roles,
            capabilities: article.capabilities,
            plans: article.plans,
            productStatus: article.productStatus,
            state: 'draft',
            model: space.model,
            dimensions: space.dimensions
        }).onConflict('id').merge({
            state: 'draft',
            publishedAt: null
        });
        await trx('helpHeads').insert({
            slug: article.slug,
            articleId: id
        }).onConflict('slug').merge();
        for (const [position, section] of article.sections.entries()){
            await trx('helpChunks').insert({
                id: hash(`${id}:${section.anchor}`),
                articleId: id,
                ...section,
                position,
                contentHash: hash(section.text)
            }).onConflict('id').ignore();
        }
        return {
            id,
            ready: false
        };
    });
}
async function publishArticle(db, id, vectors) {
    return db.transaction(async (trx)=>{
        const article = await trx('helpArticles').where({
            id
        }).first();
        if (!article) throw Error('Help build no longer exists');
        await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [
            `help:${article.slug}`
        ]);
        const head = await trx('helpHeads').where({
            slug: article.slug,
            articleId: id
        }).first();
        if (!head) return false; // A newer version superseded this job.
        const chunks = await trx('helpChunks').where({
            articleId: id
        }).orderBy('position');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$knowledge$2f$embeddings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateVectors"])(vectors, chunks.length, article.dimensions);
        for (const [index, chunk] of chunks.entries())await trx('helpEmbeddings').insert({
            chunkId: chunk.id,
            embedding: JSON.stringify(vectors[index])
        }).onConflict('chunkId').merge();
        await trx('helpArticles').where({
            id
        }).update({
            state: 'published',
            publishedAt: trx.fn.now()
        });
        return true;
    });
}
async function ingestArticle(db, article, embedder) {
    const staged = await stageArticle(db, article, embedder);
    if (staged.ready) return {
        status: 'unchanged',
        chunks: article.sections.length
    };
    const vectors = await embedder.embed(article.sections.map((section)=>`${article.title}\n${section.heading}\n${section.text}`));
    const published = await publishArticle(db, staged.id, vectors);
    return {
        status: published ? 'published' : 'superseded',
        chunks: article.sections.length
    };
}
async function retireMissingArticles(db, slugs) {
    if (!slugs.length) throw Error('Empty corpus requires explicit review');
    await db.transaction(async (trx)=>{
        const missing = await trx('helpArticles').whereNotIn('slug', slugs).select('id');
        await retire(trx, missing.map((row)=>row.id));
        await trx('helpHeads').whereNotIn('slug', slugs).delete();
    });
}
function helpAccess(db, context, plan) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'assistant.use'
    }).allowed || plan !== 'free') throw Error('Help access denied');
    const capabilities = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionIds"].filter((permission)=>{
        const definition = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionCatalog"][permission];
        return definition.mode === 'collection' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, permission).allowed : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission
        }).allowed;
    });
    // Global product help only. Current workspace auth is supplied by a locked server transaction.
    return db('helpArticles as a').join('helpHeads as h', 'h.articleId', 'a.id').where('a.state', 'published').where('a.productStatus', 'implemented').whereRaw('? = ANY(a.roles)', [
        context.membership.role
    ]).whereRaw('? = ANY(a.plans)', [
        plan
    ]).whereRaw('a.capabilities <@ ?::text[]', [
        capabilities
    ]);
}
function source(row, workspaceId) {
    return {
        slug: row.slug,
        version: row.version,
        title: row.title,
        anchor: row.anchor,
        heading: row.heading,
        href: `/help/${row.slug}?workspace=${encodeURIComponent(workspaceId)}&version=${row.version}#${row.anchor}`
    };
}
async function retrieveHelp(db, context, query, space, plan = 'free') {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$knowledge$2f$embeddings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateVectors"])([
        query
    ], 1, space.dimensions);
    const vector = JSON.stringify(query);
    // Exact search over an authorized CTE; forbidden chunks cannot consume the top-k or reach callers.
    const eligible = helpAccess(db, context, plan).where({
        'a.model': space.model,
        'a.dimensions': space.dimensions
    }).select('a.*');
    const rows = await db.with('eligible', eligible).from('eligible as a').join('helpChunks as c', 'c.articleId', 'a.id').join('helpEmbeddings as e', 'e.chunkId', 'c.id').whereRaw('vector_dims(e.embedding) = ?', [
        space.dimensions
    ]).select('a.slug', 'a.version', 'a.title', 'c.anchor', 'c.heading', 'c.text', db.raw('1 - (e.embedding <=> ?::vector) as similarity', [
        vector
    ])).whereRaw('1 - (e.embedding <=> ?::vector) >= ?', [
        vector,
        0.35
    ]).orderByRaw('e.embedding <=> ?::vector', [
        vector
    ]).limit(3);
    return rows.map((row)=>({
            source: source(row, context.workspaceId),
            text: row.text,
            similarity: Number(row.similarity),
            trust: 'untrusted-reference'
        }));
}
async function readHelpArticle(db, context, slug, version, plan = 'free') {
    const article = await helpAccess(db, context, plan).where({
        'a.slug': slug,
        'a.version': version
    }).select('a.id', 'a.title').first();
    if (!article) return null;
    const sections = await db('helpChunks').where({
        articleId: article.id
    }).orderBy('position').select('anchor', 'heading', 'text');
    return {
        title: article.title,
        sections
    };
}
}),
"[project]/packages/data/src/checkpoints.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createChatCheckpointer",
    ()=>createChatCheckpointer,
    "setupChatCheckpoints",
    ()=>setupChatCheckpoints
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/.pnpm/pg@8.23.1/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function createChatCheckpointer(connectionString) {
    if (!connectionString) throw Error('Checkpoint database is not configured');
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PostgresSaver"].fromConnString(connectionString);
}
async function setupChatCheckpoints(db) {
    // A migration receives a transaction client; its cloned config omits hidden credentials.
    // Copy only the resolved connection parameters from that active, validated database session.
    const client = await db.client.acquireConnection();
    let saver;
    try {
        const connection = client.connectionParameters;
        if (!connection?.host || !connection.database || !connection.user) throw Error('Checkpoint database settings are incomplete');
        saver = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PostgresSaver"](new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__["default"].Pool({
            host: connection.host,
            port: connection.port,
            user: connection.user,
            password: client.password,
            database: connection.database,
            ssl: connection.ssl
        }));
        await saver.setup();
    } finally{
        try {
            await saver?.end();
        } finally{
            await db.client.releaseConnection(client);
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/data/src/ai-usage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configureWorkspaceAIBudget",
    ()=>configureWorkspaceAIBudget,
    "configureWorkspaceAIBudgetInTransaction",
    ()=>configureWorkspaceAIBudgetInTransaction,
    "createAIUsageRecorder",
    ()=>createAIUsageRecorder,
    "defaultMonthlyAITokens",
    ()=>defaultMonthlyAITokens,
    "workspaceAIAllowance",
    ()=>workspaceAIAllowance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/ai-usage.ts [app-rsc] (ecmascript)");
;
;
;
;
function defaultMonthlyAITokens(value = process.env.CHAT_MONTHLY_WORKSPACE_TOKENS) {
    if (value === undefined) return 5_000_000;
    if (!/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 1_000_000_000_000) throw Error('Invalid monthly AI allowance configuration');
    return Number(value);
}
async function effectiveDefaultMonthlyAITokens(db) {
    const result = await db.raw('SELECT public.get_default_monthly_ai_tokens()::text AS "monthlyTokens"');
    const configured = result.rows[0]?.monthlyTokens;
    return configured === null || configured === undefined ? defaultMonthlyAITokens() : defaultMonthlyAITokens(configured);
}
async function lockBudget(trx, workspaceId) {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
        `ai-budget:${workspaceId}`
    ]);
}
async function workspaceAIAllowance(db, workspaceId, at) {
    const override = await db('workspaceAITokenBudgets').where({
        workspaceId
    }).first();
    const result = await db('aiUsageCalls').where({
        workspaceId
    }).whereRaw(`"startedAt" >= (date_trunc('month', coalesce(?::timestamptz, statement_timestamp()) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`, [
        at ?? null
    ]).select(db.raw('coalesce(sum(coalesce("totalTokens", "reservationTokens")), 0)::text AS used')).first();
    const billing = await db('workspaceSubscriptions').where({
        workspaceId
    }).first();
    let monthlyTokens = override ? Number(override.monthlyTokens) : await effectiveDefaultMonthlyAITokens(db);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])() && !override && billing && (!billing.transitionUntil || new Date(billing.transitionUntil).getTime() <= (at ?? new Date()).getTime())) {
        const workspace = await db('workspaces').where({
            id: workspaceId
        }).first('planOverride', 'planOverrideEndsAt');
        monthlyTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkspacePlan"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveWorkspacePlan"])(billing, workspace, at ?? new Date()).plan).limits.aiTokensPerMonth;
    }
    return {
        monthlyTokens,
        usedTokens: BigInt(result.used)
    };
}
async function configureWorkspaceAIBudgetInTransaction(trx, workspaceId, monthlyTokens) {
    defaultMonthlyAITokens(String(monthlyTokens));
    await lockBudget(trx, workspaceId);
    await trx('workspaceAITokenBudgets').insert({
        workspaceId,
        monthlyTokens
    }).onConflict('workspaceId').merge({
        monthlyTokens,
        updatedAt: trx.fn.now()
    });
}
async function configureWorkspaceAIBudget(db, workspaceId, monthlyTokens) {
    defaultMonthlyAITokens(String(monthlyTokens));
    await db.transaction((trx)=>configureWorkspaceAIBudgetInTransaction(trx, workspaceId, monthlyTokens));
}
function createAIUsageRecorder(db, identity = {}) {
    return {
        requiresReservation: !!identity.workspaceId,
        async start (model, phase, reservationTokens = 0) {
            if (!Number.isSafeInteger(reservationTokens) || reservationTokens < 0 || identity.workspaceId && !reservationTokens) throw Error('Invalid AI token reservation');
            const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
            await db.transaction(async (trx)=>{
                let startedAt;
                if (identity.workspaceId) {
                    await lockBudget(trx, identity.workspaceId);
                    const clock = await trx.select(trx.raw('clock_timestamp() AS now')).first();
                    startedAt = clock.now;
                    const allowance = await workspaceAIAllowance(trx, identity.workspaceId, startedAt);
                    if (allowance.usedTokens + BigInt(reservationTokens) > BigInt(allowance.monthlyTokens)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIBudgetExceededError"]();
                }
                await trx('aiUsageCalls').insert({
                    id,
                    workspaceId: identity.workspaceId ?? null,
                    userId: identity.userId ?? null,
                    turnId: identity.turnId ?? null,
                    model,
                    phase,
                    reservationTokens,
                    ...startedAt ? {
                        startedAt
                    } : {}
                });
            });
            return async (result)=>{
                if (result.tokens && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validAITokenUsage"])(result.tokens)) throw Error('Invalid AI usage');
                await db.transaction(async (trx)=>{
                    if (identity.workspaceId) await lockBudget(trx, identity.workspaceId);
                    // Never release an unknown call or double-count repeated finalization.
                    await trx('aiUsageCalls').where({
                        id,
                        outcome: 'started'
                    }).update({
                        outcome: result.outcome,
                        finishedAt: trx.fn.now(),
                        ...result.tokens
                    });
                });
            };
        }
    };
}
}),
"[project]/packages/data/src/feature-flags.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createFeatureFlagReader",
    ()=>createFeatureFlagReader,
    "isFeatureFlagEnabled",
    ()=>isFeatureFlagEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-rsc] (ecmascript)");
;
const cacheLifetimeMs = 60_000;
function createFeatureFlagReader(now = Date.now) {
    const caches = new WeakMap();
    return async function isFeatureFlagEnabled(db, flagId, workspaceId) {
        let cache = caches.get(db);
        if (!cache) {
            cache = new Map();
            caches.set(db, cache);
        }
        const key = `${flagId}:${workspaceId ?? 'global'}`;
        const cached = cache.get(key);
        const time = now();
        if (cached && cached.expiresAt > time) return cached.enabled;
        let planId = null;
        if (workspaceId) {
            const [subscription, workspace] = await Promise.all([
                db('workspaceSubscriptions').where({
                    workspaceId
                }).first('plan', 'status', 'paidThrough', 'recoveryUntil'),
                db('workspaces').where({
                    id: workspaceId
                }).first('planOverride', 'planOverrideEndsAt')
            ]);
            planId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveWorkspacePlan"])(subscription, workspace, new Date(time)).plan;
        }
        const result = await db.raw('SELECT public.is_salesmora_feature_enabled(?, ?, ?) AS enabled', [
            flagId,
            planId,
            workspaceId ?? null
        ]);
        const enabled = result.rows[0]?.enabled;
        if (typeof enabled !== 'boolean') throw new Error('Feature flag evaluation returned an invalid result.');
        if (cache.size >= 5_000) {
            for (const [entryKey, entry] of cache){
                if (entry.expiresAt <= time || cache.size >= 4_000) cache.delete(entryKey);
            }
        }
        cache.set(key, {
            enabled,
            expiresAt: time + cacheLifetimeMs
        });
        return enabled;
    };
}
const isFeatureFlagEnabled = createFeatureFlagReader();
}),
"[project]/packages/data/src/rollout-flags.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isRolloutFlagEnabled",
    ()=>isRolloutFlagEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$rollout$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/rollout-flags.ts [app-rsc] (ecmascript)");
;
async function isRolloutFlagEnabled(db, key) {
    const flagKey = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$rollout$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminRolloutFlagKeySchema"].parse(key);
    const { rows } = await db.raw('SELECT public.is_salesmora_rollout_enabled(?) AS enabled', [
        flagKey
    ]);
    const enabled = rows[0]?.enabled;
    if (typeof enabled !== 'boolean') throw new Error('Rollout flag evaluation returned an invalid result.');
    return enabled;
}
}),
"[project]/packages/data/src/admin-billing-management.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inspectAdminBillingWebhookReplay",
    ()=>inspectAdminBillingWebhookReplay,
    "queueAdminBillingWebhookReplay",
    ()=>queueAdminBillingWebhookReplay,
    "readAdminBillingWebhookReplayEvents",
    ()=>readAdminBillingWebhookReplayEvents,
    "readAdminWorkspaceBilling",
    ()=>readAdminWorkspaceBilling,
    "readAdminWorkspaceBillingLinks",
    ()=>readAdminWorkspaceBillingLinks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/billing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-rsc] (ecmascript)");
;
;
;
const providerId = (value)=>typeof value === 'string' ? value : value?.id ?? null;
function isoDate(value) {
    return value === null ? null : new Date(value).toISOString();
}
function effectiveAt(change) {
    const timestamp = [
        'downgrade',
        'free'
    ].includes(change.kind) ? change.basis?.end : change.prorationAt;
    return typeof timestamp === 'number' && Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : null;
}
function invoiceSummary(invoice) {
    return {
        number: invoice.number,
        createdAt: new Date(invoice.created * 1000).toISOString(),
        currency: 'usd',
        total: invoice.total,
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_remaining,
        status: invoice.status
    };
}
class BillingProviderScopeError extends Error {
}
function webhookEventStatus(event, now) {
    return event.processedAt ? 'processed' : event.attempts === 0 ? 'pending' : new Date(event.retryAt).getTime() <= now ? 'retry_due' : 'retry_scheduled';
}
async function adminBillingWebhookReplayTarget(trx, workspaceId, eventId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).forUpdate().first('deletionRequestedAt');
    if (!workspace) return {
        status: 'not_found'
    };
    if (workspace.deletionRequestedAt) return {
        status: 'workspace_deletion_pending'
    };
    const event = await trx('billingWebhookEvents').where({
        id: eventId,
        workspaceId
    }).forUpdate().first('attempts', 'receivedAt', 'retryAt', 'processedAt');
    if (!event) return {
        status: 'not_found'
    };
    if (event.processedAt || event.attempts < 1) return {
        status: 'not_eligible'
    };
    return {
        status: 'eligible',
        attempts: event.attempts,
        receivedAt: isoDate(event.receivedAt),
        retryAt: isoDate(event.retryAt)
    };
}
async function inspectAdminBillingWebhookReplay(trx, workspaceId, eventId) {
    return adminBillingWebhookReplayTarget(trx, workspaceId, eventId);
}
async function readAdminBillingWebhookReplayEvents(trx, workspaceId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).forShare().first('deletionRequestedAt');
    if (!workspace) return {
        status: 'not_found'
    };
    if (workspace.deletionRequestedAt) {
        return {
            status: 'ready',
            deletionPending: true,
            events: []
        };
    }
    const rows = await trx('billingWebhookEvents').where({
        workspaceId
    }).orderBy('receivedAt', 'desc').limit(20).select('id', 'type', 'receivedAt', 'processedAt', 'attempts', 'retryAt');
    const now = Date.now();
    return {
        status: 'ready',
        deletionPending: false,
        events: rows.map((event)=>({
                replayKey: event.id,
                type: event.type,
                status: webhookEventStatus(event, now),
                receivedAt: isoDate(event.receivedAt),
                processedAt: isoDate(event.processedAt),
                attempts: event.attempts,
                retryAt: isoDate(event.retryAt)
            }))
    };
}
async function queueAdminBillingWebhookReplay(trx, workspaceId, eventId) {
    const target = await adminBillingWebhookReplayTarget(trx, workspaceId, eventId);
    if (target.status !== 'eligible') return target;
    const updated = await trx('billingWebhookEvents').where({
        id: eventId,
        workspaceId
    }).whereNull('processedAt').where('attempts', '>', 0).update({
        retryAt: trx.fn.now()
    });
    return updated === 1 ? {
        status: 'queued'
    } : {
        status: 'not_eligible'
    };
}
async function verifiedStripeWorkspace(stripe, workspaceId, customerId, subscriptionId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) {
        throw new BillingProviderScopeError('Billing customer scope mismatch.');
    }
    let subscription = null;
    if (subscriptionId) {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.livemode || providerId(subscription.customer) !== customerId || subscription.metadata.workspaceId !== workspaceId) {
            throw new BillingProviderScopeError('Billing subscription scope mismatch.');
        }
    }
    const history = await stripe.invoices.list({
        customer: customerId,
        limit: 12
    });
    if (history.data.some((invoice)=>invoice.livemode || providerId(invoice.customer) !== customerId || invoice.currency !== 'usd')) {
        throw new BillingProviderScopeError('Billing invoice scope mismatch.');
    }
    return {
        customer,
        subscription,
        invoices: history.data
    };
}
function testDashboardUrl(resource, id) {
    return `https://dashboard.stripe.com/test/${resource}/${id}`;
}
async function readAdminWorkspaceBilling(trx, workspaceId) {
    const row = await trx('workspaceSubscriptions').where({
        workspaceId
    }).first('plan', 'intendedPlan', 'status', 'cancelAtPeriodEnd', 'paidThrough', 'recoveryUntil', 'customerId', 'subscriptionId');
    const changes = await trx('billingPlanChanges').where({
        workspaceId
    }).orderBy('createdAt', 'desc').limit(20).select('targetPlan', 'kind', 'state', 'amountDue', 'createdAt', 'basis', 'prorationAt');
    const recoveries = await trx('billingRenewalRecoveries').where({
        workspaceId
    }).orderBy('createdAt', 'desc').limit(20).select('state', 'amountDue', 'attempts', 'createdAt', 'expiresAt', 'retryAt');
    const events = await trx('billingWebhookEvents').where({
        workspaceId
    }).orderBy('receivedAt', 'desc').limit(20).select('type', 'receivedAt', 'processedAt', 'attempts', 'retryAt');
    const now = Date.now();
    const webhookEvents = events.map((event)=>({
            type: event.type,
            status: webhookEventStatus(event, now),
            receivedAt: isoDate(event.receivedAt),
            processedAt: isoDate(event.processedAt),
            attempts: event.attempts,
            retryAt: isoDate(event.retryAt)
        }));
    let providerStatus = 'not_linked';
    let payment = null;
    let invoices = [];
    if (row?.subscriptionId && !row.customerId) {
        throw new Error('Workspace billing mapping is incomplete.');
    }
    if (row?.customerId) {
        try {
            const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stripeSandbox"])();
            const verified = await verifiedStripeWorkspace(stripe, workspaceId, row.customerId, row.subscriptionId);
            const methodId = providerId(verified.subscription?.default_payment_method) ?? providerId(verified.customer.invoice_settings.default_payment_method);
            if (methodId) {
                const method = await stripe.paymentMethods.retrieve(methodId);
                if (method.livemode || providerId(method.customer) !== row.customerId) {
                    throw new BillingProviderScopeError('Billing payment method scope mismatch.');
                }
                if (method.card) {
                    payment = {
                        brand: method.card.brand,
                        last4: method.card.last4,
                        expMonth: method.card.exp_month,
                        expYear: method.card.exp_year
                    };
                }
            }
            invoices = verified.invoices.map(invoiceSummary);
            providerStatus = 'available';
        } catch (error) {
            if (error instanceof BillingProviderScopeError) throw error;
            console.error('Admin workspace billing provider data is unavailable.');
            payment = null;
            invoices = [];
            providerStatus = 'unavailable';
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminWorkspaceBillingResponseSchema"].parse({
        workspaceId,
        subscription: row ? {
            plan: row.plan,
            intendedPlan: row.intendedPlan,
            status: row.status,
            cancelAtPeriodEnd: row.cancelAtPeriodEnd,
            paidThrough: isoDate(row.paidThrough),
            recoveryUntil: isoDate(row.recoveryUntil)
        } : null,
        planChanges: changes.map((change)=>({
                plan: change.targetPlan,
                kind: change.kind,
                status: change.state,
                amountDue: change.amountDue,
                createdAt: isoDate(change.createdAt),
                effectiveAt: effectiveAt(change)
            })),
        invoices,
        payment,
        providerStatus,
        recoveries: recoveries.map((recovery)=>({
                state: recovery.state,
                amountDue: recovery.amountDue,
                attempts: recovery.attempts,
                createdAt: isoDate(recovery.createdAt),
                expiresAt: isoDate(recovery.expiresAt),
                retryAt: isoDate(recovery.retryAt)
            })),
        webhookEvents
    });
}
async function readAdminWorkspaceBillingLinks(trx, workspaceId) {
    const row = await trx('workspaceSubscriptions').where({
        workspaceId
    }).first('customerId', 'subscriptionId');
    if (row?.subscriptionId && !row.customerId) {
        throw new Error('Workspace billing mapping is incomplete.');
    }
    if (!row?.customerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminWorkspaceBillingLinksResponseSchema"].parse({
            workspaceId,
            providerStatus: 'not_linked',
            customerUrl: null,
            subscriptionUrl: null,
            invoices: []
        });
    }
    let verified;
    try {
        verified = await verifiedStripeWorkspace((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stripeSandbox"])(), workspaceId, row.customerId, row.subscriptionId);
    } catch (error) {
        if (error instanceof BillingProviderScopeError) throw error;
        console.error('Admin workspace billing links are unavailable.');
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminWorkspaceBillingLinksResponseSchema"].parse({
            workspaceId,
            providerStatus: 'unavailable',
            customerUrl: null,
            subscriptionUrl: null,
            invoices: []
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminWorkspaceBillingLinksResponseSchema"].parse({
        workspaceId,
        providerStatus: 'available',
        customerUrl: testDashboardUrl('customers', verified.customer.id),
        subscriptionUrl: verified.subscription ? testDashboardUrl('subscriptions', verified.subscription.id) : null,
        invoices: verified.invoices.map((invoice)=>({
                number: invoice.number,
                createdAt: new Date(invoice.created * 1000).toISOString(),
                url: testDashboardUrl('invoices', invoice.id)
            }))
    });
}
}),
"[project]/packages/data/src/account-deletion.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AccountDeletionError",
    ()=>AccountDeletionError,
    "cancelDeletedWorkspaceBilling",
    ()=>cancelDeletedWorkspaceBilling,
    "processAccountDeletions",
    ()=>processAccountDeletions,
    "requestAccountDeletion",
    ()=>requestAccountDeletion
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class AccountDeletionError extends Error {
}
const providerId = (value)=>typeof value === 'string' ? value : value?.id;
async function requestAccountDeletion(db, userId, workspaceId, confirmation, verify) {
    return db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const workspace = await trx('workspaces').where({
            id: workspaceId
        }).forUpdate().first();
        if (!workspace || workspace.deletionRequestedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
            userId,
            workspaceId
        }, [
            'workspace.delete'
        ]);
        const user = await trx('users').where({
            id: userId
        }).forUpdate().first();
        if (!user || user.deletionRequestedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const owned = await trx('workspaces').where({
            ownerId: userId
        }).first('id');
        const owner = workspace.ownerId === userId;
        if (owned && (!owner || owned.id !== workspaceId)) throw new AccountDeletionError('Open Account settings in the workspace you own before deleting. Ownership must be transferred before deleting only your account.');
        if (owner && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'workspace.delete'
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (confirmation !== (owner ? workspace.businessName : user.email)) throw new AccountDeletionError('The confirmation does not match.');
        const credential = await trx('accounts').where({
            userId,
            providerId: 'credential'
        }).forUpdate().first('password');
        if (!credential?.password || !await verify(credential.password)) throw new AccountDeletionError('Your current password could not be verified.');
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx('accountDeletionRequests').insert({
            id,
            userId,
            workspaceId: owner ? workspaceId : null
        });
        await trx('users').where({
            id: userId
        }).update({
            deletionRequestedAt: trx.fn.now()
        });
        if (owner) {
            await trx('workspaces').where({
                id: workspaceId
            }).update({
                deletionRequestedAt: trx.fn.now()
            });
            await trx('workspaceInvitations').where({
                workspaceId
            }).whereNot('status', 'accepted').update({
                status: 'revoked',
                tokenHash: null
            });
            await trx('billingAudit').insert({
                workspaceId,
                actorId: userId,
                action: 'workspace.deletion_requested',
                details: JSON.stringify({
                    requestId: id
                })
            });
        }
        // Personal access ends in this commit, including every device. Workspace members are denied by the tombstone.
        await trx('sessions').where({
            userId
        }).delete();
        await trx('chatTurns').where((query)=>{
            query.where({
                userId
            });
            if (owner) query.orWhere({
                workspaceId
            });
        }).whereIn('state', [
            'accepted',
            'running'
        ]).update({
            state: 'cancelled',
            finishedAt: trx.fn.now()
        });
        return {
            accepted: true
        };
    });
}
async function cancelDeletedWorkspaceBilling(stripe, row, workspaceId) {
    if (!row.customerId) {
        if (row.subscriptionId) throw Error('Missing customer mapping');
        return;
    }
    const customer = await stripe.customers.retrieve(row.customerId);
    if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) throw Error('Customer mapping mismatch');
    for await (const session of stripe.checkout.sessions.list({
        customer: row.customerId,
        limit: 100
    })){
        if (session.livemode || session.metadata?.workspaceId !== workspaceId || session.client_reference_id !== workspaceId) throw Error('Checkout mapping mismatch');
        if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
    }
    // Includes a subscription purchased just before deletion but not yet reconciled by its webhook.
    for await (const sub of stripe.subscriptions.list({
        customer: row.customerId,
        status: 'all',
        limit: 100
    })){
        if (sub.livemode || providerId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId) throw Error('Subscription mapping mismatch');
        if ([
            'canceled',
            'incomplete_expired'
        ].includes(sub.status)) continue;
        if ((sub.pending_update || sub.status === 'incomplete') && sub.latest_invoice) {
            const invoice = await stripe.invoices.retrieve(providerId(sub.latest_invoice));
            if (invoice.livemode || providerId(invoice.customer) !== row.customerId || providerId(invoice.parent?.subscription_details?.subscription ?? null) !== sub.id) throw Error('Invoice mapping mismatch');
            if (invoice.status === 'open') {
                try {
                    await stripe.invoices.voidInvoice(invoice.id);
                } catch  {
                    if ((await stripe.invoices.retrieve(invoice.id)).status !== 'paid') throw Error('Payment recovery cancellation unverified');
                }
            }
        }
        if (sub.schedule) {
            const scheduleId = providerId(sub.schedule);
            const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
            if (schedule.livemode || providerId(schedule.customer) !== row.customerId || providerId(schedule.subscription) !== sub.id) throw Error('Schedule mapping mismatch');
            if ([
                'active',
                'not_started'
            ].includes(schedule.status)) await stripe.subscriptionSchedules.cancel(scheduleId, {
                invoice_now: false,
                prorate: false
            });
        }
        const latest = await stripe.subscriptions.retrieve(sub.id);
        const canceled = latest.status === 'canceled' ? latest : await stripe.subscriptions.cancel(sub.id, {
            invoice_now: false,
            prorate: false
        });
        if (canceled.status !== 'canceled' || canceled.livemode) throw Error('Cancellation unverified');
    }
    if (row.subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
        if (sub.livemode || providerId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || ![
            'canceled',
            'incomplete_expired'
        ].includes(sub.status)) throw Error('Cancellation unverified');
    }
}
async function processAccountDeletions(db, stripeFactory = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stripeSandbox"]) {
    const requests = await db('accountDeletionRequests').where({
        state: 'pending'
    }).where('retryAt', '<=', db.fn.now()).orderBy('requestedAt').limit(5).select('id', 'workspaceId');
    for (const candidate of requests){
        try {
            await db.transaction(async (trx)=>{
                // Same order as billing mutations/reconciliation, then workspace authorization locks.
                if (candidate.workspaceId) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, candidate.workspaceId);
                const request = await trx('accountDeletionRequests').where({
                    id: candidate.id,
                    state: 'pending'
                }).forUpdate().skipLocked().first();
                if (!request) return;
                const memberships = await trx('workspaceMemberships').where({
                    userId: request.userId
                }).select('workspaceId');
                const ids = [
                    ...new Set([
                        ...memberships.map((m)=>m.workspaceId),
                        ...request.workspaceId ? [
                            request.workspaceId
                        ] : []
                    ])
                ].sort();
                if (ids.length) await trx('workspaces').whereIn('id', ids).orderBy('id').forUpdate().select('id');
                const user = await trx('users').where({
                    id: request.userId
                }).forUpdate().first();
                if (!user?.deletionRequestedAt) throw Error('Deletion identity changed');
                if (request.workspaceId) {
                    const workspace = await trx('workspaces').where({
                        id: request.workspaceId,
                        ownerId: request.userId
                    }).first();
                    if (!workspace?.deletionRequestedAt) throw Error('Deletion workspace changed');
                    const billing = await trx('workspaceSubscriptions').where({
                        workspaceId: request.workspaceId
                    }).forUpdate().first();
                    if (billing) {
                        if (!billing.customerId && billing.customerCreationStartedAt) {
                            // Recover an uncertain customer creation only within Stripe's guaranteed idempotency window.
                            if (Date.now() - new Date(billing.customerCreationStartedAt).getTime() > 23 * 3600000) throw Error('Customer recovery required');
                            const customer = await stripeFactory().customers.create({
                                metadata: {
                                    workspaceId: request.workspaceId
                                },
                                email: user.email
                            }, {
                                idempotencyKey: `salesmora-customer-${request.workspaceId}`
                            });
                            if (customer.livemode || customer.metadata.workspaceId !== request.workspaceId) throw Error('Customer mapping mismatch');
                            billing.customerId = customer.id;
                            await trx('workspaceSubscriptions').where({
                                workspaceId: request.workspaceId
                            }).update({
                                customerId: customer.id
                            });
                        }
                        if (billing.customerId) {
                            const stripe = stripeFactory();
                            const recoveries = await trx('billingRenewalRecoveries').where({
                                workspaceId: request.workspaceId
                            }).whereIn('state', [
                                'applying',
                                'action',
                                'pending'
                            ]);
                            for (const recovery of recoveries){
                                const invoice = await stripe.invoices.retrieve(recovery.invoiceId);
                                if (invoice.livemode || providerId(invoice.customer) !== billing.customerId || providerId(invoice.parent?.subscription_details?.subscription ?? null) !== billing.subscriptionId) throw Error('Recovery invoice mapping mismatch');
                                if (invoice.status === 'open') {
                                    try {
                                        await stripe.invoices.voidInvoice(invoice.id);
                                    } catch  {
                                        if ((await stripe.invoices.retrieve(invoice.id)).status !== 'paid') throw Error('Recovery cancellation unverified');
                                    }
                                }
                            }
                            const attempts = await trx('billingPaymentMethods').where({
                                workspaceId: request.workspaceId
                            }).whereNotNull('setupIntentId');
                            for (const attempt of attempts){
                                const setup = await stripe.setupIntents.retrieve(attempt.setupIntentId);
                                if (setup.livemode || providerId(setup.customer) !== billing.customerId || setup.metadata?.workspaceId !== request.workspaceId || setup.metadata?.attemptId !== attempt.id) throw Error('Setup mapping mismatch');
                                if (![
                                    'succeeded',
                                    'canceled'
                                ].includes(setup.status)) await stripe.setupIntents.cancel(setup.id);
                            }
                        }
                        if (billing.customerId || billing.subscriptionId) await cancelDeletedWorkspaceBilling(stripeFactory(), billing, request.workspaceId);
                    }
                }
                const threads = trx('chatThreads').where((query)=>{
                    query.where({
                        userId: request.userId
                    });
                    if (request.workspaceId) query.orWhere({
                        workspaceId: request.workspaceId
                    });
                }).select('id');
                const turns = trx('chatTurns').whereIn('threadId', threads.clone()).select(trx.raw('id::text'));
                for (const table of [
                    'checkpoint_writes',
                    'checkpoint_blobs',
                    'checkpoints'
                ])await trx(table).whereIn('thread_id', turns.clone()).delete();
                await trx('chatThreads').whereIn('id', threads.clone()).delete();
                // Shared business records survive teammate deletion; assignments must not block membership removal.
                await trx('leads').where({
                    ownerId: request.userId
                }).update({
                    ownerId: null
                });
                await trx('aiUsageCalls').where({
                    userId: request.userId
                }).update({
                    userId: null
                });
                if (request.workspaceId) {
                    await trx('leads').where({
                        workspaceId: request.workspaceId
                    }).delete();
                    for (const table of [
                        'billingRenewalRecoveries',
                        'billingPaymentMethods',
                        'billingPlanChanges',
                        'billingCheckoutAttempts',
                        'workspaceSubscriptions',
                        'workspaceAITokenBudgets'
                    ])await trx(table).where({
                        workspaceId: request.workspaceId
                    }).delete();
                    await trx('billingAudit').insert({
                        workspaceId: request.workspaceId,
                        actorId: request.userId,
                        action: 'workspace.deletion_completed',
                        details: JSON.stringify({
                            requestId: request.id
                        })
                    });
                    await trx('workspaces').where({
                        id: request.workspaceId
                    }).delete();
                }
                await trx('verifications').where({
                    value: request.userId
                }).delete();
                await trx('users').where({
                    id: request.userId
                }).delete();
                await trx('accountDeletionRequests').where({
                    id: request.id
                }).update({
                    state: 'completed',
                    completedAt: trx.fn.now(),
                    lastError: null
                });
            });
        } catch  {
            // Never persist provider messages, passwords, email addresses or stack traces.
            await db('accountDeletionRequests').where({
                id: candidate.id,
                state: 'pending'
            }).update({
                attempts: db.raw('attempts + 1'),
                retryAt: new Date(Date.now() + 60000),
                lastError: 'retry_required'
            });
            console.error(JSON.stringify({
                event: 'worker.account_deletion_retry_pending'
            }));
        }
    }
}
}),
"[project]/packages/data/src/admin-data-requests.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readAdminDeletionRequests",
    ()=>readAdminDeletionRequests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$data$2d$requests$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/data-requests.ts [app-rsc] (ecmascript)");
;
const PAGE_SIZE = 20;
function deletionRequestsQuery(db, filter) {
    const query = db('accountDeletionRequests as r');
    if (filter === 'pending') query.where('r.state', 'pending');
    else if (filter === 'retry') query.where({
        'r.state': 'pending',
        'r.lastError': 'retry_required'
    });
    else if (filter === 'completed') query.where('r.state', 'completed');
    return query;
}
function isoDate(value) {
    return value === null ? null : new Date(value).toISOString();
}
function maskedEmail(email) {
    if (!email) return 'Unavailable after purge';
    const separator = email.lastIndexOf('@');
    if (separator <= 0 || separator === email.length - 1) throw new Error('Customer email is malformed.');
    return `${email.slice(0, Math.min(2, separator))}••••@${email.slice(separator + 1)}`;
}
async function readAdminDeletionRequests(db, filters) {
    const query = deletionRequestsQuery(db, filters.filter);
    const count = await query.clone().countDistinct({
        count: 'r.id'
    });
    const total = Number(count[0]?.count ?? 0);
    const page = Math.min(filters.page, Math.max(0, Math.ceil(total / PAGE_SIZE) - 1));
    const retryCount = await db('accountDeletionRequests').where({
        state: 'pending',
        lastError: 'retry_required'
    }).count({
        count: '*'
    });
    const allCount = await db('accountDeletionRequests').count({
        count: '*'
    });
    const rows = await query.clone().leftJoin('users as u', 'u.id', 'r.userId').leftJoin('workspaces as w', 'w.id', 'r.workspaceId').select([
        'r.id',
        'u.name as customerName',
        'u.email',
        'r.workspaceId',
        'w.businessName as workspaceName',
        'r.requestedAt',
        'r.state',
        'r.attempts',
        'r.retryAt',
        'r.lastError',
        'r.completedAt'
    ]).orderBy('r.requestedAt', 'desc').orderBy('r.id', 'asc').limit(PAGE_SIZE).offset(page * PAGE_SIZE);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$data$2d$requests$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminDeletionRequestsPageSchema"].parse({
        filter: filters.filter,
        requests: rows.map((row)=>({
                id: row.id,
                customerName: row.customerName ?? 'Account record purged',
                maskedEmail: maskedEmail(row.email),
                workspaceName: row.workspaceId && !row.workspaceName ? 'Workspace record purged' : row.workspaceName,
                requestedAt: isoDate(row.requestedAt),
                state: row.state,
                attempts: row.attempts,
                retryAt: isoDate(row.retryAt),
                lastError: row.lastError === 'retry_required' ? 'retry_required' : null,
                completedAt: isoDate(row.completedAt)
            })),
        total,
        allRequestsTotal: Number(allCount[0]?.count ?? 0),
        page,
        pageSize: PAGE_SIZE,
        retryScheduledTotal: Number(retryCount[0]?.count ?? 0)
    });
}
}),
"[project]/packages/data/src/accounts/suspension.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SuspensionError",
    ()=>SuspensionError,
    "suspendUser",
    ()=>suspendUser,
    "suspendWorkspace",
    ()=>suspendWorkspace,
    "unsuspendUser",
    ()=>unsuspendUser,
    "unsuspendWorkspace",
    ()=>unsuspendWorkspace
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/accounts/suspension.ts [app-rsc] (ecmascript)");
;
;
class SuspensionError extends Error {
}
function checkActor(actor) {
    if (!actor || ![
        'staff',
        'system'
    ].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
        throw new SuspensionError('A valid actor is required.');
    }
}
async function audit(trx, subjectType, subjectId, action, actor, reason) {
    await trx('suspensionAudit').insert({
        subjectType,
        subjectId,
        action,
        actorType: actor.type,
        actorId: actor.id,
        reason
    });
}
async function lockSubject(trx, subjectType, id) {
    const row = await trx(subjectType === 'user' ? 'users' : 'workspaces').where({
        id
    }).forUpdate().first('suspendedAt', 'deletionRequestedAt');
    if (!row) throw new SuspensionError(subjectType === 'user' ? 'User not found.' : 'Workspace not found.');
    return row;
}
async function suspendUser(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSuspensionReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const user = await lockSubject(trx, 'user', input.userId);
        if (user.deletionRequestedAt) throw new SuspensionError('This user is being deleted.');
        if (user.suspendedAt) return {
            changed: false
        };
        await trx('users').where({
            id: input.userId
        }).update({
            suspendedAt: trx.fn.now(),
            suspendedReason: reason
        });
        // Every device loses access in this commit.
        await trx('sessions').where({
            userId: input.userId
        }).delete();
        await trx('chatTurns').where({
            userId: input.userId
        }).whereIn('state', [
            'accepted',
            'running'
        ]).update({
            state: 'cancelled',
            finishedAt: trx.fn.now()
        });
        await audit(trx, 'user', input.userId, 'suspended', input.actor, reason);
        return {
            changed: true
        };
    });
}
async function unsuspendUser(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSuspensionReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const user = await lockSubject(trx, 'user', input.userId);
        if (!user.suspendedAt) return {
            changed: false
        };
        await trx('users').where({
            id: input.userId
        }).update({
            suspendedAt: null,
            suspendedReason: null
        });
        await audit(trx, 'user', input.userId, 'unsuspended', input.actor, reason);
        return {
            changed: true
        };
    });
}
async function suspendWorkspace(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSuspensionReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const workspace = await lockSubject(trx, 'workspace', input.workspaceId);
        if (workspace.deletionRequestedAt) throw new SuspensionError('This workspace is being deleted.');
        if (workspace.suspendedAt) return {
            changed: false
        };
        await trx('workspaces').where({
            id: input.workspaceId
        }).update({
            suspendedAt: trx.fn.now(),
            suspendedReason: reason
        });
        await trx('chatTurns').where({
            workspaceId: input.workspaceId
        }).whereIn('state', [
            'accepted',
            'running'
        ]).update({
            state: 'cancelled',
            finishedAt: trx.fn.now()
        });
        await trx('workspaceSuspensionNotices').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: input.workspaceId
        });
        await audit(trx, 'workspace', input.workspaceId, 'suspended', input.actor, reason);
        return {
            changed: true
        };
    });
}
async function unsuspendWorkspace(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSuspensionReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const workspace = await lockSubject(trx, 'workspace', input.workspaceId);
        if (workspace.deletionRequestedAt) throw new SuspensionError('This workspace is being deleted.');
        if (!workspace.suspendedAt) return {
            changed: false
        };
        await trx('workspaces').where({
            id: input.workspaceId
        }).update({
            suspendedAt: null,
            suspendedReason: null
        });
        // A notice that hasn't gone out yet is no longer true.
        await trx('workspaceSuspensionNotices').where({
            workspaceId: input.workspaceId,
            status: 'queued'
        }).update({
            status: 'skipped'
        });
        await audit(trx, 'workspace', input.workspaceId, 'unsuspended', input.actor, reason);
        return {
            changed: true
        };
    });
}
}),
"[project]/packages/data/src/accounts/account-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AccountActionError",
    ()=>AccountActionError,
    "markEmailVerified",
    ()=>markEmailVerified,
    "revokeUserSessions",
    ()=>revokeUserSessions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/accounts/staff-reason.ts [app-rsc] (ecmascript)");
;
class AccountActionError extends Error {
}
const maxSessionIds = 100;
function checkActor(actor) {
    if (!actor || ![
        'staff',
        'system'
    ].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
        throw new AccountActionError('A valid actor is required.');
    }
}
function checkSessionIds(sessionIds) {
    if (sessionIds === undefined) return undefined;
    if (!Array.isArray(sessionIds) || !sessionIds.length || sessionIds.length > maxSessionIds || !sessionIds.every((id)=>typeof id === 'string' && id.trim())) {
        throw new AccountActionError(`Choose between 1 and ${maxSessionIds} sessions.`);
    }
    return [
        ...new Set(sessionIds)
    ];
}
async function lockUser(trx, userId) {
    const user = await trx('users').where({
        id: userId
    }).forUpdate().first('emailVerified', 'deletionRequestedAt');
    if (!user) throw new AccountActionError('User not found.');
    return user;
}
async function revokeUserSessions(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    const sessionIds = checkSessionIds(input.sessionIds);
    return db.transaction(async (trx)=>{
        await lockUser(trx, input.userId);
        const query = trx('sessions').where({
            userId: input.userId
        });
        if (sessionIds) query.whereIn('id', sessionIds);
        const revoked = (await query.delete().returning('id')).map((row)=>row.id).sort();
        if (!revoked.length) return {
            revoked: 0
        };
        await trx('accountAudit').insert({
            userId: input.userId,
            action: 'sessions.revoked',
            actorType: input.actor.type,
            actorId: input.actor.id,
            reason,
            details: JSON.stringify({
                scope: sessionIds ? 'selected' : 'all',
                sessionIds: revoked
            })
        });
        return {
            revoked: revoked.length
        };
    });
}
async function markEmailVerified(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const user = await lockUser(trx, input.userId);
        if (user.deletionRequestedAt) throw new AccountActionError('This user is being deleted.');
        if (user.emailVerified) return {
            changed: false
        };
        await trx('users').where({
            id: input.userId
        }).update({
            emailVerified: true,
            updatedAt: trx.fn.now()
        });
        await trx('accountAudit').insert({
            userId: input.userId,
            action: 'email.marked_verified',
            actorType: input.actor.type,
            actorId: input.actor.id,
            reason
        });
        return {
            changed: true
        };
    });
}
}),
"[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withoutSuspendedWorkspaces",
    ()=>withoutSuspendedWorkspaces
]);
function withoutSuspendedWorkspaces(query, workspaceColumn) {
    return query.whereNotExists(function() {
        this.select('heldWorkspace.id').from('workspaces as heldWorkspace').whereRaw('"heldWorkspace"."id" = ??', [
            workspaceColumn
        ]).whereNotNull('heldWorkspace.suspendedAt');
    });
}
}),
"[project]/packages/data/src/workspaces/invitation-tokens.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invitationLifetimeMs",
    ()=>invitationLifetimeMs,
    "invitationTokenHash",
    ()=>invitationTokenHash,
    "invitationURL",
    ()=>invitationURL,
    "newInvitationToken",
    ()=>newInvitationToken,
    "openInvitationStatuses",
    ()=>openInvitationStatuses
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const invitationLifetimeMs = 7 * 86_400_000;
const openInvitationStatuses = [
    'pending_verification',
    'queued',
    'sent'
];
const invitationTokenHash = (token)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(token).digest('hex');
function newInvitationToken() {
    const token = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString('hex');
    return {
        token,
        tokenHash: invitationTokenHash(token)
    };
}
function invitationURL(appURL, token) {
    const url = new URL('/accept-invitation', appURL);
    if (![
        'https:',
        'http:'
    ].includes(url.protocol)) throw new Error('The app URL must use HTTP or HTTPS.');
    url.searchParams.set('token', token);
    return url.href;
}
}),
"[project]/packages/data/src/workspaces/team-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TeamActionError",
    ()=>TeamActionError,
    "removeWorkspaceMember",
    ()=>removeWorkspaceMember,
    "resendWorkspaceInvitation",
    ()=>resendWorkspaceInvitation,
    "revokeWorkspaceInvitation",
    ()=>revokeWorkspaceInvitation,
    "transferWorkspaceOwnership",
    ()=>transferWorkspaceOwnership
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/accounts/staff-reason.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/workspaces/invitation-tokens.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class TeamActionError extends Error {
}
const resendCooldownMs = 60_000;
const supportName = 'SalesMora support';
function checkActor(actor) {
    if (!actor || ![
        'staff',
        'system'
    ].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
        throw new TeamActionError('A valid actor is required.');
    }
}
async function lockWorkspace(trx, workspaceId) {
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).forUpdate().first('ownerId', 'businessName', 'suspendedAt', 'deletionRequestedAt');
    if (!workspace) throw new TeamActionError('Workspace not found.');
    if (workspace.deletionRequestedAt) throw new TeamActionError('This workspace is being deleted.');
    return workspace;
}
async function lockInvitation(trx, invitationId) {
    // Workspace first, then the invitation: the same order as invitation acceptance.
    const candidate = await trx('workspaceInvitations').where({
        id: invitationId
    }).first('workspaceId');
    if (!candidate) throw new TeamActionError('Invitation not found.');
    const workspace = await lockWorkspace(trx, candidate.workspaceId);
    const invitation = await trx('workspaceInvitations').where({
        id: invitationId,
        workspaceId: candidate.workspaceId
    }).forUpdate().first();
    if (!invitation) throw new TeamActionError('Invitation not found.');
    return {
        workspace,
        invitation
    };
}
async function audit(trx, workspaceId, action, actor, details) {
    const policy = await trx('workspacePolicies').where({
        workspaceId
    }).first('revision');
    await trx('authorizationAudit').insert({
        workspaceId,
        actorId: actor.id,
        action,
        beforeRevision: policy.revision,
        afterRevision: policy.revision,
        afterPolicy: JSON.stringify({
            actorType: actor.type,
            ...details
        })
    });
}
async function removeWorkspaceMember(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    return db.transaction(async (trx)=>{
        // The workspace lock serializes membership changes (the authorization_lock trigger takes it too).
        await lockWorkspace(trx, input.workspaceId);
        const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
            'm.workspaceId': input.workspaceId,
            'm.userId': input.userId
        }).first('m.role', 'u.name');
        if (!member) throw new TeamActionError('This person is not a member of the workspace.');
        if (member.role === 'owner') throw new TeamActionError('The Owner cannot be removed. Transfer ownership first.');
        const leads = await trx('leads').where({
            workspaceId: input.workspaceId,
            ownerId: input.userId
        }).orderBy('id').forUpdate().select('id', 'version', 'ownerName');
        const now = new Date();
        for (const lead of leads){
            await trx('leads').where({
                id: lead.id
            }).update({
                ownerId: null,
                ownerName: null,
                version: lead.version + 1,
                updatedAt: now,
                lastActivityAt: now
            });
            await trx('leadActivity').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workspaceId: input.workspaceId,
                leadId: lead.id,
                actorId: null,
                actorName: supportName,
                actorType: 'system',
                type: 'assigned',
                changes: JSON.stringify({
                    from: lead.ownerName ?? member.name,
                    to: null,
                    ownerId: null,
                    toVersion: lead.version + 1
                }),
                createdAt: now
            });
        }
        await trx('workspaceMemberships').where({
            workspaceId: input.workspaceId,
            userId: input.userId
        }).delete();
        await audit(trx, input.workspaceId, 'member.removed', input.actor, {
            reason,
            member: {
                userId: input.userId,
                role: member.role
            },
            unassignedLeads: leads.length
        });
        return {
            unassignedLeads: leads.length
        };
    });
}
async function resendWorkspaceInvitation(db, input) {
    checkActor(input.actor);
    if (Boolean(input.sendEmail) === Boolean(input.queueEmail)) {
        throw new TeamActionError('Choose exactly one invitation delivery strategy.');
    }
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const { workspace, invitation } = await lockInvitation(trx, input.invitationId);
        if (workspace.suspendedAt) throw new TeamActionError('This workspace is suspended.');
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openInvitationStatuses"].includes(invitation.status)) throw new TeamActionError(`This invitation was already ${invitation.status}.`);
        if (invitation.lastAttemptAt && Date.now() - new Date(invitation.lastAttemptAt).getTime() < resendCooldownMs) throw new TeamActionError('This invitation was sent less than a minute ago.');
        const owner = await trx('users').where({
            id: workspace.ownerId
        }).first('name', 'emailVerified', 'deletionRequestedAt');
        if (!owner.emailVerified || owner.deletionRequestedAt) throw new TeamActionError('The Owner must verify their email first.');
        if (!invitation.inviterId || !await inviterAllowed(trx, invitation.inviterId, invitation.workspaceId, invitation.role)) {
            throw new TeamActionError('The person who sent this invitation can no longer invite this role.');
        }
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertSeatCapacity"])(trx, invitation.workspaceId, 1, invitation.id);
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanCapacityError"]) throw new TeamActionError('The workspace has no free seat on its plan.');
            throw error;
        }
        const { token, tokenHash } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["newInvitationToken"])();
        const expiresAt = new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationLifetimeMs"]);
        await trx('workspaceInvitations').where({
            id: invitation.id
        }).update({
            status: 'sent',
            tokenHash,
            expiresAt,
            sentAt: trx.fn.now(),
            lastAttemptAt: trx.fn.now(),
            deliveryAttempts: trx.raw('"deliveryAttempts" + 1')
        });
        await audit(trx, invitation.workspaceId, 'invitation.resent', input.actor, {
            reason,
            invitation: {
                id: invitation.id,
                role: invitation.role,
                previousStatus: invitation.status
            }
        });
        const emailInput = {
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationURL"])(input.appURL, token),
            inviterName: owner.name,
            workspaceName: workspace.businessName,
            role: invitation.role
        };
        if (input.queueEmail) {
            const deliveryId = await input.queueEmail(trx, {
                invitationId: invitation.id,
                tokenHash,
                to: invitation.email,
                input: emailInput
            });
            return {
                expiresAt,
                deliveryId
            };
        }
        // Last, so a failed send rolls everything back and the previous link keeps working.
        if (input.sendEmail) {
            await input.sendEmail(invitation.email, emailInput);
            return {
                expiresAt
            };
        }
        throw new TeamActionError('Invitation delivery is not configured.');
    });
}
async function inviterAllowed(trx, inviterId, workspaceId, role) {
    try {
        const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
            userId: inviterId,
            workspaceId
        }, [
            'team.invite'
        ]);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'team.invite',
            targetRole: role
        }).allowed;
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
        throw error;
    }
}
async function revokeWorkspaceInvitation(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const { invitation } = await lockInvitation(trx, input.invitationId);
        if (invitation.status === 'revoked') return {
            changed: false
        };
        if (invitation.status === 'accepted') throw new TeamActionError('This invitation was already accepted. Remove the member instead.');
        await trx('workspaceInvitations').where({
            id: invitation.id
        }).update({
            status: 'revoked'
        });
        await audit(trx, invitation.workspaceId, 'invitation.revoked', input.actor, {
            reason,
            invitation: {
                id: invitation.id,
                role: invitation.role,
                previousStatus: invitation.status
            }
        });
        return {
            changed: true
        };
    });
}
async function transferWorkspaceOwnership(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$accounts$2f$staff$2d$reason$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeStaffReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const workspace = await lockWorkspace(trx, input.workspaceId);
        if (workspace.ownerId === input.newOwnerUserId) throw new TeamActionError('This person is already the Owner.');
        const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
            'm.workspaceId': input.workspaceId,
            'm.userId': input.newOwnerUserId
        }).first('m.role', 'u.emailVerified', 'u.deletionRequestedAt', 'u.suspendedAt');
        if (!member) throw new TeamActionError('This person is not a member of the workspace.');
        if (!member.emailVerified) throw new TeamActionError('The new Owner must verify their email first.');
        if (member.deletionRequestedAt) throw new TeamActionError('This person\'s account is being deleted.');
        if (member.suspendedAt) throw new TeamActionError('This person\'s account is suspended.');
        if (await trx('workspaces').where({
            ownerId: input.newOwnerUserId
        }).first('id')) throw new TeamActionError('This person already owns another workspace.');
        const previousOwnerUserId = workspace.ownerId;
        await trx('workspaceMemberships').where({
            workspaceId: input.workspaceId,
            userId: previousOwnerUserId
        }).update({
            role: 'admin'
        });
        await trx('workspaceMemberships').where({
            workspaceId: input.workspaceId,
            userId: input.newOwnerUserId
        }).update({
            role: 'owner'
        });
        await trx('workspaces').where({
            id: input.workspaceId
        }).update({
            ownerId: input.newOwnerUserId
        });
        const notice = {
            workspaceId: input.workspaceId,
            fromUserId: previousOwnerUserId,
            toUserId: input.newOwnerUserId
        };
        await trx('workspaceOwnershipNotices').insert([
            {
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                recipient: 'new_owner',
                ...notice
            },
            {
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                recipient: 'previous_owner',
                ...notice
            }
        ]);
        await audit(trx, input.workspaceId, 'ownership.transferred', input.actor, {
            reason,
            from: {
                userId: previousOwnerUserId,
                role: 'admin'
            },
            to: {
                userId: input.newOwnerUserId,
                previousRole: member.role
            }
        });
        return {
            previousOwnerUserId
        };
    });
}
}),
"[project]/packages/data/src/admin-audit.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendAdminAuditEvent",
    ()=>appendAdminAuditEvent,
    "hashAdminAuditEvent",
    ()=>hashAdminAuditEvent,
    "serializeAdminAuditRecord",
    ()=>serializeAdminAuditRecord,
    "verifyAdminAuditChain",
    ()=>verifyAdminAuditChain
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function canonicalize(value) {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).sort(([left], [right])=>left.localeCompare(right)).map(([key, nested])=>[
                key,
                canonicalize(nested)
            ]));
    }
    return value;
}
function eventPayload(event) {
    return {
        sequence: String(event.sequence),
        id: event.id,
        occurredAt: new Date(event.occurredAt).toISOString(),
        staffUserId: event.staffUserId,
        staffRole: event.staffRole,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        workspaceId: event.workspaceId,
        reason: event.reason,
        before: event.before,
        after: event.after,
        requestId: event.requestId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        prevHash: event.prevHash
    };
}
function hashAdminAuditEvent(event) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(canonicalize(eventPayload(event)))).digest('hex');
}
function serializeAdminAuditRecord(event) {
    return JSON.stringify(canonicalize({
        ...eventPayload(event),
        hash: event.hash
    }));
}
async function appendAdminAuditEvent(trx, input) {
    const occurredAt = input.occurredAt ?? new Date();
    if (!Number.isFinite(occurredAt.getTime())) throw new Error('Invalid audit event timestamp.');
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
        'admin:audit-chain'
    ]);
    const previous = await trx.withSchema('admin').table('auditEvents').orderBy('sequence', 'desc').first('hash');
    const sequenceResult = await trx.raw(`SELECT nextval(pg_get_serial_sequence('admin."auditEvents"', 'sequence'))::text AS sequence`);
    const sequence = sequenceResult.rows[0].sequence;
    const event = {
        sequence,
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        occurredAt,
        staffUserId: input.staffUserId,
        staffRole: input.staffRole,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        workspaceId: input.workspaceId ?? null,
        reason: input.reason ?? null,
        before: input.before ?? null,
        after: input.after ?? null,
        requestId: input.requestId?.trim() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        prevHash: previous?.hash ?? null
    };
    const hash = hashAdminAuditEvent(event);
    await trx.withSchema('admin').table('auditEvents').insert({
        ...event,
        hash
    });
    return {
        id: event.id,
        sequence,
        hash
    };
}
async function verifyAdminAuditChain(db, deadline) {
    const head = await db.withSchema('admin').table('auditEvents').orderBy('sequence', 'desc').first('sequence');
    const throughSequence = String(head?.sequence ?? '0');
    let previousHash = null;
    let cursor = '0';
    let checked = 0;
    for(;;){
        if (deadline !== undefined && Date.now() >= deadline) throw new Error('Audit chain verification timed out.');
        const events = await db.withSchema('admin').table('auditEvents').where('sequence', '>', cursor).where('sequence', '<=', throughSequence).orderBy('sequence', 'asc').limit(500).select([
            'sequence',
            'id',
            'occurredAt',
            'staffUserId',
            'staffRole',
            'action',
            'targetType',
            'targetId',
            'workspaceId',
            'reason',
            'before',
            'after',
            'requestId',
            'ipAddress',
            'userAgent',
            'prevHash',
            'hash'
        ]);
        if (!events.length) break;
        for (const event of events){
            checked++;
            const occurredAt = new Date(event.occurredAt);
            if (!Number.isFinite(occurredAt.getTime()) || event.prevHash !== previousHash || hashAdminAuditEvent({
                ...event,
                occurredAt
            }) !== event.hash) {
                return {
                    valid: false,
                    checked,
                    brokenSequence: String(event.sequence),
                    throughSequence
                };
            }
            previousHash = event.hash;
            cursor = String(event.sequence);
        }
    }
    if (cursor !== throughSequence) return {
        valid: false,
        checked,
        brokenSequence: throughSequence,
        throughSequence
    };
    return {
        valid: true,
        checked,
        headHash: previousHash,
        throughSequence
    };
}
}),
"[project]/packages/data/src/admin-invitations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT",
    ()=>ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT,
    "ADMIN_INVITATION_LIFETIME_MS",
    ()=>ADMIN_INVITATION_LIFETIME_MS,
    "AdminInvitationError",
    ()=>AdminInvitationError,
    "createBootstrapSuperAdminInvitation",
    ()=>createBootstrapSuperAdminInvitation
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$staff$2d$management$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/staff-management.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/admin-audit.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/workspaces/invitation-tokens.ts [app-rsc] (ecmascript)");
;
;
;
;
const ADMIN_INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT = 2;
class AdminInvitationError extends Error {
}
function normalizeStaffEmail(value) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$staff$2d$management$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["staffEmailSchema"].safeParse(value);
    if (!parsed.success) {
        throw new AdminInvitationError(`A staff invitation requires a @${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$staff$2d$management$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["staffEmailDomain"]} email address.`);
    }
    return parsed.data;
}
async function createBootstrapSuperAdminInvitation(db, input) {
    const email = normalizeStaffEmail(input.email);
    const now = input.now ?? new Date();
    if (!Number.isFinite(now.getTime())) throw new AdminInvitationError('Invalid invitation timestamp.');
    const expiresAt = new Date(now.getTime() + ADMIN_INVITATION_LIFETIME_MS);
    return db.transaction(async (trx)=>{
        await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
            'admin:bootstrap:super-admin'
        ]);
        await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
            `admin:staff-email:${email}`
        ]);
        const activeRoles = await trx.raw(`
      SELECT lower(staff."email") AS email
      FROM admin."staffRoleAssignments" AS assignment
      JOIN admin."staffUsers" AS staff ON staff."id" = assignment."userId"
      WHERE assignment."role" = 'super_admin'
        AND assignment."revokedAt" IS NULL
    `);
        const activeSuperAdmins = new Set(activeRoles.rows.map((row)=>row.email));
        const bootstrapInvitations = await trx.withSchema('admin').table('staffInvitations').whereNull('invitedBy').andWhere({
            role: 'super_admin'
        }).select('email');
        const bootstrapEmails = new Set(bootstrapInvitations.map((invitation)=>invitation.email.toLowerCase()));
        const pendingSuperAdminInvitations = await trx.withSchema('admin').table('staffInvitations').where({
            role: 'super_admin'
        }).whereNull('acceptedAt').whereNull('revokedAt').where('expiresAt', '>', now).select('email');
        const liveSuperAdminEmails = new Set([
            ...activeSuperAdmins,
            ...pendingSuperAdminInvitations.map((invitation)=>invitation.email.toLowerCase())
        ]);
        const existingStaff = await trx.withSchema('admin').table('staffUsers').whereRaw('lower("email") = ?', [
            email
        ]).first('id');
        if (existingStaff) throw new AdminInvitationError('A staff account already exists for this email.');
        const priorInvitations = await trx.withSchema('admin').table('staffInvitations').whereRaw('lower("email") = ?', [
            email
        ]).select('acceptedAt', 'revokedAt', 'expiresAt');
        if (priorInvitations.some((invitation)=>invitation.acceptedAt)) {
            throw new AdminInvitationError('An invitation for this email has already been accepted.');
        }
        if (priorInvitations.some((invitation)=>!invitation.revokedAt && new Date(invitation.expiresAt).getTime() > now.getTime())) {
            throw new AdminInvitationError('An active invitation already exists for this email.');
        }
        if (liveSuperAdminEmails.size >= ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT && !liveSuperAdminEmails.has(email)) {
            throw new AdminInvitationError('Two Super Admins are already active or invited.');
        }
        if (bootstrapEmails.size >= ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT && !bootstrapEmails.has(email)) {
            throw new AdminInvitationError('The initial Super Admin bootstrap limit has been reached.');
        }
        const { token, tokenHash } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["newInvitationToken"])();
        const invitationId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx.withSchema('admin').table('staffInvitations').insert({
            id: invitationId,
            email,
            role: 'super_admin',
            tokenHash,
            invitedBy: null,
            createdAt: now,
            expiresAt
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendAdminAuditEvent"])(trx, {
            staffUserId: null,
            staffRole: 'bootstrap',
            action: 'staff.bootstrap_invitation.created',
            targetType: 'staff_invitation',
            targetId: invitationId,
            after: {
                role: 'super_admin',
                expiresAt: expiresAt.toISOString()
            }
        });
        return {
            id: invitationId,
            token,
            expiresAt
        };
    });
}
}),
"[project]/packages/data/src/job-notification-settings/policy.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "effectiveJobNotificationPolicy",
    ()=>effectiveJobNotificationPolicy,
    "jobNotificationDefaults",
    ()=>jobNotificationDefaults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/job-notification-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
;
;
const jobNotificationDefaults = {
    deadline: {
        mode: 'unset'
    },
    reminders: {
        sendTime: '09:00',
        offsets: [
            {
                id: 'due',
                relative: 'on',
                days: 0
            }
        ],
        extraRecipientIds: []
    },
    events: {
        created: true,
        status: true,
        assignment: true,
        schedule: true,
        deadline: true,
        approaching: true,
        overdue: true
    }
};
async function effectiveJobNotificationPolicy(trx, workspaceId) {
    const rows = await trx('jobNotificationSettings').where({
        workspaceId
    }).whereIn('section', [
        'reminders',
        'events'
    ]);
    const { plan } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, workspaceId);
    const saved = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deadlineReminderRuleSchema"].parse(rows.find((row)=>row.section === 'reminders')?.values ?? jobNotificationDefaults.reminders);
    return {
        reminders: plan.id === 'premium' ? saved : {
            ...jobNotificationDefaults.reminders,
            sendTime: saved.sendTime
        },
        events: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobEventEmailRulesSchema"].parse(plan.id === 'premium' ? rows.find((row)=>row.section === 'events')?.values ?? jobNotificationDefaults.events : jobNotificationDefaults.events)
    };
}
}),
"[project]/packages/data/src/job-notification-settings/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobNotificationSettingsConflict",
    ()=>JobNotificationSettingsConflict,
    "JobNotificationSettingsInvalid",
    ()=>JobNotificationSettingsInvalid,
    "readJobNotificationSettings",
    ()=>readJobNotificationSettings,
    "saveJobNotificationSettings",
    ()=>saveJobNotificationSettings
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/job-notification-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/job-notification-settings/policy.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class JobNotificationSettingsConflict extends Error {
}
class JobNotificationSettingsInvalid extends Error {
}
;
const managerRole = (c)=>c.membership.role === 'owner' || c.membership.role === 'admin';
function requireAccess(c, write = false) {
    if (!managerRole(c) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
        permission: 'settings.business.read'
    }).allowed || write && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
        permission: 'settings.business.update'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
async function snapshot(trx, c) {
    const rows = await trx('jobNotificationSettings').where({
        workspaceId: c.workspaceId
    });
    const row = (section)=>rows.find((r)=>r.section === section);
    const deadline = row('deadline'), reminders = row('reminders'), events = row('events');
    const { plan } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, c.workspaceId);
    const workspace = await trx('workspaces').where({
        id: c.workspaceId
    }).first('timezone');
    const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [
        workspace.timezone
    ])).rows[0];
    const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', c.workspaceId).whereNull('u.deletionRequestedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
    const savedReminders = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deadlineReminderRuleSchema"].parse(reminders?.values ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"].reminders);
    // Retain Premium drafts in storage across downgrade, but never grant them effective plan access.
    savedReminders.extraRecipientIds = savedReminders.extraRecipientIds.filter((id)=>members.some((m)=>m.id === id));
    const effectiveReminders = plan.id === 'premium' ? savedReminders : {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"].reminders,
        sendTime: savedReminders.sendTime
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationSettingsSnapshotSchema"].parse({
        today,
        plan: plan.id,
        timezone: workspace.timezone,
        canManage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(c, {
            permission: 'settings.business.update'
        }).allowed,
        activation: 'reminders-active',
        members,
        deadline: {
            revision: String(deadline?.version ?? 0),
            values: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultDeadlineRuleSchema"].parse(deadline?.values ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"].deadline)
        },
        reminders: {
            revision: String(reminders?.version ?? 0),
            values: effectiveReminders
        },
        events: {
            revision: String(events?.version ?? 0),
            values: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobEventEmailRulesSchema"].parse(plan.id === 'premium' ? events?.values ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"].events : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"].events)
        }
    });
}
async function readJobNotificationSettings(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, c)=>{
        requireAccess(c);
        return snapshot(trx, c);
    });
}
async function saveJobNotificationSettings(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2d$notification$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveJobNotificationSettingsSchema"].safeParse(raw);
    if (!parsed.success) throw new JobNotificationSettingsInvalid();
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, c)=>{
        requireAccess(c, true);
        const current = await snapshot(trx, c);
        if (input.section === 'events' && current.plan !== 'premium') throw new JobNotificationSettingsInvalid();
        if (input.section === 'reminders') {
            const r = input.values;
            if (current.plan !== 'premium' && (r.offsets.length !== 1 || r.offsets[0].relative !== 'on' || r.offsets[0].days !== 0 || r.extraRecipientIds.length)) throw new JobNotificationSettingsInvalid();
            if (r.extraRecipientIds.some((id)=>!current.members.some((m)=>m.id === id))) throw new JobNotificationSettingsInvalid();
        }
        const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(input)).digest('hex');
        const receipt = await trx('jobNotificationSettingsAudit').where({
            workspaceId: c.workspaceId,
            submissionId: input.submissionId
        }).first();
        if (receipt) {
            if (receipt.actorId !== c.userId || receipt.requestHash !== requestHash) throw new JobNotificationSettingsConflict();
            if (Number(current[input.section].revision) !== receipt.afterVersion) throw new JobNotificationSettingsConflict();
            return current;
        }
        const previous = current[input.section];
        if (input.revision !== previous.revision) throw new JobNotificationSettingsConflict();
        const stored = await trx('jobNotificationSettings').where({
            workspaceId: c.workspaceId,
            section: input.section
        }).first('values');
        const version = Number(previous.revision) + 1;
        await trx('jobNotificationSettings').insert({
            workspaceId: c.workspaceId,
            section: input.section,
            values: JSON.stringify(input.values),
            version
        }).onConflict([
            'workspaceId',
            'section'
        ]).merge({
            values: JSON.stringify(input.values),
            version,
            updatedAt: trx.fn.now()
        });
        await trx('jobNotificationSettingsAudit').insert({
            workspaceId: c.workspaceId,
            submissionId: input.submissionId,
            actorId: c.userId,
            section: input.section,
            requestHash,
            beforeVersion: Number(previous.revision),
            afterVersion: version,
            beforeValues: JSON.stringify(stored?.values ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationDefaults"][input.section]),
            afterValues: JSON.stringify(input.values)
        });
        return snapshot(trx, c);
    });
}
}),
"[project]/packages/data/src/notifications/job-access.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readableNotificationJobs",
    ()=>readableNotificationJobs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
;
function readableNotificationJobs(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const query = trx('jobs as j').where('j.workspaceId', context.workspaceId);
    if (!scope.allowed || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) return query.whereRaw('false');
    if (scope.scope === 'assigned') query.where((q)=>q.where('j.primaryOwnerId', context.userId).orWhereExists(trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('t."workspaceId"=j."workspaceId" AND t."jobId"=j.id').where('t.userId', context.userId)));
    return query;
}
}),
"[project]/packages/data/src/notifications/jobs.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jobNotificationQuery",
    ()=>jobNotificationQuery,
    "notifyJobAssignmentChanged",
    ()=>notifyJobAssignmentChanged,
    "notifyJobCreated",
    ()=>notifyJobCreated,
    "notifyJobDeadlineChanged",
    ()=>notifyJobDeadlineChanged,
    "notifyJobStatusChanged",
    ()=>notifyJobStatusChanged,
    "processJobEmails",
    ()=>processJobEmails,
    "readJobNotifications",
    ()=>readJobNotifications
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/job-notification-settings/policy.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/job-access.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const deadlineDates = `to_char(n."beforeDeadline",'YYYY-MM-DD') AS "beforeDeadline", to_char(n."afterDeadline",'YYYY-MM-DD') AS "afterDeadline"`;
function jobNotificationQuery(trx, context) {
    // Only proven removals get the membership-only exception. All other events require current Job read.
    return trx('jobNotifications as n').where('n.workspaceId', context.workspaceId).where('n.userId', context.userId).where((q)=>q.whereExists((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(trx, context).select(trx.raw('1')).whereRaw('j.id=n."jobId"')).orWhere({
            'n.event': 'assignment',
            'n.assignmentChange': 'removed'
        }));
}
async function readJobNotifications(trx, context, take) {
    const query = jobNotificationQuery(trx, context);
    const unread = Number((await query.clone().whereNull('n.readAt').count({
        count: 'n.id'
    }).first())?.count ?? 0);
    const rows = await query.select('n.*', trx.raw(deadlineDates)).orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
    const items = await Promise.all(rows.map(async (row)=>{
        const common = {
            kind: 'job',
            id: row.id,
            createdAt: new Date(row.createdAt).toISOString(),
            read: !!row.readAt
        };
        const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(trx, context).where('j.id', row.jobId).first('j.id', 'j.title', 'j.jobNumber');
        if (!job) {
            if (row.event !== 'assignment' || row.assignmentChange !== 'removed') throw new Error('Unauthorized Job notification projection.');
            return {
                ...common,
                event: 'assignment',
                access: 'ended',
                change: 'removed',
                jobNumber: row.jobNumberSnapshot
            };
        }
        const base = {
            ...common,
            actorName: row.actorName,
            jobId: job.id,
            jobNumber: `J-${String(job.jobNumber).padStart(4, '0')}`,
            jobTitle: job.title
        };
        if (row.event === 'deadline') return {
            ...base,
            event: 'deadline',
            before: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(row.beforeDeadline),
            after: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(row.afterDeadline),
            timezone: row.deadlineTimezone
        };
        if (row.event === 'assignment') return {
            ...base,
            event: 'assignment',
            access: 'current',
            change: assignmentChange(row.assignmentChange)
        };
        return row.event === 'created' ? {
            ...base,
            event: 'created'
        } : {
            ...base,
            event: 'status',
            before: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(row.beforeStatus),
            after: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(row.afterStatus)
        };
    }));
    return {
        unread,
        items
    };
}
function assignmentChange(value) {
    if (value !== 'primary' && value !== 'team' && value !== 'updated' && value !== 'removed') throw new Error('Invalid assignment event.');
    return value;
}
async function enqueueJobEvent(trx, context, jobId, operationId, change) {
    const job = await trx('jobs').where({
        workspaceId: context.workspaceId,
        id: jobId
    }).first('primaryOwnerId');
    if (!job) throw new Error('Job notification requires an existing record in this transaction.');
    const team = await trx('jobTeamMembers').where({
        workspaceId: context.workspaceId,
        jobId
    }).pluck('userId');
    const actor = await trx('users').where({
        id: context.userId
    }).first('name');
    for (const userId of new Set([
        ...team,
        ...job.primaryOwnerId ? [
            job.primaryOwnerId
        ] : []
    ])){
        if (userId === context.userId) continue;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, {
                workspaceId: context.workspaceId,
                userId
            }, context.enabledPermissions, false, async (nested, recipient)=>{
                if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(nested, recipient).where('j.id', jobId).first('j.id')) return;
                await nested('jobNotifications').insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: context.workspaceId,
                    jobId,
                    operationId,
                    userId,
                    event: change.event,
                    ...change.event === 'deadline' ? {
                        beforeDeadline: change.before,
                        afterDeadline: change.after,
                        deadlineTimezone: change.timezone
                    } : {},
                    ...change.event === 'status' ? {
                        beforeStatus: change.before,
                        afterStatus: change.after
                    } : {},
                    actorId: context.userId,
                    actorName: actor?.name ?? ''
                }).onConflict([
                    'workspaceId',
                    'operationId',
                    'event',
                    'userId'
                ]).ignore();
            });
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        }
    }
}
async function notifyJobCreated(trx, context, jobId, operationId) {
    return enqueueJobEvent(trx, context, jobId, operationId, {
        event: 'created'
    });
}
async function notifyJobStatusChanged(trx, context, jobId, operationId, before, after) {
    if (before === after) return;
    return enqueueJobEvent(trx, context, jobId, operationId, {
        event: 'status',
        before: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(before),
        after: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(after)
    });
}
async function notifyJobDeadlineChanged(trx, context, jobId, operationId, before, after) {
    before = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(before);
    after = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(after);
    if (before === after) return;
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).first('timezone');
    new Intl.DateTimeFormat('en-US', {
        timeZone: workspace.timezone
    }).format();
    return enqueueJobEvent(trx, context, jobId, operationId, {
        event: 'deadline',
        before,
        after,
        timezone: workspace.timezone
    });
}
async function notifyJobAssignmentChanged(trx, context, jobId, operationId, before, after) {
    const role = (assignment, id)=>assignment.primaryOwnerId === id ? 'primary' : assignment.teamUserIds.includes(id) ? 'team' : 'none';
    const recipients = new Set([
        ...before.teamUserIds,
        ...after.teamUserIds,
        before.primaryOwnerId,
        after.primaryOwnerId
    ].filter((id)=>!!id));
    if ([
        ...recipients
    ].every((id)=>role(before, id) === role(after, id))) return;
    const job = await trx('jobs').where({
        workspaceId: context.workspaceId,
        id: jobId
    }).first('jobNumber');
    if (!job) throw new Error('Assignment notice requires an existing Job.');
    const actor = await trx('users').where({
        id: context.userId
    }).first('name');
    for (const userId of recipients){
        if (userId === context.userId) continue;
        const from = role(before, userId), to = role(after, userId);
        const change = to === 'none' ? 'removed' : from === to ? 'updated' : to;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, {
                workspaceId: context.workspaceId,
                userId
            }, context.enabledPermissions, false, async (nested, recipient)=>{
                if (change !== 'removed' && !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(nested, recipient).where('j.id', jobId).first('j.id')) return;
                await nested('jobNotifications').insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: context.workspaceId,
                    jobId,
                    operationId,
                    userId,
                    event: 'assignment',
                    assignmentChange: change,
                    beforeAssignment: from,
                    afterAssignment: to,
                    jobNumberSnapshot: `J-${String(job.jobNumber).padStart(4, '0')}`,
                    actorId: context.userId,
                    actorName: actor?.name ?? ''
                }).onConflict([
                    'workspaceId',
                    'operationId',
                    'event',
                    'userId'
                ]).ignore();
            });
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        }
    }
}
async function processJobEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
    const summary = {
        sent: 0,
        skipped: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db('jobNotifications'), 'jobNotifications.workspaceId').where({
        emailStatus: 'queued'
    }).where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
    for (const candidate of candidates)try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
            workspaceId: candidate.workspaceId,
            userId: candidate.userId
        }, enabled, false, async (trx, context)=>{
            const row = await trx('jobNotifications as n').select('n.*', trx.raw(deadlineDates)).where({
                'n.id': candidate.id,
                emailStatus: 'queued'
            }).where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first();
            if (!row) return;
            const now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
            const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(trx, context).where('j.id', row.jobId).select('j.id', 'j.jobNumber', 'j.title', 'j.primaryOwnerId').first();
            const onTeam = job && (job.primaryOwnerId === context.userId || !!await trx('jobTeamMembers').where({
                workspaceId: context.workspaceId,
                jobId: job.id,
                userId: context.userId
            }).first('userId'));
            const user = await trx('users').where({
                id: context.userId
            }).first('email', 'emailVerified').forShare();
            const preferences = await trx('notificationPreferences').where({
                userId: context.userId
            }).first('jobActivityEmail');
            const policy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveJobNotificationPolicy"])(trx, context.workspaceId);
            const removal = row.event === 'assignment' && row.assignmentChange === 'removed';
            if (!removal && (!job || !onTeam) || row.actorId === context.userId || !user?.emailVerified || preferences?.jobActivityEmail === false || !policy.events[row.event] || new Date(row.createdAt).getTime() < now.getTime() - 23 * 60 * 60 * 1000) {
                await trx('jobNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'skipped'
                });
                summary.skipped++;
                return;
            }
            const workspace = await trx('workspaces').where({
                id: context.workspaceId
            }).first('businessName');
            const attempts = row.attempts + 1;
            try {
                const common = {
                    id: row.id,
                    to: user.email,
                    workspaceId: context.workspaceId,
                    workspaceName: workspace.businessName
                };
                if (row.event === 'assignment' && !job) {
                    // Do not pass a raw outbox/Job/actor snapshot into the limited email branch.
                    await send({
                        ...common,
                        actorName: '',
                        event: 'assignment',
                        access: 'ended',
                        change: 'removed',
                        job: {
                            number: row.jobNumberSnapshot
                        }
                    });
                } else {
                    if (!job) throw new Error('Missing authorized Job projection.');
                    await send({
                        ...common,
                        actorName: row.actorName,
                        job: {
                            id: job.id,
                            number: `J-${String(job.jobNumber).padStart(4, '0')}`,
                            title: job.title
                        },
                        ...row.event === 'deadline' ? {
                            event: 'deadline',
                            before: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(row.beforeDeadline),
                            after: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable().parse(row.afterDeadline),
                            timezone: row.deadlineTimezone
                        } : row.event === 'assignment' ? {
                            event: 'assignment',
                            access: 'current',
                            change: assignmentChange(row.assignmentChange)
                        } : row.event === 'status' ? {
                            event: 'status',
                            before: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(row.beforeStatus),
                            after: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatusSchema"].parse(row.afterStatus)
                        } : {
                            event: 'created'
                        }
                    });
                }
                await trx('jobNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'sent',
                    attempts,
                    sentAt: now
                });
                summary.sent++;
            } catch  {
                const failed = attempts >= 5;
                summary[failed ? 'failed' : 'retryPending']++;
                await trx('jobNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: failed ? 'failed' : 'queued',
                    attempts,
                    nextAttemptAt: new Date(now.getTime() + 60000 * 2 ** (attempts - 1))
                });
            }
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
        if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        await db('jobNotifications').where({
            id: candidate.id,
            emailStatus: 'queued'
        }).update({
            emailStatus: 'skipped'
        });
        summary.skipped++;
    }
    return summary;
}
}),
"[project]/packages/data/src/notifications/deadlines.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deadlineNotificationQuery",
    ()=>deadlineNotificationQuery,
    "processDeadlineEmails",
    ()=>processDeadlineEmails,
    "readDeadlineNotifications",
    ()=>readDeadlineNotifications,
    "scheduleDeadlineReminders",
    ()=>scheduleDeadlineReminders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/job-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$reminders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/reminders.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/job-notification-settings/policy.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const jobDates = `to_char(j."completionDeadline",'YYYY-MM-DD') AS "completionDeadline"`;
const noticeDates = `to_char(n."completionDeadline",'YYYY-MM-DD') AS "completionDeadline", to_char(n."reminderDate",'YYYY-MM-DD') AS "reminderDate"`;
function deadlineNotificationQuery(trx, context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(trx, context).join('deadlineNotifications as n', function() {
        this.on('n.jobId', 'j.id').andOn('n.workspaceId', 'j.workspaceId');
    }).where('n.userId', context.userId);
}
async function readDeadlineNotifications(trx, context, take) {
    const query = deadlineNotificationQuery(trx, context);
    const unread = Number((await query.clone().whereNull('n.readAt').count({
        count: 'n.id'
    }).first())?.count ?? 0);
    const rows = await query.select('n.id', 'n.event', 'n.jobId', 'j.jobNumber', 'j.title', 'n.timezone', 'n.createdAt', 'n.readAt', trx.raw(noticeDates)).orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
    return {
        unread,
        items: rows.map((row)=>({
                kind: 'deadline',
                id: row.id,
                event: row.event,
                jobId: row.jobId,
                jobNumber: `J-${String(row.jobNumber).padStart(4, '0')}`,
                jobTitle: row.title,
                completionDeadline: row.completionDeadline,
                reminderDate: row.reminderDate,
                timezone: row.timezone,
                createdAt: new Date(row.createdAt).toISOString(),
                read: !!row.readAt
            }))
    };
}
async function recipients(trx, workspaceId, job, extra) {
    const team = await trx('jobTeamMembers').where({
        workspaceId,
        jobId: job.id
    }).pluck('userId');
    return new Set([
        ...team,
        ...extra,
        ...job.primaryOwnerId ? [
            job.primaryOwnerId
        ] : []
    ]);
}
async function databaseNow(trx) {
    return new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
}
async function scheduleDeadlineReminders(db, enabled) {
    let created = 0, failed = 0;
    const workspaces = await db('workspaces').whereNull('deletionRequestedAt').whereNull('suspendedAt').select('id', 'ownerId');
    for (const workspace of workspaces){
        try {
            const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
                workspaceId: workspace.id,
                userId: workspace.ownerId
            }, enabled, true, async (trx, owner)=>{
                const { timezone } = await trx('workspaces').where({
                    id: workspace.id
                }).first('timezone');
                const now = await databaseNow(trx), clock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$reminders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reminderClock"])(now, timezone);
                const policy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveJobNotificationPolicy"])(trx, workspace.id);
                if (clock.time < policy.reminders.sendTime) return 0;
                let added = 0;
                for (const offset of policy.reminders.offsets){
                    const deadline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$reminders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reminderDeadlineForDate"])(clock.date, offset.relative, offset.days), offsetKey = `${offset.relative}:${offset.days}`;
                    const jobs = await trx('jobs as j').where('j.workspaceId', workspace.id).where('j.completionDeadline', deadline).whereNotIn('j.status', [
                        'completed',
                        'canceled'
                    ]).select('j.id', 'j.primaryOwnerId', 'j.reminderRevision');
                    for (const job of jobs)for (const userId of (await recipients(trx, workspace.id, job, policy.reminders.extraRecipientIds))){
                        try {
                            added += await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, {
                                workspaceId: workspace.id,
                                userId
                            }, owner.enabledPermissions, false, async (nested, context)=>{
                                if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(nested, context).where('j.id', job.id).first('j.id')) return 0;
                                const event = offset.relative === 'before' ? 'approaching' : offset.relative === 'after' ? 'overdue' : 'due';
                                const row = await nested('deadlineNotifications').insert({
                                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                                    workspaceId: workspace.id,
                                    jobId: job.id,
                                    userId,
                                    reminderRevision: job.reminderRevision,
                                    offsetKey,
                                    completionDeadline: deadline,
                                    reminderDate: clock.date,
                                    timezone,
                                    event,
                                    createdAt: now,
                                    nextAttemptAt: now
                                }).onConflict([
                                    'workspaceId',
                                    'jobId',
                                    'reminderRevision',
                                    'offsetKey',
                                    'userId'
                                ]).ignore().returning('id');
                                return row.length;
                            });
                        } catch (error) {
                            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
                        }
                    }
                }
                return added;
            });
            created += count;
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) failed++;
        }
    }
    return {
        created,
        failed
    };
}
async function processDeadlineEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
    const summary = {
        sent: 0,
        skipped: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db('deadlineNotifications'), 'deadlineNotifications.workspaceId').where({
        emailStatus: 'queued'
    }).where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
    for (const candidate of candidates)try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
            workspaceId: candidate.workspaceId,
            userId: candidate.userId
        }, enabled, false, async (trx, context)=>{
            const row = await trx('deadlineNotifications as n').where({
                id: candidate.id,
                emailStatus: 'queued'
            }).where('nextAttemptAt', '<=', trx.fn.now()).select('n.*', trx.raw(noticeDates)).forUpdate().skipLocked().first();
            if (!row) return;
            const now = await databaseNow(trx);
            const workspace = await trx('workspaces').where({
                id: context.workspaceId
            }).first('businessName', 'timezone');
            const clock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$reminders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reminderClock"])(now, workspace.timezone);
            const policy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveJobNotificationPolicy"])(trx, context.workspaceId);
            const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$job$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readableNotificationJobs"])(trx, context).where('j.id', row.jobId).select('j.id', 'j.jobNumber', 'j.title', 'j.status', 'j.primaryOwnerId', 'j.reminderRevision', trx.raw(jobDates)).first();
            const user = await trx('users').where({
                id: context.userId
            }).first('email', 'emailVerified').forShare();
            const preference = await trx('notificationPreferences').where({
                userId: context.userId
            }).first('deadlineReminderEmail');
            const offset = policy.reminders.offsets.find((o)=>`${o.relative}:${o.days}` === row.offsetKey);
            const eligible = job && ![
                'completed',
                'canceled'
            ].includes(job.status) && job.reminderRevision === row.reminderRevision && job.completionDeadline === row.completionDeadline && row.reminderDate === clock.date && row.timezone === workspace.timezone && offset && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$reminders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reminderDeadlineForDate"])(clock.date, offset.relative, offset.days) === job.completionDeadline && (await recipients(trx, context.workspaceId, job, policy.reminders.extraRecipientIds)).has(context.userId);
            if (!eligible || !user?.emailVerified || preference?.deadlineReminderEmail === false || !policy.events[row.event === 'overdue' ? 'overdue' : 'approaching']) {
                await trx('deadlineNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'skipped'
                });
                summary.skipped++;
                return;
            }
            // A later send time may have been saved after enqueue. Keep the row for today's later sweep.
            if (clock.time < policy.reminders.sendTime) return;
            const attempts = row.attempts + 1;
            try {
                await send({
                    id: row.id,
                    to: user.email,
                    workspaceId: context.workspaceId,
                    workspaceName: workspace.businessName,
                    job: {
                        id: job.id,
                        number: `J-${String(job.jobNumber).padStart(4, '0')}`,
                        title: job.title
                    },
                    completionDeadline: row.completionDeadline,
                    reminderDate: row.reminderDate,
                    timezone: workspace.timezone
                });
                await trx('deadlineNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'sent',
                    attempts,
                    sentAt: now
                });
                summary.sent++;
            } catch  {
                const failed = attempts >= 5;
                summary[failed ? 'failed' : 'retryPending']++;
                await trx('deadlineNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: failed ? 'failed' : 'queued',
                    attempts,
                    nextAttemptAt: new Date(now.getTime() + 60000 * 2 ** (attempts - 1))
                });
            }
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
        if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        await db('deadlineNotifications').where({
            id: candidate.id,
            emailStatus: 'queued'
        }).update({
            emailStatus: 'skipped'
        });
        summary.skipped++;
    }
    return summary;
}
}),
"[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canReadVisitNotifications",
    ()=>canReadVisitNotifications,
    "notifyVisitChange",
    ()=>notifyVisitChange,
    "processVisitEmails",
    ()=>processVisitEmails,
    "projectVisitNotification",
    ()=>projectVisitNotification,
    "visitNotificationQuery",
    ()=>visitNotificationQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/job-notification-settings/policy.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
function jobs(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const q = trx('jobs as j').where('j.workspaceId', context.workspaceId);
    if (!scope.allowed || ![
        'workspace',
        'assigned'
    ].includes(scope.scope)) return q.whereRaw('false');
    if (scope.scope === 'assigned') q.where((b)=>b.where('j.primaryOwnerId', context.userId).orWhereExists(trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('t."workspaceId"=j."workspaceId" AND t."jobId"=j.id').where('t.userId', context.userId)));
    return q;
}
function orders(trx, context) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoped"])(trx, context).whereNull('w.archivedAt').whereNot('w.status', 'draft');
    } catch (e) {
        if (!(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw e;
        return trx('workOrders as w').whereRaw('false');
    }
}
function canReadVisitNotifications(context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read').allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read').allowed;
}
function visitNotificationQuery(trx, context) {
    return trx('visitNotifications as n').where({
        'n.workspaceId': context.workspaceId,
        'n.userId': context.userId
    }).whereExists(trx('visitNotificationRecords as r').select(trx.raw('1')).whereRaw('r."notificationId"=n.id AND r."workspaceId"=n."workspaceId"').where((q)=>q.whereExists(jobs(trx, context).select(trx.raw('1')).whereRaw('j.id=r."jobId"')).orWhereExists(orders(trx, context).select(trx.raw('1')).whereRaw('w.id=r."workOrderId"'))));
}
async function accessible(trx, context, refs) {
    const records = [];
    for (const ref of refs){
        const row = ref.type === 'job' ? await jobs(trx, context).where('j.id', ref.id).select('j.id', 'j.title', 'j.jobNumber as number').first() : await orders(trx, context).where('w.id', ref.id).select('w.id', 'w.title', 'w.workOrderNumber as number').first();
        if (row) records.push({
            type: ref.type,
            id: row.id,
            number: `${ref.type === 'job' ? 'J' : 'WO'}-${String(row.number).padStart(4, '0')}`,
            title: row.title
        });
    }
    return records.sort((a, b)=>a.type.localeCompare(b.type) || a.number.localeCompare(b.number, "en", {
            numeric: true
        }) || a.id.localeCompare(b.id));
}
async function projectVisitNotification(trx, context, row) {
    const refs = await trx('visitNotificationRecords').where({
        workspaceId: context.workspaceId,
        notificationId: row.id
    });
    const records = await accessible(trx, context, refs.map((r)=>({
            type: r.jobId ? 'job' : 'work_order',
            id: r.jobId ?? r.workOrderId
        })));
    return records.length ? {
        kind: 'visit',
        id: row.id,
        event: row.event,
        actorName: row.actorName,
        before: row.before,
        after: row.after,
        timezone: row.timezone,
        records,
        createdAt: new Date(row.createdAt).toISOString(),
        read: !!row.readAt
    } : null;
}
async function notifyVisitChange(trx, context, operationId, event, refs, before, after) {
    if (JSON.stringify(before) === JSON.stringify(after) && ![
        'joined',
        'separated'
    ].includes(event)) return;
    const recipients = new Set();
    const eligible = [];
    for (const ref of refs){
        if (ref.type === 'job') {
            const row = await trx('jobs').where({
                workspaceId: context.workspaceId,
                id: ref.id
            }).first('primaryOwnerId');
            if (!row) continue;
            eligible.push(ref);
            if (row.primaryOwnerId) recipients.add(row.primaryOwnerId);
            (await trx('jobTeamMembers').where({
                workspaceId: context.workspaceId,
                jobId: ref.id
            }).pluck('userId')).forEach((id)=>recipients.add(id));
        } else {
            const row = await trx('workOrders').where({
                workspaceId: context.workspaceId,
                id: ref.id
            }).whereNot('status', 'draft').whereNull('archivedAt').first('primaryAssigneeId');
            if (!row) continue;
            eligible.push(ref);
            if (row.primaryAssigneeId) recipients.add(row.primaryAssigneeId);
            (await trx('workOrderCrew').where({
                workspaceId: context.workspaceId,
                workOrderId: ref.id
            }).pluck('userId')).forEach((id)=>recipients.add(id));
        }
    }
    const actor = await trx('users').where({
        id: context.userId
    }).first('name'), workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).first('timezone');
    for (const userId of recipients){
        if (userId === context.userId) continue;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, {
                workspaceId: context.workspaceId,
                userId
            }, context.enabledPermissions, false, async (nested, recipient)=>{
                const records = await accessible(nested, recipient, eligible);
                if (!records.length) return;
                const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
                const inserted = await nested('visitNotifications').insert({
                    id,
                    workspaceId: context.workspaceId,
                    userId,
                    operationId,
                    event,
                    actorName: actor.name,
                    before: JSON.stringify(before),
                    after: JSON.stringify(after),
                    timezone: workspace.timezone
                }).onConflict([
                    'workspaceId',
                    'operationId',
                    'userId'
                ]).ignore().returning('id');
                if (inserted.length) await nested('visitNotificationRecords').insert(records.map((r)=>({
                        workspaceId: context.workspaceId,
                        notificationId: id,
                        [r.type === 'job' ? 'jobId' : 'workOrderId']: r.id
                    })));
            });
        } catch (e) {
            if (!(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw e;
        }
    }
}
async function processVisitEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
    const summary = {
        sent: 0,
        skipped: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db('visitNotifications'), 'visitNotifications.workspaceId').where({
        emailStatus: 'queued'
    }).where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
    for (const candidate of candidates)try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
            workspaceId: candidate.workspaceId,
            userId: candidate.userId
        }, enabled, false, async (trx, context)=>{
            const row = await trx('visitNotifications').where({
                id: candidate.id,
                emailStatus: 'queued'
            }).where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first();
            if (!row) return;
            const notice = await projectVisitNotification(trx, context, row);
            const user = await trx('users').where({
                id: context.userId
            }).first('email', 'emailVerified');
            const preference = await trx('notificationPreferences').where({
                userId: context.userId
            }).first('visitChangedEmail');
            const policy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["effectiveJobNotificationPolicy"])(trx, context.workspaceId);
            if (!policy.events.schedule || !notice || !user.emailVerified || preference?.visitChangedEmail === false || new Date(row.createdAt).getTime() < Date.now() - 23 * 60 * 60 * 1000) {
                await trx('visitNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'skipped'
                });
                summary.skipped++;
                return;
            }
            const workspace = await trx('workspaces').where({
                id: context.workspaceId
            }).first('businessName');
            const attempts = row.attempts + 1;
            try {
                await send({
                    ...notice,
                    to: user.email,
                    workspaceId: context.workspaceId,
                    workspaceName: workspace.businessName
                });
                await trx('visitNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: 'sent',
                    attempts,
                    sentAt: trx.fn.now()
                });
                summary.sent++;
            } catch  {
                const failed = attempts >= 5;
                summary[failed ? 'failed' : 'retryPending']++;
                await trx('visitNotifications').where({
                    id: row.id
                }).update({
                    emailStatus: failed ? 'failed' : 'queued',
                    attempts,
                    nextAttemptAt: new Date(Date.now() + 60000 * 2 ** (attempts - 1))
                });
            }
        });
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
        if (!(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw e;
        await db('visitNotifications').where({
            id: candidate.id,
            emailStatus: 'queued'
        }).update({
            emailStatus: 'skipped'
        });
        summary.skipped++;
    }
    return summary;
}
}),
"[project]/packages/data/src/notifications/estimates.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canReadEstimateNotifications",
    ()=>canReadEstimateNotifications,
    "estimateNotificationQuery",
    ()=>estimateNotificationQuery,
    "notifyEstimateRecipients",
    ()=>notifyEstimateRecipients,
    "processEstimateNotificationEmails",
    ()=>processEstimateNotificationEmails,
    "scheduleEstimateReminders",
    ()=>scheduleEstimateReminders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/notifications.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
;
;
;
;
;
function hasEstimateReadScope(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    return scope.allowed && scope.resourceKind === "estimate" && [
        "workspace",
        "assigned_job"
    ].includes(scope.scope);
}
function constrainEstimateRead(query, trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    if (!scope.allowed || scope.resourceKind !== "estimate" || ![
        "workspace",
        "assigned_job"
    ].includes(scope.scope)) {
        query.whereRaw("false");
        return query;
    }
    query.where("e.workspaceId", context.workspaceId).whereNull("e.archivedAt").whereNot("e.status", "superseded").whereNotExists(trx("estimates as newer").select(trx.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId"
          AND newer."estimateNumber" = e."estimateNumber"
          AND newer.revision > e.revision`));
    if (scope.scope === "assigned_job") {
        query.where("e.parentType", "job").whereExists(trx("jobs as scoped_job").select(trx.raw("1")).whereRaw(`scoped_job."workspaceId" = e."workspaceId"
          AND scoped_job.id = e."jobId"`).andWhere((assigned)=>assigned.where("scoped_job.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as scoped_team").select(trx.raw("1")).whereRaw(`scoped_team."workspaceId" = scoped_job."workspaceId"
                AND scoped_team."jobId" = scoped_job.id`).where("scoped_team.userId", context.userId))));
    }
    return query;
}
function visibleEstimateQuery(trx, context) {
    return constrainEstimateRead(trx("estimates as e").join("workspaces as w", "w.id", "e.workspaceId"), trx, context);
}
function canReadEstimateNotifications(context) {
    return hasEstimateReadScope(context);
}
function estimateNotificationQuery(trx, context) {
    const query = trx("estimateNotifications as n").join("estimates as e", function joinEstimate() {
        this.on("e.id", "n.estimateId").andOn("e.workspaceId", "n.workspaceId");
    }).join("workspaces as w", "w.id", "e.workspaceId").where("n.workspaceId", context.workspaceId).where("n.userId", context.userId);
    constrainEstimateRead(query, trx, context);
    return query;
}
async function notifyEstimateRecipients(trx, input, enabled = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionIds"]) {
    const event = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateNotificationEventSchema"].parse(input.event);
    if (!input.dedupeKey || input.dedupeKey.length > 200) {
        throw new RangeError("Estimate notification keys must be between 1 and 200 characters.");
    }
    const estimate = await trx("estimates").where({
        workspaceId: input.workspaceId,
        id: input.estimateId
    }).first("ownerId", "parentType", "leadId", "jobId");
    if (!estimate) return 0;
    const parentOwner = estimate.parentType === "lead" ? await trx("leads").where({
        workspaceId: input.workspaceId,
        id: estimate.leadId
    }).first("ownerId") : await trx("jobs").where({
        workspaceId: input.workspaceId,
        id: estimate.jobId
    }).first("primaryOwnerId");
    const recipients = new Set([
        estimate.ownerId,
        estimate.parentType === "lead" ? parentOwner?.ownerId : parentOwner?.primaryOwnerId
    ].filter((userId)=>typeof userId === "string"));
    let created = 0;
    for (const userId of recipients){
        if (userId === input.actorId) continue;
        try {
            created += await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, {
                workspaceId: input.workspaceId,
                userId
            }, enabled, false, async (nested, context)=>{
                const visible = await visibleEstimateQuery(nested, context).where("e.id", input.estimateId).first("e.id");
                if (!visible) return 0;
                const rows = await nested("estimateNotifications").insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: input.workspaceId,
                    estimateId: input.estimateId,
                    userId,
                    event,
                    dedupeKey: input.dedupeKey
                }).onConflict([
                    "workspaceId",
                    "dedupeKey",
                    "userId"
                ]).ignore().returning("id");
                return rows.length;
            });
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        }
    }
    return created;
}
function notificationStatus(trx) {
    return trx.raw(`CASE WHEN e.status IN ('sent','published')
      AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
    THEN 'expired' ELSE e.status END AS "currentStatus"`);
}
function reminderWindow(trx) {
    return trx.raw(`(e."validUntil" >= (now() AT TIME ZONE w.timezone)::date
    AND e."validUntil" <= (now() AT TIME ZONE w.timezone)::date + 3) AS "expiringSoon"`);
}
function currentForEmail(row) {
    switch(row.event){
        case "sent":
        case "delivery_failed":
            return row.currentStatus === "sent";
        case "viewed":
            return row.currentStatus !== "draft" && row.currentStatus !== "superseded";
        case "decision_recorded":
            return row.currentStatus === "accepted" || row.currentStatus === "declined";
        case "expiring_soon":
            return (row.currentStatus === "sent" || row.currentStatus === "published") && row.expiringSoon;
        case "expired":
            return row.currentStatus === "expired";
        default:
            return false;
    }
}
async function processEstimateNotificationEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new RangeError("Invalid Estimate notification delivery batch size.");
    }
    const summary = {
        sent: 0,
        skipped: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db("estimateNotifications"), "estimateNotifications.workspaceId").where({
        emailStatus: "queued"
    }).where("nextAttemptAt", "<=", db.fn.now()).orderBy("nextAttemptAt").orderBy("id").limit(limit).select("id", "workspaceId", "userId");
    for (const candidate of candidates){
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
                workspaceId: candidate.workspaceId,
                userId: candidate.userId
            }, enabled, false, async (trx, context)=>{
                const queued = await trx("estimateNotifications").where({
                    id: candidate.id,
                    emailStatus: "queued"
                }).where("nextAttemptAt", "<=", trx.fn.now()).forUpdate().skipLocked().first();
                if (!queued) return;
                const row = await estimateNotificationQuery(trx, context).where("n.id", candidate.id).select("n.event", "n.estimateId", "n.attempts", "n.createdAt", "e.estimateNumber", "e.name as estimateName", "e.validUntil", "u.email", "u.emailVerified", notificationStatus(trx), reminderWindow(trx)).join("users as u", "u.id", "n.userId").first();
                const preference = await trx("notificationPreferences").where({
                    userId: context.userId
                }).first("estimateEmail");
                if (!row || !currentForEmail(row) || !row.emailVerified || preference?.estimateEmail === false) {
                    await trx("estimateNotifications").where({
                        id: candidate.id
                    }).update({
                        emailStatus: "skipped"
                    });
                    summary.skipped++;
                    return;
                }
                const attempts = queued.attempts + 1;
                try {
                    await send({
                        id: candidate.id,
                        to: row.email,
                        workspaceId: candidate.workspaceId,
                        event: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateNotificationEventSchema"].parse(row.event),
                        estimateId: row.estimateId,
                        estimateNumber: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
                        estimateName: row.estimateName,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.currentStatus)
                    });
                    await trx("estimateNotifications").where({
                        id: candidate.id
                    }).update({
                        emailStatus: "sent",
                        attempts,
                        sentAt: trx.fn.now()
                    });
                    summary.sent++;
                } catch  {
                    const failed = attempts >= 5;
                    summary[failed ? "failed" : "retryPending"]++;
                    await trx("estimateNotifications").where({
                        id: candidate.id
                    }).update({
                        emailStatus: failed ? "failed" : "queued",
                        attempts,
                        nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1))
                    });
                }
            });
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
            await db.transaction(async (trx)=>{
                await trx("workspaces").where({
                    id: candidate.workspaceId
                }).forShare().first("id");
                await trx("estimateNotifications").where({
                    id: candidate.id,
                    emailStatus: "queued"
                }).update({
                    emailStatus: "skipped"
                });
            });
            summary.skipped++;
        }
    }
    return summary;
}
async function scheduleEstimateReminders(db, now) {
    if (now && !Number.isFinite(now.getTime())) {
        throw new RangeError("A valid Estimate reminder time is required.");
    }
    const instant = now ? now.toISOString() : db.raw("clock_timestamp()");
    const workspaces = await db("workspaces as w").whereNull("w.deletionRequestedAt").whereExists(db("estimates as e").select(db.raw("1")).whereRaw('e."workspaceId" = w.id').whereIn("e.status", [
        "sent",
        "published"
    ]).whereNull("e.archivedAt").whereNotExists(db("estimates as newer").select(db.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId"
              AND newer."estimateNumber" = e."estimateNumber"
              AND newer.revision > e.revision`)).whereRaw(`e."validUntil" BETWEEN
          (?::timestamptz AT TIME ZONE w.timezone)::date AND
          (?::timestamptz AT TIME ZONE w.timezone)::date + 3`, [
        instant,
        instant
    ])).select("w.id").orderBy("w.id").limit(50);
    let reminders = 0;
    for (const workspace of workspaces){
        reminders += await db.transaction(async (trx)=>{
            const locked = await trx("workspaces").where({
                id: workspace.id
            }).whereNull("deletionRequestedAt").forUpdate().first("id", "timezone");
            if (!locked) return 0;
            const estimates = await trx("estimates as e").where("e.workspaceId", locked.id).whereIn("e.status", [
                "sent",
                "published"
            ]).whereNull("e.archivedAt").whereNotExists(trx("estimates as newer").select(trx.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId"
              AND newer."estimateNumber" = e."estimateNumber"
              AND newer.revision > e.revision`)).whereRaw(`e."validUntil" BETWEEN
          (?::timestamptz AT TIME ZONE ?)::date AND
          (?::timestamptz AT TIME ZONE ?)::date + 3`, [
                instant,
                locked.timezone,
                instant,
                locked.timezone
            ]).select("e.id", trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntilDate"`)).orderBy("e.validUntil").orderBy("e.id").limit(100);
            let created = 0;
            for (const estimate of estimates){
                created += await notifyEstimateRecipients(trx, {
                    workspaceId: locked.id,
                    estimateId: estimate.id,
                    event: "expiring_soon",
                    dedupeKey: `estimate:${estimate.id}:expiring:${estimate.validUntilDate}`
                });
            }
            return created;
        });
    }
    return {
        reminders
    };
}
}),
"[project]/packages/data/src/notifications/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "currentAssignmentQuery",
    ()=>currentAssignmentQuery,
    "markNotificationRead",
    ()=>markNotificationRead,
    "readNotificationPreferences",
    ()=>readNotificationPreferences,
    "readNotifications",
    ()=>readNotifications,
    "saveNotificationPreferences",
    ()=>saveNotificationPreferences
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/jobs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$deadlines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/deadlines.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/notifications.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function readNotificationPreferences(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx)=>{
        const row = await trx('notificationPreferences').where({
            userId: identity.userId
        }).first('leadAssignedEmail', 'visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail');
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notificationPreferencesSchema"].parse(row ?? {
            leadAssignedEmail: true,
            estimateEmail: true
        });
    });
}
async function saveNotificationPreferences(db, identity, enabled, raw) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx)=>{
        await trx('users').where({
            id: identity.userId
        }).forUpdate().first('id');
        const existing = await trx('notificationPreferences').where({
            userId: identity.userId
        }).first('visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail');
        const values = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notificationPreferencesSchema"].parse({
            leadAssignedEmail: raw.leadAssignedEmail,
            visitChangedEmail: raw.visitChangedEmail ?? existing?.visitChangedEmail ?? true,
            estimateEmail: raw.estimateEmail ?? existing?.estimateEmail ?? true,
            deadlineReminderEmail: raw.deadlineReminderEmail ?? existing?.deadlineReminderEmail ?? true,
            jobActivityEmail: raw.jobActivityEmail ?? existing?.jobActivityEmail ?? true
        });
        await trx('notificationPreferences').insert({
            userId: identity.userId,
            ...values
        }).onConflict('userId').merge({
            ...values,
            updatedAt: trx.fn.now()
        });
        return values;
    });
}
function currentAssignmentQuery(trx, identity) {
    return trx('assignmentNotifications as n').join('leads as l', function() {
        this.on('l.id', 'n.leadId').andOn('l.workspaceId', 'n.workspaceId');
    }).join('leadActivity as a', 'a.id', 'n.id').where({
        'n.workspaceId': identity.workspaceId,
        'n.userId': identity.userId,
        'l.ownerId': identity.userId
    }).whereNull('l.archivedAt').whereNotExists(trx('leadActivity as newer').select(trx.raw('1')).whereRaw('newer."leadId" = l.id AND newer."workspaceId" = l."workspaceId"').where('newer.type', 'assigned').whereRaw(`(newer.changes->>'toVersion')::int > (a.changes->>'toVersion')::int`));
}
const leadNumber = (n)=>`LD-${String(n).padStart(4, '0')}`;
/** Work-order notifications only for current readers of that work order. */ function workOrderNotificationQuery(trx, context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoped"])(trx, context).join('workOrderNotifications as n', function() {
        this.on('n.workOrderId', 'w.id').andOn('n.workspaceId', 'w.workspaceId');
    }).where('n.userId', context.userId).whereNull('w.archivedAt');
}
function canReadWorkOrderNotifications(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    return scope.allowed && [
        'workspace',
        'assigned_job'
    ].includes(scope.scope);
}
/** A proposer sees decisions on their own items while they can still read the catalog. */ function materialNotificationQuery(trx, context) {
    return trx('materialNotifications as n').where({
        'n.workspaceId': context.workspaceId,
        'n.userId': context.userId
    }).whereNotIn('n.event', hiddenMaterialEvents(context));
}
// Proposal alerts are for approvers only; a proposer's decision notices need just read access.
const hiddenMaterialEvents = (context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["materialAccess"])(context).manage ? [] : [
        'proposed'
    ];
const canReadMaterialNotifications = (context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["materialAccess"])(context).read;
function captureNoticeQuery(trx, context) {
    return trx('captureAdminNotices as n').join('captureSources as s', function() {
        this.on('s.id', 'n.sourceId').andOn('s.workspaceId', 'n.workspaceId');
    }).where({
        'n.workspaceId': context.workspaceId,
        'n.userId': context.userId
    });
}
const canReadCaptureNotices = (context)=>[
        'owner',
        'admin'
    ].includes(context.membership.role) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read').allowed;
async function readNotifications(db, identity, enabled, page = 1) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notificationQuerySchema"].parse({
        workspaceId: identity.workspaceId,
        page
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const take = page * 20 + 1, items = [];
        let unread = 0;
        if (canReadCaptureNotices(context)) {
            const query = captureNoticeQuery(trx, context);
            unread += Number((await query.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first())?.count ?? 0);
            const rows = await query.select('n.id', 'n.sourceId', 's.name as sourceName', 'n.reason', 'n.createdAt', 'n.readAt').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
            items.push(...rows.map((row)=>({
                    kind: 'capture',
                    id: row.id,
                    sourceId: row.sourceId,
                    sourceName: row.sourceName,
                    reason: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["captureNoticeReasonSchema"].parse(row.reason),
                    createdAt: row.createdAt.toISOString(),
                    read: !!row.readAt
                })));
        }
        const leadScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
        if (leadScope.allowed && leadScope.resourceKind === 'lead' && [
            'workspace',
            'assigned'
        ].includes(leadScope.scope)) {
            const query = currentAssignmentQuery(trx, identity);
            const count = await query.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first();
            unread += Number(count?.count ?? 0);
            const rows = await query.select('n.id', 'n.leadId', 'l.leadNumber', 'l.name', 'l.service', 'a.actorName', 'n.createdAt', 'n.readAt').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
            items.push(...rows.map((row)=>({
                    kind: 'lead',
                    id: row.id,
                    leadId: row.leadId,
                    leadNumber: leadNumber(row.leadNumber),
                    leadName: row.name,
                    service: row.service,
                    assignerName: row.actorName ?? '',
                    createdAt: row.createdAt.toISOString(),
                    read: !!row.readAt
                })));
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canReadEstimateNotifications"])(context)) {
            const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateNotificationQuery"])(trx, context);
            const count = await query.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first();
            unread += Number(count?.count ?? 0);
            const rows = await query.select('n.id', 'n.event', 'n.createdAt', 'n.readAt', 'e.id as estimateId', 'e.estimateNumber', 'e.name as estimateName', trx.raw(`CASE WHEN e.status IN ('sent','published')
          AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
          THEN 'expired' ELSE e.status END AS "currentStatus"`)).orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
            items.push(...rows.map((row)=>({
                    kind: 'estimate',
                    id: row.id,
                    event: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateNotificationEventSchema"].parse(row.event),
                    estimateId: row.estimateId,
                    estimateNumber: `EST-${String(row.estimateNumber).padStart(4, '0')}`,
                    estimateName: row.estimateName,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.currentStatus),
                    createdAt: new Date(row.createdAt).toISOString(),
                    read: !!row.readAt
                })));
        }
        if (canReadWorkOrderNotifications(context)) {
            const query = workOrderNotificationQuery(trx, context);
            const count = await query.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first();
            unread += Number(count?.count ?? 0);
            const rows = await query.select('n.id', 'n.event', 'n.actorName', 'n.createdAt', 'n.readAt', 'w.id as workOrderId', 'w.workOrderNumber', 'w.title').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
            items.push(...rows.map((row)=>({
                    kind: 'work_order',
                    id: row.id,
                    event: row.event,
                    workOrderId: row.workOrderId,
                    workOrderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatWorkOrderNumber"])(row.workOrderNumber),
                    workOrderTitle: row.title,
                    actorName: row.actorName,
                    createdAt: row.createdAt.toISOString(),
                    read: !!row.readAt
                })));
        }
        if (canReadMaterialNotifications(context)) {
            const query = materialNotificationQuery(trx, context);
            const count = await query.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first();
            unread += Number(count?.count ?? 0);
            const rows = await query.select('n.id', 'n.event', 'n.materialId', 'n.materialName', 'n.reason', 'n.actorName', 'n.createdAt', 'n.readAt').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
            items.push(...rows.map((row)=>({
                    kind: 'material',
                    id: row.id,
                    event: row.event,
                    materialId: row.materialId,
                    materialName: row.materialName,
                    reason: row.reason,
                    actorName: row.actorName,
                    createdAt: new Date(row.createdAt).toISOString(),
                    read: !!row.readAt
                })));
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canReadVisitNotifications"])(context)) {
            const visits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["visitNotificationQuery"])(trx, context);
            unread += Number((await visits.clone().whereNull('n.readAt').count({
                count: 'n.id'
            }).first())?.count ?? 0);
            for (const row of (await visits.select('n.*').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take))){
                const projected = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["projectVisitNotification"])(trx, context, row);
                if (projected) items.push(projected);
            }
        }
        const jobs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readJobNotifications"])(trx, context, take);
        unread += jobs.unread;
        items.push(...jobs.items);
        const deadlines = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$deadlines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readDeadlineNotifications"])(trx, context, take);
        unread += deadlines.unread;
        items.push(...deadlines.items);
        items.sort((a, b)=>b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
        const slice = items.slice((page - 1) * 20, page * 20 + 1);
        return {
            items: slice.slice(0, 20),
            unreadCount: unread,
            page,
            hasMore: slice.length > 20
        };
    });
}
async function markNotificationRead(db, identity, enabled, id) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["markNotificationReadSchema"].parse({
        workspaceId: identity.workspaceId,
        id
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        if (canReadCaptureNotices(context) && await captureNoticeQuery(trx, context).where('n.id', id).first('n.id')) {
            await trx('captureAdminNotices').where({
                workspaceId: identity.workspaceId,
                userId: identity.userId,
                id
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobNotificationQuery"])(trx, context).where('n.id', id).first('n.id')) {
            await trx('jobNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$deadlines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deadlineNotificationQuery"])(trx, context).where('n.id', id).first('n.id')) {
            await trx('deadlineNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canReadEstimateNotifications"])(context) && await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateNotificationQuery"])(trx, context).where('n.id', id).first('n.id')) {
            await trx('estimateNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canReadVisitNotifications"])(context) && await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["visitNotificationQuery"])(trx, context).where('n.id', id).first('n.id')) {
            await trx('visitNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
        if (canReadMaterialNotifications(context) && await materialNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
            await trx('materialNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if (canReadWorkOrderNotifications(context) && await workOrderNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
            await trx('workOrderNotifications').where({
                id,
                workspaceId: identity.workspaceId,
                userId: identity.userId
            }).whereNull('readAt').update({
                readAt: trx.fn.now()
            });
            return;
        }
        if (!scope.allowed || scope.resourceKind !== 'lead' || ![
            'workspace',
            'assigned'
        ].includes(scope.scope) || !await currentAssignmentQuery(trx, identity).where('n.id', id).first('n.id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await trx('assignmentNotifications').where({
            id,
            workspaceId: identity.workspaceId,
            userId: identity.userId
        }).whereNull('readAt').update({
            readAt: trx.fn.now()
        });
    });
}
}),
"[project]/packages/data/src/notifications/delivery.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "processAssignmentEmails",
    ()=>processAssignmentEmails
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/store.ts [app-rsc] (ecmascript)");
;
;
;
;
async function processAssignmentEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
    const summary = {
        sent: 0,
        skipped: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db('assignmentEmailOutbox as o'), 'n.workspaceId').join('assignmentNotifications as n', 'n.id', 'o.id').where('o.status', 'queued').where('o.nextAttemptAt', '<=', db.fn.now()).orderBy('o.nextAttemptAt').orderBy('o.id').limit(limit).select('o.id', 'n.workspaceId', 'n.userId', 'n.createdAt');
    for (const candidate of candidates){
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
                workspaceId: candidate.workspaceId,
                userId: candidate.userId
            }, enabled, false, async (trx, context)=>{
                const job = await trx('assignmentEmailOutbox').where({
                    id: candidate.id,
                    status: 'queued'
                }).where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first();
                if (!job) return;
                const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
                const row = scope.allowed && scope.resourceKind === 'lead' && [
                    'workspace',
                    'assigned'
                ].includes(scope.scope) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["currentAssignmentQuery"])(trx, context).where('n.id', job.id).first('n.leadId', 'l.leadNumber', 'l.name', 'l.service', 'l.stage', 'a.actorName') : undefined;
                const user = await trx('users').where({
                    id: candidate.userId
                }).whereNull('deletionRequestedAt').first('email', 'emailVerified');
                const preference = await trx('notificationPreferences').where({
                    userId: candidate.userId
                }).first('leadAssignedEmail');
                if (new Date(candidate.createdAt).getTime() < Date.now() - 23 * 60 * 60 * 1000 || !row || !user?.emailVerified || preference?.leadAssignedEmail === false) {
                    await trx('assignmentEmailOutbox').where({
                        id: job.id
                    }).update({
                        status: 'skipped'
                    });
                    summary.skipped++;
                    return;
                }
                const workspace = await trx('workspaces').where({
                    id: candidate.workspaceId
                }).first('businessName');
                const attempts = job.attempts + 1;
                try {
                    await send({
                        id: job.id,
                        to: user.email,
                        workspaceId: candidate.workspaceId,
                        workspaceName: workspace.businessName,
                        leadId: row.leadId,
                        leadNumber: `LD-${String(row.leadNumber).padStart(4, '0')}`,
                        leadName: row.name,
                        service: row.service,
                        stage: row.stage,
                        assignerName: row.actorName ?? ''
                    });
                    await trx('assignmentEmailOutbox').where({
                        id: job.id
                    }).update({
                        status: 'sent',
                        attempts,
                        sentAt: trx.fn.now()
                    });
                    summary.sent++;
                } catch  {
                    if (attempts >= 5) summary.failed++;
                    else summary.retryPending++;
                    await trx('assignmentEmailOutbox').where({
                        id: job.id
                    }).update({
                        status: attempts >= 5 ? 'failed' : 'queued',
                        attempts,
                        nextAttemptAt: new Date(Date.now() + 60000 * 2 ** (attempts - 1))
                    });
                }
            });
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
            await db('assignmentEmailOutbox').where({
                id: candidate.id,
                status: 'queued'
            }).update({
                status: 'skipped'
            });
            summary.skipped++;
        }
    }
    return summary;
}
}),
"[project]/packages/data/src/materials/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MaterialConflictError",
    ()=>MaterialConflictError,
    "MaterialValidationError",
    ()=>MaterialValidationError,
    "materialAccess",
    ()=>materialAccess,
    "readMaterials",
    ()=>readMaterials,
    "toMaterialView",
    ()=>toMaterialView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/material.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
class MaterialConflictError extends Error {
    constructor(message = "This catalog item changed. Reload its current details before trying again."){
        super(message);
    }
}
class MaterialValidationError extends Error {
}
function materialAccess(context) {
    const allowed = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission
        }).allowed;
    // The price permissions are work-order record grants; a workspace-scoped probe asks whether the role holds them workspace-wide.
    const probe = {
        kind: "work_order",
        id: "catalog",
        workspaceId: context.workspaceId,
        job: null
    };
    const priced = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: probe
        }).allowed;
    const viewPrices = priced("workorders.view_prices");
    return {
        read: allowed("materials.read"),
        manage: allowed("materials.manage"),
        propose: allowed("materials.propose"),
        viewPrices,
        viewCosts: viewPrices && priced("workorders.view_costs")
    };
}
function toMaterialView(row, access, duplicateOf = null) {
    const cost = access.viewCosts ? row.costCents : null, price = access.viewPrices ? row.priceCents : null;
    return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        unit: row.unit,
        category: row.category,
        supplier: row.supplier,
        costCents: cost,
        priceCents: price,
        marginPercent: cost !== null && price !== null && price > 0 ? Math.round((price - cost) / price * 1000) / 10 : null,
        notes: row.notes,
        imageUrl: row.imageUrl,
        sourceUrl: row.sourceUrl,
        status: row.status,
        archived: !!row.archivedAt,
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
        proposedByName: row.proposedByName ?? null,
        rejectionReason: row.rejectionReason,
        duplicateOf
    };
}
const like = (value)=>`%${value.replace(/[\\%_]/g, (match)=>`\\${match}`)}%`;
const sortColumns = {
    name: "lower(m.name)",
    category: "lower(m.category)",
    price: `m."priceCents"`,
    updatedAt: `m."updatedAt"`
};
async function readMaterials(db, identity, enabled, raw) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["materialQuerySchema"].parse(raw);
    if (query.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const access = materialAccess(context);
        if (!access.read) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        // Proposals are visible to approvers, and each proposer sees only their own.
        if (query.status !== "active" && !access.manage && !access.propose) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const ownOnly = query.status !== "active" && !access.manage;
        const archived = access.manage && query.status === "active" && query.archived;
        const base = ()=>trx("materialCatalog as m").where("m.workspaceId", context.workspaceId);
        const filtered = ()=>{
            const q = base().where("m.status", query.status);
            if (query.status === "active") q.modify((w)=>archived ? w.whereNotNull("m.archivedAt") : w.whereNull("m.archivedAt"));
            if (ownOnly) q.where("m.proposedBy", context.userId);
            if (query.category) q.whereRaw("lower(m.category) = lower(?)", [
                query.category
            ]);
            if (query.supplier) q.whereRaw("lower(m.supplier) = lower(?)", [
                query.supplier
            ]);
            if (query.q) q.where((w)=>{
                const term = like(query.q);
                w.whereRaw(`m.name ILIKE ? ESCAPE '\\'`, [
                    term
                ]).orWhereRaw(`m.sku ILIKE ? ESCAPE '\\'`, [
                    term
                ]).orWhereRaw(`m.category ILIKE ? ESCAPE '\\'`, [
                    term
                ]).orWhereRaw(`m.supplier ILIKE ? ESCAPE '\\'`, [
                    term
                ]);
            });
            return q;
        };
        // Prices cannot be sorted by users who cannot see them.
        const sort = query.sort === "price" && !access.viewPrices ? "name" : query.sort;
        const total = Number((await filtered().count({
            count: "*"
        }).first())?.count ?? 0);
        const rows = await filtered().leftJoin("users as p", "p.id", "m.proposedBy").select("m.*", "p.name as proposedByName").orderByRaw(`${sortColumns[sort]} ${query.direction === "desc" ? "DESC" : "ASC"}, m.id`).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        const duplicates = new Map();
        if (access.manage && query.status === "proposed" && rows.length) {
            const found = await trx("materialCatalog as a").join("materialCatalog as m", function join() {
                this.on("m.workspaceId", "a.workspaceId").andOn(trx.raw(`(lower(m.name) = lower(a.name) OR (a.sku <> '' AND lower(m.sku) = lower(a.sku)))`));
            }).where("a.workspaceId", context.workspaceId).where("a.status", "active").whereIn("m.id", rows.map((row)=>row.id)).select("m.id as proposalId", "a.name");
            for (const row of found)duplicates.set(row.proposalId, row.name);
        }
        const distinct = async (column)=>(await base().where("m.status", "active").whereRaw(`m."${column}" <> ''`).select(`m.${column} as value`).groupBy(`m.${column}`).orderByRaw(`lower(m."${column}")`).limit(200)).map((row)=>row.value);
        const pending = access.manage || access.propose ? Number((await base().where("m.status", "proposed").modify((q)=>{
            if (!access.manage) q.where("m.proposedBy", context.userId);
        }).count({
            count: "*"
        }).first())?.count ?? 0) : 0;
        return {
            rows: rows.map((row)=>toMaterialView(row, access, duplicates.get(row.id) ?? null)),
            total,
            page: query.page,
            pageSize: query.pageSize,
            options: {
                categories: await distinct("category"),
                suppliers: await distinct("supplier")
            },
            pendingProposals: pending,
            canManage: access.manage,
            canPropose: access.propose,
            canExport: access.manage,
            canViewPrices: access.viewPrices,
            canViewCosts: access.viewCosts
        };
    });
}
}),
"[project]/packages/data/src/materials/snapshot.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadLinkableMaterials",
    ()=>loadLinkableMaterials
]);
async function loadLinkableMaterials(trx, workspaceId, ids) {
    if (!ids.length) return new Map();
    const rows = await trx("materialCatalog").where({
        workspaceId,
        status: "active"
    }).whereNull("archivedAt").whereIn("id", [
        ...new Set(ids)
    ]).select("id", "name", "unit", "costCents", "priceCents", "imageUrl");
    return new Map(rows.map((row)=>[
            row.id,
            row
        ]));
}
}),
"[project]/packages/data/src/materials/mutations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mutateMaterial",
    ()=>mutateMaterial
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/material.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/store.ts [app-rsc] (ecmascript)");
;
;
;
;
const hashInput = (input)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
const editable = [
    "name",
    "sku",
    "unit",
    "category",
    "supplier",
    "costCents",
    "priceCents",
    "notes",
    "imageUrl",
    "sourceUrl"
];
/** Users can only set the money fields they are allowed to see. */ function assertMoneyAccess(access, item) {
    if (item.costCents !== undefined && !access.viewCosts) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("You cannot set item costs.");
    if (item.priceCents !== undefined && !access.viewPrices) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("You cannot set item prices.");
}
async function assertUniqueSku(trx, workspaceId, sku, exceptId) {
    if (!sku) return;
    const clash = await trx("materialCatalog").where({
        workspaceId,
        status: "active"
    }).whereNull("archivedAt").whereRaw("lower(sku) = lower(?)", [
        sku
    ]).modify((q)=>{
        if (exceptId) q.whereNot({
            id: exceptId
        });
    }).first("name");
    if (clash) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"](`SKU ${sku} is already used by ${clash.name}.`);
}
async function receipt(trx, context, submissionId, hash) {
    const previous = await trx("materialOperations").where({
        workspaceId: context.workspaceId,
        submissionId
    }).first();
    if (previous && (previous.actorId !== context.userId || previous.inputHash !== hash)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialConflictError"]();
    return previous ? {
        materialId: previous.materialId,
        version: previous.version
    } : undefined;
}
async function finish(trx, context, submissionId, hash, materialId, version, name, action, changes, source) {
    await trx("materialAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        materialId,
        materialName: name,
        action,
        actorId: context.userId,
        source,
        changes: JSON.stringify(changes)
    });
    await trx("materialOperations").insert({
        workspaceId: context.workspaceId,
        submissionId,
        actorId: context.userId,
        inputHash: hash,
        materialId,
        version
    });
    return {
        materialId,
        version
    };
}
async function load(trx, context, id, version) {
    const row = await trx("materialCatalog").where({
        workspaceId: context.workspaceId,
        id
    }).forUpdate().first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (row.version !== version) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialConflictError"]();
    return row;
}
const diff = (row, patch)=>{
    const from = {}, to = {};
    for (const key of editable)if (patch[key] !== undefined && patch[key] !== row[key]) {
        from[key] = row[key];
        to[key] = patch[key];
    }
    return {
        from,
        to,
        changed: Object.keys(to).length > 0
    };
};
const values = (item)=>Object.fromEntries(editable.filter((key)=>item[key] !== undefined).map((key)=>[
            key,
            item[key]
        ]));
async function notifyUsers(trx, context, materialId, users, event, name, reason = "") {
    if (!users.length) return;
    const actor = await trx("users").where({
        id: context.userId
    }).first("name");
    await trx("materialNotifications").insert(users.map((userId)=>({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            materialId,
            userId,
            event,
            materialName: name,
            reason,
            actorName: actor?.name ?? ""
        })));
}
/** Tells the proposer how their item was decided. Approvers who decide their own proposal are not notified. */ async function notifyProposer(trx, context, row, name, events, reason = "") {
    if (!row.proposedBy || row.proposedBy === context.userId) return;
    for (const event of events)await notifyUsers(trx, context, row.id, [
        row.proposedBy
    ], event, name, event === "rejected" ? reason : "");
}
/** Owners and admins hear about new proposals; delivery is re-authorized against materials.manage when read. */ async function notifyApprovers(trx, context, materialId, name) {
    const members = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereIn("m.role", [
        "owner",
        "admin"
    ]).whereNull("u.deletionRequestedAt").whereNot("m.userId", context.userId).select("m.userId");
    await notifyUsers(trx, context, materialId, members.map((member)=>member.userId), "proposed", name);
}
async function mutateMaterial(db, identity, enabled, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["materialMutationSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const source = options.source ?? "ui";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["materialAccess"])(context);
        if (!access.read) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
        if (previous) return previous;
        const now = new Date();
        if (input.action === "create" || input.action === "propose") {
            if (!(input.action === "create" ? access.manage : access.propose)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            assertMoneyAccess(access, input.item);
            const live = input.action === "create";
            if (live) await assertUniqueSku(trx, context.workspaceId, input.item.sku);
            const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
            await trx("materialCatalog").insert({
                id,
                workspaceId: context.workspaceId,
                ...values(input.item),
                status: live ? "active" : "proposed",
                createdBy: context.userId,
                proposedBy: live ? null : context.userId,
                createdAt: now,
                updatedAt: now
            });
            if (!live) await notifyApprovers(trx, context, id, input.item.name);
            return finish(trx, context, input.submissionId, hash, id, 1, input.item.name, input.action, {
                to: values(input.item)
            }, source);
        }
        const row = await load(trx, context, input.materialId, input.expectedVersion);
        const bump = async (patch)=>{
            await trx("materialCatalog").where({
                id: row.id
            }).update({
                ...patch,
                version: row.version + 1,
                updatedAt: now
            });
            return row.version + 1;
        };
        switch(input.action){
            case "update":
                {
                    if (!access.manage) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                    if (row.status !== "active" || row.archivedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Restore this item before editing it.");
                    assertMoneyAccess(access, input.item);
                    const change = diff(row, input.item);
                    if (!change.changed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Nothing to change.");
                    if (typeof change.to.sku === "string") await assertUniqueSku(trx, context.workspaceId, change.to.sku, row.id);
                    return finish(trx, context, input.submissionId, hash, row.id, await bump(change.to), String(change.to.name ?? row.name), "update", {
                        from: change.from,
                        to: change.to
                    }, source);
                }
            case "archive":
                {
                    if (!access.manage) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                    if (row.status !== "active") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Only approved items can be archived.");
                    if (!!row.archivedAt === input.archived) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"](input.archived ? "This item is already archived." : "This item is not archived.");
                    if (!input.archived) await assertUniqueSku(trx, context.workspaceId, row.sku, row.id);
                    return finish(trx, context, input.submissionId, hash, row.id, await bump({
                        archivedAt: input.archived ? now : null
                    }), row.name, input.archived ? "archive" : "restore", {}, source);
                }
            case "approve":
                {
                    if (!access.manage) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                    if (row.status !== "proposed") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Only pending proposals can be approved.");
                    assertMoneyAccess(access, input.item);
                    const change = diff(row, input.item), sku = String(change.to.sku ?? row.sku);
                    await assertUniqueSku(trx, context.workspaceId, sku, row.id);
                    const version = await bump({
                        ...change.to,
                        status: "active",
                        decidedBy: context.userId,
                        decidedAt: now
                    });
                    await notifyProposer(trx, context, row, String(change.to.name ?? row.name), [
                        change.changed ? "edited" : "approved"
                    ]);
                    return finish(trx, context, input.submissionId, hash, row.id, version, String(change.to.name ?? row.name), "approve", {
                        from: change.from,
                        to: change.to
                    }, source);
                }
            case "reject":
                {
                    if (!access.manage) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                    if (row.status !== "proposed") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Only pending proposals can be rejected.");
                    const version = await bump({
                        status: "rejected",
                        decidedBy: context.userId,
                        decidedAt: now,
                        rejectionReason: input.reason
                    });
                    await notifyProposer(trx, context, row, row.name, [
                        "rejected"
                    ], input.reason);
                    return finish(trx, context, input.submissionId, hash, row.id, version, row.name, "reject", {
                        reason: input.reason
                    }, source);
                }
            case "withdraw":
                {
                    if (!access.propose || row.proposedBy !== context.userId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                    if (row.status !== "proposed") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Only pending proposals can be withdrawn.");
                    await trx("materialCatalog").where({
                        id: row.id
                    }).delete();
                    return finish(trx, context, input.submissionId, hash, row.id, row.version, row.name, "withdraw", {}, source);
                }
        }
    });
}
}),
"[project]/packages/data/src/materials/export.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportMaterials",
    ()=>exportMaterials
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/material.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/store.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const pageSize = 100;
async function exportMaterials(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$material$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["materialExportSchema"].parse(raw);
    if (parsed.query.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const access = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (_trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["materialAccess"])(context));
    if (!access.manage) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const first = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readMaterials"])(db, identity, enabled, {
        ...parsed.query,
        page: 1,
        pageSize
    });
    if (first.total !== parsed.expectedCount || !first.total || first.total > 50000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialConflictError"]("Export scope changed or exceeds 50,000 rows. Prepare it again.");
    const columns = [
        "Name",
        "SKU",
        "Unit",
        "Category",
        "Supplier",
        ...access.viewCosts ? [
            "Cost per unit"
        ] : [],
        ...access.viewPrices ? [
            "Price per unit"
        ] : [],
        "Status",
        "Notes",
        "Supplier link",
        "Image link"
    ];
    const lines = [
        "\uFEFF" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])(columns)
    ];
    let bytes = Buffer.byteLength(lines[0]);
    const dollars = (cents)=>cents === null ? "" : (cents / 100).toFixed(2);
    for(let page = 1; page <= Math.ceil(first.total / pageSize); page++){
        const { rows } = page === 1 ? first : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readMaterials"])(db, identity, enabled, {
            ...parsed.query,
            page,
            pageSize
        });
        for (const row of rows){
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["csvLine"])([
                row.name,
                row.sku,
                row.unit,
                row.category,
                row.supplier,
                ...access.viewCosts ? [
                    dollars(row.costCents)
                ] : [],
                ...access.viewPrices ? [
                    dollars(row.priceCents)
                ] : [],
                row.archived ? "archived" : row.status,
                row.notes,
                row.sourceUrl,
                row.imageUrl
            ]);
            bytes += Buffer.byteLength(line);
            if (bytes > 32000000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MaterialValidationError"]("Narrow the export filters to reduce the file size.");
            lines.push(line);
        }
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx)=>{
        await trx("materialExportAudit").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            rowCount: first.total
        });
    });
    return lines.join("");
}
}),
"[project]/packages/data/src/files/storage-adapter.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StorageAdapter",
    ()=>StorageAdapter,
    "createStorageAdapter",
    ()=>createStorageAdapter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/client-s3)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$Upload$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/Upload.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
;
;
;
class StorageAdapter {
    client;
    bucket;
    constructor(config){
        this.bucket = config.bucket;
        this.client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["S3Client"]({
            endpoint: config.endpoint,
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            },
            forcePathStyle: config.forcePathStyle ?? true
        });
    }
    async put(key, object) {
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"]({
            Bucket: this.bucket,
            Key: key,
            Body: object.data,
            ContentType: object.contentType,
            Metadata: object.metadata
        });
        await this.client.send(command);
    }
    async putStream(key, stream, options = {}) {
        const upload = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$Upload$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Upload"]({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
                ContentType: options.contentType,
                Metadata: options.metadata
            },
            partSize: 5 * 1024 * 1024,
            queueSize: 2,
            leavePartsOnError: false
        });
        await upload.done();
    }
    async get(key) {
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["GetObjectCommand"]({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        const chunks = [];
        if (!response.Body) {
            throw new Error(`No body in response for key ${key}`);
        }
        for await (const chunk of response.Body){
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
    async getStream(key) {
        const response = await this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["GetObjectCommand"]({
            Bucket: this.bucket,
            Key: key
        }));
        if (!response.Body) throw new Error(`No body in response for key ${key}`);
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].from(response.Body);
    }
    async head(key) {
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["HeadObjectCommand"]({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        return {
            size: response.ContentLength ?? 0,
            contentType: response.ContentType,
            lastModified: response.LastModified
        };
    }
    async delete(key) {
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["DeleteObjectCommand"]({
            Bucket: this.bucket,
            Key: key
        });
        await this.client.send(command);
    }
    close() {
        this.client.destroy();
    }
}
function createStorageAdapter(config) {
    const endpoint = config?.endpoint ?? process.env.OBJECT_STORAGE_ENDPOINT;
    const bucket = config?.bucket ?? process.env.OBJECT_STORAGE_BUCKET;
    const region = config?.region ?? process.env.OBJECT_STORAGE_REGION ?? 'us-east-1';
    const accessKeyId = config?.accessKeyId ?? process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = config?.secretAccessKey ?? process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    const forcePathStyle = config?.forcePathStyle ?? process.env.OBJECT_STORAGE_URL_STYLE === 'path';
    if (!endpoint) throw new Error('OBJECT_STORAGE_ENDPOINT is required');
    if (!bucket) throw new Error('OBJECT_STORAGE_BUCKET is required');
    if (!accessKeyId) throw new Error('OBJECT_STORAGE_ACCESS_KEY_ID is required');
    if (!secretAccessKey) throw new Error('OBJECT_STORAGE_SECRET_ACCESS_KEY is required');
    return new StorageAdapter({
        endpoint,
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        forcePathStyle
    });
}
}),
"[project]/packages/data/src/files/encryption.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStreamingFileDecryption",
    ()=>createStreamingFileDecryption,
    "createStreamingFileEncryption",
    ()=>createStreamingFileEncryption,
    "decryptFile",
    ()=>decryptFile,
    "deserializeDekEnvelope",
    ()=>deserializeDekEnvelope,
    "deserializeFileCiphertext",
    ()=>deserializeFileCiphertext,
    "encryptFile",
    ()=>encryptFile,
    "generateDataEncryptionKey",
    ()=>generateDataEncryptionKey,
    "generateFileId",
    ()=>generateFileId,
    "serializeDekEnvelope",
    ()=>serializeDekEnvelope,
    "serializeFileCiphertext",
    ()=>serializeFileCiphertext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function createStreamingFileDecryption(masterKey, dekEnvelope, fileIv, fileAuthTag) {
    if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');
    if (dekEnvelope.length !== 64 || fileIv.length !== 16 || fileAuthTag.length !== 16) {
        throw new Error('The encrypted file envelope is invalid.');
    }
    const dekDecipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])('aes-256-gcm', masterKey, dekEnvelope.subarray(0, 16));
    dekDecipher.setAuthTag(dekEnvelope.subarray(16, 32));
    const dek = Buffer.concat([
        dekDecipher.update(dekEnvelope.subarray(32)),
        dekDecipher.final()
    ]);
    if (dek.length !== 32) {
        dek.fill(0);
        throw new Error('The encrypted file key is invalid.');
    }
    const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])('aes-256-gcm', dek, fileIv);
    dek.fill(0);
    decipher.setAuthTag(fileAuthTag);
    return decipher;
}
function getMasterKey() {
    const masterKeyB64 = process.env.FILE_MASTER_KEY;
    if (!masterKeyB64) {
        throw new Error('FILE_MASTER_KEY environment variable is required');
    }
    return Buffer.from(masterKeyB64, 'base64');
}
function createStreamingFileEncryption(masterKey) {
    if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');
    const dek = generateDataEncryptionKey();
    const dekIv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const dekCipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])('aes-256-gcm', masterKey, dekIv);
    const encryptedDek = Buffer.concat([
        dekCipher.update(dek),
        dekCipher.final()
    ]);
    const dekAuthTag = dekCipher.getAuthTag();
    const fileIv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])('aes-256-gcm', dek, fileIv);
    dek.fill(0);
    return {
        cipher,
        dekEnvelope: Buffer.concat([
            dekIv,
            dekAuthTag,
            encryptedDek
        ]),
        fileIv
    };
}
function generateDataEncryptionKey() {
    // AES-256 key
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32);
}
function encryptFile(plaintext, dek) {
    const dataEncryptionKey = dek ?? generateDataEncryptionKey();
    const masterKey = getMasterKey();
    // Encrypt the DEK with the master key using AES-256-GCM
    const dekIv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const dekCipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])('aes-256-gcm', masterKey, dekIv);
    const encryptedDek = Buffer.concat([
        dekCipher.update(dataEncryptionKey),
        dekCipher.final()
    ]);
    const dekAuthTag = dekCipher.getAuthTag();
    // Encrypt the file with the DEK using AES-256-GCM
    const fileIv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const fileCipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])('aes-256-gcm', dataEncryptionKey, fileIv);
    const ciphertext = Buffer.concat([
        fileCipher.update(plaintext),
        fileCipher.final()
    ]);
    const fileAuthTag = fileCipher.getAuthTag();
    return {
        dekIv,
        dekAuthTag,
        encryptedDek,
        fileIv,
        fileAuthTag,
        ciphertext
    };
}
function decryptFile(envelope, masterKey = getMasterKey()) {
    if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');
    // Decrypt the DEK
    const dekDecipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])('aes-256-gcm', masterKey, envelope.dekIv);
    dekDecipher.setAuthTag(envelope.dekAuthTag);
    const dek = Buffer.concat([
        dekDecipher.update(envelope.encryptedDek),
        dekDecipher.final()
    ]);
    // Decrypt the file
    const fileDecipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])('aes-256-gcm', dek, envelope.fileIv);
    fileDecipher.setAuthTag(envelope.fileAuthTag);
    const plaintext = Buffer.concat([
        fileDecipher.update(envelope.ciphertext),
        fileDecipher.final()
    ]);
    return {
        plaintext,
        dek
    };
}
function serializeDekEnvelope(envelope) {
    return Buffer.concat([
        envelope.dekIv,
        envelope.dekAuthTag,
        envelope.encryptedDek
    ]);
}
function deserializeDekEnvelope(data) {
    if (data.length < 64) {
        throw new Error('Invalid DEK envelope format');
    }
    return {
        dekIv: data.subarray(0, 16),
        dekAuthTag: data.subarray(16, 32),
        encryptedDek: data.subarray(32)
    };
}
function serializeFileCiphertext(envelope) {
    return Buffer.concat([
        envelope.fileIv,
        envelope.fileAuthTag,
        envelope.ciphertext
    ]);
}
function deserializeFileCiphertext(data) {
    if (data.length < 32) {
        throw new Error('Invalid file ciphertext format');
    }
    return {
        fileIv: data.subarray(0, 16),
        fileAuthTag: data.subarray(16, 32),
        ciphertext: data.subarray(32)
    };
}
function generateFileId() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
}
}),
"[project]/packages/data/src/files/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileNotFoundError",
    ()=>FileNotFoundError,
    "FileStorageError",
    ()=>FileStorageError,
    "FileStore",
    ()=>FileStore,
    "QuotaExceededError",
    ()=>QuotaExceededError,
    "UnauthorizedFileAccessError",
    ()=>UnauthorizedFileAccessError,
    "createFileStore",
    ()=>createFileStore
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/encryption.ts [app-rsc] (ecmascript)");
;
;
;
;
class FileStorageError extends Error {
}
class FileNotFoundError extends FileStorageError {
}
class QuotaExceededError extends FileStorageError {
}
class UnauthorizedFileAccessError extends __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] {
}
const ALLOWED_MIME_TYPES = [
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_QUOTAS_BY_PLAN = {
    free: BigInt(1024 * 1024 * 1024),
    standard: BigInt(10 * 1024 * 1024 * 1024),
    premium: BigInt(25 * 1024 * 1024 * 1024)
};
function dto(row) {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        entityType: row.entityType,
        entityId: row.entityId,
        uploadedByUserId: row.uploadedByUserId,
        name: row.name,
        mimeType: row.mimeType,
        sizeBytes: Number(row.sizeBytes),
        status: row.status,
        failureReason: row.failureReason,
        categoryTag: row.categoryTag,
        caption: row.caption,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    };
}
class FileStore {
    db;
    storage;
    constructor(db, storage){
        this.db = db;
        this.storage = storage;
    }
    async uploadFile(context, input) {
        return await this.db.transaction(async (trx)=>{
            // Validate file
            if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
                throw new FileStorageError(`File type ${input.mimeType} is not allowed`);
            }
            if (input.data.length > MAX_FILE_SIZE) {
                throw new FileStorageError(`File size exceeds 10 MB limit`);
            }
            // Check quota
            const usage = await this.getStorageUsage(trx, context.workspaceId);
            const newUsedBytes = usage.usedBytes + input.data.length;
            if (newUsedBytes > usage.quotaBytes) {
                throw new QuotaExceededError('Workspace storage quota exceeded');
            }
            // Generate file ID and encryption key
            const fileId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateFileId"])();
            const dek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateDataEncryptionKey"])();
            // Encrypt the file
            const envelope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptFile"])(input.data, dek);
            const storedDekEnvelope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeDekEnvelope"])(envelope);
            const storedCiphertext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeFileCiphertext"])(envelope);
            const encryptedDekB64 = storedDekEnvelope.toString('base64');
            // Upload to storage
            const storageKey = `${context.workspaceId}/${fileId}`;
            await this.storage.put(storageKey, {
                data: storedCiphertext,
                contentType: 'application/octet-stream',
                metadata: {
                    workspaceId: context.workspaceId,
                    fileId: fileId
                }
            });
            // Create file record
            const file = {
                id: fileId,
                workspaceId: context.workspaceId,
                entityType: input.entityType,
                entityId: input.entityId,
                uploadedByUserId: context.userId,
                name: input.name,
                mimeType: input.mimeType,
                sizeBytes: BigInt(input.data.length),
                status: 'uploading',
                failureReason: null,
                storageKey: storageKey,
                encryptedDekB64: encryptedDekB64,
                categoryTag: input.categoryTag ?? null,
                caption: input.caption ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            };
            await trx('files').insert(file);
            // Record event
            await trx('fileEvents').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                fileId: fileId,
                workspaceId: context.workspaceId,
                actorId: context.userId,
                eventType: 'created',
                metadata: {
                    name: input.name,
                    sizeBytes: input.data.length
                },
                createdAt: new Date()
            });
            // Update usage
            await trx('workspaceStorageUsage').where({
                workspaceId: context.workspaceId
            }).update({
                usedBytes: newUsedBytes
            });
            return dto(file);
        });
    }
    async downloadFile(context, fileId) {
        return await this.db.transaction(async (trx)=>{
            // Get file record
            const row = await trx('files').where({
                id: fileId,
                workspaceId: context.workspaceId,
                deletedAt: null
            }).first();
            if (!row) {
                throw new FileNotFoundError('File not found');
            }
            // Check file is ready
            if (row.status !== 'ready') {
                throw new FileStorageError(`Cannot download file in ${row.status} status`);
            }
            // Retrieve from storage
            const encryptedData = await this.storage.get(row.storageKey);
            const { fileIv, fileAuthTag, ciphertext } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deserializeFileCiphertext"])(encryptedData);
            const { dekIv, dekAuthTag, encryptedDek } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deserializeDekEnvelope"])(Buffer.from(row.encryptedDekB64, 'base64'));
            const envelope = {
                dekIv,
                dekAuthTag,
                encryptedDek,
                fileIv,
                fileAuthTag,
                ciphertext
            };
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptFile"])(envelope);
            // Record download event
            await trx('fileEvents').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                fileId: fileId,
                workspaceId: context.workspaceId,
                actorId: context.userId,
                eventType: 'downloaded',
                metadata: {
                    ipAddress: null
                },
                createdAt: new Date()
            });
            return result.plaintext;
        });
    }
    async removeFile(context, fileId) {
        return await this.db.transaction(async (trx)=>{
            // Get file record
            const row = await trx('files').where({
                id: fileId,
                workspaceId: context.workspaceId,
                deletedAt: null
            }).first();
            if (!row) {
                throw new FileNotFoundError('File not found');
            }
            // Mark as deleted (tombstone)
            await trx('files').where({
                id: fileId
            }).update({
                deletedAt: new Date()
            });
            // Delete from storage
            try {
                await this.storage.delete(row.storageKey);
            } catch  {
                // Log but don't fail if storage deletion fails
                console.error(`Failed to delete file ${fileId} from storage`);
            }
            // Record event
            await trx('fileEvents').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                fileId: fileId,
                workspaceId: context.workspaceId,
                actorId: context.userId,
                eventType: 'removed',
                metadata: {
                    name: row.name
                },
                createdAt: new Date()
            });
            // Update usage
            const currentUsage = await trx('workspaceStorageUsage').where({
                workspaceId: context.workspaceId
            }).first();
            if (currentUsage) {
                const newUsedBytes = Math.max(0, Number(currentUsage.usedBytes) - Number(row.sizeBytes));
                await trx('workspaceStorageUsage').where({
                    workspaceId: context.workspaceId
                }).update({
                    usedBytes: newUsedBytes
                });
            }
        });
    }
    async listEntityFiles(context, entityType, entityId) {
        const rows = await this.db('files').where({
            workspaceId: context.workspaceId,
            entityType,
            entityId,
            deletedAt: null
        }).orderBy('createdAt', 'desc');
        return rows.map(dto);
    }
    async getStorageUsage(trx, workspaceId) {
        let usage = await trx('workspaceStorageUsage').where({
            workspaceId
        }).first();
        if (!usage) {
            // Initialize with default free tier quota
            const quotaBytes = DEFAULT_QUOTAS_BY_PLAN.free;
            await trx('workspaceStorageUsage').insert({
                workspaceId,
                usedBytes: 0,
                quotaBytes,
                lastReconciled: new Date()
            });
            usage = {
                usedBytes: BigInt(0),
                quotaBytes
            };
        }
        return {
            usedBytes: Number(usage.usedBytes),
            quotaBytes: Number(usage.quotaBytes),
            percentUsed: Math.round(Number(usage.usedBytes) / Number(usage.quotaBytes) * 100)
        };
    }
    async markFileReady(trx, fileId) {
        await trx('files').where({
            id: fileId
        }).update({
            status: 'ready',
            updatedAt: new Date()
        });
    }
    async markFileFailed(trx, fileId, reason) {
        await trx('files').where({
            id: fileId
        }).update({
            status: 'failed',
            failureReason: reason,
            updatedAt: new Date()
        });
    }
    /**
   * Store a thumbnail for a file (called by worker).
   * Encrypts the thumbnail the same way as the main file.
   */ async storeThumbnail(trx, fileId, thumbnailBytes) {
        const file = await trx('files').where({
            id: fileId
        }).first();
        if (!file) {
            throw new FileNotFoundError(`File ${fileId} not found`);
        }
        // Generate storage key and encryption key for thumbnail
        const thumbnailKey = `${file.storageKey}-thumbnail`;
        const envelope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptFile"])(thumbnailBytes);
        const { dekIv, dekAuthTag, encryptedDek } = envelope;
        // Store encrypted thumbnail in S3
        const serialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeFileCiphertext"])(envelope);
        await this.storage.put(thumbnailKey, {
            data: serialized
        });
        // Update file record with thumbnail metadata
        const dekEnvelopeBuffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeDekEnvelope"])(envelope);
        await trx('files').where({
            id: fileId
        }).update({
            thumbnailStorageKey: thumbnailKey,
            thumbnailEncryptedDekB64: dekEnvelopeBuffer.toString('base64'),
            thumbnailSizeBytes: BigInt(thumbnailBytes.length),
            updatedAt: new Date()
        });
    }
    /**
   * Store the original HEIC when it has been converted to JPEG.
   * The main file record is now JPEG; this stores the original HEIC for reference.
   */ async storeHeicOriginal(trx, fileId, heicBytes) {
        const file = await trx('files').where({
            id: fileId
        }).first();
        if (!file) {
            throw new FileNotFoundError(`File ${fileId} not found`);
        }
        // Generate storage key and encryption key for HEIC original
        const heicKey = `${file.storageKey}-heic-original`;
        const envelope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptFile"])(heicBytes);
        // Store encrypted HEIC in S3
        const serialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeFileCiphertext"])(envelope);
        await this.storage.put(heicKey, {
            data: serialized
        });
        // Update file record with HEIC original metadata
        const dekEnvelopeBuffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeDekEnvelope"])(envelope);
        await trx('files').where({
            id: fileId
        }).update({
            heicOriginalStorageKey: heicKey,
            heicOriginalEncryptedDekB64: dekEnvelopeBuffer.toString('base64'),
            updatedAt: new Date()
        });
    }
    /**
   * Get a file record for processing (used by worker).
   */ async getFileForProcessing(fileId) {
        const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(this.db('files'), 'files.workspaceId').where({
            id: fileId
        }).first();
        return row || null;
    }
    /**
   * Get files in uploading/scanning status for processing (used by orphan sweeper).
   */ async getFilesForProcessing(statuses, limit = 100) {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(this.db('files'), 'files.workspaceId').whereIn('status', statuses).orderBy('createdAt', 'asc').limit(limit);
    }
}
async function createFileStore(db, storage) {
    return new FileStore(db, storage);
}
}),
"[project]/packages/data/src/files/thumbnail-processor.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "convertHeicToJpeg",
    ()=>convertHeicToJpeg,
    "generateThumbnail",
    ()=>generateThumbnail,
    "isHeic",
    ()=>isHeic,
    "isProcessableImage",
    ()=>isProcessableImage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, esm_import, [project]/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_THUMBNAIL_OPTIONS = {
    width: 256,
    height: 256,
    fit: 'cover'
};
async function generateThumbnail(imageBytes, options = {}) {
    const opts = {
        ...DEFAULT_THUMBNAIL_OPTIONS,
        ...options
    };
    try {
        const metadata = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(imageBytes).metadata();
        // Only generate thumbnails for images
        if (!metadata.format || ![
            'jpeg',
            'png',
            'webp',
            'gif',
            'heif'
        ].includes(metadata.format)) {
            return null;
        }
        const thumbnail = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(imageBytes).rotate() // auto-rotate based on EXIF
        .resize(opts.width, opts.height, {
            fit: opts.fit,
            withoutEnlargement: true
        }).webp({
            quality: 80
        }).toBuffer();
        return thumbnail;
    } catch  {
        return null;
    }
}
async function convertHeicToJpeg(heicBytes) {
    try {
        const metadata = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(heicBytes).metadata();
        // Only convert HEIC/HEIF files
        if (metadata.format !== 'heif') {
            return null;
        }
        const jpeg = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(heicBytes).rotate() // auto-rotate based on EXIF
        .jpeg({
            quality: 90,
            progressive: true
        }).toBuffer();
        return jpeg;
    } catch  {
        return null;
    }
}
async function isHeic(imageBytes) {
    try {
        const metadata = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(imageBytes).metadata();
        return metadata.format === 'heif';
    } catch  {
        return false;
    }
}
async function isProcessableImage(fileBytes) {
    try {
        const metadata = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(fileBytes).metadata();
        return !!metadata.format && [
            'jpeg',
            'png',
            'webp',
            'gif',
            'heif'
        ].includes(metadata.format);
    } catch  {
        return false;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/data/src/gantt/read.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ganttJobLimit",
    ()=>ganttJobLimit,
    "readGantt",
    ()=>readGantt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$gantt$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/gantt.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/jobs/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
const ganttJobLimit = 300;
/** Closed jobs stay on the chart this long after their last date so recent history is visible. */ const closedJobVisibleDays = 90;
const teamSelect = `(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`;
const formatJobNumber = (n)=>`J-${String(n).padStart(4, '0')}`;
const formatWorkOrderNumber = (n)=>`WO-${String(n).padStart(4, '0')}`;
async function readGantt(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$gantt$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canViewGantt"])(context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const workspace = await trx('workspaces').where({
            id: context.workspaceId
        }).first('timezone');
        const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [
            workspace.timezone
        ])).rows[0];
        const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
        const nameOf = (id)=>id ? members.find((member)=>member.id === id)?.name ?? 'Former teammate' : null;
        const jobRows = await trx('jobs as j').where('j.workspaceId', context.workspaceId).andWhere((q)=>q.whereNotIn('j.status', [
                'completed',
                'canceled'
            ]).orWhereRaw(`coalesce(j."completionDeadline", j."scheduledDate") >= ?::date - ?::int`, [
                today,
                closedJobVisibleDays
            ])).select('j.id', 'j.jobNumber', 'j.title', 'j.status', 'j.customerId', 'j.customerName', 'j.primaryOwnerId', trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`), trx.raw(teamSelect)).orderByRaw('j."scheduledDate" ASC NULLS LAST').orderBy('j.jobNumber').limit(ganttJobLimit + 1);
        const truncated = jobRows.length > ganttJobLimit;
        const visibleJobs = truncated ? jobRows.slice(0, ganttJobLimit) : jobRows;
        const orderRows = visibleJobs.length ? await trx('workOrders as w').where('w.workspaceId', context.workspaceId).whereNull('w.archivedAt').whereIn('w.jobId', visibleJobs.map((job)=>job.id)).select('w.id', 'w.jobId', 'w.workOrderNumber', 'w.title', 'w.status', 'w.primaryAssigneeId', trx.raw(`to_char(w."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), trx.raw(`CASE WHEN w.status = 'completed' THEN to_char(w."completedAt" AT TIME ZONE ?, 'YYYY-MM-DD') END AS "completionDate"`, [
            workspace.timezone
        ])).orderByRaw('w."scheduledDate" ASC NULLS LAST').orderBy('w.workOrderNumber') : [];
        const ordersByJob = new Map();
        for (const row of orderRows){
            const order = {
                id: row.id,
                jobId: row.jobId,
                number: formatWorkOrderNumber(row.workOrderNumber),
                title: row.title,
                status: row.status,
                scheduledDate: row.scheduledDate,
                completionDate: row.completionDate,
                assigneeId: row.primaryAssigneeId,
                assigneeName: nameOf(row.primaryAssigneeId)
            };
            ordersByJob.set(row.jobId, [
                ...ordersByJob.get(row.jobId) ?? [],
                order
            ]);
        }
        const jobs = visibleJobs.map((row)=>({
                id: row.id,
                number: formatJobNumber(row.jobNumber),
                title: row.title,
                status: row.status,
                customerId: row.customerId,
                customerName: row.customerName,
                scheduledDate: row.scheduledDate,
                completionDeadline: row.completionDeadline,
                primaryOwnerId: row.primaryOwnerId,
                primaryOwnerName: nameOf(row.primaryOwnerId),
                teamUserIds: row.teamUserIds,
                overdue: !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$jobs$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isClosedJob"])(row.status) && !!row.completionDeadline && row.completionDeadline < today,
                workOrders: ordersByJob.get(row.id) ?? []
            }));
        const customers = [
            ...new Map(jobs.map((job)=>[
                    job.customerId,
                    {
                        id: job.customerId,
                        name: job.customerName
                    }
                ])).values()
        ].sort((a, b)=>a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
        return {
            jobs,
            teamMembers: members,
            customers,
            today,
            truncated
        };
    });
}
}),
"[project]/packages/data/src/lead-assignment-settings/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadAssignmentSettingsConflict",
    ()=>LeadAssignmentSettingsConflict,
    "LeadAssignmentSettingsInvalid",
    ()=>LeadAssignmentSettingsInvalid,
    "LeadAssignmentSettingsUnavailable",
    ()=>LeadAssignmentSettingsUnavailable,
    "readLeadAssignmentSettings",
    ()=>readLeadAssignmentSettings,
    "resolveCaptureAssignment",
    ()=>resolveCaptureAssignment,
    "saveLeadAssignmentSettings",
    ()=>saveLeadAssignmentSettings
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$assignment$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-assignment-settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
;
;
;
;
class LeadAssignmentSettingsConflict extends Error {
}
class LeadAssignmentSettingsInvalid extends Error {
}
class LeadAssignmentSettingsUnavailable extends Error {
}
function requireAccess(context, write = false) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'settings.business.read'
    }).allowed || write && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'settings.business.update'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
async function availableTeammate(db, workspaceId, userId) {
    return !!await db('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
        'm.workspaceId': workspaceId,
        'm.userId': userId
    }).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').first('u.id');
}
async function resolveCaptureAssignment(db, workspaceId, assignment) {
    if (assignment.kind === 'teammate') {
        const ready = await availableTeammate(db, workspaceId, assignment.teammateId);
        return {
            ready,
            assigneeId: ready ? assignment.teammateId : null,
            settingVersion: null,
            basis: 'source',
            ...!ready ? {
                reason: 'unavailable_teammate'
            } : {}
        };
    }
    const row = await db('leadAssignmentSettings').where({
        workspaceId
    }).first('value', 'version');
    const base = {
        assigneeId: null,
        settingVersion: row?.version ?? null,
        basis: 'business_default'
    };
    if (!row) return {
        ...base,
        ready: false,
        reason: 'missing_rule'
    };
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$assignment$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultLeadAssignmentRuleSchema"].safeParse(row.value);
    if (!parsed.success || !Number.isInteger(row.version) || row.version < 1) return {
        ...base,
        ready: false,
        reason: 'invalid_rule'
    };
    if (parsed.data.kind === 'unassigned') return {
        ...base,
        ready: true
    };
    const ready = await availableTeammate(db, workspaceId, parsed.data.teammateId);
    return {
        ...base,
        ready,
        assigneeId: ready ? parsed.data.teammateId : null,
        ...!ready ? {
            reason: 'unavailable_teammate'
        } : {}
    };
}
async function snapshot(trx, context) {
    const row = await trx('leadAssignmentSettings').where({
        workspaceId: context.workspaceId
    }).first();
    if (!row) throw new LeadAssignmentSettingsUnavailable();
    const teammates = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$assignment$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadAssignmentSettingsSnapshotSchema"].safeParse({
        workspaceId: context.workspaceId,
        version: row.version,
        value: row.value,
        teammates,
        canManage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'settings.business.update'
        }).allowed
    });
    if (!parsed.success) throw new LeadAssignmentSettingsUnavailable();
    return parsed.data;
}
async function readLeadAssignmentSettings(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        requireAccess(context);
        return snapshot(trx, context);
    });
}
async function saveLeadAssignmentSettings(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$assignment$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveLeadAssignmentSettingsSchema"].safeParse(raw);
    if (!parsed.success) throw new LeadAssignmentSettingsInvalid();
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireAccess(context, true);
        const current = await snapshot(trx, context);
        const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(input)).digest('hex');
        const receipt = await trx('leadAssignmentSettingsAudit').where({
            workspaceId: identity.workspaceId,
            requestId: input.requestId
        }).first();
        if (receipt) {
            if (receipt.actorId !== identity.userId || receipt.inputHash !== hash || current.version !== receipt.afterVersion) throw new LeadAssignmentSettingsConflict();
            return current;
        }
        if (current.version !== input.expectedVersion) throw new LeadAssignmentSettingsConflict();
        if (input.value.kind === 'teammate' && !await availableTeammate(trx, identity.workspaceId, input.value.teammateId)) throw new LeadAssignmentSettingsInvalid();
        const updated = await trx('leadAssignmentSettings').where({
            workspaceId: identity.workspaceId,
            version: input.expectedVersion
        }).update({
            value: JSON.stringify(input.value),
            version: current.version + 1,
            updatedAt: trx.fn.now()
        });
        if (updated !== 1) throw new LeadAssignmentSettingsConflict();
        await trx('leadAssignmentSettingsAudit').insert({
            workspaceId: identity.workspaceId,
            requestId: input.requestId,
            actorId: identity.userId,
            inputHash: hash,
            beforeVersion: current.version,
            afterVersion: current.version + 1,
            beforeValue: JSON.stringify(current.value),
            afterValue: JSON.stringify(input.value)
        });
        return snapshot(trx, context);
    });
}
}),
"[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$database$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/database.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/auth-pool.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/jobs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-completion.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-jobs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-leads.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-first-quoted.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-scheduled.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-unscheduled.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-review.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-materials.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-estimates.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export-access.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export-projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$knowledge$2f$embeddings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/knowledge/embeddings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$knowledge$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/knowledge/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$checkpoints$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/checkpoints.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/ai-usage.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/feature-flags.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$rollout$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/rollout-flags.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/events.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$summary$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/billing/summary.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$billing$2d$management$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/admin-billing-management.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$plan$2d$changes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/plan-changes.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$account$2d$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/account-deletion.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$data$2d$requests$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/admin-data-requests.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$suspension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/suspension.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$account$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/account-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$team$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/workspaces/team-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/workspaces/invitation-tokens.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$invitations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/admin-invitations.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$payment$2d$methods$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/payment-methods.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$payment$2d$recovery$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/payment-recovery.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/plan-override.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$invoices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/invoices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$stage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/stage.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/notes.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$update$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/update.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$assign$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/assign.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$delivery$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/delivery.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$archive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/archive.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$delete$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/delete.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$context$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/chat-context.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$origin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/origin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$chat$2d$search$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/chat-search.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$owner$2d$stamp$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/owner-stamp.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$chat$2d$evidence$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/chat-evidence.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$mutations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/mutations.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$mutations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/mutations.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$storage$2d$adapter$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/storage-adapter.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/encryption.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$thumbnail$2d$processor$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/thumbnail-processor.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$commands$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/commands.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/sync.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$gantt$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/gantt/read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$visits$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/visits.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$job$2d$notification$2d$settings$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/job-notification-settings/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$drafts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-drafts.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$sharing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-sharing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$decisions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-decisions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$draft$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-draft-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$voids$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-voids.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$archives$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-archives.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$draft$2d$deletes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-draft-deletes.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$conversions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-conversions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$business$2d$profile$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/business-profile.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$decisions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/decisions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lead$2d$stage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/lead-stage.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$conversion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/conversion.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$expiry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/expiry.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/delivery.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$deadline$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/deadline.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$deadlines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/deadlines.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$jobs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/jobs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$chat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/chat.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$proposals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/proposals.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/publication.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/lifecycle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$delivery$2d$policy$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/delivery-policy.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-assignment-settings/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/public.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$admission$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/admission.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$submissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/submissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/assistant-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$proposals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/setup-proposals.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$duplicate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/duplicate.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$source$2d$proposals$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/source-proposals.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview-export.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$template$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/template.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$checkpoints$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$thumbnail$2d$processor$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$business$2d$profile$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$checkpoints$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$thumbnail$2d$processor$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$business$2d$profile$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateEmailDeliveryAvailable",
    ()=>estimateEmailDeliveryAvailable,
    "localEstimateEmailDeliveryAvailable",
    ()=>localEstimateEmailDeliveryAvailable,
    "sendEmail",
    ()=>sendEmail,
    "sendEstimateEmail",
    ()=>sendEstimateEmail,
    "sendLocalEstimateEmail",
    ()=>sendLocalEstimateEmail,
    "verifyEmailDelivery",
    ()=>verifyEmailDelivery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nodemailer$40$10$2e$0$2e$16$2f$node_modules$2f$nodemailer$2f$dist$2f$esm$2f$nodemailer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/nodemailer@10.0.16/node_modules/nodemailer/dist/esm/nodemailer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$rollout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/rollout.ts [app-rsc] (ecmascript)");
;
;
const localTransport = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nodemailer$40$10$2e$0$2e$16$2f$node_modules$2f$nodemailer$2f$dist$2f$esm$2f$nodemailer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].createTransport({
    host: '127.0.0.1',
    port: 11025,
    secure: false,
    ignoreTLS: true,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000
});
function emailConfiguration(baseURL) {
    const url = new URL(baseURL);
    const local = [
        '127.0.0.1',
        'localhost',
        '[::1]'
    ].includes(url.hostname);
    const provider = process.env.EMAIL_PROVIDER ?? 'mailpit';
    if (provider === 'mailpit' && local) return {
        provider: 'mailpit',
        from: 'SalesMora.ai <no-reply@salesmora.test>'
    };
    if (provider !== 'resend' || local || url.protocol !== 'https:') throw new Error('Email transport is not configured for this app origin.');
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key || !from || /[\r\n]/.test(from) || !/^[^<>]*<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>$/.test(from)) {
        throw new Error('Email provider credentials or sender are missing or invalid.');
    }
    return {
        provider: 'resend',
        from,
        key
    };
}
async function verifyEmailDelivery(baseURL) {
    const config = emailConfiguration(baseURL);
    if (config.provider === 'mailpit') await localTransport.verify();
}
async function sendEmail(message, baseURL) {
    const config = emailConfiguration(baseURL);
    if (config.provider === 'mailpit') {
        const { idempotencyKey, ...payload } = message;
        const result = await localTransport.sendMail({
            ...payload,
            ...idempotencyKey ? {
                messageId: `<${idempotencyKey}@salesmora.test>`
            } : {},
            from: config.from
        });
        if (typeof result.messageId !== 'string' || !result.messageId) throw new Error('Invalid SMTP delivery receipt.');
        return {
            providerMessageId: result.messageId
        };
    }
    // Durable assignment retries supply a stable provider idempotency key; ordinary mail callers do not retry here.
    // Never surface provider bodies, recipients, credentials or token-bearing links.
    try {
        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                ...message.idempotencyKey ? {
                    'Idempotency-Key': message.idempotencyKey
                } : {}
            },
            body: JSON.stringify({
                subject: message.subject,
                text: message.text,
                html: message.html,
                from: config.from,
                to: [
                    message.to
                ],
                ...message.replyTo ? {
                    reply_to: message.replyTo
                } : {},
                attachments: message.attachments?.map((attachment)=>({
                        filename: attachment.filename,
                        content: attachment.content.toString('base64'),
                        content_type: attachment.contentType,
                        content_id: attachment.cid
                    }))
            }),
            signal: AbortSignal.timeout(10_000),
            cache: 'no-store'
        };
        const response = await fetch('https://api.resend.com/emails', options);
        if (!response.ok) throw new Error('Email provider rejected delivery.');
        const result = await response.json();
        if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id) throw new Error('Invalid email provider response.');
        return {
            providerMessageId: result.id
        };
    } catch  {
        throw new Error('Email delivery is temporarily unavailable.');
    }
}
function localEstimateEmailDeliveryAvailable(baseURL, provider = process.env.EMAIL_PROVIDER ?? 'mailpit') {
    if (!baseURL) return false;
    return provider === 'mailpit' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$rollout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateSharingAvailable"])(baseURL);
}
function estimateEmailDeliveryAvailable(baseURL) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$rollout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateSharingAvailable"])(baseURL, {
        environment: process.env.RAILWAY_ENVIRONMENT_NAME,
        enabled: process.env.ESTIMATE_EMAIL_ENABLED === 'true'
    })) return false;
    try {
        emailConfiguration(baseURL);
        return true;
    } catch  {
        return false;
    }
}
async function sendEstimateEmail(message, baseURL, queuedAt) {
    if (!estimateEmailDeliveryAvailable(baseURL) || !message.idempotencyKey || !/^estimate-delivery-[0-9a-f-]{36}$/.test(message.idempotencyKey)) {
        throw new Error('Estimate email delivery is not configured or has no stable delivery key.');
    }
    if (localEstimateEmailDeliveryAvailable(baseURL)) return sendLocalEstimateEmail(message, baseURL);
    const age = Date.now() - new Date(queuedAt).getTime();
    if (!Number.isFinite(age) || age < 0 || age >= 23 * 60 * 60 * 1000) {
        throw new Error('Estimate delivery window expired. Review and resend the estimate.');
    }
    return sendEmail(message, baseURL);
}
async function sendLocalEstimateEmail(message, baseURL) {
    if (!localEstimateEmailDeliveryAvailable(baseURL) || !message.idempotencyKey || !/^estimate-delivery-[0-9a-f-]{36}$/.test(message.idempotencyKey)) {
        throw new Error('Estimate email delivery requires local Mailpit and a stable delivery key.');
    }
    const messageId = `${message.idempotencyKey}@salesmora.test`;
    const url = new URL('http://127.0.0.1:18025/api/v1/search');
    url.searchParams.set('query', `message-id:${messageId}`);
    try {
        const options = {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        };
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Mailpit lookup failed.');
        const result = await response.json();
        if (!result || typeof result !== 'object' || !('messages' in result) || !Array.isArray(result.messages) || !('messages_count' in result) || !Number.isSafeInteger(result.messages_count) || result.messages_count !== result.messages.length) {
            throw new Error('Invalid Mailpit lookup.');
        }
        for (const item of result.messages){
            if (!item || typeof item !== 'object' || !('MessageID' in item) || typeof item.MessageID !== 'string') {
                throw new Error('Invalid Mailpit message receipt.');
            }
            if (item.MessageID.replace(/^<|>$/g, '') === messageId) return {
                providerMessageId: `<${messageId}>`
            };
        }
        if (result.messages.length) throw new Error('Ambiguous Mailpit message lookup.');
        return await sendEmail(message, baseURL);
    } catch  {
        throw new Error('Local estimate email delivery is temporarily unavailable.');
    }
}
}),
"[project]/packages/data/src/email/email-brand.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Email equivalents of the approved palette; no remote fonts or tracking assets. */ __turbopack_context__.s([
    "emailBrandData",
    ()=>emailBrandData
]);
const emailBrandData = {
    primary: '#3B6FA5',
    ink: '#23384D',
    muted: '#52677B',
    canvas: '#F4F8FC',
    paper: '#FFFFFF',
    line: '#E2EAF1',
    font: "'Source Sans 3','Segoe UI',Arial,sans-serif",
    contentWidth: 560,
    logoWidth: 224,
    logoHeight: 60
};
}),
"[project]/packages/data/src/email/team-invitation.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "teamInvitationEmailData",
    ()=>teamInvitationEmailData
]);
const teamInvitationEmailData = {
    brand: 'SalesMora.ai',
    heading: 'You’re invited to join the team',
    subject: (workspace)=>`Join ${workspace} on SalesMora.ai`,
    preheader: 'Accept your invitation to work with your team on SalesMora.ai.',
    introduction: (inviter, workspace)=>`${inviter} invited you to join ${workspace} on SalesMora.ai.`,
    access: (role)=>`Your invitation includes the ${role} permission role.`,
    roles: {
        field: 'Field',
        office: 'Office',
        admin: 'Admin'
    },
    purpose: 'Accept this invitation using the email address it was sent to. You’ll join this workspace without creating a new business workspace.',
    action: 'Accept invitation',
    expiry: 'This invitation expires in 7 days.',
    ignore: 'If you were not expecting this invitation, you can ignore this email. You will not join the workspace unless you accept.',
    fallback: 'If the button does not work, copy and paste this link into your browser:',
    logoCid: 'cid:salesmora-logo',
    stories: {
        title: 'Team invitation email template',
        notice: 'Email preview. The link is fictional and cannot join a workspace.',
        frame: 'Team invitation email HTML preview',
        textHeading: 'Plain-text invitation',
        subject: 'Subject',
        url: 'http://127.0.0.1:3000/accept-invitation?token=preview-token-not-valid',
        longUrl: `http://127.0.0.1:3000/accept-invitation?token=fictional-preview-only-${'0123456789abcdefghijklmnopqrstuvwxyz'.repeat(4)}`,
        inviter: 'Alex Rivera',
        workspace: 'Northstar Plumbing',
        longInviter: 'Alexandra Rivera of the Northstar Operations and Customer Care Team',
        longWorkspace: 'Northstar Property Maintenance, Construction and Professional Services',
        escapedWorkspace: 'Northstar <script>fictional</script> & Partners',
        escapedInviter: 'Alex <Rivera> & Team',
        logoSrc: '/branding/salesmora-email-logo.png',
        previewRecipient: 'invitation-preview@salesmora.test'
    }
};
}),
"[project]/packages/data/src/email/team-invitation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderTeamInvitationEmail",
    ()=>renderTeamInvitationEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/email-brand.data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/team-invitation.data.ts [app-rsc] (ecmascript)");
;
;
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
}
function renderTeamInvitationEmail({ url, inviterName, workspaceName, role }, logoSrc = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].logoCid) {
    const parsed = new URL(url);
    if (![
        'https:',
        'http:'
    ].includes(parsed.protocol)) throw new Error('Invitation links must use HTTP or HTTPS.');
    const link = escapeHtml(parsed.href);
    const subject = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].subject(workspaceName.replace(/[\r\n]+/g, ' '));
    const introduction = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].introduction(inviterName, workspaceName);
    const access = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].access(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].roles[role]);
    return {
        subject,
        text: [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].brand,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].heading,
            introduction,
            access,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].purpose,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].action,
            parsed.href,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].expiry,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].ignore,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].fallback,
            parsed.href
        ].join('\n\n'),
        html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].canvas};color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].ink};font-family:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].font};line-height:1.5;overflow-wrap:anywhere">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].contentWidth}px;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].paper};border:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].line};border-radius:16px"><tr><td style="padding:24px">
<img src="${escapeHtml(logoSrc)}" alt="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].brand}" width="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoWidth}" height="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoHeight}" style="display:block;width:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].heading}</h1>
<p style="margin:0 0 16px">${escapeHtml(introduction)}</p><p style="margin:0 0 24px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted}">${escapeHtml(access)}</p><p style="margin:0 0 24px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted}">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].purpose}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].paper};border:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};border-radius:8px;font-weight:bold;text-decoration:none">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].action}</a></td></tr></table>
<p style="margin:0 0 16px;font-weight:bold">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].expiry}</p><p style="margin:0 0 24px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted}">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].ignore}</p>
<hr style="border:0;border-top:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].line};margin:0 0 24px">
<p style="margin:0 0 12px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted};font-size:14px">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamInvitationEmailData"].fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};word-break:break-all">${link}</a></p>
</td></tr></table></td></tr></table></body></html>`
    };
}
}),
"[project]/packages/data/src/email/email-verification.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emailVerificationEmailData",
    ()=>emailVerificationEmailData
]);
const emailVerificationEmailData = {
    subject: 'Verify your SalesMora.ai email',
    brand: 'SalesMora.ai',
    heading: 'Verify your email',
    preheader: 'Confirm your email address to enable teammate invitations.',
    introduction: 'Confirm this email address for your SalesMora.ai account.',
    purpose: 'You can keep using your workspace while verification is pending. Verify your email before sending teammate invitations.',
    action: 'Verify email',
    expiry: 'This link expires in 1 hour.',
    ignore: 'If you did not create a SalesMora.ai account or request this email, you can ignore it.',
    fallback: 'If the button does not work, copy and paste this link into your browser:',
    logoCid: 'cid:salesmora-logo',
    stories: {
        title: 'Email verification template',
        notice: 'Email preview. The link is fictional and cannot verify an account.',
        frame: 'Verification email HTML preview',
        textHeading: 'Plain-text email',
        subject: 'Subject',
        url: 'http://127.0.0.1:3000/api/auth/verify-email?token=preview-token-not-valid&callbackURL=%2Fhome',
        longUrl: 'http://127.0.0.1:3000/api/auth/verify-email?token=fictional-long-verification-token-for-layout-review-only-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789&callbackURL=%2Fhome',
        escapedUrl: 'http://127.0.0.1:3000/api/auth/verify-email?token=%22%3E%3Cscript%3Efictional%3C%2Fscript%3E&callbackURL=%2Fhome',
        logoSrc: '/branding/salesmora-email-logo.png',
        previewRecipient: 'verification-preview@salesmora.test'
    }
};
}),
"[project]/packages/data/src/email/email-verification.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderEmailVerificationEmail",
    ()=>renderEmailVerificationEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/email-brand.data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/email-verification.data.ts [app-rsc] (ecmascript)");
;
;
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
}
function renderEmailVerificationEmail(url, logoSrc = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].logoCid) {
    const parsed = new URL(url);
    if (![
        'https:',
        'http:'
    ].includes(parsed.protocol)) throw new Error('Verification links must use HTTP or HTTPS.');
    const link = escapeHtml(parsed.href);
    return {
        subject: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].subject,
        text: [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].brand,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].heading,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].introduction,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].purpose,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].action,
            parsed.href,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].expiry,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].ignore,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].fallback,
            parsed.href
        ].join('\n\n'),
        html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].subject}</title></head>
<body style="margin:0;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].canvas};color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].ink};font-family:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].font};line-height:1.5">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].contentWidth}px;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].paper};border:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].line};border-radius:16px"><tr><td style="padding:24px">
<img src="${escapeHtml(logoSrc)}" alt="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].brand}" width="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoWidth}" height="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoHeight}" style="display:block;width:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].heading}</h1>
<p style="margin:0 0 16px">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].introduction}</p><p style="margin:0 0 24px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted}">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].purpose}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].paper};border:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};border-radius:8px;font-weight:bold;text-decoration:none">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].action}</a></td></tr></table>
<p style="margin:0 0 16px;font-weight:bold">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].expiry}</p><p style="margin:0 0 24px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted}">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].ignore}</p>
<hr style="border:0;border-top:1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].line};margin:0 0 24px">
<p style="margin:0 0 12px;color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].muted};font-size:14px">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailVerificationEmailData"].fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$brand$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailBrandData"].primary};word-break:break-all">${link}</a></p>
</td></tr></table></td></tr></table></body></html>`
    };
}
}),
"[project]/packages/data/src/email/password-reset.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "passwordResetEmailData",
    ()=>passwordResetEmailData
]);
const passwordResetEmailData = {
    subject: 'Reset your SalesMora.ai password',
    brand: 'SalesMora.ai',
    heading: 'Reset your password',
    introduction: 'We received a request to reset your SalesMora.ai password.',
    action: 'Choose a new password',
    expiry: 'This link expires in 30 minutes and can be used once.',
    ignore: 'If you did not request this, you can ignore this email. Your password will stay the same.',
    fallback: 'If the button does not work, copy and paste this link into your browser:'
};
}),
"[project]/packages/data/src/email/password-reset.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderPasswordResetEmail",
    ()=>renderPasswordResetEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/password-reset.data.ts [app-rsc] (ecmascript)");
;
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
}
function renderPasswordResetEmail(url) {
    const link = escapeHtml(url);
    return {
        subject: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].subject,
        text: [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].brand,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].heading,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].introduction,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].action,
            url,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].expiry,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].ignore
        ].join('\n\n'),
        html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].subject}</title></head>
<body style="margin:0;background:#F4F8FC;color:#23384D;font-family:Arial,sans-serif;line-height:1.5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E2EAF1;border-radius:16px"><tr><td style="padding:32px">
<p style="margin:0 0 24px;color:#3B6FA5;font-size:20px;font-weight:bold">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].brand}</p>
<h1 style="margin:0 0 16px;font-size:28px">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].heading}</h1><p>${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].introduction}</p>
<p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:12px 24px;background:#3B6FA5;color:#FFFFFF;border-radius:8px;font-weight:bold;text-decoration:none">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].action}</a></p>
<p>${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].expiry}</p><p style="color:#52677B">${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].ignore}</p><p>${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["passwordResetEmailData"].fallback}</p><p style="overflow-wrap:anywhere;word-break:break-all"><a href="${link}" style="color:#3B6FA5">${link}</a></p>
</td></tr></table></td></tr></table></body></html>`
    };
}
}),
"[project]/packages/data/src/admin-email-verification-signature.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminEmailVerificationSignatureHeaders",
    ()=>adminEmailVerificationSignatureHeaders,
    "signAdminEmailVerificationRequest",
    ()=>signAdminEmailVerificationRequest,
    "verifyAdminEmailVerificationRequest",
    ()=>verifyAdminEmailVerificationRequest
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const adminEmailVerificationSignatureHeaders = {
    timestamp: 'x-salesmora-admin-signature-timestamp',
    nonce: 'x-salesmora-admin-signature-nonce',
    signature: 'x-salesmora-admin-signature'
};
const routePath = '/send-verification-email';
const signatureWindowMilliseconds = 60_000;
function message(timestamp, nonce, email, callbackURL) {
    const body = JSON.stringify({
        email: email.trim().toLowerCase(),
        callbackURL
    });
    return `POST\n${routePath}\n${timestamp}\n${nonce}\n${body}`;
}
function validSecret(secret) {
    return Buffer.byteLength(secret, 'utf8') >= 32;
}
function signAdminEmailVerificationRequest(secret, email, callbackURL, now = Date.now(), nonce = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString('base64url')) {
    if (!validSecret(secret)) throw new Error('Admin email-verification secret must contain at least 32 bytes.');
    if (!Number.isSafeInteger(now) || now < 0) throw new Error('A valid signing timestamp is required.');
    if (!/^[\w-]{22}$/.test(nonce)) throw new Error('A valid request nonce is required.');
    const timestamp = String(now);
    const signature = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])('sha256', secret).update(message(timestamp, nonce, email, callbackURL)).digest('hex');
    return {
        timestamp,
        nonce,
        signature
    };
}
function verifyAdminEmailVerificationRequest(secret, headers, email, callbackURL, now = Date.now()) {
    if (!secret || !validSecret(secret)) return false;
    const timestamp = headers.get(adminEmailVerificationSignatureHeaders.timestamp);
    const nonce = headers.get(adminEmailVerificationSignatureHeaders.nonce);
    const signature = headers.get(adminEmailVerificationSignatureHeaders.signature);
    if (!timestamp || !/^\d{13}$/.test(timestamp) || !nonce || !/^[\w-]{22}$/.test(nonce) || !signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
    const signedAt = Number(timestamp);
    if (!Number.isSafeInteger(signedAt) || Math.abs(now - signedAt) > signatureWindowMilliseconds) return false;
    const expected = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])('sha256', secret).update(message(timestamp, nonce, email, callbackURL)).digest();
    const received = Buffer.from(signature, 'hex');
    return received.length === expected.length && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(received, expected);
}
}),
];

//# sourceMappingURL=packages_data_src_0aq3p0b._.js.map
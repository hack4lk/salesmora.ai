module.exports = [
"[project]/apps/web/src/server/estimates/sharing-availability.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configuredEstimateSharingAvailable",
    ()=>configuredEstimateSharingAvailable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$rollout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/rollout.ts [app-rsc] (ecmascript)");
;
function configuredEstimateSharingAvailable(origin = process.env.BETTER_AUTH_URL) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$rollout$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateSharingAvailable"])(origin, {
        environment: process.env.RAILWAY_ENVIRONMENT_NAME,
        enabled: process.env.ESTIMATE_EMAIL_ENABLED === 'true'
    });
}
}),
"[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "authorizedWorkspace",
    ()=>authorizedWorkspace,
    "enabledPermissions",
    ()=>enabledPermissions,
    "workspaceAuthorization",
    ()=>workspaceAuthorization,
    "workspaceCapabilities",
    ()=>workspaceCapabilities,
    "workspaceNavigationPages",
    ()=>workspaceNavigationPages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$gantt$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/gantt.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/feature-flags.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$estimates$2f$sharing$2d$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/estimates/sharing-availability.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const enabledPermissions = [
    'intake.read',
    'intake.update',
    'intake.approve',
    'intake.dismiss',
    'leadCapture.pause',
    'leadCapture.archive',
    'leadCapture.activate',
    'leadCapture.read',
    'leadCapture.create',
    'leadCapture.update',
    'calendar.read',
    'materials.read',
    'materials.propose',
    'materials.manage',
    'workorders.read',
    'workorders.view_prices',
    'workorders.view_costs',
    'workorders.create',
    'workorders.update',
    'workorders.schedule.update',
    'workorders.issue',
    'workorders.progress',
    'workorders.complete',
    'workorders.reopen',
    'workorders.cancel',
    'workorders.archive',
    'workorders.delete',
    'workorders.export',
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.assign',
    'jobs.status.update',
    'jobs.progress.create',
    'jobs.complete',
    'jobs.cancel',
    'jobs.reopen',
    'jobs.schedule.update',
    'customers.read',
    'customers.related.read',
    'customers.create',
    'customers.update',
    'customers.archive',
    'customers.delete',
    'customers.export',
    'workspace.delete',
    'home.access',
    'assistant.use',
    'leads.read',
    'leads.update',
    'leads.stage.update',
    'leads.archive',
    'leads.delete',
    'leads.export',
    'leads.create',
    'leads.assign',
    'estimates.read',
    'estimates.create',
    'estimates.update',
    'estimates.delete',
    'estimates.void',
    'estimates.decide',
    'estimates.archive',
    'estimates.export',
    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$estimates$2f$sharing$2d$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["configuredEstimateSharingAvailable"])() ? [
        'estimates.send'
    ] : [],
    'team.invite',
    'permissions.read',
    'permissions.manage',
    'settings.business.read',
    'settings.business.update',
    ...("TURBOPACK compile-time truthy", 1) ? [
        'reports.read',
        'reports.export',
        'reports.financial.read'
    ] : "TURBOPACK unreachable",
    ...process.env.BILLING_SANDBOX_ENABLED === 'true' ? [
        'billing.read',
        'billing.manage'
    ] : []
];
async function permissionsForWorkspace(workspaceId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$estimates$2f$sharing$2d$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["configuredEstimateSharingAvailable"])()) return enabledPermissions;
    const allowed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])(), 'estimate.sharing.enabled', workspaceId);
    return allowed ? enabledPermissions : enabledPermissions.filter((permission)=>permission !== 'estimates.send');
}
async function workspaceAuthorization(userId, workspaceId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(db, {
        userId,
        workspaceId
    }, await permissionsForWorkspace(workspaceId));
}
async function authorizedWorkspace(userId, workspaceId, write, use) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
        userId,
        workspaceId
    }, await permissionsForWorkspace(workspaceId), write, use);
}
function workspaceCapabilities(context) {
    return {
        jobNotifications: [
            'owner',
            'admin'
        ].includes(context.membership.role) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'settings.business.read'
        }).allowed,
        billing: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'billing.read'
        }).allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'billing.manage'
        }).allowed,
        home: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'home.access'
        }).allowed,
        assistant: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'assistant.use'
        }).allowed,
        readCalendar: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read').allowed,
        readGantt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$gantt$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canViewGantt"])(context),
        readJobs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read').allowed,
        readCustomers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'customers.read').allowed,
        readCaptureSources: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read').allowed,
        readIntake: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'intake.read').allowed,
        readLeads: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read').allowed,
        readEstimates: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read').allowed,
        readWorkOrders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read').allowed,
        // The catalog page is for people who manage it or propose items; everyone else reaches it through the work-order picker.
        materials: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'materials.manage'
        }).allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'materials.propose'
        }).allowed,
        createLead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.create'
        }).allowed,
        inviteField: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'team.invite',
            targetRole: 'field'
        }).allowed,
        permissions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'permissions.read'
        }).allowed,
        settings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'settings.business.read'
        }).allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'permissions.read'
        }).allowed,
        leadSettings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'settings.business.read'
        }).allowed,
        estimateBusinessSettings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'settings.business.read'
        }).allowed
    };
}
const upcomingNavigation = [
    {
        page: 'reports',
        permissions: [
            'reports.read'
        ]
    }
];
function workspaceNavigationPages(context) {
    const capabilities = workspaceCapabilities(context);
    const upcoming = upcomingNavigation.filter((item)=>item.permissions.some((permission)=>{
            const definition = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["permissionCatalog"][permission];
            return definition.reviewed && definition.eligibleRoles.includes(context.membership.role) && context.policy.grants.some((grant)=>grant.role === context.membership.role && grant.permission === permission);
        })).map((item)=>item.page);
    return [
        ...capabilities.readIntake ? [
            'intake'
        ] : [],
        ...capabilities.readCaptureSources ? [
            'campaigns'
        ] : [],
        ...capabilities.home ? [
            'home'
        ] : [],
        ...capabilities.readLeads ? [
            'leads'
        ] : [],
        ...capabilities.readCalendar ? [
            'calendar'
        ] : [],
        ...capabilities.readJobs ? [
            'jobs'
        ] : [],
        ...capabilities.readWorkOrders ? [
            'work-orders'
        ] : [],
        ...capabilities.materials ? [
            'materials'
        ] : [],
        ...capabilities.readCustomers ? [
            'customers'
        ] : [],
        ...capabilities.readEstimates ? [
            'estimates'
        ] : [],
        ...capabilities.estimateBusinessSettings ? [
            'estimate-settings'
        ] : [],
        ...capabilities.leadSettings ? [
            'lead-settings'
        ] : [],
        ...upcoming,
        ...capabilities.settings || capabilities.billing ? [
            'settings'
        ] : []
    ];
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "WorkspaceCapacityError",
    ()=>WorkspaceCapacityError,
    "createWorkspace",
    ()=>createWorkspace,
    "database",
    ()=>database,
    "findWorkspace",
    ()=>findWorkspace,
    "findWorkspaceRecord",
    ()=>findWorkspaceRecord,
    "workspaceSummary",
    ()=>workspaceSummary,
    "workspaceSuspendedPath",
    ()=>workspaceSuspendedPath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$database$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/database.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const globalStore = globalThis;
function database() {
    if (!process.env.DATABASE_URL) throw new Error("Missing database connection.");
    return globalStore.workspaceDatabase ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$database$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createDatabase"])(process.env.DATABASE_URL);
}
class WorkspaceCapacityError extends Error {
}
const workspaceSuspendedPath = "/workspace-suspended";
async function findWorkspaceRecord(userId, workspaceId) {
    const query = database()("workspaces").join("workspaceMemberships", "workspaces.id", "workspaceMemberships.workspaceId").where("workspaceMemberships.userId", userId).whereNull("workspaces.deletionRequestedAt").select("workspaces.*", "workspaceMemberships.role as membershipRole");
    if (workspaceId) query.where("workspaces.id", workspaceId);
    return query.orderByRaw('"workspaces"."suspendedAt" IS NOT NULL').orderBy("workspaces.createdAt").orderBy("workspaces.id").first();
}
async function findWorkspace(userId, workspaceId) {
    const workspace = await findWorkspaceRecord(userId, workspaceId);
    if (workspace?.suspendedAt) {
        // Loaded here so plain Node scripts (such as e2e helpers) can import this store outside Next.
        const { redirect } = await __turbopack_context__.A("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript, async loader)");
        redirect(workspaceSuspendedPath);
    }
    return workspace;
}
async function createWorkspace(userId, input) {
    return database().transaction(async (trx)=>{
        // Serialize onboarding submissions for this account, including simultaneous retries.
        const user = await trx("users").where({
            id: userId
        }).forUpdate().first();
        if (!user || user.deletionRequestedAt) throw new Error("Account unavailable.");
        const existing = await trx("workspaces").where({
            ownerId: userId
        }).first();
        if (existing) return {
            id: existing.id,
            created: false
        };
        if (input.team.invitations.some((invite)=>invite.email === user.email.toLowerCase())) throw new Error("Owner cannot be invited.");
        const plan = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspacePlanIdSchema"].parse(user.registrationPlan ?? "free");
        const billingEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])();
        if (billingEnabled && input.team.invitations.length + 1 > (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan).limits.teammates) throw new WorkspaceCapacityError("The selected plan does not have enough teammate seats.");
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx("workspaces").insert({
            id,
            ownerId: userId,
            ...input.business,
            postalCode: input.services.postalCode,
            serviceRange: input.services.serviceRange
        });
        await trx("workspaceMemberships").insert({
            workspaceId: id,
            userId,
            role: "owner"
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initializeWorkspacePolicy"])(trx, {
            userId,
            workspaceId: id
        });
        const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
            userId,
            workspaceId: id
        }, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["enabledPermissions"]);
        if (input.team.invitations.some((invite)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "team.invite",
                targetRole: invite.role
            }).allowed)) throw new Error("Invitation access denied.");
        await trx("workspaceServices").insert(input.services.services.map((service)=>({
                workspaceId: id,
                service
            })));
        if (billingEnabled) await trx("workspaceSubscriptions").insert({
            workspaceId: id,
            catalogVersion: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspacePlanCatalogVersion"],
            intendedPlan: plan,
            pendingInvitations: JSON.stringify(plan === "free" ? [] : input.team.invitations)
        });
        if ((!billingEnabled || plan === "free") && input.team.invitations.length) await trx("workspaceInvitations").insert(input.team.invitations.map((invite)=>({
                ...invite,
                inviterId: userId,
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workspaceId: id,
                status: user.emailVerified ? "queued" : "pending_verification"
            })));
        await trx("users").where({
            id: userId
        }).update({
            onboardingStatus: "complete",
            updatedAt: new Date()
        });
        return {
            id,
            created: true
        };
    });
}
async function workspaceSummary(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "team.invite",
            targetRole: "field"
        }).allowed) return {
            invitations: []
        };
        return {
            invitations: await trx("workspaceInvitations").where({
                workspaceId
            }).select("email", "role", "status")
        };
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/email/transport.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/apps/web/src/server/email/templates/team-invitation/team-invitation.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/team-invitation.ts [app-rsc] (ecmascript)");
;
}),
"[project]/apps/web/src/server/email/send-invitation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendInvitationEmail",
    ()=>sendInvitationEmail
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/transport.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$templates$2f$team$2d$invitation$2f$team$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/templates/team-invitation/team-invitation.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/team-invitation.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function sendInvitationEmail(to, input, baseURL) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyEmailDelivery"])(baseURL);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendEmail"])({
        to,
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$team$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTeamInvitationEmail"])(input),
        attachments: [
            {
                filename: 'salesmora-logo.png',
                content: await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), 'public/branding/salesmora-email-logo.png')),
                contentType: 'image/png',
                cid: 'salesmora-logo',
                contentDisposition: 'inline'
            }
        ]
    }, baseURL);
}
}),
"[project]/apps/web/src/server/invitations/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "acceptInvitation",
    ()=>acceptInvitation,
    "allowInvitationAttempt",
    ()=>allowInvitationAttempt,
    "deliverOwnerInvitations",
    ()=>deliverOwnerInvitations,
    "getInvitation",
    ()=>getInvitation,
    "safelyDeliverOwnerInvitations",
    ()=>safelyDeliverOwnerInvitations,
    "validInvitationToken",
    ()=>validInvitationToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/workspaces/invitation-tokens.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/send-invitation.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const validInvitationToken = (value)=>typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
async function deliverOwnerInvitations(ownerId, sendEmail = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$invitation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendInvitationEmail"]) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])();
    const rows = await db('workspaceInvitations as i').join('workspaces as w', 'i.workspaceId', 'w.id').where('w.ownerId', ownerId).whereIn('i.status', [
        'queued',
        'pending_verification'
    ]).select('i.id', 'i.workspaceId');
    let sent = 0;
    for (const { id, workspaceId } of rows){
        const delivered = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(ownerId, workspaceId, true, async (trx)=>{
            // Serialize local SMTP delivery, including simultaneous verification/create/retry calls.
            const invite = await trx('workspaceInvitations').where({
                id
            }).forUpdate().first();
            if (!invite || ![
                'queued',
                'pending_verification'
            ].includes(invite.status)) return false;
            const workspace = await trx('workspaces').where({
                id: invite.workspaceId,
                ownerId
            }).first();
            const owner = await trx('users').where({
                id: ownerId,
                emailVerified: true
            }).first();
            if (!workspace || !owner) return false;
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertSeatCapacity"])(trx, workspaceId, 0);
            } catch (error) {
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanCapacityError"]) return false;
                throw error;
            }
            const attempt = await trx('workspaceInvitations').where({
                id
            }).where((builder)=>builder.whereNull('lastAttemptAt').orWhere('lastAttemptAt', '<', new Date(Date.now() - 60000))).update({
                status: 'queued',
                lastAttemptAt: new Date(),
                deliveryAttempts: trx.raw('"deliveryAttempts" + 1')
            });
            if (!attempt) return false;
            if (!invite.inviterId) return false;
            let inviter;
            try {
                inviter = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
                    userId: invite.inviterId,
                    workspaceId
                }, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["enabledPermissions"]);
            } catch (error) {
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
                throw error;
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(inviter, {
                permission: 'team.invite',
                targetRole: invite.role
            }).allowed) return false;
            const { token, tokenHash } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["newInvitationToken"])();
            const baseURL = process.env.BETTER_AUTH_URL;
            try {
                await sendEmail(invite.email, {
                    url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationURL"])(baseURL, token),
                    inviterName: owner.name,
                    workspaceName: workspace.businessName,
                    role: invite.role
                }, baseURL);
            } catch  {
                // Keep the invitation queued for an explicit owner retry. Never log the link or recipient.
                console.error('Invitation email delivery failed. Check the configured email service.');
                return false;
            }
            await trx('workspaceInvitations').where({
                id
            }).update({
                status: 'sent',
                tokenHash,
                expiresAt: new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationLifetimeMs"]),
                sentAt: new Date()
            });
            return true;
        });
        if (delivered) sent++;
    }
    return sent;
}
async function safelyDeliverOwnerInvitations(ownerId) {
    try {
        return await deliverOwnerInvitations(ownerId);
    } catch  {
        console.error('Invitation queue processing failed. Pending invitations can be retried from Home.');
        return 0;
    }
}
async function getInvitation(token, userId) {
    if (!validInvitationToken(token)) return {
        availability: 'invalid'
    };
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])();
    const row = await db('workspaceInvitations').where({
        tokenHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationTokenHash"])(token)
    }).first();
    if (!row) return {
        availability: 'invalid'
    };
    if (row.status === 'revoked') return {
        availability: 'revoked'
    };
    if (row.status === 'accepted' && row.acceptedBy !== userId) return {
        availability: 'revoked'
    };
    if (row.status !== 'accepted' && (!row.expiresAt || new Date(row.expiresAt).getTime() <= Date.now())) return {
        availability: 'expired'
    };
    if (![
        'sent',
        'accepted'
    ].includes(row.status)) return {
        availability: 'invalid'
    };
    const workspace = await db('workspaces').where({
        id: row.workspaceId
    }).first();
    if (!workspace || workspace.deletionRequestedAt) return {
        availability: 'invalid'
    };
    if (row.status === 'accepted' && !await db('workspaceMemberships').where({
        workspaceId: row.workspaceId,
        userId
    }).first()) return {
        availability: 'revoked'
    };
    const owner = await db('users').where({
        id: workspace.ownerId
    }).first();
    return {
        availability: row.status === 'accepted' ? 'accepted' : 'ready',
        workspaceId: row.workspaceId,
        invitation: {
            id: row.id,
            workspaceName: workspace.businessName,
            inviterName: owner.name,
            email: row.email,
            role: row.role,
            expiresAt: new Date(row.expiresAt).toISOString()
        }
    };
}
async function acceptInvitation(token, userId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])().transaction(async (trx)=>{
        const candidate = await trx('workspaceInvitations').where({
            tokenHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationTokenHash"])(token)
        }).first();
        if (!candidate || !await trx('workspaces').where({
            id: candidate.workspaceId
        }).forUpdate().first()) return {
            ok: false,
            reason: 'invalid'
        };
        const user = await trx('users').where({
            id: userId
        }).forUpdate().first();
        if (!user || user.deletionRequestedAt) return {
            ok: false,
            reason: 'wrong-account'
        };
        const row = await trx('workspaceInvitations').where({
            tokenHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$workspaces$2f$invitation$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invitationTokenHash"])(token)
        }).forUpdate().first();
        if (!row || row.workspaceId !== candidate.workspaceId) return {
            ok: false,
            reason: 'invalid'
        };
        if (row.email.toLowerCase() !== user.email.toLowerCase()) return {
            ok: false,
            reason: 'wrong-account'
        };
        if (row.status === 'accepted') {
            const member = await trx('workspaceMemberships').where({
                workspaceId: row.workspaceId,
                userId
            }).first();
            return row.acceptedBy === userId && member ? {
                ok: true,
                workspaceId: row.workspaceId
            } : {
                ok: false,
                reason: 'revoked'
            };
        }
        if (row.status === 'revoked') return {
            ok: false,
            reason: 'revoked'
        };
        if (row.status !== 'sent') return {
            ok: false,
            reason: 'invalid'
        };
        if (!row.expiresAt || new Date(row.expiresAt).getTime() <= Date.now()) return {
            ok: false,
            reason: 'expired'
        };
        if (!row.inviterId) return {
            ok: false,
            reason: 'revoked'
        };
        let context;
        try {
            context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
                userId: row.inviterId,
                workspaceId: row.workspaceId
            }, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["enabledPermissions"]);
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return {
                ok: false,
                reason: 'revoked'
            };
            throw error;
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'team.invite',
            targetRole: row.role
        }).allowed) return {
            ok: false,
            reason: 'revoked'
        };
        const existingMember = await trx('workspaceMemberships').where({
            workspaceId: row.workspaceId,
            userId
        }).first();
        if (!existingMember) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assertSeatCapacity"])(trx, row.workspaceId, 1, row.id);
        // Existing membership is retained; an invitation cannot overwrite or elevate it.
        const inserted = await trx('workspaceMemberships').insert({
            workspaceId: row.workspaceId,
            userId,
            role: row.role
        }).onConflict([
            'workspaceId',
            'userId'
        ]).ignore().returning('userId');
        if (inserted.length) await trx('authorizationAudit').insert({
            workspaceId: row.workspaceId,
            actorId: userId,
            action: 'invitation.accepted',
            beforeRevision: context.policy.revision,
            afterRevision: context.policy.revision,
            beforePolicy: JSON.stringify(context.policy),
            afterPolicy: JSON.stringify({
                ...context.policy,
                acceptedInvitation: {
                    id: row.id,
                    inviterId: row.inviterId,
                    role: row.role,
                    userId
                }
            })
        });
        await trx('workspaceInvitations').where({
            id: row.id
        }).update({
            status: 'accepted',
            acceptedAt: new Date(),
            acceptedBy: userId
        });
        // Possession of this addressed invitation plus the matching account proves the email.
        await trx('users').where({
            id: userId
        }).update({
            emailVerified: true,
            onboardingStatus: 'complete',
            updatedAt: new Date()
        });
        return {
            ok: true,
            workspaceId: row.workspaceId
        };
    });
}
async function allowInvitationAttempt(userId) {
    const now = Date.now();
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])()('rateLimits').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString('hex'),
        key: `invitation-accept:${userId}`,
        count: 1,
        lastRequest: now
    }).onConflict('key').merge({
        count: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])().raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count + 1 END', [
            now - 60000
        ]),
        lastRequest: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])().raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END', [
            now - 60000,
            now
        ])
    }).returning('count');
    return rows[0].count <= 10;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/email/templates/email-verification/email-verification.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/email-verification.ts [app-rsc] (ecmascript)");
;
}),
"[project]/apps/web/src/server/email/send-verification.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendVerificationEmail",
    ()=>sendVerificationEmail
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/transport.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$templates$2f$email$2d$verification$2f$email$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/templates/email-verification/email-verification.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/email-verification.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function sendVerificationEmail(to, url, baseURL) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyEmailDelivery"])(baseURL);
    const link = new URL(url);
    // Use a fixed result page for both automatic registration and explicit resend.
    link.searchParams.set('callbackURL', new URL('/verify-email', baseURL).href);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendEmail"])({
        to,
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$email$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderEmailVerificationEmail"])(link.href),
        attachments: [
            {
                filename: 'salesmora-logo.png',
                content: await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), 'public/branding/salesmora-email-logo.png')),
                contentType: 'image/png',
                cid: 'salesmora-logo',
                contentDisposition: 'inline'
            }
        ]
    }, baseURL);
}
}),
"[project]/apps/web/src/server/email/templates/password-reset/password-reset.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/password-reset.ts [app-rsc] (ecmascript)");
;
}),
"[project]/apps/web/src/server/email/send-password-reset.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/transport.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$templates$2f$password$2d$reset$2f$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/templates/password-reset/password-reset.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/password-reset.ts [app-rsc] (ecmascript)");
;
;
;
async function sendPasswordResetEmail(to, url, baseURL) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendEmail"])({
            to,
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderPasswordResetEmail"])(url)
        }, baseURL);
    } catch  {
        // Keep acknowledgement independent of account existence; never log reset links.
        console.error('Password reset email delivery failed. Check the configured email service.');
    }
}
}),
"[project]/apps/web/src/server/auth/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "auth",
    ()=>auth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/invitations/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$auth$2f$full$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-auth@1.7.7_next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3_41004fa6c38e770759e79e1f2c5b14f6/node_modules/better-auth/dist/auth/full.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/error/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$api$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/api/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$api$2f$routes$2f$session$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-auth@1.7.7_next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3_41004fa6c38e770759e79e1f2c5b14f6/node_modules/better-auth/dist/api/routes/session.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$integrations$2f$next$2d$js$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-auth@1.7.7_next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3_41004fa6c38e770759e79e1f2c5b14f6/node_modules/better-auth/dist/integrations/next-js.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/auth-pool.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$email$2d$verification$2d$signature$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/admin-email-verification-signature.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$registration$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/registration.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/send-verification.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/send-password-reset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/server/email/transport.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/email/transport.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function requiredEnv(key) {
    const value = process.env[key];
    if (!value) throw new Error(`Missing ${key}. Run pnpm db:setup before starting the app.`);
    return value;
}
const databaseURL = requiredEnv('DATABASE_URL');
const secret = requiredEnv('BETTER_AUTH_SECRET');
if (secret.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
const baseURL = requiredEnv('BETTER_AUTH_URL');
const termsVersion = requiredEnv('TERMS_VERSION');
// Keep the pool stable across Next.js development hot reloads.
const globalAuth = globalThis;
const pool = globalAuth.salesmoraAuthPool ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$auth$2d$pool$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuthPool"])(databaseURL);
if ("TURBOPACK compile-time truthy", 1) globalAuth.salesmoraAuthPool = pool;
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$auth$2f$full$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["betterAuth"])({
    appName: 'SalesMora.ai',
    baseURL,
    secret,
    database: pool,
    trustedOrigins: [
        new URL(baseURL).origin
    ],
    emailAndPassword: {
        enabled: true,
        minPasswordLength: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$registration$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registrationPolicy"].passwordMinimum,
        maxPasswordLength: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$registration$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registrationPolicy"].passwordMaximum,
        resetPasswordTokenExpiresIn: 30 * 60,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$password$2d$reset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(user.email, url, baseURL)
    },
    emailVerification: {
        sendOnSignUp: true,
        afterEmailVerification: async (user)=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safelyDeliverOwnerInvitations"])(user.id);
        },
        sendOnSignIn: false,
        expiresIn: 60 * 60,
        autoSignInAfterVerification: false,
        sendVerificationEmail: async ({ user, url }, request)=>{
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$email$2f$send$2d$verification$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendVerificationEmail"])(user.email, url, baseURL);
            } catch  {
                // Registration must retain a usable session even if email is unavailable.
                // An explicit resend must report failure instead of claiming delivery.
                if (new URL(request?.url ?? baseURL).pathname.endsWith('/send-verification-email')) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('SERVICE_UNAVAILABLE', {
                        message: 'Email delivery is temporarily unavailable.'
                    });
                }
                console.error('Verification email delivery failed. Check the configured email service.');
            }
        }
    },
    user: {
        modelName: 'users',
        additionalFields: {
            registrationPlan: {
                type: 'string',
                required: true,
                input: true,
                defaultValue: 'free'
            },
            termsVersion: {
                type: 'string',
                required: true,
                input: false,
                defaultValue: termsVersion
            },
            termsAcceptedAt: {
                type: 'date',
                required: true,
                input: false,
                defaultValue: ()=>new Date()
            },
            onboardingStatus: {
                type: 'string',
                required: true,
                input: false,
                defaultValue: 'pending'
            }
        }
    },
    session: {
        modelName: 'sessions',
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: false
        }
    },
    account: {
        modelName: 'accounts'
    },
    verification: {
        modelName: 'verifications',
        storeIdentifier: 'hashed'
    },
    rateLimit: {
        enabled: true,
        storage: 'database',
        modelName: 'rateLimits',
        customRules: {
            '/sign-up/email': {
                window: 60,
                max: 5
            },
            '/request-password-reset': {
                window: 60,
                max: 3
            },
            '/reset-password': {
                window: 60,
                max: 5
            },
            '/send-verification-email': {
                window: 60,
                max: 1
            },
            '/verify-email': {
                window: 60,
                max: 20
            }
        }
    },
    // Local requests share a bucket. Do not trust caller-supplied proxy headers.
    // Configure a verified deployment proxy before public hosting.
    advanced: {
        ipAddress: {
            ipAddressHeaders: []
        },
        crossSubDomainCookies: {
            enabled: false
        }
    },
    logger: {
        level: 'error'
    },
    hooks: {
        before: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$api$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuthMiddleware"])(async (ctx)=>{
            if (ctx.path === '/send-verification-email') {
                if (ctx.request?.headers.get('origin') !== new URL(baseURL).origin) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('FORBIDDEN', {
                    message: 'Invalid origin.'
                });
                const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : undefined;
                const callbackURL = new URL('/verify-email', baseURL).href;
                const adminRequest = email && ctx.body?.callbackURL === callbackURL && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$email$2d$verification$2d$signature$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyAdminEmailVerificationRequest"])(process.env.ADMIN_EMAIL_VERIFICATION_SECRET, ctx.request.headers, email, callbackURL);
                if (adminRequest) {
                    const nonce = ctx.request?.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$admin$2d$email$2d$verification$2d$signature$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminEmailVerificationSignatureHeaders"].nonce);
                    if (!nonce) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('UNAUTHORIZED', {
                        message: 'Invalid admin verification-email request.'
                    });
                    const now = Date.now();
                    await pool.query('DELETE FROM "rateLimits" WHERE "key" LIKE $1 AND "lastRequest" < $2', [
                        'admin-email-verification:%',
                        now - 120_000
                    ]);
                    const consumed = await pool.query('INSERT INTO "rateLimits" ("id", "key", "count", "lastRequest") VALUES ($1, $2, 1, $3) ON CONFLICT ("key") DO NOTHING RETURNING "key"', [
                        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        `admin-email-verification:${nonce}`,
                        now
                    ]);
                    if (consumed.rowCount !== 1) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('UNAUTHORIZED', {
                            message: 'This admin verification-email request was already used.'
                        });
                    }
                    return {
                        context: {
                            ...ctx,
                            body: {
                                email,
                                callbackURL
                            }
                        }
                    };
                }
                const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$api$2f$routes$2f$session$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSessionFromCtx"])(ctx);
                if (!session) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('UNAUTHORIZED', {
                    message: 'Sign in to resend verification.'
                });
                if (email && email !== session.user.email.trim().toLowerCase()) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('FORBIDDEN', {
                        message: 'Invalid recipient.'
                    });
                }
                return {
                    context: {
                        ...ctx,
                        body: {
                            email: session.user.email,
                            callbackURL
                        }
                    }
                };
            }
            if (ctx.path === '/request-password-reset' || ctx.path === '/reset-password') {
                const origin = ctx.request?.headers.get('origin');
                if (origin && origin !== new URL(baseURL).origin) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('FORBIDDEN', {
                    message: 'Invalid origin.'
                });
            }
            if (ctx.path === '/request-password-reset') {
                // Check delivery availability equally for known and unknown accounts.
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$email$2f$transport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyEmailDelivery"])(baseURL);
                } catch  {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('SERVICE_UNAVAILABLE', {
                        message: 'Email delivery is temporarily unavailable.'
                    });
                }
                return {
                    context: {
                        ...ctx,
                        body: {
                            email: typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : ctx.body?.email,
                            redirectTo: new URL('/reset-password', baseURL).href
                        }
                    }
                };
            }
            if (ctx.path !== '/sign-up/email') return;
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$registration$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registrationSchema"].safeParse(ctx.body);
            if (!result.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('BAD_REQUEST', {
                message: 'Check your registration details and accept the terms.'
            });
            const { name, email, password, plan = 'free' } = result.data;
            if (plan !== 'free' && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])()) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('BAD_REQUEST', {
                message: 'Paid registration is unavailable.'
            });
            return {
                context: {
                    ...ctx,
                    body: {
                        name,
                        email,
                        password,
                        registrationPlan: plan
                    }
                }
            };
        })
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session)=>{
                    const result = await pool.query('SELECT "deletionRequestedAt", "suspendedAt" FROM users WHERE id = $1', [
                        session.userId
                    ]);
                    const user = result.rows[0];
                    if (user?.deletionRequestedAt) return false;
                    // Runs only after the password is verified, so the 423 does not reveal which emails exist.
                    if (user?.suspendedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["APIError"]('LOCKED', {
                        message: 'This account is unavailable. Contact support.'
                    });
                    return {
                        data: session
                    };
                }
            }
        },
        user: {
            create: {
                before: async (user)=>({
                        data: {
                            ...user,
                            termsVersion,
                            termsAcceptedAt: new Date(),
                            onboardingStatus: 'pending'
                        }
                    })
            }
        }
    },
    plugins: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$auth$40$1$2e$7$2e$7_next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3_41004fa6c38e770759e79e1f2c5b14f6$2f$node_modules$2f$better$2d$auth$2f$dist$2f$integrations$2f$next$2d$js$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nextCookies"])()
    ]
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/auth/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSession",
    ()=>getSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/auth.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function getSession() {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"].api.getSession({
        headers: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])(),
        query: {
            disableCookieCache: true,
            disableRefresh: true
        }
    });
    if (!session || !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])()('users').where({
        id: session.user.id
    }).whereNull('deletionRequestedAt').whereNull('suspendedAt').first('id')) return null;
    return session;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/reports/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "initialWorkspaceActivityReport",
    ()=>initialWorkspaceActivityReport,
    "initialWorkspaceBusinessOverview",
    ()=>initialWorkspaceBusinessOverview,
    "initialWorkspaceCalendarReport",
    ()=>initialWorkspaceCalendarReport,
    "initialWorkspaceEstimateReport",
    ()=>initialWorkspaceEstimateReport,
    "initialWorkspaceFinancialReport",
    ()=>initialWorkspaceFinancialReport,
    "initialWorkspaceJobReport",
    ()=>initialWorkspaceJobReport,
    "initialWorkspaceLeadReport",
    ()=>initialWorkspaceLeadReport,
    "initialWorkspaceLeadSourceReport",
    ()=>initialWorkspaceLeadSourceReport,
    "initialWorkspaceTeamReport",
    ()=>initialWorkspaceTeamReport,
    "workspaceActivityReport",
    ()=>workspaceActivityReport,
    "workspaceBusinessOverview",
    ()=>workspaceBusinessOverview,
    "workspaceCalendarReport",
    ()=>workspaceCalendarReport,
    "workspaceEstimateReport",
    ()=>workspaceEstimateReport,
    "workspaceFinancialReport",
    ()=>workspaceFinancialReport,
    "workspaceJobReport",
    ()=>workspaceJobReport,
    "workspaceLeadReport",
    ()=>workspaceLeadReport,
    "workspaceLeadSourceReport",
    ()=>workspaceLeadSourceReport,
    "workspaceTeamReport",
    ()=>workspaceTeamReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/leads.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function workspaceLeadReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readLeadReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceLeadReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, async (trx, context)=>{
        const filters = {
            stages: [],
            owners: [],
            sources: []
        };
        const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readLeadReportWithAuthorityInTransaction"])(trx, context, {
            workspaceId,
            view: 'pipeline',
            selection: {
                kind: 'pipeline'
            },
            filters,
            page: 1,
            pageSize: 25
        });
        const today = current.report.today;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readLeadReportWithAuthorityInTransaction"])(trx, context, {
            workspaceId,
            view: 'intake',
            period: {
                from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, -29),
                to: today
            },
            filters,
            currentFilters: filters,
            page: 1,
            pageSize: 25
        });
    });
}
async function workspaceLeadSourceReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readLeadSourceReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceLeadSourceReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialLeadSourceReportWithAuthorityInTransaction"]);
}
async function workspaceBusinessOverview(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readBusinessOverviewWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceBusinessOverview(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialBusinessOverviewWithAuthorityInTransaction"]);
}
async function workspaceCalendarReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calendarReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readCalendarReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceCalendarReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialCalendarReportWithAuthorityInTransaction"]);
}
async function workspaceJobReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jobReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readJobReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceJobReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialJobReportWithAuthorityInTransaction"]);
}
async function workspaceTeamReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readTeamReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceTeamReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialTeamReportWithAuthorityInTransaction"]);
}
async function workspaceEstimateReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readEstimateReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceEstimateReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialEstimateReportWithAuthorityInTransaction"]);
}
async function workspaceActivityReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readActivityReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceActivityReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialActivityReportWithAuthorityInTransaction"]);
}
async function workspaceFinancialReport(userId, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["financialReportQuerySchema"].parse(rawQuery);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, query.workspaceId, false, (trx, context)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readFinancialReportWithAuthorityInTransaction"])(trx, context, query));
}
async function initialWorkspaceFinancialReport(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialFinancialReportWithAuthorityInTransaction"]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceShell",
    ()=>WorkspaceShell
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WorkspaceShell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceShell() from the server but WorkspaceShell is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx <module evaluation>", "WorkspaceShell");
}),
"[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceShell",
    ()=>WorkspaceShell
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WorkspaceShell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceShell() from the server but WorkspaceShell is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx", "WorkspaceShell");
}),
"[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadReportRoute",
    ()=>LeadReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadReportRoute() from the server but LeadReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx <module evaluation>", "LeadReportRoute");
}),
"[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadReportRoute",
    ()=>LeadReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadReportRoute() from the server but LeadReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx", "LeadReportRoute");
}),
"[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$report$2d$workspace$2f$lead$2d$report$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$report$2d$workspace$2f$lead$2d$report$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$report$2d$workspace$2f$lead$2d$report$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourceRoute",
    ()=>LeadSourceRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadSourceRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadSourceRoute() from the server but LeadSourceRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx <module evaluation>", "LeadSourceRoute");
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourceRoute",
    ()=>LeadSourceRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadSourceRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadSourceRoute() from the server but LeadSourceRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx", "LeadSourceRoute");
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverviewReadPage",
    ()=>BusinessOverviewReadPage,
    "BusinessOverviewRoute",
    ()=>BusinessOverviewRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BusinessOverviewReadPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BusinessOverviewReadPage() from the server but BusinessOverviewReadPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx <module evaluation>", "BusinessOverviewReadPage");
const BusinessOverviewRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BusinessOverviewRoute() from the server but BusinessOverviewRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx <module evaluation>", "BusinessOverviewRoute");
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverviewReadPage",
    ()=>BusinessOverviewReadPage,
    "BusinessOverviewRoute",
    ()=>BusinessOverviewRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BusinessOverviewReadPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BusinessOverviewReadPage() from the server but BusinessOverviewReadPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx", "BusinessOverviewReadPage");
const BusinessOverviewRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BusinessOverviewRoute() from the server but BusinessOverviewRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx", "BusinessOverviewRoute");
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarReportPage",
    ()=>CalendarReportPage,
    "CalendarReportRoute",
    ()=>CalendarReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CalendarReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CalendarReportPage() from the server but CalendarReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx <module evaluation>", "CalendarReportPage");
const CalendarReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CalendarReportRoute() from the server but CalendarReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx <module evaluation>", "CalendarReportRoute");
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarReportPage",
    ()=>CalendarReportPage,
    "CalendarReportRoute",
    ()=>CalendarReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CalendarReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CalendarReportPage() from the server but CalendarReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx", "CalendarReportPage");
const CalendarReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CalendarReportRoute() from the server but CalendarReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx", "CalendarReportRoute");
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobReportPage",
    ()=>JobReportPage,
    "JobReportRoute",
    ()=>JobReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const JobReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call JobReportPage() from the server but JobReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx <module evaluation>", "JobReportPage");
const JobReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call JobReportRoute() from the server but JobReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx <module evaluation>", "JobReportRoute");
}),
"[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobReportPage",
    ()=>JobReportPage,
    "JobReportRoute",
    ()=>JobReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const JobReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call JobReportPage() from the server but JobReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx", "JobReportPage");
const JobReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call JobReportRoute() from the server but JobReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx", "JobReportRoute");
}),
"[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$job$2d$report$2d$workspace$2f$job$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$job$2d$report$2d$workspace$2f$job$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$job$2d$report$2d$workspace$2f$job$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TeamReportPage",
    ()=>TeamReportPage,
    "TeamReportRoute",
    ()=>TeamReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TeamReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TeamReportPage() from the server but TeamReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx <module evaluation>", "TeamReportPage");
const TeamReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TeamReportRoute() from the server but TeamReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx <module evaluation>", "TeamReportRoute");
}),
"[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TeamReportPage",
    ()=>TeamReportPage,
    "TeamReportRoute",
    ()=>TeamReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TeamReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TeamReportPage() from the server but TeamReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx", "TeamReportPage");
const TeamReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TeamReportRoute() from the server but TeamReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx", "TeamReportRoute");
}),
"[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$team$2d$report$2d$workspace$2f$team$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$team$2d$report$2d$workspace$2f$team$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$team$2d$report$2d$workspace$2f$team$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateReportPage",
    ()=>EstimateReportPage,
    "EstimateReportRoute",
    ()=>EstimateReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EstimateReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EstimateReportPage() from the server but EstimateReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx <module evaluation>", "EstimateReportPage");
const EstimateReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EstimateReportRoute() from the server but EstimateReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx <module evaluation>", "EstimateReportRoute");
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateReportPage",
    ()=>EstimateReportPage,
    "EstimateReportRoute",
    ()=>EstimateReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EstimateReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EstimateReportPage() from the server but EstimateReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx", "EstimateReportPage");
const EstimateReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EstimateReportRoute() from the server but EstimateReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx", "EstimateReportRoute");
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityReportPage",
    ()=>ActivityReportPage,
    "ActivityReportRoute",
    ()=>ActivityReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ActivityReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ActivityReportPage() from the server but ActivityReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx <module evaluation>", "ActivityReportPage");
const ActivityReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ActivityReportRoute() from the server but ActivityReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx <module evaluation>", "ActivityReportRoute");
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityReportPage",
    ()=>ActivityReportPage,
    "ActivityReportRoute",
    ()=>ActivityReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ActivityReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ActivityReportPage() from the server but ActivityReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx", "ActivityReportPage");
const ActivityReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ActivityReportRoute() from the server but ActivityReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx", "ActivityReportRoute");
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialReportPage",
    ()=>FinancialReportPage,
    "FinancialReportRoute",
    ()=>FinancialReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FinancialReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FinancialReportPage() from the server but FinancialReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx <module evaluation>", "FinancialReportPage");
const FinancialReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FinancialReportRoute() from the server but FinancialReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx <module evaluation>", "FinancialReportRoute");
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialReportPage",
    ()=>FinancialReportPage,
    "FinancialReportRoute",
    ()=>FinancialReportRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FinancialReportPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FinancialReportPage() from the server but FinancialReportPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx", "FinancialReportPage");
const FinancialReportRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FinancialReportRoute() from the server but FinancialReportRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx", "FinancialReportRoute");
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReportAreaCatalogRoute",
    ()=>ReportAreaCatalogRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ReportAreaCatalogRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ReportAreaCatalogRoute() from the server but ReportAreaCatalogRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx <module evaluation>", "ReportAreaCatalogRoute");
}),
"[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReportAreaCatalogRoute",
    ()=>ReportAreaCatalogRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ReportAreaCatalogRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ReportAreaCatalogRoute() from the server but ReportAreaCatalogRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx", "ReportAreaCatalogRoute");
}),
"[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog.definitions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reportAreaDefinitions",
    ()=>reportAreaDefinitions
]);
const reportAreaDefinitions = [
    {
        id: 'overview',
        label: 'Business overview',
        description: 'Period intake and outcomes, with current operations kept separate.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'leads',
        label: 'Leads and pipeline',
        description: 'Intake, current pipeline, source and ownership.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'jobs',
        label: 'Jobs and deadlines',
        description: 'Recorded completions, current active Jobs and overdue work.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'team',
        label: 'Team workload',
        description: 'Current primary and supporting assignments. No productivity scores.',
        modeLabel: 'Current snapshot'
    },
    {
        id: 'estimates',
        label: 'Estimates and acceptance',
        description: 'Effective decisions, frozen accepted values and current follow-up.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'calendar',
        label: 'Calendar and scheduling',
        description: 'Canonical visits and the current unscheduled queue.',
        modeLabel: 'Upcoming + current'
    },
    {
        id: 'sources',
        label: 'Lead-source effectiveness',
        description: 'Current broad-source labels for lead cohorts and accepted values.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'activity',
        label: 'CRM activity history',
        description: 'Safe native-domain events, counted once each.',
        modeLabel: 'Workspace report'
    },
    {
        id: 'financial',
        label: 'Sales value and recorded costs',
        description: 'Accepted sales value and current known material costs, not profit.',
        modeLabel: 'Workspace report'
    }
];
}),
"[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/* __next_internal_action_entry_do_not_use__ [{"008f6f8f167de42bbeccd0263a2273616f3dfa3d86":{"name":"$$RSC_SERVER_ACTION_0"}},"apps/web/src/server/reports/read-page.tsx",""] */ __turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "renderActivityReportsPage",
    ()=>renderActivityReportsPage,
    "renderBusinessOverviewPage",
    ()=>renderBusinessOverviewPage,
    "renderCalendarReportsPage",
    ()=>renderCalendarReportsPage,
    "renderEstimateReportsPage",
    ()=>renderEstimateReportsPage,
    "renderFinancialReportsPage",
    ()=>renderFinancialReportsPage,
    "renderJobReportsPage",
    ()=>renderJobReportsPage,
    "renderLeadReportsPage",
    ()=>renderLeadReportsPage,
    "renderReportCatalogPage",
    ()=>renderReportCatalogPage,
    "renderSourcesReportsPage",
    ()=>renderSourcesReportsPage,
    "renderTeamReportsPage",
    ()=>renderTeamReportsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$template$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/template.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/reports/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$report$2d$workspace$2f$lead$2d$report$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-report-workspace/lead-report-route.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$job$2d$report$2d$workspace$2f$job$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/job-report-workspace/job-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$team$2d$report$2d$workspace$2f$team$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/team-report-workspace/team-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog-route.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2e$definitions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-area-catalog/report-area-catalog.definitions.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const $$RSC_SERVER_ACTION_0 = async function signOut() {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"].api.signOut({
        headers: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])()
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "008f6f8f167de42bbeccd0263a2273616f3dfa3d86", null);
var signOut = $$RSC_SERVER_ACTION_0;
async function renderReportsPage(params, load, requiredSource) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
    const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
    if (params.workspace !== undefined && (!requested || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["leadDetailQuerySchema"].shape.workspaceId.safeParse(requested).success) || Object.keys(params).some((key)=>key !== 'workspace')) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const workspace = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findWorkspace"])(session.user.id, requested);
    if (!workspace) {
        if (requested) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/setup');
    }
    try {
        const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceAuthorization"])(session.user.id, workspace.id);
        const reports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
        if (!reports.allowed || (requiredSource === 'lead' || requiredSource === 'job') && !reports.sourceScopes?.[requiredSource]) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        if (requiredSource === 'estimate' && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read').allowed) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        if (requiredSource === 'financial' && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'reports.financial.read'
        }).allowed) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        if (requiredSource === 'calendar' && (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read').allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read').allowed && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read').allowed)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceCapabilities"])(context), content = await load(session.user.id, workspace.id);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceShell"], {
            currentPage: "reports",
            workspaceId: workspace.id,
            workspaceName: workspace.businessName,
            user: {
                name: session.user.name,
                email: session.user.email,
                role: context.membership.role
            },
            authorizedPages: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceNavigationPages"])(context),
            assistantAvailable: false,
            chatEnabled: false,
            jobNotificationsAvailable: capabilities.jobNotifications,
            permissionsAvailable: capabilities.permissions,
            ganttAvailable: capabilities.readGantt,
            billingAvailable: capabilities.billing,
            contentWidth: "full",
            onSignOut: signOut,
            children: content
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 45,
            columnNumber: 12
        }, this);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        throw error;
    }
}
function renderLeadReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$report$2d$workspace$2f$lead$2d$report$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LeadReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceLeadReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 56,
            columnNumber: 5
        }, this), 'lead');
}
function renderSourcesReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LeadSourceRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceLeadSourceReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 60,
            columnNumber: 5
        }, this), 'lead');
}
function renderBusinessOverviewPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BusinessOverviewRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceBusinessOverview"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 64,
            columnNumber: 5
        }, this), null);
}
function renderCalendarReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CalendarReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceCalendarReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 68,
            columnNumber: 5
        }, this), 'calendar');
}
function renderJobReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$job$2d$report$2d$workspace$2f$job$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JobReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceJobReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 72,
            columnNumber: 5
        }, this), 'job');
}
function renderTeamReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$team$2d$report$2d$workspace$2f$team$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TeamReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceTeamReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 76,
            columnNumber: 5
        }, this), null);
}
function renderEstimateReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EstimateReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceEstimateReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 80,
            columnNumber: 5
        }, this), 'estimate');
}
function renderActivityReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ActivityReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceActivityReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 84,
            columnNumber: 5
        }, this), null);
}
function renderFinancialReportsPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FinancialReportRoute"], {
            initial: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initialWorkspaceFinancialReport"])(userId, workspaceId)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
            lineNumber: 88,
            columnNumber: 5
        }, this), 'financial');
}
function renderReportCatalogPage(params) {
    return renderReportsPage(params, async (userId, workspaceId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, async (trx, context)=>{
            const reports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
            if (!reports.allowed || reports.resourceKind !== 'report') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            const calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read').allowed && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read').allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read').allowed);
            const access = {
                overview: true,
                leads: !!reports.sourceScopes?.lead,
                sources: !!reports.sourceScopes?.lead,
                jobs: !!reports.sourceScopes?.job,
                team: !!reports.sourceScopes?.lead || !!reports.sourceScopes?.job,
                estimates: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read').allowed,
                calendar,
                activity: true,
                financial: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: 'reports.financial.read'
                }).allowed
            };
            const areas = await Promise.all(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2e$definitions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reportAreaDefinitions"].map(async (area)=>({
                    ...area,
                    access: access[area.id] ? {
                        allowed: true,
                        templateCount: (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$template$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listReportTemplatesInTransaction"])(trx, context, area.id)).length
                    } : {
                        allowed: false,
                        reason: 'The required report or underlying permission is unavailable.'
                    }
                })));
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$area$2d$catalog$2f$report$2d$area$2d$catalog$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReportAreaCatalogRoute"], {
                workspaceId: workspaceId,
                areas: areas,
                scopeLabel: reports.scope === 'assigned' ? 'Showing your currently authorized scope.' : 'Showing your currently authorized workspace scope.'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/server/reports/read-page.tsx",
                lineNumber: 107,
                columnNumber: 12
            }, this);
        }), null);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/.next-internal/server/app/(auth)/reports/calendar/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/.next-internal/server/app/(auth)/reports/calendar/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "008f6f8f167de42bbeccd0263a2273616f3dfa3d86",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$reports$2f$calendar$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/web/.next-internal/server/app/(auth)/reports/calendar/page/actions.js { ACTIONS_MODULE0 => "[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/reports/read-page.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$reports$2f$calendar$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$reports$2f$calendar$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$reports$2f$read$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=apps_web_0sv5ohv._.js.map
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
"[project]/apps/web/src/server/chat/test-provider.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "testChatProviderEnabled",
    ()=>testChatProviderEnabled,
    "testChatResponse",
    ()=>testChatResponse,
    "testDraftModel",
    ()=>testDraftModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/ai-usage.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function testChatProviderEnabled() {
    return ("TURBOPACK compile-time value", "development") !== "production" && process.env.SALESMORA_TEST_SERVER === "1" && process.env.CHAT_TEST_PROVIDER === "fixture" && !!process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).pathname.endsWith("_test");
}
async function* testChatResponse(message, signal, identity) {
    if (!testChatProviderEnabled()) throw new Error("Provider unavailable");
    if (message === "fixture:budget") {
        if (!identity) throw Error("Fixture identity missing");
        const finish = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAIUsageRecorder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])(), identity).start("fictional-budget-fixture", "answer", 100);
        await finish({
            outcome: "completed",
            tokens: {
                inputTokens: 50,
                outputTokens: 50,
                totalTokens: 100,
                cachedInputTokens: 0,
                reasoningTokens: 0
            }
        });
    }
    const delay = (ms)=>new Promise((resolve, reject)=>{
            const stop = ()=>{
                clearTimeout(timer);
                reject(new Error("Cancelled"));
            };
            const timer = setTimeout(()=>{
                signal.removeEventListener("abort", stop);
                resolve();
            }, ms);
            signal.addEventListener("abort", stop, {
                once: true
            });
            if (signal.aborted) stop();
        });
    await delay(message === "fixture:timeout" ? 95_000 : message === "fixture:heartbeat" ? 10_200 : message === "fixture:slow" ? 600 : 80);
    yield "Fictional test response. ";
    await delay(message === "fixture:slow" ? 600 : 80);
    if (message === "fixture:fail") throw new Error("Private provider failure must never be exposed");
    yield "Streaming works 🌍. ";
    await delay(80);
    yield "No CRM records were read or changed.";
}
function testDraftModel(message) {
    if (!testChatProviderEnabled()) return;
    if (message.startsWith('fixture:capture-setup:')) return {
        async plan () {
            return [
                {
                    name: 'lead_capture_propose_action',
                    args: JSON.parse(message.slice('fixture:capture-setup:'.length))
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield evidence.some((item)=>!!item && typeof item === 'object' && 'type' in item && item.type === 'capture-setup-clarification') ? 'Please provide the missing setup details. No proposal was prepared and nothing was saved.' : 'Setup proposal prepared for review. Nothing has been saved or published.';
        }
    };
    if (message.startsWith('fixture:capture:') || message.startsWith('fixture:capture-slow:')) return {
        async plan () {
            return [
                {
                    name: 'lead_capture_query',
                    args: JSON.parse(message.slice(message.indexOf(':', 8) + 1))
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield 'Authorized Lead Capture snapshot. ';
            if (message.startsWith('fixture:capture-slow:')) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield JSON.stringify(evidence).slice(0, 6000);
            yield ' No source was saved or published.';
        }
    };
    if (message.startsWith('fixture:calendar-propose:') || message.startsWith('fixture:calendar-propose-slow:')) return {
        async plan () {
            return [
                {
                    name: 'calendar_propose_action',
                    args: JSON.parse(message.slice(message.indexOf(':', 8) + 1))
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield 'Checking the requested schedule. ';
            if (message.startsWith('fixture:calendar-propose-slow:')) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield JSON.stringify(evidence).slice(0, 6000);
        }
    };
    if (message.startsWith('fixture:calendar:') || message.startsWith('fixture:calendar-slow:')) return {
        async plan () {
            return [
                {
                    name: 'calendar_query',
                    args: JSON.parse(message.slice(message.indexOf(':', 8) + 1))
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield 'Calendar snapshot checked. ';
            if (message.startsWith('fixture:calendar-slow:')) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield JSON.stringify(evidence).slice(0, 6000); // Keep this fictional answer within the real graph’s answer budget.
        }
    };
    if (message === 'fixture:calendar-focus' || message === 'fixture:calendar-focus-slow') return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield 'Checking selected Calendar context. ';
            if (message.endsWith('-slow')) await new Promise((resolve)=>setTimeout(resolve, 1200));
            const reference = [
                ...messages
            ].reverse().find((m)=>m.role === 'user' && m.text.startsWith('Current page reference'));
            const raw = reference ? JSON.parse(reference.text.slice(reference.text.indexOf('\n') + 1)) : null;
            yield JSON.stringify(raw?.page?.selectedVisit ?? raw?.selectedVisit ?? 'No selected visit.');
        }
    };
    if (message === 'fixture:calendar-history') return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield 'Historical Calendar context: ';
            yield messages.filter((m)=>m.role === 'assistant').map((m)=>m.text).join(' ');
        }
    };
    if (message === "fixture:estimate-void-history" || message === "fixture:estimate-void-history-slow") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield "Checking the app-recorded withdrawal. ";
            if (message.endsWith("-slow")) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield messages.some((item)=>item.role === "assistant" && item.text.includes("App-recorded Estimate withdrawal") && item.text.includes('"state":"confirmed"')) ? "Verified confirmed withdrawal." : "No verified confirmed withdrawal.";
        }
    };
    if (message === "fixture:estimate-archive-history" || message === "fixture:estimate-archive-history-slow") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield "Checking the app-recorded Archive/Restore proposal. ";
            if (message.endsWith("-slow")) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield messages.some((item)=>item.role === "assistant" && item.text.includes("App-recorded Estimate Archive/Restore proposal") && item.text.includes('"state":"confirmed"')) ? "Verified confirmed Archive/Restore." : "No verified confirmed Archive/Restore.";
        }
    };
    if (message === "fixture:estimate-draft-delete-history" || message === "fixture:estimate-draft-delete-history-slow") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield "Checking the app-recorded Draft deletion proposal. ";
            if (message.endsWith("-slow")) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield messages.some((item)=>item.role === "assistant" && item.text.includes("App-recorded Estimate Draft deletion proposal") && item.text.includes('"state":"confirmed"')) ? "Verified confirmed Draft deletion." : "No verified confirmed Draft deletion.";
        }
    };
    if (message.startsWith("fixture:estimate-draft-delete:") || message.startsWith("fixture:estimate-draft-delete-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-draft-delete-slow:") ? "fixture:estimate-draft-delete-slow:" : "fixture:estimate-draft-delete:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the permanent Draft-deletion card. Nothing has been deleted. Only exact typed confirmation in its dialog can delete this Draft.";
            if (message.startsWith("fixture:estimate-draft-delete-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Draft-deletion fixture complete.";
            }
        }
    };
    if (message === "fixture:estimate-convert-history") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            const history = messages.filter((item)=>item.role === "assistant").map((item)=>item.text).join("\n");
            const verified = history.includes("App-recorded Estimate conversion review") && history.includes('"state":"pending"') && !history.includes("customer@example.test") && !history.includes("PRIVATE_ESTIMATE_NOTE") && !history.includes("PRIVATE_CUSTOMER_NOTE");
            yield verified ? "Verified pending conversion proposal and Estimate reference only; no Job creation receipt exists." : "No verified conversion proposal is available.";
        }
    };
    if (message.startsWith("fixture:estimate-convert:")) return {
        async plan () {
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice("fixture:estimate-convert:".length))
                }
            ];
        },
        async *answer () {
            yield "Review the conversion card to open the existing Job form. No Job has been created.";
        }
    };
    if (message.startsWith("fixture:estimate-export:")) return {
        async plan () {
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice("fixture:estimate-export:".length))
                }
            ];
        },
        async *answer () {
            yield "Review the CSV export in the existing Estimates export dialog. No file has been downloaded.";
        }
    };
    if (message.startsWith("fixture:estimate-archive:") || message.startsWith("fixture:estimate-archive-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-archive-slow:") ? "fixture:estimate-archive-slow:" : "fixture:estimate-archive:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the Archive/Restore card. Nothing has changed. Only explicit browser confirmation requests the action.";
            if (message.startsWith("fixture:estimate-archive-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Archive/Restore fixture complete.";
            }
        }
    };
    if (message.startsWith("fixture:estimate-void:") || message.startsWith("fixture:estimate-void-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-void-slow:") ? "fixture:estimate-void-slow:" : "fixture:estimate-void:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the withdrawal card. Nothing has been withdrawn. Only explicit browser confirmation requests withdrawal.";
            if (message.startsWith("fixture:estimate-void-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Withdrawal fixture complete.";
            }
        }
    };
    if (message === "fixture:estimate-draft-action-history" || message === "fixture:estimate-draft-action-history-slow") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield "Checking the app-recorded Draft operation. ";
            if (message.endsWith("-slow")) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield messages.some((item)=>item.role === "assistant" && item.text.includes("App-recorded Estimate Draft action") && item.text.includes('"state":"confirmed"')) ? "Verified confirmed Draft operation." : "No verified confirmed Draft operation.";
        }
    };
    if (message.startsWith("fixture:estimate-draft-action:") || message.startsWith("fixture:estimate-draft-action-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-draft-action-slow:") ? "fixture:estimate-draft-action-slow:" : "fixture:estimate-draft-action:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the Draft operation card. Nothing has been saved or reused. Only explicit browser confirmation requests the operation.";
            if (message.startsWith("fixture:estimate-draft-action-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Draft action fixture complete.";
            }
        }
    };
    if (message === "fixture:estimate-decision-history" || message === "fixture:estimate-decision-history-slow") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield "Checking the app-recorded decision outcome. ";
            if (message.endsWith("-slow")) await new Promise((resolve)=>setTimeout(resolve, 1200));
            yield messages.some((item)=>item.role === "assistant" && item.text.includes("App-recorded Estimate decision proposal") && item.text.includes('"state":"confirmed"')) ? "Verified recorded decision receipt." : "No verified recorded decision receipt.";
        }
    };
    if (message.startsWith("fixture:estimate-decision:") || message.startsWith("fixture:estimate-decision-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-decision-slow:") ? "fixture:estimate-decision-slow:" : "fixture:estimate-decision:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the Decision card. Nothing has been recorded. Only explicit confirmation records the customer's response.";
            if (message.startsWith("fixture:estimate-decision-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Decision fixture complete.";
            }
        }
    };
    if (message.startsWith("fixture:estimate-sharing:")) return {
        async plan () {
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice("fixture:estimate-sharing:".length))
                }
            ];
        },
        async *answer () {
            yield "Review the sharing proposal in the app. Nothing has been shared or queued. Only the review's explicit confirmation requests sharing.";
        }
    };
    if (message.startsWith("fixture:estimate-draft:") || message.startsWith("fixture:estimate-draft-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-draft-slow:") ? "fixture:estimate-draft-slow:" : "fixture:estimate-draft:";
            return [
                {
                    name: "estimates_propose_action",
                    args: JSON.parse(message.slice(prefix.length))
                }
            ];
        },
        async *answer () {
            yield "Review the Estimate Draft proposal. Nothing has been saved. Use the card to confirm, cancel or review missing prices in the editor.";
            if (message.startsWith("fixture:estimate-draft-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Estimate Draft fixture complete.";
            }
        }
    };
    if (message.startsWith("fixture:estimate:") || message.startsWith("fixture:estimate-slow:")) return {
        async plan () {
            const prefix = message.startsWith("fixture:estimate-slow:") ? "fixture:estimate-slow:" : "fixture:estimate:";
            return [
                {
                    name: "estimates_query",
                    args: {
                        request: JSON.parse(message.slice(prefix.length))
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            const read = evidence[0];
            yield `Authorized Estimate summary. ${JSON.stringify(read).slice(0, 3000)}`;
            if (message.startsWith("fixture:estimate-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Estimate fixture complete.";
            }
        }
    };
    if (message === "fixture:estimate-history") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield messages.filter((item)=>item.role === "assistant").map((item)=>item.text).join(" ").slice(0, 4000) || "No prior Estimate content.";
        }
    };
    if (message.startsWith("fixture:customer:")) return {
        async plan () {
            const request = JSON.parse(message.slice("fixture:customer:".length));
            return [
                {
                    name: request.tool,
                    args: {
                        request: request.request
                    }
                }
            ];
        },
        async *answer () {
            yield "Current authorized customer result. Review any proposal before confirming.";
        }
    };
    if (message === "fixture:customer-history") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield messages.filter((m)=>m.role === "assistant").map((m)=>m.text).join(" ").slice(0, 4000) || "No prior customer content.";
        }
    };
    if (message.startsWith("fixture:search:") || message.startsWith("fixture:search-slow:")) return {
        async plan () {
            return [
                {
                    name: "leads_query",
                    args: {
                        request: {
                            operation: "search",
                            input: JSON.parse(message.slice(message.startsWith("fixture:search-slow:") ? "fixture:search-slow:".length : "fixture:search:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence);
            if (message.startsWith("fixture:search-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Search fixture complete.";
            }
        }
    };
    if (message === "fixture:search-history") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield messages.filter((item)=>item.role === "assistant").map((item)=>item.text).join(" ").slice(0, 4000) || "No prior search content.";
        }
    };
    if (message === "fixture:history-followup" || message === "fixture:details-history") return {
        async plan () {
            return [];
        },
        async *answer (messages) {
            yield messages.filter((item)=>item.role === "assistant").map((item)=>item.text).join(" ").slice(0, 4000) || "No prior details.";
        }
    };
    if (message.startsWith("fixture:history:") || message.startsWith("fixture:history-slow:")) return {
        async plan () {
            return [
                {
                    name: "leads_query",
                    args: {
                        request: {
                            operation: "history",
                            input: JSON.parse(message.slice(message.startsWith("fixture:history-slow:") ? "fixture:history-slow:".length : "fixture:history:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            const text = JSON.stringify(evidence);
            yield text.length < 4000 ? text : "Read the authorized lead history in the card.";
            if (message.startsWith("fixture:history-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "History fixture complete.";
            }
        }
    };
    if (message.startsWith("fixture:details:") || message.startsWith("fixture:details-slow:")) return {
        async plan () {
            return [
                {
                    name: "leads_query",
                    args: {
                        request: {
                            operation: "details",
                            input: JSON.parse(message.slice(message.startsWith("fixture:details-slow:") ? "fixture:details-slow:".length : "fixture:details:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            const text = JSON.stringify(evidence);
            yield text.length < 4000 ? text : "Read the authorized lead details in the card.";
            if (message.startsWith("fixture:details-slow:")) {
                await new Promise((resolve)=>setTimeout(resolve, 1200));
                yield "Details fixture complete.";
            }
        }
    };
    if (message.startsWith("fixture:delete:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "delete",
                            input: JSON.parse(message.slice("fixture:delete:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-delete-proposed") ? "Review the deletion. Type the lead number in the card and choose Confirm permanent deletion." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:export:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "export_csv",
                            input: JSON.parse(message.slice("fixture:export:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-export-proposed") ? "Review the export and click Confirm and download CSV." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:archive:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "set_archived",
                            input: JSON.parse(message.slice("fixture:archive:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-archive-proposed") ? "Review the archive or restore proposal and confirm on the card." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:note:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "add_note",
                            input: JSON.parse(message.slice("fixture:note:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-note-proposed") ? "Review the note and click Confirm and add note." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:assign:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "assign",
                            input: JSON.parse(message.slice("fixture:assign:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-assignment-proposed") ? "Review the assignment and click Confirm assignment change." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:combined:")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "update_with_stage",
                            input: JSON.parse(message.slice("fixture:combined:".length))
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-update-proposed") ? "Review both changes and click Confirm lead changes." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:update")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "update",
                            input: message.startsWith("fixture:update:") ? JSON.parse(message.slice("fixture:update:".length)) : {
                                leadRef: "",
                                changes: [
                                    {
                                        field: "phone",
                                        value: "(212) 555-0188"
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-update-proposed") ? "Review the changes and click Confirm lead changes." : JSON.stringify(evidence);
        }
    };
    if (message.startsWith("fixture:stage")) return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "change_stage",
                            input: {
                                leadRef: message.startsWith("fixture:stage-ref:") ? message.slice("fixture:stage-ref:".length) : "",
                                to: message === "fixture:stage-lost" ? "lost" : "estimate-sent",
                                reason: message === "fixture:stage-lost" ? "Customer chose another provider." : ""
                            }
                        }
                    }
                }
            ];
        },
        async *answer () {
            yield "Review the stage proposal and click Confirm stage change. No estimate will be sent.";
        }
    };
    if (message.startsWith("fixture:context")) return {
        async plan () {
            return message === "fixture:context-counts" ? [
                {
                    name: "leads_query",
                    args: {
                        request: {
                            operation: "pipeline_summary",
                            input: {}
                        }
                    }
                }
            ] : [];
        },
        async *answer (messages, evidence) {
            if (message === "fixture:context-counts") {
                yield JSON.stringify(evidence);
                return;
            }
            const reference = messages.find((item)=>item.role === "user" && item.text.startsWith("Current page reference ("))?.text;
            yield reference ?? "No page reference supplied.";
            if (message === "fixture:context-slow") await new Promise((resolve)=>setTimeout(resolve, 800));
            yield " Context fixture complete.";
        }
    };
    if (!message.startsWith("fixture:draft")) return;
    return {
        async plan () {
            return [
                {
                    name: "leads_propose_action",
                    args: {
                        request: {
                            operation: "create",
                            input: {
                                name: message === "fixture:draft-missing" ? "" : "Fictional draft customer",
                                service: "Furnace repair",
                                email: "draft@example.test",
                                phone: "",
                                address: "",
                                details: "Fictional development request",
                                notes: "",
                                source: "other",
                                stage: "new",
                                ownerId: message.startsWith("fixture:draft-owner:") ? message.slice("fixture:draft-owner:".length) : ""
                            }
                        }
                    }
                }
            ];
        },
        async *answer (_messages, evidence) {
            yield JSON.stringify(evidence).includes("lead-draft-missing-fields") ? "Please provide the lead name." : "Review the draft and explicitly confirm to create the lead.";
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/chat/config.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "chatRuntimeAvailable",
    ()=>chatRuntimeAvailable,
    "liveChatEnabled",
    ()=>liveChatEnabled,
    "workspaceChatAvailable",
    ()=>workspaceChatAvailable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/feature-flags.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$test$2d$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/chat/test-provider.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$test$2d$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$test$2d$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function liveChatEnabled() {
    return process.env.CHAT_ENABLED === 'true' && process.env.CHAT_MODEL === 'gpt-6-luna' && !!process.env.OPENAI_API_KEY?.trim() && ![
        'LANGSMITH_TRACING',
        'LANGCHAIN_TRACING_V2'
    ].some((key)=>process.env[key] && process.env[key] !== 'false');
}
function chatRuntimeAvailable() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$test$2d$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["testChatProviderEnabled"])() || liveChatEnabled();
}
async function workspaceChatAvailable(workspaceId) {
    return chatRuntimeAvailable() && await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])(), 'chat.enabled', workspaceId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/server/leads/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "LeadAccessError",
    ()=>LeadAccessError,
    "LeadConflictError",
    ()=>LeadConflictError,
    "LeadOwnerError",
    ()=>LeadOwnerError,
    "createLead",
    ()=>createLead,
    "createLeadInTransaction",
    ()=>createLeadInTransaction,
    "leadOwners",
    ()=>leadOwners,
    "workspaceLeadPipelineCounts",
    ()=>workspaceLeadPipelineCounts
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$assign$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/assign.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$admission$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/admission.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
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
class LeadAccessError extends Error {
}
class LeadOwnerError extends Error {
}
class LeadConflictError extends Error {
}
async function createLead(userId, workspaceId, submissionId, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, true, async (trx, context)=>{
        return createLeadInTransaction(trx, context, userId, workspaceId, submissionId, input);
    });
}
async function createLeadInTransaction(trx, context, userId, workspaceId, submissionId, input) {
    if (context.workspaceId !== workspaceId || context.userId !== userId) throw new LeadAccessError();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.create'
    }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.assign',
        resource: {
            kind: 'lead',
            id: submissionId,
            workspaceId,
            ownerId: null
        }
    }).allowed) throw new LeadAccessError();
    const key = {
        workspaceId,
        createdBy: userId,
        submissionId
    };
    const submissionHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(input)).digest('hex');
    const existing = await trx('leads').where(key).first();
    if (existing) {
        if (existing.submissionHash !== submissionHash) throw new LeadConflictError();
        return {
            id: existing.id,
            created: false
        };
    }
    if (input.ownerId && !await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
        'm.workspaceId': workspaceId,
        'm.userId': input.ownerId
    }).whereNull('u.deletionRequestedAt').first('u.id')) throw new LeadOwnerError();
    const inserted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$admission$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["insertAdmittedLead"])(trx, input, {
        ...key,
        submissionHash
    });
    if (inserted) {
        if (input.ownerId) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$assign$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignLead"])(trx, {
            userId,
            workspaceId
        }, context.enabledPermissions, {
            workspaceId,
            leadId: inserted,
            ownerId: input.ownerId,
            expectedVersion: 1,
            submissionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()
        });
        return {
            id: inserted,
            created: true
        };
    }
    const saved = await trx('leads').where(key).first();
    if (saved.submissionHash !== submissionHash) throw new LeadConflictError();
    return {
        id: saved.id,
        created: false
    };
}
async function leadOwners(userId, workspaceId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedWorkspace"])(userId, workspaceId, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.create'
        }).allowed) throw new LeadAccessError();
        return trx('workspaceMemberships').join('users', 'users.id', 'workspaceMemberships.userId').where('workspaceMemberships.workspaceId', workspaceId).whereNull('users.deletionRequestedAt').orderBy('users.name').orderBy('users.id').select('users.id', 'users.name');
    });
}
async function workspaceLeadPipelineCounts(userId, workspaceId) {
    const counts = {
        new: 0,
        contacted: 0,
        'estimate-sent': 0,
        won: 0,
        lost: 0
    };
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authorizedLeadPipelineCounts"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["database"])(), {
        userId,
        workspaceId
    }, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["enabledPermissions"]);
    for (const stage of Object.keys(counts))counts[stage] = rows[stage] ?? 0;
    return counts;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadPipelineWidget",
    ()=>LeadPipelineWidget
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadPipelineWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadPipelineWidget() from the server but LeadPipelineWidget is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx <module evaluation>", "LeadPipelineWidget");
}),
"[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadPipelineWidget",
    ()=>LeadPipelineWidget
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LeadPipelineWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LeadPipelineWidget() from the server but LeadPipelineWidget is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx", "LeadPipelineWidget");
}),
"[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$lead$2d$pipeline$2d$widget$2f$lead$2d$pipeline$2d$widget$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$lead$2d$pipeline$2d$widget$2f$lead$2d$pipeline$2d$widget$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$lead$2d$pipeline$2d$widget$2f$lead$2d$pipeline$2d$widget$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
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
"[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailVerificationRoute",
    ()=>EmailVerificationRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EmailVerificationRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EmailVerificationRoute() from the server but EmailVerificationRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx <module evaluation>", "EmailVerificationRoute");
}),
"[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailVerificationRoute",
    ()=>EmailVerificationRoute
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EmailVerificationRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EmailVerificationRoute() from the server but EmailVerificationRoute is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx", "EmailVerificationRoute");
}),
"[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$auth$2f$email$2d$verification$2d$notice$2f$email$2d$verification$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$auth$2f$email$2d$verification$2d$notice$2f$email$2d$verification$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$auth$2f$email$2d$verification$2d$notice$2f$email$2d$verification$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
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
"[project]/apps/web/src/features/onboarding/onboarding-flow/onboarding-flow.data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "onboardingFlowData",
    ()=>onboardingFlowData
]);
const onboardingFlowData = {
    documentTitle: 'Set up your workspace — SalesMora.ai',
    title: 'Set up your workspace',
    description: 'Tell us about your business, then review and create your workspace.',
    signedIn: 'Signed in as',
    signOut: 'Sign out',
    error: 'Your workspace could not be saved. Your details are still here. Please try again.',
    invalid: 'Check your business, services, and teammate details before creating your workspace.',
    expired: 'Your session has expired. Sign in again to create your workspace.',
    stories: {
        title: 'Setup flow preview',
        notice: 'Component preview. No workspace is saved or invitation sent.',
        success: 'Preview confirmed. No workspace was created.',
        email: 'flow-owner@example.com',
        name: 'Northstar Plumbing',
        service: 'Drain cleaning'
    },
    home: {
        documentTitle: 'Home — SalesMora.ai',
        title: 'Home',
        description: 'Your workspace, at a glance.',
        business: 'Business',
        type: 'Business type',
        services: 'Services',
        postal: 'Primary ZIP / postal code',
        range: 'Typical service range',
        invitations: 'Team invitations',
        verification: 'Verify your email before queued invitations can be sent.',
        delivery: 'Teammates join after accepting their email invitation.',
        retryInvitations: 'Send pending invitations',
        retryNote: 'Pending invitations can be retried once per minute. Sent invitations will not be sent again.',
        invitationStatuses: {
            pending_verification: 'Waiting for owner verification',
            queued: 'Waiting to send',
            sent: 'Sent',
            accepted: 'Accepted',
            revoked: 'Cancelled'
        },
        none: 'No teammate invitations',
        notProvided: 'Not provided'
    }
};
}),
"[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HomeOverview",
    ()=>HomeOverview
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const HomeOverview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call HomeOverview() from the server but HomeOverview is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx <module evaluation>", "HomeOverview");
}),
"[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HomeOverview",
    ()=>HomeOverview
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const HomeOverview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call HomeOverview() from the server but HomeOverview is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx", "HomeOverview");
}),
"[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$home$2d$overview$2f$home$2d$overview$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$home$2d$overview$2f$home$2d$overview$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$home$2d$overview$2f$home$2d$overview$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
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
"[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "$$RSC_SERVER_ACTION_1",
    ()=>$$RSC_SERVER_ACTION_1,
    "default",
    ()=>HomePage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"002053029025492d601343b7a1790b90ea9b2244d2":{"name":"$$RSC_SERVER_ACTION_1"},"005b502fa466066b496eef5d4fbeeb39cb479cf70d":{"name":"$$RSC_SERVER_ACTION_0"}},"apps/web/src/app/(auth)/home/page.tsx",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/chat/config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/authorization/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$leads$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/leads/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$lead$2d$pipeline$2d$widget$2f$lead$2d$pipeline$2d$widget$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/invitations/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$auth$2f$email$2d$verification$2d$notice$2f$email$2d$verification$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/auth/email-verification-notice/email-verification-route.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$submit$2d$button$2f$submit$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/submit-button/submit-button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/workspaces/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$onboarding$2f$onboarding$2d$flow$2f$onboarding$2d$flow$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/onboarding/onboarding-flow/onboarding-flow.data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$home$2d$overview$2f$home$2d$overview$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/home-overview/home-overview.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$leads$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$leads$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const copy = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$onboarding$2f$onboarding$2d$flow$2f$onboarding$2d$flow$2e$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onboardingFlowData"].home;
const metadata = {
    title: copy.documentTitle
};
const $$RSC_SERVER_ACTION_0 = async function signOut() {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"].api.signOut({
        headers: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])()
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "005b502fa466066b496eef5d4fbeeb39cb479cf70d", null);
var signOut = $$RSC_SERVER_ACTION_0;
const $$RSC_SERVER_ACTION_1 = async function retryInvitations() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$invitations$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safelyDeliverOwnerInvitations"])(session.user.id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/home');
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "002053029025492d601343b7a1790b90ea9b2244d2", null);
var retryInvitations = $$RSC_SERVER_ACTION_1;
async function HomePage({ searchParams }) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
    const { workspace: workspaceId } = await searchParams;
    if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/home');
    const workspace = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findWorkspace"])(session.user.id, workspaceId);
    if (!workspace) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(workspaceId ? '/home' : '/setup');
    const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceAuthorization"])(session.user.id, workspace.id).catch((error)=>{
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        throw error;
    });
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceCapabilities"])(context);
    if (!capabilities.home) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const isOwner = workspace.ownerId === session.user.id;
    const summary = isOwner && capabilities.inviteField ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$workspaces$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceSummary"])(session.user.id, workspace.id) : {
        invitations: []
    };
    const pipelineCounts = capabilities.readLeads ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$leads$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceLeadPipelineCounts"])(session.user.id, workspace.id) : null;
    const hasLeads = Object.values(pipelineCounts ?? {}).some((count)=>count > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceShell"], {
        chatEnabled: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$chat$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceChatAvailable"])(workspace.id),
        chatSurface: "home",
        billingAvailable: capabilities.billing,
        jobNotificationsAvailable: capabilities.jobNotifications,
        permissionsAvailable: capabilities.permissions,
        ganttAvailable: capabilities.readGantt,
        authorizedPages: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$authorization$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["workspaceNavigationPages"])(context),
        assistantAvailable: capabilities.assistant,
        contentWidth: "full",
        workspaceId: workspace.id,
        workspaceName: workspace.businessName,
        user: {
            name: session.user.name,
            email: session.user.email,
            role: context.membership.role
        },
        onSignOut: signOut,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$home$2d$overview$2f$home$2d$overview$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HomeOverview"], {
                headingLevel: 1,
                userName: session.user.name,
                workspaceName: workspace.businessName,
                role: context.membership.role,
                canCreateLead: capabilities.createLead,
                canCreateCampaign: false,
                createLeadHref: `/leads/new?workspace=${encodeURIComponent(workspace.id)}`,
                activity: {
                    hasLeads,
                    hasCampaigns: false,
                    hasActivity: false
                },
                entry: isOwner ? 'created' : 'joined'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            hasLeads && pipelineCounts && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$lead$2d$pipeline$2d$widget$2f$lead$2d$pipeline$2d$widget$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LeadPipelineWidget"], {
                    counts: pipelineCounts,
                    pipelineHref: `/leads?workspace=${encodeURIComponent(workspace.id)}`
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                    lineNumber: 49,
                    columnNumber: 58
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                lineNumber: 49,
                columnNumber: 36
            }, this),
            isOwner && summary.invitations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4 text-sm leading-6 text-muted",
                children: session.user.emailVerified ? copy.delivery : copy.verification
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                lineNumber: 50,
                columnNumber: 51
            }, this),
            isOwner && session.user.emailVerified && summary.invitations.some((row)=>[
                    'queued',
                    'pending_verification'
                ].includes(row.status)) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: retryInvitations,
                className: "mt-4 grid gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm leading-6 text-muted",
                        children: copy.retryNote
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                        lineNumber: 51,
                        columnNumber: 198
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$submit$2d$button$2f$submit$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SubmitButton"], {
                        label: copy.retryInvitations
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                        lineNumber: 51,
                        columnNumber: 266
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                lineNumber: 51,
                columnNumber: 138
            }, this),
            !session.user.emailVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$auth$2f$email$2d$verification$2d$notice$2f$email$2d$verification$2d$route$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EmailVerificationRoute"], {
                    email: session.user.email,
                    verified: false
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                    lineNumber: 52,
                    columnNumber: 59
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
                lineNumber: 52,
                columnNumber: 37
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(auth)/home/page.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/.next-internal/server/app/(auth)/home/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/apps/web/.next-internal/server/app/(auth)/home/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "002053029025492d601343b7a1790b90ea9b2244d2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "005b502fa466066b496eef5d4fbeeb39cb479cf70d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$home$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/web/.next-internal/server/app/(auth)/home/page/actions.js { ACTIONS_MODULE0 => "[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/(auth)/home/page.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$home$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$home$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f28$auth$292f$home$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=apps_web_0o~9bqa._.js.map
module.exports = [
"[project]/packages/data/src/lead-capture/restore-publication-draft.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "restorePublicationDraft",
    ()=>restorePublicationDraft
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
async function restorePublicationDraft(trx, workspaceId, sourceId, configurationVersion) {
    const source = await trx('captureSources').where({
        workspaceId,
        id: sourceId
    }).first('draftId', 'approvedVersion', 'type');
    if (!source || source.draftId) return;
    const target = await trx('captureSourceVersions').where({
        workspaceId,
        sourceId,
        configurationVersion
    }).first('configuration');
    if (!target) throw Error('Publication target is missing.');
    const retained = await trx('captureSourceDrafts').where({
        workspaceId,
        sourceId
    }).forUpdate().first('id', 'version');
    const values = {
        configuration: JSON.stringify(target.configuration),
        baseApprovedVersion: source.approvedVersion,
        sourceType: source.type,
        version: Math.max(retained?.version ?? 0, source.approvedVersion ?? 0, configurationVersion) + 1,
        updatedAt: trx.fn.now()
    };
    const id = retained?.id ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    if (retained) await trx('captureSourceDrafts').where({
        workspaceId,
        id
    }).update(values);
    else await trx('captureSourceDrafts').insert({
        id,
        workspaceId,
        sourceId,
        ...values
    });
    await trx('captureSources').where({
        workspaceId,
        id: sourceId
    }).update({
        draftId: id
    });
}
}),
"[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureCapacityError",
    ()=>CaptureCapacityError,
    "assertCaptureDowngrade",
    ()=>assertCaptureDowngrade,
    "blockCaptureSource",
    ()=>blockCaptureSource,
    "captureCapacity",
    ()=>captureCapacity,
    "captureCurrentBlocks",
    ()=>captureCurrentBlocks,
    "captureOperationalState",
    ()=>captureOperationalState,
    "capturePublishedSources",
    ()=>capturePublishedSources,
    "capturePublishedStates",
    ()=>capturePublishedStates,
    "captureTargetPlan",
    ()=>captureTargetPlan,
    "enqueueCaptureAccessCheck",
    ()=>enqueueCaptureAccessCheck,
    "notifyCaptureBlocked",
    ()=>notifyCaptureBlocked,
    "reconcileCaptureAccessInTransaction",
    ()=>reconcileCaptureAccessInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/restore-publication-draft.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
;
;
;
;
;
const capturePublishedStates = [
    'active',
    'paused',
    'scheduled'
];
class CaptureCapacityError extends Error {
    sources;
    limit;
    gmail;
    constructor(sources, limit, gmail){
        super(`Archive capture sources before changing or publishing on this plan${gmail ? ', including published Gmail sources' : ''}: ${sources.slice(0, 5).map((source)=>source.name).join(', ')}${sources.length > 5 ? ` and ${sources.length - 5} more` : ''}.`), this.sources = sources, this.limit = limit, this.gmail = gmail;
    }
}
async function capturePublishedSources(db, workspaceId) {
    return db('captureSources').where({
        workspaceId
    }).whereIn('status', capturePublishedStates).orderBy('id').select('id', 'name', 'type', 'version', 'status', 'block');
}
async function captureTargetPlan(db, workspaceId, plan, at) {
    const workspace = await db('workspaces').where({
        id: workspaceId
    }).first('planOverride', 'planOverrideEndsAt');
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["effectiveWorkspacePlan"])({
        plan,
        status: plan === 'free' ? 'free' : 'active',
        paidThrough: new Date(at.getTime() + 1)
    }, workspace, at).plan;
}
async function assertCaptureDowngrade(trx, workspaceId, target, at) {
    await trx('workspaces').where({
        id: workspaceId
    }).forUpdate().first('id');
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(await captureTargetPlan(trx, workspaceId, target, at)), sources = await capturePublishedSources(trx, workspaceId);
    const over = plan.limits.publishedCaptureSources !== null && sources.length > plan.limits.publishedCaptureSources;
    const gmail = plan.id === 'free' && sources.some((source)=>source.type === 'gmail');
    if (over || gmail) throw new CaptureCapacityError(over ? sources : sources.filter((source)=>source.type === 'gmail'), plan.limits.publishedCaptureSources, gmail);
}
async function captureCapacity(trx, workspaceId, sourceId, type) {
    const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, workspaceId), sources = await capturePublishedSources(trx, workspaceId);
    const additional = sources.some((source)=>source.id === sourceId) ? 0 : 1;
    const limit = entitlement.plan.limits.publishedCaptureSources;
    let ready = limit === null || sources.length + additional <= limit;
    let access = type !== 'gmail' || entitlement.plan.id !== 'free';
    const changes = await trx('billingPlanChanges').where({
        workspaceId
    }).whereIn('state', [
        'applying',
        'scheduled'
    ]).whereIn('kind', [
        'free',
        'downgrade'
    ]);
    const billing = await trx('workspaceSubscriptions').where({
        workspaceId
    }).first('cancelAtPeriodEnd', 'paidThrough');
    if (billing?.cancelAtPeriodEnd && billing.paidThrough) changes.push({
        targetPlan: 'free',
        basis: {
            end: billing.paidThrough.getTime() / 1000
        }
    });
    for (const change of changes){
        const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(await captureTargetPlan(trx, workspaceId, change.targetPlan, new Date(change.basis.end * 1000)));
        ready &&= target.limits.publishedCaptureSources === null || sources.length + additional <= target.limits.publishedCaptureSources;
        access &&= type !== 'gmail' || target.id !== 'free';
    }
    return {
        plan: entitlement.plan.id,
        used: sources.length,
        limit,
        ready,
        access,
        now: entitlement.now
    };
}
async function enqueueCaptureAccessCheck(trx, workspaceId, targetPlan, effectiveAt, id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()) {
    const sources = await capturePublishedSources(trx, workspaceId);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(targetPlan), overflow = plan.limits.publishedCaptureSources !== null && sources.length > plan.limits.publishedCaptureSources;
    const affected = sources.filter((source)=>overflow || targetPlan === 'free' && source.type === 'gmail');
    if (!affected.length) return;
    await trx('captureAccessChecks').insert({
        id,
        workspaceId,
        targetPlan,
        effectiveAt,
        sources: JSON.stringify(affected.map((source)=>({
                id: source.id,
                reason: overflow ? 'source_capacity' : 'entitlement'
            })))
    }).onConflict('id').ignore();
}
async function notifyCaptureBlocked(trx, workspaceId, sourceId, sourceVersion, reason) {
    const members = await trx('workspaceMemberships').where({
        workspaceId
    }).whereIn('role', [
        'owner',
        'admin'
    ]).select('userId');
    for (const { userId } of members){
        try {
            const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
                userId,
                workspaceId
            }, [
                'leadCapture.read'
            ]);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leadCapture.read',
                resource: {
                    kind: 'capture_source',
                    id: sourceId,
                    workspaceId
                }
            }).allowed) continue;
            await trx('captureAdminNotices').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workspaceId,
                sourceId,
                sourceVersion,
                userId,
                reason
            }).onConflict([
                'workspaceId',
                'sourceId',
                'sourceVersion',
                'userId'
            ]).ignore();
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        }
    }
}
async function blockCaptureSource(trx, workspaceId, source, reason) {
    if (source.status === 'archived' || source.status === 'draft' || source.block === reason && source.status === 'paused') return;
    const version = source.version + 1;
    const pending = await trx('capturePublicationTransitions').where({
        workspaceId,
        sourceId: source.id,
        state: 'pending'
    }).first('configurationVersion');
    if (pending) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePublicationDraft"])(trx, workspaceId, source.id, pending.configurationVersion);
    await trx('captureSources').where({
        workspaceId,
        id: source.id
    }).update({
        status: 'paused',
        block: reason,
        scheduledAt: null,
        timezone: null,
        version,
        updatedAt: trx.fn.now()
    });
    await trx('capturePublicationTransitions').where({
        workspaceId,
        sourceId: source.id,
        state: 'pending'
    }).update({
        state: 'blocked',
        failures: JSON.stringify([
            reason
        ]),
        completedAt: trx.fn.now()
    });
    await trx('captureSourceEvents').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId,
        sourceId: source.id,
        kind: 'source.blocked',
        actor: JSON.stringify({
            kind: 'service',
            service: 'billing'
        }),
        data: JSON.stringify({
            sourceVersion: version,
            block: reason,
            status: 'paused'
        })
    });
    await notifyCaptureBlocked(trx, workspaceId, source.id, version, reason);
}
async function reconcileCaptureAccessInTransaction(trx, workspaceId) {
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).forUpdate().first('id', 'suspendedAt', 'deletionRequestedAt');
    if (!workspace || workspace.deletionRequestedAt) return;
    const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, workspaceId);
    const sources = await capturePublishedSources(trx, workspaceId);
    const queued = await trx('captureAccessChecks').where({
        workspaceId
    }).whereNull('processedAt').where('effectiveAt', '<=', entitlement.now).orderBy('effectiveAt').orderBy('id').forUpdate();
    const historical = new Map();
    for (const check of queued){
        for (const item of check.sources){
            // A reviewed relaunch after this loss supersedes delayed incident processing.
            const relaunched = await trx('captureSourceEvents').where({
                workspaceId,
                sourceId: item.id,
                kind: 'source.launched'
            }).whereRaw("actor->>'kind' = 'user'").where('createdAt', '>', check.effectiveAt).first('id');
            if (!relaunched) historical.set(item.id, item.reason);
        }
        await trx('captureAccessChecks').where({
            workspaceId,
            id: check.id
        }).update({
            processedAt: trx.fn.now()
        });
    }
    const over = entitlement.plan.limits.publishedCaptureSources !== null && sources.length > entitlement.plan.limits.publishedCaptureSources;
    for (const source of sources){
        const reason = workspace.suspendedAt ? 'workspace' : over ? 'source_capacity' : entitlement.plan.id === 'free' && source.type === 'gmail' ? 'entitlement' : historical.get(source.id);
        if (reason) await blockCaptureSource(trx, workspaceId, source, reason);
    }
}
async function captureCurrentBlocks(db, workspaceId) {
    const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(db, workspaceId), sources = await capturePublishedSources(db, workspaceId);
    const over = entitlement.plan.limits.publishedCaptureSources !== null && sources.length > entitlement.plan.limits.publishedCaptureSources;
    return new Map(sources.map((source)=>[
            source.id,
            over ? 'source_capacity' : entitlement.plan.id === 'free' && source.type === 'gmail' ? 'entitlement' : source.block
        ]));
}
async function captureOperationalState(trx, workspaceId, sourceId) {
    await reconcileCaptureAccessInTransaction(trx, workspaceId);
    const workspace = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', workspaceId).first('w.deletionRequestedAt', 'u.suspendedAt as ownerSuspendedAt', 'u.deletionRequestedAt as ownerDeletingAt');
    if (!workspace || workspace.deletionRequestedAt) return {
        allowed: false,
        status: null,
        block: 'workspace',
        configurationVersion: null
    };
    if (workspace.ownerSuspendedAt || workspace.ownerDeletingAt) {
        const current = await trx('captureSources').where({
            workspaceId,
            id: sourceId
        }).first('id', 'version', 'status', 'block');
        if (current) await blockCaptureSource(trx, workspaceId, current, 'workspace');
    }
    const source = await trx('captureSources').where({
        workspaceId,
        id: sourceId
    }).first('status', 'block', 'approvedVersion');
    return {
        allowed: !!source && source.status === 'active' && source.block === 'none',
        status: source?.status ?? null,
        block: source?.block ?? 'workspace',
        configurationVersion: source?.approvedVersion ?? null
    };
}
}),
"[project]/packages/data/src/lead-capture/setup-samples.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureSetupAnswers",
    ()=>captureSetupAnswers,
    "captureSetupFindingIssues",
    ()=>captureSetupFindingIssues,
    "captureSetupSampleApproved",
    ()=>captureSetupSampleApproved,
    "captureSetupSampleHash",
    ()=>captureSetupSampleHash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/configuration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
;
;
function captureSetupSampleHash(configuration) {
    if (configuration.type !== 'gmail') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        connectionId: configuration.connectionId,
        accountEmail: configuration.accountEmail,
        fields: configuration.fields,
        contactRequired: configuration.contactRequired,
        rules: configuration.rules,
        mappings: configuration.mappings
    });
}
function captureSetupAnswers(configuration, findings) {
    return Object.fromEntries(findings.filter((row)=>row.included).map((row)=>{
        const field = configuration.fields?.find((field)=>field.id === row.fieldId);
        const choice = (text)=>field?.options.find((option)=>option.id === text.trim() || option.label === text.trim())?.id ?? text.trim();
        return [
            row.fieldId,
            field?.type === 'checkboxes' ? row.sampleValue.split(',').map(choice) : field?.type === 'dropdown' ? choice(row.sampleValue) : row.sampleValue
        ];
    }));
}
function captureSetupFindingIssues(configuration, sample, findings, complete, allowCorrections = false) {
    if (configuration.type !== 'gmail' || !sample || !configuration.fields?.length || findings.length > 50 || new Set(findings.map((row)=>row.id)).size !== findings.length) return [
        'sample'
    ];
    const issues = [], included = findings.filter((row)=>row.included), ids = included.map((row)=>row.fieldId);
    if (new Set(ids).size !== ids.length || included.some((row)=>!configuration.fields.some((field)=>field.id === row.fieldId))) issues.push('fields');
    for (const row of findings){
        if (row.included && row.required !== configuration.fields.find((field)=>field.id === row.fieldId)?.required) issues.push('required');
        const corrected = row.sampleValue !== row.suggestedValue;
        if (corrected && !allowCorrections) issues.push('correction');
        if (row.suggestedValue && (!row.evidence || !sample[row.evidence.source].includes(row.evidence.text) || !row.evidence.text.includes(row.suggestedValue))) issues.push('evidence');
        if (row.confidence === 'found' && !row.suggestedValue) issues.push('evidence');
        if (complete && row.included && (!row.sampleValue.trim() || !row.instruction.trim())) issues.push('missing');
    }
    if (complete) {
        if (!configuration.contactRequired || ![
            'name',
            'service'
        ].every((key)=>configuration.fields.some((field)=>field.key === key && field.required))) issues.push('required');
        const rules = configuration.rules;
        if (!rules?.phrases.length) issues.push('rules');
        else {
            const parts = (rules.location === 'both' ? [
                sample.subject,
                sample.body
            ] : [
                sample[rules.location]
            ]).map((part)=>part.toLowerCase());
            const matches = rules.phrases.map((phrase)=>parts.some((part)=>part.includes(phrase.toLowerCase())));
            if (!(rules.mode === 'all' ? matches.every(Boolean) : matches.some(Boolean))) issues.push('rules');
        }
        const answers = captureSetupAnswers(configuration, included);
        issues.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureAnswerIssues"])(configuration.fields, answers, configuration.contactRequired ?? true));
        if (configuration.fields.some((field)=>field.required && !ids.includes(field.id)) || !configuration.fields.some((field)=>[
                'email',
                'phone'
            ].includes(field.key) && ids.includes(field.id))) issues.push('required');
        if (configuration.mappings?.length !== included.length || included.some((row)=>!configuration.mappings?.some((mapping)=>mapping.fieldId === row.fieldId && mapping.instruction === row.instruction))) issues.push('mappings');
    }
    return issues;
}
async function captureSetupSampleApproved(trx, workspaceId, sourceId, draftId, configuration) {
    if (configuration.type !== 'gmail' || !configuration.sampleId) return false;
    const row = await trx('captureSetupSamples').where({
        workspaceId,
        sourceId,
        draftId,
        id: configuration.sampleId,
        configurationHash: captureSetupSampleHash(configuration)
    }).first('id');
    return !!row;
}
}),
"[project]/packages/data/src/lead-capture/gmail-sample-approval.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approvedGmailSampleReady",
    ()=>approvedGmailSampleReady,
    "bindSavedGmailSample",
    ()=>bindSavedGmailSample,
    "captureGmailSampleBinding",
    ()=>captureGmailSampleBinding,
    "retainApprovedGmailSample",
    ()=>retainApprovedGmailSample
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$intake$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/intake.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/setup-samples.ts [app-route] (ecmascript)");
;
;
;
;
function captureGmailSampleBinding(configuration, draftVersion) {
    if (configuration.type !== 'gmail') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        connectionId: configuration.connectionId,
        accountEmail: configuration.accountEmail,
        rules: configuration.rules,
        mappings: configuration.mappings,
        fields: configuration.fields,
        contactRequired: configuration.contactRequired,
        draftVersion
    });
}
async function retainApprovedGmailSample(trx, identity, sourceId, sourceVersion, sampleId, configuration, sample, findings) {
    if (configuration.type !== 'gmail' || !sample) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
    // Preserve the independent pasted setup path without inventing a provider connection.
    if (!configuration.connectionId && !sample.retrievalId) return;
    const account = await trx('captureGmailAccounts').where({
        workspaceId: identity.workspaceId,
        id: configuration.connectionId ?? null,
        status: 'connected'
    }).first();
    const draft = await trx('captureSourceDrafts').where({
        workspaceId: identity.workspaceId,
        sourceId
    }).first();
    if (!account || !draft || account.email !== configuration.accountEmail || draft.configuration.connectionId !== account.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
    const now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
    let provenance = {
        kind: 'pasted'
    }, sender = '';
    if (sample.retrievalId) {
        const preview = await trx('captureGmailSamplePreviews').where({
            id: sample.retrievalId,
            workspaceId: identity.workspaceId,
            sourceId,
            sourceVersion,
            draftId: draft.id,
            draftVersion: draft.version,
            accountId: account.id,
            credentialGeneration: account.credentialGeneration,
            actorId: identity.userId
        }).first();
        if (!preview || preview.expiresAt <= now || preview.configurationHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(draft.configuration) || preview.contentHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
            subject: sample.subject,
            body: sample.body
        })) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
        sender = preview.sender;
        provenance = {
            kind: 'gmail',
            previewId: preview.id,
            messageId: preview.messageId,
            sender,
            receivedAt: preview.receivedAt.toISOString()
        };
    }
    const evidence = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$intake$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureEvidenceSchema"].parse({
        schemaVersion: 1,
        type: 'gmail',
        from: sender,
        subject: sample.subject,
        body: sample.body,
        fields: findings.filter((row)=>row.included).map((row)=>({
                fieldId: row.fieldId,
                uncertain: row.confidence !== 'found' || row.sampleValue !== row.suggestedValue,
                origin: row.evidence ? {
                    kind: 'email',
                    location: row.evidence.source,
                    quote: row.evidence.text
                } : null
            }))
    });
    const bindingHash = captureGmailSampleBinding(configuration, draft.version);
    await trx('captureSourceSamples').insert({
        id: sampleId,
        workspaceId: identity.workspaceId,
        sourceId,
        sourceType: 'gmail',
        draftId: draft.id,
        draftVersion: draft.version,
        connectionId: account.id,
        accountEmail: account.email,
        bindingHash,
        evidence: JSON.stringify(evidence),
        answers: JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupAnswers"])(configuration, findings)),
        reviewedBy: identity.userId,
        reviewedAt: now
    });
    await trx('captureGmailSampleBindings').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        sourceId,
        draftId: draft.id,
        sampleId,
        draftVersion: draft.version,
        bindingHash,
        provenance: JSON.stringify(provenance)
    });
}
async function bindSavedGmailSample(trx, workspaceId, sourceId, draftId, currentVersion, configuration) {
    if (configuration.type !== 'gmail' || !configuration.sampleId || !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupSampleApproved"])(trx, workspaceId, sourceId, draftId, configuration)) return;
    const sample = await trx('captureSourceSamples').where({
        id: configuration.sampleId,
        workspaceId,
        sourceId,
        draftId
    }).whereNotNull('reviewedAt').whereNotNull('reviewedBy').first();
    if (!sample || sample.draftVersion > currentVersion || sample.bindingHash !== captureGmailSampleBinding(configuration, sample.draftVersion)) return;
    const previous = await trx('captureGmailSampleBindings').where({
        workspaceId,
        sourceId,
        draftId,
        sampleId: sample.id,
        draftVersion: currentVersion
    }).first();
    if (!previous || previous.bindingHash !== captureGmailSampleBinding(configuration, currentVersion)) return;
    const bindingHash = captureGmailSampleBinding(configuration, currentVersion + 1);
    await trx('captureGmailSampleBindings').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId,
        sourceId,
        draftId,
        sampleId: sample.id,
        draftVersion: currentVersion + 1,
        bindingHash,
        provenance: JSON.stringify(previous.provenance)
    });
}
async function approvedGmailSampleReady(trx, workspaceId, sourceId, configuration, draftVersion) {
    if (configuration.type !== 'gmail' || !configuration.sampleId) return false;
    const sample = await trx('captureSourceSamples').where({
        id: configuration.sampleId,
        workspaceId,
        sourceId,
        connectionId: configuration.connectionId ?? null,
        accountEmail: configuration.accountEmail ?? ''
    }).whereNotNull('reviewedAt').whereNotNull('reviewedBy').first();
    if (!sample || sample.bindingHash !== captureGmailSampleBinding(configuration, sample.draftVersion)) return false;
    const binding = await trx('captureGmailSampleBindings').where({
        workspaceId,
        sourceId,
        sampleId: sample.id,
        draftId: sample.draftId,
        draftVersion
    }).first('bindingHash');
    return !!binding && binding.bindingHash === captureGmailSampleBinding(configuration, draftVersion);
}
}),
"[project]/packages/data/src/lead-capture/publication.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CapturePublicationError",
    ()=>CapturePublicationError,
    "cancelCapturePublication",
    ()=>cancelCapturePublication,
    "captureConfigurationChecks",
    ()=>captureConfigurationChecks,
    "capturePublicationReviewInTransaction",
    ()=>capturePublicationReviewInTransaction,
    "changeCapturePublication",
    ()=>changeCapturePublication,
    "openPreparedGmail",
    ()=>openPreparedGmail,
    "prepareGmailActivation",
    ()=>prepareGmailActivation,
    "processCapturePublications",
    ()=>processCapturePublications,
    "publishCaptureDraft",
    ()=>publishCaptureDraft,
    "readCapturePublicationReview",
    ()=>readCapturePublicationReview,
    "unavailableCaptureDelivery",
    ()=>unavailableCaptureDelivery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/publication.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/gmail-sample-approval.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/configuration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/commands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-assignment-settings/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/restore-publication-draft.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
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
class CapturePublicationError extends Error {
    kind;
    failures;
    constructor(kind, failures = []){
        super(kind === 'conflict' ? 'This setup changed. Reload and review the saved version.' : kind === 'readiness' ? 'Resolve the setup checks before publishing.' : 'Check the publication details and confirmation.'), this.kind = kind, this.failures = failures;
    }
}
const unavailableCaptureDelivery = Object.freeze({
    websiteReady: async ()=>false,
    gmailReady: async ()=>false
});
const resource = (source)=>({
        kind: 'capture_source',
        workspaceId: source.workspaceId,
        id: source.id
    });
function read(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read').allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function activate(context, source) {
    read(context);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.activate',
        resource: resource(source)
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
async function sourceRow(trx, workspaceId, sourceId, write = false) {
    const query = trx('captureSources').where({
        workspaceId,
        id: sourceId
    });
    const source = await (write ? query.forUpdate() : query).first();
    if (!source) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return source;
}
async function prepareGmailActivation(db, identity, enabled, target, authority) {
    if (!authority.gmailBaseline || db.isTransaction) return authority;
    const candidate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const source = await sourceRow(trx, identity.workspaceId, target.sourceId);
        if (source.type !== 'gmail') return null;
        if (target.kind === 'approved') {
            read(context);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leadCapture.pause',
                resource: resource(source)
            }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        } else activate(context, source);
        if (target.requestId && await trx('captureOperations').where({
            workspaceId: identity.workspaceId,
            requestId: target.requestId,
            operation: target.operation
        }).first('id')) return null;
        if (source.version !== target.expectedVersion) throw new CapturePublicationError('conflict');
        const transition = target.kind === 'transition' ? await trx('capturePublicationTransitions').where({
            workspaceId: source.workspaceId,
            sourceId: source.id,
            id: target.transitionId,
            state: 'pending'
        }).first() : null;
        const configurationVersion = transition?.configurationVersion ?? source.approvedVersion;
        const saved = target.kind === 'draft' ? await trx('captureSourceDrafts').where({
            workspaceId: source.workspaceId,
            sourceId: source.id,
            id: source.draftId
        }).first() : await trx('captureSourceVersions').where({
            workspaceId: source.workspaceId,
            sourceId: source.id,
            configurationVersion
        }).first();
        const configuration = saved?.configuration;
        if (target.kind === 'transition' && !transition || target.kind === 'approved' && source.status !== 'paused' || configuration?.type !== 'gmail' || !configuration.connectionId || !await authority.gmailReady(trx, source.workspaceId, source.id, configuration)) throw new CapturePublicationError('readiness', [
            'delivery'
        ]);
        const sample = target.kind === 'approved' ? await trx('captureSourceSamples').where({
            workspaceId: source.workspaceId,
            sourceId: source.id,
            id: configuration.sampleId ?? null
        }).first('draftVersion') : undefined;
        const draftVersion = target.kind === 'draft' ? saved.version : transition?.approvedDraftVersion ?? sample?.draftVersion;
        if (!draftVersion || !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["approvedGmailSampleReady"])(trx, source.workspaceId, source.id, configuration, draftVersion)) throw new CapturePublicationError('readiness', [
            'sample'
        ]);
        const account = await trx('captureGmailAccounts').where({
            workspaceId: source.workspaceId,
            id: configuration.connectionId,
            status: 'connected'
        }).first('credentialGeneration');
        if (!account) throw new CapturePublicationError('readiness', [
            'account'
        ]);
        return {
            workspaceId: source.workspaceId,
            sourceId: source.id,
            sourceVersion: source.version,
            configurationHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(configuration),
            accountId: configuration.connectionId,
            generation: account.credentialGeneration
        };
    });
    if (!candidate) return authority;
    let historyId;
    const expiresAt = Date.now() + 60_000;
    try {
        historyId = await authority.gmailBaseline(db, candidate.workspaceId, candidate.accountId);
    } catch  {
        throw new CapturePublicationError('readiness', [
            'delivery'
        ]);
    }
    if (!/^[0-9]{1,30}$/.test(historyId)) throw new CapturePublicationError('readiness', [
        'delivery'
    ]);
    const { accountId, generation, ...binding } = candidate;
    return {
        ...authority,
        preparedGmail: {
            ...binding,
            expiresAt,
            baseline: {
                accountId,
                generation,
                historyId
            }
        }
    };
}
async function openPreparedGmail(trx, source, configuration, authority) {
    if (source.type !== 'gmail' || !authority.gmailOpen) return;
    const prepared = authority.preparedGmail;
    if (!prepared || prepared.expiresAt <= Date.now() || prepared.workspaceId !== source.workspaceId || prepared.sourceId !== source.id || prepared.sourceVersion !== source.version || prepared.configurationHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(configuration)) throw new CapturePublicationError('readiness', [
        'delivery'
    ]);
    try {
        await authority.gmailOpen(trx, source.workspaceId, source.id, prepared.baseline);
    } catch  {
        throw new CapturePublicationError('readiness', [
            'delivery'
        ]);
    }
}
async function workflowReady(trx, workspaceId, configuration) {
    const assignment = configuration.workflow?.assignment;
    return !!assignment && (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCaptureAssignment"])(trx, workspaceId, assignment)).ready;
}
async function captureConfigurationChecks(trx, source, configuration, draftVersion, authority) {
    const fields = configuration.fields ?? [], parsedFields = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureFieldsSchema"].safeParse(fields);
    const fieldsReady = parsedFields.success && fields.length > 0 && [
        'name',
        'service'
    ].every((key)=>fields.some((field)=>field.key === key && field.required)) && fields.some((field)=>[
            'email',
            'phone'
        ].includes(field.key)) && fields.every((field)=>!!field.label && (![
            'dropdown',
            'checkboxes'
        ].includes(field.type) || field.options.length >= 2 && field.options.every((option)=>!!option.label)));
    let account = true, sample = true;
    const delivery = configuration.type === 'website' ? await authority.websiteReady(trx, source.workspaceId) : await authority.gmailReady(trx, source.workspaceId, source.id, configuration);
    if (configuration.type === 'gmail') {
        account = !!configuration.connectionId && !!configuration.accountEmail && !!await trx('captureGmailAccounts').where({
            workspaceId: source.workspaceId,
            id: configuration.connectionId,
            email: configuration.accountEmail,
            status: 'connected'
        }).first('id');
        sample = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["approvedGmailSampleReady"])(trx, source.workspaceId, source.id, configuration, draftVersion);
    }
    const content = configuration.type !== 'website' || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureContentSchema"].safeParse(configuration.content).success;
    return [
        {
            code: 'configuration',
            ready: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureConfigurationSchema"].safeParse(configuration).success && content
        },
        {
            code: 'fields',
            ready: fieldsReady
        },
        {
            code: 'workflow',
            ready: await workflowReady(trx, source.workspaceId, configuration)
        },
        {
            code: 'delivery',
            ready: delivery
        },
        ...configuration.type === 'gmail' ? [
            {
                code: 'account',
                ready: account
            },
            {
                code: 'sample',
                ready: sample
            }
        ] : []
    ];
}
async function capturePublicationReviewInTransaction(trx, context, source, authority = unavailableCaptureDelivery) {
    read(context);
    const draft = source.draftId ? await trx('captureSourceDrafts').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        id: source.draftId
    }).first() : undefined;
    const pending = await trx('capturePublicationTransitions').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        state: 'pending'
    }).first();
    const latest = await trx('captureSourceVersions').where({
        workspaceId: source.workspaceId,
        sourceId: source.id
    }).max('configurationVersion as version').first();
    const capacity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, source.workspaceId, source.id, source.type);
    const canActivate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.activate',
        resource: resource(source)
    }).allowed;
    let pendingChecks;
    if (pending) {
        const target = await trx('captureSourceVersions').where({
            workspaceId: source.workspaceId,
            sourceId: source.id,
            configurationVersion: pending.configurationVersion
        }).first('configuration');
        pendingChecks = target ? await captureConfigurationChecks(trx, source, target.configuration, pending.approvedDraftVersion, authority) : [
            {
                code: 'configuration',
                ready: false
            }
        ];
        pendingChecks.push({
            code: 'access',
            ready: capacity.access
        }, {
            code: 'capacity',
            ready: capacity.ready
        }, {
            code: 'permission',
            ready: canActivate
        }, {
            code: 'workspace',
            ready: [
                'active',
                'scheduled'
            ].includes(source.status) && source.block === 'none' && source.approvedVersion === (source.status === 'scheduled' ? pending.configurationVersion : pending.baseApprovedVersion) && new Date(pending.scheduledAt) > capacity.now
        });
    }
    const checks = [
        ...draft ? await captureConfigurationChecks(trx, source, draft.configuration, draft.version, authority) : [
            {
                code: 'configuration',
                ready: false
            }
        ],
        {
            code: 'access',
            ready: capacity.access
        },
        {
            code: 'capacity',
            ready: capacity.ready
        },
        {
            code: 'permission',
            ready: canActivate
        },
        {
            code: 'pending',
            ready: !pending
        },
        {
            code: 'workspace',
            ready: source.status !== 'archived' && !!draft && draft.baseApprovedVersion === source.approvedVersion
        }
    ];
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationReviewSchema"].parse({
        sourceId: source.id,
        sourceVersion: source.version,
        draftVersion: draft?.version ?? null,
        baseApprovedVersion: draft?.baseApprovedVersion ?? source.approvedVersion,
        configurationVersion: Number(latest?.version ?? 0) + 1,
        canActivate,
        ready: checks.every((check)=>check.ready),
        plan: capacity.plan,
        used: capacity.used,
        limit: capacity.limit,
        checks,
        ...pendingChecks ? {
            pendingChecks,
            pendingReady: pendingChecks.every((check)=>check.ready)
        } : {},
        pending: pending ? {
            id: pending.id,
            configurationVersion: pending.configurationVersion,
            at: pending.scheduledAt.toISOString(),
            timezone: pending.timezone
        } : null
    });
}
async function readCapturePublicationReview(db, identity, enabled, raw, authority = unavailableCaptureDelivery) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceDetailQuerySchema"].safeParse(raw);
    if (!parsed.success) throw new CapturePublicationError('validation');
    if (parsed.data.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>capturePublicationReviewInTransaction(trx, context, await sourceRow(trx, identity.workspaceId, parsed.data.sourceId), authority));
}
async function publicationReplay(trx, identity, operation, requestId, hash) {
    const existing = await trx('captureOperations').where({
        workspaceId: identity.workspaceId,
        operation,
        requestId
    }).first();
    if (!existing) return null;
    if (existing.inputHash !== hash || existing.actor.kind !== 'user' || existing.actor.userId !== identity.userId) throw new CapturePublicationError('conflict');
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureOperationResultSchema"].parse(existing.result);
    if (parsed.kind !== 'publication') throw new CapturePublicationError('conflict');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationResultSchema"].parse({
        ok: true,
        sourceId: parsed.sourceId,
        sourceVersion: parsed.sourceVersion,
        configurationVersion: parsed.configurationVersion,
        status: parsed.status,
        transitionId: parsed.transitionId
    });
}
async function receipt(trx, identity, operation, requestId, hash, result) {
    const record = {
        sourceId: result.sourceId,
        sourceVersion: result.sourceVersion,
        configurationVersion: result.configurationVersion,
        status: result.status,
        transitionId: result.transitionId
    };
    await trx('captureOperations').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        operation,
        requestId,
        inputHash: hash,
        actor: JSON.stringify({
            kind: 'user',
            userId: identity.userId
        }),
        target: JSON.stringify({
            sourceId: result.sourceId
        }),
        result: JSON.stringify({
            kind: 'publication',
            ...record
        })
    });
    return result;
}
async function pointPublication(trx, source, configurationVersion) {
    if (source.type !== 'website') return;
    const existing = await trx('capturePublications').where({
        workspaceId: source.workspaceId,
        sourceId: source.id
    }).first();
    if (existing) await trx('capturePublications').where({
        workspaceId: source.workspaceId,
        id: existing.id
    }).update({
        configurationVersion,
        version: existing.version + 1
    });
    else await trx('capturePublications').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: source.workspaceId,
        sourceId: source.id,
        sourceType: 'website',
        configurationVersion,
        version: 1,
        publicKey: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString('hex')
    });
}
async function event(trx, source, kind, actor, configurationVersion) {
    await trx('captureSourceEvents').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: source.workspaceId,
        sourceId: source.id,
        kind,
        actor: JSON.stringify(actor),
        data: JSON.stringify({
            sourceVersion: source.version,
            configurationVersion
        })
    });
}
async function publishCaptureDraft(db, identity, enabled, raw, authority = unavailableCaptureDelivery) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublishCommandSchema"].safeParse(raw);
    if (!parsed.success) throw new CapturePublicationError('validation');
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input);
    if (input.timing.kind === 'now') authority = await prepareGmailActivation(db, identity, enabled, {
        ...input,
        kind: 'draft',
        operation: 'source.launch'
    }, authority);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        let source = await sourceRow(trx, identity.workspaceId, input.sourceId, true);
        activate(context, source);
        const repeated = await publicationReplay(trx, identity, 'source.launch', input.requestId, hash);
        if (repeated) return repeated;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileCaptureAccessInTransaction"])(trx, identity.workspaceId);
        source = await sourceRow(trx, identity.workspaceId, input.sourceId, true);
        if (source.version !== input.expectedVersion || source.approvedVersion !== input.baseApprovedVersion) throw new CapturePublicationError('conflict');
        const review = await capturePublicationReviewInTransaction(trx, context, source, authority);
        if (review.draftVersion !== input.draftVersion || review.configurationVersion !== input.configurationVersion) throw new CapturePublicationError('conflict');
        if (!review.ready) throw new CapturePublicationError('readiness', review.checks.filter((check)=>!check.ready).map((check)=>check.code));
        const { now } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, identity.workspaceId, source.id, source.type);
        const workspace = await trx('workspaces').where({
            id: identity.workspaceId
        }).first('timezone');
        if (input.timing.kind === 'scheduled' && (Date.parse(input.timing.at) <= now.getTime() || input.timing.timezone !== workspace.timezone)) throw new CapturePublicationError('validation');
        if (!source.draftId) throw new CapturePublicationError('conflict');
        const draft = await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            id: source.draftId
        }).forUpdate().first();
        if (!draft) throw new CapturePublicationError('conflict');
        const configuration = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureConfigurationSchema"].parse(draft.configuration), configurationVersion = review.configurationVersion;
        await trx('captureSourceVersions').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            sourceType: source.type,
            configurationVersion,
            definitionVersion: configurationVersion,
            workflowVersion: configurationVersion,
            configuration: JSON.stringify(configuration),
            approvedBy: identity.userId,
            approvedAt: now
        });
        const revisionScheduled = input.timing.kind === 'scheduled' && source.status === 'active' && source.block === 'none';
        const scheduled = input.timing.kind === 'scheduled', transitionId = scheduled ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])() : null;
        const status = revisionScheduled ? 'active' : scheduled ? 'scheduled' : 'active';
        const version = source.version + 1;
        if (input.timing.kind === 'scheduled') await trx('capturePublicationTransitions').insert({
            id: transitionId,
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            configurationVersion,
            baseApprovedVersion: source.approvedVersion,
            approvedSourceVersion: version,
            approvedDraftVersion: draft.version,
            actorId: identity.userId,
            scheduledAt: input.timing.at,
            timezone: input.timing.timezone
        });
        if (!revisionScheduled) await pointPublication(trx, source, configurationVersion);
        await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: source.id
        }).update({
            version,
            status,
            block: 'none',
            approvedVersion: revisionScheduled ? source.approvedVersion : configurationVersion,
            draftId: null,
            scheduledAt: input.timing.kind === 'scheduled' && !revisionScheduled ? input.timing.at : null,
            timezone: input.timing.kind === 'scheduled' && !revisionScheduled ? input.timing.timezone : null,
            updatedAt: trx.fn.now()
        });
        if (!scheduled) await openPreparedGmail(trx, source, configuration, authority);
        await event(trx, {
            ...source,
            version
        }, scheduled ? 'source.scheduled' : 'source.launched', {
            kind: 'user',
            userId: identity.userId
        }, configurationVersion);
        return receipt(trx, identity, 'source.launch', input.requestId, hash, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationResultSchema"].parse({
            ok: true,
            sourceId: source.id,
            sourceVersion: version,
            configurationVersion,
            status: revisionScheduled ? 'revision_scheduled' : status,
            transitionId
        }));
    });
}
async function cancelCapturePublication(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCancelPublicationSchema"].safeParse(raw);
    if (!parsed.success) throw new CapturePublicationError('validation');
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const source = await sourceRow(trx, identity.workspaceId, input.sourceId, true);
        activate(context, source);
        const repeated = await publicationReplay(trx, identity, 'source.reschedule', input.requestId, hash);
        if (repeated) return repeated;
        const pending = await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            id: input.transitionId,
            state: 'pending'
        }).forUpdate().first();
        if (!pending || source.version !== input.expectedVersion || source.status === 'archived') throw new CapturePublicationError('conflict');
        await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            id: pending.id
        }).update({
            state: 'cancelled',
            completedAt: trx.fn.now()
        });
        const version = source.version + 1;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePublicationDraft"])(trx, identity.workspaceId, source.id, pending.configurationVersion);
        await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: source.id
        }).update({
            version,
            status: source.status === 'scheduled' ? 'paused' : source.status,
            scheduledAt: null,
            timezone: null,
            updatedAt: trx.fn.now()
        });
        await event(trx, {
            ...source,
            version
        }, 'source.schedule_cancelled', {
            kind: 'user',
            userId: identity.userId
        }, pending.configurationVersion);
        return receipt(trx, identity, 'source.reschedule', input.requestId, hash, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationResultSchema"].parse({
            ok: true,
            sourceId: source.id,
            sourceVersion: version,
            configurationVersion: pending.configurationVersion,
            status: 'cancelled',
            transitionId: pending.id
        }));
    });
}
async function processCapturePublications(db, enabled, authority = unavailableCaptureDelivery, limit = 100, workspaceIds) {
    const candidates = await db('captureSources').whereIn('status', [
        'active',
        'paused',
        'scheduled'
    ]).modify((query)=>{
        if (workspaceIds !== undefined) query.whereIn('workspaceId', [
            ...workspaceIds
        ]);
        if (authority.scheduledType) query.where('type', authority.scheduledType);
        if (authority.scheduledSourceIds) query.whereIn('id', [
            ...authority.scheduledSourceIds
        ]);
    }).distinct('workspaceId').orderBy('workspaceId');
    const due = (query)=>query('capturePublicationTransitions as t').join('captureSources as s', 's.id', 't.sourceId').where('t.state', 'pending').where('t.scheduledAt', '<=', query.fn.now()).modify((q)=>{
            if (authority.scheduledType) q.where('s.type', authority.scheduledType);
            if (authority.scheduledSourceIds) q.whereIn('s.id', [
                ...authority.scheduledSourceIds
            ]);
        }).orderBy('t.scheduledAt').orderBy('t.id').limit(limit).select('t.*', 's.version as currentSourceVersion', 's.type as sourceType');
    let applied = 0;
    for (const { workspaceId } of candidates){
        const prepared = new Map();
        const retry = new Set();
        if (authority.gmailBaseline) {
            for (const transition of (await due(db).where('t.workspaceId', workspaceId).where('s.type', 'gmail'))){
                try {
                    const active = await prepareGmailActivation(db, {
                        workspaceId,
                        userId: transition.actorId
                    }, enabled, {
                        sourceId: transition.sourceId,
                        expectedVersion: transition.currentSourceVersion,
                        kind: 'transition',
                        transitionId: transition.id,
                        operation: 'source.reschedule'
                    }, authority);
                    prepared.set(transition.id, active);
                } catch (error) {
                    if (error instanceof CapturePublicationError) {
                        if (error.kind === 'conflict' || error.failures.includes('delivery')) retry.add(transition.id);
                    } else if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
                }
            }
        }
        await db.transaction(async (trx)=>{
            const workspace = await trx('workspaces').where({
                id: workspaceId
            }).whereNull('deletionRequestedAt').forUpdate().first('id', 'suspendedAt');
            if (!workspace || workspace.suspendedAt) return;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileCaptureAccessInTransaction"])(trx, workspaceId);
            const pending = await due(trx).where('t.workspaceId', workspaceId);
            for (const transition of pending){
                if (retry.has(transition.id)) continue;
                const source = await sourceRow(trx, workspaceId, transition.sourceId, true);
                const target = await trx('captureSourceVersions').where({
                    workspaceId,
                    sourceId: source.id,
                    configurationVersion: transition.configurationVersion
                }).first();
                const failures = [];
                const first = transition.baseApprovedVersion === null || source.status === 'scheduled';
                if (!target || source.status === 'archived' || source.block !== 'none' || source.approvedVersion !== (first ? transition.configurationVersion : transition.baseApprovedVersion)) failures.push('workspace');
                try {
                    const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
                        userId: transition.actorId,
                        workspaceId
                    }, enabled);
                    activate(context, source);
                    if (target) failures.push(...(await captureConfigurationChecks(trx, source, target.configuration, transition.approvedDraftVersion, authority)).filter((check)=>!check.ready).map((check)=>check.code));
                } catch (error) {
                    if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
                    failures.push('permission');
                }
                const capacity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, workspaceId, source.id, source.type);
                if (!capacity.ready) failures.push('capacity');
                if (!capacity.access) failures.push('access');
                if (!failures.length && source.type === 'gmail' && authority.gmailOpen && !prepared.has(transition.id)) continue;
                await trx('capturePublicationTransitions').where({
                    workspaceId,
                    id: transition.id,
                    state: 'pending'
                }).update({
                    state: failures.length ? 'blocked' : 'applied',
                    failures: JSON.stringify([
                        ...new Set(failures)
                    ]),
                    completedAt: trx.fn.now()
                });
                const version = source.version + 1;
                if (failures.length) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePublicationDraft"])(trx, workspaceId, source.id, transition.configurationVersion);
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyCaptureBlocked"])(trx, workspaceId, source.id, version, 'publication');
                    await trx('captureSources').where({
                        workspaceId,
                        id: source.id
                    }).update({
                        version,
                        ...source.status === 'scheduled' ? {
                            status: 'paused',
                            block: failures.includes('access') ? 'entitlement' : failures.includes('capacity') ? 'source_capacity' : failures.includes('delivery') ? 'connection' : 'workspace',
                            scheduledAt: null,
                            timezone: null
                        } : {},
                        updatedAt: trx.fn.now()
                    });
                    await event(trx, {
                        ...source,
                        version
                    }, 'source.schedule_blocked', {
                        kind: 'service',
                        service: 'scheduler'
                    }, transition.configurationVersion);
                } else {
                    if (!first) await pointPublication(trx, source, transition.configurationVersion);
                    await trx('captureSources').where({
                        workspaceId,
                        id: source.id
                    }).update({
                        version,
                        status: 'active',
                        block: 'none',
                        approvedVersion: transition.configurationVersion,
                        scheduledAt: null,
                        timezone: null,
                        updatedAt: trx.fn.now()
                    });
                    await openPreparedGmail(trx, source, target.configuration, prepared.get(transition.id) ?? authority);
                    await event(trx, {
                        ...source,
                        version
                    }, 'source.launched', {
                        kind: 'service',
                        service: 'scheduler'
                    }, transition.configurationVersion);
                    applied++;
                }
            }
        });
    }
    return applied;
}
async function changeCapturePublication(db, identity, enabled, raw, authority = unavailableCaptureDelivery) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChangePublicationSchema"].safeParse(raw);
    if (!parsed.success) throw new CapturePublicationError('validation');
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input);
    if (input.timing.kind === 'now') authority = await prepareGmailActivation(db, identity, enabled, {
        ...input,
        kind: 'transition',
        operation: 'source.reschedule'
    }, authority);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const source = await sourceRow(trx, identity.workspaceId, input.sourceId, true);
        activate(context, source);
        const repeated = await publicationReplay(trx, identity, 'source.reschedule', input.requestId, hash);
        if (repeated) return repeated;
        const pending = await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            id: input.transitionId,
            state: 'pending'
        }).forUpdate().first();
        const capacity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, identity.workspaceId, source.id, source.type);
        if (!pending || source.version !== input.expectedVersion || ![
            'active',
            'scheduled'
        ].includes(source.status) || source.block !== 'none' || new Date(pending.scheduledAt) <= capacity.now) throw new CapturePublicationError('conflict');
        const first = source.status === 'scheduled';
        if (source.approvedVersion !== (first ? pending.configurationVersion : pending.baseApprovedVersion)) throw new CapturePublicationError('conflict');
        const target = await trx('captureSourceVersions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            configurationVersion: pending.configurationVersion
        }).first('configuration');
        if (!target) throw new CapturePublicationError('conflict');
        const failures = (await captureConfigurationChecks(trx, source, target.configuration, pending.approvedDraftVersion, authority)).filter((check)=>!check.ready).map((check)=>check.code);
        if (!capacity.access) failures.push('access');
        if (!capacity.ready) failures.push('capacity');
        if (failures.length) throw new CapturePublicationError('readiness', failures);
        const workspace = await trx('workspaces').where({
            id: identity.workspaceId
        }).first('timezone');
        const scheduled = input.timing.kind === 'scheduled';
        if (scheduled && input.timing.kind === 'scheduled' && (Date.parse(input.timing.at) <= capacity.now.getTime() || input.timing.timezone !== workspace.timezone || Date.parse(input.timing.at) === new Date(pending.scheduledAt).getTime())) throw new CapturePublicationError('validation');
        const version = source.version + 1, transitionId = scheduled ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])() : pending.id;
        await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            id: pending.id
        }).update({
            state: scheduled ? 'cancelled' : 'applied',
            completedAt: capacity.now
        });
        if (input.timing.kind === 'scheduled') {
            await trx('capturePublicationTransitions').insert({
                id: transitionId,
                workspaceId: identity.workspaceId,
                sourceId: source.id,
                configurationVersion: pending.configurationVersion,
                baseApprovedVersion: pending.baseApprovedVersion,
                approvedSourceVersion: version,
                approvedDraftVersion: pending.approvedDraftVersion,
                actorId: identity.userId,
                scheduledAt: input.timing.at,
                timezone: input.timing.timezone
            });
            await trx('captureSources').where({
                workspaceId: identity.workspaceId,
                id: source.id
            }).update({
                version,
                ...first ? {
                    scheduledAt: input.timing.at,
                    timezone: input.timing.timezone
                } : {},
                updatedAt: trx.fn.now()
            });
        } else {
            await pointPublication(trx, source, pending.configurationVersion);
            await trx('captureSources').where({
                workspaceId: identity.workspaceId,
                id: source.id
            }).update({
                version,
                status: 'active',
                approvedVersion: pending.configurationVersion,
                scheduledAt: null,
                timezone: null,
                updatedAt: trx.fn.now()
            });
            await openPreparedGmail(trx, source, target.configuration, authority);
        }
        await event(trx, {
            ...source,
            version
        }, scheduled ? 'source.scheduled' : 'source.launched', {
            kind: 'user',
            userId: identity.userId
        }, pending.configurationVersion);
        return receipt(trx, identity, 'source.reschedule', input.requestId, hash, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationResultSchema"].parse({
            ok: true,
            sourceId: source.id,
            sourceVersion: version,
            configurationVersion: pending.configurationVersion,
            status: scheduled ? first ? 'scheduled' : 'revision_scheduled' : 'active',
            transitionId
        }));
    });
}
}),
"[project]/packages/data/src/lead-capture/lifecycle.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureLifecycleReviewInTransaction",
    ()=>captureLifecycleReviewInTransaction,
    "changeCaptureLifecycle",
    ()=>changeCaptureLifecycle
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/commands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/publication.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/restore-publication-draft.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
async function resumeChecks(trx, source, authority) {
    const approved = await trx('captureSourceVersions').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        configurationVersion: source.approvedVersion
    }).first();
    if (!approved) return [
        {
            code: 'configuration',
            ready: false
        }
    ];
    // Approved Gmail samples bind the original reviewed draft version, not a later draft head.
    const sample = source.type === 'gmail' && approved.configuration.sampleId ? await trx('captureSourceSamples').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        id: approved.configuration.sampleId
    }).first('draftVersion') : undefined;
    const checks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureConfigurationChecks"])(trx, source, approved.configuration, sample?.draftVersion ?? approved.configurationVersion, authority);
    const capacity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, source.workspaceId, source.id, source.type);
    const owner = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', source.workspaceId).forShare('u').first('u.suspendedAt', 'u.deletionRequestedAt');
    const pending = await trx('capturePublicationTransitions').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        state: 'pending'
    }).first('id');
    checks.push({
        code: 'access',
        ready: capacity.access
    }, {
        code: 'capacity',
        ready: capacity.ready
    }, {
        code: 'workspace',
        ready: !!owner && !owner.suspendedAt && !owner.deletionRequestedAt
    }, {
        code: 'pending',
        ready: !pending
    });
    return checks;
}
async function captureLifecycleReviewInTransaction(trx, context, source, authority = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"]) {
    const resource = {
        kind: 'capture_source',
        workspaceId: source.workspaceId,
        id: source.id
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.read',
        resource
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const pause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.pause',
        resource
    }).allowed;
    const canResume = pause && source.status === 'paused' && source.approvedVersion !== null;
    const canRestore = source.status === 'archived' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.archive',
        resource
    }).allowed;
    const restoration = canRestore ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, source.workspaceId, source.id, source.type) : undefined;
    const restoreFailures = restoration ? [
        ...!restoration.access ? [
            'access'
        ] : [],
        ...!restoration.ready ? [
            'capacity'
        ] : []
    ] : [];
    const checks = canResume ? await resumeChecks(trx, source, authority) : [];
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureLifecycleReviewSchema"].parse({
        sourceId: source.id,
        sourceVersion: source.version,
        approvedVersion: source.approvedVersion,
        canRestore,
        restoreReady: canRestore && !restoreFailures.length,
        restoreFailures,
        canPause: pause && source.status === 'active',
        canResume,
        canArchive: source.status !== 'archived' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.archive',
            resource
        }).allowed,
        resumeReady: canResume && checks.every((check)=>check.ready),
        resumeFailures: checks.filter((check)=>!check.ready).map((check)=>check.code)
    });
}
async function changeCaptureLifecycle(db, identity, enabled, raw, authority = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"]) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureLifecycleCommandSchema"].safeParse(raw);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('validation');
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (input.action === 'resume') authority = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prepareGmailActivation"])(db, identity, enabled, {
        ...input,
        kind: 'approved',
        operation: 'source.resume'
    }, authority);
    const operation = `source.${input.action}`, hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        let source = await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: input.sourceId
        }).forUpdate().first();
        const resource = {
            kind: 'capture_source',
            workspaceId: identity.workspaceId,
            id: input.sourceId
        };
        const permission = [
            'archive',
            'restore'
        ].includes(input.action) ? 'leadCapture.archive' : 'leadCapture.pause';
        if (!source || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.read',
            resource
        }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        // A lost response may be retried after subsequent transitions, but never after revocation.
        const repeated = await trx('captureOperations').where({
            workspaceId: identity.workspaceId,
            operation,
            requestId: input.requestId
        }).first();
        if (repeated) {
            const saved = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureOperationResultSchema"].safeParse(repeated.result);
            if (repeated.inputHash !== hash || repeated.actor.kind !== 'user' || repeated.actor.userId !== identity.userId || repeated.target.sourceId !== input.sourceId || !saved.success || saved.data.kind !== 'source' || saved.data.sourceId !== input.sourceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureLifecycleSavedSchema"].parse({
                ok: true,
                sourceId: saved.data.sourceId,
                sourceVersion: saved.data.sourceVersion
            });
        }
        if (source.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
        if (input.action === 'resume') {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileCaptureAccessInTransaction"])(trx, identity.workspaceId);
            source = await trx('captureSources').where({
                workspaceId: identity.workspaceId,
                id: input.sourceId
            }).forUpdate().first();
            // Commit an observed access-loss incident before asking the caller to reload it.
            // Throwing here would roll it back and make every retry see the same old version.
            if (source.version !== input.expectedVersion) return {
                error: new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict')
            };
        }
        const eligible = input.action === 'pause' ? source.status === 'active' : input.action === 'resume' ? source.status === 'paused' : input.action === 'restore' ? source.status === 'archived' : [
            'draft',
            'active',
            'paused',
            'scheduled'
        ].includes(source.status);
        if (!eligible) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
        if (input.action === 'restore') {
            const capacity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCapacity"])(trx, identity.workspaceId, source.id, source.type);
            const failures = [
                ...!capacity.access ? [
                    'access'
                ] : [],
                ...!capacity.ready ? [
                    'capacity'
                ] : []
            ];
            if (failures.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('readiness', failures);
        }
        if (input.action === 'resume') {
            if (!source.approvedVersion || input.configuration?.version !== source.approvedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
            const failures = (await resumeChecks(trx, source, authority)).filter((check)=>!check.ready).map((check)=>check.code);
            if (failures.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('readiness', failures);
        }
        const version = source.version + 1;
        const status = [
            'pause',
            'restore'
        ].includes(input.action) ? 'paused' : input.action === 'archive' ? 'archived' : 'active';
        if (input.action !== 'resume') {
            const pending = await trx('capturePublicationTransitions').where({
                workspaceId: identity.workspaceId,
                sourceId: source.id,
                state: 'pending'
            }).forUpdate().first();
            if (pending) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$restore$2d$publication$2d$draft$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePublicationDraft"])(trx, identity.workspaceId, source.id, pending.configurationVersion);
                await trx('capturePublicationTransitions').where({
                    workspaceId: identity.workspaceId,
                    id: pending.id
                }).update({
                    state: 'cancelled',
                    completedAt: trx.fn.now()
                });
                await trx('captureSourceEvents').insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: identity.workspaceId,
                    sourceId: source.id,
                    kind: 'source.schedule_cancelled',
                    actor: JSON.stringify({
                        kind: 'user',
                        userId: identity.userId
                    }),
                    data: JSON.stringify({
                        sourceVersion: version,
                        configurationVersion: pending.configurationVersion
                    })
                });
            }
        }
        const updated = await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: source.id,
            version: input.expectedVersion
        }).update({
            status,
            version,
            ...input.action === 'resume' ? {
                block: 'none'
            } : {},
            scheduledAt: null,
            timezone: null,
            updatedAt: trx.fn.now()
        });
        if (updated !== 1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
        if (input.action === 'resume' && source.type === 'gmail' && authority.gmailOpen) {
            const approved = await trx('captureSourceVersions').where({
                workspaceId: identity.workspaceId,
                sourceId: source.id,
                configurationVersion: source.approvedVersion
            }).first('configuration');
            if (!approved) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('conflict');
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openPreparedGmail"])(trx, source, approved.configuration, authority);
        }
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureLifecycleSavedSchema"].parse({
            ok: true,
            sourceId: source.id,
            sourceVersion: version
        });
        await trx('captureOperations').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            operation,
            requestId: input.requestId,
            inputHash: hash,
            actor: JSON.stringify({
                kind: 'user',
                userId: identity.userId
            }),
            target: JSON.stringify({
                sourceId: source.id
            }),
            result: JSON.stringify({
                kind: 'source',
                sourceId: source.id,
                sourceVersion: version
            })
        });
        await trx('captureSourceEvents').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            kind: input.action === 'restore' ? 'source.restored' : input.action === 'pause' ? 'source.paused' : input.action === 'archive' ? 'source.archived' : 'source.launched',
            actor: JSON.stringify({
                kind: 'user',
                userId: identity.userId
            }),
            data: JSON.stringify({
                sourceVersion: version,
                ...source.approvedVersion ? {
                    configurationVersion: source.approvedVersion
                } : {},
                status
            })
        });
        return result;
    });
    if ('error' in result) throw result.error;
    return result;
}
}),
"[project]/packages/data/src/lead-capture/installation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureInstallation",
    ()=>captureInstallation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$installation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/installation.ts [app-route] (ecmascript)");
;
function captureInstallation(origin, publication, source) {
    const url = new URL(origin);
    if (url.origin !== origin || url.username || url.password || !(url.protocol === 'https:' || url.protocol === 'http:' && [
        'localhost',
        '127.0.0.1'
    ].includes(url.hostname)) || !/^[a-f0-9]{64}$/.test(publication.publicKey)) throw Error('Invalid installation origin or publication.');
    const attribute = (value)=>value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    const key = publication.publicKey;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$installation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureInstallationSchema"].parse({
        id: source.id,
        version: publication.configurationVersion,
        name: source.name,
        hostedUrl: `${origin}/f/${key}`,
        status: source.block !== 'none' ? 'blocked' : source.status,
        embeds: [
            {
                method: 'iframe',
                code: `<iframe src="${attribute(origin)}/embed/${key}" title="Service request form" width="100%" height="1000" style="border:0" referrerpolicy="no-referrer" loading="lazy"></iframe>`
            },
            {
                method: 'javascript',
                code: `<script async src="${attribute(origin)}/embed.js" data-public-key="${key}"></script>`
            }
        ],
        ...source.status === 'scheduled' ? {
            scheduledAt: source.scheduledAt?.toISOString(),
            timezone: source.timezone ?? undefined
        } : {}
    });
}
}),
"[project]/packages/data/src/lead-capture/public.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readPublicCapture",
    ()=>readPublicCapture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/configuration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/public.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-assignment-settings/store.ts [app-route] (ecmascript)");
;
;
;
async function readPublicCapture(db, rawKey) {
    const key = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicKeySchema"].safeParse(rawKey);
    if (!key.success) return {
        state: 'not-found'
    };
    return db.transaction(async (trx)=>{
        const publication = await trx('capturePublications').where({
            publicKey: key.data,
            sourceType: 'website'
        }).first('workspaceId', 'sourceId', 'configurationVersion', 'version');
        if (!publication) return {
            state: 'not-found'
        };
        const workspace = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', publication.workspaceId).whereNull('w.deletionRequestedAt').select('w.id', 'w.suspendedAt', 'u.suspendedAt as ownerSuspendedAt', 'u.deletionRequestedAt as ownerDeletingAt').forShare('w').first();
        if (!workspace) return {
            state: 'not-found'
        };
        // Reload after acquiring the workspace lock so a concurrent revision cannot mix bindings.
        const current = await trx('capturePublications').where({
            workspaceId: publication.workspaceId,
            sourceId: publication.sourceId,
            publicKey: key.data
        }).first();
        const source = await trx('captureSources').where({
            workspaceId: publication.workspaceId,
            id: publication.sourceId,
            type: 'website'
        }).first('status', 'block', 'approvedVersion');
        if (!current || !source || current.configurationVersion !== source.approvedVersion) return {
            state: 'not-found'
        };
        const approved = await trx('captureSourceVersions').where({
            workspaceId: publication.workspaceId,
            sourceId: publication.sourceId,
            configurationVersion: current.configurationVersion,
            sourceType: 'website'
        }).first('configuration');
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureConfigurationSchema"].safeParse(approved?.configuration);
        if (!parsed.success || parsed.data.type !== 'website') return {
            state: 'not-found'
        };
        const configuration = parsed.data;
        const content = {
            ...configuration.content,
            businessEmail: configuration.content.showBusinessEmail ? configuration.content.businessEmail : '',
            businessPhone: configuration.content.showBusinessPhone ? configuration.content.businessPhone : ''
        };
        const blocks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentBlocks"])(trx, publication.workspaceId);
        const { rows: [{ now }] } = await trx.raw('SELECT current_timestamp AS now');
        const incident = await trx('captureAccessChecks').where({
            workspaceId: publication.workspaceId
        }).whereNull('processedAt').where('effectiveAt', '<=', now).whereRaw('sources @> ?::jsonb', [
            JSON.stringify([
                {
                    id: publication.sourceId
                }
            ])
        ]).first('id');
        const assignment = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCaptureAssignment"])(trx, publication.workspaceId, configuration.workflow.assignment);
        if (workspace.suspendedAt || workspace.ownerSuspendedAt || workspace.ownerDeletingAt || source.status !== 'active' || source.block !== 'none' || blocks.get(publication.sourceId) !== 'none' || incident || !assignment.ready) {
            return {
                state: 'unavailable',
                content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicUnavailableSchema"].parse({
                    businessName: content.businessName,
                    title: content.title,
                    unavailableMessage: content.unavailableMessage,
                    businessEmail: content.businessEmail,
                    businessPhone: content.businessPhone,
                    showBusinessEmail: content.showBusinessEmail,
                    showBusinessPhone: content.showBusinessPhone
                })
            };
        }
        return {
            state: 'ready',
            definition: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicDefinitionSchema"].parse({
                publicKey: key.data,
                version: current.configurationVersion,
                fields: configuration.fields,
                contactRequired: configuration.contactRequired,
                content
            }),
            binding: {
                publicKey: key.data,
                publicationVersion: current.version,
                configurationVersion: current.configurationVersion
            },
            now: now
        };
    });
}
}),
"[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureDraftConflictError",
    ()=>CaptureDraftConflictError,
    "CaptureDraftEntitlementError",
    ()=>CaptureDraftEntitlementError,
    "CaptureDraftValidationError",
    ()=>CaptureDraftValidationError,
    "beginCaptureRevision",
    ()=>beginCaptureRevision,
    "captureBusinessContextInTransaction",
    ()=>captureBusinessContextInTransaction,
    "captureDraftFingerprint",
    ()=>captureDraftFingerprint,
    "captureDraftStartContext",
    ()=>captureDraftStartContext,
    "captureSourceWindowInTransaction",
    ()=>captureSourceWindowInTransaction,
    "createCaptureDraft",
    ()=>createCaptureDraft,
    "listCaptureSources",
    ()=>listCaptureSources,
    "readCaptureSource",
    ()=>readCaptureSource,
    "saveCaptureDraft",
    ()=>saveCaptureDraft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/setup-samples.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/gmail-sample-approval.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$views$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/views.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/commands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/common.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$service$2d$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/service-catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/publication.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$installation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/installation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/public.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
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
class CaptureDraftConflictError extends Error {
    constructor(){
        super('This draft changed or this request was already used. Reload before saving.');
    }
}
class CaptureDraftValidationError extends Error {
    issues;
    constructor(issues = []){
        super('Check the draft details and selected teammate.'), this.issues = issues;
    }
}
class CaptureDraftEntitlementError extends Error {
    constructor(){
        super('Gmail capture requires an eligible workspace plan.');
    }
}
const record = (source)=>({
        kind: 'capture_source',
        id: source.id,
        workspaceId: source.workspaceId
    });
const iso = (value)=>value ? value.toISOString() : null;
function read(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read').allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function update(context, source) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.update',
        resource: record(source)
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function create(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.create'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function permissionView(context) {
    return {
        canActivate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.activate',
            resource: {
                kind: 'capture_source',
                id: context.workspaceId,
                workspaceId: context.workspaceId
            }
        }).allowed,
        canCreate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.create'
        }).allowed,
        canPause: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.pause',
            resource: {
                kind: 'capture_source',
                id: context.workspaceId,
                workspaceId: context.workspaceId
            }
        }).allowed,
        canArchive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.archive',
            resource: {
                kind: 'capture_source',
                id: context.workspaceId,
                workspaceId: context.workspaceId
            }
        }).allowed,
        canUpdate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.update',
            resource: {
                kind: 'capture_source',
                id: context.workspaceId,
                workspaceId: context.workspaceId
            }
        }).allowed
    };
}
function parse(parser, raw) {
    const parsed = parser.safeParse(raw);
    if (!parsed.success) throw new CaptureDraftValidationError();
    return parsed.data;
}
function inputWorkspace(input, identity) {
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function captureDraftFingerprint(value) {
    const normalize = (input)=>Array.isArray(input) ? input.map(normalize) : input && typeof input === 'object' ? Object.fromEntries(Object.entries(input).sort(([a], [b])=>a.localeCompare(b)).map(([key, item])=>[
                key,
                normalize(item)
            ])) : input;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify(normalize(value))).digest('hex');
}
async function loadSource(trx, workspaceId, sourceId) {
    const source = await trx('captureSources').where({
        workspaceId,
        id: sourceId
    }).first();
    if (!source) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return source;
}
async function business(trx, context) {
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).first('businessName', 'businessPhone', 'serviceRange', 'postalCode', 'timezone');
    const services = await trx('workspaceServices').where({
        workspaceId: context.workspaceId
    }).select('service').orderBy('service');
    const teammates = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id').limit(1000);
    const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, context.workspaceId);
    return {
        businessName: workspace.businessName,
        businessEmail: '',
        businessPhone: workspace.businessPhone ?? '',
        services: services.map((row)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$service$2d$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serviceCatalog"].find((service)=>service.value === row.service)?.label ?? row.service),
        serviceArea: [
            workspace.postalCode,
            workspace.serviceRange
        ].filter(Boolean).join(' · '),
        timezone: workspace.timezone,
        gmailAccess: entitlement.plan.id === 'free' ? 'upgrade-required' : 'available',
        teammates
    };
}
async function metrics(trx, workspaceId, ids) {
    const result = new Map(ids.map((id)=>[
            id,
            {
                captured: 0,
                awaitingReview: 0,
                approved: 0,
                lastActivityAt: null
            }
        ]));
    if (!ids.length) return result;
    const receipts = await trx('captureReceipts').where({
        workspaceId
    }).whereIn('sourceId', ids).groupBy('sourceId', 'admission').select('sourceId', 'admission').count('* as count').max('receivedAt as last');
    const items = await trx('intakeItems').where({
        workspaceId
    }).whereIn('sourceId', ids).groupBy('sourceId', 'status').select('sourceId', 'status').count('* as count');
    for (const row of receipts){
        const entry = result.get(row.sourceId);
        entry.captured += Number(row.count);
        if (row.admission === 'automatic') entry.approved += Number(row.count);
        if (!entry.lastActivityAt || row.last > entry.lastActivityAt) entry.lastActivityAt = row.last;
    }
    for (const row of items){
        const entry = result.get(row.sourceId);
        if (row.status === 'approved') entry.approved += Number(row.count);
        if (row.status === 'awaiting') entry.awaitingReview += Number(row.count);
    }
    return result;
}
function summary(source, draft, totals) {
    const last = source.lastActivityAt && (!totals.lastActivityAt || source.lastActivityAt > totals.lastActivityAt) ? source.lastActivityAt : totals.lastActivityAt;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceSummarySchema"].parse({
        id: source.id,
        workspaceId: source.workspaceId,
        name: source.name,
        type: source.type,
        status: source.status,
        block: source.block,
        version: source.version,
        approvedVersion: source.approvedVersion,
        draftVersion: draft?.version ?? null,
        scheduledAt: iso(source.scheduledAt),
        timezone: source.timezone,
        lastActivityAt: iso(last),
        metrics: {
            captured: totals.captured,
            awaitingReview: totals.awaitingReview,
            approved: totals.approved
        }
    });
}
async function sourceDetail(trx, source) {
    const draft = source.draftId ? await trx('captureSourceDrafts').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        id: source.draftId
    }).first() : undefined;
    const approved = source.approvedVersion ? await trx('captureSourceVersions').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        configurationVersion: source.approvedVersion
    }).first() : undefined;
    const total = (await metrics(trx, source.workspaceId, [
        source.id
    ])).get(source.id);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceDetailSchema"].parse({
        source: summary(source, draft, total),
        draft: draft ? {
            id: draft.id,
            version: draft.version,
            baseApprovedVersion: draft.baseApprovedVersion,
            configuration: draft.configuration
        } : null,
        approved: approved ? {
            version: approved.configurationVersion,
            definitionVersion: approved.definitionVersion,
            workflowVersion: approved.workflowVersion,
            configuration: approved.configuration
        } : null
    });
}
async function captureBusinessContextInTransaction(trx, context) {
    read(context);
    return business(trx, context);
}
async function captureDraftStartContext(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        read(context);
        create(context);
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$views$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftStartContextSchema"].parse({
            workspaceId: identity.workspaceId,
            permissions: permissionView(context),
            business: await business(trx, context),
            policyRevision: context.policy.revision
        });
    });
}
async function captureSourceWindowInTransaction(trx, context, input) {
    if (!Number.isSafeInteger(input.pageSize) || input.pageSize < 1 || input.pageSize > 100 || !Number.isSafeInteger(input.page) || input.page < 1 || input.page > 100000) throw new CaptureDraftValidationError();
    read(context);
    const query = trx('captureSources').where({
        workspaceId: context.workspaceId
    });
    if (input.archived) query.where({
        status: 'archived'
    });
    else query.whereNot({
        status: 'archived'
    });
    if (input.type) query.where({
        type: input.type
    });
    if (input.status && !input.archived) query.where({
        status: input.status
    });
    if (input.search) query.whereRaw('strpos(lower(name), lower(?)) > 0', [
        input.search
    ]);
    const total = Number((await query.clone().clearSelect().count('* as count').first()).count);
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
    const sources = await query.clone().select('*').orderBy('updatedAt', 'desc').orderBy('id', 'desc').limit(input.pageSize).offset((page - 1) * input.pageSize);
    const drafts = await trx('captureSourceDrafts').where({
        workspaceId: context.workspaceId
    }).whereIn('id', sources.map((source)=>source.draftId).filter((id)=>!!id));
    const blocks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentBlocks"])(trx, context.workspaceId);
    const totals = await metrics(trx, context.workspaceId, sources.map((source)=>source.id));
    const timezone = (await trx('workspaces').where({
        id: context.workspaceId
    }).first('timezone')).timezone;
    return {
        rows: sources.map((source)=>summary({
                ...source,
                block: blocks.get(source.id) ?? source.block
            }, drafts.find((draft)=>draft.id === source.draftId), totals.get(source.id))),
        total,
        page,
        pageSize: input.pageSize,
        permissions: permissionView(context),
        timezone,
        policyRevision: context.policy.revision
    };
}
async function listCaptureSources(db, identity, enabled, raw) {
    const input = parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceListQuerySchema"], raw);
    inputWorkspace(input, identity);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$views$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureListViewSchema"].parse(await captureSourceWindowInTransaction(trx, context, input)));
}
async function captureGmailHealth(trx, source, configuration, authority) {
    if (configuration?.type !== 'gmail' || !configuration.connectionId || !await trx.schema.hasTable('captureGmailWorkerReadiness')) return undefined;
    const account = await trx('captureGmailAccounts').where({
        workspaceId: source.workspaceId,
        id: configuration.connectionId
    }).first('status', 'email');
    const connection = account?.status === 'connected' || account?.status === 'reconnect-required' ? account.status : 'not-connected';
    const mailbox = await trx('captureGmailMailboxState').where({
        workspaceId: source.workspaceId,
        accountId: configuration.connectionId
    }).first('failure');
    const jobs = await trx('captureGmailMessageJobs').where({
        workspaceId: source.workspaceId,
        sourceId: source.id,
        accountId: configuration.connectionId
    }).whereIn('state', [
        'pending',
        'processing',
        'retry',
        'failed'
    ]).groupBy('state').select('state').count('* as count');
    const queued = jobs.filter((job)=>job.state !== 'failed').reduce((sum, job)=>sum + Number(job.count), 0);
    const failed = Number(jobs.find((job)=>job.state === 'failed')?.count ?? 0);
    let sync = 'idle';
    if (source.status === 'active' && source.block === 'none') {
        if (mailbox?.failure === 'recovery-required') sync = 'recovery-required';
        else if (!await authority.gmailReady(trx, source.workspaceId, source.id, configuration)) sync = 'waiting-for-worker';
        else sync = mailbox?.failure ? 'retrying' : 'syncing';
    }
    return {
        connection,
        email: account?.email,
        sync,
        queued,
        failed
    };
}
async function readCaptureSource(db, identity, enabled, raw, installationOrigin, authority = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"]) {
    const input = parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceDetailQuerySchema"], raw);
    inputWorkspace(input, identity);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        read(context);
        const source = await loadSource(trx, identity.workspaceId, input.sourceId);
        const detail = await sourceDetail(trx, source);
        const blocks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentBlocks"])(trx, identity.workspaceId);
        detail.source.block = blocks.get(source.id) ?? source.block;
        const publication = installationOrigin && source.type === 'website' && source.status !== 'draft' && await trx.schema.hasTable('captureReceiptProcessing') ? await trx('capturePublications').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id
        }).first('publicKey', 'configurationVersion') : null;
        const publicView = publication ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$public$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readPublicCapture"])(trx, publication.publicKey) : null;
        const installation = publication && installationOrigin && publicView?.state !== 'not-found' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$installation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureInstallation"])(installationOrigin, publication, {
            ...source,
            block: detail.source.block !== 'none' ? detail.source.block : source.status === 'active' && publicView?.state !== 'ready' ? 'workspace' : 'none'
        }) : null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$views$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDetailViewSchema"].parse({
            detail,
            installation,
            gmailHealth: await captureGmailHealth(trx, source, detail.approved?.configuration ?? detail.draft?.configuration, authority),
            lifecycleReview: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureLifecycleReviewInTransaction"])(trx, context, source, authority),
            publicationReview: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capturePublicationReviewInTransaction"])(trx, context, source, authority),
            canDuplicate: permissionView(context).canCreate,
            canEdit: source.status !== 'archived' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: 'leadCapture.update',
                resource: record(source)
            }).allowed,
            business: await business(trx, context),
            policyRevision: context.policy.revision
        });
    });
}
async function validateConfiguration(trx, context, configuration, previous, source) {
    if (configuration.type === 'gmail') {
        if (previous?.type !== 'gmail' && (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, context.workspaceId)).plan.id === 'free') throw new CaptureDraftEntitlementError();
        for (const key of [
            'connectionId',
            'accountEmail'
        ])if (configuration[key] !== undefined && JSON.stringify(configuration[key]) !== JSON.stringify(previous?.type === 'gmail' ? previous[key] : undefined)) throw new CaptureDraftValidationError();
        const mappingChanged = [
            'sampleId',
            'mappings'
        ].some((key)=>configuration[key] !== undefined && JSON.stringify(configuration[key]) !== JSON.stringify(previous?.type === 'gmail' ? previous[key] : undefined));
        if (mappingChanged && (!source?.draftId || !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupSampleApproved"])(trx, context.workspaceId, source.id, source.draftId, configuration))) throw new CaptureDraftValidationError();
    }
    if (configuration.workflow?.assignment.kind === 'teammate' && !await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({
        'm.workspaceId': context.workspaceId,
        'm.userId': configuration.workflow.assignment.teammateId
    }).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').first('u.id')) throw new CaptureDraftValidationError();
}
async function replay(trx, identity, requestId, operation, fingerprint) {
    const existing = await trx('captureOperations').where({
        workspaceId: identity.workspaceId,
        operation,
        requestId
    }).first();
    if (!existing) return null;
    if (existing.inputHash !== fingerprint || existing.actor.kind !== 'user' || existing.actor.userId !== identity.userId) throw new CaptureDraftConflictError();
    const saved = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureOperationResultSchema"].parse(existing.result);
    if (saved.kind !== 'draft') throw new CaptureDraftConflictError();
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftSavedSchema"].parse({
        ok: true,
        sourceId: saved.sourceId,
        sourceVersion: saved.sourceVersion,
        draftVersion: saved.draftVersion
    });
    const source = await loadSource(trx, identity.workspaceId, result.sourceId);
    return {
        result,
        source
    };
}
async function receipt(trx, identity, requestId, operation, inputHash, source, draftVersion) {
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftSavedSchema"].parse({
        ok: true,
        sourceId: source.id,
        sourceVersion: source.version,
        draftVersion
    });
    await trx('captureOperations').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        requestId,
        operation,
        inputHash,
        actor: JSON.stringify({
            kind: 'user',
            userId: identity.userId
        }),
        target: JSON.stringify({
            sourceId: source.id
        }),
        result: JSON.stringify({
            kind: 'draft',
            sourceId: result.sourceId,
            sourceVersion: result.sourceVersion,
            draftVersion: result.draftVersion
        })
    });
    await trx('captureSourceEvents').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        sourceId: source.id,
        kind: 'draft.saved',
        actor: JSON.stringify({
            kind: 'user',
            userId: identity.userId
        }),
        data: JSON.stringify({
            sourceVersion: source.version
        })
    });
    return result;
}
async function createCaptureDraft(db, identity, enabled, raw) {
    const input = parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCreateDraftSchema"], raw);
    inputWorkspace(input, identity);
    const fingerprint = captureDraftFingerprint(input);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        read(context);
        create(context);
        const repeated = await replay(trx, identity, input.requestId, 'draft.create', fingerprint);
        if (repeated) return repeated.result;
        await validateConfiguration(trx, context, input.configuration);
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), draftId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        const [source] = await trx('captureSources').insert({
            id,
            workspaceId: identity.workspaceId,
            name: input.name,
            type: input.configuration.type,
            version: 1,
            status: 'draft',
            draftId,
            createdBy: identity.userId
        }).returning('*');
        await trx('captureSourceDrafts').insert({
            id: draftId,
            workspaceId: identity.workspaceId,
            sourceId: id,
            sourceType: input.configuration.type,
            version: 1,
            configuration: JSON.stringify(input.configuration)
        });
        return receipt(trx, identity, input.requestId, 'draft.create', fingerprint, source, 1);
    });
}
async function saveCaptureDraft(db, identity, enabled, raw) {
    const input = parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSaveDraftSchema"], raw);
    inputWorkspace(input, identity);
    const fingerprint = captureDraftFingerprint(input);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        read(context);
        const source = await loadSource(trx, identity.workspaceId, input.sourceId);
        update(context, source);
        const repeated = await replay(trx, identity, input.requestId, 'draft.save', fingerprint);
        if (repeated) return repeated.result;
        const draft = source.draftId ? await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            id: source.draftId
        }).forUpdate().first() : undefined;
        if (source.status === 'archived' || !draft || source.version !== input.expectedVersion || draft.version !== input.expectedDraftVersion || draft.baseApprovedVersion !== source.approvedVersion || source.approvedVersion !== null && source.type !== input.configuration.type) throw new CaptureDraftConflictError();
        await validateConfiguration(trx, context, input.configuration, draft.configuration, source);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindSavedGmailSample"])(trx, identity.workspaceId, source.id, draft.id, draft.version, input.configuration);
        await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            id: draft.id
        }).update({
            configuration: JSON.stringify(input.configuration),
            sourceType: input.configuration.type,
            version: draft.version + 1,
            updatedAt: trx.fn.now()
        });
        const [updated] = await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: source.id
        }).update({
            name: input.name,
            type: input.configuration.type,
            version: source.version + 1,
            updatedAt: trx.fn.now()
        }).returning('*');
        return receipt(trx, identity, input.requestId, 'draft.save', fingerprint, updated, draft.version + 1);
    });
}
async function beginCaptureRevision(db, identity, enabled, raw) {
    const input = parse(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$views$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureBeginRevisionSchema"], raw);
    inputWorkspace(input, identity);
    const fingerprint = captureDraftFingerprint({
        kind: 'revision',
        ...input
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        read(context);
        const source = await loadSource(trx, identity.workspaceId, input.sourceId);
        update(context, source);
        const repeated = await replay(trx, identity, input.requestId, 'draft.create', fingerprint);
        if (repeated) return repeated.result;
        if (await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            state: 'pending'
        }).first('id')) throw new CaptureDraftConflictError();
        if (source.status === 'archived' || source.version !== input.expectedVersion || !source.approvedVersion || source.draftId) throw new CaptureDraftConflictError();
        const approved = await trx('captureSourceVersions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            configurationVersion: source.approvedVersion
        }).first('configuration');
        if (!approved) throw new CaptureDraftConflictError();
        const retained = await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id
        }).forUpdate().first();
        const draftId = retained?.id ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), version = Math.max(source.approvedVersion, retained?.version ?? 0) + 1;
        if (retained) await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            id: draftId
        }).update({
            version,
            baseApprovedVersion: source.approvedVersion,
            configuration: JSON.stringify(approved.configuration),
            updatedAt: trx.fn.now()
        });
        else await trx('captureSourceDrafts').insert({
            id: draftId,
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            sourceType: source.type,
            version,
            baseApprovedVersion: source.approvedVersion,
            configuration: JSON.stringify(approved.configuration)
        });
        const [updated] = await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: source.id
        }).update({
            draftId,
            version: source.version + 1,
            updatedAt: trx.fn.now()
        }).returning('*');
        return receipt(trx, identity, input.requestId, 'draft.create', fingerprint, updated, version);
    });
}
}),
"[project]/packages/data/src/lead-capture/delivery-policy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capturePublicationWorkspaces",
    ()=>capturePublicationWorkspaces,
    "captureReadinessKey",
    ()=>captureReadinessKey,
    "captureWebsiteSchemaReady",
    ()=>captureWebsiteSchemaReady
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/common.ts [app-route] (ecmascript)");
;
async function captureWebsiteSchemaReady(trx) {
    return await trx.schema.hasTable('captureReceiptProcessing') && await trx.schema.hasTable('capturePublications');
}
function capturePublicationWorkspaces(value) {
    if (!value) return [];
    if (value.length > 3700) return null;
    const ids = value.split(',').map((id)=>id.trim());
    if (ids.length > 100 || ids.some((id)=>!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureIdSchema"].safeParse(id).success)) return null;
    return Object.freeze([
        ...new Set(ids)
    ]);
}
function captureReadinessKey(value) {
    if (!value || value.length !== 44) return null;
    const key = Buffer.from(value, 'base64');
    return key.length === 32 && key.toString('base64') === value ? key : null;
}
}),
"[project]/packages/data/src/lead-capture/submissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureChallengeBinding",
    ()=>captureChallengeBinding,
    "captureSubmissionHash",
    ()=>captureSubmissionHash,
    "commitCaptureSubmission",
    ()=>commitCaptureSubmission,
    "prepareCaptureSubmission",
    ()=>prepareCaptureSubmission,
    "purgeCaptureSubmissionAbuse",
    ()=>purgeCaptureSubmissionAbuse,
    "recordCaptureChallengeVerification",
    ()=>recordCaptureChallengeVerification,
    "takeCaptureRequestBudget",
    ()=>takeCaptureRequestBudget
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/configuration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$intake$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/intake.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-assignment-settings/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$admission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/admission.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const sha = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
const captureSubmissionHash = (input)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        answers: input.answers,
        consent: input.consent,
        website: input.website
    });
const captureChallengeBinding = (input)=>sha(JSON.stringify([
        input.proof.publicKey,
        input.proof.submissionId,
        input.submission.requestId,
        captureSubmissionHash(input.submission)
    ]));
async function clock(db) {
    return new Date((await db.raw('SELECT statement_timestamp() AS now')).rows[0].now);
}
async function bucket(db, scope, limit, now) {
    const end = new Date((Math.floor(now.getTime() / 60000) + 1) * 60000), key = `${scope}:${Math.floor(now.getTime() / 60000)}`;
    const [row] = await db('captureRequestBuckets').insert({
        key,
        count: 1,
        expiresAt: end
    }).onConflict('key').merge({
        count: db.raw('LEAST(?? + 1, ?)', [
            'captureRequestBuckets.count',
            limit + 1
        ])
    }).returning('count');
    return row.count > limit ? {
        state: 'rate-limited',
        retryAt: end.toISOString()
    } : null;
}
async function takeCaptureRequestBudget(db, maxPerMinute) {
    const now = await clock(db);
    await purgeCaptureSubmissionAbuse(db, now);
    return bucket(db, 'global', maxPerMinute, now);
}
async function purgeCaptureSubmissionAbuse(db, now) {
    const instant = now ?? await clock(db);
    await db('captureRequestBuckets').where('expiresAt', '<=', instant).delete();
    await db('captureSubmissionAttempts').where('expiresAt', '<=', instant).delete();
    await db('captureChallengeChecks').where('expiresAt', '<=', instant).delete();
}
async function publication(db, key) {
    return db('capturePublications').where({
        publicKey: key,
        sourceType: 'website'
    }).first('workspaceId', 'id', 'sourceId', 'version', 'configurationVersion');
}
async function replay(trx, pub, input) {
    const receipt = await trx('captureReceipts').where({
        workspaceId: pub.workspaceId,
        sourceId: pub.sourceId,
        publicationId: pub.id,
        dedupeKey: input.submission.requestId
    }).first('id', 'inputHash');
    if (!receipt) return null;
    const processing = await trx('captureReceiptProcessing').where({
        workspaceId: pub.workspaceId,
        receiptId: receipt.id
    }).first('contextId');
    return receipt.inputHash === captureSubmissionHash(input.submission) && processing?.contextId === input.proof.submissionId ? {
        state: 'accepted',
        requestId: input.submission.requestId
    } : {
        state: 'conflict'
    };
}
async function current(trx, pub, input, now) {
    const state = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureOperationalState"])(trx, pub.workspaceId, pub.sourceId);
    if (!state.allowed) return {
        state: 'unavailable'
    };
    if (input.proof.expiresAt <= Math.floor(now.getTime() / 1000) || input.proof.issuedAt > Math.floor(now.getTime() / 1000) || pub.version !== input.proof.publicationVersion || pub.configurationVersion !== input.proof.configurationVersion || state.configurationVersion !== pub.configurationVersion) return {
        state: 'stale'
    };
    const row = await trx('captureSourceVersions').where({
        workspaceId: pub.workspaceId,
        sourceId: pub.sourceId,
        configurationVersion: pub.configurationVersion,
        sourceType: 'website'
    }).first('configuration');
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureConfigurationSchema"].safeParse(row?.configuration);
    if (!parsed.success || parsed.data.type !== 'website') return {
        state: 'unavailable'
    };
    return {
        state: 'ready',
        configuration: parsed.data
    };
}
function validPayload(configuration, submission) {
    if (submission.website.trim() || Object.keys(submission.answers).some((id)=>!configuration.fields.some((field)=>field.id === id))) return false;
    const consent = configuration.content.consent;
    if (consent ? !submission.consent || consent.id !== submission.consent.id || consent.version !== submission.consent.version || consent.required && !submission.consent.accepted : submission.consent !== null) return false;
    return configuration.fields.every((field)=>{
        const value = submission.answers[field.id];
        if (value === undefined || value === '') return true;
        if (field.type === 'checkboxes') return Array.isArray(value) && new Set(value).size === value.length && value.every((id)=>field.options.some((option)=>option.id === id));
        if (typeof value !== 'string') return false;
        const max = field.key === 'name' || field.key === 'service' ? 200 : field.type === 'email' ? 254 : field.type === 'phone' ? 100 : field.key === 'address' || field.type === 'address' ? 500 : field.type === 'long_text' || field.key === 'details' ? 10000 : 200;
        return value.trim().length <= max && (field.type !== 'dropdown' || field.options.some((option)=>option.id === value.trim()));
    });
}
async function challengeNeeded(trx, pub, input, now) {
    const existing = await trx('captureSubmissionAttempts').where({
        publicationId: pub.id,
        requestId: input.submission.requestId
    }).first();
    if (!existing) return {
        missing: true,
        needed: true
    };
    const row = await trx('captureSubmissionAttempts').where({
        publicationId: pub.id,
        clientHash: input.clientHash
    }).where('createdAt', '>', new Date(now.getTime() - 600000)).count('* as count').first();
    return {
        missing: false,
        needed: existing.challengeRequired || existing.clientHash !== input.clientHash || Number(row?.count ?? 0) > input.limits.challengeAfter
    };
}
async function prepareCaptureSubmission(db, input) {
    const found = await publication(db, input.proof.publicKey);
    if (!found) return {
        state: 'unavailable'
    };
    return db.transaction(async (trx)=>{
        await trx('workspaces').where({
            id: found.workspaceId
        }).forUpdate().first('id');
        const pub = await publication(trx, input.proof.publicKey);
        if (!pub) return {
            state: 'unavailable'
        };
        const now = await clock(trx), limited = await bucket(trx, `source:${pub.id}`, input.limits.sourceRequestsPerMinute, now);
        if (limited) return limited;
        const repeated = await replay(trx, pub, input);
        if (repeated) return repeated;
        const active = await current(trx, pub, input, now);
        if (active.state !== 'ready') return active;
        if (!validPayload(active.configuration, input.submission)) return {
            state: 'invalid'
        };
        let attempt = await trx('captureSubmissionAttempts').where({
            publicationId: pub.id,
            requestId: input.submission.requestId
        }).first();
        const inputHash = captureSubmissionHash(input.submission);
        if (attempt && (attempt.inputHash !== inputHash || attempt.contextId !== input.proof.submissionId)) return {
            state: 'conflict'
        };
        if (!attempt) {
            const count = await trx('captureSubmissionAttempts').where({
                publicationId: pub.id,
                clientHash: input.clientHash
            }).where('createdAt', '>', new Date(now.getTime() - 600000)).count('* as count').min('createdAt as first').first();
            if (Number(count?.count ?? 0) >= input.limits.hardLimit) return {
                state: 'rate-limited',
                retryAt: new Date(new Date(count.first).getTime() + 600000).toISOString()
            };
            [attempt] = await trx('captureSubmissionAttempts').insert({
                workspaceId: pub.workspaceId,
                publicationId: pub.id,
                requestId: input.submission.requestId,
                inputHash,
                contextId: input.proof.submissionId,
                clientHash: input.clientHash,
                challengeRequired: Number(count?.count ?? 0) >= input.limits.challengeAfter,
                createdAt: now,
                expiresAt: new Date(now.getTime() + 600000)
            }).returning('*');
        }
        const required = (await challengeNeeded(trx, pub, input, now)).needed, cData = captureChallengeBinding(input);
        if (!required || !input.submission.challengeToken) return {
            state: 'ready',
            challengeRequired: required,
            cData
        };
        const tokenHash = sha(input.submission.challengeToken);
        await trx('captureChallengeChecks').insert({
            tokenHash,
            workspaceId: pub.workspaceId,
            publicationId: pub.id,
            requestId: input.submission.requestId,
            contextId: input.proof.submissionId,
            inputHash,
            verificationId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            expiresAt: new Date(now.getTime() + 300000)
        }).onConflict('tokenHash').ignore();
        const check = await trx('captureChallengeChecks').where({
            tokenHash
        }).first();
        if (check.publicationId !== pub.id || check.requestId !== input.submission.requestId || check.contextId !== input.proof.submissionId || check.inputHash !== inputHash || check.expiresAt <= now) return {
            state: 'challenge-error'
        };
        return {
            state: 'ready',
            challengeRequired: true,
            cData,
            tokenHash,
            verificationId: check.verificationId,
            verified: !!check.verifiedAt
        };
    });
}
async function recordCaptureChallengeVerification(db, tokenHash, verificationId, expiresAt) {
    const now = await clock(db);
    if (expiresAt <= now || expiresAt.getTime() > now.getTime() + 300000) return false;
    return !!await db('captureChallengeChecks').where({
        tokenHash,
        verificationId
    }).where('expiresAt', '>', now).update({
        verifiedAt: now,
        expiresAt
    });
}
async function commitCaptureSubmission(db, input, tokenHash) {
    const found = await publication(db, input.proof.publicKey);
    if (!found) return {
        state: 'unavailable'
    };
    return db.transaction(async (trx)=>{
        await trx('workspaces').where({
            id: found.workspaceId
        }).forUpdate().first('id');
        const pub = await publication(trx, input.proof.publicKey);
        if (!pub) return {
            state: 'unavailable'
        };
        const repeated = await replay(trx, pub, input);
        if (repeated) return repeated;
        const now = await clock(trx), active = await current(trx, pub, input, now);
        if (active.state !== 'ready') return active;
        if (!validPayload(active.configuration, input.submission)) return {
            state: 'invalid'
        };
        const attempt = await trx('captureSubmissionAttempts').where({
            publicationId: pub.id,
            requestId: input.submission.requestId
        }).first();
        if (!attempt || attempt.inputHash !== captureSubmissionHash(input.submission) || attempt.contextId !== input.proof.submissionId) return {
            state: 'conflict'
        };
        const required = await challengeNeeded(trx, pub, input, now);
        if (required.missing) return {
            state: 'stale'
        };
        if (required.needed) {
            const verified = tokenHash ? await trx('captureChallengeChecks').where({
                tokenHash,
                publicationId: pub.id,
                requestId: input.submission.requestId,
                inputHash: attempt.inputHash,
                contextId: input.proof.submissionId
            }).whereNotNull('verifiedAt').where('expiresAt', '>', now).first('tokenHash') : null;
            if (!verified) return {
                state: 'challenge-required'
            };
        }
        const configuration = active.configuration, answers = input.submission.answers;
        const issues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureAnswerIssues"])(configuration.fields, answers), assignment = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$assignment$2d$settings$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCaptureAssignment"])(trx, pub.workspaceId, configuration.workflow.assignment);
        const text = (key)=>{
            const field = configuration.fields.find((field)=>field.key === key);
            if (!field) return '';
            const value = answers[field.id];
            if (typeof value !== 'string') return '';
            return field.type === 'dropdown' ? field.options.find((option)=>option.id === value.trim())?.label ?? '' : value.trim();
        };
        const lead = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["leadSchema"].safeParse({
            name: text('name'),
            email: text('email'),
            phone: text('phone'),
            service: text('service'),
            address: text('address'),
            details: text('details'),
            notes: '',
            source: 'website',
            stage: configuration.workflow.stage,
            ownerId: assignment.assigneeId ?? ''
        });
        const flags = new Set();
        if (issues.length || !lead.success) flags.add('missing');
        if (!assignment.ready) flags.add('uncertain');
        const email = text('email').toLowerCase(), phone = text('phone').replace(/[^0-9]/g, '');
        if (email || phone) {
            const duplicate = await trx('leads').where({
                workspaceId: pub.workspaceId
            }).andWhere((builder)=>{
                if (email) builder.orWhereRaw('lower(btrim(email)) = ?', [
                    email
                ]);
                if (phone) builder.orWhereRaw("regexp_replace(phone,'[^0-9]','','g') = ?", [
                    phone
                ]);
            }).first('id');
            if (duplicate) flags.add('duplicate');
        }
        const evidence = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$intake$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureEvidenceSchema"].parse({
            schemaVersion: 1,
            type: 'website',
            answers,
            consent: configuration.content.consent ? {
                id: configuration.content.consent.id,
                version: configuration.content.consent.version,
                wording: configuration.content.consent.label,
                accepted: input.submission.consent.accepted,
                privacyHref: configuration.content.privacy?.href ?? null
            } : null,
            fields: configuration.fields.map((field)=>{
                const value = answers[field.id], quote = typeof value === 'string' ? value : value?.[0];
                return {
                    fieldId: field.id,
                    uncertain: issues.includes(field.id),
                    origin: quote ? {
                        kind: 'form',
                        answerId: field.id,
                        quote
                    } : null
                };
            })
        });
        const { rows: [{ bytes }] } = await trx.raw('SELECT octet_length(?::jsonb::text) + octet_length(?::jsonb::text) AS bytes', [
            JSON.stringify(evidence),
            JSON.stringify(answers)
        ]);
        await trx('captureInputUsage').insert({
            workspaceId: pub.workspaceId
        }).onConflict('workspaceId').ignore();
        const usage = await trx('captureInputUsage').where({
            workspaceId: pub.workspaceId
        }).first('retainedBytes');
        if (BigInt(usage.retainedBytes) + BigInt(bytes) > BigInt(input.limits.maxRetainedBytes)) return {
            state: 'unavailable'
        };
        let leadId;
        if (!flags.size && lead.success) {
            try {
                leadId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$admission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["insertAdmittedLead"])(trx, lead.data, {
                    workspaceId: pub.workspaceId,
                    createdBy: null,
                    submissionId: input.submission.requestId,
                    submissionHash: attempt.inputHash
                }, assignment.assigneeId);
                if (!leadId) throw Error('Lead admission did not return an identity.');
            } catch (error) {
                if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PlanCapacityError"])) throw error;
                flags.add('capacity');
            }
        }
        if (!leadId) {
            const pending = await trx('intakeItems').where({
                workspaceId: pub.workspaceId,
                status: 'awaiting'
            }).count('* as count').first();
            if (Number(pending?.count ?? 0) >= input.limits.maxPendingItems) return {
                state: 'unavailable'
            };
        }
        const receiptId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx('captureReceipts').insert({
            id: receiptId,
            workspaceId: pub.workspaceId,
            sourceId: pub.sourceId,
            sourceType: 'website',
            configurationVersion: pub.configurationVersion,
            definitionVersion: pub.configurationVersion,
            workflowVersion: pub.configurationVersion,
            dedupeKey: input.submission.requestId,
            inputHash: attempt.inputHash,
            publicationId: pub.id,
            admission: leadId ? 'automatic' : 'review',
            evidence: JSON.stringify(evidence),
            originalAnswers: JSON.stringify(answers),
            receivedAt: now
        });
        await trx('captureReceiptProcessing').insert({
            workspaceId: pub.workspaceId,
            receiptId,
            contextId: input.proof.submissionId,
            assignment: JSON.stringify(assignment),
            tags: JSON.stringify(configuration.workflow.tags)
        });
        if (leadId) {
            await trx('leadCaptureData').insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workspaceId: pub.workspaceId,
                sourceId: pub.sourceId,
                configurationVersion: pub.configurationVersion,
                receiptId,
                leadId,
                resultingLeadId: leadId,
                definitionVersion: pub.configurationVersion,
                answers: JSON.stringify(answers)
            });
            await trx('leadActivity').where({
                id: leadId,
                workspaceId: pub.workspaceId
            }).update({
                actorType: 'system',
                actorName: 'Lead Capture',
                changes: JSON.stringify({
                    source: 'website',
                    origin: 'lead_capture',
                    receiptId,
                    configurationVersion: pub.configurationVersion
                })
            });
            if (configuration.workflow.tags.length) await trx('leadTags').insert(configuration.workflow.tags.map((tag)=>({
                    workspaceId: pub.workspaceId,
                    leadId,
                    tag
                })));
            if (assignment.assigneeId && configuration.workflow.notifyAssigned) {
                const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), user = await trx('users').where({
                    id: assignment.assigneeId
                }).first('name');
                await trx('leadActivity').insert({
                    id,
                    workspaceId: pub.workspaceId,
                    leadId,
                    actorType: 'system',
                    actorName: 'Lead Capture',
                    type: 'assigned',
                    changes: JSON.stringify({
                        from: null,
                        to: user.name,
                        ownerId: assignment.assigneeId,
                        toVersion: 1
                    }),
                    createdAt: now
                });
                await trx('assignmentNotifications').insert({
                    id,
                    workspaceId: pub.workspaceId,
                    leadId,
                    userId: assignment.assigneeId,
                    createdAt: now
                });
                await trx('assignmentEmailOutbox').insert({
                    id
                });
            }
        } else await trx('intakeItems').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: pub.workspaceId,
            sourceId: pub.sourceId,
            receiptId,
            version: 1,
            definitionVersion: pub.configurationVersion,
            workflowVersion: pub.configurationVersion,
            status: 'awaiting',
            answers: JSON.stringify(answers),
            flags: JSON.stringify([
                ...flags
            ])
        });
        await trx('captureInputUsage').where({
            workspaceId: pub.workspaceId
        }).increment('retainedBytes', bytes);
        const source = await trx('captureSources').where({
            workspaceId: pub.workspaceId,
            id: pub.sourceId
        }).first('version');
        await trx('captureSourceEvents').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: pub.workspaceId,
            sourceId: pub.sourceId,
            kind: 'receipt.accepted',
            actor: JSON.stringify({
                kind: 'service',
                service: 'website'
            }),
            data: JSON.stringify({
                sourceVersion: source.version,
                configurationVersion: pub.configurationVersion,
                requestId: input.submission.requestId
            })
        });
        return {
            state: 'accepted',
            requestId: input.submission.requestId
        };
    });
}
}),
"[project]/packages/data/src/lead-capture/assistant-read.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureChatEvidenceAllowed",
    ()=>captureChatEvidenceAllowed,
    "captureChatStamp",
    ()=>captureChatStamp,
    "readCaptureForChat",
    ()=>readCaptureForChat
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-read.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/publication.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
function permit(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read');
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'assistant.use'
    }).allowed || !scope.allowed || scope.scope !== 'workspace') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return scope;
}
async function captureChatStamp(trx, context, deliveryStamp = '') {
    permit(context);
    const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
    SELECT 's:' || id::text || ':' || xmin::text AS v FROM "captureSources" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'd:' || id::text || ':' || xmin::text FROM "captureSourceDrafts" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'v:' || id::text || ':' || xmin::text FROM "captureSourceVersions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'p:' || id::text || ':' || xmin::text FROM "capturePublications" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'r:' || id::text || ':' || xmin::text FROM "captureReceipts" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'i:' || id::text || ':' || xmin::text FROM "intakeItems" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 't:' || id::text || ':' || xmin::text FROM "capturePublicationTransitions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'b:' || id::text || ':' || xmin::text FROM "billingPlanChanges" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'sub:' || xmin::text FROM "workspaceSubscriptions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'member:' || m."userId" || ':' || m.xmin::text || ':' || u.xmin::text FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=:workspace
    UNION ALL SELECT 'service:' || service || ':' || xmin::text FROM "workspaceServices" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'w:' || xmin::text FROM workspaces WHERE id=:workspace
  ) evidence`, {
        workspace: context.workspaceId
    });
    const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, context.workspaceId);
    const policy = {
        ...context.policy,
        grants: [
            ...context.policy.grants
        ].sort((a, b)=>`${a.role}:${a.permission}:${a.scope}`.localeCompare(`${b.role}:${b.permission}:${b.scope}`))
    };
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(JSON.stringify([
        context.workspaceId,
        context.userId,
        policy,
        [
            ...context.enabledPermissions
        ].sort(),
        rows[0].stamp,
        entitlement.plan.id,
        entitlement.transition,
        deliveryStamp
    ])).digest('hex');
}
async function captureChatEvidenceAllowed(trx, context, stamp, deliveryStamp = '') {
    if (!stamp) return true;
    try {
        return stamp === await captureChatStamp(trx, context, deliveryStamp);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
        throw error;
    }
}
async function readCaptureForChat(db, identity, enabled, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatQuerySchema"].parse(raw);
    const page = options.pageContext ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureAssistantContextSchema"].parse(options.pageContext) : undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = permit(context), stamp = await captureChatStamp(trx, context, options.deliveryStamp);
        const timezone = (await trx('workspaces').where({
            id: scope.workspaceId
        }).first('timezone')).timezone;
        const base = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: scope.workspaceId,
            retrievedAt: new Date().toISOString(),
            timezone
        };
        let result;
        if (input.usePageFilters && page?.surface !== 'lead_capture.list') return {
            clarification: 'The current source-list filters are unavailable. Open the source list or specify explicit search filters.'
        };
        if (input.operation === 'sources') {
            const filters = input.usePageFilters && page?.surface === 'lead_capture.list' ? page.filters : {
                search: input.search ?? '',
                ...input.type ? {
                    type: input.type
                } : {},
                ...input.status ? {
                    status: input.status
                } : {},
                archived: input.archived
            };
            const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceWindowInTransaction"])(trx, context, {
                ...filters,
                page: input.page,
                pageSize: input.limit
            });
            result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse({
                ...base,
                operation: 'sources',
                rows: current.rows,
                total: current.total,
                page: current.page,
                limit: input.limit,
                filters
            });
        } else {
            const sourceId = input.sourceId ?? (page?.surface === 'lead_capture.setup' || page?.surface === 'lead_capture.detail' ? page.sourceId : undefined);
            if (!sourceId) return {
                clarification: 'Select a current capture source or provide an exact source ID from a fresh authorized result.'
            };
            const view = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCaptureSource"])(trx, identity, enabled, {
                workspaceId: scope.workspaceId,
                sourceId
            }, options.installationOrigin, options.authority ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"]);
            const source = view.detail.source;
            if (input.operation === 'source_summary') result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse({
                ...base,
                operation: input.operation,
                source
            });
            else if (input.operation === 'source_details') result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse({
                ...base,
                operation: input.operation,
                detail: view.detail,
                installation: view.installation ?? null
            });
            else if (input.operation === 'installation') result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse({
                ...base,
                operation: input.operation,
                source,
                installation: view.installation ?? null
            });
            else result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse({
                ...base,
                operation: input.operation,
                source,
                review: view.publicationReview
            });
        }
        if (JSON.stringify(result).length > 48000) return {
            clarification: 'This source result exceeds the assistant display limit. Open the source to review its complete configuration.'
        };
        if (stamp !== await captureChatStamp(trx, context, options.deliveryStamp)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return {
            stamp,
            snapshot: {
                result,
                query: input,
                snapshotHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(result)
            }
        };
    });
}
}),
"[project]/packages/data/src/lead-capture/proposal-supersession.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supersedeCaptureProposals",
    ()=>supersedeCaptureProposals
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
async function supersedeCaptureProposals(trx, identity, threadId, at, family) {
    const table = family === 'setup' ? 'chatCaptureSetupProposals' : 'chatCaptureSourceProposals', audit = family === 'setup' ? 'chatCaptureSetupAudit' : 'chatCaptureSourceAudit';
    // Setup remains usable while the additive publication/lifecycle migration is pending locally.
    if (family === 'source' && !await trx.schema.hasTable(table)) return;
    const rows = await trx(table).where({
        ...identity,
        threadId,
        state: 'pending'
    }).update({
        state: 'superseded',
        resolvedAt: at
    }).returning('*');
    for (const row of rows)await trx(audit).insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        actorId: identity.userId,
        proposalId: row.id,
        operation: row.payload.input.operation,
        action: 'superseded',
        inputHash: row.payload.view.ticket.inputHash
    });
}
}),
"[project]/packages/data/src/lead-capture/setup-proposals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureSetupEvidenceAllowed",
    ()=>captureSetupEvidenceAllowed,
    "decideCaptureSetupProposal",
    ()=>decideCaptureSetupProposal,
    "prepareCaptureSetupSampleApproval",
    ()=>prepareCaptureSetupSampleApproval,
    "proposeCaptureSetup",
    ()=>proposeCaptureSetup,
    "readCaptureSetupProposal",
    ()=>readCaptureSetupProposal,
    "readCaptureSetupSample",
    ()=>readCaptureSetupSample,
    "visibleCaptureSetupTicket",
    ()=>visibleCaptureSetupTicket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$proposal$2d$supersession$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/proposal-supersession.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-setup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$setup$2d$defaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/setup-defaults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/configuration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/assistant-read.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/setup-samples.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/gmail-sample-approval.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
const applicationOperations = [
    'suggest_website_fields',
    'suggest_workflow',
    'extract_sample',
    'refine_mapping',
    'approve_sample'
];
function authority(context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        ...context,
        policy: {
            ...context.policy,
            grants: [
                ...context.policy.grants
            ].sort((a, b)=>`${a.role}:${a.permission}`.localeCompare(`${b.role}:${b.permission}`))
        },
        enabledPermissions: [
            ...context.enabledPermissions
        ].sort()
    });
}
function permission(context, input, sourceId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'assistant.use'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const resource = sourceId ? {
        kind: 'capture_source',
        id: sourceId,
        workspaceId: context.workspaceId
    } : undefined;
    if (!(resource ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.read',
        resource
    }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leadCapture.read')).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (resource ? !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.read',
        resource
    }).allowed : !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.create'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (input.operation === 'create_source' ? !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.create'
    }).allowed : !resource || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.update',
        resource
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function digest(payload) {
    const ticket = {
        ...payload.view.ticket,
        state: undefined,
        inputHash: undefined
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        ticket,
        review: payload.view.review,
        authority: payload.authority,
        input: payload.input,
        turnId: payload.turnId,
        threadId: payload.threadId,
        manual: payload.manual
    });
}
function checked(row) {
    const payload = row.payload;
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].parse(payload.view);
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupProposeSchema"].parse(payload.input);
    if (payload.view.ticket.proposalId !== row.id || payload.turnId !== row.turnId || payload.threadId !== row.threadId || payload.view.ticket.workspaceId !== row.workspaceId || payload.view.ticket.inputHash !== digest(payload)) throw conflict();
    return payload;
}
async function audit(trx, row, action) {
    await trx('chatCaptureSetupAudit').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        operation: row.payload.input.operation,
        action,
        inputHash: row.payload.view.ticket.inputHash
    });
}
async function versions(trx, context, row) {
    const payload = checked(row), target = payload.view.ticket.target;
    permission(context, payload.input, target.kind === 'source' ? target.sourceId : undefined);
    if (row.state === 'confirmed' && payload.view.receipt?.kind === 'saved') {
        const saved = payload.view.receipt;
        const source = await trx('captureSources').where({
            workspaceId: context.workspaceId,
            id: saved.sourceId
        }).first();
        const draft = source?.draftId ? await trx('captureSourceDrafts').where({
            workspaceId: context.workspaceId,
            id: source.draftId
        }).first() : undefined;
        if (!source || source.version !== saved.sourceVersion || !draft || draft.version !== saved.draftVersion) throw conflict();
        return;
    }
    if (target.kind !== 'source') return;
    const source = await trx('captureSources').where({
        workspaceId: context.workspaceId,
        id: target.sourceId
    }).first();
    if (!source || source.status === 'archived') throw conflict();
    const draft = source.draftId ? await trx('captureSourceDrafts').where({
        workspaceId: context.workspaceId,
        id: source.draftId
    }).first() : undefined;
    if (source.version !== target.sourceVersion || (draft?.version ?? null) !== target.draftVersion || source.approvedVersion !== target.approvedVersion) throw conflict();
}
function publicView(row, now) {
    const view = checked(row).view;
    const state = row.state === 'pending' && Date.parse(view.ticket.expiresAt) <= now ? 'expired' : row.state;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].parse({
        ...view,
        ticket: {
            ...view.ticket,
            state
        }
    });
}
async function current(trx, context, row) {
    const payload = checked(row);
    const business = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureBusinessContextInTransaction"])(trx, context);
    const assignment = payload.view.review.configuration.workflow?.assignment;
    if (assignment?.kind === 'teammate' && !business.teammates.some((member)=>member.id === assignment.teammateId)) throw conflict();
    if (payload.view.review.configuration.type === 'gmail' && business.gmailAccess !== 'available') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (payload.authority !== authority(context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    await versions(trx, context, row);
    return payload;
}
function changes(base, input) {
    const next = structuredClone(base);
    if (input.fields !== null) next.fields = input.fields;
    if (input.contactRequired !== null) next.contactRequired = input.contactRequired;
    if (input.workflow !== null) next.workflow = input.workflow;
    if (next.type === 'website') {
        if (input.rules || input.mappings || input.findings) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        if (input.brief !== null) next.brief = input.brief;
        if (input.content !== null) next.content = input.content;
    } else {
        if (input.content || input.brief !== null) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        if (input.rules !== null) next.rules = input.rules;
        if (input.mappings !== null) next.mappings = input.mappings;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$configuration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftConfigurationSchema"].parse(next);
}
async function proposeCaptureSetup(db, identity, enabled, turnId, raw, signal, deliveryStamp = '', manual) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const turn = await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).first();
        const now = new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now);
        if (!turn || !(manual ? turn.state === 'completed' : [
            'accepted',
            'running'
        ].includes(turn.state) && new Date(turn.leaseUntil) > now)) throw conflict();
        const requestId = manual?.requestId ?? turnId;
        const repeated = await trx('chatCaptureSetupProposals').where({
            ...identity,
            requestId
        }).first();
        if (repeated) {
            const payload = checked(repeated);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(payload.input) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input) || !!manual !== payload.manual || manual && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(payload.view.review.base) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(manual.setup)) throw conflict();
            await current(trx, context, repeated);
            return publicView(repeated, now.getTime());
        }
        const page = turn.pageContext;
        const sourceId = input.sourceId ?? page.captureContext?.sourceId;
        permission(context, input, input.operation === 'create_source' ? undefined : sourceId);
        if (turn.captureStamp && turn.captureStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatStamp"])(trx, context, deliveryStamp) && !manual) throw conflict();
        let base = null, before = null, configuration, name;
        let target;
        if (input.operation === 'create_source') {
            const business = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftStartContext"])(trx, identity, enabled)).business;
            if (input.sourceType === 'gmail' && business.gmailAccess !== 'available') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftEntitlementError"]();
            configuration = changes((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$setup$2d$defaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initialCaptureSetupConfiguration"])(input.sourceType, business), input);
            name = input.name;
            target = {
                kind: 'new_source'
            };
        } else {
            if (!sourceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
            const view = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCaptureSource"])(trx, identity, enabled, {
                workspaceId: identity.workspaceId,
                sourceId
            });
            const source = view.detail.source, draft = view.detail.draft;
            if (source.status === 'archived') throw conflict();
            target = {
                kind: 'source',
                sourceId,
                sourceVersion: source.version,
                draftVersion: draft?.version ?? null,
                approvedVersion: source.approvedVersion
            };
            if (input.operation === 'begin_revision') {
                if (draft || !view.detail.approved) throw conflict();
                configuration = view.detail.approved.configuration;
                before = configuration;
                name = source.name;
            } else {
                if (!draft) throw conflict();
                const provided = manual?.setup ?? (page.captureSetup?.sourceId === sourceId ? page.captureSetup : undefined);
                base = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupContextSchema"].parse(provided ?? {
                    sourceId,
                    sourceVersion: source.version,
                    draftVersion: draft.version,
                    name: source.name,
                    configuration: draft.configuration,
                    sample: null,
                    findings: []
                });
                if (base.sourceId !== sourceId || base.sourceVersion !== source.version || base.draftVersion !== draft.version || base.configuration.type !== source.type) throw conflict();
                if (base.configuration.type === 'gmail') {
                    for (const key of [
                        'connectionId',
                        'accountEmail'
                    ])if (base.configuration[key] !== (draft.configuration.type === 'gmail' ? draft.configuration[key] : undefined)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
                }
                configuration = changes(base.configuration, input);
                before = draft.configuration;
                name = input.name ?? base.name;
            }
        }
        if (input.operation === 'suggest_website_fields' && configuration.type !== 'website') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        const business = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureBusinessContextInTransaction"])(trx, context);
        if (configuration.type === 'gmail' && business.gmailAccess !== 'available') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const assignment = configuration.workflow?.assignment;
        if (assignment?.kind === 'teammate' && !business.teammates.some((member)=>member.id === assignment.teammateId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        if (input.operation === 'suggest_website_fields' && (!configuration.contactRequired || ![
            'name',
            'service'
        ].every((key)=>configuration.fields?.some((field)=>field.key === key && field.required)) || !configuration.fields?.some((field)=>[
                'email',
                'phone'
            ].includes(field.key)) || configuration.fields.some((field)=>!field.label || [
                'dropdown',
                'checkboxes'
            ].includes(field.type) && (field.options.length < 2 || field.options.some((option)=>!option.label))))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        const sample = base?.sample ?? null, findings = input.findings ?? base?.findings ?? [];
        if ([
            'extract_sample',
            'refine_mapping',
            'approve_sample'
        ].includes(input.operation)) {
            const issues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupFindingIssues"])(configuration, sample, findings, input.operation === 'approve_sample', !!manual);
            if (issues.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]([
                ...new Set(issues)
            ]);
            if (input.operation === 'approve_sample') {
                const included = new Set(findings.filter((row)=>row.included).map((row)=>row.fieldId));
                configuration.fields = configuration.fields?.filter((field)=>included.has(field.id));
            }
        } else if (input.findings?.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        const stored = {
            authority: authority(context),
            input,
            turnId,
            threadId: turn.threadId,
            manual: !!manual,
            view: {
                ticket: {
                    workspaceId: identity.workspaceId,
                    proposalId: id,
                    inputHash: '0'.repeat(64),
                    operation: input.operation,
                    target,
                    state: 'pending',
                    createdAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + 900000).toISOString()
                },
                review: {
                    name,
                    configuration,
                    before,
                    base,
                    sample,
                    findings
                },
                receipt: null
            }
        };
        stored.view.ticket.inputHash = digest(stored);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].parse(stored.view);
        if (JSON.stringify(stored).length > 100000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$proposal$2d$supersession$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeCaptureProposals"])(trx, identity, turn.threadId, now, 'source');
        const old = await trx('chatCaptureSetupProposals').where({
            ...identity,
            threadId: turn.threadId,
            state: 'pending'
        }).update({
            state: 'superseded',
            resolvedAt: now
        }).returning('*');
        for (const row of old)await audit(trx, row, 'superseded');
        const [row] = await trx('chatCaptureSetupProposals').insert({
            ...identity,
            id,
            requestId,
            turnId,
            threadId: turn.threadId,
            payload: JSON.stringify(stored)
        }).returning('*');
        const evidence = [
            ...new Set([
                ...turn.captureSetupEvidence ?? [],
                id
            ])
        ];
        if (evidence.length > 7) throw conflict();
        await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).update({
            captureSetupEvidence: JSON.stringify(evidence)
        });
        await audit(trx, row, 'prepared');
        signal.throwIfAborted();
        return stored.view;
    });
}
async function readCaptureSetupProposal(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupReferenceSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx('chatCaptureSetupProposals').where({
            ...identity,
            id: input.proposalId
        }).first();
        if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({
            ...identity,
            id: row.turnId,
            state: 'completed'
        }).first('id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await current(trx, context, row);
        return publicView(row, Date.now());
    });
}
async function decideCaptureSetupProposal(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureAssistantProposalDecisionSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx('chatCaptureSetupProposals').where({
            ...identity,
            id: input.proposalId
        }).forUpdate().first();
        if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({
            ...identity,
            id: row.turnId,
            state: 'completed'
        }).first('id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const payload = await current(trx, context, row);
        if (row.state === (input.decision === 'confirm' ? 'confirmed' : 'cancelled')) return publicView(row, Date.now());
        const now = new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now);
        if (row.state !== 'pending' || Date.parse(payload.view.ticket.expiresAt) <= now.getTime() || await trx('chatTurns').where({
            ...identity,
            threadId: row.threadId
        }).whereIn('state', [
            'accepted',
            'running'
        ]).first('id')) throw conflict();
        if (input.decision === 'confirm') {
            const { review, ticket } = payload.view, target = ticket.target;
            if (ticket.operation === 'create_source') payload.view.receipt = {
                kind: 'saved',
                ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCaptureDraft"])(trx, identity, enabled, {
                    workspaceId: identity.workspaceId,
                    requestId: row.id,
                    name: review.name,
                    configuration: review.configuration
                })
            };
            else if (target.kind === 'source' && ticket.operation === 'begin_revision') payload.view.receipt = {
                kind: 'saved',
                ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["beginCaptureRevision"])(trx, identity, enabled, {
                    workspaceId: identity.workspaceId,
                    sourceId: target.sourceId,
                    expectedVersion: target.sourceVersion,
                    requestId: row.id
                })
            };
            else if (target.kind === 'source' && ticket.operation === 'save_draft') payload.view.receipt = {
                kind: 'saved',
                ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveCaptureDraft"])(trx, identity, enabled, {
                    workspaceId: identity.workspaceId,
                    sourceId: target.sourceId,
                    expectedVersion: target.sourceVersion,
                    expectedDraftVersion: target.draftVersion,
                    requestId: row.id,
                    name: review.name,
                    configuration: review.configuration
                })
            };
            else if (target.kind === 'source' && review.base && applicationOperations.includes(ticket.operation)) {
                const applied = structuredClone(review.configuration);
                if (ticket.operation === 'approve_sample' && applied.type === 'gmail') {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupFindingIssues"])(review.configuration, review.sample, review.findings, true, payload.manual).length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
                    const draft = await trx('captureSourceDrafts').where({
                        workspaceId: identity.workspaceId,
                        sourceId: target.sourceId
                    }).first('id');
                    applied.sampleId = row.id;
                    await trx('captureSetupSamples').insert({
                        id: row.id,
                        workspaceId: identity.workspaceId,
                        sourceId: target.sourceId,
                        draftId: draft.id,
                        actorId: identity.userId,
                        configurationHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupSampleHash"])(applied),
                        sample: JSON.stringify(review.sample),
                        findings: JSON.stringify(review.findings)
                    });
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$gmail$2d$sample$2d$approval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retainApprovedGmailSample"])(trx, identity, target.sourceId, target.sourceVersion, row.id, applied, review.sample, review.findings);
                }
                payload.view.receipt = {
                    kind: 'suggestions',
                    sourceId: target.sourceId,
                    configuration: applied,
                    base: review.base,
                    sample: review.sample,
                    findings: review.findings,
                    sampleApproved: ticket.operation === 'approve_sample'
                };
            } else throw conflict();
        }
        // The prepared hash never changes; receipts are authoritative results, not revised input.
        const state = input.decision === 'confirm' ? 'confirmed' : 'cancelled';
        payload.view.ticket.state = state;
        await trx('chatCaptureSetupProposals').where({
            id: row.id
        }).update({
            state,
            payload: JSON.stringify(payload),
            resolvedAt: now
        });
        await audit(trx, row, state);
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].parse(payload.view);
    });
}
async function captureSetupEvidenceAllowed(trx, context, ids = []) {
    if (!ids.length) return true;
    if (ids.length > 7 || new Set(ids).size !== ids.length) return false;
    for (const id of ids){
        const row = await trx('chatCaptureSetupProposals').where({
            workspaceId: context.workspaceId,
            userId: context.userId,
            id
        }).first();
        if (!row) return false;
        try {
            await current(trx, context, row);
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]) return false;
            throw error;
        }
    }
    return true;
}
async function visibleCaptureSetupTicket(trx, context, turnId) {
    const row = await trx('chatCaptureSetupProposals').where({
        workspaceId: context.workspaceId,
        userId: context.userId,
        turnId
    }).orderBy('createdAt', 'desc').orderBy('id', 'desc').first();
    if (!row) return undefined;
    try {
        await current(trx, context, row);
        return publicView(row, Date.now()).ticket;
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]) return undefined;
        throw error;
    }
}
async function prepareCaptureSetupSampleApproval(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupManualSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const origin = await trx('chatCaptureSetupProposals').where({
            ...identity,
            id: input.originProposalId,
            state: 'confirmed'
        }).first();
        if (!origin) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const payload = await current(trx, context, origin), receipt = payload.view.receipt;
        if (![
            'extract_sample',
            'refine_mapping'
        ].includes(payload.input.operation) || receipt?.kind !== 'suggestions' || receipt.sourceId !== input.setup.sourceId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(receipt.sample) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input.setup.sample) || input.setup.configuration.type !== 'gmail') throw conflict();
        const configuration = input.setup.configuration;
        return proposeCaptureSetup(trx, identity, enabled, origin.turnId, {
            operation: 'approve_sample',
            sourceId: input.setup.sourceId,
            name: null,
            sourceType: null,
            fields: configuration.fields ?? [],
            contactRequired: configuration.contactRequired ?? true,
            workflow: null,
            brief: null,
            content: null,
            rules: configuration.rules ?? null,
            mappings: configuration.mappings ?? [],
            findings: input.setup.findings
        }, new AbortController().signal, '', {
            requestId: input.requestId,
            setup: input.setup
        });
    });
}
async function readCaptureSetupSample(db, identity, enabled, raw) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx)=>{
        const view = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCaptureSource"])(trx, identity, enabled, raw), draft = view.detail.draft;
        if (!draft || draft.configuration.type !== 'gmail' || !draft.configuration.sampleId) return {
            sample: null
        };
        const row = await trx('captureSetupSamples').where({
            workspaceId: identity.workspaceId,
            sourceId: view.detail.source.id,
            draftId: draft.id,
            id: draft.configuration.sampleId,
            configurationHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$setup$2d$samples$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupSampleHash"])(draft.configuration)
        }).first();
        return {
            sample: row ? {
                id: row.id,
                sample: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupSampleSchema"].parse(row.sample),
                findings: row.findings.map((finding)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupFindingSchema"].parse(finding))
            } : null
        };
    });
}
}),
"[project]/packages/data/src/lead-capture/duplicate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "duplicateCaptureSource",
    ()=>duplicateCaptureSource
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/commands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
;
;
;
;
;
async function duplicateCaptureSource(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDuplicateCommandSchema"].safeParse(raw);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const source = await trx('captureSources').where({
            workspaceId: identity.workspaceId,
            id: input.sourceId
        }).forUpdate().first();
        const resource = {
            kind: 'capture_source',
            workspaceId: identity.workspaceId,
            id: input.sourceId
        };
        if (!source || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.read',
            resource
        }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.create'
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const inputHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input), operation = 'source.duplicate';
        const prior = await trx('captureOperations').where({
            workspaceId: identity.workspaceId,
            operation,
            requestId: input.requestId
        }).first();
        if (prior) {
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureOperationResultSchema"].parse(prior.result);
            if (prior.inputHash !== inputHash || prior.actor.kind !== 'user' || prior.actor.userId !== identity.userId || prior.target.sourceId !== source.id || result.kind !== 'draft') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$commands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftSavedSchema"].parse({
                ok: true,
                sourceId: result.sourceId,
                sourceVersion: result.sourceVersion,
                draftVersion: result.draftVersion
            });
        }
        if (source.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
        const selected = input.configuration.kind === 'draft' ? source.draftId && await trx('captureSourceDrafts').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            id: source.draftId,
            version: input.configuration.version
        }).first('configuration') : source.approvedVersion === input.configuration.version && await trx('captureSourceVersions').where({
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            configurationVersion: input.configuration.version
        }).first('configuration');
        if (!selected) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
        const configuration = structuredClone(selected.configuration);
        if (configuration.type === 'gmail') {
            delete configuration.connectionId;
            delete configuration.accountEmail;
            delete configuration.sampleId;
            delete configuration.mappings;
        }
        const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCaptureDraft"])(trx, identity, enabled, {
            workspaceId: identity.workspaceId,
            requestId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            name: input.name,
            configuration
        });
        await trx('captureOperations').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            operation,
            requestId: input.requestId,
            inputHash,
            actor: JSON.stringify({
                kind: 'user',
                userId: identity.userId
            }),
            target: JSON.stringify({
                sourceId: source.id
            }),
            result: JSON.stringify({
                kind: 'draft',
                sourceId: saved.sourceId,
                sourceVersion: saved.sourceVersion,
                draftVersion: saved.draftVersion
            })
        });
        await trx('captureSourceEvents').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            sourceId: source.id,
            kind: 'source.duplicated',
            actor: JSON.stringify({
                kind: 'user',
                userId: identity.userId
            }),
            data: JSON.stringify({
                sourceVersion: source.version,
                copySourceId: saved.sourceId,
                configuration: input.configuration
            })
        });
        return saved;
    });
}
}),
"[project]/packages/data/src/lead-capture/source-proposals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureSourceEvidenceAllowed",
    ()=>captureSourceEvidenceAllowed,
    "decideCaptureSourceProposal",
    ()=>decideCaptureSourceProposal,
    "proposeCaptureSource",
    ()=>proposeCaptureSource,
    "readCaptureSourceProposal",
    ()=>readCaptureSourceProposal,
    "visibleCaptureSourceTicket",
    ()=>visibleCaptureSourceTicket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$proposal$2d$supersession$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/proposal-supersession.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$timing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/timing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-sources.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-setup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/assistant-read.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/publication.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$duplicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/duplicate.ts [app-route] (ecmascript)");
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
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]();
const enabling = [
    'publish',
    'resume',
    'change_schedule'
];
function stamp(context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        ...context,
        enabledPermissions: [
            ...context.enabledPermissions
        ].sort(),
        policy: {
            ...context.policy,
            grants: [
                ...context.policy.grants
            ].sort((a, b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
        }
    });
}
function permission(context, operation, sourceId) {
    const resource = {
        kind: 'capture_source',
        id: sourceId,
        workspaceId: context.workspaceId
    };
    const exact = operation === 'duplicate' ? 'leadCapture.create' : [
        'pause',
        'resume'
    ].includes(operation) ? 'leadCapture.pause' : [
        'archive',
        'restore'
    ].includes(operation) ? 'leadCapture.archive' : 'leadCapture.activate';
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'assistant.use'
    }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leadCapture.read',
        resource
    }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: exact,
        ...operation === 'duplicate' ? {} : {
            resource
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
function digest(payload) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])({
        ...payload,
        view: {
            ...payload.view,
            ticket: {
                ...payload.view.ticket,
                state: undefined,
                inputHash: undefined
            },
            receipt: undefined
        }
    });
}
function checked(row) {
    const payload = row.payload;
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].parse(payload.view);
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceInputSchema"].parse(payload.input);
    if (payload.turnId !== row.turnId || payload.threadId !== row.threadId || payload.view.ticket.proposalId !== row.id || payload.view.ticket.workspaceId !== row.workspaceId || payload.view.ticket.inputHash !== digest(payload)) throw conflict();
    return payload;
}
async function now(trx) {
    return new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now);
}
function visible(row, at) {
    const view = checked(row).view;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].parse({
        ...view,
        ticket: {
            ...view.ticket,
            state: row.state === 'pending' && Date.parse(view.ticket.expiresAt) <= at.getTime() ? 'expired' : row.state
        }
    });
}
async function audit(trx, row, action) {
    await trx('chatCaptureSourceAudit').insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        operation: row.payload.input.operation,
        action,
        inputHash: row.payload.view.ticket.inputHash
    });
}
async function current(trx, context, row, deliveryStamp) {
    const payload = checked(row), target = payload.view.ticket.target;
    if (target.kind !== 'source') throw conflict();
    permission(context, payload.input.operation, target.sourceId);
    if (stamp(context) !== payload.authority) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (enabling.includes(payload.input.operation) && deliveryStamp !== payload.deliveryStamp) throw conflict();
    const receipt = payload.view.receipt;
    if (row.state === 'confirmed' && receipt && receipt.kind !== 'intake') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leadCapture.read',
            resource: {
                kind: 'capture_source',
                id: receipt.sourceId,
                workspaceId: context.workspaceId
            }
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const saved = await trx('captureSources').where({
            workspaceId: context.workspaceId,
            id: receipt.sourceId
        }).first('version');
        if (!saved || saved.version !== receipt.sourceVersion) throw conflict();
        return payload;
    }
    const source = await trx('captureSources').where({
        workspaceId: context.workspaceId,
        id: target.sourceId
    }).first();
    const draft = source?.draftId ? await trx('captureSourceDrafts').where({
        workspaceId: context.workspaceId,
        id: source.draftId
    }).first('version') : undefined;
    if (!source || source.version !== target.sourceVersion || (draft?.version ?? null) !== target.draftVersion || source.approvedVersion !== target.approvedVersion) throw conflict();
    if (payload.view.ticket.transition && !await trx('capturePublicationTransitions').where({
        workspaceId: context.workspaceId,
        sourceId: source.id,
        id: payload.view.ticket.transition.transitionId,
        configurationVersion: payload.view.ticket.transition.configurationVersion,
        state: 'pending'
    }).first('id')) throw conflict();
    return payload;
}
async function proposeCaptureSource(db, identity, enabled, turnId, raw, signal, authority = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"], deliveryStamp = '') {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceInputSchema"].safeParse(raw);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
    const input = parsed.data;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const turn = await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).first(), at = await now(trx);
        if (!turn || ![
            'accepted',
            'running'
        ].includes(turn.state) || new Date(turn.leaseUntil) <= at) throw conflict();
        const repeated = await trx('chatCaptureSourceProposals').where({
            ...identity,
            requestId: turnId
        }).first();
        if (repeated) {
            const prior = await current(trx, context, repeated, deliveryStamp);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(prior.input) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureDraftFingerprint"])(input)) throw conflict();
            return visible(repeated, at);
        }
        const sourceId = input.sourceId ?? turn.pageContext.captureContext?.sourceId;
        if (!sourceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        permission(context, input.operation, sourceId);
        if (turn.captureStamp && turn.captureStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureChatStamp"])(trx, context, deliveryStamp)) throw conflict();
        const view = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCaptureSource"])(trx, identity, enabled, {
            workspaceId: identity.workspaceId,
            sourceId
        }, undefined, authority), source = view.detail.source, draft = view.detail.draft;
        const pending = await trx('capturePublicationTransitions').where({
            workspaceId: identity.workspaceId,
            sourceId,
            state: 'pending'
        }).first();
        let ready = false, checks = [], configurationKind = null;
        if (input.operation === 'publish' && !draft || input.operation === 'resume' && !source.approvedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        if (input.operation === 'publish') {
            checks = view.publicationReview?.checks ?? [];
            ready = !!view.publicationReview?.ready;
        } else if (input.operation === 'pause') ready = !!view.lifecycleReview?.canPause;
        else if (input.operation === 'resume') {
            ready = !!view.lifecycleReview?.resumeReady;
            checks = (view.lifecycleReview?.resumeFailures ?? []).map((code)=>({
                    code,
                    ready: false
                }));
        } else if (input.operation === 'archive') ready = !!view.lifecycleReview?.canArchive;
        else if (input.operation === 'restore') {
            ready = !!view.lifecycleReview?.restoreReady;
            checks = (view.lifecycleReview?.restoreFailures ?? []).map((code)=>({
                    code,
                    ready: false
                }));
        } else if (input.operation === 'duplicate') {
            configurationKind = input.configurationKind ?? (view.detail.approved ? 'approved' : 'draft');
            ready = !!(configurationKind === 'approved' ? view.detail.approved : draft);
            if (source.type === 'gmail' && view.business.gmailAccess !== 'available') {
                checks.push({
                    code: 'access',
                    ready: false
                });
                ready = false;
            }
        } else {
            if (!pending || source.status === 'archived') throw conflict();
            if (input.operation === 'cancel_schedule') ready = true;
            else {
                checks = view.publicationReview?.pendingChecks ?? [];
                ready = !!view.publicationReview?.pendingReady;
            }
        }
        let timing = input.timing?.kind === 'now' ? {
            kind: 'now'
        } : null;
        if (input.timing?.kind === 'scheduled') {
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$timing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCaptureLocalTime"])(input.timing.localDateTime, view.business.timezone);
            if (!resolved.at || Date.parse(resolved.at) <= at.getTime()) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
            timing = {
                kind: 'scheduled',
                at: resolved.at,
                timezone: view.business.timezone
            };
        }
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), payload = {
            input,
            authority: stamp(context),
            deliveryStamp,
            turnId,
            threadId: turn.threadId,
            view: {
                ticket: {
                    workspaceId: identity.workspaceId,
                    proposalId: id,
                    inputHash: '0'.repeat(64),
                    operation: input.operation,
                    target: {
                        kind: 'source',
                        sourceId,
                        sourceVersion: source.version,
                        draftVersion: draft?.version ?? null,
                        approvedVersion: source.approvedVersion
                    },
                    ...[
                        'change_schedule',
                        'cancel_schedule'
                    ].includes(input.operation) ? {
                        transition: {
                            transitionId: pending.id,
                            configurationVersion: pending.configurationVersion
                        }
                    } : {},
                    state: 'pending',
                    createdAt: at.toISOString(),
                    expiresAt: new Date(at.getTime() + 900000).toISOString()
                },
                source: view,
                timing,
                configurationKind,
                copyName: input.operation === 'duplicate' ? input.name : null,
                ready,
                checks,
                receipt: null
            }
        };
        payload.view.ticket.inputHash = digest(payload);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].parse(payload.view);
        if (JSON.stringify(payload).length > 100000) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftValidationError"]();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$proposal$2d$supersession$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeCaptureProposals"])(trx, identity, turn.threadId, at, 'setup');
        const old = await trx('chatCaptureSourceProposals').where({
            ...identity,
            threadId: turn.threadId,
            state: 'pending'
        }).update({
            state: 'superseded',
            resolvedAt: at
        }).returning('*');
        for (const row of old)await audit(trx, row, 'superseded');
        const [row] = await trx('chatCaptureSourceProposals').insert({
            ...identity,
            id,
            requestId: turnId,
            turnId,
            threadId: turn.threadId,
            payload: JSON.stringify(payload)
        }).returning('*');
        const evidence = [
            ...new Set([
                ...turn.captureSourceEvidence ?? [],
                id
            ])
        ];
        if (evidence.length > 7) throw conflict();
        await trx('chatTurns').where({
            ...identity,
            id: turnId
        }).update({
            captureSourceEvidence: JSON.stringify(evidence)
        });
        await audit(trx, row, 'prepared');
        signal.throwIfAborted();
        return payload.view;
    });
}
async function readCaptureSourceProposal(db, identity, enabled, raw, deliveryStamp = '') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSetupReferenceSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx('chatCaptureSourceProposals').where({
            ...identity,
            id: input.proposalId
        }).first();
        if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({
            ...identity,
            id: row.turnId,
            state: 'completed'
        }).first('id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await current(trx, context, row, deliveryStamp);
        return visible(row, await now(trx));
    });
}
async function decideCaptureSourceProposal(db, identity, enabled, raw, authority = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableCaptureDelivery"], deliveryStamp = '') {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureAssistantProposalDecisionSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (input.decision === 'confirm' && authority.gmailBaseline) {
        const view = await readCaptureSourceProposal(db, identity, enabled, {
            workspaceId: input.workspaceId,
            proposalId: input.proposalId,
            inputHash: input.inputHash
        }, deliveryStamp);
        const { target, operation, state, transition } = view.ticket;
        if (state === 'pending' && view.ready && target.kind === 'source' && view.source.detail.source.type === 'gmail') {
            const common = {
                sourceId: target.sourceId,
                expectedVersion: target.sourceVersion,
                requestId: input.proposalId
            };
            if (operation === 'resume') {
                authority = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prepareGmailActivation"])(db, identity, enabled, {
                    ...common,
                    kind: 'approved',
                    operation: 'source.resume'
                }, authority);
            } else if (view.timing?.kind === 'now' && operation === 'publish') {
                authority = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prepareGmailActivation"])(db, identity, enabled, {
                    ...common,
                    kind: 'draft',
                    operation: 'source.launch'
                }, authority);
            } else if (view.timing?.kind === 'now' && operation === 'change_schedule') {
                authority = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prepareGmailActivation"])(db, identity, enabled, {
                    ...common,
                    kind: 'transition',
                    transitionId: transition?.transitionId,
                    operation: 'source.reschedule'
                }, authority);
            }
        }
    }
    const outcome = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx('chatCaptureSourceProposals').where({
            ...identity,
            id: input.proposalId
        }).forUpdate().first();
        if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({
            ...identity,
            id: row.turnId,
            state: 'completed'
        }).first('id')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const payload = await current(trx, context, row, deliveryStamp), at = await now(trx), desired = input.decision === 'confirm' ? 'confirmed' : 'cancelled';
        if (row.state === desired) return visible(row, at);
        if (row.state !== 'pending' || Date.parse(payload.view.ticket.expiresAt) <= at.getTime() || await trx('chatTurns').where({
            ...identity,
            threadId: row.threadId
        }).whereIn('state', [
            'accepted',
            'running'
        ]).first('id')) throw conflict();
        if (input.decision === 'confirm') {
            if (!payload.view.ready) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]('readiness', payload.view.checks.filter((check)=>!check.ready).map((check)=>check.code));
            const view = payload.view, source = view.source.detail.source, target = view.ticket.target;
            if (target.kind !== 'source') throw conflict();
            const base = {
                workspaceId: identity.workspaceId,
                sourceId: source.id,
                expectedVersion: source.version,
                requestId: row.id,
                confirmed: true
            };
            const op = payload.input.operation;
            if (op === 'publish') {
                const review = view.source.publicationReview;
                if (!review) throw conflict();
                const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publishCaptureDraft"])(trx, identity, enabled, {
                    ...base,
                    draftVersion: target.draftVersion,
                    baseApprovedVersion: review.baseApprovedVersion,
                    configurationVersion: review.configurationVersion,
                    timing: view.timing
                }, authority);
                const { ok: _ok, ...result } = saved;
                void _ok;
                view.receipt = {
                    kind: 'publication',
                    ...result
                };
            } else if (op === 'change_schedule' || op === 'cancel_schedule') {
                const command = {
                    ...base,
                    transitionId: view.ticket.transition?.transitionId
                };
                const saved = op === 'change_schedule' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["changeCapturePublication"])(trx, identity, enabled, {
                    ...command,
                    timing: view.timing
                }, authority) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cancelCapturePublication"])(trx, identity, enabled, command);
                const { ok: _ok, ...result } = saved;
                void _ok;
                view.receipt = {
                    kind: 'publication',
                    ...result
                };
            } else if (op === 'duplicate') {
                const selected = view.configurationKind === 'approved' ? view.source.detail.approved : view.source.detail.draft;
                if (!selected) throw conflict();
                const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$duplicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["duplicateCaptureSource"])(trx, identity, enabled, {
                    ...base,
                    name: view.copyName,
                    configuration: {
                        kind: view.configurationKind,
                        version: selected.version
                    }
                });
                view.receipt = {
                    kind: 'draft',
                    sourceId: saved.sourceId,
                    sourceVersion: saved.sourceVersion,
                    draftVersion: saved.draftVersion
                };
            } else {
                let saved;
                try {
                    saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["changeCaptureLifecycle"])(trx, identity, enabled, {
                        ...base,
                        action: op,
                        ...op === 'resume' ? {
                            configuration: {
                                kind: 'approved',
                                version: target.approvedVersion
                            }
                        } : {}
                    }, authority);
                } catch (error) {
                    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$publication$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CapturePublicationError"]) return {
                        error
                    };
                    throw error;
                }
                view.receipt = {
                    kind: 'source',
                    sourceId: saved.sourceId,
                    sourceVersion: saved.sourceVersion
                };
            }
        }
        payload.view.ticket.state = desired;
        await trx('chatCaptureSourceProposals').where({
            id: row.id
        }).update({
            state: desired,
            payload: JSON.stringify(payload),
            resolvedAt: at
        });
        await audit(trx, row, desired);
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].parse(payload.view);
    });
    if ('error' in outcome) throw outcome.error;
    return outcome;
}
async function captureSourceEvidenceAllowed(trx, context, ids = [], deliveryStamp = '') {
    if (ids.length > 7 || new Set(ids).size !== ids.length) return false;
    for (const id of ids){
        const row = await trx('chatCaptureSourceProposals').where({
            workspaceId: context.workspaceId,
            userId: context.userId,
            id
        }).first();
        if (!row) return false;
        try {
            await current(trx, context, row, deliveryStamp);
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]) return false;
            throw error;
        }
    }
    return true;
}
async function visibleCaptureSourceTicket(trx, context, turnId, deliveryStamp = '') {
    const row = await trx('chatCaptureSourceProposals').where({
        workspaceId: context.workspaceId,
        userId: context.userId,
        turnId
    }).orderBy('createdAt', 'desc').first();
    if (!row) return undefined;
    try {
        await current(trx, context, row, deliveryStamp);
        return visible(row, await now(trx)).ticket;
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CaptureDraftConflictError"]) return undefined;
        throw error;
    }
}
}),
];

//# sourceMappingURL=packages_data_src_lead-capture_0.0mbyt._.js.map
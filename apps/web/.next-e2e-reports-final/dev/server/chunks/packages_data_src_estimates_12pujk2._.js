module.exports = [
"[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftPaperContent",
    ()=>estimateDraftPaperContent,
    "estimateEmailSubject",
    ()=>estimateEmailSubject,
    "estimateSharingPaper",
    ()=>estimateSharingPaper,
    "estimateSnapshotHash",
    ()=>estimateSnapshotHash,
    "verifiedEstimateFrozenSnapshot",
    ()=>verifiedEstimateFrozenSnapshot
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/sharing.ts [app-route] (ecmascript)");
;
;
;
function estimateDraftPaperContent(seed) {
    const estimate = seed.estimate;
    if (!estimate) throw new Error("A saved estimate is required for sharing.");
    const { values } = estimate;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimatePaperContentSchema"].parse({
        number: estimate.number,
        revision: estimate.revision,
        name: values.details.name,
        business: seed.paperBusiness,
        recipientName: values.details.recipientName,
        recipientEmail: values.details.recipientEmail,
        serviceAddress: values.details.serviceAddress,
        estimateDate: seed.today,
        validUntil: values.terms.validUntil,
        preparedBy: seed.members.find((member)=>member.id === values.details.ownerId)?.name ?? "",
        relatedRecord: `${estimate.parent.type === "lead" ? "Lead" : "Job"} ${estimate.parent.number} \u00b7 ${estimate.parent.name}`,
        scope: values.scope,
        message: values.terms.message,
        paymentTerms: values.terms.paymentTerms,
        termsNote: values.terms.termsNote,
        items: values.items.map((item)=>({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxable: item.taxable,
                included: item.included,
                unit: item.catalog?.unit ?? item.unit ?? ""
            })),
        discount: values.totals.discount,
        taxRate: values.totals.taxRate,
        deposit: values.terms.deposit,
        paymentLink: values.paymentLink ?? ""
    });
}
function estimateSharingPaper(seed) {
    const content = estimateDraftPaperContent(seed);
    const issues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSharingIssues"])(content);
    if (content.validUntil && content.validUntil < seed.today) {
        issues.push("Choose today or a later valid-until date in the workspace timezone.");
    }
    const amounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSharingAmounts"])(content);
    const snapshot = amounts ? {
        formatVersion: 1,
        content,
        amounts
    } : null;
    return {
        content,
        issues,
        snapshot
    };
}
function estimateSnapshotHash(snapshot) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateFrozenSnapshotSchema"].parse(snapshot))).digest("hex");
}
function verifiedEstimateFrozenSnapshot(content, contentHash) {
    const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validEstimateFrozenSnapshot"])(content);
    return snapshot && estimateSnapshotHash(snapshot) === contentHash ? snapshot : null;
}
function estimateEmailSubject(number, businessName) {
    return `Estimate ${number} from ${businessName}`.replace(/[\r\n]+/g, " ").trim();
}
}),
"[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateDraftConflictError",
    ()=>EstimateDraftConflictError,
    "EstimateDraftValidationError",
    ()=>EstimateDraftValidationError,
    "authorizeEstimateDelivery",
    ()=>authorizeEstimateDelivery,
    "changedEstimateDraftFields",
    ()=>changedEstimateDraftFields,
    "createEstimateDraft",
    ()=>createEstimateDraft,
    "createEstimateDraftInTransaction",
    ()=>createEstimateDraftInTransaction,
    "deleteEstimateDraft",
    ()=>deleteEstimateDraft,
    "deleteEstimateDraftInTransaction",
    ()=>deleteEstimateDraftInTransaction,
    "duplicateEstimate",
    ()=>duplicateEstimate,
    "duplicateEstimateInTransaction",
    ()=>duplicateEstimateInTransaction,
    "loadEstimateLifecycleContext",
    ()=>loadEstimateLifecycleContext,
    "loadEstimateRevisionSharingReview",
    ()=>loadEstimateRevisionSharingReview,
    "loadEstimateSharingContext",
    ()=>loadEstimateSharingContext,
    "readEstimateAssistantDetail",
    ()=>readEstimateAssistantDetail,
    "readEstimateCreationSeed",
    ()=>readEstimateCreationSeed,
    "readEstimateCreationSeedInTransaction",
    ()=>readEstimateCreationSeedInTransaction,
    "readEstimateDraftActionReviewInTransaction",
    ()=>readEstimateDraftActionReviewInTransaction,
    "readEstimateDraftDeletionReviewInTransaction",
    ()=>readEstimateDraftDeletionReviewInTransaction,
    "readEstimateEditor",
    ()=>readEstimateEditor,
    "readEstimateEditorInTransaction",
    ()=>readEstimateEditorInTransaction,
    "readEstimateParentInTransaction",
    ()=>readEstimateParentInTransaction,
    "readEstimateRevisionFamily",
    ()=>readEstimateRevisionFamily,
    "reviseEstimate",
    ()=>reviseEstimate,
    "reviseEstimateInTransaction",
    ()=>reviseEstimateInTransaction,
    "updateEstimateDraft",
    ()=>updateEstimateDraft,
    "updateEstimateDraftInTransaction",
    ()=>updateEstimateDraftInTransaction,
    "validateEstimateRevisionConfirmation",
    ()=>validateEstimateRevisionConfirmation
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$revision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-revision.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/totals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/state.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [app-route] (ecmascript)");
;
;
;
;
;
;
class EstimateDraftConflictError extends Error {
    constructor(message = "This estimate changed. Reload its current details before saving."){
        super(message);
    }
}
class EstimateDraftValidationError extends Error {
}
function changedEstimateDraftFields(before, after) {
    const fields = [];
    const compare = (field, left, right)=>{
        if (JSON.stringify(left) !== JSON.stringify(right)) fields.push(field);
    };
    for (const field of [
        "name",
        "recipientName",
        "recipientEmail",
        "serviceAddress"
    ]){
        compare(field, before.details[field], after.details[field]);
    }
    compare("owner", before.details.ownerId, after.details.ownerId);
    for (const field of [
        "message",
        "termsNote",
        "paymentTerms",
        "validUntil",
        "deposit"
    ]){
        compare(field, before.terms[field], after.terms[field]);
    }
    for (const field of [
        "scope",
        "internalNotes",
        "items"
    ])compare(field, before[field], after[field]);
    compare("paymentLink", before.paymentLink ?? "", after.paymentLink ?? before.paymentLink ?? "");
    compare("discount", before.totals.discount, after.totals.discount);
    compare("taxRate", before.totals.taxRate, after.totals.taxRate);
    return fields;
}
const numberLabel = (value)=>`EST-${String(value).padStart(4, "0")}`;
const hashInput = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(value)).digest("hex");
function dateOnly(value) {
    if (value === null) return null;
    if (value instanceof Date) {
        if (!Number.isFinite(value.getTime())) throw new Error("Estimate date is invalid.");
        return value.toISOString().slice(0, 10);
    }
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new Error("Estimate date is invalid.");
    }
    return value;
}
function estimateResource(row, job) {
    return {
        kind: "estimate",
        id: row.id,
        workspaceId: row.workspaceId,
        job
    };
}
function permit(context, permission, resource) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission,
        ...resource ? {
            resource
        } : {}
    }).allowed) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
}
function jobResource(id, workspaceId, ownerId, teamUserIds) {
    return {
        kind: "job",
        id,
        workspaceId,
        ownerId,
        teamUserIds
    };
}
async function assignmentForJob(trx, workspaceId, jobId) {
    const job = await trx("jobs as j").where({
        "j.workspaceId": workspaceId,
        "j.id": jobId
    }).select("j.id", "j.workspaceId", "j.primaryOwnerId").first();
    if (!job) return null;
    const team = await trx("jobTeamMembers").where({
        workspaceId,
        jobId
    }).orderBy("userId").pluck("userId");
    return jobResource(job.id, job.workspaceId, job.primaryOwnerId, team);
}
function estimateReadScope(context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    if (!scope.allowed || ![
        "workspace",
        "assigned_job"
    ].includes(scope.scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return scope.scope;
}
function applyEstimateReadScope(query, trx, context, scope) {
    if (scope === "assigned_job") {
        query.where("e.parentType", "job").whereExists(trx("jobs as scoped_job").select(trx.raw("1")).whereRaw(`scoped_job."workspaceId" = e."workspaceId"
              AND scoped_job.id = e."jobId"`).andWhere((assigned)=>assigned.where("scoped_job.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as scoped_team").select(trx.raw("1")).whereRaw(`scoped_team."workspaceId" = scoped_job."workspaceId"
                      AND scoped_team."jobId" = scoped_job.id`).where("scoped_team.userId", context.userId))));
    }
    return query;
}
async function readJobParent(trx, context, jobId, forCreation) {
    const job = await trx("jobs as j").leftJoin("customers as c", function joinCustomer() {
        this.on("c.workspaceId", "j.workspaceId").andOn("c.id", "j.customerId");
    }).where({
        "j.workspaceId": context.workspaceId,
        "j.id": jobId
    }).select("j.id", "j.workspaceId", "j.jobNumber", "j.title", "j.service", "j.location", "j.status", "j.customerId", "j.customerName", "j.primaryOwnerId", "c.name as linkedCustomerName", "c.email as linkedCustomerEmail", "c.location as linkedCustomerLocation").first();
    if (!job) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const resource = await assignmentForJob(trx, context.workspaceId, job.id);
    if (!resource) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    permit(context, "jobs.read", resource);
    if (forCreation) {
        permit(context, "estimates.create", {
            kind: "estimate",
            id: job.id,
            workspaceId: context.workspaceId,
            job: resource
        });
    }
    const customerName = job.linkedCustomerName ?? job.customerName;
    return {
        type: "job",
        id: job.id,
        number: `J-${String(job.jobNumber).padStart(4, "0")}`,
        name: job.title,
        status: job.status,
        service: job.service,
        customer: job.customerId && customerName ? {
            id: job.customerId,
            name: customerName
        } : null,
        contactName: customerName,
        recipientEmail: job.linkedCustomerEmail ?? "",
        serviceAddress: job.location || job.linkedCustomerLocation || "",
        href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(context.workspaceId)}`
    };
}
async function readLeadParent(trx, context, leadId, forCreation) {
    const lead = await trx("leads as l").leftJoin("customers as c", function joinCustomer() {
        this.on("c.workspaceId", "l.workspaceId").andOn("c.id", "l.customerId");
    }).where({
        "l.workspaceId": context.workspaceId,
        "l.id": leadId
    }).modify((query)=>{
        if (forCreation) query.whereNull("l.archivedAt");
    }).select("l.id", "l.leadNumber", "l.name", "l.service", "l.email", "l.address", "l.stage", "l.customerId", "l.ownerId", "c.name as linkedCustomerName", "c.email as linkedCustomerEmail").first();
    if (!lead) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const resource = {
        kind: "lead",
        id: lead.id,
        workspaceId: context.workspaceId,
        ownerId: lead.ownerId ?? null
    };
    permit(context, "leads.read", resource);
    if (forCreation) {
        permit(context, "estimates.create", {
            kind: "estimate",
            id: lead.id,
            workspaceId: context.workspaceId,
            job: null
        });
    }
    return {
        type: "lead",
        id: lead.id,
        number: `LD-${String(lead.leadNumber).padStart(4, "0")}`,
        name: lead.name,
        status: lead.stage,
        service: lead.service,
        customer: lead.customerId && lead.linkedCustomerName ? {
            id: lead.customerId,
            name: lead.linkedCustomerName
        } : null,
        contactName: lead.name,
        recipientEmail: lead.email || lead.linkedCustomerEmail || "",
        serviceAddress: lead.address,
        href: `/leads/${encodeURIComponent(lead.id)}?workspace=${encodeURIComponent(context.workspaceId)}`
    };
}
async function parentRecord(trx, context, type, id, forCreation) {
    return type === "lead" ? readLeadParent(trx, context, id, forCreation) : readJobParent(trx, context, id, forCreation);
}
async function readEstimateParentInTransaction(trx, context, type, id) {
    const parent = await parentRecord(trx, context, type, id, false);
    const active = type === "job" || !!await trx("leads").where({
        workspaceId: context.workspaceId,
        id
    }).whereNull("archivedAt").first("id");
    return {
        parent,
        canCreate: active && await creationAllowed(trx, context, parent)
    };
}
async function editorDefaults(trx, workspaceId) {
    const workspace = await trx("workspaces as w").leftJoin("workspaceEstimateSettings as s", "s.workspaceId", "w.id").where("w.id", workspaceId).select("w.timezone", "s.businessName", "s.address", "s.phone", "s.replyToEmail", "s.licenseLine", "s.logoFileId", "s.requireServiceAddress", "s.defaultTaxRateMilliPercent", "s.validForDays", "s.defaultMessage", "s.defaultTerms", "s.defaultDepositType", "s.defaultDepositValue", "s.paymentTermPresets", trx.raw(`to_char((now() AT TIME ZONE w.timezone)::date, 'YYYY-MM-DD') AS today`), trx.raw(`to_char(
        (now() AT TIME ZONE w.timezone)::date + COALESCE(s."validForDays", 30),
        'YYYY-MM-DD'
      ) AS "defaultValidUntil"`)).first();
    if (!workspace) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const presets = workspace.paymentTermPresets ?? [];
    if (!Array.isArray(presets) || presets.some((preset)=>!preset || typeof preset.id !== "string" || typeof preset.label !== "string" || typeof preset.text !== "string")) {
        throw new Error("Estimate payment presets are invalid.");
    }
    const depositType = workspace.defaultDepositType ?? "none";
    const depositValue = String(workspace.defaultDepositValue ?? "0");
    return {
        timezone: workspace.timezone,
        today: workspace.today,
        paperBusiness: {
            name: workspace.businessName ?? "",
            address: workspace.address ?? "",
            phone: workspace.phone ?? "",
            email: workspace.replyToEmail ?? "",
            licenseLine: workspace.licenseLine ?? "",
            logoPath: workspace.logoFileId ? `/api/settings/estimates/logo/${encodeURIComponent(workspace.logoFileId)}` : null,
            requireServiceAddress: workspace.requireServiceAddress ?? true
        },
        defaults: {
            taxRate: String(Number(workspace.defaultTaxRateMilliPercent ?? 0) / 1000),
            validUntil: workspace.defaultValidUntil,
            message: workspace.defaultMessage ?? "",
            termsNote: workspace.defaultTerms ?? "",
            deposit: depositType === "none" ? {
                type: "none"
            } : {
                type: depositType,
                value: depositValue
            }
        },
        paymentPresets: presets
    };
}
async function memberOptions(trx, workspaceId) {
    const rows = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", workspaceId).whereNull("u.deletionRequestedAt").select("m.userId as id", "u.name").orderBy("u.name").orderBy("m.userId").limit(200);
    return rows.map((row)=>({
            id: row.id,
            name: row.name
        }));
}
function adjustmentValue(type, value) {
    return type === "none" ? {
        type: "none"
    } : {
        type,
        value
    };
}
function safeCents(value) {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error("Estimate total is invalid.");
    return parsed;
}
function dollarsToCents(value) {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
    if (!match) throw new EstimateDraftValidationError("Enter a unit price with at most two decimal places.");
    const amount = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
    const result = Number(amount);
    if (!Number.isSafeInteger(result)) throw new EstimateDraftValidationError("The unit price is too large.");
    return result;
}
function centsToDollars(value) {
    if (value === null) return "";
    return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}
function decimalText(value) {
    return String(value ?? "0").replace(/(?:\.0+|(\.\d*?)0+)$/, "$1");
}
function valuesForRow(row, items) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftValuesSchema"].parse({
        details: {
            name: row.name,
            recipientName: row.recipientName,
            recipientEmail: row.recipientEmail,
            serviceAddress: row.serviceAddress,
            ownerId: row.ownerId ?? ""
        },
        items: items.map((item)=>({
                description: item.description,
                quantity: decimalText(item.quantity),
                unitPrice: centsToDollars(safeCents(item.unitPriceCents)),
                taxable: item.taxable,
                included: item.included,
                ...!item.catalogId && item.unit ? {
                    unit: item.unit
                } : {},
                ...item.catalogId && item.catalogName ? {
                    catalog: {
                        id: item.catalogId,
                        name: item.catalogName,
                        unit: item.unit ?? "each",
                        sku: item.sku ?? ""
                    }
                } : {}
            })),
        totals: {
            discount: adjustmentValue(row.discountType, decimalText(row.discountValue)),
            taxRate: decimalText(String(row.taxRateMilliPercent / 1000))
        },
        terms: {
            message: row.message,
            validUntil: dateOnly(row.validUntil) ?? "",
            paymentTerms: row.paymentTerms,
            termsNote: row.termsNote,
            deposit: adjustmentValue(row.depositType, decimalText(row.depositValue))
        },
        scope: row.scope,
        internalNotes: row.internalNotes,
        paymentLink: row.paymentLink
    });
}
function calculation(values) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])({
        items: values.items,
        ...values.totals,
        deposit: values.terms.deposit
    });
    if (values.items.length > 0 && result.items.subtotalCents === null || Object.keys(result.errors).length > 0) {
        throw new EstimateDraftValidationError("Correct the estimate amounts and line items before saving.");
    }
    return result;
}
async function validateOwner(trx, context, ownerId, currentOwnerId) {
    const normalizedOwnerId = ownerId || null;
    if (context.membership.role === "field" && normalizedOwnerId !== currentOwnerId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (!normalizedOwnerId) return null;
    const member = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where({
        "m.workspaceId": context.workspaceId,
        "m.userId": normalizedOwnerId
    }).whereNull("u.deletionRequestedAt").first("m.userId");
    if (!member) throw new EstimateDraftValidationError("Choose a current workspace teammate.");
    return normalizedOwnerId;
}
async function validateCatalogItems(trx, context, values) {
    const ids = [
        ...new Set(values.items.flatMap((item)=>item.catalog ? [
                item.catalog.id
            ] : []))
    ];
    if (!ids.length) return new Map();
    const canRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "materials.read"
    }).allowed;
    if (!canRead) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const rows = await trx("materialCatalog").where({
        workspaceId: context.workspaceId,
        status: "active"
    }).whereNull("archivedAt").whereIn("id", ids).select("id", "name", "unit", "sku");
    if (rows.length !== ids.length) {
        throw new EstimateDraftValidationError("A selected material is no longer available. Search the catalog again.");
    }
    return new Map(rows.map((row)=>[
            row.id,
            {
                name: row.name,
                unit: row.unit,
                sku: row.sku
            }
        ]));
}
function totalFields(values) {
    const result = calculation(values);
    const hasItems = values.items.length > 0;
    return {
        subtotalCents: hasItems ? result.items.subtotalCents : null,
        discountCents: hasItems ? result.discountCents : null,
        taxCents: hasItems ? result.taxCents : null,
        totalCents: hasItems ? result.totalCents : null,
        depositCents: hasItems ? result.depositCents : null,
        balanceCents: hasItems ? result.balanceCents : null,
        taxRateMilliPercent: result.taxRateMilliPercent ?? 0,
        discountType: values.totals.discount.type,
        discountValue: values.totals.discount.type === "none" ? "0" : values.totals.discount.value,
        depositType: values.terms.deposit.type,
        depositValue: values.terms.deposit.type === "none" ? "0" : values.terms.deposit.value
    };
}
async function insertItems(trx, context, estimateId, values, totals) {
    if (!values.items.length) return;
    const catalog = await validateCatalogItems(trx, context, values);
    await trx("estimate_items").insert(values.items.map((item, position)=>{
        const snapshot = item.catalog ? catalog.get(item.catalog.id) : undefined;
        const amountCents = totals.items.items[position]?.amountCents;
        return {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            estimateId,
            position,
            catalogId: item.catalog?.id ?? null,
            catalogName: snapshot?.name ?? null,
            unit: snapshot?.unit ?? item.unit ?? null,
            sku: snapshot?.sku ?? null,
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: dollarsToCents(item.unitPrice),
            taxable: item.taxable,
            included: item.included,
            amountCents
        };
    }));
}
async function estimateJob(trx, row) {
    return row.jobId ? assignmentForJob(trx, row.workspaceId, row.jobId) : null;
}
async function accessibleEstimate(trx, context, estimateId, lock = false) {
    const scope = estimateReadScope(context);
    let query = trx("estimates as e").where("e.workspaceId", context.workspaceId).where("e.id", estimateId);
    query = applyEstimateReadScope(query, trx, context, scope);
    if (lock) query = query.forUpdate("e");
    const row = await query.first("e.*");
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const job = await estimateJob(trx, row);
    permit(context, "estimates.read", estimateResource(row, job));
    return {
        row,
        job
    };
}
async function itemsForEstimate(trx, workspaceId, estimateId) {
    return trx("estimate_items").where({
        workspaceId,
        estimateId
    }).orderBy("position").select("id", "catalogId", "catalogName", "unit", "sku", "description", "quantity", "unitPriceCents", "taxable", "included");
}
async function editorRecord(trx, context, row, today) {
    let parent;
    try {
        parent = await parentRecord(trx, context, row.parentType, row.parentType === "lead" ? row.leadId : row.jobId, false);
    } catch (error) {
        if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
        parent = {
            type: row.parentType,
            id: row.parentType === "lead" ? row.leadId : row.jobId,
            number: "Unavailable",
            name: "Restricted related record",
            status: "Unavailable",
            service: "",
            customer: null,
            contactName: "",
            recipientEmail: "",
            serviceAddress: ""
        };
    }
    const items = await itemsForEstimate(trx, context.workspaceId, row.id);
    const snapshot = await trx("estimate_snapshots").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).first("id");
    return {
        id: row.id,
        number: numberLabel(row.estimateNumber),
        revision: row.revision,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateStatusAtDate"])(row.status, dateOnly(row.validUntil), today),
        archived: row.archivedAt !== null,
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
        sharing: snapshot || row.sentAt || row.publishedAt ? "shared" : "never-shared",
        parent,
        values: valuesForRow(row, items)
    };
}
function capabilities(context, row, job, createAllowed) {
    const resource = row ? estimateResource(row, job) : undefined;
    return {
        read: true,
        create: createAllowed,
        update: !!row && row.status === "draft" && row.archivedAt === null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.update",
            resource
        }).allowed,
        delete: !!row && row.status === "draft" && row.archivedAt === null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.delete",
            resource
        }).allowed,
        void: !!row && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.void",
            resource
        }).allowed,
        archive: !!row && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.archive",
            resource
        }).allowed,
        assignOwner: context.membership.role !== "field",
        browseMaterials: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "materials.read"
        }).allowed,
        viewMaterialPrices: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "workorders.view_prices",
            resource: {
                kind: "work_order",
                id: "estimate-catalog",
                workspaceId: context.workspaceId,
                job: null
            }
        }).allowed
    };
}
async function creationAllowed(trx, context, parent) {
    if (parent.type === "lead") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.create",
            resource: {
                kind: "estimate",
                id: parent.id,
                workspaceId: context.workspaceId,
                job: null
            }
        }).allowed;
    }
    const job = await assignmentForJob(trx, context.workspaceId, parent.id);
    return !!job && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "estimates.create",
        resource: {
            kind: "estimate",
            id: parent.id,
            workspaceId: context.workspaceId,
            job
        }
    }).allowed;
}
async function seed(trx, context, parent, row, job) {
    const base = await editorDefaults(trx, context.workspaceId);
    const members = await memberOptions(trx, context.workspaceId);
    const estimate = row ? await editorRecord(trx, context, row, base.today) : null;
    const effectiveParent = parent ?? estimate?.parent ?? null;
    const existingEstimates = !row && effectiveParent?.type === "lead" && effectiveParent.href ? await applyEstimateReadScope(trx("estimates as e"), trx, context, estimateReadScope(context)).where({
        "e.workspaceId": context.workspaceId,
        "e.leadId": effectiveParent.id
    }).whereIn("e.status", [
        "draft",
        "sent",
        "published"
    ]).whereNull("e.archivedAt").whereNotExists(trx("estimates as newer").select(trx.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber" AND newer.revision > e.revision`)).andWhere((query)=>query.where("e.status", "draft").orWhereRaw(`e."validUntil" >= ?::date`, [
            base.today
        ])).orderBy("e.updatedAt", "desc").orderBy("e.id").limit(5).select("e.id", "e.estimateNumber", "e.status").then((rows)=>rows.map((item)=>({
                id: item.id,
                number: numberLabel(Number(item.estimateNumber)),
                status: item.status,
                href: `/estimates/${encodeURIComponent(item.id)}?workspace=${encodeURIComponent(context.workspaceId)}`
            }))) : [];
    const createAllowed = effectiveParent?.href ? await creationAllowed(trx, context, effectiveParent) : false;
    return {
        workspaceId: context.workspaceId,
        ...base,
        parent: effectiveParent,
        existingEstimates,
        estimate,
        members,
        capabilities: capabilities(context, row, job, createAllowed)
    };
}
async function readEstimateCreationSeed(db, identity, enabled, parentType, parentId, customerId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        return readEstimateCreationSeedInTransaction(trx, context, parentType, parentId, customerId);
    });
}
async function readEstimateCreationSeedInTransaction(trx, context, parentType, parentId, customerId) {
    const parent = await parentRecord(trx, context, parentType, parentId, true);
    if (customerId) {
        const customer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCustomerRecordInTransaction"])(trx, context, customerId);
        if (customer.archived || parent.customer?.id !== customerId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (!await creationAllowed(trx, context, parent)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        ...await seed(trx, context, parent, null, null),
        ...customerId ? {
            creationCustomerId: customerId
        } : {}
    };
}
async function readEstimateEditor(db, identity, enabled, estimateId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        return readEstimateEditorInTransaction(trx, context, estimateId);
    });
}
async function readEstimateEditorInTransaction(trx, context, estimateId) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId);
    return seed(trx, context, null, row, job);
}
async function readEstimateAssistantDetail(db, identity, enabled, rawEstimateId) {
    const estimateId = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(rawEstimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const { row, status, today } = await loadEstimateLifecycleContext(trx, context, estimateId);
        const itemRows = await itemsForEstimate(trx, context.workspaceId, row.id);
        const isDraft = row.status === "draft";
        const snapshot = isDraft ? null : (await revisionSnapshot(trx, row)).snapshot;
        const values = isDraft ? valuesForRow(row, itemRows) : null;
        const content = snapshot?.content;
        const items = content?.items ?? values?.items ?? [];
        const totals = content ? {
            items,
            discount: content.discount,
            taxRate: content.taxRate,
            deposit: content.deposit
        } : {
            items,
            discount: values.totals.discount,
            taxRate: values.totals.taxRate,
            deposit: values.terms.deposit
        };
        const calculation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])(totals);
        const lineAmounts = snapshot?.amounts.lineAmountsCents;
        const lineItems = items.map((item, index)=>({
                description: item.description,
                quantity: item.quantity,
                unitPriceCents: dollarsToCents(item.unitPrice),
                unit: "unit" in item ? item.unit : item.catalog?.unit ?? null,
                taxable: item.taxable,
                included: item.included,
                amountCents: lineAmounts?.[index] ?? calculation.items.items[index]?.amountCents ?? null,
                errors: calculation.items.items[index]?.errors ?? {}
            }));
        const amounts = snapshot?.amounts;
        return {
            id: row.id,
            number: content?.number ?? numberLabel(row.estimateNumber),
            revision: row.revision,
            name: content?.name ?? row.name,
            status,
            archived: row.archivedAt !== null,
            scope: content?.scope ?? values.scope,
            validUntil: content?.validUntil ?? dateOnly(row.validUntil) ?? "",
            lineItems,
            adjustments: {
                discount: totals.discount,
                taxRate: totals.taxRate,
                deposit: totals.deposit
            },
            calculationErrors: calculation.errors,
            itemError: calculation.items.error,
            totals: {
                subtotalCents: amounts?.subtotalCents ?? calculation.items.subtotalCents,
                discountCents: amounts?.discountCents ?? calculation.discountCents,
                taxableDiscountCents: calculation.taxableDiscountCents,
                nonTaxableDiscountCents: calculation.nonTaxableDiscountCents,
                taxableAfterDiscountCents: calculation.taxableAfterDiscountCents,
                taxRateMilliPercent: calculation.taxRateMilliPercent,
                taxCents: amounts?.taxCents ?? calculation.taxCents,
                totalCents: amounts?.totalCents ?? calculation.totalCents,
                depositCents: amounts?.depositCents ?? calculation.depositCents,
                balanceCents: amounts?.balanceCents ?? calculation.balanceCents
            },
            source: snapshot ? "frozen_snapshot" : "current_draft",
            today
        };
    });
}
async function authorizeEstimateDelivery(trx, context, estimateId) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId);
    permit(context, "estimates.send", estimateResource(row, job));
    return row;
}
async function loadEstimateLifecycleContext(trx, context, estimateId, lock = false) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId, lock);
    const workspace = await trx("workspaces").where({
        id: context.workspaceId
    }).select("timezone", trx.raw(`to_char((clock_timestamp() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`)).first();
    return {
        row,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateStatusAtDate"])(row.status, dateOnly(row.validUntil), workspace.today),
        timezone: workspace.timezone,
        today: workspace.today,
        canVoid: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.void",
            resource: estimateResource(row, job)
        }).allowed,
        canArchive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.archive",
            resource: estimateResource(row, job)
        }).allowed,
        canDecide: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.decide",
            resource: estimateResource(row, job)
        }).allowed,
        canCorrectDecision: context.membership.role !== "field" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.decide",
            resource: estimateResource(row, job)
        }).allowed,
        canRevise: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.update",
            resource: estimateResource(row, job)
        }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.create",
            resource: estimateResource(row, job)
        }).allowed
    };
}
async function loadEstimateSharingContext(trx, context, estimateId) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId);
    const loaded = await seed(trx, context, null, row, job);
    const date = await trx("workspaces").where({
        id: context.workspaceId
    }).select(trx.raw(`to_char((clock_timestamp() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`)).first();
    loaded.today = date.today;
    if (loaded.estimate) {
        loaded.estimate.status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateStatusAtDate"])(row.status, dateOnly(row.validUntil), loaded.today);
    }
    return {
        seed: loaded,
        canSend: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "estimates.send",
            resource: estimateResource(row, job)
        }).allowed
    };
}
function validateValues(raw) {
    const values = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftValuesSchema"].parse(raw);
    const totals = calculation(values);
    return {
        values,
        totals
    };
}
async function writeActivity(trx, context, estimateId, type, changes, source = "ui") {
    const user = await trx("users").where({
        id: context.userId
    }).first("name");
    if (!user) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: context.workspaceId,
        estimateId,
        actorId: context.userId,
        actorName: user.name,
        source,
        type,
        changes: JSON.stringify(changes)
    });
}
async function priorOperationResult(trx, context, submissionId, operation, hash) {
    const previous = await trx("estimate_operation_receipts").where({
        workspaceId: context.workspaceId,
        submissionId
    }).first();
    if (!previous) return null;
    if (previous.actorId !== context.userId || previous.operation !== operation || previous.inputHash !== hash || !previous.estimateId) {
        throw new EstimateDraftConflictError("This save was already used for different estimate details.");
    }
    const prior = await trx("estimates as e").where({
        "e.workspaceId": context.workspaceId,
        "e.id": previous.estimateId
    }).first("e.*");
    if (!prior) throw new EstimateDraftConflictError();
    const job = await estimateJob(trx, prior);
    permit(context, "estimates.read", estimateResource(prior, job));
    return {
        id: prior.id,
        number: numberLabel(prior.estimateNumber),
        revision: prior.revision,
        version: prior.version,
        updatedAt: prior.updatedAt.toISOString()
    };
}
async function createEstimateDraftInTransaction(trx, context, input) {
    const { values, totals } = validateValues(input.values);
    const operation = input.operation ?? "create";
    const hash = input.receiptHash ?? hashInput({
        parentType: input.parent.type,
        parentId: input.parent.id,
        ...input.customerId ? {
            customerId: input.customerId
        } : {},
        values
    });
    if (input.customerId) {
        const customer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCustomerRecordInTransaction"])(trx, context, input.customerId);
        const linked = await trx(input.parent.type === "lead" ? "leads" : "jobs").where({
            workspaceId: context.workspaceId,
            id: input.parent.id,
            customerId: input.customerId
        }).forShare().first("id");
        if (!linked || customer.archived) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const parent = await parentRecord(trx, context, input.parent.type, input.parent.id, true);
        if (!await creationAllowed(trx, context, parent)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const prior = await priorOperationResult(trx, context, input.submissionId, operation, hash);
    if (prior) return prior;
    const parent = await parentRecord(trx, context, input.parent.type, input.parent.id, true);
    if (!await creationAllowed(trx, context, parent)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const job = parent.type === "job" ? await assignmentForJob(trx, context.workspaceId, parent.id) : null;
    const resource = {
        kind: "estimate",
        id: parent.id,
        workspaceId: context.workspaceId,
        job
    };
    permit(context, "estimates.create", resource);
    const ownerId = await validateOwner(trx, context, values.details.ownerId, input.revision ? input.revision.ownerId : context.membership.role === "field" ? context.userId : null);
    const estimateId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const parents = {
        parentType: parent.type,
        leadId: parent.type === "lead" ? parent.id : null,
        jobId: parent.type === "job" ? parent.id : null,
        customerId: parent.customer?.id ?? null
    };
    const amountFields = totalFields(values);
    const [row] = await trx("estimates").insert({
        id: estimateId,
        workspaceId: context.workspaceId,
        revision: 1,
        ...input.revision ? {
            estimateNumber: input.revision.estimateNumber,
            sourceEstimateId: input.revision.sourceEstimateId
        } : {},
        name: values.details.name,
        status: "draft",
        ...parents,
        ownerId,
        recipientName: values.details.recipientName,
        recipientEmail: values.details.recipientEmail,
        serviceAddress: values.details.serviceAddress,
        scope: values.scope,
        message: values.terms.message,
        termsNote: values.terms.termsNote,
        paymentTerms: values.terms.paymentTerms,
        paymentLink: values.paymentLink ?? "",
        internalNotes: values.internalNotes,
        validUntil: values.terms.validUntil || null,
        ...amountFields,
        createdBy: context.userId
    }).returning([
        "id",
        "estimateNumber",
        "revision",
        "version",
        "updatedAt"
    ]);
    await insertItems(trx, context, estimateId, values, totals);
    await writeActivity(trx, context, estimateId, input.revision ? "revision-created" : "created", {
        status: {
            before: null,
            after: "draft"
        },
        itemCount: values.items.length,
        ...input.revision ? {
            revision: {
                before: input.revision.sourceRevision,
                after: row.revision
            }
        } : {}
    }, input.source);
    await trx("estimate_operation_receipts").insert({
        workspaceId: context.workspaceId,
        submissionId: input.submissionId,
        actorId: context.userId,
        operation,
        inputHash: hash,
        estimateId,
        version: Number(row.version)
    });
    return {
        id: row.id,
        number: numberLabel(Number(row.estimateNumber)),
        revision: Number(row.revision),
        version: Number(row.version),
        updatedAt: row.updatedAt.toISOString()
    };
}
async function createEstimateDraft(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createEstimateDraftSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return createEstimateDraftInTransaction(trx, context, {
            submissionId: input.submissionId,
            customerId: input.customerId,
            parent: {
                type: input.parentType,
                id: input.parentId
            },
            values: input.values
        });
    });
}
async function updateEstimateDraft(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateEstimateDraftSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return updateEstimateDraftInTransaction(trx, context, input);
    });
}
async function updateEstimateDraftInTransaction(trx, context, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateEstimateDraftSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { values, totals } = validateValues(input.values);
    const { row, job } = await accessibleEstimate(trx, context, input.estimateId, true);
    permit(context, "estimates.update", estimateResource(row, job));
    if (row.status !== "draft" || row.archivedAt !== null) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
    const ownerId = await validateOwner(trx, context, values.details.ownerId, row.ownerId);
    const fields = changedEstimateDraftFields(valuesForRow(row, await itemsForEstimate(trx, context.workspaceId, row.id)), values);
    const amountFields = totalFields(values);
    const [updated] = await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: row.id,
        version: input.expectedVersion
    }).update({
        name: values.details.name,
        ownerId,
        recipientName: values.details.recipientName,
        recipientEmail: values.details.recipientEmail,
        serviceAddress: values.details.serviceAddress,
        scope: values.scope,
        message: values.terms.message,
        termsNote: values.terms.termsNote,
        paymentTerms: values.terms.paymentTerms,
        paymentLink: values.paymentLink ?? row.paymentLink,
        internalNotes: values.internalNotes,
        validUntil: values.terms.validUntil || null,
        ...amountFields,
        version: row.version + 1,
        updatedAt: trx.fn.now()
    }).returning([
        "id",
        "estimateNumber",
        "revision",
        "version",
        "updatedAt"
    ]);
    if (!updated) throw new EstimateDraftConflictError();
    await trx("estimate_items").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).delete();
    await insertItems(trx, context, row.id, values, totals);
    await writeActivity(trx, context, row.id, "draft.saved", {
        fromVersion: row.version,
        toVersion: Number(updated.version),
        itemCount: values.items.length,
        fields
    }, source);
    return {
        id: updated.id,
        number: numberLabel(Number(updated.estimateNumber)),
        revision: Number(updated.revision),
        version: Number(updated.version),
        updatedAt: updated.updatedAt.toISOString()
    };
}
async function duplicateEstimate(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["duplicateEstimateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return duplicateEstimateInTransaction(trx, context, input);
    });
}
async function duplicateEstimateInTransaction(trx, context, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["duplicateEstimateSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const receiptHash = hashInput({
        operation: "duplicate",
        estimateId: input.estimateId,
        expectedVersion: input.expectedVersion
    });
    const prior = await priorOperationResult(trx, context, input.submissionId, "create", receiptHash);
    if (prior) return prior;
    const { parent, values } = await duplicateDraftReview(trx, context, input.estimateId, input.expectedVersion);
    return createEstimateDraftInTransaction(trx, context, {
        submissionId: input.submissionId,
        operation: "create",
        receiptHash,
        parent,
        values,
        source
    });
}
async function duplicateDraftReview(trx, context, estimateId, expectedVersion) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId, expectedVersion !== undefined);
    permit(context, "estimates.create", estimateResource(row, job));
    if (expectedVersion !== undefined && row.version !== expectedVersion) throw new EstimateDraftConflictError();
    const parent = await parentRecord(trx, context, row.parentType, row.parentType === "lead" ? row.leadId : row.jobId, true);
    const saved = valuesForRow(row, await itemsForEstimate(trx, context.workspaceId, row.id));
    const values = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftValuesSchema"].parse({
        ...saved,
        paymentLink: "",
        details: {
            ...saved.details,
            name: `${saved.details.name.slice(0, 113)} (copy)`,
            recipientName: "",
            recipientEmail: ""
        },
        terms: {
            ...saved.terms,
            validUntil: ""
        }
    });
    return {
        row,
        parent,
        values
    };
}
function checkedRevisionSnapshot(row, frozen) {
    const snapshot = frozen && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(frozen.content, frozen.contentHash);
    if (!frozen || !snapshot || snapshot.content.number !== numberLabel(row.estimateNumber) || snapshot.content.revision !== row.revision) {
        throw new EstimateDraftValidationError("The frozen revision is unavailable. Reload before continuing.");
    }
    return {
        snapshot,
        snapshotHash: frozen.contentHash
    };
}
async function revisionSnapshot(trx, row) {
    const frozen = await trx("estimate_snapshots").where({
        workspaceId: row.workspaceId,
        estimateId: row.id
    }).first();
    return checkedRevisionSnapshot(row, frozen);
}
async function reviseEstimate(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$revision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reviseEstimateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return reviseEstimateInTransaction(trx, context, input);
    });
}
async function reviseEstimateInTransaction(trx, context, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$revision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reviseEstimateSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const loaded = await loadEstimateLifecycleContext(trx, context, input.estimateId);
    if (!loaded.canRevise) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const receiptHash = hashInput(input);
    const prior = await priorOperationResult(trx, context, input.submissionId, "revise", receiptHash);
    if (prior) return prior;
    const { row } = loaded;
    if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
    const { pending, values, activeOwner, snapshotHash } = await revisionDraftReview(trx, context, loaded);
    if (snapshotHash !== input.snapshotHash) throw new EstimateDraftConflictError("The reviewed revision changed. Reload and review it.");
    if (pending) {
        await trx("estimate_operation_receipts").insert({
            workspaceId: context.workspaceId,
            submissionId: input.submissionId,
            actorId: context.userId,
            operation: "revise",
            inputHash: receiptHash,
            estimateId: pending.id,
            version: pending.version
        });
        return {
            id: pending.id,
            number: numberLabel(pending.estimateNumber),
            revision: pending.revision,
            version: pending.version,
            updatedAt: pending.updatedAt.toISOString()
        };
    }
    return createEstimateDraftInTransaction(trx, context, {
        submissionId: input.submissionId,
        operation: "revise",
        receiptHash,
        values,
        source,
        parent: {
            type: row.parentType,
            id: row.parentType === "lead" ? row.leadId : row.jobId
        },
        revision: {
            estimateNumber: row.estimateNumber,
            sourceEstimateId: row.id,
            sourceRevision: row.revision,
            ownerId: activeOwner
        }
    });
}
async function revisionDraftReview(trx, context, loaded) {
    const { row, status } = loaded;
    if (row.archivedAt || ![
        "sent",
        "published",
        "declined",
        "expired"
    ].includes(status)) {
        throw new EstimateDraftValidationError("Only an active Sent, Published, Declined or Expired estimate can be revised.");
    }
    const { snapshot, snapshotHash } = await revisionSnapshot(trx, row);
    if (await trx("estimates").where({
        workspaceId: context.workspaceId,
        estimateNumber: row.estimateNumber
    }).where("revision", ">", row.revision).whereNot("status", "draft").first("id")) {
        throw new EstimateDraftConflictError("A newer shared revision already exists. Open the current revision.");
    }
    const pending = await trx("estimates").where({
        workspaceId: context.workspaceId,
        estimateNumber: row.estimateNumber,
        status: "draft"
    }).first();
    if (pending) {
        if (pending.sourceEstimateId !== row.id || pending.archivedAt) throw new EstimateDraftConflictError();
        const { job } = await accessibleEstimate(trx, context, pending.id);
        permit(context, "estimates.update", estimateResource(pending, job));
        return {
            snapshotHash,
            pending,
            activeOwner: pending.ownerId,
            values: valuesForRow(pending, await itemsForEstimate(trx, context.workspaceId, pending.id))
        };
    }
    const { content } = snapshot;
    const activeOwner = row.ownerId && await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where({
        "m.workspaceId": context.workspaceId,
        "m.userId": row.ownerId
    }).whereNull("u.deletionRequestedAt").first("m.userId");
    const values = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftValuesSchema"].parse({
        details: {
            name: content.name,
            recipientName: content.recipientName,
            recipientEmail: content.recipientEmail,
            serviceAddress: content.serviceAddress,
            ownerId: activeOwner ? row.ownerId : ""
        },
        items: content.items.map((item)=>({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxable: item.taxable,
                included: item.included,
                unit: item.unit
            })),
        totals: {
            discount: content.discount,
            taxRate: content.taxRate
        },
        terms: {
            message: content.message,
            validUntil: content.validUntil,
            paymentTerms: content.paymentTerms,
            termsNote: content.termsNote,
            deposit: content.deposit
        },
        scope: content.scope,
        internalNotes: "",
        paymentLink: content.paymentLink ?? ""
    });
    return {
        snapshotHash,
        pending: null,
        values,
        activeOwner: activeOwner ? row.ownerId : null
    };
}
async function readEstimateDraftActionReviewInTransaction(trx, context, operation, estimateId) {
    const loaded = await loadEstimateLifecycleContext(trx, context, estimateId);
    if (operation === "revise" && !loaded.canRevise) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = loaded.row;
    const prepared = operation === "revise" ? await revisionDraftReview(trx, context, loaded) : {
        ...await duplicateDraftReview(trx, context, estimateId),
        pending: null,
        snapshotHash: null,
        activeOwner: null
    };
    const parent = await parentRecord(trx, context, row.parentType, row.parentType === "lead" ? row.leadId : row.jobId, !prepared.pending);
    const parentRow = await trx(parent.type === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: parent.id
    }).first("version");
    if (!parentRow) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { values, totals } = validateValues(prepared.values);
    for (const item of values.items){
        if (!item.unit) delete item.unit;
    }
    if (!prepared.pending) {
        await validateOwner(trx, context, values.details.ownerId, operation === "revise" ? prepared.activeOwner : context.membership.role === "field" ? context.userId : null);
        const catalog = await validateCatalogItems(trx, context, values);
        for (const item of values.items){
            if (item.catalog) {
                const current = catalog.get(item.catalog.id);
                if (!current) throw new EstimateDraftValidationError("A selected material is no longer available.");
                item.catalog = {
                    id: item.catalog.id,
                    ...current
                };
            }
        }
    }
    const counter = operation === "revise" && !prepared.pending ? await trx("workspaceEstimateRevisionCounters").where({
        workspaceId: context.workspaceId,
        estimateNumber: row.estimateNumber
    }).first("lastRevision") : null;
    if (operation === "revise" && !prepared.pending && !counter) throw new EstimateDraftConflictError("The revision counter is unavailable.");
    return {
        source: {
            id: row.id,
            version: row.version,
            number: numberLabel(row.estimateNumber),
            revision: row.revision,
            name: row.name,
            status: loaded.status,
            archived: row.archivedAt !== null
        },
        parent: {
            type: parent.type,
            id: parent.id,
            version: Number(parentRow.version),
            number: parent.number,
            name: parent.name
        },
        plan: {
            kind: prepared.pending ? "reuse" : "create",
            revision: prepared.pending?.revision ?? (counter ? Number(counter.lastRevision) + 1 : 1),
            existingDraft: prepared.pending ? {
                id: prepared.pending.id,
                version: prepared.pending.version
            } : null
        },
        values,
        totalCents: values.items.length ? totals.totalCents : null,
        snapshotHash: prepared.snapshotHash
    };
}
async function readEstimateRevisionFamily(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$revision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateRevisionsQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const { row, status, canRevise, today } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
        const query = applyEstimateReadScope(trx("estimates as e").where({
            "e.workspaceId": context.workspaceId,
            "e.estimateNumber": row.estimateNumber
        }), trx, context, estimateReadScope(context));
        const total = Number((await query.clone().count({
            count: "*"
        }).first()).count);
        if (input.beforeRevision) query.where("e.revision", "<", input.beforeRevision);
        const rows = await query.select("e.*").orderBy("e.revision", "desc").limit(26);
        const page = rows.slice(0, 25);
        const snapshotIds = [
            ...new Set([
                ...page.filter((value)=>value.status !== "draft").map((value)=>value.id),
                ...row.status !== "draft" ? [
                    row.id
                ] : []
            ])
        ];
        const snapshots = snapshotIds.length ? await trx("estimate_snapshots").where({
            workspaceId: context.workspaceId
        }).whereIn("estimateId", snapshotIds) : [];
        const byEstimate = new Map(snapshots.map((value)=>[
                value.estimateId,
                value
            ]));
        const revisions = page.map((value)=>({
                id: value.id,
                revision: value.revision,
                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateStatusAtDate"])(value.status, dateOnly(value.validUntil), today),
                archived: value.archivedAt !== null,
                totalCents: value.status === "draft" ? safeCents(value.totalCents) : checkedRevisionSnapshot(value, byEstimate.get(value.id)).snapshot.amounts.totalCents,
                href: `/estimates/${encodeURIComponent(value.id)}?workspace=${encodeURIComponent(context.workspaceId)}`
            }));
        return {
            number: numberLabel(row.estimateNumber),
            currentEstimateId: row.id,
            version: row.version,
            snapshotHash: row.status === "draft" ? null : checkedRevisionSnapshot(row, byEstimate.get(row.id)).snapshotHash,
            canRevise: canRevise && !row.archivedAt && [
                "sent",
                "published",
                "declined",
                "expired"
            ].includes(status),
            revisions,
            total,
            nextBeforeRevision: rows.length > 25 ? page.at(-1).revision : null
        };
    });
}
async function loadEstimateRevisionSharingReview(trx, context, estimateId, requireSend = true) {
    const { row } = await accessibleEstimate(trx, context, estimateId);
    if (!row.sourceEstimateId || row.status !== "draft") return null;
    const source = await loadEstimateLifecycleContext(trx, context, row.sourceEstimateId);
    const { job } = await accessibleEstimate(trx, context, source.row.id);
    if (requireSend) permit(context, "estimates.send", estimateResource(source.row, job));
    if (source.row.archivedAt || ![
        "sent",
        "published",
        "declined",
        "expired"
    ].includes(source.status) || source.row.estimateNumber !== row.estimateNumber || source.row.revision >= row.revision) {
        throw new EstimateDraftValidationError("The previous revision can no longer be replaced. Reload its current status.");
    }
    const { snapshot } = await revisionSnapshot(trx, source.row);
    return {
        sourceEstimateId: source.row.id,
        sourceVersion: source.row.version,
        sourceRevision: source.row.revision,
        sourceStatus: source.status,
        requiresPaymentLinkReview: !!row.paymentLink && row.paymentLink === snapshot.content.paymentLink
    };
}
function validateEstimateRevisionConfirmation(review, confirmation) {
    if (!review) {
        if (confirmation) throw new EstimateDraftValidationError("This Draft is not a revision.");
        return;
    }
    if (!confirmation || confirmation.sourceEstimateId !== review.sourceEstimateId || confirmation.sourceVersion !== review.sourceVersion) {
        throw new EstimateDraftConflictError("The previous revision changed. Reload and review before replacing it.");
    }
    if (review.requiresPaymentLinkReview && !confirmation.paymentLinkReviewed) {
        throw new EstimateDraftValidationError("Review the carried payment link against this revision before sharing.");
    }
}
async function assertEstimateDraftDeletable(trx, context, row, job) {
    permit(context, "estimates.delete", estimateResource(row, job));
    if (row.status !== "draft" || row.archivedAt !== null || row.sentAt || row.publishedAt || await trx("estimate_snapshots").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).first("id")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
}
async function readEstimateDraftDeletionReviewInTransaction(trx, context, estimateId) {
    const { row, job } = await accessibleEstimate(trx, context, estimateId);
    await assertEstimateDraftDeletable(trx, context, row, job);
    const { parent } = await readEstimateParentInTransaction(trx, context, row.parentType, row.parentType === "lead" ? row.leadId : row.jobId);
    const parentRow = await trx(parent.type === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: parent.id
    }).first("version");
    if (!parentRow) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        estimate: {
            id: row.id,
            version: row.version,
            number: numberLabel(row.estimateNumber),
            revision: row.revision
        },
        review: {
            name: row.name,
            recipientName: row.recipientName,
            parent: {
                type: parent.type,
                id: parent.id,
                version: Number(parentRow.version),
                number: parent.number,
                name: parent.name
            }
        }
    };
}
async function deleteEstimateDraftInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deleteEstimateDraftSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { row, job } = await accessibleEstimate(trx, context, input.estimateId, true);
    await assertEstimateDraftDeletable(trx, context, row, job);
    if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
    if (input.typedConfirmation !== numberLabel(row.estimateNumber)) {
        throw new EstimateDraftValidationError("Type the estimate number exactly to delete this Draft.");
    }
    await trx("estimate_operation_receipts").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).update({
        estimateId: null
    });
    const [deleted] = await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: row.id,
        version: input.expectedVersion
    }).delete().returning([
        "id",
        "estimateNumber",
        "revision",
        "version"
    ]);
    if (!deleted) throw new EstimateDraftConflictError();
    return {
        estimateId: deleted.id,
        number: numberLabel(Number(deleted.estimateNumber)),
        revision: Number(deleted.revision),
        version: Number(deleted.version)
    };
}
async function deleteEstimateDraft(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deleteEstimateDraftSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const deleted = await deleteEstimateDraftInTransaction(trx, context, input);
        return {
            id: deleted.estimateId
        };
    });
}
}),
"[project]/packages/data/src/estimates/read.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateCreationAvailability",
    ()=>estimateCreationAvailability,
    "estimateEffectiveStatus",
    ()=>estimateEffectiveStatus,
    "filteredEstimateQuery",
    ()=>filteredEstimateQuery,
    "readEstimateAgingForChat",
    ()=>readEstimateAgingForChat,
    "readEstimateCustomerParents",
    ()=>readEstimateCustomerParents,
    "readEstimateCustomerSources",
    ()=>readEstimateCustomerSources,
    "readEstimates",
    ()=>readEstimates,
    "readEstimatesForChat",
    ()=>readEstimatesForChat,
    "readRelatedEstimates",
    ()=>readRelatedEstimates,
    "scopedEstimateQuery",
    ()=>scopedEstimateQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$related$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-related.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/state.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
;
;
;
;
;
const estimateEffectiveStatus = `CASE
  WHEN e.status IN ('sent','published')
    AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
  THEN 'expired'
  ELSE e.status
END`;
function hasLatestRevision(query, trx) {
    query.whereNotExists(trx("estimates as newer").select(trx.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId"
          AND newer."estimateNumber" = e."estimateNumber"
          AND newer.revision > e.revision`));
    return query;
}
function scopedEstimateQuery(trx, context, scope) {
    const query = trx("estimates as e").leftJoin("leads as l", function joinLead() {
        this.on("l.workspaceId", "e.workspaceId").andOn("l.id", "e.leadId");
    }).leftJoin("jobs as j", function joinJob() {
        this.on("j.workspaceId", "e.workspaceId").andOn("j.id", "e.jobId");
    }).leftJoin("customers as c", function joinCustomer() {
        this.on("c.workspaceId", "e.workspaceId").andOn("c.id", trx.raw('COALESCE(l."customerId", j."customerId")'));
    }).leftJoin("users as u", "u.id", "e.ownerId").join("workspaces as w", "w.id", "e.workspaceId").where("e.workspaceId", context.workspaceId);
    if (scope === "assigned_job") {
        query.where("e.parentType", "job").whereExists(trx("jobs as scoped_job").select(trx.raw("1")).whereRaw(`scoped_job."workspaceId" = e."workspaceId"
              AND scoped_job.id = e."jobId"`).andWhere((assigned)=>assigned.where("scoped_job.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as scoped_team").select(trx.raw("1")).whereRaw(`scoped_team."workspaceId" = scoped_job."workspaceId"
                      AND scoped_team."jobId" = scoped_job.id`).where("scoped_team.userId", context.userId))));
    }
    return query;
}
function visibleQuery(trx, context, scope, includeHidden) {
    const query = scopedEstimateQuery(trx, context, scope);
    if (!includeHidden) {
        query.whereNull("e.archivedAt").whereNot("e.status", "superseded");
        hasLatestRevision(query, trx);
    }
    return query;
}
function filteredEstimateQuery(trx, context, scope, input) {
    const query = visibleQuery(trx, context, scope, input.includeHidden);
    if (input.status !== "all") query.whereRaw(`${estimateEffectiveStatus} = ?`, [
        input.status
    ]);
    if (input.parent !== "all") query.where("e.parentType", input.parent);
    if (input.owner === "me") query.where("e.ownerId", context.userId);
    else if (input.owner === "unassigned") query.whereNull("e.ownerId");
    else if (input.owner !== "all") query.where("e.ownerId", input.owner);
    if (input.quickFilter === "awaiting") {
        query.whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`);
    } else if (input.quickFilter === "expiring") {
        query.whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`).whereRaw(`e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
          AND (now() AT TIME ZONE w.timezone)::date + 7`);
    }
    if (input.q) {
        const term = input.q.toLocaleLowerCase("en-US");
        query.andWhere((search)=>search.whereRaw("position(? in lower(e.name)) > 0", [
                term
            ]).orWhereRaw(`position(? in lower('EST-' || lpad(e."estimateNumber"::text, 4, '0'))) > 0`, [
                term
            ]).orWhereRaw("position(? in lower(COALESCE(c.name, l.name, j.\"customerName\", ''))) > 0", [
                term
            ]).orWhereRaw("position(? in lower(COALESCE(l.service, j.service, ''))) > 0", [
                term
            ]).orWhereRaw("position(? in lower(COALESCE(e.\"leadId\", e.\"jobId\")::text)) > 0", [
                term
            ]));
    }
    return query;
}
async function assistantTotals(query, trx) {
    const row = await query.clone().select(trx.raw(`
    COUNT(*)::text AS count,
    CASE WHEN COUNT(e."totalCents") = COUNT(*)
      AND COALESCE(SUM(e."totalCents"), 0) <= 9007199254740991
      THEN COALESCE(SUM(e."totalCents"), 0)::text ELSE NULL END AS "totalCents"
  `)).first();
    if (!row) throw new Error("Estimate assistant totals are unavailable.");
    return {
        total: safeInteger(row.count, "assistant result count"),
        totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "assistant matching total")
    };
}
async function assistantClock(trx, workspaceId) {
    const row = await trx("workspaces").where({
        id: workspaceId
    }).select("timezone", trx.raw(`to_char((now() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`), trx.raw(`now() AS "retrievedAt"`)).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        timezone: row.timezone,
        today: row.today,
        retrievedAt: timestamp(row.retrievedAt)
    };
}
async function readEstimatesForChat(db, identity, enabled, raw, exact) {
    const filters = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatFilterSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!scope.allowed || ![
            "workspace",
            "assigned_job"
        ].includes(scope.scope)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        if (filters.includeHidden && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.archive").allowed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        const readScope = scope.scope;
        const listInput = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateListQuerySchema"].parse({
            workspaceId: context.workspaceId,
            q: exact ? "" : filters.query,
            status: filters.status,
            owner: filters.owner,
            parent: filters.parent,
            includeHidden: filters.includeHidden,
            quickFilter: filters.quickFilter,
            sort: "updatedAt",
            direction: "desc",
            page: 1,
            pageSize: 25
        });
        const query = filteredEstimateQuery(trx, context, readScope, listInput);
        if (exact?.estimateId) query.where("e.id", exact.estimateId);
        if (exact?.estimateNumber !== undefined) {
            query.where("e.estimateNumber", exact.estimateNumber);
        }
        if (filters.customer) {
            query.whereRaw("position(? in lower(COALESCE(c.name, l.name, j.\"customerName\", ''))) > 0", [
                filters.customer.toLocaleLowerCase("en-US")
            ]);
        }
        if (filters.minTotalCents !== null) {
            query.where("e.totalCents", ">=", filters.minTotalCents);
        }
        if (filters.maxTotalCents !== null) {
            query.where("e.totalCents", "<=", filters.maxTotalCents);
        }
        if (filters.validUntilFrom) {
            query.where("e.validUntil", ">=", filters.validUntilFrom);
        }
        if (filters.validUntilTo) {
            query.where("e.validUntil", "<=", filters.validUntilTo);
        }
        const totals = await assistantTotals(query, trx);
        const rows = await query.clone().select("e.id", "e.estimateNumber", "e.revision", "e.name", "e.parentType", "e.leadId", "e.jobId", "e.archivedAt", "e.totalCents", "e.updatedAt", "u.name as ownerName", trx.raw(`${estimateEffectiveStatus} as status`), trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') as "validUntil"`), trx.raw(`COALESCE(c.name, l.name, j."customerName", '') as customer`), trx.raw(`CASE WHEN e."parentType" = 'lead'
            THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
            ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
          END as "parentNumber"`)).orderBy("e.updatedAt", "desc").orderBy("e.id", "asc").limit(filters.limit);
        return {
            type: "estimates-result",
            untrusted: true,
            scope: readScope,
            ...await assistantClock(trx, context.workspaceId),
            ...totals,
            truncated: totals.total > rows.length,
            estimates: rows.map((row)=>({
                    id: row.id,
                    number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
                    revision: safeInteger(row.revision, "revision"),
                    name: row.name,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.status),
                    customer: row.customer,
                    parent: row.parentNumber,
                    parentType: row.parentType,
                    parentId: row.parentType === "lead" ? row.leadId : row.jobId,
                    archived: row.archivedAt !== null,
                    owner: row.ownerName ?? null,
                    totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
                    validUntil: row.validUntil ?? null,
                    updatedAt: timestamp(row.updatedAt)
                }))
        };
    });
}
async function readEstimateAgingForChat(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatAgingInputSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!scope.allowed || ![
            "workspace",
            "assigned_job"
        ].includes(scope.scope)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        const readScope = scope.scope === "workspace" ? "workspace" : "assigned_job";
        const visible = visibleQuery(trx, context, readScope, false);
        const queryRows = async (query, orderExpression, extraColumn)=>{
            const totals = await assistantTotals(query, trx);
            const rows = await query.clone().select("e.id", "e.estimateNumber", "e.revision", "e.name", "e.parentType", "e.leadId", "e.jobId", "e.archivedAt", "e.totalCents", "u.name as ownerName", trx.raw(`${estimateEffectiveStatus} as status`), trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') as "validUntil"`), trx.raw(`COALESCE(c.name, l.name, j."customerName", '') as customer`), trx.raw(`CASE WHEN e."parentType" = 'lead'
              THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
              ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
            END as "parentNumber"`), ...extraColumn ? [
                extraColumn
            ] : []).orderByRaw(`${orderExpression} ASC`).orderBy("e.id", "asc").limit(input.limit);
            return {
                ...totals,
                truncated: totals.total > rows.length,
                estimates: rows.map((row)=>({
                        id: row.id,
                        number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
                        revision: safeInteger(row.revision, "revision"),
                        name: row.name,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.status),
                        customer: row.customer,
                        parent: row.parentNumber,
                        parentType: row.parentType,
                        parentId: row.parentType === "lead" ? row.leadId : row.jobId,
                        archived: row.archivedAt !== null,
                        owner: row.ownerName ?? null,
                        totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
                        validUntil: row.validUntil ?? null,
                        ...row.waitingDays === undefined ? {} : {
                            waitingDays: safeInteger(row.waitingDays, "waiting days")
                        },
                        ...row.daysUntilExpiry === undefined ? {} : {
                            daysUntilExpiry: safeInteger(row.daysUntilExpiry, "days until expiry")
                        }
                    }))
            };
        };
        const waitingQuery = visible.clone().whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`).whereRaw(`COALESCE(e."sentAt", e."publishedAt") IS NOT NULL
          AND (COALESCE(e."sentAt", e."publishedAt") AT TIME ZONE w.timezone)::date
            < ((now() AT TIME ZONE w.timezone)::date - ?::int)`, [
            input.waitingDays
        ]);
        const waiting = await queryRows(waitingQuery, `COALESCE(e."sentAt", e."publishedAt")`, trx.raw(`((now() AT TIME ZONE w.timezone)::date -
          (COALESCE(e."sentAt", e."publishedAt") AT TIME ZONE w.timezone)::date)
          AS "waitingDays"`));
        const expiringQuery = visible.clone().whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`).whereRaw(`e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
          AND (now() AT TIME ZONE w.timezone)::date + ?::int`, [
            input.expiringWithinDays
        ]);
        const expiring = await queryRows(expiringQuery, `e."validUntil"`, trx.raw(`e."validUntil" - (now() AT TIME ZONE w.timezone)::date AS "daysUntilExpiry"`));
        const acceptedWithoutJobQuery = visible.clone().where("e.status", "accepted").where("e.parentType", "lead").whereNotExists(trx("jobs as linked_job").select(trx.raw("1")).whereRaw(`linked_job."workspaceId" = e."workspaceId"
              AND linked_job."sourceLeadId" = e."leadId"`));
        const acceptedWithoutJob = await queryRows(acceptedWithoutJobQuery, `COALESCE(e."decidedAt", e."updatedAt")`, null);
        return {
            type: "estimates-aging-result",
            untrusted: true,
            scope: readScope,
            ...await assistantClock(trx, context.workspaceId),
            waitingDays: input.waitingDays,
            expiringWithinDays: input.expiringWithinDays,
            waiting,
            expiring,
            acceptedWithoutJob
        };
    });
}
function safeInteger(value, name) {
    const result = Number(value);
    if (!Number.isSafeInteger(result)) {
        throw new Error(`Estimate ${name} is outside the safe integer range.`);
    }
    return result;
}
function timestamp(value) {
    const result = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(result.getTime())) {
        throw new Error("Estimate record contains an invalid timestamp.");
    }
    return result.toISOString();
}
async function estimateCreationScope(trx, context) {
    const direct = {
        kind: "estimate",
        id: context.workspaceId,
        workspaceId: context.workspaceId,
        job: null
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "estimates.create",
        resource: direct
    }).allowed) {
        return {
            workspace: true,
            assignedJob: true
        };
    }
    if (!context.enabledPermissions.includes("estimates.create")) {
        return {
            workspace: false,
            assignedJob: false
        };
    }
    const job = await trx("jobs as j").select("j.id", "j.workspaceId", "j.primaryOwnerId as ownerId", trx.raw(`(
        SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[])
        FROM "jobTeamMembers" t
        WHERE t."workspaceId" = j."workspaceId" AND t."jobId" = j.id
      ) AS "teamUserIds"`)).where("j.workspaceId", context.workspaceId).andWhere((assigned)=>assigned.where("j.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw(`jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id`).where("jt.userId", context.userId))).first();
    if (!job) return {
        workspace: false,
        assignedJob: false
    };
    const assignedJob = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "estimates.create",
        resource: {
            kind: "estimate",
            id: job.id,
            workspaceId: context.workspaceId,
            job: {
                kind: "job",
                id: job.id,
                workspaceId: context.workspaceId,
                ownerId: job.ownerId,
                teamUserIds: job.teamUserIds
            }
        }
    }).allowed;
    return {
        workspace: false,
        assignedJob
    };
}
function estimateCreationAvailability(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, (trx, context)=>estimateCreationScope(trx, context));
}
function readableParents(trx, context, type, assignedOnly = false) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, type === "lead" ? "leads.read" : "jobs.read");
    const query = trx(type === "lead" ? "leads as p" : "jobs as p").where("p.workspaceId", context.workspaceId);
    if (!scope.allowed || ![
        "workspace",
        "assigned"
    ].includes(scope.scope)) {
        return query.whereRaw("false");
    }
    if (scope.scope === "assigned" || assignedOnly) {
        if (type === "lead") query.where("p.ownerId", context.userId);
        else query.andWhere((assigned)=>assigned.where("p.primaryOwnerId", context.userId).orWhereExists(trx("jobTeamMembers as pt").select(trx.raw("1")).whereRaw(`pt."workspaceId" = p."workspaceId" AND pt."jobId" = p.id`).where("pt.userId", context.userId)));
    }
    return query;
}
async function customerCreationQueries(trx, context, customerId) {
    const customer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCustomerRecordInTransaction"])(trx, context, customerId);
    const creation = await estimateCreationScope(trx, context);
    const read = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    const lead = readableParents(trx, context, "lead").where("p.customerId", customerId).whereNull("p.archivedAt");
    const job = readableParents(trx, context, "job", !creation.workspace || read.allowed && read.scope === "assigned_job").where("p.customerId", customerId);
    if (customer.archived || !creation.workspace || !read.allowed || read.scope !== "workspace") lead.whereRaw("false");
    if (customer.archived || !creation.workspace && !creation.assignedJob) job.whereRaw("false");
    return {
        lead,
        job
    };
}
function readEstimateCustomerSources(db, identity, enabled, customerId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!scope.allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const queries = await customerCreationQueries(trx, context, customerId);
        return {
            canReadLeads: !!await queries.lead.select("p.id").first(),
            canReadJobs: !!await queries.job.select("p.id").first()
        };
    });
}
async function readEstimateCustomerParents(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$related$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCustomerParentsQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!scope.allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const queries = await customerCreationQueries(trx, context, input.customerId);
        const lead = input.type === "lead";
        const query = lead ? queries.lead : queries.job;
        if (input.q) {
            const term = input.q.toLocaleLowerCase("en-US");
            query.andWhere((search)=>search.whereRaw(`position(? in lower(p.${lead ? "name" : "title"})) > 0`, [
                    term
                ]).orWhereRaw(`position(? in lower(p.service)) > 0`, [
                    term
                ]).orWhereRaw(`position(? in lower(? || lpad(p."${lead ? "leadNumber" : "jobNumber"}"::text, 4, '0'))) > 0`, [
                    term,
                    lead ? "LD-" : "J-"
                ]));
        }
        const rows = await query.select("p.id", `p.${lead ? "leadNumber" : "jobNumber"} as number`, `p.${lead ? "name" : "title"} as name`, "p.service as detail", `p.${lead ? "stage" : "status"} as status`).orderBy(lead ? "p.leadNumber" : "p.jobNumber", "desc").orderBy("p.id").limit(50);
        return rows.map((row)=>({
                id: row.id,
                number: `${lead ? "LD-" : "J-"}${String(row.number).padStart(4, "0")}`,
                name: row.name,
                detail: row.detail,
                status: row.status
            }));
    });
}
async function readRelatedEstimates(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$related$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relatedEstimatesQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!access.allowed || ![
            "workspace",
            "assigned_job"
        ].includes(access.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const scope = access.scope;
        const query = visibleQuery(trx, context, scope, input.includeHidden);
        let canCreate;
        if (input.recordType === "customer") {
            const creation = await customerCreationQueries(trx, context, input.recordId);
            canCreate = !!await creation.lead.select("p.id").first() || !!await creation.job.select("p.id").first();
            query.where("c.id", input.recordId).andWhere((parents)=>parents.whereExists(readableParents(trx, context, "lead").select(trx.raw("1")).whereRaw(`p.id = e."leadId"`)).orWhereExists(readableParents(trx, context, "job").select(trx.raw("1")).whereRaw(`p.id = e."jobId"`)));
        } else {
            const parent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateParentInTransaction"])(trx, context, input.recordType, input.recordId);
            canCreate = parent.canCreate;
            query.where(input.recordType === "lead" ? "e.leadId" : "e.jobId", input.recordId);
        }
        const count = await query.clone().count({
            count: "*"
        }).select(trx.raw(`md5(coalesce(string_agg(e.id::text || ':' || e.version::text || ':' || (${estimateEffectiveStatus}), ',' ORDER BY e.id), '')) as "readVersion"`)).first();
        if (!count) throw new Error("Related estimate count is unavailable.");
        const total = safeInteger(count.count, "related count");
        const pageSize = 10;
        const page = Math.min(input.page, Math.max(1, Math.ceil(total / pageSize)));
        const rows = await query.select("e.id", "e.estimateNumber", "e.revision", "e.name", "e.totalCents", "e.archivedAt", "e.parentType", "l.leadNumber", "j.jobNumber", trx.raw(`${estimateEffectiveStatus} as status`)).orderBy("e.updatedAt", "desc").orderBy("e.id").limit(pageSize).offset((page - 1) * pageSize);
        return {
            total,
            page,
            pageSize,
            canCreate,
            readVersion: count.readVersion,
            rows: rows.map((row)=>({
                    id: row.id,
                    number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
                    revision: row.revision,
                    name: row.name,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.status),
                    totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
                    archived: row.archivedAt !== null,
                    href: `/estimates/${encodeURIComponent(row.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
                    parent: {
                        type: row.parentType,
                        number: `${row.parentType === "lead" ? "LD-" : "J-"}${String(row.parentType === "lead" ? row.leadNumber : row.jobNumber).padStart(4, "0")}`
                    }
                }))
        };
    });
}
async function listOwners(trx, context, scope) {
    const query = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt");
    if (scope === "assigned_job") query.where("m.userId", context.userId);
    const members = await query.select("m.userId as id", "u.name").orderBy("u.name").orderBy("m.userId").limit(200);
    const counts = await visibleQuery(trx, context, scope, false).whereNotNull("e.ownerId").whereRaw(`${estimateEffectiveStatus} IN ('draft','sent','published')`).groupBy("e.ownerId").select(trx.raw(`e."ownerId"::text AS "ownerId", COUNT(e.id)::text AS count`));
    const countByOwner = new Map(counts.map((row)=>[
            row.ownerId,
            safeInteger(row.count, "owner count")
        ]));
    return members.map((member)=>({
            id: member.id,
            name: member.name,
            openEstimateCount: countByOwner.get(member.id) ?? 0
        }));
}
async function listMetrics(trx, context, scope) {
    const row = await hasLatestRevision(scopedEstimateQuery(trx, context, scope).whereNull("e.archivedAt").whereNot("e.status", "superseded"), trx).select(trx.raw(`COUNT(*) FILTER (        WHERE ${estimateEffectiveStatus} IN ('sent','published'))::text AS "awaitingCount"`), trx.raw(`COALESCE(SUM(e."totalCents") FILTER (WHERE ${estimateEffectiveStatus} IN ('draft','sent','published')), 0)::text AS "openValueCents"`), trx.raw(`COUNT(*) FILTER (
          WHERE ${estimateEffectiveStatus} = 'accepted'
            AND e."decidedAt" >= date_trunc('month', now() AT TIME ZONE w.timezone) AT TIME ZONE w.timezone
            AND e."decidedAt" < date_trunc('month', (now() AT TIME ZONE w.timezone) + interval '1 month') AT TIME ZONE w.timezone
        )::text AS "acceptedThisMonthCount"`), trx.raw(`COALESCE(SUM(COALESCE(e."acceptedTotalCents", e."totalCents")) FILTER (
          WHERE ${estimateEffectiveStatus} = 'accepted'
            AND e."decidedAt" >= date_trunc('month', now() AT TIME ZONE w.timezone) AT TIME ZONE w.timezone
            AND e."decidedAt" < date_trunc('month', (now() AT TIME ZONE w.timezone) + interval '1 month') AT TIME ZONE w.timezone
        ), 0)::text AS "acceptedThisMonthCents"`), trx.raw(`COUNT(*) FILTER (
          WHERE ${estimateEffectiveStatus} IN ('sent','published')
            AND e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
              AND (now() AT TIME ZONE w.timezone)::date + 7
        )::text AS "expiringInSevenDaysCount"`)).first();
    return {
        awaitingCount: safeInteger(row?.awaitingCount ?? 0, "awaiting count"),
        openValueCents: String(row?.openValueCents ?? "0"),
        acceptedThisMonthCount: safeInteger(row?.acceptedThisMonthCount ?? 0, "accepted count"),
        acceptedThisMonthCents: String(row?.acceptedThisMonthCents ?? "0"),
        expiringInSevenDaysCount: safeInteger(row?.expiringInSevenDaysCount ?? 0, "expiring count")
    };
}
function rowDto(row, today) {
    const validUntil = row.validUntil;
    const status = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateStatusAtDate"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateStatusSchema"].parse(row.status), validUntil, today));
    const estimateNumber = safeInteger(row.estimateNumber, "number");
    return {
        id: row.id,
        number: `EST-${String(estimateNumber).padStart(4, "0")}`,
        estimateNumber,
        revision: safeInteger(row.revision, "revision"),
        name: row.name,
        customerName: row.customerName,
        service: row.service,
        status,
        totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
        parentType: row.parentType,
        parentId: row.parentId,
        parentNumber: row.parentNumber,
        ownerId: row.ownerId ?? null,
        ownerName: row.ownerName ?? null,
        validUntil,
        updatedAt: timestamp(row.updatedAt),
        decidedAt: row.decidedAt ? timestamp(row.decidedAt) : null,
        archived: row.archivedAt !== null,
        version: safeInteger(row.version, "version")
    };
}
async function readEstimates(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateListQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
        if (!scope.allowed || ![
            "workspace",
            "assigned_job"
        ].includes(scope.scope)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        const readScope = scope.scope;
        const workspace = await trx("workspaces").where({
            id: context.workspaceId
        }).select("timezone", trx.raw(`to_char((now() AT TIME ZONE "timezone")::date, 'YYYY-MM-DD') AS today`)).first();
        if (!workspace) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const filtered = filteredEstimateQuery(trx, context, readScope, input);
        const totalRow = await filtered.clone().countDistinct({
            count: "e.id"
        }).first();
        const total = safeInteger(totalRow?.count ?? 0, "result count");
        const scopeTotalRow = await scopedEstimateQuery(trx, context, readScope).countDistinct({
            count: "e.id"
        }).first();
        const scopeTotal = safeInteger(scopeTotalRow?.count ?? 0, "authorized scope count");
        const sortColumn = {
            updatedAt: 'e."updatedAt"',
            totalCents: 'e."totalCents"',
            validUntil: 'e."validUntil"',
            estimateNumber: 'e."estimateNumber"'
        };
        const direction = input.direction === "asc" ? "ASC" : "DESC";
        const nulls = input.sort === "validUntil" || input.sort === "totalCents" ? " NULLS LAST" : "";
        const rows = await filtered.clone().select("e.id", "e.estimateNumber", "e.revision", "e.name", "e.parentType", "e.ownerId", "u.name as ownerName", "e.version", "e.totalCents", "e.decidedAt", "e.archivedAt", "e.updatedAt", "j.id as jobResourceId", "j.primaryOwnerId as jobOwnerId", "l.ownerId as leadOwnerId", "l.archivedAt as leadArchivedAt", trx.raw(`EXISTS (
            SELECT 1 FROM "jobTeamMembers" AS team
            WHERE team."workspaceId" = e."workspaceId"
              AND team."jobId" = j.id AND team."userId" = ?
          ) AS "viewerOnJobTeam"`, [
            context.userId
        ]), trx.raw(`${estimateEffectiveStatus} AS status`), trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`), trx.raw(`COALESCE(c.name, l.name, j."customerName", '') AS "customerName"`), trx.raw(`COALESCE(l.service, j.service, '') AS service`), trx.raw(`COALESCE(e."leadId", e."jobId")::text AS "parentId"`), trx.raw(`CASE WHEN e."parentType" = 'lead'
              THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
              ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
            END AS "parentNumber"`)).orderByRaw(`${sortColumn[input.sort]} ${direction}${nulls}, e.id ASC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
        const canExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.export").allowed;
        const creationScope = await estimateCreationScope(trx, context);
        return {
            rows: rows.map((row)=>{
                const job = row.jobResourceId ? {
                    kind: "job",
                    id: row.jobResourceId,
                    workspaceId: context.workspaceId,
                    ownerId: row.jobOwnerId,
                    teamUserIds: row.viewerOnJobTeam ? [
                        context.userId
                    ] : []
                } : null;
                const resource = {
                    kind: "estimate",
                    id: row.id,
                    workspaceId: context.workspaceId,
                    job
                };
                const canCreate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "estimates.create",
                    resource
                }).allowed;
                const dto = rowDto(row, workspace.today);
                const parentReadable = row.parentType === "job" ? !!job && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "jobs.read",
                    resource: job
                }).allowed : row.leadArchivedAt === null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "leads.read",
                    resource: {
                        kind: "lead",
                        id: row.parentId,
                        workspaceId: context.workspaceId,
                        ownerId: row.leadOwnerId
                    }
                }).allowed;
                return {
                    ...dto,
                    canDuplicate: canCreate && parentReadable,
                    canRevise: canCreate && !dto.archived && [
                        "sent",
                        "published",
                        "declined",
                        "expired"
                    ].includes(dto.status) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                        permission: "estimates.update",
                        resource
                    }).allowed,
                    canDelete: !dto.archived && dto.status === "draft" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                        permission: "estimates.delete",
                        resource
                    }).allowed
                };
            }),
            total,
            scopeTotal,
            page: input.page,
            pageSize: input.pageSize,
            timezone: workspace.timezone,
            scope: readScope,
            policyRevision: context.policy.revision,
            canCreate: creationScope.workspace || creationScope.assignedJob,
            canExport,
            canVoid: rows.some((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "estimates.void",
                    resource: {
                        kind: "estimate",
                        id: row.id,
                        workspaceId: context.workspaceId,
                        job: null
                    }
                }).allowed),
            canArchive: rows.some((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: "estimates.archive",
                    resource: {
                        kind: "estimate",
                        id: row.id,
                        workspaceId: context.workspaceId,
                        job: null
                    }
                }).allowed),
            owners: await listOwners(trx, context, readScope),
            metrics: await listMetrics(trx, context, readScope)
        };
    });
}
}),
"[project]/packages/data/src/estimates/history.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "projectEstimateActivity",
    ()=>projectEstimateActivity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
;
;
function projectEstimateActivity(row) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateActivityChangesSchema"].safeParse(row.changes);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The estimate history contains invalid activity. Reload and try again.");
    const changes = [];
    if (parsed.data.status) changes.push({
        kind: "status",
        ...parsed.data.status
    });
    if (parsed.data.revision) changes.push({
        kind: "revision",
        ...parsed.data.revision
    });
    if (parsed.data.convertedJob) changes.push({
        kind: "converted-job",
        number: parsed.data.convertedJob.number
    });
    for (const field of new Set(parsed.data.fields ?? []))changes.push({
        kind: "field",
        field
    });
    const source = row.source === "worker" ? {
        type: "worker"
    } : row.source === "assistant-confirmed" ? {
        type: "chat",
        actorName: row.actorName
    } : row.source === "ui" || row.source === "system" ? {
        type: row.source,
        actorName: row.actorName
    } : null;
    if (!source) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The estimate history contains an unsupported activity source.");
    const base = {
        id: row.id,
        createdAt: new Date(row.createdAt).toISOString(),
        source,
        changes
    };
    switch(row.type){
        case "created":
            return {
                ...base,
                kind: "created"
            };
        case "draft.saved":
            return {
                ...base,
                kind: "updated"
            };
        case "sent":
            return {
                ...base,
                kind: "sent"
            };
        case "published":
            return {
                ...base,
                kind: "published"
            };
        case "revision-created":
            return {
                ...base,
                kind: "revision-created"
            };
        case "superseded":
            return {
                ...base,
                kind: "superseded"
            };
        case "expired":
            return {
                ...base,
                kind: "expired"
            };
        case "archived":
            return {
                ...base,
                kind: "archived"
            };
        case "restored":
            return {
                ...base,
                kind: "restored"
            };
        case "resent":
            return {
                ...base,
                kind: "delivery-queued"
            };
        case "email-sent":
            return {
                ...base,
                kind: "delivery-sent"
            };
        case "delivery-failed":
            return {
                ...base,
                kind: "delivery-failed"
            };
        case "viewed":
            return {
                ...base,
                kind: "viewed"
            };
        case "decision-recorded":
            if (!parsed.data.decision) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The decision history is missing its recorded details.");
            }
            return {
                ...base,
                kind: "decision-recorded",
                ...parsed.data.decision
            };
        case "decision-corrected":
            if (!parsed.data.decision || !parsed.data.reason) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The correction history is missing its recorded details or reason.");
            }
            return {
                ...base,
                kind: "decision-corrected",
                ...parsed.data.decision,
                reason: parsed.data.reason
            };
        case "converted":
            if (!parsed.data.convertedJob) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The conversion history is missing its Job reference.");
            }
            return {
                ...base,
                kind: "converted"
            };
        case "voided":
            if (!parsed.data.reason) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The withdrawal history is missing its reason.");
            return {
                ...base,
                kind: "voided",
                reason: parsed.data.reason
            };
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The estimate history contains an unsupported activity type.");
    }
}
}),
"[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateChatEvidenceAllowed",
    ()=>estimateChatEvidenceAllowed,
    "estimateChatStamp",
    ()=>estimateChatStamp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
;
;
async function estimateChatStamp(trx, context) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    if (!scope.allowed || ![
        "workspace",
        "assigned_job"
    ].includes(scope.scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
      SELECT 'e:' || id::text || ':' || xmin::text AS v FROM estimates WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'i:' || id::text || ':' || xmin::text FROM estimate_items WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'a:' || id::text || ':' || xmin::text FROM estimate_activity WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'd:' || id::text || ':' || xmin::text FROM estimate_deliveries WHERE "workspaceId" = :workspace
      UNION ALL SELECT 't:' || id::text || ':' || xmin::text FROM estimate_share_tokens WHERE "workspaceId" = :workspace
      UNION ALL SELECT 's:' || id::text || ':' || xmin::text FROM estimate_snapshots WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'l:' || id::text || ':' || xmin::text FROM leads WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'j:' || id::text || ':' || xmin::text FROM jobs WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'c:' || id::text || ':' || xmin::text FROM customers WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'team:' || "jobId"::text || ':' || "userId" || ':' || xmin::text FROM "jobTeamMembers" WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'u:' || u.id || ':' || u.xmin::text FROM users u
        JOIN "workspaceMemberships" m ON m."userId" = u.id WHERE m."workspaceId" = :workspace
      UNION ALL SELECT 'w:' || xmin::text || ':' || (now() AT TIME ZONE timezone)::date::text
        FROM workspaces WHERE id = :workspace
    ) evidence`, {
        workspace: context.workspaceId
    });
    return rows[0].stamp;
}
async function estimateChatEvidenceAllowed(trx, context, stamp) {
    if (!stamp) return true;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    return scope.allowed && [
        "workspace",
        "assigned_job"
    ].includes(scope.scope) && stamp === await estimateChatStamp(trx, context);
}
}),
"[project]/packages/data/src/estimates/export.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateExportEmptyError",
    ()=>EstimateExportEmptyError,
    "EstimateExportLimitError",
    ()=>EstimateExportLimitError,
    "createEstimateCSVExport",
    ()=>createEstimateCSVExport,
    "estimateExportRowLimit",
    ()=>estimateExportRowLimit,
    "previewEstimateExport",
    ()=>previewEstimateExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:events [external] (node:events, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/read.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class EstimateExportLimitError extends Error {
}
class EstimateExportEmptyError extends Error {
}
function estimateExportRowLimit() {
    const raw = process.env.ESTIMATE_EXPORT_ROW_LIMIT ?? "50000";
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > 1_000_000) {
        throw new Error("Invalid Estimate export row limit configuration.");
    }
    return Number(raw);
}
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportRequestSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return input;
}
function exportAccess(context) {
    const read = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read");
    const exportPermission = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.export");
    if (!read.allowed || !exportPermission.allowed || ![
        "workspace",
        "assigned_job"
    ].includes(read.scope) || ![
        "workspace",
        "assigned_job"
    ].includes(exportPermission.scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const scope = read.scope === "assigned_job" || exportPermission.scope === "assigned_job" ? "assigned_job" : "workspace";
    return {
        scope
    };
}
async function withExportAuthorization(db, identity, enabled, use) {
    return db.transaction(async (trx)=>{
        await trx.raw("SET LOCAL lock_timeout = '5s'");
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(trx, identity, enabled, false, use);
    });
}
async function exportQuery(trx, context, input) {
    const { scope } = exportAccess(context);
    return {
        query: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filteredEstimateQuery"])(trx, context, scope, input.query),
        scope
    };
}
function auditedFilters(input) {
    const { q, owner, workspaceId, page, pageSize, ...filters } = input.query;
    void workspaceId;
    void page;
    void pageSize;
    return {
        ...filters,
        ownerHash: owner === "all" || owner === "me" || owner === "unassigned" ? owner : (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(owner).digest("hex"),
        ...q ? {
            searchHash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(q).digest("hex")
        } : {},
        columns: input.columns
    };
}
async function previewEstimateExport(db, identity, enabled, raw) {
    const input = validate(identity, raw);
    return withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        const { query, scope } = await exportQuery(trx, context, input);
        const result = await query.countDistinct({
            count: "e.id"
        }).first();
        return {
            count: Number(result?.count ?? 0),
            scope,
            rowLimit: estimateExportRowLimit()
        };
    });
}
function timestamp(value) {
    if (value === null) return null;
    const result = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(result.getTime())) {
        throw new Error("Estimate export contains an invalid timestamp.");
    }
    return result.toISOString();
}
function money(cents) {
    if (cents === null) return null;
    const amount = Number(cents);
    if (!Number.isSafeInteger(amount)) {
        throw new Error("Estimate export total is outside the safe integer range.");
    }
    return (amount / 100).toFixed(2);
}
const headers = {
    number: "Estimate number",
    revision: "Revision",
    name: "Name",
    status: "Status",
    customer: "Customer",
    parentType: "Parent type",
    parentId: "Parent ID",
    owner: "Owner",
    total: "Total",
    sentAt: "Sent date",
    validUntil: "Valid until",
    decidedAt: "Decided date",
    decisionChannel: "Decision channel"
};
function rowValues(row) {
    return {
        number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
        revision: row.revision,
        name: row.name,
        status: row.status,
        customer: row.customerName,
        parentType: row.parentType,
        parentId: row.parentId,
        owner: row.ownerName,
        total: money(row.totalCents),
        sentAt: timestamp(row.sentAt),
        validUntil: row.validUntil,
        decidedAt: timestamp(row.decidedAt),
        decisionChannel: row.decisionChannel
    };
}
async function createEstimateCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    const rowLimit = estimateExportRowLimit();
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const signal = AbortSignal.any([
        AbortSignal.timeout(30_000),
        ...requestSignal ? [
            requestSignal
        ] : []
    ]);
    const initial = await withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        signal.throwIfAborted();
        const { query, scope } = await exportQuery(trx, context, input);
        const result = await query.countDistinct({
            count: "e.id"
        }).first();
        const count = Number(result?.count ?? 0);
        const outcome = count === 0 || count > rowLimit ? "rejected" : "started";
        await trx("estimateExportAudit").insert({
            id,
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            scope,
            filters: JSON.stringify(auditedFilters(input)),
            count,
            outcome,
            finishedAt: outcome === "started" ? null : new Date()
        });
        return {
            count,
            scope
        };
    });
    if (!initial.count) throw new EstimateExportEmptyError();
    if (initial.count > rowLimit) throw new EstimateExportLimitError();
    const output = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["PassThrough"]({
        highWaterMark: 64 * 1024
    });
    output.on("error", ()=>{
    // The response receives a generic stream error; never log exported content.
    });
    const onAbort = ()=>output.destroy(new Error("Export cancelled."));
    signal.addEventListener("abort", onAbort, {
        once: true
    });
    let resolveReady;
    let rejectReady;
    const ready = new Promise((resolve, reject)=>{
        resolveReady = resolve;
        rejectReady = reject;
    });
    let rowsSent = 0;
    let checked = initial;
    async function write(text) {
        signal.throwIfAborted();
        if (output.destroyed) throw new Error("Export cancelled.");
        if (!output.write(text, "utf8")) {
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__["once"])(output, "drain", {
                signal
            });
        }
    }
    const generation = withExportAuthorization(db, identity, enabled, async (trx, context)=>{
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        signal.throwIfAborted();
        const { query, scope } = await exportQuery(trx, context, input);
        const sortColumn = {
            updatedAt: 'e."updatedAt"',
            totalCents: 'e."totalCents"',
            validUntil: 'e."validUntil"',
            estimateNumber: 'e."estimateNumber"'
        };
        const direction = input.query.direction === "asc" ? "ASC" : "DESC";
        const nulls = input.query.sort === "validUntil" || input.query.sort === "totalCents" ? " NULLS LAST" : "";
        const selection = query.orderByRaw(`${sortColumn[input.query.sort]} ${direction}${nulls}, e.id ASC`).select("e.estimateNumber", "e.revision", "e.name", "e.parentType", "e.totalCents", "e.sentAt", "e.decidedAt", "e.decisionChannel", "u.name as ownerName", trx.raw(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateEffectiveStatus"]} AS status`), trx.raw(`COALESCE(c.name, l.name, j."customerName", '') AS "customerName"`), trx.raw(`COALESCE(e."leadId", e."jobId")::text AS "parentId"`), trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`), trx.raw(`count(*) OVER ()::int AS count`)).toSQL();
        await trx.raw("DECLARE estimate_export_cursor NO SCROLL CURSOR FOR " + selection.sql, [
            ...selection.bindings
        ]);
        let rows = (await trx.raw("FETCH FORWARD 100 FROM estimate_export_cursor")).rows;
        const count = Number(rows[0]?.count ?? 0);
        checked = {
            count,
            scope
        };
        if (!count) throw new EstimateExportEmptyError();
        if (count > rowLimit) throw new EstimateExportLimitError();
        resolveReady({
            count,
            scope,
            rowLimit
        });
        await write("\uFEFF" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((column)=>headers[column])));
        while(rows.length){
            for (const row of rows){
                const values = rowValues(row);
                await write((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["csvLine"])(input.columns.map((column)=>values[column])));
                rowsSent++;
            }
            signal.throwIfAborted();
            rows = (await trx.raw("FETCH FORWARD 100 FROM estimate_export_cursor")).rows;
        }
        await trx.raw("CLOSE estimate_export_cursor");
        if (rowsSent !== count) throw new Error("Estimate export snapshot changed.");
        return {
            count,
            scope
        };
    });
    void generation.then(async (result)=>{
        signal.throwIfAborted();
        await db("estimateExportAudit").where({
            id,
            outcome: "started"
        }).update({
            ...result,
            rowsSent,
            outcome: "completed",
            finishedAt: new Date()
        });
        output.end();
    }).catch(async (error)=>{
        try {
            await db("estimateExportAudit").where({
                id,
                outcome: "started"
            }).update({
                ...checked,
                rowsSent,
                outcome: error instanceof EstimateExportLimitError || error instanceof EstimateExportEmptyError ? "rejected" : "failed",
                finishedAt: new Date()
            });
        } catch  {
        // Keep started evidence if audit storage is unavailable.
        }
        rejectReady(error);
        output.destroy(new Error("CSV export could not be completed."));
    }).finally(()=>signal.removeEventListener("abort", onAbort));
    const metadata = await ready;
    return {
        ...metadata,
        stream: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].toWeb(output)
    };
}
}),
"[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateProposalAuthority",
    ()=>estimateProposalAuthority,
    "estimateProposalDigest",
    ()=>estimateProposalDigest,
    "estimateProposalIdentity",
    ()=>estimateProposalIdentity,
    "estimateProposalTurn",
    ()=>estimateProposalTurn,
    "resolveEstimateProposalId",
    ()=>resolveEstimateProposalId,
    "supersedeEstimateProposals",
    ()=>supersedeEstimateProposals
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
;
;
;
;
;
function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    return value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([left], [right])=>left.localeCompare(right)).map(([key, entry])=>[
            key,
            canonical(entry)
        ])) : value;
}
const estimateProposalDigest = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const estimateProposalIdentity = (context)=>({
        userId: context.userId,
        workspaceId: context.workspaceId
    });
async function estimateProposalAuthority(trx, context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "assistant.use"
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = await trx("workspaceMemberships").where(estimateProposalIdentity(context)).select(trx.raw("xmin::text AS version")).first();
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return estimateProposalDigest([
        {
            ...context,
            policy: {
                ...context.policy,
                grants: [
                    ...context.policy.grants
                ].sort((left, right)=>JSON.stringify(left).localeCompare(JSON.stringify(right)))
            },
            enabledPermissions: [
                ...context.enabledPermissions
            ].sort()
        },
        row.version
    ]);
}
async function estimateProposalTurn(trx, context, turnId, completed = false) {
    const turn = await trx("chatTurns").where({
        ...estimateProposalIdentity(context),
        id: turnId
    }).first("id", "threadId", "state", "leaseUntil", "surfaceKey", "pageContext");
    if (!turn || ![
        "home",
        "estimates.list",
        "estimate.detail",
        "estimate.editor",
        "lead.detail",
        "customer.detail"
    ].includes(turn.surfaceKey)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (completed ? turn.state !== "completed" : ![
        "accepted",
        "running"
    ].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The conversation must finish before using this proposal.");
    }
    return turn;
}
async function resolveEstimateProposalId(trx, workspaceId, ref) {
    if (!ref || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatEstimateRefSchema"].safeParse(ref).success) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Provide one exact Estimate number or ID.");
    }
    const numbered = ref.toUpperCase().startsWith("EST-");
    const number = Number(ref.slice(4));
    if (numbered && (number <= 0 || number > 2147483647)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Use a supported exact Estimate number.");
    const row = await trx("estimates").where({
        workspaceId
    }).where(numbered ? {
        estimateNumber: number
    } : {
        id: ref
    }).orderBy("revision", "desc").first("id");
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return row.id;
}
async function supersedeEstimateProposals(trx, context, turn, replacingArchiveEstimateId) {
    const replacedDecisions = new Set(), replacedDraftActions = new Set(), replacedVoids = new Set(), replacedArchives = new Set(), replacedDraftDeletes = new Set(), replacedConversions = new Set();
    for (const [table, audit, kind] of [
        [
            "chatEstimateDrafts",
            "chatEstimateDraftAudit",
            "draft"
        ],
        [
            "chatEstimateShares",
            "chatEstimateShareAudit",
            "share"
        ],
        [
            "chatEstimateDecisions",
            "chatEstimateDecisionAudit",
            "decision"
        ],
        [
            "chatEstimateDraftActions",
            "chatEstimateDraftActionAudit",
            "draft-action"
        ],
        [
            "chatEstimateVoids",
            "chatEstimateVoidAudit",
            "void"
        ],
        [
            "chatEstimateArchives",
            "chatEstimateArchiveAudit",
            "archive"
        ],
        [
            "chatEstimateDraftDeletes",
            "chatEstimateDraftDeleteAudit",
            "draft-delete"
        ],
        [
            "chatEstimateConversions",
            "chatEstimateConversionAudit",
            "conversion"
        ]
    ]){
        const older = await trx(table).where({
            ...estimateProposalIdentity(context),
            threadId: turn.threadId,
            state: "pending"
        }).update({
            state: "superseded",
            resolvedAt: trx.fn.now()
        }).returning([
            "id",
            "turnId",
            "payload"
        ]);
        for (const row of older){
            if (kind === "decision") replacedDecisions.add(row.turnId);
            if (kind === "draft-action") replacedDraftActions.add(row.turnId);
            if (kind === "void") replacedVoids.add(row.turnId);
            if (kind === "archive") replacedArchives.add(row.turnId);
            if (kind === "draft-delete") replacedDraftDeletes.add(row.turnId);
            if (kind === "conversion") replacedConversions.add(row.turnId);
        }
        for (const row of older)await trx(audit).insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            actorId: context.userId,
            proposalId: row.id,
            action: "superseded",
            inputHash: kind === "draft" ? row.payload.view.draft.inputHash : row.payload.ticket.inputHash
        });
    }
    if (replacedDecisions.size || replacedDraftActions.size || replacedVoids.size || replacedArchives.size || replacedDraftDeletes.size || replacedConversions.size || replacingArchiveEstimateId) {
        const current = await trx("chatTurns").where({
            ...estimateProposalIdentity(context),
            id: turn.id,
            threadId: turn.threadId
        }).first("estimateDecisionEvidence", "estimateDraftActionEvidence", "estimateVoidEvidence", "estimateArchiveEvidence", "estimateDraftDeleteEvidence", "estimateConversionEvidence");
        if (!current) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const archiveEvidence = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateArchiveEvidenceSchema"].parse(current.estimateArchiveEvidence ?? []);
        const sameEstimateArchiveEvidence = replacingArchiveEstimateId && archiveEvidence.length ? new Set((await trx("chatEstimateArchives").where({
            ...estimateProposalIdentity(context),
            threadId: turn.threadId
        }).whereIn("turnId", archiveEvidence).select("turnId", "payload")).filter((row)=>row.payload.ticket.estimate.id === replacingArchiveEstimateId).map((row)=>row.turnId)) : new Set();
        // The new authorized intent replaces only its own inherited pending sources, never other turns or confirmed receipts.
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateDecisionEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDecisionEvidenceSchema"].parse(current.estimateDecisionEvidence ?? []).filter((id)=>!replacedDecisions.has(id))),
            estimateDraftActionEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftActionEvidenceSchema"].parse(current.estimateDraftActionEvidence ?? []).filter((id)=>!replacedDraftActions.has(id))),
            estimateVoidEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateVoidEvidenceSchema"].parse(current.estimateVoidEvidence ?? []).filter((id)=>!replacedVoids.has(id))),
            estimateArchiveEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateArchiveEvidenceSchema"].parse(current.estimateArchiveEvidence ?? []).filter((id)=>!replacedArchives.has(id) && !sameEstimateArchiveEvidence.has(id))),
            estimateDraftDeleteEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateDraftDeleteEvidenceSchema"].parse(current.estimateDraftDeleteEvidence ?? []).filter((id)=>!replacedDraftDeletes.has(id))),
            estimateConversionEvidence: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateConversionEvidenceSchema"].parse(current.estimateConversionEvidence ?? []).filter((id)=>!replacedConversions.has(id)))
        });
    }
}
}),
"[project]/packages/data/src/estimates/chat-drafts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftChatEvidenceAllowed",
    ()=>estimateDraftChatEvidenceAllowed,
    "estimateDraftContentComplete",
    ()=>estimateDraftContentComplete,
    "operateEstimateChatDraft",
    ()=>operateEstimateChatDraft,
    "proposeEstimateChatDraft",
    ()=>proposeEstimateChatDraft,
    "readEstimateChatDraftEditor",
    ()=>readEstimateChatDraftEditor,
    "refreshEstimateChatDraft",
    ()=>refreshEstimateChatDraft,
    "visibleEstimateChatDraft",
    ()=>visibleEstimateChatDraft
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/totals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/materials/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const conflict = (message = "This proposal changed or expired. Request a fresh review.")=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](message);
async function catalogStamp(trx, workspaceId) {
    const rows = await trx("materialCatalog").where({
        workspaceId
    }).orderBy("id").select("id", trx.raw("xmin::text AS version"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(rows);
}
function content(seed) {
    const saved = seed.estimate?.values;
    return {
        name: saved?.details.name ?? "",
        scope: saved?.scope ?? "",
        message: saved?.terms.message ?? seed.defaults.message,
        paymentTerms: saved?.terms.paymentTerms ?? "",
        termsNote: saved?.terms.termsNote ?? seed.defaults.termsNote,
        validUntil: saved?.terms.validUntil ?? seed.defaults.validUntil,
        discount: saved?.totals.discount ?? {
            type: "none"
        },
        taxRate: saved?.totals.taxRate ?? seed.defaults.taxRate,
        deposit: saved?.terms.deposit ?? seed.defaults.deposit,
        items: saved?.items.map((item, index)=>({
                id: `saved-${index + 1}`,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit ?? "",
                unitPrice: item.unitPrice,
                taxable: item.taxable,
                included: item.included,
                priceSource: {
                    type: "saved"
                },
                ...item.catalog ? {
                    catalog: item.catalog
                } : {}
            })) ?? []
    };
}
function values(seed, proposed, userId) {
    return {
        details: {
            ...seed.estimate?.values.details ?? {
                recipientName: seed.parent?.contactName || seed.parent?.customer?.name || "",
                recipientEmail: seed.parent?.recipientEmail ?? "",
                serviceAddress: seed.parent?.serviceAddress ?? "",
                ownerId: userId
            },
            name: proposed.name
        },
        scope: proposed.scope,
        items: proposed.items.map((line)=>({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                unit: line.unit,
                taxable: line.taxable,
                included: line.included,
                ...line.catalog ? {
                    catalog: line.catalog
                } : {}
            })),
        totals: {
            discount: proposed.discount,
            taxRate: proposed.taxRate
        },
        terms: {
            message: proposed.message,
            paymentTerms: proposed.paymentTerms,
            termsNote: proposed.termsNote,
            validUntil: proposed.validUntil,
            deposit: proposed.deposit
        },
        internalNotes: seed.estimate?.values.internalNotes ?? "",
        paymentLink: seed.estimate?.values.paymentLink ?? ""
    };
}
function estimateDraftContentComplete(proposed) {
    const calculation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])(proposed);
    return !!proposed.name.trim() && new Set(proposed.items.map((line)=>line.id)).size === proposed.items.length && proposed.items.every((line)=>line.priceSource.type !== "missing" && !!line.unitPrice.trim() && (line.priceSource.type !== "catalog" || !!line.priceSource.name.trim())) && (!calculation.items.error || calculation.items.error === "empty-items") && calculation.items.items.every((line)=>!Object.keys(line.errors).length) && !Object.keys(calculation.errors).length;
}
function contentIdentity(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ...value,
        items: value.items.map((line)=>({
                id: line.id,
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                taxable: line.taxable,
                included: line.included,
                unit: line.unit
            }))
    });
}
function inputHash(payload) {
    const draft = payload.view.draft;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        actionType: draft.actionType,
        parent: draft.parent,
        proposed: draft.proposed,
        ...draft.actionType === "estimate.update" ? {
            estimate: draft.estimate,
            current: draft.current
        } : {},
        authorizationVersion: draft.authorizationVersion,
        createdAt: draft.createdAt,
        expiresAt: draft.expiresAt,
        values: payload.values,
        stamp: payload.stamp,
        catalogStamp: payload.catalogStamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateDraftAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.view.draft.inputHash
    });
}
async function seedFor(trx, context, draft) {
    const seed = draft.actionType === "estimate.update" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateEditorInTransaction"])(trx, context, draft.estimate.id) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateCreationSeedInTransaction"])(trx, context, draft.parent.type, draft.parent.id);
    if (!seed.parent?.href || seed.parent.id !== draft.parent.id || !(draft.actionType === "estimate.create" ? seed.capabilities.create : seed.capabilities.update)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return seed;
}
async function parentVersion(trx, context, type, id) {
    const parent = await trx(type === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id
    }).first("version");
    if (!parent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return Number(parent.version);
}
async function noOpenEstimate(trx, context, draft, today) {
    if (draft.actionType !== "estimate.create") return;
    const existing = await trx("estimates as e").where({
        "e.workspaceId": context.workspaceId,
        [draft.parent.type === "lead" ? "e.leadId" : "e.jobId"]: draft.parent.id
    }).whereNull("e.archivedAt").whereNotExists(trx("estimates as newer").select(trx.raw("1")).whereRaw(`newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber" AND newer.revision > e.revision`)).andWhere((query)=>query.where("e.status", "draft").orWhere((builder)=>builder.whereIn("e.status", [
                "sent",
                "published"
            ]).where("e.validUntil", ">=", today))).first("e.id");
    if (existing) throw conflict("This parent already has an open Estimate. Review or update it instead of creating a duplicate.");
}
async function current(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatStoredSchema"].parse(row.payload);
    if (payload.view.draft.id !== row.id || payload.view.draft.inputHash !== inputHash(payload)) throw conflict();
    if (payload.view.draft.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const seed = await seedFor(trx, context, payload.view.draft);
    const draft = payload.view.draft;
    if (draft.parent.version !== await parentVersion(trx, context, draft.parent.type, draft.parent.id) || draft.actionType === "estimate.update" && seed.estimate?.version !== draft.estimate.expectedVersion || payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || payload.catalogStamp !== await catalogStamp(trx, context.workspaceId)) throw conflict();
    await noOpenEstimate(trx, context, draft, seed.today);
    return {
        payload,
        seed
    };
}
function requestMatches(draft, request) {
    return request.proposalId === draft.id && request.inputHash === draft.inputHash && request.authorizationVersion === draft.authorizationVersion && request.actionType === draft.actionType && request.parentType === draft.parent.type && request.parentId === draft.parent.id && request.parentVersion === draft.parent.version && request.estimateId === (draft.actionType === "estimate.update" ? draft.estimate.id : null) && request.expectedVersion === (draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null);
}
async function insert(trx, context, turn, seed, proposed) {
    const now = new Date();
    if (!seed.parent?.href) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const baseline = content(seed);
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
    const parent = {
        type: seed.parent.type,
        id: seed.parent.id,
        name: seed.parent.name,
        number: seed.parent.number,
        version: await parentVersion(trx, context, seed.parent.type, seed.parent.id)
    };
    const draft = {
        id,
        inputHash: "0".repeat(64),
        authorizationVersion: token,
        parent,
        proposed,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 900000).toISOString(),
        state: "pending",
        ...seed.estimate ? {
            actionType: "estimate.update",
            current: baseline,
            estimate: {
                id: seed.estimate.id,
                number: seed.estimate.number,
                revision: seed.estimate.revision,
                expectedVersion: seed.estimate.version
            }
        } : {
            actionType: "estimate.create"
        }
    };
    await noOpenEstimate(trx, context, draft, seed.today);
    if (seed.estimate && contentIdentity(baseline) === contentIdentity(proposed)) {
        throw conflict("There are no Draft changes to review.");
    }
    const view = {
        draft,
        context: {
            proposalId: id,
            inputHash: draft.inputHash,
            authorizationVersion: token,
            parent: {
                type: parent.type,
                id: parent.id,
                version: parent.version
            },
            estimate: seed.estimate ? {
                id: seed.estimate.id,
                version: seed.estimate.version,
                status: "draft",
                archived: false
            } : null
        },
        grants: {
            read: true,
            parentAccess: true,
            create: seed.capabilities.create,
            update: seed.capabilities.update
        },
        canConfirm: estimateDraftContentComplete(proposed),
        receipt: null
    };
    const payload = {
        view,
        values: values(seed, proposed, context.userId),
        stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
        catalogStamp: await catalogStamp(trx, context.workspaceId)
    };
    draft.inputHash = inputHash(payload);
    view.context.inputHash = draft.inputHash;
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatStoredSchema"].safeParse(payload);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("This complete proposal is too large or invalid. Use the manual editor.");
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
    const [row] = await trx("chatEstimateDrafts").insert({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id,
        turnId: turn.id,
        threadId: turn.threadId,
        payload: JSON.stringify(parsed.data),
        createdAt: trx.raw("clock_timestamp()")
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({
        id: turn.id
    }).update({
        estimateStamp: payload.stamp
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatViewSchema"].parse(view);
}
async function estimateDraftChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateDrafts").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").first();
    if (!row) return true;
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatStoredSchema"].parse(row.payload);
    try {
        return payload.view.draft.authorizationVersion === await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context) && payload.catalogStamp === await catalogStamp(trx, context.workspaceId) && (row.state !== "pending" || Date.parse(payload.view.draft.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
        throw error;
    }
}
function userPrice(price, quote, message, included) {
    if (included && /^\d+(?:\.\d{1,2})?$/.test(price) && Number(price) === 0 && quote && /^(?:included at no charge|no charge|free)$/i.test(quote)) {
        return (message.match(/\b(?:included at no charge|no charge|free)\b/gi) ?? []).some((value)=>value.toLowerCase() === quote.toLowerCase());
    }
    if (!quote || !/^\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(quote) || !/^\d+(?:\.\d{1,2})?$/.test(price)) return false;
    const tokens = message.match(/(?<![\w.,$-])\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?!\w|[.,]\d)/g) ?? [];
    return tokens.includes(quote) && Number(quote.replace(/[$,]/g, "")) === Number(price);
}
async function proposedContent(trx, context, input, seed, message) {
    const baseline = content(seed);
    const proposed = {
        ...baseline
    };
    for (const field of [
        "name",
        "scope",
        "message",
        "paymentTerms",
        "termsNote",
        "validUntil",
        "taxRate"
    ]){
        if (input.changes[field] !== null) proposed[field] = input.changes[field];
    }
    for (const field of [
        "discount",
        "deposit"
    ])if (input.changes[field] !== null) proposed[field] = input.changes[field];
    if (input.changes.items !== null) {
        proposed.items = [];
        for (const item of input.changes.items){
            const saved = item.savedLineId ? baseline.items.find((line)=>line.id === item.savedLineId) : undefined;
            if (item.savedLineId && !saved) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("A saved line reference is invalid.");
            const line = {
                id: saved?.id ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: "",
                taxable: item.taxable,
                included: item.included,
                priceSource: {
                    type: "missing"
                }
            };
            if (item.priceSource === "saved" && saved && saved.unitPrice === item.unitPrice && saved.included === item.included) {
                line.unitPrice = saved.unitPrice;
                line.priceSource = {
                    type: "saved"
                };
                if (saved.catalog) line.catalog = saved.catalog;
            } else if (item.priceSource === "user" && item.unitPrice !== null && userPrice(item.unitPrice, item.priceQuote, message, item.included)) {
                line.unitPrice = item.unitPrice;
                line.priceSource = {
                    type: "user"
                };
            } else if (item.priceSource === "catalog") {
                const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$materials$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["materialAccess"])(context);
                if (!access.read || !access.viewPrices) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                const ref = item.catalogRef;
                if (!ref) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Name an exact catalog item or leave the price blank.");
                const matches = await trx("materialCatalog").where({
                    workspaceId: context.workspaceId,
                    status: "active"
                }).whereNull("archivedAt").andWhere((query)=>query.whereRaw("lower(name) = lower(?)", [
                        ref
                    ]).orWhereRaw("lower(sku) = lower(?)", [
                        ref
                    ])).limit(2).select("id", "name", "priceCents", "unit", "sku");
                if (matches.length !== 1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Choose one exact accessible catalog name or SKU.");
                if (matches[0].priceCents !== null) {
                    line.unitPrice = (Number(matches[0].priceCents) / 100).toFixed(2);
                    line.priceSource = {
                        type: "catalog",
                        name: matches[0].name
                    };
                }
                line.unit = matches[0].unit;
                line.catalog = {
                    id: matches[0].id,
                    name: matches[0].name,
                    unit: matches[0].unit,
                    sku: matches[0].sku
                };
            }
            if (item.included && line.priceSource.type === "missing") line.included = false;
            proposed.items.push(line);
        }
    }
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatContentSchema"].safeParse(proposed);
    if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The proposed Draft fields or saved line references are invalid. Review them in the manual editor.");
    return parsed.data;
}
async function resolveSeed(trx, context, input) {
    if (input.operation === "update") {
        if (input.parentType !== null || input.parentRef !== null) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Use one exact Estimate target for a Draft update.");
        const id = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, input.estimateRef);
        const seed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateEditorInTransaction"])(trx, context, id);
        if (!seed.capabilities.update || !seed.parent?.href) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return seed;
    }
    if (input.estimateRef !== null) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Use one Lead or Job parent for a new Draft, not an Estimate target.");
    const type = input.parentType, ref = input.parentRef;
    if (!type || !ref || !/^(?:LD|J)-\d{4,10}$/i.test(ref) && !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].safeParse(ref).success) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Provide one exact Lead or Job number or ID.");
    }
    if (/^(LD|J)-/i.test(ref) && (!ref.toUpperCase().startsWith(type === "lead" ? "LD-" : "J-") || Number(ref.slice(ref.indexOf("-") + 1)) <= 0 || Number(ref.slice(ref.indexOf("-") + 1)) > 2147483647)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The exact parent number must match its Lead or Job type.");
    }
    const query = trx(type === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId
    });
    if (/^(LD|J)-/i.test(ref)) query.where(type === "lead" ? "leadNumber" : "jobNumber", Number(ref.slice(ref.indexOf("-") + 1)));
    else query.where("id", ref);
    const row = await query.first("id");
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateCreationSeedInTransaction"])(trx, context, type, row.id);
}
async function proposeEstimateChatDraft(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const pageContext = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const message = await trx("chatMessages").where({
            turnId,
            role: "user"
        }).first("text");
        if (!message) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (request.operation === "update" && !request.estimateRef && [
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey)) {
            request.estimateRef = pageContext.recordRefs?.find((ref)=>ref.type === "estimate")?.id ?? null;
        }
        if (request.operation === "create" && !request.parentRef && request.parentType !== "job" && turn.surfaceKey === "lead.detail") {
            request.parentType = "lead";
            request.parentRef = pageContext.recordRefs?.find((ref)=>ref.type === "lead")?.id ?? null;
        }
        const seed = await resolveSeed(trx, context, request);
        const proposed = await proposedContent(trx, context, request, seed, message.text);
        const result = await insert(trx, context, turn, seed, proposed);
        signal.throwIfAborted();
        return result;
    });
}
async function visibleEstimateChatDraft(trx, context, turnId) {
    const row = await trx("chatEstimateDrafts").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatStoredSchema"].parse(row.payload);
        if (row.state === "confirmed") {
            if (parsed.view.draft.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) return undefined;
            if (parsed.resultStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || parsed.view.draft.inputHash !== inputHash(parsed)) return undefined;
            const receipt = parsed.view.receipt;
            if (!receipt) throw conflict();
            const seed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateEditorInTransaction"])(trx, context, receipt.id);
            if (!seed.parent?.href || seed.estimate?.version !== receipt.version) return undefined;
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatViewSchema"].parse({
                ...parsed.view,
                draft: {
                    ...parsed.view.draft,
                    state: "confirmed"
                }
            });
        }
        const { payload } = await current(trx, context, row);
        const state = row.state === "pending" && Date.parse(payload.view.draft.expiresAt) <= Date.now() ? "expired" : row.state;
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatViewSchema"].parse({
            ...payload.view,
            draft: {
                ...payload.view.draft,
                state
            }
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]) return undefined;
        throw error;
    }
}
async function operateEstimateChatDraft(db, identity, enabled, request, decision) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateDrafts").where({
            ...identity,
            id: request.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        if (!requestMatches(row.payload.view.draft, request)) throw conflict();
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visibleEstimateChatDraft(trx, context, row.turnId);
            if (!view || view.draft.id !== row.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            return {
                view,
                ...decision === "open" && view.receipt ? {
                    href: `/estimates/${view.receipt.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (decision === "open") throw conflict();
        if (row.state !== "pending") throw conflict();
        const { payload } = await current(trx, context, row);
        if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
        if (decision === "editor") return {
            view: payload.view,
            href: `/estimates/${payload.view.draft.actionType === "estimate.update" ? payload.view.draft.estimate.id : "new"}?workspace=${context.workspaceId}&proposal=${row.id}`
        };
        if (decision === "confirm") {
            if (!estimateDraftContentComplete(payload.view.draft.proposed)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Complete missing prices and invalid fields in the editor, then review a refreshed proposal.");
            const receipt = payload.view.draft.actionType === "estimate.create" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEstimateDraftInTransaction"])(trx, context, {
                submissionId: row.id,
                parent: payload.view.draft.parent,
                values: payload.values,
                source: "assistant-confirmed"
            }) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateEstimateDraftInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                estimateId: payload.view.draft.estimate.id,
                expectedVersion: payload.view.draft.estimate.expectedVersion,
                values: payload.values
            }, "assistant-confirmed");
            payload.view.receipt = receipt;
            payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context);
        }
        payload.view.draft.state = decision === "confirm" ? "confirmed" : "cancelled";
        await trx("chatEstimateDrafts").where({
            id: row.id
        }).update({
            state: payload.view.draft.state,
            payload: JSON.stringify(payload),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, decision === "confirm" ? "confirmed" : "cancelled");
        return {
            view: payload.view
        };
    });
}
async function readEstimateChatDraftEditor(db, identity, enabled, id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateDrafts").where({
            ...identity,
            id
        }).first();
        if (!row || ![
            "pending",
            "confirmed"
        ].includes(row.state)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        if (row.state === "confirmed") {
            const view = await visibleEstimateChatDraft(trx, context, row.turnId);
            if (!view?.receipt || view.draft.id !== row.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            const seed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateEditorInTransaction"])(trx, context, view.receipt.id);
            return {
                view,
                seed,
                threadId: row.threadId
            };
        }
        const { payload, seed } = await current(trx, context, row);
        if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
        return {
            view: payload.view,
            seed,
            threadId: row.threadId
        };
    });
}
async function refreshEstimateChatDraft(db, identity, enabled, request, rawContent) {
    const proposed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftChatContentSchema"].parse(rawContent);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateDrafts").where({
            ...identity,
            id: request.proposalId
        }).forUpdate().first();
        if (!row || row.state !== "pending") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (!requestMatches(row.payload.view.draft, request)) throw conflict();
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        const { payload, seed } = await current(trx, context, row);
        if (Date.parse(payload.view.draft.expiresAt) <= Date.now()) throw conflict();
        // Browser-edited prices are explicit user input; source labels are never trusted from the request.
        for (const line of proposed.items){
            const previous = payload.view.draft.proposed.items.find((item)=>item.id === line.id);
            line.priceSource = previous && previous.unitPrice === line.unitPrice && previous.included === line.included ? previous.priceSource : {
                type: line.unitPrice.trim() ? "user" : "missing"
            };
            delete line.catalog;
            if (previous?.catalog && previous.unitPrice === line.unitPrice && previous.included === line.included) line.catalog = previous.catalog;
        }
        const view = await insert(trx, context, turn, seed, proposed);
        return {
            view
        };
    });
}
}),
"[project]/packages/data/src/estimates/share-token.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateTokenHash",
    ()=>estimateTokenHash,
    "newEstimateShareToken",
    ()=>newEstimateShareToken,
    "recoverEstimateShareToken",
    ()=>recoverEstimateShareToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/encryption.ts [app-route] (ecmascript)");
;
;
;
function estimateTokenHash(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(token).digest("hex");
}
function newEstimateShareToken() {
    const token = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("base64url");
    const envelope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptFile"])(Buffer.from(token, "utf8"));
    return {
        tokenHash: estimateTokenHash(token),
        encryptedToken: Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeDekEnvelope"])(envelope),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeFileCiphertext"])(envelope)
        ]).toString("base64")
    };
}
function recoverEstimateShareToken(encrypted, expectedHash) {
    const bytes = Buffer.from(encrypted, "base64");
    if (bytes.length < 96 || !/^[0-9a-f]{64}$/.test(expectedHash)) {
        throw new Error("The customer link cannot be recovered.");
    }
    const { plaintext } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptFile"])({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deserializeDekEnvelope"])(bytes.subarray(0, 64)),
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deserializeFileCiphertext"])(bytes.subarray(64))
    });
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareTokenSchema"].parse(plaintext.toString("utf8"));
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(estimateTokenHash(token), "hex"), Buffer.from(expectedHash, "hex"))) {
        throw new Error("The customer link cannot be verified.");
    }
    return token;
}
}),
"[project]/packages/data/src/estimates/delivery.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDeliveryFailureMessage",
    ()=>estimateDeliveryFailureMessage,
    "estimateDeliveryFailureMessages",
    ()=>estimateDeliveryFailureMessages,
    "processEstimateEmails",
    ()=>processEstimateEmails,
    "stopEstimateDeliveries",
    ()=>stopEstimateDeliveries
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/share-token.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/feature-flags.ts [app-route] (ecmascript)");
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
const estimateDeliveryFailureMessages = {
    authorization: "Delivery stopped because the sender no longer has access to send this estimate.",
    inactive: "Delivery stopped because estimate sharing, the estimate, or the customer link is no longer active.",
    invalid: "Delivery stopped because the frozen estimate or customer link could not be verified.",
    transport: "The email could not be delivered within the retry window. Check email delivery and review the recipient before resending."
};
function estimateDeliveryFailureMessage(code) {
    switch(code){
        case "authorization":
        case "inactive":
        case "invalid":
        case "transport":
            return estimateDeliveryFailureMessages[code];
        default:
            return undefined;
    }
}
const now = (db)=>db.raw("clock_timestamp()");
async function fail(trx, delivery, code, enabled) {
    await trx("estimate_deliveries").where({
        id: delivery.id,
        status: "queued"
    }).update({
        status: "failed",
        failedAt: now(trx),
        failureCode: code
    });
    await deliveryActivity(trx, delivery, "delivery-failed", {
        reason: code
    });
    if (enabled && (code === "invalid" || code === "transport")) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyEstimateRecipients"])(trx, {
            workspaceId: delivery.workspaceId,
            estimateId: delivery.estimateId,
            event: "delivery_failed",
            dedupeKey: `estimate:${delivery.estimateId}:delivery-failed:${delivery.id}`,
            actorId: delivery.requestedBy
        }, enabled);
    }
}
async function stopEstimateDeliveries(trx, workspaceId, estimateId) {
    const rows = await trx("estimate_deliveries").where({
        workspaceId,
        estimateId,
        status: "queued"
    }).orderBy("id").forUpdate().select("id", "workspaceId", "estimateId", "requestedBy");
    for (const row of rows)await fail(trx, row, "inactive");
}
async function deliveryActivity(trx, delivery, type, changes) {
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: delivery.workspaceId,
        estimateId: delivery.estimateId,
        actorId: null,
        actorName: "Email delivery",
        source: "worker",
        type,
        changes: JSON.stringify(changes)
    });
}
async function claim(trx, id) {
    return trx("estimate_deliveries").where({
        id,
        status: "queued"
    }).where("nextAttemptAt", "<=", now(trx)).forUpdate().skipLocked().first();
}
async function deliveryContent(trx, delivery) {
    const row = await trx("estimate_snapshots").where({
        id: delivery.snapshotId,
        estimateId: delivery.estimateId,
        workspaceId: delivery.workspaceId
    }).first("content", "contentHash");
    const snapshot = row && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validEstimateFrozenSnapshot"])(row.content);
    if (!snapshot || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSnapshotHash"])(snapshot) !== row.contentHash) return null;
    const link = await trx("estimate_share_tokens").where({
        workspaceId: delivery.workspaceId,
        estimateId: delivery.estimateId,
        snapshotId: delivery.snapshotId
    }).first();
    if (!link?.encryptedToken) return null;
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateEmailDestinationSchema"].safeParse({
        recipientEmail: delivery.recipient,
        subject: delivery.subject
    });
    if (!request.success) return null;
    let token;
    try {
        token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recoverEstimateShareToken"])(link.encryptedToken, link.tokenHash);
    } catch  {
        // An unverifiable link is a terminal failure, not a reason to regenerate or send one.
        return null;
    }
    const { content, amounts } = snapshot;
    return {
        id: delivery.id,
        to: delivery.recipient,
        subject: delivery.subject,
        token,
        queuedAt: delivery.queuedAt,
        businessName: content.business.name,
        replyTo: content.business.email,
        recipientName: content.recipientName,
        number: content.number,
        name: content.name,
        totalCents: amounts.totalCents,
        validUntil: content.validUntil,
        ...content.paymentLink ? {
            paymentLink: content.paymentLink
        } : {}
    };
}
async function processEstimateEmails(db, enabled, send, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid estimate delivery batch size.");
    const summary = {
        sent: 0,
        retryPending: 0,
        failed: 0
    };
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db("estimate_deliveries"), "estimate_deliveries.workspaceId").where({
        status: "queued"
    }).where("nextAttemptAt", "<=", now(db)).orderBy("nextAttemptAt").orderBy("id").limit(limit).select("id", "workspaceId", "estimateId", "requestedBy");
    for (const candidate of candidates){
        try {
            if (!candidate.requestedBy) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])(db, "estimate.sharing.enabled", candidate.workspaceId)) {
                await db.transaction(async (trx)=>{
                    await trx("workspaces").where({
                        id: candidate.workspaceId
                    }).forShare().first("id");
                    const delivery = await claim(trx, candidate.id);
                    if (delivery) {
                        await fail(trx, delivery, "inactive");
                        summary.failed++;
                    }
                });
                continue;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
                workspaceId: candidate.workspaceId,
                userId: candidate.requestedBy
            }, enabled, false, async (trx, context)=>{
                const delivery = await claim(trx, candidate.id);
                if (!delivery) return;
                const estimate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorizeEstimateDelivery"])(trx, context, delivery.estimateId);
                const link = await trx("estimate_share_tokens").where({
                    workspaceId: context.workspaceId,
                    estimateId: delivery.estimateId,
                    snapshotId: delivery.snapshotId
                }).whereNull("revokedAt").where("expiresAt", ">", now(trx)).first("id");
                if (estimate.status !== "sent" || estimate.archivedAt || !link) {
                    await fail(trx, delivery, "inactive");
                    summary.failed++;
                    return;
                }
                const mail = await deliveryContent(trx, delivery);
                if (!mail) {
                    await fail(trx, delivery, "invalid", context.enabledPermissions);
                    summary.failed++;
                    return;
                }
                const attempts = delivery.attemptCount + 1;
                let receipt;
                try {
                    receipt = await send(mail);
                    if (!receipt.providerMessageId || /[\r\n]/.test(receipt.providerMessageId)) {
                        throw new Error("Missing estimate delivery receipt.");
                    }
                } catch  {
                    if (attempts >= 5) {
                        await fail(trx, delivery, "transport", context.enabledPermissions);
                        await trx("estimate_deliveries").where({
                            id: delivery.id
                        }).update({
                            attemptCount: attempts
                        });
                        summary.failed++;
                    } else {
                        await trx("estimate_deliveries").where({
                            id: delivery.id
                        }).update({
                            attemptCount: attempts,
                            nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1))
                        });
                        summary.retryPending++;
                    }
                    return;
                }
                await trx("estimate_deliveries").where({
                    id: delivery.id
                }).update({
                    status: "sent",
                    attemptCount: attempts,
                    sentAt: now(trx),
                    providerMessageId: receipt.providerMessageId,
                    failureCode: null
                });
                await deliveryActivity(trx, delivery, "email-sent", {
                    attempts
                });
                summary.sent++;
            });
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WorkspaceSuspendedError"]) continue;
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"])) throw error;
            await db.transaction(async (trx)=>{
                await trx("workspaces").where({
                    id: candidate.workspaceId
                }).forShare().first("id");
                const delivery = await claim(trx, candidate.id);
                if (delivery) {
                    await fail(trx, delivery, "authorization");
                    summary.failed++;
                }
            });
        }
    }
    return summary;
}
}),
"[project]/packages/data/src/estimates/sharing.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readEstimateCustomerLink",
    ()=>readEstimateCustomerLink,
    "readEstimateSharingReview",
    ()=>readEstimateSharingReview,
    "readEstimateSharingReviewInTransaction",
    ()=>readEstimateSharingReviewInTransaction,
    "readEstimateSnapshotLogo",
    ()=>readEstimateSnapshotLogo,
    "readPublicEstimate",
    ()=>readPublicEstimate,
    "readPublicEstimateLogo",
    ()=>readPublicEstimateLogo,
    "shareEstimate",
    ()=>shareEstimate,
    "shareEstimateInTransaction",
    ()=>shareEstimateInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/state.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/share-token.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/encryption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/delivery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/feature-flags.ts [app-route] (ecmascript)");
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
function checkedSnapshot(row) {
    const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(row.content, row.contentHash);
    if (!snapshot) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The frozen estimate is unavailable. Its snapshot is invalid.");
    }
    return snapshot;
}
function sharedPaper(row) {
    const snapshot = checkedSnapshot(row);
    return {
        state: "snapshot",
        estimateId: row.estimateId,
        version: row.estimateVersion,
        snapshotHash: row.contentHash,
        content: snapshot.content,
        amounts: snapshot.amounts
    };
}
async function frozenRow(trx, workspaceId, estimateId) {
    return trx("estimate_snapshots").where({
        workspaceId,
        estimateId
    }).first();
}
function activeLink(token, status, now) {
    return !!token && !token.revokedAt && token.expiresAt > now && [
        "sent",
        "published",
        "accepted",
        "declined"
    ].includes(status);
}
async function deliverySummary(trx, workspaceId, estimateId, status) {
    const token = await trx("estimate_share_tokens").where({
        workspaceId,
        estimateId
    }).first();
    const mail = await trx("estimate_deliveries").where({
        workspaceId,
        estimateId
    }).orderBy("queuedAt", "desc").orderBy("id", "desc").first();
    const now = (await trx.raw("SELECT clock_timestamp() AS now")).rows[0].now;
    const state = !token ? "not-created" : status === "superseded" ? "replaced" : status === "void" || token.revokedAt ? "revoked" : token.expiresAt <= now || status === "expired" ? "expired" : activeLink(token, status, now) ? "active" : "unavailable";
    return {
        email: mail ? {
            state: mail.status,
            recipientEmail: mail.recipient,
            updatedAt: (mail.bouncedAt ?? mail.failedAt ?? mail.sentAt ?? mail.queuedAt).toISOString(),
            attemptCount: mail.attemptCount,
            nextAttemptAt: mail.status === "queued" && mail.attemptCount > 0 ? mail.nextAttemptAt.toISOString() : null,
            failureMessage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDeliveryFailureMessage"])(mail.failureCode)
        } : {
            state: "not-sent"
        },
        link: {
            state,
            expiresAt: token?.expiresAt.toISOString() ?? null,
            firstViewedAt: token?.firstViewedAt?.toISOString() ?? null
        }
    };
}
async function readEstimateSharingReview(db, identity, enabled, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        return readEstimateSharingReviewInTransaction(trx, context, estimateId);
    });
}
async function readEstimateSharingReviewInTransaction(trx, context, estimateId) {
    const { seed, canSend } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateSharingContext"])(trx, context, estimateId);
    const estimate = seed.estimate;
    if (!estimate) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const row = await frozenRow(trx, context.workspaceId, estimateId);
    const draft = estimate.status === "draft" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSharingPaper"])(seed) : null;
    const paper = row ? sharedPaper(row) : null;
    const snapshotHash = paper?.snapshotHash ?? (draft?.snapshot ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSnapshotHash"])(draft.snapshot) : null);
    return {
        estimate,
        today: seed.today,
        canSend,
        subject: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateEmailSubject"])(estimate.number, paper?.content.business.name ?? seed.paperBusiness.name),
        issues: draft?.issues ?? [],
        snapshotHash,
        paper,
        draftPaper: draft?.snapshot && snapshotHash && !draft.issues.length ? {
            state: "snapshot",
            estimateId,
            version: estimate.version,
            snapshotHash,
            content: draft.snapshot.content,
            amounts: draft.snapshot.amounts
        } : null,
        draft: draft?.content ?? null,
        delivery: await deliverySummary(trx, context.workspaceId, estimateId, estimate.status),
        revision: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateRevisionSharingReview"])(trx, context, estimateId, false)
    };
}
async function activity(trx, identity, estimateId, type, changes, source = "ui") {
    const actor = await trx("users").where({
        id: identity.userId
    }).first("name");
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        estimateId,
        actorId: identity.userId,
        actorName: actor.name,
        source,
        type,
        changes: JSON.stringify(changes)
    });
}
async function shareEstimate(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shareEstimateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        return shareEstimateInTransaction(trx, context, input);
    });
}
async function shareEstimateInTransaction(trx, context, raw, source = "ui") {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shareEstimateSchema"].parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])(trx, "estimate.sharing.enabled", context.workspaceId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const identity = context;
    const { seed, canSend } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateSharingContext"])(trx, context, input.estimateId);
    const estimate = seed.estimate;
    if (!estimate || !canSend) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const inputHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts").where({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId
    }).first();
    if (prior) {
        if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId || prior.operation !== input.mode || prior.inputHash !== inputHash) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This confirmation was already used for a different request.");
        }
        const frozen = await frozenRow(trx, identity.workspaceId, input.estimateId);
        if (!frozen) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The confirmed snapshot is unavailable.");
        checkedSnapshot(frozen);
        return {
            estimateId: input.estimateId,
            version: prior.version,
            snapshotHash: frozen.contentHash,
            status: input.mode === "publish" ? "published" : "sent"
        };
    }
    if (estimate.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    if (estimate.archived) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Restore the estimate before sharing.");
    const target = input.mode === "publish" ? "published" : "sent";
    const existingSnapshot = await frozenRow(trx, identity.workspaceId, input.estimateId);
    let snapshotId;
    let snapshot;
    let snapshotHash;
    if (input.mode === "resend") {
        const delivery = await deliverySummary(trx, identity.workspaceId, estimate.id, estimate.status);
        const queued = await trx("estimate_deliveries").where({
            workspaceId: identity.workspaceId,
            estimateId: estimate.id,
            status: "queued"
        }).first("id");
        if (estimate.status !== "sent" || delivery.link.state !== "active" || delivery.email.state === "not-sent" || queued || !existingSnapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an active Sent estimate without a queued email can be resent.");
        }
        snapshot = checkedSnapshot(existingSnapshot);
        snapshotId = existingSnapshot.id;
        snapshotHash = existingSnapshot.contentHash;
    } else {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransitionEstimate"])(estimate.status, target) || existingSnapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only a saved, never-shared Draft can be sent or published.");
        }
        const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSharingPaper"])(seed);
        if (review.issues.length || !review.snapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](review.issues.join(" ") || "The customer paper is incomplete.");
        }
        snapshot = review.snapshot;
        snapshotHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSnapshotHash"])(snapshot);
        snapshotId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    }
    if (input.snapshotHash !== snapshotHash) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The reviewed customer paper changed. Reload and review it before confirming.");
    }
    const revision = input.mode === "resend" ? null : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateRevisionSharingReview"])(trx, context, estimate.id);
    if (input.mode !== "resend") (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateEstimateRevisionConfirmation"])(revision, input.revisionReview);
    if (input.mode !== "publish") validateEmailRequest(input, snapshot);
    const version = estimate.version + 1;
    if (input.mode !== "resend") {
        await verifySnapshotLogo(trx, identity.workspaceId, snapshot);
        await trx("estimate_snapshots").insert({
            id: snapshotId,
            workspaceId: identity.workspaceId,
            estimateId: estimate.id,
            content: JSON.stringify(snapshot),
            contentHash: snapshotHash,
            estimateVersion: version
        });
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["newEstimateShareToken"])();
        // PostgreSQL resolves DST and the workspace-local next midnight, never the browser timezone.
        const expiry = await trx("workspaces").where({
            id: identity.workspaceId
        }).select(trx.raw('((?::date + 1)::timestamp AT TIME ZONE timezone) AS "expiresAt"', [
            snapshot.content.validUntil
        ])).first();
        await trx("estimate_share_tokens").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            estimateId: estimate.id,
            snapshotId,
            ...token,
            expiresAt: expiry.expiresAt
        });
    }
    if (input.mode !== "publish") {
        await trx("estimate_deliveries").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: identity.workspaceId,
            estimateId: estimate.id,
            snapshotId,
            recipient: input.recipientEmail,
            recipientHash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(input.recipientEmail.toLowerCase()).digest("hex"),
            subject: input.subject,
            requestedBy: identity.userId,
            idempotencyKey: `estimate-${input.submissionId}`
        });
    }
    await trx("estimates").where({
        workspaceId: identity.workspaceId,
        id: estimate.id,
        version: input.expectedVersion
    }).update({
        version,
        updatedAt: trx.fn.now(),
        ...input.mode === "resend" ? {} : {
            status: target,
            [input.mode === "publish" ? "publishedAt" : "sentAt"]: trx.fn.now()
        }
    });
    if (revision) {
        const changed = await trx("estimates").where({
            workspaceId: context.workspaceId,
            id: revision.sourceEstimateId,
            version: revision.sourceVersion
        }).update({
            status: "superseded",
            supersededById: estimate.id,
            version: revision.sourceVersion + 1,
            updatedAt: trx.fn.now()
        });
        if (!changed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
        await trx("estimate_share_tokens").where({
            workspaceId: context.workspaceId,
            estimateId: revision.sourceEstimateId
        }).whereNull("revokedAt").update({
            revokedAt: trx.fn.now()
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stopEstimateDeliveries"])(trx, context.workspaceId, revision.sourceEstimateId);
        await activity(trx, identity, revision.sourceEstimateId, "superseded", {
            status: {
                before: revision.sourceStatus,
                after: "superseded"
            },
            revision: {
                before: revision.sourceRevision,
                after: estimate.revision
            }
        }, source);
    }
    await activity(trx, identity, estimate.id, input.mode === "resend" ? "resent" : target, {
        ...input.mode === "resend" ? {} : {
            status: {
                before: "draft",
                after: target
            }
        },
        fromVersion: estimate.version,
        toVersion: version
    }, source);
    if (input.mode === "send" || input.mode === "resend") {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyEstimateRecipients"])(trx, {
            workspaceId: identity.workspaceId,
            estimateId: estimate.id,
            event: "sent",
            dedupeKey: `estimate:${estimate.id}:sent:${input.submissionId}`,
            actorId: identity.userId
        }, context.enabledPermissions);
    }
    await trx("estimate_operation_receipts").insert({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId,
        actorId: identity.userId,
        operation: input.mode,
        inputHash,
        estimateId: estimate.id,
        version
    });
    return {
        estimateId: estimate.id,
        version,
        snapshotHash,
        status: target
    };
}
function validateEmailRequest(input, snapshot) {
    if (input.subject !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateEmailSubject"])(snapshot.content.number, snapshot.content.business.name)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The email subject changed. Reload and review the estimate.");
    }
}
async function verifySnapshotLogo(trx, workspaceId, snapshot) {
    const path = snapshot.content.business.logoPath;
    if (!path) return;
    if (!await snapshotLogoFile(trx, workspaceId, snapshot)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The business logo is unavailable. Update it in Settings before sharing.");
    }
}
async function snapshotLogoFile(trx, workspaceId, snapshot) {
    const path = snapshot.content.business.logoPath;
    if (!path) return null;
    return trx("files").where({
        workspaceId,
        id: path.split("/").at(-1),
        entityType: "estimate-business-profile-logo",
        entityId: workspaceId,
        status: "ready",
        mimeType: "image/webp",
        categoryTag: "saved"
    }).whereNull("deletedAt").first("storageKey", "encryptedDekB64");
}
async function snapshotLogo(trx, storage, workspaceId, snapshot) {
    const file = await snapshotLogoFile(trx, workspaceId, snapshot);
    if (!file) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The frozen estimate logo is unavailable.");
    const encrypted = await storage.get(file.storageKey);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptFile"])({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deserializeDekEnvelope"])(Buffer.from(file.encryptedDekB64, "base64")),
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deserializeFileCiphertext"])(encrypted)
    }).plaintext;
}
async function readEstimateSnapshotLogo(db, storage, identity, enabled, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateSharingContext"])(trx, context, estimateId);
        const row = await frozenRow(trx, context.workspaceId, estimateId);
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return snapshotLogo(trx, storage, context.workspaceId, checkedSnapshot(row));
    });
}
async function readEstimateCustomerLink(db, identity, enabled, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$feature$2d$flags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])(trx, "estimate.sharing.enabled", context.workspaceId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const { seed } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateSharingContext"])(trx, context, estimateId);
        const estimate = seed.estimate;
        if (!estimate || estimate.archived) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const summary = await deliverySummary(trx, identity.workspaceId, estimateId, estimate.status);
        if (summary.link.state !== "active") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const row = await frozenRow(trx, identity.workspaceId, estimateId);
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedSnapshot(row);
        const token = await trx("estimate_share_tokens").where({
            workspaceId: identity.workspaceId,
            estimateId,
            snapshotId: row.id
        }).first();
        if (!token?.encryptedToken) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The customer link is unavailable.");
        return {
            path: `/e/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recoverEstimateShareToken"])(token.encryptedToken, token.tokenHash)}`
        };
    });
}
async function readPublicEstimate(db, token, requesterKey, allowed = async ()=>true) {
    const result = await withPublicEstimate(db, token, requesterKey, async (trx, row, link, now)=>{
        await trx("estimate_share_tokens").where({
            id: link.id
        }).update({
            viewCount: trx.raw('"viewCount" + 1'),
            firstViewedAt: link.firstViewedAt ?? now,
            lastViewedAt: now
        });
        if (!link.firstViewedAt) {
            await trx("estimate_activity").insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                workspaceId: row.workspaceId,
                estimateId: row.estimateId,
                actorId: null,
                actorName: "Customer",
                source: "system",
                type: "viewed",
                changes: "{}"
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyEstimateRecipients"])(trx, {
                workspaceId: row.workspaceId,
                estimateId: row.estimateId,
                event: "viewed",
                dedupeKey: `estimate:${row.estimateId}:viewed:${link.id}`
            }, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["permissionIds"]);
        }
        return sharedPaper(row);
    }, allowed);
    return result.state === "ready" ? {
        state: "ready",
        snapshot: result.value
    } : result;
}
async function readPublicEstimateLogo(db, storage, token, requesterKey, allowed = async ()=>true) {
    const result = await withPublicEstimate(db, token, requesterKey, async (trx, row)=>snapshotLogo(trx, storage, row.workspaceId, checkedSnapshot(row)), allowed);
    return result.state === "ready" ? {
        state: "ready",
        image: result.value
    } : result;
}
/** Page and logo reads hold the same workspace/token locks throughout their protected work. */ async function withPublicEstimate(db, token, requesterKey, use, allowed = async ()=>true) {
    if (!requesterKey || requesterKey.length > 200) throw new RangeError("A bounded public requester key is required.");
    if (!await consumePublicRead(db, requesterKey)) return {
        state: "rate-limited"
    };
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareTokenSchema"].safeParse(token).success) return {
        state: "not-found"
    };
    const candidate = await db("estimate_share_tokens").where({
        tokenHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateTokenHash"])(token)
    }).first("workspaceId", "id");
    if (!candidate) return {
        state: "not-found"
    };
    return db.transaction(async (trx)=>{
        const workspace = await trx("workspaces").where({
            id: candidate.workspaceId
        }).whereNull("deletionRequestedAt").forShare().first("id");
        if (!workspace) return {
            state: "not-found"
        };
        const link = await trx("estimate_share_tokens").where({
            workspaceId: workspace.id,
            id: candidate.id,
            tokenHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$share$2d$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateTokenHash"])(token)
        }).forUpdate().first();
        if (!link) return {
            state: "not-found"
        };
        const estimate = await trx("estimates").where({
            workspaceId: workspace.id,
            id: link.estimateId
        }).first("status");
        const now = (await trx.raw("SELECT clock_timestamp() AS now")).rows[0].now;
        if (!estimate) return {
            state: "not-found"
        };
        if (estimate.status === "superseded") return {
            state: "replaced"
        };
        if (estimate.status === "void") return {
            state: "withdrawn"
        };
        if (link.revokedAt) return {
            state: "revoked"
        };
        if (link.expiresAt <= now || estimate.status === "expired") return {
            state: "expired"
        };
        if (!activeLink(link, estimate.status, now)) return {
            state: "unavailable"
        };
        const row = await trx("estimate_snapshots").where({
            workspaceId: workspace.id,
            estimateId: link.estimateId,
            id: link.snapshotId
        }).first();
        if (!row) return {
            state: "unavailable"
        };
        const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(row.content, row.contentHash);
        if (!snapshot) return {
            state: "unavailable"
        };
        if (!await allowed(trx, workspace.id)) return {
            state: "unavailable"
        };
        return {
            state: "ready",
            value: await use(trx, row, link, now)
        };
    });
}
async function consumePublicRead(db, requesterKey) {
    const key = `estimate-public:${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(requesterKey).digest("hex")}`;
    const now = Date.now();
    const [bucket] = await db("rateLimits").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        key,
        count: 1,
        lastRequest: now
    }).onConflict("key").merge({
        count: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count + 1 END', [
            now - 60_000
        ]),
        lastRequest: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END', [
            now - 60_000,
            now
        ])
    }).returning("count");
    return bucket.count <= 60;
}
}),
"[project]/packages/data/src/estimates/chat-sharing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateShareChatBinding",
    ()=>estimateShareChatBinding,
    "estimateShareChatEvidenceAllowed",
    ()=>estimateShareChatEvidenceAllowed,
    "operateEstimateChatShare",
    ()=>operateEstimateChatShare,
    "proposeEstimateChatShare",
    ()=>proposeEstimateChatShare,
    "readEstimateChatShare",
    ()=>readEstimateChatShare,
    "refreshEstimateChatShareRecipient",
    ()=>refreshEstimateChatShareRecipient,
    "visibleEstimateChatShare",
    ()=>visibleEstimateChatShare
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-sharing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-share-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing.ts [app-route] (ecmascript) <locals>");
;
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This sharing proposal changed or expired. Request a fresh review.");
function estimateShareChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.snapshotHash
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateShareAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
async function reviewFor(trx, context, id) {
    const sharing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readEstimateSharingReviewInTransaction"])(trx, context, id);
    const record = sharing.estimate.parent;
    if (!record.href) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const parent = await trx(record.type === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: record.id
    }).first("version");
    if (!parent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        sharing,
        parent: {
            type: record.type,
            id: record.id,
            version: Number(parent.version)
        }
    };
}
async function prepare(trx, context, id, mode, email) {
    const { sharing, parent } = await reviewFor(trx, context, id);
    if (!sharing.canSend) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const estimate = sharing.estimate;
    if (estimate.archived || (mode === "resend" ? estimate.status !== "sent" : estimate.status !== "draft")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Send and Publish require a saved unarchived Draft. Resend requires an active Sent Estimate.");
    }
    if (mode === "resend" && (sharing.delivery.link.state !== "active" || [
        "not-sent",
        "queued"
    ].includes(sharing.delivery.email.state))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Wait for the queued email to finish. Only active Sent Estimates without queued mail can be resent.");
    }
    const paper = mode === "resend" ? sharing.paper : sharing.draftPaper;
    if (!paper || !sharing.snapshotHash || sharing.issues.length) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](sharing.issues.join(" ") || "Complete the saved customer paper in the editor before sharing.");
    }
    const recipientEmail = email ?? (mode === "resend" && sharing.delivery.email.state !== "not-sent" ? sharing.delivery.email.recipientEmail : estimate.values.details.recipientEmail);
    if (mode !== "publish" && !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateEmailDestinationSchema"].safeParse({
        recipientEmail,
        subject: sharing.subject
    }).success) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Review and save a valid email destination before sending.");
    }
    const now = new Date();
    const ticket = {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        actionType: `estimate.${mode}`,
        inputHash: "0".repeat(64),
        authorizationVersion: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 900000).toISOString(),
        state: "pending",
        estimate: {
            id,
            version: estimate.version,
            number: estimate.number,
            revision: estimate.revision,
            name: paper.content.name,
            status: estimate.status,
            archived: estimate.archived,
            totalCents: paper.amounts.totalCents,
            validUntil: paper.content.validUntil
        },
        snapshotHash: sharing.snapshotHash,
        requiresDialog: mode !== "send" || sharing.revision !== null
    };
    const payload = {
        ticket,
        receipt: null,
        stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
        review: {
            today: sharing.today,
            parent,
            recipientName: paper.content.recipientName,
            recipientEmail,
            subject: sharing.subject,
            snapshot: {
                formatVersion: 1,
                content: paper.content,
                amounts: paper.amounts
            },
            revision: mode === "resend" ? null : sharing.revision,
            delivery: sharing.delivery
        }
    };
    ticket.inputHash = inputHash(payload);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatStoredSchema"].parse(payload);
}
async function insert(trx, context, turn, payload) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
    const [row] = await trx("chatEstimateShares").insert({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id: payload.ticket.id,
        turnId: turn.id,
        threadId: turn.threadId,
        payload: JSON.stringify(payload),
        createdAt: trx.raw("clock_timestamp()")
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({
        id: turn.id
    }).update({
        estimateStamp: payload.stamp
    });
    return payload;
}
async function current(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context)) throw conflict();
    const { sharing, parent } = await reviewFor(trx, context, payload.ticket.estimate.id);
    if (sharing.estimate.version !== payload.ticket.estimate.version || sharing.snapshotHash !== payload.ticket.snapshotHash || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(parent) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review.parent) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSnapshotHash"])(payload.review.snapshot) !== payload.ticket.snapshotHash) throw conflict();
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateShareChatBinding(row.payload.ticket))) throw conflict();
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        receipt: payload.receipt
    });
}
async function proposeEstimateChatShare(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const id = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const payload = await prepare(trx, context, id, request.operation);
        await insert(trx, context, turn, payload);
        signal.throwIfAborted();
        return payload.ticket;
    });
}
async function visibleEstimateChatShare(trx, context, turnId) {
    const row = await trx("chatEstimateShares").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatStoredSchema"].parse(row.payload);
        if (row.state === "confirmed") {
            if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context) || payload.ticket.inputHash !== inputHash(payload) || !payload.receipt) return undefined;
            const { sharing } = await reviewFor(trx, context, payload.receipt.estimateId);
            if (sharing.estimate.version !== payload.receipt.version || sharing.snapshotHash !== payload.receipt.snapshotHash) return undefined;
            return publicView(payload, "confirmed");
        }
        await current(trx, context, row);
        return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]) return undefined;
        throw error;
    }
}
async function readEstimateChatShare(db, identity, enabled, raw) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatBindingSchema"].parse(raw);
        const row = await trx("chatEstimateShares").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        const view = await visibleEstimateChatShare(trx, context, row.turnId);
        if (!view || view.ticket.id !== row.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return view;
    });
}
async function operateEstimateChatShare(db, identity, enabled, raw, decision, paymentLinkReviewed) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatBindingSchema"].parse(raw);
        const row = await trx("chatEstimateShares").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visibleEstimateChatShare(trx, context, row.turnId);
            if (!view || view.ticket.id !== row.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            return {
                view,
                ...decision === "open" ? {
                    href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (row.state !== "pending" || decision === "open") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            const revision = payload.review.revision;
            const receipt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shareEstimateInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                estimateId: payload.ticket.estimate.id,
                expectedVersion: payload.ticket.estimate.version,
                submissionId: row.id,
                snapshotHash: payload.ticket.snapshotHash,
                mode: payload.ticket.actionType.slice("estimate.".length),
                ...payload.ticket.actionType !== "estimate.publish" ? {
                    recipientEmail: payload.review.recipientEmail,
                    subject: payload.review.subject
                } : {},
                ...revision ? {
                    revisionReview: {
                        sourceEstimateId: revision.sourceEstimateId,
                        sourceVersion: revision.sourceVersion,
                        paymentLinkReviewed
                    }
                } : {}
            }, "assistant-confirmed");
            payload.receipt = receipt;
        }
        payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
        await trx("chatEstimateShares").where({
            id: row.id
        }).update({
            state: payload.ticket.state,
            payload: JSON.stringify(payload),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, payload.ticket.state);
        return {
            view: publicView(payload)
        };
    });
}
async function refreshEstimateChatShareRecipient(db, identity, enabled, raw, email) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatBindingSchema"].parse(raw);
        const row = await trx("chatEstimateShares").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        const payload = await current(trx, context, row);
        if (row.state !== "pending" || payload.ticket.actionType !== "estimate.resend" || Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        const next = await prepare(trx, context, payload.ticket.estimate.id, "resend", email);
        return publicView(await insert(trx, context, turn, next));
    });
}
async function estimateShareChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateShares").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").first();
    if (!row) return true;
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateShareChatStoredSchema"].parse(row.payload);
        return payload.ticket.authorizationVersion === await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context) && (row.state !== "pending" || Date.parse(payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]) return false;
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/decisions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readEstimateDecisionReview",
    ()=>readEstimateDecisionReview,
    "readEstimateDecisionReviewInTransaction",
    ()=>readEstimateDecisionReviewInTransaction,
    "recordEstimateDecision",
    ()=>recordEstimateDecision,
    "recordEstimateDecisionInTransaction",
    ()=>recordEstimateDecisionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-decision.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/delivery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
async function decisionContext(trx, context, estimateId) {
    const loaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, estimateId);
    const frozen = await trx("estimate_snapshots").where({
        workspaceId: context.workspaceId,
        estimateId
    }).first();
    const snapshot = frozen && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(frozen.content, frozen.contentHash);
    if (!frozen || !snapshot || snapshot.content.number !== `EST-${String(loaded.row.estimateNumber).padStart(4, "0")}` || snapshot.content.revision !== loaded.row.revision) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The frozen estimate is unavailable. Reload before recording a decision.");
    }
    const previous = await trx("estimate_decisions").where({
        workspaceId: context.workspaceId,
        estimateId
    }).orderBy("estimateVersion", "desc").select("*", trx.raw(`to_char("decisionDate", 'YYYY-MM-DD') AS "decisionDate"`)).first();
    const decision = previous ? {
        id: previous.id,
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateRecordedDecisionSchema"].parse({
            outcome: previous.outcome,
            decisionDate: previous.decisionDate,
            channel: previous.channel,
            note: previous.note
        })
    } : null;
    if (decision && (decision.outcome !== loaded.status && loaded.status !== "superseded" || previous.estimateVersion > loaded.row.version || previous.snapshotId !== frozen.id || Number(previous.snapshotTotalCents) !== snapshot.amounts.totalCents)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The saved decision does not match this estimate. Reload before confirming.");
    }
    return {
        ...loaded,
        frozen,
        snapshot,
        decision
    };
}
async function convertedJob(trx, context, estimateId) {
    const job = await trx("jobs").where({
        workspaceId: context.workspaceId,
        acceptedEstimateId: estimateId
    }).first();
    if (!job) return null;
    const team = await trx("jobTeamMembers").where({
        workspaceId: context.workspaceId,
        jobId: job.id
    }).pluck("userId");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.read",
        resource: {
            kind: "job",
            id: job.id,
            workspaceId: context.workspaceId,
            ownerId: job.primaryOwnerId,
            teamUserIds: team
        }
    }).allowed) return null;
    return {
        number: `J-${String(job.jobNumber).padStart(4, "0")}`,
        href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(context.workspaceId)}`
    };
}
function canConvertToJob(context, lead) {
    const customerScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "customers.read");
    const resource = {
        kind: "job",
        id: context.workspaceId,
        workspaceId: context.workspaceId,
        ownerId: context.userId,
        teamUserIds: []
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.create"
    }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.assign",
        resource
    }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "jobs.read").allowed && customerScope.allowed && customerScope.scope === "workspace" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "leads.read",
        resource: {
            kind: "lead",
            id: lead.id,
            workspaceId: context.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed;
}
async function readEstimateDecisionReview(db, identity, enabled, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, (trx, context)=>readEstimateDecisionReviewInTransaction(trx, context, estimateId));
}
async function readEstimateDecisionReviewInTransaction(trx, context, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    const { row, status, timezone, today, canDecide, canCorrectDecision, frozen, snapshot, decision } = await decisionContext(trx, context, estimateId);
    const convertedJobExists = !!await trx("jobs").where({
        workspaceId: context.workspaceId,
        acceptedEstimateId: estimateId
    }).first("id");
    const lead = row.parentType === "lead" && row.leadId ? await trx("leads").where({
        workspaceId: context.workspaceId,
        id: row.leadId
    }).first("id", "ownerId", "archivedAt") : undefined;
    const sourceLeadHasJob = !!lead && !!await trx("jobs").where({
        workspaceId: context.workspaceId,
        sourceLeadId: lead.id
    }).first("id");
    return {
        estimate: {
            id: row.id,
            number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
            revision: row.revision,
            version: row.version,
            name: snapshot.content.name,
            recipientName: snapshot.content.recipientName,
            totalCents: snapshot.amounts.totalCents,
            status,
            archived: row.archivedAt !== null,
            decision
        },
        snapshotHash: frozen.contentHash,
        timezone,
        today,
        canDecide,
        canCorrectDecision,
        canConvertToJob: status === "accepted" && !row.archivedAt && row.parentType === "lead" && !!lead && !lead.archivedAt && !convertedJobExists && !sourceLeadHasJob && canConvertToJob(context, lead),
        convertedJob: await convertedJob(trx, context, estimateId)
    };
}
async function recordEstimateDecision(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>recordEstimateDecisionInTransaction(trx, context, input));
}
async function recordEstimateDecisionInTransaction(trx, context, raw, source = "ui") {
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { row, status, canDecide, canCorrectDecision, today, timezone, frozen, snapshot, decision } = await decisionContext(trx, context, input.estimateId);
    if (!canDecide || input.mode === "correct" && !canCorrectDecision) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const inputHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts").where({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId
    }).first();
    if (prior) {
        if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId || prior.operation !== "decision" || prior.inputHash !== inputHash || prior.version !== row.version || !decision || decision.outcome !== input.outcome || input.snapshotHash !== frozen.contentHash) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This confirmation was already used or the recorded decision changed. Reload and review.");
        }
        return {
            estimateId: row.id,
            decisionId: decision.id,
            status: decision.outcome,
            version: row.version,
            updatedAt: row.updatedAt.toISOString()
        };
    }
    if (row.version !== input.expectedVersion || input.snapshotHash !== frozen.contentHash || input.expectedDecisionId !== (decision?.id ?? null)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    if (row.archivedAt || (input.mode === "record" ? ![
        "sent",
        "published"
    ].includes(status) || !!decision : ![
        "accepted",
        "declined"
    ].includes(status) || !decision)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](input.mode === "record" ? "Only an active Sent or Published estimate can receive a decision." : "Only an active Accepted or Declined estimate with a saved decision can be corrected.");
    }
    if (input.decisionDate > today) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The decision date cannot be later than today in the workspace timezone.");
    const decisionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const version = row.version + 1;
    await trx("estimate_decisions").insert({
        id: decisionId,
        workspaceId: identity.workspaceId,
        estimateId: row.id,
        snapshotId: frozen.id,
        previousDecisionId: decision?.id ?? null,
        estimateVersion: version,
        outcome: input.outcome,
        decisionDate: input.decisionDate,
        channel: input.channel,
        note: input.note,
        reason: input.mode === "correct" ? input.reason : null,
        snapshotTotalCents: snapshot.amounts.totalCents,
        actorId: identity.userId
    });
    const [updated] = await trx("estimates").where({
        workspaceId: identity.workspaceId,
        id: row.id,
        version: input.expectedVersion
    }).update({
        status: input.outcome,
        decidedAt: trx.raw("(?::date)::timestamp AT TIME ZONE ?", [
            input.decisionDate,
            timezone
        ]),
        decidedBy: identity.userId,
        decisionChannel: input.channel,
        decisionNote: input.note,
        acceptedTotalCents: input.outcome === "accepted" ? snapshot.amounts.totalCents : null,
        version,
        updatedAt: trx.fn.now()
    }).returning([
        "updatedAt"
    ]);
    if (!updated) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stopEstimateDeliveries"])(trx, identity.workspaceId, row.id);
    const actor = await trx("users").where({
        id: identity.userId
    }).first("name");
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        estimateId: row.id,
        actorId: identity.userId,
        actorName: actor.name,
        source,
        type: input.mode === "record" ? "decision-recorded" : "decision-corrected",
        changes: JSON.stringify({
            status: {
                before: status,
                after: input.outcome
            },
            decision: {
                outcome: input.outcome,
                decisionDate: input.decisionDate,
                channel: input.channel,
                note: input.note
            },
            ...input.mode === "correct" ? {
                reason: input.reason
            } : {}
        })
    });
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyEstimateRecipients"])(trx, {
        workspaceId: identity.workspaceId,
        estimateId: row.id,
        event: "decision_recorded",
        dedupeKey: `estimate:${row.id}:decision:${decisionId}`,
        actorId: identity.userId
    }, context.enabledPermissions);
    await trx("estimate_operation_receipts").insert({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId,
        actorId: identity.userId,
        operation: "decision",
        inputHash,
        estimateId: row.id,
        version
    });
    return {
        estimateId: row.id,
        decisionId,
        status: input.outcome,
        version,
        updatedAt: updated.updatedAt.toISOString()
    };
}
}),
"[project]/packages/data/src/estimates/chat-decisions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDecisionChatBinding",
    ()=>estimateDecisionChatBinding,
    "estimateDecisionChatEvidenceAllowed",
    ()=>estimateDecisionChatEvidenceAllowed,
    "operateEstimateChatDecision",
    ()=>operateEstimateChatDecision,
    "proposeEstimateChatDecision",
    ()=>proposeEstimateChatDecision,
    "readEstimateChatDecision",
    ()=>readEstimateChatDecision,
    "visibleEstimateChatDecision",
    ()=>visibleEstimateChatDecision
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-decision-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$decisions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/decisions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This decision proposal changed or expired. Request a fresh review.");
function estimateDecisionChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.snapshotHash
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        value: payload.value,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateDecisionAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
async function reviewFor(trx, context, estimateId) {
    const decision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$decisions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDecisionReviewInTransaction"])(trx, context, estimateId);
    const row = await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: estimateId
    }).first("parentType", "leadId", "jobId");
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
    if (!parentId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateParentInTransaction"])(trx, context, row.parentType, parentId);
    const parent = await trx(row.parentType === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: parentId
    }).first("version");
    if (!parent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        snapshotHash: decision.snapshotHash,
        review: {
            estimate: decision.estimate,
            today: decision.today,
            timezone: decision.timezone,
            canDecide: decision.canDecide,
            canCorrectDecision: decision.canCorrectDecision,
            parent: {
                type: row.parentType,
                id: parentId,
                version: Number(parent.version)
            }
        }
    };
}
async function prepare(trx, context, estimateId, request) {
    const { review, snapshotHash } = await reviewFor(trx, context, estimateId);
    const mode = request.operation === "decision" ? "record" : "correct";
    if (!review.canDecide || mode === "correct" && !review.canCorrectDecision) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const saved = review.estimate, decision = saved.decision;
    const estimate = {
        id: saved.id,
        version: saved.version,
        number: saved.number,
        revision: saved.revision,
        name: saved.name,
        status: saved.status,
        archived: saved.archived,
        totalCents: saved.totalCents
    };
    if (estimate.archived || (mode === "record" ? ![
        "sent",
        "published"
    ].includes(estimate.status) || decision !== null : ![
        "accepted",
        "declined"
    ].includes(estimate.status) || decision === null)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](mode === "record" ? "Only an active Sent or Published Estimate can receive a decision." : "Only an active Accepted or Declined Estimate with a saved decision can be corrected.");
    }
    if (mode === "record" && request.reason !== null) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("A correction reason is only supported when correcting a saved decision.");
    }
    const previous = mode === "correct" ? decision : null;
    const now = new Date();
    const ticket = {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        actionType: "estimate.decision",
        mode,
        inputHash: "0".repeat(64),
        authorizationVersion: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 900000).toISOString(),
        state: "pending",
        estimate,
        snapshotHash
    };
    const fields = {
        estimateId,
        expectedVersion: estimate.version,
        outcome: request.outcome ?? previous?.outcome ?? "",
        decisionDate: request.decisionDate ?? previous?.decisionDate ?? "",
        channel: request.channel ?? previous?.channel ?? "",
        note: request.note ?? previous?.note ?? "",
        reason: request.reason ?? ""
    };
    const payload = {
        ticket,
        review,
        value: fields,
        canConfirm: !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatCommand"])({
            ticket,
            review,
            value: fields
        }, context.workspaceId),
        receipt: null,
        stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context)
    };
    ticket.inputHash = inputHash(payload);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatStoredSchema"].parse(payload);
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateDecisionChatBinding(row.payload.ticket))) throw conflict();
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        value: payload.value,
        canConfirm: payload.canConfirm,
        receipt: payload.receipt
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return payload;
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context)) throw conflict();
    const current = await reviewFor(trx, context, payload.ticket.estimate.id);
    if (current.snapshotHash !== payload.ticket.snapshotHash || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(current.review) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review)) throw conflict();
    return payload;
}
async function visible(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (row.state === "confirmed") {
        const receipt = payload.receipt;
        if (!receipt) throw conflict();
        const { review, snapshotHash } = await reviewFor(trx, context, receipt.estimateId);
        if (review.estimate.archived || review.estimate.version !== receipt.version || review.estimate.decision?.id !== receipt.decisionId || review.estimate.status !== receipt.status || snapshotHash !== payload.ticket.snapshotHash || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(review.parent) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review.parent)) throw conflict();
        return publicView(payload, "confirmed");
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatDecision(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const payload = await prepare(trx, context, estimateId, request);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
        const [row] = await trx("chatEstimateDecisions").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: payload.ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(payload),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return payload.ticket;
    });
}
async function visibleEstimateChatDecision(trx, context, turnId) {
    const row = await trx("chatEstimateDecisions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]) return undefined;
        throw error;
    }
}
async function readEstimateChatDecision(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateDecisions").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        return visible(trx, context, row);
    });
}
async function operateEstimateChatDecision(db, identity, enabled, raw, decision) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateDecisions").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true);
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visible(trx, context, row);
            return {
                view,
                ...decision === "open" ? {
                    href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (row.state !== "pending" || decision === "open") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            const command = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDecisionChatCommand"])(payload, context.workspaceId);
            if (!payload.canConfirm || !command) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Provide the missing outcome, absolute date, channel or correction reason and request a fresh review before confirming.");
            }
            payload.receipt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$decisions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordEstimateDecisionInTransaction"])(trx, context, command, "assistant-confirmed");
        }
        payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
        await trx("chatEstimateDecisions").where({
            id: row.id
        }).update({
            state: payload.ticket.state,
            payload: JSON.stringify(payload),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, payload.ticket.state);
        return {
            view: publicView(payload)
        };
    });
}
async function estimateDecisionChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateDecisions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").first();
    if (!row) return true;
    try {
        const payload = await checkedPayload(trx, context, row);
        return row.state !== "pending" || Date.parse(payload.ticket.expiresAt) > Date.now();
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]) return false;
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/chat-draft-actions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftActionChatBinding",
    ()=>estimateDraftActionChatBinding,
    "estimateDraftActionChatEvidenceAllowed",
    ()=>estimateDraftActionChatEvidenceAllowed,
    "operateEstimateChatDraftAction",
    ()=>operateEstimateChatDraftAction,
    "proposeEstimateChatDraftAction",
    ()=>proposeEstimateChatDraftAction,
    "readEstimateChatDraftAction",
    ()=>readEstimateChatDraftAction,
    "visibleEstimateChatDraftAction",
    ()=>visibleEstimateChatDraftAction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-action-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This Draft action changed or expired. Request a fresh review.");
const operation = (ticket)=>ticket.actionType === "estimate.revise" ? "revise" : "duplicate";
function estimateDraftActionChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.source.id,
        expectedVersion: ticket.source.version
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateDraftActionAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        receipt: payload.receipt
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending") || payload.ticket.reviewHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review) || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateDraftActionChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    const review = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDraftActionReviewInTransaction"])(trx, context, operation(payload.ticket), payload.ticket.source.id);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(review) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        source: payload.ticket.source,
        plan: payload.ticket.plan,
        ...payload.review
    })) throw conflict();
    return payload;
}
async function checkedResult(trx, context, payload) {
    const { receipt, ticket } = payload;
    if (!receipt) throw conflict();
    const { source, plan, ...review } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDraftActionReviewInTransaction"])(trx, context, operation(ticket), ticket.source.id);
    if (payload.resultStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(source) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(ticket.source) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatReviewSchema"].parse(review)) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review) || operation(ticket) === "revise" && plan.existingDraft?.id !== receipt.id) throw conflict();
    const seed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateEditorInTransaction"])(trx, context, receipt.id);
    const saved = seed.estimate;
    const lineage = await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: receipt.id
    }).first("sourceEstimateId");
    if (!saved || saved.id !== receipt.id || saved.number !== receipt.number || saved.revision !== receipt.revision || saved.version !== receipt.version || saved.updatedAt !== receipt.updatedAt || saved.status !== "draft" || saved.archived || saved.parent.id !== payload.review.parent.id || saved.parent.type !== payload.review.parent.type || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(saved.values) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review.values) || !lineage || lineage.sourceEstimateId !== (operation(ticket) === "revise" ? ticket.source.id : null)) throw conflict();
}
async function visible(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (row.state === "confirmed") {
        await checkedResult(trx, context, payload);
        return publicView(payload);
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatDraftAction(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const authorizationVersion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        let estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        if (request.operation === "revise" && ref?.toUpperCase().startsWith("EST-")) {
            const latest = await trx("estimates").where({
                workspaceId: context.workspaceId,
                id: estimateId
            }).first("status", "sourceEstimateId");
            if (latest?.status === "draft" && latest.sourceEstimateId) estimateId = latest.sourceEstimateId;
        }
        const prepared = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDraftActionReviewInTransaction"])(trx, context, request.operation, estimateId);
        const { source, plan, ...review } = prepared;
        const now = new Date();
        const ticket = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            actionType: request.operation === "revise" ? "estimate.revise" : "estimate.duplicate",
            inputHash: "0".repeat(64),
            reviewHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(review),
            authorizationVersion,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            state: "pending",
            source,
            plan
        };
        const payload = {
            ticket,
            review,
            receipt: null,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
            resultStamp: null
        };
        ticket.inputHash = inputHash(payload);
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatStoredSchema"].parse(payload);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
        const [row] = await trx("chatEstimateDraftActions").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(stored),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return stored.ticket;
    });
}
async function visibleEstimateChatDraftAction(trx, context, turnId) {
    const row = await trx("chatEstimateDraftActions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return undefined;
        throw error;
    }
}
async function readEstimateChatDraftAction(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateDraftActions").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return visible(trx, context, row);
    });
}
async function operateEstimateChatDraftAction(db, identity, enabled, raw, decision) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatBindingSchema"].parse(raw);
    decision = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatDecisionSchema"].shape.decision.parse(decision);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateDraftActions").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visible(trx, context, row);
            return {
                view,
                ...decision === "open" && view.receipt ? {
                    href: `/estimates/${view.receipt.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (row.state !== "pending" || decision === "open") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            const command = {
                workspaceId: context.workspaceId,
                estimateId: payload.ticket.source.id,
                expectedVersion: payload.ticket.source.version,
                submissionId: row.id
            };
            const receipt = operation(payload.ticket) === "revise" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reviseEstimateInTransaction"])(trx, context, {
                ...command,
                snapshotHash: payload.review.snapshotHash
            }, "assistant-confirmed") : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["duplicateEstimateInTransaction"])(trx, context, command, "assistant-confirmed");
            payload.receipt = {
                ...receipt,
                reused: payload.ticket.plan.kind === "reuse"
            };
            payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context);
            await checkedResult(trx, context, payload);
        }
        payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftActionChatStoredSchema"].parse(payload);
        await trx("chatEstimateDraftActions").where({
            id: row.id
        }).update({
            state: stored.ticket.state,
            payload: JSON.stringify(stored),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, stored.ticket.state);
        return {
            view: publicView(stored)
        };
    });
}
async function estimateDraftActionChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateDraftActions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return true;
    try {
        await visible(trx, context, row);
        return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return false;
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/lifecycle.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readEstimateLifecycle",
    ()=>readEstimateLifecycle,
    "setEstimateArchived",
    ()=>setEstimateArchived,
    "setEstimateArchivedInTransaction",
    ()=>setEstimateArchivedInTransaction,
    "voidEstimate",
    ()=>voidEstimate,
    "voidEstimateInTransaction",
    ()=>voidEstimateInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/delivery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$history$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/history.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function readEstimateLifecycle(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateHistoryQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const { row, status, timezone, canVoid } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, input.estimateId);
        const history = trx("estimate_activity").where({
            workspaceId: identity.workspaceId,
            estimateId: row.id
        });
        const total = Number((await history.clone().count({
            count: "*"
        }).first())?.count ?? 0);
        if (input.before) history.whereRaw('("createdAt", id) < (?::timestamptz, ?::uuid)', [
            input.before.createdAt,
            input.before.id
        ]);
        const rows = await history.select("id", "source", "actorName", "type", "changes", trx.raw(`to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"`)).orderBy("createdAt", "desc").orderBy("id", "desc").limit(26);
        const page = rows.slice(0, 25);
        const last = page.at(-1);
        return {
            estimate: {
                id: row.id,
                number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
                revision: row.revision,
                version: row.version,
                name: row.name,
                recipientName: row.recipientName,
                status,
                archived: row.archivedAt !== null
            },
            canVoid,
            timezone,
            events: page.map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$history$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projectEstimateActivity"]),
            total,
            nextCursor: rows.length > 25 && last ? {
                createdAt: last.createdAt,
                id: last.id
            } : null
        };
    });
}
async function voidEstimate(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voidEstimateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>voidEstimateInTransaction(trx, context, input));
}
async function voidEstimateInTransaction(trx, context, raw, source = "ui") {
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voidEstimateSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { row, status, canVoid } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, input.estimateId);
    if (!canVoid) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const inputHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts").where({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId
    }).first();
    if (prior) {
        if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId || prior.operation !== "void" || prior.inputHash !== inputHash) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This confirmation was already used for a different request.");
        }
        if (row.status !== "void" || row.version !== prior.version) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The withdrawn estimate changed. Reload its current details.");
        }
        return {
            estimateId: row.id,
            status: "void",
            version: row.version,
            updatedAt: row.updatedAt.toISOString()
        };
    }
    if (row.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    if (row.archivedAt || ![
        "sent",
        "published"
    ].includes(status)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an active Sent or Published estimate can be withdrawn.");
    }
    const [updated] = await trx("estimates").where({
        workspaceId: identity.workspaceId,
        id: row.id,
        version: input.expectedVersion
    }).update({
        status: "void",
        voidReason: input.reason,
        version: row.version + 1,
        updatedAt: trx.fn.now()
    }).returning([
        "version",
        "updatedAt"
    ]);
    if (!updated) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    await trx("estimate_share_tokens").where({
        workspaceId: identity.workspaceId,
        estimateId: row.id
    }).whereNull("revokedAt").update({
        revokedAt: trx.fn.now()
    });
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stopEstimateDeliveries"])(trx, identity.workspaceId, row.id);
    const actor = await trx("users").where({
        id: identity.userId
    }).first("name");
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        estimateId: row.id,
        actorId: identity.userId,
        actorName: actor.name,
        source,
        type: "voided",
        changes: JSON.stringify({
            status: {
                before: status,
                after: "void"
            },
            reason: input.reason
        })
    });
    await trx("estimate_operation_receipts").insert({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId,
        actorId: identity.userId,
        operation: "void",
        inputHash,
        estimateId: row.id,
        version: updated.version
    });
    return {
        estimateId: row.id,
        status: "void",
        version: updated.version,
        updatedAt: updated.updatedAt.toISOString()
    };
}
async function setEstimateArchived(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, (trx, context)=>setEstimateArchivedInTransaction(trx, context, input));
}
async function setEstimateArchivedInTransaction(trx, context, raw, source = "ui") {
    const identity = {
        userId: context.userId,
        workspaceId: context.workspaceId
    };
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { row, status, canArchive } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, input.estimateId);
    if (!canArchive) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const archived = input.mode === "archive";
    const inputHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts").where({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId
    }).first();
    if (prior) {
        if (prior.actorId !== identity.userId || prior.estimateId !== row.id || prior.operation !== input.mode || prior.inputHash !== inputHash) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This confirmation was already used for a different request.");
        }
        if (row.version !== prior.version || row.archivedAt !== null !== archived) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The estimate changed. Reload its current details.");
        }
        return {
            estimateId: row.id,
            version: row.version,
            archived,
            updatedAt: row.updatedAt.toISOString()
        };
    }
    if (row.version !== input.expectedVersion) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    if (archived) {
        if (row.archivedAt || ![
            "declined",
            "expired",
            "superseded",
            "void"
        ].includes(status)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an unarchived Declined, Expired, Superseded or Void estimate can be archived.");
        }
    } else if (!row.archivedAt) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an archived estimate can be restored.");
    }
    const [updated] = await trx("estimates").where({
        workspaceId: identity.workspaceId,
        id: row.id,
        version: input.expectedVersion
    }).update({
        archivedAt: archived ? trx.fn.now() : null,
        archivedBy: archived ? identity.userId : null,
        version: row.version + 1,
        updatedAt: trx.fn.now()
    }).returning([
        "version",
        "updatedAt"
    ]);
    if (!updated) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]();
    const actor = await trx("users").where({
        id: identity.userId
    }).first("name");
    await trx("estimate_activity").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: identity.workspaceId,
        estimateId: row.id,
        actorId: identity.userId,
        actorName: actor.name,
        source,
        type: archived ? "archived" : "restored",
        changes: JSON.stringify({})
    });
    await trx("estimate_operation_receipts").insert({
        workspaceId: identity.workspaceId,
        submissionId: input.submissionId,
        actorId: identity.userId,
        operation: input.mode,
        inputHash,
        estimateId: row.id,
        version: updated.version
    });
    return {
        estimateId: row.id,
        version: updated.version,
        archived,
        updatedAt: updated.updatedAt.toISOString()
    };
}
}),
"[project]/packages/data/src/estimates/chat-voids.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateVoidChatBinding",
    ()=>estimateVoidChatBinding,
    "estimateVoidChatEvidenceAllowed",
    ()=>estimateVoidChatEvidenceAllowed,
    "operateEstimateChatVoid",
    ()=>operateEstimateChatVoid,
    "proposeEstimateChatVoid",
    ()=>proposeEstimateChatVoid,
    "readEstimateChatVoid",
    ()=>readEstimateChatVoid,
    "visibleEstimateChatVoid",
    ()=>visibleEstimateChatVoid
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-void-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This Void proposal changed or expired. Request a fresh review.");
function estimateVoidChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        snapshotHash: ticket.snapshotHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        canConfirm: payload.canConfirm,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateVoidAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
async function reviewFor(trx, context, estimateId) {
    const loaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, estimateId);
    const { row } = loaded;
    if (!loaded.canVoid) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const frozen = await trx("estimate_snapshots").where({
        workspaceId: context.workspaceId,
        estimateId
    }).first();
    const snapshot = frozen && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(frozen.content, frozen.contentHash);
    const number = `EST-${String(row.estimateNumber).padStart(4, "0")}`;
    if (!snapshot || snapshot.content.number !== number || snapshot.content.revision !== row.revision) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The frozen Estimate is unavailable. Reload before withdrawing it.");
    }
    const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
    if (!parentId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { parent } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateParentInTransaction"])(trx, context, row.parentType, parentId);
    const savedParent = await trx(row.parentType === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: parentId
    }).first("version");
    if (!savedParent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        row,
        status: loaded.status,
        snapshotHash: frozen.contentHash,
        estimate: {
            id: row.id,
            version: row.version,
            number,
            revision: row.revision,
            name: snapshot.content.name,
            status: loaded.status,
            archived: row.archivedAt !== null
        },
        review: {
            recipientName: snapshot.content.recipientName,
            totalCents: snapshot.amounts.totalCents,
            parent: {
                type: parent.type,
                id: parent.id,
                version: Number(savedParent.version),
                number: parent.number,
                name: parent.name
            },
            today: loaded.today,
            timezone: loaded.timezone
        }
    };
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        canConfirm: payload.canConfirm,
        receipt: payload.receipt
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload) || payload.ticket.reviewHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review) || payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending")) throw conflict();
    if (!await trx("chatTurns").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id: row.turnId,
        threadId: row.threadId
    }).first("id")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateVoidChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    const next = await reviewFor(trx, context, payload.ticket.estimate.id);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || next.snapshotHash !== payload.ticket.snapshotHash || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.estimate) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.ticket.estimate) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ...next.review,
        reason: payload.review.reason
    }) !== payload.ticket.reviewHash) throw conflict();
    return payload;
}
async function checkedResult(trx, context, payload) {
    const { receipt, ticket } = payload;
    if (!receipt) throw conflict();
    const next = await reviewFor(trx, context, ticket.estimate.id);
    if (payload.resultStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || next.snapshotHash !== ticket.snapshotHash || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.estimate) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ...ticket.estimate,
        status: "void",
        version: receipt.version
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ...next.review,
        reason: payload.review.reason
    }) !== ticket.reviewHash || next.row.voidReason !== payload.review.reason || next.row.updatedAt.toISOString() !== receipt.updatedAt) throw conflict();
}
async function visible(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (row.state === "confirmed") {
        await checkedResult(trx, context, payload);
        return publicView(payload);
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatVoid(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const authorizationVersion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const prepared = await reviewFor(trx, context, estimateId);
        if (prepared.estimate.archived || ![
            "sent",
            "published"
        ].includes(prepared.status)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an active Sent or Published Estimate can be withdrawn.");
        }
        if (request.reason !== null) {
            const message = await trx("chatMessages").where({
                turnId,
                role: "user"
            }).first("text");
            if (!message || !message.text.includes(request.reason)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Quote a withdrawal reason supplied in the current user message, or request the missing reason.");
            }
        }
        const now = new Date();
        const review = {
            ...prepared.review,
            reason: request.reason ?? ""
        };
        const ticket = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatViewSchema"].shape.ticket.parse({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            actionType: "estimate.void",
            inputHash: "0".repeat(64),
            reviewHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(review),
            authorizationVersion,
            snapshotHash: prepared.snapshotHash,
            state: "pending",
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            estimate: prepared.estimate
        });
        const payload = {
            ticket,
            review,
            canConfirm: review.reason.length > 0,
            receipt: null,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
            resultStamp: null
        };
        ticket.inputHash = inputHash(payload);
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatStoredSchema"].parse(payload);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
        const [row] = await trx("chatEstimateVoids").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(stored),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return ticket;
    });
}
async function visibleEstimateChatVoid(trx, context, turnId) {
    const row = await trx("chatEstimateVoids").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return undefined;
        throw error;
    }
}
async function readEstimateChatVoid(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateVoids").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return visible(trx, context, row);
    });
}
async function operateEstimateChatVoid(db, identity, enabled, raw, decision) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatBindingSchema"].parse(raw);
    decision = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatDecisionSchema"].shape.decision.parse(decision);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateVoids").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visible(trx, context, row);
            return {
                view,
                ...decision === "open" ? {
                    href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (row.state !== "pending" || decision === "open") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            if (!payload.canConfirm) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Provide a withdrawal reason and request a fresh review before confirming.");
            payload.receipt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voidEstimateInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                estimateId: payload.ticket.estimate.id,
                expectedVersion: payload.ticket.estimate.version,
                submissionId: row.id,
                reason: payload.review.reason
            }, "assistant-confirmed");
            payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context);
            await checkedResult(trx, context, payload);
        }
        const state = decision === "confirm" ? "confirmed" : "cancelled";
        payload.ticket.state = state;
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateVoidChatStoredSchema"].parse(payload);
        await trx("chatEstimateVoids").where({
            id: row.id
        }).update({
            state: stored.ticket.state,
            payload: JSON.stringify(stored),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, state);
        return {
            view: publicView(stored)
        };
    });
}
async function estimateVoidChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateVoids").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return true;
    try {
        await visible(trx, context, row);
        return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return false;
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/chat-archives.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateArchiveChatBinding",
    ()=>estimateArchiveChatBinding,
    "estimateArchiveChatEvidenceAllowed",
    ()=>estimateArchiveChatEvidenceAllowed,
    "operateEstimateChatArchive",
    ()=>operateEstimateChatArchive,
    "proposeEstimateChatArchive",
    ()=>proposeEstimateChatArchive,
    "readEstimateChatArchive",
    ()=>readEstimateChatArchive,
    "visibleEstimateChatArchive",
    ()=>visibleEstimateChatArchive
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-archive-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/lifecycle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This Archive/Restore proposal changed or expired. Request a fresh review.");
const operation = (ticket)=>ticket.actionType === "estimate.archive" ? "archive" : "restore";
function estimateArchiveChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateArchiveAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
async function reviewFor(trx, context, estimateId) {
    const loaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, estimateId);
    const { row } = loaded;
    if (!loaded.canArchive) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
    if (!parentId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { parent } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateParentInTransaction"])(trx, context, row.parentType, parentId);
    const savedParent = await trx(row.parentType === "lead" ? "leads" : "jobs").where({
        workspaceId: context.workspaceId,
        id: parentId
    }).first("version");
    if (!savedParent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return {
        row,
        estimate: {
            id: row.id,
            version: row.version,
            number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
            revision: row.revision,
            name: row.name,
            status: loaded.status,
            archived: row.archivedAt !== null
        },
        review: {
            recipientName: row.recipientName,
            parent: {
                type: parent.type,
                id: parent.id,
                version: Number(savedParent.version),
                number: parent.number,
                name: parent.name
            },
            today: loaded.today,
            timezone: loaded.timezone
        }
    };
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        receipt: payload.receipt
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload) || payload.ticket.reviewHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review) || payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending")) throw conflict();
    if (!await trx("chatTurns").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id: row.turnId,
        threadId: row.threadId,
        state: "completed"
    }).first("id")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateArchiveChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    const next = await reviewFor(trx, context, payload.ticket.estimate.id);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.estimate) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.ticket.estimate) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.review) !== payload.ticket.reviewHash) throw conflict();
    return payload;
}
async function checkedResult(trx, context, payload) {
    const { receipt, ticket } = payload;
    if (!receipt) throw conflict();
    const next = await reviewFor(trx, context, ticket.estimate.id);
    if (payload.resultStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.estimate) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ...ticket.estimate,
        archived: receipt.archived,
        version: receipt.version
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(next.review) !== ticket.reviewHash || next.row.updatedAt.toISOString() !== receipt.updatedAt || (receipt.archived ? next.row.archivedBy !== context.userId : next.row.archivedBy !== null)) throw conflict();
}
async function visible(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (row.state === "confirmed") {
        await checkedResult(trx, context, payload);
        return publicView(payload);
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatArchive(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const authorizationVersion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const prepared = await reviewFor(trx, context, estimateId);
        if (request.operation === "archive" ? prepared.estimate.archived || ![
            "declined",
            "expired",
            "superseded",
            "void"
        ].includes(prepared.estimate.status) : !prepared.estimate.archived) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](request.operation === "archive" ? "Only an unarchived Declined, Expired, Superseded or Void estimate can be archived." : "Only an archived estimate can be restored.");
        }
        const now = new Date();
        const ticket = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatViewSchema"].shape.ticket.parse({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            actionType: request.operation === "archive" ? "estimate.archive" : "estimate.restore",
            inputHash: "0".repeat(64),
            reviewHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(prepared.review),
            authorizationVersion,
            state: "pending",
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            estimate: prepared.estimate
        });
        const payload = {
            ticket,
            review: prepared.review,
            receipt: null,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
            resultStamp: null
        };
        ticket.inputHash = inputHash(payload);
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatStoredSchema"].parse(payload);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn, estimateId);
        const [row] = await trx("chatEstimateArchives").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(stored),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return ticket;
    });
}
async function visibleEstimateChatArchive(trx, context, turnId) {
    const row = await trx("chatEstimateArchives").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return undefined;
        throw error;
    }
}
async function readEstimateChatArchive(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateArchives").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return visible(trx, context, row);
    });
}
async function operateEstimateChatArchive(db, identity, enabled, raw, decision) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatBindingSchema"].parse(raw);
    decision = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatDecisionSchema"].shape.decision.parse(decision);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateArchives").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
            const view = await visible(trx, context, row);
            return {
                view,
                ...decision === "open" ? {
                    href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}`
                } : {}
            };
        }
        if (row.state !== "pending" || decision === "open") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            payload.receipt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$lifecycle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setEstimateArchivedInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                estimateId: payload.ticket.estimate.id,
                expectedVersion: payload.ticket.estimate.version,
                submissionId: row.id,
                mode: operation(payload.ticket)
            }, "assistant-confirmed");
            payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context);
            await checkedResult(trx, context, payload);
        }
        const state = decision === "confirm" ? "confirmed" : "cancelled";
        payload.ticket.state = state;
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateArchiveChatStoredSchema"].parse(payload);
        await trx("chatEstimateArchives").where({
            id: row.id
        }).update({
            state,
            payload: JSON.stringify(stored),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, state);
        return {
            view: publicView(stored)
        };
    });
}
async function estimateArchiveChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateArchives").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return true;
    try {
        await visible(trx, context, row);
        return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) return false;
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/chat-draft-deletes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftDeleteChatBinding",
    ()=>estimateDraftDeleteChatBinding,
    "estimateDraftDeleteChatEvidenceAllowed",
    ()=>estimateDraftDeleteChatEvidenceAllowed,
    "operateEstimateChatDraftDelete",
    ()=>operateEstimateChatDraftDelete,
    "proposeEstimateChatDraftDelete",
    ()=>proposeEstimateChatDraftDelete,
    "readEstimateChatDraftDelete",
    ()=>readEstimateChatDraftDelete,
    "visibleEstimateChatDraftDelete",
    ()=>visibleEstimateChatDraftDelete
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-delete-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This Draft deletion proposal changed or expired. Request a fresh review.");
function estimateDraftDeleteChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateDraftDeleteAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review,
        receipt: payload.receipt
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.reviewHash !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review) || payload.ticket.inputHash !== inputHash(payload) || payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending")) {
        throw conflict();
    }
    if (!await trx("chatTurns").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id: row.turnId,
        threadId: row.threadId,
        state: "completed"
    }).first("id")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateDraftDeleteChatBinding(row.payload.ticket))) {
        throw conflict();
    }
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    const currentReview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDraftDeletionReviewInTransaction"])(trx, context, payload.ticket.estimate.id);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(currentReview.estimate) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.ticket.estimate) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(currentReview.review) !== payload.ticket.reviewHash) {
        throw conflict();
    }
    return payload;
}
async function checkedResult(trx, context, payload) {
    const { receipt, ticket } = payload;
    if (!receipt || payload.resultStamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: ticket.estimate.id
    }).first("id") || !await trx("chatEstimateDraftDeleteAudit").where({
        workspaceId: context.workspaceId,
        actorId: context.userId,
        proposalId: ticket.id,
        action: "confirmed",
        inputHash: ticket.inputHash
    }).first("id")) {
        throw conflict();
    }
}
async function visible(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    if (row.state === "confirmed") {
        await checkedResult(trx, context, payload);
        return publicView(payload);
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatDraftDelete(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const authorizationVersion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const prepared = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateDraftDeletionReviewInTransaction"])(trx, context, estimateId);
        const now = new Date();
        const ticket = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatViewSchema"].shape.ticket.parse({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            actionType: "estimate.delete-draft",
            inputHash: "0".repeat(64),
            authorizationVersion,
            reviewHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(prepared.review),
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            state: "pending",
            estimate: prepared.estimate
        });
        const payload = {
            ticket,
            review: prepared.review,
            receipt: null,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context),
            resultStamp: null
        };
        ticket.inputHash = inputHash(payload);
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatStoredSchema"].parse(payload);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
        const [row] = await trx("chatEstimateDraftDeletes").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(stored),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return ticket;
    });
}
async function visibleEstimateChatDraftDelete(trx, context, turnId) {
    const row = await trx("chatEstimateDraftDeletes").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) {
            return undefined;
        }
        throw error;
    }
}
async function readEstimateChatDraftDelete(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateDraftDeletes").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        return visible(trx, context, row);
    });
}
async function operateEstimateChatDraftDelete(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatDecisionSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { request: binding, decision, typedConfirmation } = input;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateDraftDeletes").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        if (row.state === "confirmed" || row.state === "cancelled") {
            if (decision !== (row.state === "confirmed" ? "confirm" : "cancel")) {
                throw conflict();
            }
            const view = await visible(trx, context, row);
            if (row.state === "confirmed" && typedConfirmation !== view.ticket.estimate.number) {
                throw conflict();
            }
            return {
                view
            };
        }
        if (row.state !== "pending") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "confirm") {
            payload.receipt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteEstimateDraftInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                estimateId: payload.ticket.estimate.id,
                expectedVersion: payload.ticket.estimate.version,
                typedConfirmation
            });
            payload.resultStamp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context);
        }
        const state = decision === "confirm" ? "confirmed" : "cancelled";
        payload.ticket.state = state;
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatStoredSchema"].parse(payload);
        await trx("chatEstimateDraftDeletes").where({
            id: row.id
        }).update({
            state,
            payload: JSON.stringify(stored),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, state);
        if (state === "confirmed") await checkedResult(trx, context, stored);
        return {
            view: publicView(stored)
        };
    });
}
async function estimateDraftDeleteChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateDraftDeletes").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return true;
    try {
        await visible(trx, context, row);
        return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) {
            return false;
        }
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/conversion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertAcceptedEstimateToJob",
    ()=>convertAcceptedEstimateToJob,
    "readEstimateConversionReview",
    ()=>readEstimateConversionReview,
    "readEstimateConversionReviewInTransaction",
    ()=>readEstimateConversionReviewInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-conversion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const changed = "The estimate, lead or customer changed. Reload and review the current records before confirming.";
function creationAllowed(context) {
    const customerScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "customers.read");
    const resource = {
        kind: "job",
        id: context.workspaceId,
        workspaceId: context.workspaceId,
        ownerId: context.userId,
        teamUserIds: []
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.create"
    }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.assign",
        resource
    }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "jobs.read").allowed && customerScope.allowed && customerScope.scope === "workspace";
}
async function jobMemberIds(trx, context, jobId) {
    return trx("jobTeamMembers").where({
        workspaceId: context.workspaceId,
        jobId
    }).pluck("userId");
}
async function jobReference(trx, context, job) {
    const teamUserIds = await jobMemberIds(trx, context, job.id);
    const canOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.read",
        resource: {
            kind: "job",
            id: job.id,
            workspaceId: context.workspaceId,
            ownerId: job.primaryOwnerId,
            teamUserIds
        }
    }).allowed;
    return {
        id: job.id,
        number: `J-${String(job.jobNumber).padStart(4, "0")}`,
        canOpen
    };
}
async function activeMembers(trx, context) {
    const rows = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt").select("u.id", "u.name", "m.role").orderBy("u.name").orderBy("u.id");
    return rows.map((row)=>({
            id: row.id,
            name: row.name,
            role: row.role
        }));
}
async function loadConversionContext(trx, context, estimateId, lock = false) {
    const { row, status } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, estimateId, lock);
    const frozen = await trx("estimate_snapshots").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).first("id", "content", "contentHash");
    const snapshot = frozen && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(frozen.content, frozen.contentHash);
    if (!frozen || !snapshot || snapshot.content.number !== `EST-${String(row.estimateNumber).padStart(4, "0")}` || snapshot.content.revision !== row.revision) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The accepted estimate snapshot is unavailable. Reload before converting.");
    }
    const decision = await trx("estimate_decisions").where({
        workspaceId: context.workspaceId,
        estimateId: row.id
    }).orderBy("estimateVersion", "desc").first();
    if (!decision || decision.outcome !== "accepted" || decision.estimateVersion !== row.version || decision.snapshotId !== frozen.id || Number(decision.snapshotTotalCents) !== snapshot.amounts.totalCents || Number(row.acceptedTotalCents) !== snapshot.amounts.totalCents) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
    }
    let lead;
    let parentJob;
    let leadId = null;
    let customerId = null;
    let customerVersion = null;
    let customer = {
        state: "missing"
    };
    let service = "";
    let parentNumber = "";
    if (row.parentType === "lead" && row.leadId) {
        const query = trx("leads").where({
            workspaceId: context.workspaceId,
            id: row.leadId
        });
        if (lock) query.forUpdate();
        lead = await query.first();
        if (!lead || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "leads.read",
            resource: {
                kind: "lead",
                id: row.leadId,
                workspaceId: context.workspaceId,
                ownerId: lead.ownerId
            }
        }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        leadId = row.leadId;
        customerId = lead.customerId ?? null;
        service = lead.service;
        parentNumber = `LD-${String(lead.leadNumber).padStart(4, "0")}`;
        if (customerId) {
            const customerQuery = trx("customers").where({
                workspaceId: context.workspaceId,
                id: customerId
            }).whereNull("archivedAt");
            if (lock) customerQuery.forUpdate();
            const currentCustomer = await customerQuery.first("id", "name", "version");
            const canRead = currentCustomer && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "customers.read",
                resource: {
                    kind: "customer",
                    id: customerId,
                    workspaceId: context.workspaceId,
                    related: [
                        {
                            kind: "lead",
                            id: row.leadId,
                            workspaceId: context.workspaceId,
                            ownerId: lead.ownerId
                        }
                    ]
                }
            }).allowed;
            if (canRead && currentCustomer) {
                customerVersion = Number(currentCustomer.version);
                customer = {
                    state: "ready",
                    id: customerId,
                    name: currentCustomer.name
                };
            } else {
                customer = {
                    state: "unavailable"
                };
            }
        }
    } else if (row.parentType === "job" && row.jobId) {
        const job = await trx("jobs").where({
            workspaceId: context.workspaceId,
            id: row.jobId
        }).first();
        if (!job) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        parentJob = job;
        service = job.service;
        parentNumber = `J-${String(job.jobNumber).padStart(4, "0")}`;
        customerId = job.customerId ?? null;
        const teamUserIds = await jobMemberIds(trx, context, job.id);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "jobs.read",
            resource: {
                kind: "job",
                id: job.id,
                workspaceId: context.workspaceId,
                ownerId: job.primaryOwnerId,
                teamUserIds
            }
        }).allowed) parentJob = undefined;
        if (customerId) {
            const currentCustomer = await trx("customers").where({
                workspaceId: context.workspaceId,
                id: customerId
            }).whereNull("archivedAt").first("id", "name", "version");
            if (currentCustomer && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "customers.read",
                resource: {
                    kind: "customer",
                    id: customerId,
                    workspaceId: context.workspaceId,
                    related: []
                }
            }).allowed) {
                customerVersion = Number(currentCustomer.version);
                customer = {
                    state: "ready",
                    id: customerId,
                    name: currentCustomer.name
                };
            } else customer = {
                state: "unavailable"
            };
        }
    } else {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const converted = await trx("jobs").where({
        workspaceId: context.workspaceId,
        acceptedEstimateId: row.id
    }).first("id", "jobNumber", "primaryOwnerId", "sourceLeadId");
    const sourceLeadHasJob = !!leadId && !!await trx("jobs").where({
        workspaceId: context.workspaceId,
        sourceLeadId: leadId
    }).first("id");
    if (converted && (row.parentType !== "lead" || converted.sourceLeadId !== row.leadId)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("The linked Job does not match this estimate's source lead.");
    }
    const convertedJob = converted ? await jobReference(trx, context, converted) : null;
    const parentJobReference = parentJob ? await jobReference(trx, context, parentJob) : null;
    const customerScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "customers.read");
    const canResolveCustomer = !!lead && !lead.archivedAt && customerScope.allowed && customerScope.scope === "workspace" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "leads.read").allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "customers.update",
        resource: {
            kind: "customer",
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            related: []
        }
    }).allowed && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "leads.update",
        fields: [
            "customerId"
        ],
        resource: {
            kind: "lead",
            id: lead.id,
            workspaceId: context.workspaceId,
            ownerId: lead.ownerId
        }
    }).allowed;
    const canCreateJob = creationAllowed(context);
    const members = canCreateJob ? await activeMembers(trx, context) : [];
    const sourceLeadVersion = lead ? Number(lead.version) : null;
    const customerReady = customer.state === "ready" ? customer : null;
    const sourceLeadId = row.parentType === "lead" ? leadId : row.jobId;
    if (!sourceLeadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const response = {
        estimate: {
            id: row.id,
            number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
            revision: row.revision,
            version: row.version,
            name: snapshot.content.name,
            status,
            archived: !!row.archivedAt,
            parentType: row.parentType,
            parentId: sourceLeadId,
            parentNumber,
            snapshotHash: frozen.contentHash,
            totalCents: snapshot.amounts.totalCents,
            customerId,
            sourceLeadVersion,
            sourceLeadArchived: !!lead?.archivedAt,
            customerVersion,
            convertedJobExists: !!converted,
            sourceLeadHasJob,
            service,
            scope: snapshot.content.scope,
            serviceAddress: snapshot.content.serviceAddress,
            convertedJob: convertedJob?.canOpen ? convertedJob : null
        },
        capabilities: {
            read: true
        },
        canCreateJob,
        canScheduleCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "jobs.schedule.update",
            resource: {
                kind: "job",
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: context.userId,
                teamUserIds: []
            }
        }).allowed,
        canResolveCustomer,
        customer,
        review: {
            estimateId: row.id,
            expectedVersion: row.version,
            expectedLeadVersion: sourceLeadVersion,
            expectedCustomerVersion: customerVersion,
            snapshotHash: frozen.contentHash,
            sourceLeadId,
            job: {
                customerId: customerReady?.id ?? "",
                customerName: customerReady?.name ?? "",
                title: snapshot.content.name,
                service,
                location: snapshot.content.serviceAddress,
                description: snapshot.content.scope,
                primaryOwnerId: null,
                teamUserIds: [],
                scheduledDate: null,
                arrivalWindow: null,
                completionDeadline: null
            }
        },
        members,
        parentJob: parentJobReference
    };
    return {
        response,
        leadId,
        leadVersion: sourceLeadVersion,
        customerVersion
    };
}
async function readEstimateConversionReviewInTransaction(trx, context, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (await loadConversionContext(trx, context, estimateId)).response;
}
async function readEstimateConversionReview(db, identity, enabled, estimateId) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].parse(estimateId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>(await loadConversionContext(trx, context, estimateId)).response);
}
function isConversionUniqueViolation(error) {
    if (!error || typeof error !== "object") return false;
    const code = "code" in error ? error.code : undefined;
    const constraint = "constraint" in error ? error.constraint : undefined;
    return code === "23505" && [
        "jobs_accepted_estimate_once",
        "jobs_source_lead_once"
    ].includes(String(constraint));
}
function receiptFor(estimateId, version, job, workspaceId) {
    return {
        estimateId,
        version,
        job: {
            id: job.id,
            number: `J-${String(job.jobNumber).padStart(4, "0")}`,
            href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(workspaceId)}`
        }
    };
}
async function authorizedConvertedJob(trx, context, estimateId, leadId) {
    const job = await trx("jobs").where({
        workspaceId: context.workspaceId,
        acceptedEstimateId: estimateId,
        sourceLeadId: leadId
    }).first("id", "jobNumber", "primaryOwnerId");
    if (!job) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
    const teamUserIds = await jobMemberIds(trx, context, job.id);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "jobs.read",
        resource: {
            kind: "job",
            id: job.id,
            workspaceId: context.workspaceId,
            ownerId: job.primaryOwnerId,
            teamUserIds
        }
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return job;
}
async function convertAcceptedEstimateToJob(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const loaded = await loadConversionContext(trx, context, input.estimateId, true);
        const { response, leadId, leadVersion, customerVersion } = loaded;
        const { estimate } = response;
        const canAssign = creationAllowed(context);
        if (!canAssign) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const resource = {
            kind: "job",
            id: input.submissionId,
            workspaceId: context.workspaceId,
            ownerId: input.job.primaryOwnerId,
            teamUserIds: input.job.teamUserIds
        };
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "jobs.assign",
            resource
        }).allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "jobs.read").allowed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        if (input.job.scheduledDate || input.job.completionDeadline) {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "jobs.schedule.update",
                resource
            }).allowed) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            }
        }
        if (estimate.status !== "accepted" || estimate.archived || estimate.parentType !== "lead" || estimate.sourceLeadArchived || !leadId || leadId !== input.sourceLeadId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Only an active Accepted estimate linked to an active lead can be converted.");
        }
        if (estimate.version !== input.expectedVersion || estimate.snapshotHash !== input.snapshotHash || leadVersion !== input.expectedLeadVersion || customerVersion !== input.expectedCustomerVersion) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        }
        if (response.customer.state !== "ready" || response.customer.id !== input.job.customerId || !customerVersion) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]("Link an accessible customer to the source lead before converting.");
        }
        if (!response.canCreateJob) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
        const prior = await trx("estimate_operation_receipts").where({
            workspaceId: context.workspaceId,
            submissionId: input.submissionId
        }).first();
        if (prior) {
            if (prior.actorId !== context.userId || prior.estimateId !== input.estimateId || prior.operation !== "convert" || prior.inputHash !== requestHash || prior.version !== estimate.version) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This confirmation was already used for a different request.");
            }
            const job = await authorizedConvertedJob(trx, context, estimate.id, leadId);
            return receiptFor(estimate.id, estimate.version, job, context.workspaceId);
        }
        if (estimate.convertedJobExists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This estimate or its source lead already has a Job.");
        }
        const existing = await trx("jobs").where({
            workspaceId: context.workspaceId,
            sourceLeadId: leadId
        }).first("id");
        if (existing) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This lead already has a Job.");
        let created;
        try {
            created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createJobInTransaction"])(trx, context, {
                workspaceId: context.workspaceId,
                submissionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                customerId: input.job.customerId,
                sourceLeadId: leadId,
                title: input.job.title,
                service: input.job.service,
                location: input.job.location,
                description: input.job.description,
                primaryOwnerId: input.job.primaryOwnerId,
                teamUserIds: input.job.teamUserIds,
                scheduledDate: input.job.scheduledDate,
                arrivalWindow: input.job.arrivalWindow,
                completionDeadline: input.job.completionDeadline
            }, {
                acceptedEstimateId: estimate.id,
                requireRead: true
            });
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JobConflictError"] || isConversionUniqueViolation(error)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The source lead or estimate already has a Job.");
            }
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JobValidationError"]) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"](error.message);
            }
            throw error;
        }
        const job = await trx("jobs").where({
            workspaceId: context.workspaceId,
            id: created.jobId
        }).first("id", "jobNumber");
        if (!job) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        const actor = await trx("users").where({
            id: context.userId
        }).first("name");
        await trx("estimate_activity").insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId: context.workspaceId,
            estimateId: estimate.id,
            actorId: context.userId,
            actorName: actor.name,
            source: "ui",
            type: "converted",
            changes: JSON.stringify({
                convertedJob: {
                    id: job.id,
                    number: `J-${String(job.jobNumber).padStart(4, "0")}`
                }
            })
        });
        await trx("estimate_operation_receipts").insert({
            workspaceId: context.workspaceId,
            submissionId: input.submissionId,
            actorId: context.userId,
            operation: "convert",
            inputHash: requestHash,
            estimateId: estimate.id,
            version: estimate.version
        });
        return receiptFor(estimate.id, estimate.version, job, context.workspaceId);
    });
}
}),
"[project]/packages/data/src/estimates/chat-conversions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateConversionChatBinding",
    ()=>estimateConversionChatBinding,
    "estimateConversionChatEvidenceAllowed",
    ()=>estimateConversionChatEvidenceAllowed,
    "operateEstimateChatConversion",
    ()=>operateEstimateChatConversion,
    "proposeEstimateChatConversion",
    ()=>proposeEstimateChatConversion,
    "readEstimateChatConversion",
    ()=>readEstimateChatConversion,
    "visibleEstimateChatConversion",
    ()=>visibleEstimateChatConversion
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-conversion-chat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$conversion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/conversion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/chat-proposals.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const conflict = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("This Estimate conversion review changed or expired. Request a fresh review.");
function estimateConversionChatBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.estimate.snapshotHash,
        sourceLeadId: ticket.estimate.parentId
    };
}
function inputHash(payload) {
    const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key])=>key !== "state" && key !== "inputHash"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])({
        ticket,
        review: payload.review,
        stamp: payload.stamp
    });
}
async function audit(trx, row, action) {
    await trx("chatEstimateConversionAudit").insert({
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        workspaceId: row.workspaceId,
        actorId: row.userId,
        proposalId: row.id,
        action,
        inputHash: row.payload.ticket.inputHash
    });
}
function publicView(payload, state = payload.ticket.state) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatViewSchema"].parse({
        ticket: {
            ...payload.ticket,
            state
        },
        review: payload.review
    });
}
async function checkedPayload(trx, context, row) {
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatStoredSchema"].parse(row.payload);
    if (payload.ticket.id !== row.id || payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending") || payload.ticket.inputHash !== inputHash(payload)) {
        throw conflict();
    }
    if (!await trx("chatTurns").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        id: row.turnId,
        threadId: row.threadId,
        state: "completed"
    }).first("id")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    if (payload.ticket.authorizationVersion !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return payload;
}
function checkedBinding(row, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatBindingSchema"].parse(raw);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(binding) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(estimateConversionChatBinding(row.payload.ticket))) {
        throw conflict();
    }
}
async function current(trx, context, row) {
    const payload = await checkedPayload(trx, context, row);
    const review = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$conversion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateConversionReviewInTransaction"])(trx, context, payload.ticket.estimate.id);
    if (payload.stamp !== await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(review) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalDigest"])(payload.review)) {
        throw conflict();
    }
    return payload;
}
async function visible(trx, context, row) {
    const payload = await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
async function proposeEstimateChatConversion(db, identity, enabled, turnId, raw, signal) {
    const { request } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatProposeSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        signal.throwIfAborted();
        const authorizationVersion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalAuthority"])(trx, context);
        const turn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, turnId);
        const page = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatPageContextSchema"].parse(turn.pageContext);
        const ref = request.estimateRef ?? ([
            "estimate.detail",
            "estimate.editor"
        ].includes(turn.surfaceKey) ? page.recordRefs?.find((record)=>record.type === "estimate")?.id ?? null : null);
        const estimateId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveEstimateProposalId"])(trx, context.workspaceId, ref);
        const review = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$conversion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEstimateConversionReviewInTransaction"])(trx, context, estimateId);
        const now = new Date();
        const ticket = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            actionType: "estimate.convert",
            inputHash: "0".repeat(64),
            authorizationVersion,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 900000).toISOString(),
            state: "pending",
            estimate: review.estimate,
            customer: review.customer
        };
        const payload = {
            ticket,
            review,
            stamp: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateChatStamp"])(trx, context)
        };
        ticket.inputHash = inputHash(payload);
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatStoredSchema"].parse(payload);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supersedeEstimateProposals"])(trx, context, turn);
        const [row] = await trx("chatEstimateConversions").insert({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
            id: ticket.id,
            turnId: turn.id,
            threadId: turn.threadId,
            payload: JSON.stringify(stored),
            createdAt: trx.raw("clock_timestamp()")
        }).returning("*");
        await audit(trx, row, "proposed");
        await trx("chatTurns").where({
            id: turn.id
        }).update({
            estimateStamp: payload.stamp
        });
        signal.throwIfAborted();
        return ticket;
    });
}
async function visibleEstimateChatConversion(trx, context, turnId) {
    const row = await trx("chatEstimateConversions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return undefined;
    try {
        return await visible(trx, context, row);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) {
            return undefined;
        }
        throw error;
    }
}
async function readEstimateChatConversion(db, identity, enabled, raw) {
    const binding = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatBindingSchema"].parse(raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const row = await trx("chatEstimateConversions").where({
            ...identity,
            id: binding.proposalId
        }).first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        return {
            view: await visible(trx, context, row)
        };
    });
}
function canOpenConversionReview(payload) {
    const { review } = payload;
    return review.capabilities.read && review.canCreateJob && review.estimate.status === "accepted" && !review.estimate.archived && review.estimate.parentType === "lead" && !review.estimate.convertedJobExists && !review.estimate.sourceLeadHasJob && !review.estimate.sourceLeadArchived && review.customer.state !== "unavailable";
}
async function operateEstimateChatConversion(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatDecisionSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { request: binding, decision } = input;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const row = await trx("chatEstimateConversions").where({
            ...identity,
            id: binding.proposalId
        }).forUpdate().first();
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        checkedBinding(row, binding);
        if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalTurn"])(trx, context, row.turnId, true)).threadId !== row.threadId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        if (row.state === "cancelled") {
            if (decision !== "cancel") throw conflict();
            return {
                view: await visible(trx, context, row)
            };
        }
        if (row.state !== "pending") throw conflict();
        const payload = await current(trx, context, row);
        if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
        if (decision === "review") {
            if (!canOpenConversionReview(payload)) throw conflict();
            await audit(trx, row, "review-opened");
            return {
                view: publicView(payload)
            };
        }
        payload.ticket.state = "cancelled";
        const stored = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateConversionChatStoredSchema"].parse(payload);
        await trx("chatEstimateConversions").where({
            id: row.id
        }).update({
            state: "cancelled",
            payload: JSON.stringify(stored),
            resolvedAt: trx.fn.now()
        });
        await audit(trx, row, "cancelled");
        return {
            view: publicView(stored)
        };
    });
}
async function estimateConversionChatEvidenceAllowed(trx, context, turnId) {
    const row = await trx("chatEstimateConversions").where({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$chat$2d$proposals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateProposalIdentity"])(context),
        turnId
    }).orderBy("createdAt", "desc").orderBy("id", "desc").first();
    if (!row) return true;
    try {
        await visible(trx, context, row);
        return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftValidationError"]) {
            return false;
        }
        throw error;
    }
}
}),
"[project]/packages/data/src/estimates/business-profile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "EstimateBusinessLogoUnavailable",
    ()=>EstimateBusinessLogoUnavailable,
    "EstimateBusinessProfileConflict",
    ()=>EstimateBusinessProfileConflict,
    "EstimateBusinessProfileInvalid",
    ()=>EstimateBusinessProfileInvalid,
    "cleanupStagedEstimateBusinessLogos",
    ()=>cleanupStagedEstimateBusinessLogos,
    "prepareEstimateBusinessLogo",
    ()=>prepareEstimateBusinessLogo,
    "readEstimateBusinessLogo",
    ()=>readEstimateBusinessLogo,
    "readEstimateBusinessProfile",
    ()=>readEstimateBusinessProfile,
    "saveEstimateBusinessProfile",
    ()=>saveEstimateBusinessProfile,
    "uploadEstimateBusinessLogo",
    ()=>uploadEstimateBusinessLogo
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__ = __turbopack_context__.i("[externals]/sharp [external] (sharp, esm_import, [project]/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/totals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/accounts/workspace-hold.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/files/store.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
class EstimateBusinessProfileConflict extends Error {
}
class EstimateBusinessProfileInvalid extends Error {
}
class EstimateBusinessLogoUnavailable extends Error {
}
const logoEntityType = "estimate-business-profile-logo";
const logoBytesLimit = 2 * 1024 * 1024;
const noAdjustment = {
    type: "none"
};
const defaultProfile = {
    name: "",
    address: "",
    phone: "",
    email: "",
    licenseLine: "",
    logoPath: null,
    requireServiceAddress: true,
    validForDays: "30",
    taxRate: "0",
    deposit: noAdjustment,
    paymentPresets: [],
    message: "",
    termsNote: ""
};
function requireSettingsAccess(context, write = false) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "settings.business.read"
    }).allowed || write && (context.membership.role !== "owner" && context.membership.role !== "admin" || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "settings.business.update"
    }).allowed)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
}
function logoPath(fileId) {
    return `/api/settings/estimates/logo/${encodeURIComponent(fileId)}`;
}
function logoIdFromPath(value) {
    if (!value) return null;
    const match = /^\/api\/settings\/estimates\/logo\/([0-9a-f-]{36})$/i.exec(value);
    return match && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateIdSchema"].safeParse(match[1]).success ? match[1] : null;
}
async function currentProfileRow(trx, workspaceId) {
    const row = await trx("workspaceEstimateSettings").where({
        workspaceId
    }).first();
    const counter = await trx("workspaceEstimateCounters").where({
        workspaceId
    }).first("lastNumber");
    const profile = row ? {
        name: row.businessName,
        address: row.address,
        phone: row.phone,
        email: row.replyToEmail,
        licenseLine: row.licenseLine,
        logoPath: row.logoFileId ? logoPath(row.logoFileId) : null,
        requireServiceAddress: row.requireServiceAddress,
        validForDays: String(row.validForDays),
        taxRate: String(Number(row.defaultTaxRateMilliPercent) / 1000),
        deposit: row.defaultDepositType === "none" ? noAdjustment : {
            type: row.defaultDepositType,
            value: String(row.defaultDepositValue)
        },
        paymentPresets: row.paymentTermPresets ?? [],
        message: row.defaultMessage,
        termsNote: row.defaultTerms
    } : defaultProfile;
    const parsedProfile = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateBusinessProfileSchema"].safeParse(profile);
    if (!parsedProfile.success) {
        throw new Error("Saved estimate business settings are invalid.");
    }
    if (row?.logoFileId) {
        const logo = await trx("files").where({
            id: row.logoFileId,
            workspaceId,
            entityType: logoEntityType,
            entityId: workspaceId,
            categoryTag: "saved"
        }).whereNull("deletedAt").first("status", "mimeType");
        if (!logo || logo.status !== "ready" || logo.mimeType !== "image/webp") {
            throw new EstimateBusinessLogoUnavailable();
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateBusinessProfileRecordSchema"].parse({
        workspaceId,
        version: Number(row?.version ?? 1),
        numberPrefix: row?.numberPrefix ?? "EST-",
        nextNumber: Number(counter?.lastNumber ?? 0) + 1,
        profile: parsedProfile.data
    });
}
async function ensureSettingsRow(trx, workspaceId) {
    await trx("workspaceEstimateSettings").insert({
        workspaceId
    }).onConflict("workspaceId").ignore();
}
async function readEstimateBusinessProfile(db, identity, enabled) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        requireSettingsAccess(context);
        return {
            record: await currentProfileRow(trx, context.workspaceId),
            canManage: (context.membership.role === "owner" || context.membership.role === "admin") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "settings.business.update"
            }).allowed,
            role: context.membership.role
        };
    });
}
function validateProfileValues(profile) {
    const tax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])({
        items: [],
        discount: noAdjustment,
        taxRate: profile.taxRate,
        deposit: noAdjustment
    });
    const deposit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$totals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEstimateTotals"])({
        items: [
            {
                description: "validation",
                quantity: "10",
                unitPrice: "1000000",
                taxable: true,
                included: false
            }
        ],
        discount: noAdjustment,
        taxRate: "100",
        deposit: profile.deposit
    });
    if (tax.errors.taxRate || tax.taxRateMilliPercent === null || deposit.errors.deposit) {
        throw new EstimateBusinessProfileInvalid();
    }
    return tax.taxRateMilliPercent;
}
async function validateLogoReference(trx, workspaceId, fileId) {
    if (!fileId) return;
    const file = await trx("files").where({
        id: fileId,
        workspaceId,
        entityType: logoEntityType,
        entityId: workspaceId,
        mimeType: "image/webp"
    }).whereNull("deletedAt").whereIn("categoryTag", [
        "staged",
        "saved"
    ]).first("status", "categoryTag");
    if (!file || file.status !== "ready") {
        throw new EstimateBusinessProfileInvalid();
    }
}
async function saveEstimateBusinessProfile(db, identity, enabled, raw) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveEstimateBusinessProfileSchema"].safeParse(raw);
    if (!parsed.success) throw new EstimateBusinessProfileInvalid();
    const input = parsed.data;
    if (input.workspaceId !== identity.workspaceId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const taxRateMilliPercent = validateProfileValues(input.profile);
    const fileId = logoIdFromPath(input.profile.logoPath);
    if (input.profile.logoPath && !fileId) {
        throw new EstimateBusinessProfileInvalid();
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireSettingsAccess(context, true);
        await ensureSettingsRow(trx, context.workspaceId);
        const existing = await trx("workspaceEstimateSettings").where({
            workspaceId: context.workspaceId
        }).forUpdate().first("version");
        if (Number(existing?.version ?? 1) !== input.expectedVersion) {
            throw new EstimateBusinessProfileConflict();
        }
        await validateLogoReference(trx, context.workspaceId, fileId);
        const profile = input.profile;
        const depositValue = profile.deposit.type === "none" ? "0" : profile.deposit.value;
        const nextVersion = input.expectedVersion + 1;
        await trx("workspaceEstimateSettings").where({
            workspaceId: context.workspaceId,
            version: input.expectedVersion
        }).update({
            businessName: profile.name,
            address: profile.address,
            phone: profile.phone,
            replyToEmail: profile.email,
            logoFileId: fileId,
            licenseLine: profile.licenseLine,
            requireServiceAddress: profile.requireServiceAddress,
            defaultTaxRateMilliPercent: taxRateMilliPercent,
            validForDays: Number(profile.validForDays),
            paymentTermPresets: JSON.stringify(profile.paymentPresets),
            defaultMessage: profile.message,
            defaultTerms: profile.termsNote,
            defaultDepositType: profile.deposit.type,
            defaultDepositValue: depositValue,
            version: nextVersion,
            updatedBy: context.userId,
            updatedAt: trx.fn.now()
        });
        if (fileId) {
            await trx("files").where({
                id: fileId,
                workspaceId: context.workspaceId,
                entityType: logoEntityType,
                entityId: context.workspaceId,
                categoryTag: "staged"
            }).update({
                categoryTag: "saved",
                updatedAt: trx.fn.now()
            });
        }
        return currentProfileRow(trx, context.workspaceId);
    });
}
async function prepareEstimateBusinessLogo(file) {
    if (file.data.length === 0 || file.data.length > logoBytesLimit || ![
        "image/png",
        "image/jpeg",
        "image/webp"
    ].includes(file.type)) {
        throw new EstimateBusinessProfileInvalid();
    }
    try {
        const image = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(file.data, {
            failOn: "error",
            limitInputPixels: 20_000_000
        });
        const metadata = await image.metadata();
        const acceptedFormats = {
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp"
        };
        if (!metadata.width || !metadata.height || acceptedFormats[metadata.format ?? ""] !== file.type) {
            throw new EstimateBusinessProfileInvalid();
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$sharp__$5b$external$5d$__$28$sharp$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sharp$40$0$2e$35$2e$5_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$sharp$29$__["default"])(file.data, {
            failOn: "error",
            limitInputPixels: 20_000_000
        }).rotate().resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true
        }).webp({
            quality: 85
        }).toBuffer();
        if (data.length === 0 || data.length > logoBytesLimit) {
            throw new EstimateBusinessProfileInvalid();
        }
        return data;
    } catch (error) {
        if (error instanceof EstimateBusinessProfileInvalid) throw error;
        throw new EstimateBusinessProfileInvalid();
    }
}
async function uploadEstimateBusinessLogo(db, storage, identity, enabled, expectedVersion, file) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        requireSettingsAccess(context, true);
        const current = await currentProfileRow(trx, context.workspaceId);
        if (current.version !== expectedVersion) {
            throw new EstimateBusinessProfileConflict();
        }
    });
    const data = await prepareEstimateBusinessLogo(file);
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFileStore"])(db, storage);
    const uploaded = await store.uploadFile({
        userId: identity.userId,
        workspaceId: identity.workspaceId,
        permissions: {}
    }, {
        entityType: logoEntityType,
        entityId: identity.workspaceId,
        name: "estimate-business-logo.webp",
        mimeType: "image/webp",
        data,
        categoryTag: "staged"
    });
    await db.transaction(async (trx)=>{
        const updated = await trx("files").where({
            id: uploaded.id,
            workspaceId: identity.workspaceId,
            entityType: logoEntityType,
            entityId: identity.workspaceId
        }).whereIn("status", [
            "uploading",
            "ready"
        ]).update({
            status: "ready",
            categoryTag: "staged",
            updatedAt: trx.fn.now()
        });
        if (updated !== 1) throw new EstimateBusinessProfileInvalid();
    });
    return {
        logoPath: logoPath(uploaded.id)
    };
}
async function readEstimateBusinessLogo(db, storage, identity, enabled, fileId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, async (trx, context)=>{
        const file = await trx("files").where({
            id: fileId,
            workspaceId: context.workspaceId,
            entityType: logoEntityType,
            entityId: context.workspaceId,
            mimeType: "image/webp",
            status: "ready"
        }).whereNull("deletedAt").first("categoryTag");
        if (!file) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const current = file.categoryTag === "saved" && await trx("workspaceEstimateSettings").where({
            workspaceId: context.workspaceId,
            logoFileId: fileId
        }).first("workspaceId");
        if (current) {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, "estimates.read").allowed && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "settings.business.read"
            }).allowed) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            }
        } else if (file.categoryTag !== "staged" || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: "settings.business.read"
        }).allowed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$files$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFileStore"])(db, storage);
        return store.downloadFile({
            userId: context.userId,
            workspaceId: context.workspaceId,
            permissions: {}
        }, fileId);
    });
}
async function cleanupStagedEstimateBusinessLogos(db, storage, now = new Date()) {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const candidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$accounts$2f$workspace$2d$hold$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withoutSuspendedWorkspaces"])(db("files as f"), "f.workspaceId").leftJoin("workspaceEstimateSettings as s", function() {
        this.on("s.workspaceId", "=", "f.workspaceId").andOn("s.logoFileId", "=", db.raw('"f"."id"::text'));
    }).where({
        "f.entityType": logoEntityType,
        "f.categoryTag": "staged"
    }).whereNull("f.deletedAt").whereNull("s.logoFileId").andWhere("f.createdAt", "<", cutoff).select("f.id", "f.workspaceId", "f.uploadedByUserId", "f.name", "f.sizeBytes", "f.storageKey", "f.createdAt").limit(100);
    let removed = 0;
    for (const candidate of candidates){
        const storageKey = await db.transaction(async (trx)=>{
            const workspace = await trx("workspaces").where({
                id: candidate.workspaceId
            }).forUpdate().first("id", "suspendedAt");
            if (!workspace || workspace.suspendedAt) return null;
            const settings = await trx("workspaceEstimateSettings").where({
                workspaceId: candidate.workspaceId
            }).forUpdate().first("logoFileId");
            const file = await trx("files").where({
                id: candidate.id,
                workspaceId: candidate.workspaceId,
                entityType: logoEntityType,
                categoryTag: "staged"
            }).whereNull("deletedAt").forUpdate().first("storageKey", "sizeBytes", "uploadedByUserId", "name", "createdAt");
            if (!file || settings?.logoFileId === candidate.id || new Date(file.createdAt).getTime() >= cutoff.getTime()) {
                return null;
            }
            await trx("files").where({
                id: candidate.id,
                workspaceId: candidate.workspaceId
            }).update({
                deletedAt: now,
                updatedAt: now
            });
            await trx("fileEvents").insert({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                fileId: candidate.id,
                workspaceId: candidate.workspaceId,
                actorId: file.uploadedByUserId,
                eventType: "removed",
                metadata: {
                    name: file.name,
                    reason: "staged-estimate-logo-expired"
                },
                createdAt: now
            });
            const usage = await trx("workspaceStorageUsage").where({
                workspaceId: candidate.workspaceId
            }).first("usedBytes");
            if (usage) {
                await trx("workspaceStorageUsage").where({
                    workspaceId: candidate.workspaceId
                }).update({
                    usedBytes: Math.max(0, Number(usage.usedBytes) - Number(file.sizeBytes))
                });
            }
            return file.storageKey;
        });
        if (storageKey) {
            await storage.delete(storageKey);
            removed++;
        }
    }
    return removed;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/data/src/estimates/lead-stage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "confirmEstimateLeadStage",
    ()=>confirmEstimateLeadStage,
    "readEstimateLeadStageReview",
    ()=>readEstimateLeadStageReview
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-lead-stage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/estimates/lead-stage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/stage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const changed = "The estimate or lead changed. Reload details and review the current records before confirming.";
async function reviewInTransaction(trx, context, input) {
    const { row, status } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadEstimateLifecycleContext"])(trx, context, input.estimateId);
    if (row.parentType !== "lead" || !row.leadId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const lead = await trx("leads").where({
        workspaceId: context.workspaceId,
        id: row.leadId
    }).first();
    const resource = lead && {
        kind: "lead",
        id: lead.id,
        workspaceId: context.workspaceId,
        ownerId: lead.ownerId
    };
    if (!lead || !resource || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: "leads.read",
        resource
    }).allowed) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const source = await trx("estimate_operation_receipts").where({
        workspaceId: context.workspaceId,
        estimateId: row.id,
        submissionId: input.sourceSubmissionId,
        actorId: context.userId
    }).first();
    if (!source || source.version !== input.expectedEstimateVersion || row.version !== input.expectedEstimateVersion) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
    }
    let event;
    if (source.operation === "send") {
        event = {
            kind: "send"
        };
    } else if (source.operation === "decision") {
        const decision = await trx("estimate_decisions").where({
            workspaceId: context.workspaceId,
            estimateId: row.id,
            estimateVersion: source.version
        }).first("outcome", "previousDecisionId");
        if (!decision || decision.outcome !== "declined") throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        const previous = decision.previousDecisionId ? await trx("estimate_decisions").where({
            workspaceId: context.workspaceId,
            estimateId: row.id,
            id: decision.previousDecisionId
        }).first("outcome") : null;
        if (decision.previousDecisionId && !previous) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        event = {
            kind: "decision",
            outcome: "declined",
            previousOutcome: previous?.outcome ?? null
        };
    } else {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
    }
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateLeadStageReviewSchema"].parse({
        estimate: {
            id: row.id,
            number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
            revision: row.revision,
            version: row.version,
            status,
            archived: !!row.archivedAt
        },
        event,
        lead: {
            id: lead.id,
            number: `LD-${String(lead.leadNumber).padStart(4, "0")}`,
            name: lead.name,
            version: lead.version,
            stage: lead.stage,
            archived: !!lead.archivedAt,
            canMove: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                permission: "leads.stage.update",
                resource
            }).allowed
        },
        target: null
    });
    result.target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$estimates$2f$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEstimateLeadStageTarget"])({
        ...result.estimate,
        event,
        parentType: "lead",
        canRead: true,
        lead: result.lead
    });
    return result;
}
async function readEstimateLeadStageReview(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateLeadStageQuerySchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, false, (trx, context)=>reviewInTransaction(trx, context, input));
}
async function confirmEstimateLeadStage(db, identity, enabled, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$lead$2d$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateLeadStageCommandSchema"].parse(raw);
    if (input.workspaceId !== identity.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, identity, enabled, true, async (trx, context)=>{
        const review = await reviewInTransaction(trx, context, input);
        if (review.lead.id !== input.leadId || !review.lead.canMove) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const requestHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(input)).digest("hex");
        const prior = await trx("leadActivity").where({
            workspaceId: identity.workspaceId,
            id: input.submissionId
        }).first();
        if (prior) {
            if (prior.leadId !== input.leadId || prior.actorId !== identity.userId || prior.type !== "stage" || prior.changes.estimateSuggestion?.requestHash !== requestHash) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        } else if (review.lead.version !== input.expectedLeadVersion || review.target !== input.to) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
        }
        let result;
        try {
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveLeadStageInTransaction"])(trx, context, {
                workspaceId: identity.workspaceId,
                leadId: input.leadId,
                submissionId: input.submissionId,
                expectedVersion: input.expectedLeadVersion,
                to: input.to,
                reason: input.reason
            });
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$stage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LeadStageConflictError"]) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"](changed);
            throw error;
        }
        if (!prior) {
            const activity = await trx("leadActivity").where({
                workspaceId: identity.workspaceId,
                id: input.submissionId
            }).first("changes");
            await trx("leadActivity").where({
                workspaceId: identity.workspaceId,
                id: input.submissionId
            }).update({
                changes: JSON.stringify({
                    ...activity.changes,
                    estimateSuggestion: {
                        estimateId: input.estimateId,
                        sourceSubmissionId: input.sourceSubmissionId,
                        requestHash
                    }
                })
            });
        }
        return {
            estimateId: input.estimateId,
            leadId: input.leadId,
            submissionId: input.submissionId,
            version: result.version
        };
    });
}
}),
"[project]/packages/data/src/estimates/expiry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expireEstimates",
    ()=>expireEstimates
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/drafts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/delivery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/authorization/catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/notifications/estimates.ts [app-route] (ecmascript)");
;
;
;
;
;
async function expireEstimates(db, now) {
    if (now && !Number.isFinite(now.getTime())) throw new RangeError("A valid expiry sweep time is required.");
    const instant = now ? now.toISOString() : db.raw("clock_timestamp()");
    const workspaces = await db("workspaces as w").whereNull("w.deletionRequestedAt").whereExists(db("estimates as e").select(db.raw("1")).whereRaw('e."workspaceId" = w.id').whereIn("e.status", [
        "sent",
        "published"
    ]).whereRaw('e."validUntil" < (?::timestamptz AT TIME ZONE w.timezone)::date', [
        instant
    ])).select("w.id").orderBy("w.id").limit(50);
    let expired = 0;
    for (const workspace of workspaces){
        expired += await db.transaction(async (trx)=>{
            const locked = await trx("workspaces").where({
                id: workspace.id
            }).whereNull("deletionRequestedAt").forUpdate().select("id", "timezone").first();
            if (!locked) return 0;
            const rows = await trx("estimates").where({
                workspaceId: locked.id
            }).whereIn("status", [
                "sent",
                "published"
            ]).whereRaw('"validUntil" < (?::timestamptz AT TIME ZONE ?)::date', [
                instant,
                locked.timezone
            ]).orderBy("validUntil").orderBy("id").limit(100).select("id", "status", "version");
            for (const row of rows){
                const changed = await trx("estimates").where({
                    workspaceId: locked.id,
                    id: row.id,
                    status: row.status,
                    version: row.version
                }).update({
                    status: "expired",
                    version: row.version + 1,
                    updatedAt: trx.fn.now()
                });
                if (!changed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$drafts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EstimateDraftConflictError"]("The estimate changed during scheduled expiry.");
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$delivery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stopEstimateDeliveries"])(trx, locked.id, row.id);
                await trx("estimate_activity").insert({
                    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                    workspaceId: locked.id,
                    estimateId: row.id,
                    actorId: null,
                    actorName: "System",
                    source: "worker",
                    type: "expired",
                    changes: JSON.stringify({
                        status: {
                            before: row.status,
                            after: "expired"
                        }
                    })
                });
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$notifications$2f$estimates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyEstimateRecipients"])(trx, {
                    workspaceId: locked.id,
                    estimateId: row.id,
                    event: "expired",
                    dedupeKey: `estimate:${row.id}:expired`
                }, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$authorization$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["permissionIds"]);
            }
            return rows.length;
        });
    }
    return {
        expired
    };
}
}),
];

//# sourceMappingURL=packages_data_src_estimates_12pujk2._.js.map
module.exports = [
"[project]/apps/web/src/features/reports/financial-report/financial-report.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "financialReportData",
    ()=>financialReportData
]);
const financialReportData = {
    title: 'Sales value and recorded costs',
    periodEstimates: 'Accepted estimate commitments',
    currentEstimates: 'Current quotes awaiting a decision',
    materialCosts: 'Current recorded material costs',
    accepted: 'Accepted pre-tax value',
    acceptedCount: 'Accepted estimates',
    acceptedCustomerTotal: 'Accepted customer tax-inclusive total',
    awaiting: 'Awaiting-decision pre-tax value',
    awaitingCount: 'Current quotes awaiting a decision',
    awaitingCustomerTotal: 'Awaiting customer tax-inclusive total',
    knownCosts: 'Known recorded material costs',
    knownLines: 'Lines with a recorded cost',
    missingLines: 'Lines missing a recorded cost',
    recordedCostHelp: 'Unit cost snapshots multiplied by the currently listed quantity, rounded half up to cents per line. This is not a ledger of actual spending or consumed quantities.',
    changedAfterIssue: 'Work Orders can be edited after issue; current material cost snapshots may restate.',
    activeCostScope: 'As of the current snapshot. Non-archived issued and in-progress Work Orders only; draft, completed, canceled and archived Work Orders are excluded.',
    commitmentHelp: 'Accepted estimates use effective customer decisions in the selected period. Current awaiting-decision estimates are a separate snapshot. These are sales commitments, not revenue, payments or profit.',
    periodBasis: 'Effective customer decision date / selected period',
    currentBasis: 'Current awaiting-decision estimates / report snapshot',
    costsBasis: 'Current Work Order material rows / report snapshot',
    periodHelp: 'Changing the period affects accepted estimates only. Current quotes and material costs keep their current snapshot basis.',
    scopeHelp: 'Financial report access is limited to authorized Owner/Admin users and remains intersected with current estimate, Work Order and monetary permissions.',
    unavailable: 'This section is unavailable under the current report and underlying record permissions.',
    estimateMoneyUnavailable: 'Estimate amounts are unavailable under the current price permissions or frozen amount coverage.',
    costUnavailable: 'Material costs are unavailable under the current Work Order and cost permissions.',
    noKnownCosts: 'No current material lines with recorded costs are available.',
    missingCostCoverage: (known, total)=>`${known} of ${total} lines have recorded costs; missing amounts are excluded, not treated as zero.`,
    costPermission: 'Current cost values and material evidence are withheld because Work Order cost access is unavailable.',
    estimatePermission: 'Estimate commitment evidence is withheld because authorized estimate access is unavailable.',
    denied: 'Your current access does not allow this financial report.',
    invalid: 'Financial report data is inconsistent with its authorized snapshot, permissions, period, totals or evidence. Retry the report.',
    noEvidence: 'No evidence is available for this section.',
    empty: 'No matching financial evidence is available for this selection.',
    evidence: (page)=>page.kind === 'accepted' ? 'Accepted estimate evidence' : page.kind === 'awaiting' ? 'Awaiting-decision estimate evidence' : 'Current material-cost evidence',
    estimate: (number, revision)=>`${number} / revision ${revision}`,
    periodLabel: (from, to)=>`${from} to ${to}, both dates included`,
    materialStatus: {
        needed: 'Needed',
        ordered: 'Ordered',
        'on-hand': 'On hand',
        used: 'Used'
    },
    workOrderStatus: {
        issued: 'Issued',
        'in-progress': 'In progress'
    }
};
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "financialMaterialLineCostCents",
    ()=>financialMaterialLineCostCents,
    "validFinancialReportResult",
    ()=>validFinancialReportResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$material$2d$cost$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/material-cost.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-decisions-report/estimate-decisions-report.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
;
;
;
;
const date = (value)=>!value.startsWith('0000') && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(value).success;
const count = (value)=>Number.isSafeInteger(value) && value >= 0;
const positive = (value)=>Number.isSafeInteger(value) && value > 0;
const safeText = (value, limit)=>value.trim() !== '' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const isRecord = (value)=>typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactKeys = (value, keys)=>Object.keys(value).length === keys.length && keys.every((key)=>Object.hasOwn(value, key));
const hasKeys = (value, required, optional = [])=>required.every((key)=>Object.hasOwn(value, key)) && Object.keys(value).every((key)=>required.includes(key) || optional.includes(key));
const financialMaterialLineCostCents = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$material$2d$cost$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordedMaterialLineCostCents"];
function validEstimateMoneyRow(value) {
    if (!isRecord(value) || typeof value.kind !== 'string') return false;
    if (value.kind === 'unavailable') return hasExactKeys(value, [
        'kind',
        'explanation'
    ]) && typeof value.explanation === 'string' && safeText(value.explanation, 200);
    return value.kind === 'available' && hasExactKeys(value, [
        'kind',
        'preTaxCents',
        'taxCents',
        'customerTotalCents'
    ]) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validEstimateFrozenMoney"])(value);
}
function validEstimateMetric(value) {
    if (!isRecord(value) || !hasExactKeys(value, [
        'count',
        'money'
    ]) || typeof value.count !== 'number' || !count(value.count) || !validEstimateMoneySummary(value.money)) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validEstimateMoneyTotal"])(value.money, [], value.count);
}
function validEstimateMoneySummary(value) {
    if (!isRecord(value) || typeof value.kind !== 'string') return false;
    if (value.kind === 'unavailable') return hasExactKeys(value, [
        'kind',
        'explanation'
    ]) && typeof value.explanation === 'string' && safeText(value.explanation, 200);
    return value.kind === 'available' && hasExactKeys(value, [
        'kind',
        'preTaxCents',
        'customerTotalCents'
    ]) && typeof value.preTaxCents === 'number' && count(value.preTaxCents) && typeof value.customerTotalCents === 'number' && count(value.customerTotalCents);
}
function validEstimateEvidenceRow(value, kind, result, canReadEstimateValues) {
    if (!isRecord(value) || value.kind !== kind || !hasKeys(value, [
        'kind',
        'familyId',
        'estimateNumber',
        'revision',
        'label',
        'archived',
        'money',
        ...kind === 'accepted' ? [
            'decisionDate'
        ] : [
            'issuedDate',
            'validUntil'
        ]
    ], kind === 'accepted' ? [
        'recordId',
        'issuedDate'
    ] : [
        'recordId'
    ]) || typeof value.familyId !== 'string' || !safeText(value.familyId, 128) || typeof value.estimateNumber !== 'string' || !safeText(value.estimateNumber, 80) || typeof value.revision !== 'number' || !positive(value.revision) || typeof value.label !== 'string' || !safeText(value.label, 160) || value.recordId !== undefined && (typeof value.recordId !== 'string' || !safeText(value.recordId, 128)) || typeof value.archived !== 'boolean' || value.issuedDate !== undefined && (typeof value.issuedDate !== 'string' || !date(value.issuedDate) || value.issuedDate > result.today) || !validEstimateMoneyRow(value.money) || !canReadEstimateValues && value.money.kind !== 'unavailable') return false;
    if (kind === 'accepted') {
        return typeof value.decisionDate === 'string' && date(value.decisionDate) && value.decisionDate >= result.from && value.decisionDate <= result.to && (value.issuedDate === undefined || value.decisionDate >= value.issuedDate) && value.decisionDate <= result.today;
    }
    return typeof value.issuedDate === 'string' && value.archived === false && (value.validUntil === null || typeof value.validUntil === 'string' && date(value.validUntil) && value.validUntil >= result.today);
}
function validEstimateEvidencePage(rows, kind, result, metric, canReadEstimateValues) {
    if (!rows.every((row)=>validEstimateEvidenceRow(row, kind, result, canReadEstimateValues))) return false;
    const estimateRows = rows;
    return new Set(estimateRows.map((row)=>row.familyId)).size === rows.length && estimateRows.every((row)=>row.kind === kind) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validEstimateMoneyTotal"])(metric.money, estimateRows.map((row)=>row.money), metric.count);
}
function validMaterialEvidenceRow(value) {
    if (!isRecord(value) || !hasExactKeys(value, [
        'kind',
        'id',
        'workOrderId',
        'workOrderLabel',
        'jobLabel',
        'workOrderStatus',
        'itemLabel',
        'quantity',
        'unit',
        'status',
        'unitCostCents',
        'lineCostCents',
        'changedAfterIssue'
    ]) || value.kind !== 'material' || typeof value.id !== 'string' || !safeText(value.id, 128) || typeof value.workOrderId !== 'string' || !safeText(value.workOrderId, 128) || typeof value.workOrderLabel !== 'string' || !safeText(value.workOrderLabel, 200) || value.jobLabel !== null && (typeof value.jobLabel !== 'string' || !safeText(value.jobLabel, 200)) || value.workOrderStatus !== 'issued' && value.workOrderStatus !== 'in-progress' || typeof value.itemLabel !== 'string' || !safeText(value.itemLabel, 200) || typeof value.quantity !== 'string' || typeof value.unit !== 'string' || !safeText(value.unit, 40) || typeof value.status !== 'string' || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].some((status)=>status === value.status) || typeof value.changedAfterIssue !== 'boolean') return false;
    const unitCostCents = value.unitCostCents;
    if (unitCostCents !== null && typeof unitCostCents !== 'number') return false;
    const lineCostCents = value.lineCostCents;
    if (lineCostCents !== null && typeof lineCostCents !== 'number') return false;
    const expectedCost = financialMaterialLineCostCents(value.quantity, unitCostCents);
    return expectedCost !== undefined && lineCostCents === expectedCost;
}
function validCostGroup(group) {
    if (!isRecord(group) || !hasExactKeys(group, [
        'status',
        'lineCount',
        'knownCostLines',
        'missingCostLines',
        'knownCostCents'
    ]) || typeof group.status !== 'string' || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].some((status)=>status === group.status) || typeof group.lineCount !== 'number' || !count(group.lineCount) || typeof group.knownCostLines !== 'number' || !count(group.knownCostLines) || typeof group.missingCostLines !== 'number' || !count(group.missingCostLines) || group.lineCount !== group.knownCostLines + group.missingCostLines) return false;
    return group.knownCostLines === 0 ? group.knownCostCents === null : typeof group.knownCostCents === 'number' && count(group.knownCostCents);
}
function safeSum(values) {
    const sum = values.reduce((total, value)=>total + value, 0);
    return Number.isSafeInteger(sum) ? sum : undefined;
}
function validCostSnapshot(value, canReadCosts) {
    if (!isRecord(value) || typeof value.kind !== 'string') return false;
    if (value.kind === 'unavailable') return hasExactKeys(value, [
        'kind',
        'explanation'
    ]) && typeof value.explanation === 'string' && safeText(value.explanation, 200);
    if (!canReadCosts) return false;
    if (value.kind !== 'available' || !hasExactKeys(value, [
        'kind',
        'lineCount',
        'knownCostLines',
        'missingCostLines',
        'knownCostCents',
        'groups'
    ]) || typeof value.lineCount !== 'number' || !count(value.lineCount) || typeof value.knownCostLines !== 'number' || !count(value.knownCostLines) || typeof value.missingCostLines !== 'number' || !count(value.missingCostLines) || value.lineCount !== value.knownCostLines + value.missingCostLines || !Array.isArray(value.groups) || value.groups.length !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].length || !value.groups.every(validCostGroup)) return false;
    const groups = value.groups;
    if (new Set(groups.map((group)=>group.status)).size !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].length) return false;
    const lineCount = safeSum(groups.map((group)=>group.lineCount));
    const knownCostLines = safeSum(groups.map((group)=>group.knownCostLines));
    const missingCostLines = safeSum(groups.map((group)=>group.missingCostLines));
    const knownCosts = safeSum(groups.flatMap((group)=>group.knownCostCents === null ? [] : [
            group.knownCostCents
        ]));
    if (lineCount !== value.lineCount || knownCostLines !== value.knownCostLines || missingCostLines !== value.missingCostLines) return false;
    return value.knownCostLines === 0 ? value.knownCostCents === null && groups.every((group)=>group.knownCostCents === null) : typeof value.knownCostCents === 'number' && count(value.knownCostCents) && value.knownCostCents === knownCosts;
}
function validSelectedMaterialRows(rows, costs) {
    if (!rows.every(validMaterialEvidenceRow) || costs.kind !== 'available') return false;
    const materialRows = rows;
    const groups = new Map(costs.groups.map((group)=>[
            group.status,
            group
        ]));
    return new Set(materialRows.map((row)=>row.id)).size === rows.length && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].every((status)=>{
        const observed = materialRows.filter((row)=>row.status === status);
        const group = groups.get(status);
        const observedKnown = observed.filter((row)=>row.lineCostCents !== null);
        const observedCost = safeSum(observedKnown.map((row)=>row.lineCostCents));
        if (observed.length > group.lineCount || observedKnown.length > group.knownCostLines || observedKnown.length + observed.filter((row)=>row.lineCostCents === null).length > group.lineCount || observedCost === undefined || group.knownCostCents !== null && observedCost > group.knownCostCents) return false;
        return materialRows.length !== costs.lineCount || observed.length === group.lineCount && observedKnown.length === group.knownCostLines && (group.knownCostCents === null ? observedCost === 0 : observedCost === group.knownCostCents);
    });
}
function validFinancialReportResult(result, period, access, expectedToday, expectedTimezone) {
    if (!isRecord(result) || !hasExactKeys(result, [
        'from',
        'to',
        'today',
        'timezone',
        'periodLabel',
        'snapshotLabel',
        'scopeLabel',
        'estimates',
        'costs',
        'evidence'
    ]) || !date(result.today) || result.today !== expectedToday || result.timezone !== expectedTimezone || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validReportTimezone"])(expectedTimezone) || ![
        result.periodLabel,
        result.snapshotLabel
    ].every((value)=>typeof value === 'string' && safeText(value, 200)) || typeof result.scopeLabel !== 'string' || !safeText(result.scopeLabel, 4000)) return false;
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, result.today, 'history');
    if (!range.range || result.from !== range.range.from || result.to !== range.range.to) return false;
    const canReadEstimateValues = access.canReadEstimates && access.canReadEstimateValues;
    const canReadCosts = access.canReadWorkOrders && access.canReadWorkOrderCosts;
    if (!isRecord(result.estimates) || !isRecord(result.evidence) || !hasExactKeys(result.evidence, [
        'kind',
        'total',
        'page',
        'pageSize',
        'rows'
    ]) || !Array.isArray(result.evidence.rows) || ![
        'accepted',
        'awaiting',
        'materials'
    ].some((kind)=>kind === result.evidence.kind) || !count(result.evidence.total) || !positive(result.evidence.page) || !positive(result.evidence.pageSize) || result.evidence.page > Math.max(1, Math.ceil(result.evidence.total / result.evidence.pageSize)) || result.evidence.rows.length !== Math.min(result.evidence.pageSize, Math.max(0, result.evidence.total - (result.evidence.page - 1) * result.evidence.pageSize)) || !validCostSnapshot(result.costs, canReadCosts)) return false;
    if (result.estimates.kind === 'unavailable') {
        if (!hasExactKeys(result.estimates, [
            'kind',
            'explanation'
        ]) || typeof result.estimates.explanation !== 'string' || !safeText(result.estimates.explanation, 200) || result.evidence.kind !== 'materials' && result.evidence.total !== 0) return false;
    } else {
        if (!access.canReadEstimates || result.estimates.kind !== 'available' || !hasExactKeys(result.estimates, [
            'kind',
            'accepted',
            'awaiting'
        ]) || !validEstimateMetric(result.estimates.accepted) || !validEstimateMetric(result.estimates.awaiting) || !canReadEstimateValues && (result.estimates.accepted.money.kind !== 'unavailable' || result.estimates.awaiting.money.kind !== 'unavailable')) return false;
        if (result.evidence.kind === 'accepted' || result.evidence.kind === 'awaiting') {
            const metric = result.estimates[result.evidence.kind];
            if (result.evidence.total !== metric.count) return false;
        } else if (result.evidence.total !== 0 && !canReadCosts) return false;
    }
    if (result.evidence.kind === 'materials') {
        const costTotal = canReadCosts && result.costs.kind === 'available' ? result.costs.lineCount : 0;
        if (result.evidence.total !== costTotal || costTotal > 0 && !validSelectedMaterialRows(result.evidence.rows, result.costs) || costTotal === 0 && result.evidence.rows.length !== 0) return false;
    }
    if (result.evidence.kind === 'accepted' || result.evidence.kind === 'awaiting') {
        if (!access.canReadEstimates || result.estimates.kind === 'unavailable') return result.evidence.total === 0 && result.evidence.rows.length === 0;
        if (result.estimates.kind !== 'available') return false;
        return validEstimateEvidencePage(result.evidence.rows, result.evidence.kind, result, result.estimates[result.evidence.kind], canReadEstimateValues);
    }
    if (result.evidence.kind === 'materials' && !canReadCosts) {
        return result.evidence.total === 0 && result.evidence.rows.length === 0;
    }
    return true;
}
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialReport",
    ()=>FinancialReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/data-table/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$pagination$2f$pagination$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/pagination/pagination.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/money-text/money-text.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-result-state/report-result-state.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-summary/report-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report.validation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function estimateValue(value) {
    return value.kind === 'available' ? {
        kind: 'formatted',
        displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(value.preTaxCents)
    } : {
        kind: 'unavailable',
        reason: value.explanation
    };
}
function estimateMetrics(kind, label, count, money, canReadValues) {
    const value = canReadValues ? estimateValue(money) : {
        kind: 'unavailable',
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].estimateMoneyUnavailable
    };
    const basis = kind === 'accepted' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodBasis : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].currentBasis;
    return [
        {
            id: `${kind}-count`,
            label,
            value: {
                kind: 'count',
                value: count
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].commitmentHelp,
            dateBasisLabel: basis,
            evidenceId: kind
        },
        {
            id: `${kind}-value`,
            label: kind === 'accepted' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].accepted : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].awaiting,
            value,
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].commitmentHelp,
            dateBasisLabel: basis,
            evidenceId: kind
        },
        ...canReadValues && money.kind === 'available' ? [
            {
                id: `${kind}-customer-total`,
                label: kind === 'accepted' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].acceptedCustomerTotal : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].awaitingCustomerTotal,
                value: {
                    kind: 'formatted',
                    displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(money.customerTotalCents)
                },
                description: 'Customer tax-inclusive total is displayed separately from pre-tax commitment value.',
                dateBasisLabel: basis,
                evidenceId: kind
            }
        ] : []
    ];
}
function displayRows(rows, canReadEstimateValues) {
    return rows.map((row)=>{
        if (row.kind === 'material') return {
            id: `material:${row.id}`,
            label: row.workOrderLabel,
            recordId: row.workOrderId,
            details: row.itemLabel,
            date: '',
            state: `${row.workOrderStatus === 'issued' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].workOrderStatus.issued : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].workOrderStatus['in-progress']} / ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].materialStatus[row.status]}`,
            job: row.jobLabel ?? 'Job reference unavailable',
            quantity: `${row.quantity} ${row.unit}`,
            unitCost: row.unitCostCents === null ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.unitCostCents),
            lineCost: row.lineCostCents === null ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.lineCostCents),
            preTax: null,
            tax: null,
            customerTotal: null,
            changedAfterIssue: row.changedAfterIssue ? 'Yes' : 'No'
        };
        const estimateLabel = `${row.estimateNumber} / revision ${row.revision}`;
        return {
            id: `${row.kind}:${row.familyId}`,
            label: row.label,
            ...row.recordId !== undefined ? {
                recordId: row.recordId
            } : {},
            details: estimateLabel,
            date: row.kind === 'accepted' ? row.decisionDate : row.issuedDate,
            state: row.kind === 'accepted' ? 'Accepted' : row.validUntil === null ? 'Awaiting decision / no expiry' : 'Awaiting decision',
            job: '',
            quantity: '',
            unitCost: null,
            lineCost: null,
            preTax: canReadEstimateValues && row.money.kind === 'available' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.money.preTaxCents) : row.money.kind === 'unavailable' && canReadEstimateValues ? `Unavailable: ${row.money.explanation}` : null,
            tax: canReadEstimateValues && row.money.kind === 'available' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.money.taxCents) : row.money.kind === 'unavailable' && canReadEstimateValues ? `Unavailable: ${row.money.explanation}` : null,
            customerTotal: canReadEstimateValues && row.money.kind === 'available' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.money.customerTotalCents) : row.money.kind === 'unavailable' && canReadEstimateValues ? `Unavailable: ${row.money.explanation}` : null,
            changedAfterIssue: ''
        };
    });
}
function FinancialReport({ state, period, today, timezone, access, canRead, pending = false, onPeriodApply, onEvidence, onRecord, onPageChange, onPageSizeChange, onRetry }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].denied
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
        lineNumber: 149,
        columnNumber: 24
    }, this);
    if (state.kind !== 'ready') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
        state: state,
        canRead: true,
        canEdit: false,
        pending: pending,
        onRetry: onRetry,
        onEdit: ()=>undefined
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
        lineNumber: 150,
        columnNumber: 38
    }, this);
    const result = state.result;
    const valid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validFinancialReportResult"])(result, period, access, today, timezone);
    if (!valid) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].invalid
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
        lineNumber: 154,
        columnNumber: 22
    }, this);
    const estimateSnapshot = result.estimates.kind === 'available' ? result.estimates : undefined;
    const estimatesAvailable = access.canReadEstimates && estimateSnapshot !== undefined;
    const estimateValuesAvailable = access.canReadEstimates && access.canReadEstimateValues;
    const costSnapshot = result.costs.kind === 'available' ? result.costs : undefined;
    const costsAvailable = access.canReadWorkOrders && access.canReadWorkOrderCosts && costSnapshot !== undefined;
    const acceptedMetrics = estimateSnapshot ? estimateMetrics('accepted', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].acceptedCount, estimateSnapshot.accepted.count, estimateSnapshot.accepted.money, estimateValuesAvailable) : [
        {
            id: 'accepted-unavailable',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodEstimates,
            value: {
                kind: 'unavailable',
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].estimatePermission
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].commitmentHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodBasis
        }
    ];
    const awaitingMetrics = estimateSnapshot ? estimateMetrics('awaiting', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].awaitingCount, estimateSnapshot.awaiting.count, estimateSnapshot.awaiting.money, estimateValuesAvailable) : [
        {
            id: 'awaiting-unavailable',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].currentEstimates,
            value: {
                kind: 'unavailable',
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].estimatePermission
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].commitmentHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].currentBasis
        }
    ];
    const costMetrics = costSnapshot ? [
        {
            id: 'known-costs',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].knownCosts,
            value: costSnapshot.lineCount === 0 || costSnapshot.knownCostCents === null ? {
                kind: 'unavailable',
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].noKnownCosts
            } : costSnapshot.missingCostLines > 0 ? {
                kind: 'incomplete',
                displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(costSnapshot.knownCostCents),
                coverageLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].missingCostCoverage(costSnapshot.knownCostLines, costSnapshot.lineCount)
            } : {
                kind: 'formatted',
                displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(costSnapshot.knownCostCents)
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costsBasis,
            evidenceId: 'materials'
        },
        {
            id: 'known-lines',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].knownLines,
            value: {
                kind: 'count',
                value: costSnapshot.knownCostLines
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costsBasis,
            evidenceId: 'materials'
        },
        {
            id: 'missing-lines',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].missingLines,
            value: {
                kind: 'count',
                value: costSnapshot.missingCostLines
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costsBasis,
            evidenceId: 'materials'
        }
    ] : [
        {
            id: 'costs-unavailable',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].materialCosts,
            value: {
                kind: 'unavailable',
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costPermission
            },
            description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
            dateBasisLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costsBasis
        }
    ];
    const evidenceAvailable = result.evidence.kind === 'materials' ? costsAvailable : estimatesAvailable;
    const selectEvidence = (evidenceId)=>{
        if (evidenceId === 'accepted' || evidenceId === 'awaiting' || evidenceId === 'materials') onEvidence(evidenceId);
    };
    const tableRows = displayRows(result.evidence.rows, estimateValuesAvailable);
    const evidenceColumns = result.evidence.kind === 'materials' ? [
        {
            id: 'record',
            label: 'Work Order / item',
            render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    disabled: pending,
                    "aria-label": `View record: ${row.label}`,
                    onClick: ()=>{
                        if (!pending && row.recordId) onRecord(row.recordId);
                    },
                    className: "min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:opacity-50",
                    children: row.label
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                    lineNumber: 195,
                    columnNumber: 7
                }, this)
        },
        {
            id: 'item',
            label: 'Material',
            render: (row)=>row.details
        },
        {
            id: 'job',
            label: 'Job',
            render: (row)=>row.job
        },
        {
            id: 'work-order-status',
            label: 'Work Order status',
            render: (row)=>row.state.split(' / ')[0]
        },
        {
            id: 'status',
            label: 'Material status',
            render: (row)=>row.state.split(' / ')[1]
        },
        {
            id: 'quantity',
            label: 'Listed quantity',
            render: (row)=>row.quantity
        },
        {
            id: 'unit-cost',
            label: 'Recorded unit cost',
            render: (row)=>row.unitCost ?? 'Missing'
        },
        {
            id: 'line-cost',
            label: 'Rounded line cost',
            render: (row)=>row.lineCost ?? 'Missing'
        },
        {
            id: 'changed',
            label: 'Changed after issue',
            render: (row)=>row.changedAfterIssue
        }
    ] : [
        {
            id: 'record',
            label: 'Estimate / record',
            render: (row)=>row.recordId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    disabled: pending,
                    "aria-label": `View record: ${row.label}`,
                    onClick: ()=>{
                        if (!pending) onRecord(row.recordId);
                    },
                    className: "min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:opacity-50",
                    children: row.label
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                    lineNumber: 210,
                    columnNumber: 22
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: row.label
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                    lineNumber: 214,
                    columnNumber: 19
                }, this)
        },
        {
            id: 'revision',
            label: 'Estimate revision',
            render: (row)=>row.details
        },
        {
            id: 'state',
            label: 'Current outcome',
            render: (row)=>row.state
        },
        {
            id: 'date',
            label: result.evidence.kind === 'accepted' ? 'Customer decision date' : 'First issued date',
            render: (row)=>row.date
        },
        ...estimateValuesAvailable ? [
            {
                id: 'pre-tax',
                label: 'Frozen pre-tax value',
                render: (row)=>row.preTax ?? 'Unavailable'
            },
            {
                id: 'tax',
                label: 'Tax',
                render: (row)=>row.tax ?? 'Unavailable'
            },
            {
                id: 'customer-total',
                label: 'Customer tax-inclusive total',
                render: (row)=>row.customerTotal ?? 'Unavailable'
            }
        ] : []
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                id: `${id}-title`,
                                className: "m-0 text-2xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 228,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: "About sales value and recorded costs",
                                paragraphs: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].commitmentHelp,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].changedAfterIssue,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].activeCostScope,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodHelp,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].scopeHelp,
                                    result.scopeLabel
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 229,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 227,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm font-semibold wrap-anywhere",
                        children: result.periodLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 234,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs text-muted wrap-anywhere",
                        children: [
                            result.snapshotLabel,
                            " / ",
                            result.scopeLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 235,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 226,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportDateControls"], {
                value: period,
                context: "history",
                today: today,
                timezone: timezone,
                pending: pending,
                onApply: onPeriodApply
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 237,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-accepted-title`,
                className: "grid min-w-0 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: `${id}-accepted-title`,
                        className: "m-0 text-xl font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodEstimates
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 240,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].periodBasis,
                            " / ",
                            result.periodLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 241,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        threeColumns: true,
                        metrics: acceptedMetrics,
                        snapshotLabel: result.snapshotLabel,
                        scopeLabel: result.scopeLabel,
                        pending: pending,
                        onEvidence: selectEvidence
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 242,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 239,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-awaiting-title`,
                className: "grid min-w-0 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: `${id}-awaiting-title`,
                        className: "m-0 text-xl font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].currentEstimates
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 246,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].currentBasis,
                            " / ",
                            result.snapshotLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 247,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        threeColumns: true,
                        metrics: awaitingMetrics,
                        snapshotLabel: result.snapshotLabel,
                        scopeLabel: result.scopeLabel,
                        pending: pending,
                        onEvidence: selectEvidence
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 248,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 245,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-costs-title`,
                className: "grid min-w-0 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: `${id}-costs-title`,
                                className: "m-0 text-xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].materialCosts
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 253,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: "About recorded material costs",
                                paragraphs: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].recordedCostHelp,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].changedAfterIssue,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].activeCostScope
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 254,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 252,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].activeCostScope,
                            " / ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costsBasis,
                            " / ",
                            result.snapshotLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 256,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        threeColumns: true,
                        metrics: costMetrics,
                        snapshotLabel: result.snapshotLabel,
                        scopeLabel: result.scopeLabel,
                        pending: pending,
                        onEvidence: selectEvidence
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 257,
                        columnNumber: 7
                    }, this),
                    costSnapshot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataTable"], {
                        caption: "Material costs by status",
                        rows: costSnapshot.groups,
                        getRowId: (row)=>row.status,
                        getRowLabel: (row)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].materialStatus[row.status],
                        columns: [
                            {
                                id: 'status',
                                label: 'Material status',
                                render: (row)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].materialStatus[row.status]
                            },
                            {
                                id: 'lines',
                                label: 'Lines',
                                render: (row)=>row.lineCount
                            },
                            {
                                id: 'known',
                                label: 'Known cost lines',
                                render: (row)=>row.knownCostLines
                            },
                            {
                                id: 'missing',
                                label: 'Missing cost lines',
                                render: (row)=>row.missingCostLines
                            },
                            {
                                id: 'cost',
                                label: 'Known rounded cost',
                                render: (row)=>row.knownCostCents === null ? 'Unavailable' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.knownCostCents)
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 259,
                        columnNumber: 24
                    }, this),
                    costSnapshot?.missingCostLines ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].missingCostCoverage(costSnapshot.knownCostLines, costSnapshot.lineCount)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 268,
                        columnNumber: 41
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].changedAfterIssue
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 271,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 251,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].evidence(result.evidence),
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "m-0 text-xl font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].evidence(result.evidence)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 274,
                        columnNumber: 7
                    }, this),
                    !evidenceAvailable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: result.evidence.kind === 'materials' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].costPermission : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].estimatePermission
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 275,
                        columnNumber: 29
                    }, this) : result.evidence.total === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
                        state: {
                            kind: 'empty'
                        },
                        canRead: true,
                        canEdit: false,
                        pending: pending,
                        onRetry: onRetry,
                        onEdit: ()=>undefined
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                        lineNumber: 277,
                        columnNumber: 44
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataTable"], {
                                caption: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportData"].evidence(result.evidence),
                                rows: tableRows,
                                getRowId: (row)=>row.id,
                                getRowLabel: (row)=>`${row.label} ${row.details}`,
                                columns: evidenceColumns
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 280,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$pagination$2f$pagination$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Pagination"], {
                                total: result.evidence.total,
                                page: result.evidence.page,
                                pageSize: result.evidence.pageSize,
                                disabled: pending,
                                onPageChange: onPageChange,
                                onPageSizeChange: onPageSizeChange
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
                lineNumber: 273,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report.tsx",
        lineNumber: 225,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptFinancialReadResponse",
    ()=>adaptFinancialReadResponse,
    "adaptFinancialReportResponses",
    ()=>adaptFinancialReportResponses,
    "financialReportAccess",
    ()=>financialReportAccess,
    "financialReportRequests",
    ()=>financialReportRequests,
    "financialReportScopeKey",
    ()=>financialReportScopeKey,
    "visibleFinancialRecord",
    ()=>visibleFinancialRecord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-estimates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-materials.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report.validation.ts [app-ssr] (ecmascript)");
;
;
;
function financialReportScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.authority,
        result.exportAccess
    ]);
}
function financialReportAccess(result) {
    return {
        canReadEstimates: result.authority.estimates !== null,
        canReadEstimateValues: result.authority.estimates?.money ?? false,
        canReadWorkOrders: result.authority.materials.read,
        canReadWorkOrderCosts: result.authority.materials.costs
    };
}
function adaptFinancialReadResponse(raw, input) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportReadResultSchema"].safeParse(raw);
    if (!parsed.success) throw new Error('Financial report data does not match the current request, authority or evidence. Reload the report.');
    const response = parsed.data;
    if (financialReportScopeKey(response) !== input.scopeKey || JSON.stringify(response.query) !== JSON.stringify(input.request) || response.today !== input.today || response.timezone !== input.timezone) {
        throw new Error('Financial report request or authority has changed. Reload the report.');
    }
    return adaptFinancialReportResponses(response.reports, {
        requests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportNativeQueries"])(input.request),
        selected: input.request.selected,
        period: input.period,
        scopeKey: input.scopeKey,
        canRead: true,
        access: financialReportAccess(response),
        today: input.today,
        timezone: input.timezone,
        estimateScope: response.authority.estimates?.scope ?? 'workspace',
        estimateArchives: response.authority.estimates?.archives ?? 'excluded',
        materialScope: response.authority.materials.scope,
        canReadJobLabels: response.authority.materials.jobLabels
    });
}
function visibleFinancialRecord(result, id) {
    if (result.query.selected === 'materials') {
        if (result.reports.materials.rows.some((row)=>row.workOrderId === id)) return {
            kind: 'work-order',
            recordId: id
        };
    } else {
        const section = result.reports[result.query.selected].estimates;
        if (section.kind !== 'unavailable' && section.report.rows.some((row)=>row.recordId === id)) {
            return {
                kind: 'estimate',
                recordId: id
            };
        }
    }
    return undefined;
}
function financialReportRequests(input) {
    const period = {
        from: input.range.from,
        to: input.range.to
    };
    const estimate = (selected)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialEstimatesQuerySchema"].parse({
            workspaceId: input.workspaceId,
            view: 'financial-estimates',
            period,
            selected,
            filters: {
                owners: [],
                parents: []
            },
            page: input.selected === selected ? input.page : 1,
            pageSize: input.pageSize
        });
    if (![
        'accepted',
        'awaiting',
        'materials'
    ].includes(input.selected)) throw new Error('Unsupported Financial evidence selection.');
    return {
        accepted: estimate('accepted'),
        awaiting: estimate('awaiting'),
        materials: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialMaterialsQuerySchema"].parse({
            workspaceId: input.workspaceId,
            view: 'financial-materials',
            filters: {
                statuses: []
            },
            selected: 'all',
            page: input.selected === 'materials' ? input.page : 1,
            pageSize: input.pageSize
        })
    };
}
const matchesPage = (response, request)=>response.pageSize === request.pageSize && response.page === Math.min(request.page, Math.max(1, Math.ceil(response.evidenceTotal / response.pageSize)));
const snapshotDate = (asOf, timezone)=>{
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date(asOf));
    const part = (type)=>parts.find((value)=>value.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
};
function adaptFinancialReportResponses(raw, input) {
    const requests = {
        accepted: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialEstimatesQuerySchema"].parse(input.requests.accepted),
        awaiting: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialEstimatesQuerySchema"].parse(input.requests.awaiting),
        materials: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialMaterialsQuerySchema"].parse(input.requests.materials)
    };
    const accepted = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialEstimatesResultSchema"].parse(raw.accepted), awaiting = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialEstimatesResultSchema"].parse(raw.awaiting);
    const materials = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialMaterialsResultSchema"].parse(raw.materials);
    const fail = ()=>{
        throw new Error('Financial results do not match the current request or authority. Retry the report.');
    };
    if (!input.canRead || !input.scopeKey.trim() || requests.accepted.selected !== 'accepted' || requests.awaiting.selected !== 'awaiting' || requests.materials.selected !== 'all' || requests.accepted.filters.owners.length || requests.accepted.filters.parents.length || requests.awaiting.filters.owners.length || requests.awaiting.filters.parents.length || requests.materials.filters.statuses.length || requests.awaiting.workspaceId !== requests.accepted.workspaceId || requests.materials.workspaceId !== requests.accepted.workspaceId || requests.awaiting.period.from !== requests.accepted.period.from || requests.awaiting.period.to !== requests.accepted.period.to || requests.accepted.pageSize !== requests.awaiting.pageSize || requests.accepted.pageSize !== requests.materials.pageSize || ![
        'accepted',
        'awaiting',
        'materials'
    ].includes(input.selected)) fail();
    const stamps = [], coverage = [];
    for (const [kind, response] of [
        [
            'accepted',
            accepted
        ],
        [
            'awaiting',
            awaiting
        ]
    ]){
        const request = requests[kind];
        if (response.workspaceId !== request.workspaceId || response.from !== request.period.from || response.to !== request.period.to || response.selected !== kind) fail();
        const section = response.estimates;
        if (section.kind === 'unavailable') {
            coverage.push(`${kind}: ${section.explanation}`);
            continue;
        }
        const report = section.report;
        if (!input.access.canReadEstimates || section.kind !== kind || report.scope !== input.estimateScope || report.timezone !== input.timezone || snapshotDate(report.asOf, report.timezone) !== input.today || !matchesPage(report, request) || report.filters.owners.length || report.filters.parents.length || kind === 'accepted' && section.kind === 'accepted' && section.report.archiveVisibility !== input.estimateArchives || section.kind === 'awaiting' && section.report.today !== input.today) fail();
        if (!input.access.canReadEstimateValues && (section.kind === 'accepted' ? section.report.money.kind === 'available' : section.report.awaitingMoney.kind === 'available') || !input.access.canReadEstimateValues && report.rows.some((row)=>row.money.kind === 'available')) fail();
        stamps.push(`${kind} ${report.asOf}`);
        coverage.push(`${kind}: ${report.scopeLabel}`);
    }
    if (materials.workspaceId !== requests.materials.workspaceId || materials.today !== input.today || materials.timezone !== input.timezone || snapshotDate(materials.asOf, materials.timezone) !== input.today || materials.scope !== input.materialScope || materials.selected !== 'all' || materials.filters.statuses.length || !matchesPage(materials, requests.materials) || materials.costs.kind === 'available' && (!input.access.canReadWorkOrders || !input.access.canReadWorkOrderCosts) || !input.canReadJobLabels && materials.rows.some((row)=>row.jobLabel !== null)) fail();
    stamps.push(`materials ${materials.asOf}`);
    coverage.push(`materials: ${materials.scopeLabel}`);
    const acceptedSection = accepted.estimates, awaitingSection = awaiting.estimates;
    let estimates;
    if (acceptedSection.kind === 'accepted' && awaitingSection.kind === 'awaiting') {
        estimates = {
            kind: 'available',
            accepted: {
                count: acceptedSection.report.counts.accepted,
                money: acceptedSection.report.money
            },
            awaiting: {
                count: awaitingSection.report.counts.awaiting,
                money: awaitingSection.report.awaitingMoney
            }
        };
    } else if (acceptedSection.kind === 'unavailable' && awaitingSection.kind === 'unavailable') {
        estimates = {
            kind: 'unavailable',
            explanation: acceptedSection.explanation
        };
    } else {
        return fail();
    }
    let evidence;
    if (input.selected === 'materials') {
        evidence = {
            kind: 'materials',
            total: materials.evidenceTotal,
            page: materials.page,
            pageSize: materials.pageSize,
            rows: materials.rows.map((row)=>({
                    kind: 'material',
                    ...row
                }))
        };
    } else {
        const section = input.selected === 'accepted' ? acceptedSection : awaitingSection;
        if (section.kind === 'unavailable') {
            evidence = {
                kind: input.selected,
                total: 0,
                page: 1,
                pageSize: requests[input.selected].pageSize,
                rows: []
            };
        } else {
            const rows = section.kind === 'accepted' ? section.report.rows.map((row)=>({
                    kind: 'accepted',
                    familyId: row.familyId,
                    recordId: row.recordId,
                    estimateNumber: row.estimateNumber,
                    revision: row.revision,
                    label: row.label,
                    archived: row.archived,
                    money: row.money,
                    decisionDate: row.decisionDate
                })) : section.report.rows.map((row)=>{
                if (row.status === 'accepted') throw new Error('Unexpected handoff evidence in Financial awaiting quotes.');
                return {
                    kind: 'awaiting',
                    familyId: row.familyId,
                    recordId: row.recordId,
                    estimateNumber: row.estimateNumber,
                    revision: row.revision,
                    label: row.label,
                    archived: row.archived,
                    money: row.money,
                    issuedDate: row.issuedDate,
                    validUntil: row.validUntil
                };
            });
            evidence = {
                kind: input.selected,
                total: section.report.evidenceTotal,
                page: section.report.page,
                pageSize: section.report.pageSize,
                rows
            };
        }
    }
    const result = {
        from: accepted.from,
        to: accepted.to,
        today: input.today,
        timezone: input.timezone,
        periodLabel: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(accepted.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(accepted.to)}`,
        snapshotLabel: 'Separate section snapshots; see coverage for timestamps.',
        scopeLabel: `${coverage.join(' ')} Read at: ${stamps.join('; ')}. No single cross-section snapshot is claimed.`,
        estimates,
        costs: materials.costs.kind === 'available' ? {
            kind: 'available',
            ...materials.costs.coverage,
            groups: materials.costs.groups
        } : {
            kind: 'unavailable',
            explanation: materials.costs.explanation
        },
        evidence
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validFinancialReportResult"])(result, input.period, input.access, input.today, input.timezone)) {
        throw new Error('Financial metrics and selected evidence cannot be displayed consistently. Retry the report.');
    }
    return {
        scopeKey: input.scopeKey,
        state: {
            kind: 'ready',
            result
        }
    };
}
}),
"[project]/apps/web/src/features/reports/financial-report/financial-export.client.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialCSVChangedError",
    ()=>FinancialCSVChangedError,
    "FinancialCSVDeniedError",
    ()=>FinancialCSVDeniedError,
    "financialExportFilename",
    ()=>financialExportFilename,
    "financialExportInput",
    ()=>financialExportInput,
    "financialExportLabels",
    ()=>financialExportLabels,
    "loadFinancialCSVPreview",
    ()=>loadFinancialCSVPreview,
    "receiveFinancialCSV",
    ()=>receiveFinancialCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-export.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/receive-report-csv.ts [app-ssr] (ecmascript)");
;
;
const financialExportLabels = {
    summary: 'Selected section summary',
    evidence: 'Selected section evidence'
};
function financialExportInput(query, dataset) {
    const { page, pageSize, ...unpaged } = query;
    void page;
    void pageSize;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportExportInputSchema"].parse({
        dataset,
        query: unpaged
    });
}
function financialExportFilename(input, today) {
    return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
class FinancialCSVChangedError extends Error {
    constructor(){
        super('Financial export data or access changed. Refresh the preview and review again.');
    }
}
class FinancialCSVDeniedError extends Error {
    constructor(){
        super('This Financial section is unavailable under current export access. Change the selection or reload access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new FinancialCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Financial selection and technical CSV limits.' : 'Financial CSV could not be completed. Try again.');
}
async function loadFinancialCSVPreview(input, authority, signal) {
    const access = input.query.selected === 'materials' ? authority.exportAccess.materials : authority.exportAccess.estimates;
    if (!access) throw new FinancialCSVDeniedError();
    const response = await fetch('/api/reports/financial/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportExportPreviewSchema"].parse(await response.json());
    const scope = typeof access === 'string' ? access : access.scope;
    const jobScope = typeof access === 'string' ? null : access.jobScope;
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || preview.scope !== scope || preview.jobScope !== jobScope || preview.archiveVisibility !== (input.query.selected === 'accepted' ? authority.authority.estimates?.archives : 'excluded') || preview.today !== authority.today || preview.timezone !== authority.timezone) throw new FinancialCSVChangedError();
    return preview;
}
async function receiveFinancialCSV(preview, signal) {
    const response = await fetch('/api/reports/financial/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["receiveReportCSV"])(response, preview.columns, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportExportGenerationSchema"], (metadata)=>{
        if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || metadata.section !== preview.section || metadata.scope !== preview.scope || metadata.jobScope !== preview.jobScope || metadata.archiveVisibility !== preview.archiveVisibility || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new FinancialCSVChangedError();
    }, signal, 'Financial');
}
;
}),
"[project]/apps/web/src/features/reports/financial-report/financial-export.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialExport",
    ()=>FinancialExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-export.client.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveFinancialCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-ssr] (ecmascript) <export saveReportCSV as saveFinancialCSV>");
'use client';
;
;
;
;
;
function FinancialExport({ request, authority, onClose, onReload }) {
    const [dataset, setDataset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('summary');
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [resolved, setResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        state: {
            kind: 'loading'
        },
        denied: false
    });
    const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const operation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const key = JSON.stringify([
        request,
        dataset,
        retry
    ]);
    const current = resolved.key === key ? resolved : {
        state: {
            kind: 'loading'
        },
        denied: false,
        metadata: undefined
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        active.current = true;
        return ()=>{
            active.current = false;
            operation.current?.abort();
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const abort = new AbortController();
        operation.current = abort;
        review.current = undefined;
        void (async ()=>{
            try {
                const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadFinancialCSVPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["financialExportInput"])(request, dataset), authority, AbortSignal.any([
                    abort.signal,
                    AbortSignal.timeout(30000)
                ]));
                if (abort.signal.aborted) return;
                const id = crypto.randomUUID();
                review.current = {
                    id,
                    preview
                };
                setResolved({
                    key,
                    denied: false,
                    metadata: preview,
                    state: preview.count > preview.limits.rows ? {
                        kind: 'limit'
                    } : {
                        kind: 'ready',
                        preview: {
                            id,
                            reportLabel: 'Financial',
                            viewLabel: `${request.selected}: ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["financialExportLabels"][dataset]}`,
                            periodLabel: request.selected === 'accepted' ? `${request.period.from} - ${request.period.to}` : 'As of now',
                            dateBasisLabel: request.selected === 'accepted' ? 'Decision date' : 'Current snapshot',
                            timezone: preview.timezone,
                            filtersLabel: 'Selected Financial section',
                            scopeLabel: `${preview.scope}; archived records ${preview.archiveVisibility}; Job labels ${preview.jobScope ?? 'withheld'}`,
                            filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["financialExportFilename"])(preview.input, preview.today),
                            expectedRows: preview.count
                        }
                    }
                });
            } catch (failure) {
                if (abort.signal.aborted) return;
                setResolved({
                    key,
                    denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVDeniedError"],
                    state: {
                        kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVChangedError"] ? 'changed' : 'error'
                    }
                });
                setError(failure instanceof Error ? failure.message : 'Financial CSV preview could not be loaded.');
            }
        })();
        return ()=>abort.abort();
    }, [
        request,
        authority,
        dataset,
        key
    ]);
    const download = async (id)=>{
        const selected = review.current;
        if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Financial CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(selected.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveFinancialCSV"])(selected.preview, signal);
            if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveFinancialCSV$3e$__["saveFinancialCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["financialExportFilename"])(selected.preview.input, selected.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVChangedError"] || failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVDeniedError"]) {
                    review.current = undefined;
                    setResolved({
                        key,
                        denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVDeniedError"],
                        state: {
                            kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FinancialCSVChangedError"] ? 'changed' : 'error'
                        }
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Financial CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: true,
        canExport: !current.denied,
        state: current.state,
        pending: pending,
        allowEmpty: true,
        rowLimit: current.metadata?.limits.rows,
        technicalLimits: current.metadata?.limits,
        onClose: onClose,
        onDownload: download,
        onRefresh: ()=>{
            review.current = undefined;
            setError(undefined);
            setRetry((value)=>value + 1);
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "grid min-w-0 gap-2 text-sm font-semibold",
                children: [
                    "CSV dataset",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClasses"]} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`,
                        value: dataset,
                        disabled: pending,
                        onChange: (event)=>{
                            const next = event.target.value;
                            if (next !== 'summary' && next !== 'evidence') throw new Error('Invalid Financial CSV dataset.');
                            if (next === dataset) return;
                            review.current = undefined;
                            setError(undefined);
                            setDataset(next);
                        },
                        children: [
                            'summary',
                            'evidence'
                        ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["financialExportLabels"][value]
                            }, value, false, {
                                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                                lineNumber: 88,
                                columnNumber: 58
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                        lineNumber: 81,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 80,
                columnNumber: 5
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 91,
                columnNumber: 15
            }, this),
            (current.denied || current.state.kind === 'changed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Reload report access",
                disabled: pending,
                onClick: ()=>{
                    onClose();
                    onReload();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 92,
                columnNumber: 62
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: "Only the selected section is exported. Unavailable amounts are not zero; recorded material costs are not actual spending or profit."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 94,
                columnNumber: 5
            }, this),
            current.metadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    "Snapshot: ",
                    current.metadata.asOf,
                    ". ",
                    current.metadata.coverage
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 96,
                columnNumber: 26
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
                lineNumber: 97,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-export.tsx",
        lineNumber: 75,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinancialReportPage",
    ()=>FinancialReportPage,
    "FinancialReportRoute",
    ()=>FinancialReportRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-report.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/financial-report/financial-export.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/report-templates.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/template-session.tsx [app-ssr] (ecmascript)");
'use client';
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
function FinancialReportPage({ initial, ...actions }) {
    const stamps = [
        initial.reports.accepted.estimates,
        initial.reports.awaiting.estimates
    ].map((section)=>section.kind === 'unavailable' ? '' : section.report.asOf);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FinancialReportPageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                ...actions
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 24,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportScopeKey"])(initial)}:${initial.reports.materials.asOf}:${stamps.join(':')}`, false, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
function FinancialReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }) {
    const today = initial.today, timezone = initial.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportScopeKey"])(initial);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? {
        preset: 'custom',
        ...initial.query.period
    });
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.selected);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.page), [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.pageSize);
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'history').range;
        if (!resolved) throw new Error('Choose a valid Financial report period.');
        return {
            from: resolved.from,
            to: resolved.to
        };
    }, [
        period,
        today
    ]);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportQuerySchema"].parse({
            workspaceId: initial.workspaceId,
            view: 'financial',
            period: range,
            selected,
            page,
            pageSize
        }), [
        initial.workspaceId,
        range,
        selected,
        page,
        pageSize
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const adaptationInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            request,
            period,
            scopeKey,
            today,
            timezone
        }), [
        request,
        period,
        scopeKey,
        today,
        timezone
    ]);
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptFinancialReadResponse"])(raw, adaptationInput);
    }, [
        adaptationInput
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/financial?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Financial report could not be loaded. Try again.'
    });
    let adapted, raw;
    let error = loaded.key === key ? loaded.error : undefined;
    if (!loaded.pending && loaded.raw) {
        try {
            adapted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptFinancialReadResponse"])(loaded.raw, adaptationInput);
            raw = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportReadResultSchema"].parse(loaded.raw);
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Financial report data is invalid. Reload the report.';
        }
    }
    const state = adapted?.state ?? (loaded.pending ? {
        kind: 'loading'
    } : {
        kind: 'error',
        message: error
    });
    const exportAllowed = raw && (selected === 'materials' ? raw.exportAccess.materials : raw.exportAccess.estimates);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "grid min-w-0 gap-6 p-4 sm:p-8",
        children: [
            !(loaded.key === key && loaded.denied) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                area: "financial",
                workspaceId: initial.workspaceId,
                query: request,
                period: period,
                ready: !loaded.pending && !error && !!raw,
                active: template,
                onRun: onTemplateRun
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 61,
                columnNumber: 48
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                        lineNumber: 64,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                        lineNumber: 64,
                        columnNumber: 52
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 63,
                columnNumber: 15
            }, this),
            exportAllowed && !loaded.pending && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                    label: "Preview CSV",
                    onClick: ()=>setExportOpen(true)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                    lineNumber: 67,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 66,
                columnNumber: 52
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FinancialReport"], {
                state: state,
                period: period,
                today: today,
                timezone: timezone,
                access: raw ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["financialReportAccess"])(raw) : {
                    canReadEstimates: false,
                    canReadEstimateValues: false,
                    canReadWorkOrders: false,
                    canReadWorkOrderCosts: false
                },
                canRead: !(loaded.key === key && loaded.denied),
                pending: loaded.pending,
                onPeriodApply: (value)=>{
                    setPeriod(value);
                    setSelected('accepted');
                    setPage(1);
                },
                onEvidence: (value)=>{
                    if (!loaded.pending && raw) {
                        setSelected(value);
                        setPage(1);
                    }
                },
                onRecord: (id)=>{
                    if (!loaded.pending && raw) {
                        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["visibleFinancialRecord"])(raw, id);
                        if (record) onRecord(record);
                    }
                },
                onPageChange: setPage,
                onPageSizeChange: (size)=>{
                    setPageSize(size);
                    setPage(1);
                },
                onRetry: ()=>setRetry((value)=>value + 1)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 69,
                columnNumber: 5
            }, this),
            exportOpen && raw && exportAllowed && !loaded.pending && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$financial$2d$report$2f$financial$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FinancialExport"], {
                request: request,
                authority: raw,
                onClose: ()=>setExportOpen(false),
                onReload: onReload
            }, `${scopeKey}:${JSON.stringify(request)}`, false, {
                fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
                lineNumber: 78,
                columnNumber: 73
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
        lineNumber: 60,
        columnNumber: 10
    }, this);
}
function FinancialReportRoute({ initial }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FinancialReportPage, {
        initial: initial,
        onReload: ()=>router.refresh(),
        onRecord: (record)=>router.push(`/${record.kind === 'estimate' ? 'estimates' : 'work-orders'}/${encodeURIComponent(record.recordId)}?workspace=${encodeURIComponent(initial.workspaceId)}`)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/financial-report/financial-report-page.tsx",
        lineNumber: 85,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_reports_financial-report_08.dg4h._.js.map
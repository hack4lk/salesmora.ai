module.exports = [
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadSourceReportData",
    ()=>leadSourceReportData
]);
const leadSourceReportData = {
    title: 'Lead-source effectiveness',
    help: 'About lead-source effectiveness',
    cohort: 'Leads created in period',
    converted: 'Converted leads',
    rate: 'Creation-cohort conversion',
    acceptedValue: 'Accepted estimate value (pre-tax)',
    unattributedValue: 'Unattributed accepted estimate value',
    breakdown: 'Current recorded source',
    definition: 'Distinct authorized leads created in the selected period, grouped by each lead’s current editable source label. A later source edit can regroup historical creation-cohort counts.',
    conversion: 'A converted lead is a distinct lead with at least one surviving authorized linked Job as of the snapshot. Jobs can be created after the period; canceled Jobs still prove creation. Won stage alone is not conversion. Conversion is current as of the snapshot, not historical at period end.',
    provenance: 'Current recorded source is not immutable acquisition provenance. Creation-origin or capture-receipt attribution is not inferred.',
    archives: 'Authorized archived leads remain in the creation cohort; deleted leads and deleted Jobs do not contribute. Source rows reconcile to the same cohort.',
    permission: 'Conversion counts and rates are withheld because current permissions cannot prove complete supporting Lead and Job access. No hidden linkage is exposed.',
    moneyPermission: 'Accepted estimate value and evidence require complete workspace Lead, Job and Estimate read access, including Lead and Estimate archives. The dedicated Financial report permission is not required for these ordinary Estimate values.',
    money: 'Sum of each distinct accepted estimate family linked to this lead-creation cohort, using its frozen pre-tax amount and current effective accepted decision as of the snapshot. This is quoted value, not revenue or profit.',
    unattributed: 'Cohort-reachable accepted estimate families with multiple plausible lead/source links are counted once here, not assigned to a source. Estimates with no proven path into this cohort are excluded.',
    empty: 'No leads were created in this authorized cohort; conversion rates have no denominator.',
    unavailable: 'Unavailable',
    evidence: {
        cohort: 'Source cohort leads',
        converted: 'Converted source-cohort leads',
        estimates: 'Accepted source-cohort estimates'
    },
    invalid: 'Lead-source effectiveness could not be displayed because the source groups, cohort, conversion totals, accepted estimate value, date basis or evidence are inconsistent. Retry the report.'
};
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatLeadSourceRate",
    ()=>formatLeadSourceRate,
    "leadSourceLabels",
    ()=>leadSourceLabels,
    "validLeadSourceResult",
    ()=>validLeadSourceResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$conversion$2d$report$2f$lead$2d$conversion$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-conversion-report/lead-conversion-report.validation.ts [app-ssr] (ecmascript)");
;
;
const leadSourceLabels = {
    website: 'Website',
    referral: 'Referral',
    phone: 'Phone',
    gmail: 'Gmail',
    other: 'Other'
};
const nonnegative = (value)=>Number.isSafeInteger(value) && value >= 0;
const positive = (value)=>Number.isSafeInteger(value) && value > 0;
const validCents = nonnegative;
const date = (value)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const knownSource = (value)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>source === value);
const validCohortRow = (row, result)=>row.id.trim() !== '' && row.label.trim() !== '' && (row.recordId === undefined || row.recordId.trim() !== '') && date(row.createdDate) && row.createdDate >= result.from && row.createdDate <= result.to && knownSource(row.source);
function validLeadSourceResult(result, canReadConversion, canReadAcceptedValue) {
    const conversion = canReadConversion && result.conversion.kind === 'available' ? result.conversion : undefined;
    if (!date(result.today) || !date(result.from) || !date(result.to) || result.to < result.from || result.to > result.today || ![
        result.periodLabel,
        result.snapshotLabel,
        result.scopeLabel
    ].every((value)=>value.trim() !== '') || !nonnegative(result.cohort) || !positive(result.page) || !positive(result.pageSize) || !Array.isArray(result.groups) || result.groups.length !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].length || new Set(result.groups.map((group)=>group.source)).size !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].length || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].every((source)=>result.groups.some((group)=>group.source === source)) || result.groups.some((group)=>!knownSource(group.source) || !nonnegative(group.cohort) || conversion && (group.converted === null || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$conversion$2d$report$2f$lead$2d$conversion$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validLeadConversionCounts"])(group.cohort, group.converted)))) return false;
    const cohortTotal = result.groups.reduce((sum, group)=>sum + group.cohort, 0);
    if (!nonnegative(cohortTotal) || cohortTotal !== result.cohort) return false;
    if (!conversion) {
        if (canReadConversion && (result.conversion.kind !== 'unavailable' || result.groups.some((group)=>group.converted !== null))) return false;
        if (!canReadConversion && result.evidence.kind === 'converted') return false;
    } else {
        const converted = result.groups.reduce((sum, group)=>sum + group.converted, 0);
        if (!nonnegative(converted) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$conversion$2d$report$2f$lead$2d$conversion$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validLeadConversionCounts"])(result.cohort, conversion.converted) || converted !== conversion.converted) return false;
    }
    const acceptedValue = canReadAcceptedValue && result.acceptedValue.kind === 'available' ? result.acceptedValue : undefined;
    if (canReadAcceptedValue) {
        if (acceptedValue) {
            if (![
                acceptedValue.preTaxCents,
                acceptedValue.unattributedPreTaxCents
            ].every(validCents) || ![
                acceptedValue.estimateCount,
                acceptedValue.unattributedCount
            ].every(nonnegative) || result.groups.some((group)=>group.acceptedValueCents === null || !validCents(group.acceptedValueCents) || group.acceptedEstimateCount === null || !nonnegative(group.acceptedEstimateCount))) return false;
            const sourceValue = result.groups.reduce((sum, group)=>sum + group.acceptedValueCents, 0);
            const sourceCount = result.groups.reduce((sum, group)=>sum + group.acceptedEstimateCount, 0);
            const totalValue = sourceValue + acceptedValue.unattributedPreTaxCents;
            const totalCount = sourceCount + acceptedValue.unattributedCount;
            if (![
                sourceValue,
                sourceCount,
                totalValue,
                totalCount
            ].every(nonnegative) || totalValue !== acceptedValue.preTaxCents || totalCount !== acceptedValue.estimateCount || acceptedValue.estimateCount > 0 && !acceptedValue.evidenceId?.trim()) return false;
        } else if (result.acceptedValue.kind !== 'unavailable' || !result.acceptedValue.explanation.trim() || result.groups.some((group)=>group.acceptedValueCents !== null || group.acceptedEstimateCount !== null) || result.evidence.kind === 'accepted-estimates') return false;
    } else if (result.evidence.kind === 'accepted-estimates') return false;
    const evidence = result.evidence;
    if (![
        'cohort',
        'converted',
        'accepted-estimates'
    ].includes(evidence.kind) || !Array.isArray(evidence.rows)) return false;
    const isConvertedEvidence = (row)=>'linkedJobs' in row && typeof row.linkedJobs === 'string' && row.linkedJobs.trim() !== '';
    const total = evidence.kind === 'cohort' ? result.cohort : evidence.kind === 'converted' ? conversion?.converted ?? -1 : acceptedValue?.estimateCount ?? -1;
    const evidenceIds = evidence.kind === 'accepted-estimates' ? evidence.rows.map((row)=>row.familyId) : evidence.rows.map((row)=>row.id);
    if (total < 0 || result.page > Math.max(1, Math.ceil(total / result.pageSize)) || evidence.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) || new Set(evidenceIds).size !== evidence.rows.length) return false;
    if (evidence.kind === 'cohort') {
        if (!evidence.rows.every((row)=>validCohortRow(row, result))) return false;
        const observed = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>[
                source,
                0
            ]));
        evidence.rows.forEach((row)=>observed.set(row.source, observed.get(row.source) + 1));
        if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observed.get(source) > result.groups.find((group)=>group.source === source).cohort)) return false;
        if (result.cohort === evidence.rows.length && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observed.get(source) !== result.groups.find((group)=>group.source === source).cohort)) return false;
    } else if (evidence.kind === 'converted') {
        if (!evidence.rows.every((row)=>validCohortRow(row, result) && isConvertedEvidence(row))) return false;
        const observed = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>[
                source,
                0
            ]));
        evidence.rows.forEach((row)=>observed.set(row.source, observed.get(row.source) + 1));
        if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observed.get(source) > result.groups.find((group)=>group.source === source).converted)) return false;
        if (conversion?.converted === evidence.rows.length && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observed.get(source) !== result.groups.find((group)=>group.source === source).converted)) return false;
    }
    if (evidence.kind === 'accepted-estimates') {
        const observedValue = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>[
                source,
                0
            ]));
        const observedCount = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>[
                source,
                0
            ]));
        let unattributedValue = 0;
        let unattributedCount = 0;
        for (const row of evidence.rows){
            const source = row.source;
            if (!row.familyId.trim() || !row.estimateNumber.trim() || !row.label.trim() || !positive(row.revision) || !positive(row.decisionVersion) || !date(row.acceptedDate) || row.acceptedDate > result.today || !validCents(row.preTaxCents) || source !== null && !knownSource(source) || (source === null ? row.linkedLead !== undefined : !row.linkedLead || !row.linkedLead.recordId.trim() || !row.linkedLead.label.trim())) return false;
            if (source === null) {
                unattributedValue += row.preTaxCents;
                unattributedCount += 1;
            } else {
                observedValue.set(source, observedValue.get(source) + row.preTaxCents);
                observedCount.set(source, observedCount.get(source) + 1);
            }
        }
        if (![
            ...observedValue.values(),
            unattributedValue
        ].every(nonnegative) || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observedValue.get(source) > result.groups.find((group)=>group.source === source).acceptedValueCents || observedCount.get(source) > result.groups.find((group)=>group.source === source).acceptedEstimateCount) || unattributedValue > acceptedValue.unattributedPreTaxCents || unattributedCount > acceptedValue.unattributedCount) return false;
        if (acceptedValue.estimateCount === evidence.rows.length && (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSources"].some((source)=>observedValue.get(source) !== result.groups.find((group)=>group.source === source).acceptedValueCents || observedCount.get(source) !== result.groups.find((group)=>group.source === source).acceptedEstimateCount) || unattributedValue !== acceptedValue.unattributedPreTaxCents || unattributedCount !== acceptedValue.unattributedCount)) return false;
    }
    return true;
}
function formatLeadSourceRate(cohort, converted) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$conversion$2d$report$2f$lead$2d$conversion$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validLeadConversionCounts"])(cohort, converted) || cohort === 0) throw new RangeError('A source conversion rate requires valid counts and a nonempty cohort.');
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 1
    }).format(converted / cohort);
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourceReport",
    ()=>LeadSourceReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/data-table/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/money-text/money-text.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-summary/report-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$evidence$2d$table$2f$report$2d$evidence$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-evidence-table/report-evidence-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-result-state/report-result-state.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.validation.ts [app-ssr] (ecmascript)");
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
const formatter = new Intl.NumberFormat('en-US');
function LeadSourceReport({ state, canRead, canReadConversion, canReadAcceptedValue, canExport, canEdit, pending = false, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead || state.kind !== 'ready') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
        state: {
            kind: state.kind === 'error' ? 'error' : 'loading'
        },
        canRead: canRead,
        canEdit: canEdit,
        pending: pending,
        onRetry: onRetry,
        onEdit: onEdit
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
        lineNumber: 35,
        columnNumber: 50
    }, this);
    const result = state.result;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validLeadSourceResult"])(result, canReadConversion, canReadAcceptedValue)) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].invalid
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
        lineNumber: 39,
        columnNumber: 12
    }, this);
    const conversion = canReadConversion && result.conversion.kind === 'available' ? result.conversion : undefined;
    const acceptedValue = canReadAcceptedValue && result.acceptedValue.kind === 'available' ? result.acceptedValue : undefined;
    const unavailableMoney = canReadAcceptedValue && result.acceptedValue.kind === 'unavailable' ? result.acceptedValue.explanation : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].moneyPermission;
    const dateBasis = `Lead creation date / ${result.periodLabel} / linked Jobs and accepted estimates as of ${result.snapshotLabel}`;
    const evidence = result.evidence;
    const evidenceRows = evidence.kind === 'cohort' ? evidence.rows.map((row)=>({
            id: row.id,
            label: row.label,
            recordId: row.recordId,
            cells: {
                created: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(row.createdDate),
                source: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source]
            }
        })) : evidence.kind === 'converted' ? evidence.rows.map((row)=>({
            id: row.id,
            label: row.label,
            recordId: row.recordId,
            cells: {
                created: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(row.createdDate),
                source: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source],
                jobs: row.linkedJobs
            }
        })) : evidence.rows.map((row)=>({
            id: row.familyId,
            label: row.linkedLead?.label ?? row.label,
            recordId: row.linkedLead?.recordId,
            cells: {
                estimate: `${row.label} / ${row.estimateNumber} / revision ${row.revision}`,
                decision: `Accepted / version ${row.decisionVersion}`,
                accepted: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(row.acceptedDate),
                source: row.source === null ? 'Unattributed' : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source],
                lead: row.linkedLead?.label ?? 'Ambiguous lead/source link',
                value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.preTaxCents)
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "grid min-w-0 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: `${id}-title`,
                                className: "m-0 text-2xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 64,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].help,
                                paragraphs: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].definition,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].conversion,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].money,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unattributed,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].provenance,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].archives,
                                    result.scopeLabel
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 65,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 63,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm font-semibold wrap-anywhere",
                        children: result.periodLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 68,
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
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 69,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                lineNumber: 62,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                canRead: true,
                hideHeader: true,
                fourColumns: true,
                snapshotLabel: result.snapshotLabel,
                scopeLabel: result.scopeLabel,
                pending: pending,
                onEvidence: onEvidence,
                metrics: [
                    {
                        id: 'cohort',
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].cohort,
                        value: {
                            kind: 'count',
                            value: result.cohort
                        },
                        dateBasisLabel: dateBasis,
                        description: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].definition} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].archives}`,
                        evidenceId: result.cohortEvidenceId
                    },
                    {
                        id: 'converted',
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].converted,
                        value: conversion ? {
                            kind: 'count',
                            value: conversion.converted
                        } : {
                            kind: 'unavailable',
                            reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].permission
                        },
                        dateBasisLabel: dateBasis,
                        description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].conversion,
                        evidenceId: conversion?.evidenceId
                    },
                    {
                        id: 'rate',
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].rate,
                        value: !conversion ? {
                            kind: 'unavailable',
                            reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].permission
                        } : result.cohort === 0 ? {
                            kind: 'unavailable',
                            reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].empty
                        } : {
                            kind: 'formatted',
                            displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatLeadSourceRate"])(result.cohort, conversion.converted)
                        },
                        dateBasisLabel: dateBasis,
                        description: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].conversion} Percentages are rounded to one decimal place.`
                    },
                    {
                        id: 'accepted-value',
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].acceptedValue,
                        value: acceptedValue ? {
                            kind: 'formatted',
                            displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(acceptedValue.preTaxCents)
                        } : {
                            kind: 'unavailable',
                            reason: unavailableMoney
                        },
                        dateBasisLabel: dateBasis,
                        description: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].money} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unattributed}`,
                        evidenceId: acceptedValue?.evidenceId
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                lineNumber: 71,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-breakdown`,
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: `${id}-breakdown`,
                                className: "m-0 text-xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].breakdown
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 90,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: "About current source breakdown",
                                paragraphs: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].definition,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].money,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unattributed,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].provenance,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].archives
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 91,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 89,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataTable"], {
                        caption: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].breakdown,
                        rows: result.groups,
                        getRowId: (row)=>row.source,
                        getRowLabel: (row)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source],
                        columns: [
                            {
                                id: 'source',
                                label: 'Current recorded source',
                                render: (row)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source]
                            },
                            {
                                id: 'cohort',
                                label: 'Cohort leads',
                                render: (row)=>formatter.format(row.cohort)
                            },
                            {
                                id: 'converted',
                                label: 'Converted leads',
                                render: (row)=>row.converted === null || !conversion ? 'Unavailable' : formatter.format(row.converted)
                            },
                            {
                                id: 'rate',
                                label: 'Conversion',
                                render: (row)=>!conversion ? 'Unavailable' : row.cohort === 0 ? '—' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatLeadSourceRate"])(row.cohort, row.converted)
                            },
                            {
                                id: 'acceptedCount',
                                label: 'Accepted estimate families',
                                render: (row)=>!acceptedValue || row.acceptedEstimateCount === null ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unavailable : formatter.format(row.acceptedEstimateCount)
                            },
                            {
                                id: 'acceptedValue',
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].acceptedValue,
                                render: (row)=>!acceptedValue || row.acceptedValueCents === null ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unavailable : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.acceptedValueCents)
                            }
                        ],
                        renderCard: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                className: "m-0 grid min-w-0 grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: "Current recorded source"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 106,
                                                columnNumber: 39
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm font-semibold",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceLabels"][row.source]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 106,
                                                columnNumber: 116
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 106,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: "Cohort leads"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 107,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm",
                                                children: formatter.format(row.cohort)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 107,
                                                columnNumber: 82
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 107,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: "Converted leads"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 108,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm",
                                                children: row.converted === null || !conversion ? 'Unavailable' : formatter.format(row.converted)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 108,
                                                columnNumber: 85
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 108,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: "Conversion"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 109,
                                                columnNumber: 39
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm",
                                                children: !conversion ? 'Unavailable' : row.cohort === 0 ? '—' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatLeadSourceRate"])(row.cohort, row.converted)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 109,
                                                columnNumber: 103
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 109,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].acceptedValue
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 111,
                                                columnNumber: 39
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm",
                                                children: !acceptedValue || row.acceptedValueCents === null ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unavailable : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(row.acceptedValueCents)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 111,
                                                columnNumber: 113
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 111,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs font-semibold text-muted",
                                                children: "Accepted estimate families"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 113,
                                                columnNumber: 39
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 mt-1 text-sm",
                                                children: !acceptedValue || row.acceptedEstimateCount === null ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unavailable : formatter.format(row.acceptedEstimateCount)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                                lineNumber: 113,
                                                columnNumber: 119
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                        lineNumber: 113,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 105,
                                columnNumber: 28
                            }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 93,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].provenance,
                            " Source labels are editable; zero-count sources are included."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 117,
                        columnNumber: 7
                    }, this),
                    acceptedValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted wrap-anywhere",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "text-ink",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unattributedValue,
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 119,
                                columnNumber: 9
                            }, this),
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "text-ink tabular-nums",
                                children: [
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(acceptedValue.unattributedPreTaxCents),
                                    ' ',
                                    "(",
                                    formatter.format(acceptedValue.unattributedCount),
                                    " ",
                                    acceptedValue.unattributedCount === 1 ? 'family' : 'families',
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                                lineNumber: 120,
                                columnNumber: 9
                            }, this),
                            ' / ',
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].unattributed
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                        lineNumber: 118,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                lineNumber: 88,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$evidence$2d$table$2f$report$2d$evidence$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportEvidenceTable"], {
                viewLabel: evidence.kind === 'cohort' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].evidence.cohort : evidence.kind === 'converted' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].evidence.converted : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].evidence.estimates,
                contextInTooltip: true,
                contextLabel: `${dateBasis} / ${result.scopeLabel} / ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].conversion} / ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].money} / ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportData"].provenance}`,
                columns: evidence.kind === 'cohort' ? [
                    {
                        id: 'created',
                        label: 'Lead creation date'
                    },
                    {
                        id: 'source',
                        label: 'Current recorded source'
                    }
                ] : evidence.kind === 'converted' ? [
                    {
                        id: 'created',
                        label: 'Lead creation date'
                    },
                    {
                        id: 'source',
                        label: 'Current recorded source'
                    },
                    {
                        id: 'jobs',
                        label: 'Surviving authorized linked Jobs'
                    }
                ] : [
                    {
                        id: 'estimate',
                        label: 'Accepted estimate family'
                    },
                    {
                        id: 'decision',
                        label: 'Effective accepted decision'
                    },
                    {
                        id: 'accepted',
                        label: 'Effective accepted date'
                    },
                    {
                        id: 'source',
                        label: 'Current recorded source'
                    },
                    {
                        id: 'lead',
                        label: 'Linked lead'
                    },
                    {
                        id: 'value',
                        label: 'Frozen pre-tax value'
                    }
                ],
                rows: evidenceRows,
                total: evidence.kind === 'cohort' ? result.cohort : evidence.kind === 'converted' ? conversion.converted : acceptedValue.estimateCount,
                page: result.page,
                pageSize: result.pageSize,
                canRead: true,
                canExport: canExport,
                canEdit: canEdit,
                pending: pending,
                onRecord: onRecord,
                onExport: onExport,
                onPageChange: onPageChange,
                onPageSizeChange: onPageSizeChange,
                onRetry: onRetry,
                onEdit: onEdit
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
                lineNumber: 125,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx",
        lineNumber: 61,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptLeadSourceReportResponse",
    ()=>adaptLeadSourceReportResponse,
    "leadSourceReportRequest",
    ()=>leadSourceReportRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.validation.ts [app-ssr] (ecmascript)");
;
;
;
const selections = {
    'source-cohort': 'cohort',
    'source-converted': 'converted',
    'source-accepted-value': 'accepted-estimates'
};
function leadSourceReportRequest(input) {
    if (input.filters.stages.length || input.filters.owners.length || input.filters.sources.length) {
        throw new Error('Source report facets are not supported by the current backend. Clear the filters before requesting Sources.');
    }
    const selected = Object.entries(selections).find(([id])=>id === input.evidenceId)?.[1];
    if (!selected) throw new Error('The selected source report evidence is not supported.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse({
        workspaceId: input.workspaceId,
        view: 'lead-source',
        period: {
            from: input.range.from,
            to: input.range.to
        },
        selected,
        page: input.page,
        pageSize: input.pageSize
    });
}
function adaptLeadSourceReportResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(input.request);
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceResultSchema"].parse(raw);
    if (!input.scopeKey.trim() || response.workspaceId !== request.workspaceId || response.from !== request.period.from || response.to !== request.period.to || response.evidence.kind !== request.selected || response.pageSize !== request.pageSize || response.page !== Math.min(request.page, Math.max(1, Math.ceil(response.evidenceTotal / response.pageSize))) || response.scope !== input.scope || response.archiveVisibility !== input.archiveVisibility || !input.canReadConversion && response.conversion.kind === 'available' || !input.canReadAcceptedValue && response.acceptedValue.kind === 'available') {
        throw new Error('Source report results do not match the current request or authority. Retry the report.');
    }
    const result = {
        from: response.from,
        to: response.to,
        today: response.today,
        periodLabel: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(response.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(response.to)}`,
        snapshotLabel: `Current authorized source cohort / ${new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: response.timezone
        }).format(new Date(response.asOf))} (${response.timezone})`,
        scopeLabel: `${response.scopeLabel} ${response.archiveVisibility === 'included' ? 'Authorized archived Leads included.' : 'Archived Leads excluded by current access.'}`,
        cohort: response.cohort,
        cohortEvidenceId: 'source-cohort',
        conversion: response.conversion.kind === 'available' ? {
            kind: 'available',
            converted: response.conversion.converted,
            evidenceId: 'source-converted'
        } : {
            kind: 'unavailable'
        },
        acceptedValue: response.acceptedValue.kind === 'available' ? {
            ...response.acceptedValue,
            evidenceId: 'source-accepted-value'
        } : {
            kind: 'unavailable',
            explanation: response.acceptedValue.explanation
        },
        groups: response.groups,
        evidence: response.evidence,
        page: response.page,
        pageSize: response.pageSize
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validLeadSourceResult"])(result, input.canReadConversion, input.canReadAcceptedValue)) {
        throw new Error('Source report groups, values and evidence cannot be displayed consistently. Retry the report.');
    }
    return {
        view: 'source',
        scopeKey: input.scopeKey,
        state: {
            kind: 'ready',
            result
        }
    };
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-read.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptLeadSourceReadResponse",
    ()=>adaptLeadSourceReadResponse,
    "leadSourceScopeKey",
    ()=>leadSourceScopeKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.adapter.ts [app-ssr] (ecmascript)");
;
;
function leadSourceScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.scope,
        result.archiveVisibility,
        result.canReadConversion,
        result.canReadAcceptedValue,
        result.canExport
    ]);
}
function adaptLeadSourceReadResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(input.request), response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReadResultSchema"].parse(raw);
    if (JSON.stringify(response.query) !== JSON.stringify(request) || leadSourceScopeKey(response) !== input.scopeKey || response.report.today !== input.today || response.report.timezone !== input.timezone) {
        throw new Error('Sources report results no longer match this request or current authority. Reload the report.');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptLeadSourceReportResponse"])(response.report, {
        request,
        scopeKey: input.scopeKey,
        scope: response.scope,
        archiveVisibility: response.archiveVisibility,
        canReadConversion: response.canReadConversion,
        canReadAcceptedValue: response.canReadAcceptedValue
    });
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.client.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SourceCSVChangedError",
    ()=>SourceCSVChangedError,
    "SourceCSVDeniedError",
    ()=>SourceCSVDeniedError,
    "loadSourceCSVPreview",
    ()=>loadSourceCSVPreview,
    "receiveSourceCSV",
    ()=>receiveSourceCSV,
    "sourceExportFilename",
    ()=>sourceExportFilename,
    "sourceExportInput",
    ()=>sourceExportInput,
    "sourceExportLabels",
    ()=>sourceExportLabels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-export.ts [app-ssr] (ecmascript)");
;
const sourceExportLabels = {
    'source-groups': 'Source groups table',
    cohort: 'Full cohort evidence',
    converted: 'Converted leads and linked Jobs',
    'accepted-estimates': 'Accepted Estimate evidence'
};
function sourceExportInput(query, dataset) {
    const selected = dataset === 'converted' ? 'converted' : dataset === 'accepted-estimates' ? 'accepted-estimates' : 'cohort';
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceExportInputSchema"].parse({
        dataset,
        query: {
            workspaceId: query.workspaceId,
            view: query.view,
            period: query.period,
            selected
        }
    });
}
function sourceExportFilename(input, today) {
    return `salesmora-sources-${input.dataset}-${today}.csv`;
}
class SourceCSVChangedError extends Error {
    constructor(){
        super('Sources export data or access changed. Refresh the preview and review again.');
    }
}
class SourceCSVDeniedError extends Error {
    constructor(){
        super('This Sources export is unavailable under current access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new SourceCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Sources selection and technical CSV limits.' : 'Sources CSV could not be completed. Try again.');
}
async function loadSourceCSVPreview(input, authority, signal) {
    const response = await fetch('/api/reports/sources/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceExportPreviewSchema"].parse(await response.json());
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || preview.leadScope !== authority.scope || preview.leadArchiveVisibility !== authority.archiveVisibility || preview.today !== authority.report.today || preview.timezone !== authority.report.timezone || !authority.canExport) throw new SourceCSVChangedError();
    return preview;
}
async function receiveSourceCSV(preview, signal) {
    const response = await fetch('/api/reports/sources/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    if (!response.body) throw new Error('Sources CSV response is incomplete.');
    const reader = response.body.getReader();
    let readerFailed = false;
    const cancel = ()=>{
        void reader.cancel().catch(()=>console.error('Sources CSV response cancellation failed.'));
    };
    signal.addEventListener('abort', cancel, {
        once: true
    });
    try {
        const encoded = response.headers.get('x-report-export');
        if (!encoded || encoded.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
            throw new Error('Sources CSV generation metadata is invalid.');
        }
        const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), (character)=>character.charCodeAt(0));
        const metadata = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceExportGenerationSchema"].parse(JSON.parse(new TextDecoder('utf-8', {
            fatal: true
        }).decode(bytes)));
        if (metadata.id.length === 0 || metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || metadata.leadScope !== preview.leadScope || metadata.leadArchiveVisibility !== preview.leadArchiveVisibility || JSON.stringify(metadata.conversion) !== JSON.stringify(preview.conversion) || JSON.stringify(metadata.acceptedValue) !== JSON.stringify(preview.acceptedValue) || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new SourceCSVChangedError();
        if (response.headers.get('content-type')?.toLowerCase() !== 'text/csv; charset=utf-8') {
            throw new Error('Sources CSV response type is invalid.');
        }
        const chunks = [];
        let size = 0, lines = 0, previous = -1;
        while(true){
            signal.throwIfAborted();
            let next;
            try {
                next = await reader.read();
            } catch (error) {
                readerFailed = true;
                throw error;
            }
            if (next.done) break;
            size += next.value.byteLength;
            if (size > metadata.limits.bytes) throw new Error('Sources CSV exceeds the byte limit. No file was saved.');
            for (const byte of next.value){
                if (previous === 13 && byte === 10) lines++;
                previous = byte;
            }
            chunks.push(Uint8Array.from(next.value).buffer);
        }
        signal.throwIfAborted();
        const blob = new Blob(chunks, {
            type: 'text/csv; charset=utf-8'
        });
        const header = new TextEncoder().encode('\uFEFF' + preview.columns.map((column)=>`"${column}"`).join(',') + '\r\n');
        const receivedHeader = new Uint8Array(await blob.slice(0, header.length).arrayBuffer());
        if (receivedHeader.length !== header.length || !header.every((byte, index)=>byte === receivedHeader[index]) || lines !== metadata.count + 1 || previous !== 10) {
            throw new Error('Sources CSV response is incomplete or does not match the reviewed rows.');
        }
        return blob;
    } catch (error) {
        if (!readerFailed) await reader.cancel().catch(()=>console.error('Sources CSV response cancellation failed.'));
        throw error;
    } finally{
        signal.removeEventListener('abort', cancel);
        reader.releaseLock();
    }
}
;
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourceExport",
    ()=>LeadSourceExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-export.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.client.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveSourceCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-ssr] (ecmascript) <export saveReportCSV as saveSourceCSV>");
'use client';
;
;
;
;
;
;
function LeadSourceExport({ open, onClose, request, authority, onReload }) {
    const [dataset, setDataset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('source-groups');
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [resolved, setResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        state: {
            kind: 'loading'
        }
    });
    const [deniedResult, setDeniedResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        denied: false
    });
    const [metadata, setMetadata] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const operation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const requestKey = JSON.stringify([
        open,
        request,
        dataset,
        retry
    ]);
    const state = resolved.key === requestKey ? resolved.state : {
        kind: 'loading'
    };
    const denied = deniedResult.key === requestKey && deniedResult.denied;
    const currentMetadata = metadata && JSON.stringify(metadata.input) === JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportInput"])(request, dataset)) ? metadata : undefined;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        active.current = true;
        return ()=>{
            active.current = false;
            operation.current?.abort();
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open || !authority.canExport) return;
        const abort = new AbortController();
        operation.current = abort;
        review.current = undefined;
        void (async ()=>{
            try {
                const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadSourceCSVPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportInput"])(request, dataset), authority, AbortSignal.any([
                    abort.signal,
                    AbortSignal.timeout(30000)
                ]));
                if (abort.signal.aborted) return;
                const id = crypto.randomUUID();
                review.current = {
                    id,
                    preview
                };
                setDeniedResult({
                    key: requestKey,
                    denied: false
                });
                setMetadata(preview);
                setResolved({
                    key: requestKey,
                    state: preview.count > preview.limits.rows ? {
                        kind: 'limit'
                    } : {
                        kind: 'ready',
                        preview: {
                            id,
                            reportLabel: 'Sources',
                            viewLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportLabels"][dataset],
                            periodLabel: `${preview.input.query.period.from} - ${preview.input.query.period.to}`,
                            dateBasisLabel: 'Lead creation cohort; linked Jobs and accepted decisions are current at snapshot',
                            timezone: preview.timezone,
                            filtersLabel: dataset === 'accepted-estimates' ? 'Accepted Estimate families reachable from the selected cohort' : dataset === 'converted' ? 'Leads with surviving linked Jobs' : 'All authorized cohort Leads',
                            scopeLabel: `${preview.leadScope} / Leads archived ${preview.leadArchiveVisibility}; ` + `conversion ${preview.conversion.kind}; accepted value ${preview.acceptedValue.kind}`,
                            filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportFilename"])(preview.input, preview.today),
                            expectedRows: preview.count
                        }
                    }
                });
            } catch (failure) {
                if (abort.signal.aborted) return;
                setDeniedResult({
                    key: requestKey,
                    denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SourceCSVDeniedError"]
                });
                setResolved({
                    key: requestKey,
                    state: {
                        kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SourceCSVChangedError"] ? 'changed' : 'error'
                    }
                });
                setError(failure instanceof Error ? failure.message : 'Sources CSV preview could not be loaded.');
            }
        })();
        return ()=>abort.abort();
    }, [
        open,
        request,
        requestKey,
        authority,
        dataset,
        retry
    ]);
    const download = async (id)=>{
        const current = review.current;
        if (pending || denied || !current || current.id !== id) throw new Error('Refresh the Sources CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(current.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveSourceCSV"])(current.preview, signal);
            if (!active.current || signal.aborted || review.current !== current) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveSourceCSV$3e$__["saveSourceCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportFilename"])(current.preview.input, current.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SourceCSVChangedError"]) {
                    review.current = undefined;
                    setResolved({
                        key: requestKey,
                        state: {
                            kind: 'changed'
                        }
                    });
                }
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SourceCSVDeniedError"]) {
                    review.current = undefined;
                    setDeniedResult({
                        key: requestKey,
                        denied: true
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Sources CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: open,
        canExport: authority.canExport && !denied,
        state: state,
        pending: pending,
        allowEmpty: true,
        rowLimit: currentMetadata?.limits.rows,
        technicalLimits: currentMetadata?.limits,
        onClose: onClose,
        onRefresh: ()=>{
            review.current = undefined;
            setMetadata(undefined);
            setError(undefined);
            setRetry((value)=>value + 1);
        },
        onDownload: download,
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
                            const selected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceExportDatasets"].find((value)=>value === event.target.value);
                            if (selected) {
                                review.current = undefined;
                                setMetadata(undefined);
                                setError(undefined);
                                setDataset(selected);
                            }
                        },
                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sourceExportLabels"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: label
                            }, value, false, {
                                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                                lineNumber: 140,
                                columnNumber: 69
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                        lineNumber: 130,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                lineNumber: 129,
                columnNumber: 5
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                lineNumber: 143,
                columnNumber: 15
            }, this),
            (denied || state.kind === 'changed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Reload report access",
                disabled: pending,
                onClick: ()=>{
                    onClose();
                    onReload();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                lineNumber: 144,
                columnNumber: 46
            }, this),
            currentMetadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-2 text-sm text-muted",
                children: [
                    currentMetadata.input.dataset === 'source-groups' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0",
                        children: "Unknown conversion or accepted-value metrics are blank with coverage labels, never treated as zero."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                        lineNumber: 147,
                        columnNumber: 61
                    }, this),
                    currentMetadata.input.dataset === 'accepted-estimates' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0",
                        children: "Multi-path or ambiguous Estimate attribution is marked unattributed; linked Lead identity is omitted. Amounts use verified frozen pre-tax cents (USD)."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                        lineNumber: 150,
                        columnNumber: 66
                    }, this),
                    currentMetadata.input.dataset === 'converted' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0",
                        children: "Conversion reflects surviving linked Jobs at the snapshot, including Jobs created after the cohort period."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                        lineNumber: 154,
                        columnNumber: 57
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0",
                        children: [
                            "Snapshot: ",
                            currentMetadata.asOf,
                            ". ",
                            currentMetadata.coverage
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                        lineNumber: 157,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                lineNumber: 146,
                columnNumber: 25
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
                lineNumber: 159,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx",
        lineNumber: 121,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourcePage",
    ()=>LeadSourcePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-report.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-read.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-export.tsx [app-ssr] (ecmascript)");
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
;
function LeadSourcePage({ initial, onRecord, onReload }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LeadSourcePageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                onRecord: onRecord,
                onReload: onReload
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 19,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceScopeKey"])(initial)}:${initial.report.asOf}`, false, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
function LeadSourcePageHost({ initial, onRecord, onReload, template, onTemplateRun }) {
    const today = initial.report.today, timezone = initial.report.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceScopeKey"])(initial);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? {
        preset: 'custom',
        ...initial.query.period
    });
    const [evidenceId, setEvidenceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.selected === 'converted' ? 'source-converted' : initial.query.selected === 'accepted-estimates' ? 'source-accepted-value' : 'source-cohort');
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.page), [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.pageSize);
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'history').range;
        if (!range) throw new Error('Choose a valid historical Sources report period.');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadSourceReportRequest"])({
            workspaceId: initial.workspaceId,
            range,
            evidenceId,
            page,
            pageSize,
            filters: {
                stages: [],
                owners: [],
                sources: []
            }
        });
    }, [
        initial.workspaceId,
        period,
        today,
        evidenceId,
        page,
        pageSize
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptLeadSourceReadResponse"])(raw, {
            request,
            scopeKey,
            today,
            timezone
        });
    }, [
        request,
        scopeKey,
        today,
        timezone
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/sources?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Sources report could not be loaded. Try again.'
    });
    const pending = loaded.pending;
    let state = {
        kind: pending ? 'loading' : 'error'
    };
    let error = loaded.key === key ? loaded.error : undefined;
    if (!pending && loaded.raw) {
        try {
            state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptLeadSourceReadResponse"])(loaded.raw, {
                request,
                scopeKey,
                today,
                timezone
            }).state;
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Sources report data is invalid. Reload the report.';
        }
    }
    const denied = loaded.key === key && loaded.denied;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "grid min-w-0 gap-6 p-4 sm:p-8",
        children: [
            !denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                area: "sources",
                workspaceId: initial.workspaceId,
                query: request,
                period: period,
                ready: !pending && !error && state.kind === 'ready',
                active: template,
                onRun: onTemplateRun
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 53,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                        lineNumber: 56,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                        lineNumber: 57,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 55,
                columnNumber: 15
            }, this),
            !denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportDateControls"], {
                value: period,
                context: "history",
                today: today,
                timezone: timezone,
                pending: pending,
                onApply: (value)=>{
                    setPeriod(value);
                    setEvidenceId('source-cohort');
                    setPage(1);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 59,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LeadSourceReport"], {
                state: state,
                canRead: !denied,
                canReadConversion: initial.canReadConversion,
                canReadAcceptedValue: initial.canReadAcceptedValue,
                canExport: initial.canExport,
                canEdit: false,
                pending: pending,
                onEvidence: (id)=>{
                    if (state.kind !== 'ready' || pending) return;
                    if (id === 'source-cohort' || id === 'source-converted' && state.result.conversion.kind === 'available' || id === 'source-accepted-value' && state.result.acceptedValue.kind === 'available') {
                        setEvidenceId(id);
                        setPage(1);
                    } else throw new Error('This Sources evidence selection is unavailable.');
                },
                onRecord: (id)=>{
                    if (state.kind !== 'ready' || pending) return;
                    const evidence = state.result.evidence;
                    const visible = evidence.kind === 'accepted-estimates' ? evidence.rows.some((row)=>row.linkedLead?.recordId === id) : evidence.rows.some((row)=>row.recordId === id);
                    if (visible) onRecord(id);
                },
                onPageChange: setPage,
                onPageSizeChange: (size)=>{
                    setPageSize(size);
                    setPage(1);
                },
                onRetry: ()=>setRetry((value)=>value + 1),
                onExport: ()=>setExportOpen(true),
                onEdit: ()=>{
                    throw new Error('Sources report configuration is not available.');
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 61,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LeadSourceExport"], {
                open: exportOpen,
                onClose: ()=>setExportOpen(false),
                request: request,
                authority: initial,
                onReload: onReload
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
                lineNumber: 80,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeadSourceRoute",
    ()=>LeadSourceRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/lead-source-report/lead-source-page.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function LeadSourceRoute({ initial }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$lead$2d$source$2d$report$2f$lead$2d$source$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LeadSourcePage"], {
        initial: initial,
        onReload: ()=>router.refresh(),
        onRecord: (id)=>router.push(`/leads/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/lead-source-report/lead-source-route.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_reports_lead-source-report_0tb_mi4._.js.map
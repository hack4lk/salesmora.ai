module.exports = [
"[project]/packages/domain/src/estimates/state.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canTransitionEstimate",
    ()=>canTransitionEstimate,
    "estimateStatusAtDate",
    ()=>estimateStatusAtDate
]);
const transitions = {
    draft: [
        "sent",
        "published"
    ],
    sent: [
        "accepted",
        "declined",
        "expired",
        "superseded",
        "void"
    ],
    published: [
        "accepted",
        "declined",
        "expired",
        "superseded",
        "void"
    ],
    accepted: [
        "declined"
    ],
    declined: [
        "accepted",
        "superseded"
    ],
    expired: [
        "superseded"
    ],
    superseded: [],
    void: []
};
function canTransitionEstimate(from, to) {
    return transitions[from].includes(to);
}
function estimateStatusAtDate(status, validUntil, today) {
    if ((status === "sent" || status === "published") && validUntil !== null && validUntil < today) {
        return "expired";
    }
    return status;
}
}),
"[project]/packages/domain/src/calendar/schedule.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarRevisionError",
    ()=>CalendarRevisionError,
    "assertCalendarRevision",
    ()=>assertCalendarRevision
]);
class CalendarRevisionError extends Error {
    constructor(){
        super("The visit changed. Reload and review its current records before confirming.");
    }
}
function assertCalendarRevision(currentVersion, expectedVersion, current, expected) {
    const keys = (records)=>records.map((record)=>`${record.type}:${record.id}:${record.expectedVersion}`).sort();
    const identities = (records)=>new Set(records.map((record)=>`${record.type}:${record.id}`)).size;
    const actual = keys(current), reviewed = keys(expected);
    if (currentVersion !== expectedVersion || !actual.length || identities(current) !== actual.length || identities(expected) !== reviewed.length || actual.length !== reviewed.length || actual.some((key, i)=>key !== reviewed[i])) {
        throw new CalendarRevisionError();
    }
}
}),
"[project]/packages/domain/src/work-orders/lifecycle.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkOrderLifecycleError",
    ()=>WorkOrderLifecycleError,
    "assertEditable",
    ()=>assertEditable,
    "editsChangeIssuedContent",
    ()=>editsChangeIssuedContent,
    "isClosedWorkOrder",
    ()=>isClosedWorkOrder,
    "isOverdue",
    ()=>isOverdue,
    "reopenTarget",
    ()=>reopenTarget,
    "validateArchive",
    ()=>validateArchive,
    "validateCompletion",
    ()=>validateCompletion,
    "validateDelete",
    ()=>validateDelete,
    "validateReopen",
    ()=>validateReopen,
    "validateStatusChange",
    ()=>validateStatusChange,
    "workOrderTransitions",
    ()=>workOrderTransitions
]);
class WorkOrderLifecycleError extends Error {
}
const workOrderTransitions = {
    draft: [
        "issued",
        "canceled"
    ],
    issued: [
        "in-progress",
        "canceled"
    ],
    "in-progress": [
        "completed",
        "canceled"
    ],
    completed: [],
    canceled: []
};
const isClosedWorkOrder = (status)=>status === "completed" || status === "canceled";
const reopenTarget = (status)=>{
    if (status === "completed") return "in-progress";
    if (status === "canceled") return "draft";
    throw new WorkOrderLifecycleError("Only completed or canceled work orders can be reopened.");
};
function assertEditable({ status, archived }) {
    if (archived) throw new WorkOrderLifecycleError("Unarchive this work order before changing it.");
    if (isClosedWorkOrder(status)) throw new WorkOrderLifecycleError("Reopen this work order before changing it.");
}
const editsChangeIssuedContent = (status)=>status === "issued" || status === "in-progress";
function validateStatusChange(current, input) {
    if (current.archived) throw new WorkOrderLifecycleError("Unarchive this work order before changing its status.");
    if (!workOrderTransitions[current.status].includes(input.to)) throw new WorkOrderLifecycleError(`A ${current.status} work order cannot move to ${input.to}.`);
    if (input.to === "canceled" && !input.reason) throw new WorkOrderLifecycleError("Canceling requires a reason.");
    if (input.to !== "canceled" && input.reason) throw new WorkOrderLifecycleError("Reasons apply only to cancellation.");
    if (input.to === "issued" && !current.assigneeId && !input.confirmed) throw new WorkOrderLifecycleError("Confirm issuing a work order with no assignee.");
}
function validateCompletion(ctx, input) {
    if (ctx.archived) throw new WorkOrderLifecycleError("Unarchive this work order before completing it.");
    if (ctx.status !== "in-progress") throw new WorkOrderLifecycleError("Only a work order in progress can be completed.");
    const open = ctx.tasks.filter((task)=>task.required && !task.done).length;
    if (open > 0) {
        if (!input.overrideReason) throw new WorkOrderLifecycleError(`${open} required task${open === 1 ? " is" : "s are"} not done.`);
        if (!ctx.canOverride) throw new WorkOrderLifecycleError("Only office roles can complete with required tasks open.");
    } else if (input.overrideReason) throw new WorkOrderLifecycleError("An override reason applies only when required tasks are open.");
    if (ctx.signoffRequired && !input.signatureImage) throw new WorkOrderLifecycleError("This workspace requires a customer signature.");
}
function validateReopen(current) {
    if (current.archived) throw new WorkOrderLifecycleError("Unarchive this work order before reopening it.");
    return reopenTarget(current.status);
}
function validateArchive(current, archived) {
    if (archived && !isClosedWorkOrder(current.status)) throw new WorkOrderLifecycleError("Only completed or canceled work orders can be archived.");
    if (archived === current.archived) throw new WorkOrderLifecycleError(archived ? "Already archived." : "Not archived.");
}
function validateDelete(current) {
    if (current.status !== "draft" || current.archived) throw new WorkOrderLifecycleError("Only draft work orders can be deleted. Cancel or archive it instead.");
}
const isOverdue = (status, scheduledDate, today)=>!!scheduledDate && !isClosedWorkOrder(status) && scheduledDate < today;
}),
"[project]/packages/domain/src/accounts/suspension.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isUserBlocked",
    ()=>isUserBlocked,
    "normalizeSuspensionReason",
    ()=>normalizeSuspensionReason,
    "suspensionReasonMaxLength",
    ()=>suspensionReasonMaxLength,
    "suspensionReasonMinLength",
    ()=>suspensionReasonMinLength,
    "workspaceAccess",
    ()=>workspaceAccess
]);
const suspensionReasonMinLength = 10;
const suspensionReasonMaxLength = 500;
function isUserBlocked(user) {
    return Boolean(user.deletionRequestedAt || user.suspendedAt);
}
function workspaceAccess(workspace) {
    if (workspace.deletionRequestedAt) return 'deleting';
    if (workspace.suspendedAt) return 'suspended';
    return 'active';
}
function normalizeSuspensionReason(reason) {
    const value = typeof reason === 'string' ? reason.trim() : '';
    if (value.length < suspensionReasonMinLength) {
        throw new RangeError(`The suspension reason must be at least ${suspensionReasonMinLength} characters.`);
    }
    if (value.length > suspensionReasonMaxLength) throw new RangeError(`The suspension reason must be ${suspensionReasonMaxLength} characters or fewer.`);
    return value;
}
}),
"[project]/packages/domain/src/accounts/staff-reason.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeStaffReason",
    ()=>normalizeStaffReason,
    "staffReasonMaxLength",
    ()=>staffReasonMaxLength
]);
const staffReasonMaxLength = 500;
function normalizeStaffReason(reason) {
    const value = typeof reason === 'string' ? reason.trim() : '';
    if (!value) throw new RangeError('A reason is required.');
    if (value.length > staffReasonMaxLength) throw new RangeError(`The reason must be ${staffReasonMaxLength} characters or fewer.`);
    return value;
}
}),
"[project]/packages/domain/src/jobs/reminders.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Workspace-local date/minute comparison: DST gaps run at the first valid later minute;
 * repeated minutes share the same occurrence key in storage. Never add 24h to local instants. */ __turbopack_context__.s([
    "reminderClock",
    ()=>reminderClock,
    "reminderDeadlineForDate",
    ()=>reminderDeadlineForDate
]);
function reminderClock(now, timezone) {
    if (!Number.isFinite(now.getTime())) throw new Error('Invalid reminder clock.');
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(now);
    const part = (type)=>parts.find((p)=>p.type === type).value;
    return {
        date: `${part('year')}-${part('month')}-${part('day')}`,
        time: `${part('hour')}:${part('minute')}`
    };
}
function reminderDeadlineForDate(date, relative, days) {
    const value = new Date(`${date}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + (relative === 'before' ? days : relative === 'after' ? -days : 0));
    return value.toISOString().slice(0, 10);
}
}),
"[project]/packages/domain/src/jobs/lifecycle.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobLifecycleError",
    ()=>JobLifecycleError,
    "isClosedJob",
    ()=>isClosedJob,
    "scheduledJobStatus",
    ()=>scheduledJobStatus,
    "validateJobTransition",
    ()=>validateJobTransition
]);
class JobLifecycleError extends Error {
}
const isClosedJob = (status)=>status === "completed" || status === "canceled";
function scheduledJobStatus(status, scheduledDate) {
    if (isClosedJob(status)) throw new JobLifecycleError("Reopen this job before changing its schedule.");
    if (scheduledDate && status === "needs-scheduling") return "scheduled";
    if (!scheduledDate && status === "scheduled") return "needs-scheduling";
    return status;
}
function validateJobTransition(current, input) {
    if (current.status === input.to) throw new JobLifecycleError("Choose a different job status.");
    if (isClosedJob(current.status)) {
        if (isClosedJob(input.to)) throw new JobLifecycleError("Reopen into an active status.");
        if (!input.confirmed || input.reopenDeadline === undefined) throw new JobLifecycleError("Confirm reopening and review the completion deadline.");
    } else if (input.reopenDeadline !== undefined) throw new JobLifecycleError("Deadline review is only accepted when reopening.");
    if (input.to === "scheduled" && !current.scheduledDate) throw new JobLifecycleError("Set a scheduled work date first.");
    if (input.to === "needs-scheduling" && current.scheduledDate) throw new JobLifecycleError("Clear the scheduled work date first.");
    if (input.to === "waiting" && !input.waitingReason) throw new JobLifecycleError("Choose a waiting reason.");
    if (input.to !== "waiting" && input.waitingReason !== undefined) throw new JobLifecycleError("Waiting reasons apply only to Waiting.");
    if (input.to === "canceled" && (!input.confirmed || !input.cancellationReason)) throw new JobLifecycleError("Choose a cancellation reason and confirm cancellation.");
    if (input.to !== "canceled" && input.cancellationReason !== undefined) throw new JobLifecycleError("Cancellation reasons apply only to Canceled.");
    if (input.to === "completed" && !input.confirmed) throw new JobLifecycleError("Confirm completion.");
}
}),
"[project]/packages/domain/src/estimates/lead-stage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEstimateLeadStageTarget",
    ()=>getEstimateLeadStageTarget
]);
function getEstimateLeadStageTarget({ event, parentType, status, archived = false, canRead = false, lead }) {
    if (!canRead || parentType !== "lead" || archived || !lead?.canMove || lead.archived || lead.stage === "won" || lead.stage === "lost") return null;
    if (event?.kind === "send" && status === "sent" && (lead.stage === "new" || lead.stage === "contacted")) return "estimate-sent";
    if (event?.kind === "decision" && event.outcome === "declined" && event.previousOutcome !== "declined" && status === "declined") return "lost";
    return null;
}
}),
"[project]/packages/domain/src/estimates/rollout.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Explicit staging rollout; request headers never choose the deployment or origin. */ __turbopack_context__.s([
    "estimateSharingAvailable",
    ()=>estimateSharingAvailable
]);
function estimateSharingAvailable(origin, rollout = {}) {
    if (!origin) return false;
    try {
        const url = new URL(origin);
        if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return false;
        const local = [
            'localhost',
            '127.0.0.1',
            '[::1]'
        ].includes(url.hostname);
        if (local) return [
            'http:',
            'https:'
        ].includes(url.protocol);
        return url.protocol === 'https:' && rollout.environment === 'staging' && rollout.enabled === true;
    } catch  {
        return false;
    }
}
}),
"[project]/packages/contracts/src/ai-usage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Internal server adapter contract. Never include prompts or provider payloads. */ __turbopack_context__.s([
    "AIBudgetExceededError",
    ()=>AIBudgetExceededError,
    "aiBudgetError",
    ()=>aiBudgetError,
    "validAITokenUsage",
    ()=>validAITokenUsage
]);
class AIBudgetExceededError extends Error {
    constructor(){
        super('Workspace AI allowance unavailable');
        this.name = 'AIBudgetExceededError';
    }
}
function aiBudgetError(error) {
    let current = error;
    for(let depth = 0; depth < 8 && current instanceof Error; depth++){
        if (current instanceof AIBudgetExceededError) return current;
        current = current.cause;
    }
}
function validAITokenUsage(value) {
    return Object.values(value).every((n)=>Number.isSafeInteger(n) && n >= 0) && value.inputTokens + value.outputTokens === value.totalTokens && value.cachedInputTokens <= value.inputTokens && value.reasoningTokens <= value.outputTokens;
}
}),
"[project]/packages/contracts/src/lead-capture/setup-defaults.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialCaptureSetupConfiguration",
    ()=>initialCaptureSetupConfiguration
]);
function initialCaptureSetupConfiguration(type, business) {
    const workflow = {
        assignment: {
            kind: 'default'
        },
        stage: 'new',
        tags: [],
        notifyAssigned: true
    };
    if (type === 'gmail') return {
        schemaVersion: 1,
        type,
        rules: {
            phrases: [],
            location: 'both',
            mode: 'all'
        },
        workflow
    };
    const labels = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        service: 'Service requested',
        details: 'Project details',
        address: 'Service address'
    };
    return {
        schemaVersion: 1,
        type,
        brief: '',
        contactRequired: true,
        fields: Object.keys(labels).map((key)=>({
                id: key,
                key,
                label: labels[key],
                type: key === 'email' ? 'email' : key === 'phone' ? 'phone' : key === 'details' ? 'long_text' : key === 'address' ? 'address' : 'short_text',
                required: key === 'name' || key === 'service',
                options: []
            })),
        content: {
            businessName: business.businessName,
            businessEmail: business.businessEmail,
            businessPhone: business.businessPhone,
            title: 'Tell us about your project',
            intro: 'Share a few details and our team will be in touch.',
            submitLabel: 'Send request',
            thankYou: 'Thanks for your request. Our team will be in touch.',
            unavailableMessage: 'We are not accepting online requests right now. Please contact our team directly.',
            showBusinessEmail: false,
            showBusinessPhone: !!business.businessPhone,
            privacy: null,
            consent: null
        },
        workflow
    };
}
}),
"[project]/packages/contracts/src/lead-capture/timing.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Shared wall-clock resolver: reject invalid zones, calendar dates, DST gaps and folds. */ __turbopack_context__.s([
    "resolveCaptureLocalTime",
    ()=>resolveCaptureLocalTime
]);
function resolveCaptureLocalTime(local, timezone) {
    let formatter;
    try {
        formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        });
    } catch  {
        return {
            error: 'zone'
        };
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return {
        error: 'date'
    };
    const [year, month, day, hour, minute] = local.split(/[-T:]/).map(Number), wall = Date.UTC(year, month - 1, day, hour, minute);
    if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== local) return {
        error: 'date'
    };
    const parts = (at)=>{
        const values = Object.fromEntries(formatter.formatToParts(at).map((part)=>[
                part.type,
                part.value
            ]));
        return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
    };
    const offsets = new Set();
    for(let hours = -36; hours <= 36; hours += 6){
        const at = wall + hours * 3600000;
        offsets.add(parts(at) - at);
    }
    const candidates = [
        ...offsets
    ].map((offset)=>wall - offset).filter((at)=>parts(at) === wall);
    return candidates.length === 1 ? {
        at: new Date(candidates[0]).toISOString()
    } : {
        error: candidates.length ? 'ambiguous' : 'gap'
    };
}
}),
];

//# sourceMappingURL=packages_0cuzf-9._.js.map
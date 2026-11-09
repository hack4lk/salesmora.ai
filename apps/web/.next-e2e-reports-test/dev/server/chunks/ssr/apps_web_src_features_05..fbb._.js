module.exports = [
"[project]/apps/web/src/features/notifications/notification-menu/notification-menu.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notificationMenuData",
    ()=>notificationMenuData
]);
const jobStatusLabels = {
    'needs-scheduling': 'Needs Scheduling',
    scheduled: 'Scheduled',
    'in-progress': 'In Progress',
    waiting: 'Waiting',
    completed: 'Completed',
    canceled: 'Canceled'
};
const jobStatusTitles = {
    changed: 'A Job’s status changed',
    completed: 'A Job was completed',
    canceled: 'A Job was canceled',
    reopened: 'A Job was reopened'
};
const estimateStatuses = {
    draft: 'Draft',
    sent: 'Sent',
    published: 'Published',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    superseded: 'Superseded',
    void: 'Void'
};
const notificationMenuData = {
    title: 'Notifications',
    captureTitle: 'Lead Capture needs attention',
    captureOpen: 'Review capture source',
    captureReasons: {
        publication: 'A scheduled publication needs attention. Review its readiness and explicitly approve another launch.',
        entitlement: 'Gmail access has ended. Review the workspace plan before relaunching.',
        source_capacity: 'The workspace has too many published sources for its plan. Archive excess sources, then explicitly relaunch the sources you retain.',
        workspace: 'Capture has stopped while this workspace is unavailable.',
        connection: 'Capture delivery is unavailable. Resolve the connection before relaunching.'
    },
    jobDeadlineTitles: {
        added: 'A Job completion deadline was set',
        changed: 'A Job’s completion deadline changed',
        removed: 'A Job completion deadline was removed'
    },
    jobDeadlineTitle: (before, after)=>after === null ? 'A Job completion deadline was removed' : before === null ? 'A Job completion deadline was set' : 'A Job’s completion deadline changed',
    jobPreviousDeadline: 'Previous completion deadline',
    jobNewDeadline: 'New completion deadline',
    jobDeadlineDate: (date)=>date === null ? 'Not set' : new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(`${date}T12:00:00Z`)),
    jobDeadlineStories: {
        before: '2026-10-30',
        after: '2026-11-06',
        timezone: 'America/New_York'
    },
    jobAssignmentStories: {
        number: 'J-1042',
        title: 'Kitchen plumbing repair',
        actor: 'Alex Rivera'
    },
    jobAssignmentTitles: {
        primary: 'A Job was assigned to you',
        team: 'You were added to a Job team',
        updated: 'A Job’s assignments changed',
        removed: 'Your Job assignment ended'
    },
    jobAssignmentEnded: (number, workspace)=>`Your assignment to ${number} in ${workspace} ended.`,
    openHome: 'Open SalesMora',
    jobTitles: {
        created: 'A Job was created'
    },
    jobStatusLabels,
    jobStatusTitles,
    jobStatusStories: {
        description: 'Alex Rivera updated J-1042 · Kitchen plumbing repair.'
    },
    jobBeforeStatus: 'Previous status',
    jobAfterStatus: 'New status',
    jobStatusTitle: (before, after)=>before === 'completed' || before === 'canceled' ? jobStatusTitles.reopened : after === 'completed' ? jobStatusTitles.completed : after === 'canceled' ? jobStatusTitles.canceled : jobStatusTitles.changed,
    jobStatusDescription: (actor, number, title)=>`${actor || 'A teammate'} updated ${number} · ${title}.`,
    jobDescription: (actor, number, title)=>`${actor || 'A teammate'} created ${number} · ${title}.`,
    jobStories: {
        description: 'Alex Rivera created J-1042 · Kitchen plumbing repair.',
        href: '/jobs/preview-created-job?workspace=preview-workspace'
    },
    deadlineTitles: {
        approaching: 'A Job deadline is approaching',
        due: 'A Job is due today',
        overdue: 'A Job deadline is overdue'
    },
    deadlineDescription: (number, title)=>`${number} · ${title}`,
    deadlineDate: 'Completion deadline',
    deadlineReminderDate: 'Reminder date',
    deadlineStories: {
        title: 'A Job is due today',
        description: 'J-1042 · Kitchen plumbing repair',
        deadline: 'Oct 30, 2026',
        reminderDate: 'Oct 30, 2026',
        href: '/jobs/preview-job?workspace=preview-workspace'
    },
    visitRecords: 'Records in this update',
    visitNoDate: 'Not scheduled',
    visitJoinedDescription: (actor)=>`${actor || 'A teammate'} added this Work Order to the Job’s visit. Existing records kept their schedules.`,
    visitSeparatedDescription: (actor)=>`${actor || 'A teammate'} moved this Work Order to a separate visit. Other records kept their schedules.`,
    visitDescription: (actor)=>`${actor || 'A teammate'} updated this visit.`,
    visitBefore: 'Previous schedule',
    visitAfter: 'New schedule',
    visitTimezone: 'Workspace timezone',
    viewVisit: 'View visit',
    visitTitles: {
        scheduled: 'A visit was scheduled',
        rescheduled: 'A visit was rescheduled',
        cleared: 'A visit’s schedule was cleared',
        joined: 'A Work Order joined a visit',
        separated: 'A Work Order moved to a separate visit'
    },
    visitStories: {
        actor: 'Alex Rivera',
        rescheduled: 'Alex Rivera changed the schedule for this visit.',
        cleared: 'Alex Rivera cleared the schedule for this visit. The records below are now unscheduled.',
        joined: 'Alex Rivera added this Work Order to the Job’s visit. Existing records kept their schedules.',
        separated: 'Alex Rivera moved this Work Order to a separate visit. Other records kept their schedules.',
        before: 'Oct 22, 2026 · 9–11 AM',
        after: 'Oct 23, 2026 · 1–3 PM',
        noDate: 'Not scheduled',
        timezone: 'America/New_York',
        job: 'J-1042 · Kitchen plumbing repair',
        order: 'WO-1007 · Replace kitchen shutoff valves',
        longOrder: 'WO-1007 · Inspect and replace the kitchen supply lines, shutoff valves and dishwasher connection in the rear extension of the community workshop',
        visitHref: '/calendar?workspace=preview-workspace&date=2026-10-23&visit=preview-visit',
        orderHref: '/work-orders/preview-wo?workspace=preview-workspace'
    },
    assignmentTitle: 'A lead has been assigned to you',
    assignmentDescription: (assigner, number, name, service)=>`${assigner} assigned you ${number} · ${name} · ${service}.`,
    workOrderTitles: {
        issued: 'A work order was issued to you',
        assigned: 'You were added to a work order',
        rescheduled: 'A work order was rescheduled',
        changed: 'A work order changed after it was issued',
        completed: 'A work order was completed',
        canceled: 'A work order was canceled'
    },
    workOrderDescription: (actor, number, title)=>`${actor || 'A teammate'} updated ${number} · ${title}.`,
    estimateTitles: {
        sent: 'An Estimate was sent',
        delivery_failed: 'Estimate email delivery failed',
        viewed: 'A customer viewed an Estimate',
        decision_recorded: 'An Estimate decision was recorded',
        expiring_soon: 'An Estimate expires soon',
        expired: 'An Estimate expired'
    },
    estimateStatuses,
    estimateDescription: (number, name, status)=>`${number} · ${name} · ${estimateStatuses[status]}`,
    viewEstimate: 'View Estimate',
    viewJob: 'View Job',
    viewWorkOrder: 'View work order',
    materialTitles: {
        proposed: 'New catalog item to review',
        approved: 'Your catalog item was approved',
        edited: 'Your catalog item was approved with changes',
        rejected: 'Your catalog item was rejected'
    },
    materialDescription: (event, actor, name, reason)=>event === 'proposed' ? `${actor || 'A teammate'} proposed ${name}.` : `${actor || 'An approver'} ${event === 'edited' ? 'approved, with edits,' : event} ${name}.${event === 'rejected' && reason ? ` Reason: ${reason}` : ''}`,
    viewMaterials: 'View materials',
    open: (count)=>count === null ? 'Open notifications' : `Open notifications, ${count} unread`,
    close: 'Close',
    unread: 'Unread',
    cappedCount: '99+',
    timestamp: (date)=>`${date} UTC`,
    read: 'Read',
    markRead: 'Mark as read',
    marking: 'Marking as read…',
    view: 'View lead',
    loading: 'Loading notifications…',
    emptyTitle: 'You’re all caught up',
    empty: 'When a lead or work order is assigned to you, a work order you manage changes, a catalog item you proposed is decided, or an Estimate changes, you’ll see it here.',
    loadErrorTitle: 'Notifications unavailable',
    loadError: 'We couldn’t load your notifications. Try again.',
    retry: 'Try again',
    actionErrorTitle: 'Notification wasn’t updated',
    actionError: 'Try marking it as read again.',
    older: 'Show older notifications',
    loadingOlder: 'Loading older notifications…',
    preferences: 'Notification preferences',
    unknownDate: 'Time unavailable',
    stories: {
        heading: 'Workspace notifications preview',
        workspace: 'Northstar Plumbing',
        longWorkspace: 'Northstar Plumbing and Home Maintenance Services — Northern Region',
        notice: 'Interactive preview. Notifications are fictional; read status changes are simulated.',
        preferencesHref: '/settings/notifications?workspace=preview-workspace',
        materialHref: '/materials?workspace=preview-workspace',
        estimateHref: '/estimates/preview-estimate?workspace=preview-workspace',
        leadHref: '/leads/preview-lead?workspace=preview-workspace',
        title: 'A lead has been assigned to you',
        description: 'Alex Rivera assigned you LD-1042 · Jordan Lee · Kitchen sink repair.',
        longDescription: 'Alexandra Rivera-Montgomery assigned you LD-1043 · Jordan Lee-Hernandez · Complete kitchen plumbing replacement and preventative maintenance consultation.',
        date: '2026-10-15T14:30:00Z',
        olderDate: '2026-10-14T09:00:00Z'
    }
};
}),
"[project]/apps/web/src/features/notifications/notification-menu/capture-notification-item.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureNotificationItem",
    ()=>captureNotificationItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/notification-menu.data.ts [app-ssr] (ecmascript)");
;
function captureNotificationItem(item, workspaceId) {
    return {
        id: item.id,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].captureTitle,
        description: `${item.sourceName} · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].captureReasons[item.reason]}`,
        createdAt: item.createdAt,
        read: item.read,
        actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].captureOpen,
        href: `/lead-capture/${encodeURIComponent(item.sourceId)}?workspace=${encodeURIComponent(workspaceId)}`
    };
}
}),
"[project]/apps/web/src/features/notifications/notification-menu/job-notification-item.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jobNotificationItem",
    ()=>jobNotificationItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/notification-menu.data.ts [app-ssr] (ecmascript)");
;
function jobNotificationItem(item, workspaceId, workspaceName) {
    const common = {
        id: item.id,
        createdAt: item.createdAt,
        read: item.read
    };
    if (item.event === 'assignment' && item.access === 'ended') return {
        ...common,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobAssignmentTitles.removed,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobAssignmentEnded(item.jobNumber, workspaceName),
        actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].openHome,
        href: `/home?workspace=${encodeURIComponent(workspaceId)}`
    };
    return {
        ...common,
        title: item.event === 'deadline' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobDeadlineTitle(item.before, item.after) : item.event === 'assignment' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobAssignmentTitles[item.change] : item.event === 'status' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobStatusTitle(item.before, item.after) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobTitles.created,
        description: item.event === 'created' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobDescription(item.actorName, item.jobNumber, item.jobTitle) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobStatusDescription(item.actorName, item.jobNumber, item.jobTitle),
        ...item.event === 'deadline' ? {
            details: [
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobPreviousDeadline,
                    value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobDeadlineDate(item.before)
                },
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobNewDeadline,
                    value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobDeadlineDate(item.after)
                },
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitTimezone,
                    value: item.timezone
                }
            ]
        } : {},
        ...item.event === 'status' ? {
            details: [
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobBeforeStatus,
                    value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobStatusLabels[item.before]
                },
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobAfterStatus,
                    value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].jobStatusLabels[item.after]
                }
            ]
        } : {},
        actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewJob,
        href: `/jobs/${encodeURIComponent(item.jobId)}?workspace=${encodeURIComponent(workspaceId)}`
    };
}
}),
"[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationMenu",
    ()=>NotificationMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$Popover$2f$Popover$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/Popover/Popover.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$icons$2d$material$40$9$2e$5$2e$0_$40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$_ae35d5df091e96511a285980eac9cf17$2f$node_modules$2f40$mui$2f$icons$2d$material$2f$NotificationsNoneOutlined$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__NotificationsNoneOutlined$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+icons-material@9.5.0_@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3._ae35d5df091e96511a285980eac9cf17/node_modules/@mui/icons-material/NotificationsNoneOutlined.mjs [app-ssr] (ecmascript) <export default as NotificationsNoneOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/notification-menu.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const buttonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
});
function NotificationMenu({ workspaceName, unreadCount, items, state, preferencesHref, pendingId, actionError = false, hasMore = false, loadingMore = false, onOpen, onRetry, onMarkRead, onLoadMore }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const [anchor, setAnchor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const count = unreadCount !== null && Number.isSafeInteger(unreadCount) && unreadCount >= 0 ? unreadCount : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].open(count),
                "aria-haspopup": "dialog",
                "aria-expanded": !!anchor,
                "aria-controls": anchor ? `${id}-panel` : undefined,
                className: "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-primary hover:bg-canvas focus-visible:focus-ring",
                onClick: (event)=>{
                    setAnchor(event.currentTarget);
                    onOpen();
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$icons$2d$material$40$9$2e$5$2e$0_$40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$_ae35d5df091e96511a285980eac9cf17$2f$node_modules$2f40$mui$2f$icons$2d$material$2f$NotificationsNoneOutlined$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__NotificationsNoneOutlined$3e$__["NotificationsNoneOutlined"], {
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                        lineNumber: 49,
                        columnNumber: 7
                    }, this),
                    count !== null && count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": "true",
                        className: "rounded-full bg-primary px-2 py-1 text-xs font-bold text-paper",
                        children: count > 99 ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].cappedCount : count
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                        lineNumber: 50,
                        columnNumber: 39
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                lineNumber: 46,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$Popover$2f$Popover$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                anchorEl: anchor,
                open: !!anchor,
                onClose: ()=>setAnchor(null),
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                },
                slotProps: {
                    paper: {
                        id: `${id}-panel`,
                        role: 'dialog',
                        'aria-modal': true,
                        'aria-labelledby': `${id}-title`,
                        'aria-describedby': `${id}-workspace`,
                        className: 'w-full rounded-2xl border border-line bg-paper text-ink sm:w-112'
                    }
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "flex items-start justify-between gap-4 border-b border-line p-4 sm:p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        id: `${id}-title`,
                                        className: "m-0 text-xl font-semibold text-ink",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                        lineNumber: 55,
                                        columnNumber: 34
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        id: `${id}-workspace`,
                                        className: "mb-0 mt-2 text-sm text-muted wrap-anywhere",
                                        children: workspaceName
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                        lineNumber: 55,
                                        columnNumber: 121
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                lineNumber: 55,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                autoFocus: true,
                                onClick: ()=>setAnchor(null),
                                className: buttonClass,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].close
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                lineNumber: 56,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                        lineNumber: 54,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-96 overflow-y-auto overscroll-contain p-4 sm:p-6",
                        "aria-busy": state === 'loading',
                        children: state === 'loading' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            role: "status",
                            className: "m-0 text-sm leading-6 text-muted",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].loading
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                            lineNumber: 59,
                            columnNumber: 32
                        }, this) : state === 'error' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                                    kind: "error",
                                    title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].loadErrorTitle,
                                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].loadError
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 59,
                                    columnNumber: 163
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: buttonClass,
                                    onClick: onRetry,
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].retry
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 59,
                                    columnNumber: 244
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                            lineNumber: 59,
                            columnNumber: 135
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid min-w-0 gap-4",
                            children: [
                                actionError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                                    kind: "error",
                                    title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].actionErrorTitle,
                                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].actionError
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 60,
                                    columnNumber: 27
                                }, this),
                                !items.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "m-0 text-base font-semibold text-ink",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].emptyTitle
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                            lineNumber: 61,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mb-0 mt-2 text-sm leading-6 text-muted",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].empty
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                            lineNumber: 61,
                                            columnNumber: 108
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 61,
                                    columnNumber: 28
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "m-0 grid min-w-0 list-none gap-3 p-0",
                                    children: items.map((item)=>{
                                        const date = new Date(item.createdAt);
                                        const validDate = Number.isFinite(date.getTime());
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: `min-w-0 rounded-xl border p-4 ${item.read ? 'border-line bg-paper' : 'border-primary/30 bg-canvas'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-3 flex flex-wrap items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                                            label: item.read ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].read : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].unread,
                                                            tone: item.read ? 'neutral' : 'info'
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 65,
                                                            columnNumber: 71
                                                        }, this),
                                                        validDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                                            dateTime: date.toISOString(),
                                                            className: "text-xs leading-5 text-muted",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].timestamp(dateFormatter.format(date))
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 65,
                                                            columnNumber: 180
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-muted",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].unknownDate
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 65,
                                                            columnNumber: 311
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 65,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "m-0 text-base font-semibold text-ink wrap-anywhere",
                                                    children: item.title
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-0 mt-2 text-sm leading-6 text-muted wrap-anywhere",
                                                    children: item.description
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 15
                                                }, this),
                                                item.details && item.details.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                                    className: "mb-0 mt-3 grid min-w-0 gap-3 rounded-lg border border-line bg-paper p-3 text-sm",
                                                    children: item.details.map((detail)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                    className: "font-semibold text-muted",
                                                                    children: detail.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                                    lineNumber: 68,
                                                                    columnNumber: 227
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                    className: "m-0 mt-1 wrap-anywhere",
                                                                    children: detail.value
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                                    lineNumber: 68,
                                                                    columnNumber: 287
                                                                }, this)
                                                            ]
                                                        }, detail.label, true, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 68,
                                                            columnNumber: 183
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 68,
                                                    columnNumber: 59
                                                }, this),
                                                item.recordLabels && item.recordLabels.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                                    "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitRecords,
                                                    className: "mt-3 grid min-w-0 gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "m-0 text-sm font-semibold",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitRecords
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 69,
                                                            columnNumber: 145
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "m-0 grid min-w-0 list-none gap-1 p-0 text-sm",
                                                            children: item.recordLabels.map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    className: "wrap-anywhere",
                                                                    children: label
                                                                }, label, false, {
                                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                                    lineNumber: 69,
                                                                    columnNumber: 304
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 69,
                                                            columnNumber: 211
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 69,
                                                    columnNumber: 69
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-3 flex flex-wrap gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: item.href,
                                                            onClick: ()=>setAnchor(null),
                                                            className: buttonClass,
                                                            children: item.actionLabel ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].view
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 71,
                                                            columnNumber: 17
                                                        }, this),
                                                        !item.read && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            disabled: !!pendingId,
                                                            "aria-busy": pendingId === item.id,
                                                            onClick: ()=>{
                                                                if (!pendingId) onMarkRead(item.id);
                                                            },
                                                            className: buttonClass,
                                                            children: pendingId === item.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].marking : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].markRead
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                            lineNumber: 72,
                                                            columnNumber: 32
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                                    lineNumber: 70,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, item.id, true, {
                                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                            lineNumber: 64,
                                            columnNumber: 20
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 61,
                                    columnNumber: 187
                                }, this),
                                hasMore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    disabled: loadingMore,
                                    className: buttonClass,
                                    onClick: ()=>{
                                        if (!loadingMore) onLoadMore();
                                    },
                                    children: loadingMore ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].loadingOlder : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].older
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                                    lineNumber: 76,
                                    columnNumber: 23
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                            lineNumber: 59,
                            columnNumber: 338
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                        lineNumber: 58,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "border-t border-line p-4 sm:px-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: preferencesHref,
                            onClick: ()=>setAnchor(null),
                            className: "inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].preferences
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                            lineNumber: 79,
                            columnNumber: 60
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                        lineNumber: 79,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx",
                lineNumber: 52,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web/src/features/notifications/notification-menu/connected-notification-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedNotificationMenu",
    ()=>ConnectedNotificationMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$capture$2d$notification$2d$item$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/capture-notification-item.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$job$2d$notification$2d$item$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/job-notification-item.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/notification-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/notification-menu.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function ConnectedNotificationMenu({ workspaceId, workspaceName }) {
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        items: [],
        unreadCount: 0,
        page: 1,
        hasMore: false
    });
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('loading');
    const [pendingId, setPendingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(), [actionError, setActionError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [loadingMore, setLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined), generation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0), marking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const token = ++generation.current;
        request.current?.abort();
        const abort = new AbortController();
        request.current = abort;
        try {
            const response = await fetch(`/api/notifications?workspace=${encodeURIComponent(workspaceId)}`, {
                cache: 'no-store',
                signal: abort.signal
            });
            if (!response.ok) throw Error();
            const next = await response.json();
            if (token === generation.current) {
                setResult(next);
                setState('ready');
                setLoadingMore(false);
            }
        } catch  {
            if (!abort.signal.aborted && token === generation.current) {
                setResult({
                    items: [],
                    unreadCount: 0,
                    page: 1,
                    hasMore: false
                });
                setState('error');
                setLoadingMore(false);
            }
        }
    }, [
        workspaceId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onRefresh = ()=>{
            void refresh();
        };
        const startup = setTimeout(onRefresh, 0);
        const timer = setInterval(()=>{
            if (document.visibilityState === 'visible') void refresh();
        }, 15000);
        window.addEventListener('focus', onRefresh);
        window.addEventListener('salesmora:notifications-refresh', onRefresh);
        return ()=>{
            clearTimeout(startup);
            clearInterval(timer);
            window.removeEventListener('focus', onRefresh);
            window.removeEventListener('salesmora:notifications-refresh', onRefresh);
            request.current?.abort();
        };
    }, [
        refresh
    ]);
    async function mark(id) {
        if (marking.current) return;
        marking.current = true;
        setPendingId(id);
        setActionError(false);
        try {
            const response = await fetch('/api/notifications/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workspaceId,
                    id
                })
            });
            if (!response.ok) throw Error();
            await refresh();
        } catch  {
            setActionError(true);
            await refresh();
        } finally{
            marking.current = false;
            setPendingId(undefined);
        }
    }
    async function older() {
        if (loadingMore || !result.hasMore) return;
        const token = generation.current;
        setLoadingMore(true);
        setActionError(false);
        try {
            const response = await fetch(`/api/notifications?workspace=${encodeURIComponent(workspaceId)}&page=${result.page + 1}`, {
                cache: 'no-store'
            });
            if (!response.ok) throw Error();
            const next = await response.json();
            if (token === generation.current) setResult((old)=>({
                    ...next,
                    items: [
                        ...new Map([
                            ...old.items,
                            ...next.items
                        ].map((item)=>[
                                item.id,
                                item
                            ])).values()
                    ]
                }));
        } catch  {
            if (token === generation.current) {
                setState('error');
                setResult({
                    items: [],
                    unreadCount: 0,
                    page: 1,
                    hasMore: false
                });
            }
        } finally{
            if (token === generation.current) setLoadingMore(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NotificationMenu"], {
        workspaceName: workspaceName,
        state: state,
        unreadCount: state === 'ready' ? result.unreadCount : null,
        items: result.items.map((item)=>item.kind === 'capture' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$capture$2d$notification$2d$item$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureNotificationItem"])(item, workspaceId) : item.kind === 'job' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$job$2d$notification$2d$item$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jobNotificationItem"])(item, workspaceId, workspaceName) : item.kind === 'deadline' ? {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].deadlineTitles[item.event],
                description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].deadlineDescription(item.jobNumber, item.jobTitle),
                createdAt: item.createdAt,
                read: item.read,
                details: [
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].deadlineDate,
                        value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].date(item.completionDeadline)
                    },
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].deadlineReminderDate,
                        value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].date(item.reminderDate)
                    },
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitTimezone,
                        value: item.timezone
                    }
                ],
                actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewJob,
                href: `/jobs/${encodeURIComponent(item.jobId)}?workspace=${encodeURIComponent(workspaceId)}`
            } : item.kind === 'visit' ? {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitTitles[item.event],
                description: item.event === 'joined' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitJoinedDescription(item.actorName) : item.event === 'separated' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitSeparatedDescription(item.actorName) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitDescription(item.actorName),
                createdAt: item.createdAt,
                read: item.read,
                details: [
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitBefore,
                        value: item.before.scheduledDate ? `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].date(item.before.scheduledDate)} · ${item.before.arrivalWindow ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].window(item.before.arrivalWindow) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].noWindow}` : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitNoDate
                    },
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitAfter,
                        value: item.after.scheduledDate ? `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].date(item.after.scheduledDate)} · ${item.after.arrivalWindow ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].window(item.after.arrivalWindow) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].noWindow}` : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitNoDate
                    },
                    {
                        label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].visitTimezone,
                        value: item.timezone
                    }
                ],
                recordLabels: item.records.map((r)=>`${r.number} · ${r.title}`),
                actionLabel: item.records[0].type === 'job' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewJob : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewWorkOrder,
                href: `/${item.records[0].type === 'job' ? 'jobs' : 'work-orders'}/${encodeURIComponent(item.records[0].id)}?workspace=${encodeURIComponent(workspaceId)}`
            } : item.kind === 'material' ? {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].materialTitles[item.event],
                description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].materialDescription(item.event, item.actorName, item.materialName, item.reason),
                createdAt: item.createdAt,
                read: item.read,
                actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewMaterials,
                href: `/materials?workspace=${encodeURIComponent(workspaceId)}`
            } : item.kind === 'work_order' ? {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].workOrderTitles[item.event],
                description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].workOrderDescription(item.actorName, item.workOrderNumber, item.workOrderTitle),
                createdAt: item.createdAt,
                read: item.read,
                actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewWorkOrder,
                href: `/work-orders/${encodeURIComponent(item.workOrderId)}?workspace=${encodeURIComponent(workspaceId)}`
            } : item.kind === 'estimate' ? {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].estimateTitles[item.event],
                description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].estimateDescription(item.estimateNumber, item.estimateName, item.status),
                createdAt: item.createdAt,
                read: item.read,
                actionLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].viewEstimate,
                href: `/estimates/${encodeURIComponent(item.estimateId)}?workspace=${encodeURIComponent(workspaceId)}`
            } : {
                id: item.id,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].assignmentTitle,
                description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$notification$2d$menu$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationMenuData"].assignmentDescription(item.assignerName, item.leadNumber, item.leadName, item.service),
                createdAt: item.createdAt,
                read: item.read,
                href: `/leads/${encodeURIComponent(item.leadId)}?workspace=${encodeURIComponent(workspaceId)}`
            }),
        preferencesHref: `/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`,
        pendingId: pendingId,
        actionError: actionError,
        hasMore: result.hasMore,
        loadingMore: loadingMore,
        onOpen: ()=>{
            void refresh();
        },
        onRetry: ()=>{
            setState('loading');
            void refresh();
        },
        onMarkRead: (id)=>{
            void mark(id);
        },
        onLoadMore: ()=>{
            void older();
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/notifications/notification-menu/connected-notification-menu.tsx",
        lineNumber: 40,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarEventCardData",
    ()=>calendarEventCardData,
    "calendarVisitFixtures",
    ()=>calendarVisitFixtures
]);
const calendarEventCardData = {
    types: {
        job: 'Job visit',
        work_order: 'Work Order visit',
        shared: 'Shared visit'
    },
    job: 'Job',
    workOrder: 'Work Order',
    noWindow: 'Arrival window not set',
    crew: 'Assigned team',
    unassigned: 'Unassigned',
    deadline: 'Completion deadline',
    overdue: 'Overdue',
    waiting: 'Waiting · visit on hold',
    readOnly: 'View only',
    open: 'View visit details',
    oneVisit: '1 visit',
    toggleVisit: (title)=>`Visit: ${title}`,
    openVisit: (title)=>`View visit details: ${title}`,
    date: (date)=>new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(`${date}T12:00:00Z`)),
    window: (value)=>{
        const time = (part)=>{
            const [hour, minute] = part.split(':').map(Number);
            return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${hour < 12 ? 'AM' : 'PM'}`;
        };
        return value.split('-').map(time).join(' – ');
    },
    stories: {
        heading: 'Calendar visit',
        description: 'Component preview · Tuesday, October 20, 2026',
        title: 'Kitchen plumbing repair',
        customer: 'Jordan Lee',
        workOrderTitle: 'Replace kitchen shutoff valves',
        secondWorkOrderTitle: 'Test supply lines',
        sam: 'Sam Rivera',
        alex: 'Alex Chen',
        longTitle: 'Inspect and replace the kitchen supply lines, valves and dishwasher connection in the rear extension',
        longCustomer: 'Northside Community Workshop and Neighborhood Resource Center',
        longName: 'Alexandra Montgomery-Sánchez',
        changed: 'Open callback only; no schedule changes are saved.'
    }
};
const shared = {
    id: 'preview-visit-1',
    title: calendarEventCardData.stories.title,
    customerName: calendarEventCardData.stories.customer,
    arrivalWindow: '09:00-11:00',
    records: [
        {
            id: 'preview-job-1',
            type: 'job',
            number: 'J-1042',
            title: calendarEventCardData.stories.title,
            status: 'scheduled'
        },
        {
            id: 'preview-wo-1',
            type: 'work_order',
            number: 'WO-1007',
            title: calendarEventCardData.stories.workOrderTitle,
            status: 'issued'
        }
    ],
    crew: [
        {
            id: 'sam',
            name: calendarEventCardData.stories.sam
        },
        {
            id: 'alex',
            name: calendarEventCardData.stories.alex
        }
    ],
    completionDeadline: {
        date: '2026-10-23',
        overdue: false
    },
    waiting: false,
    canReschedule: true
};
const calendarVisitFixtures = {
    shared,
    job: {
        ...shared,
        id: 'preview-job-visit',
        records: [
            shared.records[0]
        ]
    },
    workOrder: {
        ...shared,
        id: 'preview-wo-visit',
        title: calendarEventCardData.stories.workOrderTitle,
        records: [
            shared.records[1]
        ],
        completionDeadline: null
    }
};
}),
"[project]/apps/web/src/features/calendar/calendar-events.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarScheduleChangedEvent",
    ()=>calendarScheduleChangedEvent,
    "useCalendarScheduleRefresh",
    ()=>useCalendarScheduleRefresh
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
const calendarScheduleChangedEvent = 'salesmora:calendar-schedule-saved';
function useCalendarScheduleRefresh(refresh) {
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(refresh);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        current.current = refresh;
    }, [
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const reload = ()=>{
            void Promise.resolve(current.current()).catch(()=>undefined);
        };
        window.addEventListener(calendarScheduleChangedEvent, reload);
        return ()=>window.removeEventListener(calendarScheduleChangedEvent, reload);
    }, []);
}
}),
"[project]/apps/web/src/features/calendar/calendar-date.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-ssr] (ecmascript) <locals>");
;
}),
"[project]/apps/web/src/features/leads/leads-toolbar/leads-toolbar.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadsToolbarData",
    ()=>leadsToolbarData
]);
const leadsToolbarData = {
    region: 'Lead search and actions',
    view: 'Lead view',
    list: 'List',
    pipeline: 'Pipeline',
    add: 'Add lead',
    export: 'Export',
    search: 'Search leads',
    placeholder: 'Name, email, phone, service or address',
    searchHelp: 'Search names, contact details, services and addresses.',
    searchMinimum: 'Enter at least 2 characters to search.',
    stage: 'Stage',
    source: 'Source',
    owner: 'Owner',
    created: 'Created',
    from: 'From date',
    to: 'To date',
    any: 'Any',
    me: 'Me',
    unassigned: 'Unassigned',
    attention: 'Needs attention',
    archived: 'Show archived',
    dateHelp: 'Choose both dates to apply a custom range.',
    dateError: 'The end date must be on or after the start date.',
    rangeTitle: 'Check the date range',
    open: (label)=>`Open ${label.toLowerCase()} filters`,
    close: (label)=>`Close ${label.toLowerCase()} filters`,
    noOptions: 'No matching options',
    selected: (count)=>`${count} selected`,
    chip: (label, value)=>`${label}: ${value}`,
    stages: [
        {
            value: 'new',
            label: 'New'
        },
        {
            value: 'contacted',
            label: 'Contacted'
        },
        {
            value: 'estimate-sent',
            label: 'Estimate sent'
        },
        {
            value: 'won',
            label: 'Won'
        },
        {
            value: 'lost',
            label: 'Lost'
        }
    ],
    sources: [
        {
            value: 'website',
            label: 'Website'
        },
        {
            value: 'referral',
            label: 'Referral'
        },
        {
            value: 'phone',
            label: 'Phone'
        },
        {
            value: 'gmail',
            label: 'Gmail'
        },
        {
            value: 'other',
            label: 'Other'
        }
    ],
    dates: [
        {
            value: 'any',
            label: 'Any time'
        },
        {
            value: '7days',
            label: 'Last 7 days'
        },
        {
            value: '30days',
            label: 'Last 30 days'
        },
        {
            value: 'custom',
            label: 'Custom range'
        }
    ],
    stories: {
        title: 'Leads toolbar',
        description: 'Preview filters and actions using fictional teammates. No records are queried or changed.',
        owners: [
            {
                id: 'taylor',
                name: 'Taylor Morgan'
            },
            {
                id: 'sam',
                name: 'Sam Rivera'
            },
            {
                id: 'ava',
                name: 'Ava Morgan'
            }
        ],
        added: 'Add lead requested (preview only).',
        exported: 'Export requested (preview only).'
    }
};
}),
"[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "moveStageDialogData",
    ()=>moveStageDialogData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$leads$2d$toolbar$2f$leads$2d$toolbar$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/leads/leads-toolbar/leads-toolbar.data.ts [app-ssr] (ecmascript)");
;
const moveStageDialogData = {
    stages: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$leads$2d$toolbar$2f$leads$2d$toolbar$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leadsToolbarData"].stages,
    title: 'Move this lead?',
    description: (name, stage)=>`Move ${name} from ${stage} to a new stage. This change will appear in its activity history.`,
    stage: 'New stage',
    choose: 'Choose a stage',
    reason: 'Lost reason (optional)',
    reasonHelp: 'Up to 500 characters. Saved in activity history.',
    confirm: 'Confirm move',
    pending: 'Moving lead…',
    cancel: 'Cancel',
    forbidden: 'You do not have permission to move this lead.',
    archived: 'Restore this archived lead before changing its stage.',
    stale: 'This lead changed. Reload its details before moving it.',
    invalid: 'Choose a different stage and keep the Lost reason within 500 characters.',
    reloadFailed: 'Could not reload this lead. Try again.',
    conflictTitle: 'This lead changed',
    reload: 'Reload details',
    stories: {
        title: 'Move lead stage',
        description: 'Shared stage review for the pipeline and quick view. Submission and reload are mocked.',
        open: 'Review stage change',
        success: 'Lead moved (preview only).',
        failure: 'The lead could not be moved. Try again.',
        conflict: 'Another teammate updated this lead. Reload its latest details before trying again.',
        reason: 'Customer chose another provider.',
        longName: 'Alexandra Morgan-Williams and Christopher Rivera',
        lead: {
            id: 'jordan',
            version: 3,
            name: 'Jordan Lee',
            stage: 'contacted',
            canMove: true,
            archived: false
        }
    }
};
}),
"[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MoveStageDialog",
    ()=>MoveStageDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$confirm$2d$dialog$2f$confirm$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/confirm-dialog/confirm-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function MoveStageDialog({ open, lead, value, pending = false, error, onChange, onClose, onConfirm, onReload, allowedStages, container, printHidden }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const [reloadError, setReloadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [working, setWorking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const busy = pending || working;
    const forbidden = !lead.canMove || lead.archived;
    const conflict = error?.kind === 'conflict';
    const stages = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].stages.filter((stage)=>!allowedStages || allowedStages.includes(stage.value));
    const stageValid = stages.some((stage)=>stage.value === value.to) && value.to !== lead.stage;
    const valid = stageValid && (value.to !== 'lost' || value.reason.length <= 500);
    const blocked = forbidden || conflict || !valid;
    const current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].stages.find((stage)=>stage.value === lead.stage).label;
    async function confirm() {
        if (busy || blocked) return;
        setWorking(true);
        try {
            await onConfirm({
                lead,
                to: value.to,
                reason: value.to === 'lost' ? value.reason.trim() || undefined : undefined
            });
        } finally{
            setWorking(false);
        }
    }
    async function reload() {
        if (!onReload || busy) return;
        setWorking(true);
        setReloadError(false);
        try {
            await onReload();
        } catch  {
            setReloadError(true);
        } finally{
            setWorking(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$confirm$2d$dialog$2f$confirm$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfirmDialog"], {
        open: open,
        container: container,
        printHidden: printHidden,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].title,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].description(lead.name, current),
        confirmLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].confirm,
        cancelLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].cancel,
        pendingLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].pending,
        pending: busy,
        confirmDisabled: blocked,
        error: error?.kind === 'error' ? error.message : undefined,
        onClose: onClose,
        onConfirm: confirm,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid gap-4",
            children: [
                forbidden && !conflict ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                    kind: "error",
                    message: lead.archived ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].archived : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].forbidden
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                    lineNumber: 56,
                    columnNumber: 33
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: `${id}-stage`,
                            className: "grid gap-2 text-sm font-semibold text-ink",
                            children: [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].stage,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: `${id}-stage`,
                                    value: value.to,
                                    disabled: busy || conflict,
                                    onChange: (event)=>onChange({
                                            ...value,
                                            to: event.target.value
                                        }),
                                    className: "min-h-11 rounded-xl border border-line bg-paper px-3 text-base focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50",
                                    children: [
                                        !stageValid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: value.to,
                                            disabled: true,
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].choose
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                            lineNumber: 60,
                                            columnNumber: 29
                                        }, this),
                                        stages.filter((stage)=>stage.value !== lead.stage).map((stage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: stage.value,
                                                children: stage.label
                                            }, stage.value, false, {
                                                fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                                lineNumber: 61,
                                                columnNumber: 78
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                    lineNumber: 58,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 57,
                            columnNumber: 9
                        }, this),
                        value.to === 'lost' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: `${id}-reason`,
                                    className: "text-sm font-semibold text-ink",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].reason
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                    lineNumber: 65,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: `${id}-reason`,
                                    value: value.reason,
                                    disabled: busy || conflict,
                                    maxLength: 500,
                                    rows: 3,
                                    onChange: (event)=>onChange({
                                            ...value,
                                            reason: event.target.value
                                        }),
                                    "aria-describedby": `${id}-reason-help`,
                                    className: "rounded-xl border border-line bg-paper p-3 text-base focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                    lineNumber: 66,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    id: `${id}-reason-help`,
                                    className: "m-0 text-sm text-muted",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].reasonHelp
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                                    lineNumber: 69,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 64,
                            columnNumber: 33
                        }, this),
                        !valid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                            kind: "error",
                            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].invalid
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 71,
                            columnNumber: 20
                        }, this)
                    ]
                }, void 0, true),
                conflict && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                            kind: "error",
                            title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].conflictTitle,
                            message: error.message
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 73,
                            columnNumber: 22
                        }, this),
                        reloadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                            kind: "error",
                            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].reloadFailed
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 74,
                            columnNumber: 25
                        }, this),
                        onReload && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            disabled: busy,
                            onClick: ()=>{
                                void reload();
                            },
                            className: "min-h-11 cursor-pointer rounded-xl border border-line px-4 font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$leads$2f$move$2d$stage$2d$dialog$2f$move$2d$stage$2d$dialog$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveStageDialogData"].reload
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
                            lineNumber: 75,
                            columnNumber: 22
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
            lineNumber: 55,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "workOrderStatusBadgeData",
    ()=>workOrderStatusBadgeData,
    "workOrderStatusBadgeStoryData",
    ()=>workOrderStatusBadgeStoryData
]);
const workOrderStatusBadgeData = {
    draft: {
        label: "Draft",
        tone: "neutral"
    },
    issued: {
        label: "Issued",
        tone: "info"
    },
    "in-progress": {
        label: "In Progress",
        tone: "warning"
    },
    completed: {
        label: "Completed",
        tone: "success"
    },
    canceled: {
        label: "Canceled",
        tone: "error"
    }
};
const workOrderStatusBadgeStoryData = {
    title: "Work order statuses",
    description: "Work orders move from Draft to Issued, In Progress and Completed, or are Canceled. Archived is a separate flag.",
    workOrder: "WO-1011 · Water heater replacement",
    customer: "Priya Shah",
    label: "Current status",
    next: "3 of 6 tasks complete"
};
}),
"[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkOrderStatusBadge",
    ()=>WorkOrderStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.data.ts [app-ssr] (ecmascript)");
;
;
;
function WorkOrderStatusBadge({ status }) {
    const { label, tone } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderStatusBadgeData"][status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
        label: label,
        tone: tone,
        dot: true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/customers/customer-ui.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "customerButton",
    ()=>customerButton,
    "customerDate",
    ()=>customerDate,
    "customerInitials",
    ()=>customerInitials,
    "customerInput",
    ()=>customerInput,
    "customerPanel",
    ()=>customerPanel,
    "customerPrimary",
    ()=>customerPrimary,
    "customerRelativeDate",
    ()=>customerRelativeDate
]);
const customerButton = "min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
const customerPrimary = "min-h-11 max-w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
const customerPanel = "min-w-0 rounded-2xl border border-line bg-paper p-6 text-ink";
const customerInput = "min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas";
function customerDate(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    }).format(date) : "—";
}
const customerInitials = (name)=>name.trim().split(/\s+/u).slice(0, 2).map((part)=>[
            ...part
        ][0]).join("").toLocaleUpperCase();
function customerRelativeDate(value, now) {
    if (!now) return customerDate(value);
    const days = Math.round((Date.parse(value) - Date.parse(now)) / 86400000);
    return Number.isFinite(days) && Math.abs(days) <= 7 ? new Intl.RelativeTimeFormat("en-US", {
        numeric: "auto"
    }).format(days, "day") : customerDate(value);
}
}),
"[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "duplicateMatchBannerData",
    ()=>duplicateMatchBannerData
]);
const duplicateMatchBannerData = {
    title: "This customer may already exist",
    hint: "Review the match before creating another record. Records will not be merged.",
    reasons: {
        email: "Matching email address",
        phone: "Matching phone number",
        name: "Matching name"
    },
    use: "Use existing",
    useRecord: (n)=>`Use existing ${n}`,
    anyway: "Create anyway"
};
}),
"[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DuplicateMatchBanner",
    ()=>DuplicateMatchBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$customer$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/customers/customer-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function DuplicateMatchBanner({ matches, disabled, onUseExisting, onCreateAnyway }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!matches.length) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": id,
        className: "grid min-w-0 gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                id: id,
                className: "m-0 text-base font-semibold",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].hint
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "m-0 grid list-none gap-4 p-0",
                children: matches.map((match)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "grid min-w-0 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "wrap-anywhere",
                                children: [
                                    match.name,
                                    " · ",
                                    match.number
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].reasons[match.reason]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: disabled,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$customer$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerButton"],
                                onClick: ()=>onUseExisting(match.id),
                                "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].useRecord(match.number),
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].use
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this)
                        ]
                    }, match.id, true, {
                        fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                disabled: disabled,
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$customer$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerButton"],
                onClick: onCreateAnyway,
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["duplicateMatchBannerData"].anyway
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "workspaceShellData",
    ()=>workspaceShellData
]);
const workspaceShellData = {
    contentId: 'workspace-content',
    signOutErrorTitle: 'Could not sign out',
    signOutError: 'Please try signing out again.',
    assistant: {
        badge: 'Chat coming soon',
        unavailable: 'Chat is not connected yet.'
    },
    stories: {
        title: 'Your workspace is ready',
        description: 'Your saved business details and account controls are available here.',
        content: 'Workspace content preview. Navigation and sign out are mocked.',
        workspace: 'Northstar Plumbing',
        name: 'Alex Rivera',
        email: 'alex@example.com'
    }
};
}),
"[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceShell",
    ()=>WorkspaceShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$assistant$2d$panel$2f$assistant$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/assistant-panel/assistant-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$layout$2f$workspace$2d$navigation$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/layout/workspace-navigation/workspace-navigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$connected$2d$notification$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/notifications/notification-menu/connected-notification-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$workspace$2d$assistant$2f$workspace$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/workspace-assistant/workspace-assistant.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function WorkspaceShell({ currentPage = 'home', currentSettingsPage, currentCalendarPage, ganttAvailable = false, jobNotificationsAvailable = false, permissionsAvailable = false, billingAvailable = false, workspaceId, workspaceName, user, title, description, contentWidth = 'standard', onSignOut, children, authorizedPages = [], assistantAvailable = false, chatEnabled = false, chatSurface = 'home', chatContext, printChromeHidden = false }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Every active teammate can open personal settings; business settings still authorize independently.
    const accountHref = `/settings/account?workspace=${encodeURIComponent(workspaceId)}`;
    const [pending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransition"])();
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    function signOut() {
        if (pending) return;
        setError(false);
        startTransition(async ()=>{
            try {
                await onSignOut();
            } catch  {
                setError(true);
            }
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$workspace$2d$assistant$2f$workspace$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkspaceAssistantProvider"], {
        enabled: assistantAvailable && chatEnabled,
        initialPageContext: chatContext,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `min-h-screen md:flex ${printChromeHidden ? 'print:min-h-0' : ''}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: printChromeHidden ? 'contents print:hidden' : 'contents',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$layout$2f$workspace$2d$navigation$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkspaceNavigation"], {
                        jobNotificationsHref: jobNotificationsAvailable ? `/settings/job-notifications?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        ganttHref: ganttAvailable ? `/calendar/gantt?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        currentCalendarPage: currentCalendarPage,
                        notificationsHref: `/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`,
                        accountHref: accountHref,
                        billingHref: billingAvailable ? `/settings/billing?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        aiUsageHref: user.role === 'owner' ? `/settings/ai-usage?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        workspaceName: workspaceName,
                        user: user,
                        currentPage: currentPage,
                        currentSettingsPage: currentSettingsPage,
                        permissionsHref: permissionsAvailable ? `/settings/permissions?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        contentId: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].contentId,
                        homeHref: `/home?workspace=${encodeURIComponent(workspaceId)}`,
                        calendarHref: `/calendar?workspace=${encodeURIComponent(workspaceId)}`,
                        estimatesHref: `/estimates?workspace=${encodeURIComponent(workspaceId)}`,
                        reportsHref: `/reports?workspace=${encodeURIComponent(workspaceId)}`,
                        leadSettingsHref: authorizedPages.includes('lead-settings') ? `/settings/leads?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        estimateSettingsHref: authorizedPages.includes('estimate-settings') ? `/settings/estimates?workspace=${encodeURIComponent(workspaceId)}` : undefined,
                        jobsHref: `/jobs?workspace=${encodeURIComponent(workspaceId)}`,
                        workOrdersHref: `/work-orders?workspace=${encodeURIComponent(workspaceId)}`,
                        materialsHref: `/materials?workspace=${encodeURIComponent(workspaceId)}`,
                        customersHref: `/customers?workspace=${encodeURIComponent(workspaceId)}`,
                        leadCaptureHref: `/lead-capture?workspace=${encodeURIComponent(workspaceId)}`,
                        leadsHref: `/leads?workspace=${encodeURIComponent(workspaceId)}`,
                        settingsHref: `/settings?workspace=${encodeURIComponent(workspaceId)}`,
                        intakeHref: `/intake?workspace=${encodeURIComponent(workspaceId)}`,
                        availablePages: [
                            'intake',
                            'campaigns',
                            'home',
                            'leads',
                            'customers',
                            'jobs',
                            'work-orders',
                            'materials',
                            'calendar',
                            'estimates',
                            'settings',
                            ...("TURBOPACK compile-time truthy", 1) ? [
                                'reports'
                            ] : "TURBOPACK unreachable"
                        ],
                        authorizedPages: [
                            ...authorizedPages.filter((page)=>page !== 'settings'),
                            'settings'
                        ],
                        accountSettingsAvailable: true,
                        signingOut: pending,
                        onAccountSettings: ()=>router.push(accountHref),
                        onSignOut: signOut
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                        lineNumber: 47,
                        columnNumber: 79
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                    lineNumber: 47,
                    columnNumber: 5
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    id: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].contentId,
                    tabIndex: -1,
                    className: `min-w-0 flex-1 px-6 py-8 pb-28 focus-visible:focus-ring sm:px-10 md:py-10 md:pb-28 ${printChromeHidden ? 'print:p-0 print:pb-0' : ''}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mx-auto w-full ${contentWidth === 'standard' ? 'max-w-4xl' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `mb-6 flex justify-end ${printChromeHidden ? 'print:hidden' : ''}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$notifications$2f$notification$2d$menu$2f$connected$2d$notification$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedNotificationMenu"], {
                                    workspaceId: workspaceId,
                                    workspaceName: workspaceName
                                }, workspaceId, false, {
                                    fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                    lineNumber: 84,
                                    columnNumber: 93
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                lineNumber: 84,
                                columnNumber: 9
                            }, this),
                            assistantAvailable && (chatEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedAssistant"], {
                                workspaceId: workspaceId,
                                surfaceKey: chatSurface
                            }, workspaceId, false, {
                                fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                lineNumber: 85,
                                columnNumber: 47
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$assistant$2d$panel$2f$assistant$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AssistantPanel"], {
                                sendDisabled: true,
                                badge: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].assistant.badge,
                                onSend: async ()=>({
                                        ok: false,
                                        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].assistant.unavailable
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                lineNumber: 85,
                                columnNumber: 141
                            }, this)),
                            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                className: `mb-8 ${printChromeHidden ? 'print:hidden' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "m-0 text-heading font-semibold text-ink sm:text-heading-lg",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                        lineNumber: 86,
                                        columnNumber: 89
                                    }, this),
                                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-0 mt-3 text-base leading-relaxed text-muted",
                                        children: description
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                        lineNumber: 86,
                                        columnNumber: 192
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                lineNumber: 86,
                                columnNumber: 19
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                                    kind: "error",
                                    title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].signOutErrorTitle,
                                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$workspace$2f$workspace$2d$shell$2f$workspace$2d$shell$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workspaceShellData"].signOutError
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                    lineNumber: 87,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                                lineNumber: 87,
                                columnNumber: 19
                            }, this),
                            children
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                        lineNumber: 83,
                        columnNumber: 7
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
                    lineNumber: 82,
                    columnNumber: 5
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
            lineNumber: 46,
            columnNumber: 133
        }, this)
    }, workspaceId, false, {
        fileName: "[project]/apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_05..fbb._.js.map
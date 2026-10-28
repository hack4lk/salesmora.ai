import type { JobAssignmentRemovalRecord, JobNotificationRecord } from '@salesmora/contracts';
import { notificationMenuData as copy } from './notification-menu.data';

/** Keep the final removal branch separate so it cannot build a Job link from stale details. */
export function jobNotificationItem(item: JobNotificationRecord | JobAssignmentRemovalRecord, workspaceId: string, workspaceName: string) {
  const common = { id: item.id, createdAt: item.createdAt, read: item.read };
  if (item.event === 'assignment' && item.access === 'ended') return {
    ...common, title: copy.jobAssignmentTitles.removed, description: copy.jobAssignmentEnded(item.jobNumber, workspaceName),
    actionLabel: copy.openHome, href: `/home?workspace=${encodeURIComponent(workspaceId)}`,
  };
  return {
    ...common, title: item.event === 'deadline' ? copy.jobDeadlineTitle(item.before, item.after) : item.event === 'assignment' ? copy.jobAssignmentTitles[item.change] : item.event === 'status' ? copy.jobStatusTitle(item.before, item.after) : copy.jobTitles.created,
    description: item.event === 'created' ? copy.jobDescription(item.actorName, item.jobNumber, item.jobTitle) : copy.jobStatusDescription(item.actorName, item.jobNumber, item.jobTitle),
    ...(item.event === 'deadline' ? { details: [{ label: copy.jobPreviousDeadline, value: copy.jobDeadlineDate(item.before) }, { label: copy.jobNewDeadline, value: copy.jobDeadlineDate(item.after) }, { label: copy.visitTimezone, value: item.timezone }] } : {}),
    ...(item.event === 'status' ? { details: [{ label: copy.jobBeforeStatus, value: copy.jobStatusLabels[item.before] }, { label: copy.jobAfterStatus, value: copy.jobStatusLabels[item.after] }] } : {}),
    actionLabel: copy.viewJob, href: `/jobs/${encodeURIComponent(item.jobId)}?workspace=${encodeURIComponent(workspaceId)}`,
  };
}

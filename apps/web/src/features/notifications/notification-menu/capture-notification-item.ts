import type { CaptureNotificationRecord } from '@salesmora/contracts';
import type { NotificationMenuItem } from './notification-menu';
import { notificationMenuData as copy } from './notification-menu.data';
export function captureNotificationItem(item: CaptureNotificationRecord, workspaceId: string): NotificationMenuItem {
  return { id:item.id, title:copy.captureTitle, description:`${item.sourceName} · ${copy.captureReasons[item.reason]}`, createdAt:item.createdAt, read:item.read, actionLabel:copy.captureOpen, href:`/lead-capture/${encodeURIComponent(item.sourceId)}?workspace=${encodeURIComponent(workspaceId)}` };
}

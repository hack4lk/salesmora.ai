import type { WorkflowVisitNotificationRecord } from "@salesmora/contracts";
import { calendarEventCardData as format } from "../../calendar/calendar-event-card/calendar-event-card.data";
import type { NotificationMenuItem } from "./notification-menu";
/** Input is already authorized; the Calendar rechecks access when the recipient opens the link. */
export function workflowVisitNotificationItem(item: WorkflowVisitNotificationRecord, workspaceId: string): NotificationMenuItem {
  const snapshot = item.snapshot;
  const schedule = [format.date(snapshot.scheduledDate), snapshot.arrivalWindow ? format.window(snapshot.arrivalWindow) : undefined, snapshot.timezone].filter(Boolean).join(" · ");
  const extra = snapshot.totalRecords - snapshot.recordLabels.length;
  return { id: item.id, title: snapshot.reason === "customer_reminder" ? "Customer reminder not sent" : snapshot.reason === "materials" ? "Materials need attention before a visit" : "A scheduled visit has no assignee", description: snapshot.reason === "customer_reminder" ? "Update the visit details before the next reminder." : `${snapshot.title} · ${snapshot.customerName}.`,
    createdAt: item.createdAt, read: item.read, actionLabel: "Open visit",
    href: "/calendar?" + new URLSearchParams({ workspace: workspaceId, date: snapshot.scheduledDate, visit: item.visitId }),
    details: [{ label: "Scheduled visit", value: schedule }],
    recordLabels: snapshot.reason === "customer_reminder" || snapshot.reason === "materials" || snapshot.totalRecords > 1 ? [...snapshot.recordLabels, ...(extra > 0 ? [`${extra} more ${snapshot.reason === "materials" ? "work orders" : "linked records"}`] : [])] : undefined,
  };
}

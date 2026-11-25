import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { WorkflowDraft } from "@salesmora/contracts";
import { WorkflowDraftCard } from "./workflow-draft-card";
import { NotificationMenu } from "../notifications/notification-menu/notification-menu";
import { workflowVisitNotificationItem } from "../notifications/notification-menu/workflow-visit-notification-item";
import { CalendarVisitPeekDrawer, type CalendarVisitPeek } from "../calendar/calendar-visit-peek-drawer/calendar-visit-peek-drawer";

const draft: WorkflowDraft = {
  id: "00000000-0000-4000-8000-000000000031", workspaceId: "00000000-0000-4000-8000-000000000032", inputHash: "a".repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending", name: "Upcoming visit: materials need attention",
  rule: "Notify Morgan Ellis at 8 AM the day before a visit if a work order has materials marked Needed or Ordered.",
  definition: { kind: "visit_materials", calendarDaysBefore: 1, localTime: "08:00", recipientId: "morgan", recipientName: "Morgan Ellis",
    timezone: "America/New_York", notifications: { inApp: true, email: true } },
};
const visit: CalendarVisitPeek = { id: "00000000-0000-4000-8000-000000000033", title: "Kitchen faucet installation", customerName: "Jamie Parker",
  scheduledDate: "2027-03-15", arrivalWindow: "09:00-11:00", timezone: "America/New_York", location: "42 Example Lane", nextStep: null,
  crew: [], completionDeadline: null, waiting: false, canReschedule: false,
  records: [{ type: "work_order", id: "00000000-0000-4000-8000-000000000034", number: "WO-0018", title: "Kitchen faucet installation", status: "issued" }] };
const href = `/calendar?workspace=${draft.workspaceId}&date=${visit.scheduledDate}&visit=${visit.id}`;
const meta = { title: "Workflows/Visit Materials", component: WorkflowDraftCard, args: { draft, onDecide: fn() },
  decorators: [Story => <main className="mx-auto max-w-2xl bg-canvas p-5"><Story /></main>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(draft.rule)).toBeVisible();
  await expect(canvas.getByLabelText("Send at")).toHaveValue("08:00");
  await expect(canvas.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(canvas.queryByText("Details", { exact: true })).not.toBeInTheDocument();
} };
export const Publish: Story = { render: function Render(args) {
  const [current, setCurrent] = useState(args.draft);
  return <WorkflowDraftCard {...args} draft={current} onDecide={async (decision, notifications, localTime) => {
    await args.onDecide(decision, notifications, localTime);
    setCurrent(value => ({ ...value, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...value.definition, ...(localTime ? { localTime } : {}) } }));
  }} />;
}, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: true }, "08:00");
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
} };
export const MobileReview: Story = { ...Review, globals: { viewport: { value: "phone", isRotated: false } } };
function NotificationPreview() {
  const [read, setRead] = useState(false), [open, setOpen] = useState(false);
  const notice = workflowVisitNotificationItem({ kind: "workflow_visit", id: "materials-preview", visitId: visit.id, createdAt: "2027-03-14T12:00:00.000Z", read: false,
    snapshot: { reason: "materials", title: visit.title, customerName: visit.customerName, scheduledDate: visit.scheduledDate!, arrivalWindow: visit.arrivalWindow,
      timezone: visit.timezone, recordLabels: ["WO-0018 · Kitchen faucet installation: 2 Needed, 1 Ordered"], totalRecords: 1 } }, draft.workspaceId);
  return <div onClickCapture={event => { if ((event.target as Element).closest(`a[href="${href}"]`)) { event.preventDefault(); setOpen(true); } }}>
    <NotificationMenu workspaceName="Preview workspace" state="ready" unreadCount={read ? 0 : 1} items={read ? [] : [notice]}
      preferencesHref="#preferences" onOpen={fn()} onRetry={fn()} onLoadMore={fn()} onMarkRead={() => setRead(true)} />
    <CalendarVisitPeekDrawer open={open} onClose={() => setOpen(false)} visit={visit} state="ready" onOpenRecord={fn()} />
  </div>;
}
export const Notification: Story = { render: () => <NotificationPreview />, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Open notifications/ }));
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Notifications" }));
  await expect(dialog.getByRole("heading", { name: "Materials need attention before a visit" })).toBeVisible();
  await expect(dialog.getByText(/2 Needed, 1 Ordered/)).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Open visit" })).toHaveAttribute("href", href);
  await userEvent.click(dialog.getByRole("link", { name: "Open visit" }));
  const drawer = within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: visit.title }));
  await expect(drawer.getByRole("button", { name: /Open Work Order WO-0018/ })).toBeVisible();
} };

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantPanel } from "@salesmora/ui";
import { WorkflowDraftCard, type WorkflowDraftReview } from "./workflow-draft-card";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";
import { WorkflowRunDialog } from "./workflow-run-dialog";
import { workflowVisitNotificationItem } from "../notifications/notification-menu/workflow-visit-notification-item";
import { NotificationMenu } from "../notifications/notification-menu/notification-menu";
import { CalendarVisitPeekDrawer, type CalendarVisitPeek } from "../calendar/calendar-visit-peek-drawer/calendar-visit-peek-drawer";

// Fictional server-shaped draft. Story actions are mocked and never publish a real workflow.
const draft: WorkflowDraftReview = {
  id: "00000000-0000-4000-8000-000000000011", workspaceId: "00000000-0000-4000-8000-000000000012",
  inputHash: "a".repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending",
  name: "Upcoming visit has no assignee",
  rule: "Notify Morgan Ellis at 9 AM the day before a visit if nobody is assigned.",
  definition: { kind: "unassigned_visit", calendarDaysBefore: 1, localTime: "09:00", recipientId: "morgan", recipientName: "Morgan Ellis", timezone: "America/New_York", notifications: { inApp: true, email: true } },
};
const example = { id: "unassigned_visit", name: "Catch visits without an assignee", prompt: "Remind me at 9 AM the day before a visit if nobody is assigned." };
const guide = "Checks upcoming visits, including existing bookings. Uses your workspace time zone and includes weekends. It sends a reminder to your team.";
const visit: CalendarVisitPeek = {
  id: "00000000-0000-4000-8000-000000000013", title: "Kitchen faucet replacement", customerName: "Jordan Lee",
  scheduledDate: "2026-11-21", arrivalWindow: "09:00-11:00", timezone: "America/New_York", location: "42 Example Lane",
  nextStep: null, crew: [], completionDeadline: null, waiting: false, canReschedule: false,
  records: [{ type: "job", id: "00000000-0000-4000-8000-000000000014", number: "J-0042", title: "Kitchen faucet replacement", status: "scheduled" }],
};
const sharedVisit: CalendarVisitPeek = { ...visit, records: [...visit.records,
  { type: "work_order", id: "00000000-0000-4000-8000-000000000015", number: "WO-0018", title: "Faucet installation", status: "issued" }],
};
const visitHref = `/calendar?workspace=${draft.workspaceId}&date=${visit.scheduledDate}&visit=${visit.id}`;

const meta = {
  title: "Workflows/Unassigned Visit", component: WorkflowDraftCard,
  args: { draft, onDecide: fn() },
  decorators: [Story => <main className="mx-auto grid max-w-2xl gap-4 bg-canvas p-5">
    <p className="m-0 text-sm text-muted">Design preview. The people and visit are fictional. Publishing and delivery are simulated.</p><Story />
  </main>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Review: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(draft.rule)).toBeVisible();
  await expect(canvas.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(canvas.queryByText("Details", { exact: true })).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Publish: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.draft);
    return <WorkflowDraftCard {...args} draft={current} onDecide={async (decision, notifications, localTime) => {
      await args.onDecide(decision, notifications, localTime);
      setCurrent(value => ({ ...value, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...value.definition, ...(localTime ? { localTime } : {}) } }));
    }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
    await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: true }, "09:00");
    await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  },
};
export const InAppOnly: Story = { ...Publish, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "Email" }));
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: false }, "09:00");
} };
export const RequireNotificationChannel: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "In-app" }));
  await userEvent.click(canvas.getByRole("checkbox", { name: "Email" }));
  await expect(canvas.getByRole("alert")).toHaveTextContent("Choose at least one notification option.");
  await expect(canvas.getByRole("button", { name: "Publish workflow" })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Cancel: Story = { ...Publish, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
  await expect(args.onDecide).toHaveBeenCalledWith("cancel", undefined, undefined);
  await expect(await canvas.findByText("Draft canceled.")).toBeVisible();
} };
export const PublishFailure: Story = { args: { onDecide: fn(async () => { throw Error("Simulated access change"); }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByRole("alert")).toBeVisible();
  await expect(canvas.getByRole("button", { name: "Publish workflow" })).toBeEnabled();
} };
export const Expired: Story = { args: { draft: { ...draft, state: "expired" } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent("This draft expired.");
  await expect(canvas.queryByRole("button", { name: "Publish workflow" })).not.toBeInTheDocument();
} };
export const Conversation: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.draft), [open, setOpen] = useState(true);
    return <AssistantPanel open={open} onOpenChange={setOpen} badge="Design preview" title="What would you like to automate?"
      description="Create team reminders and briefings." composerPlaceholder="Describe a workflow…" onSend={async () => ({ ok: true })}
      messages={[{ id: "request", role: "user", text: example.prompt },
        { id: "review", role: "assistant", text: "Review your reminder, then publish when you're ready." }]}
      renderMessageSupplement={message => message.id === "review" ? <WorkflowDraftCard {...args} draft={current} onDecide={async (decision, notifications, localTime) => {
        await args.onDecide(decision, notifications, localTime);
        setCurrent(value => ({ ...value, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...value.definition, ...(localTime ? { localTime } : {}) } }));
      }} /> : null}
      renderBody={body => <WorkflowAutomationGuide examples={[example]} limitation={guide}>{body}</WorkflowAutomationGuide>} />;
  },
  play: async ({ canvasElement }) => {
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "What can I automate?" }));
    await expect(dialog.getByText(example.name)).toBeVisible();
    await expect(dialog.getByText(guide)).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Back to chat" }));
    await expect(dialog.getByRole("button", { name: "Publish workflow" })).toBeVisible();
  },
};
export const MobileConversation: Story = { ...Conversation, globals: { viewport: { value: "phone", isRotated: false } } };

function NotificationPreview({ selected = visit, access = true }: { selected?: CalendarVisitPeek; access?: boolean }) {
  const [read, setRead] = useState(false), [peekOpen, setPeekOpen] = useState(false);
  const notice = workflowVisitNotificationItem({ kind: "workflow_visit", id: "unassigned-visit-preview", visitId: selected.id,
    createdAt: "2026-11-20T14:00:00.000Z", read: false,
    snapshot: { title: selected.title, customerName: selected.customerName, scheduledDate: selected.scheduledDate!, arrivalWindow: selected.arrivalWindow,
      timezone: selected.timezone, recordLabels: selected.records.map(record => `${record.number} · ${record.title}`), totalRecords: selected.records.length },
  }, draft.workspaceId);
  return <div onClickCapture={event => {
    // Intercept only the fictional destination. The real Calendar uses this workspace/date/visit link.
    if ((event.target as Element).closest(`a[href="${visitHref}"]`)) { event.preventDefault(); setPeekOpen(true); }
  }}>
    <div className="flex justify-end"><NotificationMenu workspaceName="Preview workspace" state="ready" unreadCount={read ? 0 : 1}
      items={read ? [] : [notice]} preferencesHref="#notification-preferences-preview" onOpen={() => {}} onRetry={() => {}}
      onLoadMore={() => {}} onMarkRead={() => setRead(true)} /></div>
    <CalendarVisitPeekDrawer open={peekOpen} onClose={() => setPeekOpen(false)} visit={access ? selected : null}
      state={access ? "ready" : "error"} onOpenRecord={() => {}} />
  </div>;
}
async function openNotice(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Open notifications/ }));
  return within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Notifications" }));
}
export const Notification: Story = { render: () => <NotificationPreview />, play: async ({ canvasElement }) => {
  const dialog = await openNotice(canvasElement);
  await expect(dialog.getByRole("heading", { name: "A scheduled visit has no assignee" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Open visit" })).toHaveAttribute("href", visitHref);
  await expect(dialog.getByText(/Nov 21, 2026/)).toBeVisible();
} };
export const SharedVisitNotification: Story = { render: () => <NotificationPreview selected={sharedVisit} />, play: async ({ canvasElement }) => {
  const dialog = await openNotice(canvasElement);
  await expect(dialog.getByRole("heading", { name: "A scheduled visit has no assignee" })).toBeVisible();
  await expect(dialog.getAllByRole("link", { name: "Open visit" })).toHaveLength(1);
  await expect(dialog.getByText(/J-0042/)).toBeVisible();
  await expect(dialog.getByText(/WO-0018/)).toBeVisible();
} };
export const NoArrivalWindow: Story = { render: () => <NotificationPreview selected={{ ...visit, arrivalWindow: null }} />, play: async ({ canvasElement }) => {
  const dialog = await openNotice(canvasElement);
  await expect(dialog.getByText("Nov 21, 2026 · America/New_York")).toBeVisible();
  await expect(dialog.queryByText(/9 AM–11 AM/)).not.toBeInTheDocument();
  await expect(dialog.getByRole("link", { name: "Open visit" })).toBeVisible();
} };
export const OpenVisit: Story = { render: () => <NotificationPreview selected={sharedVisit} />, play: async ({ canvasElement }) => {
  const notice = await openNotice(canvasElement);
  await userEvent.click(notice.getByRole("link", { name: "Open visit" }));
  const drawer = within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: visit.title }));
  await expect(drawer.getByText("Unassigned", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("button", { name: /Open Job J-0042/ })).toBeVisible();
  await expect(drawer.getByRole("button", { name: /Open Work Order WO-0018/ })).toBeVisible();
} };
export const AccessUnavailable: Story = { render: () => <NotificationPreview access={false} />, play: async ({ canvasElement }) => {
  const notice = await openNotice(canvasElement);
  await userEvent.click(notice.getByRole("link", { name: "Open visit" }));
  const drawer = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  await expect(drawer.getByRole("alert")).toBeVisible();
  await expect(drawer.queryByText(visit.customerName)).not.toBeInTheDocument();
  await expect(drawer.queryByRole("button", { name: /Open Job/ })).not.toBeInTheDocument();
} };
export const MarkRead: Story = { render: () => <NotificationPreview />, play: async ({ canvasElement }) => {
  const dialog = await openNotice(canvasElement);
  await userEvent.click(dialog.getByRole("button", { name: "Mark as read" }));
  await expect(dialog.queryByRole("heading", { name: "A scheduled visit has no assignee" })).not.toBeInTheDocument();
  await expect(dialog.queryByRole("link", { name: "Open visit" })).not.toBeInTheDocument();
} };
export const MobileNotification: Story = { ...Notification, globals: { viewport: { value: "phone", isRotated: false } } };
export const NoMatches: Story = { render: () => <WorkflowRunDialog row={{ id: draft.id, name: draft.name, status: "active", version: 1, pendingCount: 0, allowedActions: ["pause", "delete"] }}
  onPreviewRun={async () => ({ id: "empty-preview", matchedCount: 0, actionSummary: "No upcoming unassigned visits." })}
  onRunNow={fn()} onClose={fn()} onComplete={fn()} />, play: async ({ canvasElement }) => {
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("alertdialog"));
    await expect(await dialog.findByText("No records match this workflow right now.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Run now" })).toBeDisabled();
} };

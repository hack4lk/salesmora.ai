import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NotificationMenu } from "../notifications/notification-menu/notification-menu";
import { AssistantPanel } from "@salesmora/ui";
import { WorkflowDraftCard, type WorkflowDraftReview } from "./workflow-draft-card";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";
import { WorkflowBriefingCard } from "./workflow-briefing-card";

const draft: WorkflowDraftReview = {
  id: "00000000-0000-4000-8000-000000000001", workspaceId: "00000000-0000-4000-8000-000000000002", inputHash: "a".repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending", name: "Monday owner briefing",
  rule: "Send Ava Morgan a Monday briefing at 9 AM with inactive leads, estimates awaiting a decision, unscheduled jobs and jobs due soon.",
  definition: { kind: "weekly_briefing", weekday: "monday", localTime: "09:00", recipientId: "ava", recipientName: "Ava Morgan", timezone: "America/New_York",
    notifications: { inApp: true, email: true } },
};
const sample = { generatedAt: "2026-11-23T14:00:00.000Z", timezone: "America/New_York", canRead: true,
  counts: { inactiveLeads: 4, awaitingEstimates: 6, unscheduledJobs: 3, dueSoonJobs: 5 },
  links: { inactiveLeads: "#preview-inactive-leads", awaitingEstimates: "#preview-estimates", unscheduledJobs: "#preview-unscheduled-jobs", dueSoonJobs: "#preview-deadlines" },
};
const meta = {
  title: "Workflows/Weekly Briefing", component: WorkflowDraftCard, args: { draft, onDecide: fn() },
  decorators: [(Story) => <main className="mx-auto grid max-w-2xl gap-4 bg-canvas p-5">
    <p className="m-0 text-sm text-muted">Design preview. Publication and delivery are simulated; the counts and recipient are fictional.</p><Story />
  </main>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(canvas.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(canvas.queryByText("Details", { exact: true })).not.toBeInTheDocument();

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
export const Cancel: Story = { ...Publish, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
  await expect(args.onDecide).toHaveBeenCalledWith("cancel", undefined, undefined);
  await expect(await canvas.findByText("Draft canceled.")).toBeVisible();
} };
export const DeliveredBriefing: Story = { render: () => <WorkflowBriefingCard {...sample} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("heading", { name: "Your Monday briefing" })).toBeVisible();
  await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
  await expect(canvas.getAllByRole("link")).toHaveLength(4);
} };
export const EmptyBriefing: Story = { render: () => <WorkflowBriefingCard {...sample} counts={{ inactiveLeads: 0, awaitingEstimates: 0, unscheduledJobs: 0, dueSoonJobs: 0 }} /> };
export const AccessUnavailable: Story = { render: () => <WorkflowBriefingCard {...sample} canRead={false} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toBeVisible();
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
} };
export const Conversation: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.draft);
    const [open, setOpen] = useState(true);
    return <AssistantPanel open={open} onOpenChange={setOpen} badge="Design preview" title="What would you like to automate?"
      description="Create reminders and a Monday briefing." composerPlaceholder="Describe a workflow…" onSend={async () => ({ ok: true })}
      messages={[{ id: "request", role: "user", text: "Send me a Monday morning briefing of what needs attention." },
        { id: "review", role: "assistant", text: "Review your Monday briefing, then publish when you're ready." }]}
      renderMessageSupplement={message => message.id === "review" ? <WorkflowDraftCard {...args} draft={current} onDecide={async (decision, notifications, localTime) => {
        await args.onDecide(decision, notifications, localTime);
        setCurrent(value => ({ ...value, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...value.definition, ...(localTime ? { localTime } : {}) } }));
      }} /> : null}
      renderBody={body => <WorkflowAutomationGuide examples={[
        { id: "weekly_briefing", name: "Start Monday with a briefing", prompt: "Send me a Monday briefing of leads, estimates, and jobs needing attention." },
        { id: "unassigned_lead", name: "Catch unassigned leads", prompt: "Remind me after one business day if a new lead is still unassigned." },
      ]} limitation="The briefing summarizes current records. It does not contact customers, assign work, or book visits.">{body}</WorkflowAutomationGuide>}
    />;
  },
};
export const MobileConversation: Story = { ...Conversation, globals: { viewport: { value: "phone", isRotated: false } } };
export const MobileBriefing: Story = { ...DeliveredBriefing, globals: { viewport: { value: "phone", isRotated: false } } };

export const NotificationModal: Story = {
  render: function Render() {
    const [read, setRead] = useState(false);
    return <div className="flex justify-end">
      <NotificationMenu workspaceName="Preview workspace" state="ready" unreadCount={read ? 0 : 1}
        items={read ? [] : [{ id: "weekly-briefing-preview", title: "Your Monday briefing is ready",
          description: "4 inactive leads · 6 estimates awaiting a decision · 3 unscheduled jobs · 5 jobs due soon.",
          createdAt: sample.generatedAt, read: false, href: "#briefing-preview", actionLabel: "View briefing" }]}
        preferencesHref="#notification-preferences-preview" onOpen={() => {}} onRetry={() => {}}
        onLoadMore={() => {}} onMarkRead={() => setRead(true)} />
    </div>;
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Open notifications/ }));
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Notifications" }));
    await expect(dialog.getByRole("heading", { name: "Your Monday briefing is ready" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "View briefing" })).toBeVisible();
    await expect(dialog.getByText(/4 inactive leads/)).toBeVisible();
  },
};
export const MarkBriefingRead: Story = { ...NotificationModal, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Open notifications/ }));
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Notifications" }));
  await userEvent.click(dialog.getByRole("button", { name: "Mark as read" }));
  await expect(dialog.queryByRole("heading", { name: "Your Monday briefing is ready" })).not.toBeInTheDocument();
  await expect(dialog.queryByRole("link", { name: "View briefing" })).not.toBeInTheDocument();
} };
export const MobileNotification: Story = { ...NotificationModal, globals: { viewport: { value: "phone", isRotated: false } } };

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantPanel } from "@salesmora/ui";
import { WorkflowDraftCard, type WorkflowDraftReview } from "./workflow-draft-card";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";

const draft: WorkflowDraftReview = {
  id: "00000000-0000-4000-8000-000000000001", workspaceId: "00000000-0000-4000-8000-000000000002",
  inputHash: "a".repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending",
  name: "Reminder: new lead still unassigned",
  rule: "Notify Ava Morgan at 5 PM after 1 business day if a new lead is still unassigned.",
  definition: { kind: "unassigned_lead", businessDays: 1, recipientId: "ava", recipientName: "Ava Morgan",
    timezone: "America/New_York", notifications: { inApp: true, email: true } },
};
const examples = [
  { id: "unassigned_lead", name: "Catch unassigned leads", prompt: "Remind me after one business day if a new lead is still unassigned." },
  { id: "estimate_follow_up", name: "Follow up on sent estimates", prompt: "Remind me after two business days if a sent estimate still has no decision." },
  { id: "unscheduled_estimate", name: "Flag approved work without a visit", prompt: "Remind me if an approved estimate still needs a visit." },
];
const meta = {
  title: "Workflows/Unassigned Lead", component: WorkflowDraftCard,
  args: { draft, onDecide: fn() },
  decorators: [(Story) => <main className="max-w-2xl bg-assistant-surface p-6 text-assistant-foreground">
    <p className="mb-5 mt-0 text-sm text-assistant-muted">Design preview. Publishing is simulated; no workflow is created and no reminders are sent.</p><Story />
  </main>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Review: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(canvas.getByRole("heading", { level: 3 })).toBeVisible();
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
    await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: true }, "17:00");
    await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  },
};
export const InAppOnly: Story = { ...Publish, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "Email" }));
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: false }, "17:00");
} };
export const Cancel: Story = { ...Publish, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
  await expect(args.onDecide).toHaveBeenCalledWith("cancel", undefined, undefined);
  await expect(await canvas.findByText("Draft canceled.")).toBeVisible();
} };
export const PublishFailure: Story = { args: { onDecide: fn(async () => { throw new Error("Unavailable"); }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByRole("alert")).toBeVisible();
  await expect(canvas.getByRole("button", { name: "Publish workflow" })).toBeEnabled();
} };
export const Expired: Story = { args: { draft: { ...draft, state: "expired" } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("This draft expired. Ask for a fresh draft.")).toBeVisible();
  await expect(canvas.queryByRole("button", { name: "Publish workflow" })).not.toBeInTheDocument();
} };
export const Conversation: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.draft);
    const [open, setOpen] = useState(true);
    return <AssistantPanel open={open} onOpenChange={setOpen} badge="Design preview" title="What would you like to automate?"
      description="Create reminders for unassigned leads and estimates." composerPlaceholder="Describe a workflow…" onSend={async () => ({ ok: true })}
      messages={[
        { id: "request", role: "user", text: "Remind me after one business day if a new lead is still unassigned." },
        { id: "review", role: "assistant", text: "Review your reminder, then publish when you're ready." },
      ]}
      renderMessageSupplement={message => message.id === "review" ? <WorkflowDraftCard {...args} draft={current} onDecide={async (decision, notifications, localTime) => {
        await args.onDecide(decision, notifications, localTime);
        setCurrent(value => ({ ...value, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...value.definition, ...(localTime ? { localTime } : {}) } }));
      }} /> : null}
      renderBody={body => <WorkflowAutomationGuide examples={examples} limitation="These workflows notify your team. Automatic lead assignment and customer messaging are not available.">{body}</WorkflowAutomationGuide>}
    />;
  },
  play: async ({ canvasElement }) => {
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "What can I automate?" }));
    await expect(await dialog.findByText("Catch unassigned leads")).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Back to chat" }));
    await expect(dialog.getByRole("button", { name: "Publish workflow" })).toBeVisible();
  },
};
export const Mobile: Story = { ...Conversation, globals: { viewport: { value: "phone", isRotated: false } } };

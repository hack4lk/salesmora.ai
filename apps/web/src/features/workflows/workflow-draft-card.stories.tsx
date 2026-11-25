import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantPanel } from "@salesmora/ui";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";
import { WorkflowDraftCard } from "./workflow-draft-card";

const meta = {
  title: "Workflows/Workflow Draft",
  component: WorkflowDraftCard,
  args: {
    draft: {
      id: "00000000-0000-4000-8000-000000000001", workspaceId: "00000000-0000-4000-8000-000000000002",
      inputHash: "a".repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending",
      name: "Unscheduled estimate reminder", rule: "Notify Ava Morgan at 5 PM after one business day if an approved estimate still has no visit.",
      definition: { kind: "unscheduled_estimate", businessDays: 1, recipientId: "ava", recipientName: "Ava Morgan", timezone: "America/New_York", notifications: { inApp: true, email: true } },
    },
    onDecide: fn(),
  },
  decorators: [(Story) => <div className="max-w-xl bg-assistant-message p-4"><Story /></div>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [draft, setDraft] = useState(args.draft);
    return <WorkflowDraftCard {...args} draft={draft} onDecide={async (decision, notifications, localTime) => {
      await args.onDecide(decision, notifications, localTime);
      setDraft(current => ({ ...current, state: decision === "confirm" ? "confirmed" : "cancelled", definition: { ...current.definition, ...(localTime ? { localTime } : {}) } }));
    }} />;
  },
};
export const Publish: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
    await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: true, email: true }, "17:00");
    await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  },
};
export const Cancel: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onDecide).toHaveBeenCalledWith("cancel", undefined, undefined);
    await expect(await canvas.findByText("Draft canceled.")).toBeVisible();
  },
};
export const Expired: Story = { args: { draft: { ...meta.args.draft, state: "expired" } } };


export const AssistantComposition: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return <AssistantPanel title="What would you like to automate?" description="Create a reminder for approved work that still needs a visit." onNewConversation={fn()} composerPlaceholder="Describe a workflow…" open={open} onOpenChange={setOpen} onSend={async () => ({ ok: true })}
      messages={[{ id: args.draft.id, role: "assistant", text: "Review your workflow, then publish when you're ready." }]}
      renderMessageSupplement={() => <WorkflowDraftCard {...args} />}
      renderBody={body => <WorkflowAutomationGuide examples={[{
        id: "reminder", name: "Flag unscheduled work", prompt: "Remind me if an approved estimate still needs a visit after one business day.",
      }]}>{body}</WorkflowAutomationGuide>}
    />;
  },
};

export const NotificationChoices: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inApp = canvas.getByRole("checkbox", { name: "In-app" }), email = canvas.getByRole("checkbox", { name: "Email" });
    await expect(inApp).toBeChecked(); await expect(email).toBeChecked();
    await userEvent.click(inApp); await userEvent.click(email);
    await expect(canvas.getByRole("button", { name: "Publish workflow" })).toBeDisabled();
    await expect(canvas.getByRole("alert")).toHaveTextContent("Choose at least one notification option.");
    await userEvent.click(email);
    await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
    await expect(args.onDecide).toHaveBeenCalledWith("confirm", { inApp: false, email: true }, "17:00");
    await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  },
};

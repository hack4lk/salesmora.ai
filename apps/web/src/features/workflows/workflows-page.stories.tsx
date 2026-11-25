import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";
import { WorkflowsPage } from "./workflows-page";

const reminder = "Notify the Office team if an approved estimate still needs a visit the next business day.";
const meta = {
  title: "Workflows/Workflows Page",
  component: WorkflowsPage,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: {
    rows: [{ id: "estimate-reminder", name: "Unscheduled estimate reminder", rule: reminder, status: "active", pendingCount: 0, allowedActions: ["pause", "delete"] }],
    onConfirm: fn(),
    onOpenAssistant: fn(),
  },
} satisfies Meta<typeof WorkflowsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [rows, setRows] = useState(args.rows);
    return (
      <>
        <WorkflowsPage {...args} rows={rows} onConfirm={async (row, action) => {
          await args.onConfirm(row, action);
          setRows((current) => action === "delete" ? current.filter(({ id }) => id !== row.id)
            : current.map((item) => item.id === row.id ? {
              ...item,
              status: action === "pause" ? "paused" : "active",
              allowedActions: [action === "pause" ? "resume" : "pause", "delete"],
            } : item));
        }} onOpenAssistant={() => {
          args.onOpenAssistant();
          setAssistantOpen(true);
        }} />
        <Dialog open={assistantOpen} onClose={() => setAssistantOpen(false)} aria-labelledby="workflow-assistant-preview" fullWidth maxWidth="md">
          <div className="bg-assistant-surface p-4 text-assistant-foreground">
            <div className="flex items-center justify-between gap-4">
              <h2 id="workflow-assistant-preview" className="m-0 text-lg font-semibold">Workflow assistant</h2>
              <button type="button" className="min-h-11 px-3" onClick={() => setAssistantOpen(false)}>Close</button>
            </div>
            <WorkflowAutomationGuide examples={[{ id: "estimate-reminder", name: "Flag unscheduled work", prompt: reminder }]}>
              <label className="grid gap-2 p-4 text-sm">
                Describe a workflow
                <textarea className="rounded-lg border border-assistant-border p-3" />
              </label>
            </WorkflowAutomationGuide>
          </div>
        </Dialog>
      </>
    );
  },
};

export const PageInteractions: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("heading", { name: "Workflows" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Unscheduled estimate reminder" }));
    const detail = await screen.findByRole("dialog", { name: "Unscheduled estimate reminder" });
    await waitFor(() => expect(within(detail).getByText(reminder)).toBeVisible());
    await userEvent.click(within(detail).getByRole("button", { name: "Close" }));
    await userEvent.click(canvas.getByRole("button", { name: "Open assistant" }));
    const assistant = await screen.findByRole("dialog", { name: "Workflow assistant" });
    await userEvent.click(within(assistant).getByRole("button", { name: "What can I automate?" }));
    await expect(within(assistant).getByText("Flag unscheduled work")).toBeVisible();
  },
};

export const Empty: Story = { ...Default, args: { rows: [] } };

export const ServiceUnavailable: Story = {
  args: { rows: [], unavailableReason: "Workflow automation is coming soon." },
};

export const PremiumUsage: Story = {
  args: { capacity: { plan: 'premium', used: 8, limit: 25, canManageBilling: true } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Use authoritative capacity, including workflows outside this sample row fixture.
    await expect(c.getByRole('status', { name: '8 of 25 workflows created' })).toHaveTextContent('8 / 25 workflows');
  },
};
export const StandardUsage: Story = {
  args: { capacity: { plan: 'standard', used: 4, limit: 10, canManageBilling: true } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status', { name: '4 of 10 workflows created' })).toBeVisible(); },
};
export const FreeUsage: Story = {
  args: { rows: [], capacity: { plan: 'free', used: 0, limit: 2, canManageBilling: true } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status', { name: '0 of 2 workflows created' })).toBeVisible(); },
};
export const UsageAtLimit: Story = {
  args: { capacity: { plan: 'premium', used: 25, limit: 25, canManageBilling: true } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status', { name: '25 of 25 workflows created' })).toBeVisible(); },
};
export const MobileUsage: Story = { ...PremiumUsage, globals: { viewport: { value: 'phone', isRotated: false } } };

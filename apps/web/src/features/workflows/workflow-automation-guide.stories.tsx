import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { workflowRecipeSchema } from "@salesmora/contracts";
import { automationExamplesFor } from "./workflow-automation-examples";
import { AssistantPanel } from "@salesmora/ui";
import { WorkflowAutomationGuide } from "./workflow-automation-guide";

const meta = {
  title: "Workflows/Automation Guide",
  component: WorkflowAutomationGuide,
  args: {
    examples: automationExamplesFor(workflowRecipeSchema.options),
    limitation: "These workflows notify your team. Customer emails require a separate review and send.",
    children: (
      <label className="grid gap-2 p-4 text-sm">
        Describe a workflow
        <textarea className="rounded-lg border border-line p-3" />
      </label>
    ),
  },
} satisfies Meta<typeof WorkflowAutomationGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const draft = canvas.getByRole("textbox", { name: "Describe a workflow" });
    await userEvent.type(draft, "Send a weekly briefing");
    const guide = canvas.getByRole("button", { name: "What can I automate?" });
    await userEvent.click(guide);
    const list = within(canvas.getByRole("complementary", { name: "What can I automate?" }));
    await expect(list.getAllByRole("listitem")).toHaveLength(19);
    for (const example of automationExamplesFor(workflowRecipeSchema.options)) {
      await expect(list.getByText(example.name, { exact: true })).toBeInTheDocument();
      await expect(list.getByText(`“${example.prompt}”`, { exact: true })).toBeInTheDocument();
    }
    await userEvent.click(list.getByRole("button", { name: "Back to chat" }));
    await expect(draft).toHaveValue("Send a weekly briefing");
  },
};

export const NoAvailableAutomations: Story = {
  args: { examples: [], limitation: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "What can I automate?" }));
    await expect(canvas.getByText("No automations are available in this workspace.")).toBeVisible();
  },
};

export const ScrollableList: Story = {
  args: {
    examples: Array.from({ length: 18 }, (_, index) => ({ id: `example-${index}`, name: `Reminder example ${index + 1}`, prompt: "Remind me at 8 AM if a new lead is still unassigned after one business day." })),
  },
  render: args => <AssistantPanel open onOpenChange={fn()} title="Create a workflow" description="Describe what you want to automate." onSend={async () => ({ ok: true })}
    renderBody={body => <WorkflowAutomationGuide {...args}>{body}</WorkflowAutomationGuide>} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "What can I automate?" }));
    const region = canvas.getByRole("region", { name: "Available automations" });
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    await expect(getComputedStyle(region).overflowY).toBe("auto");
    await expect(getComputedStyle(region).overscrollBehaviorY).toBe("contain");
    const dialog = region.closest("dialog")!;
    const dialogScrollTop = dialog.scrollTop;
    region.scrollTop = region.scrollHeight;
    await expect(region.scrollTop).toBeGreaterThan(0);
    await expect(dialog.scrollTop).toBe(dialogScrollTop);
    const back = canvas.getByRole("button", { name: "Back to chat" });
    await expect(back).toBeVisible();
    await userEvent.click(back);
    await expect(canvas.getByRole("button", { name: "What can I automate?" })).toHaveFocus();
  },
};

export const MobileScrollableList: Story = { ...ScrollableList, globals: { viewport: { value: "phone", isRotated: false } } };

export const AvailableRecipesOnly: Story = {
  args: { examples: automationExamplesFor(['annual_service_review', 'lead_routing']) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'What can I automate?' }));
    const list = within(c.getByRole('region', { name: 'Available automations' }));
    await expect(list.getAllByRole('listitem')).toHaveLength(4);
    await expect(list.getByText('Review customers on a chosen date')).toBeVisible();
    await expect(list.queryByText('Book new jobs automatically')).not.toBeInTheDocument();
  },
};

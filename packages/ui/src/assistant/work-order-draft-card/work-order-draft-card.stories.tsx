import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkOrderDraftCard, type WorkOrderDraftProposal } from "./work-order-draft-card";
import { workOrderDraftCardData as copy, workOrderDraftFixtures as fixtures } from "./work-order-draft-card.data";
const draft: WorkOrderDraftProposal = {
  id: "work-order-proposal",
  action: "schedule",
  workOrder: fixtures.workOrder,
  changes: [fixtures.schedule, fixtures.assignee],
  state: "pending",
  expiresAt: new Date(Date.now() + 900000).toISOString(),
};
const meta = {
  title: "Assistant/WorkOrderDraftCard",
  component: WorkOrderDraftCard,
  args: { draft, onDecide: fn(async () => {}), onOpen: fn() },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm text-muted">{fixtures.notice}</p>
        <Story />
      </main>
    ),
  ],
  render: function Preview(args) {
    const [state, setState] = useState(args.draft.state);
    return (
      <WorkOrderDraftCard
        {...args}
        draft={{ ...args.draft, state }}
        onDecide={async (proposal, decision) => {
          await args.onDecide!(proposal, decision);
          setState(decision === "confirm" ? "confirmed" : "canceled");
        }}
      />
    );
  },
} satisfies Meta<typeof WorkOrderDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pending: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: copy.confirm }));
    await expect(args.onDecide).toHaveBeenCalled();
    await expect(await canvas.findByText(copy.states.confirmed)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: copy.open }));
  },
};
export const WithWarnings: Story = {
  args: { draft: { ...draft, action: "issue", changes: [fixtures.status], warnings: [fixtures.warning], impact: fixtures.impact } },
};
export const Canceled: Story = { args: { draft: { ...draft, state: "canceled" } }, render: undefined };
export const Expired: Story = { args: { draft: { ...draft, state: "expired" } }, render: undefined };
export const Stale: Story = { args: { draft: { ...draft, state: "stale" } }, render: undefined };
export const Export: Story = {
  args: { draft: { ...draft, action: "export", changes: [], count: 128, columns: fixtures.columns } },
};

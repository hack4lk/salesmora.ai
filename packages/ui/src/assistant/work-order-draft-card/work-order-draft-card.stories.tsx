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

const catalogItem = { number: "WIRE-12", title: "12/2 Romex wire" };
export const CatalogItemCreate: Story = {
  args: {
    draft: { ...draft, action: "material-create", workOrder: catalogItem,
      changes: [{ label: "Name", before: "", after: "12/2 Romex wire" }, { label: "Unit", before: "", after: "ft" }, { label: "Price per unit", before: "", after: "$1.25" }],
      impact: "The item is added to the catalog and can be used on work orders right away." } as WorkOrderDraftProposal,
  },
  render: undefined,
};
export const CatalogItemPropose: Story = {
  args: { draft: { ...draft, action: "material-propose", workOrder: catalogItem, changes: [{ label: "Name", before: "", after: "12/2 Romex wire" }],
    impact: "This is submitted as a proposal. An owner or admin must approve it before it can be used on work orders." } },
  render: undefined,
};
export const CatalogItemEdit: Story = {
  args: { draft: { ...draft, action: "material-edit", workOrder: catalogItem, changes: [{ label: "Price per unit", before: "$1.25", after: "$1.40" }],
    impact: "Work orders that already use this item keep the price they were added with." } },
  render: undefined,
};
export const CatalogItemArchive: Story = {
  args: { draft: { ...draft, action: "material-archive", workOrder: catalogItem, changes: [{ label: "Status", before: "Active", after: "Archived" }] } },
  render: undefined,
};
export const CatalogExport: Story = {
  args: { draft: { ...draft, action: "material-export", workOrder: { number: "CSV export", title: "Active catalog items" }, count: 42,
    columns: ["Name", "SKU", "Unit", "Category", "Supplier", "Status"], changes: [{ label: "Rows", before: "", after: "42" }], impact: "All active items · Category: Wire" } },
  render: undefined,
};

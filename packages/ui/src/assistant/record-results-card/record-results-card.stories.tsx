import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { RecordResultsCard } from "./record-results-card";
import { customerDraftFixtures as fixtures } from "../customer-draft-card/customer-draft-card.data";
const rows = Array.from({ length: 12 }, (_, i) => ({
  id: `customer-${i}`,
  name: fixtures.customer.name,
  number: `CU-${2018 + i}`,
  detail: fixtures.customerDetail,
}));
const meta = {
  title: "Assistant/RecordResultsCard",
  component: RecordResultsCard,
  args: {
    kind: "customers",
    records: rows,
    total: 42,
    onOpen: fn(),
    onOpenList: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4">
        <p className="text-sm text-muted">{fixtures.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof RecordResultsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("listitem")).toHaveLength(
      10,
    );
  },
};
export const One: Story = { args: { records: rows.slice(0, 1), total: 1 } };
export const None: Story = { args: { records: [], total: 0 } };
export const Leads: Story = {
  args: {
    kind: "leads",
    records: [
      {
        id: "lead-1",
        name: fixtures.leadName,
        number: fixtures.leadNumber,
        detail: fixtures.leadDetail,
      },
    ],
    total: 1,
  },
};
export const OpenRecord: Story = {
  ...One,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button")[0]);
    await expect(args.onOpen).toHaveBeenCalledWith(rows[0].id);
  },
};

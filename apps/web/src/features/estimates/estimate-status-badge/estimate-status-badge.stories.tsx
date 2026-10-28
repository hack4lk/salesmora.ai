import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { estimateStatuses } from "../estimate-preview.types";
import { EstimateStatusBadge } from "./estimate-status-badge";
import { estimateStatusBadgeData as copy } from "./estimate-status-badge.data";

const meta = {
  title: "Estimates/EstimateStatusBadge",
  component: EstimateStatusBadge,
  args: { status: "draft" },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-canvas p-6">
        <h1 className="m-0 text-xl font-semibold text-ink">
          {copy.stories.title}
        </h1>
        <p className="mb-6 text-sm text-muted">{copy.stories.description}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimateStatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {estimateStatuses.map((status) => (
        <EstimateStatusBadge key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const status of estimateStatuses)
      await expect(
        canvas.getByText(copy.statuses[status].label, { exact: true }),
      ).toBeVisible();
  },
};
export const Sent: Story = { args: { status: "sent" } };
export const Published: Story = { args: { status: "published" } };
export const Accepted: Story = { args: { status: "accepted" } };
export const Declined: Story = { args: { status: "declined" } };
export const Archived: Story = {
  args: { status: "declined", archived: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(copy.archived)).toBeVisible();
  },
};
export const InEstimateSummary: Story = {
  args: { status: "sent" },
  render: (args) => (
    <section className="max-w-sm rounded-xl border border-line bg-white p-4">
      <p className="m-0 text-sm text-muted">{copy.stories.customer}</p>
      <h2 className="my-2 text-lg font-semibold text-ink">
        {copy.stories.estimate}
      </h2>
      <p className="text-sm text-muted">{copy.stories.label}</p>
      <EstimateStatusBadge {...args} />
      <p className="mb-0 mt-3 text-sm text-muted">{copy.stories.next}</p>
    </section>
  ),
};

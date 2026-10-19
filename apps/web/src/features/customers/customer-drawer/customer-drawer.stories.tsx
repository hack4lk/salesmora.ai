import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { CustomerDrawer } from "./customer-drawer";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
  customerOwnerCapabilities as owner,
  customerFieldCapabilities as field,
  customerLinkedLeads as leads,
  customerEvents as events,
  customerFutureJobs as jobs,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerDrawer",
  component: CustomerDrawer,
  args: {
    open: true,
    customer: rows[0],
    members,
    capabilities: owner,
    leads: leads.slice(0, 2),
    events,
    onClose: fn(),
    onEdit: fn(),
    onProfile: fn(),
    onOpenRecord: fn(),
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">
          {preview.notice}
        </p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CustomerDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EmptyLinks: Story = { args: { leads: [], events: [] } };
export const ManyLeads: Story = {
  args: {
    leads: Array.from({ length: 20 }, (_, i) => ({
      ...leads[i % 3],
      id: `lead-${i}`,
      number: `LD-${i + 1}`,
    })),
  },
};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Archived: Story = {
  args: { customer: { ...rows[0], archived: true } },
};
export const PermissionLost: Story = {
  args: { capabilities: field },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement.ownerDocument.body);
    await expect(c.queryByText(rows[0].email)).not.toBeInTheDocument();
  },
};
export const FutureJobs: Story = { args: { jobs } };

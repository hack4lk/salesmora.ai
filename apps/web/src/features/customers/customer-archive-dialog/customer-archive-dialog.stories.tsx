import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CustomerArchiveDialog } from "./customer-archive-dialog";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerArchiveDialog",
  component: CustomerArchiveDialog,
  args: {
    open: true,
    name: rows[0].name,
    onClose: fn(),
    onConfirm: fn(async () => {}),
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
} satisfies Meta<typeof CustomerArchiveDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const OpenLeads: Story = { args: { openLeads: 3 } };
export const Restore: Story = { args: { restoring: true } };
export const FutureActiveJobs: Story = { args: { activeJobs: 2 } };
export const Pending: Story = { args: { pending: true } };
export const Error: Story = { args: { error: preview.mockFailure } };

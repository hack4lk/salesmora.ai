import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LinkedRecordList } from "./linked-record-list";
import {
  customerPreviewData as preview,
  customerLinkedLeads as leads,
  customerFutureJobs as jobs,
} from "../customer-preview.data";
import { linkedRecordListData as copy } from "./linked-record-list.data";
const meta = {
  title: "Customers/LinkedRecordList",
  component: LinkedRecordList,
  args: { records: leads.slice(0, 2), onOpen: fn() },
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
} satisfies Meta<typeof LinkedRecordList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { records: [] } };
export const Overflow: Story = { args: { total: 42, onViewAll: fn() } };
export const Unlink: Story = { args: { onUnlink: fn() } };
export const FutureJobs: Story = {
  args: { records: jobs, title: copy.jobs },
  render: (args) => (
    <>
      <p className="text-sm text-muted">{preview.future}</p>
      <LinkedRecordList {...args} />
    </>
  ),
};

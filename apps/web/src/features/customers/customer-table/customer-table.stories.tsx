import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CustomerTable } from "./customer-table";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerManyFixtures as manyRows,
  customerMembers as members,
  customerOwnerCapabilities as owner,
  customerOfficeCapabilities as office,
  customerReadOnlyCapabilities as readOnly,
  customerFieldCapabilities as field,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerTable",
  component: CustomerTable,
  args: {
    rows: rows.slice(0, 6),
    now: preview.now,
    members,
    capabilities: owner,
    onOpen: fn(),
    onAction: fn(),
    onOpenLeads: fn(),
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
} satisfies Meta<typeof CustomerTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const OneRow: Story = { args: { rows: [rows[0]] } };
export const OneHundredRows: Story = { args: { rows: manyRows.slice(0, 100) } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { rows: [] } };
export const MissingContact: Story = {
  args: { rows: [{ ...rows[0], email: "", phone: "", ownerId: "" }] },
};
export const LongIdentity: Story = {
  args: {
    rows: [
      {
        ...rows[0],
        name: preview.longName,
        email: preview.longEmail,
        type: "business",
      },
    ],
  },
};
export const Office: Story = { args: { capabilities: office } };
export const ReadOnly: Story = { args: { capabilities: readOnly } };
export const Field: Story = { args: { capabilities: field } };
export const FutureJobs: Story = {
  render: (args) => (
    <>
      <p className="text-sm text-muted">{preview.future}</p>
      <CustomerTable {...args} />
    </>
  ),
  args: {
    jobsAvailable: true,
    rows: rows.slice(0, 3).map((row) => ({ ...row, activeJobCount: 1 })),
  },
};

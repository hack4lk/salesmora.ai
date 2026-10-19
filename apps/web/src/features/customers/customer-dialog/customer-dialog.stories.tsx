import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CustomerDialog } from "./customer-dialog";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
  emptyCustomer,
} from "../customer-preview.data";
const meta = {
  title: "Customers/CustomerDialog",
  component: CustomerDialog,
  args: {
    open: true,
    value: emptyCustomer,
    members,
    onChange: fn(),
    onSubmit: fn(async () => {}),
    onClose: fn(),
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
  render: function Preview(args) {
    const [value, setValue] = useState(args.value);
    return <CustomerDialog {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof CustomerDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Edit: Story = { args: { editing: true, value: rows[0] } };
export const Saving: Story = { args: { pending: true, value: rows[0] } };
export const Duplicate: Story = {
  args: {
    value: rows[0],
    matches: [
      {
        id: rows[0].id,
        name: rows[0].name,
        number: rows[0].number,
        reason: "email",
      },
    ],
    onUseExisting: fn(),
    onCreateAnyway: fn(),
  },
};
export const Error: Story = { args: { error: preview.mockFailure } };
export const Conflict: Story = {
  args: { conflict: true, value: rows[0], onReload: fn() },
};

export const ManualOnly: Story = {};

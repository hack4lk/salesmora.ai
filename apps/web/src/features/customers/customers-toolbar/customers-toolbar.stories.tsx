import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomersToolbar } from "./customers-toolbar";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
} from "../customer-preview.data";
import { defaultCustomerFilters } from "./customers-toolbar";
const meta = {
  title: "Customers/CustomersToolbar",
  component: CustomersToolbar,
  args: {
    value: defaultCustomerFilters,
    members,
    count: 7,
    canArchive: true,
    onChange: fn(),
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
    return (
      <CustomersToolbar
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof CustomersToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filtered: Story = {
  args: {
    value: {
      ...defaultCustomerFilters,
      search: rows[0].name,
      relationship: "lead",
      owner: members[0].id,
      type: "person",
      archived: true,
    },
    count: 1,
  },
};
export const NoResults: Story = { args: { count: 0 } };
export const Disabled: Story = { args: { disabled: true } };
export const Office: Story = { args: { canArchive: false } };
export const FutureJobs: Story = {
  args: { jobsAvailable: true },
  render: (args) => (
    <>
      <p className="text-sm text-muted">{preview.future}</p>
      <CustomersToolbar {...args} />
    </>
  ),
};
export const SearchAndClear: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("searchbox"), rows[0].name);
    await expect(c.getByRole("searchbox")).toHaveValue(rows[0].name);
    await userEvent.click(c.getByRole("button", { name: "Clear all" }));
    await expect(c.getByRole("searchbox")).toHaveValue("");
  },
};

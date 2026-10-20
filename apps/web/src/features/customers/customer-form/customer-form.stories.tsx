import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerForm } from "./customer-form";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
  emptyCustomer,
} from "../customer-preview.data";
import { customerFormData as copy } from "./customer-form.data";
const meta = {
  title: "Customers/CustomerForm",
  component: CustomerForm,
  args: {
    value: emptyCustomer,
    members,
    onChange: fn(),
    onSubmit: fn(async () => {}),
    onCancel: fn(),
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
      <CustomerForm
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof CustomerForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filled: Story = { args: { value: rows[0], editing: true } };
export const Business: Story = { args: { value: rows[2], editing: true } };
export const MoreDetails: Story = { args: { value: rows[0], moreOpen: true } };
export const Saving: Story = { args: { value: rows[0], pending: true } };
export const Error: Story = {
  args: { value: rows[0], error: preview.mockFailure },
};
export const Conflict: Story = {
  args: { value: rows[0], conflict: true, onReload: fn() },
};
export const PermissionLost: Story = {
  args: { value: rows[0], disabled: true },
};
export const RequiredName: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.add }));
    await expect(c.getByText(copy.nameError)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const InvalidContact: Story = {
  args: {
    value: {
      ...emptyCustomer,
      name: rows[0].name,
      email: "invalid",
      phone: "abc",
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.add }));
    await expect(c.getByText(copy.emailError)).toBeVisible();
    await expect(c.getByText(copy.phoneError)).toBeVisible();
  },
};
export const SaveFailure: Story = {
  args: {
    value: rows[0],
    onSubmit: fn(async () => {
      throw new globalThis.Error("preview");
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.add }));
    await expect(c.getByRole("alert")).toBeVisible();
    await expect(c.getByRole("textbox", { name: /^Full name/ })).toHaveValue(
      rows[0].name,
    );
  },
};

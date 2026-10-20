import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerDeleteDialog } from "./customer-delete-dialog";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerDeleteDialog",
  component: CustomerDeleteDialog,
  args: {
    open: true,
    customerId: rows[0].id,
    name: rows[0].name,
    number: rows[0].number,
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
} satisfies Meta<typeof CustomerDeleteDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const OpenLeads: Story = { args: { openLeads: 2 } };
export const BlockedByActiveJobs: Story = {
  args: { activeJobs: 2, openLeads: 2 },
};
export const Pending: Story = { args: { pending: true } };
export const Error: Story = { args: { error: preview.mockFailure } };
export const TypedConfirmation: Story = {
  args: { openLeads: 2 },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement.ownerDocument.body),
      button = c.getByRole("button", { name: "Delete customer" });
    await expect(button).toBeDisabled();
    await userEvent.type(c.getByRole("textbox"), rows[0].number);
    await expect(button).toBeDisabled();
    await userEvent.click(c.getByRole("checkbox"));
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

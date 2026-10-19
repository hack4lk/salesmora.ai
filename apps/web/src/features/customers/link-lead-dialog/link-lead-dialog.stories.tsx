import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { LinkLeadDialog } from "./link-lead-dialog";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerLinkedLeads as leads,
} from "../customer-preview.data";

const meta = {
  title: "Customers/LinkLeadDialog",
  component: LinkLeadDialog,
  args: {
    open: true,
    customerName: rows[0].name,
    records: leads,
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
} satisfies Meta<typeof LinkLeadDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoResults: Story = { args: { records: [] } };
export const Unlink: Story = { args: { unlinking: leads[0] } };
export const Pending: Story = { args: { pending: true } };
export const Error: Story = { args: { error: preview.mockFailure } };
export const LinkedElsewhere: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getAllByRole("radio")[2]);
    const button = c.getByRole("button", { name: "Link lead" });
    await expect(button).toBeDisabled();
    await userEvent.click(c.getByRole("checkbox"));
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onConfirm).toHaveBeenCalledWith(leads[2], true);
  },
};

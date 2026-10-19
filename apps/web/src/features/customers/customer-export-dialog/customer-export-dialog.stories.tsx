import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerExportDialog } from "./customer-export-dialog";
import { customerPreviewData as preview } from "../customer-preview.data";
import { customerExportDialogData as copy } from "./customer-export-dialog.data";
const meta = {
  title: "Customers/CustomerExportDialog",
  component: CustomerExportDialog,
  args: {
    open: true,
    count: 7,
    scope: copy.all,
    canExport: true,
    onClose: fn(),
    onExport: fn(async () => {}),
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
} satisfies Meta<typeof CustomerExportDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filtered: Story = { args: { count: 3, scope: copy.filtered } };
export const Zero: Story = { args: { count: 0 } };
export const Forbidden: Story = { args: { canExport: false } };
export const OverLimit: Story = { args: { count: 50001 } };
export const Error: Story = { args: { error: preview.mockFailure } };
export const NoColumns: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement.ownerDocument.body);
    for (const box of c.getAllByRole("checkbox")) await userEvent.click(box);
    await expect(c.getByRole("button", { name: copy.download })).toBeDisabled();
  },
};

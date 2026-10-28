import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { estimateExportColumns } from "@salesmora/contracts";
import { estimatePreviewData as preview } from "../estimate-preview.data";
import { EstimateExportDialog } from "./estimate-export-dialog";
import { estimateExportDialogData as copy } from "./estimate-export-dialog.data";

const meta = {
  title: "Estimates/EstimateExportDialog",
  component: EstimateExportDialog,
  args: {
    open: true,
    count: 8,
    scope: copy.all,
    canExport: true,
    onClose: fn(),
    onExport: fn(async () => {}),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimateExportDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(
      estimateExportColumns.length,
    );
    for (const box of canvas.getAllByRole("checkbox")) {
      await expect(box).toBeChecked();
    }
  },
};
export const Filtered: Story = { args: { count: 3, scope: copy.filtered } };
export const Zero: Story = { args: { count: 0 } };
export const Forbidden: Story = { args: { canExport: false } };
export const OverLimit: Story = { args: { count: 50001 } };
export const ConfiguredLimit: Story = {
  args: { count: 3, rowLimit: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.limit(2));
    await expect(
      canvas.getByRole("button", { name: copy.download }),
    ).toBeDisabled();
  },
};
export const Error: Story = { args: { error: "Export could not be prepared." } };
export const NoColumns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    for (const box of canvas.getAllByRole("checkbox")) await userEvent.click(box);
    await expect(
      canvas.getByRole("button", { name: copy.download }),
    ).toBeDisabled();
  },
};
export const DownloadSelectedColumns: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("checkbox", { name: copy.columns.name }));
    await userEvent.click(canvas.getByRole("button", { name: copy.download }));
    await expect(args.onExport).toHaveBeenCalledWith(
      estimateExportColumns.filter((column) => column !== "name"),
    );
  },
};

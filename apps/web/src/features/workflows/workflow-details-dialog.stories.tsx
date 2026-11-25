import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkflowDetailsDialog } from "./workflow-details-dialog";

const meta = {
  title: "Workflows/Workflow Details", component: WorkflowDetailsDialog,
  args: { row: { id: "reminder", version: 1, name: "Approved work needs a visit", rule: "Notify Ava after two business days.",
    status: "active", pendingCount: 0, canRunNow: true, allowedActions: ["pause", "delete"], notifications: { inApp: true, email: true } },
    onClose: fn(), onSaveNotifications: fn(async () => {}),
  },
} satisfies Meta<typeof WorkflowDetailsDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ChangeChannels: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  const inApp = dialog.getByRole("checkbox", { name: "In-app" }), email = dialog.getByRole("checkbox", { name: "Email" });
  await expect(inApp).toBeChecked(); await expect(email).toBeChecked();
  await expect(dialog.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await userEvent.click(inApp); await userEvent.click(email);
  await expect(dialog.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await userEvent.click(email);
  await userEvent.click(dialog.getByRole("button", { name: "Save changes" }));
  await expect(args.onSaveNotifications).toHaveBeenCalledWith(args.row, { inApp: false, email: true });
  await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const ViewOnly: Story = { args: { row: { ...meta.args.row, canRunNow: false, allowedActions: [] } }, play: async ({ canvasElement }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  await expect(dialog.getByRole("checkbox", { name: "Email" })).toBeDisabled();
  await expect(dialog.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
} };
export const SaveFailure: Story = { args: { onSaveNotifications: fn(async () => { throw new Error("Unavailable"); }) }, play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  await userEvent.click(dialog.getByRole("checkbox", { name: "Email" }));
  await userEvent.click(dialog.getByRole("button", { name: "Save changes" }));
  await expect(await dialog.findByRole("alert")).toHaveTextContent("Couldn't save notification options.");
  await expect(args.onClose).not.toHaveBeenCalled();
} };

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import type { WorkflowEditData } from "@salesmora/contracts";
import { WorkflowEditDialog } from "./workflow-edit-dialog";

const data: WorkflowEditData = { workflow: { id: "00000000-0000-4000-8000-000000000061", workspaceId: "00000000-0000-4000-8000-000000000062",
  name: "Estimate follow-up", version: 3, status: "active", definition: { kind: "estimate_follow_up", businessDays: 2, localTime: "17:00",
    recipientId: "ava", recipientName: "Ava Morgan", timezone: "America/New_York", notifications: { inApp: true, email: true } } },
  recipients: [{ id: "ava", name: "Ava Morgan" }, { id: "morgan", name: "Morgan Ellis" }] };
const row = { id: data.workflow.id, version: 3, name: data.workflow.name, rule: "Follow up on sent estimates.", status: "active" as const,
  pendingCount: 4, allowedActions: ["pause", "delete"] as const, canEdit: true };
const meta = { title: "Workflows/Workflow Edit", component: WorkflowEditDialog,
  args: { row, onLoadEdit: fn(async () => data), onSaveEdit: fn(async () => {}), onClose: fn(), onAskAssistant: fn() },
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return open ? <WorkflowEditDialog {...args} onClose={() => { args.onClose(); setOpen(false); }} /> : <p role="status">Editor closed.</p>;
  },
} satisfies Meta<typeof WorkflowEditDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  await expect(await dialog.findByLabelText("Name")).toHaveValue("Estimate follow-up");
  await expect(dialog.getByLabelText("Recipient")).toHaveValue("ava");
  await expect(dialog.getByLabelText("Delay (business days)")).toHaveValue(2);
  await expect(dialog.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await expect(args.onLoadEdit).toHaveBeenCalledTimes(1);
} };
export const SaveChanges: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  const name = await dialog.findByLabelText("Name"); await userEvent.clear(name); await userEvent.type(name, "Office follow-up");
  await userEvent.selectOptions(dialog.getByLabelText("Recipient"), "morgan");
  fireEvent.change(dialog.getByLabelText("Send at"), { target: { value: "08:15" } });
  fireEvent.change(dialog.getByLabelText("Delay (business days)"), { target: { value: "3" } });
  await userEvent.click(dialog.getByRole("checkbox", { name: "Email" }));
  await expect(dialog.getByText(/Notify Morgan Ellis at 8:15 AM after 3 business days/)).toBeVisible();
  await userEvent.click(dialog.getByRole("button", { name: "Save changes" }));
  await expect(args.onSaveEdit).toHaveBeenCalledTimes(1);
  await expect(args.onSaveEdit).toHaveBeenCalledWith(row, { name: "Office follow-up", localTime: "08:15", businessDays: 3,
    recipientId: "morgan", notifications: { inApp: true, email: false } }, expect.stringMatching(/^[a-f0-9-]{36}$/));
  await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog")); await dialog.findByLabelText("Name");
  await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
  await expect(args.onSaveEdit).not.toHaveBeenCalled(); await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const InvalidDelay: Story = { play: async ({ canvasElement }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog")); await dialog.findByLabelText("Name");
  fireEvent.change(dialog.getByLabelText("Delay (business days)"), { target: { value: "0" } });
  await expect(dialog.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await expect(dialog.getByRole("alert")).toBeVisible();
} };
export const SaveFailure: Story = { args: { onSaveEdit: fn(async () => { throw Error("Changed workflow"); }) }, play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  const name = await dialog.findByLabelText("Name"); await userEvent.type(name, " revised");
  await userEvent.click(dialog.getByRole("button", { name: "Save changes" }));
  await expect(await dialog.findByRole("alert")).toHaveTextContent("Couldn't save these changes.");
  await expect(name).toHaveValue("Estimate follow-up revised"); await expect(args.onLoadEdit).toHaveBeenCalledTimes(1);
} };
export const Paused: Story = { args: { row: { ...row, status: "paused", allowedActions: ["resume", "delete"] },
  onLoadEdit: fn(async () => ({ ...data, workflow: { ...data.workflow, status: "paused" as const } })) },
play: async ({ canvasElement }) => { const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog"));
  await expect(await dialog.findByText(/This workflow will stay paused/)).toBeVisible(); } };
export const AskAssistant: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("dialog")); await dialog.findByLabelText("Name");
  await userEvent.click(dialog.getByRole("button", { name: "Ask assistant" }));
  await expect(args.onAskAssistant).toHaveBeenCalledWith(expect.stringContaining(data.workflow.id));
  await expect(args.onSaveEdit).not.toHaveBeenCalled();
} };
export const Mobile: Story = { ...Default, globals: { viewport: { value: "phone", isRotated: false } } };

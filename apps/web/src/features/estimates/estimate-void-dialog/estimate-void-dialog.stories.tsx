import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { estimateButton } from "../estimate-ui";
import { EstimateVoidDialog, type EstimateVoidDialogProps } from "./estimate-void-dialog";
import { estimateVoidDialogData as c, estimateVoidFixture as estimate } from "./estimate-void-dialog.data";
import { initialEstimateVoidValues, type EstimateVoidValues } from "./estimate-void-dialog.preview";

const value: EstimateVoidValues = { ...initialEstimateVoidValues(estimate), reason: c.stories.reason };
const confirm = fn(async () => {});
const change = fn();
const reload = fn(async () => {});

function VoidPreview(args: EstimateVoidDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [current, setCurrent] = useState(args.value);
  const [requested, setRequested] = useState(false);
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => { setCurrent(args.value); setRequested(false); setOpen(true); }}>{c.stories.open}</button>
    <EstimateVoidDialog {...args} open={open} value={current}
      onChange={(next) => { setCurrent(next); args.onChange(next); }}
      onClose={() => { setOpen(false); args.onClose(); }}
      onConfirm={args.onConfirm ? async (request) => { await args.onConfirm?.(request); setRequested(true); } : undefined} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function ChangedPreview(args: EstimateVoidDialogProps & { change: "read" | "version" | "permission" | "status" }) {
  const [current, setCurrent] = useState(args.value);
  const [changed, setChanged] = useState(false);
  return <EstimateVoidDialog {...args} value={current}
    estimate={changed && args.change === "version" ? { ...args.estimate, version: args.estimate.version + 1 }
      : changed && args.change === "status" ? { ...args.estimate, status: "accepted" } : args.estimate}
    capabilities={changed && args.change === "read" ? { ...args.capabilities, read: false }
      : changed && args.change === "permission" ? { ...args.capabilities, void: false } : args.capabilities}
    onChange={(next) => { args.onChange(next); setCurrent(next); setChanged(true); }} />;
}
function ReloadPreview(args: EstimateVoidDialogProps) {
  const [record, setRecord] = useState(args.estimate);
  const [current, setCurrent] = useState(args.value);
  const [conflict, setConflict] = useState(true);
  return <EstimateVoidDialog {...args} estimate={record} value={current} onChange={setCurrent}
    error={conflict ? { kind: "conflict", message: c.stories.conflict } : undefined}
    onReload={async () => {
      await reload();
      const next = { ...record, version: record.version + 1 };
      setRecord(next); setCurrent({ ...current, expectedVersion: next.version }); setConflict(false);
    }} />;
}
function HostWithdrawnPreview(args: EstimateVoidDialogProps) {
  const [record, setRecord] = useState(args.estimate);
  return <EstimateVoidDialog {...args} estimate={record} onConfirm={async (request) => {
    await args.onConfirm?.(request);
    setRecord({ ...record, status: "void", version: record.version + 1 });
  }} />;
}

const meta = {
  title: "Estimates/EstimateVoidDialog",
  component: EstimateVoidDialog,
  args: { open: true, estimate, capabilities: roles.owner, value, onChange: change, onClose: fn(), onConfirm: confirm },
  render: (args) => <VoidPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateVoidDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
function body(element: HTMLElement) { return within(element.ownerDocument.body); }
async function dialog(element: HTMLElement) {
  const root = await body(element).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
async function blocked(element: HTMLElement, message: string) {
  const canvas = await dialog(element);
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(canvas.getByText(message, { exact: false })).toBeVisible();
}
const reasonField = { name: new RegExp(c.reason) };

export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(estimate.name)).toBeVisible();
    await expect(canvas.getByText(c.linkEffect)).toBeVisible();
    await expect(canvas.getByText(c.recordEffect)).toBeVisible();
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
  },
};
export const Published: Story = { args: { estimate: { ...estimate, status: "published" } }, play: Sent.play };
export const Interactive: Story = { args: { open: false, value: initialEstimateVoidValues(estimate) } };
export const ConfirmRequestOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(value);
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.sent.label)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.requested);
  },
};
export const HostSuppliesWithdrawnRecord: Story = {
  render: (args) => <HostWithdrawnPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await blocked(canvasElement, c.errors.status);
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.void.label)).toBeVisible();
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
  },
};
export const EmptyReason: Story = {
  args: { value: initialEstimateVoidValues(estimate) },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.reason); },
};
export const WhitespaceReason: Story = { args: { value: { ...value, reason: " \n\t " } }, play: EmptyReason.play };
export const MaximumReason: Story = {
  args: { value: { ...value, reason: "x".repeat(c.limit) } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveAttribute("maxlength", String(c.limit));
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(canvas.getByText(new RegExp(c.count(c.limit)))).toBeVisible();
  },
};
export const OverLimitReason: Story = {
  args: { value: { ...value, reason: "x".repeat(c.limit + 1) } }, play: EmptyReason.play,
};
export const EditReason: Story = {
  args: EmptyReason.args,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: `  ${c.stories.reason}  ` } });
    await expect(change).toHaveBeenCalledWith({ ...value, reason: `  ${c.stories.reason}  ` });
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith(value);
  },
};
export const LiteralMultilineReason: Story = {
  args: { value: { ...value, reason: c.stories.literal } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(c.stories.literal);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...value, reason: c.stories.literal });
  },
};
export const EnterAddsNewline: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("textbox", reasonField));
    await userEvent.keyboard("{End}{Enter}");
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(`${value.reason}\n`);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Sent.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Sent.play };
export const NoVoidPermission: Story = {
  args: { capabilities: { ...roles.owner, void: false } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.errors.permission);
    await expect(canvas.getByRole("textbox", reasonField)).toBeDisabled();
  },
};
export const FieldNoVoidGrant: Story = { args: { capabilities: roles.field }, play: NoVoidPermission.play };
export const NoOtherMutationGrants: Story = {
  args: { capabilities: { ...roles.owner, send: false, update: false, decide: false } }, play: Sent.play,
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, error: { kind: "error", message: c.stories.failure }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.errors.read);
    for (const text of [estimate.name, estimate.number, estimate.recipientName, value.reason, c.stories.failure, c.linkEffect])
      await expect(canvas.queryByText(text, { exact: false })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.reload })).not.toBeInTheDocument();
  },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived); },
};
export const Draft: Story = {
  args: { estimate: { ...estimate, status: "draft" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.status); },
};
export const Accepted: Story = { args: { estimate: { ...estimate, status: "accepted" } }, play: Draft.play };
export const Declined: Story = { args: { estimate: { ...estimate, status: "declined" } }, play: Draft.play };
export const Expired: Story = { args: { estimate: { ...estimate, status: "expired" } }, play: Draft.play };
export const Superseded: Story = { args: { estimate: { ...estimate, status: "superseded" } }, play: Draft.play };
export const AlreadyVoid: Story = { args: { estimate: { ...estimate, status: "void" } }, play: Draft.play };
export const InvalidSavedRecord: Story = {
  args: { estimate: { ...estimate, version: 0 } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.record); },
};
export const WrongRecord: Story = {
  args: { value: { ...value, estimateId: "another-estimate" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.binding); },
};
export const WrongVersion: Story = { args: { value: { ...value, expectedVersion: estimate.version - 1 } }, play: WrongRecord.play };
export const Conflict: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.stories.conflict);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
    await expect(canvas.getByRole("textbox", reasonField)).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const ConflictWithoutReload: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.reloadUnavailable); },
};
export const ReloadAndReview: Story = {
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...value, expectedVersion: estimate.version + 1 });
  },
};
export const ReloadFailed: Story = {
  args: { ...Conflict.args, onReload: fn(async () => { throw new Error(c.stories.rejection); }) },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.reloadFailed);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
    await expect(canvas.getByRole("button", { name: c.reload })).toBeEnabled();
  },
};
const heldReload = fn(() => new Promise<void>(() => {}));
export const ReloadDoubleClickGuard: Story = {
  args: { ...Conflict.args, onReload: heldReload },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.reload }));
    await expect(heldReload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.reloading);
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const ServerError: Story = {
  args: { error: { kind: "error", message: c.stories.failure } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
const retry = fn(async () => {});
export const RejectAndRetry: Story = {
  args: { onConfirm: retry },
  play: async ({ canvasElement }) => {
    retry.mockRejectedValueOnce(new Error(c.stories.rejection));
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    for (const control of [...canvas.getAllByRole("button"), ...canvas.getAllByRole("textbox")])
      await expect(control).toBeDisabled();
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: c.stories.literal } });
    for (const button of canvas.getAllByRole("button")) fireEvent.click(button);
    await userEvent.keyboard("{Escape}");
    await expect(change).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { onConfirm: heldConfirm },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.pending);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(value.reason);
  },
};
export const NotConnected: Story = {
  args: { onConfirm: undefined },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.noHandler); },
};
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.cancel }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Escape: Story = {
  play: async ({ canvasElement, args }) => {
    await dialog(canvasElement); await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.confirm })).toHaveFocus();
    await userEvent.keyboard("{Enter}"); await expect(confirm).toHaveBeenCalledTimes(1);
  },
};
export const AccessRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="read" />, play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.read);
    await expect(canvas.queryByText(estimate.name)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const VersionChangedWhileEditing: Story = {
  render: (args) => <ChangedPreview {...args} change="version" />, play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.binding);
    await expect(canvas.getByRole("textbox", reasonField)).toHaveValue(c.stories.literal);
    await expect(canvas.getByRole("textbox", reasonField)).toBeDisabled();
  },
};
export const PermissionRevokedWhileEditing: Story = {
  render: (args) => <ChangedPreview {...args} change="permission" />, play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.permission);
    await expect(canvas.getByRole("textbox", reasonField)).toBeDisabled();
  },
};
export const StatusChangedWhileEditing: Story = {
  render: (args) => <ChangedPreview {...args} change="status" />, play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", reasonField), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.status);
    await expect(canvas.getByRole("textbox", reasonField)).toBeDisabled();
  },
};
export const LongContent: Story = {
  args: { estimate: { ...estimate, name: c.stories.longName, recipientName: c.stories.longCustomer },
    value: { ...value, reason: c.stories.longReason } },
};
export const Phone: Story = { ...LongContent, globals: { viewport: { value: "phone" } } };
export const PendingPhone: Story = { ...Phone, args: { ...LongContent.args, pending: true } };

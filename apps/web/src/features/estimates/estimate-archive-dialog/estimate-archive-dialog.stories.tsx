import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { EstimateRowMenu } from "../estimate-row-menu/estimate-row-menu";
import { estimateRowMenuData } from "../estimate-row-menu/estimate-row-menu.data";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { estimateButton } from "../estimate-ui";
import { EstimateArchiveDialog, type EstimateArchiveDialogProps } from "./estimate-archive-dialog";
import { estimateArchiveDialogData as c, estimateArchiveFixture as estimate } from "./estimate-archive-dialog.data";
import { initialEstimateArchiveReview, type EstimateArchiveMode } from "./estimate-archive-dialog.preview";

const review = initialEstimateArchiveReview(estimate, "archive");
const restoreArgs = {
  mode: "restore" as const, estimate: { ...estimate, archived: true },
  review: initialEstimateArchiveReview(estimate, "restore"),
};
const confirm = fn(async () => {});
const reload = fn(async () => {});
function ArchivePreview(args: EstimateArchiveDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [requested, setRequested] = useState(false);
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => { setRequested(false); setOpen(true); }}>
      {args.mode === "restore" ? c.stories.openRestore : c.stories.openArchive}
    </button>
    <EstimateArchiveDialog {...args} open={open} onClose={() => { setOpen(false); args.onClose(); }}
      onConfirm={args.onConfirm ? async (request) => { await args.onConfirm?.(request); setRequested(true); } : undefined} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function ReloadPreview(args: EstimateArchiveDialogProps & { change?: "read" | "permission" | "status" | "flag" | "version" }) {
  const [changed, setChanged] = useState(false);
  const record = changed ? {
    ...args.estimate, version: args.estimate.version + 1,
    ...(args.change === "status" ? { status: "accepted" as const } : {}),
    ...(args.change === "flag" ? { archived: !args.estimate.archived } : {}),
  } : args.estimate;
  const capabilities = changed && args.change === "read" ? { ...args.capabilities, read: false }
    : changed && args.change === "permission" ? { ...args.capabilities, archive: false } : args.capabilities;
  return <EstimateArchiveDialog {...args} estimate={record} capabilities={capabilities}
    review={changed && args.change !== "version" ? initialEstimateArchiveReview(record, args.mode) : args.review}
    error={changed ? undefined : { kind: "conflict", message: c.stories.conflict }}
    onReload={async () => { await reload(); setChanged(true); }} />;
}
function HostChangedFlagPreview(args: EstimateArchiveDialogProps) {
  const [record, setRecord] = useState(args.estimate);
  return <EstimateArchiveDialog {...args} estimate={record} onConfirm={async (request) => {
    await args.onConfirm?.(request);
    setRecord({ ...record, version: record.version + 1, archived: args.mode === "archive" });
  }} />;
}
function MenuPreview(args: EstimateArchiveDialogProps) {
  const [open, setOpen] = useState(false);
  return <>
    <EstimateRowMenu name={args.estimate.name} status={args.estimate.status} archived={args.estimate.archived}
      capabilities={args.capabilities} onAction={(action) => { if (action === args.mode) setOpen(true); }} />
    <EstimateArchiveDialog {...args} open={open} onClose={() => { setOpen(false); args.onClose(); }} />
  </>;
}

const meta = {
  title: "Estimates/EstimateArchiveDialog",
  component: EstimateArchiveDialog,
  args: { open: true, mode: "archive", estimate, capabilities: roles.owner, review, onClose: fn(), onConfirm: confirm },
  render: (args) => <ArchivePreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateArchiveDialog>;
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
async function blocked(element: HTMLElement, message: string, mode: EstimateArchiveMode = "archive") {
  const canvas = await dialog(element);
  await expect(canvas.getByRole("button", { name: c[mode].confirm })).toBeDisabled();
  await expect(canvas.getByText(message)).toBeVisible();
}

export const Archive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(estimate.name)).toBeVisible();
    await expect(canvas.getByText(c.archive.effect)).toBeVisible();
    await expect(canvas.getByText(c.retained)).toBeVisible();
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.declined.label)).toBeVisible();
    await expect(canvas.queryByText(estimateStatusBadgeData.archived)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeEnabled();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
  },
};
export const Restore: Story = {
  args: restoreArgs,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(estimate.name)).toBeVisible();
    await expect(canvas.getByText(c.restore.effect)).toBeVisible();
    await expect(canvas.getByText(c.retained)).toBeVisible();
    await expect(canvas.getByText(estimateStatusBadgeData.archived)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.restore.confirm })).toBeEnabled();
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
  },
};
export const Interactive: Story = { args: { open: false } };
export const InteractiveRestore: Story = { args: { ...restoreArgs, open: false } };
export const LoadingCurrentReview: Story = {
  args: { pending: true, pendingLabel: c.live.loading },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.live.loading })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
  },
};
export const ArchiveExpired: Story = { args: { estimate: { ...estimate, status: "expired" } } };
export const ArchiveSuperseded: Story = { args: { estimate: { ...estimate, status: "superseded" } } };
export const ArchiveVoid: Story = { args: { estimate: { ...estimate, status: "void" } } };
export const RestoreExpired: Story = { args: { ...restoreArgs, estimate: { ...restoreArgs.estimate, status: "expired" } }, play: Restore.play };
export const RestoreSuperseded: Story = { args: { ...restoreArgs, estimate: { ...restoreArgs.estimate, status: "superseded" } }, play: Restore.play };
export const RestoreVoid: Story = { args: { ...restoreArgs, estimate: { ...restoreArgs.estimate, status: "void" } }, play: Restore.play };
export const ConfirmRequestOnly: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(args.review);
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
    await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toBeEnabled();
    if (args.mode === "restore") await expect(canvas.getByText(estimateStatusBadgeData.archived)).toBeVisible();
    else await expect(canvas.queryByText(estimateStatusBadgeData.archived)).not.toBeInTheDocument();
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.requested);
  },
};
export const RestoreRequestOnly: Story = { args: restoreArgs, play: ConfirmRequestOnly.play };
export const HostSuppliesArchivedRecord: Story = {
  render: (args) => <HostChangedFlagPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
    await expect(confirm).toHaveBeenCalledWith(review);
    await blocked(canvasElement, c.errors.archived);
    await expect(canvas.getByText(estimateStatusBadgeData.archived)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.restore.confirm })).not.toBeInTheDocument();
  },
};
export const HostSuppliesRestoredRecord: Story = {
  args: restoreArgs, render: (args) => <HostChangedFlagPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.restore.confirm }));
    await expect(confirm).toHaveBeenCalledWith(restoreArgs.review);
    await blocked(canvasElement, c.errors.notArchived, "restore");
    await expect(canvas.queryByText(estimateStatusBadgeData.archived)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.archive.confirm })).not.toBeInTheDocument();
  },
};
export const MenuArchiveReview: Story = {
  render: (args) => <MenuPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: estimateRowMenuData.label(estimate.name) }));
    await userEvent.click(body(canvasElement).getByRole("menuitem", { name: estimateRowMenuData.actions[args.mode] }));
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toBeEnabled();
    await expect(confirm).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await expect(confirm).toHaveBeenCalledWith(args.review);
  },
};
export const MenuRestoreReview: Story = { args: restoreArgs, render: MenuArchiveReview.render, play: MenuArchiveReview.play };
export const Admin: Story = { args: { capabilities: roles.admin }, play: Archive.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Archive.play };
export const RestoreOffice: Story = { args: { ...restoreArgs, capabilities: roles.office }, play: Restore.play };
export const NoArchivePermission: Story = {
  args: { capabilities: { ...roles.owner, archive: false } },
  play: async ({ canvasElement, args }) => { await blocked(canvasElement, c.errors.permission, args.mode); },
};
export const NoRestorePermission: Story = { args: { ...restoreArgs, capabilities: { ...roles.owner, archive: false } }, play: NoArchivePermission.play };
export const Field: Story = { args: { capabilities: roles.field }, play: NoArchivePermission.play };
export const RestoreField: Story = { args: { ...restoreArgs, capabilities: roles.field }, play: NoArchivePermission.play };
export const NoOtherMutationGrants: Story = {
  args: { capabilities: { ...roles.owner, create: false, update: false, send: false, decide: false, void: false, delete: false } }, play: Archive.play,
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, error: { kind: "error", message: c.stories.failure }, onReload: reload },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.errors.read, args.mode);
    for (const text of [estimate.name, estimate.number, estimate.recipientName, c.stories.failure, c[args.mode].effect, c.retained])
      await expect(canvas.queryByText(text, { exact: false })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.reload })).not.toBeInTheDocument();
  },
};
export const RestoreNoReadAccess: Story = { args: { ...NoReadAccess.args, ...restoreArgs }, play: NoReadAccess.play };
export const Draft: Story = {
  args: { estimate: { ...estimate, status: "draft" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.status); },
};
export const Sent: Story = { args: { estimate: { ...estimate, status: "sent" } }, play: Draft.play };
export const Published: Story = { args: { estimate: { ...estimate, status: "published" } }, play: Draft.play };
export const Accepted: Story = { args: { estimate: { ...estimate, status: "accepted" } }, play: Draft.play };
export const AlreadyArchived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived); },
};
export const NotArchived: Story = {
  args: { ...restoreArgs, estimate },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.notArchived, "restore"); },
};
export const InvalidSavedRecord: Story = {
  args: { estimate: { ...estimate, version: 0 } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.record); },
};
export const WrongRecord: Story = {
  args: { review: { ...review, estimateId: "another-estimate" } },
  play: async ({ canvasElement, args }) => { await blocked(canvasElement, c.errors.binding, args.mode); },
};
export const WrongVersion: Story = { args: { review: { ...review, expectedVersion: estimate.version - 1 } }, play: WrongRecord.play };
export const WrongAction: Story = { args: { review: { ...review, mode: "restore" } }, play: WrongRecord.play };
export const RestoreWrongAction: Story = { args: { ...restoreArgs, review }, play: WrongRecord.play };
export const Conflict: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: reload },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.stories.conflict, args.mode);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toBeDisabled();
  },
};
export const RestoreConflict: Story = { args: { ...Conflict.args, ...restoreArgs }, play: Conflict.play };
export const ConflictWithoutReload: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.reloadUnavailable); },
};
export const ReloadAndReview: Story = {
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...args.review, expectedVersion: estimate.version + 1 });
  },
};
export const RestoreReloadAndReview: Story = { args: restoreArgs, render: ReloadAndReview.render, play: ReloadAndReview.play };
export const ReloadWithoutFreshBinding: Story = {
  render: (args) => <ReloadPreview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.errors.binding);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const AccessRevoked: Story = {
  render: (args) => <ReloadPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.errors.read);
    await expect(canvas.queryByText(estimate.name)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.reload })).not.toBeInTheDocument();
  },
};
export const PermissionRevoked: Story = {
  render: (args) => <ReloadPreview {...args} change="permission" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.errors.permission);
  },
};
export const StatusChanged: Story = {
  render: (args) => <ReloadPreview {...args} change="status" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.errors.status);
  },
};
export const FlagChanged: Story = {
  render: (args) => <ReloadPreview {...args} change="flag" />,
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, args.mode === "archive" ? c.errors.archived : c.errors.notArchived, args.mode);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const RestoreFlagChanged: Story = { args: restoreArgs, render: FlagChanged.render, play: FlagChanged.play };
export const ReloadFailed: Story = {
  args: { ...Conflict.args, onReload: fn(async () => { throw new Error(c.stories.rejection); }) },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.reloadFailed);
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
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toBeEnabled();
  },
};
export const RestoreServerError: Story = { args: { ...ServerError.args, ...restoreArgs }, play: ServerError.play };
const retry = fn(async () => {});
export const RejectAndRetry: Story = {
  args: { onConfirm: retry },
  play: async ({ canvasElement, args }) => {
    retry.mockRejectedValueOnce(new Error(c.stories.rejection));
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expect(canvas.getByText(estimate.name)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const RestoreRejectAndRetry: Story = { args: { ...restoreArgs, onConfirm: retry }, play: RejectAndRetry.play };
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toBeDisabled(); fireEvent.click(button);
    }
    await userEvent.keyboard("{Escape}");
    await expect(confirm).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const RestorePending: Story = { args: { ...restoreArgs, pending: true }, play: Pending.play };
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { onConfirm: heldConfirm },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c[args.mode].confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c[args.mode].pending);
  },
};
export const RestoreDoubleClickGuard: Story = { args: { ...restoreArgs, onConfirm: heldConfirm }, play: DoubleClickGuard.play };
export const NotConnected: Story = {
  args: { onConfirm: undefined },
  play: async ({ canvasElement, args }) => { await blocked(canvasElement, c[args.mode].noHandler, args.mode); },
};
export const RestoreNotConnected: Story = { args: { ...restoreArgs, onConfirm: undefined }, play: NotConnected.play };
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
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c[args.mode].confirm })).toHaveFocus();
    await userEvent.keyboard("{Enter}"); await expect(confirm).toHaveBeenCalledWith(args.review);
  },
};
export const RestoreKeyboard: Story = { args: restoreArgs, play: Keyboard.play };
export const LiteralRecordText: Story = {
  args: { estimate: { ...estimate, name: c.stories.literal } },
  play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByText(c.stories.literal)).toBeVisible(); },
};
export const LongContent: Story = { args: { estimate: { ...estimate, name: c.stories.longName, recipientName: c.stories.longCustomer } } };
export const Phone: Story = { ...LongContent, globals: { viewport: { value: "phone" } } };
export const RestorePhone: Story = {
  ...Phone, args: { ...restoreArgs, estimate: { ...restoreArgs.estimate, name: c.stories.longName, recipientName: c.stories.longCustomer, status: "superseded" } },
};
export const PendingPhone: Story = { ...Phone, args: { ...LongContent.args, pending: true } };

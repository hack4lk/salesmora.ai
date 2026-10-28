import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { EstimateRowMenu } from "../estimate-row-menu/estimate-row-menu";
import { estimateRowMenuData } from "../estimate-row-menu/estimate-row-menu.data";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { estimateButton } from "../estimate-ui";
import { EstimateDeleteDraftDialog, type EstimateDeleteDraftDialogProps } from "./estimate-delete-draft-dialog";
import { estimateDeleteDraftDialogData as c, estimateDeleteDraftFixture as estimate } from "./estimate-delete-draft-dialog.data";
import { initialEstimateDeleteDraftValues } from "./estimate-delete-draft-dialog.preview";

const value = initialEstimateDeleteDraftValues(estimate);
const typed = { ...value, typedConfirmation: estimate.number };
const change = fn();
const confirm = fn(async () => {});
const reload = fn(async () => {});
function DeletePreview(args: EstimateDeleteDraftDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [current, setCurrent] = useState(args.value);
  const [requested, setRequested] = useState(false);
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton}
      onClick={() => { setCurrent(initialEstimateDeleteDraftValues(args.estimate)); setRequested(false); setOpen(true); }}>{c.stories.open}</button>
    <EstimateDeleteDraftDialog {...args} open={open} value={current}
      onChange={(next) => { args.onChange(next); setCurrent(next); }}
      onClose={() => { args.onClose(); setOpen(false); }}
      onConfirm={args.onConfirm ? async (request) => { await args.onConfirm?.(request); setRequested(true); } : undefined} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function ChangedPreview(args: EstimateDeleteDraftDialogProps & { change: "read" | "permission" | "version" | "status" | "sharing" }) {
  const [current, setCurrent] = useState(args.value);
  const [changed, setChanged] = useState(false);
  const record = changed ? {
    ...args.estimate,
    ...(args.change === "version" ? { version: args.estimate.version + 1 } : {}),
    ...(args.change === "status" ? { status: "sent" as const, sharing: "shared" as const } : {}),
    ...(args.change === "sharing" ? { sharing: "shared" as const } : {}),
  } : args.estimate;
  const capabilities = changed && args.change === "read" ? { ...args.capabilities, read: false }
    : changed && args.change === "permission" ? { ...args.capabilities, delete: false } : args.capabilities;
  return <EstimateDeleteDraftDialog {...args} estimate={record} capabilities={capabilities} value={current}
    onChange={(next) => { args.onChange(next); setCurrent(next); setChanged(true); }} />;
}
function ReloadPreview(args: EstimateDeleteDraftDialogProps & { keepStaleBinding?: boolean }) {
  const [record, setRecord] = useState(args.estimate);
  const [current, setCurrent] = useState(args.value);
  const [conflict, setConflict] = useState(true);
  return <EstimateDeleteDraftDialog {...args} estimate={record} value={current} onChange={setCurrent}
    error={conflict ? { kind: "conflict", message: c.stories.conflict } : undefined}
    onReload={async () => {
      await reload();
      const next = { ...record, version: record.version + 1 };
      setRecord(next);
      if (!args.keepStaleBinding) setCurrent(initialEstimateDeleteDraftValues(next));
      setConflict(false);
    }} />;
}
function HostClosePreview(args: EstimateDeleteDraftDialogProps) {
  const [open, setOpen] = useState(args.open);
  return <EstimateDeleteDraftDialog {...args} open={open} onConfirm={async (request) => {
    await args.onConfirm?.(request);
    setOpen(false);
  }} />;
}
function MenuPreview(args: EstimateDeleteDraftDialogProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(args.value);
  return <>
    <EstimateRowMenu name={args.estimate.name} status={args.estimate.status} archived={args.estimate.archived} capabilities={args.capabilities}
      onAction={(action) => { if (action === "delete-draft") { setCurrent(initialEstimateDeleteDraftValues(args.estimate)); setOpen(true); } }} />
    <EstimateDeleteDraftDialog {...args} open={open} value={current} onChange={setCurrent}
      onClose={() => { args.onClose(); setOpen(false); }} />
  </>;
}
const meta = {
  title: "Estimates/EstimateDeleteDraftDialog",
  component: EstimateDeleteDraftDialog,
  args: { open: true, estimate, capabilities: roles.owner, value, onChange: change, onConfirm: confirm, onClose: fn() },
  render: (args) => <DeletePreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateDeleteDraftDialog>;
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
  await expect(canvas.getByText(message)).toBeVisible();
  await expect(canvas.queryByRole("textbox", { name: c.type })).not.toBeInTheDocument();
}

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(estimate.name)).toBeVisible();
    await expect(canvas.getByText(c.impact)).toBeVisible();
    await expect(canvas.getByText(c.numberEffect)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
  },
};
export const Interactive: Story = { args: { open: false } };
export const LoadingCurrentReview: Story = {
  args: { pending: true, pendingLabel: c.live.loading },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.live.loading })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
  },
};
export const ExactNumberRequired: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    const input = canvas.getByRole("textbox", { name: c.type }), button = canvas.getByRole("button", { name: c.confirm });
    for (const typedConfirmation of [estimate.number.toLowerCase(), `${estimate.number} `, ` ${estimate.number}`, "EST-2049"]) {
      fireEvent.change(input, { target: { value: typedConfirmation } });
      await expect(button).toBeDisabled();
      const form = button.closest("form");
      if (!form) throw new Error("Missing deletion confirmation form.");
      fireEvent.submit(form);
      await expect(confirm).not.toHaveBeenCalled();
    }
    fireEvent.change(input, { target: { value: estimate.number } });
    await expect(button).toBeEnabled();
    await expect(change).toHaveBeenLastCalledWith(typed);
  },
};
export const ConfirmRequestOnly: Story = {
  args: { value: typed },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(typed);
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue(estimate.number);
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.draft.label)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.requested);
  },
};
export const HostOwnsConfirmedClosure: Story = {
  args: { value: typed }, render: (args) => <HostClosePreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith(typed);
    await waitFor(() => expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};
export const MissingRecipient: Story = {
  args: { estimate: { ...estimate, recipientName: "" }, value: typed },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.recipientNotSet)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const UnsharedRevision: Story = {
  args: { estimate: { ...estimate, revision: 2 }, value: typed }, play: ConfirmRequestOnly.play,
};
export const MenuReview: Story = {
  render: (args) => <MenuPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: estimateRowMenuData.label(estimate.name) }));
    await userEvent.click(body(canvasElement).getByRole("menuitem", { name: estimateRowMenuData.actions["delete-draft"] }));
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await expect(confirm).not.toHaveBeenCalled();
    await userEvent.type(canvas.getByRole("textbox", { name: c.type }), estimate.number);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith(typed);
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Draft.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Draft.play };
export const NoDeletePermission: Story = {
  args: { capabilities: { ...roles.owner, delete: false }, value: typed },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.permission); },
};
export const Field: Story = { args: { capabilities: roles.field, value: typed }, play: NoDeletePermission.play };
export const NoOtherMutationGrants: Story = {
  args: { capabilities: { ...roles.owner, create: false, update: false, send: false, decide: false, void: false, archive: false, export: false } },
  play: Draft.play,
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, value: typed, error: { kind: "error", message: c.stories.failure }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.errors.read);
    for (const text of [estimate.name, estimate.number, estimate.recipientName, c.stories.failure, c.impact, c.numberEffect])
      await expect(canvas.queryByText(text, { exact: false })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.reload })).not.toBeInTheDocument();
  },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true }, value: typed },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived); },
};
export const Sent: Story = {
  args: { estimate: { ...estimate, status: "sent", sharing: "shared" }, value: typed },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.status); },
};
export const Published: Story = { args: { estimate: { ...estimate, status: "published", sharing: "shared" }, value: typed }, play: Sent.play };
export const Accepted: Story = { args: { estimate: { ...estimate, status: "accepted", sharing: "shared" }, value: typed }, play: Sent.play };
export const Declined: Story = { args: { estimate: { ...estimate, status: "declined", sharing: "shared" }, value: typed }, play: Sent.play };
export const Expired: Story = { args: { estimate: { ...estimate, status: "expired", sharing: "shared" }, value: typed }, play: Sent.play };
export const Superseded: Story = { args: { estimate: { ...estimate, status: "superseded", sharing: "shared" }, value: typed }, play: Sent.play };
export const Void: Story = { args: { estimate: { ...estimate, status: "void", sharing: "shared" }, value: typed }, play: Sent.play };
export const PreviouslySharedDraft: Story = {
  args: { estimate: { ...estimate, sharing: "shared" }, value: typed },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.shared); },
};
export const SharingHistoryUnavailable: Story = {
  args: { estimate: { ...estimate, sharing: "unavailable" }, value: typed, onReload: reload },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.sharingUnavailable); },
};
export const InvalidSavedRecord: Story = {
  args: { estimate: { ...estimate, version: 0 }, value: typed },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.record); },
};
export const WrongRecord: Story = {
  args: { value: { ...typed, estimateId: "another-estimate" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.binding); },
};
export const WrongVersion: Story = { args: { value: { ...typed, expectedVersion: estimate.version - 1 } }, play: WrongRecord.play };
export const Conflict: Story = {
  args: { value: typed, error: { kind: "conflict", message: c.stories.conflict }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.stories.conflict);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const ConflictWithoutReload: Story = {
  args: { value: typed, error: { kind: "conflict", message: c.stories.conflict } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.reloadUnavailable); },
};
export const ReloadAndRetype: Story = {
  args: { value: typed }, render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: c.type }), estimate.number);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...typed, expectedVersion: estimate.version + 1 });
  },
};
export const ReloadWithoutFreshBinding: Story = {
  args: { value: typed }, render: (args) => <ReloadPreview {...args} keepStaleBinding />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.errors.binding);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
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
  args: { value: typed, error: { kind: "error", message: c.stories.failure } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue(estimate.number);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
const retry = fn(async () => {});
export const RejectAndRetry: Story = {
  args: { value: typed, onConfirm: retry },
  play: async ({ canvasElement }) => {
    retry.mockRejectedValueOnce(new Error(c.stories.rejection));
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue(estimate.number);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { value: typed, pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    for (const control of [...canvas.getAllByRole("button"), ...canvas.getAllByRole("textbox")]) await expect(control).toBeDisabled();
    fireEvent.change(canvas.getByRole("textbox", { name: c.type }), { target: { value: "" } });
    for (const button of canvas.getAllByRole("button")) fireEvent.click(button);
    await userEvent.keyboard("{Escape}");
    await expect(change).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { value: typed, onConfirm: heldConfirm },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.pending);
    await expect(canvas.getByRole("textbox", { name: c.type })).toHaveValue(estimate.number);
  },
};
export const NotConnected: Story = {
  args: { value: typed, onConfirm: undefined },
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
export const ReopenClearsConfirmation: Story = {
  args: { value: typed },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
    await waitFor(() => expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument());
    await userEvent.click(body(canvasElement).getByRole("button", { name: c.stories.open }));
    await expect((await dialog(canvasElement)).getByRole("textbox", { name: c.type })).toHaveValue("");
    await expect((await dialog(canvasElement)).getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const Keyboard: Story = {
  args: { value: typed },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.confirm })).toHaveFocus();
    await userEvent.keyboard("{Enter}"); await expect(confirm).toHaveBeenCalledWith(typed);
  },
};
export const AccessRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.type }), { target: { value: estimate.number } });
    await blocked(canvasElement, c.errors.read);
    await expect(canvas.queryByText(estimate.name)).not.toBeInTheDocument();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const PermissionRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="permission" />,
  play: async ({ canvasElement }) => {
    fireEvent.change((await dialog(canvasElement)).getByRole("textbox", { name: c.type }), { target: { value: estimate.number } });
    await blocked(canvasElement, c.errors.permission);
  },
};
export const VersionChangedWhileTyping: Story = {
  render: (args) => <ChangedPreview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    fireEvent.change((await dialog(canvasElement)).getByRole("textbox", { name: c.type }), { target: { value: estimate.number } });
    await blocked(canvasElement, c.errors.binding);
  },
};
export const StatusChangedWhileTyping: Story = {
  render: (args) => <ChangedPreview {...args} change="status" />,
  play: async ({ canvasElement }) => {
    fireEvent.change((await dialog(canvasElement)).getByRole("textbox", { name: c.type }), { target: { value: estimate.number } });
    await blocked(canvasElement, c.errors.status);
  },
};
export const SharingChangedWhileTyping: Story = {
  render: (args) => <ChangedPreview {...args} change="sharing" />,
  play: async ({ canvasElement }) => {
    fireEvent.change((await dialog(canvasElement)).getByRole("textbox", { name: c.type }), { target: { value: estimate.number } });
    await blocked(canvasElement, c.errors.shared);
  },
};
export const LiteralRecordText: Story = {
  args: { estimate: { ...estimate, name: c.stories.literal } },
  play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByText(c.stories.literal)).toBeVisible(); },
};
export const LongContent: Story = {
  args: { estimate: { ...estimate, name: c.stories.longName, recipientName: c.stories.longCustomer } },
};
export const Phone: Story = { ...LongContent, globals: { viewport: { value: "phone" } } };
export const PendingPhone: Story = { ...Phone, args: { ...LongContent.args, value: typed, pending: true } };

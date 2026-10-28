import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { MoneyText } from "@salesmora/ui";
import { estimateDeliveryFixture as delivery } from "../estimate-delivery-card/estimate-delivery-card.data";
import { estimateCapabilitiesByRole as roles, estimatePreviewData } from "../estimate-preview.data";
import { estimateButton, estimateDate } from "../estimate-ui";
import { EstimateSendDialog, type EstimateSendDialogProps, type EstimateSendPreview } from "./estimate-send-dialog";
import { estimateSendDialogData as c, estimateSendFixture as estimate } from "./estimate-send-dialog.data";
import type { EstimateSendRecord } from "./estimate-send-dialog.preview";
import type { EstimateDeliverySummary } from "../estimate-delivery-card/estimate-delivery-card.preview";
import { estimateRevisionReviewData as revisionCopy, estimateRevisionReviewFixture as revisionFixture } from "../estimate-revision-review/estimate-revision-review.data";

type SendStoryArgs = Omit<EstimateSendDialogProps, "mode"> & {
  mode: "send" | "resend";
  delivery: EstimateDeliverySummary | null;
  recipientEmail: string;
  onRecipientEmailChange: (email: string) => void;
};

function PreviewFixture({ record = estimate, children }: { record?: EstimateSendRecord; children?: ReactNode }) {
  return <article className="grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4">
    <h4 className="m-0 text-base font-semibold">{c.stories.previewTitle}</h4>
    <p className="m-0 text-sm leading-6 text-muted">{c.stories.previewNotice}</p>
    <p className="m-0 font-semibold">{c.stories.business}</p>
    <p className="m-0 text-sm wrap-anywhere">{record.name}</p>
    <p className="m-0 text-sm wrap-anywhere">{record.recipientName}</p>
    <p className="m-0 text-sm leading-6">{c.stories.scope}</p>
    <p className="m-0 text-sm">{c.stories.item} · {c.stories.qty}</p>
    <MoneyText cents={record.totalCents} />
    <p className="m-0 text-sm">{c.stories.valid(estimateDate(`${record.validUntil}T00:00:00Z`))}</p>
    {children}
  </article>;
}
function readyPreview(record = estimate): Extract<EstimateSendPreview, { state: "ready" }> {
  return { state: "ready", estimateId: record.id, version: record.version, snapshotHash: "sample-content-hash", content: <PreviewFixture record={record} /> };
}
function SendPreview(args: EstimateSendDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [recipientEmail, setRecipientEmail] = useState(args.mode === "resend" ? args.recipientEmail : "");
  const [completed, setCompleted] = useState(false);
  const [closed, setClosed] = useState(false);
  const common = {
    ...args, open,
    onClose: () => { setOpen(false); setClosed(true); args.onClose(); },
    onConfirm: args.onConfirm ? async (request: Parameters<NonNullable<EstimateSendDialogProps["onConfirm"]>>[0]) => {
      await args.onConfirm?.(request);
      setCompleted(true);
    } : undefined,
  };
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => { setOpen(true); setClosed(false); setCompleted(false); }}>{c.stories.open}</button>
    {args.mode === "resend" ? <EstimateSendDialog {...common} mode="resend" delivery={args.delivery} recipientEmail={recipientEmail}
      onRecipientEmailChange={(value) => { setRecipientEmail(value); args.onRecipientEmailChange(value); }} />
      : <EstimateSendDialog {...common} mode="send" />}
    {completed && <p role="status">{c.stories.completed}</p>}
    {closed && <p role="status">{c.stories.close}</p>}
  </div>;
}
function SendStory({ mode, delivery, recipientEmail, onRecipientEmailChange, ...args }: SendStoryArgs) {
  return mode === "resend"
    ? <SendPreview {...args} mode="resend" delivery={delivery} recipientEmail={recipientEmail} onRecipientEmailChange={onRecipientEmailChange} />
    : <SendPreview {...args} mode="send" />;
}
function ChangedReview(args: SendStoryArgs & { change: "read" | "version" | "send" }) {
  const [changed, setChanged] = useState(false);
  const record = args.change === "version" && changed ? { ...args.estimate, version: args.estimate.version + 1 } : args.estimate;
  const capabilities = changed ? {
    ...args.capabilities,
    read: args.change === "read" ? false : args.capabilities.read,
    send: args.change === "send" ? false : args.capabilities.send,
  } : args.capabilities;
  const label = args.change === "read" ? c.stories.revoke : args.change === "send" ? c.stories.grantLost : c.stories.change;
  const preview: EstimateSendPreview = {
    state: "ready", estimateId: args.estimate.id, version: args.estimate.version, snapshotHash: "sample-content-hash",
    content: <PreviewFixture><button type="button" className={estimateButton} onClick={() => setChanged(true)}>{label}</button></PreviewFixture>,
  };
  return <SendStory {...args} estimate={record} capabilities={capabilities} preview={preview} />;
}

const meta = {
  title: "Estimates/EstimateSendDialog",
  component: SendStory,
  args: {
    open: true, mode: "send", delivery, recipientEmail: c.stories.email, onRecipientEmailChange: fn(),
    estimate, capabilities: roles.owner, today: estimatePreviewData.today,
    subject: c.stories.subject, readiness: { state: "ready" }, preview: readyPreview(),
    onClose: fn(), onConfirm: fn(async () => {}),
  },
  render: (args) => <SendStory {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof SendStory>;
export default meta;
type Story = StoryObj<typeof meta>;
const revisionEstimate = { ...revisionFixture.estimate, recipientEmail: c.stories.email };
export const RevisionReplacement: Story = {
  args: {
    estimate: revisionEstimate, revision: revisionFixture.revision, paymentLink: revisionFixture.paymentLink,
    preview: { ...readyPreview(revisionEstimate), snapshotHash: "a".repeat(64) },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm.send })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: revisionCopy.acknowledge }));
    await expect(canvas.getByRole("button", { name: c.confirm.send })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.send }));
    await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      revisionReview: {
        sourceEstimateId: revisionFixture.revision.sourceEstimateId, sourceVersion: revisionFixture.revision.sourceVersion,
        paymentLinkReviewed: true,
      },
    }));
  },
};
function body(element: HTMLElement) { return within(element.ownerDocument.body); }
function dialog(element: HTMLElement) { return within(body(element).getByRole("alertdialog")); }
async function visibleDialog(element: HTMLElement) {
  const root = await body(element).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
async function expectBlocked(element: HTMLElement, message?: string) {
  const canvas = await visibleDialog(element);
  await expect(canvas.getByRole("button", { name: c.confirm.send })).toBeDisabled();
  if (message) await expect(canvas.getByText(message)).toBeVisible();
}
const resendArgs = {
  mode: "resend" as const, estimate: { ...estimate, status: "sent" as const }, delivery,
  recipientEmail: c.stories.email, onRecipientEmailChange: fn(),
};

export const Send: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await visibleDialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm.send })).toBeEnabled();
    await expect(canvas.getByText(c.stories.email, { exact: true })).toBeVisible();
    await expect(canvas.getByText(c.stories.subject)).toBeVisible();
    await expect(canvas.getByRole("region", { name: c.preview })).toBeVisible();
    await expect(canvas.getByText(c.stories.previewNotice)).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await waitFor(() => expect(body(canvasElement).getByRole("alertdialog")).toHaveFocus());
  },
};
export const ConfirmSend: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.send }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).toHaveBeenCalledWith({
      mode: "send", estimateId: estimate.id, expectedVersion: estimate.version, snapshotHash: "sample-content-hash",
      recipientEmail: c.stories.email, subject: c.stories.subject,
    });
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.completed);
    await expect(dialog(canvasElement).getByRole("button", { name: c.confirm.send })).toBeEnabled();
  },
};
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.cancel }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
export const Escape: Story = {
  play: async ({ canvasElement, args }) => {
    await visibleDialog(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
export const Resend: Story = {
  args: resendArgs,
  play: async ({ canvasElement }) => {
    const canvas = await visibleDialog(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.recipientEmail })).toHaveValue(c.stories.email);
    await expect(canvas.getByRole("button", { name: c.confirm.resend })).toBeEnabled();
    await expect(canvas.getByText(c.resendEmailHelp)).toBeVisible();
    await expect(canvas.getByText(c.resendHint)).toBeVisible();
  },
};
export const CorrectResendDestination: Story = {
  args: resendArgs,
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.recipientEmail }), { target: { value: c.stories.correctedEmail } });
    await expect(canvas.getByRole("textbox", { name: c.recipientEmail })).toHaveValue(c.stories.correctedEmail);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.resend }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).toHaveBeenCalledWith({
      mode: "resend", estimateId: estimate.id, expectedVersion: estimate.version,
      snapshotHash: "sample-content-hash", recipientEmail: c.stories.correctedEmail, subject: c.stories.subject,
    });
    await expect(args.estimate.recipientEmail).toBe(c.stories.email);
    await expect(canvas.getByText(c.stories.previewNotice)).toBeVisible();
  },
};
export const EnterInEmailDoesNotSend: Story = {
  args: resendArgs,
  play: async ({ canvasElement, args }) => {
    const input = (await visibleDialog(canvasElement)).getByRole("textbox", { name: c.recipientEmail });
    await userEvent.click(input); await userEvent.keyboard("{Enter}");
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const InvalidEmailRecovery: Story = {
  args: { ...resendArgs, recipientEmail: c.stories.invalidEmail },
  play: async ({ canvasElement }) => {
    const canvas = await visibleDialog(canvasElement), input = canvas.getByRole("textbox", { name: c.recipientEmail });
    await expect(canvas.getByRole("button", { name: c.confirm.resend })).toBeDisabled();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(input, { target: { value: c.stories.correctedEmail } });
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(canvas.getByRole("button", { name: c.confirm.resend })).toBeEnabled();
  },
};
export const InvalidInitialEmail: Story = {
  args: { estimate: { ...estimate, recipientEmail: c.stories.invalidEmail } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.recipientEmail); },
};
export const MissingName: Story = {
  args: { estimate: { ...estimate, name: "" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.name); },
};
export const MissingRecipientName: Story = {
  args: { estimate: { ...estimate, recipientName: "" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.recipientName); },
};
export const MissingPreview: Story = {
  args: { preview: null },
  play: async ({ canvasElement }) => {
    await expectBlocked(canvasElement, c.errors.previewMissing);
    await expect(dialog(canvasElement).queryByRole("region", { name: c.preview })).not.toBeInTheDocument();
  },
};
export const LoadingPreview: Story = {
  args: { preview: { state: "loading" } },
  play: async ({ canvasElement }) => {
    await expectBlocked(canvasElement);
    await expect(dialog(canvasElement).getByRole("status")).toHaveTextContent(c.previewLoading);
  },
};
export const FailedPreview: Story = {
  args: { preview: { state: "error" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.previewError); },
};
export const StalePreview: Story = {
  args: { preview: { state: "stale" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.previewStale); },
};
export const WrongRecordPreview: Story = {
  args: { preview: { ...readyPreview(), state: "ready", estimateId: "another-record", version: estimate.version, snapshotHash: "sample-content-hash", content: <PreviewFixture /> } },
  play: StalePreview.play,
};
export const OlderVersionPreview: Story = {
  args: { estimate: { ...estimate, version: estimate.version + 1 } },
  play: StalePreview.play,
};
export const MissingSnapshotHash: Story = {
  args: { preview: { state: "ready", estimateId: estimate.id, version: estimate.version, snapshotHash: "", content: <PreviewFixture /> } },
  play: StalePreview.play,
};
export const IncompleteBusinessProfile: Story = {
  args: { readiness: { state: "blocked", issues: [c.stories.profileIssue] } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.stories.profileIssue); },
};
export const InvalidItems: Story = {
  args: { readiness: { state: "blocked", issues: [c.stories.itemsIssue] } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.stories.itemsIssue); },
};
export const ValidUntilToday: Story = {
  args: { estimate: { ...estimate, validUntil: estimatePreviewData.today }, preview: readyPreview({ ...estimate, validUntil: estimatePreviewData.today }) }, play: Send.play,
};
export const ExpiredValidity: Story = {
  args: { estimate: { ...estimate, validUntil: "2026-10-21" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.past); },
};
export const InvalidWorkspaceDate: Story = {
  args: { today: "" },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.today); },
};
export const ZeroTotal: Story = {
  args: { estimate: { ...estimate, totalCents: 0 }, preview: readyPreview({ ...estimate, totalCents: 0 }) },
  play: Send.play,
};
export const MaximumTotal: Story = {
  args: { estimate: { ...estimate, totalCents: 2_000_000_000 }, preview: readyPreview({ ...estimate, totalCents: 2_000_000_000 }) },
  play: Send.play,
};
export const UnavailableTotal: Story = {
  args: { estimate: { ...estimate, totalCents: null } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.total); },
};
export const InvalidSubject: Story = {
  args: { subject: "" },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.subject); },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.archived); },
};
export const AlreadySent: Story = {
  args: { estimate: { ...estimate, status: "sent" } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.sendStatus); },
};
export const ResendQueued: Story = {
  args: { ...resendArgs, delivery: { ...delivery, email: { state: "queued", recipientEmail: c.stories.email, updatedAt: "2026-10-22T18:00:00Z" } } },
  play: async ({ canvasElement }) => {
    await visibleDialog(canvasElement);
    await expect(dialog(canvasElement).getByRole("button", { name: c.confirm.resend })).toBeDisabled();
    await expect(dialog(canvasElement).getByText(c.errors.resendStatus)).toBeVisible();
  },
};
export const ResendExpiredLink: Story = {
  args: { ...resendArgs, delivery: { ...delivery, link: { ...delivery.link, state: "expired" } } }, play: ResendQueued.play,
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Send.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Send.play };
export const FieldAssignedJob: Story = { args: { capabilities: roles.field }, play: Send.play };
export const NoSendPermission: Story = {
  args: { capabilities: { ...roles.owner, send: false } },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.errors.permission); },
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, error: { kind: "conflict", message: c.stories.conflict }, readiness: { state: "blocked", issues: [c.stories.profileIssue] } },
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    await expectBlocked(canvasElement, c.errors.read);
    for (const text of [c.stories.email, c.stories.subject, c.stories.profileIssue, c.stories.conflict, c.stories.previewNotice])
      await expect(canvas.queryByText(text, { exact: true })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const AccessRevoked: Story = {
  render: (args) => <ChangedReview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.stories.revoke }));
    await expectBlocked(canvasElement, c.errors.read);
    await expect(dialog(canvasElement).queryByText(c.stories.email)).not.toBeInTheDocument();
  },
};
export const RecordChanged: Story = {
  render: (args) => <ChangedReview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.stories.change }));
    await expectBlocked(canvasElement, c.errors.previewStale);
    await expect(dialog(canvasElement).queryByRole("region", { name: c.preview })).not.toBeInTheDocument();
  },
};
export const SendPermissionRevoked: Story = {
  render: (args) => <ChangedReview {...args} change="send" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.stories.grantLost }));
    await expectBlocked(canvasElement, c.errors.permission);
  },
};
export const Conflict: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: fn(async () => {}) },
  play: async ({ canvasElement, args }) => {
    await expectBlocked(canvasElement, c.stories.conflict);
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.reload }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
    await expectBlocked(canvasElement);
  },
};
export const ReloadFailed: Story = {
  args: { preview: null, onReload: fn(async () => { throw new Error(c.stories.reloadFailure); }) },
  play: async ({ canvasElement }) => {
    await userEvent.click(dialog(canvasElement).getByRole("button", { name: c.reload }));
    await expectBlocked(canvasElement, c.reloadFailed);
  },
};
export const ServerError: Story = {
  args: { error: { kind: "error", message: c.stories.failure } },
  play: async ({ canvasElement }) => {
    await visibleDialog(canvasElement);
    await expect(dialog(canvasElement).getByText(c.stories.failure)).toBeVisible();
    await expect(dialog(canvasElement).getByRole("button", { name: c.confirm.send })).toBeEnabled();
  },
};
export const RejectedConfirmation: Story = {
  args: { onConfirm: fn(async () => { throw new Error(c.stories.confirmFailure); }) },
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await visibleDialog(canvasElement)).getByRole("button", { name: c.confirm.send }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(dialog(canvasElement).getByRole("alert")).toBeVisible();
    await expect(dialog(canvasElement).getByRole("button", { name: c.confirm.send })).toBeEnabled();
  },
};
const retryConfirm = fn(async () => {});
export const RetryAfterFailure: Story = {
  args: { onConfirm: retryConfirm },
  play: async ({ canvasElement, args }) => {
    retryConfirm.mockRejectedValueOnce(new Error(c.stories.confirmFailure));
    const canvas = await visibleDialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.send }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.send }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    for (const button of canvas.getAllByRole("button")) { await expect(button).toBeDisabled(); fireEvent.click(button); }
    await userEvent.keyboard("{Escape}");
    await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const ResendPending: Story = {
  args: { ...resendArgs, pending: true },
  play: async ({ canvasElement, args }) => {
    const input = (await visibleDialog(canvasElement)).getByRole("textbox", { name: c.recipientEmail });
    await expect(input).toBeDisabled();
    fireEvent.change(input, { target: { value: c.stories.correctedEmail } });
    await expect(args.mode === "resend" ? args.onRecipientEmailChange : undefined).not.toHaveBeenCalled();
  },
};
export const DoubleClickGuard: Story = {
  args: { onConfirm: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    await userEvent.dblClick((await visibleDialog(canvasElement)).getByRole("button", { name: c.confirm.send }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(dialog(canvasElement).getByRole("button", { name: c.pending.send })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const NotConnected: Story = {
  args: { onConfirm: undefined },
  play: async ({ canvasElement }) => { await expectBlocked(canvasElement, c.noHandler); },
};
export const LongContent: Story = {
  args: {
    estimate: { ...estimate, name: c.stories.longName, recipientName: c.stories.longRecipient },
    subject: c.stories.longSubject,
    preview: readyPreview({ ...estimate, name: c.stories.longName, recipientName: c.stories.longRecipient }),
  },
  play: async ({ canvasElement }) => {
    await visibleDialog(canvasElement);
    await expect(dialog(canvasElement).getByText(c.stories.longSubject)).toBeVisible();
    await expect(dialog(canvasElement).getByRole("button", { name: c.confirm.send })).toBeEnabled();
  },
};
export const LiteralSubject: Story = {
  args: { subject: c.stories.literalSubject },
  play: async ({ canvasElement }) => {
    await visibleDialog(canvasElement);
    await expect(dialog(canvasElement).getByText(c.stories.literalSubject)).toBeVisible();
    await expect(body(canvasElement).getByRole("alertdialog").querySelector("script")).toBeNull();
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await visibleDialog(canvasElement);
    await waitFor(() => expect(body(canvasElement).getByRole("alertdialog")).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: c.confirm.send })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };

import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { MoneyText } from "@salesmora/ui";
import { estimateCapabilitiesByRole as roles, estimatePreviewData } from "../estimate-preview.data";
import type { EstimateSharingPreview, EstimateSharingRecord } from "../estimate-sharing-review";
import { estimateButton, estimateDate } from "../estimate-ui";
import { EstimatePublishDialog, type EstimatePublishDialogProps, type EstimatePublishView } from "./estimate-publish-dialog";
import { estimatePublishDialogData as c, estimatePublishFixture as estimate, estimatePublishReceiptFixture as receipt } from "./estimate-publish-dialog.data";
import { estimateRevisionReviewData as revisionCopy, estimateRevisionReviewFixture as revisionFixture } from "../estimate-revision-review/estimate-revision-review.data";

function PreviewFixture({ record = estimate, children }: { record?: EstimateSharingRecord; children?: ReactNode }) {
  return <article className="grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4">
    <h4 className="m-0 text-base font-semibold">{c.stories.previewTitle}</h4>
    <p className="m-0 text-sm leading-6 text-muted">{c.stories.previewNotice}</p>
    <p className="m-0 font-semibold">{c.stories.business}</p>
    <p className="m-0 text-sm wrap-anywhere">{record.name}</p>
    <p className="m-0 text-sm wrap-anywhere">{record.recipientName}</p>
    <p className="m-0 text-sm leading-6">{c.stories.scope}</p>
    <MoneyText cents={record.totalCents} />
    <p className="m-0 text-sm">{estimateDate(`${record.validUntil}T00:00:00Z`)}</p>
    {children}
  </article>;
}
function preview(record = estimate): Extract<EstimateSharingPreview, { state: "ready" }> {
  return { state: "ready", estimateId: record.id, version: record.version, snapshotHash: "sample-content-hash", content: <PreviewFixture record={record} /> };
}
const confirm = fn(async () => {});
const copy = fn();
const reload = fn(async () => {});
const reviewView: Extract<EstimatePublishView, { state: "review" }> = {
  state: "review", today: estimatePreviewData.today, readiness: { state: "ready" }, preview: preview(), onConfirm: confirm,
};
const published = { ...estimate, status: "published" as const, version: receipt.version };
const successView: Extract<EstimatePublishView, { state: "published" }> = {
  state: "published", receipt, link: { state: "active", expiresAt: "2026-11-19T04:59:59Z", firstViewedAt: null }, onCopyLink: copy,
};
function PublishPreview(args: EstimatePublishDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [requested, setRequested] = useState(false);
  const view: EstimatePublishView = args.view.state === "review" ? {
    ...args.view, onConfirm: args.view.onConfirm ? async (request) => {
      if (args.view.state !== "review") return;
      await args.view.onConfirm?.(request); setRequested(true);
    } : undefined,
  } : args.view;
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => setOpen(true)}>{c.stories.open}</button>
    <EstimatePublishDialog {...args} view={view} open={open} onClose={() => { setOpen(false); args.onClose(); }} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function HostConfirmedPreview(args: EstimatePublishDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const view: EstimatePublishView = confirmed ? {
    ...successView, copyState, onCopyLink: () => { copy(); setCopyState("copied"); },
  } : {
    ...reviewView, onConfirm: async (request) => {
      if (args.view.state === "review") await args.view.onConfirm?.(request);
      setConfirmed(true);
    },
  };
  return <PublishPreview {...args} estimate={confirmed ? published : args.estimate} view={view} />;
}
function ChangedPreview(args: EstimatePublishDialogProps & { change: "read" | "version" }) {
  const [changed, setChanged] = useState(false);
  const control = <button type="button" className={estimateButton} onClick={() => setChanged(true)}>{args.change === "read" ? c.stories.revoke : c.stories.change}</button>;
  const content: EstimateSharingPreview = { state: "ready", estimateId: estimate.id, version: estimate.version, snapshotHash: "sample-content-hash", content: <PreviewFixture>{control}</PreviewFixture> };
  return <PublishPreview {...args}
    estimate={changed && args.change === "version" ? { ...args.estimate, version: args.estimate.version + 1 } : args.estimate}
    capabilities={changed && args.change === "read" ? { ...args.capabilities, read: false } : args.capabilities}
    view={{ ...reviewView, preview: content }} />;
}
function PublishedAccessPreview(args: EstimatePublishDialogProps) {
  const [read, setRead] = useState(true);
  return <PublishPreview {...args} estimate={published} capabilities={{ ...args.capabilities, read }}
    view={{ ...successView, copyState: "error", copyError: c.stories.failure, onCopyLink: () => { copy(); setRead(false); } }} />;
}

const meta = {
  title: "Estimates/EstimatePublishDialog",
  component: EstimatePublishDialog,
  args: { open: true, estimate, capabilities: roles.owner, view: reviewView, onClose: fn() },
  render: (args) => <PublishPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimatePublishDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const RevisionReplacement: Story = {
  args: {
    estimate: revisionFixture.estimate,
    view: {
      ...reviewView, revision: revisionFixture.revision, paymentLink: revisionFixture.paymentLink,
      preview: { ...preview(revisionFixture.estimate), snapshotHash: "a".repeat(64) },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: revisionCopy.acknowledge }));
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith(expect.objectContaining({
      revisionReview: {
        sourceEstimateId: revisionFixture.revision.sourceEstimateId, sourceVersion: revisionFixture.revision.sourceVersion,
        paymentLinkReviewed: true,
      },
    }));
  },
};
function body(element: HTMLElement) { return within(element.ownerDocument.body); }
async function dialog(element: HTMLElement) {
  const root = await body(element).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
async function blocked(element: HTMLElement, message?: string) {
  const canvas = await dialog(element);
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  if (message) await expect(canvas.getByText(message)).toBeVisible();
}

export const Review: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
    await expect(canvas.getByText(c.stories.previewNotice)).toBeVisible();
    await waitFor(() => expect(body(canvasElement).getByRole("alertdialog")).toHaveFocus());
  },
};
export const RequestDoesNotImplySuccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith({ estimateId: estimate.id, expectedVersion: estimate.version, snapshotHash: "sample-content-hash" });
    await expect(canvas.queryByText(c.publishedDescription)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const HostConfirmedPublication: Story = {
  render: (args) => <HostConfirmedPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await waitFor(() => expect(body(canvasElement).getByRole("heading", { name: c.publishedTitle })).toBeVisible());
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.publishedDescription)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.copy })).toBeEnabled();
    await expect(canvas.queryByRole("button", { name: c.confirm })).not.toBeInTheDocument();
    await expect(copy).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: c.copy }));
    await expect(copy).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.copied);
  },
};
export const InteractiveHostFlow: Story = {
  args: { open: false },
  render: (args) => <HostConfirmedPreview {...args} />,
};
export const Published: Story = {
  args: { estimate: published, view: successView },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.publishedDescription)).toBeVisible();
    await expect(canvas.getByText(c.publishedLabel)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.copy })).toBeEnabled();
    await expect(canvas.queryByText(c.copied)).not.toBeInTheDocument();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const CopyRequestOnly: Story = {
  args: Published.args,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.copy }));
    await expect(copy).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByText(c.copied)).not.toBeInTheDocument();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const CopyPending: Story = {
  args: { estimate: published, view: { ...successView, copyState: "pending" } },
  play: async ({ canvasElement, args }) => {
    for (const button of (await dialog(canvasElement)).getAllByRole("button")) { await expect(button).toBeDisabled(); fireEvent.click(button); }
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(copy).not.toHaveBeenCalled();
  },
};
export const Copied: Story = {
  args: { estimate: published, view: { ...successView, copyState: "copied" } },
  play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByRole("status")).toHaveTextContent(c.copied); },
};
export const CopyFailedRetry: Story = {
  args: { estimate: published, view: { ...successView, copyState: "error" } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.copyError);
    await userEvent.click(canvas.getByRole("button", { name: c.copy }));
    await expect(copy).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Done: Story = {
  args: Published.args,
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.done }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
    await expect(copy).not.toHaveBeenCalled();
  },
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
export const NoEmailRequired: Story = {
  args: { estimate: { ...estimate } }, play: Review.play,
};
export const NoSendPermission: Story = {
  args: { capabilities: { ...roles.owner, send: false } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.permission); },
};
export const ReadOnlyPublishedCopy: Story = {
  args: { ...Published.args, capabilities: { ...roles.owner, send: false } }, play: Published.play,
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, view: { ...reviewView, readiness: { state: "blocked", issues: [c.stories.profileIssue] }, error: { kind: "conflict", message: c.stories.conflict } } },
  play: async ({ canvasElement }) => {
    await blocked(canvasElement, c.errors.read);
    const canvas = await dialog(canvasElement);
    for (const text of [c.stories.name, c.stories.profileIssue, c.stories.conflict, c.stories.previewNotice])
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
  },
};
export const NoReadPublished: Story = {
  args: { estimate: published, capabilities: { ...roles.owner, read: false }, view: { ...successView, copyState: "error", copyError: c.stories.failure } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.errors.read);
    await expect(canvas.queryByText(c.publishedDescription)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.failure)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const PublishedAccessRevoked: Story = {
  render: (args) => <PublishedAccessPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.copy }));
    await expect(copy).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.errors.read);
    await expect(canvas.queryByText(c.stories.failure)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.name)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived); },
};
export const AlreadyPublished: Story = {
  args: { estimate: published },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.status); },
};
export const WrongReceipt: Story = {
  args: { estimate: published, view: { ...successView, receipt: { ...receipt, estimateId: "another-record" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.successMismatch);
    await expect(canvas.queryByText(c.publishedDescription)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const ExpiredLink: Story = {
  args: { estimate: published, view: { ...successView, link: { ...successView.link, state: "expired" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.inactiveLink)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const ArchivedPublished: Story = {
  args: { estimate: { ...published, archived: true }, view: successView },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.archived)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const NoCopyHandler: Story = {
  args: { estimate: published, view: { ...successView, onCopyLink: undefined } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.copyUnavailable)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.copy })).not.toBeInTheDocument();
  },
};
export const MissingPreview: Story = {
  args: { view: { ...reviewView, preview: null } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.previewMissing); },
};
export const LoadingPreview: Story = {
  args: { view: { ...reviewView, preview: { state: "loading" } } },
  play: async ({ canvasElement }) => { await blocked(canvasElement); await expect((await dialog(canvasElement)).getByRole("status")).toHaveTextContent(c.previewLoading); },
};
export const FailedPreview: Story = {
  args: { view: { ...reviewView, preview: { state: "error" } } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.previewError); },
};
export const StalePreview: Story = {
  args: { estimate: { ...estimate, version: 6 } },
  play: async ({ canvasElement }) => {
    await blocked(canvasElement, c.errors.previewStale);
    await expect((await dialog(canvasElement)).queryByRole("region", { name: c.preview })).not.toBeInTheDocument();
  },
};
export const MissingBusinessProfile: Story = {
  args: { view: { ...reviewView, readiness: { state: "blocked", issues: [c.stories.profileIssue] } } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.stories.profileIssue); },
};
export const InvalidItems: Story = {
  args: { view: { ...reviewView, readiness: { state: "blocked", issues: [c.stories.itemsIssue] } } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.stories.itemsIssue); },
};
export const PastValidity: Story = {
  args: { estimate: { ...estimate, validUntil: "2026-10-21" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.past); },
};
export const ZeroTotal: Story = {
  args: { estimate: { ...estimate, totalCents: 0 }, view: { ...reviewView, preview: preview({ ...estimate, totalCents: 0 }) } }, play: Review.play,
};
export const MaximumTotal: Story = {
  args: { estimate: { ...estimate, totalCents: 2_000_000_000 }, view: { ...reviewView, preview: preview({ ...estimate, totalCents: 2_000_000_000 }) } }, play: Review.play,
};
export const Conflict: Story = {
  args: { view: { ...reviewView, error: { kind: "conflict", message: c.stories.conflict }, onReload: reload } },
  play: async ({ canvasElement }) => {
    await blocked(canvasElement, c.stories.conflict);
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await blocked(canvasElement);
  },
};
export const ReloadFailed: Story = {
  args: { view: { ...reviewView, preview: null, onReload: fn(async () => { throw new Error(c.stories.rejection); }) } },
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.reloadFailed);
  },
};
export const ServerError: Story = {
  args: { view: { ...reviewView, error: { kind: "error", message: c.stories.failure } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
const retry = fn(async () => {});
export const RejectAndRetry: Story = {
  args: { view: { ...reviewView, onConfirm: retry } },
  play: async ({ canvasElement }) => {
    retry.mockRejectedValueOnce(new Error(c.stories.rejection));
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    for (const button of (await dialog(canvasElement)).getAllByRole("button")) { await expect(button).toBeDisabled(); fireEvent.click(button); }
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled(); await expect(confirm).not.toHaveBeenCalled();
  },
};
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { view: { ...reviewView, onConfirm: heldConfirm } },
  play: async ({ canvasElement }) => {
    await userEvent.dblClick((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
    await expect((await dialog(canvasElement)).getByRole("button", { name: c.pending })).toBeDisabled();
  },
};
export const NotConnected: Story = {
  args: { view: { ...reviewView, onConfirm: undefined } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.noHandler); },
};
export const AccessRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.stories.revoke }));
    await blocked(canvasElement, c.errors.read);
    await expect((await dialog(canvasElement)).queryByText(c.stories.name)).not.toBeInTheDocument();
  },
};
export const RecordChanged: Story = {
  render: (args) => <ChangedPreview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.stories.change }));
    await blocked(canvasElement, c.errors.previewStale);
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Review.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Review.play };
export const FieldAssignedJob: Story = { args: { capabilities: roles.field }, play: Review.play };
const longRecord = { ...estimate, name: c.stories.longName, recipientName: c.stories.longCustomer };
export const LongContent: Story = { args: { estimate: longRecord, view: { ...reviewView, preview: preview(longRecord) } }, play: Review.play };
export const LiteralName: Story = {
  args: { estimate: { ...estimate, name: c.stories.literalName }, view: { ...reviewView, preview: preview({ ...estimate, name: c.stories.literalName }) } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getAllByText(c.stories.literalName)).toHaveLength(2);
    await expect(body(canvasElement).getByRole("alertdialog").querySelector("script")).toBeNull();
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await waitFor(() => expect(body(canvasElement).getByRole("alertdialog")).toHaveFocus());
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus();
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.confirm })).toHaveFocus();
    await userEvent.keyboard("{Enter}"); await expect(confirm).toHaveBeenCalledTimes(1);
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };

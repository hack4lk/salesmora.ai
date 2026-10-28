import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateButton } from "../estimate-ui";
import { EstimateDeliveryCard, type EstimateDeliveryCardProps } from "./estimate-delivery-card";
import { estimateDeliveryCardData as c, estimateDeliveryFixture as delivery } from "./estimate-delivery-card.data";
import type { EstimateDeliveryAction, EstimateEmailState } from "./estimate-delivery-card.preview";

function DeliveryPreview({ revokeAccess = false, ...args }: EstimateDeliveryCardProps & { revokeAccess?: boolean }) {
  const [requested, setRequested] = useState(false);
  const [revoked, setRevoked] = useState(false);
  return <div className="grid min-w-0 gap-4">
    <EstimateDeliveryCard {...args} capabilities={revoked ? { ...args.capabilities, read: false } : args.capabilities}
      onReviewResend={args.onReviewResend ? () => { setRequested(true); args.onReviewResend?.(); } : undefined} />
    {requested && !revoked && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.stories.requested}</p>}
    {revokeAccess && !revoked && <button type="button" className={estimateButton} onClick={() => setRevoked(true)}>{c.stories.revoke}</button>}
  </div>;
}

function CopyPreview(args: EstimateDeliveryCardProps) {
  const [copyState, setCopyState] = useState<EstimateDeliveryCardProps["copyState"]>("idle");
  return <div className="grid min-w-0 gap-4">
    <EstimateDeliveryCard {...args} copyState={copyState} onCopyLink={() => {
      args.onCopyLink?.();
      setCopyState("pending");
    }} />
    {copyState === "pending" && <button type="button" className={estimateButton} onClick={() => setCopyState("copied")}>{c.stories.copied}</button>}
  </div>;
}

const meta = {
  title: "Estimates/EstimateDeliveryCard",
  component: EstimateDeliveryCard,
  args: {
    status: "sent", capabilities: roles.owner, delivery, timezone: c.stories.timezone,
    onCopyLink: fn(), onReviewResend: fn(),
  },
  render: (args) => <DeliveryPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-lg bg-canvas p-4 sm:p-8">
    <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof EstimateDeliveryCard>;
export default meta;
type Story = StoryObj<typeof meta>;

function attempt(state: EstimateEmailState) {
  return { ...delivery, email: { state, recipientEmail: c.stories.email, updatedAt: "2026-10-22T18:00:00Z", failureMessage: c.stories.failure } };
}
async function expectActions(element: HTMLElement, actions: readonly EstimateDeliveryAction[]) {
  const group = within(element).queryByRole("group", { name: c.actionsLabel });
  if (!actions.length) { await expect(group).not.toBeInTheDocument(); return; }
  await expect(group).not.toBeNull();
  if (group) await expect(within(group).getAllByRole("button").map((button) => button.textContent)).toEqual(actions.map((action) => c.actions[action]));
}
async function expectPrivate(element: HTMLElement) {
  const canvas = within(element);
  await expect(canvas.getByText(c.unavailable)).toBeVisible();
  await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.failure)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(element.querySelector("time")).toBeNull();
}

export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectActions(canvasElement, ["copy-link", "review-resend"]);
    await expect(canvas.getByText(c.stories.email)).toBeVisible();
    await expect(canvas.getByText(c.emailStates.sent.label, { exact: true })).toBeVisible();
    await expect(canvas.getByText(c.sentHint)).toBeVisible();
    await expect(canvas.getByText(c.noView, { exact: true })).toBeVisible();
    await expect(canvas.queryByText(c.copied)).not.toBeInTheDocument();
  },
};
export const Draft: Story = {
  args: { status: "draft", delivery: { email: { state: "not-sent" }, link: { state: "not-created", expiresAt: null, firstViewedAt: null } } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.draft)).toBeVisible();
    await expect(within(canvasElement).getByText(c.noEmail)).toBeVisible();
    await expect(within(canvasElement).queryByText(c.recipient)).not.toBeInTheDocument();
  },
};
export const Published: Story = {
  args: { status: "published", delivery: { ...delivery, email: { state: "not-sent" } } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["copy-link"]);
    await expect(within(canvasElement).getByText(c.published)).toBeVisible();
    await expect(within(canvasElement).getByText(c.noEmail)).toBeVisible();
  },
};
export const Queued: Story = {
  args: { delivery: attempt("queued") },
  play: async ({ canvasElement, args }) => {
    await expectActions(canvasElement, ["copy-link"]);
    await expect(within(canvasElement).getByText(c.queuedHint)).toBeVisible();
    await expect(args.onReviewResend).not.toHaveBeenCalled();
  },
};
export const RetryScheduled: Story = {
  args: {
    delivery: {
      ...delivery, email: {
        state: "queued", recipientEmail: c.stories.email, updatedAt: "2026-10-22T18:00:00Z",
        attemptCount: 2, nextAttemptAt: "2026-10-22T18:03:00Z",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.retryCount(2))).toBeVisible();
    await expect(canvas.getByText(/Next automatic attempt/)).toBeVisible();
    await expectActions(canvasElement, ["copy-link"]);
  },
};
export const Failed: Story = {
  args: { delivery: attempt("failed") },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["copy-link", "review-resend"]);
    await expect(within(canvasElement).getByText(c.stories.failure)).toBeVisible();
    await expect(within(canvasElement).getByText(c.failureHint)).toBeVisible();
  },
};
export const Bounced: Story = { args: { delivery: attempt("bounced") }, play: Failed.play };
export const Viewed: Story = {
  args: { delivery: { ...delivery, link: { ...delivery.link, firstViewedAt: "2026-10-22T19:30:00Z" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Oct 22, 2026, 3:30 PM EDT")).toBeVisible();
    await expect(within(canvasElement).getByText(c.noViewHint)).toBeVisible();
    await expect(within(canvasElement).getByText(c.emailStates.sent.label, { exact: true })).toBeVisible();
  },
};
export const Accepted: Story = {
  args: { status: "accepted" },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["copy-link"]); },
};
export const Declined: Story = { args: { status: "declined" }, play: Accepted.play };
export const Expired: Story = {
  args: { status: "expired", delivery: { ...delivery, link: { ...delivery.link, state: "expired" } } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.inactiveRecord)).toBeVisible();
  },
};
export const Superseded: Story = {
  args: { status: "superseded", delivery: { ...delivery, link: { ...delivery.link, state: "replaced" } } }, play: Expired.play,
};
export const Void: Story = {
  args: { status: "void", delivery: { ...delivery, link: { ...delivery.link, state: "revoked" } } }, play: Expired.play,
};
export const Archived: Story = {
  args: { status: "declined", archived: true },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.archived)).toBeVisible();
  },
};
export const RevokedLink: Story = {
  args: { delivery: { ...delivery, link: { ...delivery.link, state: "revoked" } } },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, []); },
};
export const UnavailableLink: Story = {
  args: { delivery: { ...delivery, link: { state: "unavailable", expiresAt: null, firstViewedAt: null } } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.expiryUnavailable)).toBeVisible();
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Sent.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Sent.play };
export const FieldAssignedJob: Story = { args: { capabilities: roles.field }, play: Sent.play };
export const ReadOnly: Story = {
  args: { capabilities: { read: true, create: false, update: false, send: false, decide: false, void: false, archive: false, delete: false, export: false } },
  play: Accepted.play,
};
export const NoSendPermission: Story = { args: { capabilities: { ...roles.owner, send: false } }, play: Accepted.play };
export const NoReadAccess: Story = {
  args: {
    capabilities: { ...roles.owner, read: false }, delivery: attempt("failed"), timezone: "Invalid/Workspace",
    state: "error", error: c.stories.failure, actionError: c.stories.actionError, copyState: "error", copyError: c.copyError, onRetry: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await expectPrivate(canvasElement);
    await expect(args.onCopyLink).not.toHaveBeenCalled();
    await expect(args.onReviewResend).not.toHaveBeenCalled();
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
export const AccessRevoked: Story = {
  render: (args) => <DeliveryPreview {...args} revokeAccess />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.stories.revoke }));
    await expectPrivate(canvasElement);
  },
};
export const Loading: Story = {
  args: { state: "loading", delivery: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.loading);
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LoadError: Story = {
  args: { state: "error", error: c.loadError, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.loadError);
    await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const MissingDelivery: Story = {
  args: { delivery: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.missing);
    await expectActions(canvasElement, []);
  },
};
export const RetryPending: Story = {
  args: { state: "error", pending: true, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.retry });
    await expect(button).toBeDisabled(); fireEvent.click(button);
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    for (const button of within(canvasElement).getAllByRole("button")) { await expect(button).toBeDisabled(); fireEvent.click(button); }
    await expect(args.onCopyLink).not.toHaveBeenCalled();
    await expect(args.onReviewResend).not.toHaveBeenCalled();
  },
};
export const CopyPending: Story = { args: { copyState: "pending" }, play: Pending.play };
export const RequestCopyOnly: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions["copy-link"] }));
    await expect(args.onCopyLink).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).queryByText(c.copied)).not.toBeInTheDocument();
  },
};
export const CopyConfirmedByHost: Story = {
  render: (args) => <CopyPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.actions["copy-link"] }));
    await expect(args.onCopyLink).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.copying);
    await expect(canvas.queryByText(c.copied)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.actions["review-resend"] })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.stories.copied }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.copied);
    await expect(canvas.getByRole("button", { name: c.actions["copy-link"] })).toBeEnabled();
  },
};
export const CopyFailed: Story = {
  args: { copyState: "error" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.copyError);
    await expect(canvas.queryByText(c.copied)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.actions["copy-link"] }));
    await expect(args.onCopyLink).toHaveBeenCalledTimes(1);
  },
};
export const RequestResendReview: Story = {
  args: { delivery: attempt("failed") },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.actions["review-resend"] }));
    await expect(args.onReviewResend).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested);
    await expect(canvas.getByText(c.emailStates.failed.label, { exact: true })).toBeVisible();
    await expect(canvas.getByText(c.stories.email)).toBeVisible();
    await expect(args.onCopyLink).not.toHaveBeenCalled();
  },
};
export const CorrectedDeliveryRecipient: Story = {
  args: { delivery: { ...delivery, email: { state: "sent", recipientEmail: c.stories.correctedEmail, updatedAt: "2026-10-22T20:00:00Z" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.stories.correctedEmail)).toBeVisible();
    await expect(within(canvasElement).getByText(c.recipientHint)).toBeVisible();
    await expect(within(canvasElement).getByText(c.resendHint)).toBeVisible();
  },
};
export const ActionError: Story = {
  args: { actionError: c.stories.actionError },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.stories.actionError);
    await expect(within(canvasElement).getByText(c.stories.email)).toBeVisible();
  },
};
export const NotConnected: Story = {
  args: { onCopyLink: undefined, onReviewResend: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.noHandlers)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const PartialConnection: Story = {
  args: { onReviewResend: undefined },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["copy-link"]);
    await expect(within(canvasElement).getByText(c.noHandlers)).toBeVisible();
  },
};
export const MissingRecipient: Story = {
  args: { delivery: { ...delivery, email: { state: "failed", recipientEmail: "", updatedAt: "2026-10-22T18:00:00Z" } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(c.recipientMissing)).toBeVisible(); },
};
export const InvalidTimezone: Story = {
  args: { timezone: "Invalid/Workspace" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.timezoneError);
    await expect(within(canvasElement).getAllByText(c.timeUnavailable)).toHaveLength(2);
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
export const InvalidTimestamp: Story = {
  args: { delivery: { ...delivery, email: { state: "sent", recipientEmail: c.stories.email, updatedAt: "2026-02-30T00:00:00Z" } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(c.timeUnavailable)).toBeVisible(); },
};
export const DaylightSaving: Story = {
  args: { delivery: {
    email: { state: "sent", recipientEmail: c.stories.email, updatedAt: "2026-11-01T05:30:00Z" },
    link: { ...delivery.link, firstViewedAt: "2026-11-01T06:30:00Z" },
  } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Nov 1, 2026, 1:30 AM EDT")).toBeVisible();
    await expect(within(canvasElement).getByText("Nov 1, 2026, 1:30 AM EST")).toBeVisible();
  },
};
export const LiteralFailure: Story = {
  args: { delivery: { ...delivery, email: { state: "failed", recipientEmail: c.stories.email, updatedAt: "2026-10-22T18:00:00Z", failureMessage: c.stories.literalFailure } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText((_, element) => element?.textContent === c.stories.literalFailure)).toBeVisible();
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};
export const LongContent: Story = {
  args: { delivery: { ...delivery, email: { state: "bounced", recipientEmail: c.stories.longEmail, updatedAt: "2026-10-22T18:00:00Z", failureMessage: c.stories.longFailure } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.stories.longEmail)).toBeVisible();
    await expectActions(canvasElement, ["copy-link", "review-resend"]);
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), copy = canvas.getByRole("button", { name: c.actions["copy-link"] });
    await userEvent.tab(); await expect(copy).toHaveFocus();
    await expect(copy).toHaveClass("focus-visible:focus-ring");
    await userEvent.keyboard("{Enter}"); await expect(args.onCopyLink).toHaveBeenCalledTimes(1);
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.actions["review-resend"] })).toHaveFocus();
    await userEvent.keyboard(" "); await expect(args.onReviewResend).toHaveBeenCalledTimes(1);
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };
export const PaperExcluded: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("region", { name: c.title })).toHaveClass("print:hidden");
  },
};

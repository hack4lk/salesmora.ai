import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateCapabilitiesByRole } from "../estimate-preview.data";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimatePaperSnapshotFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import { EstimateSendCard } from "./estimate-send-card";
import {
  estimateSendCardCapabilitiesFixture as capabilities, estimateSendCardContextFixture,
  estimateSendCardData as c, estimateSendProposalFixture,
} from "./estimate-send-card.data";
import { estimateSendCardRequest } from "./estimate-send-card.preview";
import type { EstimateSendCardContext, EstimateSendCardProps, EstimateSendProposal } from "./estimate-send-card.types";

function readyContext(proposal: EstimateSendProposal, relatedRecord = estimatePaperSnapshotFixture.content.relatedRecord): EstimateSendCardContext {
  const context = estimateSendCardContextFixture(proposal);
  const content = {
    ...structuredClone(estimatePaperSnapshotFixture.content), number: proposal.estimate.number, revision: proposal.estimate.revision,
    name: proposal.estimate.name, recipientName: proposal.estimate.recipientName,
    recipientEmail: proposal.estimate.recipientEmail, validUntil: proposal.estimate.validUntil, relatedRecord,
  };
  context.preview = {
    state: "ready", estimateId: proposal.estimate.id, version: proposal.estimate.version, snapshotHash: proposal.snapshotHash,
    content: <EstimatePreviewPaper showPrintControl={false} source={{
      ...structuredClone(estimatePaperSnapshotFixture), estimateId: proposal.estimate.id,
      version: proposal.estimate.version, snapshotHash: proposal.snapshotHash, content,
    }} />,
  };
  return context;
}
function fresh(proposal: EstimateSendProposal) {
  const now = Date.now(), duration = Date.parse(proposal.expiresAt) - Date.parse(proposal.createdAt);
  return Number.isFinite(duration) ? {
    ...proposal, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + duration).toISOString(),
  } : proposal;
}
function Preview(args: EstimateSendCardProps) {
  const [proposal] = useState(() => fresh(args.proposal));
  return <EstimateSendCard {...args} proposal={proposal} />;
}
const proposal = estimateSendProposalFixture();
const meta = {
  title: "Assistant/EstimateSendCard", component: EstimateSendCard,
  args: {
    proposal, context: readyContext(proposal), capabilities, parentAccess: true,
    onDecide: fn<NonNullable<EstimateSendCardProps["onDecide"]>>(async () => ({ ok: true })),
  },
  render: (args) => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateSendCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(change: (proposal: EstimateSendProposal, context: EstimateSendCardContext) => void): Story {
  const proposal = estimateSendProposalFixture(), context = readyContext(proposal);
  change(proposal, context);
  return { args: { proposal, context } };
}
const blocked: Story["play"] = async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
const unavailable: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
  await expect(canvas.queryByText(proposal.estimate.name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(proposal.estimate.recipientEmail)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
export const Review: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), card = within(canvas.getByRole("region", { name: c.title }));
  await expect(card.getAllByText(proposal.estimate.recipientEmail)[0]).toBeVisible();
  await expect(card.getByText(c.stories.subject)).toBeVisible();
  await expect(card.getAllByText("$969.17")[0]).toBeVisible();
  await expect(card.getByRole("article")).toBeVisible();
  await expect(card.getByRole("button", { name: c.confirm })).toBeEnabled();
  await expect(card.queryByRole("textbox")).not.toBeInTheDocument();
} };
export const ConfirmRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateSendCardRequest(args.proposal), decision: "confirm" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.confirmed)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: c.confirm })).not.toBeInTheDocument();
} };
export const CancelRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateSendCardRequest(args.proposal), decision: "cancel" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.cancelled)).not.toBeInTheDocument();
} };
export const PreviewOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), summary = canvas.getByText(c.preview, { exact: true });
  await userEvent.click(summary);
  await expect(canvas.getByRole("article", { hidden: true })).not.toBeVisible();
  await userEvent.click(summary);
  await expect(canvas.getByRole("article")).toBeVisible();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const UnsavedChanges: Story = { ...sample((_, context) => { context.unsavedChanges = true; }), play: async (args) => {
  await blocked(args);
  await expect(within(args.canvasElement).getByText(c.errors.unsaved)).toBeVisible();
} };
export const MissingBusinessProfile: Story = { ...sample((_, context) => {
  context.readiness = { state: "blocked", issues: [c.stories.profileIssue] };
}), play: blocked };
export const IncompleteItems: Story = { ...sample((_, context) => {
  context.readiness = { state: "blocked", issues: [c.stories.itemIssue] };
}), play: blocked };
export const BlockedWithoutDetails: Story = { ...sample((_, context) => { context.readiness = { state: "blocked", issues: [] }; }), play: blocked };
export const InvalidEmail: Story = { ...sample((proposal, context) => {
  proposal.estimate.recipientEmail = c.stories.invalidEmail; context.estimate.recipientEmail = c.stories.invalidEmail;
}), play: blocked };
export const InvalidSubject: Story = { ...sample((proposal, context) => {
  proposal.subject = ""; context.subject = "";
}), play: blocked };
export const SubjectHeaderInjection: Story = { ...sample((proposal, context) => {
  proposal.subject = `${c.stories.subject}\r\n${c.stories.subject}`; context.subject = proposal.subject;
}), play: blocked };
export const MissingTotal: Story = { ...sample((proposal, context) => {
  proposal.estimate.totalCents = null; context.estimate.totalCents = null;
}), play: blocked };
export const InvalidTotal: Story = { ...sample((proposal, context) => {
  proposal.estimate.totalCents = -1; context.estimate.totalCents = -1;
}), play: blocked };
export const MissingDate: Story = { ...sample((proposal, context) => {
  proposal.estimate.validUntil = ""; context.estimate.validUntil = "";
}), play: blocked };
export const PastWorkspaceDate: Story = { ...sample((_, context) => { context.today = "2026-11-22"; }), play: blocked };
export const ValidOnWorkspaceToday: Story = { ...sample((_, context) => { context.today = "2026-11-21"; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole("button", { name: c.confirm })).toBeEnabled();
} };
export const MissingWorkspaceDate: Story = { ...sample((_, context) => { context.today = ""; }), play: blocked };
export const NoReadAccess: Story = { args: { capabilities: { ...capabilities, read: false } }, play: unavailable };
export const Admin: Story = { args: { capabilities: estimateCapabilitiesByRole.admin } };
export const Office: Story = { args: { capabilities: estimateCapabilitiesByRole.office } };
export const FieldAssignedJob: Story = {
  args: { capabilities: estimateCapabilitiesByRole.field, context: readyContext(proposal, c.stories.job) },
};
export const FieldOutOfScope: Story = { args: { capabilities: estimateCapabilitiesByRole.field, parentAccess: false }, play: unavailable };
export const NoParentAccess: Story = { args: { parentAccess: false }, play: unavailable };
export const NoSendPermission: Story = { args: { capabilities: { ...capabilities, send: false } }, play: blocked };
export const SendWithoutEditGrant: Story = { args: { capabilities: { ...capabilities, update: false, create: false } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole("button", { name: c.confirm })).toBeEnabled();
} };
export const MissingHostBinding: Story = { args: { context: null }, play: blocked };
export const StaleEstimateVersion: Story = { ...sample((_, context) => { context.estimate.version = 4; }), play: blocked };
export const StaleProposalHash: Story = { ...sample((_, context) => { context.inputHash = "e".repeat(64); }), play: blocked };
export const ChangedPolicyOrMembership: Story = { ...sample((_, context) => { context.authorizationVersion = "policy-2:membership-2"; }), play: blocked };
export const ChangedDestination: Story = { ...sample((_, context) => { context.estimate.recipientEmail = "changed@example.com"; }), play: blocked };
export const ChangedSubject: Story = { ...sample((_, context) => { context.subject = c.stories.longSubject; }), play: blocked };
export const ChangedSnapshot: Story = { ...sample((_, context) => { context.snapshotHash = "e".repeat(64); }), play: blocked };
export const StalePreview: Story = { ...sample((_, context) => {
  if (context.preview?.state === "ready") context.preview = { ...context.preview, snapshotHash: "e".repeat(64) };
}), play: async (args) => {
  await blocked(args); await expect(within(args.canvasElement).queryByRole("article")).not.toBeInTheDocument();
} };
export const MissingPreview: Story = { ...sample((_, context) => { context.preview = null; }), play: blocked };
export const PreviewLoading: Story = { ...sample((_, context) => { context.preview = { state: "loading" }; }), play: blocked };
export const PreviewError: Story = { ...sample((_, context) => { context.preview = { state: "error" }; }), play: blocked };
export const SentRecord: Story = { ...sample((proposal, context) => {
  proposal.estimate.status = "sent"; context.estimate.status = "sent";
}), play: blocked };
export const ArchivedDraft: Story = { ...sample((proposal, context) => {
  proposal.estimate.archived = true; context.estimate.archived = true;
}), play: blocked };
export const InvalidHash: Story = { ...sample((proposal) => { proposal.inputHash = ""; }), play: blocked };
export const InvalidReviewWindow: Story = { ...sample((proposal) => {
  proposal.expiresAt = new Date(Date.parse(proposal.createdAt) + 900001).toISOString();
}), play: blocked };
export const Expired: Story = { ...sample((proposal) => { proposal.expiresAt = proposal.createdAt; }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ExpiresWhileOpen: Story = { ...sample((proposal) => {
  proposal.expiresAt = new Date(Date.parse(proposal.createdAt) + 1500).toISOString();
}), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired), { timeout: 5000 });
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const PendingSingleFlight: Story = {
  args: { onDecide: fn<NonNullable<EstimateSendCardProps["onDecide"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm }));
    await expect(args.onDecide).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
  },
};
export const OperationFailure: Story = {
  args: { onDecide: fn<NonNullable<EstimateSendCardProps["onDecide"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const RetryFailure: Story = { play: async ({ canvasElement, args }) => {
  args.onDecide?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2);
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const ThrownFailure: Story = {
  args: { onDecide: fn<NonNullable<EstimateSendCardProps["onDecide"]>>(async () => { throw Error("Sample failure"); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const MissingCallback: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), confirm = canvas.getByRole("button", { name: c.confirm });
  confirm.focus(); await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const Confirmed: Story = sample((proposal) => { proposal.state = "confirmed"; });
export const Cancelled: Story = sample((proposal) => { proposal.state = "cancelled"; });
export const Superseded: Story = sample((proposal) => { proposal.state = "superseded"; });
export const Conflict: Story = sample((proposal) => { proposal.state = "conflict"; });
export const Forbidden: Story = { ...sample((proposal) => { proposal.state = "forbidden"; }), play: unavailable };
export const LongContent: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longName; proposal.estimate.recipientName = c.stories.longRecipient;
  proposal.subject = c.stories.longSubject;
  Object.assign(context, readyContext(proposal));
});
export const UnbrokenContent: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longWord.slice(0, 120);
  proposal.subject = c.stories.longWord;
  Object.assign(context, readyContext(proposal));
});
export const LiteralSubject: Story = { ...sample((proposal, context) => {
  proposal.subject = c.stories.literal; context.subject = proposal.subject;
}), play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByText(c.stories.literal)).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
type Change = "read" | "parent" | "grant" | "version" | "policy" | "snapshot" | "proposal" | "recipient";
const changeLabel = {
  read: c.stories.revoke, parent: c.stories.loseParent, grant: c.stories.loseSend, version: c.stories.version,
  policy: c.stories.policy, snapshot: c.stories.snapshot, proposal: c.stories.replace, recipient: c.stories.recipient,
};
function RacePreview({ change, ...args }: EstimateSendCardProps & { change: Change }) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal));
  const [context, setContext] = useState(args.context);
  const [access, setAccess] = useState({ capabilities: args.capabilities, parentAccess: args.parentAccess });
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setAccess({ ...access, capabilities: { ...access.capabilities, read: false } });
        if (change === "parent") setAccess({ ...access, parentAccess: false });
        if (change === "grant") setAccess({ ...access, capabilities: { ...access.capabilities, send: false } });
        if (change === "version" && context) setContext({ ...context, estimate: { ...context.estimate, version: 4 } });
        if (change === "recipient" && context) setContext({ ...context, estimate: { ...context.estimate, recipientEmail: "changed@example.com" } });
        if (change === "policy" && context) setContext({ ...context, authorizationVersion: "policy-2:membership-2" });
        if (change === "snapshot" && context) setContext({ ...context, snapshotHash: "e".repeat(64) });
        if (change === "proposal") {
          const next = fresh(proposal); next.id = "new-send-proposal"; next.inputHash = "e".repeat(64);
          setProposal(next); setContext(readyContext(next));
        }
      }}>{changeLabel[change]}</button>
      <button type="button" className={control} onClick={() => release.current?.({ ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateSendCard {...args} {...access} proposal={proposal} context={context} onDecide={async (request) => {
      await args.onDecide?.(request);
      return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
function race(change: Change): Story {
  return {
    render: (args) => <RacePreview {...args} change={change} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
      await expect(args.onDecide).toHaveBeenCalledTimes(1);
      await userEvent.click(canvas.getByRole("button", { name: changeLabel[change] }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
      if (change === "read" || change === "parent") await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
      else if (change === "proposal") await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
      else await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    },
  };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const SendRevokedWhilePending: Story = race("grant");
export const VersionChangedWhilePending: Story = race("version");
export const PolicyChangedWhilePending: Story = race("policy");
export const SnapshotChangedWhilePending: Story = race("snapshot");
export const RecipientChangedWhilePending: Story = race("recipient");
export const ProposalReplacedWhilePending: Story = race("proposal");
function HostPreview(args: EstimateSendCardProps) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => setProposal({ ...proposal, state: "confirmed" })}>{c.stories.hostConfirm}</button>
    <EstimateSendCard {...args} proposal={proposal} />
  </div>;
}
export const AuthoritativeHostOutcome: Story = { render: (args) => <HostPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.hostConfirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.confirmed);
  await expect(canvas.queryByRole("button", { name: c.confirm })).not.toBeInTheDocument();
} };
function Conversation(args: EstimateSendCardProps) {
  const [open, setOpen] = useState(true), [proposal] = useState(() => fresh(args.proposal));
  return <AssistantPanel open={open} onOpenChange={setOpen} sendDisabled contextLabel={proposal.estimate.number}
    onSend={async () => ({ ok: false, message: c.stories.notice })}
    messages={[{ id: "sample-send-proposal", role: "assistant", text: c.stories.notice }]}
    renderMessageSupplement={() => <EstimateSendCard {...args} proposal={proposal} />} />;
}
export const InsideAssistant: Story = { render: (args) => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.yes);
  await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).not.toHaveBeenCalled();
} };

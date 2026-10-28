import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateDecisionDialogData as dialog } from "../estimate-decision-dialog/estimate-decision-dialog.data";
import { EstimateDecisionCard } from "./estimate-decision-card";
import { estimateDecisionCardContextFixture, estimateDecisionCardData as c, estimateDecisionProposalFixture } from "./estimate-decision-card.data";
import { estimateDecisionCardRequest } from "./estimate-decision-card.preview";
import type { EstimateDecisionCardContext, EstimateDecisionCardProps, EstimateDecisionProposal } from "./estimate-decision-card.types";

function fresh(proposal: EstimateDecisionProposal) {
  const duration = Date.parse(proposal.expiresAt) - Date.parse(proposal.createdAt), now = Date.now();
  return Number.isFinite(duration) ? {
    ...proposal, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + duration).toISOString(),
  } : proposal;
}
function Preview(args: EstimateDecisionCardProps) {
  const [proposal] = useState(() => fresh(args.proposal));
  return <EstimateDecisionCard {...args} proposal={proposal} />;
}
const proposal = estimateDecisionProposalFixture();
const meta = {
  title: "Assistant/EstimateDecisionCard", component: EstimateDecisionCard,
  args: {
    proposal, context: estimateDecisionCardContextFixture(proposal), capabilities: roles.owner, parentAccess: true,
    canCorrectDecision: true,
    onDecide: fn<NonNullable<EstimateDecisionCardProps["onDecide"]>>(async () => ({ ok: true })),
  },
  render: (args) => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateDecisionCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(change: (proposal: EstimateDecisionProposal, context: EstimateDecisionCardContext) => void, mode: EstimateDecisionProposal["mode"] = "record"): Story {
  const proposal = estimateDecisionProposalFixture(mode), context = estimateDecisionCardContextFixture(proposal);
  change(proposal, context);
  return { args: { proposal, context } };
}
const blocked: Story["play"] = async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole("button", { name: c.confirm[args.proposal.mode] })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
const unavailable: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
  await expect(canvas.queryByText(proposal.estimate.name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.note)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
export const RecordAccepted: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("region", { name: c.proposed })).toHaveTextContent(c.outcomes.accepted);
  await expect(canvas.getByText("$969.17")).toBeVisible();
  await expect(canvas.getByText("2026-10-23")).toBeVisible();
  await expect(canvas.getByText(c.channels.phone)).toBeVisible();
  await expect(canvas.getByText(c.stories.note)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm.record })).toBeEnabled();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
} };
export const RecordDeclined: Story = sample((proposal, context) => {
  proposal.value.outcome = "declined"; proposal.value.note = c.stories.declineNote;
  context.value = structuredClone(proposal.value);
});
export const PublishedEstimate: Story = sample((proposal, context) => {
  proposal.estimate.status = "published"; context.estimate.status = "published";
});
export const CorrectDecision: Story = { ...sample(() => {}, "correct"), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("region", { name: c.current })).toHaveTextContent(c.outcomes.declined);
  await expect(canvas.getByRole("region", { name: c.proposed })).toHaveTextContent(c.outcomes.accepted);
  await expect(canvas.getByText(c.stories.reason)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm.correct })).toBeEnabled();
} };
export const CorrectToDeclined: Story = sample((proposal, context) => {
  proposal.estimate.status = "accepted";
  if (proposal.estimate.decision) proposal.estimate.decision.outcome = "accepted";
  context.estimate = structuredClone(proposal.estimate);
  proposal.value.outcome = "declined"; proposal.value.note = c.stories.declineNote;
  context.value = structuredClone(proposal.value);
}, "correct");
export const CorrectNoteAndChannel: Story = sample((proposal, context) => {
  proposal.value.outcome = "declined"; proposal.value.channel = "email";
  context.value = structuredClone(proposal.value);
}, "correct");
export const ClearOptionalNote: Story = sample((proposal, context) => {
  proposal.value.note = ""; context.value.note = "";
}, "correct");
export const NoOptionalNote: Story = sample((proposal, context) => { proposal.value.note = ""; context.value.note = ""; });
export const EmailChannel: Story = sample((proposal, context) => { proposal.value.channel = "email"; context.value.channel = "email"; });
export const InPersonChannel: Story = sample((proposal, context) => { proposal.value.channel = "in-person"; context.value.channel = "in-person"; });
export const OtherChannel: Story = sample((proposal, context) => { proposal.value.channel = "other"; context.value.channel = "other"; });
export const MissingChannel: Story = { ...sample((proposal, context) => {
  proposal.value.channel = ""; context.value.channel = "";
}), play: async (args) => {
  await blocked(args);
  await expect(within(args.canvasElement).getByText(dialog.errors.channel)).toBeVisible();
  await expect(within(args.canvasElement).queryByRole("combobox")).not.toBeInTheDocument();
} };
export const MissingOutcome: Story = { ...sample((proposal, context) => { proposal.value.outcome = ""; context.value.outcome = ""; }), play: blocked };
export const MissingDate: Story = { ...sample((proposal, context) => { proposal.value.decisionDate = ""; context.value.decisionDate = ""; }), play: blocked };
export const FutureDate: Story = { ...sample((proposal, context) => { proposal.value.decisionDate = "2026-10-24"; context.value.decisionDate = "2026-10-24"; }), play: blocked };
export const InvalidDate: Story = { ...sample((proposal, context) => { proposal.value.decisionDate = "2026-02-30"; context.value.decisionDate = "2026-02-30"; }), play: blocked };
export const WorkspaceDateBoundary: Story = { ...sample((_, context) => { context.today = "2026-10-22"; }), play: blocked };
export const InvalidTimezone: Story = { ...sample((_, context) => { context.timezone = "not-a-timezone"; }), play: blocked };
export const NoteTooLong: Story = { ...sample((proposal, context) => { proposal.value.note = c.stories.longWord + c.stories.note; context.value.note = proposal.value.note; }), play: blocked };
export const MissingCorrectionReason: Story = { ...sample((proposal, context) => { proposal.value.reason = ""; context.value.reason = ""; }, "correct"), play: blocked };
export const MissingPreviousDecision: Story = { ...sample((proposal, context) => {
  proposal.estimate.decision = null; context.estimate.decision = null;
}, "correct"), play: async (args) => {
  await blocked(args);
  await expect(within(args.canvasElement).getByText(c.previousUnavailable)).toBeVisible();
} };
export const NoDecisionPermission: Story = { args: { capabilities: { ...roles.owner, decide: false } }, play: blocked };
export const NoCorrectionPermission: Story = {
  ...sample(() => {}, "correct"), args: { ...sample(() => {}, "correct").args, canCorrectDecision: false }, play: blocked,
};
export const DecisionWithoutSendOrEdit: Story = { args: { capabilities: { ...roles.owner, send: false, update: false } } };
export const Admin: Story = { args: { capabilities: roles.admin } };
export const OfficeCorrection: Story = { ...sample(() => {}, "correct"), args: { ...sample(() => {}, "correct").args, capabilities: roles.office } };
export const FieldAssignedJob: Story = { args: { capabilities: roles.field, parentAccess: true, canCorrectDecision: false } };
export const FieldCorrectionDenied: Story = {
  ...sample(() => {}, "correct"), args: { ...sample(() => {}, "correct").args, capabilities: roles.field, canCorrectDecision: false }, play: blocked,
};
export const FieldOutOfScope: Story = { args: { capabilities: roles.field, parentAccess: false, canCorrectDecision: false }, play: unavailable };
export const NoReadAccess: Story = { args: { capabilities: { ...roles.owner, read: false } }, play: unavailable };
export const NoParentAccess: Story = { args: { parentAccess: false }, play: unavailable };
export const MissingContext: Story = { args: { context: null }, play: blocked };
export const StaleVersion: Story = { ...sample((_, context) => { context.estimate.version++; }), play: blocked };
export const ChangedStoredValues: Story = { ...sample((_, context) => { context.value.channel = "email"; }), play: blocked };
export const ChangedPolicyOrMembership: Story = { ...sample((_, context) => { context.authorizationVersion = "policy-2:membership-2"; }), play: blocked };
export const MissingSnapshot: Story = { ...sample((_, context) => { context.snapshotHash = null; }), play: blocked };
export const ChangedSnapshot: Story = { ...sample((_, context) => { context.snapshotHash = "f".repeat(64); }), play: blocked };
export const Archived: Story = { ...sample((proposal, context) => { proposal.estimate.archived = true; context.estimate.archived = true; }), play: blocked };
export const DraftNotShared: Story = { ...sample((proposal, context) => { proposal.estimate.status = "draft"; context.estimate.status = "draft"; }), play: blocked };
export const MissingTotal: Story = { ...sample((proposal, context) => { proposal.estimate.totalCents = null; context.estimate.totalCents = null; }), play: blocked };
export const InvalidHash: Story = { ...sample((proposal) => { proposal.inputHash = ""; }), play: blocked };
export const InvalidReviewWindow: Story = { ...sample((proposal) => { proposal.expiresAt = new Date(Date.parse(proposal.createdAt) + 900001).toISOString(); }), play: blocked };
export const Expired: Story = { ...sample((proposal) => { proposal.expiresAt = proposal.createdAt; }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ExpiresWhileOpen: Story = { ...sample((proposal) => { proposal.expiresAt = new Date(Date.parse(proposal.createdAt) + 1200).toISOString(); }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired), { timeout: 5000 });
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ConfirmRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDecisionCardRequest(args.proposal), decision: "confirm" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.confirmed)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
} };
export const ConfirmCorrection: Story = { ...sample(() => {}, "correct"), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.correct }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDecisionCardRequest(args.proposal), decision: "confirm" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const CancelRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDecisionCardRequest(args.proposal), decision: "cancel" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.cancelled)).not.toBeInTheDocument();
} };
export const PendingSingleFlight: Story = {
  args: { onDecide: fn<NonNullable<EstimateDecisionCardProps["onDecide"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm.record }));
    await expect(args.onDecide).toHaveBeenCalledTimes(1);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
  },
};
export const FailedOperation: Story = {
  args: { onDecide: fn<NonNullable<EstimateDecisionCardProps["onDecide"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm.record })).toBeEnabled();
  },
};
export const RetryOperation: Story = { play: async ({ canvasElement, args }) => {
  args.onDecide?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2);
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const ThrownOperation: Story = {
  args: { onDecide: fn<NonNullable<EstimateDecisionCardProps["onDecide"]>>(async () => { throw Error("Sample failure"); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const EmptyFailure: Story = {
  args: { onDecide: fn<NonNullable<EstimateDecisionCardProps["onDecide"]>>(async () => ({ ok: false, message: "" })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const MissingCallback: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  canvas.getByRole("button", { name: c.confirm.record }).focus();
  await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const Confirmed: Story = sample((proposal) => { proposal.state = "confirmed"; });
export const Cancelled: Story = sample((proposal) => { proposal.state = "cancelled"; });
export const Superseded: Story = sample((proposal) => { proposal.state = "superseded"; });
export const Conflict: Story = sample((proposal) => { proposal.state = "conflict"; });
export const Forbidden: Story = { ...sample((proposal) => { proposal.state = "forbidden"; }), play: unavailable };
export const LongCorrection: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longName; proposal.estimate.recipientName = c.stories.longCustomer;
  proposal.value.note = c.stories.longNote; proposal.value.reason = c.stories.longNote;
  context.estimate = structuredClone(proposal.estimate); context.value = structuredClone(proposal.value);
}, "correct");
export const UnbrokenContent: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longWord.slice(0, 120);
  proposal.value.note = c.stories.longWord; proposal.value.reason = c.stories.longWord;
  context.estimate = structuredClone(proposal.estimate); context.value = structuredClone(proposal.value);
}, "correct");
export const PlainTextOnly: Story = { ...sample((proposal, context) => { proposal.value.note = c.stories.literal; context.value.note = c.stories.literal; }), play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByText(c.stories.literal, { normalizer: (value) => value })).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
const changeLabels = {
  read: c.stories.revoke, parent: c.stories.parent, grant: c.stories.grant, correctionGrant: c.stories.correctionGrant,
  version: c.stories.version, policy: c.stories.policy, snapshot: c.stories.snapshot,
  values: c.stories.values, previous: c.stories.previous, proposal: c.stories.replace,
};
type Change = keyof typeof changeLabels;
function RacePreview({ change, success, ...args }: EstimateDecisionCardProps & { change: Change; success: boolean }) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal));
  const [context, setContext] = useState(args.context);
  const [access, setAccess] = useState({ capabilities: args.capabilities, parentAccess: args.parentAccess, canCorrectDecision: args.canCorrectDecision });
  const release = useRef<(value: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setAccess({ ...access, capabilities: { ...access.capabilities, read: false } });
        if (change === "parent") setAccess({ ...access, parentAccess: false });
        if (change === "grant") setAccess({ ...access, capabilities: { ...access.capabilities, decide: false } });
        if (change === "correctionGrant") setAccess({ ...access, canCorrectDecision: false });
        if (change === "version" && context) setContext({ ...context, estimate: { ...context.estimate, version: context.estimate.version + 1 } });
        if (change === "policy" && context) setContext({ ...context, authorizationVersion: "policy-2:membership-2" });
        if (change === "snapshot" && context) setContext({ ...context, snapshotHash: "f".repeat(64) });
        if (change === "values" && context) setContext({ ...context, value: { ...context.value, channel: "email" } });
        if (change === "previous" && context?.estimate.decision) setContext({
          ...context, estimate: { ...context.estimate, decision: { ...context.estimate.decision, note: c.stories.note } },
        });
        if (change === "proposal") {
          const next = fresh(proposal); next.id = "new-decision-proposal"; next.inputHash = "f".repeat(64);
          setProposal(next); setContext(estimateDecisionCardContextFixture(next));
        }
      }}>{changeLabels[change]}</button>
      <button type="button" className={control} onClick={() => release.current?.(success ? { ok: true } : { ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateDecisionCard {...args} {...access} proposal={proposal} context={context} onDecide={async (request) => {
      await args.onDecide?.(request);
      return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
function race(change: Change, success = false): Story {
  return {
    ...sample(() => {}, "correct"), render: (args) => <RacePreview {...args} change={change} success={success} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: c.confirm.correct }));
      await expect(args.onDecide).toHaveBeenCalledTimes(1);
      await userEvent.click(canvas.getByRole("button", { name: changeLabels[change] }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
      if (change === "read" || change === "parent") await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
      else if (change === "proposal") await expect(canvas.getByRole("button", { name: c.confirm.correct })).toBeEnabled();
      else await expect(canvas.getByRole("button", { name: c.confirm.correct })).toBeDisabled();
    },
  };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const DecideRevokedWhilePending: Story = race("grant");
export const CorrectionRevokedWhilePending: Story = race("correctionGrant");
export const VersionChangedWhilePending: Story = race("version");
export const PolicyChangedWhilePending: Story = race("policy");
export const SnapshotChangedWhilePending: Story = race("snapshot");
export const ValuesChangedWhilePending: Story = race("values");
export const PreviousChangedWhilePending: Story = race("previous");
export const ProposalReplacedWhilePending: Story = race("proposal");
export const LateSuccessIgnored: Story = race("proposal", true);

function DisabledPreview(args: EstimateDecisionCardProps) {
  const [proposal] = useState(() => fresh(args.proposal));
  const [disabled, setDisabled] = useState(false);
  const release = useRef<(value: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => setDisabled(!disabled)}>{c.stories.toggleDisabled}</button>
      <button type="button" className={control} onClick={() => release.current?.({ ok: true })}>{c.stories.release}</button>
    </div>
    <EstimateDecisionCard {...args} proposal={proposal} disabled={disabled} onDecide={async (request) => {
      await args.onDecide?.(request);
      return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
export const DisabledDoesNotResetRequest: Story = { render: (args) => <DisabledPreview {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await expect(canvas.getByRole("button", { name: c.confirm.record })).toBeDisabled();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await expect(canvas.queryByRole("button", { name: c.confirm.record })).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
} };

function HostPreview(args: EstimateDecisionCardProps) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => setProposal({ ...proposal, state: "confirmed" })}>{c.stories.hostConfirm}</button>
    <EstimateDecisionCard {...args} proposal={proposal} />
  </div>;
}
export const AuthoritativeHostOutcome: Story = { render: (args) => <HostPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.record }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.hostConfirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.confirmed);
} };
function Conversation(args: EstimateDecisionCardProps) {
  const [open, setOpen] = useState(true), [proposal] = useState(() => fresh(args.proposal));
  return <AssistantPanel open={open} onOpenChange={setOpen} sendDisabled contextLabel={proposal.estimate.number}
    onSend={async () => ({ ok: false, message: c.stories.notice })}
    messages={[{ id: "sample-decision-proposal", role: "assistant", text: c.stories.notice }]}
    renderMessageSupplement={() => <EstimateDecisionCard {...args} proposal={proposal} />} />;
}
export const InsideAssistant: Story = { render: (args) => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.yes);
  await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).not.toHaveBeenCalled();
} };

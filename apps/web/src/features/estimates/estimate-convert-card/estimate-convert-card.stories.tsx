import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { EstimateConvertDialog } from "../estimate-convert-dialog/estimate-convert-dialog";
import { estimateConvertDialogData as dialog } from "../estimate-convert-dialog/estimate-convert-dialog.data";
import { initialEstimateConversionReview, type EstimateConversionRequest } from "../estimate-convert-dialog/estimate-convert-dialog.preview";
import { copy as jobCopy } from "../../jobs/job-create-dialog/job-create-dialog.data";
import { EstimateConvertCard } from "./estimate-convert-card";
import { estimateConvertCardContextFixture, estimateConvertCardData as c, estimateConvertProposalFixture } from "./estimate-convert-card.data";
import { estimateConvertCardRequest } from "./estimate-convert-card.preview";
import type { EstimateConvertCardContext, EstimateConvertCardProps, EstimateConvertProposal } from "./estimate-convert-card.types";

function fresh(proposal: EstimateConvertProposal) {
  const duration = Date.parse(proposal.expiresAt) - Date.parse(proposal.createdAt), now = Date.now();
  return Number.isFinite(duration) ? {
    ...proposal, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + duration).toISOString(),
  } : proposal;
}
function Preview(args: EstimateConvertCardProps) {
  const [proposal] = useState(() => fresh(args.proposal));
  return <EstimateConvertCard {...args} proposal={proposal} />;
}
const proposal = estimateConvertProposalFixture();
const meta = {
  title: "Assistant/EstimateConvertCard", component: EstimateConvertCard,
  args: {
    proposal, context: estimateConvertCardContextFixture(proposal), capabilities: roles.owner, parentAccess: true, canCreateJob: true,
    onDecide: fn<NonNullable<EstimateConvertCardProps["onDecide"]>>(async () => ({ ok: true })),
  },
  render: (args) => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateConvertCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(change: (proposal: EstimateConvertProposal, context: EstimateConvertCardContext) => void): Story {
  const proposal = estimateConvertProposalFixture(), context = estimateConvertCardContextFixture(proposal);
  change(proposal, context);
  return { args: { proposal, context } };
}
const blocked: Story["play"] = async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole("button", { name: c.review })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
const unavailable: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
  await expect(canvas.queryByText(c.stories.customer)).not.toBeInTheDocument();
  await expect(canvas.queryByText(proposal.estimate.scope, { normalizer: (value) => value })).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
export const PrepareJob: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("$969.17")).toBeVisible();
  await expect(canvas.getByText(proposal.estimate.parentNumber)).toBeVisible();
  await expect(canvas.getByText(c.stories.customer)).toBeVisible();
  await expect(canvas.getByText(proposal.estimate.scope, { normalizer: (value) => value })).toBeVisible();
  await expect(canvas.getByText(c.defaults)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: dialog.confirm })).not.toBeInTheDocument();
} };
export const Admin: Story = { args: { capabilities: roles.admin } };
export const Office: Story = { args: { capabilities: roles.office } };
export const ReadOnlyEstimate: Story = { args: { capabilities: { ...roles.owner, create: false, update: false, send: false, decide: false } } };
export const NoJobCreationPermission: Story = { args: { canCreateJob: false }, play: blocked };
export const NoReadAccess: Story = { args: { capabilities: { ...roles.owner, read: false } }, play: unavailable };
export const NoParentAccess: Story = { args: { parentAccess: false }, play: unavailable };
export const FieldOutsideLeadScope: Story = { args: { capabilities: roles.field, parentAccess: false, canCreateJob: false }, play: unavailable };
export const MissingCustomer: Story = { ...sample((proposal, context) => {
  proposal.estimate.customerId = context.estimate.customerId = null;
  proposal.customer = context.customer = { state: "missing" };
}), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(dialog.customerMissing)).toBeVisible();
  await expect(canvas.getByText(c.customerHint)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
} };
export const CustomerAccessUnavailable: Story = { ...sample((_, context) => { context.customer = { state: "unavailable" }; }), play: unavailable };
export const CustomerMismatch: Story = { ...sample((proposal, context) => {
  if (proposal.customer.state === "ready") proposal.customer.id = c.stories.existingJob.id;
  context.customer = structuredClone(proposal.customer);
}), play: blocked };
export const CustomerChanged: Story = { ...sample((_, context) => {
  if (context.customer.state === "ready") context.customer.name = c.stories.longCustomer;
}), play: blocked };
export const Archived: Story = { ...sample((proposal, context) => { proposal.estimate.archived = context.estimate.archived = true; }), play: blocked };
export const NotAccepted: Story = { ...sample((proposal, context) => { proposal.estimate.status = context.estimate.status = "sent"; }), play: blocked };
export const AlreadyConverted: Story = { ...sample((proposal, context) => {
  proposal.estimate.convertedJob = { ...c.stories.existingJob }; context.estimate = structuredClone(proposal.estimate);
}), play: async (args) => {
  await blocked(args);
  await expect(within(args.canvasElement).getByRole("link", { name: dialog.openJob(c.stories.existingJob.number) }))
    .toHaveAttribute("href", `/jobs/${c.stories.existingJob.id}`);
} };
export const ConvertedJobUnavailable: Story = { ...sample((proposal, context) => {
  proposal.estimate.convertedJob = { ...c.stories.existingJob, canOpen: false }; context.estimate = structuredClone(proposal.estimate);
}), play: async (args) => {
  await blocked(args); await expect(within(args.canvasElement).queryByRole("link")).not.toBeInTheDocument();
} };
export const JobLinkedEstimate: Story = { ...sample((proposal, context) => {
  proposal.estimate.parentType = "job"; proposal.estimate.parentId = c.stories.existingJob.id;
  proposal.estimate.parentNumber = c.stories.existingJob.number; context.estimate = structuredClone(proposal.estimate);
  context.parentJob = { ...c.stories.existingJob };
}), play: async (args) => {
  await blocked(args); await expect(within(args.canvasElement).getByRole("link")).toHaveAttribute("href", `/jobs/${c.stories.existingJob.id}`);
} };
export const MismatchedParentJob: Story = { ...sample((proposal, context) => {
  proposal.estimate.parentType = "job"; context.estimate = structuredClone(proposal.estimate);
  context.parentJob = { ...c.stories.existingJob };
}), play: async (args) => {
  await blocked(args); await expect(within(args.canvasElement).queryByRole("link")).not.toBeInTheDocument();
} };
export const ZeroAmount: Story = sample((proposal, context) => { proposal.estimate.totalCents = context.estimate.totalCents = 0; });
export const MissingAmount: Story = { ...sample((proposal, context) => { proposal.estimate.totalCents = context.estimate.totalCents = null; }), play: blocked };
export const InvalidRecord: Story = { ...sample((proposal, context) => { proposal.estimate.parentId = context.estimate.parentId = "invalid"; }), play: blocked };
export const VersionChanged: Story = { ...sample((_, context) => { context.estimate.version++; }), play: blocked };
export const SnapshotChanged: Story = { ...sample((_, context) => { context.estimate.snapshotHash = "f".repeat(64); }), play: blocked };
export const PolicyChanged: Story = { ...sample((_, context) => { context.authorizationVersion = "policy-2:membership-2"; }), play: blocked };
export const WorkScopeChanged: Story = { ...sample((_, context) => { context.estimate.scope = c.stories.literal; }), play: blocked };
export const MissingContext: Story = { args: { context: null }, play: blocked };
export const InvalidHash: Story = { ...sample((proposal) => { proposal.inputHash = "invalid"; }), play: blocked };
export const InvalidWindow: Story = { ...sample((proposal) => { proposal.expiresAt = "invalid"; }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.errors.metadata)).toBeVisible();
  await expect(canvas.queryByRole("button", { name: c.review })).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const WindowTooLong: Story = { ...sample((proposal) => {
  proposal.expiresAt = new Date(Date.parse(proposal.createdAt) + 900001).toISOString();
}), play: blocked };
export const Expired: Story = sample((proposal) => { proposal.state = "expired"; });
export const Confirmed: Story = sample((proposal) => { proposal.state = "confirmed"; });
export const Cancelled: Story = sample((proposal) => { proposal.state = "cancelled"; });
export const Superseded: Story = sample((proposal) => { proposal.state = "superseded"; });
export const Conflict: Story = sample((proposal) => { proposal.state = "conflict"; });
export const Forbidden: Story = { ...sample((proposal) => { proposal.state = "forbidden"; }), play: unavailable };
export const LongContent: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longName;
  if (proposal.customer.state === "ready") proposal.customer.name = c.stories.longCustomer;
  context.estimate = structuredClone(proposal.estimate); context.customer = structuredClone(proposal.customer);
});
export const OversizedScope: Story = { ...sample((proposal, context) => { proposal.estimate.scope = context.estimate.scope = c.stories.longScope; }), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.longScope)).toBeVisible();
  await expect(canvas.getByText(c.stories.longScope, { normalizer: (value) => value })).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
} };
export const UnbrokenContent: Story = sample((proposal, context) => {
  proposal.estimate.name = c.stories.longWord.slice(0, 120);
  proposal.estimate.scope = c.stories.longWord; proposal.estimate.serviceAddress = c.stories.longWord;
  context.estimate = structuredClone(proposal.estimate);
});
export const PlainTextOnly: Story = { ...sample((proposal, context) => { proposal.estimate.scope = context.estimate.scope = c.stories.literal; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.stories.literal, { normalizer: (value) => value })).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
} };
export const ReviewRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateConvertCardRequest(args.proposal), decision: "review" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.confirmed)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: dialog.confirm })).not.toBeInTheDocument();
} };
export const CancelRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateConvertCardRequest(args.proposal), decision: "cancel" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.cancelled)).not.toBeInTheDocument();
} };
export const PendingSingleFlight: Story = {
  args: { onDecide: fn<NonNullable<EstimateConvertCardProps["onDecide"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.review }));
    await expect(args.onDecide).toHaveBeenCalledTimes(1);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
  },
};
export const FailedOperation: Story = {
  args: { onDecide: fn<NonNullable<EstimateConvertCardProps["onDecide"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.review }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
  },
};
export const RetryOperation: Story = { play: async ({ canvasElement, args }) => {
  args.onDecide?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2);
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const ThrownOperation: Story = {
  args: { onDecide: fn<NonNullable<EstimateConvertCardProps["onDecide"]>>(async () => { throw Error(c.stories.failure); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.review }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const EmptyFailure: Story = {
  args: { onDecide: fn<NonNullable<EstimateConvertCardProps["onDecide"]>>(async () => ({ ok: false, message: " " })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.review }));
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
export const KeyboardReview: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  canvas.getByRole("button", { name: c.review }).focus(); await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
type Change = keyof typeof c.stories.changes;
function RacePreview({ change, success, ...args }: EstimateConvertCardProps & { change: Change; success: boolean }) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal)), [context, setContext] = useState(args.context);
  const [access, setAccess] = useState({ capabilities: args.capabilities, parentAccess: args.parentAccess, canCreateJob: args.canCreateJob });
  const release = useRef<(value: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setAccess({ ...access, capabilities: { ...access.capabilities, read: false } });
        if (change === "parent") setAccess({ ...access, parentAccess: false });
        if (change === "grant") setAccess({ ...access, canCreateJob: false });
        if (change === "customer" && context) setContext({ ...context, customer: { state: "unavailable" } });
        if (change === "version" && context) setContext({ ...context, estimate: { ...context.estimate, version: context.estimate.version + 1 } });
        if (change === "policy" && context) setContext({ ...context, authorizationVersion: "policy-2:membership-2" });
        if (change === "snapshot" && context) setContext({ ...context, estimate: { ...context.estimate, snapshotHash: "f".repeat(64) } });
        if (change === "work" && context) setContext({ ...context, estimate: { ...context.estimate, scope: c.stories.literal } });
        if (change === "proposal") {
          const next = fresh(proposal); next.id = "new-convert-proposal"; next.inputHash = "f".repeat(64);
          setProposal(next); setContext(estimateConvertCardContextFixture(next));
        }
      }}>{c.stories.changes[change]}</button>
      <button type="button" className={control} onClick={() => release.current?.(success ? { ok: true } : { ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateConvertCard {...args} {...access} proposal={proposal} context={context} onDecide={async (request) => {
      await args.onDecide?.(request);
      return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
function race(change: Change, success = false): Story {
  return {
    render: (args) => <RacePreview {...args} change={change} success={success} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: c.review }));
      await expect(args.onDecide).toHaveBeenCalledTimes(1);
      await userEvent.click(canvas.getByRole("button", { name: c.stories.changes[change] }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
      if (["read", "parent", "customer"].includes(change)) await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
      else if (change === "proposal") await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
      else await expect(canvas.getByRole("button", { name: c.review })).toBeDisabled();
    },
  };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const CreateRevokedWhilePending: Story = race("grant");
export const CustomerRevokedWhilePending: Story = race("customer");
export const VersionChangedWhilePending: Story = race("version");
export const PolicyChangedWhilePending: Story = race("policy");
export const SnapshotChangedWhilePending: Story = race("snapshot");
export const WorkChangedWhilePending: Story = race("work");
export const ProposalReplacedWhilePending: Story = race("proposal");
export const LateSuccessIgnored: Story = race("proposal", true);

function DisabledPreview(args: EstimateConvertCardProps) {
  const [proposal] = useState(() => fresh(args.proposal)), [disabled, setDisabled] = useState(false);
  const release = useRef<(value: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => setDisabled(!disabled)}>{c.stories.toggleDisabled}</button>
      <button type="button" className={control} onClick={() => release.current?.({ ok: true })}>{c.stories.release}</button>
    </div>
    <EstimateConvertCard {...args} proposal={proposal} disabled={disabled} onDecide={async (request) => {
      await args.onDecide?.(request); return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
export const DisabledDoesNotResetRequest: Story = { render: (args) => <DisabledPreview {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await expect(canvas.getByRole("button", { name: c.review })).toBeDisabled();
  await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await userEvent.click(canvas.getByRole("button", { name: c.stories.toggleDisabled }));
  await expect(canvas.queryByRole("button", { name: c.review })).not.toBeInTheDocument();
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
} };
function HostPreview(args: EstimateConvertCardProps) {
  const [proposal, setProposal] = useState(() => fresh(args.proposal));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => setProposal({ ...proposal, state: "confirmed" })}>{c.stories.hostConfirm}</button>
    <EstimateConvertCard {...args} proposal={proposal} />
  </div>;
}
export const AuthoritativeHostOutcome: Story = { render: (args) => <HostPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.hostConfirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.confirmed);
} };

const createJob = fn<(request: EstimateConversionRequest) => Promise<void>>(async () => {});
function FormPreview({ inAssistant = false, ...args }: EstimateConvertCardProps & { inAssistant?: boolean }) {
  const [proposal] = useState(() => fresh(args.proposal));
  const [open, setOpen] = useState(false), [assistant, setAssistant] = useState(inAssistant), [requested, setRequested] = useState(false);
  const card = <EstimateConvertCard {...args} proposal={proposal} onDecide={async (request) => {
    const result = await args.onDecide?.(request);
    if (result?.ok && request.decision === "review") { setAssistant(false); setOpen(true); }
    return result ?? { ok: false, message: c.noHandler };
  }} />;
  return <>
    {inAssistant ? <AssistantPanel open={assistant} onOpenChange={setAssistant} sendDisabled contextLabel={proposal.estimate.number}
      onSend={async () => ({ ok: false, message: c.stories.notice })}
      messages={[{ id: "sample-convert-proposal", role: "assistant", text: c.stories.notice }]}
      renderMessageSupplement={() => card} /> : card}
    {args.context && <EstimateConvertDialog open={open} estimate={args.context.estimate} customer={args.context.customer}
      review={initialEstimateConversionReview(args.context.estimate, args.context.customer)} capabilities={args.capabilities}
      canCreateJob={args.canCreateJob} canScheduleCreation members={[...c.stories.members]}
      onClose={() => setOpen(false)} onConfirm={async (request) => { await createJob(request); setRequested(true); }} />}
    {requested && <p role="status">{c.stories.jobRequested}</p>}
  </>;
}
async function openedForm(element: HTMLElement) {
  const root = await within(element.ownerDocument.body).findByRole("dialog");
  await waitFor(async () => {
    await expect(root).toBeVisible(); await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
export const InteractiveJobReview: Story = { render: (args) => <FormPreview {...args} /> };
export const InteractiveAssistantReview: Story = { render: (args) => <FormPreview {...args} inAssistant /> };
export const ReviewOpensJobForm: Story = { render: (args) => <FormPreview {...args} />, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: c.review }));
  const form = await openedForm(canvasElement);
  await expect(form.getByRole("heading", { name: dialog.title })).toBeVisible();
  await expect(form.getByRole("button", { name: dialog.confirm })).toBeEnabled();
  await expect(form.getByText("$969.17")).toBeVisible();
  await expect(createJob).not.toHaveBeenCalled();
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateConvertCardRequest(args.proposal), decision: "review" });
} };
export const SeparateFormConfirmation: Story = { render: (args) => <FormPreview {...args} />, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: c.review }));
  const form = await openedForm(canvasElement);
  await expect(createJob).not.toHaveBeenCalled();
  await userEvent.click(form.getByRole("button", { name: dialog.confirm }));
  await expect(createJob).toHaveBeenCalledTimes(1);
  await expect(createJob).toHaveBeenCalledWith({
    estimateId: proposal.estimate.id, expectedVersion: proposal.estimate.version, snapshotHash: proposal.estimate.snapshotHash,
    sourceLeadId: proposal.estimate.parentId,
    job: {
      customerId: proposal.estimate.customerId, title: proposal.estimate.name, service: proposal.estimate.service,
      location: proposal.estimate.serviceAddress, description: proposal.estimate.scope,
      primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
    },
  });
  await expect(form.getByRole("button", { name: dialog.confirm })).toBeEnabled();
  await expect(within(canvasElement.ownerDocument.body).getByText(c.stories.jobRequested)).toBeInTheDocument();
} };
export const OversizedScopeInJobForm: Story = {
  ...sample((proposal, context) => { proposal.estimate.scope = context.estimate.scope = c.stories.longScope; }),
  render: (args) => <FormPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.review }));
    const form = await openedForm(canvasElement);
    await expect(form.getByText(dialog.errors.description)).toBeVisible();
    await expect(form.getByRole("button", { name: dialog.confirm })).toBeDisabled();
    await userEvent.click(form.getByRole("button", { name: jobCopy.edit }));
    const edit = await openedForm(canvasElement);
    await userEvent.click(edit.getByText(jobCopy.optional, { exact: true }));
    await expect(edit.getByRole("textbox", { name: jobCopy.descriptionLabel })).toHaveValue(c.stories.longScope);
    await expect(createJob).not.toHaveBeenCalled();
  },
};
export const MissingCustomerInJobForm: Story = {
  ...MissingCustomer, render: (args) => <FormPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.review }));
    const root = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    await waitFor(async () => {
      await expect(root).toBeVisible(); await expect(root.parentElement).toHaveStyle({ opacity: "1" });
    });
    const form = within(root);
    await expect(form.getByText(dialog.customerMissing)).toBeVisible();
    await expect(form.queryByRole("button", { name: dialog.confirm })).not.toBeInTheDocument();
    await expect(createJob).not.toHaveBeenCalled();
  },
};
function Conversation(args: EstimateConvertCardProps) {
  const [open, setOpen] = useState(true), [proposal] = useState(() => fresh(args.proposal));
  return <AssistantPanel open={open} onOpenChange={setOpen} sendDisabled contextLabel={proposal.estimate.number}
    onSend={async () => ({ ok: false, message: c.stories.notice })}
    messages={[{ id: "sample-convert-proposal", role: "assistant", text: c.stories.notice }]}
    renderMessageSupplement={() => <EstimateConvertCard {...args} proposal={proposal} />} />;
}
export const InsideAssistant: Story = { render: (args) => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.yes); await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const AssistantToJobReview: Story = { render: (args) => <FormPreview {...args} inAssistant />, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: c.review }));
  const form = await openedForm(canvasElement);
  await expect(form.getByRole("heading", { name: dialog.title })).toBeVisible();
  await expect(form.getByRole("button", { name: dialog.confirm })).toBeEnabled();
  await expect(canvasElement.querySelector("dialog[open]")).toBeNull();
  await expect(createJob).not.toHaveBeenCalled();
} };

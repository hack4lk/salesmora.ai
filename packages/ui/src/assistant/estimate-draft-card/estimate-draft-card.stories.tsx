import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel } from "../assistant-panel/assistant-panel";
import { assistantPanelData } from "../assistant-panel/assistant-panel.data";
import { EstimateDraftCard, type EstimateDraftCardProps } from "./estimate-draft-card";
import { estimateDraftCardData as c, estimateDraftContextFixture, estimateDraftFixture, estimateDraftGrantsFixture } from "./estimate-draft-card.data";
import { estimateDraftRequest } from "./estimate-draft-card.preview";
import type { EstimateDraftOperationResult, EstimateDraftProposal } from "./estimate-draft-card.types";

function freshDraft(draft: EstimateDraftProposal): EstimateDraftProposal {
  const copy = structuredClone(draft), now = Date.now();
  const duration = Date.parse(draft.expiresAt) - Date.parse(draft.createdAt);
  if (Number.isFinite(duration)) {
    copy.createdAt = new Date(now).toISOString();
    copy.expiresAt = new Date(now + duration).toISOString();
  }
  return copy;
}

function Preview(args: EstimateDraftCardProps) {
  const [draft] = useState(() => freshDraft(args.draft));
  return <EstimateDraftCard {...args} draft={draft} />;
}

const base = estimateDraftFixture();
const meta = {
  title: "Assistant/EstimateDraftCard", component: EstimateDraftCard,
  args: {
    draft: base, context: estimateDraftContextFixture(base), grants: estimateDraftGrantsFixture,
    onDecide: fn<NonNullable<EstimateDraftCardProps["onDecide"]>>(async () => ({ ok: true })),
    onReviewInEditor: fn<NonNullable<EstimateDraftCardProps["onReviewInEditor"]>>(async () => ({ ok: true })),
  },
  render: (args) => <Preview key={JSON.stringify(args)} {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.reviewHeading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;

function sample(change: (draft: EstimateDraftProposal) => void, action: EstimateDraftProposal["actionType"] = "estimate.create"): Story {
  const draft = estimateDraftFixture(action); change(draft);
  return { args: { draft, context: estimateDraftContextFixture(draft) } };
}
const confirmName = c.confirm["estimate.create"];
const blocked: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("button", { name: c.confirm[args.draft.actionType] })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
const unavailable: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
  await expect(canvas.queryByText(c.stories.parentName, { exact: false })).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.scope)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
};
export const CreateDraft: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  for (const value of ["$962.50", "$48.13", "$54.80", "$969.17", "$242.29", "$726.88"]) await expect(canvas.getByText(value)).toBeVisible();
  await expect(canvas.getByRole("button", { name: confirmName })).toBeEnabled();
  await expect(canvas.getByText(c.included)).toBeVisible();
} };
export const UpdateDraft: Story = { ...sample(() => {}, "estimate.update"), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("region", { name: c.before })).toHaveTextContent(c.stories.name);
  await expect(canvas.getByRole("region", { name: c.after })).toHaveTextContent(c.stories.changedName);
  await expect(canvas.getByRole("button", { name: c.confirm["estimate.update"] })).toBeEnabled();
} };
export const JobParent: Story = sample((draft) => {
  draft.parent = { ...draft.parent, type: "job", id: "job-sample", number: c.stories.jobNumber };
});
export const MissingPrice: Story = { ...sample((draft) => {
  draft.proposed.items[0].unitPrice = ""; draft.proposed.items[0].priceSource = { type: "missing" };
}), play: async (context) => {
  await blocked(context);
  const canvas = within(context.canvasElement);
  await expect(canvas.getByText(c.needsPrice)).toBeVisible();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.getByRole("button", { name: c.review })).toBeEnabled();
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(context.args.onReviewInEditor).toHaveBeenCalledWith(estimateDraftRequest(context.args.draft));
  await expect(canvas.getByText(c.editorRequested)).toBeVisible();
  await expect(context.args.onDecide).not.toHaveBeenCalled();
} };
export const UntrustedNumericPrice: Story = { ...sample((draft) => {
  draft.proposed.items[0].priceSource = { type: "missing" };
}), play: async (context) => {
  await blocked(context);
  const canvas = within(context.canvasElement);
  await expect(canvas.getByText(c.needsPrice)).toBeVisible();
  await expect(canvas.queryByText("$125.00")).not.toBeInTheDocument();
  await expect(canvas.queryByText("$969.17")).not.toBeInTheDocument();
} };
export const NamedRulePrice: Story = sample((draft) => { draft.proposed.items[0].priceSource = { type: "rule", name: c.stories.rule }; });
export const MissingSourceName: Story = { ...sample((draft) => { draft.proposed.items[1].priceSource = { type: "catalog", name: "" }; }), play: blocked };
export const TamperedSavedPrice: Story = { ...sample((draft) => { draft.proposed.items[0].unitPrice = "150.00"; }, "estimate.update"), play: blocked };
export const AddedRemovedAndReordered: Story = sample((draft) => {
  draft.proposed.items = [
    draft.proposed.items[2],
    { ...draft.proposed.items[0], quantity: "4" },
    { ...draft.proposed.items[1], id: "line-new", quantity: "2", priceSource: { type: "user" } },
  ];
}, "estimate.update");
export const EmptyDraft: Story = { ...sample((draft) => { draft.proposed.items = []; draft.proposed.validUntil = ""; }), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.noItems)).toBeVisible();
  await expect(canvas.getByRole("button", { name: confirmName })).toBeEnabled();
  await expect(canvas.queryByText("$0.00")).not.toBeInTheDocument();
} };
export const InvalidLine: Story = { ...sample((draft) => { draft.proposed.items[0].quantity = "0"; }), play: blocked };
export const InvalidNoCharge: Story = { ...sample((draft) => { draft.proposed.items[2].included = false; }), play: blocked };
export const InvalidDeposit: Story = { ...sample((draft) => { draft.proposed.deposit = { type: "amount", value: "969.18" }; }), play: blocked };
export const InvalidDiscount: Story = { ...sample((draft) => { draft.proposed.discount = { type: "percent", value: "101" }; }), play: blocked };
export const InvalidTax: Story = { ...sample((draft) => { draft.proposed.taxRate = "8.8751"; }), play: blocked };
export const InvalidFields: Story = { ...sample((draft) => {
  draft.proposed.name = ""; draft.proposed.validUntil = "2026-02-30"; draft.proposed.scope = c.stories.scope.repeat(50);
}), play: blocked };
export const DuplicateLines: Story = { ...sample((draft) => { draft.proposed.items[1].id = draft.proposed.items[0].id; }), play: blocked };
export const TooManyLines: Story = { ...sample((draft) => {
  draft.proposed.items = Array.from({ length: 101 }, (_, index) => ({ ...draft.proposed.items[2], id: `line-${index}` }));
}), play: blocked };
export const Unchanged: Story = { ...sample((draft) => {
  if (draft.actionType === "estimate.update") draft.proposed = structuredClone(draft.current);
}, "estimate.update"), play: async (context) => {
  await blocked(context); await expect(within(context.canvasElement).getByRole("status")).toHaveTextContent(c.unchanged);
} };
export const NoReadAccess: Story = { args: { grants: { ...estimateDraftGrantsFixture, read: false } }, play: unavailable };
export const NoParentAccess: Story = { args: { grants: { ...estimateDraftGrantsFixture, parentAccess: false } }, play: unavailable };
export const NoCreatePermission: Story = { args: { grants: { ...estimateDraftGrantsFixture, create: false } }, play: blocked };
export const NoUpdatePermission: Story = { ...sample(() => {}, "estimate.update"), args: {
  ...sample(() => {}, "estimate.update").args, grants: { ...estimateDraftGrantsFixture, update: false },
}, play: blocked };
export const MissingHostContext: Story = { args: { context: null }, play: blocked };
export const StaleHash: Story = { args: { context: { ...estimateDraftContextFixture(base), inputHash: "b".repeat(64) } }, play: blocked };
export const StaleParent: Story = { args: { context: { ...estimateDraftContextFixture(base), parent: { ...base.parent, version: 3 } } }, play: blocked };
const update = estimateDraftFixture("estimate.update");
const updateContext = estimateDraftContextFixture(update);
export const StaleEstimate: Story = { args: {
  draft: update, context: { ...updateContext, estimate: { id: "estimate-sample", version: 4, status: "draft", archived: false } },
}, play: blocked };
export const ChangedPolicyOrMembership: Story = { args: { context: { ...estimateDraftContextFixture(base), authorizationVersion: "policy-2:membership-2" } }, play: blocked };
export const NotDraft: Story = { args: {
  draft: update, context: { ...updateContext, estimate: { id: "estimate-sample", version: 3, status: "sent", archived: false } },
}, play: blocked };
export const ArchivedTarget: Story = { args: {
  draft: update, context: { ...updateContext, estimate: { id: "estimate-sample", version: 3, status: "draft", archived: true } },
}, play: blocked };
export const InvalidHash: Story = { ...sample((draft) => { draft.inputHash = ""; }), play: blocked };
export const InvalidReviewWindow: Story = { ...sample((draft) => { draft.expiresAt = new Date(Date.parse(draft.createdAt) + 900001).toISOString(); }), play: blocked };
export const Expired: Story = { ...sample((draft) => { draft.expiresAt = draft.createdAt; }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ExpiresWhileOpen: Story = { ...sample((draft) => {
  draft.expiresAt = new Date(Date.parse(draft.createdAt) + 1200).toISOString();
}), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.states.expired), { timeout: 5000 });
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ConfirmRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDraftRequest(args.draft), decision: "confirm" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.states.confirmed)).not.toBeInTheDocument();
} };
export const ConfirmUpdateRequest: Story = { ...sample(() => {}, "estimate.update"), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm["estimate.update"] }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDraftRequest(args.draft), decision: "confirm" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const CancelRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith({ ...estimateDraftRequest(args.draft), decision: "cancel" });
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.states.cancelled)).not.toBeInTheDocument();
} };
export const PendingSingleFlight: Story = {
  args: { onDecide: fn<NonNullable<EstimateDraftCardProps["onDecide"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: confirmName }));
    await expect(args.onDecide).toHaveBeenCalledTimes(1);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
  },
};
export const OperationFailure: Story = { args: { onDecide: fn<NonNullable<EstimateDraftCardProps["onDecide"]>>(async () => ({ ok: false, message: c.stories.failure })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await expect(canvas.getByRole("button", { name: confirmName })).toBeEnabled();
} };
export const RetryFailure: Story = { play: async ({ canvasElement, args }) => {
  args.onDecide?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2);
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const ThrownFailure: Story = { args: { onDecide: fn<NonNullable<EstimateDraftCardProps["onDecide"]>>(async () => { throw Error("Sample failure"); }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
} };
export const EmptyFailure: Story = { args: { onDecide: fn<NonNullable<EstimateDraftCardProps["onDecide"]>>(async () => ({ ok: false, message: "" })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
} };
export const EditorFailure: Story = { args: { onReviewInEditor: fn<NonNullable<EstimateDraftCardProps["onReviewInEditor"]>>(async () => ({ ok: false, message: c.stories.failure })) }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const MissingCallbacks: Story = { args: { onDecide: undefined, onReviewInEditor: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
  await expect(canvas.getByText(c.noEditor)).toBeVisible();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
} };
export const KeyboardConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), button = canvas.getByRole("button", { name: confirmName });
  button.focus(); await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const Confirmed: Story = sample((draft) => { draft.state = "confirmed"; });
export const Cancelled: Story = sample((draft) => { draft.state = "cancelled"; });
export const Superseded: Story = sample((draft) => { draft.state = "superseded"; });
export const Conflict: Story = sample((draft) => { draft.state = "conflict"; });
export const Forbidden: Story = { ...sample((draft) => { draft.state = "forbidden"; }), play: unavailable };
export const LongContent: Story = sample((draft) => {
  draft.parent.name = c.stories.longWord; draft.proposed.name = c.stories.longName;
  draft.proposed.scope = c.stories.scope.repeat(20); draft.proposed.termsNote = c.stories.terms.repeat(20);
  draft.proposed.items[0].description = c.stories.longWord.slice(0, 200);
});
export const PlainTextOnly: Story = { ...sample((draft) => { draft.proposed.message = c.stories.literal; }), play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByText(c.stories.literal, { normalizer: (value) => value })).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
function RefreshedPreview(args: EstimateDraftCardProps) {
  const [draft, setDraft] = useState(() => {
    const draft = freshDraft(args.draft);
    draft.proposed.items[0].unitPrice = ""; draft.proposed.items[0].priceSource = { type: "missing" };
    return draft;
  });
  const [refreshed, setRefreshed] = useState(false);
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => {
      const next = estimateDraftFixture(); next.id = "refreshed-proposal"; next.inputHash = "b".repeat(64);
      setDraft(next); setRefreshed(true);
    }}>{c.stories.supplyComplete}</button>
    {refreshed && <p role="status" className="m-0 text-sm text-ink">{c.stories.refreshNotice}</p>}
    <EstimateDraftCard {...args} draft={draft} context={estimateDraftContextFixture(draft)} />
  </div>;
}
export const CompleteRefreshedProposal: Story = { render: (args) => <RefreshedPreview {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("button", { name: confirmName })).toBeDisabled();
  await userEvent.click(canvas.getByRole("button", { name: c.review }));
  await expect(args.onDecide).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole("button", { name: c.stories.supplyComplete }));
  await expect(canvas.getByRole("button", { name: confirmName })).toBeEnabled();
  await expect(canvas.queryByText(c.editorRequested)).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(args.onDecide).toHaveBeenCalledWith(expect.objectContaining({ proposalId: "refreshed-proposal", inputHash: "b".repeat(64), decision: "confirm" }));
} };

type Replacement = "access" | "policy" | "version" | "proposal" | "content" | "grant";
function RacePreview({ replacement, ...args }: EstimateDraftCardProps & { replacement: Replacement }) {
  const [draft, setDraft] = useState(() => freshDraft(args.draft));
  const [context, setContext] = useState(args.context);
  const [grants, setGrants] = useState(args.grants);
  const release = useRef<(value: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (replacement === "access") setGrants({ ...grants, read: false });
        if (replacement === "grant") setGrants({ ...grants, update: false });
        if (replacement === "policy" && context) setContext({ ...context, authorizationVersion: "policy-2:membership-2" });
        if (replacement === "version" && context?.estimate) setContext({ ...context, estimate: { ...context.estimate, version: 4 } });
        if (replacement === "content") setDraft({ ...draft, proposed: { ...draft.proposed, name: c.stories.longName } });
        if (replacement === "proposal") {
          const next = freshDraft(draft); next.id = "new-proposal"; next.inputHash = "b".repeat(64);
          setDraft(next); setContext(estimateDraftContextFixture(next));
        }
      }}>{replacement === "access" ? c.stories.revoke : replacement === "policy" ? c.stories.changePolicy
        : replacement === "version" ? c.stories.invalidate : c.stories.replace}</button>
      <button type="button" className={control} onClick={() => release.current?.({ ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateDraftCard {...args} draft={draft} context={context} grants={grants} onDecide={async (request) => {
      await args.onDecide?.(request);
      return new Promise((resolve) => { release.current = resolve; });
    }} />
  </div>;
}
function race(replacement: Replacement): Story {
  return { ...sample(() => {}, "estimate.update"),
    render: (args) => <RacePreview {...args} replacement={replacement} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: c.confirm["estimate.update"] }));
      await expect(args.onDecide).toHaveBeenCalledTimes(1);
      await userEvent.click(canvas.getByRole("button", { name: replacement === "access" ? c.stories.revoke
        : replacement === "policy" ? c.stories.changePolicy : replacement === "version" ? c.stories.invalidate : c.stories.replace }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
      if (replacement === "access") await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
      else await expect(canvas.getByRole("button", { name: c.confirm["estimate.update"] }))[replacement === "proposal" || replacement === "content" ? "toBeEnabled" : "toBeDisabled"]();
    },
  };
}
export const AccessRevokedWhilePending: Story = race("access");
export const GrantRevokedWhilePending: Story = race("grant");
export const PolicyChangedWhilePending: Story = race("policy");
export const VersionChangedWhilePending: Story = race("version");
export const ProposalReplacedWhilePending: Story = race("proposal");
export const ContentReplacedWhilePending: Story = race("content");

function AuthoritativePreview(args: EstimateDraftCardProps) {
  const [draft, setDraft] = useState(() => freshDraft(args.draft));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => setDraft({ ...draft, state: "confirmed" })}>{c.stories.hostConfirm}</button>
    <EstimateDraftCard {...args} draft={draft} />
  </div>;
}
export const AuthoritativeHostStatus: Story = { render: (args) => <AuthoritativePreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: confirmName }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.hostConfirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.states.confirmed);
  await expect(canvas.queryByRole("button", { name: confirmName })).not.toBeInTheDocument();
} };
function ConversationPreview(args: EstimateDraftCardProps) {
  const [open, setOpen] = useState(true);
  const [draft] = useState(() => freshDraft(args.draft));
  return <AssistantPanel open={open} onOpenChange={setOpen} sendDisabled contextLabel={c.stories.estimateNumber}
    onSend={async () => ({ ok: false, message: c.stories.notice })}
    messages={[{ id: "sample-estimate-proposal", role: "assistant", text: c.stories.notice }]}
    renderMessageSupplement={() => <EstimateDraftCard {...args} draft={draft} />} />;
}
export const InsideAssistant: Story = { render: (args) => <ConversationPreview {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  const composer = canvas.getByRole("textbox", { name: assistantPanelData.composer });
  await userEvent.type(composer, c.stories.naturalYes);
  await userEvent.keyboard("{Enter}");
  await expect(args.onDecide).not.toHaveBeenCalled();
  await expect(canvas.getByRole("button", { name: assistantPanelData.submit })).toBeDisabled();
} };

import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateVoidChatView } from "@salesmora/contracts";
import { EstimateVoidCard } from "./estimate-void-card";
import { estimateVoidCardData as c } from "./estimate-void-card.data";
import {
  estimateVoidCardConfirmed, estimateVoidCardContext, estimateVoidCardFixture, estimateVoidGrants, estimateVoidOtherWorkspace,
} from "./estimate-void-card.fixtures";
import { estimateVoidCardRequest } from "./estimate-void-card.preview";
import type { EstimateVoidCardProps } from "./estimate-void-card.types";

function fresh(args: EstimateVoidCardProps) {
  const values = structuredClone({ view: args.view, context: args.context });
  const offset = Date.now() - Date.parse(args.view.ticket.createdAt);
  for (const ticket of [values.view.ticket, values.context?.view.ticket]) {
    if (!ticket) continue;
    ticket.createdAt = new Date(Date.parse(ticket.createdAt) + offset).toISOString();
    ticket.expiresAt = new Date(Date.parse(ticket.expiresAt) + offset).toISOString();
  }
  return values;
}
function Preview(args: EstimateVoidCardProps) {
  const [values] = useState(() => fresh(args));
  return <EstimateVoidCard {...args} {...values} />;
}
const view = estimateVoidCardFixture();
const meta = {
  title: "Assistant/EstimateVoidCard", component: EstimateVoidCard,
  args: {
    view, context: estimateVoidCardContext(view), grants: estimateVoidGrants,
    onOperate: fn<NonNullable<EstimateVoidCardProps["onOperate"]>>(async () => ({ ok: true })),
  },
  render: args => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateVoidCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(change: (view: EstimateVoidChatView) => void): Story {
  const view = estimateVoidCardFixture(); change(view);
  return { args: { view, context: estimateVoidCardContext(view) } };
}
const redacted: NonNullable<Story["play"]> = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  for (const text of [c.stories.sourceName, c.stories.parentName, c.stories.recipient, c.stories.reason]) {
    await expect(canvasElement).not.toHaveTextContent(text);
  }
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
};
export const Sent: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  for (const text of [c.stories.reason, c.stories.recipient, c.statuses.sent, "$969.17", c.linkEffect, c.deliveryEffect, c.recordEffect]) {
    await expect(canvas.getByText(text)).toBeVisible();
  }
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const Published: Story = sample(view => { view.ticket.estimate.status = "published"; });
export const LinkedLead: Story = sample(view => { view.review.parent.type = "lead"; view.review.parent.number = "L-1038"; });
export const ZeroTotal: Story = { ...sample(view => { view.review.totalCents = 0; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText("$0.00")).toBeVisible();
} };
export const MissingReason: Story = { ...sample(view => { view.review.reason = ""; view.canConfirm = false; }), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.missingReason)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeEnabled();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const MaximumReason: Story = { ...sample(view => { view.review.reason = c.stories.maximumReason; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.stories.maximumReason)).toBeVisible();
} };
export const LongLiteralContent: Story = { ...sample(view => {
  view.review.reason = `${c.stories.literal}\n${c.stories.longWord}`;
  view.ticket.estimate.name = c.stories.longSourceName;
  view.review.recipientName = c.stories.longRecipient; view.review.parent.name = c.stories.longParentName;
}), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(`${c.stories.literal}\n${c.stories.longWord}`, { normalizer: value => value })).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
} };
export const RequestIsNotAReceipt: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm }));
  await expect(args.onOperate).toHaveBeenCalledTimes(1);
  await expect(args.onOperate).toHaveBeenCalledWith(estimateVoidCardRequest(args.view, args.context!.workspaceId, "confirm"));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.confirmed)).not.toBeInTheDocument();
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const CancellationWaitsForHost: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onOperate).toHaveBeenCalledWith(estimateVoidCardRequest(args.view, args.context!.workspaceId, "cancel"));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.cancelled)).not.toBeInTheDocument();
} };
export const KeyboardConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), confirm = canvas.getByRole("button", { name: c.confirm });
  await userEvent.tab(); await expect(confirm).toHaveFocus();
  await expect(getComputedStyle(confirm).outlineWidth).toBe("3px");
  await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus();
  await userEvent.tab({ shift: true }); await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const PendingSingleFlight: Story = {
  args: { onOperate: fn<NonNullable<EstimateVoidCardProps["onOperate"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
  },
};
function terminal(state: "confirmed" | "cancelled" | "superseded" | "expired"): Story {
  return { ...sample(view => {
    if (state === "confirmed") Object.assign(view, estimateVoidCardConfirmed(view));
    else view.ticket.state = state;
  }), play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const text of [c.stories.reason, c.stories.recipient, c.stories.parentName, "$969.17", c.privateTitle]) {
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
    }
    await expect(canvas.getByRole("status")).toHaveTextContent(c[state]);
    if (state === "confirmed") {
      await userEvent.dblClick(canvas.getByRole("button", { name: c.open }));
      await expect(args.onOperate).toHaveBeenCalledTimes(1);
      await expect(args.onOperate).toHaveBeenCalledWith(expect.objectContaining({ decision: "open" }));
      await expect(canvas.getByRole("status")).toHaveTextContent(c.openRequested);
    } else await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  } };
}
export const Confirmed: Story = terminal("confirmed");
export const Cancelled: Story = terminal("cancelled");
export const Superseded: Story = terminal("superseded");
export const Expired: Story = terminal("expired");
export const ExpiryWhileOpen: Story = { ...sample(view => {
  view.ticket.expiresAt = new Date(Date.parse(view.ticket.createdAt) + 600).toISOString();
}), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(async () => { await expect(canvas.getByRole("status")).toHaveTextContent(c.expired); }, { timeout: 3000 });
  await expect(canvas.queryByText(c.stories.reason)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const NoHandler: Story = { args: { onOperate: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const Disabled: Story = { args: { disabled: true }, play: redacted };
export const ReadAccessMissing: Story = { args: { grants: { ...estimateVoidGrants, read: false } }, play: redacted };
export const ParentAccessMissing: Story = { args: { grants: { ...estimateVoidGrants, parentAccess: false } }, play: redacted };
export const VoidGrantMissing: Story = { args: { grants: { ...estimateVoidGrants, void: false } }, play: redacted };
export const MissingHostContext: Story = { args: { context: null }, play: redacted };
export const MismatchedReason: Story = { args: { context: {
  ...estimateVoidCardContext(view), view: { ...view, review: { ...view.review, reason: c.stories.literal } },
} }, play: redacted };
export const InvalidReadiness: Story = { ...sample(view => { view.canConfirm = false; }), play: redacted };
export const InvalidReceipt: Story = { ...sample(view => { Object.assign(view, estimateVoidCardConfirmed(view)); view.receipt!.version++; }), play: redacted };
export const InvalidAmount: Story = { ...sample(view => { view.review.totalCents = -1; }), play: redacted };
export const ArchivedSource: Story = { ...sample(view => { Object.assign(view.ticket.estimate, { archived: true }); }), play: redacted };
export const OperationRejected: Story = {
  args: { onOperate: fn<NonNullable<EstimateVoidCardProps["onOperate"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (let count = 1; count <= 2; count++) {
      await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
      await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
      await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
      await expect(args.onOperate).toHaveBeenCalledTimes(count);
    }
  },
};
export const ThrownOperation: Story = {
  args: { onOperate: fn<NonNullable<EstimateVoidCardProps["onOperate"]>>(async () => { throw new Error(c.stories.failure); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const EmptyError: Story = {
  args: { onOperate: fn<NonNullable<EstimateVoidCardProps["onOperate"]>>(async () => ({ ok: false, message: " " })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const RetryAfterFailure: Story = { play: async ({ canvasElement, args }) => {
  args.onOperate?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(args.onOperate).toHaveBeenCalledTimes(2);
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
const changes = {
  read: c.stories.revoke, parent: c.stories.parent, grant: c.stories.grant, handler: c.stories.handler,
  proposal: c.stories.replace, workspace: c.stories.workspace, disabled: c.stories.disabled, context: c.stories.context,
} as const;
function RacePreview({ change, success, ...args }: EstimateVoidCardProps & { change: keyof typeof changes; success: boolean }) {
  const [values, setValues] = useState(() => fresh(args)), [disabled, setDisabled] = useState(false);
  const [grants, setGrants] = useState(args.grants), [connected, setConnected] = useState(true);
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setGrants({ ...grants, read: false });
        if (change === "parent") setGrants({ ...grants, parentAccess: false });
        if (change === "grant") setGrants({ ...grants, void: false });
        if (change === "handler") setConnected(false);
        if (change === "disabled") setDisabled(true);
        if (change === "workspace" && values.context) setValues({ ...values, context: { ...values.context, workspaceId: estimateVoidOtherWorkspace } });
        if (change === "context" && values.context) setValues({ ...values,
          context: { ...values.context, view: { ...values.context.view, review: { ...values.context.view.review, reason: c.stories.literal } } },
        });
        if (change === "proposal") {
          const next = estimateVoidCardFixture(); next.ticket.id = estimateVoidOtherWorkspace;
          setValues({ view: next, context: estimateVoidCardContext(next) });
        }
      }}>{changes[change]}</button>
      <button type="button" className={control}
        onClick={() => release.current?.(success ? { ok: true } : { ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateVoidCard {...args} {...values} grants={grants} disabled={disabled} onOperate={connected ? async command => {
      await args.onOperate?.(command);
      return new Promise(resolve => { release.current = resolve; });
    } : undefined} />
  </div>;
}
function race(change: keyof typeof changes, success = false): Story {
  return { render: args => <RacePreview {...args} change={change} success={success} />, play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: changes[change] }));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
    if (["read", "parent", "grant", "disabled", "context"].includes(change)) {
      await expect(canvas.queryByText(c.stories.reason)).not.toBeInTheDocument();
      await expect(canvas.queryByRole("button", { name: c.confirm })).not.toBeInTheDocument();
    } else if (change === "handler") await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    else await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  } };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const VoidRevokedWhilePending: Story = race("grant");
export const DisabledWhilePending: Story = race("disabled");
export const HostDisconnectedWhilePending: Story = race("handler");
export const ProposalReplacedWhilePending: Story = race("proposal");
export const WorkspaceChangedWhilePending: Story = race("workspace");
export const ReasonChangedWhilePending: Story = race("context");
export const LateSuccessAfterReadLoss: Story = race("read", true);
export const LateSuccessAfterProposalChange: Story = race("proposal", true);
function ExpiringPreview(args: EstimateVoidCardProps) {
  const [values] = useState(() => {
    const view = estimateVoidCardFixture();
    view.ticket.expiresAt = new Date(Date.now() + 1200).toISOString();
    return { view, context: estimateVoidCardContext(view) };
  });
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <EstimateVoidCard {...args} {...values} onOperate={async command => {
      await args.onOperate?.(command);
      return new Promise(resolve => { release.current = resolve; });
    }} />
    <button type="button" className={control}
      onClick={() => release.current?.({ ok: false, message: c.stories.failure })}>{c.stories.release}</button>
  </div>;
}
export const LateResponseAfterExpiry: Story = { render: args => <ExpiringPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
  await waitFor(async () => { await expect(canvas.getByRole("status")).toHaveTextContent(c.expired); }, { timeout: 4000 });
  await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.reason)).not.toBeInTheDocument();
} };
function HostPreview({ decision, ...args }: EstimateVoidCardProps & { decision: "confirm" | "cancel" }) {
  const [values, setValues] = useState(() => fresh(args));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => {
      const view: EstimateVoidChatView = decision === "confirm" ? estimateVoidCardConfirmed(values.view)
        : { ...values.view, ticket: { ...values.view.ticket, state: "cancelled" } };
      setValues({ view, context: estimateVoidCardContext(view) });
    }}>{decision === "confirm" ? c.stories.hostConfirm : c.stories.hostCancel}</button>
    <EstimateVoidCard {...args} {...values} />
  </div>;
}
function hostOutcome(decision: "confirm" | "cancel"): Story {
  return { render: args => <HostPreview {...args} decision={decision} />, play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: decision === "confirm" ? c.confirm : c.cancel }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
    await userEvent.click(canvas.getByRole("button", { name: decision === "confirm" ? c.stories.hostConfirm : c.stories.hostCancel }));
    await expect(canvas.getByRole("status")).toHaveTextContent(decision === "confirm" ? c.confirmed : c.cancelled);
    await expect(canvas.queryByText(c.stories.reason)).not.toBeInTheDocument();
    if (decision === "confirm") await expect(canvas.getByRole("button", { name: c.open })).toBeEnabled();
    else await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
  } };
}
export const AuthoritativeHostOutcome: Story = hostOutcome("confirm");
export const AuthoritativeHostCancellation: Story = hostOutcome("cancel");
function Conversation(args: EstimateVoidCardProps) {
  const [values] = useState(() => fresh(args)), [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} contextLabel={values.view.ticket.estimate.number}
    messages={[{ id: "sample-void", role: "assistant", text: c.stories.chatAnswer }]} onSend={async () => ({ ok: true })}
    renderMessageSupplement={() => <EstimateVoidCard {...args} {...values} />} />;
}
export const InsideAssistant: Story = { render: args => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.naturalYes); await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).not.toHaveBeenCalled();
  await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
} };

import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateDraftActionChatView } from "@salesmora/contracts";
import { EstimateDraftActionCard } from "./estimate-draft-action-card";
import { estimateDraftActionCardData as c } from "./estimate-draft-action-card.data";
import {
  estimateDraftActionConfirmed, estimateDraftActionContext, estimateDraftActionFixture,
  estimateDraftActionGrants, estimateDraftActionOtherWorkspace,
} from "./estimate-draft-action-card.fixtures";
import { estimateDraftActionCardRequest } from "./estimate-draft-action-card.preview";
import type { EstimateDraftActionCardProps } from "./estimate-draft-action-card.types";

function fresh(args: EstimateDraftActionCardProps) {
  const { view, context } = structuredClone({ view: args.view, context: args.context });
  const offset = Date.now() - Date.parse(view.ticket.createdAt);
  for (const ticket of [view.ticket, context?.view.ticket]) {
    if (!ticket) continue;
    ticket.createdAt = new Date(Date.parse(ticket.createdAt) + offset).toISOString();
    ticket.expiresAt = new Date(Date.parse(ticket.expiresAt) + offset).toISOString();
  }
  return { view, context };
}
function Preview(args: EstimateDraftActionCardProps) {
  const [values] = useState(() => fresh(args));
  return <EstimateDraftActionCard {...args} {...values} />;
}
const view = estimateDraftActionFixture();
const meta = {
  title: "Assistant/EstimateDraftActionCard", component: EstimateDraftActionCard,
  args: {
    view, context: estimateDraftActionContext(view), grants: estimateDraftActionGrants,
    onOperate: fn<NonNullable<EstimateDraftActionCardProps["onOperate"]>>(async () => ({ ok: true })),
  },
  render: args => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateDraftActionCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(kind: "revise" | "reuse" | "duplicate" = "revise", change?: (view: EstimateDraftActionChatView) => void): Story {
  const view = estimateDraftActionFixture(kind); change?.(view);
  return { args: { view, context: estimateDraftActionContext(view) } };
}
const redacted: NonNullable<Story["play"]> = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvasElement).not.toHaveTextContent(c.stories.sourceName);
  await expect(canvas.queryByText(c.stories.parentName)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.notes)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
};
export const CreateRevision: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.stories.email)).toBeVisible();
  await expect(canvas.getByText(c.stories.paymentLink)).toBeVisible();
  await expect(canvas.getByText(c.noNotesCopied)).toBeVisible();
  for (const amount of ["$962.50", "$48.13", "$54.80", "$969.17", "$242.29", "$726.88"]) await expect(canvas.getByText(amount)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeEnabled();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const Duplicate: Story = { ...sample("duplicate"), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.duplicateRules)).toBeVisible();
  await expect(canvas.getByText(c.duplicateNumber)).toBeVisible();
  await expect(canvas.getByText(c.stories.notes)).toBeVisible();
  await expect(canvas.getAllByText(c.cleared)).toHaveLength(3);
  await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.paymentLink)).not.toBeInTheDocument();
  await expect(canvas.queryByText("2026-11-21")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const ReuseEditedDraft: Story = { ...sample("reuse"), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.stories.editedScope)).toBeVisible();
  await expect(canvas.getByText(c.stories.notes)).toBeVisible();
  await expect(canvas.getByText(c.reuseRules)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm.reuse })).toBeEnabled();
} };
export const LinkedLead: Story = sample("revise", view => { view.review.parent.type = "lead"; view.review.parent.number = "L-1038"; });
export const EmptyDraft: Story = sample("duplicate", view => { view.review.values.items = []; view.review.totalCents = null; });
export const ZeroTotal: Story = sample("duplicate", view => {
  view.review.values.items = [{ description: c.stories.included, quantity: "1", unitPrice: "0", included: true, taxable: false }];
  view.review.values.totals.discount = { type: "none" }; view.review.totalCents = 0;
});
export const MaximumItems: Story = { ...sample("duplicate", view => {
  view.review.values.items = Array.from({ length: 100 }, (_, index) => ({
    description: `${c.stories.included} ${index + 1}`, quantity: "1", unitPrice: "0", included: true, taxable: false,
  }));
  view.review.values.totals.discount = { type: "none" }; view.review.totalCents = 0;
}), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(within(canvas.getByRole("list")).getAllByRole("listitem")).toHaveLength(100);
  await expect(canvas.getByText(`${c.stories.included} 100`)).toBeVisible();
} };
export const ArchivedDuplicateSource: Story = sample("duplicate", view => { view.ticket.source.archived = true; view.ticket.source.status = "void"; });
export const DuplicateWithoutUpdateGrant: Story = { ...sample("duplicate"), args: {
  ...sample("duplicate").args, grants: { ...estimateDraftActionGrants, update: false },
} };
export const RequestIsNotAReceipt: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.dblClick(canvas.getByRole("button", { name: c.confirm.revise }));
  await expect(args.onOperate).toHaveBeenCalledTimes(1);
  await expect(args.onOperate).toHaveBeenCalledWith(estimateDraftActionCardRequest(args.view, args.context!.workspaceId, "confirm"));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
  await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const KeyboardConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), confirm = canvas.getByRole("button", { name: c.confirm.revise });
  await userEvent.tab();
  await expect(confirm).toHaveFocus();
  await expect(getComputedStyle(confirm).outlineWidth).toBe("3px");
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus();
  await userEvent.tab({ shift: true });
  await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const CancellationWaitsForHost: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
  await expect(args.onOperate).toHaveBeenCalledWith(estimateDraftActionCardRequest(args.view, args.context!.workspaceId, "cancel"));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(canvas.queryByText(c.cancelled)).not.toBeInTheDocument();
} };
function confirmed(kind: "revise" | "reuse" | "duplicate"): Story {
  const view = estimateDraftActionConfirmed(estimateDraftActionFixture(kind));
  return { args: { view, context: estimateDraftActionContext(view) }, play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.confirmed[kind]);
    await expect(canvas.queryByText(c.stories.notes)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.scope)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.open }));
    await expect(args.onOperate).toHaveBeenCalledWith(estimateDraftActionCardRequest(args.view, args.context!.workspaceId, "open"));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.openRequested);
  } };
}
export const ConfirmedRevision: Story = confirmed("revise");
export const ConfirmedDuplicate: Story = confirmed("duplicate");
export const ConfirmedReuse: Story = confirmed("reuse");
function terminal(state: "expired" | "superseded" | "cancelled"): Story {
  return { ...sample("duplicate", view => { view.ticket.state = state; }), play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(c.stories.notes)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c[state]);
    await expect(args.onOperate).not.toHaveBeenCalled();
  } };
}
export const Expired: Story = terminal("expired");
export const Superseded: Story = terminal("superseded");
export const Cancelled: Story = terminal("cancelled");
export const ExpiryWhileOpen: Story = { ...sample("revise", view => {
  view.ticket.expiresAt = new Date(Date.parse(view.ticket.createdAt) + 600).toISOString();
}), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(async () => { await expect(canvas.getByRole("status")).toHaveTextContent(c.expired); }, { timeout: 3000 });
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const NoHandler: Story = { args: { onOperate: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const Disabled: Story = { args: { disabled: true }, play: redacted };
export const ReadAccessMissing: Story = { args: { grants: { ...estimateDraftActionGrants, read: false } }, play: redacted };
export const ParentAccessMissing: Story = { args: { grants: { ...estimateDraftActionGrants, parentAccess: false } }, play: redacted };
export const CreateGrantMissing: Story = { args: { grants: { ...estimateDraftActionGrants, create: false } }, play: redacted };
export const UpdateGrantMissing: Story = { args: { grants: { ...estimateDraftActionGrants, update: false } }, play: redacted };
export const MissingHostContext: Story = { args: { context: null }, play: redacted };
export const MismatchedReview: Story = { args: { context: {
  ...estimateDraftActionContext(view), view: { ...view, review: { ...view.review, values: { ...view.review.values, scope: c.stories.editedScope } } },
} }, play: redacted };
export const AmountMismatch: Story = { ...sample("revise", view => { view.review.totalCents = 1; }), play: redacted };
export const OperationRejected: Story = {
  args: { onOperate: fn<NonNullable<EstimateDraftActionCardProps["onOperate"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(args.onOperate).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
  },
};
export const ThrownOperation: Story = {
  args: { onOperate: fn<NonNullable<EstimateDraftActionCardProps["onOperate"]>>(async () => { throw new Error(c.stories.failure); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
    await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeEnabled();
  },
};
export const RetryAfterFailure: Story = {
  play: async ({ canvasElement, args }) => {
    args.onOperate?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
    await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
    await expect(args.onOperate).toHaveBeenCalledTimes(2);
  },
};
export const LongLiteralContent: Story = { ...sample("duplicate", view => {
  view.review.values.scope = `${c.stories.literal}\n${c.stories.longWord}`;
  view.review.values.internalNotes = `${c.stories.notes}\n${c.stories.longWord}`;
  view.review.values.items[0].description = c.stories.longWord.slice(0, 200);
}), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(`${c.stories.literal}\n${c.stories.longWord}`, { normalizer: value => value })).toBeVisible();
  await expect(canvasElement.querySelector("script")).toBeNull();
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
const changes = {
  read: c.stories.revoke, parent: c.stories.parent, grant: c.stories.grant, handler: c.stories.handler,
  proposal: c.stories.replace, workspace: c.stories.switchWorkspace, disabled: c.stories.disable,
} as const;
function RacePreview({ change, success, ...args }: EstimateDraftActionCardProps & { change: keyof typeof changes; success: boolean }) {
  const [values, setValues] = useState(() => fresh(args)), [disabled, setDisabled] = useState(false);
  const [grants, setGrants] = useState(args.grants);
  const [connected, setConnected] = useState(true);
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setGrants({ ...grants, read: false });
        if (change === "parent") setGrants({ ...grants, parentAccess: false });
        if (change === "grant") setGrants({ ...grants, create: false });
        if (change === "handler") setConnected(false);
        if (change === "disabled") setDisabled(true);
        if (change === "workspace" && values.context) setValues({ ...values, context: { ...values.context, workspaceId: estimateDraftActionOtherWorkspace } });
        if (change === "proposal") {
          const next = estimateDraftActionFixture(); next.ticket.id = estimateDraftActionOtherWorkspace;
          setValues({ view: next, context: estimateDraftActionContext(next) });
        }
      }}>{changes[change]}</button>
      <button type="button" className={control} onClick={() => release.current?.(success ? { ok: true } : { ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateDraftActionCard {...args} {...values} grants={grants} disabled={disabled} onOperate={connected ? async command => {
      await args.onOperate?.(command);
      return new Promise(resolve => { release.current = resolve; });
    } : undefined} />
  </div>;
}
function race(change: keyof typeof changes, success = false): Story {
  return { render: args => <RacePreview {...args} change={change} success={success} />, play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: changes[change] }));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
    if (change === "read" || change === "parent" || change === "grant" || change === "disabled") {
      await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
      await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
    } else if (change === "handler") {
      await expect(canvas.getByText(c.noHandler)).toBeVisible();
      await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeDisabled();
    } else await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeEnabled();
  } };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent", true);
export const CreateRevokedWhilePending: Story = race("grant");
export const HandlerRemovedWhilePending: Story = race("handler", true);
export const DisabledWhilePending: Story = race("disabled", true);
export const WorkspaceChangedWhilePending: Story = race("workspace", true);
export const ProposalReplacedWhilePending: Story = race("proposal");
export const LateSuccessIgnored: Story = race("proposal", true);

function HostPreview(args: EstimateDraftActionCardProps) {
  const [values, setValues] = useState(() => fresh(args));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => {
      const view = estimateDraftActionConfirmed(values.view); setValues({ view, context: estimateDraftActionContext(view) });
    }}>{c.stories.hostConfirm}</button>
    <EstimateDraftActionCard {...args} {...values} />
  </div>;
}
export const AuthoritativeHostOutcome: Story = { render: args => <HostPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.confirm.revise }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await userEvent.click(canvas.getByRole("button", { name: c.stories.hostConfirm }));
  await expect(canvas.getByRole("status")).toHaveTextContent(c.confirmed.revise);
  await expect(canvas.getByRole("button", { name: c.open })).toBeEnabled();
  await expect(canvas.queryByText(c.stories.email)).not.toBeInTheDocument();
} };
function Conversation(args: EstimateDraftActionCardProps) {
  const [values] = useState(() => fresh(args)), [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} contextLabel={values.view.ticket.source.number}
    messages={[{ id: "sample-draft-action", role: "assistant", text: c.stories.chatAnswer }]}
    onSend={async () => ({ ok: true })}
    renderMessageSupplement={() => <EstimateDraftActionCard {...args} {...values} />} />;
}
export const InsideAssistant: Story = { render: args => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.naturalYes);
  await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).not.toHaveBeenCalled();
  await expect(canvas.getByRole("button", { name: c.confirm.revise })).toBeEnabled();
} };

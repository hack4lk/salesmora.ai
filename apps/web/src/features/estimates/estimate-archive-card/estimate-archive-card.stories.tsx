import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AssistantPanel, type EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateArchiveChatView } from "@salesmora/contracts";
import { EstimateArchiveCard } from "./estimate-archive-card";
import { estimateArchiveCardData as c } from "./estimate-archive-card.data";
import {
  estimateArchiveCardConfirmed, estimateArchiveCardContext, estimateArchiveCardFixture, estimateArchiveGrants, estimateArchiveOtherWorkspace,
} from "./estimate-archive-card.fixtures";
import { estimateArchiveCardRequest } from "./estimate-archive-card.preview";
import type { EstimateArchiveCardProps } from "./estimate-archive-card.types";

function fresh(args: EstimateArchiveCardProps) {
  const values = structuredClone({ view: args.view, context: args.context });
  const offset = Date.now() - Date.parse(args.view.ticket.createdAt);
  for (const ticket of [values.view.ticket, values.context?.view.ticket]) {
    if (!ticket) continue;
    ticket.createdAt = new Date(Date.parse(ticket.createdAt) + offset).toISOString();
    ticket.expiresAt = new Date(Date.parse(ticket.expiresAt) + offset).toISOString();
  }
  return values;
}
function Preview(args: EstimateArchiveCardProps) {
  const [values] = useState(() => fresh(args));
  return <EstimateArchiveCard {...args} {...values} />;
}
const view = estimateArchiveCardFixture();
const meta = {
  title: "Assistant/EstimateArchiveCard", component: EstimateArchiveCard,
  args: {
    view, context: estimateArchiveCardContext(view), grants: estimateArchiveGrants,
    onOperate: fn<NonNullable<EstimateArchiveCardProps["onOperate"]>>(async () => ({ ok: true })),
  },
  render: args => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateArchiveCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function sample(change: (view: EstimateArchiveChatView) => void = () => {}, operation: "archive" | "restore" = "archive"): Story {
  const view = estimateArchiveCardFixture(operation); change(view);
  return { args: { view, context: estimateArchiveCardContext(view) } };
}
const redacted: NonNullable<Story["play"]> = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  for (const text of [c.stories.sourceName, c.stories.parentName, c.stories.recipient]) {
    await expect(canvasElement).not.toHaveTextContent(text);
  }
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
};
function ready(operation: "archive" | "restore"): Story {
  return { ...sample(undefined, operation), play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const text of [c.stories.recipient, c.statuses.declined, c[operation].effect, c.recordEffect,
      operation === "archive" ? c.archiveFlags.no : c.archiveFlags.yes]) {
      await expect(canvas.getByText(text, { exact: true })).toBeVisible();
    }
    await expect(canvas.getByRole("button", { name: c[operation].confirm })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeEnabled();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(args.onOperate).not.toHaveBeenCalled();
  } };
}
export const ArchiveDeclined: Story = ready("archive");
export const ArchiveExpired: Story = sample(view => { view.ticket.estimate.status = "expired"; });
export const ArchiveSuperseded: Story = sample(view => { view.ticket.estimate.status = "superseded"; });
export const ArchiveVoid: Story = sample(view => { view.ticket.estimate.status = "void"; });
export const RestoreDeclined: Story = ready("restore");
export const RestoreDraft: Story = sample(view => { view.ticket.estimate.status = "draft"; }, "restore");
export const RestoreSent: Story = sample(view => { view.ticket.estimate.status = "sent"; }, "restore");
export const RestorePublished: Story = sample(view => { view.ticket.estimate.status = "published"; }, "restore");
export const RestoreAccepted: Story = sample(view => { view.ticket.estimate.status = "accepted"; }, "restore");
export const RestoreExpired: Story = sample(view => { view.ticket.estimate.status = "expired"; }, "restore");
export const RestoreSuperseded: Story = sample(view => { view.ticket.estimate.status = "superseded"; }, "restore");
export const RestoreVoid: Story = sample(view => { view.ticket.estimate.status = "void"; }, "restore");
export const LinkedLead: Story = sample(view => { view.review.parent.type = "lead"; view.review.parent.number = "L-1038"; });
export const MissingRecipient: Story = { ...sample(view => { view.review.recipientName = ""; }, "restore"), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.notSpecified)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.restore.confirm })).toBeEnabled();
} };
export const LongContent: Story = sample(view => {
  view.ticket.estimate.name = c.stories.longSourceName;
  view.review.recipientName = c.stories.longRecipient; view.review.parent.name = c.stories.longParentName;
});
export const LiteralTextOnly: Story = { ...sample(view => {
  view.ticket.estimate.name = c.stories.literal; view.review.recipientName = c.stories.literal;
  view.review.parent.name = c.stories.literal;
}), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByText(c.stories.literal, { exact: false })).toHaveLength(3);
  await expect(canvasElement.querySelector("script")).toBeNull();
} };
function request(operation: "archive" | "restore", decision: "confirm" | "cancel"): Story {
  return { ...sample(undefined, operation), play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: decision === "confirm" ? c[operation].confirm : c.cancel }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(args.onOperate).toHaveBeenCalledWith(estimateArchiveCardRequest(args.view, args.context!.workspaceId, decision));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
    await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
    await expect(canvas.queryByText(c[operation].confirmed)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c[operation].cancelled)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c[operation].confirm })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
    await expect(canvas.queryByRole("alertdialog")).not.toBeInTheDocument();
  } };
}
export const ArchiveRequestIsNotAReceipt: Story = request("archive", "confirm");
export const RestoreRequestIsNotAReceipt: Story = request("restore", "confirm");
export const ArchiveCancellationWaitsForHost: Story = request("archive", "cancel");
export const RestoreCancellationWaitsForHost: Story = request("restore", "cancel");
export const KeyboardConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), confirm = canvas.getByRole("button", { name: c.archive.confirm });
  await userEvent.tab(); await expect(confirm).toHaveFocus();
  await expect(getComputedStyle(confirm).outlineWidth).toBe("3px");
  await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus();
  await userEvent.tab({ shift: true }); await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
} };
export const PendingSingleFlight: Story = {
  args: { onOperate: fn<NonNullable<EstimateArchiveCardProps["onOperate"]>>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.archive.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.working);
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
  },
};
function terminal(state: "confirmed" | "cancelled" | "superseded" | "expired", operation: "archive" | "restore" = "archive"): Story {
  return { ...sample(view => {
    if (state === "confirmed") Object.assign(view, estimateArchiveCardConfirmed(view));
    else view.ticket.state = state;
  }, operation), play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const text of [c.stories.recipient, c.stories.parentName, c.archived, c.status, c.recipient]) {
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
    }
    await expect(canvas.getByRole("status")).toHaveTextContent(state === "superseded" ? c.superseded : c[operation][state]);
    if (state === "confirmed") {
      await userEvent.dblClick(canvas.getByRole("button", { name: c.open }));
      await expect(args.onOperate).toHaveBeenCalledTimes(1);
      await expect(args.onOperate).toHaveBeenCalledWith(estimateArchiveCardRequest(args.view, args.context!.workspaceId, "open"));
      await expect(canvas.getByRole("status")).toHaveTextContent(c.openRequested);
      await expect(canvas.queryByRole("button", { name: c.archive.confirm })).not.toBeInTheDocument();
      await expect(canvas.queryByRole("button", { name: c.restore.confirm })).not.toBeInTheDocument();
    } else await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  } };
}
export const Archived: Story = terminal("confirmed");
export const Restored: Story = terminal("confirmed", "restore");
export const ArchiveCancelled: Story = terminal("cancelled");
export const RestoreCancelled: Story = terminal("cancelled", "restore");
export const Superseded: Story = terminal("superseded");
export const ArchiveExpiredProposal: Story = terminal("expired");
export const RestoreExpiredProposal: Story = terminal("expired", "restore");
export const ExpiryWhileOpen: Story = { ...sample(view => {
  view.ticket.expiresAt = new Date(Date.parse(view.ticket.createdAt) + 600).toISOString();
}), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitFor(async () => { await expect(canvas.getByRole("status")).toHaveTextContent(c.archive.expired); }, { timeout: 3000 });
  await expect(canvas.queryByText(c.stories.recipient)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(args.onOperate).not.toHaveBeenCalled();
} };
export const NoHandler: Story = { args: { onOperate: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.noHandler)).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
} };
export const Disabled: Story = { args: { disabled: true }, play: redacted };
export const ReadAccessMissing: Story = { args: { grants: { ...estimateArchiveGrants, read: false } }, play: redacted };
export const ParentAccessMissing: Story = { args: { grants: { ...estimateArchiveGrants, parentAccess: false } }, play: redacted };
export const ArchiveGrantMissing: Story = { args: { grants: { ...estimateArchiveGrants, archive: false } }, play: redacted };
export const MissingHostContext: Story = { args: { context: null }, play: redacted };
export const MismatchedRecipient: Story = { args: { context: {
  ...estimateArchiveCardContext(view), view: { ...view, review: { ...view.review, recipientName: c.stories.literal } },
} }, play: redacted };
export const MismatchedAction: Story = { args: { context: estimateArchiveCardContext(estimateArchiveCardFixture("restore")) }, play: redacted };
export const InvalidReceipt: Story = { ...sample(view => { Object.assign(view, estimateArchiveCardConfirmed(view)); view.receipt!.archived = false; }), play: redacted };
export const WrongArchiveFlag: Story = { ...sample(view => { view.ticket.estimate.archived = true; }), play: redacted };
export const ActiveArchiveSource: Story = { ...sample(view => { view.ticket.estimate.status = "accepted"; }), play: redacted };
export const UnarchivedRestoreSource: Story = { ...sample(view => { view.ticket.estimate.archived = false; }, "restore"), play: redacted };
export const OperationRejected: Story = {
  args: { onOperate: fn<NonNullable<EstimateArchiveCardProps["onOperate"]>>(async () => ({ ok: false, message: c.stories.failure })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (let count = 1; count <= 2; count++) {
      await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
      await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
      await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeEnabled();
      await expect(args.onOperate).toHaveBeenCalledTimes(count);
    }
  },
};
export const ThrownOperation: Story = {
  args: { onOperate: fn<NonNullable<EstimateArchiveCardProps["onOperate"]>>(async () => { throw new Error(c.stories.failure); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
    await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeEnabled();
  },
};
export const EmptyError: Story = {
  args: { onOperate: fn<NonNullable<EstimateArchiveCardProps["onOperate"]>>(async () => ({ ok: false, message: " " })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.failure);
  },
};
export const RetryAfterFailure: Story = { play: async ({ canvasElement, args }) => {
  args.onOperate?.mockResolvedValueOnce({ ok: false, message: c.stories.failure });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
  await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
  await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
  await expect(args.onOperate).toHaveBeenCalledTimes(2);
} };

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
const changes = {
  read: c.stories.revoke, parent: c.stories.parent, grant: c.stories.grant, handler: c.stories.handler,
  proposal: c.stories.replace, workspace: c.stories.workspace, disabled: c.stories.disabled, context: c.stories.context, action: c.stories.action,
} as const;
function RacePreview({ change, success, ...args }: EstimateArchiveCardProps & { change: keyof typeof changes; success: boolean }) {
  const [values, setValues] = useState(() => fresh(args)), [disabled, setDisabled] = useState(false);
  const [grants, setGrants] = useState(args.grants), [connected, setConnected] = useState(true);
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setGrants({ ...grants, read: false });
        if (change === "parent") setGrants({ ...grants, parentAccess: false });
        if (change === "grant") setGrants({ ...grants, archive: false });
        if (change === "handler") setConnected(false);
        if (change === "disabled") setDisabled(true);
        if (change === "workspace" && values.context) setValues({ ...values, context: { ...values.context, workspaceId: estimateArchiveOtherWorkspace } });
        if (change === "context" && values.context) setValues({ ...values,
          context: { ...values.context, view: { ...values.context.view, review: { ...values.context.view.review, recipientName: c.stories.literal } } },
        });
        if (change === "proposal" || change === "action") {
          const next = estimateArchiveCardFixture(change === "action" ? "restore" : "archive"); next.ticket.id = estimateArchiveOtherWorkspace;
          setValues({ view: next, context: estimateArchiveCardContext(next) });
        }
      }}>{changes[change]}</button>
      <button type="button" className={control}
        onClick={() => release.current?.(success ? { ok: true } : { ok: false, message: c.stories.failure })}>{c.stories.release}</button>
    </div>
    <EstimateArchiveCard {...args} {...values} grants={grants} disabled={disabled} onOperate={connected ? async command => {
      await args.onOperate?.(command);
      return new Promise(resolve => { release.current = resolve; });
    } : undefined} />
  </div>;
}
function race(change: keyof typeof changes, success = false): Story {
  return { render: args => <RacePreview {...args} change={change} success={success} />, play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: changes[change] }));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.requested)).not.toBeInTheDocument();
    if (["read", "parent", "grant", "disabled", "context"].includes(change)) {
      await expect(canvas.queryByText(c.stories.recipient)).not.toBeInTheDocument();
      await expect(canvas.queryByRole("button", { name: c.archive.confirm })).not.toBeInTheDocument();
    } else if (change === "handler") await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeDisabled();
    else await expect(canvas.getByRole("button", { name: change === "action" ? c.restore.confirm : c.archive.confirm })).toBeEnabled();
  } };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const ArchiveRevokedWhilePending: Story = race("grant");
export const DisabledWhilePending: Story = race("disabled");
export const HostDisconnectedWhilePending: Story = race("handler");
export const ProposalReplacedWhilePending: Story = race("proposal");
export const WorkspaceChangedWhilePending: Story = race("workspace");
export const RecipientChangedWhilePending: Story = race("context");
export const ActionChangedWhilePending: Story = race("action");
export const LateSuccessAfterReadLoss: Story = race("read", true);
export const LateSuccessAfterProposalChange: Story = race("proposal", true);
export const LateSuccessAfterActionChange: Story = race("action", true);
function ExpiringPreview(args: EstimateArchiveCardProps) {
  const [values] = useState(() => {
    const view = estimateArchiveCardFixture();
    view.ticket.expiresAt = new Date(Date.now() + 1200).toISOString();
    return { view, context: estimateArchiveCardContext(view) };
  });
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <EstimateArchiveCard {...args} {...values} onOperate={async command => {
      await args.onOperate?.(command);
      return new Promise(resolve => { release.current = resolve; });
    }} />
    <button type="button" className={control}
      onClick={() => release.current?.({ ok: false, message: c.stories.failure })}>{c.stories.release}</button>
  </div>;
}
export const LateResponseAfterExpiry: Story = { render: args => <ExpiringPreview {...args} />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.archive.confirm }));
  await waitFor(async () => { await expect(canvas.getByRole("status")).toHaveTextContent(c.archive.expired); }, { timeout: 4000 });
  await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.recipient)).not.toBeInTheDocument();
} };
function HostPreview({ decision, ...args }: EstimateArchiveCardProps & { decision: "confirm" | "cancel" }) {
  const [values, setValues] = useState(() => fresh(args));
  return <div className="grid gap-4">
    <button type="button" className={control} onClick={() => {
      const view: EstimateArchiveChatView = decision === "confirm" ? estimateArchiveCardConfirmed(values.view)
        : { ...values.view, ticket: { ...values.view.ticket, state: "cancelled" } };
      setValues({ view, context: estimateArchiveCardContext(view) });
    }}>{decision === "confirm" ? c.stories.hostConfirm : c.stories.hostCancel}</button>
    <EstimateArchiveCard {...args} {...values} />
  </div>;
}
function hostOutcome(decision: "confirm" | "cancel", operation: "archive" | "restore" = "archive"): Story {
  return { ...sample(undefined, operation), render: args => <HostPreview {...args} decision={decision} />, play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: decision === "confirm" ? c[operation].confirm : c.cancel }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
    await userEvent.click(canvas.getByRole("button", { name: decision === "confirm" ? c.stories.hostConfirm : c.stories.hostCancel }));
    await expect(canvas.getByRole("status")).toHaveTextContent(decision === "confirm" ? c[operation].confirmed : c[operation].cancelled);
    await expect(canvas.queryByText(c.stories.recipient)).not.toBeInTheDocument();
    if (decision === "confirm") await expect(canvas.getByRole("button", { name: c.open })).toBeEnabled();
    else await expect(canvas.queryByRole("button", { name: c.open })).not.toBeInTheDocument();
  } };
}
export const AuthoritativeArchiveOutcome: Story = hostOutcome("confirm");
export const AuthoritativeRestoreOutcome: Story = hostOutcome("confirm", "restore");
export const AuthoritativeHostCancellation: Story = hostOutcome("cancel");
function Conversation(args: EstimateArchiveCardProps) {
  const [values] = useState(() => fresh(args)), [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} contextLabel={values.view.ticket.estimate.number}
    messages={[{ id: "sample-archive", role: "assistant", text: c.stories.chatAnswer }]} onSend={async () => ({ ok: true })}
    renderMessageSupplement={() => <EstimateArchiveCard {...args} {...values} />} />;
}
export const InsideAssistant: Story = { render: args => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.naturalYes); await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).not.toHaveBeenCalled();
  await expect(canvas.getByRole("button", { name: c.archive.confirm })).toBeEnabled();
} };
export const RestoreInsideAssistant: Story = { ...InsideAssistant, ...sample(undefined, "restore"), play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.naturalYes); await userEvent.keyboard("{Enter}");
  await expect(args.onOperate).not.toHaveBeenCalled();
  await expect(canvas.getByRole("button", { name: c.restore.confirm })).toBeEnabled();
} };

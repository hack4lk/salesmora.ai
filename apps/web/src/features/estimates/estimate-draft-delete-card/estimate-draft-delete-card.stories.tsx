import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import type { EstimateDraftDeleteChatView } from "@salesmora/contracts";
import { type EstimateDraftOperationResult } from "@salesmora/ui";
import { EstimateDraftDeleteCard } from "./estimate-draft-delete-card";
import { estimateDraftDeleteCardData as c } from "./estimate-draft-delete-card.data";
import {
  estimateDraftDeleteCardCancelled,
  estimateDraftDeleteCardConfirmed,
  estimateDraftDeleteCardContext,
  estimateDraftDeleteCardFixture,
  estimateDraftDeleteCardStoryCopy as storyCopy,
  estimateDraftDeleteGrants,
} from "./estimate-draft-delete-card.fixtures";
import { estimateDraftDeleteCardRequest } from "./estimate-draft-delete-card.preview";
import type { EstimateDraftDeleteCardProps } from "./estimate-draft-delete-card.types";

function fresh(args: EstimateDraftDeleteCardProps) {
  const values = structuredClone({ view: args.view, context: args.context });
  const offset = Date.now() - Date.parse(args.view.ticket.createdAt);
  for (const ticket of [values.view.ticket, values.context?.view.ticket]) {
    if (!ticket) continue;
    ticket.createdAt = new Date(Date.parse(ticket.createdAt) + offset).toISOString();
    ticket.expiresAt = new Date(Date.parse(ticket.expiresAt) + offset).toISOString();
  }
  return values;
}

function Preview(args: EstimateDraftDeleteCardProps) {
  const [values] = useState(() => fresh(args));
  return <EstimateDraftDeleteCard {...args} {...values} />;
}

const initialView = estimateDraftDeleteCardFixture();
const meta = {
  title: "Assistant/EstimateDraftDeleteCard",
  component: EstimateDraftDeleteCard,
  args: {
    view: initialView,
    context: estimateDraftDeleteCardContext(initialView),
    grants: estimateDraftDeleteGrants,
    onOperate: fn<NonNullable<EstimateDraftDeleteCardProps["onOperate"]>>(async () => ({ ok: true })),
  },
  render: args => <Preview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2>
    <Story />
  </main>],
} satisfies Meta<typeof EstimateDraftDeleteCard>;
export default meta;
type Story = StoryObj<typeof meta>;

function sample(change: (view: EstimateDraftDeleteChatView) => void = () => {}): Story {
  const view = estimateDraftDeleteCardFixture();
  change(view);
  return { args: { view, context: estimateDraftDeleteCardContext(view) } };
}

async function dialog(element: HTMLElement) {
  const root = await within(element.ownerDocument.body).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}

function openDialog(): NonNullable<Story["play"]> {
  return async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.reviewDelete }));
    await dialog(canvasElement);
  };
}

export const Pending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(new RegExp(storyCopy.sourceName))).toBeVisible();
    await expect(canvas.getByText(new RegExp(storyCopy.parentName))).toBeVisible();
    await expect(canvas.getByText(storyCopy.recipient)).toBeVisible();
    await expect(canvas.getByText(c.impact)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.reviewDelete })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeEnabled();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const OpenConfirmationDialog: Story = { play: openDialog() };
export const ExactNumberRequired: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.reviewDelete }));
    const confirmation = await dialog(canvasElement);
    const input = confirmation.getByRole("textbox", { name: c.dialog.type });
    const button = confirmation.getByRole("button", { name: c.dialog.confirm });
    await expect(input).toHaveValue("");
    for (const value of ["est-2048", " EST-2048", "EST-2048 ", "EST-2049"]) {
      fireEvent.change(input, { target: { value } });
      await expect(button).toBeDisabled();
      await expect(args.onOperate).not.toHaveBeenCalled();
    }
    fireEvent.change(input, { target: { value: "EST-2048" } });
    await expect(button).toBeEnabled();
    await expect(args.onOperate).not.toHaveBeenCalled();
  },
};
export const ConfirmRequestIsNotAReceipt: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const view = args.view;
    const context = args.context;
    if (!view || !context) throw new Error("Missing fictional Draft-deletion review.");
    await userEvent.click(canvas.getByRole("button", { name: c.reviewDelete }));
    const confirmation = await dialog(canvasElement);
    fireEvent.change(confirmation.getByRole("textbox", { name: c.dialog.type }), { target: { value: "EST-2048" } });
    await userEvent.click(confirmation.getByRole("button", { name: c.dialog.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(1);
    await expect(args.onOperate).toHaveBeenCalledWith(
      estimateDraftDeleteCardRequest(view, context.workspaceId, "confirm", "EST-2048"),
    );
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.requested));
    await expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.confirmed)).not.toBeInTheDocument();
  },
};
export const CancelProposalWaitsForHost: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const view = args.view;
    const context = args.context;
    if (!view || !context) throw new Error("Missing fictional Draft-deletion review.");
    await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
    await expect(args.onOperate).toHaveBeenCalledWith(
      estimateDraftDeleteCardRequest(view, context.workspaceId, "cancel"),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(c.requested);
    await expect(canvas.queryByText(c.cancelled)).not.toBeInTheDocument();
  },
};
export const BackDoesNotCancelProposal: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reviewDelete }));
    const confirmation = await dialog(canvasElement);
    await userEvent.click(confirmation.getByRole("button", { name: c.dialog.back }));
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toBeEnabled());
    await expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument();
    await expect(args.onOperate).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeEnabled();
  },
};
export const ConfirmFailureCanRetry: Story = {
  play: async ({ canvasElement, args }) => {
    args.onOperate?.mockResolvedValueOnce({ ok: false, message: storyCopy.failure });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reviewDelete }));
    const confirmation = await dialog(canvasElement);
    fireEvent.change(confirmation.getByRole("textbox", { name: c.dialog.type }), { target: { value: "EST-2048" } });
    await userEvent.click(confirmation.getByRole("button", { name: c.dialog.confirm }));
    await expect(confirmation.getByRole("alert")).toHaveTextContent(storyCopy.failure);
    await expect(confirmation.getByRole("button", { name: c.dialog.confirm })).toBeEnabled();
    await userEvent.click(confirmation.getByRole("button", { name: c.dialog.confirm }));
    await expect(args.onOperate).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.requested));
    await expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
export const MissingReadGrant: Story = {
  args: { grants: { ...estimateDraftDeleteGrants, read: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(storyCopy.sourceName)).not.toBeInTheDocument();
    await expect(canvas.queryByText(storyCopy.recipient)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
  },
};
export const MissingDeleteGrant: Story = { args: { grants: { ...estimateDraftDeleteGrants, delete: false } } };
export const MissingParentAccess: Story = { args: { grants: { ...estimateDraftDeleteGrants, parentAccess: false } } };
export const MissingHostContext: Story = { args: { context: null } };
export const NoHandler: Story = {
  args: { onOperate: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.noHandler)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.reviewDelete })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
  },
};
export const MissingRecipient: Story = sample(view => { view.review.recipientName = ""; });
export const LinkedLead: Story = sample(view => {
  view.review.parent.type = "lead";
  view.review.parent.number = "L-1038";
});
export const Confirmed: Story = sample(view => Object.assign(view, estimateDraftDeleteCardConfirmed(view)));
export const Cancelled: Story = sample(view => Object.assign(view, estimateDraftDeleteCardCancelled(view)));
export const Superseded: Story = sample(view => { view.ticket.state = "superseded"; });
export const Expired: Story = sample(view => { view.ticket.state = "expired"; });
export const LongContent: Story = sample(view => {
  view.review.name = c.stories.longSourceName;
  view.review.recipientName = c.stories.longRecipient;
  view.review.parent.name = c.stories.longParentName;
});
export const LiteralTextOnly: Story = {
  ...sample(view => {
    view.review.name = c.stories.literal;
    view.review.recipientName = c.stories.literal;
    view.review.parent.name = c.stories.literal;
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText(c.stories.literal, { exact: false })).toHaveLength(3);
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};

function hostOutcome(decision: "confirm" | "cancel", view: EstimateDraftDeleteCardProps["view"]) {
  return decision === "confirm"
    ? estimateDraftDeleteCardConfirmed(view)
    : estimateDraftDeleteCardCancelled(view);
}
function OutcomePreview(args: EstimateDraftDeleteCardProps & { decision: "confirm" | "cancel" }) {
  const [values] = useState(() => fresh(args));
  const [view, setView] = useState(values.view);
  return <div className="grid gap-4">
    <button type="button" className="min-h-11 rounded-xl border border-line px-4 py-2"
      onClick={() => setView(hostOutcome(args.decision, values.view))}>
      {args.decision === "confirm" ? storyCopy.hostConfirm : storyCopy.hostCancel}
    </button>
    <EstimateDraftDeleteCard {...args} {...values} view={view} context={estimateDraftDeleteCardContext(view)}
      onOperate={async command => {
        await args.onOperate?.(command);
        return { ok: true };
      }} />
  </div>;
}
function outcome(decision: "confirm" | "cancel"): Story {
  return {
    render: args => <OutcomePreview {...args} decision={decision} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      const view = args.view;
      const context = args.context;
      if (!view || !context) throw new Error("Missing fictional Draft-deletion review.");
      if (decision === "confirm") {
        await userEvent.click(canvas.getByRole("button", { name: c.reviewDelete }));
        const confirmation = await dialog(canvasElement);
        fireEvent.change(confirmation.getByRole("textbox", { name: c.dialog.type }), { target: { value: "EST-2048" } });
        await userEvent.click(confirmation.getByRole("button", { name: c.dialog.confirm }));
      } else {
        await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
      }
      await expect(args.onOperate).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(c.requested));
      await userEvent.click(canvas.getByRole("button", {
        name: decision === "confirm" ? storyCopy.hostConfirm : storyCopy.hostCancel,
      }));
      await expect(canvas.getByRole("status")).toHaveTextContent(decision === "confirm" ? c.confirmed : c.cancelled);
      if (decision === "confirm") {
        await expect(canvas.getByText("EST-2048 · Revision 1")).toBeVisible();
        await expect(canvas.queryByRole("button", { name: c.reviewDelete })).not.toBeInTheDocument();
      } else {
        await expect(canvas.queryByRole("button", { name: c.cancel })).not.toBeInTheDocument();
      }
    },
  };
}
export const HostSuppliesCheckedDeletion: Story = outcome("confirm");
export const HostSuppliesCheckedCancellation: Story = outcome("cancel");

type Race = "read" | "parent" | "grant" | "handler" | "workspace" | "context";
const control = "min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink focus-visible:focus-ring";
const raceLabels: Record<Race, string> = {
  read: storyCopy.revoke,
  parent: storyCopy.parent,
  grant: storyCopy.grant,
  handler: storyCopy.handler,
  workspace: storyCopy.workspace,
  context: storyCopy.context,
};
function RacePreview({ change, ...args }: EstimateDraftDeleteCardProps & { change: Race }) {
  const [values] = useState(() => fresh(args));
  const [grants, setGrants] = useState(args.grants);
  const [connected, setConnected] = useState(true);
  const [context, setContext] = useState(values.context);
  const release = useRef<(result: EstimateDraftOperationResult) => void>(undefined);
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-3">
      <button type="button" className={control} onClick={() => {
        if (change === "read") setGrants({ ...grants, read: false });
        if (change === "parent") setGrants({ ...grants, parentAccess: false });
        if (change === "grant") setGrants({ ...grants, delete: false });
        if (change === "handler") setConnected(false);
        if (change === "workspace") setContext(null);
      }}>{raceLabels[change]}</button>
      <button type="button" className={control}
        onClick={() => release.current?.({ ok: true })}>{storyCopy.release}</button>
    </div>
    <EstimateDraftDeleteCard {...args} {...values} grants={grants}
      context={context}
      onOperate={connected ? async command => {
        await args.onOperate?.(command);
        return new Promise(resolve => { release.current = resolve; });
      } : undefined} />
  </div>;
}
function race(change: Race): Story {
  return {
    render: args => <RacePreview {...args} change={change} />,
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: c.cancel }));
      await expect(args.onOperate).toHaveBeenCalledTimes(1);
      await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
      await userEvent.click(canvas.getByRole("button", { name: raceLabels[change] }));
      await userEvent.click(canvas.getByRole("button", { name: storyCopy.release }));
      if (change === "read" || change === "parent" || change === "grant" || change === "workspace") {
        await expect(canvas.queryByText(storyCopy.recipient)).not.toBeInTheDocument();
        await expect(canvas.queryByRole("button", { name: c.cancel })).not.toBeInTheDocument();
      } else if (change === "handler") {
        await expect(canvas.getByRole("button", { name: c.cancel })).toBeDisabled();
      } else {
        await expect(canvas.getByRole("status")).not.toHaveTextContent(c.requested);
      }
    },
  };
}
export const ReadRevokedWhilePending: Story = race("read");
export const ParentRevokedWhilePending: Story = race("parent");
export const DeleteGrantRevokedWhilePending: Story = race("grant");
export const HostDisconnectedWhilePending: Story = race("handler");
export const WorkspaceChangedWhilePending: Story = race("workspace");

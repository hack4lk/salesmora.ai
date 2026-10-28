import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantPanel } from "@salesmora/ui";
import type { EstimateVoidChatView } from "@salesmora/contracts";
import { ConnectedEstimateVoid } from "./estimate-void-result";
import { estimateVoidResultData as c } from "./estimate-void-result.data";
import { estimateVoidCardData as card } from "../../estimates/estimate-void-card/estimate-void-card.data";
import {
  estimateVoidCardConfirmed, estimateVoidCardFixture, estimateVoidOtherWorkspace, estimateVoidWorkspace,
} from "../../estimates/estimate-void-card/estimate-void-card.fixtures";

const initial = estimateVoidCardFixture();
function mockReview(initial: EstimateVoidChatView, options: { fail?: boolean; missing?: boolean; mismatch?: boolean; receipt?: boolean } = {}) {
  const original = globalThis.fetch;
  let view = structuredClone(initial);
  if (options.mismatch) view.ticket.reviewHash = "f".repeat(64);
  if (options.receipt && view.receipt) view.receipt.version++;
  globalThis.fetch = fn(async (_input, request) => {
    if (options.missing || (options.fail && request?.method === "POST")) return Response.json({ error: c.unavailable }, { status: 409 });
    if (request?.method === "POST") {
      const body = JSON.parse(String(request.body));
      if (body.decision === "open") return Response.json({ view, href: `/estimates/${view.receipt?.estimateId}?workspace=${estimateVoidWorkspace}` });
      view = body.decision === "confirm" ? estimateVoidCardConfirmed(initial)
        : { ...initial, ticket: { ...initial.ticket, state: "cancelled" } };
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: "Assistant/ConnectedEstimateVoid", component: ConnectedEstimateVoid,
  args: { ticket: initial.ticket, workspaceId: estimateVoidWorkspace, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mockReview(initial),
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4">
    <h1 className="m-0 mb-4 text-heading text-ink">{card.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{card.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof ConnectedEstimateVoid>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Sent: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("button", { name: card.confirm })).toBeEnabled();
  await expect(canvas.getByText(card.stories.reason)).toBeVisible();
  await expect(canvas.getByText("$969.17")).toBeVisible();
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Published: Story = {
  args: { ticket: { ...initial.ticket, estimate: { ...initial.ticket.estimate, status: "published" } } },
  beforeEach: () => mockReview({ ...initial, ticket: { ...initial.ticket, estimate: { ...initial.ticket.estimate, status: "published" } } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.statuses.published)).toBeVisible();
    await expect(canvas.getByRole("button", { name: card.confirm })).toBeEnabled();
  },
};
export const MissingReason: Story = {
  beforeEach: () => mockReview({ ...initial, review: { ...initial.review, reason: "" }, canConfirm: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.missingReason)).toBeVisible();
    await expect(canvas.getByRole("button", { name: card.confirm })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: card.cancel })).toBeEnabled();
  },
};
export const ConfirmAndOpen: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.dblClick(await canvas.findByRole("button", { name: card.confirm }));
  await expect(await canvas.findByText(card.confirmed)).toBeVisible();
  await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  await expect(args.onNavigate).not.toHaveBeenCalled();
  await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole("button", { name: card.open }));
  await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${initial.ticket.estimate.id}?workspace=${estimateVoidWorkspace}`);
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole("button", { name: card.cancel }));
  await expect(await canvas.findByText(card.cancelled)).toBeVisible();
  await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const RestoredReceipt: Story = {
  args: { ticket: { ...initial.ticket, state: "confirmed" } }, beforeEach: () => mockReview(estimateVoidCardConfirmed(initial)),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.confirmed)).toBeVisible();
    await expect(canvas.getByRole("button", { name: card.open })).toBeEnabled();
    await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const Expired: Story = {
  beforeEach: () => mockReview({ ...initial, ticket: { ...initial.ticket, state: "expired" } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.expired)).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
  },
};
export const Superseded: Story = {
  beforeEach: () => mockReview({ ...initial, ticket: { ...initial.ticket, state: "superseded" } }),
  play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(card.superseded)).toBeVisible(); },
};
export const Unavailable: Story = {
  beforeEach: () => mockReview(initial, { missing: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
  },
};
export const MismatchedReview: Story = {
  beforeEach: () => mockReview(initial, { mismatch: true }),
  play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(c.error)).toBeVisible(); },
};
export const InvalidReceipt: Story = {
  beforeEach: () => mockReview(estimateVoidCardConfirmed(initial), { receipt: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: c.retry })).toBeEnabled();
    await expect(canvas.queryByRole("button", { name: card.open })).not.toBeInTheDocument();
    await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
  },
};
export const OperationFailure: Story = {
  beforeEach: () => mockReview(initial, { fail: true }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.confirm }));
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const RetryRead: Story = {
  beforeEach: () => {
    const restore = mockReview(initial);
    globalThis.fetch = fn(globalThis.fetch).mockResolvedValueOnce(Response.json({ error: c.unavailable }, { status: 409 }));
    return restore;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(await canvas.findByRole("button", { name: card.confirm })).toBeEnabled();
  },
};
export const HistoryRefreshFailure: Story = {
  args: { onRefresh: fn(async () => { throw new Error(c.historyError); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.confirm }));
    await expect(await canvas.findByText(card.confirmed)).toBeVisible();
    await expect(await canvas.findByRole("alert")).toHaveTextContent(c.historyError);
  },
};
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.unavailable)).toBeVisible();
  await expect(globalThis.fetch).not.toHaveBeenCalled();
} };
let releaseResponse: (() => void) | undefined;
function LateHost({ change, ...args }: ComponentProps<typeof ConnectedEstimateVoid> & { change: "disabled" | "workspace" | "ticket" }) {
  const [values, setValues] = useState(args);
  return <div className="grid gap-3">
    <button type="button" onClick={() => setValues(change === "disabled" ? { ...values, disabled: true }
      : change === "workspace" ? { ...values, workspaceId: estimateVoidOtherWorkspace }
        : { ...values, ticket: { ...values.ticket, inputHash: "e".repeat(64) } })}>
      {change === "ticket" ? card.stories.replace : c.stories[change === "workspace" ? "workspace" : "disable"]}
    </button>
    <button type="button" onClick={() => releaseResponse?.()}>{c.stories.release}</button>
    <ConnectedEstimateVoid {...values} />
  </div>;
}
function late(change: "disabled" | "workspace" | "ticket", method: "GET" | "POST" = "POST", decision: "confirm" | "open" = "confirm"): Story {
  return {
    args: { ticket: decision === "open" ? { ...initial.ticket, state: "confirmed" } : initial.ticket },
    render: args => <LateHost {...args} change={change} />,
    beforeEach: () => {
      const original = globalThis.fetch, saved = decision === "open" ? estimateVoidCardConfirmed(initial) : initial;
      releaseResponse = undefined;
      globalThis.fetch = fn(async (_input, options) => {
        if ((options?.method ?? "GET") === method && !releaseResponse) return new Promise<Response>(resolve => {
          releaseResponse = () => resolve(Response.json({ view: method === "GET" ? saved : estimateVoidCardConfirmed(initial),
            ...(decision === "open" ? { href: `/estimates/${initial.ticket.estimate.id}?workspace=${estimateVoidWorkspace}` } : {}) }));
        });
        if (releaseResponse) return Response.json({ error: c.unavailable }, { status: 409 });
        return Response.json({ view: saved });
      });
      return () => { globalThis.fetch = original; releaseResponse = undefined; };
    },
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      if (method === "POST") await userEvent.click(await canvas.findByRole("button", { name: decision === "open" ? card.open : card.confirm }));
      else await expect(canvas.getByText(c.loading)).toBeVisible();
      const label = change === "ticket" ? card.stories.replace : c.stories[change === "workspace" ? "workspace" : "disable"];
      await userEvent.click(canvas.getByRole("button", { name: label }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByText(card.stories.reason)).not.toBeInTheDocument();
      await expect(canvas.queryByRole("button", { name: card.open })).not.toBeInTheDocument();
      await expect(args.onNavigate).not.toHaveBeenCalled();
      await expect(args.onRefresh).not.toHaveBeenCalled();
    },
  };
}
export const LateConfirmationDisabled: Story = late("disabled");
export const LateConfirmationWorkspace: Story = late("workspace");
export const LateConfirmationReplaced: Story = late("ticket");
export const LateReadDisabled: Story = late("disabled", "GET");
export const LateOpenWorkspace: Story = late("workspace", "POST", "open");
function Conversation(args: ComponentProps<typeof ConnectedEstimateVoid>) {
  const [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} messages={[{ id: "sample-void", role: "assistant", text: card.stories.chatAnswer }]}
    onSend={async () => ({ ok: true })} renderMessageSupplement={() => <ConnectedEstimateVoid {...args} />} />;
}
export const InsideAssistant: Story = { render: args => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("button", { name: card.confirm })).toBeEnabled();
  await userEvent.type(canvas.getByRole("textbox"), card.stories.naturalYes); await userEvent.keyboard("{Enter}");
  await expect(args.onRefresh).not.toHaveBeenCalled();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };

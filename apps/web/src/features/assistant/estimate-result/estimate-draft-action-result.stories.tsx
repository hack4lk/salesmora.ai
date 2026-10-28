import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { EstimateDraftActionChatView } from "@salesmora/contracts";
import { AssistantPanel } from "@salesmora/ui";
import { ConnectedEstimateDraftAction } from "./estimate-draft-action-result";
import { estimateDraftActionResultData as c } from "./estimate-draft-action-result.data";
import { estimateDraftActionCardData as card } from "../../estimates/estimate-draft-action-card/estimate-draft-action-card.data";
import {
  estimateDraftActionConfirmed, estimateDraftActionFixture, estimateDraftActionOtherWorkspace, estimateDraftActionWorkspace,
} from "../../estimates/estimate-draft-action-card/estimate-draft-action-card.fixtures";

const fixtures = {
  revise: estimateDraftActionFixture(), reuse: estimateDraftActionFixture("reuse"), duplicate: estimateDraftActionFixture("duplicate"),
};
function mockReview(initial: EstimateDraftActionChatView, options: { fail?: boolean; missing?: boolean; mismatch?: boolean; totalMismatch?: boolean } = {}) {
  const original = globalThis.fetch;
  let view = structuredClone(initial);
  if (options.mismatch) view.ticket.reviewHash = "f".repeat(64);
  if (options.totalMismatch) view.review.totalCents = 1;
  globalThis.fetch = fn(async (_input, request) => {
    if (options.missing || (options.fail && request?.method === "POST")) return Response.json({ error: c.unavailable }, { status: 409 });
    if (request?.method === "POST") {
      const body = JSON.parse(String(request.body));
      if (body.decision === "open") return Response.json({ view, href: `/estimates/${view.receipt?.id}?workspace=${estimateDraftActionWorkspace}` });
      view = body.decision === "confirm" ? estimateDraftActionConfirmed(initial)
        : { ...initial, ticket: { ...initial.ticket, state: "cancelled" } };
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: "Assistant/ConnectedEstimateDraftAction", component: ConnectedEstimateDraftAction,
  args: { ticket: fixtures.revise.ticket, workspaceId: estimateDraftActionWorkspace, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mockReview(fixtures.revise),
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4">
    <h1 className="m-0 mb-4 text-heading text-ink">{card.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{card.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof ConnectedEstimateDraftAction>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CreateRevision: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("button", { name: card.confirm.revise })).toBeEnabled();
  await expect(canvas.getByText(card.stories.email)).toBeVisible();
  await expect(canvas.getByText("$969.17")).toBeVisible();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Duplicate: Story = {
  args: { ticket: fixtures.duplicate.ticket }, beforeEach: () => mockReview(fixtures.duplicate),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: card.confirm.duplicate })).toBeEnabled();
    await expect(canvas.getByText(card.stories.notes)).toBeVisible();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
    await expect(canvas.getAllByText(card.cleared)).toHaveLength(3);
  },
};
export const ReuseEditedRevision: Story = {
  args: { ticket: fixtures.reuse.ticket }, beforeEach: () => mockReview(fixtures.reuse),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: card.confirm.reuse })).toBeEnabled();
    await expect(canvas.getByText(card.stories.editedScope)).toBeVisible();
    await expect(canvas.getByText(card.stories.notes)).toBeVisible();
  },
};
function confirmation(kind: keyof typeof fixtures): Story {
  return {
    args: { ticket: fixtures[kind].ticket }, beforeEach: () => mockReview(fixtures[kind]),
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      await userEvent.dblClick(await canvas.findByRole("button", { name: card.confirm[kind] }));
      await expect(await canvas.findByText(card.confirmed[kind])).toBeVisible();
      await expect(args.onRefresh).toHaveBeenCalledTimes(1);
      await expect(args.onNavigate).not.toHaveBeenCalled();
      await expect(canvas.queryByText(card.stories.notes)).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: card.open }));
      const saved = estimateDraftActionConfirmed(fixtures[kind]).receipt!;
      await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${saved.id}?workspace=${estimateDraftActionWorkspace}`);
    },
  };
}
export const ConfirmRevision: Story = confirmation("revise");
export const ConfirmDuplicate: Story = confirmation("duplicate");
export const ConfirmReuse: Story = confirmation("reuse");
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole("button", { name: card.cancel }));
  await expect(await canvas.findByText(card.cancelled)).toBeVisible();
  await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const RestoredReceipt: Story = {
  args: { ticket: { ...fixtures.revise.ticket, state: "confirmed" } },
  beforeEach: () => mockReview(estimateDraftActionConfirmed(fixtures.revise)),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.confirmed.revise)).toBeVisible();
    await expect(canvas.getByRole("button", { name: card.open })).toBeEnabled();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const Expired: Story = {
  beforeEach: () => mockReview({ ...fixtures.revise, ticket: { ...fixtures.revise.ticket, state: "expired" } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.expired)).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
  },
};
export const Superseded: Story = {
  beforeEach: () => mockReview({ ...fixtures.revise, ticket: { ...fixtures.revise.ticket, state: "superseded" } }),
  play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(card.superseded)).toBeVisible(); },
};
export const Unavailable: Story = {
  beforeEach: () => mockReview(fixtures.revise, { missing: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
  },
};
export const MismatchedReview: Story = {
  beforeEach: () => mockReview(fixtures.revise, { mismatch: true }),
  play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(c.error)).toBeVisible(); },
};
export const AmountMismatch: Story = {
  beforeEach: () => mockReview(fixtures.revise, { totalMismatch: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(card.invalid)).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
  },
};
export const OperationFailure: Story = {
  beforeEach: () => mockReview(fixtures.revise, { fail: true }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.confirm.revise }));
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.retry })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(await canvas.findByRole("button", { name: card.confirm.revise })).toBeEnabled();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const HistoryRefreshFailure: Story = {
  args: { onRefresh: fn(async () => { throw new Error(c.historyError); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.confirm.revise }));
    await expect(await canvas.findByText(card.confirmed.revise)).toBeVisible();
    await expect(await canvas.findByRole("alert")).toHaveTextContent(c.historyError);
  },
};
export const Disabled: Story = {
  args: { disabled: true }, play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.unavailable)).toBeVisible();
    await expect(globalThis.fetch).not.toHaveBeenCalled();
  },
};
let releaseResponse: (() => void) | undefined;
function LateHost({ change, ...args }: ComponentProps<typeof ConnectedEstimateDraftAction> & { change: "disabled" | "workspace" | "ticket" }) {
  const [values, setValues] = useState(args);
  return <div className="grid gap-3">
    <button type="button" onClick={() => setValues(change === "disabled" ? { ...values, disabled: true }
      : change === "workspace" ? { ...values, workspaceId: estimateDraftActionOtherWorkspace }
        : { ...values, ticket: { ...values.ticket, inputHash: "e".repeat(64) } })}>{c.stories[change === "ticket" ? "replace" : change === "workspace" ? "workspace" : "disable"]}</button>
    <button type="button" onClick={() => releaseResponse?.()}>{c.stories.release}</button>
    <ConnectedEstimateDraftAction {...values} />
  </div>;
}
function late(change: "disabled" | "workspace" | "ticket", method: "GET" | "POST" = "POST"): Story {
  return {
    render: args => <LateHost {...args} change={change} />,
    beforeEach: () => {
      const original = globalThis.fetch, initial = fixtures.revise;
      releaseResponse = undefined;
      globalThis.fetch = fn(async (_input, options) => {
        if ((options?.method ?? "GET") === method && !releaseResponse) return new Promise<Response>(resolve => {
          releaseResponse = () => resolve(Response.json({ view: method === "GET" ? initial : estimateDraftActionConfirmed(initial),
            ...(method === "POST" && JSON.parse(String(options?.body)).decision === "open"
              ? { href: `/estimates/${estimateDraftActionConfirmed(initial).receipt!.id}?workspace=${estimateDraftActionWorkspace}` } : {}) }));
        });
        if (releaseResponse) return Response.json({ error: c.unavailable }, { status: 409 });
        return Response.json({ view: initial });
      });
      return () => { globalThis.fetch = original; releaseResponse = undefined; };
    },
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      if (method === "POST") await userEvent.click(await canvas.findByRole("button", { name: card.confirm.revise }));
      else await expect(canvas.getByText(c.loading)).toBeVisible();
      const label = c.stories[change === "ticket" ? "replace" : change === "workspace" ? "workspace" : "disable"];
      await userEvent.click(canvas.getByRole("button", { name: label }));
      await userEvent.click(canvas.getByRole("button", { name: c.stories.release }));
      await expect(canvas.queryByText(card.stories.email)).not.toBeInTheDocument();
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
function Conversation(args: ComponentProps<typeof ConnectedEstimateDraftAction>) {
  const [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} messages={[{ id: "sample-action", role: "assistant", text: card.stories.chatAnswer }]}
    onSend={async () => ({ ok: true })} renderMessageSupplement={() => <ConnectedEstimateDraftAction {...args} />} />;
}
export const InsideAssistant: Story = {
  render: args => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: card.confirm.revise })).toBeEnabled();
    await userEvent.type(canvas.getByRole("textbox"), card.stories.naturalYes);
    await userEvent.keyboard("{Enter}");
    await expect(args.onRefresh).not.toHaveBeenCalled();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};

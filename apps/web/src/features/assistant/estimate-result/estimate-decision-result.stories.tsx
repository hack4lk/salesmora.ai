import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import type { EstimateDecisionChatView } from "@salesmora/contracts";
import { ConnectedEstimateDecision } from "./estimate-decision-result";
import { estimateDecisionFixture, estimateDecisionWorkspaceId } from "./estimate-decision.fixtures";
import { estimateDecisionResultData as c } from "./estimate-decision-client";

function confirmed(view: EstimateDecisionChatView) {
  return { ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
    estimateId: view.ticket.estimate.id, decisionId: "10000000-0000-4000-8000-000000000006",
    version: view.ticket.estimate.version + 1, status: view.value.outcome, updatedAt: new Date().toISOString(),
  } };
}
function mockReview(initial: EstimateDecisionChatView, fail = false) {
  const original = globalThis.fetch;
  let view: unknown = structuredClone(initial);
  globalThis.fetch = fn(async (_input, options) => {
    if (options?.method === "POST") {
      if (fail) return Response.json({ error: c.unavailable }, { status: 409 });
      const body = JSON.parse(String(options.body));
      if (body.decision === "open") return Response.json({ view, href: `/estimates/${initial.ticket.estimate.id}?workspace=${estimateDecisionWorkspaceId}` });
      view = body.decision === "confirm" ? confirmed(initial) : { ...initial, ticket: { ...initial.ticket, state: "cancelled" } };
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: "Assistant/ConnectedEstimateDecision",
  component: ConnectedEstimateDecision,
  args: { ticket: estimateDecisionFixture().ticket, workspaceId: estimateDecisionWorkspaceId, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mockReview(estimateDecisionFixture()),
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof ConnectedEstimateDecision>;
export default meta;
type Story = StoryObj<typeof meta>;
export const RecordAccepted: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Confirm decision" })).toBeEnabled();
    await expect(canvas.getByText("Jordan Lee")).toBeVisible();
    await expect(canvas.getByText("Customer confirmed by phone. Literal <b>text</b>.")).toBeVisible();
  },
};
export const Confirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm decision" }));
    await expect(await canvas.findByText(c.accepted)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.open }));
    await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${args.ticket.estimate.id}?workspace=${estimateDecisionWorkspaceId}`);
  },
};
export const RecordDeclined: Story = {
  beforeEach: () => { const view = estimateDecisionFixture(); view.value.outcome = "declined"; return mockReview(view); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm decision" }));
    await expect(await canvas.findByText(c.declined)).toBeVisible();
  },
};
export const Correction: Story = {
  args: { ticket: estimateDecisionFixture(true).ticket },
  beforeEach: () => mockReview(estimateDecisionFixture(true)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Confirm correction" })).toBeEnabled();
    await expect(canvas.getByRole("heading", { name: "Existing decision" })).toBeVisible();
    await expect(canvas.getByText("Original staff-only note.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Confirm correction" }));
    await expect(await canvas.findByText(c.corrected)).toBeVisible();
  },
};
export const ClearNote: Story = {
  args: { ticket: estimateDecisionFixture(true).ticket },
  beforeEach: () => { const view = estimateDecisionFixture(true); view.value.note = ""; return mockReview(view); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Confirm correction" })).toBeEnabled();
    await expect(canvas.getByText("Original staff-only note.")).toBeVisible();
    await expect(canvas.getByText("Not provided")).toBeVisible();
  },
};
export const MissingFields: Story = {
  beforeEach: () => {
    const view = estimateDecisionFixture(); view.value.outcome = ""; view.value.channel = ""; view.value.decisionDate = "";
    view.canConfirm = false; return mockReview(view);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Confirm decision" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Cancel proposal" })).toBeEnabled();
    await expect(canvas.getAllByText("Not provided")).toHaveLength(3);
  },
};
export const MissingReason: Story = {
  args: { ticket: estimateDecisionFixture(true).ticket },
  beforeEach: () => { const view = estimateDecisionFixture(true); view.value.reason = ""; view.canConfirm = false; return mockReview(view); },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("button", { name: "Confirm correction" })).toBeDisabled();
  },
};
export const Cancellation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Cancel proposal" }));
    await expect(await canvas.findByText(c.cancelled)).toBeVisible();
  },
};
export const OperationFailure: Story = {
  beforeEach: () => mockReview(estimateDecisionFixture(), true),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm decision" }));
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText("Jordan Lee")).not.toBeInTheDocument();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("Jordan Lee")).not.toBeInTheDocument();
    await expect(globalThis.fetch).not.toHaveBeenCalled();
  },
};
export const Expired: Story = {
  beforeEach: () => { const view = estimateDecisionFixture(); view.ticket.state = "expired"; return mockReview(view); },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(c.expired)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button", { name: "Confirm decision" })).not.toBeInTheDocument();
  },
};
export const MismatchedReview: Story = {
  beforeEach: () => { const view = estimateDecisionFixture(); view.ticket.inputHash = "e".repeat(64); return mockReview(view); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.error)).toBeVisible();
    await expect(canvas.queryByText("Jordan Lee")).not.toBeInTheDocument();
  },
};
let releaseConfirmation: (() => void) | undefined;
function LateHost(args: ComponentProps<typeof ConnectedEstimateDecision>) {
  const [disabled, setDisabled] = useState(false);
  return <div className="grid gap-3 print:hidden">
    <button type="button" onClick={() => setDisabled(true)}>Disable this host</button>
    <button type="button" onClick={() => releaseConfirmation?.()}>Release previous response</button>
    <ConnectedEstimateDecision {...args} disabled={disabled} />
  </div>;
}
export const LateConfirmation: Story = {
  render: args => <LateHost {...args} />,
  beforeEach: () => {
    const original = globalThis.fetch, view = estimateDecisionFixture();
    releaseConfirmation = undefined;
    globalThis.fetch = fn(async (_input, options) => {
      if (options?.method === "POST") return new Promise<Response>(resolve => {
        releaseConfirmation = () => resolve(Response.json({ view: confirmed(view) }));
      });
      return Response.json({ view });
    });
    return () => { globalThis.fetch = original; releaseConfirmation = undefined; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm decision" }));
    await userEvent.click(canvas.getByRole("button", { name: "Disable this host" }));
    await userEvent.click(canvas.getByRole("button", { name: "Release previous response" }));
    await expect(args.onRefresh).not.toHaveBeenCalled();
    await expect(args.onNavigate).not.toHaveBeenCalled();
    await expect(canvas.queryByText(c.accepted)).not.toBeInTheDocument();
    await expect(canvas.queryByText("Jordan Lee")).not.toBeInTheDocument();
  },
};

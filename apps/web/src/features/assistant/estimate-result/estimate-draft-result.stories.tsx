import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConnectedEstimateDraft } from "./estimate-draft-result";
import { estimateDraftViewFixture, estimateDraftWorkspaceId } from "./estimate-draft.fixtures";
import { estimateDraftConnectedData as c } from "./estimate-draft-client";

const meta = {
  title: "Assistant/ConnectedEstimateDraft",
  component: ConnectedEstimateDraft,
  args: { view: estimateDraftViewFixture(), workspaceId: estimateDraftWorkspaceId, onRefresh: fn(async () => {}), onNavigate: fn() },
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof ConnectedEstimateDraft>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Create: Story = {};
export const Update: Story = { args: { view: estimateDraftViewFixture(true) } };
export const MissingPrice: Story = {
  args: { view: (() => {
    const view = estimateDraftViewFixture();
    view.draft.proposed.items[0] = { ...view.draft.proposed.items[0], unitPrice: "", priceSource: { type: "missing" } };
    view.canConfirm = false;
    return view;
  })() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Confirm Draft creation" })).toBeDisabled();
    await expect(within(canvasElement).getByRole("button", { name: "Review in editor" })).toBeEnabled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
  },
};
export const Confirmation: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => {
      const view = estimateDraftViewFixture(); view.draft.state = "confirmed";
      view.receipt = { id: estimateDraftWorkspaceId, number: "EST-2048", revision: 1, version: 1, updatedAt: new Date().toISOString() };
      return Response.json({ view });
    });
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Confirm Draft creation" }));
    await expect(canvas.getByText("The host reports this Draft proposal was saved.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.saved })).toBeVisible();
    await expect(args.onRefresh).toHaveBeenCalledOnce();
    await expect(globalThis.fetch).toHaveBeenCalledWith("/api/chat/estimates/draft", expect.objectContaining({ method: "POST" }));
  },
};
export const Cancellation: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => { const view = estimateDraftViewFixture(); view.draft.state = "cancelled"; return Response.json({ view }); });
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Cancel proposal" }));
    await expect(canvas.getByText("Proposal cancelled. No Draft changes were applied.")).toBeVisible();
  },
};
export const OperationFailure: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({ error: c.error }, { status: 409 }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Confirm Draft creation" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.error);
    await expect(args.onRefresh).toHaveBeenCalledOnce();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const EditorHandoff: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({
      view: estimateDraftViewFixture(),
      href: `/estimates/new?workspace=${estimateDraftWorkspaceId}&proposal=${estimateDraftViewFixture().draft.id}`,
    }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Review in editor" }));
    await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/new?workspace=${estimateDraftWorkspaceId}&proposal=${args.view.draft.id}`);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

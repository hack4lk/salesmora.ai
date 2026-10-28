import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConnectedEstimateDraftDelete } from "./estimate-draft-delete-result";
import { estimateDraftDeleteResultData as c } from "./estimate-draft-delete-result.data";
import { estimateDraftDeleteCardData as card } from "../../estimates/estimate-draft-delete-card/estimate-draft-delete-card.data";
import {
  estimateDraftDeleteCardCancelled,
  estimateDraftDeleteCardConfirmed,
  estimateDraftDeleteCardFixture,
  estimateDraftDeleteWorkspace,
} from "../../estimates/estimate-draft-delete-card/estimate-draft-delete-card.fixtures";

const initial = estimateDraftDeleteCardFixture();

function mockReview(initialView = initial, unavailable = false) {
  const original = globalThis.fetch;
  let view = structuredClone(initialView);
  globalThis.fetch = fn(async (_input, request) => {
    if (unavailable) return Response.json({ error: c.unavailable }, { status: 409 });
    if (request?.method === "POST") {
      const body = JSON.parse(String(request.body));
      view = body.decision === "confirm"
        ? estimateDraftDeleteCardConfirmed(initialView)
        : estimateDraftDeleteCardCancelled(initialView);
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}

const meta = {
  title: "Assistant/ConnectedEstimateDraftDelete",
  component: ConnectedEstimateDraftDelete,
  args: {
    ticket: initial.ticket,
    workspaceId: estimateDraftDeleteWorkspace,
    onRefresh: fn(async () => {}),
  },
  beforeEach: () => mockReview(),
  decorators: [(Story: React.ComponentType) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4">
    <h1 className="m-0 mb-4 text-heading text-ink">{card.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{card.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof ConnectedEstimateDraftDelete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: card.reviewDelete })).toBeEnabled();
    await expect(canvas.getByText(card.stories.recipient)).toBeVisible();
  },
};

export const ExactTypedConfirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.reviewDelete }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = dialog.getByRole("textbox", { name: card.dialog.type });
    const confirm = dialog.getByRole("button", { name: card.dialog.confirm });
    await userEvent.type(input, "EST-2048 ");
    await expect(confirm).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, "EST-2048");
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(await canvas.findByText(card.confirmed, { exact: true })).toBeVisible();
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};

export const BackToReviewDoesNotCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.reviewDelete }));
    const dialog = within(await canvas.findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: card.dialog.back }));
    await expect(await canvas.findByText(card.pending, { exact: true })).toBeVisible();
    await expect(canvas.getByRole("button", { name: card.cancel })).toBeEnabled();
  },
};

export const CancelProposal: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: card.cancel }));
    await expect(await canvas.findByText(card.cancelled, { exact: true })).toBeVisible();
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

export const Unavailable: Story = {
  beforeEach: () => mockReview(initial, true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByText(card.stories.recipient)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: card.reviewDelete })).not.toBeInTheDocument();
  },
};

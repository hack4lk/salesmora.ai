import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConnectedEstimateArchive } from "./estimate-archive-result";
import { estimateArchiveResultData as c } from "./estimate-archive-result.data";
import { estimateArchiveCardData as card } from "../../estimates/estimate-archive-card/estimate-archive-card.data";
import {
  estimateArchiveCardConfirmed, estimateArchiveCardFixture, estimateArchiveWorkspace,
} from "../../estimates/estimate-archive-card/estimate-archive-card.fixtures";

const initial = estimateArchiveCardFixture();
function mockReview(initialView = initial) {
  const original = globalThis.fetch;
  let view = structuredClone(initialView);
  globalThis.fetch = fn(async (_input, request) => {
    if (request?.method === "POST") {
      const body = JSON.parse(String(request.body));
      if (body.decision === "open") return Response.json({ view, href: `/estimates/${view.ticket.estimate.id}?workspace=${estimateArchiveWorkspace}` });
      view = body.decision === "confirm" ? estimateArchiveCardConfirmed(initialView)
        : { ...initialView, ticket: { ...initialView.ticket, state: "cancelled" } };
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: "Assistant/ConnectedEstimateArchive",
  component: ConnectedEstimateArchive,
  args: { ticket: initial.ticket, workspaceId: estimateArchiveWorkspace, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mockReview(),
  decorators: [(Story: React.ComponentType) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4">
    <h1 className="m-0 mb-4 text-heading text-ink">{card.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{card.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof ConnectedEstimateArchive>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Archive: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("button", { name: card.archive.confirm })).toBeEnabled();
  await expect(canvas.getByText(card.stories.recipient)).toBeVisible();
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Restore: Story = {
  args: { ticket: estimateArchiveCardFixture("restore").ticket },
  beforeEach: () => mockReview(estimateArchiveCardFixture("restore")),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: card.restore.confirm })).toBeEnabled();
  },
};
export const ConfirmAndOpen: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.dblClick(await canvas.findByRole("button", { name: card.archive.confirm }));
  await expect(await canvas.findByText(card.archive.confirmed)).toBeVisible();
  await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  await expect(args.onNavigate).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole("button", { name: card.open }));
  await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${initial.ticket.estimate.id}?workspace=${estimateArchiveWorkspace}`);
} };
export const Unavailable: Story = {
  beforeEach: () => {
    const restore = mockReview();
    globalThis.fetch = fn(async () => Response.json({ error: c.unavailable }, { status: 409 }));
    return restore;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: card.archive.confirm })).not.toBeInTheDocument();
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimateButton } from "../estimate-ui";
import { EstimateRevisionsPanel, type EstimateRevisionsPanelProps } from "./estimate-revisions-panel";
import { estimateRevisionsPanelData as c, estimateRevisionFixtures as revisions } from "./estimate-revisions-panel.data";

const meta = {
  title: "Estimates/EstimateRevisionsPanel",
  component: EstimateRevisionsPanel,
  args: {
    number: c.stories.number, currentEstimateId: "revision-2", revisions, total: revisions.length, canRead: true,
  },
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-lg bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof EstimateRevisionsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

function list(element: HTMLElement) {
  return within(within(element).getByRole("list", { name: c.title }));
}
async function hidden(element: HTMLElement) {
  const canvas = within(element);
  await expect(canvas.getByText(c.unavailable)).toBeVisible();
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.number)).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
}

export const PendingRevision: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), rows = list(canvasElement).getAllByRole("listitem");
    await expect(rows).toHaveLength(3);
    await expect(rows.map(item => within(item).getByRole("heading").textContent)).toEqual(["Revision 3", "Revision 2", "Revision 1"]);
    await expect(rows[1]).toHaveAttribute("aria-current", "page");
    await expect(within(rows[1]).getByText(c.viewing)).toBeVisible();
    await expect(within(rows[1]).queryByRole("link")).not.toBeInTheDocument();
    await expect(within(rows[0]).getByText(c.pending)).toBeVisible();
    await expect(within(rows[0]).getByText("$1,047.93")).toBeVisible();
    await expect(within(rows[2]).getByText("$842.60")).toBeVisible();
    await expect(canvas.getByText(c.pendingHint)).toBeVisible();
    await expect(canvas.getByRole("link", { name: c.openLabel(c.stories.number, 3) }))
      .toHaveAttribute("href", revisions[0].href);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(3, 3));
  },
};
export const NewestFirst: Story = {
  args: { revisions: [...revisions].reverse() },
  play: PendingRevision.play,
};
export const ViewingOlderRevision: Story = {
  args: { currentEstimateId: "revision-1", revisions: [{ ...revisions[0], status: "sent" }, { ...revisions[1], status: "superseded" }, revisions[2]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), rows = list(canvasElement).getAllByRole("listitem");
    await expect(rows[2]).toHaveAttribute("aria-current", "page");
    await expect(within(rows[2]).getByText(c.viewing)).toBeVisible();
    await expect(canvas.queryByText(c.pendingHint)).not.toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: c.openLabel(c.stories.number, 3) })).toBeVisible();
  },
};
export const SingleRevision: Story = {
  args: { revisions: [revisions[1]], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(1);
    await expect(canvas.getByText(c.single)).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { revisions: [], total: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.empty)).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(0, 0));
  },
};
export const Loading: Story = {
  args: { revisions: [], total: 0, loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loading);
    await expect(canvas.queryByText(c.empty)).not.toBeInTheDocument();
  },
};
export const ErrorAndRetry: Story = {
  args: { error: c.stories.error, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.error);
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const AccessDenied: Story = {
  args: { canRead: false, error: c.stories.error, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    await hidden(canvasElement);
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
function AccessLossPreview(args: EstimateRevisionsPanelProps) {
  const [readable, setReadable] = useState(true);
  return <div className="grid gap-4">
    <EstimateRevisionsPanel {...args} canRead={readable} />
    <button type="button" className={estimateButton} onClick={() => setReadable(false)}>{c.stories.revoke}</button>
  </div>;
}
export const AccessLost: Story = {
  render: args => <AccessLossPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("list")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.stories.revoke }));
    await hidden(canvasElement);
  },
};
export const UnavailableAndZeroTotals: Story = {
  args: { revisions: [{ ...revisions[0], totalCents: null }, { ...revisions[1], totalCents: 0 }], total: 2 },
  play: async ({ canvasElement }) => {
    const rows = list(canvasElement).getAllByRole("listitem");
    await expect(within(rows[0]).getByText(c.totalUnavailable)).toBeVisible();
    await expect(within(rows[0]).queryByText("$0.00")).not.toBeInTheDocument();
    await expect(within(rows[1]).getByText("$0.00")).toBeVisible();
  },
};
export const ArchivedAndExpired: Story = {
  args: { revisions: [{ ...revisions[1], status: "expired" }, { ...revisions[2], archived: true }], total: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Expired")).toBeVisible();
    await expect(canvas.getByText("Superseded")).toBeVisible();
    await expect(canvas.getByText("Archived")).toBeVisible();
  },
};
export const NavigationUnavailable: Story = {
  args: { revisions: [{ ...revisions[0], href: undefined }], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.cannotOpen)).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
function PagedPreview(args: EstimateRevisionsPanelProps) {
  const [complete, setComplete] = useState(false);
  return <EstimateRevisionsPanel {...args} revisions={complete ? revisions : revisions.slice(0, 2)}
    onLoadMore={() => { args.onLoadMore?.(); setComplete(true); }} />;
}
export const LoadOlderRevisions: Story = {
  args: { onLoadMore: fn() },
  render: args => <PagedPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: c.older }));
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(3, 3));
  },
};
export const LoadingOlderRevisions: Story = {
  args: { revisions: revisions.slice(0, 2), loading: true, onLoadMore: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.older });
    await expect(button).toBeDisabled();
    fireEvent.click(button);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
  },
};
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), link = canvas.getAllByRole("link")[0];
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};
export const NarrowAndLongNumber: Story = {
  args: { number: c.stories.longNumber },
};

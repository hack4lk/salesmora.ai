import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantPanel } from "@salesmora/ui";
import { EstimateSummaryCard } from "./estimate-summary-card";
import { estimateSummaryCardData as c, estimateSummaryResultFixture, estimateSummaryRowsFixture } from "./estimate-summary-card.data";
import type { EstimateSummaryCardProps, EstimateSummaryResult } from "./estimate-summary-card.types";

const openEstimate = fn<(estimateId: string) => void>();
const openList = fn<(resultId: string) => void>();
const reviewExport = fn<(resultId: string) => void>();
const retry = fn<() => void>();
const firstRowAction = `EST-2048 · ${c.revision(1)} · Kitchen remodel estimate`;

function sample(change: (result: EstimateSummaryResult) => void): Story {
  const result = structuredClone(estimateSummaryResultFixture);
  change(result);
  return { args: { result } };
}
function SummaryPreview(args: EstimateSummaryCardProps) {
  const [message, setMessage] = useState("");
  return <>
    <EstimateSummaryCard {...args}
      onOpenEstimate={args.onOpenEstimate ? (estimateId) => { args.onOpenEstimate?.(estimateId); setMessage(c.stories.requested); } : undefined}
      onOpenList={args.onOpenList ? (resultId) => { args.onOpenList?.(resultId); setMessage(c.stories.requested); } : undefined}
      onReviewExport={args.onReviewExport ? (resultId) => { args.onReviewExport?.(resultId); setMessage(c.stories.requested); } : undefined}
    />
    {message && <p role="status" className="mt-3 text-sm text-muted">{message}</p>}
  </>;
}
const meta = {
  title: "Assistant/EstimateSummaryCard",
  component: EstimateSummaryCard,
  args: {
    result: estimateSummaryResultFixture,
    onOpenEstimate: openEstimate,
    onOpenList: openList,
    onReviewExport: reviewExport,
  },
  render: (args) => <SummaryPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8 print:min-h-0">
    <h1 className="m-0 text-heading font-semibold text-ink">{c.stories.title}</h1>
    <p className="my-4 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <h2 className="my-4 text-lg font-semibold text-ink">{c.stories.heading}</h2><Story />
  </main>],
} satisfies Meta<typeof EstimateSummaryCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ExpiringThisWeek: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("heading", { name: c.title })).toBeVisible();
  await expect(canvas.getByText("3")).toBeVisible();
  await expect(canvas.getByText("What expires this week?")).toBeVisible();
  await expect(canvas.getByText(c.dateRange)).toBeVisible();
  await expect(canvas.queryByText(c.more(10, 12))).not.toBeInTheDocument();
  await expect(canvas.getByText("$4,480.11")).toBeVisible();
  await expect(canvas.getByRole("button", { name: c.openList })).toBeEnabled();
} };
export const ManyMatches: Story = sample((result) => {
  result.queryLabel = "Show all estimates";
  result.filterLabels = ["All statuses", "Hidden records: Included"];
  result.dateRange = null;
  result.rows = estimateSummaryRowsFixture;
  result.totalMatches = estimateSummaryRowsFixture.length;
  result.totalCents = null;
});
export const AssignedScope: Story = sample((result) => {
  result.scope = "assigned";
  result.queryLabel = "What accepted estimates have no job yet?";
  result.filterLabels = ["Status: Accepted", "Conversion: No linked job", "Scope: Assigned jobs only"];
});
export const NoFilters: Story = sample((result) => {
  result.queryLabel = "Show my estimates";
  result.filterLabels = [];
  result.dateRange = null;
});
export const MissingTotal: Story = sample((result) => {
  result.queryLabel = "Summarize sent estimates";
  result.totalCents = null;
});
export const EmptyResult: Story = sample((result) => {
  result.queryLabel = "What expires today?";
  result.totalMatches = 0;
  result.totalCents = 0;
  result.rows = [];
  result.filterLabels = ["Status: Sent, Published", "Valid until: 2026-10-23"];
  result.dateRange = { from: "2026-10-23", to: "2026-10-23" };
});
export const SingleMatch: Story = sample((result) => {
  result.totalMatches = 1;
  result.totalCents = 96917;
  result.rows = [result.rows[0]];
});
export const NoOpenHandlers: Story = { args: { onOpenEstimate: undefined, onOpenList: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("button", { name: /EST-\d+\s· Revision/ })).not.toBeInTheDocument();
  await expect(canvas.getByText(c.listUnavailable)).toBeVisible();
} };
export const OpenEstimateOnly: Story = { args: { onOpenList: undefined } };
export const OpenListOnly: Story = { args: { onOpenEstimate: undefined } };
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = { args: { state: "error", error: "Summary lookup failed. Try again.", onRetry: retry }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.retry }));
  await expect(retry).toHaveBeenCalledTimes(1);
} };
export const InvalidResult: Story = { ...sample((result) => { result.id = ""; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.errors.resultId)).toBeVisible();
} };
export const InvalidRange: Story = { ...sample((result) => { result.dateRange = { from: "2026-10-31", to: "2026-10-23" }; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.errors.range)).toBeVisible();
} };
export const InvalidTimezone: Story = { ...sample((result) => { result.timezone = "not-a-timezone"; }), play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(c.errors.timezone)).toBeVisible();
} };
export const Forbidden: Story = { args: { state: "forbidden" } };
export const NoReadAccess: Story = { args: { canRead: false } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
} };
export const LongContent: Story = sample((result) => {
  result.queryLabel = "Which estimates await customer response for long-running renovation jobs?";
  result.filterLabels = [c.stories.longFilter, "Statuses: Sent, Published", "Hidden records: Included"];
  result.rows = result.rows.map((row, index) => index === 0
    ? { ...row, name: c.stories.longName, customerName: c.stories.longCustomer }
    : row);
});
export const UnbrokenContent: Story = sample((result) => {
  result.filterLabels = ["MontgomeryWellingtonRestorationPartnership".repeat(10)];
  result.rows = result.rows.map((row, index) => index === 0
    ? {
      ...row,
      name: "MontgomeryWellingtonRestorationPartnership".repeat(4).slice(0, 120),
      customerName: "MontgomeryWellingtonRestorationPartnership".repeat(3),
      parentNumber: "J-" + "1234567890".repeat(6),
    }
    : row);
});
export const LiteralText: Story = sample((result) => {
  result.filterLabels = [c.stories.literal];
  result.rows = result.rows.map((row, index) => index === 0 ? { ...row, name: c.stories.literal } : row);
});
export const OpenEstimateRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: firstRowAction }));
  await expect(args.onOpenEstimate).toHaveBeenCalledWith("estimate-2048");
  await expect(args.onOpenList).not.toHaveBeenCalled();
  await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested);
} };
export const OpenListRequestOnly: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.openList }));
  await expect(args.onOpenList).toHaveBeenCalledWith("estimate-summary-expiring");
  await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested);
} };
export const ReviewCsvExport: Story = {
  args: {
    result: { ...estimateSummaryResultFixture, totalMatches: 0, rows: [], canReviewExport: true },
    onOpenList: undefined,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reviewExport }));
    await expect(args.onReviewExport).toHaveBeenCalledWith(estimateSummaryResultFixture.id);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested);
  },
};
export const KeyboardOpenEstimate: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  canvas.getByRole("button", { name: firstRowAction }).focus();
  await userEvent.keyboard("{Enter}");
  await expect(args.onOpenEstimate).toHaveBeenCalledTimes(1);
} };
export const KeyboardOpenList: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  canvas.getByRole("button", { name: c.openList }).focus();
  await userEvent.keyboard(" ");
  await expect(args.onOpenList).toHaveBeenCalledTimes(1);
} };
function Conversation(args: EstimateSummaryCardProps) {
  const [open, setOpen] = useState(true);
  return <AssistantPanel open={open} onOpenChange={setOpen} sendDisabled contextLabel="Estimates"
    onSend={async () => ({ ok: false, message: c.stories.notice })}
    messages={[{ id: "sample-summary-result", role: "assistant", text: c.stories.notice }]}
    renderMessageSupplement={() => <EstimateSummaryCard {...args} />} />;
}
export const InsideAssistant: Story = { render: (args) => <Conversation {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.type(canvas.getByRole("textbox"), c.stories.yes);
  await userEvent.keyboard("{Enter}");
  await expect(args.onOpenEstimate).not.toHaveBeenCalled();
  await expect(args.onOpenList).not.toHaveBeenCalled();
} };

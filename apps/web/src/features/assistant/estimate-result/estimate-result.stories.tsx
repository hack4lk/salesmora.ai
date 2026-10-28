import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { estimateChatResultSchema, estimateChatSummaryResultSchema } from "@salesmora/contracts";
import { ConnectedEstimateResult } from "./estimate-result";
import { estimateResultData as c } from "./estimate-result.data";
import { estimateSummaryResultFixture, estimateSummaryRowsFixture, estimateSummaryCardData } from "../../estimates/estimate-summary-card/estimate-summary-card.data";
import { estimateTotalsFixture } from "./estimate-read-result.fixtures";
import { estimateReadResultData } from "./estimate-read-result.data";

const id = "00000000-0000-4000-8000-000000000001";
const result = estimateChatSummaryResultSchema.parse({
  turnId: id,
  operation: "search",
  summaries: [{
    ...estimateSummaryResultFixture,
    id,
    rows: estimateSummaryResultFixture.rows.map((row, index) => ({
      ...row,
      id: `00000000-0000-4000-8000-${String(index + 10).padStart(12, "0")}`,
      parentId: id,
    })),
    canOpenList: true,
  }],
});
const meta = {
  title: "Assistant/ConnectedEstimateResult",
  component: ConnectedEstimateResult,
  args: {
    result, workspaceId: id, disabled: false,
    onRefresh: fn(async () => {}),
    onNavigate: fn(),
  },
  decorators: [(Story) => <main className="mx-auto w-full max-w-3xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof ConnectedEstimateResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Summary: Story = {};
export const AssignedUnknownTotal: Story = {
  args: { result: { ...result, summaries: [{ ...result.summaries[0], scope: "assigned", totalCents: null, canOpenList: false }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(estimateSummaryCardData.listUnavailable)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: estimateSummaryCardData.openList })).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { result: { ...result, summaries: [{ ...result.summaries[0], totalMatches: 0, totalCents: 0, rows: [] }] } },
};
export const ManyMatches: Story = {
  args: { result: { ...result, summaries: [{
    ...result.summaries[0], totalMatches: 27, totalCents: 9000000,
    rows: estimateSummaryRowsFixture.slice(0, 10).map((row, index) => ({
      ...row, id: `00000000-0000-4000-8000-${String(index + 10).padStart(12, "0")}`, parentId: id,
    })),
  }] } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(estimateSummaryCardData.more(10, 27))).toBeVisible();
  },
};
export const Aging: Story = {
  args: { result: {
    ...result, operation: "aging",
    summaries: ["Waiting more than 7 days", "Expiring within 7 days", "Accepted Lead estimates without a Job"].map((queryLabel, index) => ({
      ...result.summaries[0], id: `00000000-0000-4000-8000-${String(index + 30).padStart(12, "0")}`, queryLabel, canOpenList: index === 1,
    })),
  } },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
  },
};
export const NavigationFailure: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => new Response("Unavailable", { status: 404 }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: estimateSummaryCardData.openList }));
    await expect(canvas.getByText(c.failed)).toBeVisible();
    await expect(args.onRefresh).toHaveBeenCalledOnce();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const ServerCheckedNavigation: Story = {
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({ href: `/estimates?workspace=${id}` }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: estimateSummaryCardData.openList }));
    await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates?workspace=${id}`);
    await expect(globalThis.fetch).toHaveBeenCalledWith("/api/chat/estimates/navigate", expect.objectContaining({
      method: "POST", body: JSON.stringify({ workspaceId: id, turnId: id, resultId: id }),
    }));
  },
};
export const CsvExportHandoff: Story = {
  args: {
    result: estimateChatSummaryResultSchema.parse({
      ...result,
      operation: "export",
      summaries: [{
        ...result.summaries[0],
        queryLabel: "Export sent estimates",
        filterLabels: ["Status: Sent"],
        canOpenList: false,
        canReviewExport: true,
      }],
    }),
  },
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({
      href: `/estimates?workspace=${id}&status=sent&export=review`,
    }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: estimateSummaryCardData.reviewExport,
    }));
    await expect(args.onNavigate).toHaveBeenCalledWith(
      `/estimates?workspace=${id}&status=sent&export=review`,
    );
    await expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/chat/estimates/navigate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          workspaceId: id,
          turnId: id,
          resultId: id,
          destination: "export",
        }),
      }),
    );
  },
};
const detailResult = estimateChatResultSchema.parse({
  turnId: id, operation: "explain_totals", summaries: [], detail: estimateTotalsFixture,
});
export const DetailedNavigationFailure: Story = {
  args: { result: detailResult },
  beforeEach: NavigationFailure.beforeEach,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: estimateReadResultData.open }));
    await expect(canvas.getByText(c.failed)).toBeVisible();
    await expect(args.onRefresh).toHaveBeenCalledOnce();
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const DetailedServerCheckedNavigation: Story = {
  args: { result: detailResult },
  beforeEach: () => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({ href: `/estimates/${estimateTotalsFixture.estimate?.id}?workspace=${id}` }));
    return () => { globalThis.fetch = fetch; };
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: estimateReadResultData.open }));
    await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${estimateTotalsFixture.estimate?.id}?workspace=${id}`);
    await expect(globalThis.fetch).toHaveBeenCalledWith("/api/chat/estimates/navigate", expect.objectContaining({
      method: "POST", body: JSON.stringify({
        workspaceId: id, turnId: id, resultId: estimateTotalsFixture.id, estimateId: estimateTotalsFixture.estimate?.id,
      }),
    }));
  },
};

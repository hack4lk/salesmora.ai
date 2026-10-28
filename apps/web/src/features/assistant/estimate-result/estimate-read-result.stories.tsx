import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EstimateReadResult } from "./estimate-read-result";
import {
  estimateComparisonFixture, estimateDetailFixture, estimateScopeFixture,
  estimateTotalsFixture, estimateUnavailableFixture,
} from "./estimate-read-result.fixtures";
import { estimateReadResultData as c } from "./estimate-read-result.data";

const meta = {
  title: "Assistant/EstimateReadResult",
  component: EstimateReadResult,
  args: { card: estimateDetailFixture, disabled: false, onOpenEstimate: fn() },
  decorators: [(Story) => <main className="mx-auto w-full max-w-3xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof EstimateReadResult>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Details: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: c.titles.get })).toBeVisible();
    await expect(canvas.getByText("Verified frozen snapshot")).toBeVisible();
    await expect(canvas.getByText("$947.93")).toBeVisible();
    await expect(canvas.getByText("Estimate published")).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.open }));
    await expect(args.onOpenEstimate).toHaveBeenCalledWith(estimateDetailFixture.estimate?.id);
  },
};
export const Totals: Story = { args: { card: estimateTotalsFixture } };
export const Comparison: Story = {
  args: { card: estimateComparisonFixture },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$360.00")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Open EST-2048 · Revision 1/ })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: /Open EST-2048 · Revision 2/ })).toBeEnabled();
  },
};
export const Scope: Story = { args: { card: estimateScopeFixture } };
export const Unavailable: Story = {
  args: { card: estimateUnavailableFixture },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const OneRevision: Story = {
  args: { card: estimateComparisonFixture.kind === "compare_revisions" ? { ...estimateComparisonFixture, comparison: null } : estimateComparisonFixture },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(c.oneRevision)).toBeVisible(); },
};
export const NoComparedChanges: Story = {
  args: { card: estimateComparisonFixture.kind === "compare_revisions" && estimateComparisonFixture.comparison
    ? { ...estimateComparisonFixture, comparison: {
      ...estimateComparisonFixture.comparison,
      to: { ...estimateComparisonFixture.comparison.to, totalCents: 94793 },
      totalDifferenceCents: 0, fields: [], lineItemChanges: [], lineItemChangeCount: 0,
    } } : estimateComparisonFixture },
};
export const AssignedScope: Story = { args: { card: { ...estimateScopeFixture, scope: "assigned" } } };
export const RestrictedParent: Story = {
  args: { card: estimateScopeFixture.kind === "summarize_scope" ? { ...estimateScopeFixture, parent: null } : estimateScopeFixture },
};
export const IncompleteDraft: Story = {
  args: { card: estimateTotalsFixture.kind === "explain_totals" ? {
    ...estimateTotalsFixture, estimate: { ...estimateTotalsFixture.estimate, status: "draft" },
    pricing: {
      ...estimateTotalsFixture.pricing, source: "current_draft", lineItemCount: 0, lineItems: [],
      totals: {
        subtotalCents: null, discountCents: null, taxableDiscountCents: null, nonTaxableDiscountCents: null,
        taxableAfterDiscountCents: null, taxRateMilliPercent: 8875, taxCents: null, totalCents: null, depositCents: null, balanceCents: null,
      },
      issues: ["items"],
    },
  } : estimateTotalsFixture },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.noLines)).toBeVisible();
    await expect(canvas.getAllByText(c.amountUnavailable)).toHaveLength(9);
  },
};
export const TruncatedLines: Story = {
  args: { card: estimateTotalsFixture.kind === "explain_totals" ? {
    ...estimateTotalsFixture, pricing: { ...estimateTotalsFixture.pricing, lineItems: [estimateTotalsFixture.pricing.lineItems[0]] },
  } : estimateTotalsFixture },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.lineCount(1, 2))).toBeVisible();
    await expect(canvas.getByText("$947.93")).toBeVisible();
    await expect(canvas.getByText(c.lineWindow)).toBeVisible();
  },
};
export const LongLiteralScope: Story = {
  args: { card: estimateScopeFixture.kind === "summarize_scope" ? {
    ...estimateScopeFixture, estimateScope: { text: "<script>literal, never executable</script>\n" + "LongScope".repeat(300), truncated: true },
  } : estimateScopeFixture },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.truncated)).toBeVisible();
    await expect(canvasElement.querySelector("section script")).toBeNull();
  },
};
export const Disabled: Story = {
  args: { card: estimateComparisonFixture, disabled: true },
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
  },
};

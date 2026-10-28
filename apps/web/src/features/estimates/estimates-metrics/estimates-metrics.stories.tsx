import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { estimatePreviewData as preview } from "../estimate-preview.data";
import { EstimatesMetrics } from "./estimates-metrics";
import type { EstimateQuickFilter } from "./estimates-metrics";
import { estimatesMetricsData as copy } from "./estimates-metrics.data";

const meta = {
  title: "Estimates/EstimatesMetrics",
  component: EstimatesMetrics,
  args: {
    totals: {
      awaitingResponse: 3,
      openValueCents: 2464403,
      acceptedThisMonthCount: 1,
      acceptedThisMonthValueCents: 329674,
      expiringIn7Days: 2,
    },
    onQuickFilterChange: fn(),
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
  render: function Preview(args) {
    const [quickFilter, setQuickFilter] = useState<EstimateQuickFilter>(null);
    return (
      <EstimatesMetrics
        {...args}
        quickFilter={quickFilter}
        onQuickFilterChange={(value) => {
          setQuickFilter(value);
          args.onQuickFilterChange?.(value);
        }}
      />
    );
  },
} satisfies Meta<typeof EstimatesMetrics>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Zero: Story = {
  args: {
    totals: {
      awaitingResponse: 0,
      openValueCents: 0,
      acceptedThisMonthCount: 0,
      acceptedThisMonthValueCents: 0,
      expiringIn7Days: 0,
    },
  },
};
export const ExactLargeAggregate: Story = {
  args: {
    totals: {
      awaitingResponse: 3,
      openValueCents: "9007199254740993",
      acceptedThisMonthCount: 1,
      acceptedThisMonthValueCents: "100000000000001",
      expiringIn7Days: 2,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$90,071,992,547,409.93")).toBeVisible();
    await expect(canvas.getByText("1 · $1,000,000,000,000.01")).toBeVisible();
  },
};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const ErrorNoRetry: Story = { args: { state: "error", onRetry: undefined } };
export const MissingTotals: Story = { args: { totals: undefined } };
export const InvalidTotals: Story = {
  args: {
    totals: {
      awaitingResponse: -1,
      openValueCents: 2464403,
      acceptedThisMonthCount: 1,
      acceptedThisMonthValueCents: 329674,
      expiringIn7Days: 2,
    },
  },
};
export const QuickFilterToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: copy.awaiting.label }));
    await expect(
      canvas.getByRole("button", { name: copy.awaiting.label }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: copy.awaiting.label }));
    await expect(
      canvas.getByRole("button", { name: copy.awaiting.label }),
    ).toHaveAttribute("aria-pressed", "false");
  },
};

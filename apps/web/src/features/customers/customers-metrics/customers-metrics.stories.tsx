import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomersMetrics } from "./customers-metrics";
import { customersMetricsData as copy } from "./customers-metrics.data";
import { metricCardData } from "../../../../../../packages/ui/src/data-display/metric-card/metric-card.data";
const totals = { customers: 8, withOpenLeads: 5 };
const meta = {
  title: "Customers/CustomersMetrics",
  component: CustomersMetrics,
  args: { totals, jobsAvailable: false, onRetry: fn() },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <h1 className="m-0 text-heading font-semibold text-ink">
          {copy.stories.title}
        </h1>
        <p className="mb-6 mt-3 text-base leading-6 text-muted">
          {copy.stories.description}
        </p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CustomersMetrics>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole("region", { name: copy.title }),
    ).toHaveAccessibleDescription(copy.description);
    await expect(
      within(c.getByRole("group", { name: copy.customers.label })).getByText(
        "8",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      within(c.getByRole("group", { name: copy.leads.label })).getByText("5", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      within(c.getByRole("group", { name: copy.jobs.label })).getByRole(
        "status",
      ),
    ).toHaveTextContent(metricCardData.unavailable);
    await expect(c.getByText(copy.jobs.unavailable)).toBeVisible();
  },
};
export const Zero: Story = {
  args: { totals: { customers: 0, withOpenLeads: 0 } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText("0", { exact: true })).toHaveLength(2);
    await expect(c.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const JobsAvailable: Story = {
  args: { totals: { ...totals, withActiveJobs: 3 }, jobsAvailable: true },
  render: (args) => (
    <>
      <p className="mb-4 text-sm leading-6 text-muted">{copy.stories.future}</p>
      <CustomersMetrics {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      within(c.getByRole("group", { name: copy.jobs.label })).getByText("3", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(c.queryByText(copy.jobs.unavailable)).not.toBeInTheDocument();
  },
};
export const JobsUnavailableWithCachedCount: Story = {
  args: { totals: { ...totals, withActiveJobs: 3 } },
  play: async ({ canvasElement }) => {
    const job = within(
      within(canvasElement).getByRole("group", { name: copy.jobs.label }),
    );
    await expect(job.queryByText("3", { exact: true })).not.toBeInTheDocument();
    await expect(job.getByRole("status")).toHaveTextContent(
      metricCardData.unavailable,
    );
  },
};
export const MissingJobCount: Story = {
  args: { jobsAvailable: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(
        within(canvasElement).getByRole("group", { name: copy.jobs.label }),
      ).getByRole("status"),
    ).toHaveTextContent(metricCardData.unavailable);
  },
};
export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText(metricCardData.loading)).toHaveLength(2);
    await expect(c.queryByText("8", { exact: true })).not.toBeInTheDocument();
    await expect(c.queryByText("5", { exact: true })).not.toBeInTheDocument();
    await expect(c.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LoadingWithJobs: Story = {
  args: {
    state: "loading",
    jobsAvailable: true,
    totals: { ...totals, withActiveJobs: 3 },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByText(metricCardData.loading),
    ).toHaveLength(3);
  },
};
export const Error: Story = {
  args: {
    state: "error",
    jobsAvailable: true,
    totals: { ...totals, withActiveJobs: 3 },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent(copy.error);
    for (const value of ["8", "5", "3"])
      await expect(
        c.queryByText(value, { exact: true }),
      ).not.toBeInTheDocument();
  },
};
export const ErrorWithoutRetry: Story = {
  args: { state: "error", onRetry: undefined },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("button"),
    ).not.toBeInTheDocument();
  },
};
export const Retry: Story = {
  args: { state: "error" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: copy.retry,
    });
    button.focus();
    await expect(button).toHaveFocus();
    await expect(
      parseFloat(getComputedStyle(button).outlineWidth),
    ).toBeGreaterThanOrEqual(3);
    await userEvent.keyboard("{Enter}");
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const RetryRestoresTotals: Story = {
  args: { state: "error" },
  render: function RetryPreview(args) {
    const [state, setState] = useState(args.state);
    return (
      <CustomersMetrics
        {...args}
        state={state}
        onRetry={() => {
          args.onRetry?.();
          setState("ready");
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.retry }));
    await expect(c.queryByRole("alert")).not.toBeInTheDocument();
    await expect(c.getByText("8", { exact: true })).toBeVisible();
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const MissingTotals: Story = {
  args: { totals: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent(copy.error);
    await expect(c.queryByText("0", { exact: true })).not.toBeInTheDocument();
  },
};
export const InvalidTotals: Story = {
  args: { totals: { customers: 8, withOpenLeads: 9 } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent(copy.error);
    for (const value of ["8", "9"])
      await expect(
        c.queryByText(value, { exact: true }),
      ).not.toBeInTheDocument();
  },
};
export const LargeNumbers: Story = {
  args: {
    totals: {
      customers: 1234567,
      withOpenLeads: 432100,
      withActiveJobs: 200000,
    },
    jobsAvailable: true,
  },
};

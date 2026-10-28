import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { estimateButton } from "../estimate-ui";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { RelatedEstimatesCard, type RelatedEstimatesCardProps } from "./related-estimates-card";
import { relatedEstimatesCardData as c, relatedEstimateFixtures as estimates } from "./related-estimates-card.data";

const meta = {
  title: "Estimates/RelatedEstimatesCard",
  component: RelatedEstimatesCard,
  args: {
    recordType: "lead", estimates, total: estimates.length, canRead: true,
    canCreate: true, onCreate: fn(), onRetry: fn(),
  },
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-lg bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof RelatedEstimatesCard>;
export default meta;
type Story = StoryObj<typeof meta>;

function items(element: HTMLElement) {
  return within(within(element).getByRole("list", { name: c.title })).getAllByRole("listitem");
}
async function hidden(element: HTMLElement) {
  const canvas = within(element);
  await expect(canvas.getByText(c.unavailable)).toBeVisible();
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(canvas.queryByText(estimates[0].name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.loaded(estimates.length, estimates.length))).not.toBeInTheDocument();
}

export const Lead: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(items(canvasElement)).toHaveLength(3);
    for (const estimate of estimates) {
      await expect(canvas.getByText(c.identity(estimate.number, estimate.revision))).toBeVisible();
      await expect(canvas.getByRole("link", { name: c.openLabel(estimate.number, estimate.revision) }))
        .toHaveAttribute("href", estimate.href);
    }
    await expect(within(items(canvasElement)[0]).getByText("$8,655.56")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(3, 3));
    await expect(canvas.getByText(c.createHint.lead)).toBeVisible();
  },
};
export const Job: Story = {
  args: { recordType: "job" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.description.job)).toBeVisible();
    await expect(canvas.getByText(c.createHint.job)).toBeVisible();
  },
};
export const IncludeHistory: Story = {
  args: { onIncludeHiddenChange: fn() },
  render: function Preview(args) {
    const [hidden, setHidden] = useState(false);
    return <RelatedEstimatesCard {...args} includeHidden={hidden} onIncludeHiddenChange={(value) => {
      setHidden(value); args.onIncludeHiddenChange?.(value);
    }} />;
  },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole("switch", { name: c.includeHidden });
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onIncludeHiddenChange).toHaveBeenCalledWith(true);
  },
};
export const Customer: Story = {
  args: { recordType: "customer", estimates: estimates.map((estimate, index) => ({
    ...estimate, parent: index === 1 ? { type: "job", number: "J-1040" } : { type: "lead", number: "LD-1048" },
  })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.createHint.customer)).toBeVisible();
    await expect(within(items(canvasElement)[1]).getByText(c.parent("job", "J-1040"))).toBeVisible();
  },
};
function CreatePreview(args: RelatedEstimatesCardProps) {
  const [requested, setRequested] = useState(false);
  return <div className="grid gap-4">
    <RelatedEstimatesCard {...args} onCreate={() => { args.onCreate?.(); setRequested(true); }} />
    {requested && <p role="status" className="m-0 text-sm text-muted">
      {args.recordType === "customer" ? c.stories.customerChosen : c.stories.chosen}
    </p>}
  </div>;
}
export const CreateFromLead: Story = {
  render: args => <CreatePreview {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: c.create }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onCreate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText(c.stories.chosen)).toBeVisible();
  },
};
export const CreateFromJob: Story = { ...CreateFromLead, args: { recordType: "job" } };
export const ChooseParentFromCustomer: Story = {
  args: { recordType: "customer" },
  render: CreateFromLead.render,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.create }));
    await expect(args.onCreate).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText(c.stories.customerChosen)).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { canCreate: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: c.create })).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.createHint.lead)).not.toBeInTheDocument();
    await expect(canvas.getAllByRole("link")).toHaveLength(3);
    await expect(args.onCreate).not.toHaveBeenCalled();
  },
};
export const CreateNotConnected: Story = {
  args: { onCreate: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: c.create })).not.toBeInTheDocument();
    await expect(canvas.getByText(c.createUnavailable)).toBeVisible();
  },
};
export const Empty: Story = {
  args: { estimates: [], total: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.empty)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.create })).toBeEnabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(0, 0));
  },
};
export const EmptyReadOnly: Story = { ...Empty, args: { estimates: [], total: 0, canCreate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.empty)).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loading);
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText(estimates[0].name)).not.toBeInTheDocument();
  },
};
export const ErrorAndRetry: Story = {
  args: { state: "error", error: c.stories.failure },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.create })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const ErrorWithoutRetry: Story = {
  args: { state: "error", onRetry: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.error);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const AccessDenied: Story = {
  args: { canRead: false, state: "error", error: c.stories.failure },
  play: async ({ canvasElement }) => {
    await hidden(canvasElement);
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Unavailable: Story = { ...AccessDenied, args: { state: "unavailable" } };
function AccessLossPreview(args: RelatedEstimatesCardProps) {
  const [readable, setReadable] = useState(true);
  return <div className="grid gap-4">
    <RelatedEstimatesCard {...args} canRead={readable} />
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
    await expect(canvas.queryByRole("button", { name: c.create })).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true, total: 12, onLoadMore: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    for (const link of canvas.getAllByRole("link")) {
      await expect(link).toHaveAttribute("aria-disabled", "true");
      await expect(link).not.toHaveAttribute("href");
    }
    await expect(args.onCreate).not.toHaveBeenCalled();
    await expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};
function PagedPreview(args: RelatedEstimatesCardProps) {
  const [complete, setComplete] = useState(false);
  return <RelatedEstimatesCard {...args} estimates={complete ? estimates : estimates.slice(0, 2)}
    onLoadMore={() => { args.onLoadMore?.(); setComplete(true); }} />;
}
export const LoadMore: Story = {
  args: { onLoadMore: fn() },
  render: args => <PagedPreview {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(items(canvasElement)).toHaveLength(2);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(2, 3));
    await userEvent.click(canvas.getByRole("button", { name: c.more }));
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await expect(items(canvasElement)).toHaveLength(3);
    await expect(canvas.queryByRole("button", { name: c.more })).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(3, 3));
  },
};
export const MoreNotConnected: Story = {
  args: { total: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.moreUnavailable)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.more })).not.toBeInTheDocument();
  },
};
export const ZeroAndUnavailableTotals: Story = {
  args: { estimates: [{ ...estimates[0], totalCents: null }, { ...estimates[1], totalCents: 0 }], total: 2 },
  play: async ({ canvasElement }) => {
    const rows = items(canvasElement);
    await expect(within(rows[0]).getByText(c.totalUnavailable)).toBeVisible();
    await expect(within(rows[0]).queryByText("$0.00")).not.toBeInTheDocument();
    await expect(within(rows[1]).getByText("$0.00")).toBeVisible();
  },
};
export const AllStatuses: Story = {
  args: { estimates: estimateStatuses.map((status, index) => ({
    ...estimates[0], id: `status-${status}`, status, number: `EST-${2100 + index}`, archived: status === "declined",
  })), total: estimateStatuses.length },
  play: async ({ canvasElement }) => {
    const rows = items(canvasElement);
    for (const [index, status] of estimateStatuses.entries()) {
      await expect(within(rows[index]).getByText(estimateStatusBadgeData.statuses[status].label)).toBeVisible();
    }
    await expect(within(canvasElement).getByText(estimateStatusBadgeData.archived)).toBeVisible();
  },
};
export const NavigationUnavailable: Story = {
  args: { estimates: [{ ...estimates[0], href: undefined }], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.cannotOpen)).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const KeyboardNavigation: Story = {
  args: { total: 12, onLoadMore: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: c.create }).focus();
    for (const estimate of estimates) {
      await userEvent.keyboard("{Tab}");
      const link = canvas.getByRole("link", { name: c.openLabel(estimate.number, estimate.revision) });
      await expect(link).toHaveFocus();
      await expect(link).toHaveStyle({ outlineWidth: "3px", outlineStyle: "solid" });
    }
    await userEvent.keyboard("{Tab}");
    await expect(canvas.getByRole("button", { name: c.more })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: c.more })).toHaveStyle({ outlineWidth: "3px", outlineStyle: "solid" });
  },
};
export const LongContent: Story = {
  args: { estimates: [{ ...estimates[0], name: c.stories.longName, totalCents: 1000000000 }], total: 1 },
};
export const LiteralText: Story = {
  args: { estimates: [{ ...estimates[0], name: c.stories.literal }], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: c.stories.literal })).toBeVisible();
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};

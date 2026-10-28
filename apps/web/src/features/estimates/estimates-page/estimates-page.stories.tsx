import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { estimateFixtures as rows } from "../estimate-preview.data";
import { estimatesEmptyStateData as emptyCopy } from "../estimates-empty-state/estimates-empty-state.data";
import { estimatesMetricsData as metricsCopy } from "../estimates-metrics/estimates-metrics.data";
import { estimatesToolbarData as toolbarCopy } from "../estimates-toolbar/estimates-toolbar.data";
import { estimateExportDialogData as exportCopy } from "../estimate-export-dialog/estimate-export-dialog.data";
import { EstimatesPagePreview } from "./estimates-page";
import { estimatesPageData as copy } from "./estimates-page.data";

const meta = {
  title: "Estimates/EstimatesPage",
  component: EstimatesPagePreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EstimatesPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
    await expect(c.getByText("8 of 10 estimates")).toBeVisible();
    await expect(c.getByText("$24,644.03")).toBeVisible();
    await expect(c.getByText("1 · $3,296.74")).toBeVisible();
    await expect(c.getByRole("button", { name: "SalesMora assistant How can I help?" })).toBeVisible();
  },
};
export const Admin: Story = { args: { role: "admin" } };
export const Office: Story = {
  args: { role: "office" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: copy.export })).not.toBeInTheDocument();
    await expect(c.getByRole("button", { name: copy.create })).toBeVisible();
  },
};
export const Field: Story = {
  args: { role: "field" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("2 of 2 estimates")).toBeVisible();
    await expect(c.queryByText(rows[0].name)).not.toBeInTheDocument();
    await expect(c.queryByText(rows[8].name)).not.toBeInTheDocument();
    await expect(c.queryByRole("button", { name: copy.export })).not.toBeInTheDocument();
    await expect(within(c.getByRole("region", { name: metricsCopy.title })).getByText("$12,477.53")).toBeVisible();
  },
};
export const Empty: Story = { args: { empty: true } };
export const Filtered: Story = { args: { initialFilters: { status: "sent", related: "lead" } } };
export const FilteredEmpty: Story = { args: { initialFilters: { search: copy.stories.missingSearch } } };
export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("searchbox")).toBeDisabled();
    await expect(c.queryByText("8 of 10 estimates")).not.toBeInTheDocument();
    await expect(c.getByRole("button", { name: copy.export })).toBeDisabled();
  },
};
export const Error: Story = { args: { state: "error" } };
export const Forbidden: Story = {
  args: { state: "forbidden" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.forbidden)).toBeVisible();
    await expect(c.queryByRole("searchbox")).not.toBeInTheDocument();
    await expect(c.queryByText("$24,644.03")).not.toBeInTheDocument();
    await expect(c.queryByRole("button", { name: copy.create })).not.toBeInTheDocument();
  },
};
export const ManyEstimates: Story = { args: { many: true } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };
export const Tablet: Story = {
  parameters: {
    viewport: { options: { tablet: { name: "Tablet · 820px", styles: { width: "820px", height: "1180px" }, type: "tablet" } } },
  },
  globals: { viewport: { value: "tablet", isRotated: false } },
};
export const Assistant: Story = {
  args: { initialOverlay: "assistant" },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog")).toBeVisible();
    await expect(body.getByText(copy.assistantText)).toBeVisible();
    await expect(body.getByRole("button", { name: "Ask assistant" })).toBeDisabled();
  },
};
export const SearchAndClear: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    fireEvent.change(c.getByRole("searchbox"), { target: { value: copy.stories.missingSearch } });
    await waitFor(() => expect(c.getByRole("heading", { name: emptyCopy.filteredTitle })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: emptyCopy.clear }));
    await waitFor(() => expect(c.getByText("8 of 10 estimates")).toBeVisible());
  },
};
export const QuickFilters: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const metrics = within(c.getByRole("region", { name: metricsCopy.title }));
    await userEvent.click(metrics.getByRole("button", { name: metricsCopy.awaiting.label }));
    await expect(c.getByText("3 of 10 estimates")).toBeVisible();
    await expect(metrics.getByText("$24,644.03")).toBeVisible();
    await userEvent.click(metrics.getByRole("button", { name: metricsCopy.expiring.label }));
    await expect(c.getByText("2 of 10 estimates")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: copy.clearQuickFilter }));
    await expect(c.getByText("8 of 10 estimates")).toBeVisible();
  },
};
export const IncludeHidden: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("switch", { name: toolbarCopy.includeHidden }));
    await expect(c.getByText("10 of 10 estimates")).toBeVisible();
    await expect(c.getByText("$24,644.03")).toBeVisible();
  },
};
export const OwnerAndRelatedFilters: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText(toolbarCopy.owner), "me");
    await expect(c.getByText("4 of 10 estimates")).toBeVisible();
    await userEvent.selectOptions(c.getByLabelText(toolbarCopy.related), "job");
    await expect(c.getByText("1 of 10 estimates")).toBeVisible();
    await expect(c.getByText("$24,644.03")).toBeVisible();
    await userEvent.selectOptions(c.getByLabelText(toolbarCopy.owner), "unassigned");
    await expect(c.getByRole("heading", { name: emptyCopy.filteredTitle })).toBeVisible();
  },
};
export const ExportReview: Story = {
  args: { initialFilters: { status: "sent" } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole("button", { name: copy.export }));
    await waitFor(() => expect(body.getByRole("alertdialog", { name: exportCopy.title })).toBeVisible());
    await expect(body.getByText(exportCopy.count(2))).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: exportCopy.download }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(c.getByText(copy.exportPreview)).toBeVisible();
  },
};
export const ExportAllPages: Story = {
  args: { many: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole("button", { name: copy.export }));
    await waitFor(() => expect(body.getByRole("alertdialog", { name: exportCopy.title })).toBeVisible());
    await expect(body.getByText(exportCopy.count(60))).toBeVisible();
  },
};
export const PaginationAndReset: Story = {
  args: { many: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Go to page 2" }));
    await expect(c.getByText("Showing 26–50 of 60")).toBeVisible();
    fireEvent.change(c.getByRole("searchbox"), { target: { value: copy.stories.manySearch } });
    await waitFor(() => expect(c.getByText("Showing 1–1 of 1")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Clear all" }));
    await waitFor(() => expect(c.getByText("Showing 1–25 of 60")).toBeVisible());
    await userEvent.selectOptions(c.getByLabelText("Rows per page"), "50");
    await expect(c.getByText("Showing 1–50 of 60")).toBeVisible();
  },
};
export const SortAmounts: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Sort by Amount, ascending" }));
    await expect(within(c.getAllByRole("row")[1]).getByText(rows[8].number)).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Sort by Amount, descending" }));
    await expect(within(c.getAllByRole("row")[1]).getByText(rows[4].number)).toBeVisible();
  },
};
export const Retry: Story = {
  args: { state: "error" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: metricsCopy.retry }));
    await expect(c.getByText("8 of 10 estimates")).toBeVisible();
    await expect(c.getByText("$24,644.03")).toBeVisible();
  },
};
export const KeyboardRow: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    c.getByRole("row", { name: /EST-2048/ }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByText(copy.previewAction("Open estimate", rows[0].number))).toBeVisible();
  },
};
export const RowMenuAction: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole("button", { name: `Actions for ${rows[1].name}` }));
    await userEvent.click(body.getByRole("menuitem", { name: "Create revision" }));
    await expect(c.getByText(copy.previewAction("Create revision", rows[1].number))).toBeVisible();
    await expect(c.queryByText(copy.previewAction("Open estimate", rows[1].number))).not.toBeInTheDocument();
  },
};
export const KeyboardMenuAction: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: `Actions for ${rows[1].name}` }));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(c.getByText(copy.previewAction("Create revision", rows[1].number))).toBeVisible();
  },
};

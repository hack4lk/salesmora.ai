import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerProfile } from "./customer-profile";
import { RelatedEstimatesCard } from "../../estimates/related-estimates-card/related-estimates-card";
import { relatedEstimateFixtures } from "../../estimates/related-estimates-card/related-estimates-card.data";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
  customerOwnerCapabilities as owner,
  customerOfficeCapabilities as office,
  customerReadOnlyCapabilities as readOnly,
  customerFieldCapabilities as field,
  customerLinkedLeads as leads,
  customerEvents as events,
  customerNotes as notes,
  customerPagedLeads,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerProfile",
  component: CustomerProfile,
  args: {
    customer: rows[0],
    members,
    capabilities: owner,
    leads: leads.slice(0, 2),
    events,
    notes,
    onBack: fn(),
    onAction: fn(),
    onExport: fn(),
    onLink: fn(),
    onUnlink: fn(),
    onOpenRecord: fn(),
    onAddNote: fn(async () => {}),
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">
          {preview.notice}
        </p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CustomerProfile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithEstimates: Story = {
  args: { relatedEstimates: <RelatedEstimatesCard recordType="customer"
    estimates={relatedEstimateFixtures.map((estimate, index) => ({ ...estimate,
      parent: { type: index === 1 ? "job" : "lead", number: index === 1 ? "J-1040" : "LD-1048" },
    }))} total={3} canRead canCreate onCreate={fn()} /> },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Estimates" })).toBeVisible();
    await expect(c.getByText("Job · J-1040")).toBeVisible();
    await expect(c.getByRole("button", { name: "Create estimate" })).toBeEnabled();
    await userEvent.click(c.getByRole("tab", { name: "Activity" }));
    await expect(c.queryByRole("heading", { name: "Estimates" })).not.toBeInTheDocument();
  },
};
export const EstimatesAccessLost: Story = {
  args: { relatedEstimates: <RelatedEstimatesCard recordType="customer" estimates={relatedEstimateFixtures} total={3} /> },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("link", { name: /^Open estimate/ })).not.toBeInTheDocument();
    await expect(c.queryByRole("button", { name: "Create estimate" })).not.toBeInTheDocument();
  },
};
export const Business: Story = { args: { customer: rows[2] } };
export const Leads: Story = { args: { initialTab: "leads" } };
export const Activity: Story = { args: { initialTab: "activity" } };
export const Notes: Story = { args: { initialTab: "notes" } };
export const Archived: Story = {
  args: { customer: { ...rows[0], archived: true } },
};
export const Office: Story = { args: { capabilities: office } };
export const ReadOnly: Story = {
  args: { capabilities: readOnly, initialTab: "notes" },
};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const NotFound: Story = {
  args: { state: "not-found", customer: undefined },
};
export const Forbidden: Story = { args: { capabilities: field } };

export const PagedLeads: Story = {
  args: { initialTab: "leads", leadsTotal: 42, onLeadsPageChange: fn() },
  render: function PagingPreview(args) {
    const [page, setPage] = useState(1);
    return (
      <CustomerProfile
        {...args}
        leads={customerPagedLeads.slice((page - 1) * 20, page * 20)}
        leadsPage={page}
        onLeadsPageChange={(next) => {
          setPage(next);
          args.onLeadsPageChange?.(next);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Go to page 2" }));
    await expect(args.onLeadsPageChange).toHaveBeenCalledWith(2);
    await expect(c.getByText(customerPagedLeads[20].number)).toBeVisible();
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Edit contact" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: /Actions for/ }),
    ).toBeDisabled();
  },
};

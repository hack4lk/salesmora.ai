import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { EstimateParentType } from "../estimate-preview.types";
import { EstimateLinkedRecord, type EstimateLinkedParent } from "./estimate-linked-record";
import { estimateLinkedRecordData as copy } from "./estimate-linked-record.data";

const meta = {
  title: "Estimates/EstimateLinkedRecord",
  component: EstimateLinkedRecord,
  args: { record: copy.stories.lead },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimateLinkedRecord>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Lead: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("link", { name: copy.openLabel(copy.open.lead, copy.stories.lead.number) }))
      .toHaveAttribute("href", copy.stories.lead.href);
    await expect(c.getByText(copy.stories.lead.customer.name)).toBeVisible();
    await expect(c.queryByRole("button", { name: copy.chooseJob })).not.toBeInTheDocument();
  },
};
export const Job: Story = { args: { record: copy.stories.job } };
export const ExistingPublishedEstimate: Story = {
  args: { existingEstimates: [{ id: "published", number: "EST-2047", status: "published", href: "#published" }] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Published · not sent")).toBeVisible();
    await expect(c.getByText(copy.existingHint)).toBeVisible();
  },
};
export const NoCustomerYet: Story = {
  args: { record: { ...copy.stories.lead, customer: null } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.noCustomer)).toBeVisible();
    await expect(c.getByText(copy.stories.lead.contactName)).toBeVisible();
    await expect(c.getByText(copy.noCustomerHint)).toBeVisible();
  },
};
export const NewEstimate: Story = {
  args: { record: null, onChooseParent: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.chooseLead }));
    await expect(args.onChooseParent).toHaveBeenCalledOnce();
    await expect(args.onChooseParent).toHaveBeenCalledWith("lead");
  },
};
export const SelectParent: Story = {
  args: { record: null },
  render: function Preview(args) {
    const [record, setRecord] = useState<EstimateLinkedParent | null>(null);
    const [notice, setNotice] = useState("");
    function choose(type: EstimateParentType) {
      const selected = copy.stories[type];
      setRecord(selected);
      setNotice(copy.stories.selected(selected.number));
    }
    return <>
      <EstimateLinkedRecord {...args} record={record} onChooseParent={choose} />
      {notice && <p role="status" className="text-sm text-muted">{notice}</p>}
    </>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.chooseJob }));
    await expect(c.getByText(copy.stories.job.name)).toBeVisible();
    await expect(c.getByText(copy.stories.job.customer.name)).toBeVisible();
    await expect(c.queryByText(copy.stories.lead.customer.name)).not.toBeInTheDocument();
    await expect(c.queryByRole("button", { name: copy.chooseLead })).not.toBeInTheDocument();
  },
};
export const FieldNewEstimate: Story = {
  args: { record: null, scope: "assigned-jobs", onChooseParent: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: copy.chooseLead })).not.toBeInTheDocument();
    c.getByRole("button", { name: copy.chooseJob }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onChooseParent).toHaveBeenCalledOnce();
    await expect(args.onChooseParent).toHaveBeenCalledWith("job");
  },
};
export const FieldAssignedJob: Story = { args: { record: copy.stories.job, scope: "assigned-jobs" } };
export const FieldRejectsLead: Story = {
  args: { scope: "assigned-jobs" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.unavailable)).toBeVisible();
    await expect(c.queryByText(copy.stories.lead.name)).not.toBeInTheDocument();
    await expect(c.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const ExistingOpenEstimates: Story = {
  args: { existingEstimates: copy.stories.existing },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("note")).toHaveTextContent(copy.existingTitle);
    for (const estimate of copy.stories.existing) {
      await expect(c.getByRole("link", { name: copy.openLabel(copy.openExisting, estimate.number) }))
        .toHaveAttribute("href", estimate.href);
    }
  },
};
export const NoNavigationPermission: Story = {
  args: {
    record: { ...copy.stories.lead, href: undefined },
    existingEstimates: [{ ...copy.stories.existing[0], href: undefined }],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("link")).not.toBeInTheDocument();
    await expect(c.getByText(copy.cannotOpen)).toBeVisible();
    await expect(c.getByText(copy.stories.existing[0].number)).toBeVisible();
  },
};
export const SelectionRequired: Story = {
  args: { record: null, onChooseParent: fn(), selectionError: copy.stories.validation },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(copy.stories.validation);
  },
};
export const ReadOnlyEmpty: Story = { args: { record: null } };
export const Disabled: Story = {
  args: { record: null, disabled: true, onChooseParent: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    for (const button of c.getAllByRole("button")) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await expect(args.onChooseParent).not.toHaveBeenCalled();
  },
};
export const DisabledLinkedRecord: Story = { args: { disabled: true } };
export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("status")).toHaveTextContent(copy.loading);
    await expect(c.queryByText(copy.stories.lead.name)).not.toBeInTheDocument();
  },
};
export const Error: Story = {
  args: { state: "error", onRetry: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(c.queryByText(copy.stories.lead.name)).not.toBeInTheDocument();
  },
};
export const Unavailable: Story = {
  args: { state: "unavailable", existingEstimates: copy.stories.existing },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.unavailable)).toBeVisible();
    await expect(c.queryByText(copy.stories.lead.name)).not.toBeInTheDocument();
    await expect(c.queryByText(copy.stories.existing[0].number)).not.toBeInTheDocument();
  },
};
export const LongContent: Story = {
  args: {
    record: {
      ...copy.stories.lead,
      name: copy.stories.longName,
      customer: { ...copy.stories.lead.customer, name: copy.stories.longCustomer },
    },
    existingEstimates: copy.stories.existing,
  },
};
export const Mobile: Story = {
  args: { existingEstimates: copy.stories.existing },
  globals: { viewport: { value: "phone", isRotated: false } },
};

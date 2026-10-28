import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import {
  estimateFieldCapabilities as field,
  estimateFieldFixtures as fieldRows,
  estimateFixtures as rows,
  estimateManyFixtures as manyRows,
  estimateOfficeCapabilities as office,
  estimateOwnerCapabilities as owner,
  estimatePreviewData as preview,
} from "../estimate-preview.data";
import { EstimatesTable, type EstimatesTableProps } from "./estimates-table";
import { EstimateArchiveDialog } from "../estimate-archive-dialog/estimate-archive-dialog";
import { initialEstimateArchiveReview, type EstimateArchiveMode, type EstimateArchiveRecord } from "../estimate-archive-dialog/estimate-archive-dialog.preview";
import { EstimateDeleteDraftDialog } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog";
import { estimateDeleteDraftDialogData as deleteCopy } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.data";
import {
  initialEstimateDeleteDraftValues, type EstimateDeleteDraftRecord,
} from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.preview";

const meta = {
  title: "Estimates/EstimatesTable",
  component: EstimatesTable,
  args: {
    rows: rows.filter((row) => !row.archived && row.status !== "superseded"),
    now: preview.now,
    members: preview.members,
    capabilities: owner,
    onOpen: fn(),
    onAction: fn(),
    onOpenRelated: fn(),
    onRetry: fn(),
    sort: { column: "updatedAt", direction: "desc" },
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-7xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimatesTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OneRow: Story = { args: { rows: [rows[0]] } };
export const ManyRows: Story = { args: { rows: manyRows } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { rows: [] } };
export const LongIdentity: Story = {
  args: {
    rows: [
      {
        ...rows[0],
        name: preview.longName,
        customerName: preview.longCustomer,
      },
    ],
  },
};
export const Office: Story = { args: { capabilities: office } };
export const Field: Story = { args: { capabilities: field, rows: fieldRows } };
export const NoRelatedNavigation: Story = { args: { onOpenRelated: undefined } };
export const ReadOnly: Story = {
  args: { onOpen: undefined, onAction: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /Actions for/ })).not.toBeInTheDocument();
  },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile2" } },
};

function ArchiveTableComposition(args: EstimatesTableProps) {
  const [review, setReview] = useState<{ estimate: EstimateArchiveRecord; mode: EstimateArchiveMode } | null>(null);
  return <>
    <EstimatesTable {...args} onAction={(row, action) => {
      args.onAction?.(row, action);
      if (action === "archive" || action === "restore") setReview({
        estimate: { ...row, recipientName: row.customerName }, mode: action,
      });
    }} />
    {review && <EstimateArchiveDialog open {...review}
      review={initialEstimateArchiveReview(review.estimate, review.mode)} capabilities={args.capabilities}
      onClose={() => setReview(null)} onConfirm={async () => { setReview(null); }} />}
  </>;
}
const closedRow = { ...rows[0], status: "declined" as const, archived: false };
export const ArchiveReview: Story = {
  args: { rows: [closedRow] },
  render: args => <ArchiveTableComposition {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Archive estimate" }));
    const dialog = within(await body.findByRole("alertdialog"));
    await expect(dialog.getByRole("button", { name: "Archive estimate" })).toBeEnabled();
    await waitFor(() => expect(dialog.getByText(closedRow.name)).toBeVisible());
  },
};
export const RestoreReview: Story = {
  args: { rows: [{ ...closedRow, archived: true }] },
  render: ArchiveReview.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Restore estimate" }));
    const dialog = within(await body.findByRole("alertdialog"));
    await expect(dialog.getByRole("button", { name: "Restore estimate" })).toBeEnabled();
  },
};

const draftRow = { ...rows[0], status: "draft" as const, archived: false };
function DeleteTableComposition(args: EstimatesTableProps) {
  const [record, setRecord] = useState<EstimateDeleteDraftRecord | null>(null);
  const [value, setValue] = useState(initialEstimateDeleteDraftValues({ ...draftRow, recipientName: "", sharing: "never-shared" }));
  return <>
    <EstimatesTable {...args} onAction={(row, action) => {
      args.onAction?.(row, action);
      if (action !== "delete-draft") return;
      const next: EstimateDeleteDraftRecord = { ...row, recipientName: row.customerName, sharing: "never-shared" };
      setRecord(next);
      setValue(initialEstimateDeleteDraftValues(next));
    }} />
    {record && <EstimateDeleteDraftDialog open estimate={record} value={value} onChange={setValue}
      capabilities={args.capabilities} onClose={() => setRecord(null)}
      onConfirm={async () => { setRecord(null); }} />}
  </>;
}

export const DeleteDraftReview: Story = {
  args: { rows: [draftRow] },
  render: args => <DeleteTableComposition {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete draft" }));
    const element = await body.findByRole("alertdialog");
    await waitFor(() => expect(element).toBeVisible());
    const dialog = within(element);
    await expect(dialog.getByRole("button", { name: deleteCopy.confirm })).toBeDisabled();
    fireEvent.change(dialog.getByRole("textbox", { name: deleteCopy.type }), { target: { value: draftRow.number } });
    await expect(dialog.getByRole("button", { name: deleteCopy.confirm })).toBeEnabled();
  },
};
export const DuplicateFromMenu: Story = {
  args: { rows: [draftRow] },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("menuitem", { name: "Duplicate estimate" }));
    await expect(args.onAction).toHaveBeenCalledWith(draftRow, "duplicate");
    await expect(args.onOpen).not.toHaveBeenCalled();
  },
};
export const CreateRevisionFromMenu: Story = {
  args: { rows: [{ ...draftRow, status: "published" }] },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("menuitem", { name: "Create revision" }));
    await expect(args.onAction).toHaveBeenCalledWith(args.rows[0], "revise");
    await expect(args.onOpen).not.toHaveBeenCalled();
  },
};
export const ScopedRowActions: Story = {
  args: { rows: [{ ...draftRow, capabilities: { create: false, update: false, delete: false } }] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("menuitem", { name: "Open estimate" })).toBeVisible();
    await expect(body.queryByRole("menuitem", { name: "Duplicate estimate" })).not.toBeInTheDocument();
    await expect(body.queryByRole("menuitem", { name: "Delete draft" })).not.toBeInTheDocument();
  },
};
export const PendingActions: Story = {
  args: { rows: [draftRow], pending: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /^Actions for / })).toBeDisabled();
  },
};

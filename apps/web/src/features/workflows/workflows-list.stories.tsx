import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { WorkflowsList, type WorkflowRow } from "./workflows-list";
import type { WorkflowRunHandlers } from "./workflow-run-dialog";

const rows: WorkflowRow[] = [
  { id: "estimate", name: "Unscheduled estimate reminder", rule: "Notify Ava Morgan at 5 PM after 1 business day if an approved estimate still has no visit.", status: "active", pendingCount: 2, allowedActions: ["pause", "resume", "delete"] },
  { id: "briefing", name: "Friday jobs briefing", rule: "Send me a summary of unscheduled jobs every Friday.", status: "paused", pendingCount: 0, allowedActions: ["pause", "resume", "delete"] },
];

const meta = {
  title: "Workflows/Workflows List",
  component: WorkflowsList,
  args: { rows, onView: fn(), onConfirm: fn(), onOpenAssistant: fn(), onRetry: fn() },
} satisfies Meta<typeof WorkflowsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const table = within(within(canvasElement).getByRole("table"));
  await expect(table.getByText(rows[0].rule!)).toBeVisible();
} };

export const Empty: Story = { args: { rows: [] } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const ViewOnly: Story = { args: { rows: rows.map((row) => ({ ...row, allowedActions: [] })) } };

export const ManageWorkflows: Story = {
  render: function Render(args) {
    const [workflows, setWorkflows] = useState(args.rows);
    return <WorkflowsList {...args} rows={workflows} onConfirm={async (row, action) => {
      await args.onConfirm(row, action);
      setWorkflows((current) => action === "delete"
        ? current.filter(({ id }) => id !== row.id)
        : current.map((item) => item.id === row.id ? { ...item, status: action === "pause" ? "paused" : "active" } : item));
    }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const name = "Unscheduled estimate reminder";
    const menu = async (action: string) => {
      await userEvent.click(await canvas.findByRole("button", { name: `Actions for ${name}` }));
      await userEvent.click(await screen.findByRole("menuitem", { name: action }));
    };

    await menu("Pause");
    const pause = within(await screen.findByRole("alertdialog"));
    await userEvent.click(pause.getByRole("button", { name: "Pause workflow" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(rows[0], "pause");

    await menu("Resume");
    const resume = within(await screen.findByRole("alertdialog"));
    await userEvent.click(resume.getByRole("button", { name: "Resume workflow" }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ ...rows[0], status: "paused" }, "resume");

    await menu("Delete");
    const deletion = within(await screen.findByRole("alertdialog"));
    const submit = deletion.getByRole("button", { name: "Delete workflow" });
    await expect(submit).toBeDisabled();
    await userEvent.type(deletion.getByRole("textbox", { name: /Type confirm to delete this workflow/ }), "confirm");
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await expect(args.onConfirm).toHaveBeenCalledWith(rows[0], "delete");
  },
};

const runnableRows = [{ ...rows[0], version: 1, canRunNow: true }, rows[1]];
const preview = { id: "reviewed-run", matchedCount: 3, actionSummary: "Send reminders for 3 approved estimates without a visit?" };
function manualRun(): WorkflowRunHandlers {
  return {
    onPreviewRun: fn(async () => preview),
    onRunNow: fn(async () => ({ completedCount: 3, skippedCount: 0 })),
  };
}
async function openRun(canvasElement: HTMLElement) {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole("button", { name: `Actions for ${rows[0].name}` }));
  await userEvent.click(await body.findByRole("menuitem", { name: "Run now" }));
  return within(await body.findByRole("alertdialog"));
}

export const RunNowConfirmation: Story = {
  args: { rows: runnableRows, manualRun: manualRun() },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await expect(await dialog.findByText(preview.actionSummary)).toBeVisible();
    await expect(args.manualRun!.onRunNow).not.toHaveBeenCalled();
    await userEvent.click(dialog.getByRole("button", { name: "Run now" }));
    await expect(args.manualRun!.onRunNow).toHaveBeenCalledTimes(1);
    await expect(args.manualRun!.onRunNow).toHaveBeenCalledWith(runnableRows[0], preview);
    await expect(await within(canvasElement).findByRole("status")).toHaveTextContent("3 actions completed.");
  },
};

export const RunNowCancel: Story = {
  args: { rows: runnableRows, manualRun: manualRun() },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await dialog.findByText(preview.actionSummary);
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(args.manualRun!.onRunNow).not.toHaveBeenCalled();
  },
};

export const RunNowNoMatches: Story = {
  args: { rows: runnableRows, manualRun: { ...manualRun(), onPreviewRun: fn(async () => ({ ...preview, matchedCount: 0 })) } },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await expect(await dialog.findByText("No records match this workflow right now.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Run now" })).toBeDisabled();
    await expect(args.manualRun!.onRunNow).not.toHaveBeenCalled();
  },
};

export const RunNowPreviewFailure: Story = {
  args: { rows: runnableRows, manualRun: { ...manualRun(), onPreviewRun: fn<WorkflowRunHandlers["onPreviewRun"]>().mockRejectedValueOnce(new globalThis.Error("Unavailable")).mockResolvedValue(preview) } },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await expect(await dialog.findByText("Couldn't check matching records. Try again.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Run now" })).toBeDisabled();
    await userEvent.click(dialog.getByRole("button", { name: "Try again" }));
    await expect(await dialog.findByText(preview.actionSummary)).toBeVisible();
    await expect(args.manualRun!.onRunNow).not.toHaveBeenCalled();
  },
};

export const RunNowExecutionFailure: Story = {
  args: { rows: runnableRows, manualRun: { ...manualRun(), onRunNow: fn(async () => { throw new globalThis.Error("Unavailable"); }) } },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await dialog.findByText(preview.actionSummary);
    await userEvent.click(dialog.getByRole("button", { name: "Run now" }));
    await expect(await dialog.findByRole("alert")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Run now" })).toBeEnabled();
    await expect(args.manualRun!.onRunNow).toHaveBeenCalledTimes(1);
  },
};

export const RunNowPending: Story = {
  args: { rows: runnableRows, manualRun: { ...manualRun(), onRunNow: fn<WorkflowRunHandlers["onRunNow"]>(() => new Promise(() => {})) } },
  play: async ({ canvasElement, args }) => {
    const dialog = await openRun(canvasElement);
    await dialog.findByText(preview.actionSummary);
    await userEvent.dblClick(dialog.getByRole("button", { name: "Run now" }));
    await expect(dialog.getByRole("button", { name: "Running…" })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(args.manualRun!.onRunNow).toHaveBeenCalledTimes(1);
  },
};

export const RunNowRechecksMatches: Story = {
  ...RunNowConfirmation,
  args: { rows: runnableRows, manualRun: { ...manualRun(), onRunNow: fn(async () => ({ completedCount: 2, skippedCount: 1 })) } },
  play: async ({ canvasElement }) => {
    const dialog = await openRun(canvasElement);
    await dialog.findByText(preview.actionSummary);
    await userEvent.click(dialog.getByRole("button", { name: "Run now" }));
    await expect(await within(canvasElement).findByRole("status")).toHaveTextContent("2 actions completed, 1 skipped because they no longer matched.");
  },
};

export const RunNowUnavailable: Story = {
  args: { rows: [rows[0], { ...rows[1], canRunNow: true }, { ...rows[0], id: "view-only", name: "View-only workflow", canRunNow: false, allowedActions: [] }], manualRun: manualRun() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    for (const row of args.rows) {
      await userEvent.click(canvas.getByRole("button", { name: `Actions for ${row.name}` }));
      await body.findByRole("menuitem", { name: "View workflow" });
      await expect(body.queryByRole("menuitem", { name: "Run now" })).not.toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    }
  },
};

export const RunNowMobile: Story = { ...RunNowNoMatches, globals: { viewport: { value: "phone", isRotated: false } }, args: { rows: runnableRows, manualRun: manualRun() }, play: async ({ canvasElement }) => {
  const dialog = await openRun(canvasElement);
  await expect(await dialog.findByText(preview.actionSummary)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Run now" })).toBeEnabled();
} };

export const MobileDescriptions: Story = { globals: { viewport: { value: "phone", isRotated: false } }, play: async ({ canvasElement }) => {
  const row = within(within(canvasElement).getByRole("article", { name: rows[0].name }));
  await expect(row.getByText(rows[0].rule!)).toBeVisible();
} };
export const LongDescription: Story = { args: { rows: [{ ...rows[0], rule: "Notify Alexandra Morgan-Williams at 5 PM after 30 business days if a new lead is still unassigned. This applies to leads created after the workflow was published; skip leads that are assigned, won, lost, or archived." }] } };

export const FreePlanUpgrade: Story = {
  args: { capacity: { plan: 'free', used: 2, limit: 2, canManageBilling: true }, billingHref: '/settings/billing?workspace=example' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), callout = c.getByRole('complementary', { name: 'Workflow plan' });
    await expect(within(callout).getByText('2 of 2 workflows used')).toBeVisible();
    await expect(within(callout).getByRole('link', { name: 'Upgrade for more workflows' })).toHaveAttribute('href', '/settings/billing?workspace=example');
    await expect(c.getByRole('table').compareDocumentPosition(callout) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    await expect(c.queryByLabelText('Rows per page')).not.toBeInTheDocument();
  },
};
export const StandardPlanUpgrade: Story = { args: { capacity: { plan: 'standard', used: 3, limit: 10, canManageBilling: true }, billingHref: '/settings/billing?workspace=example' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('Get 25 workflows with Premium.')).toBeVisible();
} };
export const PremiumPlan: Story = { args: { capacity: { plan: 'premium', used: 25, limit: 25, canManageBilling: true } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('complementary', { name: 'Workflow plan' })).not.toBeInTheDocument();
} };
export const OwnerUpgradeRequired: Story = { args: { capacity: { plan: 'free', used: 1, limit: 2, canManageBilling: false } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('Ask your workspace owner to upgrade.')).toBeVisible();
  await expect(within(canvasElement).queryByRole('link', { name: 'Upgrade for more workflows' })).not.toBeInTheDocument();
} };
export const MobilePlanUpgrade: Story = { ...FreePlanUpgrade, parameters: { viewport: { defaultViewport: 'mobile1' } } };

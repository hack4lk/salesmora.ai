import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { WorkflowsRoute } from "./workflows-route";
import type { WorkflowList } from "@salesmora/contracts";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const viewerId = "workflow-viewer";
const id = "00000000-0000-4000-8000-000000000002";
const initial: WorkflowList = {
  rows: [{ id, name: "Unscheduled estimate reminder", rule: "Notify the Office team when approved work needs a visit.",
    status: "active", version: 1, pendingCount: 0, canRunNow: true, notifications: { inApp: true, email: true }, allowedActions: ["pause", "delete"] }],
  total: 1, capacity: { plan: "free", used: 1, limit: 2, canManageBilling: true },
};
let source = initial;
let previewConflict = false;
const reads = fn(), writes = fn();
const previews = fn(), runs = fn();
const previewId = "00000000-0000-4000-8000-000000000003";
const meta = {
  title: "Workflows/Connected Workflows",
  component: WorkflowsRoute,
  args: { workspaceId, viewerId, initial, initialUpdatedAt: Date.now() },
  beforeEach: () => {
    source = initial;
    previewConflict = false;
    reads.mockClear();
    writes.mockClear();
    previews.mockClear();
    runs.mockClear();
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith("/api/workflows/notifications")) {
        const command = JSON.parse(String(init?.body));
        writes(command);
        source = { ...source, rows: source.rows.map(row => row.id === command.id ? { ...row, version: row.version + 1, notifications: command.notifications } : row) };
        return Response.json({ id: command.id, version: command.version + 1, notifications: command.notifications });
      }
      if (String(input).startsWith("/api/workflows/run")) {
        const command = JSON.parse(String(init?.body));
        if (String(input).startsWith("/api/workflows/run/preview")) {
          previews(command);
          if (previewConflict) {
            source = { ...initial, rows: initial.rows.map(row => ({ ...row, status: "paused", version: 2 })) };
            return Response.json({ error: "This workflow changed. Refresh and try again.", code: "conflict" }, { status: 409 });
          }
          return Response.json({ id: previewId, matchedCount: 3, actionSummary: "Send reminders for 3 approved estimates without a visit?" });
        }
        runs(command);
        return Response.json({ completedCount: 2, skippedCount: 1, pendingCount: 0 });
      }
      if (!String(input).startsWith("/api/workflows?")) return original(input, init);
      if (init?.method === "POST") {
        const command = JSON.parse(String(init.body));
        writes(command);
        return Response.json({ id, version: command.version + 1, status: command.action === "delete" ? "deleted" : command.action === "resume" ? "active" : "paused", pendingCount: 0 });
      }
      reads();
      return Response.json(source);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof WorkflowsRoute>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ServerSnapshot: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /^Workflows$/ })).toBeVisible();
    await expect(reads).not.toHaveBeenCalled();
  },
};

export const RunNowUsesReviewedScope: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Unscheduled estimate reminder" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Run now" }));
    const dialog = within(await body.findByRole("alertdialog"));
    await expect(await dialog.findByText("Send reminders for 3 approved estimates without a visit?")).toBeVisible();
    await expect(previews).toHaveBeenCalledTimes(1);
    await expect(previews).toHaveBeenCalledWith({ workspaceId, id, version: 1 });
    await expect(runs).not.toHaveBeenCalled();
    await userEvent.click(dialog.getByRole("button", { name: "Run now" }));
    await expect(await canvas.findByRole("status")).toHaveTextContent("2 actions completed, 1 skipped");
    await expect(runs).toHaveBeenCalledTimes(1);
    await expect(runs).toHaveBeenCalledWith({ workspaceId, id, version: 1, previewId });
    await expect(previews).toHaveBeenCalledTimes(1);
    await expect(reads).not.toHaveBeenCalled();
  },
};

export const RunNowRefreshesChangedWorkflow: Story = {
  beforeEach: () => { previewConflict = true; },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Unscheduled estimate reminder" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Run now" }));
    await expect(await canvas.findByText("Paused", { exact: true })).toBeVisible();
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(reads).toHaveBeenCalledTimes(1);
    await expect(runs).not.toHaveBeenCalled();
  },
};

export const SaveNotificationOptionsWithoutExtraRead: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Unscheduled estimate reminder" }));
    let dialog = within(await body.findByRole("dialog", { name: "Unscheduled estimate reminder" }));
    await expect(dialog.getByRole("checkbox", { name: "Email" })).toBeChecked();
    await userEvent.click(dialog.getByRole("checkbox", { name: "Email" }));
    await userEvent.click(dialog.getByRole("button", { name: "Save changes" }));
    await expect(await canvas.findByText("Notification options saved.")).toBeVisible();
    await expect(writes).toHaveBeenCalledWith({ workspaceId, id, version: 1, notifications: { inApp: true, email: false } });
    await expect(writes).toHaveBeenCalledTimes(1);
    await expect(reads).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Unscheduled estimate reminder" }));
    dialog = within(await body.findByRole("dialog", { name: "Unscheduled estimate reminder" }));
    await expect(dialog.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
    await expect(dialog.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  },
};

export const PauseWithoutExtraRead: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Unscheduled estimate reminder" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Pause" }));
    const dialog = within(await body.findByRole("alertdialog"));
    await userEvent.click(dialog.getByRole("button", { name: "Pause workflow" }));
    await waitFor(() => expect(canvas.getAllByText("Paused", { exact: true })[0]).toBeVisible());
    await expect(writes).toHaveBeenCalledWith({ workspaceId, id, version: 1, action: "pause" });
    const notice = await canvas.findByText("Workflow paused.");
    await expect(notice.compareDocumentPosition(canvas.getByRole("table")) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    await expect(reads).not.toHaveBeenCalled();
  },
};


const many: WorkflowList = { ...initial, total: 60, rows: Array.from({ length: 60 }, (_, index) => ({
  ...initial.rows[0], id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, name: `Workflow ${index + 1}`,
})) };

export const AllWorkflowsWithoutPaging: Story = {
  args: { initial: { ...many, capacity: { plan: 'premium', limit: 25, used: 60, canManageBilling: true } } },
  beforeEach: () => { source = many; },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^Workflow 60$/ })).toBeVisible();
    await expect(canvas.queryByLabelText('Rows per page')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('complementary', { name: 'Workflow plan' })).not.toBeInTheDocument();
  },
};

export const InlineDescription: Story = { render: args => <WorkflowsRoute {...args} initialUpdatedAt={Date.now()} />, play: async ({ canvasElement }) => {
  const table = within(within(canvasElement).getByRole("table"));
  await expect(table.getByText(initial.rows[0].rule)).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };

export const DeleteFreesCapacity: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.getByText('1 of 2 workflows used')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Actions for Unscheduled estimate reminder' }));
  await userEvent.click(await body.findByRole('menuitem', { name: 'Delete' }));
  const dialog = within(await body.findByRole('alertdialog'));
  await userEvent.type(dialog.getByRole('textbox'), 'confirm');
  await userEvent.click(dialog.getByRole('button', { name: 'Delete workflow' }));
  await expect(await c.findByText('0 of 2 workflows used')).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };

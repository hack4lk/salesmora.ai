import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import type { WorkflowDraft } from "@salesmora/contracts";
import { ConnectedWorkflowDraft } from "./connected-workflow-draft";

const ticket = {
  id: "00000000-0000-4000-8000-000000000001", workspaceId: "00000000-0000-4000-8000-000000000002",
  inputHash: "a".repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending",
  name: "Estimate awaiting a decision", rule: "Notify Ava after two business days if a sent estimate still has no recorded decision.",
  definition: { kind: "estimate_follow_up", businessDays: 2, recipientId: "ava", recipientName: "Ava Morgan",
    timezone: "America/New_York", notifications: { inApp: true, email: true } },
} satisfies WorkflowDraft;
const leadTicket: WorkflowDraft = { ...ticket, id: "00000000-0000-4000-8000-000000000003", name: "New lead still unassigned",
  rule: "Notify Ava Morgan at 5 PM after 1 business day if a new lead is still unassigned.",
  definition: { ...ticket.definition, kind: "unassigned_lead", businessDays: 1 } };
const visitTicket: WorkflowDraft = { ...ticket, id: "00000000-0000-4000-8000-000000000004", name: "Upcoming visit has no assignee",
  rule: "Notify Ava Morgan at 9 AM the day before a visit if nobody is assigned.",
  definition: { kind: "unassigned_visit", calendarDaysBefore: 1, localTime: "09:00", recipientId: "ava", recipientName: "Ava Morgan",
    timezone: "America/New_York", notifications: { inApp: true, email: true } } };
const materialsTicket: WorkflowDraft = { ...visitTicket, id: "00000000-0000-4000-8000-000000000005", name: "Visit materials need attention",
  definition: { ...visitTicket.definition, kind: "visit_materials", recipientId:"ava",recipientName:"Ava Morgan",calendarDaysBefore: 1, localTime: "08:00" } };
const editTicket: WorkflowDraft = { ...ticket, id: "00000000-0000-4000-8000-000000000006", editing: { id: "00000000-0000-4000-8000-000000000007", version: 4, status: "active" },
  definition: { ...ticket.definition, localTime: "08:15" } };
const writes = fn();
const meta = {
  title: "Workflows/Connected Workflow Draft", component: ConnectedWorkflowDraft,
  args: { ticket, disabled: false, onSaved: fn() },
  decorators: [(Story) => <main className="max-w-2xl bg-assistant-surface p-6"><Story /></main>],
  beforeEach: () => {
    writes.mockClear();
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith("/api/workflows/edit?")) return Response.json({ workflow: { id: editTicket.editing!.id, workspaceId: editTicket.workspaceId,
        version: 4, status: "active", name: editTicket.name, definition: ticket.definition }, recipients: [{ id: "ava", name: "Ava Morgan" }] });
      if (String(input) !== "/api/chat/workflows/proposals") return original(input, init);
      const command = JSON.parse(String(init?.body));
      writes(command);
      const source = [ticket, leadTicket, visitTicket, materialsTicket, editTicket].find(draft => draft.id === command.id);
      if (!source) return Response.json({ error: "Unavailable" }, { status: 404 });
      return Response.json({ draft: { ...source, definition: { ...source.definition, localTime: command.editValues?.localTime ?? command.localTime ?? ("localTime" in source.definition ? source.definition.localTime : undefined), notifications: command.editValues?.notifications ?? command.notifications ?? source.definition.notifications },
        state: command.decision === "confirm" ? "confirmed" : "cancelled" } });
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof ConnectedWorkflowDraft>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PublishFollowUp: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "In-app" }));
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith({ workspaceId: ticket.workspaceId, id: ticket.id, inputHash: ticket.inputHash,
    decision: "confirm", localTime: "17:00", notifications: { inApp: false, email: true } });
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ state: "confirmed", definition: expect.objectContaining({ kind: "estimate_follow_up" }) }));
} };

export const PublishLeadReminder: Story = { args: { ticket: leadTicket }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith({ workspaceId: leadTicket.workspaceId, id: leadTicket.id, inputHash: leadTicket.inputHash,
    decision: "confirm", localTime: "17:00", notifications: { inApp: true, email: true } });
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ state: "confirmed", definition: expect.objectContaining({ kind: "unassigned_lead" }) }));
} };

export const PublishVisitReminder: Story = { args: { ticket: visitTicket }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByText("Details", { exact: true })).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith({ workspaceId: visitTicket.workspaceId, id: visitTicket.id, inputHash: visitTicket.inputHash,
    decision: "confirm", localTime: "09:00", notifications: { inApp: true, email: true } });
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ state: "confirmed", definition: expect.objectContaining({ kind: "unassigned_visit" }) }));
} };

export const ChooseVisitTime: Story = { args: { ticket: visitTicket }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("America/New_York")).toBeVisible();
  fireEvent.change(canvas.getByLabelText("Send at"), { target: { value: "08:15" } });
  await expect(canvas.getByText("Notify Ava Morgan at 8:15 AM the day before a visit if nobody is assigned.")).toBeVisible();
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  await expect(writes).toHaveBeenCalledWith(expect.objectContaining({ decision: "confirm", localTime: "08:15" }));
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ definition: expect.objectContaining({ localTime: "08:15" }) }));
  await expect(canvas.getByLabelText("Send at")).toBeDisabled();
} };

export const RequireSendTime: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  fireEvent.change(canvas.getByLabelText("Send at"), { target: { value: "" } });
  await expect(canvas.getByRole("alert")).toHaveTextContent("Choose a valid send time.");
  await expect(canvas.getByRole("button", { name: "Publish workflow" })).toBeDisabled();
  await expect(writes).not.toHaveBeenCalled();
} };

export const PublishMaterialsReminder: Story = { args: { ticket: materialsTicket }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByLabelText("Send at")).toHaveValue("08:00");
  await userEvent.click(canvas.getByRole("button", { name: "Publish workflow" }));
  await expect(await canvas.findByText("Workflow published.")).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith(expect.objectContaining({ id: materialsTicket.id, decision: "confirm", localTime: "08:00", notifications: { inApp: true, email: true } }));
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ definition: expect.objectContaining({ kind: "visit_materials", localTime: "08:00" }) }));
} };

export const SaveAssistantEdit: Story = { args: { ticket: editTicket }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByLabelText("Name")).toHaveValue(editTicket.name);
  await expect(canvas.getByLabelText("Send at")).toHaveValue("08:15");
  const save = canvas.getByRole("button", { name: "Save changes" }); await expect(save).toBeEnabled();
  await userEvent.click(save);
  await expect(await canvas.findByText("Workflow updated.")).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith(expect.objectContaining({ id: editTicket.id, decision: "confirm", editValues: expect.objectContaining({ localTime: "08:15", recipientId: "ava" }) }));
  await expect(args.onSaved).toHaveBeenCalledWith(expect.objectContaining({ state: "confirmed", editing: editTicket.editing }));
} };

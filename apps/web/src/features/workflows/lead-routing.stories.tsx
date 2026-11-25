import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { WorkflowDraft } from "@salesmora/contracts";
import { WorkflowDraftCard } from "./workflow-draft-card";

const sourceId = "00000000-0000-4000-8000-000000000081";
const draft: WorkflowDraft = { id: "00000000-0000-4000-8000-000000000082", workspaceId: "00000000-0000-4000-8000-000000000083",
  inputHash: "a".repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: "pending", name: "Website lead routing",
  rule: "Assign new unassigned leads from Website quote form to Jordan Lee.", definition: { kind: "lead_routing", sourceId, sourceName: "Website quote form",
    recipientId: "jordan", recipientName: "Jordan Lee", timezone: "America/New_York", notifications: { inApp: true, email: true } } };
const meta = { title: "Workflows/Lead Routing", component: WorkflowDraftCard, args: { draft, routingOptions:{sources:[{id:sourceId,name:'Website quote form',collectsPostalCode:false}],members:[{id:'jordan',name:'Jordan Lee',workZipCodes:[]},{id:'taylor',name:'Taylor Reed',workZipCodes:[]}]}, onDecide: fn(async () => {}) },
  decorators: [Story => <main className="mx-auto max-w-2xl bg-canvas p-5"><Story /></main>],
} satisfies Meta<typeof WorkflowDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(draft.rule)).toBeVisible();
  await expect(c.queryByLabelText("Send at")).not.toBeInTheDocument();
  await expect(c.queryByLabelText("Delay (business days)")).not.toBeInTheDocument();
  await expect(c.getByText(/Existing owners stay unchanged/)).toBeVisible();
  await expect(c.getByRole("checkbox", { name: "In-app" })).toBeChecked();
  await expect(c.getByRole("checkbox", { name: "Email" })).toBeChecked();
} };
export const WithoutNotifications: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole("checkbox", { name: "In-app" })); await userEvent.click(c.getByRole("checkbox", { name: "Email" }));
  await expect(c.queryByRole("alert")).not.toBeInTheDocument(); await expect(c.getByRole("button", { name: "Publish workflow" })).toBeEnabled();
  await userEvent.click(c.getByRole("button", { name: "Publish workflow" }));
  await expect(args.onDecide).toHaveBeenCalledWith("confirm", undefined,undefined,undefined,undefined,undefined,undefined,undefined,expect.objectContaining({notifications:{inApp:false,email:false}}));
} };
export const Edit: Story = { args: { draft: { ...draft, editing: { id: draft.id, version: 1, status: "paused" } },
  recipients: [{ id: "jordan", name: "Jordan Lee" }, { id: "taylor", name: "Taylor Reed" }], sources: [{ id: sourceId, name: "Website quote form" }] },
play: async ({ canvasElement, args }) => { const c = within(canvasElement);
  await userEvent.click(c.getByRole("button",{name:"Change settings"}));await userEvent.click(c.getByRole("radio",{name:"Taylor Reed"}));
  await expect(c.getByRole("combobox", { name: "Source" })).toHaveValue(sourceId);
  await expect(c.getByText(/Assign new unassigned leads from Website quote form to Taylor Reed/)).toBeVisible();
  await expect(c.getByText(/This workflow will stay paused/)).toBeVisible();
  await userEvent.click(c.getByRole("button", { name: "Save changes" }));
  await expect(args.onDecide).toHaveBeenCalledWith("confirm", undefined,undefined,expect.objectContaining({sourceId,recipientId:"",businessDays:null,routing:{strategy:"one_teammate",memberIds:["taylor"],matchWorkZipCodes:false}}),undefined,undefined,undefined,undefined,expect.any(Object));
} };
export const Mobile: Story = { ...Review, globals: { viewport: { value: "phone", isRotated: false } } };

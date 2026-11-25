import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkflowBriefingRoute } from "./workflow-briefing-route";
const initial = { id: "00000000-0000-4000-8000-000000000001", workspaceId: "00000000-0000-4000-8000-000000000002",
  generatedAt: "2026-11-23T14:00:00.000Z", timezone: "America/New_York",
  counts: { inactiveLeads: 4, awaitingEstimates: 6, unscheduledJobs: 3, dueSoonJobs: 5 } };
const reads = fn(); let denied = false;
const meta = {
  title: "Workflows/Saved Briefing", component: WorkflowBriefingRoute,
  args: { viewerId: "briefing-viewer", workspaceId: initial.workspaceId, initial, initialUpdatedAt: Date.now() },
  decorators: [Story => <main className="mx-auto max-w-2xl p-5"><Story /></main>],
  beforeEach: () => {
    reads.mockClear(); denied = false; const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith("/api/workflows/briefings/")) return original(input, init);
      reads(); return denied ? Response.json({ error: "This briefing is unavailable." }, { status: 404 }) : Response.json(initial);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof WorkflowBriefingRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SavedSnapshot: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
  await expect(canvas.getByRole("link", { name: "View estimates awaiting a decision" })).toHaveAttribute("href", expect.stringContaining("/reports/estimates?workspace="));
  await expect(reads).not.toHaveBeenCalled();
} };
export const RechecksCurrentAccess: Story = { args: { initialUpdatedAt: 0 }, beforeEach: () => { denied = true; }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("status")).toHaveTextContent("This briefing is unavailable.");
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  denied = false;
  await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
  await expect(await canvas.findByRole("list")).toBeVisible();
} };
export const Mobile: Story = { ...SavedSnapshot, globals: { viewport: { value: "phone", isRotated: false } } };

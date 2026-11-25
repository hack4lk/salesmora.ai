import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { EstimateParentPicker } from "./estimate-parent-picker";

const meta = {
  title: "Estimates/EstimateParentPicker",
  component: EstimateParentPicker,
  parameters: { layout: "centered" },
  args: {
    workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
    viewerId: "estimate-parent-story-viewer",
    canReadLeads: true,
    canReadJobs: true,
    onSelect: fn(),
    search: async (type: "lead" | "job") => [{
      id: "22222222-2222-4222-8222-222222222222",
      number: type === "lead" ? "LD-1048" : "J-1038",
      name: "Jordan Lee",
      detail: "Kitchen remodel",
      status: "contacted",
    }],
  },
} satisfies Meta<typeof EstimateParentPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndChooseLead: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: /create estimate for lead LD-1048/i })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /create estimate for lead LD-1048/i }));
    await expect(args.onSelect).toHaveBeenCalledWith("lead", "22222222-2222-4222-8222-222222222222");
  },
};

export const FieldCanOnlyChooseAssignedJobs: Story = {
  args: { canReadLeads: false, canReadJobs: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("tab", { name: "Leads" })).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole("button", { name: /create estimate for job J-1038/i })).toBeVisible());
  },
};
export const CustomerRelatedParents: Story = {
  args: { customerId: "33333333-3333-4333-8333-333333333333" },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText(/Only records you can create estimates for are listed/)).toBeVisible();
    await userEvent.click(c.getByRole("tab", { name: "Jobs" }));
    await waitFor(() => expect(c.getByRole("button", { name: /create estimate for job J-1038/i })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: /create estimate for job J-1038/i }));
    await expect(args.onSelect).toHaveBeenCalledWith("job", "22222222-2222-4222-8222-222222222222");
  },
};
export const CustomerWithoutEligibleParents: Story = {
  args: { customerId: "33333333-3333-4333-8333-333333333333", canReadLeads: false, canReadJobs: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByRole("alert")).toBeVisible();
  },
};

export const KeyboardTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leads = canvas.getByRole("tab", { name: "Leads" }), jobs = canvas.getByRole("tab", { name: "Jobs" });
    await expect(leads).toHaveAttribute("aria-selected", "true");
    leads.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(jobs).toHaveFocus();
    await expect(jobs).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Jobs" })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("button", { name: /create estimate for job J-1038/i })).toBeVisible());
  },
};

const compactSearch = async (type: "lead" | "job") => Array.from({ length: 6 }, (_, index) => ({
  id: `22222222-2222-4222-8222-${String(index + 1).padStart(12, "0")}`,
  number: `${type === "lead" ? "LD" : "J"}-${1048 + index}`,
  name: ["Jordan Lee", "Avery Chen", "Morgan Ellis", "Sam Rivera", "Taylor Morgan", "Alex Reed"][index],
  detail: "Kitchen remodel", status: type === "lead" ? "contacted" : "scheduled",
}));
export const CompactLeads: Story = {
  args: { search: compactSearch }, parameters: { layout: "fullscreen" },
  decorators: [Story => <main className="mx-auto w-full max-w-4xl p-4"><Story /></main>],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const first = await canvas.findByRole("button", { name: /create estimate for lead LD-1048/i });
    await expect(first.getBoundingClientRect().height).toBeLessThanOrEqual(56);
    await userEvent.click(first);
    await expect(args.onSelect).toHaveBeenCalledWith("lead", "22222222-2222-4222-8222-000000000001");
  },
};
export const CompactJobs: Story = { ...CompactLeads, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("tab", { name: "Jobs" }));
  const first = await canvas.findByRole("button", { name: /create estimate for job J-1048/i });
  await expect(first.getBoundingClientRect().height).toBeLessThanOrEqual(56);
  await userEvent.click(first);
  await expect(args.onSelect).toHaveBeenCalledWith("job", "22222222-2222-4222-8222-000000000001");
} };
export const CompactMobile: Story = { ...CompactLeads, globals: { viewport: { value: "phone", isRotated: false } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole("button", { name: /create estimate for lead LD-1048/i })).toBeVisible();
  await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(canvasElement.ownerDocument.defaultView!.innerWidth);
} };

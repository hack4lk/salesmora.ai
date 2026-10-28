import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  estimateFieldCapabilities as field,
  estimateFixtures as rows,
  estimateOfficeCapabilities as office,
  estimateOwnerCapabilities as owner,
  estimatePreviewData as preview,
} from "../estimate-preview.data";
import { EstimateRowMenu } from "./estimate-row-menu";
import { estimateRowMenuData as copy } from "./estimate-row-menu.data";

const meta = {
  title: "Estimates/EstimateRowMenu",
  component: EstimateRowMenu,
  args: {
    name: rows[0].name,
    status: rows[0].status,
    capabilities: owner,
    onAction: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimateRowMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole("menuitem", {
          name: copy.actions["delete-draft"],
        }),
      ).toBeVisible(),
    );
  },
};
export const Sent: Story = { args: { status: "sent" } };
export const Published: Story = { args: { status: "published" } };
export const Accepted: Story = { args: { status: "accepted" } };
export const Declined: Story = { args: { status: "declined" } };
export const Expired: Story = { args: { status: "expired" } };
export const Superseded: Story = { args: { status: "superseded" } };
export const Voided: Story = { args: { status: "void" } };
export const Archived: Story = { args: { status: "declined", archived: true } };
export const Office: Story = {
  args: { status: "sent", capabilities: office },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole("menuitem", {
        name: copy.actions["delete-draft"],
      }),
    ).not.toBeInTheDocument();
  },
};
export const Field: Story = {
  args: { status: "declined", capabilities: field },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    const menu = within(canvasElement.ownerDocument.body);
    await expect(menu.queryByRole("menuitem", { name: copy.actions.archive })).not.toBeInTheDocument();
    await expect(menu.queryByRole("menuitem", { name: copy.actions.void })).not.toBeInTheDocument();
  },
};


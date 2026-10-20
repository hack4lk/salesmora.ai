import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerExportDraftCard } from "./customer-export-draft-card";
import { customerExportDraftCardData as copy } from "./customer-export-draft-card.data";
import { customerDraftFixtures as fixtures } from "../customer-draft-card/customer-draft-card.data";
const meta = {
  title: "Assistant/CustomerExportDraftCard",
  component: CustomerExportDraftCard,
  args: {
    count: 5,
    scope: fixtures.scope,
    columns: fixtures.columns,
    onDownload: fn(async () => {}),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4">
        <p className="text-sm text-muted">{fixtures.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CustomerExportDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const Forbidden: Story = { args: { state: "forbidden" } };
export const Expired: Story = { args: { state: "expired" } };
export const Confirmed: Story = { args: { state: "confirmed" } };
export const Zero: Story = { args: { count: 0 } };
export const OverLimit: Story = { args: { count: 50001 } };
export const RequestFailure: Story = {
  args: {
    onDownload: fn(async () => {
      throw new Error("preview");
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.download }));
    await expect(c.getByRole("alert")).toBeVisible();
  },
};

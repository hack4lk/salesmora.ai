import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DuplicateMatchBanner } from "./duplicate-match-banner";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
} from "../customer-preview.data";

const meta = {
  title: "Customers/DuplicateMatchBanner",
  component: DuplicateMatchBanner,
  args: {
    matches: [
      {
        id: rows[0].id,
        name: rows[0].name,
        number: rows[0].number,
        reason: "email",
      },
    ],
    onUseExisting: fn(),
    onCreateAnyway: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">
          {preview.notice}
        </p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof DuplicateMatchBanner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const PhoneMatch: Story = {
  args: {
    matches: [
      {
        id: rows[1].id,
        name: rows[1].name,
        number: rows[1].number,
        reason: "phone",
      },
    ],
  },
};
export const Multiple: Story = {
  args: {
    matches: rows.slice(0, 3).map((row) => ({
      id: row.id,
      name: row.name,
      number: row.number,
      reason: "name",
    })),
  },
};
export const Pending: Story = { args: { disabled: true } };
export const UseExisting: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: /Use existing/ }),
    );
    await expect(args.onUseExisting).toHaveBeenCalledWith(rows[0].id);
  },
};

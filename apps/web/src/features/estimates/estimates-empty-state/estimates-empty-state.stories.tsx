import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { estimatePreviewData as preview } from "../estimate-preview.data";
import { EstimatesEmptyState } from "./estimates-empty-state";

const meta = {
  title: "Estimates/EstimatesEmptyState",
  component: EstimatesEmptyState,
  args: { onAdd: fn(), onClear: fn() },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EstimatesEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filtered: Story = { args: { filtered: true } };
export const ReadOnly: Story = { args: { onAdd: undefined } };


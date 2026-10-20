import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerTimeline } from "./customer-timeline";
import {
  customerPreviewData as preview,
  customerEvents as events,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerTimeline",
  component: CustomerTimeline,
  args: { events },
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
} satisfies Meta<typeof CustomerTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { events: [] } };
export const Loading: Story = { args: { loading: true, events: [] } };
export const Error: Story = {
  args: { error: preview.mockFailure, onRetry: fn() },
};
export const Paged: Story = {
  args: { total: 42, onLoadMore: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onLoadMore).toHaveBeenCalledOnce();
  },
};

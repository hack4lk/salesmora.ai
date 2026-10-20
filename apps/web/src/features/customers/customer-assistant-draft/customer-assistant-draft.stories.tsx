import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerAssistantDraft } from "./customer-assistant-draft";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
} from "../customer-preview.data";
import { customerAssistantDraftData as copy } from "./customer-assistant-draft.data";
const meta = {
  title: "Customers/CustomerAssistantDraft",
  component: CustomerAssistantDraft,
  args: { onDraft: fn(async () => {}), onApply: fn() },
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
} satisfies Meta<typeof CustomerAssistantDraft>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Thinking: Story = { args: { state: "drafting" } };
export const PartialFields: Story = {
  args: { draft: { email: rows[0].email, phone: rows[0].phone } },
};
export const Empty: Story = { args: { state: "empty" } };
export const Error: Story = { args: { state: "error" } };
export const Apply: Story = {
  ...PartialFields,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: copy.apply }),
    );
    await expect(args.onApply).toHaveBeenCalledWith(args.draft);
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ContextChip } from "@salesmora/ui";
import { customerContextData as copy } from "./customer-context.data";
import {
  customerPreviewData,
  customerFixtures,
} from "../customer-preview.data";
const meta = {
  title: "Customers/CustomerContext",
  component: ContextChip,
  args: {
    label: `${customerFixtures[0].name} (${customerFixtures[0].number})`,
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-assistant-surface p-6">
        <h1 className="mb-6 mt-0 text-xl font-semibold text-assistant-foreground">
          {copy.title}
        </h1>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof ContextChip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ListFilters: Story = { args: { label: copy.list } };
export const LongName: Story = {
  args: {
    label: `${customerPreviewData.longName} (${customerFixtures[0].number})`,
  },
};
export const ReadOnly: Story = { args: { onClear: undefined } };

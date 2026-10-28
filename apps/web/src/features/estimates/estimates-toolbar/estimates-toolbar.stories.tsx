import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import {
  estimateFixtures as rows,
  estimatePreviewData as preview,
} from "../estimate-preview.data";
import { defaultEstimateFilters, EstimatesToolbar } from "./estimates-toolbar";

const meta = {
  title: "Estimates/EstimatesToolbar",
  component: EstimatesToolbar,
  args: {
    value: defaultEstimateFilters,
    members: preview.members,
    shownCount: 8,
    totalCount: 10,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm leading-6 text-muted">{preview.notice}</p>
        <Story />
      </main>
    ),
  ],
  render: function Preview(args) {
    const [value, setValue] = useState(args.value);
    return (
      <EstimatesToolbar
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof EstimatesToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filtered: Story = {
  args: {
    value: {
      ...defaultEstimateFilters,
      search: rows[0].customerName,
      status: "sent",
      owner: preview.members[0].id,
      related: "lead",
      includeHidden: true,
    },
    shownCount: 1,
  },
};
export const NoResults: Story = { args: { shownCount: 0 } };
export const Disabled: Story = { args: { disabled: true } };
export const SearchAndClear: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("searchbox"), { target: { value: rows[0].customerName } });
    await expect(canvas.getByRole("searchbox")).toHaveValue(rows[0].customerName);
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(canvas.getByRole("searchbox")).toHaveValue("");
  },
};

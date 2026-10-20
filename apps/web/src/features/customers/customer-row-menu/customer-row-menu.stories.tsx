import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { CustomerRowMenu } from "./customer-row-menu";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerOwnerCapabilities as owner,
  customerOfficeCapabilities as office,
  customerReadOnlyCapabilities as readOnly,
  customerFieldCapabilities as field,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerRowMenu",
  component: CustomerRowMenu,
  args: { name: rows[0].name, capabilities: owner, onAction: fn() },
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
} satisfies Meta<typeof CustomerRowMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole("menuitem", {
          name: "Delete customer",
        }),
      ).toBeVisible(),
    );
  },
};
export const Office: Story = {
  args: { capabilities: office },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole("menuitem", {
        name: "Delete customer",
      }),
    ).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = { args: { capabilities: readOnly } };
export const Field: Story = { args: { capabilities: field } };
export const Archived: Story = { args: { archived: true } };

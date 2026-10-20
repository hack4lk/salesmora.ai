import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { CustomerContactCard } from "./customer-contact-card";
import {
  customerPreviewData as preview,
  customerFixtures as rows,
  customerMembers as members,
} from "../customer-preview.data";
import { RelatedCustomerContact } from "./customer-contact-card";
const meta = {
  title: "Customers/CustomerContactCard",
  component: CustomerContactCard,
  args: { customer: rows[0], members },
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
} satisfies Meta<typeof CustomerContactCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Business: Story = { args: { customer: rows[2] } };
export const MissingDetails: Story = {
  args: {
    customer: {
      ...rows[0],
      email: "",
      phone: "",
      location: "",
      ownerId: "",
      internalNotes: "",
    },
  },
};
export const RelatedOnly: Story = {
  render: () => (
    <RelatedCustomerContact
      customer={{
        name: rows[0].name,
        number: rows[0].number,
        email: rows[0].email,
        phone: rows[0].phone,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText(rows[0].internalNotes),
    ).not.toBeInTheDocument();
  },
};

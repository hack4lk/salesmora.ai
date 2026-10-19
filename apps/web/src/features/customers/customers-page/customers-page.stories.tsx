import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { CustomersPagePreview } from "./customers-page";
import { customersPageData as copy } from "./customers-page.data";
import { customerFixtures as rows } from "../customer-preview.data";
const meta = {
  title: "Customers/CustomersPage",
  component: CustomersPagePreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CustomersPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Admin: Story = { args: { role: "admin" } };
export const Office: Story = {
  args: { role: "office" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.queryByRole("button", { name: copy.export }),
    ).not.toBeInTheDocument();
    await expect(c.queryByRole("switch")).not.toBeInTheDocument();
  },
};
export const Field: Story = {
  args: { role: "field" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText(rows[0].email)).not.toBeInTheDocument();
    await expect(c.queryByRole("searchbox")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = { args: { role: "readOnly" } };
export const Empty: Story = { args: { empty: true } };
export const FilteredEmpty: Story = { args: { filteredEmpty: true } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Drawer: Story = { args: { initialOverlay: "drawer" } };
export const Add: Story = { args: { initialOverlay: "add" } };
export const Edit: Story = { args: { initialOverlay: "edit" } };
export const Duplicate: Story = { args: { initialOverlay: "duplicate" } };
export const Profile: Story = { args: { initialProfile: true } };
export const ProfileNotes: Story = {
  args: { initialProfile: true, initialTab: "notes" },
};
export const AssistantReview: Story = { args: { initialOverlay: "assistant" } };
export const ManyCustomers: Story = { args: { many: true } };
export const SearchAndClear: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("searchbox"), copy.missingSearch);
    await waitFor(() =>
      expect(
        c.getByRole("heading", { name: "No customers match your filters" }),
      ).toBeVisible(),
    );
    await userEvent.click(c.getByRole("button", { name: "Clear filters" }));
    await waitFor(() =>
      expect(
        c.queryByRole("heading", { name: "No customers match your filters" }),
      ).not.toBeInTheDocument(),
    );
  },
};
export const AddCustomer: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole("button", { name: copy.add }));
    await userEvent.type(
      body.getByRole("textbox", { name: /^Full name/ }),
      copy.newCustomerName,
    );
    await userEvent.click(body.getByRole("button", { name: copy.add }));
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await expect(c.getByRole("status", { name: "Success" })).toBeVisible();
  },
};
export const KeyboardDrawerToProfile: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const row =
      c.queryByRole("button", { name: "Open record · Jordan Lee" }) ??
      c.getByRole("row", { name: /Jordan Lee/ });
    row.focus();
    await userEvent.keyboard("{Enter}");
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.click(
      body.getByRole("button", { name: "Open full profile" }),
    );
    await waitFor(() =>
      expect(
        c.getByRole("heading", { level: 1, name: rows[0].name }),
      ).toBeVisible(),
    );
  },
};

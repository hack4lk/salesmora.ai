import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CustomerNotes } from "./customer-notes";
import {
  customerPreviewData as preview,
  customerNotes as notes,
} from "../customer-preview.data";

const meta = {
  title: "Customers/CustomerNotes",
  component: CustomerNotes,
  args: { notes, canAdd: true, onAdd: fn(async () => {}) },
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
} satisfies Meta<typeof CustomerNotes>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { notes: [] } };
export const ReadOnly: Story = { args: { canAdd: false } };
export const SaveFailure: Story = {
  args: {
    onAdd: fn(async () => {
      throw new globalThis.Error("preview");
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox"), preview.newNote);
    await userEvent.click(c.getByRole("button"));
    await expect(c.getByRole("alert")).toBeVisible();
    await expect(c.getByRole("textbox")).toHaveValue(preview.newNote);
  },
};
export const AddNote: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox"), preview.newNote);
    await userEvent.click(c.getByRole("button"));
    await expect(args.onAdd).toHaveBeenCalledWith(preview.newNote);
    await expect(c.getByRole("textbox")).toHaveValue("");
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EstimatePaymentOption, type EstimatePaymentOptionProps } from "./estimate-payment-option";
import { estimatePaymentOptionData as c } from "./estimate-payment-option.data";

function EditablePreview(args: EstimatePaymentOptionProps) {
  const [value, setValue] = useState(args.value);
  return <EstimatePaymentOption {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />;
}
const meta = {
  title: "Estimates/EstimatePaymentOption",
  component: EstimatePaymentOption,
  args: { value: c.stories.link },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-3xl gap-4 p-4 sm:p-8">
    <p className="m-0 text-sm text-muted print:hidden">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimatePaymentOption>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CustomerCallout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: `${c.action} — ${c.external}` });
    await expect(link).toHaveAttribute("href", c.stories.link);
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    await expect(canvas.getByRole("link", { name: c.stories.link })).toBeVisible();
    const callout = canvas.getByRole("region", { name: c.title });
    await expect(callout.querySelectorAll("p")).toHaveLength(1);
    await expect(within(callout).getAllByRole("link")).toHaveLength(2);
    const buttonBounds = link.getBoundingClientRect();
    const urlBounds = canvas.getByRole("link", { name: c.stories.link }).getBoundingClientRect();
    await expect(urlBounds.left).toBeGreaterThan(buttonBounds.right);
  },
};
export const OptionalField: Story = {
  args: { value: "", canEdit: true, onChange: fn() },
  render: args => <EditablePreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: c.field });
    await userEvent.type(input, c.stories.link);
    await expect(input).toHaveValue(c.stories.link);
    await expect(args.onChange).toHaveBeenLastCalledWith(c.stories.link);
  },
};
export const NotProvided: Story = {
  args: { value: "" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("heading", { name: c.title })).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const InvalidLink: Story = {
  args: { value: c.stories.unsafeLink },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.invalid);
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const FieldError: Story = {
  args: { value: "http://payments.example.test/pay", canEdit: true, showErrors: true, onChange: fn() },
};
export const Pending: Story = {
  args: { canEdit: true, pending: true, onChange: fn() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: c.field })).toBeDisabled();
  },
};
export const LongLink: Story = { args: { value: c.stories.longLink } };
export const Mobile: Story = {
  globals: { viewport: { value: "phone", isRotated: false } }, play: CustomerCallout.play,
};

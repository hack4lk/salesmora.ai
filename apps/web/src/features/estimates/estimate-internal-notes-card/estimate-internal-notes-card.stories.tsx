import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import { EstimateInternalNotesCard, type EstimateInternalNotesCardProps } from "./estimate-internal-notes-card";
import { estimateInternalNotesCardData as c } from "./estimate-internal-notes-card.data";
import { validateEstimateInternalNotes } from "./estimate-internal-notes-card.validation";

function InternalNotesPreview({
  replaceable = false, ...args
}: EstimateInternalNotesCardProps & { replaceable?: boolean }) {
  const [value, setValue] = useState(args.value);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  const error = reviewed ? validateEstimateInternalNotes(value) : args.error;
  const editable = args.canEdit && (args.status ?? "draft") === "draft" && !!args.onChange;
  return (
    <form noValidate className="grid min-w-0 gap-4" onSubmit={(event) => {
      event.preventDefault();
      setReviewed(true);
      const result = validateEstimateInternalNotes(value);
      setNotice(result ? "" : c.stories.valid);
      if (result) event.currentTarget.querySelector<HTMLElement>('[name="internalNotes"]')?.focus();
    }}>
      <EstimateInternalNotesCard {...args} value={value} error={error}
        onChange={args.onChange ? (next) => {
          setValue(next);
          setNotice("");
          args.onChange?.(next);
        } : undefined} />
      {editable && <button type="submit" disabled={args.pending} className={`${estimatePrimary} justify-self-start`}>{c.stories.review}</button>}
      {replaceable && <button type="button" className={`${estimateButton} justify-self-start`} onClick={() => {
        setValue(c.stories.replacement);
        setNotice("");
      }}>{c.stories.replace}</button>}
      {notice && <p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    </form>
  );
}

const meta = {
  title: "Estimates/EstimateInternalNotesCard",
  component: EstimateInternalNotesCard,
  args: { value: c.stories.value, canEdit: true, onChange: fn() },
  render: (args) => <InternalNotesPreview {...args} />,
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof EstimateInternalNotesCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveValue(c.stories.value);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveAttribute("maxlength", "5000");
    await expect(canvas.getByRole("region", { name: c.title })).toHaveAccessibleDescription(c.privacy);
    await expect(canvas.getByText(c.badge)).toBeVisible();
  },
};
export const EditNotes: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.optionalLabel }), { target: { value: c.stories.editedValue } });
    await expect(args.onChange).toHaveBeenCalledWith(c.stories.editedValue);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveValue(c.stories.editedValue);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.valid);
    await expect(canvas.getByText(c.privacy)).toBeVisible();
  },
};
export const Empty: Story = {
  args: { value: "" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.valid);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).not.toBeInvalid();
  },
};
export const CharacterLimit: Story = {
  args: { value: "N".repeat(c.limit) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveValue("N".repeat(c.limit));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.valid);
  },
};
export const ValidationError: Story = {
  args: { value: "N".repeat(c.limit + 1), error: c.tooLong },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toBeInvalid();
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveAccessibleDescription(c.tooLong);
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveValue("N".repeat(c.limit + 1));
  },
};
export const ValidationRecovery: Story = {
  args: { value: "N".repeat(c.limit + 1) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    const field = canvas.getByRole("textbox", { name: c.optionalLabel });
    await expect(field).toHaveFocus();
    await expect(field).toBeInvalid();
    fireEvent.change(field, { target: { value: c.stories.editedValue } });
    await expect(field).not.toBeInvalid();
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.valid);
  },
};
export const HostError: Story = { args: { error: c.stories.fieldError } };
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: c.optionalLabel });
    await expect(field).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.stories.review })).toBeDisabled();
    fireEvent.change(field, { target: { value: c.stories.editedValue } });
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(field).toHaveValue(c.stories.value);
    await expect(canvas.getByText(c.privacy)).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { canEdit: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("definition").textContent).toBe(args.value);
    await expect(canvas.getByRole("region", { name: c.title })).toHaveAccessibleDescription(c.privacy);
    await expect(canvas.getByText(c.badge)).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const DefaultPermissions: Story = { args: { canEdit: undefined }, play: ReadOnly.play };
export const Sent: Story = { args: { status: "sent" }, play: ReadOnly.play };
export const Published: Story = { args: { status: "published" }, play: ReadOnly.play };
export const Accepted: Story = { args: { status: "accepted" }, play: ReadOnly.play };
export const Declined: Story = { args: { status: "declined" }, play: ReadOnly.play };
export const Expired: Story = { args: { status: "expired" }, play: ReadOnly.play };
export const Superseded: Story = { args: { status: "superseded" }, play: ReadOnly.play };
export const Voided: Story = { args: { status: "void" }, play: ReadOnly.play };
export const NoChangeHandler: Story = { args: { onChange: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.getByRole("definition").textContent).toBe(c.stories.value);
} };
export const ReadOnlyEmpty: Story = {
  args: { canEdit: false, value: " \n " },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("definition")).toHaveTextContent(c.notProvided);
  },
};
export const ReadOnlyInvalid: Story = {
  args: { canEdit: false, value: "N".repeat(c.limit + 1), error: c.tooLong },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.tooLong);
  },
};
export const PlainText: Story = {
  args: { canEdit: false, value: c.stories.literalText },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("definition").textContent).toBe(c.stories.literalText);
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};
export const ControlledUpdate: Story = {
  render: (args) => <InternalNotesPreview {...args} replaceable />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.replace }));
    await expect(canvas.getByRole("textbox", { name: c.optionalLabel })).toHaveValue(c.stories.replacement);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: c.optionalLabel });
    await userEvent.click(field);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: c.stories.review })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(field).toHaveFocus();
    await expect(field.closest(".MuiOutlinedInput-root")).toHaveClass("has-focus-visible:focus-ring");
  },
};
export const PrintHidden: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("region", { name: c.title })).toHaveClass("print:hidden");
  },
};
export const LongReadOnly: Story = { args: { canEdit: false, value: "N".repeat(c.limit) } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };

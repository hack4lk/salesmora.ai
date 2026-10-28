import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimatePreviewData as preview } from "../estimate-preview.data";
import { estimatePrimary } from "../estimate-ui";
import { EstimateDetailsCard, type EstimateDetailsCardProps } from "./estimate-details-card";
import { estimateDetailsCardData as copy } from "./estimate-details-card.data";
import { validateEstimateDetails, type EstimateDetailsValidationOptions } from "./estimate-details-card.validation";

function DetailsPreview({
  purpose = "draft",
  requireServiceAddress = false,
  ...args
}: EstimateDetailsCardProps & EstimateDetailsValidationOptions) {
  const [value, setValue] = useState(args.value);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  const errors = reviewed ? validateEstimateDetails(value, { purpose, requireServiceAddress }) : args.errors;
  return (
    <form noValidate className="grid min-w-0 gap-4" onSubmit={(event) => {
      event.preventDefault();
      setReviewed(true);
      const result = validateEstimateDetails(value, { purpose, requireServiceAddress });
      setNotice(Object.keys(result).length ? "" : purpose === "send" ? copy.stories.validSend : copy.stories.validDraft);
      const firstInvalidField = Object.keys(result)[0];
      if (firstInvalidField) {
        event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      }
    }}>
      <EstimateDetailsCard {...args} value={value} errors={errors} onChange={(next) => {
        setValue(next);
        setNotice("");
        args.onChange?.(next);
      }} />
      {args.canEdit && (args.status ?? "draft") === "draft" && (
        <button type="submit" className={`${estimatePrimary} justify-self-start`} disabled={args.pending}>
          {purpose === "send" ? copy.stories.send : copy.stories.save}
        </button>
      )}
      {notice && <p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    </form>
  );
}

const meta = {
  title: "Estimates/EstimateDetailsCard",
  component: EstimateDetailsCard,
  args: {
    value: copy.stories.value,
    number: copy.stories.number,
    members: preview.members,
    canEdit: true,
    canAssignOwner: true,
    onChange: fn(),
  },
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p>
      <Story />
    </main>
  )],
  render: (args) => <DetailsPreview {...args} />,
} satisfies Meta<typeof EstimateDetailsCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.stories.number)).toBeVisible();
    await expect(c.getByRole("textbox", { name: /^Estimate name/ })).toHaveAttribute("maxlength", "120");
    await expect(c.queryByRole("textbox", { name: copy.number })).not.toBeInTheDocument();
  },
};
export const Create: Story = { args: { number: null, value: { ...copy.stories.value, name: "" } } };
export const Revision: Story = { args: { revision: 2 } };
export const DraftWithoutRecipient: Story = {
  args: { value: { ...copy.stories.value, recipientName: "", recipientEmail: "", serviceAddress: "" } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.stories.save }));
    await expect(c.getByRole("status")).toHaveTextContent(copy.stories.validDraft);
  },
};
export const Field: Story = {
  args: { canAssignOwner: false },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("combobox")).not.toBeInTheDocument();
    fireEvent.change(c.getByRole("textbox", { name: /^Estimate name/ }), { target: { value: copy.stories.newName } });
    await expect(args.onChange).toHaveBeenCalledWith({ ...copy.stories.value, name: copy.stories.newName });
  },
};
export const AssignOwner: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByRole("combobox", { name: copy.owner }), preview.members[1].id);
    await expect(args.onChange).toHaveBeenCalledWith({ ...copy.stories.value, ownerId: preview.members[1].id });
  },
};
export const ValidationErrors: Story = {
  args: {
    value: { ...copy.stories.value, name: "", recipientEmail: copy.stories.invalidEmail },
    errors: { name: copy.errors.name, recipientEmail: copy.errors.recipientEmail },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("textbox", { name: /^Estimate name/ })).toBeInvalid();
    await expect(c.getByRole("textbox", { name: /^Recipient email/ })).toHaveAccessibleDescription(copy.errors.recipientEmail);
  },
};
export const ValidationRecovery: Story = {
  args: { value: { ...copy.stories.value, name: "", recipientEmail: copy.stories.invalidEmail } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.stories.save }));
    await expect(c.getByText(copy.errors.name)).toBeVisible();
    await expect(c.getByRole("textbox", { name: /^Estimate name/ })).toHaveFocus();
    fireEvent.change(c.getByRole("textbox", { name: /^Estimate name/ }), { target: { value: copy.stories.newName } });
    fireEvent.change(c.getByRole("textbox", { name: /^Recipient email/ }), { target: { value: copy.stories.newEmail } });
    await userEvent.click(c.getByRole("button", { name: copy.stories.save }));
    await expect(c.getByRole("status")).toHaveTextContent(copy.stories.validDraft);
    await expect(c.queryByText(copy.errors.recipientEmail)).not.toBeInTheDocument();
  },
};
export const SendRequirements: Story = {
  args: { value: { ...copy.stories.value, recipientName: "", recipientEmail: "", serviceAddress: "" } },
  render: (args) => <DetailsPreview {...args} purpose="send" requireServiceAddress />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.stories.send }));
    for (const message of [copy.errors.recipientName, copy.errors.recipientEmail, copy.errors.serviceAddress]) {
      await expect(c.getByText(message)).toBeVisible();
    }
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const input of c.getAllByRole("textbox")) await expect(input).toBeDisabled();
    await expect(c.getByRole("combobox")).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ReadOnly: Story = { args: { canEdit: false } };
export const Sent: Story = { args: { status: "sent" } };
export const Published: Story = { args: { status: "published" } };
export const Accepted: Story = { args: { status: "accepted" } };
export const Declined: Story = { args: { status: "declined" } };
export const Expired: Story = { args: { status: "expired" } };
export const Superseded: Story = { args: { status: "superseded" } };
export const Voided: Story = { args: { status: "void" } };
export const LockedIgnoresEditGrant: Story = {
  args: { status: "sent", canEdit: true, canAssignOwner: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(c.queryByRole("combobox")).not.toBeInTheDocument();
    await expect(c.queryByRole("button")).not.toBeInTheDocument();
    await expect(c.getByText(copy.stories.value.serviceAddress)).toBeVisible();
  },
};
export const UnknownOwner: Story = { args: { members: [] } };
export const ReadOnlyMissingDetails: Story = {
  args: {
    status: "expired",
    value: { ...copy.stories.value, recipientName: "", recipientEmail: "", serviceAddress: " " },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.confirmAddress)).toBeVisible();
  },
};
export const LongContent: Story = {
  args: {
    value: {
      ...copy.stories.value,
      name: copy.stories.longName,
      recipientName: copy.stories.longRecipient,
      serviceAddress: copy.stories.longAddress,
    },
  },
};
export const LongReadOnly: Story = { args: { ...LongContent.args, canEdit: false } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };

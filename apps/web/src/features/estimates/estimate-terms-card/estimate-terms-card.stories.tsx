import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { calculateEstimateTotals, type EstimateItemInput, type EstimateTotalsValues } from "@salesmora/domain";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimatePrimary, estimateButton } from "../estimate-ui";
import { estimateTotalsData as totalsCopy } from "../estimate-totals/estimate-totals.data";
import { EstimateTermsCard, type EstimateTermsCardProps } from "./estimate-terms-card";
import { estimateTermsCardData as c } from "./estimate-terms-card.data";
import { validateEstimateTerms, type EstimateTermsValidationOptions } from "./estimate-terms-card.validation";

const totals: EstimateTotalsValues = { discount: { type: "percent", value: "10" }, taxRate: "8.875" };
const initialCalculation = calculateEstimateTotals({ items: totalsCopy.stories.items, ...totals, deposit: c.stories.value.deposit });

function TermsPreview({
  purpose = "draft", today = c.stories.today, sourceItems = totalsCopy.stories.items, sourceTotals = totals,
  allowReduction = false, ...args
}: EstimateTermsCardProps & {
  purpose?: EstimateTermsValidationOptions["purpose"];
  today?: string;
  sourceItems?: readonly EstimateItemInput[];
  sourceTotals?: EstimateTotalsValues;
  allowReduction?: boolean;
}) {
  const [value, setValue] = useState(args.value);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  const [reduced, setReduced] = useState(false);
  const calculation = calculateEstimateTotals({
    items: reduced ? [{ description: "Reduced sample work", quantity: "1", unitPrice: "100", taxable: false, included: false }] : sourceItems,
    ...(reduced ? { discount: { type: "none" as const }, taxRate: "0" } : sourceTotals),
    deposit: value.deposit,
  });
  const errors = reviewed ? validateEstimateTerms(value, { purpose, today }) : args.errors;
  const editable = args.canEdit && (args.status ?? "draft") === "draft" && !!args.onChange;
  return (
    <form noValidate className="grid min-w-0 gap-4" onSubmit={(event) => {
      event.preventDefault();
      setReviewed(true);
      const result = validateEstimateTerms(value, { purpose, today });
      const field = Object.keys(result)[0] ?? (calculation.errors.deposit ? "deposit" : undefined);
      setNotice(field ? "" : purpose === "draft" ? c.stories.validDraft : c.stories.validShare);
      if (field) event.currentTarget.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
    }}>
      <EstimateTermsCard {...args} value={value} calculation={calculation} errors={errors}
        onChange={args.onChange ? (next) => {
          setValue(next);
          setNotice("");
          args.onChange?.(next);
        } : undefined} />
      {editable && <button type="submit" disabled={args.pending} className={`${estimatePrimary} justify-self-start`}>
        {purpose === "draft" ? c.stories.reviewDraft : purpose === "send" ? c.stories.reviewSend : c.stories.reviewPublish}
      </button>}
      {allowReduction && <button type="button" className={`${estimateButton} justify-self-start`} onClick={() => {
        setReduced(true);
        setNotice("");
      }}>{c.stories.reduceTotal}</button>}
      {notice && <p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    </form>
  );
}

const meta = {
  title: "Estimates/EstimateTermsCard",
  component: EstimateTermsCard,
  args: {
    value: c.stories.value,
    timezone: c.stories.timezone,
    paymentPresets: c.stories.presets,
    calculation: initialCalculation,
    canEdit: true,
    onChange: fn(),
  },
  render: (args) => <TermsPreview {...args} />,
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof EstimateTermsCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$236.98");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$710.95");
    await expect(canvas.getByLabelText(c.optional(c.validUntil))).toHaveValue(c.stories.value.validUntil);
    for (const field of ["message", "paymentTerms", "termsNote"] as const) {
      await expect(canvas.getByRole("textbox", { name: c.optional(c.fields[field].label) })).toHaveAttribute("maxlength", String(c.fields[field].limit));
    }
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByRole("textbox", { name: c.optional(c.fields.message.label) });
    await userEvent.click(message);
    await userEvent.tab();
    await expect(canvas.getByLabelText(c.optional(c.validUntil))).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(message).toHaveFocus();
    const root = message.closest(".MuiOutlinedInput-root");
    await expect(root).not.toBeNull();
    if (root) {
      await expect(getComputedStyle(root).outlineStyle).toBe("solid");
      await expect(getComputedStyle(root).outlineWidth).toBe("3px");
    }
  },
};
export const CustomPaymentTerms: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.optional(c.fields.paymentTerms.label) }), { target: { value: c.stories.customPayment } });
    await expect(args.onChange).toHaveBeenCalledWith({ ...c.stories.value, paymentTerms: c.stories.customPayment });
    await expect(canvas.getByRole("textbox", { name: c.depositPercent })).toHaveValue("25");
  },
};
export const ApplyPreset: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.preset }), c.stories.presets[1].id);
    await expect(args.onChange).toHaveBeenCalledWith({ ...c.stories.value, paymentTerms: c.stories.presets[1].text });
    await expect(canvas.getByRole("textbox", { name: c.optional(c.fields.paymentTerms.label) })).toHaveValue(c.stories.presets[1].text);
    await expect(canvas.getByRole("textbox", { name: c.depositPercent })).toHaveValue("25");
    fireEvent.change(canvas.getByRole("textbox", { name: c.optional(c.fields.paymentTerms.label) }), { target: { value: c.stories.customPayment } });
    await expect(canvas.getByRole("textbox", { name: c.optional(c.fields.paymentTerms.label) })).toHaveValue(c.stories.customPayment);
  },
};
export const NoPresets: Story = {
  args: { paymentPresets: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("combobox", { name: c.preset })).not.toBeInTheDocument();
  },
};
export const NewDraft: Story = {
  args: { value: { message: "", paymentTerms: "", termsNote: "", validUntil: "", deposit: { type: "none" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewDraft }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.validDraft);
  },
};
export const PastDraftDate: Story = {
  args: { value: { ...c.stories.value, validUntil: "2026-10-21" } },
  play: NewDraft.play,
};
export const SendMissingDate: Story = {
  args: { value: { ...c.stories.value, validUntil: "" } },
  render: (args) => <TermsPreview {...args} purpose="send" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewSend }));
    await expect(canvas.getByLabelText(c.optional(c.validUntil))).toHaveFocus();
    await expect(canvas.getByText(c.errors.dateRequired)).toBeVisible();
  },
};
export const PublishPastDate: Story = {
  args: { value: { ...c.stories.value, validUntil: "2026-10-21" } },
  render: (args) => <TermsPreview {...args} purpose="publish" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewPublish }));
    await expect(canvas.getByText(c.errors.datePast)).toBeVisible();
    fireEvent.change(canvas.getByLabelText(c.optional(c.validUntil)), { target: { value: c.stories.today } });
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewPublish }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.validShare);
  },
};
export const TodayIsValid: Story = {
  args: { value: { ...c.stories.value, validUntil: c.stories.today, message: "", paymentTerms: "", termsNote: "" } },
  render: (args) => <TermsPreview {...args} purpose="send" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewSend }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.validShare);
  },
};
export const WorkspaceDateBoundary: Story = {
  args: { timezone: "Pacific/Kiritimati", value: { ...c.stories.value, validUntil: c.stories.today } },
  render: (args) => <TermsPreview {...args} purpose="send" today="2026-10-23" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewSend }));
    await expect(canvas.getByText(c.errors.datePast)).toBeVisible();
  },
};
export const ValidationErrors: Story = {
  args: {
    value: { ...c.stories.value, message: "M".repeat(2001), paymentTerms: "P".repeat(501), termsNote: "T".repeat(5001), validUntil: "" },
    errors: { message: c.errors.message, paymentTerms: c.errors.paymentTerms, termsNote: c.errors.termsNote, validUntil: c.errors.dateRequired },
  },
};
export const ValidationRecovery: Story = {
  args: { value: { ...c.stories.value, message: "M".repeat(2001) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewDraft }));
    const message = canvas.getByRole("textbox", { name: c.optional(c.fields.message.label) });
    await expect(message).toHaveFocus();
    await expect(message).toBeInvalid();
    fireEvent.change(message, { target: { value: c.stories.value.message } });
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewDraft }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.validDraft);
    await expect(message).not.toBeInvalid();
  },
};
export const ChangeDepositType: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.depositType }), "amount");
    await expect(args.onChange).toHaveBeenCalledWith({ ...c.stories.value, deposit: { type: "amount", value: "" } });
    const deposit = canvas.getByRole("textbox", { name: c.depositAmount });
    await expect(deposit).toHaveValue("");
    await expect(deposit).toBeInvalid();
    fireEvent.change(deposit, { target: { value: "200" } });
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$200.00");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$747.93");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.depositType }), "none");
    await expect(canvas.queryByRole("textbox", { name: c.depositAmount })).not.toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$0.00");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$947.93");
  },
};
export const ThreeDecimalDeposit: Story = {
  args: { value: { ...c.stories.value, deposit: { type: "percent", value: "8.875" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("group", { name: c.deposit })).toHaveTextContent("$84.13");
  },
};
export const InvalidDeposit: Story = {
  args: { value: { ...c.stories.value, deposit: { type: "percent", value: "8.8751" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.depositPercent })).toBeInvalid();
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("—");
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reviewDraft }));
    await expect(canvas.getByRole("textbox", { name: c.depositPercent })).toHaveFocus();
    fireEvent.change(canvas.getByRole("textbox", { name: c.depositPercent }), { target: { value: "25" } });
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$236.98");
  },
};
export const FixedDeposit: Story = { args: { value: { ...c.stories.value, deposit: { type: "amount", value: "200.50" } } } };
export const FixedDepositRevalidated: Story = {
  args: { value: { ...c.stories.value, deposit: { type: "amount", value: "200.50" } } },
  render: (args) => <TermsPreview {...args} allowReduction />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.reduceTotal }));
    await expect(canvas.getByRole("textbox", { name: c.depositAmount })).toHaveValue("200.50");
    await expect(canvas.getByRole("textbox", { name: c.depositAmount })).toBeInvalid();
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("—");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const InvalidFixedPrecision: Story = { args: { value: { ...c.stories.value, deposit: { type: "amount", value: "1.001" } } } };
export const DepositExceedsTotal: Story = { args: { value: { ...c.stories.value, deposit: { type: "amount", value: "948" } } } };
export const EntireTotalDeposit: Story = {
  args: { value: { ...c.stories.value, deposit: { type: "percent", value: "100" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("group", { name: c.balance })).toHaveTextContent("$0.00");
  },
};
export const NoDeposit: Story = { args: { value: { ...c.stories.value, deposit: { type: "none" } } } };
export const NoValidTotal: Story = {
  render: (args) => <TermsPreview {...args} sourceItems={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("—");
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
  },
};
export const MaximumAmounts: Story = {
  args: { value: { ...c.stories.value, deposit: { type: "percent", value: "100" } } },
  render: (args) => <TermsPreview {...args}
    sourceItems={[{ description: "Maximum sample", quantity: "10", unitPrice: "1000000", taxable: true, included: false }]}
    sourceTotals={{ discount: { type: "none" }, taxRate: "100" }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("group", { name: c.deposit })).toHaveTextContent("$20,000,000.00");
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const input of [...canvas.getAllByRole("textbox"), ...canvas.getAllByRole("combobox"), canvas.getByLabelText(c.optional(c.validUntil))]) {
      await expect(input).toBeDisabled();
    }
    await expect(canvas.getByRole("button", { name: c.stories.reviewDraft })).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ReadOnly: Story = { args: { canEdit: false } };
export const Sent: Story = {
  args: { status: "sent" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText(c.optional(c.validUntil))).not.toBeInTheDocument();
    await expect(canvas.getByText(c.stories.value.paymentTerms)).toBeVisible();
  },
};
export const Published: Story = { args: { status: "published" }, play: Sent.play };
export const Accepted: Story = { args: { status: "accepted" }, play: Sent.play };
export const Declined: Story = { args: { status: "declined" }, play: Sent.play };
export const Expired: Story = { args: { status: "expired" }, play: Sent.play };
export const Superseded: Story = { args: { status: "superseded" }, play: Sent.play };
export const Voided: Story = { args: { status: "void" }, play: Sent.play };
export const NoChangeHandler: Story = {
  args: { onChange: undefined },
  play: Sent.play,
};
export const ReadOnlyMissingTerms: Story = {
  args: { canEdit: false, value: { message: "", paymentTerms: "", termsNote: "", validUntil: "", deposit: { type: "none" } } },
};
export const ReadOnlyInvalid: Story = {
  args: {
    canEdit: false, value: { ...c.stories.value, deposit: { type: "amount", value: "948" } },
    errors: { validUntil: c.errors.datePast },
  },
};
export const PlainText: Story = {
  args: { canEdit: false, value: { ...c.stories.value, message: c.stories.literalText } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.stories.literalText.replace(/\s+/g, " "))).toBeVisible();
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};
export const LongContent: Story = {
  args: { value: { ...c.stories.value, message: "M".repeat(2000), paymentTerms: "P".repeat(500), termsNote: "T".repeat(5000) } },
};
export const LongReadOnly: Story = { args: { ...LongContent.args, canEdit: false } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };

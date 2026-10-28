import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { EstimateAdjustment } from "@salesmora/domain";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimateInput } from "../estimate-ui";
import { EstimateTotals, type EstimateTotalsProps } from "./estimate-totals";
import { estimateTotalsData as c } from "./estimate-totals.data";

function TotalsPreview({ reviewDeposit = false, ...args }: EstimateTotalsProps & { reviewDeposit?: boolean }) {
  const [value, setValue] = useState(args.value);
  const [deposit, setDeposit] = useState(args.deposit);
  return (
    <div className="grid min-w-0 gap-4">
      {reviewDeposit && <fieldset className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4">
        <legend className="px-2 text-sm font-semibold">{c.stories.depositControl}</legend>
        <p className="m-0 text-sm text-muted">{c.stories.depositNotice}</p>
        <select aria-label={c.stories.depositControl} value={deposit.type} className={estimateInput} onChange={(event) => {
          const type = event.target.value;
          if (type === "none") setDeposit({ type });
          else if (type === "amount" || type === "percent") setDeposit({ type, value: "" });
        }}>
          <option value="none">{c.types.none}</option>
          <option value="percent">{c.types.percent}</option>
          <option value="amount">{c.types.amount}</option>
        </select>
        {deposit.type !== "none" && <input aria-label={c.stories.depositValue} value={deposit.value}
          className={estimateInput} inputMode="decimal"
          onChange={(event) => setDeposit({ ...deposit, value: event.target.value })} />}
      </fieldset>}
      <EstimateTotals {...args} value={value} deposit={deposit} onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }} />
    </div>
  );
}

const meta = {
  title: "Estimates/EstimateTotals",
  component: EstimateTotals,
  args: {
    items: c.stories.items,
    value: { discount: { type: "percent", value: "10" }, taxRate: c.stories.taxRate },
    deposit: { type: "percent", value: "25" },
    canEdit: true,
    onChange: fn(),
  },
  render: (args) => <TotalsPreview {...args} />,
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof EstimateTotals>;
export default meta;
type Story = StoryObj<typeof meta>;
const none: EstimateAdjustment = { type: "none" };

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.subtotal })).toHaveTextContent("$1,000.00");
    await expect(canvas.getByRole("group", { name: c.discount })).toHaveTextContent("-$100.00");
    await expect(canvas.getByRole("group", { name: c.taxableBase })).toHaveTextContent("$540.00");
    await expect(canvas.getByRole("group", { name: c.tax })).toHaveTextContent("$47.93");
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$236.98");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$710.95");
  },
};
export const LiveDiscount: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.discountPercent }), { target: { value: "20" } });
    await expect(args.onChange).toHaveBeenCalledWith({
      discount: { type: "percent", value: "20" }, taxRate: c.stories.taxRate,
    });
    await expect(canvas.getByRole("group", { name: c.taxableBase })).toHaveTextContent("$480.00");
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$842.60");
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$210.65");
  },
};
export const LiveTaxRate: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.taxRate }), { target: { value: "8.125" } });
    await expect(args.onChange).toHaveBeenCalledWith({
      discount: { type: "percent", value: "10" }, taxRate: "8.125",
    });
    await expect(canvas.getByRole("group", { name: c.tax })).toHaveTextContent("$43.88");
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$943.88");
  },
};
export const SwitchDiscountType: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.discountType }), "amount");
    await expect(canvas.getByRole("textbox", { name: c.discountAmount })).toHaveValue("");
    await expect(canvas.getByRole("textbox", { name: c.discountAmount })).toBeInvalid();
    await expect(canvas.getByRole("group", { name: c.total })).not.toHaveTextContent("$947.93");
    fireEvent.change(canvas.getByRole("textbox", { name: c.discountAmount }), { target: { value: "100" } });
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.discountType }), "none");
    await expect(canvas.queryByRole("textbox", { name: c.discountAmount })).not.toBeInTheDocument();
    await expect(args.onChange).toHaveBeenLastCalledWith({ discount: none, taxRate: c.stories.taxRate });
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$1,053.25");
  },
};
export const NoDiscount: Story = { args: { value: { discount: none, taxRate: c.stories.taxRate } } };
export const FixedDiscount: Story = { args: { value: { discount: { type: "amount", value: "100" }, taxRate: c.stories.taxRate } } };
export const NoTax: Story = { args: { value: { discount: none, taxRate: "0" } } };
export const AllTaxable: Story = { args: { items: c.stories.items.map((item) => ({ ...item, taxable: true })) } };
export const NoTaxableLines: Story = { args: { items: c.stories.items.map((item) => ({ ...item, taxable: false })) } };
export const FullDiscount: Story = {
  args: { value: { discount: { type: "percent", value: "100" }, taxRate: c.stories.taxRate } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const label of [c.taxableBase, c.tax, c.total, c.deposit, c.balance]) {
      await expect(canvas.getByRole("group", { name: label })).toHaveTextContent("$0.00");
    }
  },
};
export const IncludedAtNoCharge: Story = {
  args: { items: [{ ...c.stories.items[0], unitPrice: "0", included: true }] },
};
export const Rounding: Story = {
  args: {
    items: c.stories.tinyItems,
    value: { discount: { type: "amount", value: "0.01" }, taxRate: "100" },
    deposit: { type: "percent", value: "50" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.discount })).toHaveTextContent("-$0.01");
    await expect(canvas.getByRole("group", { name: c.taxableBase })).toHaveTextContent("$0.00");
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$0.01");
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$0.01");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$0.00");
  },
};
export const ThreeDecimalRates: Story = {
  args: {
    value: { discount: { type: "percent", value: "8.875" }, taxRate: "8.875" },
    deposit: { type: "percent", value: "33.333" },
  },
};
export const NoDeposit: Story = { args: { deposit: none } };
export const FixedDeposit: Story = { args: { deposit: { type: "amount", value: "200" } } };
export const FullDeposit: Story = { args: { deposit: { type: "percent", value: "100" } } };
export const DepositExceedsTotal: Story = {
  args: { deposit: { type: "amount", value: "1000" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await expect(canvas.getByRole("group", { name: c.deposit })).not.toHaveTextContent("$1,000.00");
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.errors["deposit-exceeds-total"]);
  },
};
export const FixedDepositRevalidated: Story = {
  args: { value: { discount: none, taxRate: c.stories.taxRate }, deposit: { type: "amount", value: "1000" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.discountType }), "amount");
    fireEvent.change(canvas.getByRole("textbox", { name: c.discountAmount }), { target: { value: "100" } });
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.errors["deposit-exceeds-total"]);
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await expect(canvas.getByRole("group", { name: c.balance })).not.toHaveTextContent("-$52.07");
  },
};
export const DepositSettingsPreview: Story = {
  render: (args) => <TotalsPreview {...args} reviewDeposit />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.stories.depositControl }), "amount");
    fireEvent.change(canvas.getByRole("textbox", { name: c.stories.depositValue }), { target: { value: "200" } });
    await expect(canvas.getByRole("group", { name: c.deposit })).toHaveTextContent("$200.00");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$747.93");
  },
};
export const InvalidDiscount: Story = {
  args: { value: { discount: { type: "percent", value: "100.001" }, taxRate: c.stories.taxRate } },
};
export const ExcessiveFixedDiscount: Story = {
  args: { value: { discount: { type: "amount", value: "1000.01" }, taxRate: c.stories.taxRate } },
};
export const InvalidTax: Story = {
  args: { value: { discount: none, taxRate: "8.8751" } },
};
export const InvalidDeposit: Story = {
  args: { deposit: { type: "percent", value: "100.001" } },
};
export const ValidationRecovery: Story = {
  args: { value: { discount: { type: "amount", value: "1000.01" }, taxRate: "8.8751" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const discount = canvas.getByRole("textbox", { name: c.discountAmount });
    const tax = canvas.getByRole("textbox", { name: c.taxRate });
    await expect(discount).toHaveAccessibleDescription(c.errors["discount-exceeds-subtotal"]);
    await expect(tax).toHaveAccessibleDescription(c.errors["tax-rate"]);
    fireEvent.change(discount, { target: { value: "100" } });
    fireEvent.change(tax, { target: { value: "8.875" } });
    await expect(discount).not.toBeInvalid();
    await expect(tax).not.toBeInvalid();
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await expect(canvas.queryByText(c.unavailable)).not.toBeInTheDocument();
  },
};
export const EmptyItems: Story = { args: { items: [] } };
export const UnpricedItems: Story = { args: { items: [{ ...c.stories.items[0], unitPrice: "" }] } };
export const SubtotalLimit: Story = {
  args: { items: [{ ...c.stories.items[0], quantity: "10", unitPrice: "1000000" }, c.stories.items[1]] },
};
export const LargestAmounts: Story = {
  args: {
    items: [{ ...c.stories.items[0], quantity: "10", unitPrice: "1000000" }],
    value: { discount: none, taxRate: "100" },
    deposit: { type: "amount", value: "20000000" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$20,000,000.00");
    await expect(canvas.getByRole("group", { name: c.balance })).toHaveTextContent("$0.00");
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const input of canvas.getAllByRole("textbox")) await expect(input).toBeDisabled();
    await expect(canvas.getByRole("combobox")).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ReadOnly: Story = { args: { canEdit: false } };
export const Sent: Story = {
  args: { status: "sent" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: c.total })).toHaveTextContent("$947.93");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const Published: Story = { args: { status: "published" } };
export const Accepted: Story = { args: { status: "accepted" } };
export const Declined: Story = { args: { status: "declined" } };
export const Expired: Story = { args: { status: "expired" } };
export const Superseded: Story = { args: { status: "superseded" } };
export const Voided: Story = { args: { status: "void" } };
export const ReadOnlyInvalid: Story = { args: { ...ValidationRecovery.args, canEdit: false } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };

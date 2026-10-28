import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { calculateEstimateItems, estimateItemLimits } from "@salesmora/domain";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { copy as pickerCopy, pickerOptions, searchFixtures } from "../../materials/material-picker/material-picker.data";
import type { MaterialPickerOption } from "../../materials/material-picker/material-picker";
import { estimatePrimary } from "../estimate-ui";
import { EstimateItemsEditor, type EstimateItemsEditorProps } from "./estimate-items-editor";
import { estimateItemsEditorData as c } from "./estimate-items-editor.data";
import { estimateItemFromMaterial } from "./estimate-items-editor.materials";

function ItemsPreview(args: EstimateItemsEditorProps) {
  const [items, setItems] = useState(args.items);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="grid min-w-0 gap-4">
      <EstimateItemsEditor {...args} items={items} showErrors={args.showErrors || reviewed} onChange={(next) => {
        setItems(next);
        setNotice("");
        args.onChange?.(next);
      }} />
      {args.canEdit && (args.status ?? "draft") === "draft" && <button
        type="button" disabled={args.pending} className={`${estimatePrimary} justify-self-start`}
        onClick={() => {
          setReviewed(true);
          setNotice(calculateEstimateItems(items).subtotalCents === null ? c.stories.invalid : c.stories.valid);
        }}>{c.stories.review}</button>}
      {notice && <p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    </div>
  );
}

const manyLines = (count: number) => Array.from({ length: count }, (_, index) => ({
  ...c.stories.lines[0], id: `line-${index}`, description: c.stories.manyDescription(index + 1),
  quantity: "1", unitPrice: "1.00",
}));
const meta = {
  title: "Estimates/EstimateItemsEditor",
  component: EstimateItemsEditor,
  args: {
    items: c.stories.lines, canEdit: true, onChange: fn(),
    catalog: { search: searchFixtures, canViewPrices: true },
  },
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
      <Story />
    </main>
  )],
  render: (args) => <ItemsPreview {...args} />,
} satisfies Meta<typeof EstimateItemsEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

async function openMaterials(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: c.addMaterial }));
  await userEvent.click(canvas.getByRole("combobox", { name: pickerCopy.label }));
}

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$3,962.50")).toBeVisible();
    await expect(canvas.queryByText(c.unavailable)).not.toBeInTheDocument();
  },
};
export const CopiedSnapshotUnit: Story = {
  args: { items: [{ ...c.stories.lines[0], unit: "hr" }] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.catalogUnit("hr"))).toBeVisible();
    const quantity = canvas.getByRole("textbox", { name: c.quantity });
    fireEvent.change(quantity, { target: { value: "3" } });
    await expect(args.onChange).toHaveBeenCalledWith([{ ...c.stories.lines[0], unit: "hr", quantity: "3" }]);
  },
};
export const LiveCalculation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const first = within(canvas.getByRole("group", { name: c.line(1) }));
    fireEvent.change(first.getByRole("textbox", { name: c.quantity }), { target: { value: "2" } });
    await expect(args.onChange).toHaveBeenCalledWith([
      { ...c.stories.lines[0], quantity: "2" }, c.stories.lines[1], c.stories.lines[2],
    ]);
    await expect(first.getByRole("group", { name: c.amount })).toHaveTextContent("$250.00");
    await expect(canvas.getByText("$2,650.00")).toBeVisible();
  },
};
export const Empty: Story = { args: { items: [] } };
export const AddFirstLine: Story = {
  args: { items: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.add }));
    const first = within(canvas.getByRole("group", { name: c.line(1) }));
    await expect(first.getByRole("textbox", { name: c.descriptionLabel })).toHaveFocus();
    await expect(first.getByRole("textbox", { name: c.unitPrice })).toHaveValue("");
    await expect(args.onChange).toHaveBeenCalledWith([expect.objectContaining({
      description: "", quantity: "1", unitPrice: "", taxable: false, included: false,
    })]);
  },
};
export const AddAndRemove: Story = {
  args: { items: [c.stories.lines[0]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.add }));
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    const added = within(canvas.getByRole("group", { name: c.line(2) }));
    await userEvent.click(added.getByRole("button", { name: c.remove }));
    await expect(canvas.queryByRole("group", { name: c.line(2) })).not.toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: c.descriptionLabel })).toHaveFocus();
  },
};
export const RemoveLastLine: Story = {
  args: { items: [c.stories.lines[0]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.remove }));
    await expect(canvas.getByRole("button", { name: c.add })).toHaveFocus();
    await expect(canvas.getByText(c.empty)).toBeVisible();
  },
};
export const KeyboardReorder: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const second = within(canvas.getByRole("group", { name: c.line(2) }));
    second.getByRole("button", { name: c.moveUp }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith([c.stories.lines[1], c.stories.lines[0], c.stories.lines[2]]);
    const first = within(canvas.getByRole("group", { name: c.line(1) }));
    await expect(first.getByRole("textbox", { name: c.descriptionLabel })).toHaveValue(c.stories.lines[1].description);
    await expect(first.getByRole("textbox", { name: c.descriptionLabel })).toHaveFocus();
    await expect(first.getByRole("button", { name: c.moveUp })).toBeDisabled();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.moved(2, 1));
    first.getByRole("button", { name: c.moveDown }).focus();
    await userEvent.keyboard(" ");
    await expect(within(canvas.getByRole("group", { name: c.line(2) })).getByRole("textbox", { name: c.descriptionLabel }))
      .toHaveValue(c.stories.lines[1].description);
  },
};
export const IncludedAtNoCharge: Story = {
  args: { items: [c.stories.lines[0]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: c.included });
    await userEvent.click(checkbox);
    await expect(canvas.getByRole("textbox", { name: c.unitPrice })).toHaveValue("0.00");
    await expect(canvas.getAllByText("$0.00")).toHaveLength(2);
    await userEvent.click(checkbox);
    await expect(canvas.getByText(c.errors["zero-price"])).toBeVisible();
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
  },
};
export const TaxableToggle: Story = {
  args: { items: [c.stories.lines[0]] },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("checkbox", { name: c.taxable }));
    await expect(args.onChange).toHaveBeenCalledWith([{ ...c.stories.lines[0], taxable: true }]);
  },
};
export const UnpricedLine: Story = {
  args: { items: [{ ...c.stories.lines[0], unitPrice: "" }], showErrors: true },
};
export const ValidationErrors: Story = {
  args: {
    items: [{ ...c.stories.lines[0], description: "", quantity: "1.0001", unitPrice: "-1.00" }],
    showErrors: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const input of canvas.getAllByRole("textbox")) await expect(input).toBeInvalid();
    await expect(canvas.getByRole("textbox", { name: c.quantity })).toHaveAccessibleDescription(c.errors.quantity);
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
  },
};
export const ValidationRecovery: Story = {
  args: { items: [{ ...c.stories.lines[0], unitPrice: "1e3" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByText(c.errors["unit-price"])).toBeVisible();
    fireEvent.change(canvas.getByRole("textbox", { name: c.unitPrice }), { target: { value: "125.00" } });
    await userEvent.click(canvas.getByRole("button", { name: c.stories.review }));
    await expect(canvas.getByText(c.stories.valid)).toBeVisible();
    await expect(canvas.queryByText(c.errors["unit-price"])).not.toBeInTheDocument();
  },
};
export const Rounding: Story = {
  args: { items: [c.stories.roundingLine] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText("$1.01")).toHaveLength(2);
  },
};
export const UnitPriceLimit: Story = {
  args: { items: [{ ...c.stories.lines[0], quantity: "1", unitPrice: "1000000.01" }], showErrors: true },
};
export const LineAmountLimit: Story = {
  args: { items: [{ ...c.stories.lines[0], quantity: "10.001", unitPrice: "1000000" }] },
};
export const SubtotalLimit: Story = {
  args: { items: [
    { ...c.stories.lines[0], quantity: "10", unitPrice: "1000000" },
    { ...c.stories.lines[1], quantity: "1", unitPrice: "0.01" },
  ] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.subtotalLimit);
  },
};
export const MaximumLines: Story = {
  args: { items: manyLines(estimateItemLimits.count) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: c.add })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.addMaterial })).toBeDisabled();
    await expect(canvas.getAllByRole("group", { name: /^Line item \d+$/ })).toHaveLength(100);
    await userEvent.click(within(canvas.getByRole("group", { name: c.line(100) })).getByRole("button", { name: c.remove }));
    await expect(canvas.getByRole("button", { name: c.add })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: c.addMaterial })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.add }));
    await expect(canvas.getByRole("button", { name: c.add })).toBeDisabled();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const input of canvas.getAllByRole("textbox")) await expect(input).toBeDisabled();
    for (const checkbox of canvas.getAllByRole("checkbox")) await expect(checkbox).toBeDisabled();
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ReadOnly: Story = { args: { canEdit: false } };
export const Sent: Story = {
  args: { status: "sent", canEdit: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const Published: Story = { args: { status: "published" } };
export const Accepted: Story = { args: { status: "accepted" } };
export const Declined: Story = { args: { status: "declined" } };
export const Expired: Story = { args: { status: "expired" } };
export const Superseded: Story = { args: { status: "superseded" } };
export const Voided: Story = { args: { status: "void" } };
export const LongContent: Story = {
  args: { items: [{ ...c.stories.lines[0], description: c.stories.longDescription }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(c.unavailable)).not.toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: c.descriptionLabel })).toHaveAttribute("maxlength", "200");
  },
};
export const LongReadOnly: Story = { args: { ...LongContent.args, canEdit: false } };
export const Mobile: Story = { globals: { viewport: { value: "phone", isRotated: false } } };

const catalogLineResult = estimateItemFromMaterial(pickerOptions[0], "catalog-line", true);
if (!catalogLineResult.item) throw new Error("Invalid Materials story fixture.");
const catalogLine = catalogLineResult.item;

export const FromMaterials: Story = {
  args: { items: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    const search = canvas.getByRole("combobox", { name: pickerCopy.label });
    await expect(search).toHaveFocus();
    fireEvent.change(search, { target: { value: pickerOptions[1].sku } });
    const option = await canvas.findByRole("option", { name: new RegExp(pickerOptions[1].name) }, { timeout: 10000 });
    option.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: c.descriptionLabel })).toHaveValue(pickerOptions[1].name);
    await expect(canvas.getByRole("textbox", { name: c.descriptionLabel })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: c.unitPrice })).toHaveValue("5.20");
    await expect(canvas.getByText(c.catalogUnit(pickerOptions[1].unit))).toBeVisible();
    await expect(args.onChange).toHaveBeenCalledWith([expect.objectContaining({
      description: pickerOptions[1].name, quantity: "1", unitPrice: "5.20",
      catalog: { id: pickerOptions[1].id, name: pickerOptions[1].name, unit: pickerOptions[1].unit, sku: pickerOptions[1].sku },
    })]);
  },
};
export const CustomAndMaterials: Story = { args: { items: [c.stories.lines[0], catalogLine] } };
export const EditMaterialSnapshot: Story = {
  args: { items: [catalogLine] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.descriptionLabel }), { target: { value: c.stories.editedDescription } });
    fireEvent.change(canvas.getByRole("textbox", { name: c.unitPrice }), { target: { value: "725.00" } });
    await expect(args.onChange).toHaveBeenLastCalledWith([{
      ...catalogLine, description: c.stories.editedDescription, unitPrice: "725.00",
    }]);
    await expect(canvas.getByText(c.catalogSource(pickerOptions[0].name))).toBeVisible();
    await expect(canvas.getByRole("definition")).toHaveTextContent("$725.00");
  },
};
export const MaterialsWithoutPrices: Story = {
  args: {
    items: [],
    catalog: { search: async () => pickerOptions.map((item) => ({ ...item, priceCents: null })), canViewPrices: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    const option = await canvas.findByRole("option", { name: new RegExp(pickerOptions[0].name) }, { timeout: 10000 });
    await expect(canvas.queryByText("$699.00")).not.toBeInTheDocument();
    await expect(canvas.getByText(c.catalogNoPrices)).toBeVisible();
    await userEvent.click(option);
    await expect(canvas.getByRole("textbox", { name: c.unitPrice })).toHaveValue("");
    await expect(canvas.getByText(c.catalogMissingPrice)).toBeVisible();
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
  },
};
export const MaterialMissingPrice: Story = {
  args: { items: [], catalog: { search: async () => [c.stories.catalogMissingPrice], canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await userEvent.click(await canvas.findByRole("option", { name: new RegExp(c.stories.catalogMissingPrice.name) }, { timeout: 10000 }));
    await expect(canvas.getByRole("textbox", { name: c.unitPrice })).toHaveValue("");
    await expect(canvas.getByText(c.catalogMissingPrice)).toBeVisible();
  },
};
export const MaterialZeroPrice: Story = {
  args: { items: [], catalog: { search: async () => [{ ...pickerOptions[0], priceCents: 0 }], canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await userEvent.click(await canvas.findByRole("option", { name: new RegExp(pickerOptions[0].name) }, { timeout: 10000 }));
    await expect(canvas.getByRole("checkbox", { name: c.included })).not.toBeChecked();
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: c.included }));
    await expect(canvas.getByRole("definition")).toHaveTextContent("$0.00");
  },
};
export const MaterialsSearchOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await canvas.findByRole("option", { name: new RegExp(pickerOptions[0].name) }, { timeout: 10000 });
  },
};
export const MaterialsEmpty: Story = {
  args: { catalog: { search: async () => [], canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await expect(await canvas.findByText(pickerCopy.empty, {}, { timeout: 10000 })).toBeVisible();
  },
};
export const MaterialsSearchError: Story = {
  args: { catalog: { search: async () => { throw new Error("Catalog unavailable in fixture."); }, canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await expect(await canvas.findByRole("alert", {}, { timeout: 10000 })).toHaveTextContent(pickerCopy.error);
    await userEvent.click(canvas.getByRole("button", { name: c.cancelMaterial }));
    await userEvent.click(canvas.getByRole("button", { name: c.add }));
    await expect(canvas.getAllByRole("group", { name: /^Line item \d+$/ })).toHaveLength(4);
  },
};
export const MaterialsLoading: Story = {
  args: { catalog: { search: () => new Promise<MaterialPickerOption[]>(() => undefined), canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await expect(await canvas.findByText(pickerCopy.searching, {}, { timeout: 10000 })).toBeVisible();
  },
};
export const MaterialsUnavailable: Story = {
  args: { catalog: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: c.addMaterial })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.add })).toBeEnabled();
  },
};
export const CancelMaterials: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.cancelMaterial }));
    await expect(canvas.getByRole("button", { name: c.addMaterial })).toHaveFocus();
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const InvalidCatalogPrice: Story = {
  args: { catalog: { search: async () => [{ ...pickerOptions[0], priceCents: 100_000_001 }], canViewPrices: true } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await userEvent.click(await canvas.findByRole("option", { name: new RegExp(pickerOptions[0].name) }, { timeout: 10000 }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.catalogInvalid);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ReadOnlyMaterialSnapshot: Story = { args: { items: [catalogLine], status: "sent" } };
export const MobileMaterials: Story = {
  globals: { viewport: { value: "phone", isRotated: false } },
  args: { items: [], catalog: { search: async () => [c.stories.catalogLong], canViewPrices: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openMaterials(canvasElement);
    await canvas.findByRole("option", { name: new RegExp(c.stories.catalogLong.name) }, { timeout: 10000 });
  },
};

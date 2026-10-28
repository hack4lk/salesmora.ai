"use client";

import { useEffect, useId, useRef, useState } from "react";
import { calculateEstimateItems, estimateItemLimits, type EstimateItemInput } from "@salesmora/domain";
import { MoneyText, TextField } from "@salesmora/ui";
import { MaterialPicker, type MaterialPickerOption } from "../../materials/material-picker/material-picker";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { estimateItemsEditorData as c } from "./estimate-items-editor.data";
import { estimateItemFromMaterial } from "./estimate-items-editor.materials";

export type EstimateEditorItem = EstimateItemInput & {
  id: string;
  unit?: string;
  catalog?: { id: string; name: string; unit: string; sku: string };
};
export type EstimateItemsCatalog = {
  search: (query: string, signal: AbortSignal) => Promise<MaterialPickerOption[]>;
  canViewPrices: boolean;
};
export type EstimateItemsEditorProps = {
  items: readonly EstimateEditorItem[];
  status?: EstimateStatus;
  canEdit?: boolean;
  pending?: boolean;
  showErrors?: boolean;
  /** Only supplied when catalog browsing is authorized. The search must redact restricted prices. */
  catalog?: EstimateItemsCatalog;
  onChange?: (items: EstimateEditorItem[]) => void;
};

export function EstimateItemsEditor({
  items,
  status = "draft",
  canEdit = false,
  pending = false,
  showErrors = false,
  catalog,
  onChange,
}: EstimateItemsEditorProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;
  const result = calculateEstimateItems(items);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const catalogVisible = catalogOpen && !pending && items.length < estimateItemLimits.count;
  const catalogAddRef = useRef<HTMLButtonElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef(new Map<string, HTMLFieldSetElement>());
  const addRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<string | null>(null);

  useEffect(() => {
    if (focusTarget.current === null) return;
    if (focusTarget.current === "") addRef.current?.focus();
    else lineRefs.current.get(focusTarget.current)?.querySelector("input")?.focus();
    focusTarget.current = null;
  }, [items]);

  useEffect(() => {
    if (catalogOpen) catalogRef.current?.querySelector("input")?.focus();
  }, [catalogOpen]);

  function change(itemId: string, patch: Partial<EstimateItemInput>) {
    if (editable && !pending) onChange?.(items.map((item) => item.id === itemId ? { ...item, ...patch } : item));
  }
  function touch(itemId: string, field: string) {
    setTouched((current) => new Set(current).add(`${itemId}:${field}`));
  }
  function move(index: number, to: number) {
    if (!editable || pending || to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    focusTarget.current = item.id;
    onChange?.(next);
    setAnnouncement(c.moved(index + 1, to + 1));
  }
  function remove(index: number) {
    if (!editable || pending) return;
    focusTarget.current = items[index + 1]?.id ?? items[index - 1]?.id ?? "";
    onChange?.(items.filter((_, position) => position !== index));
    setAnnouncement(c.removed(index + 1));
  }
  function add() {
    if (!editable || pending || items.length >= estimateItemLimits.count) return;
    const item: EstimateEditorItem = {
      id: crypto.randomUUID(), description: "", quantity: "1", unitPrice: "", taxable: false, included: false,
    };
    focusTarget.current = item.id;
    setCatalogOpen(false);
    setCatalogError("");
    onChange?.([...items, item]);
    setAnnouncement(c.added(items.length + 1));
  }
  function addMaterial(material: MaterialPickerOption) {
    if (!editable || pending || !catalog || items.length >= estimateItemLimits.count) return;
    const result = estimateItemFromMaterial(material, crypto.randomUUID(), catalog.canViewPrices);
    if (result.error) {
      setCatalogError(c.catalogInvalid);
      return;
    }
    focusTarget.current = result.item.id;
    onChange?.([...items, result.item]);
    setCatalogOpen(false);
    setCatalogError("");
    setAnnouncement(c.materialAdded(material.name));
  }

  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
        <p className="m-0 text-sm text-muted">{c.count(items.length)}</p>
      </div>
      <p className="m-0 text-sm leading-6 text-muted">{editable ? c.description : c.locked}</p>
      {!items.length && <div className="rounded-xl border border-line bg-canvas p-4">
        <h3 className="m-0 text-base font-semibold">{c.empty}</h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{c.emptyHint}</p>
      </div>}
      {items.map((item, index) => {
        const calculation = result.items[index];
        const error = (field: "description" | "quantity" | "unitPrice") => {
          const code = calculation?.errors[field];
          return code && (showErrors || !editable || touched.has(`${item.id}:${field}`)) ? c.errors[code] : undefined;
        };
        return (
          <fieldset key={item.id} ref={(element) => {
            if (element) lineRefs.current.set(item.id, element);
            else lineRefs.current.delete(item.id);
          }} disabled={pending} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line p-4">
            <legend className="px-2 text-sm font-semibold">{c.line(index + 1)}</legend>
            {item.catalog && <div className="grid gap-1 rounded-lg bg-canvas p-3">
              <p className="m-0 text-sm font-semibold wrap-anywhere">{c.catalogSource(item.catalog.name)}</p>
              <p className="m-0 text-sm text-muted wrap-anywhere">{c.catalogUnit(item.catalog.unit)}</p>
              {item.catalog.sku && <p className="m-0 text-sm text-muted wrap-anywhere">{c.catalogSku(item.catalog.sku)}</p>}
              <p className="m-0 text-sm leading-6 text-muted">{c.catalogSnapshot}</p>
              {editable && !item.unitPrice.trim() && <p className="m-0 text-sm leading-6 text-muted">{c.catalogMissingPrice}</p>}
            </div>}
            {!item.catalog && item.unit && <p className="m-0 text-sm text-muted wrap-anywhere">{c.catalogUnit(item.unit)}</p>}
            {editable ? <>
              <TextField
                label={c.descriptionLabel}
                required
                name={`description-${item.id}`}
                value={item.description}
                disabled={pending}
                onChange={(event) => change(item.id, { description: event.target.value })}
                onBlur={() => touch(item.id, "description")}
                error={!!error("description")}
                helperText={error("description") ?? c.descriptionHint}
                slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: estimateItemLimits.descriptionLength } }}
              />
              <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                <TextField
                  label={c.quantity}
                  required
                  name={`quantity-${item.id}`}
                  value={item.quantity}
                  disabled={pending}
                  onChange={(event) => change(item.id, { quantity: event.target.value })}
                  onBlur={() => touch(item.id, "quantity")}
                  error={!!error("quantity")}
                  helperText={error("quantity") ?? c.quantityHint}
                  slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { inputMode: "decimal" } }}
                />
                <TextField
                  label={c.unitPrice}
                  required
                  name={`unitPrice-${item.id}`}
                  value={item.unitPrice}
                  disabled={pending}
                  onChange={(event) => change(item.id, { unitPrice: event.target.value })}
                  onBlur={() => touch(item.id, "unitPrice")}
                  error={!!error("unitPrice")}
                  helperText={error("unitPrice") ?? c.priceHint}
                  slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { inputMode: "decimal" } }}
                />
                <div className="grid content-start gap-2" role="group" aria-label={c.amount}>
                  <span className="text-sm font-semibold text-muted">{c.amount}</span>
                  <MoneyText cents={calculation?.amountCents} className="text-base font-semibold" />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                  <input type="checkbox" checked={item.taxable} disabled={pending}
                    className="h-5 w-5 shrink-0 accent-primary focus-visible:focus-ring"
                    onChange={(event) => change(item.id, { taxable: event.target.checked })} />
                  {c.taxable}
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                  <input type="checkbox" checked={item.included} disabled={pending}
                    aria-describedby={`${id}-included-hint-${index}`}
                    className="h-5 w-5 shrink-0 accent-primary focus-visible:focus-ring"
                    onChange={(event) => {
                      touch(item.id, "unitPrice");
                      change(item.id, event.target.checked ? { included: true, unitPrice: "0.00" } : { included: false });
                    }} />
                  {c.included}
                </label>
              </div>
              <p id={`${id}-included-hint-${index}`} className="m-0 text-sm leading-6 text-muted">{c.includedHint}</p>
            </> : <>
              <p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{item.description}</p>
              <dl className="m-0 grid gap-4 sm:grid-cols-3">
                {([
                  [c.quantity, item.quantity],
                  [c.unitPrice, item.unitPrice],
                ] as const).map(([label, text]) => <div key={label}>
                  <dt className="text-sm font-semibold text-muted">{label}</dt>
                  <dd className="m-0 mt-1 text-sm wrap-anywhere">{text}</dd>
                </div>)}
                <div>
                  <dt className="text-sm font-semibold text-muted">{c.amount}</dt>
                  <dd className="m-0 mt-1"><MoneyText cents={calculation?.amountCents} /></dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
                <span>{item.taxable ? c.taxable : c.notTaxable}</span>
                {item.included && <span>{c.included}</span>}
              </div>
              {(["description", "quantity", "unitPrice"] as const).map((field) => error(field) &&
                <p key={field} className="m-0 text-sm text-error">{error(field)}</p>)}
            </>}
            {calculation?.errors.amount && <p role="alert" className="m-0 text-sm text-error">{c.errors[calculation.errors.amount]}</p>}
            {editable && <div className="flex flex-wrap gap-2">
              <button type="button" className={estimateButton} disabled={pending || index === 0} onClick={() => move(index, index - 1)}>{c.moveUp}</button>
              <button type="button" className={estimateButton} disabled={pending || index === items.length - 1} onClick={() => move(index, index + 1)}>{c.moveDown}</button>
              <button type="button" className={estimateButton} disabled={pending} onClick={() => remove(index)}>{c.remove}</button>
            </div>}
          </fieldset>
        );
      })}
      {editable && <div className="flex flex-wrap gap-3">
        <button ref={addRef} type="button" className={estimateButton}
          disabled={pending || items.length >= estimateItemLimits.count} onClick={add}>{c.add}</button>
        {catalog && <button ref={catalogAddRef} type="button" className={estimateButton}
          aria-expanded={catalogVisible} aria-controls={`${id}-catalog`}
          disabled={pending || items.length >= estimateItemLimits.count}
          onClick={() => { setCatalogOpen(true); setCatalogError(""); }}>{c.addMaterial}</button>}
      </div>}
      {editable && catalog && catalogVisible &&
        <div ref={catalogRef} id={`${id}-catalog`} role="region" aria-labelledby={`${id}-catalog-title`}
          className="grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id={`${id}-catalog-title`} className="m-0 text-base font-semibold">{c.catalogTitle}</h3>
            <button type="button" className={estimateButton}
              onClick={() => { setCatalogOpen(false); setCatalogError(""); catalogAddRef.current?.focus(); }}>
              {c.cancelMaterial}
            </button>
          </div>
          <p className="m-0 text-sm leading-6 text-muted">{c.catalogHint}</p>
          {!catalog.canViewPrices && <p className="m-0 text-sm leading-6 text-muted">{c.catalogNoPrices}</p>}
          <MaterialPicker search={catalog.search} selected={null} onSelect={addMaterial}
            onClear={() => setCatalogError("")} showPrices={catalog.canViewPrices} />
          {catalogError && <p role="alert" className="m-0 text-sm text-error">{catalogError}</p>}
        </div>}
      {editable && items.length >= estimateItemLimits.count && <p className="m-0 text-sm text-muted">{c.maxItems}</p>}
      {(result.error === "too-many-items" || result.error === "subtotal-limit") &&
        <p role="alert" className="m-0 text-sm text-error">{result.error === "too-many-items" ? c.tooMany : c.subtotalLimit}</p>}
      <div className="grid gap-2 border-t border-line pt-4">
        <dl className="m-0 flex flex-wrap items-center justify-between gap-3">
          <dt className="text-base font-semibold">{c.subtotal}</dt>
          <dd className="m-0 text-lg font-semibold"><MoneyText cents={result.subtotalCents} /></dd>
        </dl>
        {result.subtotalCents === null && <p className="m-0 text-sm text-muted">{c.unavailable}</p>}
        <p className="m-0 text-sm leading-6 text-muted">{c.subtotalHint}</p>
        <p className="m-0 text-sm leading-6 text-muted">{c.limits}</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    </section>
  );
}

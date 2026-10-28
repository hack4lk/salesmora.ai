"use client";

import { useId } from "react";
import { calculateEstimateTotals, type EstimateAdjustment, type EstimateItemInput, type EstimateTotalsValues } from "@salesmora/domain";
import { MoneyText, TextField } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimateInput, estimatePanel } from "../estimate-ui";
import { estimateTotalsData as c } from "./estimate-totals.data";

export type EstimateTotalsProps = {
  items: readonly EstimateItemInput[];
  value: EstimateTotalsValues;
  /** Supplied by the owning editor/terms card, not edited here. */
  deposit: EstimateAdjustment;
  status?: EstimateStatus;
  canEdit?: boolean;
  pending?: boolean;
  onChange?: (value: EstimateTotalsValues) => void;
};

export function EstimateTotals({
  items, value, deposit, status = "draft", canEdit = false, pending = false, onChange,
}: EstimateTotalsProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;
  const result = calculateEstimateTotals({ items, ...value, deposit });
  const discountError = result.errors.discount ? c.errors[result.errors.discount] : undefined;
  const taxError = result.errors.taxRate ? c.errors[result.errors.taxRate] : undefined;
  const depositError = result.errors.deposit ? c.errors[result.errors.deposit] : undefined;
  const itemError = result.items.subtotalCents !== null ? undefined
    : result.items.error === "empty-items" ? c.itemsEmpty
      : result.items.error === "too-many-items" ? c.tooManyItems
        : result.items.error === "subtotal-limit" ? c.subtotalLimit : c.itemsInvalid;
  function change(patch: Partial<EstimateTotalsValues>) {
    if (editable && !pending) onChange?.({ ...value, ...patch });
  }

  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{editable ? c.description : c.locked}</p>
      {editable ? <fieldset disabled={pending} className="m-0 grid min-w-0 gap-5 border-0 p-0">
        <legend className="sr-only">{c.controls}</legend>
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-discount-type`} className="text-sm font-semibold">{c.discountType}</label>
          <select id={`${id}-discount-type`} className={estimateInput} value={value.discount.type}
            disabled={pending} onChange={(event) => {
              const type = event.target.value;
              if (type === "none") change({ discount: { type } });
              else if (type === "percent" || type === "amount") change({ discount: { type, value: "" } });
            }}>
            <option value="none">{c.types.none}</option>
            <option value="percent">{c.types.percent}</option>
            <option value="amount">{c.types.amount}</option>
          </select>
        </div>
        {value.discount.type !== "none" && <TextField
          label={value.discount.type === "percent" ? c.discountPercent : c.discountAmount}
          required
          value={value.discount.value}
          disabled={pending}
          error={!!discountError}
          helperText={discountError ?? c.discountHint}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { inputMode: "decimal" } }}
          onChange={(event) => {
            if (value.discount.type !== "none") change({ discount: { ...value.discount, value: event.target.value } });
          }}
        />}
        <TextField label={c.taxRate} required value={value.taxRate} disabled={pending}
          error={!!taxError} helperText={taxError ?? c.taxHint}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { inputMode: "decimal" } }}
          onChange={(event) => change({ taxRate: event.target.value })} />
      </fieldset> : <>
        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-muted">{c.discountType}</dt>
            <dd className="m-0 mt-1 text-sm wrap-anywhere">{c.types[value.discount.type]}
              {value.discount.type !== "none" && `: ${value.discount.value.trim() || c.notProvided}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted">{c.taxRate}</dt>
            <dd className="m-0 mt-1 text-sm wrap-anywhere">{value.taxRate.trim() ? c.rateSetting(value.taxRate.trim()) : c.notProvided}</dd>
          </div>
        </dl>
        {discountError && <p role="alert" className="m-0 text-sm text-error">{discountError}</p>}
        {taxError && <p role="alert" className="m-0 text-sm text-error">{taxError}</p>}
      </>}
      <p className="m-0 text-sm leading-6 text-muted">{c.allocation}</p>
      {itemError && <p role="alert" className="m-0 text-sm leading-6 text-error">{itemError}</p>}
      <div className="grid gap-3 border-t border-line pt-4">
        {([
          [c.subtotal, result.items.subtotalCents],
          [c.discount, result.discountCents === null ? null : -result.discountCents],
          [c.taxableBase, result.taxableAfterDiscountCents],
          [c.tax, result.taxCents],
          [c.total, result.totalCents],
          [c.deposit, result.depositCents],
          [c.balance, result.balanceCents],
        ] as const).map(([label, cents]) => (
          <div key={label} role="group" aria-label={label}>
            <dl className={`m-0 flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-1 ${label === c.total ? "border-t border-line pt-3 text-lg font-semibold" : "text-sm"}`}>
              <dt className={label === c.total ? "font-semibold" : "text-muted"}>{label}</dt>
              <dd className="m-0 max-w-full font-semibold wrap-anywhere"><MoneyText cents={cents === 0 ? 0 : cents} /></dd>
            </dl>
          </div>
        ))}
      </div>
      {(result.totalCents === null || result.depositCents === null) &&
        <p className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>}
      <div className="grid gap-2 rounded-xl bg-canvas p-4">
        <dl className="m-0">
          <dt className="text-sm font-semibold">{c.depositSetting}</dt>
          <dd className="m-0 mt-1 text-sm wrap-anywhere">
            {deposit.type === "none" ? c.noDeposit
              : deposit.type === "percent" ? c.percentSetting(deposit.value.trim() || c.notProvided)
                : `${c.types.amount}: ${deposit.value.trim() || c.notProvided}`}
          </dd>
        </dl>
        {depositError && <p role="alert" className="m-0 text-sm leading-6 text-error">{depositError}</p>}
        <p className="m-0 text-sm leading-6 text-muted">{c.depositHint}</p>
      </div>
    </section>
  );
}

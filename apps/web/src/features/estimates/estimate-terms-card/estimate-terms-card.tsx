"use client";

import { useId } from "react";
import MuiTextField from "@mui/material/TextField";
import type { EstimateTotalsCalculation } from "@salesmora/domain";
import { fieldClasses, MoneyText, TextField } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimateInput, estimatePanel } from "../estimate-ui";
import { estimateTotalsData } from "../estimate-totals/estimate-totals.data";
import { estimateTermsCardData as c } from "./estimate-terms-card.data";
import type { EstimateTermsErrors, EstimateTermsValues } from "./estimate-terms-card.validation";

export type EstimatePaymentPreset = { id: string; label: string; text: string };
export type EstimateTermsCardProps = {
  value: EstimateTermsValues;
  timezone: string;
  /** Recomputed by the host from the same current items, totals and deposit used by EstimateTotals. */
  calculation: EstimateTotalsCalculation;
  paymentPresets?: readonly EstimatePaymentPreset[];
  status?: EstimateStatus;
  canEdit?: boolean;
  pending?: boolean;
  errors?: EstimateTermsErrors;
  onChange?: (value: EstimateTermsValues) => void;
};

export function EstimateTermsCard({
  value, timezone, calculation, paymentPresets = [], status = "draft", canEdit = false,
  pending = false, errors = {}, onChange,
}: EstimateTermsCardProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;
  const depositError = calculation.errors.deposit ? estimateTotalsData.errors[calculation.errors.deposit] : undefined;
  function change(patch: Partial<EstimateTermsValues>) {
    if (editable && !pending) onChange?.({ ...value, ...patch });
  }

  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{editable ? c.description : c.readOnly}</p>
      {editable ? <fieldset disabled={pending} className="m-0 grid min-w-0 gap-5 border-0 p-0">
        <legend className="sr-only">{c.title}</legend>
        <MuiTextField label={c.optional(c.fields.message.label)} name="message" value={value.message}
          multiline rows={4} fullWidth size="small" disabled={pending} className={fieldClasses}
          error={!!errors.message} helperText={errors.message ?? `${c.fields.message.hint} ${c.count(value.message.length, c.fields.message.limit)}`}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.fields.message.limit } }}
          onChange={(event) => change({ message: event.target.value })} />
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-date`} className="text-sm font-semibold">{c.optional(c.validUntil)}</label>
          <input id={`${id}-date`} name="validUntil" type="date" value={value.validUntil} disabled={pending}
            className={estimateInput} aria-invalid={!!errors.validUntil} aria-describedby={`${id}-date-hint`}
            onChange={(event) => change({ validUntil: event.target.value })} />
          <p id={`${id}-date-hint`} className={`m-0 text-sm leading-6 wrap-anywhere ${errors.validUntil ? "text-error" : "text-muted"}`}>
            {errors.validUntil ?? c.validUntilHint(timezone)}
          </p>
        </div>
        {paymentPresets.length > 0 && <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-preset`} className="text-sm font-semibold">{c.preset}</label>
          <select id={`${id}-preset`} value="" disabled={pending} className={estimateInput}
            onChange={(event) => {
              const preset = paymentPresets.find((entry) => entry.id === event.target.value);
              if (preset) change({ paymentTerms: preset.text });
            }}>
            <option value="" disabled>{c.choosePreset}</option>
            {paymentPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
        </div>}
        {(["paymentTerms", "termsNote"] as const).map((field) => (
          <MuiTextField key={field} label={c.optional(c.fields[field].label)} name={field} value={value[field]}
            multiline rows={3} fullWidth size="small" disabled={pending} className={fieldClasses}
            error={!!errors[field]} helperText={errors[field] ?? `${c.fields[field].hint} ${c.count(value[field].length, c.fields[field].limit)}`}
            slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.fields[field].limit } }}
            onChange={(event) => change({ [field]: event.target.value })} />
        ))}
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-deposit-type`} className="text-sm font-semibold">{c.depositType}</label>
          <select id={`${id}-deposit-type`} value={value.deposit.type} disabled={pending} className={estimateInput}
            onChange={(event) => {
              const type = event.target.value;
              if (type === "none") change({ deposit: { type } });
              else if (type === "percent" || type === "amount") change({ deposit: { type, value: "" } });
            }}>
            <option value="none">{c.types.none}</option>
            <option value="percent">{c.types.percent}</option>
            <option value="amount">{c.types.amount}</option>
          </select>
        </div>
        {value.deposit.type !== "none" && <TextField
          name="deposit"
          label={value.deposit.type === "percent" ? c.depositPercent : c.depositAmount}
          required value={value.deposit.value} disabled={pending}
          error={!!depositError} helperText={depositError ?? c.depositValueHint}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { inputMode: "decimal" } }}
          onChange={(event) => {
            if (value.deposit.type !== "none") change({ deposit: { ...value.deposit, value: event.target.value } });
          }} />}
      </fieldset> : <dl className="m-0 grid min-w-0 gap-4">
        {([
          [c.fields.message.label, value.message],
          [c.validUntil, value.validUntil],
          [c.fields.paymentTerms.label, value.paymentTerms],
          [c.fields.termsNote.label, value.termsNote],
          [c.depositType, value.deposit.type === "none" ? c.noDeposit
            : value.deposit.type === "percent" ? c.percentSetting(value.deposit.value.trim() || c.notProvided)
              : c.amountSetting(value.deposit.value.trim() || c.notProvided)],
        ] as const).map(([label, text]) => <div key={label}>
          <dt className="text-sm font-semibold text-muted">{label}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{text.trim() ? text : c.notProvided}</dd>
        </div>)}
      </dl>}
      {!editable && Object.entries(errors).map(([field, message]) => <p key={field} role="alert" className="m-0 text-sm text-error">{message}</p>)}
      {!editable && depositError && <p role="alert" className="m-0 text-sm text-error">{depositError}</p>}
      <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{editable ? c.depositHint : `${c.validUntilHint(timezone)} ${c.depositHint}`}</p>
      <div className="grid min-w-0 gap-3 border-t border-line pt-4">
        {([[c.deposit, calculation.depositCents], [c.balance, calculation.balanceCents]] as const).map(([label, cents]) => (
          <div key={label} role="group" aria-label={label}>
            <dl className="m-0 flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="m-0 max-w-full font-semibold wrap-anywhere"><MoneyText cents={cents} /></dd>
            </dl>
          </div>
        ))}
      </div>
      {(calculation.depositCents === null || calculation.balanceCents === null) &&
        <p className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>}
    </section>
  );
}

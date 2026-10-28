import type { EstimateAdjustment } from "@salesmora/domain";
import { estimateTermsCardData as c } from "./estimate-terms-card.data";

export type EstimateTermsValues = {
  message: string;
  validUntil: string;
  paymentTerms: string;
  termsNote: string;
  deposit: EstimateAdjustment;
};
export type EstimateTermsErrors = Partial<Record<Exclude<keyof EstimateTermsValues, "deposit">, string>>;
export type EstimateTermsValidationOptions = {
  /** YYYY-MM-DD supplied by the host in the workspace timezone, never the browser's local date. */
  today: string;
  purpose?: "draft" | "send" | "publish";
};

function isLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Presentation checks only. Deposit validity comes from the shared totals calculation. */
export function validateEstimateTerms(
  value: EstimateTermsValues,
  { today, purpose = "draft" }: EstimateTermsValidationOptions,
): EstimateTermsErrors {
  const errors: EstimateTermsErrors = {};
  for (const field of ["message", "paymentTerms", "termsNote"] as const) {
    if (value[field].length > c.fields[field].limit) errors[field] = c.errors[field];
  }
  if (value.validUntil && !isLocalDate(value.validUntil)) errors.validUntil = c.errors.validUntil;
  else if (purpose !== "draft") {
    if (!value.validUntil) errors.validUntil = c.errors.dateRequired;
    else if (!isLocalDate(today)) errors.validUntil = c.errors.todayUnavailable;
    else if (value.validUntil < today) errors.validUntil = c.errors.datePast;
  }
  return errors;
}

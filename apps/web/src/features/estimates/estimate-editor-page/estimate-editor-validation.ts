import { calculateEstimateTotals } from "@salesmora/domain";
import { validateEstimateDetails } from "../estimate-details-card/estimate-details-card.validation";
import { validateEstimateInternalNotes } from "../estimate-internal-notes-card/estimate-internal-notes-card.validation";
import type { EstimateMember } from "../estimate-preview.types";
import { validateEstimateScope } from "../estimate-scope-card/estimate-scope-card.validation";
import { validateEstimateTerms } from "../estimate-terms-card/estimate-terms-card.validation";
import type { EstimateEditorValues } from "./estimate-editor-values";
import { estimateEditorValidationData as c } from "./estimate-editor-validation.data";
import { reviewEstimatePaymentLink } from "../estimate-payment-option/estimate-payment-option.validation";

export function reviewEstimateEditorDraftValues(
  value: EstimateEditorValues,
  members: readonly EstimateMember[],
  { today }: { today: string },
) {
  const details = validateEstimateDetails(value.details);
  if (value.details.ownerId && !members.some((member) => member.id === value.details.ownerId)) {
    details.ownerId = c.unknownOwner;
  }
  const terms = validateEstimateTerms(value.terms, { today });
  const scope = validateEstimateScope(value.scope);
  const internalNotes = validateEstimateInternalNotes(value.internalNotes);
  const paymentLink = reviewEstimatePaymentLink(value.paymentLink ?? "");
  const calculation = calculateEstimateTotals({
    items: value.items,
    ...value.totals,
    deposit: value.terms.deposit,
  });
  const issues = [
    ...Object.values(details),
    ...Object.values(terms),
    ...(scope ? [scope] : []),
    ...(internalNotes ? [internalNotes] : []),
    ...(paymentLink.state === "invalid" ? [paymentLink.error] : []),
  ];
  if (value.items.length && calculation.items.subtotalCents === null) {
    issues.push(c.invalidItems);
  }
  if (Object.keys(calculation.errors).length) issues.push(c.invalidAmounts);
  return { details, terms, scope, internalNotes, calculation, issues, valid: issues.length === 0 };
}

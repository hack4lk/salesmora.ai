import type { EstimateTotalsValues } from "@salesmora/domain";
import type { EstimateEditorItem } from "../estimate-items-editor/estimate-items-editor";
import type { EstimateDetailsValues } from "../estimate-preview.types";
import type { EstimateTermsValues } from "../estimate-terms-card/estimate-terms-card.validation";

export type EstimateEditorValues = {
  details: EstimateDetailsValues;
  items: EstimateEditorItem[];
  totals: EstimateTotalsValues;
  terms: EstimateTermsValues;
  scope: string;
  internalNotes: string;
  paymentLink?: string;
};

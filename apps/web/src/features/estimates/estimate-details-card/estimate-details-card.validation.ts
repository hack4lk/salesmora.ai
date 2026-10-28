import { leadSchema } from "@salesmora/contracts";
import type { EstimateDetailsValues } from "../estimate-preview.types";
import { estimateDetailsCardData as c } from "./estimate-details-card.data";

export type EstimateDetailsErrors = Partial<Record<keyof EstimateDetailsValues, string>>;
export type EstimateDetailsValidationOptions = {
  purpose?: "draft" | "send";
  requireServiceAddress?: boolean;
};

/** Presentation feedback only; the server validates and authorizes every write. */
export function validateEstimateDetails(
  value: EstimateDetailsValues,
  { purpose = "draft", requireServiceAddress = false }: EstimateDetailsValidationOptions = {},
): EstimateDetailsErrors {
  const errors: EstimateDetailsErrors = {};
  if (!value.name.trim() || value.name.length > 120) errors.name = c.errors.name;
  if (purpose === "send" && !value.recipientName.trim()) errors.recipientName = c.errors.recipientName;
  // The existing lead contact contract already handles empty, trimmed and invalid emails.
  if (!leadSchema.shape.email.safeParse(value.recipientEmail).success ||
    (purpose === "send" && !value.recipientEmail.trim())) {
    errors.recipientEmail = c.errors.recipientEmail;
  }
  if (purpose === "send" && requireServiceAddress && !value.serviceAddress.trim()) {
    errors.serviceAddress = c.errors.serviceAddress;
  }
  return errors;
}

import { estimatePaymentOptionData as c } from "./estimate-payment-option.data";
import { estimatePaymentLinkSchema } from "@salesmora/contracts";

export type EstimatePaymentLinkReview =
  | { state: "empty" }
  | { state: "invalid"; error: string }
  | { state: "ready"; href: string; hostname: string };

/** Drafts, frozen snapshots and the UI share the same HTTPS boundary. */
export function reviewEstimatePaymentLink(value: string): EstimatePaymentLinkReview {
  const link = value.trim();
  if (!link) return { state: "empty" };
  if (link.length > 2048) return { state: "invalid", error: c.tooLong };
  if (!estimatePaymentLinkSchema.safeParse(link).success) {
    return { state: "invalid", error: c.invalid };
  }
  const url = new URL(link);
  return { state: "ready", href: url.href, hostname: url.hostname };
}

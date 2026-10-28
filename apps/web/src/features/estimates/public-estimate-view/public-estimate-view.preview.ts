import { reviewEstimatePaper, type EstimatePaperSource } from "../estimate-preview-paper/estimate-preview-paper.preview";

export type PublicEstimateSnapshot = Extract<EstimatePaperSource, { state: "snapshot" }>;
export type PublicEstimateUnavailableState =
  | "expired" | "revoked" | "withdrawn" | "replaced" | "not-found" | "rate-limited" | "error" | "unavailable";
/** The public host resolves token availability/expiry before supplying an authorized frozen snapshot. */
export type PublicEstimateSource =
  | { state: "ready"; snapshot: PublicEstimateSnapshot }
  | { state: "loading" | PublicEstimateUnavailableState };
export type PublicEstimateReview =
  | { state: "ready"; snapshot: PublicEstimateSnapshot }
  | { state: "loading" | PublicEstimateUnavailableState; snapshot: null };

/** Never expose stale customer data in loading/inactive states or replace an invalid snapshot with a Draft. */
export function reviewPublicEstimate(source: PublicEstimateSource): PublicEstimateReview {
  if (source.state !== "ready") return { state: source.state, snapshot: null };
  if (source.snapshot.state !== "snapshot" || !reviewEstimatePaper(source.snapshot).canPrint) {
    return { state: "unavailable", snapshot: null };
  }
  return { state: "ready", snapshot: source.snapshot };
}

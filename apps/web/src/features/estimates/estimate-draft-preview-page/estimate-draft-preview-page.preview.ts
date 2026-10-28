import { estimateDraftPaperContent, type EstimateEditorSeed } from "@salesmora/data";
import type { EstimatePaperSource } from "../estimate-preview-paper/estimate-preview-paper.preview";

export function estimateDraftPaperSource(
  seed: EstimateEditorSeed,
): Extract<EstimatePaperSource, { state: "draft" }> | null {
  const estimate = seed.estimate;
  if (!estimate || estimate.status !== "draft" || estimate.archived) return null;
  return {
    state: "draft",
    content: estimateDraftPaperContent(seed),
  };
}

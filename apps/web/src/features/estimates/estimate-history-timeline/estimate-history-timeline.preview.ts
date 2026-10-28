import type { EstimateHistoryEvent } from "@salesmora/contracts";
export type { EstimateDecisionChannel } from "../estimate-preview.types";
export type {
  EstimateHistoryField, EstimateHistoryChange, EstimateHistorySource, EstimateHistoryEvent,
} from "@salesmora/contracts";
import { estimateTimestamp, isEstimateLocalDate } from "../estimate-timestamp";
export {
  createEstimateTimestampFormatter as createEstimateHistoryDateFormatter,
  formatEstimateTimestamp as estimateHistoryTimestamp,
} from "../estimate-timestamp";

export function orderEstimateHistory(events: readonly EstimateHistoryEvent[]): EstimateHistoryEvent[] {
  return [...events].sort((a, b) => {
    const leftTime = estimateTimestamp(a.createdAt), rightTime = estimateTimestamp(b.createdAt);
    const left = Number.isFinite(leftTime) ? leftTime : -Infinity;
    const right = Number.isFinite(rightTime) ? rightTime : -Infinity;
    return left === right ? 0 : left > right ? -1 : 1;
  });
}

const decisionDate = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" });
export function estimateHistoryDecisionDate(value: string): string | null {
  return isEstimateLocalDate(value) ? decisionDate.format(new Date(`${value}T00:00:00Z`)) : null;
}

import { describe, expect, it } from "vitest";
import { estimateHistoryFixtures as events } from "./estimate-history-timeline.data";
import {
  createEstimateHistoryDateFormatter, estimateHistoryDecisionDate,
  estimateHistoryTimestamp, orderEstimateHistory,
} from "./estimate-history-timeline.preview";

describe("estimate history ordering", () => {
  it("sorts newest first without changing the input page", () => {
    const input = Object.freeze([...events].reverse());
    expect(orderEstimateHistory(input).map((event) => event.id)).toEqual(events.map((event) => event.id));
    expect(input.map((event) => event.id)).toEqual([...events].reverse().map((event) => event.id));
  });
  it("retains server order for equal instants, including different offsets", () => {
    const input = [
      { ...events[0], id: "first", createdAt: "2026-10-22T15:00:00-04:00" },
      { ...events[0], id: "second", createdAt: "2026-10-22T19:00:00Z" },
    ];
    expect(orderEstimateHistory(input).map((event) => event.id)).toEqual(["first", "second"]);
  });
  it("places invalid times last in original order, even before the Unix epoch", () => {
    const input = ["bad", "1969-01-01T00:00:00Z", "", "2026-02-30T00:00:00Z"]
      .map((createdAt, index) => ({ ...events[0], id: String(index), createdAt }));
    expect(orderEstimateHistory(input).map((event) => event.id)).toEqual(["1", "0", "2", "3"]);
  });
  it("supports an empty page", () => { expect(orderEstimateHistory([])).toEqual([]); });
});

describe("estimate history workspace times", () => {
  const formatter = createEstimateHistoryDateFormatter("America/New_York");
  it("uses the workspace day rather than the UTC day", () => {
    expect(estimateHistoryTimestamp("2026-10-22T01:30:00Z", formatter)).toBe("Oct 21, 2026, 9:30 PM EDT");
  });
  it("distinguishes repeated local times at the end of daylight saving", () => {
    expect(estimateHistoryTimestamp("2026-11-01T05:30:00Z", formatter)).toBe("Nov 1, 2026, 1:30 AM EDT");
    expect(estimateHistoryTimestamp("2026-11-01T06:30:00Z", formatter)).toBe("Nov 1, 2026, 1:30 AM EST");
  });
  it("handles the daylight-saving spring gap", () => {
    expect(estimateHistoryTimestamp("2026-03-08T06:59:00Z", formatter)).toBe("Mar 8, 2026, 1:59 AM EST");
    expect(estimateHistoryTimestamp("2026-03-08T07:00:00Z", formatter)).toBe("Mar 8, 2026, 3:00 AM EDT");
  });
  it("supports fractional-offset workspaces and explicit UTC", () => {
    expect(estimateHistoryTimestamp("2026-10-22T19:00:00Z", createEstimateHistoryDateFormatter("Asia/Kathmandu"))).toBe("Oct 23, 2026, 12:45 AM GMT+5:45");
    expect(estimateHistoryTimestamp("2026-10-22T19:00:00Z", createEstimateHistoryDateFormatter("UTC"))).toBe("Oct 22, 2026, 7:00 PM UTC");
  });
  it.each(["", "Invalid/Workspace", "Mars/Olympus"])("reports invalid timezone %j without falling back", (timezone) => {
    expect(createEstimateHistoryDateFormatter(timezone)).toBeNull();
  });
  it("does not display timestamps without a valid timezone", () => {
    expect(estimateHistoryTimestamp(events[0].createdAt, null)).toBeNull();
  });
  it.each([
    "", "bad", "2026-10-22", "2026-10-22T19:00:00", "10/22/2026",
    "2026-02-30T00:00:00Z", "2026-13-01T00:00:00Z", "0000-01-01T00:00:00Z",
    "2026-10-22T24:00:00Z", "2026-10-22T19:60:00Z", "2026-10-22T19:00:60Z",
    "2026-10-22T19:00:00+99:00",
  ])("reports invalid or ambiguous timestamp %j", (value) => {
    expect(estimateHistoryTimestamp(value, formatter)).toBeNull();
  });
  it("accepts real leap days, milliseconds and offset timestamps", () => {
    expect(estimateHistoryTimestamp("2024-02-29T19:00:00.123Z", formatter)).toBe("Feb 29, 2024, 2:00 PM EST");
    expect(estimateHistoryTimestamp("2026-10-22T15:00:00-04:00", formatter)).toBe("Oct 22, 2026, 3:00 PM EDT");
  });
});

describe("estimate customer decision dates", () => {
  it("formats a calendar date without timezone drift", () => {
    expect(estimateHistoryDecisionDate("2026-10-22")).toBe("Oct 22, 2026");
    expect(estimateHistoryDecisionDate("2024-02-29")).toBe("Feb 29, 2024");
  });
  it.each(["", "bad", "0000-01-01", "2026-02-29", "2026-04-31", "2026-13-01", "2026-10-22T00:00:00Z"])("reports invalid decision date %j", (value) => {
    expect(estimateHistoryDecisionDate(value)).toBeNull();
  });
});

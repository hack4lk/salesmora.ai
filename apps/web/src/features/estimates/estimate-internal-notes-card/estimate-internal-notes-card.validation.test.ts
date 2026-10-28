import { describe, expect, it } from "vitest";
import { estimateInternalNotesCardData as c } from "./estimate-internal-notes-card.data";
import { validateEstimateInternalNotes } from "./estimate-internal-notes-card.validation";

describe("Estimate internal notes presentation validation", () => {
  it.each(["", "   ", "\n\t", c.stories.value, c.stories.literalText])(
    "allows optional plain-text staff notes without changing them (%s)", (value) => {
      const original = value;
      expect(validateEstimateInternalNotes(value)).toBeUndefined();
      expect(value).toBe(original);
    },
  );

  it("accepts exactly 5,000 characters", () => {
    expect(validateEstimateInternalNotes("N".repeat(5000))).toBeUndefined();
  });

  it.each(["N".repeat(5001), `${"N".repeat(5000)} `, " ".repeat(5001)])(
    "rejects overlong raw notes rather than trimming or truncating them", (value) => {
      expect(validateEstimateInternalNotes(value)).toBe(c.tooLong);
      expect(value.length).toBe(5001);
    },
  );

  it("counts line breaks within the limit", () => {
    expect(validateEstimateInternalNotes(`${"N".repeat(4999)}\n`)).toBeUndefined();
    expect(validateEstimateInternalNotes(`${"N".repeat(5000)}\n`)).toBe(c.tooLong);
  });
});

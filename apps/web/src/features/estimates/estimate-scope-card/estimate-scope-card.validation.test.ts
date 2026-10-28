import { describe, expect, it } from "vitest";
import { estimateScopeCardData as c } from "./estimate-scope-card.data";
import { validateEstimateScope } from "./estimate-scope-card.validation";

describe("Estimate scope presentation validation", () => {
  it.each(["", "   ", "\n\t", c.stories.value, c.stories.literalText])(
    "allows optional plain-text scope without changing it (%s)", (value) => {
      const original = value;
      expect(validateEstimateScope(value)).toBeUndefined();
      expect(value).toBe(original);
    },
  );

  it("accepts exactly 5,000 characters", () => {
    expect(validateEstimateScope("S".repeat(5000))).toBeUndefined();
  });

  it.each(["S".repeat(5001), `${"S".repeat(5000)} `, " ".repeat(5001)])(
    "rejects overlong raw input rather than trimming or truncating it", (value) => {
      expect(validateEstimateScope(value)).toBe(c.tooLong);
      expect(value.length).toBe(5001);
    },
  );

  it("counts line breaks within the limit", () => {
    expect(validateEstimateScope(`${"S".repeat(4999)}\n`)).toBeUndefined();
    expect(validateEstimateScope(`${"S".repeat(5000)}\n`)).toBe(c.tooLong);
  });
});

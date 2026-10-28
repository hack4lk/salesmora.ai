import { describe, expect, it } from "vitest";
import { estimateTermsCardData as c } from "./estimate-terms-card.data";
import { validateEstimateTerms, type EstimateTermsValues } from "./estimate-terms-card.validation";

const value: EstimateTermsValues = c.stories.value;
const options = { today: c.stories.today };

describe("Estimate terms presentation validation", () => {
  it("accepts populated terms without changing text, dates or deposit", () => {
    const input = { ...value, message: "  Hello\nworld  " };
    const original = structuredClone(input);
    expect(validateEstimateTerms(input, options)).toEqual({});
    expect(input).toEqual(original);
  });

  it.each(["draft", "send", "publish"] as const)("allows all optional text to be empty for %s", (purpose) => {
    expect(validateEstimateTerms({ ...value, message: "", paymentTerms: "", termsNote: "" }, { ...options, purpose })).toEqual({});
  });

  it.each(["message", "paymentTerms", "termsNote"] as const)("enforces the exact %s character limit without trimming", (field) => {
    const limit = c.fields[field].limit;
    expect(validateEstimateTerms({ ...value, [field]: "X".repeat(limit) }, options)).toEqual({});
    expect(validateEstimateTerms({ ...value, [field]: `${"X".repeat(limit)} ` }, options)).toEqual({ [field]: c.errors[field] });
  });

  it("reports all overlong fields together", () => {
    expect(validateEstimateTerms({
      ...value, message: "X".repeat(2001), paymentTerms: "X".repeat(501), termsNote: "X".repeat(5001),
    }, options)).toEqual({ message: c.errors.message, paymentTerms: c.errors.paymentTerms, termsNote: c.errors.termsNote });
  });

  it.each(["", "2026-10-21", "2026-10-22", "2026-12-31"])("permits incomplete or past Draft dates (%s)", (validUntil) => {
    expect(validateEstimateTerms({ ...value, validUntil }, options)).toEqual({});
  });

  it.each(["send", "publish"] as const)("requires today or later to %s", (purpose) => {
    expect(validateEstimateTerms({ ...value, validUntil: "" }, { ...options, purpose })).toEqual({ validUntil: c.errors.dateRequired });
    expect(validateEstimateTerms({ ...value, validUntil: "2026-10-21" }, { ...options, purpose })).toEqual({ validUntil: c.errors.datePast });
    expect(validateEstimateTerms({ ...value, validUntil: c.stories.today }, { ...options, purpose })).toEqual({});
    expect(validateEstimateTerms(value, { ...options, purpose })).toEqual({});
  });

  it.each([
    " ", "2026-2-01", "2026-02-30", "2026-02-29", "2026-04-31", "2026-13-01",
    "2026-00-01", "2026-01-00", "0000-01-01", "2026-11-21T00:00:00Z", " 2026-11-21", "not-a-date",
  ])("rejects a nonempty malformed date even on a Draft (%s)", (validUntil) => {
    expect(validateEstimateTerms({ ...value, validUntil }, options)).toEqual({ validUntil: c.errors.validUntil });
  });

  it.each(["2028-02-29", "2000-02-29", "2026-03-08", "2026-11-01", "0099-12-31", "9999-12-31"])(
    "accepts real local dates without timezone or DST shifts (%s)", (validUntil) => {
      expect(validateEstimateTerms({ ...value, validUntil }, options)).toEqual({});
    },
  );

  it("rejects a non-leap century rather than normalizing to March", () => {
    expect(validateEstimateTerms({ ...value, validUntil: "2100-02-29" }, options)).toEqual({ validUntil: c.errors.validUntil });
  });

  it("uses supplied workspace today rather than the runtime's date", () => {
    expect(validateEstimateTerms({ ...value, validUntil: "2026-10-22" }, { today: "2026-10-23", purpose: "send" }))
      .toEqual({ validUntil: c.errors.datePast });
    expect(validateEstimateTerms({ ...value, validUntil: "2026-10-22" }, { today: "2026-10-22", purpose: "send" })).toEqual({});
  });

  it.each(["", "2026-02-30", "not-a-date"])("explicitly blocks sharing without a valid workspace date (%s)", (today) => {
    expect(validateEstimateTerms(value, { today, purpose: "send" })).toEqual({ validUntil: c.errors.todayUnavailable });
  });

  it("does not duplicate or silently normalize shared deposit validation", () => {
    const input: EstimateTermsValues = { ...value, deposit: { type: "percent", value: "100.001" } };
    expect(validateEstimateTerms(input, options)).toEqual({});
    expect(input.deposit).toEqual({ type: "percent", value: "100.001" });
  });
});

import { describe, expect, it } from "vitest";
import { estimatePaymentOptionData as c } from "./estimate-payment-option.data";
import { reviewEstimatePaymentLink } from "./estimate-payment-option.validation";

describe("manual estimate payment link", () => {
  it.each(["", "  "])("allows no payment option: %j", value => {
    expect(reviewEstimatePaymentLink(value)).toEqual({ state: "empty" });
  });
  it("preserves a payment provider's path, query and fragment", () => {
    const link = "https://payments.example.test/pay?id=EST-2048&token=fictional#checkout";
    expect(reviewEstimatePaymentLink(` ${link} `)).toEqual({
      state: "ready", href: link, hostname: "payments.example.test",
    });
  });
  it.each([
    "javascript:alert(1)", "data:text/html,pay", "http://payments.example.test",
    "//payments.example.test/pay", "https:payments.example.test/pay",
    "https://user:password@payments.example.test", "https://user@payments.example.test",
    "https://payments.example.test/my checkout", "https://payments.example.test/\ncheckout",
    "https://payments.example.test/\\other", "https://", "https://payments.example.test/\u0000checkout",
  ])("withholds unsafe or malformed links: %s", link => {
    expect(reviewEstimatePaymentLink(link).state).toBe("invalid");
  });
  it("validates the exact 2,048-character boundary", () => {
    const prefix = "https://payments.example.test/";
    const link = prefix + "a".repeat(2048 - prefix.length);
    expect(reviewEstimatePaymentLink(link).state).toBe("ready");
    expect(reviewEstimatePaymentLink(`${link}a`)).toEqual({ state: "invalid", error: c.tooLong });
  });
});

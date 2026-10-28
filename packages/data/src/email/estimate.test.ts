import { describe, expect, it } from "vitest";
import { renderEstimateEmail } from "./estimate";
import { estimateEmailData as copy } from "./estimate.data";

describe("customer estimate email", () => {
  it("includes the frozen payment callout in HTML and text and keeps attribution last", () => {
    const paymentLink = 'https://payments.example.test/checkout?token=fictional&reference=%22test%22';
    const email = renderEstimateEmail({ ...copy.stories, paymentLink });
    for (const body of [email.html, email.text]) {
      expect(body).not.toContain("The business has provided an external payment option for this estimate.");
      expect(body).toContain(copy.payment.action);
      expect(body.lastIndexOf(copy.attribution)).toBeGreaterThan(body.lastIndexOf(copy.payment.action));
    }
    expect(email.html).toContain('href="https://payments.example.test/checkout?token=fictional&amp;reference=%22test%22"');
    expect(email.text).toContain(paymentLink);
    expect(email.text).toContain(`${copy.payment.action} - ${copy.payment.link}: ${paymentLink}`);
    expect(renderEstimateEmail(copy.stories).html).not.toContain(copy.payment.action);
    expect(renderEstimateEmail({ ...copy.stories, paymentLink: "" }).text).not.toContain(copy.payment.action);
    expect(() => renderEstimateEmail({ ...copy.stories, paymentLink: "javascript:alert(1)" })).toThrow();
  });
  it("uses only the frozen summary, private link and business reply-to", () => {
    const email = renderEstimateEmail(copy.stories);
    expect(email.subject).toBe(copy.stories.subject);
    expect(email.replyTo).toBe("estimates@example.test");
    for (const body of [email.html, email.text]) {
      expect(body).toContain("$947.93");
      expect(body).toContain("November 18, 2026");
      expect(body).toContain(`http://127.0.0.1:3000/e/${copy.stories.token}`);
      expect(body).toContain(copy.boundary);
      expect(body).not.toMatch(/not a contract or invoice/i);
      expect(body).not.toContain("/estimates/");
      expect(body).not.toContain("internalNotes");
    }
    expect(email.html).toContain('src="cid:salesmora-logo"');
  });
  it("ends with SalesMora attribution and a public learn-more link without customer data", () => {
    const email = renderEstimateEmail(copy.stories);
    expect(email.text).toMatch(/This estimate was created in SalesMora\.ai\. Learn more: https:\/\/salesmora\.ai$/);
    expect(email.html).toContain(copy.attribution);
    expect(email.html).toContain('href="https://salesmora.ai" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"');
    expect(email.html).toContain(`>${copy.learnMore}</a>`);
    expect(email.html.lastIndexOf(copy.attribution)).toBeGreaterThan(email.html.lastIndexOf(copy.fallback));
    expect(new URL(copy.learnMoreURL).search).toBe("");
    expect(new URL(copy.learnMoreURL).hash).toBe("");
  });
  it("escapes customer and business content and does not include unknown fields", () => {
    const input = { ...copy.stories, businessName: "<script>&", name: '<img src="x">', internalNotes: "PRIVATE_FIXTURE" };
    const email = renderEstimateEmail(input);
    expect(email.html).toContain("&lt;script&gt;&amp;");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;img");
    expect(email.text).not.toContain(input.internalNotes);
    expect(email.html).not.toContain(input.internalNotes);
  });
  it.each([
    { subject: "Estimate\r\nBcc: outsider@example.test" }, { replyTo: "invalid" },
    { token: "invalid" }, { totalCents: -1 }, { totalCents: 0.1 },
    { validUntil: "2026-02-30" }, { baseURL: "javascript:alert(1)" },
    { baseURL: "http://user:password@localhost:3000" },
  ])("rejects invalid render input %j", patch => {
    expect(() => renderEstimateEmail({ ...copy.stories, ...patch })).toThrow();
  });
});

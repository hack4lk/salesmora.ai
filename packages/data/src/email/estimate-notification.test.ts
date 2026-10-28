import { describe, expect, it } from "vitest";
import { renderEstimateNotificationEmail } from "./estimate-notification";

const fixture = {
  baseURL: "https://salesmora.example.test",
  workspaceId: "00000000-0000-4000-8000-000000000001",
  event: "viewed" as const,
  estimateId: "00000000-0000-4000-8000-000000000002",
  estimateNumber: "EST-1042",
  estimateName: "Kitchen faucet replacement",
  status: "sent" as const,
};

describe("Estimate notification email", () => {
  it("renders only minimal Estimate details and authorized staff links", () => {
    const email = renderEstimateNotificationEmail(fixture);
    expect(email.subject).toBe("SalesMora.ai: A customer viewed an Estimate");
    expect(email.text).toContain("Estimate: EST-1042");
    expect(email.text).toContain("Name: Kitchen faucet replacement");
    expect(email.text).toContain("Status: Sent");
    expect(email.text).toContain("https://salesmora.example.test/estimates/00000000-0000-4000-8000-000000000002?workspace=00000000-0000-4000-8000-000000000001");
    expect(email.text).not.toMatch(/total|phone|email|payment|customer@example/i);
  });

  it("escapes Estimate content in HTML and rejects unsafe origins or malformed fields", () => {
    const email = renderEstimateNotificationEmail({
      ...fixture,
      estimateName: '<img src=x onerror="alert(1)"> & repair',
    });
    expect(email.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; repair");
    expect(email.html).not.toContain('<img src=x onerror="alert(1)">');
    expect(() => renderEstimateNotificationEmail({ ...fixture, baseURL: "javascript:alert(1)" })).toThrow();
    expect(() => renderEstimateNotificationEmail({ ...fixture, estimateNumber: "EST-1" })).toThrow();
  });
});

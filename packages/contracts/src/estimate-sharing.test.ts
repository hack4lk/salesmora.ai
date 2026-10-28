import { describe, expect, it } from "vitest";
import { estimatePaperContentSchema, estimateShareTokenSchema, shareEstimateSchema } from "./estimate-sharing";
import { estimatePaymentLinkSchema } from "./estimate";

const publish = {
  mode: "publish",
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  estimateId: "b1e7c29c-6aec-4f7d-a0be-e0de8bf648b2",
  expectedVersion: 1,
  submissionId: "f4f5d450-faf8-4f02-b2b8-4d13a5900819",
  snapshotHash: "a".repeat(64),
};

describe("estimate sharing commands", () => {
  it("keeps payment links optional on legacy paper without inserting a default", () => {
    expect(estimatePaperContentSchema.shape.paymentLink.parse(undefined)).toBeUndefined();
  });

  it.each([
    "http://payments.example.test", "javascript:alert(1)", "//payments.example.test",
    "https:payments.example.test", "https://user:secret@payments.example.test",
    "https://payments.example.test/a b", "https://payments.example.test/\\other",
    "https://payments.example.test/\ncheckout", "https://payments.example.test/\u0000checkout",
    " https://payments.example.test", "https://", "https://payments.example.test/\u007f",
  ])("rejects unsafe payment links at the shared server boundary: %s", paymentLink => {
    expect(estimatePaymentLinkSchema.safeParse(paymentLink).success).toBe(false);
  });

  it("accepts no payment and preserves provider parameters at the exact length limit", () => {
    expect(estimatePaymentLinkSchema.parse("")).toBe("");
    const prefix = "https://payments.example.test/pay?token=fictional&reference=";
    const link = prefix + "a".repeat(2048 - prefix.length);
    expect(estimatePaymentLinkSchema.parse(link)).toBe(link);
    expect(estimatePaymentLinkSchema.safeParse(link + "a").success).toBe(false);
  });
  it("allows Publish without an email, and requires valid destination and subject for Send/Resend", () => {
    expect(shareEstimateSchema.safeParse(publish).success).toBe(true);
    for (const mode of ["send", "resend"]) {
      expect(shareEstimateSchema.safeParse({ ...publish, mode }).success).toBe(false);
      expect(shareEstimateSchema.safeParse({
        ...publish, mode, recipientEmail: "fixture@example.test", subject: "Your estimate",
      }).success).toBe(true);
    }
  });

  it.each([
    { expectedVersion: 0 }, { expectedVersion: 1.5 }, { snapshotHash: "short" },
    { workspaceId: "invalid" }, { submissionId: "" }, { content: {} }, { recipientEmail: "" },
  ])("rejects invalid or extra Publish fields: %j", patch => {
    expect(shareEstimateSchema.safeParse({ ...publish, ...patch }).success).toBe(false);
  });

  it.each(["", " ", "Hello\nBcc: other@example.test", "Hello\rBcc: other@example.test"])(
    "rejects blank or header-injected subject %j", subject => {
      expect(shareEstimateSchema.safeParse({
        ...publish, mode: "send", recipientEmail: "fixture@example.test", subject,
      }).success).toBe(false);
    },
  );

  it("restricts logos to the captured local UUID endpoint", () => {
    const logo = estimatePaperContentSchema.shape.business.shape.logoPath;
    expect(logo.safeParse(null).success).toBe(true);
    expect(logo.safeParse(`/api/settings/estimates/logo/${publish.estimateId}`).success).toBe(true);
    for (const path of [
      "/api/settings/estimates/logo/" + "-".repeat(36),
      "/api/settings/estimates/logo/../../files",
      `https://example.test/api/settings/estimates/logo/${publish.estimateId}`,
      `/api/settings/estimates/logo/${publish.estimateId}?workspace=other`,
    ]) expect(logo.safeParse(path).success).toBe(false);
  });

  it("accepts only the bounded URL-safe token shape", () => {
    expect(estimateShareTokenSchema.safeParse("A".repeat(43)).success).toBe(true);
    for (const token of ["", "A".repeat(42), "A".repeat(44), "/".repeat(43)]) {
      expect(estimateShareTokenSchema.safeParse(token).success).toBe(false);
    }
  });
});

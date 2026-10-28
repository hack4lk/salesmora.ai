import { createHash, randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import type { EstimateFrozenSnapshot } from "@salesmora/contracts";
import { validEstimateFrozenSnapshot } from "@salesmora/domain";
import { estimateSnapshotHash } from "./sharing-paper";
import { estimateTokenHash, newEstimateShareToken, recoverEstimateShareToken } from "./share-token";

const masterKey = process.env.FILE_MASTER_KEY;
afterEach(() => {
  if (masterKey === undefined) delete process.env.FILE_MASTER_KEY;
  else process.env.FILE_MASTER_KEY = masterKey;
});

const snapshot: EstimateFrozenSnapshot = {
  formatVersion: 1,
  content: {
    number: "EST-0001", revision: 1, name: "Fixture estimate",
    business: {
      name: "Fixture business", address: "1 Test Avenue", phone: "555-0100",
      email: "estimates@example.test", licenseLine: "", logoPath: null, requireServiceAddress: true,
    },
    recipientName: "Customer", recipientEmail: "", serviceAddress: "2 Test Avenue",
    estimateDate: "2026-10-24", validUntil: "2026-11-01", preparedBy: "Owner", relatedRecord: "",
    scope: "Customer-facing scope", message: "", paymentTerms: "Due within 60 days.",
    termsNote: "Customer-facing terms",
    items: [{ description: "Installation", quantity: "1", unitPrice: "100.00", taxable: false, included: false, unit: "" }],
    discount: { type: "none" }, taxRate: "0", deposit: { type: "percent", value: "25" },
  },
  amounts: {
    lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 0, taxCents: 0,
    totalCents: 10000, depositCents: 2500, balanceCents: 7500,
  },
};

describe("frozen sharing paper", () => {
  it("preserves the exact legacy serialization and hash when paymentLink was absent", () => {
    expect(validEstimateFrozenSnapshot(snapshot)?.content).not.toHaveProperty("paymentLink");
    expect(estimateSnapshotHash(snapshot)).toBe(createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"));
  });

  it("binds a payment link into the captured hash and withholds unsafe links", () => {
    const linked = { ...snapshot, content: { ...snapshot.content, paymentLink: "https://payments.example.test/pay?token=fictional" } };
    expect(validEstimateFrozenSnapshot(linked)).toEqual(linked);
    expect(estimateSnapshotHash(linked)).not.toBe(estimateSnapshotHash(snapshot));
    expect(estimateSnapshotHash({
      ...linked, content: { ...linked.content, paymentLink: "https://payments.example.test/changed" },
    })).not.toBe(estimateSnapshotHash(linked));
    expect(validEstimateFrozenSnapshot({
      ...linked, content: { ...linked.content, paymentLink: "javascript:alert(1)" },
    })).toBeNull();
  });
  it("checks captured totals using the existing decimal calculations", () => {
    expect(validEstimateFrozenSnapshot(snapshot)).toEqual(snapshot);
    expect(validEstimateFrozenSnapshot({
      ...snapshot, amounts: { ...snapshot.amounts, totalCents: 10001 },
    })).toBeNull();
    expect(validEstimateFrozenSnapshot({
      ...snapshot, amounts: { ...snapshot.amounts, lineAmountsCents: [9999] },
    })).toBeNull();
  });

  it("permits blank delivery email for publication but rejects an invalid entered email", () => {
    expect(validEstimateFrozenSnapshot(snapshot)).not.toBeNull();
    expect(validEstimateFrozenSnapshot({
      ...snapshot, content: { ...snapshot.content, recipientEmail: "not-an-email" },
    })).toBeNull();
  });

  it.each([
    { internalNotes: "STAFF_ONLY" },
    { customerId: "private-customer-id" },
    { token: "private-token" },
  ])("rejects non-customer fields rather than dropping them: %j", patch => {
    expect(validEstimateFrozenSnapshot({
      ...snapshot, content: { ...snapshot.content, ...patch },
    })).toBeNull();
  });

  it("does not accept remote logo URLs or incomplete business identity", () => {
    for (const patch of [{ logoPath: "https://example.test/logo.png" }, { email: "" }, { address: "" }]) {
      expect(validEstimateFrozenSnapshot({
        ...snapshot,
        content: { ...snapshot.content, business: { ...snapshot.content.business, ...patch } },
      })).toBeNull();
    }
  });

  it("hashes the same validated paper identically after JSONB changes object-key order", () => {
    const reverseKeys = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(reverseKeys);
      if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).reverse().map(([key, child]) => [key, reverseKeys(child)]));
      }
      return value;
    };
    const parsed = validEstimateFrozenSnapshot(reverseKeys(snapshot));
    expect(parsed).not.toBeNull();
    if (!parsed) throw new Error("Expected valid reordered paper.");
    expect(estimateSnapshotHash(parsed)).toBe(estimateSnapshotHash(snapshot));
    expect(estimateSnapshotHash({
      ...snapshot, content: { ...snapshot.content, paymentTerms: "Changed terms" },
    })).not.toBe(estimateSnapshotHash(snapshot));
  });
});

describe("estimate share tokens", () => {
  it("generates independent 256-bit tokens with hash-only lookup and encrypted recovery", () => {
    process.env.FILE_MASTER_KEY = randomBytes(32).toString("base64");
    const first = newEstimateShareToken();
    const second = newEstimateShareToken();
    const token = recoverEstimateShareToken(first.encryptedToken, first.tokenHash);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(estimateTokenHash(token)).toBe(first.tokenHash);
    expect(first.tokenHash).not.toBe(second.tokenHash);
    expect(JSON.stringify(first)).not.toContain(token);
  });

  it("rejects recovery with the wrong hash, corrupted ciphertext or a different encryption key", () => {
    process.env.FILE_MASTER_KEY = randomBytes(32).toString("base64");
    const stored = newEstimateShareToken();
    expect(() => recoverEstimateShareToken(stored.encryptedToken, "0".repeat(64))).toThrow();
    const bytes = Buffer.from(stored.encryptedToken, "base64");
    bytes[bytes.length - 1] ^= 1;
    expect(() => recoverEstimateShareToken(bytes.toString("base64"), stored.tokenHash)).toThrow();
    process.env.FILE_MASTER_KEY = randomBytes(32).toString("base64");
    expect(() => recoverEstimateShareToken(stored.encryptedToken, stored.tokenHash)).toThrow();
  });

  it("fails explicitly without the existing file-encryption key", () => {
    delete process.env.FILE_MASTER_KEY;
    expect(() => newEstimateShareToken()).toThrow("FILE_MASTER_KEY");
  });
});

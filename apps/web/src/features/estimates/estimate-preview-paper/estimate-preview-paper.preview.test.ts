import { describe, expect, it } from "vitest";
import { calculateEstimateTotals } from "@salesmora/domain";
import { estimatePaperFixture as d, estimatePaperSnapshotFixture as snapshot, estimatePreviewPaperData as c } from "./estimate-preview-paper.data";
import { estimatePaperAmounts, estimatePaperDate, estimatePaperUnitPrice, isEstimatePaperLogoPath, reviewEstimatePaper, type EstimatePaperContent } from "./estimate-preview-paper.preview";

const draft = (content: EstimatePaperContent = d) => reviewEstimatePaper({ state: "draft", content });
describe("estimate customer paper", () => {
  it("permits legacy paper without payment and rejects unsafe captured payment links", () => {
    expect(reviewEstimatePaper(snapshot).canPrint).toBe(true);
    const content = { ...d, paymentLink: "https://payments.example.test/checkout?token=fictional" };
    expect(reviewEstimatePaper({ ...snapshot, content }).content?.paymentLink).toBe(content.paymentLink);
    const invalid = { ...content, paymentLink: "javascript:alert(1)" };
    expect(draft(invalid).issues).toContain(c.issues.paymentLink);
    expect(reviewEstimatePaper({ ...snapshot, content: invalid }).content).toBeNull();
  });
  it("uses the exact approved shared totals", () => {
    expect(draft().issues).toEqual([]);
    expect(draft().amounts).toEqual(snapshot.amounts);
    expect(estimatePaperAmounts(calculateEstimateTotals(d))).toEqual(snapshot.amounts);
  });
  it("renders a validated snapshot using its captured amounts object", () => {
    const result = reviewEstimatePaper(snapshot);
    expect(result.canPrint).toBe(true);
    expect(result.amounts).toBe(snapshot.amounts);
    expect(result.content).toBe(snapshot.content);
  });
  it("does not mutate captured content or amounts", () => {
    const copy = structuredClone(snapshot);
    reviewEstimatePaper(snapshot);
    expect(snapshot).toEqual(copy);
  });
  it.each(["loading", "error", "unavailable"] as const)("blocks %s without a fallback", (state) => {
    expect(reviewEstimatePaper({ state })).toEqual({ content: null, calculation: null, amounts: null, issues: [], canPrint: false });
  });
  it.each(["subtotalCents", "discountCents", "taxCents", "totalCents", "depositCents", "balanceCents"] as const)("blocks a changed captured %s instead of recalculating a replacement", (key) => {
    expect(reviewEstimatePaper({ ...snapshot, amounts: { ...snapshot.amounts, [key]: snapshot.amounts[key] + 1 } }).content).toBeNull();
  });
  it.each([NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])("blocks invalid captured money %s", (value) => {
    expect(reviewEstimatePaper({ ...snapshot, amounts: { ...snapshot.amounts, totalCents: value } }).canPrint).toBe(false);
  });
  it.each([[], [31250, 65000], [31250, 65000, 1], [31250, 65000, 0, 0]].map((lineAmountsCents) => ({ lineAmountsCents })))("blocks mismatched captured line amounts $lineAmountsCents", ({ lineAmountsCents }) => {
    expect(reviewEstimatePaper({ ...snapshot, amounts: { ...snapshot.amounts, lineAmountsCents } }).canPrint).toBe(false);
  });
  it("blocks missing entries in a sparse captured line array", () => {
    expect(reviewEstimatePaper({ ...snapshot, amounts: { ...snapshot.amounts, lineAmountsCents: new Array<number>(3) } }).canPrint).toBe(false);
  });
  it.each([{ estimateId: "" }, { snapshotHash: " " }, { version: 0 }, { version: 1.5 }])("blocks invalid snapshot identity %j", (patch) => {
    expect(reviewEstimatePaper({ ...snapshot, ...patch }).canPrint).toBe(false);
  });
  it("rejects a snapshot whose content was replaced with current prices", () => {
    const content = { ...d, items: [{ ...d.items[0], unitPrice: "999" }, ...d.items.slice(1)] };
    expect(reviewEstimatePaper({ ...snapshot, content }).canPrint).toBe(false);
  });
  it.each([
    { number: "" }, { name: "" }, { name: "x".repeat(121) }, { revision: 0 },
    { recipientName: "" }, { recipientEmail: "invalid" }, { serviceAddress: "" },
    { estimateDate: "2026-02-30" }, { validUntil: "" },
    { scope: "x".repeat(5001) }, { message: "x".repeat(2001) },
    { paymentTerms: "x".repeat(501) }, { termsNote: "x".repeat(5001) },
  ] satisfies Partial<EstimatePaperContent>[])("allows a labelled incomplete Draft but blocks the same snapshot: %j", (patch) => {
    const content = { ...d, ...patch };
    expect(draft(content).canPrint).toBe(true);
    expect(draft(content).issues.length).toBeGreaterThan(0);
    expect(reviewEstimatePaper({ ...snapshot, content }).canPrint).toBe(false);
  });
  it.each(["name", "address", "phone", "email"] as const)("flags an incomplete business %s", (key) => {
    expect(draft({ ...d, business: { ...d.business, [key]: "" } }).issues).toContain(c.issues.business);
  });
  it("allows omitted email for Publish and omitted optional address", () => {
    const content = { ...d, recipientEmail: "", serviceAddress: "", business: { ...d.business, requireServiceAddress: false } };
    expect(draft(content).issues).toEqual([]);
    expect(reviewEstimatePaper({ ...snapshot, content }).canPrint).toBe(true);
  });
  it("does not reject old dates by consulting the browser clock", () => {
    expect(reviewEstimatePaper({ ...snapshot, content: { ...d, estimateDate: "2000-01-01", validUntil: "2000-01-31" } }).canPrint).toBe(true);
  });
  it("retains valid totals when only the deposit is invalid", () => {
    const result = draft({ ...d, deposit: { type: "percent", value: "101" } });
    expect(result.canPrint).toBe(true);
    expect(result.amounts).toBeNull();
    expect(result.calculation?.totalCents).toBe(96917);
    expect(result.calculation?.depositCents).toBeNull();
    expect(result.calculation?.balanceCents).toBeNull();
  });
  it.each(["", "-1", "1e2", "1.234", "1000000.01", "0"])("never changes invalid unit price %j into zero", (unitPrice) => {
    const line = { ...d.items[0], unitPrice };
    expect(estimatePaperUnitPrice(line)).toBeNull();
    expect(draft({ ...d, items: [line] }).amounts).toBeNull();
  });
  it.each([["0.29", 29], ["1.01", 101], ["1000000.00", 100000000], [" 2.50 ", 250]] as const)("formats exact unit price %s through shared decimal parsing", (unitPrice, expected) => {
    expect(estimatePaperUnitPrice({ ...d.items[0], quantity: "invalid", unitPrice })).toBe(expected);
  });
  it("retains explicit included zero without an invalid quantity default", () => {
    expect(estimatePaperUnitPrice(d.items[2])).toBe(0);
    expect(draft({ ...d, items: [{ ...d.items[2], quantity: "" }] }).amounts).toBeNull();
  });
  it.each([0, 101])("blocks invalid item count %s in snapshots", (count) => {
    const content = { ...d, items: Array.from({ length: count }, () => d.items[0]) };
    expect(draft(content).issues).toContain(c.issues.items);
    expect(reviewEstimatePaper({ ...snapshot, content }).canPrint).toBe(false);
  });
  it("does not cap the valid tax-inclusive total at the subtotal ceiling", () => {
    const result = draft({ ...d, items: [{ ...d.items[0], quantity: "10", unitPrice: "1000000", taxable: true }], discount: { type: "none" }, taxRate: "100", deposit: { type: "percent", value: "25" } });
    expect(result.issues).toEqual([]);
    expect(result.amounts?.totalCents).toBe(2_000_000_000);
    expect(result.amounts?.depositCents).toBe(500_000_000);
    expect(result.amounts?.balanceCents).toBe(1_500_000_000);
  });
  it("accepts the exact agreed text limits", () => {
    expect(draft({ ...d, scope: "s".repeat(5000), message: "m".repeat(2000), paymentTerms: "p".repeat(500), termsNote: "t".repeat(5000) }).issues).toEqual([]);
  });
  it.each(["/branding/salesmora-logo.svg", "/files/customer-logo.png"])("allows a host-authorized same-origin asset %s", (path) => {
    expect(isEstimatePaperLogoPath(path)).toBe(true);
  });
  it.each(["https://example.com/logo.png", "//example.com/logo.png", "data:image/svg+xml,test", "/\\example.com/logo", "/logo.png?token=secret", "/logo.svg#id", " logo.png"])("rejects remote, inline or token-bearing logo %j", (path) => {
    expect(isEstimatePaperLogoPath(path)).toBe(false);
    expect(draft({ ...d, business: { ...d.business, logoPath: path } }).issues).toContain(c.issues.logo);
    expect(reviewEstimatePaper({ ...snapshot, content: { ...d, business: { ...d.business, logoPath: path } } }).canPrint).toBe(false);
  });
  it.each(["", "2026-02-30", "0000-01-01", "2026-1-01", "2026-10-22T23:00:00Z"])("does not fabricate a local date for %j", (value) => {
    expect(estimatePaperDate(value)).toBeNull();
  });
  it("prints the whole workspace-local date without browser timezone conversion", () => {
    expect(estimatePaperDate("2026-10-22")).toBe("Oct 22, 2026");
    expect(estimatePaperDate("2024-02-29")).toBe("Feb 29, 2024");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateEstimateTotals } from "@salesmora/domain";
import { estimateBusinessProfileFormData as c } from "./estimate-business-profile-form.data";
import {
  estimateBusinessIdentityIssues, initialEstimateBusinessProfileDraft, projectEstimateBusinessProfile,
  reviewEstimateBusinessProfile, validateEstimateBusinessProfile,
  validateEstimateBusinessLogoFile, validateEstimateBusinessLogoImage,
  type EstimateBusinessProfile, type EstimateBusinessProfileRecord,
} from "./estimate-business-profile-form.preview";

const profile: EstimateBusinessProfile = {
  name: "Sample Business", address: "123 Sample Street", phone: "555-0100", email: "office@example.com", licenseLine: "", logoPath: null,
  requireServiceAddress: false, validForDays: "30", taxRate: "8.875", deposit: { type: "percent", value: "25" },
  paymentPresets: [{ id: "completion", label: "Due on completion", text: "Balance due on completion." }],
  message: "", termsNote: "",
};
const record: EstimateBusinessProfileRecord = { workspaceId: "workspace-1", version: 3, numberPrefix: "EST-", nextNumber: 2049, profile };
const initial = initialEstimateBusinessProfileDraft(record);
const value = { ...initial, profile: { ...profile, name: "Updated business" } };
const input = { source: { state: "ready" as const, record }, value, canRead: true, canManage: true, role: "owner" as const };
describe("estimate business settings validation", () => {
  it("accepts the established identity and exact defaults", () => {
    expect(validateEstimateBusinessProfile(profile)).toEqual({});
    expect(estimateBusinessIdentityIssues(profile)).toEqual([]);
  });
  it("allows incomplete identity to be saved but reports sharing blockers", () => {
    const incomplete = { ...profile, name: " ", address: "", phone: "", email: "" };
    expect(validateEstimateBusinessProfile(incomplete)).toEqual({});
    expect(estimateBusinessIdentityIssues(incomplete)).toEqual(["Business name", "Business address", "Business phone", "Reply-to email"]);
    expect(reviewEstimateBusinessProfile({ ...input, value: { ...value, profile: incomplete } }).request).not.toBeNull();
  });
  it.each(["name", "address", "phone", "licenseLine", "message", "termsNote"] as const)("enforces the exact %s text limit without trimming away overflow", (field) => {
    const limit = c.fields[field].limit;
    expect(validateEstimateBusinessProfile({ ...profile, [field]: "x".repeat(limit) })[field]).toBeUndefined();
    expect(validateEstimateBusinessProfile({ ...profile, [field]: "x".repeat(limit) + " " })[field]).toBeTruthy();
  });
  it.each(["invalid", "a@@example.com", "x".repeat(255)])("rejects invalid nonblank email %s", (email) => {
    expect(validateEstimateBusinessProfile({ ...profile, email }).email).toBe(c.errors.email);
    expect(estimateBusinessIdentityIssues({ ...profile, email })).toContain(c.fields.email.label);
  });
  it("uses established trimmed email validation without changing case in the save projection", () => {
    const next = { ...profile, email: " Office@Example.com " };
    expect(validateEstimateBusinessProfile(next)).toEqual({});
    expect(projectEstimateBusinessProfile(next).email).toBe("Office@Example.com");
  });
  it.each(["1", "30", "365", " 30 "])("accepts calendar-day setting %j", (validForDays) => {
    expect(validateEstimateBusinessProfile({ ...profile, validForDays }).validForDays).toBeUndefined();
  });
  it.each(["", "0", "366", "-1", "1.5", "1e2", "+1", "0000", "999999"])("rejects calendar-day setting %j", (validForDays) => {
    expect(validateEstimateBusinessProfile({ ...profile, validForDays }).validForDays).toBe(c.errors.days);
  });
  it.each(["0", "100", "8.875", " 0.001 "])("accepts exact tax setting %j", (taxRate) => {
    expect(validateEstimateBusinessProfile({ ...profile, taxRate }).taxRate).toBeUndefined();
  });
  it.each(["", "-1", "100.001", "8.8751", "1e2", "+1", "invalid"])("rejects tax setting %j", (taxRate) => {
    expect(validateEstimateBusinessProfile({ ...profile, taxRate }).taxRate).toBe(c.errors.tax);
  });
  it.each(["0", "100", "0.001", "25.125"])("accepts percent deposit %s", (amount) => {
    expect(validateEstimateBusinessProfile({ ...profile, deposit: { type: "percent", value: amount } }).deposit).toBeUndefined();
  });
  it.each(["", "-1", "100.001", "0.0001", "1e2"])("rejects percent deposit %j", (amount) => {
    expect(validateEstimateBusinessProfile({ ...profile, deposit: { type: "percent", value: amount } }).deposit).toBe(c.errors.deposit);
  });
  it.each(["0", "0.01", "20000000.00", " 10.29 "])("accepts fixed deposit %j without inventing a sample estimate total", (amount) => {
    expect(validateEstimateBusinessProfile({ ...profile, deposit: { type: "amount", value: amount } }).deposit).toBeUndefined();
  });
  it.each(["", "-1", "20000000.01", "0.001", "1e3"])("rejects impossible fixed deposit %j", (amount) => {
    expect(validateEstimateBusinessProfile({ ...profile, deposit: { type: "amount", value: amount } }).deposit).toBe(c.errors.deposit);
  });
  it("accepts no deposit without a stale value", () => {
    expect(validateEstimateBusinessProfile({ ...profile, deposit: { type: "none" } }).deposit).toBeUndefined();
    expect(projectEstimateBusinessProfile({ ...profile, deposit: Object.assign({ type: "none" as const }, { value: "private" }) }).deposit).toEqual({ type: "none" });
  });
  it("does not silently reduce a fixed deposit when a Draft total is smaller", () => {
    const deposit = { type: "amount" as const, value: "100" };
    expect(validateEstimateBusinessProfile({ ...profile, deposit }).deposit).toBeUndefined();
    const total = calculateEstimateTotals({ items: [{ description: "Small task", quantity: "1", unitPrice: "10", included: false, taxable: false }], discount: { type: "none" }, taxRate: "0", deposit });
    expect(total.errors.deposit).toBe("deposit-exceeds-total");
    expect(total.depositCents).toBeNull();
  });
  it.each([0, 10])("permits %s payment presets", (count) => {
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets: Array.from({ length: count }, (_, index) => ({ id: String(index), label: "Preset", text: "Terms" })) })).toEqual({});
  });
  it("blocks 11 presets without truncating them", () => {
    const paymentPresets = Array.from({ length: 11 }, (_, index) => ({ id: String(index), label: "Preset", text: "Terms" }));
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets }).paymentPresets).toBe(c.errors.presetCount);
    expect(projectEstimateBusinessProfile({ ...profile, paymentPresets }).paymentPresets).toHaveLength(11);
  });
  it.each([{ id: "", label: "A", text: "Terms" }, { id: "completion", label: "B", text: "Terms" }])("rejects missing or duplicate preset identity %j", (preset) => {
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets: [...profile.paymentPresets, preset] }).paymentPresets).toBe(c.errors.presetIdentity);
  });
  it.each(["", " ", "x".repeat(81)])("rejects invalid preset label %j", (label) => {
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets: [{ id: "a", label, text: "Terms" }] })["preset.0.label"]).toBe(c.errors.presetLabel);
  });
  it.each(["", " ", "x".repeat(501)])("rejects invalid preset wording %j", (text) => {
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets: [{ id: "a", label: "Terms", text }] })["preset.0.text"]).toBe(c.errors.presetText);
  });
  it("accepts exact preset limits and allows identical wording under distinct identities", () => {
    expect(validateEstimateBusinessProfile({ ...profile, paymentPresets: ["a", "b"].map((id) => ({ id, label: "x".repeat(80), text: "t".repeat(500) })) })).toEqual({});
  });
});
describe("version-bound settings writes", () => {
  it("returns an explicit allowlisted version-bound request", () => {
    expect(reviewEstimateBusinessProfile(input).request).toEqual({ workspaceId: record.workspaceId, expectedVersion: record.version, profile: value.profile });
  });
  it.each(["owner", "admin"] as const)("allows an authorized %s", (role) => {
    expect(reviewEstimateBusinessProfile({ ...input, role }).request).not.toBeNull();
  });
  it.each(["office", "field"] as const)("does not let a grant alone elevate %s to manage settings", (role) => {
    expect(reviewEstimateBusinessProfile({ ...input, role }).editable).toBe(false);
    expect(reviewEstimateBusinessProfile({ ...input, role }).request).toBeNull();
  });
  it("requires an explicit host management grant even for Owner", () => {
    expect(reviewEstimateBusinessProfile({ ...input, canManage: false }).request).toBeNull();
  });
  it("hides all issues/validation on loss of read access", () => {
    expect(reviewEstimateBusinessProfile({ ...input, canRead: false, conflict: true, value: { ...value, workspaceId: "wrong" } })).toEqual({ issues: [], editable: false, dirty: false, errors: {}, request: null });
  });
  it.each(["loading", "error", "unavailable"] as const)("blocks %s without using retained values", (state) => {
    expect(reviewEstimateBusinessProfile({ ...input, source: { state } }).request).toBeNull();
  });
  it.each([{ workspaceId: "wrong" }, { expectedVersion: 2 }, { expectedVersion: 0 }])("rejects mismatched edits %j", (patch) => {
    const review = reviewEstimateBusinessProfile({ ...input, value: { ...value, ...patch } });
    expect(review.editable).toBe(false);
    expect(review.issues).toContain(c.errors.binding);
    expect(review.request).toBeNull();
  });
  it.each([{ workspaceId: "" }, { version: 0 }, { version: NaN }, { version: 1.5 }])("rejects unavailable authoritative identity %j", (patch) => {
    expect(reviewEstimateBusinessProfile({ ...input, source: { state: "ready", record: { ...record, ...patch } } }).issues).toContain(c.errors.record);
  });
  it("blocks a conflict until the host supplies current source and resets the draft binding", () => {
    expect(reviewEstimateBusinessProfile({ ...input, conflict: true }).request).toBeNull();
    const current = { ...record, version: 4 };
    expect(reviewEstimateBusinessProfile({ ...input, source: { state: "ready", record: current } }).request).toBeNull();
    expect(reviewEstimateBusinessProfile({ ...input, source: { state: "ready", record: current }, value: { ...initialEstimateBusinessProfileDraft(current), profile: value.profile } }).request?.expectedVersion).toBe(4);
  });
  it("does not save unchanged or outer-whitespace-only identity changes", () => {
    expect(reviewEstimateBusinessProfile({ ...input, value: initial }).dirty).toBe(false);
    expect(reviewEstimateBusinessProfile({ ...input, value: { ...initial, profile: { ...profile, name: ` ${profile.name} ` } } }).request).toBeNull();
  });
  it("preserves significant customer-text whitespace as an actual edit", () => {
    expect(reviewEstimateBusinessProfile({ ...input, value: { ...initial, profile: { ...profile, message: "\n" } } }).dirty).toBe(true);
  });
  it("does not pass invalid values despite an authorized binding", () => {
    expect(reviewEstimateBusinessProfile({ ...input, value: { ...value, profile: { ...profile, taxRate: "101" } } }).request).toBeNull();
  });
  it("projects away private fields, numbering, role, asset metadata and automatic preset selections", () => {
    const contaminated = Object.assign({}, value.profile, { internalNotes: "PRIVATE", numberPrefix: "OTHER", nextNumber: 1, role: "owner", logoAsset: { secret: "PRIVATE" }, defaultPresetId: "completion" });
    const request = reviewEstimateBusinessProfile({ ...input, value: { ...value, profile: contaminated } }).request;
    expect(request?.profile).toEqual(value.profile);
    expect(JSON.stringify(request)).not.toContain("PRIVATE");
    expect(Object.keys(request ?? {})).toEqual(["workspaceId", "expectedVersion", "profile"]);
  });
  describe("business logo selection", () => {
    afterEach(() => vi.unstubAllGlobals());
    it.each(["image/png", "image/jpeg", "image/webp"])("accepts the exact 2 MB boundary for %s", (type) => {
      expect(validateEstimateBusinessLogoFile({ type, size: 2 * 1024 * 1024 })).toBeNull();
      expect(validateEstimateBusinessLogoFile({ type, size: 2 * 1024 * 1024 + 1 })).toBe(c.errors.logoSize);
      expect(validateEstimateBusinessLogoFile({ type, size: 0 })).toBe(c.errors.logoSize);
    });
    it.each(["image/svg+xml", "image/gif", "", "text/plain", "application/octet-stream"])("rejects unsupported MIME %j", (type) => {
      expect(validateEstimateBusinessLogoFile({ type, size: 10 })).toBe(c.errors.logoType);
    });
    it.each(["", "https://example.com/logo.png", "//other/logo.png", "/logo.png?token=private", "/bad logo.png", "blob:local", "data:image/png;base64,AA=="])("blocks invalid stored logo path %j", (logoPath) => {
      const next = { ...profile, logoPath };
      expect(validateEstimateBusinessProfile(next).logoPath).toBe(c.errors.logoPath);
      expect(reviewEstimateBusinessProfile({ ...input, value: { ...value, profile: next } }).request).toBeNull();
    });
    it("includes only the staged local logo path in a version-bound save and permits removal", () => {
      const logoPath = "/assets/workspace-1/logo-version-2.png";
      const next = { ...profile, logoPath };
      expect(reviewEstimateBusinessProfile({ ...input, value: { ...initial, profile: next } }).request?.profile.logoPath).toBe(logoPath);
      const saved = { ...record, profile: next };
      expect(reviewEstimateBusinessProfile({ ...input, source: { state: "ready", record: saved }, value: initial }).request?.profile.logoPath).toBeNull();
    });
    const formats = [
      { type: "image/png", bytes: [137, 80, 78, 71, 13, 10, 26, 10] },
      { type: "image/jpeg", bytes: [255, 216, 255] },
      { type: "image/webp", bytes: [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80] },
    ];
    it.each(formats)("requires matching bytes and a decodable $type image", async ({ type, bytes }) => {
      const close = vi.fn();
      const decode = vi.fn().mockResolvedValue({ width: 24, height: 24, close });
      vi.stubGlobal("createImageBitmap", decode);
      const file = new File([new Uint8Array(bytes)], "logo", { type });
      expect(await validateEstimateBusinessLogoImage(file)).toBeNull();
      expect(decode).toHaveBeenCalledWith(file);
      expect(close).toHaveBeenCalledOnce();
    });
    it("rejects disguised SVG before image decoding", async () => {
      const decode = vi.fn();
      vi.stubGlobal("createImageBitmap", decode);
      expect(await validateEstimateBusinessLogoImage(new File(["<svg></svg>"], "logo.png", { type: "image/png" }))).toBe(c.errors.logoImage);
      expect(decode).not.toHaveBeenCalled();
    });
    it("rejects corrupt image bytes even when the header matches", async () => {
      vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode failed")));
      expect(await validateEstimateBusinessLogoImage(new File([new Uint8Array(formats[0].bytes)], "logo.png", { type: "image/png" }))).toBe(c.errors.logoImage);
    });
    it("rejects a zero-sized decoded image and releases the bitmap", async () => {
      const close = vi.fn();
      vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 0, height: 1, close }));
      expect(await validateEstimateBusinessLogoImage(new File([new Uint8Array(formats[0].bytes)], "logo.png", { type: "image/png" }))).toBe(c.errors.logoImage);
      expect(close).toHaveBeenCalledOnce();
    });
  });
  it("initializes isolated controlled nested objects without mutating the record", () => {
    expect(initial.profile).not.toBe(record.profile);
    expect(initial.profile.paymentPresets).not.toBe(record.profile.paymentPresets);
    expect(initial.profile.paymentPresets[0]).not.toBe(record.profile.paymentPresets[0]);
    expect(initial.profile.deposit).not.toBe(record.profile.deposit);
  });
  it("keeps multiline default text and preset wording verbatim", () => {
    const text = "  Plain text\nwith line breaks.  ";
    const next = projectEstimateBusinessProfile({ ...profile, message: text, termsNote: text, paymentPresets: [{ id: "p", label: " Label ", text }] });
    expect(next.message).toBe(text);
    expect(next.termsNote).toBe(text);
    expect(next.paymentPresets[0]).toEqual({ id: "p", label: "Label", text });
  });
});

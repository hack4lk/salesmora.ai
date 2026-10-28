import { leadSchema } from "@salesmora/contracts";
import { calculateEstimateTotals, type EstimateAdjustment } from "@salesmora/domain";
import type { EstimateRole } from "../estimate-preview.types";
import type { EstimatePaymentPreset } from "../estimate-terms-card/estimate-terms-card";
import { isEstimatePaperLogoPath } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { estimateBusinessProfileFormData as c, estimateBusinessProfileLimits as limits, estimateBusinessLogoLimits as logoLimits } from "./estimate-business-profile-form.data";

export type EstimateBusinessProfile = {
  name: string; address: string; phone: string; email: string; licenseLine: string;
  logoPath: string | null;
  requireServiceAddress: boolean; validForDays: string; taxRate: string; deposit: EstimateAdjustment;
  paymentPresets: readonly EstimatePaymentPreset[]; message: string; termsNote: string;
};
export type EstimateBusinessProfileRecord = {
  workspaceId: string; version: number; numberPrefix: string; nextNumber: number;
  profile: EstimateBusinessProfile;
};
export type EstimateBusinessProfileSource =
  | { state: "ready"; record: EstimateBusinessProfileRecord }
  | { state: "loading" | "error" | "unavailable" };
export type EstimateBusinessProfileDraft = { workspaceId: string; expectedVersion: number; profile: EstimateBusinessProfile };
export type EstimateBusinessLogoUpload = { workspaceId: string; expectedVersion: number; file: File };
export type EstimateBusinessProfileErrors = Partial<Record<keyof EstimateBusinessProfile | `preset.${number}.label` | `preset.${number}.text`, string>>;

export function validateEstimateBusinessLogoFile(file: Pick<File, "size" | "type">): string | null {
  if (!logoLimits.types.some((type) => type === file.type)) return c.errors.logoType;
  return file.size > 0 && file.size <= logoLimits.bytes ? null : c.errors.logoSize;
}

export async function validateEstimateBusinessLogoImage(file: File): Promise<string | null> {
  const error = validateEstimateBusinessLogoFile(file);
  if (error) return error;
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const signature = file.type === "image/png" ? [137, 80, 78, 71, 13, 10, 26, 10]
      : file.type === "image/jpeg" ? [255, 216, 255] : [82, 73, 70, 70];
    if (!signature.every((byte, index) => bytes[index] === byte)
      || (file.type === "image/webp" && ![87, 69, 66, 80].every((byte, index) => bytes[index + 8] === byte))) return c.errors.logoImage;
    const image = await createImageBitmap(file);
    const valid = image.width > 0 && image.height > 0;
    image.close();
    return valid ? null : c.errors.logoImage;
  } catch { return c.errors.logoImage; }
}

/** Explicit projection keeps unrelated source fields, numbering and permissions out of a settings write. */
export function projectEstimateBusinessProfile(value: EstimateBusinessProfile): EstimateBusinessProfile {
  return {
    name: value.name.trim(), address: value.address.trim(), phone: value.phone.trim(),
    email: value.email.trim(), licenseLine: value.licenseLine.trim(),
    logoPath: value.logoPath,
    requireServiceAddress: value.requireServiceAddress, validForDays: value.validForDays.trim(),
    taxRate: value.taxRate.trim(), deposit: value.deposit.type === "none" ? { type: "none" } : { type: value.deposit.type, value: value.deposit.value.trim() },
    paymentPresets: value.paymentPresets.map((preset) => ({ id: preset.id, label: preset.label.trim(), text: preset.text })),
    message: value.message, termsNote: value.termsNote,
  };
}
export function initialEstimateBusinessProfileDraft(record: EstimateBusinessProfileRecord): EstimateBusinessProfileDraft {
  return { workspaceId: record.workspaceId, expectedVersion: record.version, profile: projectEstimateBusinessProfile(record.profile) };
}
export function validateEstimateBusinessProfile(value: EstimateBusinessProfile): EstimateBusinessProfileErrors {
  const errors: EstimateBusinessProfileErrors = {};
  for (const field of ["name", "address", "phone", "licenseLine", "message", "termsNote"] as const) {
    if (value[field].length > c.fields[field].limit) errors[field] = c.errors.tooLong(c.fields[field].label, c.fields[field].limit);
  }
  if (!leadSchema.shape.email.safeParse(value.email).success) errors.email = c.errors.email;
  if (value.logoPath !== null && !isEstimatePaperLogoPath(value.logoPath)) errors.logoPath = c.errors.logoPath;
  if (!/^\d{1,3}$/.test(value.validForDays.trim()) || Number(value.validForDays.trim()) < 1 || Number(value.validForDays.trim()) > limits.validForDays) errors.validForDays = c.errors.days;
  const tax = calculateEstimateTotals({ items: [], discount: { type: "none" }, taxRate: value.taxRate, deposit: { type: "none" } });
  if (tax.errors.taxRate) errors.taxRate = c.errors.tax;
  // Validate a reusable deposit against the domain's maximum reachable total, not an arbitrary sample job.
  const deposit = calculateEstimateTotals({
    items: [{ description: "validation", quantity: "10", unitPrice: "1000000", taxable: true, included: false }],
    discount: { type: "none" }, taxRate: "100", deposit: value.deposit,
  });
  if (deposit.errors.deposit) errors.deposit = c.errors.deposit;
  if (value.paymentPresets.length > limits.presetCount) errors.paymentPresets = c.errors.presetCount;
  const ids = new Set<string>();
  value.paymentPresets.forEach((preset, index) => {
    if (!preset.id.trim() || ids.has(preset.id)) errors.paymentPresets = c.errors.presetIdentity;
    ids.add(preset.id);
    if (!preset.label.trim() || preset.label.length > limits.presetLabel) errors[`preset.${index}.label`] = c.errors.presetLabel;
    if (!preset.text.trim() || preset.text.length > limits.presetText) errors[`preset.${index}.text`] = c.errors.presetText;
  });
  return errors;
}
export function estimateBusinessIdentityIssues(value: EstimateBusinessProfile): string[] {
  const errors = validateEstimateBusinessProfile(value);
  return (["name", "address", "phone", "email"] as const)
    .filter((field) => !value[field].trim() || errors[field]).map((field) => c.fields[field].label);
}
export function reviewEstimateBusinessProfile({
  source, value, role, canRead, canManage, conflict = false,
}: {
  source: EstimateBusinessProfileSource; value: EstimateBusinessProfileDraft;
  role: EstimateRole; canRead: boolean; canManage: boolean; conflict?: boolean;
}): { issues: string[]; editable: boolean; dirty: boolean; errors: EstimateBusinessProfileErrors; request: EstimateBusinessProfileDraft | null } {
  const blocked = { issues: [], editable: false, dirty: false, errors: {}, request: null };
  if (!canRead || source.state !== "ready") return blocked;
  const record = source.record, issues: string[] = [];
  if (!record.workspaceId.trim() || !Number.isSafeInteger(record.version) || record.version < 1) issues.push(c.errors.record);
  if (record.workspaceId !== value.workspaceId || record.version !== value.expectedVersion) issues.push(c.errors.binding);
  if (conflict) issues.push(c.errors.conflict);
  const editable = canManage && (role === "owner" || role === "admin") && !issues.length;
  const errors = validateEstimateBusinessProfile(value.profile);
  const profile = projectEstimateBusinessProfile(value.profile);
  const dirty = JSON.stringify(profile) !== JSON.stringify(projectEstimateBusinessProfile(record.profile));
  return {
    issues, editable, dirty, errors,
    request: editable && dirty && !Object.keys(errors).length ? { workspaceId: record.workspaceId, expectedVersion: record.version, profile } : null,
  };
}

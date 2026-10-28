import { estimatePaperFixture, estimatePaperSnapshotFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import type { EstimateHistoryEvent } from "../estimate-history-timeline/estimate-history-timeline.preview";
import type { EstimateLinkedParent } from "../estimate-linked-record/estimate-linked-record";
import type { EstimateStatus } from "../estimate-preview.types";
import type { EstimateEditorValues } from "./estimate-editor-page.preview";
import { estimateBusinessProfileFixture } from "../estimate-business-profile-form/estimate-business-profile-form.data";
import { searchFixtures } from "../../materials/material-picker/material-picker.data";
import type { JobMember } from "@salesmora/contracts";
import { estimatePreviewData } from "../estimate-preview.data";

export const estimateEditorPageData = {
  title: "New estimate",
  description: "Prepare the scope and pricing, then review before sharing with the customer.",
  previewNotice: "Storybook preview: fictional data only. No records, emails, links or jobs are created.",
  back: "Back to estimates",
  save: "Save draft",
  saving: "Saving draft...",
  preview: "Preview",
  closePreview: "Back to estimate",
  previewTitle: "Customer estimate preview",
  previewDescription: "Customer-facing content only. Private notes and staff activity are excluded.",
  rail: "Estimate activity and actions",
  loading: "Loading estimate...",
  error: "The estimate could not be loaded.",
  forbidden: "This estimate is unavailable in your permitted scope.",
  notFound: "The estimate could not be found.",
  retry: "Try again",
  unsaved: "Unsaved changes",
  neverSaved: "Not saved yet. A number is assigned by the server on the first save.",
  lastUpdated: "Last updated October 22, 2026 at 12:00 PM (America/New_York)",
  preparedBy: (name: string) => `Prepared by ${name}`,
  unknownMember: "Unavailable teammate",
  readOnly: "This record is read-only. Only an authorized, unarchived Draft can be edited.",
  incompleteDraft: "Drafts may omit line items, recipient details and the valid-through date. Complete every added line before saving.",
  saveBeforeSharing: "Save this Draft before opening Send or Publish. Changes are never saved implicitly.",
  validation: "Correct the highlighted details and entered values before saving.",
  invalidItems: "Complete or remove every added line item before saving.",
  invalidAmounts: "Correct the discount, tax or deposit before saving.",
  unknownOwner: "Choose an available prepared-by teammate.",
  conflict: "A newer estimate version is available. Your edits are retained but locked. Reload to review the latest saved version.",
  reload: "Reload saved sample",
  reloaded: "Simulated host reload: the newer saved sample and version are shown. Nothing was fetched from the application.",
  reloadTitle: "Discard edits and reload?",
  reloadDescription: "This replaces your unsaved edits with the saved sample. Nothing is saved to the application.",
  reloadConfirm: "Discard and reload",
  leaveTitle: "Leave with unsaved changes?",
  leaveDescription: "Your edits have not been saved. Stay to keep editing, or discard them before leaving this preview.",
  stay: "Keep editing",
  discard: "Discard changes",
  navigation: "Preview navigation requested. No application route was opened.",
  loadRequest: "Reload requested in this preview. No application data was fetched; the error remains visible.",
  saveRequest: "Save requested in this preview. No authoritative saved revision was returned; your changes remain unsaved.",
  saved: "Simulated host save: only this story's saved sample and version changed. Nothing was persisted.",
  saveError: "The sample save failed. Your edits are retained; try again.",
  actionRequest: "Review confirmed in this preview. No estimate status, delivery, history or job was changed.",
  createDraftRequest: "A new Draft was requested. The server would copy the record and assign a version/number; this preview did not create one.",
  missingSnapshot: "A current saved snapshot is required. Reload the record; current Draft or business data cannot replace it.",
  copyUnavailable: "Copy requested in this preview. No real customer link exists and nothing was copied.",
  subject: (number: string) => `Your estimate ${number}`,
  assistantBadge: "Storybook preview",
  assistantDescription: "The shared assistant for this estimate.",
  assistantText: "Estimate proposal cards and assistant tools are planned next. This shared panel cannot read or change an estimate in this preview.",
  assistantUnavailable: "Estimate assistant tools are not connected in Storybook.",
  today: "2026-10-22",
  timezone: "America/New_York",
  stories: {
    name: "Kitchen remodel estimate",
    editedName: "Kitchen remodel - revised Draft",
    reloadedName: "Kitchen remodel - latest saved sample",
    notes: "STAFF_ONLY_EDITOR_SENTINEL\nConfirm the supplier allowance with the office before sharing.",
    changedBusiness: "Current business identity changed after sharing",
    service: "Kitchen remodel",
    customerId: "11111111-1111-4111-8111-111111111111",
    leadId: "44444444-4444-4444-8444-444444444444",
    jobId: "55555555-5555-4555-8555-555555555555",
    leadNumber: "LD-1048",
    jobNumber: "J-1038",
    customer: "Jordan Lee",
    leadStatus: "Qualified",
    jobStatus: "Scheduled",
    actor: "Alex Morgan",
    savedNewNumber: "EST-2049",
    logoPath: "/branding/salesmora-email-logo.png",
    brokenLogoPath: "/fonts/source-sans-3/source-sans-3-variable.woff2",
    invalidEmail: "invalid-email",
    correctedEmail: "corrected@example.com",
    decisionNote: "Customer confirmed the proposed scope by phone.",
    voidReason: "This proposal was withdrawn after a scope review.",
    permissionLoss: "Remove sample estimate access",
    updateLoss: "Remove sample update permission",
  },
} as const;

export function estimateEditorInitialValues(newDraft = false): EstimateEditorValues {
  const d = estimatePaperFixture;
  const defaults = estimateBusinessProfileFixture.profile;
  const validUntil = new Date(`${estimateEditorPageData.today}T00:00:00Z`);
  validUntil.setUTCDate(validUntil.getUTCDate() + Number(defaults.validForDays));
  return {
    details: {
      name: newDraft ? "" : d.name, recipientName: d.recipientName,
      recipientEmail: d.recipientEmail, serviceAddress: d.serviceAddress, ownerId: "member-alex",
    },
    items: newDraft ? [] : d.items.map(({ unit, ...item }, index) => ({
      ...item, id: `editor-item-${index}`,
      ...(unit ? { catalog: { id: "sample-material", name: item.description, unit, sku: "" } } : {}),
    })),
    totals: { discount: newDraft ? { type: "none" } : structuredClone(d.discount), taxRate: newDraft ? defaults.taxRate : d.taxRate },
    terms: {
      message: newDraft ? defaults.message : d.message, validUntil: newDraft ? validUntil.toISOString().slice(0, 10) : d.validUntil, paymentTerms: newDraft ? "" : d.paymentTerms,
      termsNote: newDraft ? defaults.termsNote : d.termsNote, deposit: structuredClone(newDraft ? defaults.deposit : d.deposit),
    },
    scope: newDraft ? "" : d.scope,
    internalNotes: newDraft ? "" : estimateEditorPageData.stories.notes,
  };
}

export function estimateEditorParent(type: "lead" | "job"): EstimateLinkedParent {
  const s = estimateEditorPageData.stories;
  const customer = { id: s.customerId, name: s.customer };
  return type === "lead"
    ? { type, id: s.leadId, number: s.leadNumber, name: s.service, status: s.leadStatus, customer, contactName: s.customer, href: `/leads/${s.leadId}` }
    : { type, id: s.jobId, number: s.jobNumber, name: s.service, status: s.jobStatus, customer, href: `/jobs/${s.jobId}` };
}

export function estimateEditorHistory(status: EstimateStatus, newDraft: boolean): EstimateHistoryEvent[] {
  if (newDraft) return [];
  const source = { type: "ui" as const, actorName: estimateEditorPageData.stories.actor };
  const events: EstimateHistoryEvent[] = [
    { id: "editor-created", kind: "created", createdAt: "2026-10-22T14:00:00Z", source, changes: [{ kind: "status", before: null, after: "draft" }] },
  ];
  if (status === "draft") return events;
  const shared = status === "published" || status === "superseded" ? "published" : "sent";
  events.push({ id: "editor-shared", kind: shared, createdAt: "2026-10-22T15:00:00Z", source, changes: [{ kind: "status", before: "draft", after: shared }] });
  if (status === "accepted" || status === "declined") events.push({
    id: "editor-decision", kind: "decision-recorded", createdAt: "2026-10-22T16:00:00Z", source,
    changes: [{ kind: "status", before: shared, after: status }],
    decisionDate: estimateEditorPageData.today, channel: "phone", note: estimateEditorPageData.stories.decisionNote,
  });
  else if (status === "expired" || status === "superseded") events.push({
    id: "editor-inactive", kind: status, createdAt: "2026-10-22T16:00:00Z",
    source: { type: "worker" }, changes: [{ kind: "status", before: shared, after: status }],
  });
  else if (status === "void") events.push({
    id: "editor-void", kind: "voided", createdAt: "2026-10-22T16:00:00Z", source,
    changes: [{ kind: "status", before: shared, after: status }], reason: estimateEditorPageData.stories.voidReason,
  });
  return events;
}

export const estimateEditorSnapshot = {
  ...estimatePaperSnapshotFixture,
  content: { ...estimatePaperFixture, preparedBy: estimateEditorPageData.stories.actor },
};

export const estimateEditorCatalogFixture = { search: searchFixtures, canViewPrices: true };
export const estimateEditorJobMembersFixture: JobMember[] = estimatePreviewData.members.map((member, index) => ({
  ...member, role: index === 0 ? "owner" : "office",
}));

const profile = estimateBusinessProfileFixture.profile;
export const estimateEditorCurrentBusiness = {
  name: profile.name, address: profile.address, phone: profile.phone, email: profile.email,
  licenseLine: profile.licenseLine, logoPath: profile.logoPath, requireServiceAddress: profile.requireServiceAddress,
};

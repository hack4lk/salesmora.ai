import type { EstimateCapabilities, EstimateRole, EstimateStatus } from "../estimate-preview.types";
import type { EstimatePaperContent } from "../estimate-preview-paper/estimate-preview-paper.preview";
import type { EstimateMember } from "../estimate-preview.types";
import { estimateEditorPageData as c } from "./estimate-editor-page.data";
import type { EstimateEditorValues } from "./estimate-editor-values";
import { reviewEstimateEditorDraftValues } from "./estimate-editor-validation";

export type { EstimateEditorValues } from "./estimate-editor-values";

export function guardEstimateUnsavedNavigation(onNavigate: (href: string) => void) {
  const captureNavigation = (event: globalThis.MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    onNavigate(`${url.pathname}${url.search}${url.hash}`);
  };
  const guardUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
  document.addEventListener("click", captureNavigation, true);
  window.addEventListener("beforeunload", guardUnload);
  return () => {
    document.removeEventListener("click", captureNavigation, true);
    window.removeEventListener("beforeunload", guardUnload);
  };
}

/** Scope/grant presentation checks only; the eventual server must authorize every operation. */
export function estimateEditorAccess({
  role, capabilities, parentType, assignedJob, status, archived, newDraft, ready,
}: {
  role: EstimateRole; capabilities: EstimateCapabilities; parentType: "lead" | "job";
  assignedJob: boolean; status: EstimateStatus; archived: boolean; newDraft: boolean; ready: boolean;
}) {
  const read = ready && capabilities.read && (role !== "field" || (parentType === "job" && assignedJob));
  return {
    read,
    edit: read && status === "draft" && !archived && (newDraft ? capabilities.create : capabilities.update),
    assignOwner: read && role !== "field",
    correctDecision: read && role !== "field" && capabilities.decide,
    convert: read && role !== "field",
  };
}

export function reviewEstimateEditorDraft(
  value: EstimateEditorValues,
  members: readonly EstimateMember[],
  { today = c.today }: { today?: string } = {},
) {
  return reviewEstimateEditorDraftValues(value, members, { today });
}

/** Explicit customer allowlist: never spread editor values into a preview or sharing request. */
export function estimateEditorPaper(
  value: EstimateEditorValues,
  context: { number: string; revision: number; business: EstimatePaperContent["business"]; preparedBy: string; relatedRecord: string },
): EstimatePaperContent {
  return {
    number: context.number, revision: context.revision, name: value.details.name,
    business: {
      name: context.business.name, address: context.business.address, phone: context.business.phone,
      email: context.business.email, licenseLine: context.business.licenseLine,
      logoPath: context.business.logoPath, requireServiceAddress: context.business.requireServiceAddress,
    },
    recipientName: value.details.recipientName, recipientEmail: value.details.recipientEmail,
    serviceAddress: value.details.serviceAddress, estimateDate: c.today, validUntil: value.terms.validUntil,
    preparedBy: context.preparedBy, relatedRecord: context.relatedRecord,
    scope: value.scope, message: value.terms.message, paymentTerms: value.terms.paymentTerms, termsNote: value.terms.termsNote,
    items: value.items.map((item) => ({
      description: item.description, quantity: item.quantity, unitPrice: item.unitPrice,
      taxable: item.taxable, included: item.included, unit: item.catalog?.unit ?? item.unit ?? "",
    })),
    discount: value.totals.discount.type === "none" ? { type: "none" } : { type: value.totals.discount.type, value: value.totals.discount.value },
    taxRate: value.totals.taxRate,
    deposit: value.terms.deposit.type === "none" ? { type: "none" } : { type: value.terms.deposit.type, value: value.terms.deposit.value },
    ...(value.paymentLink !== undefined ? { paymentLink: value.paymentLink } : {}),
  };
}

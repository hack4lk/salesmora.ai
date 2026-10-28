import { calculateEstimateItems, calculateEstimateTotals, type EstimateAdjustment } from "@salesmora/domain";
import { reviewAssistantProposalWindow } from "../proposal-review";
import { estimateDraftCardData as c } from "./estimate-draft-card.data";
import type { EstimateDraftContent, EstimateDraftContext, EstimateDraftLine, EstimateDraftProposal, EstimateDraftRequest } from "./estimate-draft-card.types";

export function estimateDraftDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function knownPrice(line: EstimateDraftLine, previous: EstimateDraftContent | undefined): boolean {
  const source = line.priceSource;
  if (source.type === "missing") return false;
  if (source.type === "user") return true;
  if (source.type === "catalog" || source.type === "rule") return !!source.name.trim() && source.name.length <= 200;
  return source.type === "saved" && !!previous?.items.some((item) =>
    item.id === line.id && item.unitPrice === line.unitPrice && item.included === line.included);
}

function adjustmentIdentity(value: EstimateAdjustment) {
  return value.type === "none" ? { type: value.type } : { type: value.type, value: value.value };
}

function contentIdentity(content: EstimateDraftContent) {
  return {
    name: content.name, scope: content.scope, message: content.message, paymentTerms: content.paymentTerms,
    termsNote: content.termsNote, validUntil: content.validUntil,
    items: content.items.map((line) => ({
      id: line.id, description: line.description, quantity: line.quantity, unitPrice: line.unitPrice,
      taxable: line.taxable, included: line.included, unit: line.unit,
    })),
    discount: adjustmentIdentity(content.discount), taxRate: content.taxRate, deposit: adjustmentIdentity(content.deposit),
  };
}

export function reviewEstimateDraftContent(content: EstimateDraftContent, previous?: EstimateDraftContent) {
  const issues: string[] = [];
  if (!content.name.trim() || content.name.length > 120) issues.push(c.issues.name);
  if (content.scope.length > 5000 || content.message.length > 2000 || content.paymentTerms.length > 500 || content.termsNote.length > 5000) issues.push(c.issues.text);
  if (content.validUntil && !estimateDraftDate(content.validUntil)) issues.push(c.issues.date);
  const needsPrice = content.items.map((line) => !line.unitPrice.trim() || !knownPrice(line, previous));
  if (needsPrice.some(Boolean)) issues.push(c.issues.price);
  const calculation = calculateEstimateTotals({
    ...content,
    items: content.items.map((line, index) => needsPrice[index] ? { ...line, unitPrice: "" } : line),
  });
  if (content.items.length && (calculation.items.subtotalCents === null || content.items.some((line) => line.unit.length > 100))) issues.push(c.issues.items);
  if (new Set(content.items.map((line) => line.id)).size !== content.items.length || content.items.some((line) => !line.id.trim())) issues.push(c.issues.lines);
  if (Object.keys(calculation.errors).length) issues.push(c.issues.amounts);
  const unitPrices = content.items.map((line, index) => needsPrice[index] ? null
    : calculateEstimateItems([{ ...line, quantity: "1" }]).items[0]?.amountCents ?? null);
  return { issues, calculation, needsPrice, unitPrices };
}

export function estimateDraftRequest(draft: EstimateDraftProposal): EstimateDraftRequest {
  return {
    proposalId: draft.id, inputHash: draft.inputHash, authorizationVersion: draft.authorizationVersion, actionType: draft.actionType,
    parentType: draft.parent.type, parentId: draft.parent.id, parentVersion: draft.parent.version,
    estimateId: draft.actionType === "estimate.update" ? draft.estimate.id : null,
    expectedVersion: draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null,
  };
}

/** Presentation validation only. The host must reauthorize, rehash and atomically save the stored proposal. */
export function reviewEstimateDraft(draft: EstimateDraftProposal, context: EstimateDraftContext | null, now: number) {
  const window = reviewAssistantProposalWindow(draft.createdAt, draft.expiresAt, now);
  const referenceValid = !!draft.parent.id.trim() && !!draft.parent.number.trim() && !!draft.parent.name.trim()
    && Number.isSafeInteger(draft.parent.version) && draft.parent.version > 0
    && (draft.actionType === "estimate.create" || (
      !!draft.estimate.id.trim() && !!draft.estimate.number.trim()
      && Number.isSafeInteger(draft.estimate.revision) && draft.estimate.revision > 0
      && Number.isSafeInteger(draft.estimate.expectedVersion) && draft.estimate.expectedVersion > 0));
  const validMetadata = referenceValid && !!draft.id.trim() && !!draft.authorizationVersion.trim() && /^[a-f0-9]{64}$/.test(draft.inputHash)
    && window.valid;
  const { expired, expires } = window;
  const bound = !!context && context.proposalId === draft.id && context.inputHash === draft.inputHash && context.authorizationVersion === draft.authorizationVersion
    && context.parent.id === draft.parent.id && context.parent.type === draft.parent.type && context.parent.version === draft.parent.version
    && (draft.actionType === "estimate.create" ? context.estimate === null
      : context.estimate?.id === draft.estimate.id && context.estimate.version === draft.estimate.expectedVersion);
  const targetReady = draft.actionType === "estimate.create" || (context?.estimate?.status === "draft" && !context.estimate.archived);
  const proposed = reviewEstimateDraftContent(draft.proposed, draft.actionType === "estimate.update" ? draft.current : undefined);
  const current = draft.actionType === "estimate.update" ? reviewEstimateDraftContent(draft.current, draft.current) : null;
  const changed = draft.actionType === "estimate.create" || JSON.stringify(contentIdentity(draft.current)) !== JSON.stringify(contentIdentity(draft.proposed));
  const issues = [
    ...(!validMetadata ? [c.issues.metadata] : []),
    ...(!bound ? [c.issues.binding] : []),
    ...(!targetReady ? [c.issues.target] : []),
    ...proposed.issues,
  ];
  return { issues, proposed, current, changed, expired, expires, validMetadata, bound, targetReady, canConfirm: draft.state === "pending" && !issues.length && changed && !expired };
}

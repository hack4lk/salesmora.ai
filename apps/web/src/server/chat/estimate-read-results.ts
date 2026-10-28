import { randomUUID } from "node:crypto";
import {
  estimateChatSnapshotSchema,
  type EstimateChatReadCard,
  type EstimateChatSnapshot,
  type EstimateHistoryEvent,
} from "@salesmora/contracts";
import type {
  readEstimateAssistantDetail, readEstimateEditor, readEstimateLifecycle, readEstimateSharingReview,
} from "@salesmora/data";

type Detail = Awaited<ReturnType<typeof readEstimateAssistantDetail>>;
type Pricing = Extract<EstimateChatReadCard, { kind: "explain_totals" }>["pricing"];
export type EstimateReadMetadata = Pick<EstimateChatReadCard, "scope" | "retrievedAt" | "timezone">;

function base(metadata: EstimateReadMetadata) {
  return { id: randomUUID(), scope: metadata.scope, retrievedAt: metadata.retrievedAt, timezone: metadata.timezone };
}
function identity(detail: Detail) {
  return {
    id: detail.id, number: detail.number, revision: detail.revision,
    name: detail.name, status: detail.status, archived: detail.archived,
  };
}
function line(item: Detail["lineItems"][number], index: number): Pricing["lineItems"][number] {
  return {
    position: index + 1, description: item.description, quantity: item.quantity,
    unitPriceCents: item.unitPriceCents, unit: item.unit ?? null, taxable: item.taxable,
    included: item.included, amountCents: item.amountCents,
    invalidFields: (["description", "quantity", "unitPrice", "amount"] as const).filter(field => !!item.errors[field]),
  };
}
function pricing(detail: Detail): Pricing {
  return {
    source: detail.source,
    lineItems: detail.lineItems.map(line),
    lineItemCount: detail.lineItems.length,
    adjustments: detail.adjustments,
    issues: [
      ...(detail.itemError || detail.lineItems.some(item => Object.keys(item.errors).length) ? ["items" as const] : []),
      ...(["discount", "taxRate", "deposit"] as const).filter(field => !!detail.calculationErrors[field]),
    ],
    totals: detail.totals,
  };
}
function excerpt(text: string, max = 5000) {
  return { text: text.slice(0, max), truncated: text.length > max };
}

export function estimateReadSnapshot(turnId: string, detail: EstimateChatReadCard): EstimateChatSnapshot {
  const result = {
    turnId,
    operation: detail.kind === "unavailable" ? detail.operation : detail.kind,
    summaries: [],
    detail,
  };
  // Keep canonical amounts and inputs intact; only the explicitly counted item window can shrink.
  while (JSON.stringify(result).length > 60000) {
    const window = detail.kind === "get" || detail.kind === "explain_totals"
      ? detail.pricing.lineItems
      : detail.kind === "compare_revisions" ? detail.comparison?.lineItemChanges : undefined;
    if (!window?.length) throw new Error("Estimate read metadata exceeds the streaming payload limit.");
    window.pop();
  }
  return estimateChatSnapshotSchema.parse({ result, lists: [] });
}

const eventKinds = [
  "sent", "published", "delivery-queued", "delivery-sent", "delivery-failed", "delivery-bounced",
  "viewed", "decision-recorded", "decision-corrected", "expired", "voided", "superseded", "converted",
] as const;
type RecentEvent = Extract<EstimateChatReadCard, { kind: "get" }>["history"]["events"][number];
function event(event: EstimateHistoryEvent): RecentEvent | null {
  const kind = eventKinds.find(kind => kind === event.kind);
  return kind ? {
    at: event.createdAt,
    kind,
    ...(event.kind === "decision-recorded" || event.kind === "decision-corrected"
      ? { decisionDate: event.decisionDate, channel: event.channel } : {}),
  } : null;
}

export function estimateDetailCard(
  metadata: EstimateReadMetadata,
  detail: Detail,
  parentNumber: string,
  lifecycle: Awaited<ReturnType<typeof readEstimateLifecycle>>,
  sharing: Awaited<ReturnType<typeof readEstimateSharingReview>>,
): EstimateChatReadCard {
  const email = sharing.delivery.email;
  return {
    ...base(metadata), kind: "get", estimate: identity(detail), parentNumber,
    validUntil: detail.validUntil || null, pricing: pricing(detail),
    delivery: {
      email: {
        state: email.state,
        updatedAt: "updatedAt" in email ? email.updatedAt : null,
        attemptCount: "attemptCount" in email ? email.attemptCount : 0,
      },
      link: {
        state: sharing.delivery.link.state,
        expiresAt: sharing.delivery.link.expiresAt,
        firstViewedAt: sharing.delivery.link.firstViewedAt,
      },
    },
    history: {
      events: lifecycle.events.map(event).filter((item): item is RecentEvent => item !== null),
      hasMore: lifecycle.nextCursor !== null,
    },
  };
}

export function estimateTotalsCard(metadata: EstimateReadMetadata, detail: Detail): EstimateChatReadCard {
  return { ...base(metadata), kind: "explain_totals", estimate: identity(detail), pricing: pricing(detail) };
}

export function estimateScopeCard(
  metadata: EstimateReadMetadata,
  detail: Detail,
  parent: Awaited<ReturnType<typeof readEstimateEditor>>["parent"],
): EstimateChatReadCard {
  return {
    ...base(metadata), kind: "summarize_scope", estimate: identity(detail),
    source: detail.source, estimateScope: excerpt(detail.scope),
    parent: parent?.href ? {
      type: parent.type, number: parent.number, name: parent.name, status: parent.status,
      service: excerpt(parent.service, 500), customer: parent.customer?.name ?? null,
    } : null,
  };
}

function adjustment(value: Detail["adjustments"]["discount"]) {
  return value.type === "none" ? "None" : value.type === "percent" ? `${value.value}%` : `${value.value} USD`;
}
export function estimateComparisonCard(
  metadata: EstimateReadMetadata,
  newer: Detail,
  older: Detail | null,
): EstimateChatReadCard {
  const previous = older && pricing(older).lineItems;
  const next = pricing(newer).lineItems;
  const changes = Array.from({ length: Math.max(previous?.length ?? 0, next.length) }, (_, index) => ({
    position: index + 1, before: previous?.[index] ?? null, after: next[index] ?? null,
  })).filter(change => JSON.stringify(change.before) !== JSON.stringify(change.after));
  const fields = older ? ([
    ["name", older.name, newer.name],
    ["scope", older.scope, newer.scope],
    ["discount", adjustment(older.adjustments.discount), adjustment(newer.adjustments.discount)],
    ["taxRate", older.adjustments.taxRate, newer.adjustments.taxRate],
    ["deposit", adjustment(older.adjustments.deposit), adjustment(newer.adjustments.deposit)],
    ["validUntil", older.validUntil, newer.validUntil],
  ] as const).filter(([, before, after]) => before !== after)
    .map(([field, before, after]) => ({ field, before: excerpt(before, 2000), after: excerpt(after, 2000) })) : [];
  return {
    ...base(metadata), kind: "compare_revisions", estimate: identity(newer),
    comparison: older ? {
      from: { estimate: identity(older), source: older.source, totalCents: older.totals.totalCents },
      to: { estimate: identity(newer), source: newer.source, totalCents: newer.totals.totalCents },
      totalDifferenceCents: older.totals.totalCents === null || newer.totals.totalCents === null
        ? null : newer.totals.totalCents - older.totals.totalCents,
      fields, lineItemChanges: changes, lineItemChangeCount: changes.length,
    } : null,
  };
}

export function estimateUnavailableCard(
  metadata: EstimateReadMetadata,
  operation: Extract<EstimateChatReadCard, { kind: "unavailable" }>["operation"],
): EstimateChatReadCard {
  return { ...base(metadata), kind: "unavailable", operation, estimate: null };
}

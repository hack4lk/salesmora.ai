"use client";

import { useId, type ReactNode } from "react";
import { MoneyText } from "@salesmora/ui";
import type { EstimateChatReadCard } from "@salesmora/contracts";
import { estimateStatusBadgeData } from "../../estimates/estimate-status-badge/estimate-status-badge.data";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateTotalsData as totalsCopy } from "../../estimates/estimate-totals/estimate-totals.data";
import { estimateItemsEditorData as itemCopy } from "../../estimates/estimate-items-editor/estimate-items-editor.data";
import { estimateHistoryTimelineData as historyCopy } from "../../estimates/estimate-history-timeline/estimate-history-timeline.data";
import { createEstimateTimestampFormatter } from "../../estimates/estimate-timestamp";
import { formatEstimateSummaryDate } from "../../estimates/estimate-summary-card/estimate-summary-card.preview";
import { estimateReadResultData as c } from "./estimate-read-result.data";

type Pricing = Extract<EstimateChatReadCard, { kind: "explain_totals" }>["pricing"];
const panel = "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-4";

function Amount({ cents }: { cents: number | null }) {
  return cents === null ? c.amountUnavailable : <MoneyText cents={cents} />;
}
function Status({ estimate }: { estimate: NonNullable<EstimateChatReadCard["estimate"]> }) {
  return <p className="m-0 text-sm font-semibold text-assistant-muted">
    {c.status}: {estimateStatusBadgeData.statuses[estimate.status].label}
    {estimate.archived ? ` · ${estimateStatusBadgeData.archived}` : ""}
  </p>;
}
function Fields({ entries }: { entries: readonly (readonly [string, ReactNode])[] }) {
  return <dl className="m-0 grid min-w-0 gap-3 text-sm">
    {entries.map(([label, value]) => <div key={label} className="min-w-0">
      <dt className="font-semibold text-assistant-muted">{label}</dt>
      <dd className="m-0 mt-1 whitespace-pre-wrap wrap-anywhere">{value}</dd>
    </div>)}
  </dl>;
}
function Excerpt({ value }: { value: { text: string; truncated: boolean } }) {
  return <>
    <span className="whitespace-pre-wrap wrap-anywhere">{value.text || c.notProvided}</span>
    {value.truncated && <p className="mb-0 mt-2 text-xs text-assistant-muted">{c.truncated}</p>}
  </>;
}
function adjustment(value: Pricing["adjustments"]["discount"]) {
  return value.type === "none" ? totalsCopy.types.none
    : `${totalsCopy.types[value.type]}: ${value.value || c.notProvided}${value.type === "percent" ? "%" : " USD"}`;
}
function Line({ item }: { item: Pricing["lineItems"][number] }) {
  return <div className="grid min-w-0 gap-2">
    <p className="m-0 whitespace-pre-wrap text-sm font-semibold wrap-anywhere">{item.description || c.notProvided}</p>
    <Fields entries={[
      [itemCopy.quantity, item.quantity || c.notProvided],
      [c.unit, item.unit || c.notProvided],
      [itemCopy.unitPrice, <Amount key="price" cents={item.unitPriceCents} />],
      [itemCopy.amount, <Amount key="amount" cents={item.amountCents} />],
    ]} />
    <p className="m-0 text-sm text-assistant-muted">
      {item.taxable ? itemCopy.taxable : itemCopy.notTaxable}
      {item.included ? ` · ${itemCopy.included}` : ""}
    </p>
    {item.invalidFields.length > 0 && <p className="m-0 text-sm font-semibold text-assistant-foreground">{c.invalidLine}</p>}
  </div>;
}
function Pricing({ value }: { value: Pricing }) {
  const id = useId();
  return <>
    <section aria-labelledby={`${id}-totals`} className={panel}>
      <h4 id={`${id}-totals`} className="m-0 text-base font-semibold">{totalsCopy.title}</h4>
      <Fields entries={[
        [c.source, c.sources[value.source]],
        [totalsCopy.discountType, adjustment(value.adjustments.discount)],
        [totalsCopy.taxRate, value.adjustments.taxRate ? `${value.adjustments.taxRate}%` : c.notProvided],
        [totalsCopy.depositSetting, adjustment(value.adjustments.deposit)],
        ...([
          [totalsCopy.subtotal, value.totals.subtotalCents],
          [totalsCopy.discount, value.totals.discountCents],
          [c.taxableDiscount, value.totals.taxableDiscountCents],
          [c.nonTaxableDiscount, value.totals.nonTaxableDiscountCents],
          [totalsCopy.taxableBase, value.totals.taxableAfterDiscountCents],
          [totalsCopy.tax, value.totals.taxCents],
          [totalsCopy.total, value.totals.totalCents],
          [totalsCopy.deposit, value.totals.depositCents],
          [totalsCopy.balance, value.totals.balanceCents],
        ] as const).map(([label, cents]) => [label, <Amount key={label} cents={cents} />] as const),
      ]} />
      <p className="m-0 text-xs leading-5 text-assistant-muted">{totalsCopy.allocation}</p>
      <p className="m-0 text-xs leading-5 text-assistant-muted">{totalsCopy.depositHint}</p>
      {value.issues.map(issue => <p key={issue} className="m-0 text-sm font-semibold text-assistant-foreground">{c.issues[issue]}</p>)}
    </section>
    <section aria-labelledby={`${id}-lines`} className={panel}>
      <h4 id={`${id}-lines`} className="m-0 text-base font-semibold">{itemCopy.title}</h4>
      <p className="m-0 text-sm text-assistant-muted">{c.lineCount(value.lineItems.length, value.lineItemCount)}</p>
      <ol className="m-0 grid min-w-0 list-none gap-4 p-0">
        {value.lineItems.map(item => <li key={item.position} className="grid min-w-0 gap-3 border-t border-assistant-border pt-3">
          <h5 className="m-0 text-sm font-semibold">{itemCopy.line(item.position)}</h5>
          <Line item={item} />
        </li>)}
      </ol>
      {value.lineItemCount === 0 && <p className="m-0 text-sm">{c.noLines}</p>}
      {value.lineItems.length < value.lineItemCount && <p className="m-0 text-sm text-assistant-muted">{c.lineWindow}</p>}
    </section>
  </>;
}

export function EstimateReadResult({
  card, disabled, onOpenEstimate,
}: {
  card: EstimateChatReadCard;
  disabled: boolean;
  onOpenEstimate: (estimateId: string) => void;
}) {
  const id = useId();
  const formatter = createEstimateTimestampFormatter(card.timezone);
  const time = (value: string | null) => value && formatter
    ? <time dateTime={value}>{formatter.format(new Date(value))}</time> : c.timeUnavailable;
  const open = (estimate: NonNullable<EstimateChatReadCard["estimate"]>, label: string) =>
    <button type="button" disabled={disabled} className={`${estimateButton} justify-self-start`}
      onClick={() => { if (!disabled) onOpenEstimate(estimate.id); }}>{label}</button>;
  return <section aria-labelledby={`${id}-title`} className="mt-4 grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground print:hidden">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{c.titles[card.kind]}</h3>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.readOnly}</p>
    {card.estimate && <div className="grid min-w-0 gap-2">
      <p className="m-0 text-base font-semibold wrap-anywhere">{card.estimate.number} · {c.revision(card.estimate.revision)} · {card.estimate.name}</p>
      <Status estimate={card.estimate} />
    </div>}
    <Fields entries={[[c.scope, c.scopes[card.scope]], [c.retrieved, <span key="retrieved">{time(card.retrievedAt)} · {card.timezone}</span>]]} />
    {card.kind === "unavailable" && <p role="status" className="m-0 text-sm leading-6">{c.unavailable}</p>}
    {card.kind === "get" && <>
      <Fields entries={[[c.parent, card.parentNumber], [historyCopy.fields.validUntil, formatEstimateSummaryDate(card.validUntil) ?? c.noDate]]} />
      <Pricing value={card.pricing} />
      <section aria-labelledby={`${id}-delivery`} className={panel}>
        <h4 id={`${id}-delivery`} className="m-0 text-base font-semibold">{c.delivery}</h4>
        <Fields entries={[
          [c.email, c.emailStates[card.delivery.email.state]], [c.attempts, card.delivery.email.attemptCount],
          [c.emailUpdated, time(card.delivery.email.updatedAt)],
          [c.customerLink, c.linkStates[card.delivery.link.state]],
          [c.linkExpiry, time(card.delivery.link.expiresAt)], [c.firstViewed, time(card.delivery.link.firstViewedAt)],
        ]} />
      </section>
      <section aria-labelledby={`${id}-history`} className={panel}>
        <h4 id={`${id}-history`} className="m-0 text-base font-semibold">{c.recentHistory}</h4>
        <p className="m-0 text-sm leading-6 text-assistant-muted">{c.historyWindow}</p>
        <ol className="m-0 grid min-w-0 list-none gap-3 p-0">
          {card.history.events.map((event, index) => <li key={index} className="grid min-w-0 gap-1 text-sm">
            <strong>{historyCopy.events[event.kind]}</strong>
            <span>{time(event.at)}</span>
            {event.decisionDate && <span>{historyCopy.decisionDate}: {formatEstimateSummaryDate(event.decisionDate)}</span>}
            {event.channel && <span>{historyCopy.channel}: {historyCopy.channels[event.channel]}</span>}
          </li>)}
        </ol>
        {!card.history.events.length && <p className="m-0 text-sm">{c.noEvents}</p>}
        {card.history.hasMore && <p className="m-0 text-sm text-assistant-muted">{c.historyMore}</p>}
      </section>
    </>}
    {card.kind === "explain_totals" && <Pricing value={card.pricing} />}
    {card.kind === "summarize_scope" && <>
      <Fields entries={[[c.source, c.sources[card.source]], [c.storedScope, <Excerpt key="scope" value={card.estimateScope} />]]} />
      {card.parent ? <section aria-labelledby={`${id}-parent`} className={panel}>
        <h4 id={`${id}-parent`} className="m-0 text-base font-semibold">{c.parent}</h4>
        <Fields entries={[
          [c.parent, `${card.parent.type === "lead" ? "Lead" : "Job"} · ${card.parent.number}`],
          [c.parentName, card.parent.name], [c.status, card.parent.status],
          [c.service, <Excerpt key="service" value={card.parent.service} />],
          [c.customer, card.parent.customer || c.notProvided],
        ]} />
      </section> : <p className="m-0 text-sm text-assistant-muted">{c.parentUnavailable}</p>}
    </>}
    {card.kind === "compare_revisions" && (card.comparison ? <>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.compared}</p>
      {([["from", c.before], ["to", c.after]] as const).map(([key, label]) => {
        const revision = card.comparison![key];
        return <section key={key} aria-label={`${label} revision`} className={panel}>
          <h4 className="m-0 text-base font-semibold">{label}: {c.revision(revision.estimate.revision)}</h4>
          <p className="m-0 text-sm wrap-anywhere">{revision.estimate.name}</p>
          <Status estimate={revision.estimate} />
          <Fields entries={[[c.source, c.sources[revision.source]], [totalsCopy.total, <Amount key="total" cents={revision.totalCents} />]]} />
          {open(revision.estimate, c.openRevision(revision.estimate.number, revision.estimate.revision))}
        </section>;
      })}
      <Fields entries={[[c.totalDifference, <Amount key="difference" cents={card.comparison.totalDifferenceCents} />]]} />
      {card.comparison.fields.map(field => <section key={field.field} aria-label={historyCopy.fields[field.field]} className={panel}>
        <h4 className="m-0 text-base font-semibold">{historyCopy.fields[field.field]}</h4>
        <Fields entries={[[c.before, <Excerpt key="before" value={field.before} />], [c.after, <Excerpt key="after" value={field.after} />]]} />
      </section>)}
      <p className="m-0 text-sm text-assistant-muted">{c.changeCount(card.comparison.lineItemChanges.length, card.comparison.lineItemChangeCount)}</p>
      {card.comparison.lineItemChanges.map(change => <section key={change.position} aria-label={itemCopy.line(change.position)} className={panel}>
        <h4 className="m-0 text-base font-semibold">{itemCopy.line(change.position)}</h4>
        {([["before", c.before], ["after", c.after]] as const).map(([key, label]) =>
          <div key={key} className="grid min-w-0 gap-2 border-t border-assistant-border pt-3">
            <h5 className="m-0 text-sm font-semibold">{label}</h5>
            {change[key] ? <Line item={change[key]} /> : <p className="m-0 text-sm text-assistant-muted">{c.absentLine}</p>}
          </div>)}
      </section>)}
      {card.comparison.lineItemChanges.length < card.comparison.lineItemChangeCount && <p className="m-0 text-sm text-assistant-muted">{c.changedWindow}</p>}
      {!card.comparison.fields.length && !card.comparison.lineItemChangeCount && <p className="m-0 text-sm">{c.noChanges}</p>}
    </> : <p role="status" className="m-0 text-sm">{c.oneRevision}</p>)}
    {card.estimate && !(card.kind === "compare_revisions" && card.comparison) && open(card.estimate, c.open)}
    <p className="m-0 text-xs leading-5 text-assistant-muted">{c.snapshot}</p>
  </section>;
}

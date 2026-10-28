"use client";

import { useId, useRef, useState } from "react";
import { FormFeedback, MoneyText } from "@salesmora/ui";
import { EstimateBusinessLogo } from "../estimate-business-logo";
import { EstimatePaymentOption } from "../estimate-payment-option/estimate-payment-option";
import { estimateButton } from "../estimate-ui";
import { estimatePreviewPaperData as c } from "./estimate-preview-paper.data";
import {
  estimatePaperDate, estimatePaperUnitPrice, reviewEstimatePaper, type EstimatePaperSource,
} from "./estimate-preview-paper.preview";

export type EstimatePreviewPaperProps = {
  source: EstimatePaperSource;
  /** Embedded Send/Publish/public hosts can supply their own toolbar. */
  showPrintControl?: boolean;
  /** Defaults to the plain browser print flow; tests may supply a local mock. */
  onPrint?: () => void | Promise<void>;
};

export function EstimatePreviewPaper({ source, showPrintControl = true, onPrint }: EstimatePreviewPaperProps) {
  const id = useId(), inFlight = useRef(false);
  const [printing, setPrinting] = useState(false);
  const [printFailed, setPrintFailed] = useState(false);
  const result = reviewEstimatePaper(source), d = result.content;
  const taxRate = result.calculation?.taxRateMilliPercent;
  const totals = source.state === "snapshot" ? result.amounts : result.calculation && {
    subtotalCents: result.calculation.items.subtotalCents,
    discountCents: result.calculation.discountCents, taxCents: result.calculation.taxCents,
    totalCents: result.calculation.totalCents, depositCents: result.calculation.depositCents,
    balanceCents: result.calculation.balanceCents,
  };
  async function print() {
    if (inFlight.current || !result.canPrint) return;
    inFlight.current = true; setPrinting(true); setPrintFailed(false);
    try { if (onPrint) await onPrint(); else window.print(); }
    catch { setPrintFailed(true); }
    finally { inFlight.current = false; setPrinting(false); }
  }
  const amount = (cents: number | null | undefined) => cents === null || cents === undefined
    ? <span>{c.amountUnavailable}</span> : <MoneyText cents={cents} />;
  return <div className="min-w-0">
    {showPrintControl && <div className="mx-auto mb-4 grid w-full max-w-letter gap-3 print:hidden">
      <div><button type="button" className={estimateButton} disabled={!result.canPrint || printing} aria-busy={printing}
        onClick={() => { void print(); }}>{printing ? c.printing : c.print}</button></div>
      <p className="m-0 text-sm leading-6 text-muted">{c.printHint}</p>
      {printFailed && <FormFeedback kind="error" message={c.printFailed} />}
    </div>}
    {!d ? <div className="mx-auto max-w-letter bg-paper p-6">
      {source.state === "loading" ? <p role="status" className="m-0">{c.loading}</p>
        : <FormFeedback kind="error" message={source.state === "snapshot" ? c.invalidSnapshot : source.state === "error" ? c.failed : c.unavailable} />}
    </div> : <article aria-labelledby={`${id}-title`} className="letter-paper mx-auto box-border w-full max-w-letter bg-paper p-6 text-sm leading-5 text-ink sm:min-h-letter-page sm:p-12 print:m-0 print:min-h-0 print:w-auto print:max-w-none print:p-0 print:text-xs print:leading-4">
      {source.state === "draft" && <aside className="mb-5 break-inside-avoid border-2 border-ink p-3 print:mb-2 print:p-1">
        <p className="m-0 text-base font-bold print:text-sm">{result.issues.length ? c.draftIncomplete : c.draft}</p>
        <p className="m-0 mt-1">{c.draftHint}</p>
        {result.issues.length > 0 && <><p className="m-0 mt-1">{c.incompleteHint}</p>
          <ul className="mb-0 mt-2 pl-5">{result.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></>}
      </aside>}
      <header className="flex flex-col gap-5 border-b-2 border-primary pb-5 sm:flex-row sm:justify-between print:flex-row print:pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <EstimateBusinessLogo name={d.business.name} logoPath={d.business.logoPath} />
          <div className="min-w-0">
            <p className="m-0 text-lg font-bold wrap-anywhere print:text-base">{d.business.name.trim() ? d.business.name : c.missing}</p>
            <p className="m-0 mt-1 whitespace-pre-wrap text-muted wrap-anywhere print:mt-0">{d.business.address.trim() ? d.business.address : c.missing}</p>
            <p className="m-0 mt-1 text-muted wrap-anywhere print:mt-0">{d.business.phone.trim() ? d.business.phone : c.missing}</p>
            <p className="m-0 text-muted wrap-anywhere">{d.business.email.trim() ? d.business.email : c.missing}</p>
          </div>
        </div>
        <div className="min-w-0 sm:text-right print:text-right">
          <p className="m-0 text-2xl font-bold uppercase tracking-wide print:text-xl">{c.title}</p>
          <p className="m-0 mt-1 wrap-anywhere">{d.number.trim() ? d.number : c.assignedOnSave}</p>
          <p className="m-0 text-muted">{Number.isSafeInteger(d.revision) && d.revision > 0 ? c.revision(d.revision) : c.missing}</p>
        </div>
      </header>
      <h1 id={`${id}-title`} className="mb-0 mt-5 break-after-avoid text-xl font-semibold wrap-anywhere print:mt-3 print:text-base">{d.name.trim() ? d.name : c.missing}</h1>
      {d.paymentLink && <div className="mt-5 print:mt-3"><EstimatePaymentOption value={d.paymentLink} /></div>}
      <div className="my-5 grid min-w-0 gap-5 sm:grid-cols-2 print:my-3 print:grid-cols-2">
        <section aria-labelledby={`${id}-recipient`} className="min-w-0">
          <h2 id={`${id}-recipient`} className="m-0 text-sm font-semibold uppercase tracking-wide text-muted print:text-xs">{c.preparedFor}</h2>
          <p className="mb-0 mt-2 font-semibold wrap-anywhere">{d.recipientName.trim() ? d.recipientName : c.missing}</p>
          {d.recipientEmail.trim() && <p className="m-0 wrap-anywhere">{d.recipientEmail}</p>}
          <p className="mb-0 mt-2 font-semibold">{c.serviceAddress}</p>
          <p className="m-0 whitespace-pre-wrap wrap-anywhere">{d.serviceAddress.trim() ? d.serviceAddress : c.addressMissing}</p>
        </section>
        <dl className="m-0 grid min-w-0 content-start gap-2 print:gap-1">
          {([
            [c.estimateDate, estimatePaperDate(d.estimateDate) ?? c.missing],
            [c.validUntil, estimatePaperDate(d.validUntil) ?? c.missing],
            [c.paymentTerms, d.paymentTerms.trim() ? d.paymentTerms : c.missing],
            [c.preparedBy, d.preparedBy],
            [c.relatedRecord, d.relatedRecord],
          ] as const).filter(([, value]) => !!value.trim()).map(([label, value]) =>
            <div key={label} className="grid min-w-0 grid-cols-2 gap-2 border-b border-line pb-1 print:pb-0">
              <dt className="text-muted">{label}</dt><dd className="m-0 text-right whitespace-pre-wrap wrap-anywhere">{value}</dd>
            </div>)}
        </dl>
      </div>
      {d.scope.trim() && <section className="mb-5 min-w-0 rounded-lg border border-line bg-canvas p-3 print:mb-2 print:bg-paper print:p-1.5">
        <h2 className="m-0 mb-2 break-after-avoid text-base font-semibold print:mb-1 print:text-sm">{c.scope}</h2>
        <p className="paper-prose m-0 whitespace-pre-wrap wrap-anywhere">{d.scope}</p>
      </section>}
      <section className="min-w-0">
        <h2 className="m-0 mb-2 break-after-avoid text-base font-semibold print:mb-1 print:text-sm">{c.items}</h2>
        {!d.items.length ? <p className="m-0">{c.noItems}</p> : <>
          <table className="hidden w-full table-fixed border-collapse text-left text-sm sm:table print:table print:text-xs">
            <caption className="sr-only">{c.items}</caption>
            <thead className="print:table-header-group"><tr className="border-b border-ink">
              <th scope="col" className="w-1/2 py-2 pr-3 print:py-1">{c.description}</th>
              <th scope="col" className="py-2 pr-3 text-right print:py-1">{c.quantity}</th>
              <th scope="col" className="py-2 pr-3 text-right print:py-1">{c.unitPrice}</th>
              <th scope="col" className="py-2 text-right print:py-1">{c.amount}</th>
            </tr></thead>
            <tbody>{d.items.map((line, index) => <tr key={index} className="break-inside-avoid border-b border-line align-top">
              <th scope="row" className="py-2 pr-3 font-normal whitespace-pre-wrap wrap-anywhere print:py-1">
                {line.description.trim() ? line.description : c.missing}
                {line.unit && <span className="mt-1 block text-xs text-muted">{c.unit(line.unit)}</span>}
                {line.included && <span className="mt-1 block text-xs font-semibold">{c.included}</span>}
                {!!Object.keys(result.calculation?.items.items[index]?.errors ?? {}).length && <span className="mt-1 block text-xs font-semibold">{c.invalidLine}</span>}
              </th>
              <td className="py-2 pr-3 text-right tabular-nums wrap-anywhere print:py-1">{line.quantity.trim() || c.amountUnavailable}</td>
              <td className="py-2 pr-3 text-right wrap-anywhere print:py-1">{amount(estimatePaperUnitPrice(line))}</td>
              <td className="py-2 text-right wrap-anywhere print:py-1">{amount(source.state === "snapshot" ? result.amounts?.lineAmountsCents[index] : result.calculation?.items.items[index]?.amountCents)}</td>
            </tr>)}</tbody>
          </table>
          <ol className="m-0 grid list-none gap-4 p-0 sm:hidden print:hidden">{d.items.map((line, index) => <li key={index} className="min-w-0 border-b border-line pb-4">
            <p className="m-0 font-semibold whitespace-pre-wrap wrap-anywhere">{line.description.trim() ? line.description : c.missing}</p>
            {line.unit && <p className="m-0 mt-1 text-xs text-muted wrap-anywhere">{c.unit(line.unit)}</p>}
            {line.included && <p className="m-0 mt-1 text-xs font-semibold">{c.included}</p>}
            {!!Object.keys(result.calculation?.items.items[index]?.errors ?? {}).length && <p className="m-0 mt-1 text-xs font-semibold">{c.invalidLine}</p>}
            <dl className="mb-0 mt-2 grid gap-2">{([
              [c.quantity, line.quantity.trim() || c.amountUnavailable],
              [c.unitPrice, amount(estimatePaperUnitPrice(line))],
              [c.amount, amount(source.state === "snapshot" ? result.amounts?.lineAmountsCents[index] : result.calculation?.items.items[index]?.amountCents)],
            ] as const).map(([label, value]) => <div key={label} className="flex min-w-0 flex-wrap justify-between gap-x-3"><dt className="text-muted">{label}</dt><dd className="m-0 wrap-anywhere">{value}</dd></div>)}</dl>
          </li>)}</ol>
        </>}
        <dl className="mb-0 ml-auto mt-4 grid max-w-sm break-inside-avoid gap-2 print:mt-3 print:gap-0.5">
          {([
            [c.subtotal, totals?.subtotalCents],
            [c.discount, totals?.discountCents ? -totals.discountCents : totals?.discountCents],
            [taxRate === null || taxRate === undefined ? c.taxUnavailable : c.tax(String(taxRate / 1000)), totals?.taxCents],
            [c.total, totals?.totalCents],
            [c.deposit, totals?.depositCents],
            [c.balance, totals?.balanceCents],
          ] as const).map(([label, cents]) => <div key={label} className={`flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-1 ${label === c.total ? "border-t border-ink pt-2 text-base font-bold print:text-sm" : ""}`}>
            <dt>{label}</dt><dd className="m-0 font-semibold wrap-anywhere">{amount(cents)}</dd>
          </div>)}
        </dl>
      </section>
      {([[c.message, d.message], [c.terms, d.termsNote]] as const).filter(([, text]) => !!text.trim()).map(([label, text]) =>
        <section key={label} className="mt-5 min-w-0 print:mt-3">
          <h2 className="m-0 mb-2 break-after-avoid text-base font-semibold print:mb-1 print:text-sm">{label}</h2>
          <p className="paper-prose m-0 whitespace-pre-wrap wrap-anywhere">{text}</p>
        </section>)}
      <section aria-label={c.signature} className="mt-8 grid break-inside-avoid gap-5 sm:grid-cols-2 print:mt-6 print:grid-cols-2">
        {[c.signature, c.signatureDate].map((label) => <div key={label} className="border-t border-ink pt-2 text-xs">{label}</div>)}
      </section>
      <footer className="mt-5 flex break-inside-avoid flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-muted print:mt-3 print:pt-2">
        <span className="wrap-anywhere">{c.footer(d.business.name.trim() || c.missing, d.number.trim() || c.assignedOnSave)}
          {d.business.licenseLine.trim() && <span className="block">{d.business.licenseLine}</span>}</span>
      </footer>
    </article>}
  </div>;
}

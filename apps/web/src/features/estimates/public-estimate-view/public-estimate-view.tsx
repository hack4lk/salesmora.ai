"use client";

import { useRef, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimateButton } from "../estimate-ui";
import { publicEstimateViewData as c } from "./public-estimate-view.data";
import { reviewPublicEstimate, type PublicEstimateSource } from "./public-estimate-view.preview";

export type PublicEstimateViewProps = {
  source: PublicEstimateSource;
  onPrint?: () => void | Promise<void>;
  /** Read-only retry. Resolving alone does not replace the host's source or imply a successful load. */
  onReload?: () => void | Promise<void>;
};

export function PublicEstimateView({ source, onPrint, onReload }: PublicEstimateViewProps) {
  const review = reviewPublicEstimate(source);
  return <section aria-label={c.region} className="min-h-screen min-w-0 bg-canvas p-4 text-ink sm:p-8 print:min-h-0 print:bg-paper print:p-0">
    <meta name="robots" content="noindex, nofollow" />
    <meta name="referrer" content="no-referrer" />
    {review.state === "ready" ? <>
      <header className="mx-auto mb-6 max-w-letter print:hidden">
        <p className="m-0 text-lg font-semibold">{c.heading}</p>
        <p className="mb-0 mt-2 text-sm leading-6">{c.guidance}</p>
      </header>
      <EstimatePreviewPaper source={review.snapshot} onPrint={onPrint} />
    </> : review.state === "loading" ? <div className="mx-auto max-w-letter bg-paper p-6">
      <p role="status" className="m-0 text-base">{c.loading}</p>
    </div> : <div className="mx-auto grid w-full max-w-letter gap-4 rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h1 className="m-0 text-xl font-semibold wrap-anywhere">{c.states[review.state].title}</h1>
      <p className="m-0 leading-6">{c.states[review.state].message}</p>
      {review.state === "error"
        ? onReload ? <PublicEstimateReload key={review.state} onReload={onReload} /> : <p className="m-0 text-sm leading-6 text-muted">{c.refresh}</p>
        : <p className="m-0 text-sm leading-6 text-muted">{c.contact}</p>}
    </div>}
  </section>;
}

function PublicEstimateReload({ onReload }: { onReload: () => void | Promise<void> }) {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function reload() {
    if (inFlight.current) return;
    inFlight.current = true; setPending(true); setFailed(false);
    try { await onReload(); }
    catch { setFailed(true); }
    finally { inFlight.current = false; setPending(false); }
  }
  return <div className="grid gap-3 print:hidden">
    <div><button type="button" disabled={pending} aria-busy={pending} className={estimateButton}
      onClick={() => { void reload(); }}>{pending ? c.reloading : c.retry}</button></div>
    {pending && <p role="status" className="m-0 text-sm">{c.loading}</p>}
    {failed && <FormFeedback kind="error" message={c.reloadFailed} />}
  </div>;
}

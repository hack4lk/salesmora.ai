'use client';

import { useEffect, useRef, useState } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { CaptureSetupHeader, type CaptureSetupDestination } from '../capture-setup-header/capture-setup-header';
import { CaptureSetupReview } from '../capture-setup-review/capture-setup-review';
import type { CaptureLaunchValue, CaptureReviewSection, CaptureSetupReviewDraft } from '../capture-setup-review/capture-setup-review.validation';
import { CapturePublicationInstructions } from '../capture-publication-instructions/capture-publication-instructions';
import { captureReviewPageData as copy } from './capture-review-page.data';
import { validCaptureReviewRequest, validCaptureReviewResult, type CaptureReviewLaunchRequest, type CaptureReviewLaunchResult } from './capture-review-page.validation';
export type CaptureReviewPageProps = {
  draft: CaptureSetupReviewDraft; value: CaptureLaunchValue; canRead: boolean; canEdit: boolean; canLaunch: boolean; pending?: boolean; revision?: boolean;
  onChange: (value: CaptureLaunchValue) => void; onEdit: (section: CaptureReviewSection) => void; onNavigate: (destination: CaptureSetupDestination) => void;
  /** Honor requestId idempotently, including after an uncertain response. Resolve only after authoritative acceptance. */
  /** Connected host handles the authoritative receipt and navigation without fabricated installation artifacts. */
  onApprove?: (request: CaptureReviewLaunchRequest) => Promise<void>;
  onLaunch: (request: CaptureReviewLaunchRequest) => Promise<CaptureReviewLaunchResult>;
  onOpenSource: (source: CaptureReviewLaunchResult) => void; onOpenIntake: (source: CaptureReviewLaunchResult) => void; onCopy?: (text: string) => Promise<void>; now?: () => number;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
/** Saved review snapshot only; the host owns live readiness, authorization and all mutations. */
export function CaptureReviewPage(props: CaptureReviewPageProps) {
  const { draft, value, canRead, canEdit, canLaunch, now = Date.now } = props;
  const [working, setWorking] = useState(false), [accepted, setAccepted] = useState<{ signature: string; result: CaptureReviewLaunchResult } | null>(null);
  const lock = useRef(false), attempts = useRef(new Map<string, string>()), heading = useRef<HTMLHeadingElement>(null);
  const signature = JSON.stringify([draft, value]), session = useRef({ signature, canRead, canLaunch });
  useEffect(() => { session.current = { signature, canRead, canLaunch }; }, [signature, canRead, canLaunch]);
  const result = accepted?.signature === signature ? accepted.result : null;
  useEffect(() => { if (result) heading.current?.focus(); }, [result]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = !!props.pending || working;
  if (result) return <section className="grid min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-3"><h1 ref={heading} tabIndex={-1} className="m-0 text-heading font-semibold focus-visible:focus-ring">{result.status === 'active' ? copy.active : copy.scheduled}</h1><p className="m-0 text-base font-semibold wrap-anywhere">{result.name}</p><div className="justify-self-start"><StatusBadge label={copy.statuses[result.status]} tone={result.status === 'active' ? 'success' : 'info'} /></div>
      <p className="m-0 text-sm leading-6 text-muted">{result.source === 'gmail' ? result.status === 'active' ? copy.gmailActive : copy.gmailScheduled : result.status === 'active' ? copy.websiteActive : copy.websiteScheduled}</p>
      {result.status === 'scheduled' && <p className="m-0 text-sm font-semibold wrap-anywhere"><time dateTime={result.scheduledAt}>{new Intl.DateTimeFormat('en-US', { timeZone: result.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(result.scheduledAt!))}</time> · {result.timezone}</p>}
    </header>
    {result.source === 'website' && <CapturePublicationInstructions publication={result.publication!} canRead onCopy={props.onCopy} />}
    <div className="flex min-w-0 flex-wrap gap-3"><button type="button" className={button} onClick={() => props.onOpenSource(result)}>{copy.source}</button>{result.source === 'gmail' && <button type="button" className={button} onClick={() => props.onOpenIntake(result)}>{copy.intake}</button>}<button type="button" className={button} onClick={() => props.onNavigate('list')}>{copy.list}</button></div>
  </section>;
  return <div className="grid min-w-0 gap-6">
    <CaptureSetupHeader name={draft.name} source={draft.source} step="review" completedSteps={['source', 'intake']} revision={props.revision} canEdit={canEdit} pending={busy} pendingMessage={copy.pending} reviewMessage={copy.reviewMessage} showSave={false} onNavigate={destination => { if (!busy && !lock.current) props.onNavigate(destination); }} onSave={async () => {}} onContinue={() => {}}>
    <CaptureSetupReview draft={draft} value={value} canRead canEdit={canEdit} canLaunch={canLaunch} pending={busy} now={now} onChange={next => { if (!busy && !lock.current) props.onChange(next); }} onEdit={section => { if (!busy && !lock.current) props.onEdit(section); }} onLaunch={async request => {
      if (busy || lock.current || !canLaunch || !validCaptureReviewRequest(request, now()) || JSON.stringify(request.draft) !== JSON.stringify(draft)) throw new Error(copy.invalid);
      lock.current = true; setWorking(true);
      const key = JSON.stringify(request), requestId = attempts.current.get(key) ?? crypto.randomUUID(); attempts.current.set(key, requestId);
      try {
        if (props.onApprove) { await props.onApprove(structuredClone({ ...request, requestId })); return; }
        const response = await props.onLaunch(structuredClone({ ...request, requestId }));
        if (!validCaptureReviewResult(request, response) || session.current.signature !== signature || !session.current.canRead || !session.current.canLaunch) throw new Error(copy.invalid);
        setAccepted({ signature, result: structuredClone(response) });
      } finally { lock.current = false; setWorking(false); }
    }} />
    </CaptureSetupHeader>
  </div>;
}

'use client';
import { CaptureSourceProjection } from './capture-source-projection';
import { CaptureSetupProjection } from './capture-setup-projection';
import { useEffect, useRef, useState } from 'react';
import { captureAssistantProposalDecisionSchema } from '@salesmora/contracts';
import { CaptureSourceList } from '../../lead-capture/capture-source-list/capture-source-list';
import { CaptureDashboardSummary } from '../../lead-capture/capture-dashboard-summary/capture-dashboard-summary';
import { CapturePublicationInstructions } from '../../lead-capture/capture-publication-instructions/capture-publication-instructions';
import { IntakeSourceEvidence } from '../../lead-capture/intake-source-evidence/intake-source-evidence';
import { CaptureFormFieldEditor } from '../../lead-capture/capture-form-field-editor/capture-form-field-editor';
import { CaptureLeadWorkflow } from '../../lead-capture/capture-lead-workflow/capture-lead-workflow';
import { CaptureSetupReview } from '../../lead-capture/capture-setup-review/capture-setup-review';
import { CapturePauseResumeDialog } from '../../lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog';
import { IntakeDecisionReview } from '../../lead-capture/intake-decision-review/intake-decision-review';
import { captureAssistantReferenceKey, captureAssistantViewMatches } from './capture-result.validation';
import { captureAssistantResultData as copy } from './capture-result.data';
import { CaptureReadProjection } from './capture-read-projection';
import type { CaptureAssistantClient, CaptureAssistantReference, CaptureAssistantReadContent, CaptureAssistantView } from './capture-result.types';
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export type CaptureAssistantResultProps = {
  reference: CaptureAssistantReference; client: CaptureAssistantClient; disabled?: boolean;
  onRefresh: () => Promise<void>; onOpen: (record: { kind: 'source' | 'intake'; id: string }) => void;
  onCopy?: (text: string) => Promise<void>;
};
export function CaptureAssistantResult(props: CaptureAssistantResultProps) {
  let key: string;
  try { key = captureAssistantReferenceKey(props.reference); } catch { return <p role="alert">{copy.unavailable}</p>; }
  return <Result key={key + ':' + !!props.disabled} {...props} />;
}
function ReadContent({ content, onOpen, onCopy }: { content: CaptureAssistantReadContent; onOpen: CaptureAssistantResultProps['onOpen']; onCopy: CaptureAssistantResultProps['onCopy'] }) {
  switch (content.kind) {
    case 'capture_read': return <CaptureReadProjection result={content.result} onOpen={onOpen} onCopy={onCopy} />;
    case 'sources': return <><p className="m-0 text-sm text-muted">{copy.window(content.rows.length, content.total)}</p><CaptureSourceList rows={content.rows.map(row => ({ ...row, allowedActions: [] }))} canRead view={content.archived ? 'archived' : 'current'} timezone={content.timezone} onOpen={row => onOpen({ kind: 'source', id: row.id })} onAction={() => {}} /></>;
    case 'summary': return <CaptureDashboardSummary source={content.source} totals={content.totals} canRead canReadIntake={false} actions={<button type="button" className={button} onClick={() => onOpen({ kind: 'source', id: content.source.id })}>{copy.open}</button>} />;
    case 'installation': return <CapturePublicationInstructions publication={content.publication} canRead onCopy={onCopy} />;
    case 'intake_evidence': return <IntakeSourceEvidence snapshot={content.snapshot} timezone={content.timezone} canRead />;
  }
}
function Result({ reference, client, disabled = false, onRefresh, onOpen, onCopy }: CaptureAssistantResultProps) {
  const [view, setView] = useState<CaptureAssistantView | null>(null), [error, setError] = useState(''), [pending, setPending] = useState(false), [reviewOpen, setReviewOpen] = useState(false);
  const [clock, setClock] = useState(Date.now);
  const mounted = useRef(false), lock = useRef(false), sequence = useRef(0), active = useRef<AbortController | null>(null);
  async function load() {
    if (!mounted.current || disabled || lock.current) return;
    const request = ++sequence.current;
    active.current?.abort(); const abort = new AbortController(); active.current = abort;
    setError('');
    try {
      const next = await client.read(reference, abort.signal);
      if (!mounted.current || abort.signal.aborted || sequence.current !== request) return;
      if (!captureAssistantViewMatches(reference, next)) throw Error(copy.stale);
      const now = Date.now();
      if (next.kind !== 'proposal' || next.ticket.state !== 'pending' || Date.parse(next.ticket.expiresAt) <= now) setReviewOpen(false);
      setClock(now); setView(next);
    } catch {
      if (mounted.current && !abort.signal.aborted && sequence.current === request) { setView(null); setError(copy.unavailable); setReviewOpen(false); }
    }
  }
  useEffect(() => {
    mounted.current = true;
    const start = setTimeout(() => { void load(); }, 0), focus = () => { void load(); };
    window.addEventListener('focus', focus);
    return () => { mounted.current = false; active.current?.abort(); clearTimeout(start); window.removeEventListener('focus', focus); };
    // The outer key binds reference/workspace/disabled lifetimes; the host supplies a stable client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);
  useEffect(() => {
    if (view?.kind !== 'proposal' || view.ticket.state !== 'pending') return;
    const remaining = Date.parse(view.ticket.expiresAt) - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setClock(Date.now()), remaining + 1);
    return () => clearTimeout(timer);
  }, [view]);
  async function decide(decision: 'confirm' | 'cancel'): Promise<void> {
    if (!mounted.current || disabled || lock.current || view?.kind !== 'proposal' || view.ticket.state !== 'pending' || Date.parse(view.ticket.expiresAt) <= Date.now()) throw Error(copy.stale);
    const body = captureAssistantProposalDecisionSchema.parse({ workspaceId: view.ticket.workspaceId, proposalId: view.ticket.proposalId, inputHash: view.ticket.inputHash, decision });
    const request = ++sequence.current, abort = new AbortController(); active.current?.abort(); active.current = abort;
    lock.current = true; setPending(true); setError('');
    try {
      const next = await client.decide(reference, body, abort.signal);
      if (!mounted.current || abort.signal.aborted || request !== sequence.current) throw Error(copy.stale);
      if (!captureAssistantViewMatches(reference, next) || next.kind !== 'proposal' || next.ticket.state !== (decision === 'confirm' ? 'confirmed' : 'cancelled')) throw Error(copy.stale);
      setReviewOpen(false); setView(next);
      try { await onRefresh(); } catch { /* The next history load reconciles the server-recorded result. */ }
    } catch {
      if (mounted.current && request === sequence.current) { setView(null); setError(copy.failed); setReviewOpen(false); }
      throw Error(copy.failed);
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  const expired = view?.kind === 'proposal' && view.ticket.state === 'pending' && Date.parse(view.ticket.expiresAt) <= clock;
  const confirm = () => decide('confirm');
  return <section aria-label={copy.title} aria-busy={pending || !view && !error && !disabled} className="grid min-w-0 gap-4 rounded-2xl border border-assistant-border bg-paper p-4 text-ink sm:p-5">
    {disabled || !view ? <><p role={error || disabled ? 'alert' : 'status'} className="m-0 text-sm leading-6">{disabled ? copy.unavailable : error || copy.loading}</p>{error && !disabled && <button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={() => { void load(); }}>{copy.retry}</button>}</>
      : <>
        <p className="m-0 text-xs text-muted">{copy.captured}: <time dateTime={view.retrievedAt}>{new Date(view.retrievedAt).toLocaleString('en-US', { timeZone: 'UTC' })} UTC</time></p>
        {view.kind === 'result' ? <ReadContent content={view.content} onOpen={onOpen} onCopy={onCopy} />
          : view.ticket.state !== 'pending' || expired ? <p role="status" className="m-0 text-sm leading-6">{expired ? copy.expired : view.ticket.state === 'confirmed' ? view.outcome || copy.completed : view.ticket.state === 'cancelled' ? copy.cancelled : view.ticket.state === 'superseded' ? copy.superseded : copy.expired}</p>
            : <>
              <h2 className="m-0 text-lg font-semibold wrap-anywhere">{view.title}</h2><p className="m-0 text-sm leading-6 text-muted">{copy.draftNotice}</p>
              {!reviewOpen ? <button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={() => setReviewOpen(true)}>{copy.review}</button> : <>
                {view.content.kind === 'source_action' && <CaptureSourceProjection view={view.content.view} pending={pending} onConfirm={confirm} onClose={() => setReviewOpen(false)} />}
                {view.content.kind === 'setup' && <><CaptureSetupProjection view={view.content.view} /><button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={() => { void confirm().catch(() => {}); }}>{pending ? copy.pending : view.title}</button></>}
                {view.content.kind === 'fields' && <><CaptureFormFieldEditor value={view.content.value} canRead canEdit={false} readOnlyMessage={copy.fixedReview} onChange={() => {}} /><button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={() => { void confirm().catch(() => {}); }}>{pending ? copy.pending : copy.confirm}</button></>}
                {view.content.kind === 'workflow' && <><CaptureLeadWorkflow value={view.content.value} source={view.content.source} teammates={view.content.teammates} canRead canEdit={false} readOnlyMessage={copy.fixedReview} onChange={() => {}} /><button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={() => { void confirm().catch(() => {}); }}>{pending ? copy.pending : copy.confirm}</button></>}
                {view.content.kind === 'publication' && <><p className="m-0 text-sm text-muted">{copy.publicationNotice}</p><CaptureSetupReview draft={view.content.draft} value={view.content.timing} canRead canEdit={false} canLaunch pending={pending} timingReadOnly onChange={() => {}} onEdit={() => {}} onLaunch={confirm} /></>}
                {view.content.kind === 'lifecycle' && <CapturePauseResumeDialog open action={view.content.action} source={view.content.source} canRead pending={pending} onClose={() => setReviewOpen(false)} onConfirm={confirm} />}
                {view.content.kind === 'intake' && <IntakeDecisionReview review={view.content.review} canRead pending={pending} onBack={() => setReviewOpen(false)} onConfirm={async () => { await confirm(); return { ok: true }; }} />}
              </>}
              <div className="flex min-w-0 flex-wrap gap-3">{reviewOpen && view.content.kind !== 'lifecycle' && <button type="button" className={button} disabled={pending} onClick={() => setReviewOpen(false)}>{copy.close}</button>}<button type="button" className={button} disabled={pending} onClick={() => { void decide('cancel').catch(() => {}); }}>{copy.cancel}</button></div>
              {pending && <p role="status" className="m-0 text-sm">{copy.pending}</p>}
            </>}
        {view?.kind === 'proposal' && view.ticket.state === 'confirmed' && view.content.kind === 'source_action' && view.content.view.receipt && view.content.view.receipt.kind !== 'intake' && <a className={button} href={`/lead-capture/${view.content.view.receipt.sourceId}?workspace=${view.ticket.workspaceId}`}>Open capture source</a>}
        {view?.kind === 'proposal' && view.ticket.state === 'confirmed' && view.content.kind === 'setup' && view.content.view.receipt?.kind === 'saved' && <a className={button} href={`/lead-capture/${view.content.view.receipt.sourceId}?workspace=${view.ticket.workspaceId}`}>Open saved source</a>}
      </>}
  </section>;
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { IntakeSourceEvidence } from '../intake-source-evidence/intake-source-evidence';
import type { IntakeEvidenceSnapshot } from '../intake-source-evidence/intake-source-evidence.validation';
import { IntakeProposedLeadEditor } from '../intake-proposed-lead-editor/intake-proposed-lead-editor';
import { intakeAnswerEdited, type IntakeProposedAnswers } from '../intake-proposed-lead-editor/intake-proposed-lead-editor.validation';
import { IntakeDuplicateDecision } from '../intake-duplicate-decision/intake-duplicate-decision';
import { IntakeDecisionReview, type IntakeDecisionReviewProps } from '../intake-decision-review/intake-decision-review';
import { intakeDecisionIssue, intakeDecisionKind, intakeDecisionRequest, type IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
import { intakeDecisionReviewData } from '../intake-decision-review/intake-decision-review.data';
import { intakeDetailReview, validIntakeDetailContext, validIntakeDetailRequest } from './intake-detail-page.validation';
import { intakeDetailPageData as copy } from './intake-detail-page.data';

export type IntakeDetailPageProps = {
  review: IntakeDecisionReviewModel; evidence: IntakeEvidenceSnapshot; originalAnswers: IntakeProposedAnswers;
  resolvedOutcome?: 'create' | 'separate' | 'link' | 'dismiss';
  canRead: boolean; canEdit: boolean; canReadMatches: boolean; uncertainFieldIds?: readonly string[]; timezone?: string;
  state?: 'ready' | 'loading' | 'error' | 'missing'; matchesState?: 'ready' | 'loading' | 'error'; pending?: boolean;
  /** Advance revision and clear duplicate approval whenever corrections or the authorized context change. */
  onAnswers: (answers: IntakeProposedAnswers) => void;
  onDecision: (decision: IntakeDecisionReviewModel['decision']) => void;
  onConfirm: IntakeDecisionReviewProps['onConfirm']; onReload?: () => Promise<void>; onRetryMatches?: () => void; onLeave: () => void;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
/** Version-bound composition. The host owns corrections, authoritative checks, idempotency and navigation guards beyond this page. */
export function IntakeDetailPage(props: IntakeDetailPageProps) {
  const { review, evidence, originalAnswers, canRead, canEdit, canReadMatches, matchesState = 'ready', state = 'ready' } = props;
  const id = useId(), heading = useRef<HTMLHeadingElement>(null), lock = useRef(false), attempts = useRef(new Map<string, string>());
  const reloadAttempt = useRef<{ signature: string; completed: boolean } | null>(null);
  const [blocked, setBlocked] = useState<{ id: string; version: number; kind: 'conflict' | 'capacity' } | null>(null);
  const [frozen, setFrozen] = useState<{ signature: string; review: IntakeDecisionReviewModel } | null>(null);
  const [completed, setCompleted] = useState<string | null>(null), [working, setWorking] = useState(false), [showErrors, setShowErrors] = useState(false), [leaving, setLeaving] = useState<string | null>(null);
  const currentReview = intakeDetailReview(review, canReadMatches, matchesState);
  const signature = JSON.stringify([currentReview, evidence, originalAnswers, canEdit, canReadMatches, matchesState, state]);
  const session = useRef({ signature, canRead });
  useEffect(() => { session.current = { signature, canRead }; }, [signature, canRead]);
  const busy = working || !!props.pending, success = completed === signature;
  const inReview = frozen?.signature === signature && !success;
  const dirty = !review.resolved && !success && (review.definition.fields.some(field => intakeAnswerEdited(originalAnswers[field.id], review.answers[field.id])) || review.decision !== 'create');
  useEffect(() => {
    if (!canRead || !dirty && !busy) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard);
  }, [canRead, dirty, busy]);
  useEffect(() => {
    if (reloadAttempt.current?.completed && reloadAttempt.current.signature !== signature) { setBlocked(null); reloadAttempt.current = null; }
  }, [signature, working]);
  useEffect(() => { if (inReview || success) heading.current?.focus(); }, [inReview, success]);
  const blockedHere = blocked?.id === review.intakeId && blocked.version === review.intakeVersion && (blocked.kind === 'conflict' || ['create', 'separate'].includes(intakeDecisionKind(currentReview))) ? blocked : null;
  const canDecide = !review.resolved && (review.canCreate || review.canLink || review.canDismiss);
  const reload = async () => {
    if (busy || lock.current || !props.onReload) return;
    lock.current = true; setWorking(true);
    reloadAttempt.current = { signature, completed: false };
    try { await props.onReload(); reloadAttempt.current.completed = true; } catch (error) { reloadAttempt.current = null; throw error; } finally { lock.current = false; setWorking(false); }
  };
  const leave = () => { if (busy || lock.current) return; if (dirty) setLeaving(signature); else props.onLeave(); };
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const leaveDialog = <ConfirmDialog open={leaving === signature} title={copy.discardTitle} description={copy.discardDescription} confirmLabel={copy.discard} cancelLabel={copy.keep} pending={busy} onClose={() => setLeaving(null)} onConfirm={() => { if (!busy && !lock.current && leaving === signature) { setLeaving(null); props.onLeave(); } }} />;
  if (state !== 'ready') return <div className="grid min-w-0 justify-items-start gap-5"><h1 className="m-0 text-heading font-semibold">{copy.title}</h1>{state === 'loading' ? <p role="status" aria-busy="true">{copy.loading}</p> : state === 'missing' ? <p role="status">{copy.missing}</p> : <FormFeedback kind="error" message={copy.error} />}{state === 'error' && props.onReload && <button type="button" className={button} disabled={busy} onClick={() => { void reload().catch(() => {}); }}>{copy.retry}</button>}<button type="button" className={button} disabled={busy} onClick={leave}>{copy.back}</button>{leaveDialog}</div>;
  if (!validIntakeDetailContext(review, evidence)) return <div className="grid min-w-0 justify-items-start gap-5"><FormFeedback kind="error" message={copy.invalid} /><button type="button" className={button} disabled={busy} onClick={leave}>{copy.back}</button>{leaveDialog}</div>;
  if (success) return <section className="grid min-w-0 justify-items-start gap-5"><h1 ref={heading} tabIndex={-1} className="m-0 text-heading font-semibold focus-visible:focus-ring">{copy.completed}</h1><p role="status" className="m-0 text-sm text-muted">{copy.completedDescription}</p><button type="button" className={button} onClick={props.onLeave}>{copy.back}</button></section>;
  const issue = showErrors ? intakeDecisionIssue(currentReview) : null;
  return <div className="grid min-w-0 gap-6">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4"><div className="grid min-w-0 gap-2"><h1 ref={heading} tabIndex={-1} className="m-0 text-heading font-semibold focus-visible:focus-ring">{copy.title}</h1><p className="m-0 text-sm leading-6 text-muted">{copy.description}</p></div><button type="button" className={button} disabled={busy} onClick={leave}>{copy.back}</button></header>
    {review.resolved && <p role="status" className="m-0 text-sm text-muted">{copy.resolved(intakeDecisionReviewData.outcomes[props.resolvedOutcome ?? intakeDecisionKind(review)])}</p>}
    {frozen && frozen.signature !== signature && <p role="status" className="m-0 text-sm text-muted">{copy.changed}</p>}
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <IntakeSourceEvidence snapshot={evidence} canRead timezone={props.timezone} />
      <div className="grid min-w-0 gap-6">
        {inReview && frozen ? <IntakeDecisionReview key={signature} review={frozen.review} canRead pending={busy} onBack={() => { if (!busy && !lock.current) { setFrozen(null); heading.current?.focus(); } }} onReload={props.onReload ? reload : undefined} onConfirm={async request => {
          if (busy || lock.current || !canDecide || session.current.signature !== signature || !session.current.canRead || !!blockedHere || !validIntakeDetailRequest(frozen.review, request)) throw new Error(copy.changed);
          lock.current = true; setWorking(true);
          const payload = intakeDecisionRequest(frozen.review)!;
          const key = JSON.stringify(payload), requestId = attempts.current.get(key) ?? crypto.randomUUID(); attempts.current.set(key, requestId);
          try {
            const result = await props.onConfirm(structuredClone({ ...payload, requestId }));
            if (session.current.signature !== signature || !session.current.canRead) throw new Error(copy.changed);
            if (result.ok) setCompleted(signature);
            else if (result.kind === 'conflict' || result.kind === 'capacity') setBlocked({ id: review.intakeId, version: review.intakeVersion, kind: result.kind });
            return result;
          } finally { lock.current = false; setWorking(false); }
        }} /> : <>
          <IntakeProposedLeadEditor record={{ id: review.intakeId, version: review.intakeVersion, resolved: review.resolved }} definition={review.definition} originalAnswers={originalAnswers} value={review.answers} uncertainFieldIds={props.uncertainFieldIds} canRead canEdit={canEdit} pending={busy} showErrors={showErrors} onChange={answers => { if (!busy && !lock.current && canEdit && !review.resolved) { reloadAttempt.current = null; props.onAnswers(answers); } }} />
          {review.duplicateRequired ? <IntakeDuplicateDecision review={{ intakeId: review.intakeId, intakeVersion: review.intakeVersion, revision: review.revision, resolved: review.resolved }} matches={currentReview.matches} value={typeof review.decision === 'string' ? null : review.decision} canRead canReadMatches={canReadMatches} canChoose={canDecide} canCreateSeparate={review.canCreate} canDismiss={review.canDismiss} matchesState={matchesState} pending={busy} onRetry={props.onRetryMatches} onChange={decision => { if (!busy && !lock.current && canDecide) { reloadAttempt.current = null; props.onDecision(decision); } }} />
            : canDecide && <fieldset disabled={busy} className="m-0 grid min-w-0 gap-3 rounded-2xl border border-line bg-paper p-5 sm:p-6"><legend className="px-2 text-sm font-semibold">{copy.disposition}</legend>{(['create', 'dismiss'] as const).map(kind => <label key={kind} className="flex min-h-11 items-center gap-3 text-sm"><input type="radio" name={`${id}-decision`} checked={review.decision === kind} disabled={busy || !(kind === 'create' ? review.canCreate : review.canDismiss)} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => { if (!busy && !lock.current) { reloadAttempt.current = null; props.onDecision(kind); } }} />{copy[kind]}</label>)}</fieldset>}
          {blockedHere && <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={intakeDecisionReviewData.issues[blockedHere.kind]} />{props.onReload && <button type="button" className={button} disabled={busy} onClick={() => { void reload().catch(() => {}); }}>{intakeDecisionReviewData.reload}</button>}</div>}
          {issue && (issue === 'checking' ? <p role="status" className="m-0 text-sm text-muted">{intakeDecisionReviewData.issues.checking}</p> : <FormFeedback kind="error" message={intakeDecisionReviewData.issues[issue]} />)}
          {canDecide && <button type="button" className={`${button} justify-self-start`} disabled={busy || !!blockedHere} onClick={() => {
            if (busy || lock.current || blockedHere) return; setShowErrors(true);
            if (!intakeDecisionIssue(currentReview)) setFrozen({ signature, review: structuredClone(currentReview) });
          }}>{copy.review}</button>}
        </>}
      </div>
    </div>
    {leaveDialog}
  </div>;
}

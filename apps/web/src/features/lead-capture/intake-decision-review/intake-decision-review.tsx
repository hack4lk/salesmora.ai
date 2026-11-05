'use client';

import { useId, useRef, useState } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { intakeDecisionReviewData as copy } from './intake-decision-review.data';
import { intakeDecisionIssue, intakeDecisionKind, intakeDecisionRequest, type IntakeDecisionRequest, type IntakeDecisionReviewModel } from './intake-decision-review.validation';
export type IntakeDecisionResult = { ok: true } | { ok: false; kind: 'error' | 'conflict' | 'capacity'; message?: string };
export type IntakeDecisionReviewProps = {
  /** Frozen authorized review. Advance revision whenever corrected values, target changes, workflow or permissions change. */
  review: IntakeDecisionReviewModel; canRead: boolean; pending?: boolean;
  onConfirm: (request: IntakeDecisionRequest) => Promise<IntakeDecisionResult>;
  onBack: () => void; onReload?: () => Promise<void>;
};
const action = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function IntakeDecisionReview({ review, canRead, pending = false, onConfirm, onBack, onReload }: IntakeDecisionReviewProps) {
  const id = useId(), lock = useRef(false), attempt = useRef<{ signature: string; id: string } | null>(null);
  const [working, setWorking] = useState<'confirm' | 'reload' | null>(null);
  const [failure, setFailure] = useState<{ signature: string; kind: 'error' | 'conflict' | 'capacity'; message: string } | null>(null);
  const [reloadFailed, setReloadFailed] = useState(false), [completed, setCompleted] = useState<string | null>(null);
  const contextKey = JSON.stringify([review.intakeId, review.intakeVersion, review.revision]);
  const [conflictKey, setConflictKey] = useState<string | null>(null);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const issue = intakeDecisionIssue(review), request = intakeDecisionRequest(review), kind = intakeDecisionKind(review);
  if (issue === 'invalid') return <FormFeedback kind="error" message={copy.issues.invalid} />;
  const signature = JSON.stringify(request), busy = pending || working !== null, success = completed === signature;
  const conflict = conflictKey === contextKey;
  const problem = failure?.signature === signature ? failure : null;
  const disabled = busy || !!issue || !request || conflict || success || problem?.kind === 'capacity';
  const submit = async () => {
    if (disabled || lock.current || !request) return;
    lock.current = true; setWorking('confirm'); setFailure(null); setReloadFailed(false);
    try {
      if (attempt.current?.signature !== signature) attempt.current = { signature, id: crypto.randomUUID() };
      const result = await onConfirm(structuredClone({ ...request, requestId: attempt.current.id } as IntakeDecisionRequest));
      if (result.ok) setCompleted(signature);
      else { setFailure({ signature, kind: result.kind, message: result.message || (result.kind === 'conflict' ? copy.issues.conflict : result.kind === 'capacity' ? copy.issues.capacity : copy.failure) }); if (result.kind === 'conflict') setConflictKey(contextKey); }
    } catch { setFailure({ signature, kind: 'error', message: copy.failure }); }
    finally { lock.current = false; setWorking(null); }
  };
  const reload = async () => {
    if (busy || lock.current || !onReload) return;
    lock.current = true; setWorking('reload'); setReloadFailed(false);
    try { await onReload(); } catch { setReloadFailed(true); }
    finally { lock.current = false; setWorking(null); }
  };
  const decision = review.decision;
  const target = typeof decision !== 'string' && decision.kind === 'link' ? review.matches.find(match => match.id === decision.leadId) : undefined;
  const rows = kind === 'link' && target && typeof review.decision !== 'string' && review.decision.kind === 'link' ? target.changes.filter(change => typeof review.decision !== 'string' && review.decision.kind === 'link' && review.decision.changeIds.includes(change.id)) : [];
  return <section aria-labelledby={id} aria-busy={busy} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6">
    <header className="grid gap-2"><h2 id={id} className="m-0 text-lg font-semibold">{copy.title}</h2><h3 className="m-0 text-base font-semibold">{copy.outcomes[kind]}</h3><p className="m-0 text-sm leading-6 text-muted">{copy.descriptions[kind]}</p></header>
    {kind === 'create' || kind === 'separate' ? <><section aria-labelledby={`${id}-details`} className="grid min-w-0 gap-3"><h3 id={`${id}-details`} className="m-0 text-base font-semibold">{copy.details}</h3><dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">{review.definition.fields.map(field => {
      const answer = Object.hasOwn(review.answers, field.id) ? review.answers[field.id] : '';
      const display = field.type === 'checkboxes' ? field.options.filter(option => Array.isArray(answer) && answer.includes(option.id)).map(option => option.label).join(', ') : field.type === 'dropdown' ? field.options.find(option => option.id === answer)?.label : typeof answer === 'string' ? answer : '';
      return <div key={field.id} className="min-w-0"><dt className="mb-1 text-xs font-semibold text-muted wrap-anywhere">{field.label}</dt><dd className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{display || copy.empty}</dd></div>;
    })}</dl></section><section aria-labelledby={`${id}-workflow`} className="grid gap-3"><h3 id={`${id}-workflow`} className="m-0 text-base font-semibold">{copy.workflow}</h3><dl className="m-0 grid min-w-0 gap-3">{review.workflow.map((row, index) => <div key={index} className="min-w-0"><dt className="mb-1 text-xs font-semibold text-muted wrap-anywhere">{row.label}</dt><dd className="m-0 text-sm leading-6 wrap-anywhere">{row.value}</dd></div>)}</dl></section></>
      : kind === 'link' && target ? <section className="grid min-w-0 gap-3"><p className="m-0 text-xs font-semibold text-muted">{copy.target}</p><p className="m-0 text-sm font-semibold wrap-anywhere">{target.name}</p><h3 className="m-0 text-base font-semibold">{copy.changes}</h3>{rows.length ? rows.map(row => <div key={row.id} className="grid min-w-0 gap-3 rounded-xl border border-line p-4"><h4 className="m-0 text-sm font-semibold wrap-anywhere">{row.label}</h4><dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2"><div><dt className="mb-1 text-xs text-muted">{copy.existing}</dt><dd className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{row.existing || copy.empty}</dd></div><div><dt className="mb-1 text-xs text-muted">{copy.proposed}</dt><dd className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{row.proposed || copy.empty}</dd></div></dl></div>) : <p className="m-0 text-sm text-muted">{copy.linkOnly}</p>}</section> : null}
    {success ? <FormFeedback kind="success" message={copy.success} /> : <>
      {issue && (issue === 'checking' ? <p role="status" className="m-0 text-sm text-muted">{copy.issues.checking}</p> : <FormFeedback kind="error" message={copy.issues[issue]} />)}
      {(problem || conflict) && <FormFeedback kind="error" message={problem?.message || copy.issues.conflict} />}
      {reloadFailed && <FormFeedback kind="error" message={copy.reloadFailed} />}
      {(conflict || problem?.kind === 'capacity') && onReload && <button type="button" className={`${action} justify-self-start`} disabled={busy} onClick={() => { void reload(); }}>{working === 'reload' ? copy.reloadPending : copy.reload}</button>}
    </>}
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-between"><button type="button" className={action} disabled={busy} onClick={() => { if (!busy && !lock.current) onBack(); }}>{copy.back}</button><form noValidate onSubmit={event => { event.preventDefault(); void submit(); }}><SubmitButton label={copy.confirm[kind]} pendingLabel={working === 'reload' ? copy.reloadPending : copy.pending} pending={busy} disabled={disabled} fullWidth /></form></div>
  </section>;
}

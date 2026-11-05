'use client';

import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { intakeSourceEvidenceData as copy } from './intake-source-evidence.data';
import { validIntakeEvidenceSnapshot, verifiedIntakeEvidence, type IntakeEvidenceSnapshot } from './intake-source-evidence.validation';
export type IntakeSourceEvidenceProps = {
  /** Host-authorized immutable original and extraction evidence from the same intake version. */
  snapshot?: IntakeEvidenceSnapshot; canRead: boolean; state?: 'ready' | 'loading' | 'error'; timezone?: string; onRetry?: () => void;
};
const panel = 'grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-5 sm:p-6';
const valueClass = 'm-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere';
export function IntakeSourceEvidence({ snapshot, canRead, state = 'ready', timezone = 'UTC', onRetry }: IntakeSourceEvidenceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (state === 'loading') return <p role="status" aria-busy="true" className={panel}>{copy.loading}</p>;
  if (state === 'error' || !validIntakeEvidenceSnapshot(snapshot)) return <div className={panel}><FormFeedback kind="error" message={state === 'error' ? copy.error : copy.invalid} />{onRetry && <button type="button" onClick={onRetry} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring">{copy.retry}</button>}</div>;
  let received = copy.unavailableDate as string;
  if (snapshot.receivedAt && Number.isFinite(Date.parse(snapshot.receivedAt))) { try { received = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(snapshot.receivedAt)); } catch { /* Preserve unavailable state rather than changing the supplied timezone. */ } }
  return <section aria-label={copy.title} className="grid min-w-0 gap-5 text-ink">
    <section aria-labelledby={`${id}-original`} className={panel}>
      <h2 id={`${id}-original`} className="m-0 text-lg font-semibold">{snapshot.type === 'gmail' ? copy.email : copy.form}</h2>
      <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2"><div className="min-w-0"><dt className="mb-1 text-sm font-semibold text-muted">{copy.source}</dt><dd className={valueClass}>{snapshot.sourceName}</dd></div><div><dt className="mb-1 text-sm font-semibold text-muted">{copy.received}</dt><dd className={valueClass}>{received === copy.unavailableDate ? received : <time dateTime={snapshot.receivedAt!}>{received}</time>}</dd></div>
        {snapshot.type === 'gmail' && <><div className="min-w-0"><dt className="mb-1 text-sm font-semibold text-muted">{copy.from}</dt><dd className={valueClass}>{snapshot.from || copy.noSender}</dd></div><div className="min-w-0"><dt className="mb-1 text-sm font-semibold text-muted">{copy.subject}</dt><dd className={valueClass}>{snapshot.subject || copy.noSubject}</dd></div></>}
      </dl>
      {snapshot.type === 'gmail' ? <div className="grid min-w-0 gap-2"><h3 className="m-0 text-sm font-semibold text-muted">{copy.body}</h3><p className={`${valueClass} rounded-xl border border-line bg-canvas p-4`}>{snapshot.body || copy.noBody}</p></div>
        : snapshot.answers.length ? <dl className="m-0 grid min-w-0 gap-4">{snapshot.answers.map(answer => <div key={answer.id} className="min-w-0 rounded-xl border border-line bg-canvas p-4"><dt className="mb-1 text-sm font-semibold text-muted wrap-anywhere">{answer.label}</dt><dd className={valueClass}>{answer.value || copy.noValue}</dd></div>)}</dl> : <p className={valueClass}>{copy.noAnswers}</p>}
    </section>
    <section aria-labelledby={`${id}-fields`} className={panel}>
      <h2 id={`${id}-fields`} className="m-0 text-lg font-semibold">{copy.fields}</h2>
      {snapshot.fields.length ? <ul className="m-0 grid min-w-0 list-none gap-4 p-0">{snapshot.fields.map(field => {
        const valid = verifiedIntakeEvidence(snapshot, field.origin);
        const location = valid && field.origin ? field.origin.kind === 'email' ? copy.locations[field.origin.location] : snapshot.type === 'website' ? snapshot.answers.find(answer => field.origin?.kind === 'form' && answer.id === field.origin.answerId)?.label : undefined : undefined;
        return <li key={field.id} className="grid min-w-0 gap-3 rounded-xl border border-line p-4"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h3 className="m-0 text-sm font-semibold wrap-anywhere">{field.label}</h3><StatusBadge label={!field.origin ? copy.missing : !valid || field.uncertain ? copy.uncertain : copy.found} tone={!field.origin || !valid || field.uncertain ? 'warning' : 'neutral'} /></div>
          {valid && field.origin ? <><p className="m-0 text-xs font-semibold text-muted wrap-anywhere">{location}</p><blockquote className="m-0 min-w-0 border-l-2 border-primary/20 pl-3 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{field.origin.quote}</blockquote></> : <p className="m-0 text-sm leading-6 text-muted">{field.origin ? copy.unsupported : copy.missingHelp}</p>}
        </li>;
      })}</ul> : <p className={valueClass}>{copy.noEvidence}</p>}
    </section>
  </section>;
}

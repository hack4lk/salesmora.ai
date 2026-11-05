'use client';

import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { intakeDuplicateDecisionData as copy } from './intake-duplicate-decision.data';
import { validIntakeDuplicateChoice, validIntakeDuplicateReview, type IntakeDuplicateChoice, type IntakeDuplicateMatch, type IntakeDuplicateReview } from './intake-duplicate-decision.validation';
export type IntakeDuplicateDecisionProps = {
  review: IntakeDuplicateReview;
  /** Host-authorized summaries only; no unauthorized candidate should be supplied. */
  matches: readonly IntakeDuplicateMatch[]; value: IntakeDuplicateChoice | null;
  canRead: boolean; canReadMatches: boolean; canChoose: boolean; canCreateSeparate: boolean; canDismiss: boolean;
  matchesState?: 'ready' | 'loading' | 'error'; pending?: boolean;
  onChange: (value: IntakeDuplicateChoice) => void; onRetry?: () => void;
};
export function IntakeDuplicateDecision({ review, matches, value, canRead, canReadMatches, canChoose, canCreateSeparate, canDismiss, matchesState = 'ready', pending = false, onChange, onRetry }: IntakeDuplicateDecisionProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const visibleMatches = canReadMatches && matchesState === 'ready' ? matches : [];
  if (!validIntakeDuplicateReview(review, visibleMatches)) return <FormFeedback kind="error" message={copy.invalid} />;
  const locked = pending || !canChoose || review.resolved;
  const current = validIntakeDuplicateChoice(review, visibleMatches, value) ? value : null;
  const selected = current?.kind === 'link' ? visibleMatches.find(match => match.id === current.leadId) : undefined;
  const linkable = visibleMatches.some(match => match.canLink);
  const available = { link: linkable, separate: canCreateSeparate, dismiss: canDismiss };
  const stale = !!value && (!current || !available[value.kind]);
  const choose = (kind: 'link' | 'separate' | 'dismiss') => {
    if (locked || !available[kind]) return;
    if (kind === 'link') { const match = visibleMatches.find(match => match.canLink)!; onChange({ kind, reviewRevision: review.revision, leadId: match.id, leadVersion: match.version, changeIds: [] }); }
    else onChange({ kind, reviewRevision: review.revision });
  };
  return <section aria-labelledby={id} aria-busy={pending} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6">
    <header className="grid gap-2"><h2 id={id} className="m-0 text-lg font-semibold">{copy.title}</h2><p className="m-0 text-sm leading-6 text-muted">{copy.description}</p></header>
    {(review.resolved || !canChoose) && <p role="status" className="m-0 text-sm text-muted">{review.resolved ? copy.resolved : copy.readonly}</p>}
    {stale && <FormFeedback kind="error" message={copy.stale} />}
    {!canReadMatches ? <p className="m-0 text-sm text-muted">{copy.missingAccess}</p> : matchesState === 'loading' ? <p role="status" aria-busy="true" className="m-0 text-sm text-muted">{copy.loading}</p> : matchesState === 'error' ? <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.error} />{onRetry && <button type="button" disabled={pending} onClick={onRetry} className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.retry}</button>}</div> : visibleMatches.length === 0 ? <p className="m-0 text-sm text-muted">{copy.noMatches}</p> : null}
    <fieldset disabled={locked} className="m-0 grid min-w-0 gap-3 border-0 p-0"><legend className="mb-3 text-sm font-semibold">{copy.choices}</legend>{(['link', 'separate', 'dismiss'] as const).map(kind => <label key={kind} className="flex min-w-0 items-start gap-3 rounded-xl border border-line p-4"><input type="radio" name={`${id}-disposition`} disabled={locked || !available[kind]} checked={current?.kind === kind && available[kind]} onChange={() => choose(kind)} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" /><span className="grid min-w-0 gap-1"><span className="text-sm font-semibold wrap-anywhere">{copy[kind]}</span><span className="text-sm leading-6 text-muted wrap-anywhere">{copy[`${kind}Description`]}</span>{!available[kind] && <span className="text-sm text-muted">{copy.unavailable}</span>}</span></label>)}</fieldset>
    {canReadMatches && matchesState === 'ready' && visibleMatches.length > 0 && <fieldset disabled={locked || current?.kind !== 'link'} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4"><legend className="px-2 text-sm font-semibold">{copy.matches}</legend>{visibleMatches.map(match => <label key={match.id} className="flex min-w-0 items-start gap-3 py-2"><input type="radio" name={`${id}-match`} checked={selected?.id === match.id} disabled={locked || current?.kind !== 'link' || !match.canLink} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => { if (!locked && current?.kind === 'link' && match.canLink) onChange({ kind: 'link', reviewRevision: review.revision, leadId: match.id, leadVersion: match.version, changeIds: [] }); }} /><span className="grid min-w-0 gap-1"><span className="text-sm font-semibold wrap-anywhere">{match.name}</span><span className="text-sm text-muted wrap-anywhere">{match.contact}</span><span className="text-sm text-muted wrap-anywhere">{match.reason}</span></span></label>)}</fieldset>}
    {selected && current?.kind === 'link' && <section aria-labelledby={`${id}-changes`} className="grid min-w-0 gap-4"><h3 id={`${id}-changes`} className="m-0 text-base font-semibold">{copy.changes}</h3><p className="m-0 text-sm leading-6 text-muted">{copy.linkHelp}</p>{selected.changes.length === 0 ? <p className="m-0 text-sm text-muted">{copy.noChanges}</p> : selected.changes.map(change => <div key={change.id} className="grid min-w-0 gap-4 rounded-xl border border-line p-4"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h4 className="m-0 text-sm font-semibold wrap-anywhere">{change.label}</h4>{change.existing === change.proposed ? <StatusBadge label={copy.unchanged} /> : <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" disabled={locked} checked={current.changeIds.includes(change.id)} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => { if (!locked) onChange({ ...current, changeIds: event.target.checked ? [...current.changeIds, change.id] : current.changeIds.filter(fieldId => fieldId !== change.id) }); }} /><span className="wrap-anywhere">{copy.apply(change.label)}</span></label>}</div><dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2"><div className="min-w-0"><dt className="mb-1 text-xs font-semibold text-muted">{copy.existing}</dt><dd className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{change.existing || copy.empty}</dd></div><div className="min-w-0"><dt className="mb-1 text-xs font-semibold text-muted">{copy.proposed}</dt><dd className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{change.proposed || copy.empty}</dd></div></dl></div>)}</section>}
  </section>;
}

'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woButton, woInput, woLabel } from '../work-order-ui';
import { WorkOrderVisitChoice, type WorkOrderJobVisit, type WorkOrderVisitChoiceValue } from '../work-order-visit-choice/work-order-visit-choice';
import { workOrderVisitChoiceData as visitCopy } from '../work-order-visit-choice/work-order-visit-choice.data';
import { calendarEventCardData as format } from '../../calendar/calendar-event-card/calendar-event-card.data';
import type { WorkOrderMember, CreateWorkOrderJob, CreateWorkOrderSource, CreateWorkOrderSourceOption, CreateWorkOrderValues } from '../work-order-preview.types';
import { copy, titleLimit } from './create-work-order-dialog.data';
export type CreateWorkOrderVisitContext = {
  state: 'ready' | 'loading' | 'error';
  visit: (WorkOrderJobVisit & { id: string; revision: string }) | null;
  onReload?: () => void;
};
export type CreateWorkOrderDialogProps = {
  open: boolean; job: CreateWorkOrderJob; members: WorkOrderMember[]; sources: CreateWorkOrderSourceOption[]; canCreate: boolean;
  jobClosed?: boolean; initialTitle?: string; pending?: boolean; error?: string; onClose: () => void;
  onConfirm: (value: CreateWorkOrderValues) => void | Promise<void>;
  /** Opt-in review composition. Legacy callers may omit it for an independent draft. */
  visitContext?: CreateWorkOrderVisitContext;
};
const parse = (value: string): CreateWorkOrderSource => {
  const [kind, id] = value.split(':');
  return kind === 'duplicate' ? { kind, workOrderId: id } : kind === 'estimate' ? { kind, estimateId: id } : { kind: 'blank' };
};
export function CreateWorkOrderDialog(props: CreateWorkOrderDialogProps) {
  return <CreationSession key={`${props.open}:${props.job.id}`} {...props}/>;
}
function CreationSession({ open, job, members, sources, canCreate, jobClosed = false, initialTitle = '', pending, error, onClose, onConfirm, visitContext }: CreateWorkOrderDialogProps) {
  const id = useId(), titleField = useRef<HTMLInputElement>(null), summary = useRef<HTMLDListElement>(null);
  const [title, setTitle] = useState(initialTitle || job.title), [assignee, setAssignee] = useState(job.ownerId ?? ''), [source, setSource] = useState('blank');
  const [selection, setSelection] = useState<{ key: string; value: WorkOrderVisitChoiceValue }>(), [reviewed, setReviewed] = useState('');
  const allowed = canCreate && !jobClosed, kind = source.split(':')[0] as keyof typeof copy.sourceHint;
  const visit = visitContext?.visit;
  const visitKey = JSON.stringify([visitContext?.state, visit?.id, visit?.revision, visit?.scheduledDate, visit?.arrivalWindow, visit?.canJoin, canCreate, jobClosed]);
  const [observedVisitKey, setObservedVisitKey] = useState(visitKey);
  // Clear the previous decision when its source changes; it must not reappear if a permission is later restored.
  if (observedVisitKey !== visitKey) { setObservedVisitKey(visitKey); setSelection(undefined); setReviewed(''); }
  const choice = selection?.key === visitKey ? selection.value : null;
  const validVisit = !visitContext || (visitContext.state === 'ready' && (!visit || choice === 'separate' || (choice === 'job' && visit.canJoin)));
  const valid = allowed && !!title.trim() && validVisit && (!visitContext || ((!assignee || members.some(m => m.id === assignee)) && (source === 'blank' || sources.some(s => s.value === source))));
  const signature = JSON.stringify([visitKey, choice, title.trim(), assignee, source]);
  const reviewing = !!visitContext && valid && reviewed === signature;
  useEffect(() => { if (reviewing) summary.current?.focus(); }, [reviewing]);
  const value: CreateWorkOrderValues = { jobId: job.id, title: title.trim(), assigneeId: assignee || null, source: parse(source),
    ...(visitContext ? { visit: choice === 'job' && visit ? { kind: 'job' as const, visitId: visit.id, revision: visit.revision } : { kind: 'separate' as const } } : {}) };
  const fields = [
    { label: copy.job, value: `${job.number} · ${job.title}` }, { label: copy.customer, value: job.customerName },
    { label: copy.address, value: job.address }, { label: copy.titleLabel, value: title.trim() }, { label: copy.assignee, value: members.find(m => m.id === assignee)?.name ?? copy.unassigned },
    { label: copy.start, value: source === 'blank' ? copy.blank : sources.find(s => s.value === source)?.label ?? copy.blank },
    { label: copy.visit, value: choice === 'job' ? visitCopy.useJob : visitCopy.separate },
    { label: copy.scheduled, value: choice === 'job' && visit ? format.date(visit.scheduledDate) : copy.unscheduled },
    ...(choice === 'job' && visit ? [{ label: copy.window, value: visit.arrivalWindow ? format.window(visit.arrivalWindow) : visitCopy.noWindow }, { label: copy.timezone, value: visit.timezone }] : []),
  ];
  return <JobDialog open={open} title={reviewing ? copy.reviewTitle : copy.title} description={reviewing ? copy.reviewDescription : copy.description}
    confirmLabel={visitContext ? reviewing ? copy.confirm : copy.review : copy.create} confirmDisabled={!valid} closeOnSubmit={!visitContext || reviewing}
    pending={pending} error={error} onClose={onClose} onSubmit={async () => { if (!valid) return; if (visitContext && !reviewing) setReviewed(signature); else await onConfirm(value); }}>
    {!allowed && <p role="status" className="m-0 mb-4 text-sm font-semibold text-ink">{jobClosed ? copy.jobClosed : copy.noPermission}</p>}
    {reviewing ? <>
      <dl ref={summary} tabIndex={-1} aria-label={copy.reviewSummary} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring sm:grid-cols-2">
        {fields.map(field => <div key={field.label} className="min-w-0"><dt className="font-semibold text-muted">{field.label}</dt><dd className="m-0 mt-1 whitespace-pre-wrap wrap-anywhere">{field.value}</dd></div>)}
      </dl>
      {choice === 'job' && visit && <section aria-labelledby={`${id}-records`} className="grid min-w-0 gap-2">
        <h3 id={`${id}-records`} className="m-0 text-sm font-semibold">{copy.sharedRecords}</h3>
        <ul className="m-0 grid list-none gap-1 p-0 text-sm">{[...new Set(visit.references)].map(ref => <li key={ref} className="wrap-anywhere">{ref}</li>)}</ul>
        <p className="m-0 text-sm leading-6 text-muted">{copy.sharedReview}</p><p className="m-0 text-sm leading-6 text-muted">{visitCopy.sharedHelp}</p>
      </section>}
      {choice !== 'job' && <p className="m-0 text-sm leading-6 text-muted">{visitCopy.separateSelected}</p>}
      <p className="m-0 text-xs leading-5 text-muted">{copy.draftNote}</p>
      <button type="button" className={woButton} onClick={() => { setReviewed(''); requestAnimationFrame(() => titleField.current?.focus()); }}>{copy.edit}</button>
    </> : <>
      <dl className="m-0 mb-4 grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-3 sm:grid-cols-2">
        <div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.job}</dt><dd className="m-0 text-sm wrap-anywhere">{job.number} · {job.title}</dd></div>
        <div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.customer}</dt><dd className="m-0 text-sm wrap-anywhere">{job.customerName}</dd></div>
        <div className="min-w-0 sm:col-span-2"><dt className="text-xs font-semibold text-muted">{copy.address}</dt><dd className="m-0 text-sm wrap-anywhere">{job.address}</dd></div>
      </dl>
      <label className={woLabel}>{copy.titleLabel}<input ref={titleField} required className={woInput} value={title} maxLength={titleLimit} disabled={!allowed} placeholder={copy.titlePlaceholder} aria-describedby={`${id}-title-count`} onChange={e => setTitle(e.target.value)}/></label>
      <span id={`${id}-title-count`} className="text-xs text-muted">{copy.counter(title.length, titleLimit)}</span>
      <label className={woLabel}>{copy.assignee}<select className={woInput} value={assignee} disabled={!allowed} aria-describedby={`${id}-assignee-hint`} onChange={e => setAssignee(e.target.value)}>
        <option value="">{copy.unassigned}</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select></label><span id={`${id}-assignee-hint`} className="text-xs text-muted">{copy.assigneeHint}</span>
      <label className={woLabel}>{copy.start}<select className={woInput} value={source} disabled={!allowed} aria-describedby={`${id}-source-hint`} onChange={e => setSource(e.target.value)}>
        <option value="blank">{copy.blank}</option>{sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select></label><span id={`${id}-source-hint`} className="text-xs text-muted">{sources.find(s => s.value === source)?.detail || copy.sourceHint[kind]}</span>
      {visitContext && <WorkOrderVisitChoice jobVisit={visit ?? null} state={visitContext.state} value={choice} disabled={!allowed} onRetry={visitContext.onReload} onChange={value => setSelection({ key: visitKey, value })}/>}
      <p className="m-0 text-xs leading-5 text-muted">{copy.draftNote}</p>
    </>}
  </JobDialog>;
}

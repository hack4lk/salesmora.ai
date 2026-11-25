'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { calendarWeekdays, workflowRoutineBookingValuesSchema, type WorkflowDraft, type WorkflowRoutineBookingValues } from '@salesmora/contracts';
import { routineBookingReview } from '@salesmora/domain';
import { WorkflowNotificationChoices } from '../workflow-notification-choices';
import { workflowRoutineBookingCardData as copy } from './workflow-routine-booking-card.data';

type RulesDraft = Omit<WorkflowRoutineBookingValues['rules'], 'durationMinutes' | 'gapMinutes' | 'horizonDays'> & {
  durationMinutes: number | null; gapMinutes: number | null; horizonDays: number | null;
};
export type WorkflowRoutineBookingDraft = Omit<WorkflowRoutineBookingValues, 'rules'> & { rules: RulesDraft };
export type BookingAssignmentMode='assigned'|'qualified_if_unassigned';
type BookingSubmission={revision:string;timezone:string;values:WorkflowRoutineBookingValues};
export type WorkflowRoutineBookingCardProps = {
  value: WorkflowRoutineBookingDraft; revision: string; timezone: string;
  services: readonly { value: string; label: string }[]; recipients: readonly { id: string; name: string }[];
  state: WorkflowDraft['state']; expiresAt: string | null; canSubmit: boolean; disabled?: boolean;
  editing?: { status: 'active' | 'paused' }; availabilityReady: boolean;
  onManageAvailability?: () => void; onCancel: () => void | Promise<void>;
  onSubmit: (input: { revision: string; timezone: string; values: WorkflowRoutineBookingValues }) => void | Promise<void>;
  /** Gated host boundary: never send automatic selection to the existing assigned-people endpoint. */
  workerSelection?:{canChoose?:boolean;mode:BookingAssignmentMode;qualifiedWorkerCounts:Readonly<Record<string,number>>;onManageWorkers?:()=>void;
    onSubmit:(input:BookingSubmission&{assignmentMode:'qualified_if_unassigned'})=>void|Promise<void>};
};
const inputClass = 'min-h-11 min-w-0 w-full rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-70';
const labelClass = 'grid min-w-0 gap-1 text-sm font-semibold';
const buttonClass = 'min-h-11 max-w-full cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-foreground focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function WorkflowRoutineBookingCard(props: WorkflowRoutineBookingCardProps) {
  return <BookingReview key={JSON.stringify([props.revision, props.timezone, props.expiresAt, !!props.editing,props.workerSelection?.mode])} {...props}/>;
}
function BookingReview(props: WorkflowRoutineBookingCardProps) {
  const id = useId(), lock = useRef(false), nameField = useRef<HTMLInputElement>(null), reviewTitle = useRef<HTMLHeadingElement>(null);
  const [value, setValue] = useState(props.value), [settings, setSettings] = useState(!workflowRoutineBookingValuesSchema.safeParse({ ...props.value, notifications: { inApp: true, email: true } }).success);
  const [pending, setPending] = useState(false), [error, setError] = useState('');
  const [assignmentMode,setAssignmentMode]=useState<BookingAssignmentMode>(props.workerSelection?.mode??'assigned');
  const qualified=assignmentMode==='qualified_if_unassigned';
  const selectionAllowed=props.workerSelection?.canChoose!==false;
  const workersReady=!qualified||selectionAllowed&&!!props.workerSelection&&(props.workerSelection.qualifiedWorkerCounts[value.service]??0)>0;
  const [expired, setExpired] = useState(() => props.expiresAt !== null && (!Number.isFinite(Date.parse(props.expiresAt)) || Date.parse(props.expiresAt) <= Date.now()));
  useEffect(() => {
    if (props.expiresAt === null || expired) return;
    const remaining = Date.parse(props.expiresAt) - Date.now();
    const timer = setTimeout(() => setExpired(true), Math.max(0, remaining)); return () => clearTimeout(timer);
  }, [props.expiresAt, expired]);
  const state = props.state === 'pending' && expired ? 'expired' : props.state;
  const editable = state === 'pending' && props.canSubmit && !props.disabled && !pending;
  const parsed = workflowRoutineBookingValuesSchema.safeParse(value);
  const settingsParsed = workflowRoutineBookingValuesSchema.safeParse({ ...value, notifications: { inApp: true, email: true } });
  const initialParsed = workflowRoutineBookingValuesSchema.safeParse(props.value);
  const service = props.services.find(item => item.value === value.service), recipient = props.recipients.find(item => item.id === value.recipientId);
  const validSettings = settingsParsed.success && !!service && !!recipient;
  const valid = parsed.success && validSettings;
  const invalidField = settingsParsed.success ? undefined : settingsParsed.error.issues[0]?.path;
  const invalidMessage = !service ? copy.invalidService : !recipient ? copy.invalidRecipient : invalidField?.[0] === 'name' ? copy.invalidName
    : invalidField?.[1] === 'durationMinutes' ? copy.invalidDuration : invalidField?.[1] === 'gapMinutes' ? copy.invalidGap
    : invalidField?.[1] === 'horizonDays' ? copy.invalidHorizon : invalidField?.[1] === 'weekdays' ? copy.invalidDays
    : invalidField?.[1] === 'hours' ? copy.invalidHours : copy.invalid;
  const changed = assignmentMode!==(props.workerSelection?.mode??'assigned') || JSON.stringify(parsed.success ? parsed.data : value) !== JSON.stringify(initialParsed.success ? initialParsed.data : props.value);
  const summary = validSettings ? routineBookingReview({...settingsParsed.data,service:service!.label}) : null;
  const updateRule = (next: Partial<RulesDraft>) => { if (editable) setValue(current => ({ ...current, rules: { ...current.rules, ...next } })); };
  const update = (next: Partial<WorkflowRoutineBookingDraft>) => { if (editable) setValue(current => ({ ...current, ...next })); };
  const toggleSettings = () => {
    const next = !settings; setSettings(next);
    requestAnimationFrame(() => { if (next) nameField.current?.focus(); else reviewTitle.current?.focus(); });
  };
  const act = async (decision: 'submit' | 'cancel') => {
    if (lock.current || pending || props.disabled || state !== 'pending') return;
    if (decision === 'submit' && (!props.canSubmit || !valid || !props.availabilityReady || !workersReady || props.editing && !changed)) return;
    lock.current = true; setPending(true); setError('');
    try {
      if (decision === 'cancel') await props.onCancel();
      else if (parsed.success) { const submission={ revision: props.revision, timezone: props.timezone, values: parsed.data };
        if(qualified){if(!props.workerSelection)throw Error('Qualified-worker selection is unavailable.');await props.workerSelection.onSubmit({...submission,assignmentMode:'qualified_if_unassigned'});}
        else await props.onSubmit(submission);setSettings(false); }
      requestAnimationFrame(() => reviewTitle.current?.focus());
    } catch { setError(copy.error); }
    finally { lock.current = false; setPending(false); }
  };
  const rows = summary ? [
    [copy.summaryLabels.service, service!.label], ...(props.workerSelection?[[copy.assignment,qualified?copy.qualified:copy.assigned]]:[]), [copy.summaryLabels.duration, summary.duration], [copy.summaryLabels.days, summary.days],
    [copy.summaryLabels.hours, summary.hours], [copy.summaryLabels.gap, summary.gap], [copy.summaryLabels.horizon, summary.horizon], [copy.summaryLabels.recipient, recipient!.name],
  ] : [];
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <header className="grid gap-2"><h3 ref={reviewTitle} tabIndex={-1} id={`${id}-title`} className="m-0 text-lg font-semibold wrap-anywhere focus-visible:focus-ring">{props.editing ? `Edit ${value.name.trim() || copy.title}` : value.name.trim() || copy.title}</h3>
      {summary && <p className="m-0 text-sm leading-6">{qualified?copy.qualifiedSummary(service!.label):summary.summary}</p>}
    </header>
    {settings && state === 'pending' ? <fieldset disabled={!editable} className="m-0 grid min-w-0 gap-3 border-0 p-0">
      <legend className="sr-only">Booking settings</legend>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>{copy.name}<input ref={nameField} value={value.name} maxLength={120} required className={inputClass} onChange={event => update({ name: event.target.value })}/></label>
        <label className={`${labelClass} sm:col-span-2`}>{copy.service}<select className={inputClass} value={service ? value.service : ''} onChange={event => update({ service: event.target.value })}>
          <option value="" disabled>{copy.chooseService}</option>{props.services.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select></label>
        {props.workerSelection&&<label className={`${labelClass} sm:col-span-2`}>{copy.assignment}<select className={inputClass} value={assignmentMode} onChange={event=>{if(editable)setAssignmentMode(event.target.value as BookingAssignmentMode);}}><option value="assigned">{copy.assigned}</option><option value="qualified_if_unassigned" disabled={!selectionAllowed}>{copy.qualified}</option></select></label>}
        <label className={labelClass}>{copy.duration}<input type="number" required min={15} max={480} step={1} className={inputClass} value={value.rules.durationMinutes ?? ''}
          onChange={event => updateRule({ durationMinutes: event.target.value === '' ? null : Number(event.target.value) })}/></label>
        <label className={labelClass}>{copy.gap}<input type="number" required min={0} max={120} step={1} className={inputClass} value={value.rules.gapMinutes ?? ''}
          onChange={event => updateRule({ gapMinutes: event.target.value === '' ? null : Number(event.target.value) })}/></label>
      </div>
      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0"><legend className="mb-2 text-sm font-semibold">{copy.days}</legend>
        <div className="flex min-w-0 flex-wrap gap-2">{calendarWeekdays.map(day => <label key={day} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-2 py-1 text-sm has-disabled:cursor-not-allowed ${value.rules.weekdays.includes(day) ? 'border-assistant-accent bg-assistant-message' : 'border-assistant-border'}`}>
          <input type="checkbox" className="size-4 accent-seafoam-dark focus-visible:focus-ring" aria-label={copy.fullDays[day]} checked={value.rules.weekdays.includes(day)} onChange={event => updateRule({ weekdays: calendarWeekdays.filter(item => item === day ? event.target.checked : value.rules.weekdays.includes(item)) })}/>{copy.weekdays[day]}
        </label>)}</div>
      </fieldset>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className={labelClass}>{copy.start}<input type="time" required className={inputClass} value={value.rules.hours.startTime} onChange={event => updateRule({ hours: { ...value.rules.hours, startTime: event.target.value } })}/></label>
        <label className={labelClass}>{copy.finish}<input type="time" required className={inputClass} value={value.rules.hours.endTime} onChange={event => updateRule({ hours: { ...value.rules.hours, endTime: event.target.value } })}/></label>
        <label className={labelClass}>{copy.horizon}<input type="number" required min={1} max={31} step={1} className={inputClass} value={value.rules.horizonDays ?? ''} onChange={event => updateRule({ horizonDays: event.target.value === '' ? null : Number(event.target.value) })}/></label>
        <label className={labelClass}>{copy.recipient}<select className={inputClass} value={recipient ? value.recipientId : ''} onChange={event => update({ recipientId: event.target.value })}>
          <option value="" disabled>{copy.chooseRecipient}</option>{props.recipients.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select></label>
      </div>
      <p className="m-0 text-xs leading-5 text-assistant-muted">{copy.hoursHelp}</p>
    </fieldset> : summary && <dl className="m-0 grid gap-2 text-sm">{rows.map(([label, text]) => <div key={label} className="grid min-w-0 grid-cols-[7rem_1fr] gap-x-3 gap-y-1">
      <dt className="text-assistant-muted">{label}</dt><dd className="m-0 font-semibold wrap-anywhere">{text}</dd>
    </div>)}</dl>}
    {state === 'pending' && <button type="button" className={`${buttonClass} justify-self-start`} disabled={settings ? pending || props.disabled || !validSettings : !editable} onClick={toggleSettings}>{settings ? copy.done : copy.edit}</button>}
    {!validSettings && state === 'pending' && <p role="alert" className="m-0 text-sm leading-6">{invalidMessage}</p>}
    <p className="m-0 text-xs leading-5 text-assistant-muted">Times in {props.timezone}. {copy.starts}</p>
    <WorkflowNotificationChoices dark value={value.notifications} disabled={!editable} onChange={editable ? notifications => update({ notifications }) : undefined}/>
    <div className="grid gap-2 text-sm leading-6 text-assistant-muted"><p className="m-0">{copy.keep}</p>
      {qualified&&<p className="m-0">{copy.qualifiedHelp}</p>}
      {recipient && <p className="m-0">{qualified?copy.qualifiedNoSlot(recipient.name):copy.noSlot(recipient.name)}</p>}
      {qualified&&!workersReady&&state==='pending'&&<div role="status" className="grid gap-2 rounded-lg border border-assistant-border bg-assistant-message p-3"><p className="m-0">{selectionAllowed?copy.noWorkers:copy.selectionUnavailable}</p>{selectionAllowed&&props.workerSelection?.onManageWorkers&&<button type="button" className={`${buttonClass} justify-self-start`} disabled={!editable} onClick={props.workerSelection.onManageWorkers}>{copy.manageWorkers}</button>}</div>}
      {props.availabilityReady ? <p className="m-0">{copy.usesAvailability}</p> : <div role="status" className="grid gap-2 rounded-lg border border-assistant-border bg-assistant-message p-3">
        <p className="m-0">{copy.missingAvailability}</p>{props.onManageAvailability && <button type="button" className={`${buttonClass} justify-self-start`} disabled={!editable} onClick={props.onManageAvailability}>{copy.manageAvailability}</button>}
      </div>}
      {props.editing && <p className="m-0">{props.editing.status === 'paused' ? copy.paused : copy.editing}</p>}
    </div>
    {!props.canSubmit && state === 'pending' && <p role="status" className="m-0 text-sm">{copy.readOnly}</p>}
    {(pending || state !== 'pending') && <p role="status" className="m-0 text-sm">{pending ? copy.saving : state === 'confirmed' && props.editing ? copy.updated : copy.labels[state]}</p>}
    {error && <p role="alert" className="m-0 text-sm">{error}</p>}
    {state === 'pending' && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={!editable || !valid || !props.availabilityReady || !workersReady || !!props.editing && !changed} aria-busy={pending} onClick={() => void act('submit')}
        className="min-h-11 max-w-full cursor-pointer rounded-lg bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{props.editing ? copy.save : copy.publish}</button>
      <button type="button" className={buttonClass} disabled={pending || props.disabled} onClick={() => void act('cancel')}>{copy.cancel}</button>
    </div>}
  </section>;
}

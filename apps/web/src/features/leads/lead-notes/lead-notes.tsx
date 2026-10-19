'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { FormFeedback, SubmitButton, fieldClasses } from '@salesmora/ui';
import { createLeadDateFormatter } from '../lead-date';
import { leadNotesData as copy } from './lead-notes.data';

export type LeadNote = { id: string; body: string; authorName: string; createdAt: string; viaAssistant?: boolean };
export type LeadNoteRequest = { leadId: string; submissionId: string; body: string };
export type LeadNotesProps = {
  leadId: string; notes: readonly LeadNote[]; value: string; now: string; timezone: string;
  total?: number; loading?: boolean; loadError?: string; disabled?: boolean; pending?: boolean;
  onChange: (value: string) => void;
  /** Caller enforces scoped lead read access, body limits and idempotency; actor/time come from the server. */
  onAdd: (request: LeadNoteRequest) => Promise<{ ok: true; note: LeadNote } | { ok: false; message?: string }>;
  onAdded: (note: LeadNote) => void;
  onLoadMore?: () => void; onRetry?: () => void;
};

/** Readable leads permit append-only team notes; there is no separate role-specific note grant here. */
export function LeadNotes({ leadId, notes, value, now, timezone, total = notes.length, loading = false, loadError, disabled = false, pending = false,
  onChange, onAdd, onAdded, onLoadMore, onRetry }: LeadNotesProps) {
  const id = useId(), input = useRef<HTMLTextAreaElement>(null), locked = useRef(false);
  const attempt = useRef<{ body: string; leadId: string; id: string } | null>(null);
  const [working, setWorking] = useState(false), [failure, setFailure] = useState<string>(), [validation, setValidation] = useState<string>(), [added, setAdded] = useState(false);
  const busy = pending || working;
  useEffect(() => { if (added && !busy) input.current?.focus(); }, [added, busy]);
  const date = createLeadDateFormatter(now, timezone);
  const ordered = [...notes].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || busy || disabled) return;
    const body = value.trim();
    if (!body || body.length > copy.limit) { setValidation(body ? copy.tooLong : copy.required); input.current?.focus(); return; }
    if (attempt.current?.body !== body || attempt.current.leadId !== leadId) attempt.current = { body, leadId, id: crypto.randomUUID() };
    locked.current = true; setWorking(true); setFailure(undefined); setValidation(undefined); setAdded(false);
    try {
      const result = await onAdd({ leadId, body, submissionId: attempt.current.id });
      if (result.ok) { onAdded(result.note); onChange(''); attempt.current = null; setAdded(true); }
      else setFailure(result.message?.trim() || copy.failed);
    } catch { setFailure(copy.failed); }
    finally { locked.current = false; setWorking(false); }
  }
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6">
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2>
    <form aria-label={copy.label} aria-busy={busy} noValidate onSubmit={submit} className="grid min-w-0 gap-4">
      <MuiTextField id={`${id}-input`} inputRef={input} name="note" label={copy.label} placeholder={copy.placeholder} value={value} disabled={busy || disabled} multiline minRows={3} fullWidth size="small"
        error={!!validation} helperText={validation || copy.helper} slotProps={{ htmlInput: { 'aria-describedby': `${id}-input-helper-text ${id}-count` } }}
        onChange={event => { if (!busy && !disabled) { onChange(event.target.value); setValidation(undefined); setFailure(undefined); setAdded(false); } }} className={fieldClasses}/>
      <p id={`${id}-count`} className={`m-0 text-sm ${value.trim().length > copy.limit ? 'text-red-800' : 'text-muted'}`}>{copy.count(value.trim().length)}</p>
      {failure && <FormFeedback kind="error" message={failure}/>}
      {added && <p role="status" className="m-0 text-sm text-success">{copy.success}</p>}
      <div className="flex justify-end"><SubmitButton label={copy.submit} pendingLabel={copy.pending} pending={busy} disabled={disabled} fullWidth={false}/></div>
    </form>
    <div role="region" aria-labelledby={`${id}-history`} aria-busy={loading} className="grid min-w-0 gap-5 border-t border-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 id={`${id}-history`} className="m-0 text-base font-semibold text-ink">{copy.history}</h3><span className="text-sm text-muted">{copy.newest}</span></div>
      {loadError && <><FormFeedback kind="error" message={loadError}/>{onRetry && <button type="button" disabled={loading || busy || disabled} onClick={() => { if (!loading && !busy && !disabled) onRetry(); }} className="min-h-11 w-fit cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.retry}</button>}</>}
      {ordered.length ? <ol className="m-0 grid list-none gap-5 p-0">{ordered.map(note => {
        const created = date(note.createdAt);
        return <li key={note.id} className="grid min-w-0 gap-2 border-b border-line pb-5 last:border-0 last:pb-0">
          <p className="m-0 text-base leading-6 whitespace-pre-line text-ink wrap-anywhere">{note.body}</p>
          <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{note.viaAssistant ? copy.assistant(note.authorName) : note.authorName}</p>
          {created ? <time dateTime={note.createdAt} className="text-xs leading-5 text-muted">{created.exact}</time> : <span className="text-xs text-muted">{copy.dateUnavailable}</span>}
        </li>;
      })}</ol> : !loading && !loadError && <p className="m-0 text-sm text-muted">{copy.empty}</p>}
      {loading && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
      {!loading && !loadError && <p className="m-0 text-xs text-muted">{copy.loaded(notes.length, total)}</p>}
      {notes.length < total && onLoadMore && !loadError && <button type="button" disabled={loading || busy || disabled} onClick={() => { if (!loading && !busy && !disabled) onLoadMore(); }} className="min-h-11 w-fit cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.older}</button>}
    </div>
  </section>;
}

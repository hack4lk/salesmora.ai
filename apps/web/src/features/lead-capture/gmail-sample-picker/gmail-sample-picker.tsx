'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FormFeedback, HelpTooltip, TextField } from '@salesmora/ui';
import { gmailSamplePickerData as copy } from './gmail-sample-picker.data';

/** Safe metadata projection. Hosts must not return snippets, HTML or credential data. */
export type GmailSampleCandidate = { id: string; subject: string; sender: string; receivedAt: string };
export type GmailSelectedExample = GmailSampleCandidate & { body: string; retrievalId?: string };
export type GmailSamplePickerProps = {
  /** Account identity/generation and saved draft/rule version. Changing it discards stale previews. */
  bindingKey: string; accountEmail: string; connected: boolean;
  canRead: boolean; canEdit: boolean; pending?: boolean;
  onSearch: (subjectPhrase: string) => Promise<readonly GmailSampleCandidate[]>;
  onPreview: (messageId: string) => Promise<GmailSelectedExample>;
  /** Preserve provider provenance separately from editable text. Never infer it from an email address. */
  onUse: (sample: GmailSelectedExample) => Promise<void>;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function validCandidate(row: GmailSampleCandidate) {
  return typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 4096 && typeof row.subject === 'string' && row.subject.length <= 500 && typeof row.sender === 'string' && row.sender.length <= 500 && typeof row.receivedAt === 'string' && row.receivedAt.length <= 40 && Number.isFinite(Date.parse(row.receivedAt));
}
function receivedAt(value: string) {
  return `${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value))} UTC`;
}

export function GmailSamplePicker(props: GmailSamplePickerProps) {
  if (!props.canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (!props.canEdit) return <p className="m-0 text-sm text-muted">{copy.readOnly}</p>;
  if (!props.connected) return <p role="status" className="m-0 text-sm text-muted">{copy.reconnect}</p>;
  return <Picker key={props.bindingKey} {...props} />;
}

/** No mailbox access occurs on mount. Search, preview and use are separate deliberate actions. */
function Picker(props: GmailSamplePickerProps) {
  const id = useId(), [query, setQuery] = useState('');
  const [rows, setRows] = useState<readonly GmailSampleCandidate[] | null>(null);
  const [selected, setSelected] = useState<GmailSelectedExample | null>(null);
  const [working, setWorking] = useState<'search' | 'preview' | 'use' | null>(null);
  const [error, setError] = useState(''), [queryError, setQueryError] = useState(false);
  const [applied, setApplied] = useState(false);
  const lock = useRef(false), alive = useRef(true), queryInput = useRef<HTMLInputElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const busy = !!props.pending || working !== null;
  const run = async (kind: NonNullable<typeof working>, operation: () => Promise<void>, message: string) => {
    if (busy || lock.current) return;
    lock.current = true; setWorking(kind); setError('');
    try { await operation(); } catch { if (alive.current) setError(message); }
    finally { lock.current = false; if (alive.current) setWorking(null); }
  };
  const search = () => {
    if (busy || lock.current) return;
    const phrase = query.trim();
    if (phrase.length < 3 || phrase.length > 100) { setQueryError(true); queryInput.current?.focus(); return; }
    setQueryError(false); setRows(null); setSelected(null); setApplied(false);
    void run('search', async () => {
      const result = await props.onSearch(phrase);
      // Reject oversized/duplicate projections rather than silently showing an unbounded mailbox list.
      if (result.length > 10 || result.some(row => !validCandidate(row)) || new Set(result.map(row => row.id)).size !== result.length) throw Error();
      if (alive.current) setRows(result);
    }, copy.failed);
  };
  return <section aria-labelledby={`${id}-title`} aria-busy={busy} className="mx-auto grid w-full min-w-0 max-w-3xl gap-4 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6">
    <header>
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 min-w-0 text-xl font-semibold wrap-anywhere">{copy.title}</h2>
        <HelpTooltip label={copy.helpLabel} paragraphs={[copy.description, copy.searchHint, copy.privacy]} />
      </div>
      <p className="mb-0 mt-2 text-sm font-semibold wrap-anywhere">{props.accountEmail}</p>
    </header>
    <form aria-label={copy.search} noValidate className="grid min-w-0 gap-3" onSubmit={event => { event.preventDefault(); search(); }}>
      <TextField inputRef={queryInput} label={copy.searchLabel} required value={query} disabled={busy} error={queryError} helperText={queryError ? copy.queryError : undefined}
        onChange={event => { setQuery(event.target.value); setQueryError(false); setRows(null); setSelected(null); setApplied(false); setError(''); }} />
      <button type="submit" disabled={busy} className={`${button} justify-self-start`}>{working === 'search' ? copy.searching : copy.search}</button>
    </form>
    {error && <FormFeedback kind="error" message={error} />}
    {working && <p role="status" className="m-0 text-sm text-muted">{working === 'search' ? copy.searching : working === 'preview' ? copy.previewing : copy.using}</p>}
    {rows?.length === 0 && <p role="status" className="m-0 text-sm text-muted">{copy.empty}</p>}
    {!!rows?.length && <ul aria-label={copy.results} className="m-0 grid min-w-0 list-none gap-3 p-0">{rows.map(row => <li key={row.id} className="grid min-w-0 gap-2 rounded-xl border border-line p-3">
      <p className="m-0 text-sm font-semibold wrap-anywhere">{row.subject || copy.noSubject}</p>
      <p className="m-0 text-sm text-muted wrap-anywhere">{row.sender}</p><time className="text-sm text-muted" dateTime={row.receivedAt}>{receivedAt(row.receivedAt)}</time>
      <button type="button" className={`${button} justify-self-start`} disabled={busy} aria-label={`${copy.preview}: ${row.subject || copy.noSubject}`} onClick={() => {
        setSelected(null); setApplied(false);
        void run('preview', async () => {
          const result = await props.onPreview(row.id);
          if (!validCandidate(result) || result.id !== row.id || !result.body.trim() || result.body.length > 20000) throw Error();
          if (alive.current) setSelected(result);
        }, copy.unavailable);
      }}>{copy.preview}</button>
    </li>)}</ul>}
    {selected && <section aria-labelledby={`${id}-preview`} className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
      <h3 id={`${id}-preview`} className="m-0 text-base font-semibold">{copy.selected}</h3>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{selected.subject || copy.noSubject}</p>
      <p className="m-0 text-sm text-muted wrap-anywhere">{selected.sender}</p>
      <pre tabIndex={0} aria-label={copy.selected} className="m-0 max-h-80 min-w-0 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-6 wrap-anywhere focus-visible:focus-ring">{selected.body}</pre>
      <p className="m-0 text-sm text-muted">{copy.plainText}</p>
      <button type="button" className={`${button} justify-self-start`} disabled={busy || applied} onClick={() => { if (!applied) void run('use', async () => { await props.onUse({ ...selected }); if (alive.current) setApplied(true); }, copy.useFailed); }}>{copy.use}</button>
      {applied && <p role="status" className="m-0 text-sm text-muted">{copy.used}</p>}
    </section>}
  </section>;
}

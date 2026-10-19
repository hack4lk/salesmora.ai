'use client';
import { useId, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import type { WorkOrderStatus } from '@salesmora/contracts';
import { woInput, woPanel, woPrimary, woStamp } from '../work-order-ui';
import { copy, noteLimit } from './work-order-crew-notes.data';

export type WorkOrderCrewNote = { id: string; body: string; authorName: string; createdAt: string };
export type WorkOrderCrewNotesProps = { status: WorkOrderStatus; archived?: boolean; notes: WorkOrderCrewNote[]; canAdd: boolean; onAdd: (body: string) => void | Promise<void> };

export function WorkOrderCrewNotes({ status, archived = false, notes, canAdd, onAdd }: WorkOrderCrewNotesProps) {
  const id = useId(), [body, setBody] = useState(''), [working, setWorking] = useState(false), [error, setError] = useState(''), flight = useRef(false);
  const blocked = status === 'draft' ? copy.draft : status === 'canceled' || archived ? copy.closed : !canAdd ? copy.readOnly : '';
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked || flight.current || !body.trim()) return;
    flight.current = true; setWorking(true); setError('');
    try { await onAdd(body.trim()); setBody(''); } catch { setError(copy.error); } finally { flight.current = false; setWorking(false); }
  };
  return <section className={`${woPanel} grid gap-4`} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{copy.title}</h2>
    {blocked ? <p role="status" className="m-0 text-sm text-muted">{blocked}</p>
      : <form className="grid gap-2" onSubmit={submit}>
        <p id={`${id}-help`} className="m-0 text-sm leading-6 text-muted">{copy.help}</p>
        <label className="grid gap-2 text-sm font-semibold" htmlFor={id}>{copy.label}
          <textarea id={id} aria-describedby={`${id}-help`} className={`${woInput} min-h-24`} maxLength={noteLimit} disabled={working} placeholder={copy.placeholder} value={body} onChange={e => setBody(e.target.value)} /></label>
        <span className="text-xs text-muted">{copy.count(body.length, noteLimit)}</span>
        {error && <FormFeedback kind="error" message={error} />}
        <div className="flex justify-end"><button type="submit" className={woPrimary} disabled={working || !body.trim()}>{working ? copy.saving : copy.add}</button></div>
      </form>}
    {notes.length === 0 ? <p className="m-0 text-sm text-muted">{copy.empty}</p>
      : <ul className="m-0 grid list-none gap-3 p-0">{notes.map(n => <li key={n.id} className="grid gap-1 rounded-xl border border-line bg-canvas p-3">
        <p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{n.body}</p>
        <span className="text-xs text-muted">{copy.by(n.authorName, woStamp(n.createdAt))}</span></li>)}</ul>}
  </section>;
}

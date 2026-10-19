'use client';
import { useState } from 'react';
import { arrivalWindows, jobDateSchema } from '@salesmora/contracts';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woButton, woInput, woLabel } from '../work-order-ui';
import type { WorkOrderSchedule } from '../work-order-preview.types';
import { copy } from './work-order-schedule-dialog.data';

export type WorkOrderScheduleValue = { scheduledDate: string | null; arrivalWindow: typeof arrivalWindows[number] | null };
export type WorkOrderScheduleDialogProps = { open: boolean; schedule: WorkOrderSchedule; pending?: boolean; error?: string; conflict?: boolean; onReload?: () => void; onClose: () => void; onConfirm: (value: WorkOrderScheduleValue) => void | Promise<void> };
export function WorkOrderScheduleDialog({ open, schedule, pending, error, conflict, onReload, onClose, onConfirm }: WorkOrderScheduleDialogProps) {
  const [date, setDate] = useState(schedule.date ?? ''), [window, setWindow] = useState(schedule.window ?? ''), [clear, setClear] = useState(false);
  return <JobDialog open={open} title={schedule.date ? copy.edit : copy.title} description={copy.description} confirmLabel={clear ? copy.confirmClear : copy.save}
    confirmDisabled={!clear && !jobDateSchema.safeParse(date).success} pending={pending} error={error} conflict={conflict} onReload={onReload} onClose={onClose}
    onSubmit={() => onConfirm(clear ? { scheduledDate: null, arrivalWindow: null } : { scheduledDate: date, arrivalWindow: (window as typeof arrivalWindows[number]) || null })}>
    {clear ? <div className="grid gap-3"><p className="m-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{copy.clearDescription}</p><button type="button" className={woButton} onClick={() => setClear(false)}>{copy.back}</button></div>
      : <div className="grid gap-4"><label className={woLabel}>{copy.date}<input className={woInput} type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className={woLabel}>{copy.window}<select className={woInput} value={window} onChange={e => setWindow(e.target.value)}><option value="">{copy.noWindow}</option>{arrivalWindows.map(w => <option key={w} value={w}>{w.replace('-', ' – ')}</option>)}</select></label>
        {schedule.date && <button type="button" className={woButton} onClick={() => setClear(true)}>{copy.clear}</button>}</div>}
  </JobDialog>;
}

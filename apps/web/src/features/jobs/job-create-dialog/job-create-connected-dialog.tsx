'use client';
import { useEffect, useState, type ComponentProps } from 'react';
import { jobCreationDeadlineContextSchema, type JobCreationDeadlineContext } from '@salesmora/contracts';
import { JobDialog } from '../job-dialog/job-dialog';
import { jobButton } from '../job-ui';
import { copy } from './job-create-dialog.data';
import { jobDeadlineChoiceData as deadlineCopy } from '../job-deadline-choice/job-deadline-choice.data';
import { JobCreateDialog } from './job-create-dialog';
const empty = { rule: { mode: 'unset' as const }, revision: '', projectedDate: null, createdDate: '', timezone: '' };
/** Keeps entered Job fields mounted across deadline reload/conflict recovery. */
export function JobCreateConnectedDialog({ workspaceId, onPreviewReload, ...props }: Omit<ComponentProps<typeof JobCreateDialog>, 'deadlineContext'> & { workspaceId: string; onPreviewReload: () => void }) {
  const [preview, setPreview] = useState<JobCreationDeadlineContext>(), [state, setState] = useState<'loading' | 'error' | 'ready'>('loading'), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/jobs/creation-deadline?workspace=${encodeURIComponent(workspaceId)}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { if (!response.ok) throw Error(); return jobCreationDeadlineContextSchema.parse(await response.json()); })
      .then(result => { if (!controller.signal.aborted) { setPreview(result); setState('ready'); } })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, [workspaceId, attempt]);
  const reload = () => { if (props.pending) return; setState('loading'); setAttempt(v => v + 1); onPreviewReload(); };
  if (!preview) return <JobDialog open={props.open} title={copy.title} description={copy.description} confirmLabel={copy.review} confirmDisabled onClose={props.onClose} onSubmit={() => {}}>
    <p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'error' ? deadlineCopy.error : deadlineCopy.loading}</p>
    {state === 'error' && <button type="button" className={jobButton} onClick={reload}>{deadlineCopy.reload}</button>}
  </JobDialog>;
  return <JobCreateDialog {...props} onReload={reload} canSchedule={props.canSchedule !== false && !!preview?.canOverride}
    deadlineContext={{ context: preview?.context ?? empty, state, canOverride: !!preview?.canOverride, onReload: reload }}/>;
}

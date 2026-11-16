'use client';
import { type ComponentProps } from 'react';
import { jobCreationDeadlineContextSchema } from '@salesmora/contracts';
import { useApiQueryScope } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { apiReadOptions } from '../../api/api-read-options';
import { JobDialog } from '../job-dialog/job-dialog';
import { jobButton } from '../job-ui';
import { copy } from './job-create-dialog.data';
import { jobDeadlineChoiceData as deadlineCopy } from '../job-deadline-choice/job-deadline-choice.data';
import { JobCreateDialog } from './job-create-dialog';
/** Keeps entered Job fields mounted across deadline reload/conflict recovery. */
export function JobCreateConnectedDialog({ workspaceId, onPreviewReload, ...props }: Omit<ComponentProps<typeof JobCreateDialog>, 'deadlineContext'> & { workspaceId: string; onPreviewReload: () => void }) {
  const scope = useApiQueryScope();
  if (scope.workspaceId !== workspaceId) throw new Error('Job creation must use the current authorized workspace.');
  const query = useApiQuery({
    ...apiReadOptions(scope, 'job-creation-deadline', {}, `/api/jobs/creation-deadline?workspace=${encodeURIComponent(workspaceId)}`,
      raw => jobCreationDeadlineContextSchema.parse(raw), deadlineCopy.error),
    enabled: props.open,
  });
  const preview = query.data, state = query.isError ? 'error' : query.isFetching || query.isPending ? 'loading' : 'ready';
  const reload = () => { if (props.pending) return; onPreviewReload(); void query.refetch(); };
  if (!preview) return <JobDialog open={props.open} title={copy.title} description={copy.description} confirmLabel={copy.review} confirmDisabled onClose={props.onClose} onSubmit={() => {}}>
    <p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'error' ? deadlineCopy.error : deadlineCopy.loading}</p>
    {state === 'error' && <button type="button" className={jobButton} onClick={reload}>{deadlineCopy.reload}</button>}
  </JobDialog>;
  return <JobCreateDialog {...props} onReload={reload} canSchedule={props.canSchedule !== false && preview.canOverride}
    deadlineContext={{ context: preview.context, state, canOverride: preview.canOverride, onReload: reload }}/>;
}

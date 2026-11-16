'use client';

import { useId } from 'react';
import type { JobView } from '@salesmora/contracts';
import { ArrowForwardOutlined, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { jobDate } from '../../jobs/job-ui';
import { homeActiveJobsWidgetData as copy } from './home-active-jobs-widget.data';

export type HomeActiveJob = Pick<JobView, 'id' | 'number' | 'title' | 'customerName' | 'ownerName' | 'completionDeadline' | 'scheduledDate'> & {
  status: Exclude<JobView['status'], 'completed' | 'canceled'>;
  /** Derived with the workspace-local today by the authorized data projection. */
  overdue: boolean;
  href: string;
};
export type HomeActiveJobsState =
  | { status: 'ready'; jobs: readonly HomeActiveJob[]; total: number }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomeActiveJobsWidgetProps {
  state: HomeActiveJobsState;
  /** Currently authorized workspace-scoped list destination. */
  jobsHref: string;
}

/** The caller supplies distinct authorized active jobs in approved priority order. */
export function HomeActiveJobsWidget({ state, jobsHref }: HomeActiveJobsWidgetProps) {
  const id = useId();
  const jobs = state.status === 'ready' ? state.jobs.slice(0, 5) : [];
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={state.status === 'loading' || (state.status === 'error' && state.retrying)} className="min-w-0 rounded-2xl border border-line bg-paper">
      <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-6">
        <div className="flex min-w-0 items-center gap-1">
          <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold leading-normal text-ink">{copy.title}</h2>
          <HelpTooltip label={copy.about} paragraphs={[copy.description]} />
        </div>
        <a href={jobsHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.view}<ArrowForwardOutlined aria-hidden="true" className="size-4" /></a>
      </header>
      {state.status === 'loading' && <p role="status" className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.loading}</p>}
      {state.status === 'error' && <div className="grid gap-4 px-6 pb-6">
        <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />
        <button type="button" disabled={state.retrying} onClick={state.onRetry} className="min-h-11 w-fit rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">{copy.retry}</button>
      </div>}
      {state.status === 'ready' && (jobs.length === 0 ? <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p> : <>
        <ul className="m-0 list-none px-6 pb-2">
          {jobs.map(job => <li key={job.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-3">
            <div className="min-w-0 basis-44 grow">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="m-0 text-sm font-semibold leading-5 text-ink wrap-anywhere">{job.title}</h3>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="mb-0 mt-1 text-sm leading-5 text-muted wrap-anywhere">{job.customerName} · {job.ownerName.trim() || copy.unassigned} · {job.number}</p>
              <p className="mb-0 mt-1 text-xs leading-5 wrap-anywhere">
                <span className={job.overdue ? 'font-semibold text-error' : 'text-muted'}>{job.completionDeadline ? (job.overdue ? copy.overdue(jobDate(job.completionDeadline)) : copy.due(jobDate(job.completionDeadline))) : copy.noDeadline}</span>
                <span className="text-muted"> · {job.scheduledDate ? copy.scheduled(jobDate(job.scheduledDate)) : copy.noSchedule}</span>
              </p>
            </div>
            <a href={job.href} aria-label={copy.openLabel(job.title)} className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">{copy.open}</a>
          </li>)}
        </ul>
        {state.total > jobs.length && <p className="m-0 px-6 pb-6 text-xs leading-5 text-muted">{copy.remainder(jobs.length, state.total)}</p>}
      </>)}
    </section>
  );
}

'use client';

import { SideDrawer, StatusBadge } from '@salesmora/ui';
import { jobButton, jobDate, jobPrimary } from '../../jobs/job-ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { GanttJob, GanttTeamMember } from '../gantt-chart.types';
import { getJobTeamNames } from '../gantt-people';
import { ganttJobDrawerData as copy } from './gantt-job-drawer.data';

export type GanttJobDrawerProps = {
  open: boolean;
  job: GanttJob | null;
  teamMembers: readonly GanttTeamMember[];
  onClose: () => void;
  /** Switches the chart to that work order's drawer. */
  onSelectWorkOrder: (workOrderId: string) => void;
  /** Opens the full job record. */
  onOpenJob: (jobId: string) => void;
};

const term = 'text-xs font-semibold text-muted';

/** Read-only job summary opened from a job bar, with its work orders and a link to the full record. */
export function GanttJobDrawer({ open, job, teamMembers, onClose, onSelectWorkOrder, onOpenJob }: GanttJobDrawerProps) {
  if (!job) return null;
  const team = getJobTeamNames(job, teamMembers, copy.formerTeammate);

  return (
    <SideDrawer
      open={open}
      title={job.title}
      description={copy.description(job.number)}
      onClose={onClose}
      footer={
        <button type="button" className={`${jobPrimary} w-full`} onClick={() => onOpenJob(job.id)}>
          {copy.openJob(job.number)}
        </button>
      }
    >
      <div className="grid min-w-0 gap-6">
        <div className="flex flex-wrap gap-2">
          <JobStatusBadge status={job.status} />
          {job.overdue && <StatusBadge label={copy.overdue} tone="error" />}
        </div>

        <dl className="m-0 grid gap-4">
          <div><dt className={term}>{copy.customer}</dt><dd className="m-0 mt-1 font-semibold">{job.customerName}</dd></div>
          <div className="grid gap-2 rounded-xl border border-line bg-canvas p-4">
            <dt className={term}>{copy.schedule}</dt>
            <dd className="m-0 grid gap-1 text-sm">
              <span>{copy.start}: <span className="font-semibold">{job.scheduledDate ? jobDate(job.scheduledDate) : copy.notSet}</span></span>
              <span className={job.overdue ? 'text-error' : ''}>{copy.deadline}: <span className="font-semibold">{job.completionDeadline ? jobDate(job.completionDeadline) : copy.notSet}</span></span>
            </dd>
          </div>
          <div><dt className={term}>{copy.owner}</dt><dd className="m-0 mt-1 text-sm">{job.primaryOwnerName ?? copy.unassigned}</dd></div>
          <div><dt className={term}>{copy.team}</dt><dd className="m-0 mt-1 text-sm leading-6">{team.length ? team.join(', ') : copy.noTeam}</dd></div>
        </dl>

        <section aria-label={copy.workOrders} className="grid gap-3">
          <h3 className="m-0 text-base font-semibold">{copy.workOrdersCount(job.workOrders.length)}</h3>
          {job.workOrders.length === 0
            ? <p className="m-0 text-sm text-muted">{copy.noWorkOrders}</p>
            : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {job.workOrders.map((order) => (
                  <li key={order.id}>
                    <button type="button" className={`${jobButton} grid w-full gap-2 text-left`} aria-label={copy.viewWorkOrder(order.number, order.title)} onClick={() => onSelectWorkOrder(order.id)}>
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{order.number}</span>
                        <WorkOrderStatusBadge status={order.status} />
                      </span>
                      <span className="text-sm font-normal text-ink">{order.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </SideDrawer>
  );
}

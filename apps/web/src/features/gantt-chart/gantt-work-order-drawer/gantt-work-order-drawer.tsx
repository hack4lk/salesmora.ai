'use client';

import { SideDrawer } from '@salesmora/ui';
import { jobButton, jobDate, jobPrimary } from '../../jobs/job-ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { GanttJob, GanttWorkOrder } from '../gantt-chart.types';
import { ganttWorkOrderDrawerData as copy } from './gantt-work-order-drawer.data';

export type GanttWorkOrderDrawerProps = {
  open: boolean;
  workOrder: GanttWorkOrder | null;
  /** The job this work order belongs to; supplies the customer and the parent link. */
  job: GanttJob | null;
  onClose: () => void;
  /** Switches the chart to the parent job's drawer. */
  onSelectJob: (jobId: string) => void;
  /** Opens the full work order record. */
  onOpenWorkOrder: (workOrderId: string) => void;
};

const term = 'text-xs font-semibold text-muted';

/** Read-only work order summary opened from a work order bar, with its parent job and a link to the full record. */
export function GanttWorkOrderDrawer({ open, workOrder, job, onClose, onSelectJob, onOpenWorkOrder }: GanttWorkOrderDrawerProps) {
  if (!workOrder || !job) return null;

  return (
    <SideDrawer
      open={open}
      title={workOrder.title}
      description={copy.description(workOrder.number)}
      onClose={onClose}
      footer={
        <button type="button" className={`${jobPrimary} w-full`} onClick={() => onOpenWorkOrder(workOrder.id)}>
          {copy.openWorkOrder(workOrder.number)}
        </button>
      }
    >
      <div className="grid min-w-0 gap-6">
        <div><WorkOrderStatusBadge status={workOrder.status} /></div>

        <dl className="m-0 grid gap-4">
          <div><dt className={term}>{copy.customer}</dt><dd className="m-0 mt-1 font-semibold">{job.customerName}</dd></div>
          <div className="grid gap-2 rounded-xl border border-line bg-canvas p-4">
            <dt className={term}>{copy.schedule}</dt>
            <dd className="m-0 grid gap-1 text-sm">
              <span>{copy.scheduled}: <span className="font-semibold">{workOrder.scheduledDate ? jobDate(workOrder.scheduledDate) : copy.notSet}</span></span>
              {workOrder.completionDate && <span>{copy.completed}: <span className="font-semibold">{jobDate(workOrder.completionDate)}</span></span>}
            </dd>
          </div>
          <div><dt className={term}>{copy.assignee}</dt><dd className="m-0 mt-1 text-sm">{workOrder.assigneeName ?? copy.unassigned}</dd></div>
        </dl>

        <section aria-label={copy.parentJob} className="grid gap-3">
          <h3 className="m-0 text-base font-semibold">{copy.parentJob}</h3>
          <button type="button" className={`${jobButton} grid w-full gap-2 text-left`} aria-label={copy.viewJob(job.number, job.title)} onClick={() => onSelectJob(job.id)}>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{job.number}</span>
              <JobStatusBadge status={job.status} />
            </span>
            <span className="text-sm font-normal text-ink">{job.title}</span>
          </button>
        </section>
      </div>
    </SideDrawer>
  );
}

"use client";

import { useId, useState } from "react";
import type {
  JobStatus,
  WorkOrderStatus,
  arrivalWindows,
} from "@salesmora/contracts";
import { StatusBadge } from "@salesmora/ui";
import { JobStatusBadge } from "../../jobs/job-status-badge/job-status-badge";
import { WorkOrderStatusBadge } from "../../work-orders/work-order-status-badge/work-order-status-badge";
import { calendarEventCardData as copy } from "./calendar-event-card.data";

type CalendarRecordPreview = { id: string; number: string; title: string } & (
  | { type: "job"; status: JobStatus }
  | { type: "work_order"; status: WorkOrderStatus }
);
/** Presentation contract only. The future server DTO must include only authorized records and people. */
export type CalendarVisitPreview = {
  id: string;
  title: string;
  customerName: string;
  arrivalWindow: (typeof arrivalWindows)[number] | null;
  records: readonly CalendarRecordPreview[];
  crew: readonly { id: string; name: string }[];
  completionDeadline: { date: string; overdue: boolean } | null;
  waiting: boolean;
  canReschedule: boolean;
};
export type CalendarEventCardProps = {
  visit: CalendarVisitPreview;
  initiallyExpanded?: boolean;
  /** Opens a peek; this component neither reschedules nor changes any record. */
  onOpen: (visitId: string) => void;
};

export function CalendarEventCard({
  visit,
  onOpen,
  initiallyExpanded = false,
}: CalendarEventCardProps) {
  const id = useId(),
    [expanded, setExpanded] = useState(initiallyExpanded);
  const kinds = new Set(visit.records.map((record) => record.type));
  const kind =
    visit.records.length > 1
      ? "shared"
      : kinds.has("work_order")
        ? "work_order"
        : "job";
  // One person may belong to both the Job team and a Work Order crew.
  const crew = [
    ...new Map(visit.crew.map((person) => [person.id, person])).values(),
  ];
  return (
    <article
      className={`min-w-0 rounded-xl border border-line border-l-4 bg-paper text-ink shadow-sm ${visit.waiting ? "border-l-slate-400" : kind === "work_order" ? "border-l-yellow-700" : "border-l-primary"}`}
    >
      <button
        type="button"
        aria-label={copy.toggleVisit(visit.title)}
        aria-expanded={expanded}
        aria-controls={`${id}-details`}
        onClick={() => setExpanded((value) => !value)}
        className="group relative grid min-h-11 w-full min-w-0 cursor-pointer gap-2 rounded-xl bg-paper p-3 text-left hover:bg-canvas focus-visible:focus-ring"
      >
        <span className="text-sm font-semibold wrap-anywhere group-hover:text-primary-dark">
          {visit.title}
        </span>
        <span className="text-xs leading-5 text-muted wrap-anywhere">
          <span className="sr-only">{copy.crew}: </span>
          {crew.length
            ? crew.map((person) => person.name).join(", ")
            : copy.unassigned}
        </span>
      </button>
      <div id={`${id}-details`} hidden={!expanded}>
        {expanded && (
          <div className="grid min-w-0 gap-3 border-t border-line p-3">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-xs font-semibold ${kind === "work_order" ? "text-teal-800" : "text-primary-dark"}`}
              >
                {copy.types[kind]}
              </span>
              <span className="text-xs text-muted">{copy.oneVisit}</span>
            </span>
            <span className="text-sm text-muted wrap-anywhere">
              {visit.customerName}
            </span>
            <span className="text-sm font-semibold text-ink">
              {visit.arrivalWindow
                ? copy.window(visit.arrivalWindow)
                : copy.noWindow}
            </span>
            <span className="grid min-w-0 gap-2 border-t border-line pt-3">
              {visit.records.map((record) => (
                <span
                  key={`${record.type}:${record.id}`}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-muted wrap-anywhere">
                    {record.type === "job" ? copy.job : copy.workOrder} ·{" "}
                    {record.number}
                  </span>
                  {record.type === "job" ? (
                    <JobStatusBadge status={record.status} />
                  ) : (
                    <WorkOrderStatusBadge status={record.status} />
                  )}
                </span>
              ))}
            </span>
            {visit.waiting && (
              <StatusBadge label={copy.waiting} tone="warning" dot />
            )}
            {visit.completionDeadline && (
              <span
                className={`grid gap-1 border-t border-line pt-3 text-xs ${visit.completionDeadline.overdue ? "font-semibold text-error" : "text-muted"}`}
              >
                <span>{copy.deadline}</span>
                <span>
                  <time dateTime={visit.completionDeadline.date}>
                    {copy.date(visit.completionDeadline.date)}
                  </time>
                  {visit.completionDeadline.overdue && ` · ${copy.overdue}`}
                </span>
              </span>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
              <button
                type="button"
                aria-label={copy.openVisit(visit.title)}
                onClick={() => onOpen(visit.id)}
                className="min-h-11 cursor-pointer rounded-lg px-2 py-2 text-left font-semibold text-primary-dark hover:bg-canvas focus-visible:focus-ring"
              >
                {copy.open}
              </button>
              {!visit.canReschedule && (
                <span className="text-muted">{copy.readOnly}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

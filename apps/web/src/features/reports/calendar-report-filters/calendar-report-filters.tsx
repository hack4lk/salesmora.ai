"use client";

import { ReportFacetFilters } from "../report-facet-filters/report-facet-filters";
import type { ReportScopeOption } from "../report-scope-controls/report-scope-controls";

export type CalendarReportFiltersValue = {
  participants: readonly string[];
  recordTypes: readonly string[];
};
export type CalendarReportFilterContext = "dated" | "unscheduled";
export type CalendarReportFilterScope =
  | { kind: "workspace" }
  | { kind: "own"; viewerId: string };
export type CalendarReportFiltersOptions = Partial<
  Record<keyof CalendarReportFiltersValue, readonly ReportScopeOption[]>
>;
export type CalendarReportFiltersProps = {
  value: CalendarReportFiltersValue;
  /** Current authorized applicable choices only; omitted facets require empty selections. */
  options: CalendarReportFiltersOptions;
  context: CalendarReportFilterContext;
  scope: CalendarReportFilterScope;
  canRead: boolean;
  state?: "ready" | "loading" | "error";
  pending?: boolean;
  onChange: (value: CalendarReportFiltersValue) => void;
  onRetry: () => void;
};
const facets = ["participants", "recordTypes"] as const;
const labels = {
  participants: "Current participant",
  recordTypes: "Record type",
};
const alphabetic = new Intl.Collator("en", { sensitivity: "base" });
export const calendarReportFilterHelp = {
  attribution:
    "Match record type against currently authorized active records first, then match participants from those records. Keep each matching canonical visit once and withhold unrelated record and crew context. Selected people limit person, busy person-day and overlap projections; visit totals remain distinct. Own scope exposes Me only. Empty selections mean all authorized values, never wider access; Work Order access never grants parent-Job access. No unassigned member option or conflicting status facet is offered.",
  drafts:
    "Scheduled visits and schedule review share one dated filter draft and exact visit-date range over the current schedule, not historical attribution. Unscheduled queues use an independent current draft without any visit-date predicate. Hosts filter the full authorized source before aggregation and pagination, then replace counts and evidence together. Saved unavailable selections require explicit correction.",
};

function validCalendarReportFilterOptions(
  options: CalendarReportFiltersOptions,
  scope: CalendarReportFilterScope,
): boolean {
  return (
    ["workspace", "own"].includes(scope.kind) &&
    (scope.kind !== "own" ||
      (scope.viewerId.trim() !== "" && scope.viewerId !== "unassigned")) &&
    facets.every((facet) => {
      const choices = options[facet] ?? [];
      return (
        new Set(choices.map((option) => option.value)).size ===
          choices.length &&
        choices.every(
          (option) =>
            option.value.trim() &&
            option.label.trim() &&
            (facet === "recordTypes"
              ? ["job", "work_order"].includes(option.value)
              : option.value !== "unassigned" &&
                (scope.kind !== "own" || option.value === scope.viewerId)),
        )
      );
    })
  );
}
export function validCalendarReportFilters(
  value: CalendarReportFiltersValue,
  options: CalendarReportFiltersOptions,
  scope: CalendarReportFilterScope,
): boolean {
  return (
    validCalendarReportFilterOptions(options, scope) &&
    facets.every(
      (facet) =>
        new Set(value[facet]).size === value[facet].length &&
        value[facet].every((selected) =>
          options[facet]?.some((option) => option.value === selected),
        ),
    )
  );
}

/** Configuration only; hosts must filter authorized record membership before counting canonical visits. */
export function CalendarReportFilters({
  value,
  options,
  context,
  scope,
  canRead,
  state = "ready",
  pending = false,
  onChange,
  onRetry,
}: CalendarReportFiltersProps) {
  const participants = options.participants
    ?.map((option) =>
      scope.kind === "own" ? { ...option, label: "Me" } : option,
    )
    .sort(
      (a, b) =>
        alphabetic.compare(a.label, b.label) ||
        alphabetic.compare(a.value, b.value),
    );
  const choices = { ...options, participants };
  return (
    <ReportFacetFilters
      reportLabel="Calendar"
      context={context === "dated" ? "period" : "current"}
      contextLabel={
        context === "dated"
          ? "Current schedule / dated views share these filters"
          : "Unscheduled current queue / independent filters, no visit-date filter"
      }
      contextHelp={calendarReportFilterHelp.drafts}
      attributionHelp={calendarReportFilterHelp.attribution}
      canRead={canRead}
      state={state}
      pending={pending}
      facets={facets.map((facet) => ({
        id: facet,
        label: labels[facet],
        selected: value[facet],
        options: choices[facet],
      }))}
      validOptions={validCalendarReportFilterOptions(options, scope)}
      validSelection={validCalendarReportFilters(value, options, scope)}
      onSelect={(id, selected) => {
        const facet = facets.find((facet) => facet === id);
        if (facet) onChange({ ...value, [facet]: selected });
      }}
      onClear={() => onChange({ participants: [], recordTypes: [] })}
      onRetry={onRetry}
    />
  );
}

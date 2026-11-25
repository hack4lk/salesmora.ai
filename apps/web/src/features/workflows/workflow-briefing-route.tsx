"use client";
import { workflowBriefingSchema, type WorkflowBriefing } from "@salesmora/contracts";
import { ApiQueryScopeBoundary, useApiQueryScope } from "../api/api-query-provider";
import { apiReadOptions } from "../api/api-read-options";
import { useApiQuery } from "../api/use-api-query";
import { WorkflowBriefingCard } from "./workflow-briefing-card";
import { reportHref } from "../reports/report-navigation";

type Props = { viewerId: string; workspaceId: string; initial: WorkflowBriefing; initialUpdatedAt: number };
export function WorkflowBriefingRoute(props: Props) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <BriefingContent key={`${props.viewerId}:${props.workspaceId}:${props.initial.id}`} {...props} />
  </ApiQueryScopeBoundary>;
}
function BriefingContent({ workspaceId, initial, initialUpdatedAt }: Props) {
  const scope = useApiQueryScope();
  const query = useApiQuery({ ...apiReadOptions(scope, "workflow-briefings", { id: initial.id },
    `/api/workflows/briefings/${initial.id}?workspace=${workspaceId}`, raw => workflowBriefingSchema.parse(raw), "Couldn't load this briefing."),
    initialData: initial, initialDataUpdatedAt: initialUpdatedAt });
  const data = query.isError ? undefined : query.data;
  return <div className="grid gap-6">
    <a className="w-fit text-sm font-semibold text-primary underline focus-visible:focus-ring" href={`/workflows?workspace=${workspaceId}`}>Back to workflows</a>
    <WorkflowBriefingCard counts={data?.counts ?? initial.counts} generatedAt={data?.generatedAt ?? initial.generatedAt}
      timezone={data?.timezone ?? initial.timezone} canRead={!!data}
      links={data ? briefingReportLinks(workspaceId) : undefined} />
    {query.isError && <button type="button" onClick={() => { void query.refetch(); }} className="min-h-11 w-fit cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold focus-visible:focus-ring">Try again</button>}
  </div>;
}
export function briefingReportLinks(workspaceId: string) {
  return {
    inactiveLeads: reportHref({ area: "team", query: { workspaceId, view: "team-leads", selected: { kind: "queue", queue: "inactive" }, filters: { members: [] }, page: 1, pageSize: 25 } }),
    awaitingEstimates: reportHref({ area: "estimates", query: { workspaceId, view: "estimate-current", selected: "awaiting", filters: { owners: [], parents: [] }, page: 1, pageSize: 25 } }),
    unscheduledJobs: reportHref({ area: "calendar", query: { workspaceId, view: "calendar-unscheduled", selected: "jobs", filters: { participants: [], recordTypes: [] }, page: 1, pageSize: 25 } }),
    dueSoonJobs: reportHref({ area: "jobs", query: { workspaceId, view: "workload", selection: { kind: "metric", metric: "dueSoon" }, filters: { owners: [], services: [], statuses: [] }, page: 1, pageSize: 25 } }),
  };
}

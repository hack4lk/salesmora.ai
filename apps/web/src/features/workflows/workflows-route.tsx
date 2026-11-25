"use client";

import { useEffect, useState } from "react";
import { useWorkspaceAssistant } from "../assistant/workspace-assistant/workspace-assistant";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { workflowListSchema, workflowReceiptSchema, workflowRunPreviewSchema, workflowRunResultSchema, workflowNotificationsReceiptSchema, workflowEditDataSchema, workflowEditResultSchema, type WorkflowList } from "@salesmora/contracts";
import { ApiQueryScopeBoundary, useApiQueryScope } from "../api/api-query-provider";
import { apiReadOptions, invalidateWorkspaceResources } from "../api/api-read-options";
import { isApiAccessError } from "../api/api-query";
import { useApiQuery } from "../api/use-api-query";
import { useApiMutation } from "../api/use-api-mutation";
import { ApiRequestError } from "../api/api-request";
import { WorkflowsPage } from "./workflows-page";

type Props = { viewerId: string; workspaceId: string; initial: WorkflowList; initialUpdatedAt: number; assistantEnabled?: boolean };

export function WorkflowsRoute(props: Props) {
  return (
    <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
      <WorkflowsContent key={`${props.viewerId}:${props.workspaceId}`} {...props} />
    </ApiQueryScopeBoundary>
  );
}

function WorkflowsContent({ workspaceId, initial, initialUpdatedAt, assistantEnabled = false }: Props) {
  const assistant = useWorkspaceAssistant();
  const scope = useApiQueryScope();
  const client = useQueryClient();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const path = "/api/workflows?" + new URLSearchParams({ workspace: workspaceId });
  const options = apiReadOptions(scope, "workflows", { list: true }, path, raw => workflowListSchema.parse(raw), "Couldn't load workflows.");
  const query = useApiQuery({ ...options, initialData: initial, initialDataUpdatedAt: initialUpdatedAt });
  const mutation = useApiMutation("workflows", raw => workflowReceiptSchema.parse(raw), "Couldn't update this workflow.");
  const previewRun = useApiMutation("workflows", raw => workflowRunPreviewSchema.parse(raw), "Couldn't check matching records.");
  const runNow = useApiMutation("workflows", raw => workflowRunResultSchema.parse(raw), "Couldn't run this workflow.");
  const saveNotifications = useApiMutation("workflows", raw => workflowNotificationsReceiptSchema.parse(raw), "Couldn't save notification options.");
  const saveEdit = useApiMutation("workflows", raw => workflowEditResultSchema.parse(raw), "Couldn't save workflow changes.");
  const denied = isApiAccessError(query.error) || isApiAccessError(mutation.error) || isApiAccessError(previewRun.error) || isApiAccessError(runNow.error) || isApiAccessError(saveNotifications.error) || isApiAccessError(saveEdit.error);
  useEffect(() => { if (denied) router.refresh(); }, [denied, router]);
  const data = denied || query.isError ? undefined : query.data;

  return (
    <div className="grid gap-4">
      <WorkflowsPage onViewCustomers={row=>router.push(`/workflows/services/${row.id}?workspace=${workspaceId}`)}
        edit={{
          onLoadEdit: async row => {
            try {
              return await client.fetchQuery({ ...apiReadOptions(scope, "workflows", { edit: row.id, version: row.version },
                `/api/workflows/edit?workspace=${workspaceId}&id=${row.id}&version=${row.version}`, raw => workflowEditDataSchema.parse(raw), "Couldn't load this workflow."), staleTime: 0 });
            } catch (error) {
              if (error instanceof ApiRequestError && error.status === 409) await query.refetch();
              throw error;
            }
          },
          onSaveEdit: async (row, values, requestId) => {
            try {
              const saved = await saveEdit.mutateAsync({ path: `/api/workflows/edit?workspace=${workspaceId}`, method: "POST",
                body: { workspaceId, id: row.id, version: row.version, requestId, values } });
              client.setQueryData<WorkflowList>(options.queryKey, list => list ? { ...list, rows: list.rows.map(item => item.id === saved.row.id ? saved.row : item) } : list);
              await invalidateWorkspaceResources(client, workspaceId, ["workflows", "notifications"], { refetchType: "none" });
              setNotice("Workflow updated.");
            } catch (error) {
              if (error instanceof ApiRequestError && error.status === 409) await query.refetch();
              throw error;
            }
          },
          onAskAssistant: assistantEnabled ? prompt => assistant?.prepare(prompt, null) : undefined,
        }}
        notice={notice}
        rows={data?.rows ?? []}
        state={query.isError || denied ? "error" : query.isPending ? "loading" : "ready"}
        onRetry={() => { void query.refetch(); }}
        capacity={data?.capacity}
        billingHref={`/settings/billing?workspace=${encodeURIComponent(workspaceId)}`}
        unavailableReason={assistantEnabled ? undefined : "Workflow creation requires an available assistant and permission to publish workflows."}
        onOpenAssistant={() => assistant?.prepare("", document.activeElement as HTMLElement | null)}
        onSaveNotifications={async (row, notifications) => {
          try {
            const result = await saveNotifications.mutateAsync({ path: `/api/workflows/notifications?workspace=${workspaceId}`, method: "POST",
              body: { workspaceId, id: row.id, version: row.version, notifications } });
            client.setQueryData<WorkflowList>(options.queryKey, list => list ? { ...list,
              rows: list.rows.map(item => item.id === row.id ? { ...item, version: result.version, notifications: result.notifications } : item) } : list);
            await invalidateWorkspaceResources(client, workspaceId, ["workflows"], { refetchType: "none" });
            setNotice("Notification options saved.");
          } catch (error) {
            if (error instanceof ApiRequestError && error.status === 409) await query.refetch();
            throw error;
          }
        }}
        manualRun={{
          onPreviewRun: async row => {
            try {
              return await previewRun.mutateAsync({ path: `/api/workflows/run/preview?workspace=${workspaceId}`, method: "POST",
                body: { workspaceId, id: row.id, version: row.version } });
            } catch (error) {
              if (error instanceof ApiRequestError && error.status === 409) await query.refetch();
              throw error;
            }
          },
          onRunNow: async (row, preview) => {
            try {
              const result = await runNow.mutateAsync({ path: `/api/workflows/run?workspace=${workspaceId}`, method: "POST",
                body: { workspaceId, id: row.id, version: row.version, previewId: preview.id } });
              client.setQueryData<WorkflowList>(options.queryKey, list => list ? { ...list,
                rows: list.rows.map(item => item.id === row.id ? { ...item, pendingCount: result.pendingCount } : item) } : list);
              await invalidateWorkspaceResources(client, workspaceId, ["workflows", "notifications"], { refetchType: "none" });
              return result;
            } catch (error) {
              if (error instanceof ApiRequestError && error.status === 409) await query.refetch();
              throw error;
            }
          },
        }}
        onConfirm={async (row, action) => {
          const current = data?.rows.find(item => item.id === row.id);
          if (!current || !data || denied) throw new Error("This workflow is unavailable.");
          try {
            const receipt = await mutation.mutateAsync({
              path, method: "POST",
              body: { workspaceId, id: current.id, version: current.version, action, ...(action === "delete" ? { confirmation: "confirm" } : {}) },
            });
            setNotice(action === "delete" ? "Workflow deleted." : action === "pause" ? "Workflow paused." : "Workflow resumed.");
            // Apply the receipt immediately, then mark other workflow views stale without an extra read.
            client.setQueryData<WorkflowList>(options.queryKey, (list): WorkflowList | undefined => list ? {
              ...list,
              total: receipt.status === "deleted" ? Math.max(0, list.total - 1) : list.total,
              capacity: receipt.status === "deleted" ? { ...list.capacity, used: Math.max(0, list.capacity.used - 1) } : list.capacity,
              rows: receipt.status === "deleted" ? list.rows.filter(item => item.id !== receipt.id) : list.rows.map(item =>
                item.id === receipt.id ? { ...item, status: receipt.status as "active" | "paused", version: receipt.version, pendingCount: receipt.pendingCount,
                  allowedActions: [receipt.status === "active" ? "pause" : "resume", "delete"] } : item),
            } : list);
            await invalidateWorkspaceResources(client, workspaceId, ["workflows"], { refetchType: "none" });
          } catch (error) {
            await query.refetch();
            throw error;
          }
        }}
      />
    </div>
  );
}

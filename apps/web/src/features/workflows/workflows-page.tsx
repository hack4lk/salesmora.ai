"use client";

import { useId, useState, type ComponentProps } from "react";
import type { WorkflowNotificationChannels } from "@salesmora/contracts";
import { WorkflowEditDialog, type WorkflowEditHandlers } from "./workflow-edit-dialog";
import { WorkflowDetailsDialog } from "./workflow-details-dialog";
import { WorkflowsList, type WorkflowRow } from "./workflows-list";

export type WorkflowSummary = WorkflowRow & { rule: string; notifications?: WorkflowNotificationChannels };

type WorkflowsPageProps = Omit<ComponentProps<typeof WorkflowsList>, "rows" | "onView" | "onEdit"> & {
  rows: readonly WorkflowSummary[];
  edit?: WorkflowEditHandlers;
  onSaveNotifications?: (row: WorkflowSummary, notifications: WorkflowNotificationChannels) => Promise<void>;
};

export function WorkflowsPage({ rows, edit, onSaveNotifications, ...listProps }: WorkflowsPageProps) {
  const title = useId();
  const [editing, setEditing] = useState<WorkflowSummary>();
  const [selectedId, setSelectedId] = useState<string>();
  const selected = rows.find((row) => row.id === selectedId);

  return (
    <section aria-labelledby={title} className="grid min-w-0 gap-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1">
        <h1 id={title} className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">Workflows</h1>
        {listProps.capacity && <p role="status" aria-label={`${listProps.capacity.used} of ${listProps.capacity.limit} workflows created`} className="m-0 col-start-2 whitespace-nowrap rounded-xl border border-line bg-paper px-3 py-2 text-sm text-muted sm:px-4">
          <span className="font-semibold tabular-nums text-ink">{listProps.capacity.used} / {listProps.capacity.limit}</span> workflows
        </p>}
        <p className="col-span-2 m-0 text-sm text-muted">Manage the work SalesMora handles for your team.</p>
      </header>

      <WorkflowsList {...listProps} rows={rows} onView={(row) => setSelectedId(row.id)} onEdit={edit ? row => setEditing(rows.find(item => item.id === row.id)) : undefined} />
      {editing && edit && rows.some(row => row.id === editing.id && row.canEdit) && <WorkflowEditDialog key={`${editing.id}:${editing.version}`} row={editing} {...edit} onClose={() => setEditing(undefined)} />}

      {selected && (
        <WorkflowDetailsDialog key={`${selected.id}:${selected.version}`} row={selected} onSaveNotifications={onSaveNotifications} onClose={() => setSelectedId(undefined)} />
      )}
    </section>
  );
}

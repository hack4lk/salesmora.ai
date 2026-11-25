"use client";

import Link from "next/link";
import type { WorkflowList, WorkflowDefinition } from "@salesmora/contracts";
import { useId, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ConfirmDialog, DataTable, FormFeedback, StatusBadge } from "@salesmora/ui";
import { WorkflowRunDialog, type WorkflowRunHandlers } from "./workflow-run-dialog";

export type WorkflowAction = "pause" | "resume" | "delete";
export type WorkflowRow = {
  id: string;
  version?: number;
  name: string;
  rule?: string;
  issue?: string;
  kind?: WorkflowDefinition["kind"];
  status: "active" | "paused";
  pendingCount: number;
  allowedActions: readonly WorkflowAction[];
  canRunNow?: boolean;
  canEdit?: boolean;
};

type WorkflowsListProps = {
  notice?: string;
  manualRun?: WorkflowRunHandlers;
  rows: readonly WorkflowRow[];
  capacity?: WorkflowList["capacity"];
  billingHref?: string;
  state?: "ready" | "loading" | "error";
  onRetry?: () => void;
  onView: (row: WorkflowRow) => void;
  onViewCustomers?:(row:WorkflowRow)=>void;
  onEdit?: (row: WorkflowRow) => void;
  onConfirm: (row: WorkflowRow, action: WorkflowAction) => Promise<void>;
  onOpenAssistant: () => void;
  unavailableReason?: string;
};

const labels = { pause: "Pause", resume: "Resume", delete: "Delete" };

function WorkflowMenu({ row, onView, onAction, onRunNow, onEdit, onViewCustomers }: {
  row: WorkflowRow;
  onView: () => void;
  onAction: (action: WorkflowAction) => void;
  onRunNow?: () => void;
  onEdit?: () => void;
  onViewCustomers?:()=>void;
}) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const toggle = row.status === "active" ? "pause" : "resume";
  const actions = ([toggle, "delete"] as const).filter((action) => row.allowedActions.includes(action));

  function select(callback: () => void) {
    setAnchor(null);
    callback();
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Actions for ${row.name}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? id : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-paper text-muted hover:bg-canvas focus-visible:focus-ring"
      >
        <span aria-hidden="true" className="text-2xl leading-none">⋯</span>
      </button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ list: { id, "aria-label": `Actions for ${row.name}` } }}>
        <MenuItem onClick={() => select(onView)}>View workflow</MenuItem>{['service_due','annual_service_review'].includes(row.kind??'')&&onViewCustomers&&<MenuItem onClick={()=>select(onViewCustomers)}>{row.kind==='annual_service_review'?'Review customers':'View due customers'}</MenuItem>}
        {onEdit && row.canEdit && <MenuItem onClick={() => select(onEdit)}>Edit</MenuItem>}
        {onRunNow && row.canRunNow && row.status === "active" && <MenuItem onClick={() => select(onRunNow)}>Run now</MenuItem>}
        {actions.map((action) => (
          <MenuItem key={action} onClick={() => select(() => onAction(action))} className={action === "delete" ? "text-error" : undefined}>
            {labels[action]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function WorkflowConfirmation({ row, action, onClose, onConfirm }: {
  row: WorkflowRow;
  action: WorkflowAction;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const deleting = action === "delete";
  const descriptions = {
    pause: row.pendingCount ? "Waiting work will be held." : "New runs will stop.",
    resume: "Waiting work will be checked again before it runs.",
    delete: "Waiting work will be canceled.",
  };

  return (
    <ConfirmDialog
      open
      title={`${labels[action]} ${row.name}?`}
      description={descriptions[action]}
      confirmLabel={`${labels[action]} workflow`}
      destructive={deleting}
      showWarningIcon={false}
      confirmation={deleting ? {
        label: "Type confirm to delete this workflow",
        expectedValue: "confirm",
        value,
        onChange: setValue,
      } : undefined}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

export function WorkflowsList({ rows, capacity, billingHref, state, onRetry, onView, onViewCustomers, onEdit, onConfirm, onOpenAssistant, unavailableReason, manualRun, notice }: WorkflowsListProps) {
  const [runSelection, setRunSelection] = useState<{ id: string; version?: number }>();
  const [runReceipt, setRunReceipt] = useState("");
  const runRow = rows.find(row => row.id === runSelection?.id && row.version === runSelection.version && row.status === "active" && row.canRunNow);
  const [selection, setSelection] = useState<{ id: string; action: WorkflowAction; version?: number }>();
  const row = rows.find(({ id }) => id === selection?.id);
  const title = (row: WorkflowRow) => (
    <button type="button" onClick={() => onView(row)} className="max-w-full cursor-pointer rounded text-left font-semibold text-primary wrap-anywhere hover:underline focus-visible:focus-ring">
      {row.name}
    </button>
  );
  const description = (row: WorkflowRow) => row.rule?.trim() ? (
    <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{row.rule}</p>
  ) : null;
  const name = (row: WorkflowRow) => <div className="grid min-w-0 gap-1">{title(row)}{description(row)}{row.issue && <p className="m-0 text-sm leading-6 text-error wrap-anywhere">{row.issue}</p>}</div>;
  const status = (row: WorkflowRow) => (
    <div className="w-max min-w-20 whitespace-nowrap">
      <StatusBadge label={row.status === "active" ? "Active" : "Paused"} tone={row.status === "active" ? "success" : "neutral"} />
    </div>
  );
  const actions = (row: WorkflowRow) => (
    <div className="flex justify-end">
      <WorkflowMenu onViewCustomers={onViewCustomers?()=>onViewCustomers(row):undefined} row={row} onView={() => onView(row)} onEdit={onEdit ? () => onEdit(row) : undefined} onAction={(action) => setSelection({ id: row.id, action, version: row.version })} onRunNow={manualRun ? () => { setRunReceipt(""); setRunSelection({ id: row.id, version: row.version }); } : undefined} />
    </div>
  );

  return (
    <div className="grid gap-4">
      {notice && <FormFeedback kind="success" message={notice} />}
      {runReceipt && <p role="status" className="m-0 text-sm text-ink">{runReceipt}</p>}
      <DataTable
        caption="Current workflows"
        columns={[
          { id: "workflow", label: "Workflow", render: name },
          { id: "status", label: "Status", render: status, compact: true },
          { id: "actions", label: "Actions", render: actions, compact: true },
        ]}
        rows={rows}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        renderCard={(row) => (
          <div className="grid min-w-0 gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 wrap-anywhere">{title(row)}</div>
              <div className="flex shrink-0 items-center gap-2">{status(row)}{actions(row)}</div>
            </div>
            {description(row)}
          </div>
        )}
        constrainHeight={false}
        state={state}
        emptyMessage="No workflows yet."
        errorMessage="Couldn't load workflows."
        onRetry={onRetry}
      />
      {capacity && capacity.plan !== "premium" && <aside aria-label="Workflow plan" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-seafoam-pale px-5 py-4 text-ink">
        <div>
          <p className="m-0 text-sm font-semibold">{capacity.used} of {capacity.limit} workflows used</p>
          <p className="mb-0 mt-1 text-sm">{capacity.plan === "free" ? "Get 10 workflows with Standard or 25 with Premium." : "Get 25 workflows with Premium."}</p>
        </div>
        {capacity.canManageBilling && billingHref ? <Link href={billingHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4 focus-visible:focus-ring">Upgrade for more workflows <span aria-hidden="true">→</span></Link> : <p className="m-0 text-sm">Ask your workspace owner to upgrade.</p>}
      </aside>}
      {runRow && manualRun && <WorkflowRunDialog key={`${runRow.id}:${runRow.version}`} row={runRow} {...manualRun} onClose={() => setRunSelection(undefined)} onComplete={result => {
        setRunReceipt(`${runRow.name}: ${result.completedCount} ${result.completedCount === 1 ? "action" : "actions"} completed${result.skippedCount ? `, ${result.skippedCount} skipped because they no longer matched` : ""}.`);
        setRunSelection(undefined);
      }} />}
      <section className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl bg-linear-to-r from-ink via-assistant-header to-[#285e6e] p-5 text-white sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -top-44 -right-24 -z-10 size-80 rounded-full border border-white/20 shadow-[0_0_0_24px_rgb(255_255_255/0.08),0_0_0_52px_rgb(255_255_255/0.05)]" />
        <div className="min-w-0">
          <h2 className="m-0 text-2xl leading-tight font-semibold">Create a workflow with the assistant</h2>
          <p className="mb-0 mt-2 max-w-md text-sm leading-6 text-assistant-foreground">Describe a task you repeat. The assistant will draft a workflow for you to review.</p>
        </div>
        <button type="button" disabled={Boolean(unavailableReason)} onClick={onOpenAssistant} className="disabled:cursor-not-allowed disabled:opacity-60 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-seafoam-pale px-4 py-2 text-sm font-semibold text-ink hover:bg-seafoam-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Open assistant <span aria-hidden="true">→</span>
        </button>
        {unavailableReason && <p role="status" className="m-0 w-full text-sm text-assistant-foreground">{unavailableReason}</p>}
      </section>
      {selection && row?.version === selection.version && row?.allowedActions.includes(selection.action) && (
        <WorkflowConfirmation
          key={`${row.id}:${selection.action}`}
          row={row}
          action={selection.action}
          onClose={() => setSelection(undefined)}
          onConfirm={async () => {
            await onConfirm(row, selection.action);
            setSelection(undefined);
          }}
        />
      )}
    </div>
  );
}

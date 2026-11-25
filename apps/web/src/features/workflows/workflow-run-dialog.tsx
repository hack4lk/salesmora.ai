"use client";

import type { WorkflowBriefingSnapshot } from "@salesmora/contracts";
import { WorkflowBriefingCard } from "./workflow-briefing-card";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@salesmora/ui";
import type { WorkflowRow } from "./workflows-list";

/** The host supplies an authorized preview and executes that exact reviewed scope. */
export type WorkflowRunPreview = { id: string; matchedCount: number; actionSummary: string; briefing?: WorkflowBriefingSnapshot };
export type WorkflowRunResult = { completedCount: number; skippedCount: number };
export type WorkflowRunHandlers = {
  onPreviewRun: (row: WorkflowRow) => Promise<WorkflowRunPreview>;
  onRunNow: (row: WorkflowRow, preview: WorkflowRunPreview) => Promise<WorkflowRunResult>;
};

export function WorkflowRunDialog({ row, onPreviewRun, onRunNow, onClose, onComplete }: WorkflowRunHandlers & {
  row: WorkflowRow;
  onClose: () => void;
  onComplete: (result: WorkflowRunResult) => void;
}) {
  const [preview, setPreview] = useState<WorkflowRunPreview>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [executionFailed, setExecutionFailed] = useState(false);
  // The parent keys this dialog by workflow/version. Keep one preview request per review,
  // even when mutation state causes the host callbacks to acquire new identities.
  const [source] = useState(() => ({ row, onPreviewRun }));
  useEffect(() => {
    let current = true;
    void source.onPreviewRun(source.row).then(value => { if (current) setPreview(value); })
      .catch(() => { if (current) setFailed(true); });
    return () => { current = false; };
  }, [source, attempt]);

  return <ConfirmDialog
    key={attempt}
    open
    title={`Run ${row.name} now?`}
    description={failed ? "Couldn't check matching records. Try again."
      : !preview ? "Checking matching records…"
      : preview.matchedCount === 0 ? "No records match this workflow right now."
      : preview.actionSummary}
    confirmLabel="Run now"
    confirmDisabled={!preview || preview.matchedCount === 0}
    pendingLabel="Running…"
    showWarningIcon={false}
    onClose={onClose}
    onConfirm={async () => {
      if (preview && preview.matchedCount > 0) {
        setExecutionFailed(false);
        try { onComplete(await onRunNow(row, preview)); }
        catch (error) { setExecutionFailed(true); throw error; }
      }
    }}
  >
    {preview?.briefing && <WorkflowBriefingCard {...preview.briefing} canRead />}
    {preview && !preview.briefing && preview.matchedCount > 0 && <p className="m-0 text-sm leading-6 text-muted">This takes real actions now, including for existing matching records. The usual waiting period is skipped. Your regular schedule stays the same.</p>}
    {preview?.matchedCount === 100 && <p className="mb-0 mt-3 text-sm text-muted">Each run includes up to 100 matching records. Run again to check for more.</p>}
    {(failed || executionFailed) && <button type="button" onClick={() => { setFailed(false); setExecutionFailed(false); setPreview(undefined); setAttempt(value => value + 1); }} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold focus-visible:focus-ring">{failed ? "Try again" : "Check matching records again"}</button>}
  </ConfirmDialog>;
}

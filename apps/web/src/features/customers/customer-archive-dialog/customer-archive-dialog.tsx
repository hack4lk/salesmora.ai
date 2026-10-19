"use client";
import { ConfirmDialog } from "@salesmora/ui";
import { customerArchiveDialogData as c } from "./customer-archive-dialog.data";
export function CustomerArchiveDialog({
  open,
  name,
  restoring = false,
  openLeads = 0,
  activeJobs,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  name: string;
  restoring?: boolean;
  openLeads?: number;
  activeJobs?: number;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ConfirmDialog
      open={open}
      title={restoring ? c.restore : c.archive}
      description={restoring ? c.restoreHint(name) : c.hint(name)}
      confirmLabel={restoring ? c.restore : c.archive}
      pending={pending}
      error={error}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="grid gap-3 text-sm text-muted">
        <p className="m-0">{c.leads(openLeads)}</p>
        {activeJobs !== undefined && (
          <p className="m-0">{c.jobs(activeJobs)}</p>
        )}
        <p className="m-0">{c.safe}</p>
      </div>
    </ConfirmDialog>
  );
}

"use client";
import { useState } from "react";
import { ConfirmDialog } from "@salesmora/ui";
import { customerDeleteDialogData as c } from "./customer-delete-dialog.data";
export type CustomerDeleteDialogProps = {
  open: boolean;
  customerId: string;
  name: string;
  number: string;
  openLeads?: number;
  activeJobs?: number;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (consent: {
    unlinkOpenLeads: boolean;
    typedConfirmation: string;
  }) => Promise<void>;
};
export function CustomerDeleteDialog(props: CustomerDeleteDialogProps) {
  return <DeleteReview key={`${props.customerId}:${props.open}`} {...props} />;
}
function DeleteReview({
  open,
  name,
  number,
  openLeads = 0,
  activeJobs = 0,
  pending,
  error,
  onClose,
  onConfirm,
}: CustomerDeleteDialogProps) {
  const [value, setValue] = useState(""),
    [unlink, setUnlink] = useState(false),
    blocked = activeJobs > 0;
  return (
    <ConfirmDialog
      open={open}
      title={c.title}
      description={c.description(name)}
      confirmLabel={c.confirm}
      destructive
      confirmDisabled={blocked || (openLeads > 0 && !unlink)}
      pending={pending}
      error={error}
      confirmation={
        blocked
          ? undefined
          : { label: c.type, expectedValue: number, value, onChange: setValue }
      }
      onClose={onClose}
      onConfirm={() =>
        onConfirm({ unlinkOpenLeads: unlink, typedConfirmation: value })
      }
    >
      <div className="grid gap-4 text-sm">
        <p className="m-0 text-muted">{c.impact}</p>
        {blocked && (
          <p
            role="alert"
            className="m-0 rounded-xl border border-error bg-error/10 p-4 text-red-800"
          >
            {c.blocked(activeJobs)}
          </p>
        )}
        {openLeads > 0 && (
          <label className="flex cursor-pointer items-start gap-3 text-ink">
            <input
              type="checkbox"
              disabled={pending || blocked}
              checked={unlink}
              onChange={(e) => setUnlink(e.target.checked)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring"
            />
            <span>{c.unlink(openLeads)}</span>
          </label>
        )}
      </div>
    </ConfirmDialog>
  );
}

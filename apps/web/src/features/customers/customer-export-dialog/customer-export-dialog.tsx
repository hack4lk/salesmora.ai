"use client";
import { useId, useState } from "react";
import { ConfirmDialog } from "@salesmora/ui";
import { customerExportDialogData as c } from "./customer-export-dialog.data";
export type CustomerExportDialogProps = {
  open: boolean;
  count: number;
  scope: string;
  canExport: boolean;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onExport: (columns: readonly string[]) => Promise<void>;
};
export function CustomerExportDialog(props: CustomerExportDialogProps) {
  return <ExportReview key={`${props.open}:${props.scope}`} {...props} />;
}
function ExportReview({
  open,
  count,
  scope,
  canExport,
  pending,
  error,
  onClose,
  onExport,
}: CustomerExportDialogProps) {
  const id = useId(),
    [columns, setColumns] = useState<string[]>(Object.keys(c.columns));
  const valid = Number.isSafeInteger(count) && count >= 0 && count <= 50000;
  return (
    <ConfirmDialog
      open={open}
      title={c.title}
      description={c.description}
      confirmLabel={c.download}
      confirmDisabled={!canExport || !valid || count === 0 || !columns.length}
      pending={pending}
      error={error}
      onClose={onClose}
      onConfirm={() => onExport(columns)}
    >
      <div className="grid gap-4">
        <p className="m-0 text-sm font-semibold wrap-anywhere">{scope}</p>
        <p role="status" className="m-0 text-sm text-muted">
          {canExport && valid
            ? c.count(count)
            : !canExport
              ? c.forbidden
              : c.limit}
        </p>
        {canExport && (
          <fieldset disabled={pending} className="m-0 grid gap-3 border-0 p-0">
            <legend id={id} className="mb-3 text-sm font-semibold">
              {c.choose}
            </legend>
            {Object.entries(c.columns).map(([key, label]) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={columns.includes(key)}
                  onChange={(e) =>
                    setColumns(
                      e.target.checked
                        ? [...columns, key]
                        : columns.filter((col) => col !== key),
                    )
                  }
                  className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        <p className="m-0 text-xs leading-5 text-muted">{c.hint}</p>
      </div>
    </ConfirmDialog>
  );
}

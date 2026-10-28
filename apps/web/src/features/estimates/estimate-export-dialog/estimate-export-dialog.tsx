"use client";
import { useId, useState } from "react";
import {
  estimateExportColumns,
  type EstimateExportColumn,
} from "@salesmora/contracts";
import { ConfirmDialog } from "@salesmora/ui";
import { estimateExportDialogData as c } from "./estimate-export-dialog.data";

export type EstimateExportDialogProps = {
  open: boolean;
  count: number;
  rowLimit?: number;
  scope: string;
  canExport: boolean;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onExport: (columns: readonly EstimateExportColumn[]) => Promise<void>;
};

export function EstimateExportDialog(props: EstimateExportDialogProps) {
  return <ExportReview key={`${props.open}:${props.scope}`} {...props} />;
}

function ExportReview({
  open,
  count,
  rowLimit = 50000,
  scope,
  canExport,
  pending,
  error,
  onClose,
  onExport,
}: EstimateExportDialogProps) {
  const id = useId(),
    [columns, setColumns] = useState<EstimateExportColumn[]>([
      ...estimateExportColumns,
    ]);
  const valid =
    Number.isSafeInteger(count) &&
    count >= 0 &&
    Number.isSafeInteger(rowLimit) &&
    rowLimit > 0 &&
    count <= rowLimit;
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
              : c.limit(rowLimit)}
        </p>
        {canExport && (
          <fieldset disabled={pending} className="m-0 grid gap-3 border-0 p-0">
            <legend id={id} className="mb-3 text-sm font-semibold">
              {c.choose}
            </legend>
            {estimateExportColumns.map((key) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={columns.includes(key)}
                  onChange={(event) =>
                    setColumns(
                      event.target.checked
                        ? [...columns, key]
                        : columns.filter((col) => col !== key),
                    )
                  }
                  className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
                />
                {c.columns[key]}
              </label>
            ))}
          </fieldset>
        )}
        <p className="m-0 text-xs leading-5 text-muted">{c.hint}</p>
      </div>
    </ConfirmDialog>
  );
}

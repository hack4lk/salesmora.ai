"use client";

import { useContext, useId, type ReactNode } from "react";
import {
  DataTable,
  FormFeedback,
  HelpTooltip,
  Pagination,
  SeafoamButton,
} from "@salesmora/ui";
import { ReportResultState } from "../report-result-state/report-result-state";
import { reportEvidenceTableData as copy } from "./report-evidence-table.data";
import { ReportExportActionContext } from "../report-page-layout/report-export-action.context";

export type ReportEvidenceColumn = { id: string; label: string };
export type ReportEvidenceRow = {
  id: string;
  label: string;
  /** Only currently authorized record references may be supplied. */
  recordId?: string;
  cells: Readonly<Record<string, string | null>>;
};
export type ReportEvidenceTableProps = {
  viewLabel: string;
  contextLabel: string;
  /** Put detailed projection context in the header help instead of a visible paragraph. */
  contextInTooltip?: boolean;
  columns: readonly ReportEvidenceColumn[];
  rows: readonly ReportEvidenceRow[];
  total: number;
  page: number;
  pageSize: number;
  canRead: boolean;
  canExport: boolean;
  canEdit: boolean;
  state?: "ready" | "loading" | "error";
  pending?: boolean;
  /** Compose authorized event/record actions when an evidence row has several targets. */
  renderRecord?: (row: ReportEvidenceRow) => ReactNode;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

/** Host-owned authorized page and safe formatted cells; no filtering, queries or export generation. */
export function ReportEvidenceTable({
  viewLabel,
  contextLabel,
  contextInTooltip = false,
  columns,
  rows,
  total,
  page,
  pageSize,
  canRead,
  canExport,
  canEdit,
  state = "ready",
  pending = false,
  renderRecord,
  onRecord,
  onExport,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onEdit,
}: ReportEvidenceTableProps) {
  const id = useId();
  const exportInToolbar = useContext(ReportExportActionContext);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (state !== "ready")
    return (
      <ReportResultState
        state={{ kind: state }}
        canRead
        canEdit={canEdit}
        pending={pending}
        onRetry={onRetry}
        onEdit={onEdit}
      />
    );
  const valid =
    Number.isSafeInteger(total) &&
    total >= 0 &&
    Number.isSafeInteger(page) &&
    page > 0 &&
    Number.isSafeInteger(pageSize) &&
    pageSize > 0 &&
    page <= Math.max(1, Math.ceil(total / pageSize)) &&
    rows.length ===
      Math.min(pageSize, Math.max(0, total - (page - 1) * pageSize)) &&
    columns.length > 0 &&
    new Set(columns.map((column) => column.id)).size === columns.length &&
    columns.every((column) => column.id.trim() && column.id !== "record") &&
    new Set(rows.map((row) => row.id)).size === rows.length &&
    rows.every(
      (row) =>
        row.id.trim() &&
        columns.every((column) => Object.hasOwn(row.cells, column.id)),
    );
  if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      className="grid w-full min-w-0 gap-4 text-ink"
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">
              {copy.title}
            </h2>
            <div className="flex min-w-0 items-center gap-1">
              <p className="m-0 min-w-0 text-sm font-semibold wrap-anywhere">
                {viewLabel}
              </p>
              <HelpTooltip
                label={copy.exportHelpLabel}
                paragraphs={contextInTooltip ? [contextLabel, copy.exportHelp] : [copy.exportHelp]}
              />
            </div>
          </div>
          {!contextInTooltip && (
            <p className="m-0 text-sm text-muted wrap-anywhere">{contextLabel}</p>
          )}
        </div>
        {!exportInToolbar && <SeafoamButton
          label={copy.export}
          size={14}
          disabled={pending || !canExport || total === 0}
          onClick={() => {
            if (canExport && total > 0 && !pending) onExport();
          }}
        />}
      </header>
      {!canExport && (
        <p className="m-0 text-sm text-muted">{copy.exportDenied}</p>
      )}
      {total === 0 ? (
        <ReportResultState
          state={{ kind: "empty" }}
          canRead
          canEdit={canEdit}
          pending={pending}
          onRetry={onRetry}
          onEdit={onEdit}
        />
      ) : (
        <>
          <DataTable
            caption={viewLabel}
            rows={rows}
            getRowId={(row) => row.id}
            getRowLabel={(row) => row.label}
            columns={[
              {
                id: "record",
                label: "Record / event",
                render: (row) =>
                  renderRecord ? renderRecord(row) : row.recordId !== undefined ? (
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={copy.record(row.label)}
                      onClick={() => {
                        if (!pending && row.recordId !== undefined)
                          onRecord(row.recordId);
                      }}
                      className="min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {row.label}
                    </button>
                  ) : (
                    <span className="font-semibold">{row.label}</span>
                  ),
              },
              ...columns.map((column) => ({
                ...column,
                render: (row: ReportEvidenceRow) =>
                  row.cells[column.id] === null
                    ? copy.unknown
                    : row.cells[column.id],
              })),
            ]}
          />
          <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            disabled={pending}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </section>
  );
}

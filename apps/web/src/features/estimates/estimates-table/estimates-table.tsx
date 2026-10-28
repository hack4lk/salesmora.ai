"use client";
import { DataTable, MoneyText, type DataTableColumn } from "@salesmora/ui";
import type {
  EstimateCapabilities,
  EstimateMember,
  EstimateRow,
} from "../estimate-preview.types";
import {
  estimateRelativeDate,
  estimateValidUntilDate,
} from "../estimate-ui";
import {
  EstimateRowMenu,
  type EstimateRowAction,
} from "../estimate-row-menu/estimate-row-menu";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimatesTableData as c } from "./estimates-table.data";

export type EstimatesTableProps = {
  rows: readonly EstimateRow[];
  members: readonly EstimateMember[];
  capabilities: EstimateCapabilities;
  now?: string;
  state?: "ready" | "loading" | "error";
  pending?: boolean;
  onOpen?: (estimate: EstimateRow) => void;
  onAction?: (estimate: EstimateRow, action: EstimateRowAction) => void;
  onOpenRelated?: (estimate: EstimateRow) => void;
  canOpenRelated?: (estimate: EstimateRow) => boolean;
  onRetry?: () => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sort?: { column: string; direction: "asc" | "desc" };
};

export function EstimatesTable({
  rows,
  members,
  capabilities,
  now,
  state,
  pending = false,
  onOpen,
  onAction,
  onOpenRelated,
  canOpenRelated,
  onRetry,
  onSort,
  sort,
}: EstimatesTableProps) {
  if (!capabilities.read)
    return (
      <p role="alert" className="text-red-800">
        {c.forbidden}
      </p>
    );
  const ownerName = (row: EstimateRow) =>
    row.ownerName ??
    members.find((member) => member.id === row.ownerId)?.name ??
    c.missingOwner;
  const relatedLabel = (row: EstimateRow) =>
    `${row.parentType === "job" ? c.job : c.lead} · ${row.parentNumber}`;
  const related = (row: EstimateRow) => {
    const openable = !!onOpenRelated && (canOpenRelated?.(row) ?? true);
    return openable ? (
      <button
        type="button"
        className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring"
        aria-label={c.openRelated(relatedLabel(row))}
        onClick={() => onOpenRelated(row)}
      >
        {relatedLabel(row)}
      </button>
    ) : (
      relatedLabel(row)
    );
  };
  const menu = (row: EstimateRow) => onAction ? (
    <EstimateRowMenu
      name={row.name}
      status={row.status}
      archived={row.archived}
      capabilities={{ ...capabilities, ...row.capabilities }}
      disabled={pending}
      onAction={(action) => onAction(row, action)}
    />
  ) : null;
  const columns: DataTableColumn<EstimateRow>[] = [
    {
      id: "number",
      label: c.estimate,
      sortable: true,
      render: (row) => (
        <div className="grid min-w-0 gap-1">
          <strong className="wrap-anywhere">{row.name}</strong>
          <span className="text-sm text-muted">{row.number}</span>
        </div>
      ),
    },
    {
      id: "customer",
      label: c.customer,
      render: (row) => (
        <div className="grid min-w-0 gap-1">
          <strong className="wrap-anywhere">{row.customerName}</strong>
          <span className="text-sm text-muted wrap-anywhere">{row.service}</span>
        </div>
      ),
    },
    {
      id: "status",
      label: c.status,
      render: (row) => <EstimateStatusBadge status={row.status} archived={row.archived} />,
    },
    {
      id: "totalCents",
      label: c.amount,
      sortable: true,
      render: (row) => <MoneyText cents={row.totalCents} className={row.status === "draft" ? "text-muted" : undefined} />,
    },
    { id: "related", label: c.related, render: related },
    { id: "owner", label: c.owner, render: ownerName },
    {
      id: "validUntil",
      label: c.validUntil,
      sortable: true,
      render: (row) => estimateValidUntilDate(row.validUntil),
    },
    {
      id: "updatedAt",
      label: c.updated,
      sortable: true,
      render: (row) => (
        <time dateTime={row.updatedAt} title={row.updatedAt}>
          {estimateRelativeDate(row.updatedAt, now)}
        </time>
      ),
    },
    ...(onAction ? [{ id: "actions", label: c.actions, render: menu }] : []),
  ];
  return (
    <DataTable
      caption={c.caption}
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      onRowOpen={onOpen}
      sort={sort}
      onSort={onSort}
      state={state}
      emptyMessage={c.empty}
      errorMessage={c.error}
      onRetry={onRetry}
      renderCard={(row) => (
        <div className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-1">
            <strong className="wrap-anywhere">{row.name}</strong>
            <span className="text-sm text-muted">{row.number}</span>
          </div>
          <EstimateStatusBadge status={row.status} archived={row.archived} />
          <dl className="m-0 grid gap-2 text-sm">
            <div>
              <dt className="text-muted">{c.customer}</dt>
              <dd className="m-0 wrap-anywhere">
                {row.customerName} · {row.service}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{c.amount}</dt>
              <dd className="m-0">
                <MoneyText cents={row.totalCents} className={row.status === "draft" ? "text-muted" : undefined} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">{c.related}</dt>
              <dd className="m-0">{related(row)}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.owner}</dt>
              <dd className="m-0">{ownerName(row)}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.validUntil}</dt>
              <dd className="m-0">{estimateValidUntilDate(row.validUntil)}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.updated}</dt>
              <dd className="m-0">{estimateRelativeDate(row.updatedAt, now)}</dd>
            </div>
          </dl>
          {menu(row)}
        </div>
      )}
    />
  );
}

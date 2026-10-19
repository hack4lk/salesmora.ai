"use client";
import { DataTable, StatusBadge, type DataTableColumn } from "@salesmora/ui";
import type {
  CustomerRecord,
  CustomerMember,
  CustomerCapabilities,
} from "../customer-preview.types";
import {
  customerRelativeDate,
  customerInitials,
  customerButton,
} from "../customer-ui";
import {
  CustomerRowMenu,
  type CustomerRowAction,
} from "../customer-row-menu/customer-row-menu";
import { customerTableData as c } from "./customer-table.data";
export type CustomerTableProps = {
  rows: readonly CustomerRecord[];
  members: readonly CustomerMember[];
  capabilities: CustomerCapabilities;
  jobsAvailable?: boolean;
  now?: string;
  state?: "ready" | "loading" | "error";
  onOpen: (customer: CustomerRecord) => void;
  onAction: (customer: CustomerRecord, action: CustomerRowAction) => void;
  onOpenLeads?: (customer: CustomerRecord) => void;
  onRetry?: () => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sort?: { column: string; direction: "asc" | "desc" };
};
export function CustomerTable({
  rows,
  members,
  capabilities,
  jobsAvailable,
  now,
  state,
  onOpen,
  onAction,
  onOpenLeads,
  onRetry,
  onSort,
  sort,
}: CustomerTableProps) {
  if (!capabilities.read)
    return (
      <p role="alert" className="text-red-800">
        {c.forbidden}
      </p>
    );
  const identity = (row: CustomerRecord) => (
    <div className="flex min-w-0 items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary-dark"
      >
        {customerInitials(row.name)}
      </span>
      <div className="grid min-w-0 gap-1">
        <strong className="wrap-anywhere">{row.name}</strong>
        <span className="text-sm text-muted wrap-anywhere">
          {row.email || c.missingEmail}
        </span>
        <div className="flex flex-wrap gap-2">
          {row.type === "business" && (
            <StatusBadge label={c.business} tone="info" />
          )}
          {row.archived && <StatusBadge label={c.archived} />}
        </div>
      </div>
    </div>
  );
  const owner = (row: CustomerRecord) =>
    members.find((m) => m.id === row.ownerId)?.name ?? c.unassigned;
  const leads = (row: CustomerRecord) =>
    onOpenLeads && row.openLeadCount > 0 ? (
      <button
        type="button"
        className={customerButton}
        onClick={() => onOpenLeads(row)}
        aria-label={c.openLeads(row.name)}
      >
        {row.openLeadCount}
      </button>
    ) : (
      row.openLeadCount
    );
  const menu = (row: CustomerRecord) => (
    <CustomerRowMenu
      name={row.name}
      archived={row.archived}
      capabilities={capabilities}
      onAction={(action) => onAction(row, action)}
    />
  );
  const columns: DataTableColumn<CustomerRecord>[] = [
    { id: "name", label: c.customer, sortable: true, render: identity },
    { id: "phone", label: c.phone, render: (r) => r.phone || c.missing },
    { id: "owner", label: c.owner, render: owner },
    { id: "leads", label: c.leads, render: leads },
    ...(jobsAvailable
      ? [
          {
            id: "jobs",
            label: c.jobs,
            render: (r: CustomerRecord) => r.activeJobCount ?? c.unavailable,
          },
        ]
      : []),
    {
      id: "activity",
      label: c.activity,
      sortable: true,
      render: (r) => (
        <time dateTime={r.lastActivityAt} title={r.lastActivityAt}>
          {customerRelativeDate(r.lastActivityAt, now)}
        </time>
      ),
    },
    { id: "actions", label: c.actions, render: menu },
  ];
  return (
    <DataTable
      caption={c.caption}
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      getRowLabel={(r) => r.name}
      onRowOpen={onOpen}
      sort={sort}
      onSort={onSort}
      state={state}
      emptyMessage={c.empty}
      errorMessage={c.error}
      onRetry={onRetry}
      renderCard={(r) => (
        <div className="grid min-w-0 gap-4">
          {identity(r)}
          <dl className="m-0 grid gap-2 text-sm">
            <div>
              <dt className="text-muted">{c.phone}</dt>
              <dd className="m-0 wrap-anywhere">{r.phone || c.missing}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.owner}</dt>
              <dd className="m-0">{owner(r)}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.leads}</dt>
              <dd className="m-0">{leads(r)}</dd>
            </div>
            <div>
              <dt className="text-muted">{c.activity}</dt>
              <dd className="m-0">
                {customerRelativeDate(r.lastActivityAt, now)}
              </dd>
            </div>
            {jobsAvailable && (
              <div>
                <dt className="text-muted">{c.jobs}</dt>
                <dd className="m-0">{r.activeJobCount ?? c.unavailable}</dd>
              </div>
            )}
          </dl>
          {menu(r)}
        </div>
      )}
    />
  );
}

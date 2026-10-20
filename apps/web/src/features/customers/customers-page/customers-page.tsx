"use client";
import { useEffect, useState } from "react";
import {
  AssistantPanel,
  CustomerDraftCard,
  Pagination,
  Toast,
  WorkspaceNavigation,
  type CustomerDraftProposal,
} from "@salesmora/ui";
import type {
  CustomerCapabilities,
  CustomerRecord,
  CustomerValues,
  LinkedCustomerRecord,
  CustomerNote,
} from "../customer-preview.types";
import {
  customerFixtures,
  customerManyFixtures,
  emptyCustomer,
  customerMembers,
  customerOwnerCapabilities,
  customerOfficeCapabilities,
  customerReadOnlyCapabilities,
  customerFieldCapabilities,
  customerLinkedLeads,
  customerEvents,
  customerNotes,
} from "../customer-preview.data";
import { CustomersMetrics } from "../customers-metrics/customers-metrics";
import {
  CustomersToolbar,
  defaultCustomerFilters,
} from "../customers-toolbar/customers-toolbar";
import { CustomerTable } from "../customer-table/customer-table";
import { CustomerDrawer } from "../customer-drawer/customer-drawer";
import { CustomerDialog } from "../customer-dialog/customer-dialog";
import { CustomerProfile } from "../customer-profile/customer-profile";
import { CustomersEmptyState } from "../customers-empty-state/customers-empty-state";
import { CustomerArchiveDialog } from "../customer-archive-dialog/customer-archive-dialog";
import { CustomerDeleteDialog } from "../customer-delete-dialog/customer-delete-dialog";
import { LinkLeadDialog } from "../link-lead-dialog/link-lead-dialog";
import { CustomerExportDialog } from "../customer-export-dialog/customer-export-dialog";
import type { CustomerRowAction } from "../customer-row-menu/customer-row-menu";
import { customerButton, customerPrimary } from "../customer-ui";
import { customersPageData as c } from "./customers-page.data";
export type CustomersPagePreviewProps = {
  role?: "owner" | "admin" | "office" | "field" | "readOnly";
  initialOverlay?: "drawer" | "add" | "edit" | "duplicate" | "assistant";
  initialProfile?: boolean;
  initialTab?: "overview" | "leads" | "activity" | "notes";
  empty?: boolean;
  many?: boolean;
  filteredEmpty?: boolean;
  state?: "ready" | "loading" | "error";
};
/** Storybook-only controller. It never fetches, persists, navigates to routes or calls AI. */
export function CustomersPagePreview({
  role = "owner",
  initialOverlay,
  initialProfile,
  initialTab,
  empty,
  many,
  filteredEmpty,
  state: initialState = "ready",
}: CustomersPagePreviewProps) {
  const capabilities: CustomerCapabilities =
    role === "field"
      ? customerFieldCapabilities
      : role === "office"
        ? customerOfficeCapabilities
        : role === "readOnly"
          ? customerReadOnlyCapabilities
          : customerOwnerCapabilities;
  const [rows, setRows] = useState(
      empty ? [] : many ? customerManyFixtures : customerFixtures,
    ),
    [state, setState] = useState(initialState),
    [filters, setFilters] = useState({
      ...defaultCustomerFilters,
      search: filteredEmpty ? c.missingSearch : "",
    }),
    [query, setQuery] = useState(filters.search),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<string | undefined>(
      initialOverlay || initialProfile ? customerFixtures[0].id : undefined,
    ),
    [profile, setProfile] = useState(!!initialProfile),
    [drawer, setDrawer] = useState(initialOverlay === "drawer");
  const [dialog, setDialog] = useState(
      initialOverlay === "add" ||
        initialOverlay === "edit" ||
        initialOverlay === "duplicate",
    ),
    [editing, setEditing] = useState(initialOverlay === "edit"),
    [values, setValues] = useState<CustomerValues>(
      initialOverlay === "edit"
        ? customerFixtures[0]
        : initialOverlay === "duplicate"
          ? {
              ...emptyCustomer,
              name: customerFixtures[0].name,
              email: customerFixtures[0].email,
            }
          : emptyCustomer,
    );
  const [duplicate, setDuplicate] = useState(initialOverlay === "duplicate"),
    [action, setAction] = useState<CustomerRowAction>(),
    [exporting, setExporting] = useState(false),
    [linking, setLinking] = useState(false),
    [unlinking, setUnlinking] = useState<LinkedCustomerRecord>(),
    [linkedByCustomer, setLinkedByCustomer] = useState<
      Record<string, LinkedCustomerRecord[]>
    >(() =>
      Object.fromEntries(
        (empty ? [] : many ? customerManyFixtures : customerFixtures).map(
          (customer, index) => [
            customer.id,
            Array.from({ length: customer.openLeadCount }, (_, n) => ({
              ...customerLinkedLeads[(index + n) % 2],
              id: `${customer.id}-lead-${n}`,
              number: `LD-${String(index * 2 + n + 1).padStart(4, "0")}`,
            })),
          ],
        ),
      ),
    ),
    [notesByCustomer, setNotesByCustomer] = useState<
      Record<string, CustomerNote[]>
    >({ [customerFixtures[0].id]: customerNotes }),
    [notice, setNotice] = useState(""),
    [assistant, setAssistant] = useState(initialOverlay === "assistant");
  const [proposal, setProposal] = useState<CustomerDraftProposal>(() => ({
    id: "preview-proposal",
    customer: {
      name: customerFixtures[0].name,
      number: customerFixtures[0].number,
    },
    action: "update",
    changes: [
      { label: c.phone, before: customerFixtures[0].phone, after: c.newPhone },
    ],
    state: "pending",
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  }));
  useEffect(() => {
    const timer = setTimeout(() => setQuery(filters.search), 250);
    return () => clearTimeout(timer);
  }, [filters.search]);
  const current = rows.find((row) => row.id === selected);
  const leads = current ? (linkedByCustomer[current.id] ?? []) : [];
  const notes = current ? (notesByCustomer[current.id] ?? []) : [];
  const activity =
    current?.id === customerFixtures[0].id
      ? customerEvents
      : customerEvents.filter((event) => event.source === "customer");
  const duplicateMatches = rows.flatMap((row) => {
    const reason =
      values.email && row.email.toLowerCase() === values.email.toLowerCase()
        ? ("email" as const)
        : values.phone &&
            row.phone.replace(/\D/g, "") === values.phone.replace(/\D/g, "")
          ? ("phone" as const)
          : row.name.toLowerCase() === values.name.toLowerCase()
            ? ("name" as const)
            : undefined;
    return reason
      ? [{ id: row.id, name: row.name, number: row.number, reason }]
      : [];
  });
  const filtered = rows
    .filter((row) => {
      const text = query.trim().toLowerCase(),
        digits = query.replace(/\D/g, "");
      const matches =
        !text ||
        `${row.name} ${row.email} ${row.phone}`.toLowerCase().includes(text) ||
        (digits.length > 0 &&
          /^[+()\d\s.-]+$/.test(query) &&
          row.phone.replace(/\D/g, "").includes(digits));
      return (
        matches &&
        (!row.archived || (capabilities.archive && filters.archived)) &&
        (filters.relationship !== "lead" || row.openLeadCount > 0) &&
        (filters.owner === "all" ||
          (filters.owner === "unassigned"
            ? !row.ownerId
            : row.ownerId === filters.owner)) &&
        (filters.type === "all" || row.type === filters.type)
      );
    })
    .sort(
      (a, b) =>
        (filters.sort === "name"
          ? a.name.localeCompare(b.name)
          : filters.sort === "name-desc"
            ? b.name.localeCompare(a.name)
            : filters.sort === "activity"
              ? b.lastActivityAt.localeCompare(a.lastActivityAt)
              : b.createdAt.localeCompare(a.createdAt)) ||
        a.id.localeCompare(b.id),
    );
  const activeRows = rows.filter((row) => !row.archived),
    safePage = Math.min(
      page,
      Math.max(1, Math.ceil(filtered.length / pageSize)),
    ),
    paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const changeAction = (customer: CustomerRecord, next: CustomerRowAction) => {
    setSelected(customer.id);
    if (next === "view") {
      setDrawer(true);
      return;
    }
    if (next === "edit") {
      setEditing(true);
      setValues(customer);
      setDuplicate(false);
      setDrawer(false);
      setDialog(true);
      return;
    }
    setAction(next);
  };
  const openAdd = () => {
    setEditing(false);
    setValues(emptyCustomer);
    setDuplicate(false);
    setDialog(true);
  };
  const save = async (value: CustomerValues, anyway = false) => {
    if (
      !editing &&
      !anyway &&
      rows.some(
        (row) =>
          (value.email &&
            row.email.toLowerCase() === value.email.toLowerCase()) ||
          (value.phone &&
            row.phone.replace(/\D/g, "") === value.phone.replace(/\D/g, "")) ||
          row.name.toLowerCase() === value.name.toLowerCase(),
      )
    ) {
      setValues(value);
      setDuplicate(true);
      return;
    }
    if (editing && current)
      setRows(
        rows.map((row) =>
          row.id === current.id
            ? { ...row, ...value, version: row.version + 1 }
            : row,
        ),
      );
    else
      setRows([
        ...rows,
        {
          ...value,
          id: `preview-${rows.length}`,
          number: `CU-${4000 + rows.length}`,
          createdAt: "2026-10-18T12:00:00Z",
          lastActivityAt: "2026-10-18T12:00:00Z",
          archived: false,
          openLeadCount: 0,
          version: 1,
        },
      ]);
    setDialog(false);
    setDuplicate(false);
    setNotice(c.saved);
  };
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-canvas md:flex-row">
      <WorkspaceNavigation
        workspaceName={c.workspace}
        user={{
          name: customerMembers[0].name,
          email: c.userEmail,
          role: role === "readOnly" ? "office" : role,
        }}
        currentPage="customers"
        contentId="customers-preview-main"
        availablePages={["home", "leads", "customers", "settings"]}
        authorizedPages={
          capabilities.read
            ? ["home", "leads", "customers", "settings"]
            : ["home", "leads", "settings"]
        }
        onNavigate={() => setNotice(c.opened)}
        onAccountSettings={() => setNotice(c.opened)}
        onSignOut={() => setNotice(c.opened)}
      />
      <main
        id="customers-preview-main"
        className="min-w-0 flex-1 p-4 pb-28 sm:p-8"
      >
        <p className="mb-6 mt-0 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-dark">
          {c.notice}
        </p>
        {!capabilities.read ? (
          <p role="alert" className="text-ink">
            {c.forbidden}
          </p>
        ) : profile ? (
          <CustomerProfile
            customer={current}
            members={customerMembers}
            capabilities={capabilities}
            leads={leads}
            events={activity}
            notes={notes}
            initialTab={initialTab}
            onBack={() => setProfile(false)}
            onAction={(next) => current && changeAction(current, next)}
            onExport={() => setExporting(true)}
            onLink={() => setLinking(true)}
            onUnlink={(record) => setUnlinking(record)}
            onOpenRecord={() => setNotice(c.opened)}
            onAddNote={async (body) => {
              setNotesByCustomer({
                ...notesByCustomer,
                [current!.id]: [
                  {
                    id: `note-${notes.length}`,
                    body,
                    author: customerMembers[0].name,
                    createdAt: "2026-10-18T12:00:00Z",
                  },
                  ...notes,
                ],
              });
            }}
          />
        ) : (
          <div className="grid min-w-0 gap-6">
            <header className="flex flex-wrap items-end justify-between gap-5">
              <div className="min-w-0">
                <p className="mb-2 mt-0 text-sm font-semibold text-primary">
                  {c.eyebrow}
                </p>
                <h1 className="m-0 text-heading font-semibold text-ink">
                  {c.title}
                </h1>
                <p className="mb-0 mt-3 max-w-reading text-base leading-6 text-muted">
                  {c.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {capabilities.export && (
                  <button
                    type="button"
                    className={customerButton}
                    disabled={state !== "ready"}
                    onClick={() => setExporting(true)}
                  >
                    {c.export}
                  </button>
                )}
                {capabilities.create && (
                  <button
                    type="button"
                    className={customerPrimary}
                    onClick={openAdd}
                  >
                    {c.add}
                  </button>
                )}
              </div>
            </header>
            <CustomersMetrics
              totals={{
                customers: activeRows.length,
                withOpenLeads: activeRows.filter((row) => row.openLeadCount > 0)
                  .length,
              }}
              state={state}
              onRetry={() => setState("ready")}
            />
            <CustomersToolbar
              value={filters}
              members={customerMembers}
              count={filtered.length}
              disabled={state !== "ready"}
              canArchive={capabilities.archive}
              onChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
            />
            {state === "ready" && !filtered.length ? (
              <CustomersEmptyState
                filtered={!!rows.length}
                onAdd={capabilities.create ? openAdd : undefined}
                onClear={() => {
                  setFilters(defaultCustomerFilters);
                  setQuery("");
                  setPage(1);
                }}
              />
            ) : (
              <CustomerTable
                now={c.now}
                rows={paged}
                members={customerMembers}
                capabilities={capabilities}
                state={state}
                onRetry={() => setState("ready")}
                onOpen={(row) => {
                  setSelected(row.id);
                  setDrawer(true);
                }}
                onAction={changeAction}
                onOpenLeads={(row) => {
                  setSelected(row.id);
                  setProfile(true);
                }}
                sort={{
                  column: filters.sort === "activity" ? "activity" : "name",
                  direction:
                    filters.sort === "name-desc" || filters.sort === "activity"
                      ? "desc"
                      : "asc",
                }}
                onSort={(column, direction) =>
                  setFilters({
                    ...filters,
                    sort:
                      column === "activity"
                        ? "activity"
                        : direction === "asc"
                          ? "name"
                          : "name-desc",
                  })
                }
              />
            )}
            <Pagination
              total={filtered.length}
              page={safePage}
              pageSize={pageSize}
              disabled={state !== "ready"}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </main>
      {capabilities.read && (
        <>
          <CustomerDrawer
            open={drawer}
            customer={current}
            members={customerMembers}
            capabilities={capabilities}
            leads={leads}
            events={activity}
            onClose={() => setDrawer(false)}
            onEdit={() => current && changeAction(current, "edit")}
            onProfile={() => {
              setDrawer(false);
              setProfile(true);
            }}
            onOpenRecord={() => setNotice(c.opened)}
          />
          <CustomerDialog
            open={dialog}
            value={values}
            members={customerMembers}
            editing={editing}
            onChange={setValues}
            onSubmit={(value) => save(value)}
            onClose={() => setDialog(false)}
            matches={duplicate ? duplicateMatches : []}
            onUseExisting={(id) => {
              setSelected(id);
              setDialog(false);
              setProfile(true);
              setDuplicate(false);
            }}
            onCreateAnyway={() => void save(values, true)}
          />
          {current && (
            <>
              <CustomerArchiveDialog
                open={action === "archive" || action === "restore"}
                name={current.name}
                restoring={action === "restore"}
                openLeads={current.openLeadCount}
                onClose={() => setAction(undefined)}
                onConfirm={async () => {
                  setRows(
                    rows.map((row) =>
                      row.id === current.id
                        ? { ...row, archived: action === "archive" }
                        : row,
                    ),
                  );
                  setAction(undefined);
                  setDrawer(false);
                  setNotice(c.changed);
                }}
              />
              <CustomerDeleteDialog
                open={action === "delete"}
                customerId={current.id}
                name={current.name}
                number={current.number}
                openLeads={current.openLeadCount}
                onClose={() => setAction(undefined)}
                onConfirm={async () => {
                  setRows(rows.filter((row) => row.id !== current.id));
                  setAction(undefined);
                  setDrawer(false);
                  setProfile(false);
                  setNotice(c.changed);
                }}
              />
              <LinkLeadDialog
                open={linking || !!unlinking}
                customerName={current.name}
                records={customerLinkedLeads.filter(
                  (record) => !leads.some((linked) => linked.id === record.id),
                )}
                unlinking={unlinking}
                onClose={() => {
                  setLinking(false);
                  setUnlinking(undefined);
                }}
                onConfirm={async (record) => {
                  const next = unlinking
                    ? leads.filter((lead) => lead.id !== record.id)
                    : [...leads, record];
                  setLinkedByCustomer({
                    ...linkedByCustomer,
                    [current.id]: next,
                  });
                  setRows(
                    rows.map((row) =>
                      row.id === current.id
                        ? { ...row, openLeadCount: next.length }
                        : row,
                    ),
                  );
                  setLinking(false);
                  setUnlinking(undefined);
                  setNotice(c.changed);
                }}
              />
            </>
          )}
          <CustomerExportDialog
            open={exporting}
            count={profile ? 1 : filtered.length}
            scope={profile && current ? current.number : c.filteredScope}
            canExport={capabilities.export}
            onClose={() => setExporting(false)}
            onExport={async () => {
              setExporting(false);
              setNotice(c.exportPreview);
            }}
          />
          <AssistantPanel
            open={assistant}
            onOpenChange={setAssistant}
            badge={c.assistantBadge}
            contextLabel={
              current ? `${current.name} (${current.number})` : undefined
            }
            messages={[
              {
                id: "customer-preview",
                role: "assistant",
                text: c.assistantText,
              },
            ]}
            onSend={async () => ({ ok: false, message: c.assistantMock })}
            renderMessageSupplement={() => (
              <CustomerDraftCard
                draft={proposal}
                disabled={!capabilities.update}
                onDecide={async (_draft, decision) =>
                  setProposal({
                    ...proposal,
                    state: decision === "confirm" ? "confirmed" : "canceled",
                  })
                }
              />
            )}
          />
        </>
      )}
      <Toast
        open={!!notice}
        kind="success"
        message={notice}
        autoHideMs={2000}
        onClose={() => setNotice("")}
      />
    </div>
  );
}

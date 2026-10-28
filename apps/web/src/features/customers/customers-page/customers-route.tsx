"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspaceAssistant } from "../../assistant/workspace-assistant/workspace-assistant";
import { useRouter } from "next/navigation";
import { Pagination, Toast, FormFeedback } from "@salesmora/ui";
import {
  customerQuerySchema,
  type CustomerQuery,
  type CustomerRecord,
  type CustomerListResult,
  type CustomerDetailResult,
  type CustomerValues,
  type CustomerLead,
  type CustomerMutation,
} from "@salesmora/contracts";
import { CustomersMetrics } from "../customers-metrics/customers-metrics";
import {
  CustomersToolbar,
  type CustomerFilters,
  defaultCustomerFilters,
} from "../customers-toolbar/customers-toolbar";
import { CustomerTable } from "../customer-table/customer-table";
import { CustomerDrawer } from "../customer-drawer/customer-drawer";
import { CustomerProfile } from "../customer-profile/customer-profile";
import { RelatedEstimates } from "../../estimates/related-estimates-card/related-estimates";
import { CustomerDialog } from "../customer-dialog/customer-dialog";
import { CustomerArchiveDialog } from "../customer-archive-dialog/customer-archive-dialog";
import { CustomerDeleteDialog } from "../customer-delete-dialog/customer-delete-dialog";
import { CustomerExportDialog } from "../customer-export-dialog/customer-export-dialog";
import { LinkLeadDialog } from "../link-lead-dialog/link-lead-dialog";
import { CustomersEmptyState } from "../customers-empty-state/customers-empty-state";
import type { CustomerRowAction } from "../customer-row-menu/customer-row-menu";
import type { CustomerDuplicateMatch } from "../duplicate-match-banner/duplicate-match-banner";
import type { LinkedCustomerRecord } from "../customer-preview.types";
import { customerButton, customerPrimary } from "../customer-ui";
import { customersRouteData as c } from "./customers-route.data";
const empty: CustomerValues = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  type: "person",
  ownerId: "",
  location: "",
  internalNotes: "",
};
const denied = {
  read: false,
  create: false,
  update: false,
  archive: false,
  delete: false,
  export: false,
  link: false,
  note: false,
};
function queryURL(query: CustomerQuery) {
  const p = new URLSearchParams({ workspace: query.workspaceId });
  for (const [key, value] of Object.entries(query))
    if (key !== "workspaceId") p.set(key, String(value));
  return p;
}
export function CustomersRoute({
  workspaceId,
  initial,
  initialQuery,
  initialDetail,
  initialTab,
}: {
  workspaceId: string;
  initial: CustomerListResult;
  initialQuery: CustomerQuery;
  initialDetail?: CustomerDetailResult;
  initialTab?: string;
}) {
  const router = useRouter();
  const setPageContext = useWorkspaceAssistant()?.setPageContext;
  const [list, setList] = useState(initial),
    [query, setQuery] = useState(initialQuery),
    [filters, setFilters] = useState<CustomerFilters>({
      search: query.q,
      relationship: query.relationship,
      owner: query.owner,
      type: query.type,
      sort: query.sort,
      archived: query.archived,
    }),
    [detail, setDetail] = useState(initialDetail),
    [selected, setSelected] = useState<string | undefined>(
      initialDetail?.customer.id,
    ),
    [drawer, setDrawer] = useState(false),
    [state, setState] = useState<"ready" | "loading" | "error" | "forbidden">(
      "ready",
    ),
    [detailState, setDetailState] = useState<
      "ready" | "loading" | "error" | "forbidden"
    >("ready"),
    [tick, setTick] = useState(0);
  // Accept new server DTOs after a shared assistant confirmation, preserving local tabs and filters.
  const [serverSnapshot, setServerSnapshot] = useState({
    initial,
    initialDetail,
  });
  if (
    serverSnapshot.initial !== initial ||
    serverSnapshot.initialDetail !== initialDetail
  ) {
    setServerSnapshot({ initial, initialDetail });
    setList(initial);
    if (initialDetail) {
      setDetail(initialDetail);
      setDetailState("ready");
    }
  }
  const profile = !!initialDetail;
  useEffect(() => {
    if (profile && detail) {
      setPageContext?.({
        key: `customer:${detail.customer.id}`,
        label: `${detail.customer.number} · ${detail.customer.name}`,
        recordRefs: [{ type: "customer", id: detail.customer.id }],
      });
    } else if (!profile) {
      const customerFilters = {
        q: query.q,
        relationship: query.relationship,
        owner: query.owner,
        type: query.type,
        sort: query.sort,
        archived: query.archived,
      };
      setPageContext?.({
        key: `customers:${JSON.stringify(customerFilters)}`,
        label: "Current customer filters",
        customerFilters,
      });
    } else setPageContext?.(undefined);
    return () => setPageContext?.(undefined);
  }, [setPageContext, profile, detail, query]);
  const [dialog, setDialog] = useState(false),
    [editing, setEditing] = useState(false),
    [values, setValues] = useState<CustomerValues>(empty),
    [matches, setMatches] = useState<CustomerDuplicateMatch[]>([]),
    [action, setAction] = useState<CustomerRowAction>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false),
    [exporting, setExporting] = useState(false),
    [linking, setLinking] = useState(false),
    [unlinking, setUnlinking] = useState<CustomerLead>(),
    [candidates, setCandidates] = useState<CustomerLead[]>([]),
    [linkQuery, setLinkQuery] = useState(""),
    [linkLoading, setLinkLoading] = useState(false),
    [notice, setNotice] = useState("");
  const attempt = useRef<
      { signature: string; body: Record<string, unknown> } | undefined
    >(undefined),
    mounted = useRef(false),
    serial = useRef(0);
  const [review, setReview] = useState<CustomerRecord>();
  const [leadsPage, setLeadsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1),
    [notesPage, setNotesPage] = useState(1);
  const hide = useCallback(() => {
    setState("forbidden");
    setDetailState("forbidden");
    setList((l) => ({
      ...l,
      rows: [],
      members: [],
      total: 0,
      totals: { customers: 0, withOpenLeads: 0 },
      capabilities: denied,
    }));
    setDetail(undefined);
    setReview(undefined);
    setValues(empty);
    setCandidates([]);
    setMatches([]);
    setDialog(false);
    setAction(undefined);
    setLinking(false);
    setUnlinking(undefined);
    setExporting(false);
    router.refresh();
  }, [router]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const run = ++serial.current;
      setState("loading");
      if (selected) setDetailState("loading");
      try {
        const response = await fetch(`/api/customers?${queryURL(query)}`, {
          cache: "no-store",
          signal,
        });
        if (response.status === 401 || response.status === 404) {
          hide();
          return;
        }
        if (!response.ok) throw Error();
        const result: CustomerListResult = await response.json();
        let record: CustomerDetailResult | undefined;
        if (selected) {
          const d = await fetch(
            `/api/customers/${selected}?workspace=${workspaceId}&activityPage=${activityPage}&notesPage=${notesPage}&leadsPage=${leadsPage}`,
            { cache: "no-store", signal },
          );
          if (d.status === 401 || d.status === 404) {
            if (run !== serial.current || signal?.aborted) return;
            hide();
            if (!profile) {
              setSelected(undefined);
              setTick((t) => t + 1);
            }
            return;
          } else {
            if (!d.ok) throw Error();
            record = await d.json();
          }
        }
        if (run !== serial.current || signal?.aborted) return;
        setList(result);
        setState("ready");
        if (record) {
          setDetail(record);
          setDetailState("ready");
        }
      } catch {
        if (signal?.aborted || run !== serial.current) return;
        setState("error");
        if (selected) setDetailState("error");
      }
    },
    [
      query,
      selected,
      workspaceId,
      activityPage,
      notesPage,
      leadsPage,
      hide,
      profile,
    ],
  );
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const abort = new AbortController();
    void load(abort.signal);
    return () => abort.abort();
  }, [load, tick]);
  useEffect(() => {
    const refresh = () => {
      if (document.activeElement?.closest("form") || dialog || busy) return;
      setTick((t) => t + 1);
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [dialog, busy]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = customerQuerySchema.parse({
        ...query,
        q: filters.search,
        relationship: filters.relationship === "lead" ? "lead" : "all",
        owner: filters.owner,
        type: filters.type,
        sort: filters.sort,
        archived: filters.archived,
      });
      if (JSON.stringify(next) !== JSON.stringify(query)) {
        next.page = 1;
        setQuery(next);
        if (!profile)
          window.history.replaceState(null, "", `/customers?${queryURL(next)}`);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, query, profile]);
  useEffect(() => {
    if (!linking || !selected) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setLinkLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/customers/${selected}/leads?workspace=${workspaceId}&q=${encodeURIComponent(linkQuery)}`,
          { signal: abort.signal, cache: "no-store" },
        );
        if (response.status === 401 || response.status === 404) {
          hide();
          return;
        }
        if (!response.ok) throw Error();
        setCandidates((await response.json()).records);
      } catch {
        if (!abort.signal.aborted) {
          setCandidates([]);
          setError(c.failure);
        }
      } finally {
        if (!abort.signal.aborted) setLinkLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [linking, selected, linkQuery, workspaceId, hide]);
  async function send(body: Record<string, unknown>, create = false) {
    if (busy) throw Error(c.saveFailure);
    setBusy(true);
    setError("");
    setConflict(false);
    const { expectedVersion: _, ...intent } = body;
    void _;
    const signature = JSON.stringify(intent);
    if (attempt.current?.signature !== signature)
      attempt.current = {
        signature,
        body: { ...body, submissionId: crypto.randomUUID() },
      };
    try {
      const response = await fetch(
        create ? "/api/customers" : `/api/customers/${body.customerId}`,
        {
          method: create
            ? "POST"
            : body.action === "delete"
              ? "DELETE"
              : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attempt.current.body),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          hide();
          throw Error(c.unavailable);
        }
        if (result.code === "duplicate") {
          setMatches(result.matches);
          return false;
        }
        setConflict(result.code === "conflict");
        throw Error(result.error || c.saveFailure);
      }
      attempt.current = undefined;
      setDialog(false);
      setAction(undefined);
      setReview(undefined);
      setLinking(false);
      setUnlinking(undefined);
      setMatches([]);
      setNotice(
        body.action === "delete" ? c.deleted : create ? c.saved : c.changed,
      );
      if (body.action === "delete") {
        setDrawer(false);
        router.push(`/customers?${queryURL(query)}`);
        router.refresh();
      } else await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : c.saveFailure);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const change = (next: CustomerRowAction) => {
    if (busy || state !== "ready" || detailState !== "ready") return;
    setError("");
    setConflict(false);
    attempt.current = undefined;
    if (next === "view") {
      setDrawer(true);
      return;
    }
    if (next === "edit" && detail) {
      setValues(detail.customer);
      setEditing(true);
      setDialog(true);
      setDrawer(false);
      setMatches([]);
      return;
    }
    setReview(detail?.customer);
    setAction(next);
  };
  const current = detail?.customer,
    caps =
      state === "forbidden"
        ? denied
        : (detail?.capabilities ?? list.capabilities);
  useEffect(() => {
    if (!profile)
      window.history.replaceState(
        window.history.state,
        "",
        `/customers?${queryURL(query)}`,
      );
  }, [profile, query]);
  const reviewed = review ?? current;
  const mutation = (
    action: CustomerMutation["action"],
    extra: Record<string, unknown> = {},
  ) => {
    if (!current) throw Error(c.unavailable);
    return send({
      workspaceId,
      customerId: current.id,
      expectedVersion:
        review && ["archive", "delete", "link"].includes(action)
          ? review.version
          : current.version,
      action,
      ...extra,
    }).then(() => {});
  };
  const openRecord = (id: string) =>
    router.push(`/leads/${id}?workspace=${encodeURIComponent(workspaceId)}`);
  const onRow = (id: string) => {
    setSelected(id);
    setDetail(undefined);
    setDetailState("loading");
    setActivityPage(1);
    setNotesPage(1);
    setLeadsPage(1);
    setDrawer(true);
  };
  const save = (value: CustomerValues, allowDuplicate = false) =>
    editing
      ? mutation("update", { values: value })
      : send({ workspaceId, values: value, allowDuplicate }, true).then(
          () => {},
        );
  const selectAction = async (id: string, next: CustomerRowAction) => {
    attempt.current = undefined;
    if (next === "view") {
      onRow(id);
      return;
    }
    try {
      setError("");
      const response = await fetch(
        `/api/customers/${id}?workspace=${workspaceId}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) hide();
        throw Error(c.unavailable);
      }
      const d: CustomerDetailResult = await response.json();
      setSelected(id);
      setDetail(d);
      setDetailState("ready");
      if (next === "edit") {
        attempt.current = undefined;
        setValues(d.customer);
        setEditing(true);
        setDialog(true);
        setMatches([]);
        setConflict(false);
      } else {
        setReview(d.customer);
        setAction(next);
      }
    } catch {
      setError(c.unavailable);
    }
  };
  const profileURL = (id: string, tab?: string) =>
    `/customers/${id}?${queryURL(query)}${tab ? `&tab=${tab}` : ""}`;
  return (
    <div className="grid min-w-0 gap-6">
      {profile ? (
        <>
          {detailState === "error" && detail && (
            <div className="grid gap-3">
              <FormFeedback kind="error" message={c.failure} />
              <button
                type="button"
                className={customerButton}
                onClick={() => setTick((t) => t + 1)}
              >
                {c.retry}
              </button>
            </div>
          )}
          <CustomerProfile
            relatedEstimates={current && detailState === "ready" && <RelatedEstimates key={`${workspaceId}:${current.id}:${current.version}`} workspaceId={workspaceId} recordType="customer" recordId={current.id} />}
            pending={busy || state === "loading" || detailState === "loading"}
            customer={current}
            members={detail?.members ?? []}
            capabilities={caps}
            leads={detail?.leads ?? []}
            events={detail?.events ?? []}
            notes={detail?.notes ?? []}
            leadsTotal={detail?.leadsTotal}
            activityTotal={detail?.activityTotal}
            notesTotal={detail?.notesTotal}
            leadsPage={leadsPage}
            activityPage={activityPage}
            notesPage={notesPage}
            onLeadsPageChange={setLeadsPage}
            onActivityPageChange={setActivityPage}
            onNotesPageChange={setNotesPage}
            state={
              detail && detailState !== "forbidden" ? "ready" : detailState
            }
            initialTab={
              ["overview", "leads", "activity", "notes"].includes(
                initialTab ?? "",
              )
                ? (initialTab as "overview" | "leads" | "activity" | "notes")
                : undefined
            }
            onBack={() => router.push(`/customers?${queryURL(query)}`)}
            onAction={change}
            onExport={() => setExporting(true)}
            onLink={() => {
              setReview(current);
              attempt.current = undefined;
              setCandidates([]);
              setLinking(true);
              setError("");
              setLinkQuery("");
            }}
            onUnlink={(record) => {
              setReview(current);
              attempt.current = undefined;
              setUnlinking(detail?.leads.find((l) => l.id === record.id));
              setError("");
            }}
            onOpenRecord={openRecord}
            onAddNote={async (body) => {
              await mutation("note", { body });
              setNotesPage(1);
            }}
            onRetry={() => setTick((t) => t + 1)}
          />
        </>
      ) : (
        <>
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
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
              {caps.export && (
                <button
                  type="button"
                  disabled={state !== "ready"}
                  className={customerButton}
                  onClick={() => {
                    setError("");
                    setExporting(true);
                  }}
                >
                  {c.export}
                </button>
              )}
              {caps.create && (
                <button
                  type="button"
                  className={customerPrimary}
                  disabled={state !== "ready"}
                  onClick={() => {
                    setEditing(false);
                    setValues(empty);
                    setMatches([]);
                    setError("");
                    setConflict(false);
                    attempt.current = undefined;
                    setDialog(true);
                  }}
                >
                  {c.add}
                </button>
              )}
            </div>
          </header>
          {state === "forbidden" ? (
            <FormFeedback kind="error" message={c.unavailable} />
          ) : (
            <>
              <CustomersMetrics
                totals={list.totals}
                state={
                  state === "ready"
                    ? "ready"
                    : state === "loading"
                      ? "loading"
                      : "error"
                }
                onRetry={() => setTick((t) => t + 1)}
              />
              <CustomersToolbar
                value={filters}
                members={list.members}
                count={list.total}
                canArchive={caps.archive}
                disabled={state !== "ready"}
                onChange={setFilters}
              />
              {state === "ready" && !list.total ? (
                <CustomersEmptyState
                  filtered={
                    !!query.q ||
                    query.relationship !== "all" ||
                    query.owner !== "all" ||
                    query.type !== "all"
                  }
                  onAdd={
                    caps.create
                      ? () => {
                          setEditing(false);
                          setValues(empty);
                          setMatches([]);
                          setDialog(true);
                        }
                      : undefined
                  }
                  onClear={() => setFilters(defaultCustomerFilters)}
                />
              ) : (
                <CustomerTable
                  rows={list.rows}
                  members={list.members}
                  capabilities={caps}
                  now={list.now}
                  state={
                    state === "ready"
                      ? "ready"
                      : state === "loading"
                        ? "loading"
                        : "error"
                  }
                  onOpen={(row) => onRow(row.id)}
                  onAction={(row, next) => void selectAction(row.id, next)}
                  onOpenLeads={(row) =>
                    router.push(profileURL(row.id, "leads"))
                  }
                  onRetry={() => setTick((t) => t + 1)}
                  sort={{
                    column: query.sort === "activity" ? "activity" : "name",
                    direction: query.sort === "name" ? "asc" : "desc",
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
                total={list.total}
                page={list.page}
                pageSize={query.pageSize}
                disabled={state !== "ready"}
                onPageChange={(page) => {
                  const next = { ...query, page };
                  setQuery(next);
                  window.history.replaceState(
                    null,
                    "",
                    `/customers?${queryURL(next)}`,
                  );
                }}
                onPageSizeChange={(pageSize) =>
                  setQuery({
                    ...query,
                    page: 1,
                    pageSize: pageSize as 25 | 50 | 100,
                  })
                }
              />
            </>
          )}
        </>
      )}
      {error && !dialog && !action && !linking && !unlinking && !exporting && (
        <FormFeedback kind="error" message={error} />
      )}
      <CustomerDrawer
        open={drawer}
        customer={current}
        members={detail?.members ?? []}
        capabilities={caps}
        leads={detail?.leads ?? []}
        events={detail?.events ?? []}
        state={detailState}
        onClose={() => setDrawer(false)}
        onProfile={() => current && router.push(profileURL(current.id))}
        onEdit={() => change("edit")}
        onOpenRecord={openRecord}
        onRetry={() => setTick((t) => t + 1)}
      />
      <CustomerDialog
        open={dialog}
        value={values}
        members={list.members}
        editing={editing}
        pending={busy}
        disabled={editing ? !caps.update : !caps.create}
        onChange={setValues}
        onSubmit={save}
        onClose={() => setDialog(false)}
        error={error}
        conflict={conflict}
        onReload={async () => {
          if (!current) return;
          try {
            const response = await fetch(
              `/api/customers/${current.id}?workspace=${workspaceId}`,
              { cache: "no-store" },
            );
            if (!response.ok) {
              if (response.status === 401 || response.status === 404) hide();
              throw Error(c.unavailable);
            }
            const next: CustomerDetailResult = await response.json();
            setDetail(next);
            setValues(next.customer);
            attempt.current = undefined;
            setConflict(false);
            setError("");
          } catch {
            setError(c.failure);
          }
        }}

        matches={matches}
        onUseExisting={(id) => router.push(profileURL(id))}
        onCreateAnyway={() => void save(values, true).catch(() => {})}
      />
      {current && (
        <>
          <CustomerArchiveDialog
            open={action === "archive" || action === "restore"}
            name={reviewed!.name}
            restoring={action === "restore"}
            openLeads={reviewed!.openLeadCount}
            pending={busy}
            error={error}
            onClose={() => {
              setAction(undefined);
              setReview(undefined);
            }}
            onConfirm={() =>
              mutation("archive", { archived: action === "archive" })
            }
          />
          <CustomerDeleteDialog
            open={action === "delete"}
            customerId={current.id}
            name={reviewed!.name}
            number={reviewed!.number}
            openLeads={reviewed!.openLeadCount}
            pending={busy}
            error={error}
            onClose={() => {
              setAction(undefined);
              setReview(undefined);
            }}
            onConfirm={(consent) =>
              mutation("delete", {
                typedConfirmation: consent.typedConfirmation,
                unlinkOpenLeads: consent.unlinkOpenLeads,
              })
            }
          />
          <LinkLeadDialog
            open={linking || !!unlinking}
            customerName={current.name}
            records={candidates.filter((l) => l.customerId !== current.id)}
            unlinking={unlinking}
            pending={busy}
            loading={linkLoading}
            error={error}
            onSearch={setLinkQuery}
            onClose={() => {
              setLinking(false);
              setUnlinking(undefined);
            }}
            onConfirm={(record: LinkedCustomerRecord, replace) => {
              const lead =
                unlinking ?? candidates.find((l) => l.id === record.id);
              if (!lead) throw Error(c.unavailable);
              return mutation("link", {
                leadId: lead.id,
                expectedLeadVersion: lead.version,
                expectedPreviousCustomerId: lead.customerId,
                replace,
                unlink: !!unlinking,
              });
            }}
          />
        </>
      )}
      <CustomerExportDialog
        open={exporting}
        count={profile ? 1 : list.total}
        scope={profile && current ? current.number : c.allScope}
        canExport={caps.export}
        pending={busy}
        error={error}
        onClose={() => setExporting(false)}
        onExport={async (columns) => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/customers/export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query,
                customerId: profile ? current?.id : undefined,
                columns,
                expectedCount: profile ? 1 : list.total,
              }),
            });
            if (!response.ok) {
              if (response.status === 401 || response.status === 404) hide();
              throw Error((await response.json()).error || c.exportChanged);
            }
            const blob = await response.blob(),
              url = URL.createObjectURL(blob),
              link = document.createElement("a");
            link.href = url;
            link.download = "customers.csv";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
            setExporting(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : c.exportChanged);
            throw e;
          } finally {
            setBusy(false);
          }
        }}
      />
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

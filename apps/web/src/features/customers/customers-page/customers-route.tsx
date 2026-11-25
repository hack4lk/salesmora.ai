"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspaceAssistant } from "../../assistant/workspace-assistant/workspace-assistant";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ApiQueryScopeBoundary } from "../../api/api-query-provider";
import { useApiQuery } from "../../api/use-api-query";
import { useApiMutation } from "../../api/use-api-mutation";
import { apiReadOptions, invalidateWorkspaceResources } from "../../api/api-read-options";
import { isApiAccessError } from "../../api/api-query";
import { ApiRequestError } from "../../api/api-request";
import { customerListResultSchema, customerDetailResultSchema, customerLeadCandidatesSchema, customerSavedResultSchema, customerDuplicateResultSchema } from "@salesmora/contracts";
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
export interface CustomersRouteProps {
  workspaceId: string;
  viewerId: string;
  initialUpdatedAt: number;
  initial: CustomerListResult;
  initialQuery: CustomerQuery;
  initialDetail?: CustomerDetailResult;
  initialTab?: string;
}
export function CustomersRoute(props: CustomersRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <CustomersContent key={`${props.viewerId}:${props.workspaceId}:${props.initialDetail?.customer.id ?? "list"}`} {...props} />
  </ApiQueryScopeBoundary>;
}
function CustomersContent({
  workspaceId,
  viewerId,
  initialUpdatedAt,
  initial,
  initialQuery,
  initialDetail,
  initialTab,
}: CustomersRouteProps) {
  const router = useRouter();
  const client = useQueryClient();
  const scope = { viewerId, workspaceId };
  const setPageContext = useWorkspaceAssistant()?.setPageContext;
  const [query, setQuery] = useState(initialQuery),
    [filters, setFilters] = useState<CustomerFilters>({
      search: query.q,
      relationship: query.relationship,
      owner: query.owner,
      type: query.type,
      sort: query.sort,
      archived: query.archived,
    }),
    [selected, setSelected] = useState<string | undefined>(
      initialDetail?.customer.id,
    ),
    [drawer, setDrawer] = useState(false);
  const [review, setReview] = useState<CustomerRecord>();
  const [blocked, setBlocked] = useState(false), [deleted, setDeleted] = useState(false);
  const [leadsPage, setLeadsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1), [notesPage, setNotesPage] = useState(1);
  const listOptions = apiReadOptions(
    scope, "customers", query, `/api/customers?${queryURL(query)}`,
    raw => customerListResultSchema.parse(raw), c.failure,
  );
  const detailOptions = apiReadOptions(
    scope, "customer-detail", { selected, activityPage, notesPage, leadsPage },
    `/api/customers/${selected}?workspace=${workspaceId}&activityPage=${activityPage}&notesPage=${notesPage}&leadsPage=${leadsPage}`,
    raw => customerDetailResultSchema.parse(raw), c.unavailable,
  );
  const listQuery = useApiQuery({
    ...listOptions,
    initialData: JSON.stringify(query) === JSON.stringify(initialQuery) ? initial : undefined,
    initialDataUpdatedAt: initialUpdatedAt,
  });
  const detailQuery = useApiQuery({
    ...detailOptions,
    enabled: !!selected && !deleted,
    initialData: selected === initialDetail?.customer.id && activityPage === 1 && notesPage === 1 && leadsPage === 1
      ? initialDetail : undefined,
    initialDataUpdatedAt: initialUpdatedAt,
  });
  const list = listQuery.data ?? initial;
  const detail = detailQuery.isError ? undefined : detailQuery.data;
  const forbidden = blocked || isApiAccessError(listQuery.error) || isApiAccessError(detailQuery.error);
  const state = forbidden ? "forbidden" : listQuery.isError ? "error" : listQuery.isPending ? "loading" : "ready";
  const detailState = forbidden ? "forbidden" : detailQuery.isError ? "error" : selected && detailQuery.isPending ? "loading" : "ready";
  const setDetail = (value: CustomerDetailResult | undefined) => {
    if (value) client.setQueryData(detailOptions.queryKey, value);
  };
  const profile = !!initialDetail;
  useEffect(() => {
    if (state !== "ready" || detailState !== "ready") { setPageContext?.(undefined); }
    else if (profile && detail) {
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
  }, [setPageContext, profile, detail, query, state, detailState]);
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
    serial = useRef(0);
  const writeMutation = useApiMutation("customers", raw => customerSavedResultSchema.parse(raw), c.saveFailure);
  const hide = useCallback(() => {
    setBlocked(true);
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
  }, [router, setBlocked, setReview, setValues, setCandidates, setMatches, setDialog, setAction, setLinking, setUnlinking, setExporting]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const run = ++serial.current;
      try {
        await invalidateWorkspaceResources(client, workspaceId, ["customers", "customer-detail", "customer-candidates", "leads", "home", "jobs", "calendar", "reports"]);
        setBlocked(false);
        return true;
      } catch (error) {
        if (signal?.aborted || run !== serial.current) return;
        if (isApiAccessError(error)) hide();
        setError(c.failure);
        return false;
      }
    },
    [client, workspaceId, hide, setBlocked],
  );
  const setTick = useCallback(() => { void load(); }, [load]);
  useEffect(() => {
    const refresh = () => {
      if (document.activeElement?.closest("form") || dialog || busy) return;
      setTick();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [dialog, busy, setTick]);
  useEffect(() => {
    if (forbidden) router.refresh();
  }, [forbidden, router]);
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
        const result = await client.fetchQuery(apiReadOptions({ viewerId, workspaceId }, "customer-candidates", { selected, q: linkQuery },
          `/api/customers/${selected}/leads?workspace=${workspaceId}&q=${encodeURIComponent(linkQuery)}`, raw => customerLeadCandidatesSchema.parse(raw), c.failure));
        if (!abort.signal.aborted) setCandidates(result.records);
      } catch (error) {
        if (!abort.signal.aborted) {
          if (isApiAccessError(error)) hide();
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
  }, [linking, selected, linkQuery, workspaceId, viewerId, hide, client]);
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
      await writeMutation.mutateAsync({
        path: create ? "/api/customers" : `/api/customers/${body.customerId}`,
        method: create ? "POST" : body.action === "delete" ? "DELETE" : "PATCH",
        body: attempt.current.body,
      });
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
        setDeleted(true);
        const resourceKey = detailOptions.queryKey.slice(0, 5);
        await client.cancelQueries({ queryKey: resourceKey });
        client.removeQueries({ queryKey: resourceKey, predicate: query => {
          const filters = query.queryKey[6];
          return typeof filters === "object" && filters !== null && "selected" in filters && filters.selected === body.customerId;
        } });
        if (!(await load())) setError(c.savedReload);
        setDrawer(false);
        router.push(`/customers?${queryURL(query)}`);
        router.refresh();
      } else if (!(await load())) setError(c.savedReload);
      return true;
    } catch (e) {
      if (isApiAccessError(e)) hide();
      if (e instanceof ApiRequestError) {
        const duplicate = customerDuplicateResultSchema.safeParse(e.details);
        if (duplicate.success) { setMatches(duplicate.data.matches); return false; }
        setConflict(typeof e.details === "object" && e.details !== null && "code" in e.details && e.details.code === "conflict");
      }
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
      state !== "ready" || detailState !== "ready"
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
      const d = await client.fetchQuery({ ...apiReadOptions(scope, "customer-detail", { selected: id, activityPage: 1, notesPage: 1, leadsPage: 1 },
        `/api/customers/${id}?workspace=${workspaceId}`, raw => customerDetailResultSchema.parse(raw), c.unavailable), staleTime: 0 });
      setSelected(id);
      setActivityPage(1); setNotesPage(1); setLeadsPage(1);
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
    } catch (error) {
      if (isApiAccessError(error)) hide();
      setError(c.unavailable);
    }
  };
  const profileURL = (id: string, tab?: string) =>
    `/customers/${id}?${queryURL(query)}${tab ? `&tab=${tab}` : ""}`;
  if (forbidden) return <FormFeedback kind="error" message={c.unavailable}/>;
  if (deleted) return <FormFeedback kind="success" message={c.deleted}/>;
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
                onClick={setTick}
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
            onRetry={setTick}
          />
        </>
      ) : (
        <>
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="m-0 text-heading font-semibold text-ink">
                {c.title}
              </h1>
              <p className="mb-0 mt-3 text-base leading-6 text-muted">
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
                jobsAvailable={list.totals.withActiveJobs !== undefined}
                state={
                  state === "ready"
                    ? "ready"
                    : state === "loading"
                      ? "loading"
                      : "error"
                }
                onRetry={setTick}
              />
              <CustomersToolbar
                value={filters}
                members={list.members}
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
                  onRetry={setTick}
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
        onRetry={setTick}
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
            await client.invalidateQueries({ queryKey: detailOptions.queryKey, refetchType: "none" });
            const next = await client.fetchQuery(detailOptions);
            setDetail(next);
            setValues(next.customer);
            attempt.current = undefined;
            setConflict(false);
            setError("");
          } catch (error) {
            if (isApiAccessError(error)) hide();
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

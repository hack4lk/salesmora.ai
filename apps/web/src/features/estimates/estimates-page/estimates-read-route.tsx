"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  estimateListQueryFromURL,
  estimateListQuerySchema,
  estimateListQueryToURL,
  estimateChatFilterSchema,
  estimateIdSchema,
  estimateExportColumns,
  estimateExportPreviewSchema,
  type EstimateExportColumn,
  type EstimateExportPreview,
  type EstimateRevisionFamily,
  type EstimateListQuery,
  type EstimateListResult,
} from "@salesmora/contracts";
import { FormFeedback, Pagination } from "@salesmora/ui";
import type { EstimateDraftSaveResult } from "@salesmora/data";
import type { EstimateCapabilities } from "../estimate-preview.types";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import { EstimateExportDialog } from "../estimate-export-dialog/estimate-export-dialog";
import { EstimatesEmptyState } from "../estimates-empty-state/estimates-empty-state";
import {
  EstimatesMetrics,
  type EstimateQuickFilter,
} from "../estimates-metrics/estimates-metrics";
import { EstimatesTable } from "../estimates-table/estimates-table";
import {
  EstimatesToolbar,
  defaultEstimateFilters,
  type EstimateFilters,
} from "../estimates-toolbar/estimates-toolbar";
import {
  estimateFiltersFromQuery,
  estimateMembersFromResult,
  estimateMetricsFromResult,
  estimateRowsFromResult,
  estimateSortColumnFromTable,
  estimateSortFromQuery,
} from "./estimates-read-route.data";
import { estimatesPageData as copy } from "./estimates-page.data";
import { EstimateVoidReview } from "../estimate-void-dialog/estimate-void-review";
import type { EstimateVoidRecord } from "../estimate-void-dialog/estimate-void-dialog.preview";
import { estimateLifecycleData } from "../estimate-lifecycle-client";
import { EstimateArchiveReview } from "../estimate-archive-dialog/estimate-archive-review";
import type { EstimateArchiveMode, EstimateArchiveRecord } from "../estimate-archive-dialog/estimate-archive-dialog.preview";
import { estimateArchiveDialogData as archiveCopy } from "../estimate-archive-dialog/estimate-archive-dialog.data";
import { EstimateDeleteDraftReview } from "../estimate-delete-draft-dialog/estimate-delete-draft-review";
import type { EstimateDeleteDraftRecord } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.preview";
import { estimateDeleteDraftDialogData as deleteCopy } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.data";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";
import type { EstimateRow } from "../estimate-preview.types";
import { useWorkspaceAssistant } from "../../assistant/workspace-assistant/workspace-assistant";

const readOnlyCapabilities: EstimateCapabilities = {
  read: true,
  create: false,
  update: false,
  send: false,
  decide: false,
  void: false,
  archive: false,
  delete: false,
  export: false,
};

export function EstimatesReadRoute({
  workspaceId,
  viewerId,
  initialQuery,
  canReadLeads,
  canReadJobs,
}: {
  workspaceId: string;
  viewerId: string;
  initialQuery: EstimateListQuery;
  canReadLeads: boolean;
  canReadJobs: boolean;
}) {
  const router = useRouter();
  const workspaceAssistant = useWorkspaceAssistant();
  const setAssistantPageContext = workspaceAssistant?.setPageContext;
  const searchParams = useSearchParams();
  const rawParams = searchParams.toString();
  const exportLaunchRequested = searchParams.get("export") === "review";
  const query = useMemo(
    () =>
      estimateListQueryFromURL(
        workspaceId,
        new URLSearchParams(rawParams),
      ),
    [rawParams, workspaceId],
  );
  useEffect(() => {
    if (!setAssistantPageContext) return;
    const estimateFilters = estimateChatFilterSchema.parse({
      query: query.q,
      status: query.status,
      owner: query.owner,
      parent: query.parent,
      customer: null,
      minTotalCents: null,
      maxTotalCents: null,
      validUntilFrom: null,
      validUntilTo: null,
      includeHidden: query.includeHidden,
      quickFilter: query.quickFilter,
      limit: 10,
    });
    setAssistantPageContext({
      key: `estimates:${workspaceId}:${JSON.stringify(estimateFilters)}`,
      label: "Estimates list",
      estimateFilters,
    });
  }, [query, workspaceId, setAssistantPageContext]);
  const [draft, setDraft] = useState(() => ({
    rawParams,
    filters: estimateFiltersFromQuery(initialQuery),
  }));
  const filters =
    draft.rawParams === rawParams
      ? draft.filters
      : estimateFiltersFromQuery(query);
  const [request, setRequest] = useState<{
    key: string;
    state: "loading" | "ready" | "error";
    result?: EstimateListResult;
  }>({ key: "", state: "loading" });
  const [retry, setRetry] = useState(0);
  const [voidRecord, setVoidRecord] = useState<EstimateVoidRecord | null>(null);
  const [archiveReview, setArchiveReview] = useState<{ estimate: EstimateArchiveRecord; mode: EstimateArchiveMode } | null>(null);
  const [notice, setNotice] = useState("");
  const [deleteRecord, setDeleteRecord] = useState<EstimateDeleteDraftRecord | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionBlocked, setActionBlocked] = useState(false);
  const [actionError, setActionError] = useState("");
  const [exportReview, setExportReview] = useState<{
    query: EstimateListQuery;
    preview: EstimateExportPreview;
  } | null>(null);
  const [exportPending, setExportPending] = useState(false);
  const [exportError, setExportError] = useState("");
  const inFlight = useRef(false);
  const exportInFlight = useRef(false);
  const handledExportLaunch = useRef("");
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const [navigating, startTransition] = useTransition();
  const requestUrl = estimateListQueryToURL(query);
  const requestKey = `${requestUrl}:${retry}`;
  const state =
    request.key === requestKey ? request.state : "loading";
  const result = state === "ready" ? request.result : undefined;

  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/estimates?${requestUrl}`, {
      cache: "no-store",
      signal: abort.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return undefined;
        }
        if (!response.ok) throw new Error("Estimates list request failed.");
        return (await response.json()) as EstimateListResult;
      })
      .then((body) => {
        if (!body || abort.signal.aborted) return;
        setRequest({ key: requestKey, state: "ready", result: body });
      })
      .catch(() => {
        if (!abort.signal.aborted) {
          setRequest({ key: requestKey, state: "error" });
        }
      });
    return () => abort.abort();
  }, [requestKey, requestUrl, router]);

  useEffect(() => {
    if (result?.scope !== "assigned_job") return;
    const refresh = () => {
      if (document.visibilityState === "visible") setRetry((value) => value + 1);
    };
    const timer = setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [result?.scope]);

  const navigate = useCallback(
    (next: EstimateListQuery, replace = false) => {
      const href = `/estimates?${estimateListQueryToURL(next)}`;
      startTransition(() => {
        if (replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router],
  );
  useEffect(() => {
    if (!result) return;
    const lastPage = Math.max(1, Math.ceil(result.total / query.pageSize));
    if (query.page > lastPage) navigate({ ...query, page: lastPage }, true);
  }, [navigate, query, result]);

  function changeFilters(next: EstimateFilters) {
    setDraft({ rawParams, filters: next });
    const nonSearchChanged =
      next.status !== filters.status ||
      next.owner !== filters.owner ||
      next.related !== filters.related ||
      next.includeHidden !== filters.includeHidden;
    if (nonSearchChanged) {
      navigate(
        {
          ...query,
          q: next.search,
          status: next.status,
          owner: next.owner,
          parent: next.related,
          includeHidden: next.includeHidden,
          page: 1,
        },
      );
    }
  }

  useEffect(() => {
    if (filters.search === query.q) return;
    const timer = setTimeout(
      () => navigate({ ...query, q: filters.search, page: 1 }, true),
      250,
    );
    return () => clearTimeout(timer);
  }, [filters.search, navigate, query]);

  function clearFilters() {
    setDraft({ rawParams, filters: defaultEstimateFilters });
    navigate({
      ...query,
      q: "",
      status: "all",
      owner: "all",
      parent: "all",
      includeHidden: false,
      quickFilter: null,
      page: 1,
    });
  }

  const quickFilter: EstimateQuickFilter = query.quickFilter;
  const activeFilters =
    !!query.q ||
    query.status !== "all" ||
    query.owner !== "all" ||
    query.parent !== "all" ||
    query.includeHidden ||
    query.quickFilter !== null;
  const displayState = navigating ? "loading" : state;
  const rows =
    displayState === "ready" && result ? estimateRowsFromResult(result) : [];
  const members = estimateMembersFromResult(result);
  const tableSort = estimateSortFromQuery(query);
  const metrics = displayState === "ready" ? estimateMetricsFromResult(result) : undefined;
  const createHref = `/estimates/new?workspace=${encodeURIComponent(workspaceId)}`;

  function openRelated(row: (typeof rows)[number]) {
    const href =
      row.parentType === "lead"
        ? `/leads/${encodeURIComponent(row.parentId)}?workspace=${encodeURIComponent(workspaceId)}`
        : `/jobs/${encodeURIComponent(row.parentId)}?workspace=${encodeURIComponent(workspaceId)}`;
    router.push(href);
  }

  function changePageSize(pageSize: number) {
    const parsed = estimateListQuerySchema.shape.pageSize.safeParse(pageSize);
    if (parsed.success) {
      navigate({ ...query, page: 1, pageSize: parsed.data });
    }
  }

  const openExportReview = useCallback(
    async (showUnavailableNotice = false) => {
      if (
        exportInFlight.current ||
        !result?.canExport ||
        displayState !== "ready" ||
        filters.search !== query.q
      ) {
        if (showUnavailableNotice && !exportInFlight.current) {
          await Promise.resolve();
          setNotice(copy.exportFailure);
        }
        return;
      }

      exportInFlight.current = true;
      setExportPending(true);
      setExportError("");
      const exportQuery = { ...query, page: 1 };
      const payload = {
        query: exportQuery,
        columns: [...estimateExportColumns],
      };
      try {
        const response = await fetch(
          `/api/estimates/export?workspace=${encodeURIComponent(workspaceId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
          },
        );
        if (!response.ok) {
          if ([401, 404].includes(response.status)) {
            setRetry((value) => value + 1);
          }
          throw new Error(copy.exportFailure);
        }
        const parsed = estimateExportPreviewSchema.safeParse(
          await response.json(),
        );
        if (!parsed.success) throw new Error(copy.exportFailure);
        setExportReview({ query: exportQuery, preview: parsed.data });
      } catch {
        setNotice(copy.exportFailure);
      } finally {
        exportInFlight.current = false;
        setExportPending(false);
      }
    },
    [displayState, filters.search, query, result?.canExport, workspaceId],
  );

  useEffect(() => {
    if (!exportLaunchRequested) {
      handledExportLaunch.current = "";
      return;
    }
    if (handledExportLaunch.current === rawParams || displayState === "loading") {
      return;
    }
    handledExportLaunch.current = rawParams;
    router.replace(`/estimates?${estimateListQueryToURL(query)}`, { scroll: false });
    void openExportReview(true);
  }, [
    displayState,
    exportLaunchRequested,
    openExportReview,
    query,
    rawParams,
    router,
  ]);

  async function downloadExport(columns: readonly EstimateExportColumn[]) {
    if (!exportReview || exportInFlight.current) return;
    exportInFlight.current = true;
    setExportPending(true);
    setExportError("");
    try {
      const payload = { query: exportReview.query, columns: [...columns] };
      const params = new URLSearchParams({
        workspace: workspaceId,
        request: JSON.stringify(payload),
      });
      const response = await fetch(`/api/estimates/export?${params}`, {
        headers: { "X-SalesMora-Export": "1" },
        cache: "no-store",
      });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("text/csv")) {
        if ([401, 404].includes(response.status)) setRetry((value) => value + 1);
        const body = await response.json().catch(() => null);
        setExportError(
          response.status === 422 && typeof body?.error === "string"
            ? body.error
            : copy.exportFailure,
        );
        return;
      }
      const exportedCount = Number(response.headers.get("X-Export-Count"));
      if (
        !Number.isSafeInteger(exportedCount) ||
        exportedCount !== exportReview.preview.count
      ) {
        await response.body?.cancel();
        setExportError(copy.exportChanged);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `salesmora-estimates-${new Date().toISOString().slice(0, 10)}.csv`;
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportReview(null);
      setNotice(copy.exportDownloaded(exportedCount));
    } catch {
      setExportError(copy.exportFailure);
    } finally {
      exportInFlight.current = false;
      setExportPending(false);
    }
  }

  async function createFromRow(row: EstimateRow, action: "duplicate" | "revise") {
    if (inFlight.current || actionBlocked) return;
    inFlight.current = true;
    setActionPending(true);
    setActionError("");
    setNotice("");
    const fallback = action === "duplicate" ? copy.actions.duplicateError : copy.actions.reviseError;
    const workspaceQuery = `?workspace=${encodeURIComponent(workspaceId)}`;
    const baseUrl = `/api/estimates/${encodeURIComponent(row.id)}`;
    try {
      let snapshotHash: string | undefined;
      if (action === "revise") {
        const family = await estimateLifecycleRequest<EstimateRevisionFamily>(
          `${baseUrl}/revisions${workspaceQuery}`, fallback,
        );
        if (family.currentEstimateId !== row.id || family.version !== row.version || !family.snapshotHash) {
          throw new EstimateLifecycleRequestError(copy.actions.changed, 409);
        }
        if (!family.canRevise) throw new EstimateLifecycleRequestError(copy.actions.changed, 403);
        snapshotHash = family.snapshotHash;
      }
      const payload = { workspaceId, estimateId: row.id, expectedVersion: row.version,
        ...(snapshotHash ? { snapshotHash } : {}) };
      const fingerprint = JSON.stringify({ action, ...payload });
      if (submission.current?.payload !== fingerprint) submission.current = { payload: fingerprint, id: crypto.randomUUID() };
      const receipt = await estimateLifecycleRequest<EstimateDraftSaveResult>(
        `${baseUrl}/${action}${workspaceQuery}`, fallback,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.id }) },
      );
      if (!estimateIdSchema.safeParse(receipt.id).success || receipt.id === row.id ||
          !Number.isSafeInteger(receipt.version) || receipt.version < 1 ||
          (action === "revise" ? receipt.number !== row.number || receipt.revision <= row.revision
            : receipt.revision !== 1 || receipt.number === row.number)) {
        throw new EstimateLifecycleRequestError(copy.actions.mismatch, 409);
      }
      router.push(`/estimates/${encodeURIComponent(receipt.id)}${workspaceQuery}`);
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setActionError(caught instanceof Error ? caught.message : fallback);
      if (status === 401 || status === 403 || status === 404 || status === 409) setActionBlocked(true);
      if (status === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
      setActionPending(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-6">
      {notice && <p role="status" className="m-0 text-sm leading-6">{notice}</p>}
      {actionPending && <p role="status" className="m-0 text-sm leading-6">{copy.actions.preparing}</p>}
      {actionError && <div className="grid justify-items-start gap-3">
        <FormFeedback kind="error" message={actionError} />
        <button type="button" className={estimateButton} disabled={actionPending} onClick={() => {
          submission.current = null;
          setActionError("");
          setActionBlocked(false);
          setRetry(value => value + 1);
        }}>{copy.actions.reload}</button>
      </div>}
      {displayState === "ready" && result && (result.canCreate || result.canExport) && (
        <div className="flex justify-end gap-3">
          {result.canExport && (
            <button
              type="button"
              className={estimateButton}
              disabled={
                exportPending ||
                actionPending ||
                actionBlocked ||
                filters.search !== query.q
              }
              onClick={() => void openExportReview()}
            >
              {copy.export}
            </button>
          )}
          {result.canCreate && (
          <button
            type="button"
            className={estimatePrimary}
            onClick={() => router.push(createHref)}
          >
            {copy.create}
          </button>
          )}
        </div>
      )}
      <EstimatesMetrics
        totals={metrics}
        state={displayState}
        quickFilter={quickFilter}
        onQuickFilterChange={(value) =>
          navigate({ ...query, quickFilter: value, page: 1 })
        }
        onRetry={() => setRetry((value) => value + 1)}
      />
      <EstimatesToolbar
        value={filters}
        members={members}
        currentMemberId={viewerId}
        shownCount={displayState === "ready" ? result?.total : undefined}
        totalCount={displayState === "ready" ? result?.scopeTotal : undefined}
        disabled={displayState !== "ready"}
        onChange={changeFilters}
      />
      {quickFilter && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 text-sm font-semibold text-ink">
            {quickFilter === "awaiting"
              ? copy.quickFilters.awaiting
              : copy.quickFilters.expiring}
          </p>
          <button
            type="button"
            className={estimateButton}
            disabled={displayState !== "ready"}
            onClick={() => navigate({ ...query, quickFilter: null, page: 1 })}
          >
            {copy.clearQuickFilter}
          </button>
        </div>
      )}
      {displayState === "ready" && result?.total === 0 ? (
        <EstimatesEmptyState
          filtered={activeFilters}
          onAdd={!activeFilters && result?.canCreate ? () => router.push(createHref) : undefined}
          onClear={activeFilters ? clearFilters : undefined}
        />
      ) : (
        <EstimatesTable
          rows={rows}
          members={members}
          capabilities={{ ...readOnlyCapabilities, void: result?.canVoid ?? false, archive: result?.canArchive ?? false }}
          state={displayState}
          pending={actionPending || actionBlocked || !!deleteRecord || !!voidRecord || !!archiveReview}
          onRetry={() => setRetry((value) => value + 1)}
          onOpen={(row) =>
            router.push(`/estimates/${encodeURIComponent(row.id)}?workspace=${encodeURIComponent(workspaceId)}`)
          }
          onAction={(row, action) => {
            if (inFlight.current || actionBlocked) return;
            if (action === "open") router.push(`/estimates/${encodeURIComponent(row.id)}?workspace=${encodeURIComponent(workspaceId)}`);
            if (action === "duplicate" || action === "revise") { void createFromRow(row, action); return; }
            if (action === "delete-draft") {
              setNotice("");
              setDeleteRecord({ ...row, recipientName: "", sharing: "unavailable" });
            }
            if (action === "void") {
              setNotice("");
              setVoidRecord({ ...row, recipientName: row.customerName });
            }
            if (action === "archive" || action === "restore") {
              setNotice("");
              setArchiveReview({ estimate: { ...row, recipientName: row.customerName }, mode: action });
            }
          }}
          onOpenRelated={canReadJobs || canReadLeads ? openRelated : undefined}
          canOpenRelated={(row) =>
            row.parentType === "lead" ? canReadLeads : canReadJobs
          }
          sort={tableSort}
          onSort={(column, direction) => {
            const sort = estimateSortColumnFromTable(column);
            if (sort) navigate({ ...query, sort, direction, page: 1 });
          }}
        />
      )}
      {displayState === "ready" && result && result.total > 0 && (
        <Pagination
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          onPageChange={(page) => navigate({ ...query, page })}
          onPageSizeChange={changePageSize}
        />
      )}
      {voidRecord && <EstimateVoidReview workspaceId={workspaceId} estimate={voidRecord}
        onClose={() => setVoidRecord(null)} onVoided={() => {
          setVoidRecord(null);
          setNotice(estimateLifecycleData.voided);
          setRetry(value => value + 1);
        }} />}
      {archiveReview && <EstimateArchiveReview workspaceId={workspaceId} {...archiveReview}
        onClose={() => setArchiveReview(null)} onArchived={receipt => {
          setArchiveReview(null);
          setNotice(receipt.archived ? archiveCopy.live.archived : archiveCopy.live.restored);
          setRetry(value => value + 1);
        }} />}
      {deleteRecord && <EstimateDeleteDraftReview workspaceId={workspaceId} estimate={deleteRecord}
        onClose={() => setDeleteRecord(null)} onDeleted={() => {
          setDeleteRecord(null);
          setNotice(deleteCopy.live.deleted);
          setRetry(value => value + 1);
        }} />}
      <EstimateExportDialog
        open={exportReview !== null}
        count={exportReview?.preview.count ?? 0}
        rowLimit={exportReview?.preview.rowLimit}
        scope={
          exportReview
            ? copy.exportScope(activeFilters ? ["Current filters"] : [])
            : ""
        }
        canExport={result?.canExport ?? false}
        pending={exportPending}
        error={exportError}
        onClose={() => {
          setExportReview(null);
          setExportError("");
        }}
        onExport={downloadExport}
      />
    </div>
  );
}

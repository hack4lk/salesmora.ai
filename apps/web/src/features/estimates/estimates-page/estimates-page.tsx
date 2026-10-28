"use client";
import { useEffect, useId, useState } from "react";
import { AssistantPanel, FormFeedback, Pagination, WorkspaceNavigation } from "@salesmora/ui";
import type { WorkspaceNavigationPage } from "@salesmora/ui";
import { NotificationMenu } from "../../notifications/notification-menu/notification-menu";
import {
  estimateAssignedJobIds,
  estimateCapabilitiesByRole,
  estimateFixtures,
  estimateManyFixtures,
  estimatePreviewData as preview,
} from "../estimate-preview.data";
import type { EstimateRole, EstimateRow } from "../estimate-preview.types";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import { EstimateExportDialog } from "../estimate-export-dialog/estimate-export-dialog";
import { estimateRowMenuData } from "../estimate-row-menu/estimate-row-menu.data";
import type { EstimateRowAction } from "../estimate-row-menu/estimate-row-menu";
import { EstimatesEmptyState } from "../estimates-empty-state/estimates-empty-state";
import { EstimatesMetrics, type EstimateQuickFilter } from "../estimates-metrics/estimates-metrics";
import { EstimatesTable } from "../estimates-table/estimates-table";
import { EstimatesToolbar, defaultEstimateFilters, type EstimateFilters } from "../estimates-toolbar/estimates-toolbar";
import { estimatesToolbarData } from "../estimates-toolbar/estimates-toolbar.data";
import { estimatesPageData as c } from "./estimates-page.data";
import {
  estimatePreviewTotals,
  filterEstimatePreviewRows,
  isEstimateSortColumn,
  scopeEstimatePreviewRows,
  sortEstimatePreviewRows,
  type EstimateListSort,
} from "./estimates-page.preview";

export type EstimatesPagePreviewProps = {
  role?: EstimateRole;
  empty?: boolean;
  many?: boolean;
  state?: "ready" | "loading" | "error" | "forbidden";
  initialFilters?: Partial<EstimateFilters>;
  initialQuickFilter?: EstimateQuickFilter;
  initialOverlay?: "assistant";
};

/** Storybook-only controller: no fetches, navigation, writes, downloads or AI calls. */
export function EstimatesPagePreview({
  role = "owner",
  empty = false,
  many = false,
  state: initialState = "ready",
  initialFilters,
  initialQuickFilter = null,
  initialOverlay,
}: EstimatesPagePreviewProps) {
  const id = useId();
  const contentId = `${id}-main`;
  const capabilities = estimateCapabilitiesByRole[role];
  const [state, setState] = useState(initialState);
  const [filters, setFilters] = useState<EstimateFilters>({
    ...defaultEstimateFilters,
    ...initialFilters,
  });
  const [query, setQuery] = useState(filters.search);
  const [quickFilter, setQuickFilter] = useState(initialQuickFilter);
  const [sort, setSort] = useState<EstimateListSort>({ column: "updatedAt", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [notice, setNotice] = useState("");
  const [assistant, setAssistant] = useState(initialOverlay === "assistant");
  const [exportReview, setExportReview] = useState<{ count: number; scope: string } | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(filters.search), 250);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const field = role === "field";
  const currentMember = preview.members[field ? 1 : 0];
  const rows = empty ? [] : many ? estimateManyFixtures : estimateFixtures;
  const scoped = state === "forbidden"
    ? []
    : scopeEstimatePreviewRows(rows, role, estimateAssignedJobIds);
  const appliedFilters = { ...filters, search: query };
  const filtered = filterEstimatePreviewRows(scoped, appliedFilters, quickFilter, preview.today, currentMember.id);
  const sorted = sortEstimatePreviewRows(filtered, sort);
  const safePage = Math.min(page, Math.max(1, Math.ceil(sorted.length / pageSize)));
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const ready = state === "ready";
  const pages: WorkspaceNavigationPage[] = field
    ? ["home", "jobs", "calendar", "estimates", "work-orders", "settings"]
    : ["home", "leads", "customers", "jobs", "calendar", "estimates", "work-orders", "materials", "settings"];

  function changeFilters(next: EstimateFilters) {
    setFilters(next);
    setPage(1);
  }
  function clearFilters() {
    setFilters(defaultEstimateFilters);
    setQuery("");
    setQuickFilter(null);
    setPage(1);
  }
  function rowAction(row: EstimateRow, action: EstimateRowAction) {
    setNotice(c.previewAction(estimateRowMenuData.actions[action], row.number));
  }
  function openExport() {
    const labels: string[] = [];
    if (query.trim()) labels.push(estimatesToolbarData.searchFilter(query.trim()));
    if (filters.status !== "all") labels.push(estimatesToolbarData.statuses[filters.status]);
    if (filters.owner !== "all") labels.push(
      filters.owner === "me" ? estimatesToolbarData.me :
        filters.owner === "unassigned" ? estimatesToolbarData.unassigned :
          preview.members.find((member) => member.id === filters.owner)?.name ?? filters.owner,
    );
    if (filters.related !== "all") labels.push(estimatesToolbarData.relatedOptions[filters.related]);
    if (filters.includeHidden) labels.push(estimatesToolbarData.includeHidden);
    if (quickFilter) labels.push(c.quickFilters[quickFilter]);
    setExportReview({ count: filtered.length, scope: c.exportScope(labels) });
  }

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <WorkspaceNavigation
        workspaceName={c.workspace}
        user={{ name: currentMember.name, email: field ? c.fieldEmail : c.userEmail, role }}
        currentPage="estimates"
        contentId={contentId}
        availablePages={pages}
        authorizedPages={state === "forbidden" ? pages.filter((entry) => entry !== "estimates") : pages}
        onNavigate={() => setNotice(c.navigationPreview)}
        onAccountSettings={() => setNotice(c.navigationPreview)}
        onSignOut={() => setNotice(c.navigationPreview)}
      />
      <main id={contentId} tabIndex={-1} className="min-w-0 flex-1 px-6 py-8 pb-28 focus-visible:focus-ring sm:px-10 md:py-10 md:pb-28">
        <div className="mx-auto grid w-full min-w-0 gap-6">
          <div className="flex justify-end">
            <NotificationMenu
              workspaceName={c.workspace}
              unreadCount={0}
              items={[]}
              state="ready"
              preferencesHref={`#${contentId}`}
              onOpen={() => undefined}
              onRetry={() => undefined}
              onMarkRead={() => undefined}
              onLoadMore={() => undefined}
            />
          </div>
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{c.title}</h1>
              <p className="mb-0 mt-3 max-w-reading text-base leading-6 text-muted">{field ? c.fieldDescription : c.description}</p>
            </div>
            {state !== "forbidden" && (
              <div className="flex flex-wrap gap-3">
                {capabilities.export && (
                  <button type="button" className={estimateButton} disabled={!ready} onClick={openExport}>{c.export}</button>
                )}
                {capabilities.create && (
                  <button type="button" className={estimatePrimary} disabled={!ready} onClick={() => setNotice(c.createPreview)}>{c.create}</button>
                )}
              </div>
            )}
          </header>
          <p className="m-0 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-dark">{c.preview}</p>
          {notice && <p role="status" className="m-0 rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink">{notice}</p>}
          {state === "forbidden" ? <FormFeedback kind="error" message={c.forbidden} /> : (
            <>
              <EstimatesMetrics
                totals={ready ? estimatePreviewTotals(scoped, preview.today) : undefined}
                state={state}
                quickFilter={quickFilter}
                onQuickFilterChange={(next) => { setQuickFilter(next); setPage(1); }}
                onRetry={() => setState("ready")}
              />
              <EstimatesToolbar
                value={filters}
                members={preview.members}
                currentMemberId={currentMember.id}
                shownCount={ready ? filtered.length : undefined}
                totalCount={ready ? scoped.length : undefined}
                disabled={!ready}
                onChange={changeFilters}
              />
              {quickFilter && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="m-0 text-sm font-semibold text-ink">{c.quickFilters[quickFilter]}</p>
                  <button type="button" className={estimateButton} disabled={!ready} onClick={() => { setQuickFilter(null); setPage(1); }}>{c.clearQuickFilter}</button>
                </div>
              )}
              {ready && filtered.length === 0 ? (
                <EstimatesEmptyState
                  filtered={scoped.length > 0}
                  onAdd={capabilities.create ? () => setNotice(c.createPreview) : undefined}
                  onClear={clearFilters}
                />
              ) : (
                <EstimatesTable
                  rows={paged}
                  members={preview.members}
                  capabilities={capabilities}
                  now={preview.now}
                  state={state}
                  onRetry={() => setState("ready")}
                  onOpen={(row) => rowAction(row, "open")}
                  onAction={rowAction}
                  onOpenRelated={(row) => setNotice(c.relatedPreview(row.parentNumber))}
                  sort={sort}
                  onSort={(column, direction) => {
                    if (isEstimateSortColumn(column)) { setSort({ column, direction }); setPage(1); }
                  }}
                />
              )}
              {ready && (
                <Pagination
                  total={filtered.length}
                  page={safePage}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              )}
              <EstimateExportDialog
                open={exportReview !== null}
                count={exportReview?.count ?? 0}
                scope={exportReview?.scope ?? ""}
                canExport={capabilities.export}
                onClose={() => setExportReview(null)}
                onExport={async () => { setExportReview(null); setNotice(c.exportPreview); }}
              />
              <AssistantPanel
                open={assistant}
                onOpenChange={setAssistant}
                badge={c.assistantBadge}
                description={c.assistantDescription}
                messages={[{ id: "estimates-preview", role: "assistant", text: c.assistantText }]}
                sendDisabled
                onSend={async () => ({ ok: false, message: c.assistantUnavailable })}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

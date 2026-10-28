import "server-only";
import {
  type EstimateChatSnapshot,
  type EstimateChatReadCard,
  type EstimateChatExportFilters,
  estimateChatEstimateRefSchema,
  estimateChatFilterSchema,
  estimateListQuerySchema,
  estimateListQueryToURL,
  type EstimateChatFilters,
  estimateExportColumns,
} from "@salesmora/contracts";
import {
  previewEstimateExport,
  readEstimateAgingForChat,
  readEstimateAssistantDetail,
  readEstimateEditor,
  readEstimateLifecycle,
  readEstimateRevisionFamily,
  readEstimateSharingReview,
  readEstimatesForChat,
} from "@salesmora/data";
import { readToolRegistry } from "@salesmora/agent";
import { database } from "../../workspaces/store";
import { enabledPermissions } from "../../authorization/permissions";
import type { ChatToolHandler } from "./types";
import { estimateSearchSnapshot, estimateAgingSnapshot } from "../estimate-results";
import { readEstimateTurnContext, rememberEstimateRead } from "../store";
import type { ToolResult } from "@salesmora/agent";
import {
  estimateComparisonCard, estimateDetailCard, estimateReadSnapshot, estimateScopeCard,
  estimateTotalsCard, estimateUnavailableCard, type EstimateReadMetadata,
} from "../estimate-read-results";

const defaultFilters = (): EstimateChatFilters =>
  estimateChatFilterSchema.parse({
    query: "",
    status: "all",
    owner: "all",
    parent: "all",
    customer: null,
    minTotalCents: null,
    maxTotalCents: null,
    validUntilFrom: null,
    validUntilTo: null,
    includeHidden: false,
    limit: 10,
  });

export async function prepareEstimateExportHandoff(
  context: Parameters<ChatToolHandler>[0],
  requestedFilters: EstimateChatExportFilters | null,
) {
  const identity = {
    userId: context.identity.userId,
    workspaceId: context.identity.workspaceId,
  };
  const filters = requestedFilters
    ? estimateChatFilterSchema.parse({
        ...requestedFilters,
        customer: null,
        minTotalCents: null,
        maxTotalCents: null,
        validUntilFrom: null,
        validUntilTo: null,
        limit: 10,
      })
    : context.surface === "estimates.list" && context.pageContext.estimateFilters
      ? estimateChatFilterSchema.parse(context.pageContext.estimateFilters)
      : defaultFilters();
  if (
    filters.customer !== null ||
    filters.minTotalCents !== null ||
    filters.maxTotalCents !== null ||
    filters.validUntilFrom !== null ||
    filters.validUntilTo !== null
  ) {
    return {
      evidence: {
        type: "estimate-export-handoff-unavailable",
        downloaded: false,
        message:
          "The current Estimates view contains filters that the shared export list cannot preserve. Open the Estimates list and choose supported export filters there.",
      },
    };
  }
  const query = estimateListQuerySchema.parse({
    workspaceId: identity.workspaceId,
    q: filters.query,
    status: filters.status,
    owner: filters.owner,
    parent: filters.parent,
    includeHidden: filters.includeHidden,
    quickFilter: filters.quickFilter,
    page: 1,
    pageSize: 25,
    sort: "updatedAt",
    direction: "desc",
  });
  const db = database();
  const preview = await previewEstimateExport(db, identity, enabledPermissions, {
    query,
    columns: [...estimateExportColumns],
  });
  const read = await readEstimatesForChat(
    db,
    identity,
    enabledPermissions,
    filters,
  );
  if (preview.scope !== read.scope) {
    throw new Error("Estimate export and assistant scopes do not match.");
  }
  const metadata = await readEstimateTurnContext(context.identity);
  const snapshot = estimateSearchSnapshot(
    context.turnId,
    identity.workspaceId,
    "export",
    filters,
    read,
  );
  context.signal.throwIfAborted();
  await rememberEstimateRead(
    context.identity,
    context.turnId,
    metadata.stamp,
    snapshot,
  );
  return {
    evidence: {
      type: "estimate-export-handoff",
      untrusted: true,
      count: preview.count,
      rowLimit: preview.rowLimit,
      scope: preview.scope,
      downloaded: false,
      instruction:
        "The export card only opens the existing Estimates export review. The user must review its current count and columns and explicitly download there. No CSV was generated or downloaded.",
    },
    estimateResult: snapshot.result,
    snapshot,
  };
}

async function resolveEstimate(
  db: ReturnType<typeof database>,
  identity: { userId: string; workspaceId: string },
  rawEstimateRef: string,
) {
  const estimateRef = estimateChatEstimateRefSchema.parse(rawEstimateRef);
  let exact: { estimateId?: string; estimateNumber?: number };
  if (!estimateRef.toUpperCase().startsWith("EST-")) {
    exact = { estimateId: estimateRef.toLowerCase() };
  } else {
    const estimateNumber = Number(estimateRef.slice(4));
    if (!Number.isSafeInteger(estimateNumber)) {
      throw new Error("Estimate number is outside the supported range.");
    }
    exact = { estimateNumber };
  }
  const result = await readEstimatesForChat(
    db,
    identity,
    enabledPermissions,
    defaultFilters(),
    exact,
  );
  return result.estimates[0] ?? null;
}

const executeEstimateQuery = async (
  context: Parameters<ChatToolHandler>[0],
  args: unknown,
  metadata: EstimateReadMetadata,
): Promise<ToolResult & { snapshot?: EstimateChatSnapshot }> => {
  const { request } = readToolRegistry.estimates_query.inputSchema.parse(args);
  await context.authorize("estimates_query");
  const identity = {
    userId: context.identity.userId,
    workspaceId: context.identity.workspaceId,
  };
  const db = database();

  if (request.operation === "search") {
    const read = await readEstimatesForChat(db, identity, enabledPermissions, request.input);
    const snapshot = estimateSearchSnapshot(context.turnId, identity.workspaceId, "search", request.input, read);
    return {
      evidence: read,
      estimateResult: snapshot.result,
      snapshot,
    };
  }

  if (request.operation === "list") {
    const filters = request.input.useCurrentFilters
      ? context.surface === "estimates.list" && context.pageContext.estimateFilters
        ? estimateChatFilterSchema.parse(context.pageContext.estimateFilters)
        : undefined
      : defaultFilters();
    if (!filters) {
      return {
        evidence: {
          type: "estimates-result",
          untrusted: true,
          operation: "list",
          available: false,
          reason: "No current Estimates-list filters are available.",
        },
      };
    }
    const read = await readEstimatesForChat(db, identity, enabledPermissions, filters);
    const snapshot = estimateSearchSnapshot(context.turnId, identity.workspaceId, "list", filters, read);
    return { evidence: read, estimateResult: snapshot.result, snapshot };
  }

  if (request.operation === "aging") {
    const read = await readEstimateAgingForChat(db, identity, enabledPermissions, request.input);
    const snapshot = estimateAgingSnapshot(context.turnId, identity.workspaceId, read);
    return { evidence: read, estimateResult: snapshot.result, snapshot };
  }

  if (request.operation === "open_in_list") {
    const input = request.input.filters;
    const filters = estimateChatFilterSchema.parse({
      query: input.query,
      status: input.status,
      owner: input.owner,
      parent: input.parent,
      customer: null,
      minTotalCents: null,
      maxTotalCents: null,
      validUntilFrom: null,
      validUntilTo: null,
      includeHidden: input.includeHidden,
      limit: 1,
    });
    const result = await readEstimatesForChat(
      db,
      identity,
      enabledPermissions,
      filters,
    );
    const query = estimateListQuerySchema.parse({
      workspaceId: identity.workspaceId,
      q: input.query,
      status: input.status,
      owner: input.owner,
      parent: input.parent,
      includeHidden: input.includeHidden,
      quickFilter: null,
      sort: "updatedAt",
      direction: "desc",
      page: 1,
      pageSize: 25,
    });
    const snapshot = estimateSearchSnapshot(context.turnId, identity.workspaceId, "open_in_list", filters, result);
    return {
      estimateResult: snapshot.result,
      snapshot,
      evidence: {
        type: "estimates-result",
        untrusted: true,
        operation: "open_in_list",
        matchingCount: result.total,
        openInListPath: `/estimates?${estimateListQueryToURL(query)}`,
      },
    };
  }

  const reference = await resolveEstimate(
    db,
    identity,
    request.input.estimateRef,
  );
  const operation = request.operation;
  function result(card: EstimateChatReadCard) {
    const snapshot = estimateReadSnapshot(context.turnId, card);
    return {
      evidence: { type: "estimates-result", untrusted: true, operation, detail: snapshot.result.detail },
      estimateResult: snapshot.result,
      snapshot,
    };
  }
  if (!reference) return result(estimateUnavailableCard(metadata, operation));

  if (operation === "get") {
    const [detail, lifecycle, sharing] = await Promise.all([
      readEstimateAssistantDetail(db, identity, enabledPermissions, reference.id),
      readEstimateLifecycle(db, identity, enabledPermissions, {
        workspaceId: identity.workspaceId,
        estimateId: reference.id,
      }),
      readEstimateSharingReview(db, identity, enabledPermissions, reference.id),
    ]);
    return result(estimateDetailCard(metadata, detail, reference.parent, lifecycle, sharing));
  }

  if (operation === "explain_totals") {
    const detail = await readEstimateAssistantDetail(
      db,
      identity,
      enabledPermissions,
      reference.id,
    );
    return result(estimateTotalsCard(metadata, detail));
  }

  if (operation === "compare_revisions") {
    const family = await readEstimateRevisionFamily(
      db,
      identity,
      enabledPermissions,
      { workspaceId: identity.workspaceId, estimateId: reference.id },
    );
    if (family.revisions.length < 2) {
      const detail = await readEstimateAssistantDetail(db, identity, enabledPermissions, reference.id);
      return result(estimateComparisonCard(metadata, detail, null));
    }
    const [newerRevision, olderRevision] = family.revisions;
    const [newer, older] = await Promise.all([
      readEstimateAssistantDetail(
        db,
        identity,
        enabledPermissions,
        newerRevision.id,
      ),
      readEstimateAssistantDetail(
        db,
        identity,
        enabledPermissions,
        olderRevision.id,
      ),
    ]);
    return result(estimateComparisonCard(metadata, newer, older));
  }

  const [editor, detail] = await Promise.all([
    readEstimateEditor(db, identity, enabledPermissions, reference.id),
    readEstimateAssistantDetail(db, identity, enabledPermissions, reference.id),
  ]);
  return result(estimateScopeCard(metadata, detail, editor.parent));
};

export const estimatesQuery: ChatToolHandler = async (context, args) => {
  await context.authorize("estimates_query");
  const metadata = await readEstimateTurnContext(context.identity);
  const { snapshot, ...result } = await executeEstimateQuery(context, args, metadata);
  context.signal.throwIfAborted();
  await rememberEstimateRead(context.identity, context.turnId, metadata.stamp, snapshot);
  return result;
};

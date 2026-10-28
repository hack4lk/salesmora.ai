import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { PassThrough, Readable } from "node:stream";
import type { Knex } from "knex";
import {
  estimateExportRequestSchema,
  type AuthorizationContext,
  type EstimateExportColumn,
  type EstimateExportPreview,
  type EstimateExportRequest,
  type PermissionId,
} from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { csvLine } from "../leads/csv";
import {
  estimateEffectiveStatus,
  filteredEstimateQuery,
  type EstimateReadScope,
} from "./read";

export class EstimateExportLimitError extends Error {}
export class EstimateExportEmptyError extends Error {}

type ExportAuditOutcome = "started" | "completed" | "failed" | "rejected";

export function estimateExportRowLimit() {
  const raw = process.env.ESTIMATE_EXPORT_ROW_LIMIT ?? "50000";
  if (
    !/^\d+$/.test(raw) ||
    !Number.isSafeInteger(Number(raw)) ||
    Number(raw) < 1 ||
    Number(raw) > 1_000_000
  ) {
    throw new Error("Invalid Estimate export row limit configuration.");
  }
  return Number(raw);
}

function validate(identity: WorkspaceIdentity, raw: EstimateExportRequest) {
  const input = estimateExportRequestSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) {
    throw new AuthorizationAccessError();
  }
  return input;
}

function exportAccess(context: AuthorizationContext) {
  const read = resolveAuthorizedCollectionScope(context, "estimates.read");
  const exportPermission = resolveAuthorizedCollectionScope(
    context,
    "estimates.export",
  );
  if (
    !read.allowed ||
    !exportPermission.allowed ||
    !["workspace", "assigned_job"].includes(read.scope) ||
    !["workspace", "assigned_job"].includes(exportPermission.scope)
  ) {
    throw new AuthorizationAccessError();
  }
  const scope: EstimateReadScope =
    read.scope === "assigned_job" || exportPermission.scope === "assigned_job"
      ? "assigned_job"
      : "workspace";
  return { scope };
}

async function withExportAuthorization<T>(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  use: (
    trx: Knex.Transaction,
    context: AuthorizationContext,
  ) => Promise<T>,
) {
  return db.transaction(async (trx) => {
    await trx.raw("SET LOCAL lock_timeout = '5s'");
    await trx.raw("SET LOCAL statement_timeout = '10s'");
    return withWorkspaceAuthorization(trx, identity, enabled, false, use);
  });
}

async function exportQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  input: EstimateExportRequest,
) {
  const { scope } = exportAccess(context);
  return {
    query: filteredEstimateQuery(trx, context, scope, input.query),
    scope,
  };
}

function auditedFilters(input: EstimateExportRequest) {
  const { q, owner, workspaceId, page, pageSize, ...filters } = input.query;
  void workspaceId;
  void page;
  void pageSize;
  return {
    ...filters,
    ownerHash:
      owner === "all" || owner === "me" || owner === "unassigned"
        ? owner
        : createHash("sha256").update(owner).digest("hex"),
    ...(q ? { searchHash: createHash("sha256").update(q).digest("hex") } : {}),
    columns: input.columns,
  };
}

export async function previewEstimateExport(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: EstimateExportRequest,
): Promise<EstimateExportPreview> {
  const input = validate(identity, raw);
  return withExportAuthorization(db, identity, enabled, async (trx, context) => {
    const { query, scope } = await exportQuery(trx, context, input);
    const result = await query.countDistinct({ count: "e.id" }).first();
    return {
      count: Number(result?.count ?? 0),
      scope,
      rowLimit: estimateExportRowLimit(),
    };
  });
}

function timestamp(value: Date | string | null) {
  if (value === null) return null;
  const result = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(result.getTime())) {
    throw new Error("Estimate export contains an invalid timestamp.");
  }
  return result.toISOString();
}

function money(cents: number | string | null) {
  if (cents === null) return null;
  const amount = Number(cents);
  if (!Number.isSafeInteger(amount)) {
    throw new Error("Estimate export total is outside the safe integer range.");
  }
  return (amount / 100).toFixed(2);
}

const headers: Record<EstimateExportColumn, string> = {
  number: "Estimate number",
  revision: "Revision",
  name: "Name",
  status: "Status",
  customer: "Customer",
  parentType: "Parent type",
  parentId: "Parent ID",
  owner: "Owner",
  total: "Total",
  sentAt: "Sent date",
  validUntil: "Valid until",
  decidedAt: "Decided date",
  decisionChannel: "Decision channel",
};

type ExportRow = {
  estimateNumber: number;
  revision: number;
  name: string;
  status: string;
  customerName: string;
  parentType: "lead" | "job";
  parentId: string;
  ownerName: string | null;
  totalCents: number | string | null;
  sentAt: Date | string | null;
  validUntil: string | null;
  decidedAt: Date | string | null;
  decisionChannel: string | null;
  count: number;
};

function rowValues(row: ExportRow): Record<EstimateExportColumn, unknown> {
  return {
    number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
    revision: row.revision,
    name: row.name,
    status: row.status,
    customer: row.customerName,
    parentType: row.parentType,
    parentId: row.parentId,
    owner: row.ownerName,
    total: money(row.totalCents),
    sentAt: timestamp(row.sentAt),
    validUntil: row.validUntil,
    decidedAt: timestamp(row.decidedAt),
    decisionChannel: row.decisionChannel,
  };
}

export async function createEstimateCSVExport(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: EstimateExportRequest,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  const rowLimit = estimateExportRowLimit();
  const id = randomUUID();
  const signal = AbortSignal.any([
    AbortSignal.timeout(30_000),
    ...(requestSignal ? [requestSignal] : []),
  ]);
  const initial = await withExportAuthorization(
    db,
    identity,
    enabled,
    async (trx, context) => {
      signal.throwIfAborted();
      const { query, scope } = await exportQuery(trx, context, input);
      const result = await query.countDistinct({ count: "e.id" }).first();
      const count = Number(result?.count ?? 0);
      const outcome: ExportAuditOutcome =
        count === 0 || count > rowLimit ? "rejected" : "started";
      await trx("estimateExportAudit").insert({
        id,
        workspaceId: identity.workspaceId,
        actorId: identity.userId,
        scope,
        filters: JSON.stringify(auditedFilters(input)),
        count,
        outcome,
        finishedAt: outcome === "started" ? null : new Date(),
      });
      return { count, scope };
    },
  );
  if (!initial.count) throw new EstimateExportEmptyError();
  if (initial.count > rowLimit) throw new EstimateExportLimitError();

  const output = new PassThrough({ highWaterMark: 64 * 1024 });
  output.on("error", () => {
    // The response receives a generic stream error; never log exported content.
  });
  const onAbort = () => output.destroy(new Error("Export cancelled."));
  signal.addEventListener("abort", onAbort, { once: true });
  let resolveReady!: (value: EstimateExportPreview) => void;
  let rejectReady!: (reason: unknown) => void;
  const ready = new Promise<EstimateExportPreview>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  let rowsSent = 0;
  let checked = initial;

  async function write(text: string) {
    signal.throwIfAborted();
    if (output.destroyed) throw new Error("Export cancelled.");
    if (!output.write(text, "utf8")) {
      await once(output, "drain", { signal });
    }
  }

  const generation = withExportAuthorization(
    db,
    identity,
    enabled,
    async (trx, context) => {
      await trx.raw("SET LOCAL statement_timeout = '10s'");
      signal.throwIfAborted();
      const { query, scope } = await exportQuery(trx, context, input);
      const sortColumn: Record<
        EstimateExportRequest["query"]["sort"],
        string
      > = {
        updatedAt: 'e."updatedAt"',
        totalCents: 'e."totalCents"',
        validUntil: 'e."validUntil"',
        estimateNumber: 'e."estimateNumber"',
      };
      const direction = input.query.direction === "asc" ? "ASC" : "DESC";
      const nulls =
        input.query.sort === "validUntil" ||
        input.query.sort === "totalCents"
          ? " NULLS LAST"
          : "";
      const selection = query
        .orderByRaw(
          `${sortColumn[input.query.sort]} ${direction}${nulls}, e.id ASC`,
        )
        .select(
          "e.estimateNumber",
          "e.revision",
          "e.name",
          "e.parentType",
          "e.totalCents",
          "e.sentAt",
          "e.decidedAt",
          "e.decisionChannel",
          "u.name as ownerName",
          trx.raw(`${estimateEffectiveStatus} AS status`),
          trx.raw(
            `COALESCE(c.name, l.name, j."customerName", '') AS "customerName"`,
          ),
          trx.raw(`COALESCE(e."leadId", e."jobId")::text AS "parentId"`),
          trx.raw(
            `to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`,
          ),
          trx.raw(`count(*) OVER ()::int AS count`),
        )
        .toSQL();
      await trx.raw(
        "DECLARE estimate_export_cursor NO SCROLL CURSOR FOR " +
          selection.sql,
        [...selection.bindings],
      );
      let rows = (
        await trx.raw<{ rows: ExportRow[] }>(
          "FETCH FORWARD 100 FROM estimate_export_cursor",
        )
      ).rows;
      const count = Number(rows[0]?.count ?? 0);
      checked = { count, scope };
      if (!count) throw new EstimateExportEmptyError();
      if (count > rowLimit) throw new EstimateExportLimitError();
      resolveReady({ count, scope, rowLimit });
      await write(
        "\uFEFF" + csvLine(input.columns.map((column) => headers[column])),
      );
      while (rows.length) {
        for (const row of rows) {
          const values = rowValues(row);
          await write(csvLine(input.columns.map((column) => values[column])));
          rowsSent++;
        }
        signal.throwIfAborted();
        rows = (
          await trx.raw<{ rows: ExportRow[] }>(
            "FETCH FORWARD 100 FROM estimate_export_cursor",
          )
        ).rows;
      }
      await trx.raw("CLOSE estimate_export_cursor");
      if (rowsSent !== count) throw new Error("Estimate export snapshot changed.");
      return { count, scope };
    },
  );

  void generation
    .then(async (result) => {
      signal.throwIfAborted();
      await db("estimateExportAudit")
        .where({ id, outcome: "started" })
        .update({
          ...result,
          rowsSent,
          outcome: "completed",
          finishedAt: new Date(),
        });
      output.end();
    })
    .catch(async (error: unknown) => {
      try {
        await db("estimateExportAudit")
          .where({ id, outcome: "started" })
          .update({
            ...checked,
            rowsSent,
            outcome:
              error instanceof EstimateExportLimitError ||
              error instanceof EstimateExportEmptyError
                ? "rejected"
                : "failed",
            finishedAt: new Date(),
          });
      } catch {
        // Keep started evidence if audit storage is unavailable.
      }
      rejectReady(error);
      output.destroy(new Error("CSV export could not be completed."));
    })
    .finally(() => signal.removeEventListener("abort", onAbort));

  const metadata = await ready;
  return {
    ...metadata,
    stream: Readable.toWeb(output) as ReadableStream<Uint8Array>,
  };
}

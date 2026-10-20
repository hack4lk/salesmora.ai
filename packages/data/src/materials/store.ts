import type { Knex } from "knex";
import { materialQuerySchema, type AuthorizationContext, type MaterialListResult, type MaterialView, type PermissionId } from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";

export class MaterialConflictError extends Error {
  constructor(message = "This catalog item changed. Reload its current details before trying again.") { super(message); }
}
export class MaterialValidationError extends Error {}

export type MaterialRow = {
  id: string; workspaceId: string; name: string; sku: string; unit: MaterialView["unit"]; category: string; supplier: string;
  costCents: number; priceCents: number; notes: string; imageUrl: string; sourceUrl: string; status: MaterialView["status"];
  archivedAt: Date | null; version: number; proposedBy: string | null; rejectionReason: string; updatedAt: Date; proposedByName?: string | null;
};

/** What the signed-in user may do with the catalog. Cost and price visibility follow the work-order price permissions. */
export function materialAccess(context: AuthorizationContext) {
  const allowed = (permission: PermissionId) => authorize(context, { permission }).allowed;
  // The price permissions are work-order record grants; a workspace-scoped probe asks whether the role holds them workspace-wide.
  const probe = { kind: "work_order" as const, id: "catalog", workspaceId: context.workspaceId, job: null };
  const priced = (permission: PermissionId) => authorize(context, { permission, resource: probe }).allowed;
  const viewPrices = priced("workorders.view_prices");
  return {
    read: allowed("materials.read"), manage: allowed("materials.manage"), propose: allowed("materials.propose"),
    viewPrices, viewCosts: viewPrices && priced("workorders.view_costs"),
  };
}
export type MaterialAccess = ReturnType<typeof materialAccess>;

export function toMaterialView(row: MaterialRow, access: MaterialAccess, duplicateOf: string | null = null): MaterialView {
  const cost = access.viewCosts ? row.costCents : null, price = access.viewPrices ? row.priceCents : null;
  return {
    id: row.id, name: row.name, sku: row.sku, unit: row.unit, category: row.category, supplier: row.supplier,
    costCents: cost, priceCents: price,
    marginPercent: cost !== null && price !== null && price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : null,
    notes: row.notes, imageUrl: row.imageUrl, sourceUrl: row.sourceUrl,
    status: row.status, archived: !!row.archivedAt, version: row.version, updatedAt: row.updatedAt.toISOString(),
    proposedByName: row.proposedByName ?? null, rejectionReason: row.rejectionReason, duplicateOf,
  };
}

const like = (value: string) => `%${value.replace(/[\\%_]/g, match => `\\${match}`)}%`;
const sortColumns = { name: "lower(m.name)", category: "lower(m.category)", price: `m."priceCents"`, updatedAt: `m."updatedAt"` } as const;

export async function readMaterials(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown): Promise<MaterialListResult> {
  const query = materialQuerySchema.parse(raw);
  if (query.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const access = materialAccess(context);
    if (!access.read) throw new AuthorizationAccessError();
    // Proposals are visible to approvers, and each proposer sees only their own.
    if (query.status !== "active" && !access.manage && !access.propose) throw new AuthorizationAccessError();
    const ownOnly = query.status !== "active" && !access.manage;
    const archived = access.manage && query.status === "active" && query.archived;
    const base = () => trx("materialCatalog as m").where("m.workspaceId", context.workspaceId);
    const filtered = () => {
      const q = base().where("m.status", query.status);
      if (query.status === "active") q.modify(w => (archived ? w.whereNotNull("m.archivedAt") : w.whereNull("m.archivedAt")));
      if (ownOnly) q.where("m.proposedBy", context.userId);
      if (query.category) q.whereRaw("lower(m.category) = lower(?)", [query.category]);
      if (query.supplier) q.whereRaw("lower(m.supplier) = lower(?)", [query.supplier]);
      if (query.q) q.where(w => { const term = like(query.q); w.whereRaw(`m.name ILIKE ? ESCAPE '\\'`, [term]).orWhereRaw(`m.sku ILIKE ? ESCAPE '\\'`, [term])
        .orWhereRaw(`m.category ILIKE ? ESCAPE '\\'`, [term]).orWhereRaw(`m.supplier ILIKE ? ESCAPE '\\'`, [term]); });
      return q;
    };
    // Prices cannot be sorted by users who cannot see them.
    const sort = query.sort === "price" && !access.viewPrices ? "name" : query.sort;
    const total = Number((await filtered().count({ count: "*" }).first())?.count ?? 0);
    const rows: MaterialRow[] = await filtered().leftJoin("users as p", "p.id", "m.proposedBy")
      .select("m.*", "p.name as proposedByName")
      .orderByRaw(`${sortColumns[sort]} ${query.direction === "desc" ? "DESC" : "ASC"}, m.id`)
      .limit(query.pageSize).offset((query.page - 1) * query.pageSize);
    const duplicates = new Map<string, string>();
    if (access.manage && query.status === "proposed" && rows.length) {
      const found = await trx("materialCatalog as a").join("materialCatalog as m", function join() {
        this.on("m.workspaceId", "a.workspaceId").andOn(trx.raw(`(lower(m.name) = lower(a.name) OR (a.sku <> '' AND lower(m.sku) = lower(a.sku)))`)); })
        .where("a.workspaceId", context.workspaceId).where("a.status", "active").whereIn("m.id", rows.map(row => row.id)).select("m.id as proposalId", "a.name");
      for (const row of found) duplicates.set(row.proposalId, row.name);
    }
    const distinct = async (column: "category" | "supplier") => (await base().where("m.status", "active").whereRaw(`m."${column}" <> ''`).select(`m.${column} as value`).groupBy(`m.${column}`).orderByRaw(`lower(m."${column}")`).limit(200)).map(row => row.value as string);
    const pending = access.manage || access.propose
      ? Number((await base().where("m.status", "proposed").modify(q => { if (!access.manage) q.where("m.proposedBy", context.userId); }).count({ count: "*" }).first())?.count ?? 0) : 0;
    return {
      rows: rows.map(row => toMaterialView(row, access, duplicates.get(row.id) ?? null)), total, page: query.page, pageSize: query.pageSize,
      options: { categories: await distinct("category"), suppliers: await distinct("supplier") }, pendingProposals: pending,
      canManage: access.manage, canPropose: access.propose, canExport: access.manage, canViewPrices: access.viewPrices, canViewCosts: access.viewCosts,
    };
  });
}

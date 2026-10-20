import "server-only";
import { randomUUID } from "node:crypto";
import { availableMaterialOperations } from "@salesmora/agent";
import { AuthorizationAccessError, MaterialValidationError, materialAccess, readMaterials, type Knex } from "@salesmora/data";
import { materialsProposeSchema, workOrderChatResultSchema, type AuthorizationContext, type MaterialView, type MaterialsPropose, type WorkOrderChatDraft, type WorkOrderChatResult } from "@salesmora/contracts";
import { authorizedWorkspace, enabledPermissions } from "../authorization/permissions";
import { Declined, base, blank, clip, identityFor, storeDraft, turnFor } from "./work-orders-actions";
import type { ChatToolHandler } from "./tools/types";

const cents = (dollars: number) => Math.round(dollars * 100);
const money = (value: number | null) => (value === null ? "Not set" : `$${(value / 100).toFixed(2)}`);
const fieldLabels = { name: "Name", sku: "SKU", unit: "Unit", category: "Category", supplier: "Supplier", notes: "Notes", sourceUrl: "Supplier link" } as const;

/** Finds exactly one catalog item by exact name or SKU; anything else is declined with a short list of near matches. */
async function findItem(trx: Knex.Transaction, context: AuthorizationContext, target: string, archived: boolean): Promise<MaterialView> {
  const found = await readMaterials(trx, identityFor(context), enabledPermissions, { workspaceId: context.workspaceId, q: target, archived, pageSize: 25 });
  const wanted = target.toLowerCase();
  const exact = found.rows.filter(m => m.name.toLowerCase() === wanted || (m.sku && m.sku.toLowerCase() === wanted));
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) throw new Declined(`More than one item is named "${clip(target, 60)}". Use its SKU.`);
  const similar = found.rows.slice(0, 3).map(m => clip(m.name, 60));
  throw new Declined(similar.length ? `I can't find "${clip(target, 60)}" exactly. Similar items: ${similar.join(", ")}.` : `I can't find "${clip(target, 60)}" in the catalog${archived ? " archive" : ""}.`);
}

type Prepared = { payload: Record<string, unknown>; review: WorkOrderChatDraft };

async function prepare(trx: Knex.Transaction, context: AuthorizationContext, request: MaterialsPropose, draftId: string): Promise<Prepared> {
  const access = materialAccess(context);
  const head = base(draftId);
  const submission = { workspaceId: context.workspaceId, submissionId: draftId };
  const moneyDeclined = (request.costDollars !== null && !access.viewCosts) || (request.priceDollars !== null && !access.viewPrices);
  if (request.operation === "export") {
    const query = { workspaceId: context.workspaceId, q: request.target ?? "", ...(request.category ? { category: request.category } : {}), ...(request.supplier ? { supplier: request.supplier } : {}), sort: "name" as const, direction: "asc" as const, page: 1, pageSize: 100 as const };
    const list = await readMaterials(trx, identityFor(context), enabledPermissions, query);
    if (!list.total || list.total > 50000) throw new Declined("Choose an export between 1 and 50,000 catalog items.");
    return {
      payload: { kind: "material-export", input: { query, expectedCount: list.total } },
      review: { ...head, action: "material-export", workOrder: { number: "CSV export", title: "Active catalog items" }, count: list.total,
        columns: ["Name", "SKU", "Unit", "Category", "Supplier", ...(access.viewCosts ? ["Cost per unit"] : []), ...(access.viewPrices ? ["Price per unit"] : []), "Status", "Notes", "Supplier link", "Image link"],
        impact: [request.target ? `Search: ${request.target}` : "All active items", request.category ? `Category: ${request.category}` : "", request.supplier ? `Supplier: ${request.supplier}` : ""].filter(Boolean).join(" · "),
        changes: [{ label: "Rows", before: "", after: String(list.total) }] },
    };
  }
  if (moneyDeclined && request.operation !== "archive" && request.operation !== "restore") throw new Declined("You don't have permission to set costs or prices. Leave them out and I'll prepare the item without them.");

  if (request.operation === "create") {
    const propose = !access.manage;
    const sku = request.sku ?? "";
    const dupes = await readMaterials(trx, identityFor(context), enabledPermissions, { workspaceId: context.workspaceId, q: sku || request.name!, pageSize: 25 });
    if (sku && dupes.rows.some(m => m.sku.toLowerCase() === sku.toLowerCase())) throw new Declined(`SKU "${clip(sku, 40)}" is already in the catalog.`);
    const sameName = dupes.rows.some(m => m.name.toLowerCase() === request.name!.toLowerCase());
    const item = { name: request.name!, sku, unit: request.unit ?? "each", category: request.category ?? "", supplier: request.supplier ?? "", notes: request.notes ?? "", sourceUrl: request.sourceUrl ?? "",
      ...(request.costDollars === null ? {} : { costCents: cents(request.costDollars) }), ...(request.priceDollars === null ? {} : { priceCents: cents(request.priceDollars) }) };
    const lines = [["Name", item.name], ["Unit", item.unit], ["SKU", item.sku], ["Category", item.category], ["Supplier", item.supplier],
      ["Cost per unit", item.costCents === undefined ? "" : money(item.costCents)], ["Price per unit", item.priceCents === undefined ? "" : money(item.priceCents)], ["Notes", item.notes], ["Supplier link", item.sourceUrl]];
    const warnings = [...(sameName ? [`An item named "${clip(item.name, 60)}" already exists. Confirm only if this is a different product.`] : [])];
    return {
      payload: { kind: "material", input: { ...submission, action: propose ? "propose" : "create", item } },
      review: { ...head, action: propose ? "material-propose" : "material-create", workOrder: { number: item.sku || "New catalog item", title: clip(item.name, 200) },
        changes: lines.filter(([, value]) => value).map(([label, after]) => ({ label: label!, before: "", after: after! })),
        impact: propose ? "This is submitted as a proposal. An owner or admin must approve it before it can be used on work orders." : "The item is added to the catalog and can be used on work orders right away.",
        ...(warnings.length ? { warnings } : {}) },
    };
  }

  const item = await findItem(trx, context, request.target!, request.operation === "restore");
  const target = { workOrder: { number: item.sku || "Catalog item", title: clip(item.name, 200) } };
  const common = { ...head, ...target };
  if (request.operation === "archive") {
    if (item.archived) throw new Declined(`"${clip(item.name, 60)}" is already archived.`);
    return { payload: { kind: "material", input: { ...submission, action: "archive", materialId: item.id, expectedVersion: item.version, archived: true } },
      review: { ...common, action: "material-archive", changes: [{ label: "Status", before: "Active", after: "Archived" }], impact: "It disappears from the picker. Work orders that already use it keep their copy." } };
  }
  if (request.operation === "restore") {
    return { payload: { kind: "material", input: { ...submission, action: "archive", materialId: item.id, expectedVersion: item.version, archived: false } },
      review: { ...common, action: "material-restore", changes: [{ label: "Status", before: "Archived", after: "Active" }] } };
  }
  const patch: Record<string, unknown> = {};
  const changes: { label: string; before: string; after: string }[] = [];
  for (const key of Object.keys(fieldLabels) as (keyof typeof fieldLabels)[]) {
    const next = request[key];
    if (next !== null && next !== item[key]) { patch[key] = next; changes.push({ label: fieldLabels[key], before: String(item[key]), after: String(next) }); }
  }
  if (request.costDollars !== null && cents(request.costDollars) !== item.costCents) { patch.costCents = cents(request.costDollars); changes.push({ label: "Cost per unit", before: money(item.costCents), after: money(cents(request.costDollars)) }); }
  if (request.priceDollars !== null && cents(request.priceDollars) !== item.priceCents) { patch.priceCents = cents(request.priceDollars); changes.push({ label: "Price per unit", before: money(item.priceCents), after: money(cents(request.priceDollars)) }); }
  if (!changes.length) throw new Declined(`"${clip(item.name, 60)}" already has those values.`);
  return { payload: { kind: "material", input: { ...submission, action: "update", materialId: item.id, expectedVersion: item.version, item: patch } },
    review: { ...common, action: "material-edit", changes, impact: "Work orders that already use this item keep the price they were added with." } };
}

export const materialsPropose: ChatToolHandler = async (context, args) => {
  const request = materialsProposeSchema.parse(args);
  const workOrderResult = await authorizedWorkspace(context.identity.userId, context.identity.workspaceId, true, async (trx, authority) => {
    context.signal.throwIfAborted();
    const turn = await turnFor(trx, authority, context.turnId);
    let output: WorkOrderChatResult;
    try {
      if (!availableMaterialOperations(authority).includes(request.operation)) throw new Declined("You don't have permission to do that.");
      const { payload, review } = await prepare(trx, authority, request, randomUUID());
      output = await storeDraft(trx, authority, turn, payload, review, "Review the catalog change. Nothing has been saved.");
    } catch (error) {
      if (error instanceof Declined) output = { ...blank("outcome", error.message), records: error.records };
      else if (error instanceof MaterialValidationError) output = blank("outcome", error.message);
      else if (error instanceof AuthorizationAccessError) output = blank("outcome", "I can't find that catalog item.");
      else throw error;
    }
    output.turnId = turn.id;
    const parsed = workOrderChatResultSchema.parse(output);
    await trx("chatTurns").where({ id: turn.id }).update({ workOrderResult: JSON.stringify(parsed) });
    context.signal.throwIfAborted();
    return parsed;
  });
  return { workOrderResult, evidence: { type: "materials-proposal", result: workOrderResult, saved: false, requiresExplicitConfirmation: !!workOrderResult.draft } };
};

import "server-only";
import { readToolRegistry } from "@salesmora/agent";
import { readMaterials } from "@salesmora/data";
import type { MaterialView } from "@salesmora/contracts";
import { database } from "../../workspaces/store";
import { enabledPermissions } from "../../authorization/permissions";
import type { ChatToolHandler } from "./types";

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);

/** Cost and price are already redacted by readMaterials for roles without the permission, so they arrive as null and are omitted. */
const summary = (m: MaterialView, full = false) => ({
  name: clip(m.name, 120), sku: m.sku, unit: m.unit, category: m.category, supplier: m.supplier,
  ...(m.priceCents === null ? {} : { pricePerUnit: m.priceCents / 100 }),
  ...(m.costCents === null ? {} : { costPerUnit: m.costCents / 100 }),
  ...(full ? { notes: clip(m.notes, 400), hasImage: !!m.imageUrl } : {}),
});

export const materialsQuery: ChatToolHandler = async (context, args) => {
  const input = readToolRegistry.materials_query.inputSchema.parse(args);
  await context.authorize("materials_query");
  const identity = { userId: context.identity.userId, workspaceId: context.identity.workspaceId };
  const limit = input.limit ?? 10;
  const found = await readMaterials(database(), identity, enabledPermissions, {
    workspaceId: identity.workspaceId, q: input.query ?? "", pageSize: 25,
    ...(input.category ? { category: input.category } : {}), ...(input.supplier ? { supplier: input.supplier } : {}),
  });
  const base = { type: "materials-result", untrusted: true, operation: input.operation, total: found.total, categories: found.options.categories.slice(0, 30) };
  if (input.operation === "details") {
    const wanted = input.query!.toLowerCase();
    const match = found.rows.find(m => m.name.toLowerCase() === wanted || (m.sku && m.sku.toLowerCase() === wanted)) ?? (found.rows.length === 1 ? found.rows[0] : null);
    return { evidence: { ...base, found: !!match, ...(match ? { material: summary(match, true) } : { candidates: found.rows.slice(0, 5).map(m => summary(m)) }) } };
  }
  return { evidence: { ...base, truncated: found.total > limit, materials: found.rows.slice(0, limit).map(m => summary(m)), openInCatalogPath: "/materials" } };
};

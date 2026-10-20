import { z } from "zod";

export const materialUnits = ["each", "ft", "lb", "box", "gal", "hr", "other"] as const;
export const materialStatuses = ["proposed", "active", "rejected"] as const;
export const materialPageSizes = [25, 50, 100] as const;
export const materialSorts = ["name", "category", "price", "updatedAt"] as const;
export const materialNameMax = 200;
export const materialCentsMax = 100_000_000;

export const materialUnitSchema = z.enum(materialUnits);
export const materialStatusSchema = z.enum(materialStatuses);
export type MaterialUnit = z.infer<typeof materialUnitSchema>;
export type MaterialStatus = z.infer<typeof materialStatusSchema>;

const cents = z.number().int().min(0).max(materialCentsMax);
const optionalUrl = z.string().trim().max(2000).refine(value => value === "" || /^https?:\/\/[^\s]+$/i.test(value), { message: "Use a full http or https link." });
const expected = { workspaceId: z.uuid(), submissionId: z.uuid() };
const versioned = { ...expected, materialId: z.uuid(), expectedVersion: z.number().int().positive() };

const fieldShape = {
  name: z.string().trim().min(1).max(materialNameMax),
  sku: z.string().trim().max(80),
  unit: materialUnitSchema,
  category: z.string().trim().max(80),
  supplier: z.string().trim().max(120),
  costCents: cents,
  priceCents: cents,
  notes: z.string().trim().max(1000),
  imageUrl: optionalUrl,
  sourceUrl: optionalUrl,
};
/** Cost and price are optional so users without those permissions can submit items; the server rejects them for users who cannot see them. */
export const materialFieldsSchema = z.object({
  ...fieldShape, sku: fieldShape.sku.default(""), unit: fieldShape.unit.default("each"), category: fieldShape.category.default(""),
  supplier: fieldShape.supplier.default(""), costCents: cents.optional(), priceCents: cents.optional(),
  notes: fieldShape.notes.default(""), imageUrl: fieldShape.imageUrl.default(""), sourceUrl: fieldShape.sourceUrl.default(""),
}).strict();
/** Edits never apply defaults, so fields left out stay as they are. */
export const materialPatchSchema = z.object(fieldShape).partial().strict();
export type MaterialFields = z.output<typeof materialFieldsSchema>;
export type MaterialPatch = z.output<typeof materialPatchSchema>;

export const materialMutationSchema = z.discriminatedUnion("action", [
  z.object({ ...expected, action: z.literal("create"), item: materialFieldsSchema }).strict(),
  z.object({ ...expected, action: z.literal("propose"), item: materialFieldsSchema }).strict(),
  z.object({ ...versioned, action: z.literal("update"), item: materialPatchSchema
    .refine(item => Object.values(item).some(value => value !== undefined), { message: "Nothing to change." }) }).strict(),
  z.object({ ...versioned, action: z.literal("archive"), archived: z.boolean() }).strict(),
  z.object({ ...versioned, action: z.literal("approve"), item: materialPatchSchema.default({}) }).strict(),
  z.object({ ...versioned, action: z.literal("reject"), reason: z.string().trim().min(1).max(500) }).strict(),
  z.object({ ...versioned, action: z.literal("withdraw") }).strict(),
]);
export type MaterialMutation = z.output<typeof materialMutationSchema>;

export const materialQuerySchema = z.object({
  workspaceId: z.uuid(),
  q: z.string().trim().max(200).default(""),
  category: z.string().trim().max(80).optional(),
  supplier: z.string().trim().max(120).optional(),
  status: materialStatusSchema.default("active"),
  archived: z.boolean().default(false),
  sort: z.enum(materialSorts).default("name"),
  direction: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().min(1).max(10000).default(1),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict();
export const materialExportSchema = z.object({ query: materialQuerySchema, expectedCount: z.number().int().positive().max(50000) });
export const materialExportRequestSchema = z.object({ workspaceId: z.uuid(), query: z.record(z.string(), z.unknown()), expectedCount: z.number().int().positive().max(50000) }).strict();

export const materialChatOperations = ["search", "details"] as const;
/** Flat and nullable so it doubles as a strict provider function schema; the model never supplies ids or workspaces. */
export const materialsQuerySchema = z.object({
  operation: z.enum(materialChatOperations),
  query: z.string().trim().max(200).nullable(),
  category: z.string().trim().max(80).nullable(),
  supplier: z.string().trim().max(120).nullable(),
  limit: z.number().int().min(1).max(20).nullable(),
}).strict().refine(v => v.operation !== "details" || !!v.query, { message: "details needs a name or SKU.", path: ["query"] });
export type MaterialsQuery = z.infer<typeof materialsQuerySchema>;

export const materialProposeOperations = ["create", "edit", "archive", "restore", "export"] as const;
export type MaterialProposeOperation = (typeof materialProposeOperations)[number];
/** Flat and nullable like the query tool. Prices are dollars as typed by the user; the server converts, checks permissions and finds the item by exact name or SKU. */
export const materialsProposeSchema = z.object({
  operation: z.enum(materialProposeOperations),
  target: z.string().trim().max(200).nullable(),
  name: z.string().trim().min(1).max(materialNameMax).nullable(),
  sku: z.string().trim().max(80).nullable(),
  unit: materialUnitSchema.nullable(),
  category: z.string().trim().max(80).nullable(),
  supplier: z.string().trim().max(120).nullable(),
  costDollars: z.number().min(0).max(materialCentsMax / 100).nullable(),
  priceDollars: z.number().min(0).max(materialCentsMax / 100).nullable(),
  notes: z.string().trim().max(1000).nullable(),
  sourceUrl: optionalUrl.nullable(),
}).strict().superRefine((v, ctx) => {
  const need = (ok: unknown, path: keyof typeof v, message: string) => { if (!ok) ctx.addIssue({ code: "custom", path: [path], message }); };
  if (v.operation === "create") need(v.name, "name", "A new item needs a name.");
  else if (v.operation !== "export") need(v.target, "target", "Name the catalog item by its exact name or SKU.");
  if (v.operation === "edit") need([v.name, v.sku, v.unit, v.category, v.supplier, v.costDollars, v.priceDollars, v.notes, v.sourceUrl].some(x => x !== null), "name", "Nothing to change.");
});
export type MaterialsPropose = z.infer<typeof materialsProposeSchema>;

export type MaterialQuery = z.input<typeof materialQuerySchema>;

export function materialQueryFromURL(workspaceId: string, params: URLSearchParams): MaterialQuery {
  const optional = (key: string) => params.get(key) || undefined;
  return materialQuerySchema.parse({
    workspaceId, q: optional("q"), category: optional("category"), supplier: optional("supplier"), status: optional("status"),
    archived: params.get("archived") === "true", sort: optional("sort"), direction: optional("direction"),
    page: params.get("page") ? Number(params.get("page")) : undefined, pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
  });
}

export type MaterialView = {
  id: string; name: string; sku: string; unit: MaterialUnit; category: string; supplier: string;
  costCents: number | null; priceCents: number | null; marginPercent: number | null;
  notes: string; imageUrl: string; sourceUrl: string;
  status: MaterialStatus; archived: boolean; version: number; updatedAt: string;
  proposedByName: string | null; rejectionReason: string; duplicateOf: string | null;
};
export type MaterialListResult = {
  rows: MaterialView[]; total: number; page: number; pageSize: number;
  options: { categories: string[]; suppliers: string[] };
  pendingProposals: number;
  canManage: boolean; canPropose: boolean; canExport: boolean; canViewPrices: boolean; canViewCosts: boolean;
};
export { ZodError as MaterialContractError } from "zod";

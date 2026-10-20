import { z } from "zod";
export const customerValuesSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    type: z.enum(["person", "business"]),
    companyName: z.string().trim().max(200),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine(
        (value) =>
          !value ||
          (/^[+()\d\s.-]+$/.test(value) &&
            value.replace(/\D/g, "").length >= 7 &&
            value.replace(/\D/g, "").length <= 15),
      ),
    location: z.string().trim().max(500),
    internalNotes: z.string().trim().max(4000),
    ownerId: z.string().max(200),
  })
  .strict()
  .transform((value) => ({
    ...value,
    companyName: value.type === "business" ? value.companyName : "",
  }));
export type CustomerValues = z.output<typeof customerValuesSchema>;
export type CustomerRecord = CustomerValues & {
  id: string;
  number: string;
  createdAt: string;
  lastActivityAt: string;
  archived: boolean;
  openLeadCount: number;
  version: number;
};
export type CustomerCapabilities = {
  read: boolean;
  create: boolean;
  update: boolean;
  archive: boolean;
  delete: boolean;
  export: boolean;
  link: boolean;
  note: boolean;
};
export const customerQuerySchema = z
  .object({
    workspaceId: z.uuid(),
    q: z.string().trim().max(200).default(""),
    relationship: z.enum(["all", "lead"]).default("all"),
    owner: z.string().max(200).default("all"),
    type: z.enum(["all", "person", "business"]).default("all"),
    sort: z.enum(["name", "name-desc", "activity", "newest"]).default("name"),
    archived: z.boolean().default(false),
    page: z.number().int().min(1).max(100000).default(1),
    pageSize: z
      .union([z.literal(25), z.literal(50), z.literal(100)])
      .default(25),
  })
  .strict();
export type CustomerQuery = z.output<typeof customerQuerySchema>;
export function customerQueryFromURL(
  workspaceId: string,
  params: URLSearchParams,
) {
  return customerQuerySchema.parse({
    workspaceId,
    q: params.get("q") ?? "",
    relationship: params.get("relationship") ?? "all",
    owner: params.get("owner") ?? "all",
    type: params.get("type") ?? "all",
    sort: params.get("sort") ?? "name",
    archived: params.get("archived") === "true",
    page: Number(params.get("page") ?? 1),
    pageSize: Number(params.get("pageSize") ?? 25),
  });
}
export const customerCreateSchema = z
  .object({
    workspaceId: z.uuid(),
    submissionId: z.uuid(),
    values: customerValuesSchema,
    allowDuplicate: z.boolean().default(false),
  })
  .strict();
const expected = {
  workspaceId: z.uuid(),
  submissionId: z.uuid(),
  customerId: z.uuid(),
  expectedVersion: z.number().int().positive(),
};
export const customerMutationSchema = z.discriminatedUnion("action", [
  z
    .object({
      ...expected,
      action: z.literal("update"),
      values: customerValuesSchema,
    })
    .strict(),
  z
    .object({
      ...expected,
      action: z.literal("archive"),
      archived: z.boolean(),
    })
    .strict(),
  z
    .object({
      ...expected,
      action: z.literal("delete"),
      typedConfirmation: z.string().max(30),
      unlinkOpenLeads: z.boolean(),
    })
    .strict(),
  z
    .object({
      ...expected,
      action: z.literal("note"),
      body: z.string().trim().min(1).max(4000),
    })
    .strict(),
  z
    .object({
      ...expected,
      action: z.literal("link"),
      leadId: z.uuid(),
      expectedLeadVersion: z.number().int().positive(),
      unlink: z.boolean(),
      replace: z.boolean(),
      expectedPreviousCustomerId: z.uuid().nullable(),
    })
    .strict(),
]);
export type CustomerMutation = z.output<typeof customerMutationSchema>;
export const customerExportColumns = [
  "number",
  "name",
  "type",
  "companyName",
  "email",
  "phone",
  "location",
  "owner",
  "createdAt",
] as const;
export const customerExportSchema = z
  .object({
    query: customerQuerySchema,
    customerId: z.uuid().optional(),
    columns: z
      .array(z.enum(customerExportColumns))
      .min(1)
      .max(9)
      .refine((a) => new Set(a).size === a.length),
    expectedCount: z.number().int().min(1).max(50000),
  })
  .strict();
export type CustomerLead = {
  id: string;
  number: string;
  name: string;
  status: string;
  version: number;
  customerId: string | null;
  customerName?: string;
  canUnlink?: boolean;
};
export type CustomerEvent = {
  id: string;
  text: string;
  actor: string;
  createdAt: string;
  source: "customer" | "lead" | "job";
};
export type CustomerNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};
export type CustomerListResult = {
  rows: CustomerRecord[];
  total: number;
  page: number;
  members: { id: string; name: string }[];
  capabilities: CustomerCapabilities;
  totals: { customers: number; withOpenLeads: number };
  policyRevision: number;
  now: string;
};
export type CustomerDetailResult = {
  customer: CustomerRecord;
  leads: CustomerLead[];
  leadsTotal: number;
  events: CustomerEvent[];
  notes: CustomerNote[];
  activityTotal: number;
  notesTotal: number;
  members: { id: string; name: string }[];
  capabilities: CustomerCapabilities;
  policyRevision: number;
};

export const customerIdSchema = z.uuid();
export { ZodError as CustomerContractError } from "zod";

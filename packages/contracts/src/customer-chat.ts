import { z } from "zod";
import {
  customerValuesSchema,
  customerQuerySchema,
  customerExportColumns,
} from "./customer";
export const customerReadOperations = [
  "related_contact",
  "search",
  "details",
  "history",
  "linked_leads",
  "lead_candidates",
  "members",
] as const;
export const customerWriteOperations = [
  "create",
  "update",
  "assign",
  "add_note",
  "set_archived",
  "link_lead",
  "unlink_lead",
  "delete",
  "export_csv",
] as const;
export const customerOperationIds = [
  ...customerReadOperations,
  ...customerWriteOperations,
] as const;
export type CustomerOperationId = (typeof customerOperationIds)[number];
const ref = z.string().trim().max(64);
const filters = customerQuerySchema.omit({
  workspaceId: true,
  pageSize: true,
  page: true,
});
const intent = {
  related_contact: z.object({ leadRef: ref }).strict(),
  search: z.object({ filters }).strict(),
  details: z.object({ customerRef: ref }).strict(),
  history: z
    .object({
      customerRef: ref,
      mode: z.enum(["notes", "activity"]),
      page: z.number().int().min(1).max(100000),
    })
    .strict(),
  linked_leads: z
    .object({ customerRef: ref, page: z.number().int().min(1).max(100000) })
    .strict(),
  lead_candidates: z
    .object({ customerRef: ref, query: z.string().trim().max(200) })
    .strict(),
  members: z.object({ query: z.string().trim().min(1).max(200) }).strict(),
  create: z
    .object({ values: customerValuesSchema.in, allowDuplicate: z.boolean() })
    .strict(),
  update: z
    .object({
      customerRef: ref,
      changes: z
        .array(
          z
            .object({
              field: z.enum([
                "name",
                "type",
                "companyName",
                "email",
                "phone",
                "location",
                "internalNotes",
              ]),
              value: z.string().max(4000),
            })
            .strict(),
        )
        .min(1)
        .max(7)
        .refine((a) => new Set(a.map((x) => x.field)).size === a.length),
    })
    .strict(),
  assign: z
    .object({ customerRef: ref, teammateRef: z.string().trim().max(254) })
    .strict(),
  add_note: z
    .object({ customerRef: ref, body: z.string().trim().min(1).max(4000) })
    .strict(),
  set_archived: z.object({ customerRef: ref, archived: z.boolean() }).strict(),
  link_lead: z
    .object({ customerRef: ref, leadRef: ref, replace: z.boolean() })
    .strict(),
  unlink_lead: z.object({ customerRef: ref, leadRef: ref }).strict(),
  delete: z.object({ customerRef: ref }).strict(),
  export_csv: z
    .object({
      mode: z.enum(["filters", "current_filters", "customer"]),
      customerRef: ref,
      filters,
      columns: z
        .array(z.enum(customerExportColumns))
        .min(1)
        .max(9)
        .refine((a) => new Set(a).size === a.length),
    })
    .strict(),
};
export const customerIntentSchemas = intent;
export const customersQuerySchema = z
  .object({
    request: z.discriminatedUnion("operation", [
      z
        .object({
          operation: z.literal("related_contact"),
          input: intent.related_contact,
        })
        .strict(),
      z
        .object({ operation: z.literal("search"), input: intent.search })
        .strict(),
      z
        .object({ operation: z.literal("details"), input: intent.details })
        .strict(),
      z
        .object({ operation: z.literal("history"), input: intent.history })
        .strict(),
      z
        .object({
          operation: z.literal("linked_leads"),
          input: intent.linked_leads,
        })
        .strict(),
      z
        .object({
          operation: z.literal("lead_candidates"),
          input: intent.lead_candidates,
        })
        .strict(),
      z
        .object({ operation: z.literal("members"), input: intent.members })
        .strict(),
    ]),
  })
  .strict();
export const customersProposeSchema = z
  .object({
    request: z.discriminatedUnion("operation", [
      z
        .object({ operation: z.literal("create"), input: intent.create })
        .strict(),
      z
        .object({ operation: z.literal("update"), input: intent.update })
        .strict(),
      z
        .object({ operation: z.literal("assign"), input: intent.assign })
        .strict(),
      z
        .object({ operation: z.literal("add_note"), input: intent.add_note })
        .strict(),
      z
        .object({
          operation: z.literal("set_archived"),
          input: intent.set_archived,
        })
        .strict(),
      z
        .object({ operation: z.literal("link_lead"), input: intent.link_lead })
        .strict(),
      z
        .object({
          operation: z.literal("unlink_lead"),
          input: intent.unlink_lead,
        })
        .strict(),
      z
        .object({ operation: z.literal("delete"), input: intent.delete })
        .strict(),
      z
        .object({
          operation: z.literal("export_csv"),
          input: intent.export_csv,
        })
        .strict(),
    ]),
  })
  .strict();
export type CustomerChatRequest =
  | z.infer<typeof customersQuerySchema>["request"]
  | z.infer<typeof customersProposeSchema>["request"];
export const customerDraftSchema = z
  .object({
    id: z.uuid(),
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: z.string().datetime(),
    state: z.enum([
      "pending",
      "confirmed",
      "canceled",
      "expired",
      "superseded",
      "stale",
    ]),
    action: z.enum([
      "create",
      "update",
      "assign",
      "note",
      "archive",
      "restore",
      "link",
      "unlink",
      "delete",
      "export",
    ]),
    customer: z
      .object({
        id: z.uuid().optional(),
        name: z.string().max(200),
        number: z.string().max(32),
      })
      .strict(),
    changes: z
      .array(
        z
          .object({
            label: z.string().max(200),
            before: z.string().max(4500),
            after: z.string().max(4500),
          })
          .strict(),
      )
      .max(20),
    impact: z.string().max(1000).optional(),
    unlinkLeadCount: z.number().int().nonnegative().optional(),
    count: z.number().int().nonnegative().optional(),
    columns: z.array(z.string().max(100)).max(9).optional(),
  })
  .strict();
export type CustomerChatDraft = z.infer<typeof customerDraftSchema>;
export const customerChatResultSchema = z
  .object({
    turnId: z.uuid().optional(),
    kind: z.enum([
      "search",
      "details",
      "history",
      "linked_leads",
      "lead_candidates",
      "members",
      "proposal",
      "outcome",
    ]),
    title: z.string().max(200),
    total: z.number().int().nonnegative(),
    records: z
      .array(
        z
          .object({
            id: z.uuid(),
            number: z.string().max(40),
            name: z.string().max(200),
            detail: z.string().max(500),
          })
          .strict(),
      )
      .max(25),
    fields: z
      .array(
        z
          .object({ label: z.string().max(200), value: z.string().max(4500) })
          .strict(),
      )
      .max(30),
    entries: z
      .array(
        z
          .object({
            id: z.string().max(100),
            text: z.string().max(4500),
            actor: z.string().max(200),
            createdAt: z.string().max(100),
          })
          .strict(),
      )
      .max(20),
    draft: customerDraftSchema.optional(),
  })
  .strict();
export type CustomerChatResult = z.infer<typeof customerChatResultSchema>;
export const customerChatDecisionSchema = z
  .object({
    workspaceId: z.uuid(),
    draftId: z.uuid(),
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    decision: z.enum(["confirm", "cancel"]),
    typedConfirmation: z.string().max(32).optional(),
    unlinkOpenLeads: z.boolean().optional(),
  })
  .strict();
export const customerChatNavigateSchema = z
  .object({
    workspaceId: z.uuid(),
    turnId: z.uuid(),
    recordId: z.uuid(),
    kind: z.enum(["customer", "lead"]),
  })
  .strict();

export function customerIntentJSONSchema(operation: CustomerOperationId) {
  const schema = z.toJSONSchema(customerIntentSchemas[operation]);
  delete schema.$schema;
  return schema;
}

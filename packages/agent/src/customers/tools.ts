import {
  customersQuerySchema,
  customersProposeSchema,
  customerReadOperations,
  customerWriteOperations,
  customerIntentJSONSchema,
  type CustomerOperationId,
  type AuthorizationContext,
  type ChatToolId,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
export const customersQueryTool = {
  kind: "read",
  inputSchema: customersQuerySchema,
  progress: "retrieving",
} as const;
export const customersProposeTool = {
  kind: "draft",
  inputSchema: customersProposeSchema,
  progress: "preparing_draft",
} as const;
const permission = {
  related_contact: "customers.related.read",
  search: "customers.read",
  details: "customers.read",
  history: "customers.read",
  linked_leads: "customers.read",
  lead_candidates: "customers.update",
  members: "customers.update",
  create: "customers.create",
  update: "customers.update",
  assign: "customers.update",
  add_note: "customers.read",
  set_archived: "customers.archive",
  link_lead: "customers.update",
  unlink_lead: "customers.update",
  delete: "customers.delete",
  export_csv: "customers.export",
} as const;
export function availableCustomerOperations(
  context: AuthorizationContext,
): CustomerOperationId[] {
  if (!authorize(context, { permission: "assistant.use" }).allowed) return [];
  const related =
    context.enabledPermissions.includes("customers.related.read") &&
    context.policy.grants.some(
      (g) =>
        g.role === context.membership.role &&
        g.permission === "customers.related.read",
    ) &&
    context.enabledPermissions.includes("leads.read") &&
    context.policy.grants.some(
      (g) =>
        g.role === context.membership.role && g.permission === "leads.read",
    )
      ? ["related_contact" as const]
      : [];
  if (
    !authorize(context, {
      permission: "customers.read",
      resource: {
        kind: "customer",
        id: "capability",
        workspaceId: context.workspaceId,
        related: [],
      },
    }).allowed
  )
    return related;
  return [
    ...related,
    ...customerReadOperations.filter((op) => op !== "related_contact"),
    ...customerWriteOperations,
  ].filter((op) => {
    if (
      ["lead_candidates", "link_lead", "unlink_lead"].includes(op) &&
      (!resolveAuthorizedCollectionScope(context, "leads.read").allowed ||
        !authorize(context, {
          permission: "leads.update",
          fields: ["customerId"],
          resource: {
            kind: "lead",
            id: "capability",
            workspaceId: context.workspaceId,
            ownerId: context.userId,
          },
        }).allowed)
    )
      return false;
    return (
      op === "related_contact" ||
      authorize(context, {
        permission: permission[op],
        ...(permission[op] === "customers.create"
          ? {}
          : {
              resource: {
                kind: "customer" as const,
                id: "capability",
                workspaceId: context.workspaceId,
                related: [],
              },
            }),
      }).allowed
    );
  });
}
export function customerModelDefinition(
  tool: ChatToolId,
  operations: readonly CustomerOperationId[],
) {
  const read = new Set<CustomerOperationId>(customerReadOperations);
  const ops = operations.filter((op) =>
    tool === "customers_query" ? read.has(op) : !read.has(op),
  );
  return {
    type: "function" as const,
    function: {
      name: tool,
      strict: true,
      description:
        "Customer workspace operations: " +
        ops.join(", ") +
        ". Read current authorized data or prepare ONE exact review proposal; never commit. customerRef empty means current customer detail, otherwise exact CU-number/UUID. No guessed IDs, SQL or permission overrides.",
      parameters: {
        type: "object",
        properties: {
          request: {
            anyOf: ops.map((op) => {
              const input = customerIntentJSONSchema(op);
              return {
                type: "object",
                properties: {
                  operation: { type: "string", enum: [op] },
                  input,
                },
                required: ["operation", "input"],
                additionalProperties: false,
              };
            }),
          },
        },
        required: ["request"],
        additionalProperties: false,
      },
    },
  };
}

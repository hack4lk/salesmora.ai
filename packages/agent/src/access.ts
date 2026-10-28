import { canProposeCalendarSchedule } from './calendar/tools';
import { availableCustomerOperations } from "./customers/tools";
import { canProposeEstimateAction } from "./estimates/tools";
import { canQueryMaterials, availableMaterialOperations } from "./materials/tools";
import { canQueryWorkOrders, availableWorkOrderOperations } from "./work-orders/tools";
import {
  chatSurfaceKeySchema,
  chatSurfaceKeys,
  chatToolIdSchema,
  chatTurnRequestSchema,
  leadCapabilities,
  type AuthorizationContext,
  type ChatSurfaceKey,
  type ChatToolId,
} from "@salesmora/contracts";
import {
  authorizeLeadOperation,
  availableLeadOperations,
} from "./leads/authorization";
import {
  authorize,
  resolveAuthorizedCollectionScope,
  type AuthorizationDecision,
} from "@salesmora/domain";

/** Registered surfaces constrain relevance; they never grant app permissions. */
export const chatSurfaceRegistry = Object.fromEntries(
  chatSurfaceKeys.map((surface) => [
    surface,
    [
      "search_help",
      "calendar_query",
      "calendar_propose_action",
      "customers_query",
      "customers_propose_action",
      "work_orders_query",
      "materials_query",
      "materials_propose_action",
      "work_orders_propose_action",
      ...(surface === "estimates.list" ||
      surface === "estimate.editor" ||
      surface === "estimate.detail" ||
      surface === "lead.detail" ||
      surface === "customer.detail" ||
      surface === "home"
        ? ["estimates_query" as const, "estimates_propose_action" as const]
        : []),
      ...new Set(
        Object.values(leadCapabilities)
          .filter((entry) => entry.surfaces.some((value) => value === surface))
          .map((entry) => entry.tool),
      ),
    ],
  ]),
) as unknown as Readonly<Record<ChatSurfaceKey, readonly ChatToolId[]>>;
const denied = (): AuthorizationDecision => ({
  allowed: false,
  reason: "chat-access-denied",
});

/** Fresh repository context required on every turn. Parsing never authenticates the caller. */
export function authorizeChatTurn(
  context: AuthorizationContext,
  request: unknown,
): AuthorizationDecision {
  const parsed = chatTurnRequestSchema.safeParse(request);
  if (!parsed.success || parsed.data.workspaceId !== context.workspaceId)
    return denied();
  return authorize(context, { permission: "assistant.use" });
}

/** Recheck inside each tool invocation with fresh server facts, not a cached advertised list.
 * implementedTools comes from the server runtime; an omitted list disables all tools.
 * Collection decisions carry mandatory SQL constraints. Draft access never authorizes a commit.
 */
export function authorizeChatTool(
  context: AuthorizationContext,
  surface: unknown,
  tool: unknown,
  implementedTools: readonly ChatToolId[] = [],
): AuthorizationDecision {
  const surfaceResult = chatSurfaceKeySchema.safeParse(surface);
  const toolResult = chatToolIdSchema.safeParse(tool);
  if (!surfaceResult.success || !toolResult.success) return denied();
  const id = toolResult.data;
  if (
    !implementedTools.includes(id) ||
    !chatSurfaceRegistry[surfaceResult.data].includes(id)
  )
    return denied();
  const assistant = authorize(context, { permission: "assistant.use" });
  if (!assistant.allowed) return denied();
  switch (id) {
    case "calendar_propose_action":
      return canProposeCalendarSchedule(context) ? assistant : denied();
    case "calendar_query":
      return resolveAuthorizedCollectionScope(context, "calendar.read");
    // Retrieval must additionally filter every article by its current required app permissions.
    case "search_help":
      return assistant;
    case "estimates_query":
      return resolveAuthorizedCollectionScope(context, "estimates.read");
    case "estimates_propose_action":
      return canProposeEstimateAction(context) ? assistant : denied();
    case "materials_propose_action":
      return availableMaterialOperations(context).length ? assistant : denied();
    case "materials_query":
      return canQueryMaterials(context) ? assistant : denied();
    case "work_orders_query":
      return canQueryWorkOrders(context) ? assistant : denied();
    case "work_orders_propose_action":
      return availableWorkOrderOperations(context).length ? assistant : denied();
    case "customers_query":
      return availableCustomerOperations(context).some((op) =>
        [
          "related_contact",
          "search",
          "details",
          "history",
          "linked_leads",
          "lead_candidates",
          "members",
        ].includes(op),
      )
        ? assistant
        : denied();
    case "customers_propose_action":
      return availableCustomerOperations(context).some(
        (op) =>
          ![
            "related_contact",
            "search",
            "details",
            "history",
            "linked_leads",
            "lead_candidates",
            "members",
          ].includes(op),
      )
        ? assistant
        : denied();
    case "leads_query":
    case "leads_propose_action": {
      const operation = availableLeadOperations(
        context,
        surfaceResult.data,
      ).find((operation) => leadCapabilities[operation].tool === id);
      return operation
        ? authorizeLeadOperation(context, surfaceResult.data, operation)
        : denied();
    }
  }
}

export function availableChatTools(
  context: AuthorizationContext,
  surface: unknown,
  implementedTools: readonly ChatToolId[] = [],
): ChatToolId[] {
  return implementedTools.filter(
    (tool) =>
      authorizeChatTool(context, surface, tool, implementedTools).allowed,
  );
}

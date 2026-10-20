import { customersQuery, customersPropose } from "../customers";
import "server-only";
import { isImplementedTool, type ImplementedToolId } from "@salesmora/agent";
import { leadsQuery, leadsProposeAction } from "../leads";
import { searchHelp } from "./search-help";
import { materialsQuery } from "./materials";
import { workOrdersQuery } from "./work-orders";
import { materialsPropose } from "../materials-actions";
import { workOrdersPropose } from "../work-orders-actions";
import type { ChatToolContext, ChatToolHandler } from "./types";

/** Keep this explicit and exhaustive: a definition requires a server handler to execute. */
const handlers = {
  customers_query: customersQuery,
  customers_propose_action: customersPropose,
  leads_propose_action: leadsProposeAction,
  search_help: searchHelp,
  leads_query: leadsQuery,
  work_orders_query: workOrdersQuery,
  materials_query: materialsQuery,
  materials_propose_action: materialsPropose,
  work_orders_propose_action: workOrdersPropose,
} satisfies Record<ImplementedToolId, ChatToolHandler>;
export function createChatToolExecutor(context: ChatToolContext) {
  return async (name: ImplementedToolId, args: unknown) => {
    context.signal.throwIfAborted();
    if (!isImplementedTool(name)) throw Error("Unavailable tool");
    return handlers[name](context, args);
  };
}

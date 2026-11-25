import { workflowsPrepare } from './workflows';
import { captureQuery, capturePropose } from './lead-capture';
import { calendarQuery,calendarPropose } from './calendar';
import { customersQuery, customersPropose } from "../customers";
import "server-only";
import { isImplementedTool, liveChatTools, type ImplementedToolId } from "@salesmora/agent";
import { AuthorizationAccessError } from "@salesmora/data";
import { leadsQuery, leadsProposeAction } from "../leads";
import { prepareHelpSearch } from "./search-help";
import { materialsQuery } from "./materials";
import { workOrdersQuery } from "./work-orders";
import { estimatesQuery } from "./estimates";
import { estimatesPropose } from "./estimate-drafts";
import { materialsPropose } from "../materials-actions";
import { workOrdersPropose } from "../work-orders-actions";
import type { ChatToolRequestContext } from "./types";
import { reportsQuery } from "./reports";
import { executeChatTool, type ChatToolDefinition } from './runner';

/** Keep this explicit and exhaustive: a definition requires a server handler to execute. */
const handlers = {
  workflows_prepare: { execute: workflowsPrepare },
  reports_query: { execute: reportsQuery },
  lead_capture_query: { execute: captureQuery },
  lead_capture_propose_action: { execute: capturePropose },
  calendar_query: { execute: calendarQuery },
  calendar_propose_action: { execute: calendarPropose },
  customers_query: { execute: customersQuery },
  customers_propose_action: { execute: customersPropose },
  leads_propose_action: { execute: leadsProposeAction },
  search_help: { prepare: prepareHelpSearch },
  leads_query: { execute: leadsQuery },
  work_orders_query: { execute: workOrdersQuery },
  estimates_query: { execute: estimatesQuery },
  estimates_propose_action: { execute: estimatesPropose },
  materials_query: { execute: materialsQuery },
  materials_propose_action: { execute: materialsPropose },
  work_orders_propose_action: { execute: workOrdersPropose },
} satisfies Record<ImplementedToolId, ChatToolDefinition>;
export function createChatToolExecutor(context: ChatToolRequestContext) {
  return async (name: string, args: unknown) => {
    context.signal.throwIfAborted();
    if (!isImplementedTool(name)) throw Error("Unavailable tool");
    if (!liveChatTools.includes(name)) throw new AuthorizationAccessError();
    return executeChatTool(context, name, args, handlers[name]);
  };
}

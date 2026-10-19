import { customersQueryTool, customersProposeTool } from "../customers/tools";
import type {
  ChatToolId,
  HelpSource,
  ChatActionReview,
} from "@salesmora/contracts";
import { leadsQueryTool, leadsProposeActionTool } from "../leads/tools";
import { workOrdersQueryTool, workOrdersProposeTool } from "../work-orders/tools";
import { searchHelpTool } from "./search-help";

/** Explicit read-only implementations. Planned tool IDs never become executable automatically. */
export const readToolRegistry = {
  customers_query: customersQueryTool,
  search_help: searchHelpTool,
  leads_query: leadsQueryTool,
  work_orders_query: workOrdersQueryTool,
} as const satisfies Partial<Record<ChatToolId, { kind: "read" }>>;
export type ImplementedReadToolId = keyof typeof readToolRegistry;
export const implementedReadTools: readonly ChatToolId[] = Object.keys(
  readToolRegistry,
) as ImplementedReadToolId[];
export function isImplementedReadTool(
  name: string,
): name is ImplementedReadToolId {
  return Object.hasOwn(readToolRegistry, name);
}
export interface ReadToolResult {
  evidence: unknown;
  sources?: HelpSource[];
}

/** Draft preparation is separate from reads. There is deliberately no commit tool. */
export const toolRegistry = {
  ...readToolRegistry,
  customers_propose_action: customersProposeTool,
  work_orders_propose_action: workOrdersProposeTool,
  leads_propose_action: leadsProposeActionTool,
} as const satisfies Partial<Record<ChatToolId, { kind: "read" | "draft" }>>;
export type ImplementedToolId = keyof typeof toolRegistry;
export const implementedTools: readonly ChatToolId[] = Object.keys(
  toolRegistry,
) as ImplementedToolId[];
export function isImplementedTool(name: string): name is ImplementedToolId {
  return Object.hasOwn(toolRegistry, name);
}
export interface ToolResult extends ReadToolResult {
  customerResult?: import("@salesmora/contracts").CustomerChatResult;
  workOrderResult?: import("@salesmora/contracts").WorkOrderChatResult;
  action?: ChatActionReview;
  historyResult?: import("@salesmora/contracts").LeadHistoryResult;
  detailsResult?: import("@salesmora/contracts").LeadDetailsResult;
  searchResult?: import("@salesmora/contracts").LeadSearchResult;
}

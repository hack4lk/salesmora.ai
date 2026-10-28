import { calendarQueryTool, calendarProposeTool } from '../calendar/tools';
import { customersQueryTool, customersProposeTool } from "../customers/tools";
import type {
  ChatToolId,
  HelpSource,
  ChatActionReview,
} from "@salesmora/contracts";
import { leadsQueryTool, leadsProposeActionTool } from "../leads/tools";
import { workOrdersQueryTool, workOrdersProposeTool } from "../work-orders/tools";
import { materialsQueryTool, materialsProposeTool } from "../materials/tools";
import { searchHelpTool } from "./search-help";
import { estimatesQueryTool, estimatesProposeTool } from "../estimates/tools";

/** Explicit read-only implementations. Planned tool IDs never become executable automatically. */
export const readToolRegistry = {
  calendar_query: calendarQueryTool,
  customers_query: customersQueryTool,
  search_help: searchHelpTool,
  leads_query: leadsQueryTool,
  work_orders_query: workOrdersQueryTool,
  materials_query: materialsQueryTool,
  estimates_query: estimatesQueryTool,
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
  calendar_propose_action: calendarProposeTool,
  estimates_propose_action: estimatesProposeTool,
  customers_propose_action: customersProposeTool,
  work_orders_propose_action: workOrdersProposeTool,
  materials_propose_action: materialsProposeTool,
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
  calendarProposal?: import("@salesmora/contracts").CalendarProposalTicket;
  calendarResult?: import("@salesmora/contracts").CalendarChatResult;
  estimateDraft?: import("@salesmora/contracts").EstimateDraftChatView;
  estimateSharing?: import("@salesmora/contracts").EstimateShareChatTicket;
  estimateDecision?: import("@salesmora/contracts").EstimateDecisionChatTicket;
  estimateDraftAction?: import("@salesmora/contracts").EstimateDraftActionChatTicket;
  estimateVoid?: import("@salesmora/contracts").EstimateVoidChatTicket;
  estimateArchive?: import("@salesmora/contracts").EstimateArchiveChatTicket;
  estimateDraftDelete?: import("@salesmora/contracts").EstimateDraftDeleteChatTicket;
  estimateConversion?: import("@salesmora/contracts").EstimateConversionChatTicket;
  estimateResult?: import("@salesmora/contracts").EstimateChatResult;
  customerResult?: import("@salesmora/contracts").CustomerChatResult;
  workOrderResult?: import("@salesmora/contracts").WorkOrderChatResult;
  action?: ChatActionReview;
  historyResult?: import("@salesmora/contracts").LeadHistoryResult;
  detailsResult?: import("@salesmora/contracts").LeadDetailsResult;
  searchResult?: import("@salesmora/contracts").LeadSearchResult;
}

import { customerChatResultSchema } from "./customer-chat";
import { customerQuerySchema } from "./customer";
import { workOrderChatResultSchema } from "./work-order-chat";
import { leadHistoryResultSchema } from "./lead-history";
import { z } from "zod";
import { leadDetailsResultSchema } from "./lead-details";
import {
  leadSearchResultSchema,
  leadSearchEvidenceSchema,
} from "./lead-search";
import { leadToolNames } from "./lead-capabilities";
import { leadExportSchema } from "./lead-export";
import { helpSourceSchema } from "./knowledge";
import { chatActionReviewSchema } from "./chat-actions";

export const chatSurfaceKeys = [
  "customers.list",
  "customer.detail",
  "work_order.list",
  "work_order.detail",
  "home",
  "leads.create",
  "leads.list",
  "lead.detail",
  "settings.overview",
  "settings.permissions",
] as const;
export const chatSurfaceKeySchema = z.enum(chatSurfaceKeys);
export type ChatSurfaceKey = z.infer<typeof chatSurfaceKeySchema>;
export const chatToolIds = [
  "search_help",
  "customers_query",
  "customers_propose_action",
  "work_orders_query",
  "work_orders_propose_action",
  ...leadToolNames,
] as const;
export const chatToolIdSchema = z.enum(chatToolIds);
export type ChatToolId = z.infer<typeof chatToolIdSchema>;

export const chatRecordRefsSchema = z
  .array(
    z.object({ type: z.enum(["lead", "customer", "work_order"]), id: z.uuid() }).strict(),
  )
  .max(1);
export const chatUIStateSchema = z
  .object({
    view: z.enum(["list", "pipeline"]),
    filters: leadExportSchema.shape.filters,
  })
  .strict();
export const chatPageContextSchema = z
  .object({
    recordRefs: chatRecordRefsSchema.optional(),
    uiState: chatUIStateSchema.optional(),
    customerFilters: customerQuerySchema
      .omit({ workspaceId: true, page: true, pageSize: true })
      .optional(),
  })
  .strict();
export type ChatPageContext = z.infer<typeof chatPageContextSchema>;
export const chatLeadEvidenceSchema = z
  .array(
    z
      .object({
        id: z.uuid(),
        version: z.number().int().positive(),
        ownerStamp: z
          .string()
          .regex(/^[a-f0-9]{64}$/)
          .optional(),
      })
      .strict(),
  )
  .max(50);
export type ChatLeadEvidence = z.infer<typeof chatLeadEvidenceSchema>;

/** Browser intent only. Identity, policy, history, tool lists and prompts are server-owned. */
export const chatTurnRequestSchema = z
  .object({
    workspaceId: z.uuid(),
    threadId: z.uuid().optional(),
    clientTurnId: z.uuid(),
    surfaceKey: chatSurfaceKeySchema,
    message: z.string().trim().min(1).max(4000),
    recordRefs: chatRecordRefsSchema.optional(),
    uiState: chatUIStateSchema.optional(),
    customerFilters: customerQuerySchema
      .omit({ workspaceId: true, page: true, pageSize: true })
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.recordRefs?.length &&
      !["lead.detail", "customer.detail", "work_order.detail"].includes(
        value.surfaceKey,
      )
    )
      ctx.addIssue({
        code: "custom",
        path: ["recordRefs"],
        message: "Record context is only supported on lead details.",
      });
    if (
      value.recordRefs?.some(
        (ref) =>
          ref.type !==
          (value.surfaceKey === "customer.detail"
            ? "customer"
            : value.surfaceKey === "work_order.detail"
              ? "work_order"
              : "lead"),
      )
    )
      ctx.addIssue({
        code: "custom",
        path: ["recordRefs"],
        message: "Invalid record type.",
      });
    if (value.customerFilters && value.surfaceKey !== "customers.list")
      ctx.addIssue({
        code: "custom",
        path: ["customerFilters"],
        message: "Invalid customer filter context.",
      });
    if (value.uiState && value.surfaceKey !== "leads.list")
      ctx.addIssue({
        code: "custom",
        path: ["uiState"],
        message: "Filter context is only supported on the Leads list.",
      });
    if (
      value.uiState?.filters.created === "custom" &&
      (!value.uiState.filters.from ||
        !value.uiState.filters.to ||
        value.uiState.filters.from > value.uiState.filters.to)
    )
      ctx.addIssue({
        code: "custom",
        path: ["uiState"],
        message: "Invalid filter dates.",
      });
  });
export type ChatTurnRequest = z.infer<typeof chatTurnRequestSchema>;
export const chatHistoryQuerySchema = z
  .object({ workspace: z.uuid(), thread: z.uuid().optional() })
  .strict();
export const chatThreadDeleteSchema = z
  .object({ workspaceId: z.uuid(), threadId: z.uuid() })
  .strict();
export const chatCancelSchema = z
  .object({ workspaceId: z.uuid(), turnId: z.uuid() })
  .strict();

const envelope = {
  version: z.literal(1),
  runId: z.uuid(),
  turnId: z.uuid(),
  sequence: z.number().int().positive(),
};
/** Product events, never raw provider events or internal reasoning/tool arguments. */
export const chatStreamEventSchema = z.discriminatedUnion("type", [
  z
    .object({
      ...envelope,
      type: z.literal("turn.accepted"),
      threadId: z.uuid(),
      messageId: z.uuid(),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("status"),
      status: z.enum(["thinking", "retrieving", "preparing_draft"]),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("message.delta"),
      messageId: z.uuid(),
      text: z.string().min(1).max(8000),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("sources"),
      messageId: z.uuid(),
      sources: z.array(helpSourceSchema).max(3),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("customers.result"),
      messageId: z.uuid(),
      result: customerChatResultSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("work_orders.result"),
      messageId: z.uuid(),
      result: workOrderChatResultSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("lead.history"),
      messageId: z.uuid(),
      result: leadHistoryResultSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("lead.details"),
      messageId: z.uuid(),
      result: leadDetailsResultSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("leads.results"),
      messageId: z.uuid(),
      result: leadSearchResultSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("action.proposed"),
      messageId: z.uuid(),
      action: chatActionReviewSchema,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("turn.completed"),
      messageId: z.uuid(),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("turn.cancelled"),
      messageId: z.uuid(),
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("turn.failed"),
      messageId: z.uuid(),
      code: z.enum([
        "access_denied",
        "rate_limited",
        "provider_unavailable",
        "timeout",
        "interrupted",
        "budget_exceeded",
      ]),
    })
    .strict(),
]);
export type ChatStreamEvent = z.infer<typeof chatStreamEventSchema>;

export const chatRunStates = [
  "accepted",
  "running",
  "completed",
  "failed",
  "cancelled",
  "interrupted",
] as const;
export type ChatRunState = (typeof chatRunStates)[number];

export const chatHistoryResponseSchema = z
  .object({
    threadId: z.uuid(),
    turns: z
      .array(
        z
          .object({
            id: z.uuid(),
            state: z.enum(chatRunStates),
            clientTurnId: z.uuid(),
            createdAt: z.string(),
            customerResult: customerChatResultSchema.optional(),
            customerStamp: z.string().optional(),
            workOrderResult: workOrderChatResultSchema.optional(),
            surfaceKey: chatSurfaceKeySchema.optional(),
            pageContext: chatPageContextSchema.optional(),
            leadEvidence: chatLeadEvidenceSchema.optional(),
            searchEvidence: leadSearchEvidenceSchema.optional(),
            searchResult: leadSearchResultSchema.optional(),
            detailsResult: leadDetailsResultSchema.optional(),
            historyResult: leadHistoryResultSchema.optional(),
            sources: z.array(helpSourceSchema).max(3),
            action: chatActionReviewSchema.optional(),
          })
          .strict(),
      )
      .max(50),
    messages: z
      .array(
        z
          .object({
            id: z.uuid(),
            turnId: z.uuid(),
            role: z.enum(["user", "assistant"]),
            text: z.string().max(32000),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
export const helpSearchInputSchema = z
  .object({ query: z.string().trim().min(1).max(1000) })
  .strict();
export { pipelineInputSchema } from "./lead-capabilities";

export const chatReplayResponseSchema = z
  .object({
    replay: z.literal(true),
    threadId: z.uuid(),
    turnId: z.uuid(),
    state: z.enum(chatRunStates),
  })
  .strict();

export function mergeChatLeadEvidence(
  ...groups: readonly ChatLeadEvidence[]
): ChatLeadEvidence {
  const merged = new Map<string, ChatLeadEvidence[number]>();
  for (const source of groups.flat()) {
    const prior = merged.get(source.id);
    merged.set(source.id, {
      ...prior,
      ...source,
      ...((source.ownerStamp ?? prior?.ownerStamp)
        ? { ownerStamp: source.ownerStamp ?? prior?.ownerStamp }
        : {}),
    });
  }
  return [...merged.values()];
}

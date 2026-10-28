import { calendarProposalTicketSchema, calendarProposalEvidenceSchema } from './calendar-proposal';
import { calendarVisitReferenceSchema, calendarChatContextSchema, calendarChatResultSchema } from './calendar-chat';
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
import { estimateChatFilterSchema, estimateChatResultSchema } from "./estimate-chat";
import { estimateDraftChatViewSchema } from "./estimate-draft-chat";
import { estimateShareChatTicketSchema } from "./estimate-share-chat";
import { estimateDecisionChatTicketSchema } from "./estimate-decision-chat";
import { estimateDraftActionChatTicketSchema } from "./estimate-draft-action-chat";
import { estimateVoidChatTicketSchema } from "./estimate-void-chat";
import { estimateArchiveChatTicketSchema } from "./estimate-archive-chat";
import { estimateDraftDeleteChatTicketSchema } from "./estimate-draft-delete-chat";
import { estimateConversionChatTicketSchema } from "./estimate-conversion-chat";

export const estimateDecisionEvidenceSchema = z.array(z.uuid()).max(7);
export const estimateDraftActionEvidenceSchema = z.array(z.uuid()).max(7);
export const estimateVoidEvidenceSchema = z.array(z.uuid()).max(7);
export const estimateArchiveEvidenceSchema = z.array(z.uuid()).max(7);
export const estimateDraftDeleteEvidenceSchema = z.array(z.uuid()).max(7);
export const estimateConversionEvidenceSchema = z.array(z.uuid()).max(7);

export const chatSurfaceKeys = [
  "customers.list",
  "customer.detail",
  "work_order.list",
  "work_order.detail",
  "materials.list",
  "estimates.list",
  "estimate.editor",
  "estimate.detail",
  "home",
  "calendar",
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
  "calendar_query",
  "calendar_propose_action",
  "customers_query",
  "customers_propose_action",
  "work_orders_query",
  "work_orders_propose_action",
  "materials_query",
  "materials_propose_action",
  ...leadToolNames,
  "estimates_query",
  "estimates_propose_action",
] as const;
export const chatToolIdSchema = z.enum(chatToolIds);
export type ChatToolId = z.infer<typeof chatToolIdSchema>;

export const chatRecordRefsSchema = z
  .array(
    z.object({ type: z.enum(["lead", "customer", "work_order", "estimate"]), id: z.uuid() }).strict(),
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
    estimateFilters: estimateChatFilterSchema.optional(),
    calendarFilters: calendarChatContextSchema.optional(),
    calendarVisit: calendarVisitReferenceSchema.optional(),
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
    estimateFilters: estimateChatFilterSchema.optional(),
    calendarFilters: calendarChatContextSchema.optional(),
    calendarVisit: calendarVisitReferenceSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.calendarVisit && value.surfaceKey !== 'calendar') ctx.addIssue({ code:'custom',path:['calendarVisit'],message:'Invalid Calendar visit context.' });
    if (value.calendarFilters && value.surfaceKey !== "calendar") ctx.addIssue({ code: "custom", path: ["calendarFilters"], message: "Invalid Calendar context." });
    if (
      value.recordRefs?.length &&
      !["lead.detail", "customer.detail", "work_order.detail", "estimate.detail", "estimate.editor"].includes(
        value.surfaceKey,
      )
    )
      ctx.addIssue({
        code: "custom",
        path: ["recordRefs"],
        message: "Record context is only supported on record detail pages.",
      });
    if (
      value.recordRefs?.some(
        (ref) =>
          ref.type !==
          (value.surfaceKey === "customer.detail"
            ? "customer"
            : value.surfaceKey === "work_order.detail"
              ? "work_order"
                : value.surfaceKey === "estimate.detail" || value.surfaceKey === "estimate.editor"
                  ? "estimate"
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
    if (value.estimateFilters && value.surfaceKey !== "estimates.list")
      ctx.addIssue({
        code: "custom",
        path: ["estimateFilters"],
        message: "Filter context is only supported on the Estimates list.",
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
  z.object({ ...envelope, type: z.literal("calendar.proposal"), messageId:z.uuid(),result:calendarProposalTicketSchema }).strict(),
  z.object({ ...envelope, type: z.literal("calendar.result"), messageId: z.uuid(), result: calendarChatResultSchema }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.void"),
    messageId: z.uuid(),
    result: estimateVoidChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.archive"),
    messageId: z.uuid(),
    result: estimateArchiveChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.draft_delete"),
    messageId: z.uuid(),
    result: estimateDraftDeleteChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.convert"),
    messageId: z.uuid(),
    result: estimateConversionChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.draft_action"),
    messageId: z.uuid(),
    result: estimateDraftActionChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.decision"),
    messageId: z.uuid(),
    result: estimateDecisionChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.sharing"),
    messageId: z.uuid(),
    result: estimateShareChatTicketSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.draft"),
    messageId: z.uuid(),
    result: estimateDraftChatViewSchema,
  }).strict(),
  z.object({
    ...envelope,
    type: z.literal("estimates.result"),
    messageId: z.uuid(),
    result: estimateChatResultSchema,
  }).strict(),
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
            calendarResult: calendarChatResultSchema.optional(),
            calendarProposal: calendarProposalTicketSchema.optional(),
            calendarProposalEvidence: calendarProposalEvidenceSchema.optional(),
            calendarStamp: z.string().regex(/^[a-f0-9]{64}$/).optional(),
            estimateResult: estimateChatResultSchema.optional(),
            estimateDraft: estimateDraftChatViewSchema.optional(),
            estimateSharing: estimateShareChatTicketSchema.optional(),
            estimateDecision: estimateDecisionChatTicketSchema.optional(),
            estimateDecisionEvidence: estimateDecisionEvidenceSchema.optional(),
            estimateDraftAction: estimateDraftActionChatTicketSchema.optional(),
            estimateDraftActionEvidence: estimateDraftActionEvidenceSchema.optional(),
            estimateVoid: estimateVoidChatTicketSchema.optional(),
            estimateVoidEvidence: estimateVoidEvidenceSchema.optional(),
            estimateArchive: estimateArchiveChatTicketSchema.optional(),
            estimateArchiveEvidence: estimateArchiveEvidenceSchema.optional(),
            estimateDraftDelete: estimateDraftDeleteChatTicketSchema.optional(),
            estimateDraftDeleteEvidence: estimateDraftDeleteEvidenceSchema.optional(),
            estimateConversion: estimateConversionChatTicketSchema.optional(),
            estimateConversionEvidence: estimateConversionEvidenceSchema.optional(),
            estimateStamp: z.string().regex(/^[a-f0-9]{32}$/).optional(),
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

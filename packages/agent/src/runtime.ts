import type {
  CustomerOperationId,
  CustomerChatResult,
} from "@salesmora/contracts";
import {
  Annotation,
  StateGraph,
  START,
  END,
  type BaseCheckpointSaver,
} from "@langchain/langgraph";
import {
  AIBudgetExceededError,
  type ChatSurfaceKey,
  type ChatToolId,
  type HelpSource,
  type ChatActionReview,
  type LeadOperationId,
  isLeadOperation,
} from "@salesmora/contracts";
import {
  isImplementedTool,
  toolRegistry,
  type ImplementedToolId,
  type ToolResult,
} from "./tools/registry";
export type RuntimeMessage = { role: "user" | "assistant"; text: string };
export type RuntimeCall = { name: string; args: unknown };
export interface ConversationModel {
  plan(
    messages: RuntimeMessage[],
    tools: readonly ChatToolId[],
    signal: AbortSignal,
    operations?: readonly LeadOperationId[],
    customerOperations?: readonly CustomerOperationId[],
  ): Promise<RuntimeCall[]>;
  answer(
    messages: RuntimeMessage[],
    evidence: unknown[],
    signal: AbortSignal,
    tools?: readonly ChatToolId[],
    operations?: readonly LeadOperationId[],
    customerOperations?: readonly CustomerOperationId[],
  ): AsyncIterable<string>;
}
export interface RuntimeDependencies {
  model: ConversationModel;
  checkpointer: BaseCheckpointSaver;
  authorize: (
    tool?: ChatToolId,
    operation?: LeadOperationId,
  ) => Promise<readonly ChatToolId[]>;
  customerOperations?: () => Promise<readonly CustomerOperationId[]>;
  leadOperations?: () => Promise<readonly LeadOperationId[]>;
  executeTool: (name: ImplementedToolId, args: unknown) => Promise<ToolResult>;
  rememberSources: (sources: HelpSource[]) => Promise<void>;
  emit: (
    event:
      | { type: "status"; status: "retrieving" | "preparing_draft" }
      | { type: "text"; text: string },
  ) => Promise<void>;
}
function requestOperation(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("request" in value)) {
    return undefined;
  }
  const request = value.request;
  if (!request || typeof request !== "object" || !("operation" in request)) {
    return undefined;
  }
  return typeof request.operation === "string" ? request.operation : undefined;
}
/** Bounded read/draft graph. No commit capability. Checkpoints contain execution IDs/phases, never transcripts or tool data. */
export async function runConversation(
  input: {
    turnId: string;
    messages: RuntimeMessage[];
    surface: ChatSurfaceKey;
    signal: AbortSignal;
  },
  deps: RuntimeDependencies,
) {
  let customerResult: CustomerChatResult | undefined;
  let calendarProposal: import("@salesmora/contracts").CalendarProposalTicket | undefined;
  let calendarResult: import("@salesmora/contracts").CalendarChatResult | undefined;
  let workOrderResult: import("@salesmora/contracts").WorkOrderChatResult | undefined;
  let estimateResult: import("@salesmora/contracts").EstimateChatResult | undefined;
  let estimateDraft: import("@salesmora/contracts").EstimateDraftChatView | undefined;
  let estimateSharing: import("@salesmora/contracts").EstimateShareChatTicket | undefined;
  let estimateDecision: import("@salesmora/contracts").EstimateDecisionChatTicket | undefined;
  let estimateDraftAction: import("@salesmora/contracts").EstimateDraftActionChatTicket | undefined;
  let estimateVoid: import("@salesmora/contracts").EstimateVoidChatTicket | undefined;
  let estimateArchive: import("@salesmora/contracts").EstimateArchiveChatTicket | undefined;
  let estimateDraftDelete: import("@salesmora/contracts").EstimateDraftDeleteChatTicket | undefined;
  let estimateConversion: import("@salesmora/contracts").EstimateConversionChatTicket | undefined;
  let calls: RuntimeCall[] = [];
  const evidence: unknown[] = [];
  let sources: HelpSource[] = [];
  let action: ChatActionReview | undefined;
  let historyResult:
    import("@salesmora/contracts").LeadHistoryResult | undefined;
  let detailsResult:
    import("@salesmora/contracts").LeadDetailsResult | undefined;
  let searchResult: import("@salesmora/contracts").LeadSearchResult | undefined;
  const state = Annotation.Root({
    turnId: Annotation<string>(),
    phase: Annotation<string>(),
  });
  const assertActive = () => input.signal.throwIfAborted();
  const safeNode = (work: () => Promise<{ phase: string }>) => async () => {
    try {
      return await work();
    } catch (error) {
      if (error instanceof AIBudgetExceededError) throw error;
      if (error instanceof Error && error.message === "Access denied.")
        throw error;
      throw Error("Conversation step interrupted");
    }
  };
  const graph = new StateGraph(state)
    .addNode(
      "plan",
      safeNode(async () => {
        assertActive();
        const tools = await deps.authorize();
        calls = await deps.model.plan(
          input.messages,
          tools,
          input.signal,
          (await deps.leadOperations?.()) ?? [],
          (await deps.customerOperations?.()) ?? [],
        );
        if (
          calls.length > 2 ||
          new Set(calls.map((call) => call.name)).size !== calls.length
        )
          throw Error("Tool budget exceeded");
        if (
          calls.filter(
            (call) =>
              isImplementedTool(call.name) &&
              toolRegistry[call.name].kind === "draft",
          ).length > 1
        )
          throw Error("Only one proposal per turn");
        return { phase: "planned" };
      }),
    )
    .addNode(
      "read",
      safeNode(async () => {
        for (const call of calls) {
          assertActive();
          if (!isImplementedTool(call.name)) throw Error("Unavailable tool");
          await deps.authorize(call.name);
          const definition = toolRegistry[call.name];
          const args = definition.inputSchema.parse(call.args);
          if (
            call.name === "leads_query" ||
            call.name === "leads_propose_action"
          ) {
            const operation = requestOperation(args);
            if (!isLeadOperation(operation)) throw Error("Access denied.");
            await deps.authorize(call.name, operation);
            if (!((await deps.leadOperations?.()) ?? []).includes(operation))
              throw Error("Access denied.");
          }
          if (
            call.name === "customers_query" ||
            call.name === "customers_propose_action"
          ) {
            const op = requestOperation(args);
            if (
              !op ||
              !((await deps.customerOperations?.()) ?? []).some(
                (available) => available === op,
              )
            )
              throw Error("Access denied.");
          }
          if (definition.progress)
            await deps.emit({ type: "status", status: definition.progress });
          const result = await deps.executeTool(call.name, args);
          if (result.sources) {
            sources = result.sources;
            await deps.rememberSources(sources);
          }
          customerResult = result.customerResult ?? customerResult;
          workOrderResult = result.workOrderResult ?? workOrderResult;
          calendarProposal = result.calendarProposal ?? calendarProposal;
          calendarResult = result.calendarResult ?? calendarResult;
          estimateResult = result.estimateResult ?? estimateResult;
          estimateDraft = result.estimateDraft ?? estimateDraft;
          estimateSharing = result.estimateSharing ?? estimateSharing;
          estimateDecision = result.estimateDecision ?? estimateDecision;
          estimateDraftAction = result.estimateDraftAction ?? estimateDraftAction;
          estimateVoid = result.estimateVoid ?? estimateVoid;
          estimateArchive = result.estimateArchive ?? estimateArchive;
          estimateDraftDelete = result.estimateDraftDelete ?? estimateDraftDelete;
          estimateConversion = result.estimateConversion ?? estimateConversion;
          action = result.action ?? action;
          searchResult = result.searchResult ?? searchResult;
          historyResult = result.historyResult ?? historyResult;
          detailsResult = result.detailsResult ?? detailsResult;
          evidence.push(result.evidence);
        }
        return { phase: "read" };
      }),
    )
    .addNode(
      "answer",
      safeNode(async () => {
        assertActive();
        const tools = await deps.authorize();
        let length = 0;
        for await (const text of deps.model.answer(
          input.messages,
          evidence,
          input.signal,
          tools,
          (await deps.leadOperations?.()) ?? [],
          (await deps.customerOperations?.()) ?? [],
        )) {
          assertActive();
          length += text.length;
          if (length > 16000 || text.length > 8000)
            throw Error("Answer budget exceeded");
          if (text) {
            await deps.authorize();
            await deps.emit({ type: "text", text });
          }
        }
        if (!length) throw Error("Empty answer");
        return { phase: "answered" };
      }),
    )
    .addEdge(START, "plan")
    .addEdge("plan", "read")
    .addEdge("read", "answer")
    .addEdge("answer", END)
    .compile({ checkpointer: deps.checkpointer });
  // Each turn has a fresh execution thread; never resume a partially completed provider/action call.
  await graph.invoke(
    { turnId: input.turnId, phase: "accepted" },
    {
      configurable: { thread_id: input.turnId },
      signal: input.signal,
      recursionLimit: 5,
      durability: "sync",
      callbacks: [], // App tracing is explicitly disabled; no prompt/tool payload logging.
    },
  );
  return {
    sources,
    action,
    searchResult,
    detailsResult,
    historyResult,
    customerResult,
    workOrderResult,
    calendarResult,
    calendarProposal,
    estimateResult,
    estimateDraft,
    estimateSharing,
    estimateDecision,
    estimateDraftAction,
    estimateVoid,
    estimateArchive,
    estimateDraftDelete,
    estimateConversion,
  };
}

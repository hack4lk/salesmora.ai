import type { captureProposeOperations } from '@salesmora/contracts';
import { textBatches } from './text-batches';
type CaptureProposalOperation = typeof captureProposeOperations[number];
import type {
  WorkflowDefinition,
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
    captureOperations?: readonly CaptureProposalOperation[],
    workflowRecipes?: readonly WorkflowDefinition["kind"][],
    workflowEditing?: boolean,
  ): Promise<RuntimeCall[]>;
  answer(
    messages: RuntimeMessage[],
    evidence: unknown[],
    signal: AbortSignal,
    tools?: readonly ChatToolId[],
    operations?: readonly LeadOperationId[],
    customerOperations?: readonly CustomerOperationId[],
    captureOperations?: readonly CaptureProposalOperation[],
    executedTools?: readonly ImplementedToolId[],
    workflowRecipes?: readonly WorkflowDefinition["kind"][],
    workflowEditing?: boolean,
  ): AsyncIterable<string>;
}
export interface RuntimeCapabilities {
  tools: readonly ChatToolId[];
  leadOperations: readonly LeadOperationId[];
  customerOperations: readonly CustomerOperationId[];
  captureOperations: readonly CaptureProposalOperation[];
  workflowRecipes?: readonly WorkflowDefinition["kind"][];
  workflowEditing?: boolean;
}
export interface RuntimeDependencies {
  model: ConversationModel;
  /** Optional diagnostics only; live turns recover through the app transcript, never graph resumption. */
  checkpointer?: BaseCheckpointSaver;
  authorize: (
    tool?: ChatToolId,
    operation?: LeadOperationId,
  ) => Promise<readonly ChatToolId[]>;
  capabilities: () => Promise<RuntimeCapabilities>;
  executeTool: (name: ImplementedToolId, args: unknown) => Promise<ToolResult>;
  rememberSources: (sources: HelpSource[]) => Promise<void>;
  /** Server delivery must freshly authorize each batch before releasing it. */
  deliverText?: (text: string) => Promise<void>;
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
/** Bounded read/draft graph. No commit capability. Optional diagnostic checkpoints contain IDs/phases only. */
export async function runConversation(
  input: {
    turnId: string;
    messages: RuntimeMessage[];
    surface: ChatSurfaceKey;
    signal: AbortSignal;
  },
  deps: RuntimeDependencies,
) {
  let reportResult: import("@salesmora/contracts").ReportAssistantTicket | undefined;
  let customerResult: CustomerChatResult | undefined;
  let workflowDraft: import("@salesmora/contracts").WorkflowDraft | undefined;
  let calendarProposal: import("@salesmora/contracts").CalendarProposalTicket | undefined;
  let captureSource: import("@salesmora/contracts").CaptureAssistantProposalTicket | undefined;
  let captureSetup: import("@salesmora/contracts").CaptureAssistantProposalTicket | undefined;
  let captureResult: import("@salesmora/contracts").CaptureChatTicket | undefined;
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
  const streamMetrics: { providerFragments: number; firstProviderTextMs: number | null } = {
    providerFragments: 0, firstProviderTextMs: null,
  };
  let calls: RuntimeCall[] = [];
  const evidence: unknown[] = [];
  const executedTools: ImplementedToolId[] = [];
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
        const capabilities = await deps.capabilities();
        calls = await deps.model.plan(
          input.messages,
          capabilities.tools,
          input.signal,
          capabilities.leadOperations,
          capabilities.customerOperations,
          capabilities.captureOperations,
          capabilities.workflowRecipes,
          capabilities.workflowEditing,
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
          const definition = toolRegistry[call.name];
          const args = definition.inputSchema.parse(call.args);
          const capabilities = await deps.capabilities();
          if (!capabilities.tools.includes(call.name))
            throw Error("Access denied.");
          if (
            call.name === "leads_query" ||
            call.name === "leads_propose_action"
          ) {
            const operation = requestOperation(args);
            if (!isLeadOperation(operation)) throw Error("Access denied.");
            if (!capabilities.leadOperations.includes(operation))
              throw Error("Access denied.");
          }
          if (
            call.name === "customers_query" ||
            call.name === "customers_propose_action"
          ) {
            const op = requestOperation(args);
            if (
              !op ||
              !capabilities.customerOperations.some(
                (available) => available === op,
              )
            )
              throw Error("Access denied.");
          }
          if (call.name === 'lead_capture_propose_action' &&
            !capabilities.captureOperations.some(operation => 'operation' in args && operation === args.operation))
            throw Error('Access denied.');
          if (call.name === "workflows_prepare" && "operation" in args && args.operation === "edit" && capabilities.workflowEditing === false)
            throw Error("Access denied.");
          if (call.name === "workflows_prepare" && !("operation" in args && args.operation === "edit") && capabilities.workflowRecipes &&
            "kind" in args && args.kind != null && !capabilities.workflowRecipes.includes(args.kind as WorkflowDefinition["kind"]))
            throw Error("Access denied.");
          if (definition.progress)
            await deps.emit({ type: "status", status: definition.progress });
          const result = await deps.executeTool(call.name, args);
          reportResult = result.reportResult ?? reportResult;
          if (result.sources) {
            sources = result.sources;
            await deps.rememberSources(sources);
          }
          customerResult = result.customerResult ?? customerResult;
          workOrderResult = result.workOrderResult ?? workOrderResult;
          workflowDraft = result.workflowDraft ?? workflowDraft;
          calendarProposal = result.calendarProposal ?? calendarProposal;
          calendarResult = result.calendarResult ?? calendarResult;
          captureSource = result.captureSource ?? captureSource;
          captureSetup = result.captureSetup ?? captureSetup;
          captureResult = result.captureResult ?? captureResult;
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
          executedTools.push(call.name);
        }
        return { phase: "read" };
      }),
    )
    .addNode(
      "answer",
      safeNode(async () => {
        assertActive();
        const capabilities = await deps.capabilities();
        if (workflowDraft && executedTools.length === 1 && executedTools[0] === "workflows_prepare") {
          const text = workflowDraft.editing ? "Review the changes below, then save when you're ready." : "Review the workflow below, then publish when you're ready.";
          if (deps.deliverText) await deps.deliverText(text);
          else {
            await deps.authorize();
            await deps.emit({ type: "text", text });
          }
          return { phase: "answered" };
        }
        let length = 0;
        for await (const text of textBatches(deps.model.answer(
          input.messages,
          evidence,
          input.signal,
          capabilities.tools,
          capabilities.leadOperations,
          capabilities.customerOperations,
          capabilities.captureOperations,
          executedTools,
          capabilities.workflowRecipes,
          capabilities.workflowEditing,
        ), input.signal, streamMetrics)) {
          assertActive();
          length += text.length;
          if (length > 16000 || text.length > 8000)
            throw Error("Answer budget exceeded");
          if (text) {
            if (deps.deliverText) await deps.deliverText(text);
            else {
              await deps.authorize();
              await deps.emit({ type: "text", text });
            }
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
      ...(deps.checkpointer ? { durability: "sync" as const } : {}),
      callbacks: [], // App tracing is explicitly disabled; no prompt/tool payload logging.
    },
  );
  return {
    streamMetrics,
    reportResult,
    sources,
    action,
    searchResult,
    detailsResult,
    historyResult,
    customerResult,
    workOrderResult,
    calendarResult,
    captureResult,
    captureSetup,
    captureSource,
    workflowDraft,
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

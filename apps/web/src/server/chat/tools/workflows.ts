import "server-only";
import { prepareWorkflowInTransaction, WorkflowDraftError } from "@salesmora/data";
import { workflowPrepareSchema } from "@salesmora/contracts";
import type { ChatToolHandler } from "./types";

export const workflowsPrepare: ChatToolHandler = async (context, args) => {
  const parsed = workflowPrepareSchema.safeParse(args);
  if (!parsed.success) return { evidence: { type: "workflow-clarification", published: false,
    clarification: "The workflow request was incomplete, so no review was prepared. Preserve the source, team, method and ZIP choice already supplied; ask only for choices actually missing. Do not claim a workflow was created or published.",
  } };
  try {
    const workflowDraft = await prepareWorkflowInTransaction(context.db, context.authority,
      { threadId: context.turn.threadId, turnId: context.turnId }, parsed.data);
    return { workflowDraft, evidence: { type: "workflow-draft", name: workflowDraft.name, rule: workflowDraft.rule,
      definition: workflowDraft.definition, published: false, instruction: workflowDraft.editing ? "Use the attached edit review. Only Save changes updates the existing workflow." : "Use the attached review card. Only the Publish workflow button can activate this rule." } };
  } catch (error) {
    if (error instanceof WorkflowDraftError) return { evidence: { clarification: error.message, published: false } };
    throw error;
  }
};

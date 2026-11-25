import { workflowPublishDecisionSchema, workflowDraftResultSchema } from "@salesmora/contracts";
import { decideWorkflow, WorkflowConflictError, WorkflowDraftError } from "@salesmora/data";
import { getSession } from "../../../../../server/auth/session";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";
import { chatBody, chatError, chatReply, validChatOrigin } from "../../../../../server/chat/http";

export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: "invalid_origin" }, 403);
  const session = await getSession();
  if (!session) return chatReply({ error: "authentication_required" }, 401);
  try {
    const input = workflowPublishDecisionSchema.safeParse(await chatBody(request));
    if (!input.success) return chatReply({ error: "invalid_request" }, 422);
    const draft = await decideWorkflow(database(), { userId: session.user.id, workspaceId: input.data.workspaceId },
      enabledPermissions, input.data);
    return chatReply(workflowDraftResultSchema.parse({ draft }));
  } catch (error) {
    return (error instanceof WorkflowDraftError || error instanceof WorkflowConflictError) ? chatReply({ error: error.message }, 409) : chatError(error);
  }
}

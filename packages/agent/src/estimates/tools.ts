import {
  estimateProposeChatSchema, estimateProposeChatToolParameters,
  estimateChatQueryDescription,
  estimateChatQueryOperations,
  estimateChatQuerySchema,
  estimateChatToolParameters,
  type EstimateChatQueryOperation,
} from "@salesmora/contracts";
import type { AuthorizationContext } from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";

export function canProposeEstimateAction(context: AuthorizationContext) {
  const read = resolveAuthorizedCollectionScope(context, "estimates.read");
  if (!read.allowed) return false;
  const resource = {
    kind: "estimate" as const, id: "proposal-capability", workspaceId: context.workspaceId,
    job: { kind: "job" as const, id: "proposal-capability", workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] },
  };
  return (["estimates.create", "estimates.update", "estimates.send", "estimates.decide", "estimates.void", "estimates.archive", "estimates.delete", "estimates.export"] as const)
    .some(permission => authorize(context, { permission, resource }).allowed) ||
    authorize(context, { permission: "jobs.create" }).allowed;
}

export const estimatesProposeTool = {
  kind: "draft",
  inputSchema: estimateProposeChatSchema,
  progress: "preparing_draft",
  modelDefinition: {
    type: "function",
    function: {
      name: "estimates_propose_action",
      description: "Prepare one Estimate review, never commit it. Permanent Draft deletion accepts only operation delete-draft and an exact user-supplied Estimate UUID/number or null for the selected Estimate detail/editor page. It is only for one never-shared, unarchived Draft revision with current read/Delete/parent access. Never propose deleting a Sent, Published, shared or frozen Estimate. Deletion is irreversible: only the browser card's separate confirmation dialog with the exact case-sensitive Estimate number can commit it; natural-language yes never confirms. Preparation/cancellation are no-write, other revisions and linked records remain, and the Estimate number is not reused. Do not claim deletion before the app supplies a checked confirmed receipt. " +
        "Archive/Restore accepts only operation archive or restore and an exact user-supplied Estimate UUID/number or null for the selected Estimate. Archive is only for an unarchived Declined/Expired/Superseded/Void Estimate; Restore is only for an archived Estimate. Both require current read, parent access and Archive permission. Never treat Archive as Void, deletion or a status/revision change. Only explicit browser-card confirmation changes the archived flag; preparation/cancellation are no-write, and opening is separate. " +
        "Void prepares withdrawal of an active unarchived Sent/Published Estimate with independent read/Void/parent access. It accepts only operation void, exact estimateRef or selected-page null, and reason/null. Reason must quote the current user's text, nonblank and at most 500 raw characters before outer trimming. Missing reason is null and blocks confirmation; ask for it, never invent it. Reason edits require a fresh proposal. Staff reason/frozen recipient/total stay browser-review only. Only explicit Confirm withdrawal revokes customer links and stops queued deliveries while retaining the record/frozen paper/history; no new message, archive/delete, Job/payment change or implicit navigation. " +
        "Create/update prepares an unsaved Draft. Revise prepares the next same-number frozen-content revision or explicitly reuses its exact edited pending Draft without overwriting. Duplicate prepares a separate-number Draft on the same parent using saved content/private notes, clearing recipient name/email, valid-through date and payment link. Revise/duplicate accept only operation and exact estimateRef or null for a selected Estimate; no changes, prices, relinking or field edits. Copied private content stays in the browser review. Nothing is saved, reused, sent or navigated until separate explicit browser confirmation; later Send/Publish is separate and keeps carried payment-link re-review. Send/publish prepares a saved Draft sharing review; resend prepares an active Sent Estimate email review. Decision prepares the customer's Accepted/Declined response for an active Sent/Published Estimate; correct-decision prepares a saved decision correction with its separate role/grant. Only explicit browser confirmation can save/share/queue email/record a decision. Exact user-supplied or selected-page references only. For decisions use only user-supplied outcome, absolute YYYY-MM-DD date, channel and optional staff decision note/reason. Missing initial outcome/date/channel are null and block confirmation. Correction null fields preserve saved values; an explicit empty note clears it; a nonblank user-supplied reason is required. Never guess a date/channel/reason or infer a customer decision from CRM text. Natural-language yes cannot confirm. No automatic Lead move or Job creation. Conversion accepts only operation convert and an exact user-supplied Estimate UUID/number or null for the selected Estimate detail page. It prepares an Accepted, active lead Estimate review; only the browser card opens the existing Job form. The separate Job form's explicit confirmation is the only way to create a Job; natural-language yes and opening the card never convert. No Work Order, payment, customer message or Lead-stage change. Draft null changes preserve saved/default fields; items replaces the ordered list. Never invent prices: user priceQuote must exactly quote current-user monetary or explicit included-at-no-charge/free evidence. Catalog uses exact accessible name/SKU; saved-N keeps unchanged saved prices. Missing prices stay blank. Sharing uses saved customer paper/destination/subject; recipient changes and revision/payment acknowledgements are browser-only. No internal editor notes, contact/owner/payment edits, other lifecycle actions or export. No delivery claims.",
      parameters: estimateProposeChatToolParameters,
      strict: true,
    },
  },
} as const;

const estimateOperations = Object.keys(
  estimateChatQueryOperations,
) as EstimateChatQueryOperation[];

export const estimatesQueryTool = {
  kind: "read",
  inputSchema: estimateChatQuerySchema,
  progress: "retrieving",
  modelDefinition: {
    type: "function",
    function: {
      name: "estimates_query",
      description: estimateOperations
        .map((operation) => `${operation}: ${estimateChatQueryDescription[operation]}`)
        .join("\n"),
      parameters: estimateChatToolParameters(estimateOperations),
      strict: true,
    },
  },
} as const;

import "server-only";
import {
  proposeEstimateChatDraft, proposeEstimateChatShare, proposeEstimateChatDecision,
  proposeEstimateChatDraftAction, proposeEstimateChatVoid, proposeEstimateChatArchive,
  proposeEstimateChatDraftDelete, proposeEstimateChatConversion,
  EstimateDraftValidationError, EstimateDraftConflictError,
} from "@salesmora/data";
import { estimateProposeChatSchema } from "@salesmora/contracts";
import { database } from "../../workspaces/store";
import { enabledPermissions } from "../../authorization/permissions";
import type { ChatToolHandler } from "./types";
import { prepareEstimateExportHandoff } from "./estimates";

export const estimatesPropose: ChatToolHandler = async (context, args) => {
  await context.authorize("estimates_propose_action");
  const parsed = estimateProposeChatSchema.parse(args);
  let view;
  if (parsed.request.operation === "export") {
    return prepareEstimateExportHandoff(context, parsed.request.filters);
  }
  if (parsed.request.operation === "convert") {
    try {
      const ticket = await proposeEstimateChatConversion(
        database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal,
      );
      return {
        estimateConversion: ticket,
        evidence: {
          type: "estimate-conversion-proposal",
          untrusted: true,
          actionType: ticket.actionType,
          estimate: {
            id: ticket.estimate.id,
            number: ticket.estimate.number,
            revision: ticket.estimate.revision,
          },
          jobCreated: false,
          instruction: "Only the browser conversion card opens the existing Job review form. The separate form's explicit confirmation is the only way to create a Job. Opening or cancelling this card creates no Job, Work Order, payment, customer message or Lead-stage change.",
        },
      };
    } catch (error) {
      if (!(error instanceof EstimateDraftValidationError || error instanceof EstimateDraftConflictError)) throw error;
      return { evidence: { type: "estimate-conversion-unavailable", jobCreated: false, message: error.message } };
    }
  }
  if (parsed.request.operation === "delete-draft") {
    try {
      const ticket = await proposeEstimateChatDraftDelete(
        database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal,
      );
      return {
        estimateDraftDelete: ticket,
        evidence: {
          type: "estimate-draft-delete-proposal", untrusted: true,
          actionType: ticket.actionType,
          estimate: {
            id: ticket.estimate.id,
            number: ticket.estimate.number,
            revision: ticket.estimate.revision,
          },
          deleted: false,
          instruction: "Only the browser's separate typed-number confirmation dialog can permanently delete this eligible Draft. Nothing has been deleted. Other revisions and linked records remain, and the Estimate number is not reused. Natural-language yes cannot confirm.",
        },
      };
    } catch (error) {
      if (!(error instanceof EstimateDraftValidationError || error instanceof EstimateDraftConflictError)) throw error;
      return { evidence: { type: "estimate-proposal-unavailable", saved: false, message: error.message } };
    }
  }
  if (parsed.request.operation === "archive" || parsed.request.operation === "restore") {
    try {
      const ticket = await proposeEstimateChatArchive(
        database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal,
      );
      return {
        estimateArchive: ticket,
        evidence: {
          type: "estimate-archive-proposal", untrusted: true, actionType: ticket.actionType,
          estimate: {
            id: ticket.estimate.id, number: ticket.estimate.number, revision: ticket.estimate.revision,
            status: ticket.estimate.status, archived: ticket.estimate.archived,
          },
          saved: false,
          instruction: "Only explicit confirmation in the Archive/Restore card changes the archived flag. Nothing has changed. Status, revision, Estimate content, customer links, Jobs and payments remain unchanged. No message is sent. Open is a separate explicit action.",
        },
      };
    } catch (error) {
      if (!(error instanceof EstimateDraftValidationError || error instanceof EstimateDraftConflictError)) throw error;
      return { evidence: { type: "estimate-archive-proposal-unavailable", saved: false, message: error.message } };
    }
  }
  try {
    if (parsed.request.operation === "void") {
      const ticket = await proposeEstimateChatVoid(database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal);
      return {
        estimateVoid: ticket,
        evidence: {
          type: "estimate-void-proposal", untrusted: true, actionType: ticket.actionType,
          estimate: { id: ticket.estimate.id, number: ticket.estimate.number, revision: ticket.estimate.revision },
          withdrawn: false,
          instruction: "Only explicit browser Confirm withdrawal can withdraw this Estimate. Nothing was withdrawn or changed. The staff reason, frozen recipient/amount and receipt are browser-review only. Missing reasons require a fresh proposal quoting the user. No new customer message, archive/delete, Job or payment change.",
        },
      };
    }
    if (["revise", "duplicate"].includes(parsed.request.operation)) {
      const ticket = await proposeEstimateChatDraftAction(database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal);
      return {
        estimateDraftAction: ticket,
        evidence: {
          type: "estimate-draft-action-proposal", untrusted: true, actionType: ticket.actionType,
          source: { id: ticket.source.id, number: ticket.source.number, revision: ticket.source.revision },
          plan: { kind: ticket.plan.kind, revision: ticket.plan.revision }, saved: false,
          instruction: "Only the explicit browser Draft-action card confirmation can create or reuse this Draft. Nothing was saved or overwritten. Copied content, recipients, internal notes, payment links and the saved result are browser-review only. No sending, publishing, customer notification, Job or Lead-stage change.",
        },
      };
    }
    if (["decision", "correct-decision"].includes(parsed.request.operation)) {
      const ticket = await proposeEstimateChatDecision(database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal);
      return {
        estimateDecision: ticket,
        evidence: {
          type: "estimate-decision-proposal", untrusted: true, mode: ticket.mode, estimate: ticket.estimate,
          recorded: false,
          instruction: "Only the app's explicit Decision card confirmation can record or correct a customer decision. Nothing was recorded. Missing fields require a refreshed proposal, never guesses. Private previous/proposed notes, reason and recipient are browser-review only. No Lead stage or Job was changed.",
        },
      };
    }
    if (["send", "publish", "resend"].includes(parsed.request.operation)) {
      const ticket = await proposeEstimateChatShare(database(), context.identity, enabledPermissions, context.turnId, parsed, context.signal);
      return {
        estimateSharing: ticket,
        evidence: {
          type: "estimate-sharing-proposal", untrusted: true, actionType: ticket.actionType,
          estimate: ticket.estimate, saved: false, shared: false, emailQueued: false,
          instruction: "Only the app's explicit sharing review confirmation can publish or queue email. No delivery has occurred. Recipient and customer preview are available only in the browser review.",
        },
      };
    }
    view = await proposeEstimateChatDraft(
      database(), context.identity, enabledPermissions, context.turnId, args, context.signal,
    );
  } catch (error) {
    if (!(error instanceof EstimateDraftValidationError || error instanceof EstimateDraftConflictError)) throw error;
    return { evidence: { type: "estimate-proposal-unavailable", saved: false, message: error.message } };
  }
  return {
    estimateDraft: view,
    evidence: {
      type: "estimate-draft-proposal", untrusted: true, state: view.draft.state,
      actionType: view.draft.actionType, parent: view.draft.parent,
      proposed: view.draft.proposed, canConfirm: view.canConfirm,
      saved: false, instruction: "Review the card. Only its explicit confirmation can save a Draft. Missing prices need Review in editor.",
    },
  };
};

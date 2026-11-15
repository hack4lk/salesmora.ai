import {
  estimateDraftChatStoredSchema, estimateShareChatStoredSchema, estimateDecisionChatStoredSchema,
  estimateDraftActionChatStoredSchema, estimateVoidChatStoredSchema, estimateArchiveChatStoredSchema,
  estimateDraftDeleteChatStoredSchema, estimateConversionChatStoredSchema,
} from '@salesmora/contracts';
import { proposalStorage } from '../proposal-storage';

export const estimateProposalStorage = {
  estimateDraft: proposalStorage('estimateDraft', estimateDraftChatStoredSchema),
  estimateSharing: proposalStorage('estimateSharing', estimateShareChatStoredSchema),
  estimateDecision: proposalStorage('estimateDecision', estimateDecisionChatStoredSchema),
  estimateDraftAction: proposalStorage('estimateDraftAction', estimateDraftActionChatStoredSchema),
  estimateVoid: proposalStorage('estimateVoid', estimateVoidChatStoredSchema),
  estimateArchive: proposalStorage('estimateArchive', estimateArchiveChatStoredSchema),
  estimateDraftDelete: proposalStorage('estimateDraftDelete', estimateDraftDeleteChatStoredSchema),
  estimateConversion: proposalStorage('estimateConversion', estimateConversionChatStoredSchema),
};

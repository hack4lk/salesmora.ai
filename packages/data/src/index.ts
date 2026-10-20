export { createDatabase, createAuthPool } from './database';
export { readLeads, readLead } from './leads/read';
export type { Knex } from 'knex';
export { withWorkspaceAuthorization, loadWorkspaceAuthorization, initializeWorkspacePolicy, saveWorkspacePolicy, listAuthorizedLeads, authorizedLeadPipelineCounts, AuthorizationAccessError, AuthorizationConflictError, type WorkspaceIdentity, type LeadSummary } from './authorization/store';
export { embeddingSpace, createOpenAIEmbedder, validateVectors, type Embedder } from './knowledge/embeddings';
export { articleIdentity, stageArticle, publishArticle, ingestArticle, retireMissingArticles, retrieveHelp, readHelpArticle, type HelpMatch } from './knowledge/store';
export { createChatCheckpointer } from './checkpoints';
export { createAIUsageRecorder, configureWorkspaceAIBudget, workspaceAIAllowance, defaultMonthlyAITokens, type AIUsageIdentity } from './ai-usage';
export { cleanupExpiredChat, chatRetentionDays } from './chat-retention';
export { sandboxBillingEnabled, stripeSandbox, stripePlanPrice, verifyBillingWebhook } from './billing/stripe';
export { BillingAccessError, billingOnboarding, createWorkspaceCheckout, continueWorkspaceFree } from './billing/checkout';
export { recordBillingEvent, processBillingEvents, reconcileWorkspaceSubscription } from './billing/events';
export { readWorkspaceBilling, billingReadAllowed } from './billing/summary';

export { previewPlanChange, confirmPlanChange, undoPlanChange } from './billing/plan-changes';
export { requestAccountDeletion, processAccountDeletions, AccountDeletionError } from './account-deletion';
export { prepareWorkspaceCard, saveWorkspaceCard, reconcileWorkspaceCards } from './billing/payment-methods';
export { previewRenewalRecovery, confirmRenewalRecovery, renewalRecoveryStatus, reconcileRenewalRecoveries } from './billing/payment-recovery';

export { PlanCapacityError, workspaceEntitlements, assertLeadCapacity, assertSeatCapacity, workspaceSeatUsage } from './billing/entitlements';

export {readWorkspaceInvoices} from './billing/invoices';

export { moveLeadStage, moveLeadStageInTransaction, LeadStageConflictError } from './leads/stage';

export { addLeadNote, addLeadNoteInTransaction, LeadNoteConflictError } from './leads/notes';
export { updateLead, updateLeadInTransaction, LeadEditConflictError, LeadSourceLockedError } from './leads/update';

export * from './leads/assign';
export * from './notifications/store';
export * from './notifications/delivery';
export * from './leads/archive';

export * from './leads/delete';

export * from './leads/export';

export * from './leads/chat-context';

export { leadOrigin } from './leads/origin';

export { searchChatLeads, chatSearchSnapshotAllowed, leadSearchEvidenceAllowed, leadChatTurnEvidenceAllowed } from './leads/chat-search';

export { readLeadRecordInTransaction } from './leads/read';
export { leadOwnerStamp } from './leads/owner-stamp';

export { readLeadHistoryInTransaction } from './leads/read';

export * from './customers/store';
export { customerChatStamp,customerChatEvidenceAllowed } from './customers/chat-evidence';
export * from './jobs/store';
export * from "./work-orders/store";
export * from "./work-orders/mutations";
export * from "./work-orders/export";
export * from "./work-orders/settings";
export * from "./materials/store";
export * from "./materials/mutations";
export * from "./materials/export";

export { StorageAdapter, createStorageAdapter, type StorageObject, type StorageObjectMetadata } from './files/storage-adapter';
export { FileStore, FileStorageError, FileNotFoundError, QuotaExceededError, UnauthorizedFileAccessError, createFileStore, type FileRecord, type UploadFileInput, type StorageUsage } from './files/store';
export { encryptFile, decryptFile, generateDataEncryptionKey, generateFileId, serializeDekEnvelope, deserializeDekEnvelope, serializeFileCiphertext, deserializeFileCiphertext, type EncryptedEnvelope, type DecryptionResult } from './files/encryption';
export { generateThumbnail, convertHeicToJpeg, isHeic, isProcessableImage, type ThumbnailOptions } from './files/thumbnail-processor';
export { initializeClamAV, scanFileBuffer, testClamAVConnection, closeClamAV } from './files/clamav-scanner';

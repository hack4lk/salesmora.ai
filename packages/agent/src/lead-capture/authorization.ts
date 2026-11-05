import { captureProposeOperations } from '@salesmora/contracts';
import { captureAssistantOperationSchema, type CaptureAssistantOperation, type AuthorizationContext, type AuthorizationResource, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope, type AuthorizationDecision, type AuthorizedScope } from '@salesmora/domain';

/** Minimum app permissions only; service state, versions and readiness still require fresh checks. */
export const captureAssistantCapabilities = {
  sources: ['leadCapture.read'], source_details: ['leadCapture.read'], source_summary: ['leadCapture.read'], installation: ['leadCapture.read'], publication_review: ['leadCapture.read'],
  intake_items: ['intake.read'], intake_details: ['intake.read'], duplicate_candidates: ['intake.read', 'leads.read'],
  create_source: ['leadCapture.read', 'leadCapture.create'], begin_revision: ['leadCapture.read', 'leadCapture.update'],
  save_draft: ['leadCapture.read', 'leadCapture.update'], suggest_website_fields: ['leadCapture.read', 'leadCapture.update'], suggest_workflow: ['leadCapture.read', 'leadCapture.update'],
  extract_sample: ['leadCapture.read', 'leadCapture.update'], refine_mapping: ['leadCapture.read', 'leadCapture.update'], approve_sample: ['leadCapture.read', 'leadCapture.update'],
  publish: ['leadCapture.read', 'leadCapture.activate'], change_schedule: ['leadCapture.read', 'leadCapture.activate'], cancel_schedule: ['leadCapture.read', 'leadCapture.activate'],
  pause: ['leadCapture.read', 'leadCapture.pause'], resume: ['leadCapture.read', 'leadCapture.pause'], archive: ['leadCapture.read', 'leadCapture.archive'], restore: ['leadCapture.read', 'leadCapture.archive'], duplicate: ['leadCapture.read', 'leadCapture.create'],
  correct_intake: ['intake.read', 'intake.update'], create_lead: ['intake.read', 'intake.approve', 'leads.create'], create_separate_lead: ['intake.read', 'intake.approve', 'leads.create'],
  link_lead: ['intake.read', 'intake.approve', 'leads.read'], dismiss_intake: ['intake.read', 'intake.dismiss'],
} as const satisfies Record<CaptureAssistantOperation, readonly PermissionId[]>;

type Source = Extract<AuthorizationResource, { kind: 'intake' | 'capture_source' }>;
type Lead = Extract<AuthorizationResource, { kind: 'lead' }>;
export interface CaptureAssistantTargets {
  /** Current server-loaded records only. A context reference is not a loaded record. */
  source?: Source;
  intake?: Source;
  lead?: Lead;
  /** Exact canonical lead field names selected in the reviewed duplicate proposal. */
  leadFields?: readonly string[];
}
export type CaptureAssistantAuthorization = { allowed: true; scopes: Partial<Record<PermissionId, AuthorizedScope>> } | Extract<AuthorizationDecision, { allowed: false }>;
const denied = (): CaptureAssistantAuthorization => ({ allowed: false, reason: 'capture-assistant-access-denied' });

/** Default unavailable. Register an operation only when its complete server handler is implemented. */
export function authorizeCaptureAssistantOperation(context: AuthorizationContext, rawOperation: unknown, targets: CaptureAssistantTargets = {}, implementedOperations: readonly CaptureAssistantOperation[] = []): CaptureAssistantAuthorization {
  const parsed = captureAssistantOperationSchema.safeParse(rawOperation);
  if (!parsed.success || !implementedOperations.includes(parsed.data)) return denied();
  const operation = parsed.data;
  const assistant = authorize(context, { permission: 'assistant.use' });
  if (!assistant.allowed) return denied();
  const sourceOperations = ['source_details', 'source_summary', 'installation', 'publication_review', 'begin_revision', 'save_draft', 'suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample', 'publish', 'change_schedule', 'cancel_schedule', 'pause', 'resume', 'archive', 'restore', 'duplicate'];
  const intakeOperations = ['intake_details', 'duplicate_candidates', 'correct_intake', 'create_lead', 'create_separate_lead', 'link_lead', 'dismiss_intake'];
  if (sourceOperations.includes(operation) && (targets.source?.kind !== 'capture_source' || targets.source.workspaceId !== context.workspaceId)) return denied();
  if (intakeOperations.includes(operation) && (targets.intake?.kind !== 'intake' || targets.intake.workspaceId !== context.workspaceId)) return denied();
  if (targets.lead && targets.lead.workspaceId !== context.workspaceId) return denied();
  if (operation === 'link_lead' && !targets.lead) return denied();
  if (targets.leadFields?.length && operation !== 'link_lead') return denied();
  const scopes: Partial<Record<PermissionId, AuthorizedScope>> = {};
  for (const permission of captureAssistantCapabilities[operation]) {
    const resource = permission.endsWith('.create') ? undefined : permission.startsWith('leadCapture.') ? targets.source : permission.startsWith('intake.') ? targets.intake : targets.lead;
    // Collection results retain SQL constraints. A selected record additionally checks its tenant/assignment.
    const result = permission.endsWith('.read') && !resource
      ? resolveAuthorizedCollectionScope(context, permission)
      : authorize(context, { permission, ...(resource ? { resource } : {}) });
    if (!result.allowed) return denied();
    scopes[permission] = result;
  }
  if (operation === 'link_lead' && targets.leadFields?.length) {
    const update = authorize(context, { permission: 'leads.update', resource: targets.lead, fields: [...targets.leadFields] });
    if (!update.allowed) return denied();
    scopes['leads.update'] = update;
  }
  return { allowed: true, scopes };
}

/** Advertising only. Concrete targets are always reauthorized by the data service. */
export function availableCaptureSetupOperations(context: AuthorizationContext) {
  return captureProposeOperations.filter(operation => authorizeCaptureAssistantOperation(context, operation, { source: { kind: 'capture_source', id: 'advertising-only', workspaceId: context.workspaceId } }, [operation]).allowed);
}

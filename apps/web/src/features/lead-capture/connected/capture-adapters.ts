import { captureSetupCanonical, initialCaptureSetupConfiguration } from '@salesmora/contracts';
import type { CaptureBusinessContext, CaptureDetailView, CaptureDraftConfiguration } from '@salesmora/contracts';
import type { WebsiteSetupDraft } from '../website-setup-page/website-setup-page.validation';
import { gmailSetupApprovalKey, type GmailSetupDraft } from '../gmail-setup-page/gmail-setup-page.validation';
import { defaultCaptureLeadWorkflow, captureWorkflowTags, type CaptureLeadWorkflowValue } from '../capture-lead-workflow/capture-lead-workflow.validation';
import type { CaptureDashboardRecord } from '../capture-dashboard-page/capture-dashboard-page.validation';
import { captureConnectedData as copy } from './capture-connected.data';

export const captureInitialConfiguration = initialCaptureSetupConfiguration;
function workflowValue(configuration: CaptureDraftConfiguration): CaptureLeadWorkflowValue {
  const value = configuration.workflow; return value ? { assignment: value.assignment.kind, teammateId: value.assignment.kind === 'teammate' ? value.assignment.teammateId : '', stage: value.stage, tagsText: value.tags.join(', '), notifyAssigned: value.notifyAssigned } : { ...defaultCaptureLeadWorkflow };
}
function savedWorkflow(value: CaptureLeadWorkflowValue): NonNullable<CaptureDraftConfiguration['workflow']> {
  return { assignment: value.assignment === 'teammate' ? { kind: 'teammate', teammateId: value.teammateId } : { kind: 'default' }, stage: value.stage, tags: captureWorkflowTags(value.tagsText), notifyAssigned: value.notifyAssigned };
}
export function websiteDraftFrom(view: CaptureDetailView): WebsiteSetupDraft {
  const configuration = view.detail.draft?.configuration;
  const defaults = captureInitialConfiguration('website', view.business);
  if (defaults.type !== 'website') throw new Error(copy.unavailable);
  const value = configuration?.type === 'website' ? configuration : defaults;
  return { selection: { name: view.detail.source.name, source: 'website' }, brief: value.brief ?? '', form: { fields: value.fields ?? defaults.fields!, contactRequired: value.contactRequired ?? true }, content: { title: value.content?.title ?? copy.formTitle, intro: value.content?.intro ?? copy.intro, unavailableMessage: value.content?.unavailableMessage ?? copy.unavailableMessage, showBusinessEmail: value.content?.showBusinessEmail ?? false, showBusinessPhone: value.content?.showBusinessPhone ?? false }, workflow: workflowValue(value) };
}
export function websiteConfiguration(draft: Omit<WebsiteSetupDraft, 'selection'>, previous: CaptureDraftConfiguration, business: CaptureBusinessContext): CaptureDraftConfiguration {
  const defaults = captureInitialConfiguration('website', business);
  if (defaults.type !== 'website') throw new Error(copy.unavailable);
  return { schemaVersion: 1, type: 'website', brief: draft.brief, fields: draft.form.fields.map(field => ({ ...field, options: field.options.map(option => ({ ...option })) })), contactRequired: draft.form.contactRequired, content: { ...defaults.content, ...(previous.type === 'website' ? previous.content : {}), ...draft.content }, workflow: savedWorkflow(draft.workflow) };
}
export function gmailDraftFrom(view: CaptureDetailView): GmailSetupDraft {
  const value = view.detail.draft?.configuration, configuration = value?.type === 'gmail' ? value : captureInitialConfiguration('gmail', view.business);
  if (configuration.type !== 'gmail') throw new Error(copy.unavailable);
  return { selection: { name: view.detail.source.name, source: 'gmail' }, account: { accountId: configuration.connectionId ?? null }, rules: { location: configuration.rules?.location ?? 'both', mode: configuration.rules?.mode ?? 'all', phrases: (configuration.rules?.phrases ?? []).map((text, index) => ({ id: `phrase-${index}`, text })) }, workflow: workflowValue(configuration), contactRequired: configuration.contactRequired ?? true, configurationFields: configuration.fields, approvedSampleId: configuration.sampleId, example: { subject: '', body: '' }, sample: null, targets: (configuration.fields ?? []).map(field => ({ id: field.id, key: field.key, label: field.label, required: field.required })), findings: { sampleId: '', sampleVersion: 0, findings: [] }, approvedKey: null };
}
export function gmailConfiguration(draft: Omit<GmailSetupDraft, 'selection'>, previous: CaptureDraftConfiguration): CaptureDraftConfiguration {
  return { ...(previous.type === 'gmail' ? previous : { schemaVersion: 1 as const, type: 'gmail' as const }), contactRequired: draft.contactRequired ?? true, rules: { location: draft.rules.location, mode: draft.rules.mode, phrases: draft.rules.phrases.map(phrase => phrase.text) }, ...(draft.configurationFields ? { fields: draft.configurationFields.map(field => ({ ...field, required: field.required || !!draft.findings.findings.find(row => row.fieldId === field.id && row.included)?.required })) } : {}), ...(draft.sample ? { mappings: draft.findings.findings.filter(row => row.included).map(row => ({ fieldId: row.fieldId, instruction: row.instruction })) } : {}), ...(draft.approvedSampleId ? { sampleId: draft.approvedSampleId } : {}), workflow: savedWorkflow(draft.workflow) };
}
export function captureConfigurationRows(configuration: CaptureDraftConfiguration, business: CaptureBusinessContext) {
  const workflow = configuration.workflow;
  return [{ label: copy.type, value: configuration.type === 'website' ? copy.website : copy.gmail }, { label: copy.fields, value: configuration.fields?.map(field => field.label).filter(Boolean).join(', ') || copy.incomplete }, { label: copy.assignment, value: workflow?.assignment.kind === 'teammate' ? business.teammates.find(member => workflow.assignment.kind === 'teammate' && member.id === workflow.assignment.teammateId)?.name ?? copy.incomplete : copy.defaultAssignment }, { label: copy.stage, value: workflow?.stage ?? copy.incomplete }, { label: copy.tags, value: workflow?.tags.join(', ') || copy.noTags }];
}
export function captureDashboardRecord(view: CaptureDetailView): CaptureDashboardRecord {
  const { source, approved, draft } = view.detail, configuration = approved?.configuration ?? draft?.configuration;
  if (!configuration) throw new Error(copy.unavailable);
  return { id: source.id, name: source.name, type: source.type, status: source.status, intakeBlocked: source.block !== 'none', version: source.version,
    configuration: { kind: approved ? 'approved' : 'draft', version: approved?.version ?? draft!.version, rows: captureConfigurationRows(configuration, view.business) },
    draftVersion: approved && draft ? draft.version : undefined, availability: source.type === 'website' ? { type: 'website', status: view.installation ? source.status === 'active' && source.block === 'none' ? 'published' : 'unavailable' : 'unpublished' } : { type: 'gmail', status: view.gmailHealth?.connection ?? 'not-connected', email: view.gmailHealth?.email, health: view.gmailHealth },
    allowedActions: [...(view.lifecycleReview?.canPause ? ['pause' as const] : []), ...(view.lifecycleReview?.canResume ? ['resume' as const] : []), ...(view.lifecycleReview?.canArchive ? ['archive' as const] : []), ...(view.lifecycleReview?.canRestore ? ['restore' as const] : [])], timezone: view.business.timezone, scheduledAt: source.scheduledAt ?? undefined, resumeReadiness: view.lifecycleReview?.resumeReady ? 'ready' : 'blocked', restoreReadiness: view.lifecycleReview?.restoreReady ? 'ready' : 'blocked' };
}

/** Restoring retained approval evidence is not an unsaved edit; fresh pasted text/corrections are. */
export function gmailDraftConfigurationDirty(draft: GmailSetupDraft, baseline: GmailSetupDraft, previous: CaptureDraftConfiguration) {
  const configured = (value: GmailSetupDraft) => ({ selection: value.selection, accountId: value.account.accountId, configuration: gmailConfiguration(value, previous) });
  return captureSetupCanonical(configured(draft)) !== captureSetupCanonical(configured(baseline));
}
export function gmailDraftDirty(draft: GmailSetupDraft, baseline: GmailSetupDraft, previous: CaptureDraftConfiguration) {
  const hasSample = !!(draft.sample || draft.example.subject || draft.example.body || draft.findings.findings.length);
  return gmailDraftConfigurationDirty(draft, baseline, previous) || hasSample && draft.approvedKey !== gmailSetupApprovalKey(draft);
}

import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureEvidenceSchema, type CaptureDraftConfiguration, type CaptureSetupContext, type CaptureSetupFinding } from '@salesmora/contracts';
import { CaptureDraftConflictError, captureDraftFingerprint } from './store';
import { captureSetupSampleApproved, captureSetupAnswers } from './setup-samples';

export function captureGmailSampleBinding(configuration: CaptureDraftConfiguration, draftVersion: number) {
  if (configuration.type !== 'gmail') throw new CaptureDraftConflictError();
  return captureDraftFingerprint({ connectionId: configuration.connectionId, accountEmail: configuration.accountEmail, rules: configuration.rules, mappings: configuration.mappings, fields: configuration.fields, contactRequired: configuration.contactRequired, draftVersion });
}
/** Runs only inside the actor's authorized, explicit review confirmation transaction. */
export async function retainApprovedGmailSample(trx: Knex.Transaction, identity: { workspaceId: string; userId: string }, sourceId: string, sourceVersion: number, sampleId: string, configuration: CaptureDraftConfiguration, sample: CaptureSetupContext['sample'], findings: readonly CaptureSetupFinding[]) {
  if (configuration.type !== 'gmail' || !sample) throw new CaptureDraftConflictError();
  // Preserve the independent pasted setup path without inventing a provider connection.
  if (!configuration.connectionId && !sample.retrievalId) return;
  const account = await trx('captureGmailAccounts').where({ workspaceId: identity.workspaceId, id: configuration.connectionId ?? null, status: 'connected' }).first();
  const draft = await trx('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId }).first();
  if (!account || !draft || account.email !== configuration.accountEmail || draft.configuration.connectionId !== account.id) throw new CaptureDraftConflictError();
  const now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
  let provenance: Record<string, unknown> = { kind: 'pasted' }, sender = '';
  if (sample.retrievalId) {
    const preview = await trx('captureGmailSamplePreviews').where({ id: sample.retrievalId, workspaceId: identity.workspaceId, sourceId, sourceVersion, draftId: draft.id, draftVersion: draft.version, accountId: account.id, credentialGeneration: account.credentialGeneration, actorId: identity.userId }).first();
    if (!preview || preview.expiresAt <= now || preview.configurationHash !== captureDraftFingerprint(draft.configuration) || preview.contentHash !== captureDraftFingerprint({ subject: sample.subject, body: sample.body })) throw new CaptureDraftConflictError();
    sender = preview.sender;
    provenance = { kind: 'gmail', previewId: preview.id, messageId: preview.messageId, sender, receivedAt: preview.receivedAt.toISOString() };
  }
  const evidence = captureEvidenceSchema.parse({ schemaVersion: 1, type: 'gmail', from: sender, subject: sample.subject, body: sample.body,
    fields: findings.filter(row => row.included).map(row => ({ fieldId: row.fieldId, uncertain: row.confidence !== 'found' || row.sampleValue !== row.suggestedValue, origin: row.evidence ? { kind: 'email', location: row.evidence.source, quote: row.evidence.text } : null })) });
  const bindingHash = captureGmailSampleBinding(configuration, draft.version);
  await trx('captureSourceSamples').insert({ id: sampleId, workspaceId: identity.workspaceId, sourceId, sourceType: 'gmail', draftId: draft.id, draftVersion: draft.version, connectionId: account.id, accountEmail: account.email, bindingHash, evidence: JSON.stringify(evidence), answers: JSON.stringify(captureSetupAnswers(configuration, findings)), reviewedBy: identity.userId, reviewedAt: now });
  await trx('captureGmailSampleBindings').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId, draftId: draft.id, sampleId, draftVersion: draft.version, bindingHash, provenance: JSON.stringify(provenance) });
}

/** Carries reviewed evidence forward only from the exact live draft lineage, never across a stale edit. */
export async function bindSavedGmailSample(trx: Knex.Transaction, workspaceId: string, sourceId: string, draftId: string, currentVersion: number, configuration: CaptureDraftConfiguration) {
  if (configuration.type !== 'gmail' || !configuration.sampleId || !await captureSetupSampleApproved(trx, workspaceId, sourceId, draftId, configuration)) return;
  const sample = await trx('captureSourceSamples').where({ id: configuration.sampleId, workspaceId, sourceId, draftId }).whereNotNull('reviewedAt').whereNotNull('reviewedBy').first();
  if (!sample || sample.draftVersion > currentVersion || sample.bindingHash !== captureGmailSampleBinding(configuration, sample.draftVersion)) return;
  const previous = await trx('captureGmailSampleBindings').where({ workspaceId, sourceId, draftId, sampleId: sample.id, draftVersion: currentVersion }).first();
  if (!previous || previous.bindingHash !== captureGmailSampleBinding(configuration, currentVersion)) return;
  const bindingHash = captureGmailSampleBinding(configuration, currentVersion + 1);
  await trx('captureGmailSampleBindings').insert({ id: randomUUID(), workspaceId, sourceId, draftId, sampleId: sample.id, draftVersion: currentVersion + 1, bindingHash, provenance: JSON.stringify(previous.provenance) });
}

export async function approvedGmailSampleReady(trx: Knex.Transaction, workspaceId: string, sourceId: string, configuration: CaptureDraftConfiguration, draftVersion: number) {
  if (configuration.type !== 'gmail' || !configuration.sampleId) return false;
  const sample = await trx('captureSourceSamples').where({ id: configuration.sampleId, workspaceId, sourceId, connectionId: configuration.connectionId ?? null, accountEmail: configuration.accountEmail ?? '' }).whereNotNull('reviewedAt').whereNotNull('reviewedBy').first();
  if (!sample || sample.bindingHash !== captureGmailSampleBinding(configuration, sample.draftVersion)) return false;
  const binding = await trx('captureGmailSampleBindings').where({ workspaceId, sourceId, sampleId: sample.id, draftId: sample.draftId, draftVersion }).first('bindingHash');
  return !!binding && binding.bindingHash === captureGmailSampleBinding(configuration, draftVersion);
}

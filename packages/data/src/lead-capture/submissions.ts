import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureConfigurationSchema, captureAnswerIssues, captureEvidenceSchema, leadSchema, type CapturePublicSubmission, type CaptureSubmissionContext, type CaptureConfiguration } from '@salesmora/contracts';
import { captureDraftFingerprint } from './store';
import { captureOperationalState } from './capacity';
import { resolveCaptureAssignment } from '../lead-assignment-settings/store';
import { PlanCapacityError } from '../billing/entitlements';
import { insertAdmittedLead } from '../leads/admission';
export type CaptureSubmissionLimits = { challengeAfter: number; hardLimit: number; sourceRequestsPerMinute: number; maxPendingItems: number; maxRetainedBytes: number };
type Input = { proof: CaptureSubmissionContext; submission: CapturePublicSubmission; clientHash: string; limits: CaptureSubmissionLimits };
type Denied = { state: 'unavailable' | 'invalid' | 'conflict' | 'stale' | 'challenge-error' } | { state: 'rate-limited'; retryAt: string };
type Accepted = { state: 'accepted'; requestId: string };
type Binding = { workspaceId: string; id: string; sourceId: string; version: number; configurationVersion: number };
const sha = (value: string) => createHash('sha256').update(value).digest('hex');
export const captureSubmissionHash = (input: CapturePublicSubmission) => captureDraftFingerprint({ answers: input.answers, consent: input.consent, website: input.website });
export const captureChallengeBinding = (input: Input) => sha(JSON.stringify([input.proof.publicKey, input.proof.submissionId, input.submission.requestId, captureSubmissionHash(input.submission)]));
async function clock(db: Knex) { return new Date((await db.raw('SELECT statement_timestamp() AS now')).rows[0].now); }
async function bucket(db: Knex, scope: string, limit: number, now: Date) {
  const end = new Date((Math.floor(now.getTime() / 60000) + 1) * 60000), key = `${scope}:${Math.floor(now.getTime() / 60000)}`;
  const [row] = await db('captureRequestBuckets').insert({ key, count: 1, expiresAt: end }).onConflict('key').merge({ count: db.raw('LEAST(?? + 1, ?)', ['captureRequestBuckets.count', limit + 1]) }).returning('count');
  return row.count > limit ? { state: 'rate-limited' as const, retryAt: end.toISOString() } : null;
}
/** General safety budget includes receipt lookups and malformed/retry traffic. No raw IP is retained. */
export async function takeCaptureRequestBudget(db: Knex, maxPerMinute: number) {
  const now = await clock(db);
  await purgeCaptureSubmissionAbuse(db, now);
  return bucket(db, 'global', maxPerMinute, now);
}
export async function purgeCaptureSubmissionAbuse(db: Knex, now?: Date) {
  const instant = now ?? await clock(db);
  await db('captureRequestBuckets').where('expiresAt', '<=', instant).delete();
  await db('captureSubmissionAttempts').where('expiresAt', '<=', instant).delete();
  await db('captureChallengeChecks').where('expiresAt', '<=', instant).delete();
}
async function publication(db: Knex, key: string): Promise<Binding | undefined> { return db('capturePublications').where({ publicKey: key, sourceType: 'website' }).first('workspaceId', 'id', 'sourceId', 'version', 'configurationVersion'); }
async function replay(trx: Knex.Transaction, pub: Binding, input: Input): Promise<Accepted | Denied | null> {
  const receipt = await trx('captureReceipts').where({ workspaceId: pub.workspaceId, sourceId: pub.sourceId, publicationId: pub.id, dedupeKey: input.submission.requestId }).first('id', 'inputHash'); if (!receipt) return null;
  const processing = await trx('captureReceiptProcessing').where({ workspaceId: pub.workspaceId, receiptId: receipt.id }).first('contextId');
  return receipt.inputHash === captureSubmissionHash(input.submission) && processing?.contextId === input.proof.submissionId ? { state: 'accepted', requestId: input.submission.requestId } : { state: 'conflict' };
}
async function current(trx: Knex.Transaction, pub: Binding, input: Input, now: Date) {
  const state = await captureOperationalState(trx, pub.workspaceId, pub.sourceId);
  if (!state.allowed) return { state: 'unavailable' } as const;
  if (input.proof.expiresAt <= Math.floor(now.getTime() / 1000) || input.proof.issuedAt > Math.floor(now.getTime() / 1000) || pub.version !== input.proof.publicationVersion || pub.configurationVersion !== input.proof.configurationVersion || state.configurationVersion !== pub.configurationVersion) return { state: 'stale' } as const;
  const row = await trx('captureSourceVersions').where({ workspaceId: pub.workspaceId, sourceId: pub.sourceId, configurationVersion: pub.configurationVersion, sourceType: 'website' }).first('configuration');
  const parsed = captureConfigurationSchema.safeParse(row?.configuration); if (!parsed.success || parsed.data.type !== 'website') return { state: 'unavailable' } as const;
  return { state: 'ready', configuration: parsed.data } as const;
}
function validPayload(configuration: Extract<CaptureConfiguration, { type: 'website' }>, submission: CapturePublicSubmission) {
  if (submission.website.trim() || Object.keys(submission.answers).some(id => !configuration.fields.some(field => field.id === id))) return false;
  const consent = configuration.content.consent;
  if (consent ? !submission.consent || consent.id !== submission.consent.id || consent.version !== submission.consent.version || consent.required && !submission.consent.accepted : submission.consent !== null) return false;
  return configuration.fields.every(field => {
    const value = submission.answers[field.id]; if (value === undefined || value === '') return true;
    if (field.type === 'checkboxes') return Array.isArray(value) && new Set(value).size === value.length && value.every(id => field.options.some(option => option.id === id));
    if (typeof value !== 'string') return false;
    const max = field.key === 'name' || field.key === 'service' ? 200 : field.type === 'email' ? 254 : field.type === 'phone' ? 100 : field.key === 'address' || field.type === 'address' ? 500 : field.type === 'long_text' || field.key === 'details' ? 10000 : 200;
    return value.trim().length <= max && (field.type !== 'dropdown' || field.options.some(option => option.id === value.trim()));
  });
}
async function challengeNeeded(trx: Knex.Transaction, pub: Binding, input: Input, now: Date) {
  const existing = await trx('captureSubmissionAttempts').where({ publicationId: pub.id, requestId: input.submission.requestId }).first();
  if (!existing) return { missing: true, needed: true };
  const row = await trx('captureSubmissionAttempts').where({ publicationId: pub.id, clientHash: input.clientHash }).where('createdAt', '>', new Date(now.getTime() - 600000)).count('* as count').first();
  return { missing: false, needed: existing.challengeRequired || existing.clientHash !== input.clientHash || Number(row?.count ?? 0) > input.limits.challengeAfter };
}
/** First short transaction reserves an attempt and provider retry identity. No provider call holds locks. */
export async function prepareCaptureSubmission(db: Knex, input: Input): Promise<Accepted | Denied | { state: 'ready'; challengeRequired: boolean; cData: string; verificationId?: string; tokenHash?: string; verified?: boolean }> {
  const found = await publication(db, input.proof.publicKey); if (!found) return { state: 'unavailable' };
  return db.transaction(async trx => {
    await trx('workspaces').where({ id: found.workspaceId }).forUpdate().first('id'); const pub = await publication(trx, input.proof.publicKey); if (!pub) return { state: 'unavailable' };
    const now = await clock(trx), limited = await bucket(trx, `source:${pub.id}`, input.limits.sourceRequestsPerMinute, now); if (limited) return limited;
    const repeated = await replay(trx, pub, input); if (repeated) return repeated;
    const active = await current(trx, pub, input, now); if (active.state !== 'ready') return active;
    if (!validPayload(active.configuration, input.submission)) return { state: 'invalid' };
    let attempt = await trx('captureSubmissionAttempts').where({ publicationId: pub.id, requestId: input.submission.requestId }).first();
    const inputHash = captureSubmissionHash(input.submission);
    if (attempt && (attempt.inputHash !== inputHash || attempt.contextId !== input.proof.submissionId)) return { state: 'conflict' };
    if (!attempt) {
      const count = await trx('captureSubmissionAttempts').where({ publicationId: pub.id, clientHash: input.clientHash }).where('createdAt', '>', new Date(now.getTime() - 600000)).count('* as count').min('createdAt as first').first();
      if (Number(count?.count ?? 0) >= input.limits.hardLimit) return { state: 'rate-limited', retryAt: new Date(new Date(count!.first).getTime() + 600000).toISOString() };
      [attempt] = await trx('captureSubmissionAttempts').insert({ workspaceId: pub.workspaceId, publicationId: pub.id, requestId: input.submission.requestId, inputHash, contextId: input.proof.submissionId, clientHash: input.clientHash, challengeRequired: Number(count?.count ?? 0) >= input.limits.challengeAfter, createdAt: now, expiresAt: new Date(now.getTime() + 600000) }).returning('*');
    }
    const required = (await challengeNeeded(trx, pub, input, now)).needed, cData = captureChallengeBinding(input);
    if (!required || !input.submission.challengeToken) return { state: 'ready', challengeRequired: required, cData };
    const tokenHash = sha(input.submission.challengeToken);
    await trx('captureChallengeChecks').insert({ tokenHash, workspaceId: pub.workspaceId, publicationId: pub.id, requestId: input.submission.requestId, contextId: input.proof.submissionId, inputHash, verificationId: randomUUID(), expiresAt: new Date(now.getTime() + 300000) }).onConflict('tokenHash').ignore();
    const check = await trx('captureChallengeChecks').where({ tokenHash }).first();
    if (check.publicationId !== pub.id || check.requestId !== input.submission.requestId || check.contextId !== input.proof.submissionId || check.inputHash !== inputHash || check.expiresAt <= now) return { state: 'challenge-error' };
    return { state: 'ready', challengeRequired: true, cData, tokenHash, verificationId: check.verificationId, verified: !!check.verifiedAt };
  });
}
export async function recordCaptureChallengeVerification(db: Knex, tokenHash: string, verificationId: string, expiresAt: Date) {
  const now = await clock(db); if (expiresAt <= now || expiresAt.getTime() > now.getTime() + 300000) return false;
  return !!await db('captureChallengeChecks').where({ tokenHash, verificationId }).where('expiresAt', '>', now).update({ verifiedAt: now, expiresAt });
}
/** All receipt, lead/intake, provenance, tags, notices and audit effects share this transaction. */
export async function commitCaptureSubmission(db: Knex, input: Input, tokenHash?: string): Promise<Accepted | Denied | { state: 'challenge-required' }> {
  const found = await publication(db, input.proof.publicKey); if (!found) return { state: 'unavailable' };
  return db.transaction(async trx => {
    await trx('workspaces').where({ id: found.workspaceId }).forUpdate().first('id'); const pub = await publication(trx, input.proof.publicKey); if (!pub) return { state: 'unavailable' };
    const repeated = await replay(trx, pub, input); if (repeated) return repeated;
    const now = await clock(trx), active = await current(trx, pub, input, now); if (active.state !== 'ready') return active;
    if (!validPayload(active.configuration, input.submission)) return { state: 'invalid' };
    const attempt = await trx('captureSubmissionAttempts').where({ publicationId: pub.id, requestId: input.submission.requestId }).first();
    if (!attempt || attempt.inputHash !== captureSubmissionHash(input.submission) || attempt.contextId !== input.proof.submissionId) return { state: 'conflict' };
    const required = await challengeNeeded(trx, pub, input, now); if (required.missing) return { state: 'stale' };
    if (required.needed) {
      const verified = tokenHash ? await trx('captureChallengeChecks').where({ tokenHash, publicationId: pub.id, requestId: input.submission.requestId, inputHash: attempt.inputHash, contextId: input.proof.submissionId }).whereNotNull('verifiedAt').where('expiresAt', '>', now).first('tokenHash') : null;
      if (!verified) return { state: 'challenge-required' };
    }
    const configuration = active.configuration, answers = input.submission.answers;
    const issues = captureAnswerIssues(configuration.fields, answers), assignment = await resolveCaptureAssignment(trx, pub.workspaceId, configuration.workflow.assignment);
    const text = (key: string) => { const field = configuration.fields.find(field => field.key === key); if (!field) return ''; const value = answers[field.id]; if (typeof value !== 'string') return ''; return field.type === 'dropdown' ? field.options.find(option => option.id === value.trim())?.label ?? '' : value.trim(); };
    const lead = leadSchema.safeParse({ name: text('name'), email: text('email'), phone: text('phone'), service: text('service'), address: text('address'), details: text('details'), notes: '', source: 'website', stage: configuration.workflow.stage, ownerId: assignment.assigneeId ?? '' });
    const flags = new Set<'missing' | 'uncertain' | 'duplicate' | 'capacity'>(); if (issues.length || !lead.success) flags.add('missing'); if (!assignment.ready) flags.add('uncertain');
    const email = text('email').toLowerCase(), phone = text('phone').replace(/[^0-9]/g, '');
    if (email || phone) { const duplicate = await trx('leads').where({ workspaceId: pub.workspaceId }).andWhere(builder => { if (email) builder.orWhereRaw('lower(btrim(email)) = ?', [email]); if (phone) builder.orWhereRaw("regexp_replace(phone,'[^0-9]','','g') = ?", [phone]); }).first('id'); if (duplicate) flags.add('duplicate'); }
    const evidence = captureEvidenceSchema.parse({ schemaVersion: 1, type: 'website', answers, consent: configuration.content.consent ? { id: configuration.content.consent.id, version: configuration.content.consent.version, wording: configuration.content.consent.label, accepted: input.submission.consent!.accepted, privacyHref: configuration.content.privacy?.href ?? null } : null,
      fields: configuration.fields.map(field => { const value = answers[field.id], quote = typeof value === 'string' ? value : value?.[0]; return { fieldId: field.id, uncertain: issues.includes(field.id), origin: quote ? { kind: 'form', answerId: field.id, quote } : null }; }) });
    const { rows: [{ bytes }] } = await trx.raw('SELECT octet_length(?::jsonb::text) + octet_length(?::jsonb::text) AS bytes', [JSON.stringify(evidence), JSON.stringify(answers)]);
    await trx('captureInputUsage').insert({ workspaceId: pub.workspaceId }).onConflict('workspaceId').ignore(); const usage = await trx('captureInputUsage').where({ workspaceId: pub.workspaceId }).first('retainedBytes');
    if (BigInt(usage.retainedBytes) + BigInt(bytes) > BigInt(input.limits.maxRetainedBytes)) return { state: 'unavailable' };
    let leadId: string | undefined;
    if (!flags.size && lead.success) { try { leadId = await insertAdmittedLead(trx, lead.data, { workspaceId: pub.workspaceId, createdBy: null, submissionId: input.submission.requestId, submissionHash: attempt.inputHash }, assignment.assigneeId); if (!leadId) throw Error('Lead admission did not return an identity.'); } catch (error) { if (!(error instanceof PlanCapacityError)) throw error; flags.add('capacity'); } }
    if (!leadId) { const pending = await trx('intakeItems').where({ workspaceId: pub.workspaceId, status: 'awaiting' }).count('* as count').first(); if (Number(pending?.count ?? 0) >= input.limits.maxPendingItems) return { state: 'unavailable' }; }
    const receiptId = randomUUID();
    await trx('captureReceipts').insert({ id: receiptId, workspaceId: pub.workspaceId, sourceId: pub.sourceId, sourceType: 'website', configurationVersion: pub.configurationVersion, definitionVersion: pub.configurationVersion, workflowVersion: pub.configurationVersion, dedupeKey: input.submission.requestId, inputHash: attempt.inputHash, publicationId: pub.id, admission: leadId ? 'automatic' : 'review', evidence: JSON.stringify(evidence), originalAnswers: JSON.stringify(answers), receivedAt: now });
    await trx('captureReceiptProcessing').insert({ workspaceId: pub.workspaceId, receiptId, contextId: input.proof.submissionId, assignment: JSON.stringify(assignment), tags: JSON.stringify(configuration.workflow.tags) });
    if (leadId) {
      await trx('leadCaptureData').insert({ id: randomUUID(), workspaceId: pub.workspaceId, sourceId: pub.sourceId, configurationVersion: pub.configurationVersion, receiptId, leadId, resultingLeadId: leadId, definitionVersion: pub.configurationVersion, answers: JSON.stringify(answers) });
      await trx('leadActivity').where({ id: leadId, workspaceId: pub.workspaceId }).update({ actorType: 'system', actorName: 'Lead Capture', changes: JSON.stringify({ source: 'website', origin: 'lead_capture', receiptId, configurationVersion: pub.configurationVersion }) });
      if (configuration.workflow.tags.length) await trx('leadTags').insert(configuration.workflow.tags.map(tag => ({ workspaceId: pub.workspaceId, leadId, tag })));
      if (assignment.assigneeId && configuration.workflow.notifyAssigned) {
        const id = randomUUID(), user = await trx('users').where({ id: assignment.assigneeId }).first('name');
        await trx('leadActivity').insert({ id, workspaceId: pub.workspaceId, leadId, actorType: 'system', actorName: 'Lead Capture', type: 'assigned', changes: JSON.stringify({ from: null, to: user.name, ownerId: assignment.assigneeId, toVersion: 1 }), createdAt: now });
        await trx('assignmentNotifications').insert({ id, workspaceId: pub.workspaceId, leadId, userId: assignment.assigneeId, createdAt: now }); await trx('assignmentEmailOutbox').insert({ id });
      }
    } else await trx('intakeItems').insert({ id: randomUUID(), workspaceId: pub.workspaceId, sourceId: pub.sourceId, receiptId, version: 1, definitionVersion: pub.configurationVersion, workflowVersion: pub.configurationVersion, status: 'awaiting', answers: JSON.stringify(answers), flags: JSON.stringify([...flags]) });
    await trx('captureInputUsage').where({ workspaceId: pub.workspaceId }).increment('retainedBytes', bytes);
    const source = await trx('captureSources').where({ workspaceId: pub.workspaceId, id: pub.sourceId }).first('version');
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: pub.workspaceId, sourceId: pub.sourceId, kind: 'receipt.accepted', actor: JSON.stringify({ kind: 'service', service: 'website' }), data: JSON.stringify({ sourceVersion: source.version, configurationVersion: pub.configurationVersion, requestId: input.submission.requestId }) });
    return { state: 'accepted', requestId: input.submission.requestId };
  });
}

import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureAnswersSchema, captureEvidenceSchema, captureAnswerIssues } from '@salesmora/contracts';
import { assertLeadCapacity, PlanCapacityError } from '../billing/entitlements';
import { captureCapacity } from './capacity';
import { captureDraftFingerprint } from './store';
import { intakeLeadValues } from './intake-store';
import { gmailMessageExample } from './gmail-message';
import { withGmailMessageLease, type GmailMessageLease, type GmailWorkerScope } from './gmail-sync-store';
import { GmailSyncError } from './gmail-sync-provider';
export type GmailExtraction = { answers: Record<string, string | string[]>; fields: { fieldId: string; uncertain: boolean; origin: { kind: 'email'; location: 'from' | 'subject' | 'body'; quote: string } | null }[] };
export function gmailRuleMatches(rules: { location: 'subject' | 'body' | 'both'; mode: 'all' | 'any'; phrases: readonly string[] }, message: { subject: string; body: string }) {
  if (!rules.phrases.length || rules.phrases.some(phrase => !phrase.trim())) return false;
  const parts = (rules.location === 'both' ? [message.subject, message.body] : [message[rules.location]]).map(part => part.toLowerCase());
  const matches = rules.phrases.map(phrase => parts.some(part => part.includes(phrase.trim().toLowerCase())));
  return rules.mode === 'all' ? matches.every(Boolean) : matches.some(Boolean);
}
export async function commitGmailIntake(db: Knex, scope: GmailWorkerScope, lease: GmailMessageLease, rawMessage: unknown, extraction: GmailExtraction) {
  const example = gmailMessageExample(rawMessage), configuration = lease.configuration;
  if (configuration.type !== 'gmail' || example.id !== lease.messageId || new Date(example.receivedAt) < lease.startedAt || !gmailRuleMatches(configuration.rules, example)) throw new GmailSyncError('unavailable');
  const answers = captureAnswersSchema.parse(extraction.answers), fields = configuration.fields;
  if (Object.keys(answers).some(id => !fields.some(field => field.id === id)) || extraction.fields.some(field => !fields.some(known => known.id === field.fieldId))) throw new GmailSyncError('unavailable');
  const evidence = captureEvidenceSchema.parse({ schemaVersion: 1, type: 'gmail', from: example.sender, subject: example.subject, body: example.body, fields: fields.map(field => extraction.fields.find(item => item.fieldId === field.id) ?? { fieldId: field.id, uncertain: true, origin: null }) });
  return withGmailMessageLease(db, scope, lease, async trx => {
    const capacity = await captureCapacity(trx, scope.workspaceId, lease.sourceId, 'gmail'); if (!capacity.access || !capacity.ready) throw new GmailSyncError('unavailable');
    const pending = Number((await trx('intakeItems').where({ workspaceId: scope.workspaceId, status: 'awaiting' }).count('* as n').first())?.n ?? 0);
    const retained = Number((await trx('captureReceipts').where({ workspaceId: scope.workspaceId }).select(trx.raw('COALESCE(sum(pg_column_size(evidence)),0) as bytes')).first())?.bytes ?? 0);
    if (pending >= 10000 || retained + Buffer.byteLength(JSON.stringify(evidence)) > 67108864) throw new GmailSyncError('unavailable');
    const values = intakeLeadValues(configuration, answers), phone = values.phone.replace(/[^0-9]/g, '');
    const duplicate = values.email || phone ? await trx('leads').where({ workspaceId: scope.workspaceId }).andWhere(q => { if (values.email) q.orWhereRaw('lower(btrim(email))=?', [values.email]); if (phone) q.orWhereRaw("regexp_replace(phone,'[^0-9]','','g')=?", [phone]); }).first('id') : null;
    const flags: string[] = []; if (duplicate) flags.push('duplicate'); if (captureAnswerIssues(fields, answers, configuration.contactRequired).length) flags.push('missing');
    if (evidence.fields.some(field => field.uncertain || !field.origin)) flags.push('uncertain');
    try { await assertLeadCapacity(trx, scope.workspaceId, { enforce: true }); } catch (error) { if (!(error instanceof PlanCapacityError)) throw error; flags.push('capacity'); }
    const receiptId = randomUUID(), intakeId = randomUUID();
    await trx('captureReceipts').insert({ id: receiptId, workspaceId: scope.workspaceId, sourceId: lease.sourceId, sourceType: 'gmail', configurationVersion: lease.configurationVersion, definitionVersion: lease.configurationVersion, workflowVersion: lease.configurationVersion, dedupeKey: `${lease.accountId}:${lease.messageId}`, inputHash: captureDraftFingerprint({ evidence, answers }), connectionId: lease.accountId, messageId: lease.messageId, admission: 'review', evidence: JSON.stringify(evidence), originalAnswers: JSON.stringify(answers), receivedAt: example.receivedAt });
    await trx('intakeItems').insert({ id: intakeId, workspaceId: scope.workspaceId, sourceId: lease.sourceId, receiptId, version: 1, definitionVersion: lease.configurationVersion, workflowVersion: lease.configurationVersion, status: 'awaiting', answers: JSON.stringify(answers), flags: JSON.stringify(flags) });
    await trx('captureGmailMessageJobs').where({ id: lease.id }).update({ state: 'accepted', receiptId, leaseId: null, leaseUntil: null, failure: null });
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: scope.workspaceId, sourceId: lease.sourceId, kind: 'receipt.accepted', actor: JSON.stringify({ kind: 'service', service: 'gmail' }), data: JSON.stringify({ receiptId, intakeId, configurationVersion: lease.configurationVersion, admission: 'review' }) });
    await trx('captureSources').where({ workspaceId: scope.workspaceId, id: lease.sourceId }).update({ lastActivityAt: trx.fn.now() });
    return { receiptId, intakeId };
  });
}

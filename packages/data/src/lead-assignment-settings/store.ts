import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize } from '@salesmora/domain';
import { defaultLeadAssignmentRuleSchema, saveLeadAssignmentSettingsSchema, leadAssignmentSettingsSnapshotSchema,
  type AuthorizationContext, type PermissionId, type CaptureAssignmentResolution } from '@salesmora/contracts';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
export class LeadAssignmentSettingsConflict extends Error {}
export class LeadAssignmentSettingsInvalid extends Error {}
export class LeadAssignmentSettingsUnavailable extends Error {}
function requireAccess(context: AuthorizationContext, write = false) {
  if (!authorize(context, { permission: 'settings.business.read' }).allowed || write && !authorize(context, { permission: 'settings.business.update' }).allowed) throw new AuthorizationAccessError();
}
async function availableTeammate(db: Knex, workspaceId: string, userId: string) {
  return !!await db('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': workspaceId, 'm.userId': userId }).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').first('u.id');
}
/** Server-only resolver shared by publication, scheduler and future admission. Never substitutes an absent rule. */
export async function resolveCaptureAssignment(db: Knex, workspaceId: string, assignment: { kind: 'default' } | { kind: 'teammate'; teammateId: string }): Promise<CaptureAssignmentResolution> {
  if (assignment.kind === 'teammate') {
    const ready = await availableTeammate(db, workspaceId, assignment.teammateId);
    return { ready, assigneeId: ready ? assignment.teammateId : null, settingVersion: null, basis: 'source', ...(!ready ? { reason: 'unavailable_teammate' as const } : {}) };
  }
  const row = await db('leadAssignmentSettings').where({ workspaceId }).first('value', 'version');
  const base = { assigneeId: null, settingVersion: row?.version ?? null, basis: 'business_default' as const };
  if (!row) return { ...base, ready: false, reason: 'missing_rule' };
  const parsed = defaultLeadAssignmentRuleSchema.safeParse(row.value);
  if (!parsed.success || !Number.isInteger(row.version) || row.version < 1) return { ...base, ready: false, reason: 'invalid_rule' };
  if (parsed.data.kind === 'unassigned') return { ...base, ready: true };
  const ready = await availableTeammate(db, workspaceId, parsed.data.teammateId);
  return { ...base, ready, assigneeId: ready ? parsed.data.teammateId : null, ...(!ready ? { reason: 'unavailable_teammate' as const } : {}) };
}
async function snapshot(trx: Knex.Transaction, context: AuthorizationContext) {
  const row = await trx('leadAssignmentSettings').where({ workspaceId: context.workspaceId }).first();
  if (!row) throw new LeadAssignmentSettingsUnavailable();
  const teammates = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
  const parsed = leadAssignmentSettingsSnapshotSchema.safeParse({ workspaceId: context.workspaceId, version: row.version, value: row.value, teammates, canManage: authorize(context, { permission: 'settings.business.update' }).allowed });
  if (!parsed.success) throw new LeadAssignmentSettingsUnavailable(); return parsed.data;
}
export async function readLeadAssignmentSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => { requireAccess(context); return snapshot(trx, context); });
}
export async function saveLeadAssignmentSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = saveLeadAssignmentSettingsSchema.safeParse(raw); if (!parsed.success) throw new LeadAssignmentSettingsInvalid();
  const input = parsed.data; if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    requireAccess(context, true); const current = await snapshot(trx, context);
    const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const receipt = await trx('leadAssignmentSettingsAudit').where({ workspaceId: identity.workspaceId, requestId: input.requestId }).first();
    if (receipt) {
      if (receipt.actorId !== identity.userId || receipt.inputHash !== hash || current.version !== receipt.afterVersion) throw new LeadAssignmentSettingsConflict();
      return current;
    }
    if (current.version !== input.expectedVersion) throw new LeadAssignmentSettingsConflict();
    if (input.value.kind === 'teammate' && !await availableTeammate(trx, identity.workspaceId, input.value.teammateId)) throw new LeadAssignmentSettingsInvalid();
    const updated = await trx('leadAssignmentSettings').where({ workspaceId: identity.workspaceId, version: input.expectedVersion }).update({ value: JSON.stringify(input.value), version: current.version + 1, updatedAt: trx.fn.now() });
    if (updated !== 1) throw new LeadAssignmentSettingsConflict();
    await trx('leadAssignmentSettingsAudit').insert({ workspaceId: identity.workspaceId, requestId: input.requestId, actorId: identity.userId, inputHash: hash, beforeVersion: current.version, afterVersion: current.version + 1, beforeValue: JSON.stringify(current.value), afterValue: JSON.stringify(input.value) });
    return snapshot(trx, context);
  });
}

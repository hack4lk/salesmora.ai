import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { defaultDeadlineRuleSchema, deadlineReminderRuleSchema, jobEventEmailRulesSchema, saveJobNotificationSettingsSchema, jobNotificationSettingsSnapshotSchema,
  type AuthorizationContext, type PermissionId, type JobNotificationSettingsSnapshot, type JobNotificationSection } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
export class JobNotificationSettingsConflict extends Error {}
export class JobNotificationSettingsInvalid extends Error {}
import { jobNotificationDefaults as defaults } from './policy';
const managerRole = (c: AuthorizationContext) => c.membership.role === 'owner' || c.membership.role === 'admin';
function requireAccess(c: AuthorizationContext, write = false) {
  if (!managerRole(c) || !authorize(c, { permission: 'settings.business.read' }).allowed || (write && !authorize(c, { permission: 'settings.business.update' }).allowed)) throw new AuthorizationAccessError();
}
async function snapshot(trx: Knex.Transaction, c: AuthorizationContext): Promise<JobNotificationSettingsSnapshot> {
  const rows = await trx('jobNotificationSettings').where({ workspaceId: c.workspaceId });
  const row = (section: JobNotificationSection) => rows.find(r => r.section === section);
  const deadline = row('deadline'), reminders = row('reminders'), events = row('events');
  const { plan } = await workspaceEntitlements(trx, c.workspaceId);
  const workspace = await trx('workspaces').where({ id: c.workspaceId }).first('timezone');
  const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [workspace.timezone])).rows[0];
  const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', c.workspaceId).whereNull('u.deletionRequestedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
  const savedReminders = deadlineReminderRuleSchema.parse(reminders?.values ?? defaults.reminders);
  // Retain Premium drafts in storage across downgrade, but never grant them effective plan access.
  savedReminders.extraRecipientIds = savedReminders.extraRecipientIds.filter(id => members.some(m => m.id === id));
  const effectiveReminders = plan.id === 'premium' ? savedReminders : { ...defaults.reminders, sendTime: savedReminders.sendTime };
  return jobNotificationSettingsSnapshotSchema.parse({ today, plan: plan.id, timezone: workspace.timezone, canManage: authorize(c, { permission: 'settings.business.update' }).allowed, activation: 'reminders-active', members,
    deadline: { revision: String(deadline?.version ?? 0), values: defaultDeadlineRuleSchema.parse(deadline?.values ?? defaults.deadline) },
    reminders: { revision: String(reminders?.version ?? 0), values: effectiveReminders },
    events: { revision: String(events?.version ?? 0), values: jobEventEmailRulesSchema.parse(plan.id === 'premium' ? events?.values ?? defaults.events : defaults.events) },
  });
}
export async function readJobNotificationSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, c) => { requireAccess(c); return snapshot(trx, c); });
}
export async function saveJobNotificationSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = saveJobNotificationSettingsSchema.safeParse(raw);
  if (!parsed.success) throw new JobNotificationSettingsInvalid();
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, c) => {
    requireAccess(c, true);
    const current = await snapshot(trx, c);
    if (input.section === 'events' && current.plan !== 'premium') throw new JobNotificationSettingsInvalid();
    if (input.section === 'reminders') {
      const r = input.values;
      if (current.plan !== 'premium' && (r.offsets.length !== 1 || r.offsets[0].relative !== 'on' || r.offsets[0].days !== 0 || r.extraRecipientIds.length)) throw new JobNotificationSettingsInvalid();
      if (r.extraRecipientIds.some(id => !current.members.some(m => m.id === id))) throw new JobNotificationSettingsInvalid();
    }
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const receipt = await trx('jobNotificationSettingsAudit').where({ workspaceId: c.workspaceId, submissionId: input.submissionId }).first();
    if (receipt) {
      if (receipt.actorId !== c.userId || receipt.requestHash !== requestHash) throw new JobNotificationSettingsConflict();
      if (Number(current[input.section].revision) !== receipt.afterVersion) throw new JobNotificationSettingsConflict();
      return current;
    }
    const previous = current[input.section];
    if (input.revision !== previous.revision) throw new JobNotificationSettingsConflict();
    const stored = await trx('jobNotificationSettings').where({ workspaceId: c.workspaceId, section: input.section }).first('values');
    const version = Number(previous.revision) + 1;
    await trx('jobNotificationSettings').insert({ workspaceId: c.workspaceId, section: input.section, values: JSON.stringify(input.values), version })
      .onConflict(['workspaceId', 'section']).merge({ values: JSON.stringify(input.values), version, updatedAt: trx.fn.now() });
    await trx('jobNotificationSettingsAudit').insert({ workspaceId: c.workspaceId, submissionId: input.submissionId, actorId: c.userId, section: input.section, requestHash,
      beforeVersion: Number(previous.revision), afterVersion: version, beforeValues: JSON.stringify(stored?.values ?? defaults[input.section]), afterValues: JSON.stringify(input.values) });
    return snapshot(trx, c);
  });
}

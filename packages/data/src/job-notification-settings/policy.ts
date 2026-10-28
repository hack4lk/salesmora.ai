import type { Knex } from 'knex';
import { deadlineReminderRuleSchema, jobEventEmailRulesSchema } from '@salesmora/contracts';
import { workspaceEntitlements } from '../billing/entitlements';

export const jobNotificationDefaults = {
  deadline: { mode: 'unset' as const },
  reminders: { sendTime: '09:00', offsets: [{ id: 'due', relative: 'on' as const, days: 0 }], extraRecipientIds: [] as string[] },
  events: { created: true, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true },
};
/** Trusted services only; no administrative settings permission is conferred by reading effective delivery rules. */
export async function effectiveJobNotificationPolicy(trx: Knex.Transaction, workspaceId: string) {
  const rows = await trx('jobNotificationSettings').where({ workspaceId }).whereIn('section', ['reminders', 'events']);
  const { plan } = await workspaceEntitlements(trx, workspaceId);
  const saved = deadlineReminderRuleSchema.parse(rows.find(row => row.section === 'reminders')?.values ?? jobNotificationDefaults.reminders);
  return {
    reminders: plan.id === 'premium' ? saved : { ...jobNotificationDefaults.reminders, sendTime: saved.sendTime },
    events: jobEventEmailRulesSchema.parse(plan.id === 'premium' ? rows.find(row => row.section === 'events')?.values ?? jobNotificationDefaults.events : jobNotificationDefaults.events),
  };
}

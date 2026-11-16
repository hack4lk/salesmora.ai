import {
  notificationPreferencesSchema, jobNotificationSettingsSnapshotSchema, leadAssignmentSettingsSnapshotSchema,
} from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { estimateBusinessProfileFixture } from '../estimates/estimate-business-profile-form/estimate-business-profile-form.data';

export const settingsScope = { viewerId: 'settings-viewer', workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
export const leadSettingsFixture = leadAssignmentSettingsSnapshotSchema.parse({
  workspaceId: settingsScope.workspaceId, version: 1, value: { kind: 'unassigned' }, canManage: true,
  teammates: [{ id: 'alex', name: 'Alex Morgan' }],
});
export const jobSettingsFixture = jobNotificationSettingsSnapshotSchema.parse({
  today: '2026-11-16', plan: 'premium', timezone: 'America/New_York', canManage: true, activation: 'reminders-active',
  members: [{ id: 'alex', name: 'Alex Morgan' }],
  deadline: { revision: '0', values: { mode: 'unset' } },
  reminders: { revision: '0', values: { sendTime: '09:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] } },
  events: { revision: '0', values: { created: true, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true } },
});
export const estimateSettingsFixture = { ...estimateBusinessProfileFixture, workspaceId: settingsScope.workspaceId };
export const notificationPreferencesFixture = notificationPreferencesSchema.parse({ leadAssignedEmail: true });
export const workOrderSettingsFixture = { signoffRequired: false, businessPhone: '5550102000' };
export const settingsPolicyFixture = createDefaultWorkspacePolicy(settingsScope.workspaceId);
export const aiUsageFixture = { usedOrReservedTokens: '100', monthlyTokens: '1000', resetAt: '2026-12-01T00:00:00.000Z' };

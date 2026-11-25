import type { NotificationMenuItem } from '../../notifications/notification-menu/notification-menu';
export type AssignedLeadColdNotification = {
  id: string; workspaceId: string; createdAt: string; read: boolean;
  lead: { id: string; number: string; name: string }; businessDays: number;
};
/** The future host must supply a current recipient-authorized projection, never private lead notes. */
export function assignedLeadColdNotification(input: AssignedLeadColdNotification): NotificationMenuItem {
  return {
    id: input.id, title: 'Assigned lead needs attention', description: `${input.lead.number} · ${input.lead.name}`,
    createdAt: input.createdAt, read: input.read,
    details: [{ label: 'No recorded activity', value: `${input.businessDays} business ${input.businessDays === 1 ? 'day' : 'days'}` }],
    actionLabel: 'Open lead', href: `/leads/${encodeURIComponent(input.lead.id)}?workspace=${encodeURIComponent(input.workspaceId)}`,
  };
}

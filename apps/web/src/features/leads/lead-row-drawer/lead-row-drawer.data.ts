import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';

export const leadRowDrawerData = {
  stages: leadsToolbarData.stages, sources: leadsToolbarData.sources,
  subtitle: (number: string, service: string) => `${number} · ${service}`,
  contact: 'Contact and ownership', email: 'Email', phone: 'Phone', owner: 'Lead owner', created: 'Created',
  notProvided: 'Not provided', unassigned: 'Unassigned', archived: 'Archived',
  next: 'Next step', noNext: 'No next step recorded.', move: 'Move to another stage',
  assignment: 'Assignment', changeOwner: 'Change owner', assignMe: 'Assign to me', assignedMe: 'Assigned to you',
  activity: 'Activity history', noActivity: 'No activity recorded yet.', older: 'Showing the latest 5 entries. Open the full record for the complete history.',
  actor: (name: string, assistant: boolean) => assistant ? `Via assistant, confirmed by ${name}` : name,
  record: 'Open full lead record', conflictTitle: 'This lead changed', errorTitle: 'Could not update lead', reload: 'Reload details', dateUnavailable: 'Date unavailable',
  stories: {
    title: 'Lead quick view', description: 'A preview of lead details. Actions request the next workflow; no records are changed.', open: 'Open Jordan Lee',
    timezone: 'America/New_York',
    lead: { id: 'jordan', version: 3, leadNumber: 'LD-1042', name: 'Jordan Lee', service: 'Kitchen sink repair', email: 'jordan@example.com', phone: '+1 (212) 555-0142',
      owner: { id: 'sam', name: 'Sam Rivera' }, stage: 'contacted', source: 'referral', createdAt: '2026-10-12T14:00:00.000Z', archived: false,
      nextStep: 'Call Jordan to discuss the repair and arrange a visit.', permissions: { canMove: true, canAssign: true },
      activityTotal: 8,
      activity: [
        { id: 'a5', summary: 'Follow-up note added: customer is available Thursday morning.', actorName: 'Sam Rivera', viaAssistant: false, createdAt: '2026-10-14T15:00:00.000Z' },
        { id: 'a4', summary: 'Moved from New to Contacted.', actorName: 'Taylor Morgan', viaAssistant: true, createdAt: '2026-10-14T14:00:00.000Z' },
        { id: 'a3', summary: 'Assigned to Sam Rivera.', actorName: 'Taylor Morgan', viaAssistant: false, createdAt: '2026-10-13T14:00:00.000Z' },
        { id: 'a2', summary: 'Service request updated.', actorName: 'Taylor Morgan', viaAssistant: false, createdAt: '2026-10-12T15:00:00.000Z' },
        { id: 'a1', summary: 'Lead created from a referral.', actorName: 'Taylor Morgan', viaAssistant: false, createdAt: '2026-10-12T14:00:00.000Z' },
      ],
    },
    href: '#preview-full-jordan', conflict: 'Another teammate updated this lead. Reload the latest details before making changes.',
  },
} as const;

import { leadCardData } from '../lead-card/lead-card.data';
export const leadDetailHeaderData = {
  stages: leadCardData.stages, sources: leadCardData.sources, back: 'Back to leads', record: 'Lead record', edit: 'Edit lead',
  estimate: 'Create estimate', job: 'Start a job', comingSoon: 'Coming soon', archive: 'Archive', restore: 'Restore', remove: 'Delete',
  wonDelete: 'Won leads can only be archived. They cannot be permanently deleted.',
  archived: 'Archived', attention: 'Needs attention', updating: 'Updating lead…',
  unavailable: (label: string, reason: string) => `${label}: ${reason}`,
  today: leadCardData.today, yesterday: leadCardData.yesterday, daysAgo: leadCardData.daysAgo, dateUnavailable: leadCardData.dateUnavailable,
  created: (relative: string) => `Created ${relative === leadCardData.today || relative === leadCardData.yesterday ? relative.toLowerCase() : relative}`, exactDate: (exact: string) => `Created ${exact}`,
  stories: { description: 'Lead record header preview. Actions request workflows only; no records are changed.',
    requested: (action: string) => `${action} requested (preview only).`, backHref: '#preview-leads',
    now: leadCardData.stories.now, timezone: leadCardData.stories.timezone,
    lead: { id: 'jordan', version: 3, leadNumber: 'LD-1042', name: 'Jordan Lee', service: 'Kitchen remodel inquiry', businessName: 'Harbor Home Services',
      stage: 'contacted', source: 'website', createdAt: '2026-10-12T14:00:00.000Z', archived: false, needsAttention: true },
    permissions: { canEdit: true, canArchive: true, canRestore: true, canDelete: true, canCreateEstimate: true, canStartJob: true },
    longName: 'Alexandra Morgan-Williams and Christopher Rivera', longService: 'Residential plumbing inspection and whole-house water supply replacement planning',
    longBusiness: 'Harbor Home Services Residential Installation and Maintenance Team',
  },
} as const;

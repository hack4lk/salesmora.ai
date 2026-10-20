import { createLeadFormData } from '../create-lead-form/create-lead-form.data';
import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';
import type { LeadActivityEvent } from './lead-activity-timeline';
export const leadActivityTimelineData = {
  title: 'Activity history', newest: 'Newest first', empty: 'No activity recorded yet.', loading: 'Loading activity…',
  older: 'Show older', retry: 'Retry loading activity', before: 'Before', after: 'After', to: 'to', reason: 'Lost reason',
  missing: 'Not provided', unassigned: 'Unassigned', former: 'Former member', dateUnavailable: 'Date unavailable',
  assistant: (name: string) => `Via assistant, confirmed by ${name}`,
  loaded: (count: number, total: number) => `Showing ${count} of ${total} ${total === 1 ? 'entry' : 'entries'}`,
  fields: { ...createLeadFormData.labels, notes: createLeadFormData.sections.notes.title }, stages: leadsToolbarData.stages, sources: leadsToolbarData.sources,
  events: { created: 'Lead created', edited: 'Lead details updated', stage: 'Stage changed', assigned: 'Lead owner changed', note: 'Team note added', archived: 'Lead archived', restored: 'Lead restored' },
  stories: { title: 'Lead activity timeline', description: 'Unified append-only history preview. Paging and retries are mocked.',
    now: '2026-10-15T16:00:00.000Z', timezone: 'America/New_York', actor: 'Sam Rivera', error: 'Could not load activity. Try again.',
    plainText: '<strong>Customer instructions</strong>\nhttps://example.com/request\n<script>alert("preview")</script>',
    longActor: 'Alexandra Morgan-Williams from the residential installation and maintenance team',
    longText: 'Customer asked for a complete review of the existing water supply lines, access requirements and replacement options.\n\nDiscuss timing and the effect on the kitchen and upstairs bathrooms before confirming the visit.',
  },
} as const;
const actor = { actorName: 'Sam Rivera', viaAssistant: false };
export const activityPreviewEvents: readonly LeadActivityEvent[] = [
  { id: 'restored', kind: 'restored', createdAt: '2026-10-15T15:00:00.000Z', ...actor },
  { id: 'archived', kind: 'archived', createdAt: '2026-10-15T14:00:00.000Z', ...actor },
  { id: 'lost', kind: 'stage', from: 'estimate-sent', to: 'lost', reason: 'Customer chose another provider.', createdAt: '2026-10-15T13:00:00.000Z', ...actor },
  { id: 'note', kind: 'note', body: 'Customer prefers an afternoon visit.\nPlease call before arriving.', createdAt: '2026-10-15T12:00:00.000Z', ...actor, viaAssistant: true },
  { id: 'estimate', kind: 'stage', from: 'contacted', to: 'estimate-sent', createdAt: '2026-10-14T16:00:00.000Z', ...actor },
  { id: 'edited', kind: 'edited', changes: [{ field: 'service', before: 'Sink repair', after: 'Sink and supply-line repair' }, { field: 'notes', before: null, after: 'Customer is available on Friday.' }], createdAt: '2026-10-14T15:00:00.000Z', ...actor },
  { id: 'assigned', kind: 'assigned', from: null, to: { name: 'Sam Rivera' }, createdAt: '2026-10-14T14:00:00.000Z', ...actor },
  { id: 'contacted', kind: 'stage', from: 'new', to: 'contacted', createdAt: '2026-10-14T13:00:00.000Z', ...actor },
  { id: 'created', kind: 'created', source: 'referral', createdAt: '2026-10-13T14:00:00.000Z', ...actor },
];

import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';
import { leadsTableData } from '../leads-table/leads-table.data';

export const leadCardData = {
  stages: leadsToolbarData.stages, sources: leadsToolbarData.sources,
  unassigned: 'Unassigned', attention: 'Needs attention', archived: 'Archived', updating: 'Updating', owner: 'Lead owner',
  more: (name: string) => `Actions for ${name}`, move: 'Move to…',
  today: leadsTableData.today, yesterday: leadsTableData.yesterday, daysAgo: leadsTableData.daysAgo, dateUnavailable: leadsTableData.dateUnavailable, dateLabel: leadsTableData.dateLabel,
  stories: {
    title: 'Pipeline lead card', preview: 'Card preview', description: 'Preview a single card before assembling the board. Quick view and stage review are mocked requests.',
    now: '2026-10-14T16:00:00.000Z', timezone: 'America/New_York', href: '#preview-jordan',
    lead: { id: 'jordan', version: 3, name: 'Jordan Lee', service: 'Kitchen sink repair', stage: 'contacted', source: 'referral', owner: { id: 'sam', name: 'Sam Rivera' }, createdAt: '2026-10-13T14:00:00.000Z', archived: false, needsAttention: false, canMove: true },
    quickView: 'Quick-view preview. The board will open the approved lead details drawer.',
    requested: 'Stage review requested (preview only). No records were changed.',
    longName: 'Alexandra Morgan-Williams and Christopher Rivera', longService: 'Whole-house water supply inspection and replacement planning for the residential property',
    longOwner: 'Taylor Morgan from the residential installation team',
  },
} as const;

import { leadQueryFromURL, leadStages, type LeadReadRecord, type LeadListResult, type LeadDetailResult } from '@salesmora/contracts';

export const leadQueryScope = { viewerId: 'fixture-viewer', workspaceId: '00000000-0000-4000-8000-000000000001' };
export const leadQueryFixture = leadQueryFromURL(leadQueryScope.workspaceId, new URLSearchParams('view=list'));
export const leadRecordFixture: LeadReadRecord = {
  id: '00000000-0000-4000-8000-000000000101', leadNumber: 'LD-1042', version: 1,
  name: 'Jordan Query Test', service: 'Kitchen repair', email: 'jordan@example.test', phone: '212-555-0100',
  address: '18 Willow Street', details: 'Fictional query fixture.', notes: '', stage: 'new', source: 'website',
  owner: { id: leadQueryScope.viewerId, name: 'Sam Rivera', former: false },
  createdAt: '2026-11-15T15:00:00.000Z', updatedAt: '2026-11-15T15:00:00.000Z', lastActivityAt: '2026-11-15T15:00:00.000Z',
  archived: false, needsAttention: false, canMove: true, canEdit: true, canAssign: true, canArchive: true,
  canRestore: false, canDelete: true, origin: 'manual',
};
export const leadListFixture: LeadListResult = {
  rows: [leadRecordFixture], total: 1, page: 1, pageSize: 25,
  columns: leadStages.map(stage => ({
    stage, total: stage === 'new' ? 1 : 0,
    leads: stage === 'new' ? [leadRecordFixture] : [], hasMore: false, page: 1,
  })),
  owners: [{ id: leadQueryScope.viewerId, name: 'Sam Rivera', openLeadCount: 1 }],
  canExport: true, exportScope: 'workspace', canAssign: true, scope: 'workspace', canCreate: true,
  canShowArchived: true, timezone: 'America/New_York', policyRevision: 1,
};
export const leadDetailFixture: LeadDetailResult = {
  owners: leadListFixture.owners, canExport: true, exportScope: 'workspace', canAssign: true, scope: 'workspace',
  canCreate: true, canShowArchived: true, timezone: leadListFixture.timezone, policyRevision: 1,
  lead: leadRecordFixture, teamNotes: [], notesTotal: 0,
  activity: [{ id: '00000000-0000-4000-8000-000000000201', actorName: 'Sam Rivera', actorType: 'member', type: 'created', changes: { source: 'website' }, createdAt: leadRecordFixture.createdAt }],
  activityTotal: 1,
};
